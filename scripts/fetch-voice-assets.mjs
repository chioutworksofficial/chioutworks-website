// Downloads/copies every model + WASM asset the in-browser assistant needs into public/assets-ai/ (gitignored),
// so visitors never contact Hugging Face / jsDelivr / cdnjs. Run: npm run ai-assets
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const OUT = path.resolve('public/assets-ai');
const HF_PIPER = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main';
const PIPER_VOICES = [
  'tr/tr_TR/fahrettin/medium/tr_TR-fahrettin-medium',
  'de/de_DE/thorsten/medium/de_DE-thorsten-medium',
  'el/el_GR/rapunzelina/low/el_GR-rapunzelina-low',
  'en/en_GB/cori/medium/en_GB-cori-medium',
];
const WHISPER = 'https://huggingface.co/onnx-community/whisper-base/resolve/main';
const WHISPER_FILES = ['config.json', 'generation_config.json', 'preprocessor_config.json', 'tokenizer.json', 'tokenizer_config.json',
  'added_tokens.json', 'special_tokens_map.json', 'vocab.json', 'merges.txt', 'normalizer.json',
  'onnx/encoder_model_quantized.onnx', 'onnx/decoder_model_merged_quantized.onnx'];
const PHONEMIZE = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize';

const manifest = {};
async function get(url, rel) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) {
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    await pipeline(Readable.fromWeb(r.body), fs.createWriteStream(dest));
    console.log('downloaded', rel);
  }
  await record(rel);
}
function copy(src, rel) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return record(rel);
}
async function record(rel) {
  const file = path.join(OUT, rel);
  const h = crypto.createHash('sha256');
  await pipeline(fs.createReadStream(file), h);
  manifest[rel] = { sha256: h.digest('hex'), bytes: fs.statSync(file).size };
}

for (const v of PIPER_VOICES) {
  const name = path.basename(v);
  await get(`${HF_PIPER}/${v}.onnx`, `piper/${v}.onnx`);
  await get(`${HF_PIPER}/${v}.onnx.json`, `piper/${v}.onnx.json`);
  void name;
}
for (const ext of ['data', 'wasm']) await get(`${PHONEMIZE}.${ext}`, `piper-wasm/piper_phonemize.${ext}`);
for (const f of WHISPER_FILES) await get(`${WHISPER}/${f}`, `models/onnx-community/whisper-base/${f}`);
// onnxruntime-web runtimes: Piper uses the top-level package, transformers.js its own pinned copy
for (const f of ['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
  await copy(`node_modules/onnxruntime-web/dist/${f}`, `ort-piper/${f}`);
  await copy(`node_modules/@huggingface/transformers/node_modules/onnxruntime-web/dist/${f}`, `ort-whisper/${f}`);
}
// transformers.js' onnxruntime build selects the asyncify variant for the WASM backend
for (const f of ['ort-wasm-simd-threaded.asyncify.mjs', 'ort-wasm-simd-threaded.asyncify.wasm'])
  await copy(`node_modules/@huggingface/transformers/node_modules/onnxruntime-web/dist/${f}`, `ort-whisper/${f}`);
fs.writeFileSync(path.join(OUT, 'manifest.sha256.json'), JSON.stringify(manifest, null, 2));
const total = Object.values(manifest).reduce((a, b) => a + b.bytes, 0);
console.log(`ok: ${Object.keys(manifest).length} files, ${(total / 1048576).toFixed(1)} MB`);
