/// <reference lib="webworker" />
// Piper synthesis in its own Web Worker, so onnxruntime/WASM never blocks the main thread (audio, UI) or the Whisper worker.
import * as piper from '@mintplex-labs/piper-tts-web';
import { patchFetch } from './piperTts';

// The package sets ort numThreads = navigator.hardwareConcurrency; cap it (threads need cross-origin isolation).
const hc = self.navigator.hardwareConcurrency || 2;
Object.defineProperty(self.navigator, 'hardwareConcurrency', { value: self.crossOriginIsolated ? Math.max(1, Math.min(4, hc - 1)) : 1 });

// The package reads noise_scale / length_scale / noise_w from the voice config on every chunk but exposes no per-call option:
// wrap the parsed config's `inference` with getters that honour the per-request override below.
// The phonemizer (espeak, e.g. Greek 'χ' before a front vowel -> x + U+0327) can emit ids the voice has no embedding for:
// onnxruntime then throws and that whole sentence is silently lost. Map them to the closest symbol the voice knows, else drop them.
let idMap: Record<string, number[]> | null = null;
const FALLBACK: Record<string, string> = { '̧': '', '̃': '', '̪': '', '̩': '', '̯': '', '̺': '', '̻': '', 'ʰ': '', 'ˤ': '', 'ε': 'ɛ', 'g': 'ɡ', 'X': 'x', 'ʦ': 'ts' };
function fitIds(ids: number[]): number[] {
  const m = idMap!, max = Math.max(...Object.values(m).map((v) => v[0]));
  const sym = new Map<number, string>(); for (const [k, v] of Object.entries(m)) sym.set(v[0], k);
  const std = (globalThis as { __stdSyms?: Map<number, string> }).__stdSyms;
  void std;
  const out: number[] = [];
  for (const id of ids) {
    if (id <= max) { out.push(id); continue; }
    const rep = FALLBACK[STD[id] ?? ''];
    if (rep) for (const c of rep) { const v = m[c]; if (v) out.push(v[0], 0); }
    if (out.length && out[out.length - 1] === 0 && !rep) out.pop();   // drop its pad too
  }
  return out;
}
// Standard piper_phonemize ids above the smallest voices' range (see any voice config's phoneme_id_map)
const STD: Record<number, string> = { 130: '0', 140: '̧', 141: '̃', 142: '̪', 143: '̯', 144: '̩', 145: 'ʰ', 146: 'ˤ', 147: 'ε', 154: 'g', 155: 'ʦ', 156: 'X' };

let over: { ls?: number; ns?: number; nw?: number } = {};
const parse = JSON.parse;
JSON.parse = function (t: string, r?: (k: string, v: unknown) => unknown) {
  const o = parse(t, r);
  if (o?.phoneme_id_map && o.audio) idMap = o.phoneme_id_map;
  if (idMap && Array.isArray(o?.phoneme_ids)) o.phoneme_ids = fitIds(o.phoneme_ids);
  const b = o?.inference, a = o?.audio;
  if (b && a?.sample_rate && typeof b.length_scale === 'number') {
    o.inference = { get noise_scale() { return over.ns ?? b.noise_scale; }, get length_scale() { return over.ls ?? b.length_scale; }, get noise_w() { return over.nw ?? b.noise_w; } };
  }
  return o;
} as typeof JSON.parse;

let chain: Promise<unknown> = Promise.resolve();
let cancelled = 0;

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === 'cancel') { cancelled = Math.max(cancelled, m.upTo); return; }
  chain = chain.then(async () => {
    if (m.type === 'load') {
      try {
        patchFetch();
        if (piper.TtsSession._instance?.voiceId !== m.voiceId) piper.TtsSession._instance = null;
        let total = 0;
        await piper.TtsSession.create({
          voiceId: m.voiceId, wasmPaths: m.wasm,
          progress: (p) => { if (p.total > total) total = p.total; if (total) self.postMessage({ type: 'progress', voiceId: m.voiceId, pct: Math.min(99, Math.round((p.loaded / total) * 100)) }); },
        });
        self.postMessage({ type: 'ready', voiceId: m.voiceId, ok: true });
      } catch { self.postMessage({ type: 'ready', voiceId: m.voiceId, ok: false }); }
    } else if (m.type === 'synth') {
      if (m.id <= cancelled) { self.postMessage({ type: 'audio', id: m.id, buf: null }); return; }
      try {
        const s = piper.TtsSession._instance;
        over = m.p ?? {};
        const buf = s && s.voiceId === m.voiceId ? await (await s.predict(m.text)).arrayBuffer() : null;
        self.postMessage({ type: 'audio', id: m.id, buf }, buf ? [buf] : []);
      } catch { self.postMessage({ type: 'audio', id: m.id, buf: null }); }
    }
  });
};
