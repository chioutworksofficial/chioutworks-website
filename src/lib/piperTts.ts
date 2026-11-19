// In-browser Piper TTS. Every voice/WASM file is loaded from this site's own /assets-ai/ (see scripts/fetch-voice-assets.mjs):
// no request leaves for Hugging Face / jsDelivr / cdnjs. Audio is generated on the device and never sent anywhere.
// Synthesis runs in piperWorker.ts; playback goes through ONE AudioContext with back-to-back scheduled buffers.
// The browser's speechSynthesis is never used.
import type { Lang } from '../translations';
import { chunks } from './tts';
import { parseMarkup, STYLE_PARAMS } from './voiceMarkup';

export const PIPER_VOICES: Record<Lang, string> = {
  tr: 'tr_TR-fahrettin-medium', de: 'de_DE-thorsten-medium', el: 'el_GR-rapunzelina-low', en: 'en_GB-cori-medium',
};
export const WASM = {
  onnxWasm: `${location.origin}/assets-ai/ort-piper/`,   // absolute: Vite dev must not rewrite the runtime import,
  piperData: '/assets-ai/piper-wasm/piper_phonemize.data',
  piperWasm: '/assets-ai/piper-wasm/piper_phonemize.wasm',   // (ort-wasm-simd-threaded build: SIMD)
};
const HF_BASE = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main';
const READY_WAIT_MS = 20000;   // load + warm-up; speech never starts before the voice is fully ready
const LEAD = 0.12, WAKE = 0.25, FADE = 0.03;   // scheduling lead, output-device wake silence, per-buffer fade (s)

// The package hardcodes its voice host; redirect exactly those URLs to our own origin before they hit the network.
let patched = false;
export function patchFetch() {
  if (patched) return;
  patched = true;
  const orig = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input, init) => {
    const u = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return orig(u.startsWith(HF_BASE) ? u.replace(HF_BASE, '/assets-ai/piper') : input, init);
  };
}

let worker: Worker | null = null;
let current: string | null = null;                       // voice loaded in the worker
const loading = new Map<string, { p: Promise<boolean>; done: (ok: boolean) => void; cbs: ((n: number) => void)[] }>();
const waiting = new Map<number, (b: ArrayBuffer | null) => void>();
let seq = 0;

function getWorker(): Worker | null {
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./piperWorker.ts', import.meta.url), { type: 'module' });
  } catch { return null; }
  worker.onmessage = (e) => {
    const m = e.data;
    if (m.type === 'progress') loading.get(m.voiceId)?.cbs.forEach((f) => f(m.pct));
    else if (m.type === 'ready') {
      const l = loading.get(m.voiceId);
      if (m.ok) { current = m.voiceId; l?.cbs.forEach((f) => f(100)); } else loading.delete(m.voiceId);
      l?.done(m.ok);
    } else if (m.type === 'audio') { waiting.get(m.id)?.(m.buf); waiting.delete(m.id); }
  };
  worker.onerror = () => { worker?.terminate(); worker = null; current = null; loading.clear(); waiting.forEach((r) => r(null)); waiting.clear(); };
  return worker;
}

/** True while scheduled audio is still playing (used to avoid listening to our own voice). */
export const piperBusy = () => !!ctx && endAt > ctx.currentTime;
export const piperReady = (lang: Lang) => current === PIPER_VOICES[lang];

/** Load (once) the voice for this language in the worker. Resolves false on failure. */
export function preparePiper(lang: Lang, onProgress?: (pct: number) => void): Promise<boolean> {
  const id = PIPER_VOICES[lang];
  if (current === id) { onProgress?.(100); return Promise.resolve(true); }
  let l = loading.get(id);
  if (!l) {
    const w = getWorker();
    if (!w) return Promise.resolve(false);
    let done!: (ok: boolean) => void;
    const p = new Promise<boolean>((r) => { done = r; });
    l = { p, done, cbs: [] };
    loading.set(id, l);
    w.postMessage({ type: 'load', voiceId: id, wasm: WASM });
  }
  if (onProgress) l.cbs.push(onProgress);
  return l.p;
}

let ctx: AudioContext | null = null;
let tok = 0;
let endAt = 0;
let awake = 0;   // ctx time until which the output device is known to be awake
/** Test hook: every scheduled buffer, with ctx.currentTime at scheduling. */
export const piperSched: { at: number; now: number; dur: number; synthDur: number }[] = [];
export const piperEvents: string[] = [];
export const piperCapture: { text: string; rate: number; pcm: Float32Array }[] = [];
if (import.meta.env.DEV) (globalThis as unknown as { __piper: unknown }).__piper = { piperSched, piperEvents, piperCapture };

/** Create + resume the AudioContext and wake the output device with ~250 ms of silence. Call from a user click. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    wake(ctx);
  } catch { /* no audio */ }
}
function wake(c: AudioContext) {
  if (c.currentTime < awake - 1) return;   // still warm
  const s = c.createBufferSource();
  s.buffer = c.createBuffer(1, Math.ceil(c.sampleRate * WAKE), c.sampleRate);
  s.connect(c.destination);
  const at = Math.max(c.currentTime + 0.02, endAt);
  s.start(at); endAt = at + WAKE; awake = endAt + 8;
  piperEvents.push('wake');
}

const warmed = new Map<string, Promise<boolean>>();
/** Load the voice AND run one throw-away synthesis so the first real sentence is not slowed by cold WASM/ONNX. */
export function readyPiper(lang: Lang, onProgress?: (pct: number) => void): Promise<boolean> {
  const id = PIPER_VOICES[lang];
  let p = warmed.get(id);
  if (!p) {
    p = (async () => {
      if (!(await preparePiper(lang, (n) => onProgress?.(Math.min(99, n))))) return false;
      for (let i = 0; i < 2; i++) {
        const w = getWorker();
        if (!w) return false;
        const sid = ++seq;
        const buf = await new Promise<ArrayBuffer | null>((r) => { waiting.set(sid, r); w.postMessage({ type: 'synth', id: sid, voiceId: id, text: 'Hello.' }); });
        if (buf) { piperEvents.push('warm'); return true; }
      }
      return false;
    })();
    warmed.set(id, p);
    void p.then((ok) => { if (!ok) warmed.delete(id); });
  } else if (onProgress) void preparePiper(lang, (n) => onProgress(Math.min(99, n)));
  return p.then((ok) => { if (ok) onProgress?.(100); return ok; });
}
const sources = new Set<AudioBufferSourceNode>();
/** Seconds between the end of one scheduled buffer and the start of the next (0 = seamless). */
export const piperGaps: number[] = [];

/** Stop speaking now and drop any queued synthesis. */
export function stopPiper() {
  tok++;
  sources.forEach((s) => { try { s.stop(); } catch { /* already ended */ } });
  sources.clear();
  endAt = 0;
  worker?.postMessage({ type: 'cancel', upTo: seq });
}

/**
 * Speak with Piper. Waits up to 20 s for the voice to be loaded AND warmed up; if it is not (or Piper failed) the message is simply not spoken.
 * Resolves true when it finished or was skipped, false when it was interrupted by stopPiper()/a newer call.
 */
export async function speakPiper(text: string, lang: Lang): Promise<boolean> {
  stopPiper();
  const my = tok;
  const ok = await Promise.race([readyPiper(lang), new Promise<boolean>((r) => setTimeout(() => r(false), READY_WAIT_MS))]);
  if (my !== tok) return false;
  const w = ok ? getWorker() : null;
  if (!w) return true;
  // Items in speaking order: a synthesized chunk (with style params) or a silent gap.
  type Item = { buf: Promise<ArrayBuffer | null>; text: string } | { gap: number };
  const items: Item[] = [];
  let n = 0;
  for (const seg of parseMarkup(text)) {
    if (seg.kind === 'pause') { if (items.length) items.push({ gap: seg.ms / 1000 }); continue; }
    for (const p of chunks(seg.text)) {
      if (n++ >= 12) break;
      const id = ++seq, params = STYLE_PARAMS[seg.style];
      items.push({ text: p, buf: new Promise<ArrayBuffer | null>((r) => { waiting.set(id, r); w.postMessage({ type: 'synth', id, voiceId: PIPER_VOICES[lang], text: p, p: params ? { ls: params.ls, nw: params.nw } : undefined }); }) });
    }
  }
  if (!n) return true;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    wake(ctx);
  } catch { return true; }
  const c = ctx;
  // All chunks are queued at once: the worker synthesizes N+1 while N is playing.
  let last: AudioBufferSourceNode | null = null;
  let extra = 0;
  for (const it of items) {
    if ('gap' in it) { extra += it.gap; continue; }
    const buf = await it.buf;
    if (my !== tok) return false;
    if (!buf) continue;
    const dv = new DataView(buf), wavDur = (buf.byteLength - 44) / (dv.getUint32(28, true) || 1);   // PCM WAV header: byte rate
    let ab: AudioBuffer;
    try { ab = await c.decodeAudioData(buf); } catch { continue; }
    if (my !== tok) return false;
    const src = c.createBufferSource();
    const g = c.createGain();
    src.buffer = ab; src.connect(g); g.connect(c.destination);
    const at = Math.max(c.currentTime + LEAD, endAt + extra);
    const f = Math.min(FADE, ab.duration / 4);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(1, at + f);
    g.gain.setValueAtTime(1, at + ab.duration - f); g.gain.linearRampToValueAtTime(0, at + ab.duration);
    if (import.meta.env.DEV) piperCapture.push({ text: it.text, rate: ab.sampleRate, pcm: ab.getChannelData(0).slice() });
    piperSched.push({ at, now: c.currentTime, dur: ab.duration, synthDur: wavDur });
    if (last) piperGaps.push(Math.max(0, at - endAt));
    extra = 0;
    src.start(at); endAt = at + ab.duration;
    sources.add(src); last = src;
  }
  if (!last || my !== tok) return my === tok;
  const l = last;
  await new Promise<void>((res) => { l.onended = () => res(); if (c.currentTime >= endAt) res(); });
  sources.delete(l);
  return my === tok;
}
