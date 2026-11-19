/// <reference lib="webworker" />
// Whisper (speech-to-text) in a Web Worker via transformers.js. Model + onnxruntime WASM come only from /assets-ai/.
import { pipeline, env } from '@huggingface/transformers';

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = '/assets-ai/models/';
// @ts-expect-error wasmPaths is a plain URL prefix at runtime
env.backends.onnx.wasm.wasmPaths = `${self.location.origin}/assets-ai/ort-whisper/`;

const NAMES: Record<string, string> = { tr: 'turkish', de: 'german', el: 'greek', en: 'english' };
let asr: ((a: Float32Array, o: Record<string, unknown>) => Promise<{ text: string } | { text: string }[]>) | null = null;

self.onmessage = async (e: MessageEvent) => {
  const m = e.data;
  if (m.type === 'load') {
    try {
      const files = new Map<string, { loaded: number; total: number }>();
      asr = (await pipeline('automatic-speech-recognition', 'onnx-community/whisper-base', {
        dtype: 'q8', device: 'wasm',
        progress_callback: (p: { status: string; file?: string; loaded?: number; total?: number }) => {
          if (p.status !== 'progress' || !p.file) return;
          files.set(p.file, { loaded: p.loaded ?? 0, total: p.total ?? 0 });
          let l = 0, t = 0;
          files.forEach((f) => { l += f.loaded; t += f.total; });
          if (t) self.postMessage({ type: 'progress', pct: Math.min(99, Math.round((l / t) * 100)) });
        },
      })) as unknown as typeof asr;
      self.postMessage({ type: 'ready' });
    } catch (err) { self.postMessage({ type: 'error', message: String(err) }); }
  } else if (m.type === 'transcribe') {
    try {
      const t0 = performance.now();
      const r = await asr!(m.audio, { language: NAMES[m.lang] ?? 'english', task: 'transcribe', return_timestamps: false });
      const text = (Array.isArray(r) ? r[0] : r).text.trim();
      self.postMessage({ type: 'result', id: m.id, text, ms: performance.now() - t0 });
    } catch (err) { self.postMessage({ type: 'result', id: m.id, text: '', ms: 0, error: String(err) }); }
  }
};
