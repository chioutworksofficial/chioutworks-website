// Speech-to-text entirely on the device: microphone -> energy VAD -> Whisper (Web Worker, WASM). No audio leaves the browser.
import type { Lang } from '../translations';

export const SILENCE_MS = 2000;      // end of turn: this long after the last loud frame ...
const MIN_SPEECH_MS = 800;           // ... and only once this much speech was detected
const CALIBRATE_MS = 500;            // ambient noise floor is measured right after the mic opens
const NO_SPEECH_MS = 10000;           // nothing said at all
const MAX_MS = 30000;                // Whisper window

export const sttCapable = () =>
  typeof WebAssembly !== 'undefined' && typeof Worker !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

let worker: Worker | null = null;
let readyP: Promise<boolean> | null = null;
let isReady = false;
let slow = false;
export const sttReady = () => isReady;
export const sttSlow = () => slow;

/** Start (once) loading the Whisper model. Resolves true when ready, false if it failed. */
export function prepareStt(onProgress?: (pct: number) => void): Promise<boolean> {
  if (isReady) { onProgress?.(100); return Promise.resolve(true); }
  if (!readyP) {
    readyP = new Promise<boolean>((resolve) => {
      try {
        worker = new Worker(new URL('./sttWorker.ts', import.meta.url), { type: 'module' });
      } catch { resolve(false); return; }
      worker.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'progress') onProgress?.(m.pct);
        else if (m.type === 'ready') { isReady = true; onProgress?.(100); resolve(true); }
        else if (m.type === 'error') { worker?.terminate(); worker = null; readyP = null; resolve(false); }
      };
      worker.onerror = () => { worker?.terminate(); worker = null; readyP = null; resolve(false); };
      worker.postMessage({ type: 'load' });
    });
  }
  return readyP;
}

let seq = 0;
export function transcribe(audio: Float32Array, lang: Lang): Promise<string> {
  return new Promise((resolve) => {
    if (!worker || !isReady) { resolve(''); return; }
    const id = ++seq;
    const w = worker;
    const on = (e: MessageEvent) => {
      const m = e.data;
      if (m.type !== 'result' || m.id !== id) return;
      w.removeEventListener('message', on);
      const sec = audio.length / 16000;
      if (m.ms > 1600 * Math.max(5, sec)) slow = true;   // > 8 s for 5 s of audio: too slow for a conversation
      resolve(m.text);
    };
    w.addEventListener('message', on);
    w.postMessage({ type: 'transcribe', id, audio, lang }, [audio.buffer]);
  });
}

export interface Listening { stop: () => void; cancel: () => void; result: Promise<string> }

/** Record one utterance, end it after SILENCE_MS of quiet, transcribe it. stop() ends it now; cancel() discards it. */
export async function listenOnce(lang: Lang, onLevel?: (level: number) => void): Promise<Listening> {
  const stream = await openMic();
  const ctx = new AudioContext({ sampleRate: 16000 });
  const src = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const mute = ctx.createGain(); mute.gain.value = 0;
  const chunks: Float32Array[] = [];
  let finish!: (discard: boolean) => void;
  const done = new Promise<boolean>((r) => { finish = r; });
  const t0 = performance.now();
  let lastLoud = 0, spoke = false, floor = 0, speechMs = 0;
  proc.onaudioprocess = (e) => {
    const x = e.inputBuffer.getChannelData(0);
    let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i];
    const rms = Math.sqrt(s / x.length), now = performance.now(), frameMs = (x.length / 16000) * 1000;
    onLevel?.(rms);
    const calibrating = now - t0 < CALIBRATE_MS;
    if (calibrating) floor = Math.max(floor, rms);   // nothing counts as speech yet
    else if (rms > Math.max(0.015, floor * 3)) { lastLoud = now; speechMs += frameMs; spoke = true; }
    chunks.push(new Float32Array(x));
    if (!spoke && chunks.length > 4) chunks.shift();   // short pre-roll until speech starts
    if (spoke && speechMs >= MIN_SPEECH_MS && now - lastLoud > SILENCE_MS) finish(false);
    else if (spoke && speechMs < MIN_SPEECH_MS && now - lastLoud > 6000) finish(true);   // a click or cough, not speech
    else if (!spoke && now - t0 > NO_SPEECH_MS) finish(true);
    else if (now - t0 > MAX_MS) finish(false);
  };
  src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
  const result = done.then(async (discard) => {
    proc.onaudioprocess = null;
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close();
    if (discard || !spoke) return '';
    const all = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
    let o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
    return all.length < 8000 ? '' : transcribe(all, lang);
  });
  return { stop: () => finish(!spoke), cancel: () => finish(true), result };
}

// ── Microphone choice ─────────────────────────────────────────────────────────────────────────────────────────────
// macOS Chrome may default to the iPhone (Continuity microphone): prefer a non-iPhone input, let the visitor override.
const PHONE = /iphone|ipad|continuity/i;
const MIC_KEY = 'cw-mic';
export const getMicId = (): string => { try { return localStorage.getItem(MIC_KEY) ?? ''; } catch { return ''; } };
export const setMicId = (id: string) => { try { if (id) localStorage.setItem(MIC_KEY, id); else localStorage.removeItem(MIC_KEY); } catch { /* private mode */ } };

export async function micInputs(): Promise<MediaDeviceInfo[]> {
  try {
    return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput' && d.deviceId !== 'communications');
  } catch { return []; }
}

/** Open the microphone: saved choice, else the first non-phone input, else the browser default. Caller stops the tracks. */
export async function openMic(): Promise<MediaStream> {
  const get = (id?: string) => navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1, ...(id ? { deviceId: { exact: id } } : {}) } });
  const saved = getMicId();
  if (saved) { try { return await get(saved); } catch { /* device gone: fall through */ } }
  let s = await get();   // first async call: keeps the iOS Safari user-gesture so the permission prompt appears
  if (PHONE.test(s.getAudioTracks()[0]?.label ?? '')) {   // enumerate only after permission: check what we actually got
    const alt = (await micInputs()).find((d) => d.label && !PHONE.test(d.label));
    if (alt) { s.getTracks().forEach((t) => t.stop()); try { s = await get(alt.deviceId); } catch { s = await get(); } }
  }
  return s;
}
