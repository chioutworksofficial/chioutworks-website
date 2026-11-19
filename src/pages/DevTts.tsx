// DEV-only: compare in-browser Piper TTS (WASM) with speechSynthesis. Not wired into the assistant.
import { useEffect, useState } from 'react';
import * as piper from '@mintplex-labs/piper-tts-web';
import { WASM, patchFetch } from '../lib/piperTts';

type V = { id: string; license: string; commercial: boolean | null };
const LANGS: { code: string; bcp: string; label: string; text: string; voices: V[] }[] = [
  { code: 'tr', bcp: 'tr-TR', label: 'Türkçe', text: "Merhaba, ben Chioutworks'ün yapay zekâ asistanıyım. Size nasıl hitap edebilirim?", voices: [
    { id: 'tr_TR-fahrettin-medium', license: 'CC0 (veri: NabuCasa/voice-datasets; yalnızca diffusionstudio aynasında)', commercial: true } ] },
  { code: 'de', bcp: 'de-DE', label: 'Deutsch', text: 'Guten Tag, ich bin der KI-Assistent von Chioutworks. Wie darf ich Sie ansprechen?', voices: [
    { id: 'de_DE-thorsten-medium', license: 'CC0 (Thorsten-Voice)', commercial: true } ] },
  { code: 'el', bcp: 'el-GR', label: 'Ελληνικά', text: 'Γεια σας, είμαι ο ψηφιακός βοηθός τεχνητής νοημοσύνης της Chioutworks. Πώς να σας αποκαλώ;', voices: [
    { id: 'el_GR-rapunzelina-low', license: 'CC0 (Kaggle Greek single speaker)', commercial: true } ] },
  { code: 'en', bcp: 'en-GB', label: 'English', text: "Hello, I'm the Chioutworks AI assistant. How may I address you?", voices: [
    { id: 'en_GB-cori-medium', license: 'Kamu malı (LibriVox)', commercial: true } ] },
];

type Res = { ms?: number; bytes?: number; size?: number; err?: string; busy?: boolean };

export async function runPiper(text: string, voiceId: string, onProgress?: (p: number, total: number) => void) {
  const t0 = performance.now();
  let total = 0;
  // all voice/WASM files come from /assets-ai/ (self-hosted), never from a third-party CDN
  patchFetch();
  // the package's session is a singleton bound to its first voice; drop it to switch voices
  if (piper.TtsSession._instance?.voiceId !== voiceId) piper.TtsSession._instance = null;
  const session = await piper.TtsSession.create({
    voiceId,
    progress: (p) => { if (p.total > total) total = p.total; onProgress?.(p.loaded, p.total); },
    wasmPaths: WASM,
  });
  const blob = await session.predict(text);
  return { ms: Math.round(performance.now() - t0), bytes: blob.size, total, blob };
}

export default function DevTts() {
  const [texts, setTexts] = useState<Record<string, string>>(Object.fromEntries(LANGS.map((l) => [l.code, l.text])));
  const [res, setRes] = useState<Record<string, Res>>({});
  const [prog, setProg] = useState<Record<string, string>>({});

  useEffect(() => {
    let m = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
    m.content = 'noindex,nofollow';
    (window as unknown as { __ttsRun: typeof runPiper }).__ttsRun = runPiper;
  }, []);

  const set = (k: string, r: Res) => setRes((s) => ({ ...s, [k]: r }));

  async function playPiper(code: string, v: V) {
    set(v.id, { busy: true });
    try {
      const r = await runPiper(texts[code], v.id, (l, t) => setProg((s) => ({ ...s, [v.id]: `${(l / 1048576).toFixed(1)} / ${(t / 1048576).toFixed(1)} MB` })));
      set(v.id, { ms: r.ms, bytes: r.bytes, size: r.total });
      const a = new Audio(URL.createObjectURL(r.blob));
      await a.play();
    } catch (e) { set(v.id, { err: String(e) }); }
  }

  function playBrowser(code: string, bcp: string) {
    const k = `browser-${code}`;
    const t0 = performance.now();
    const u = new SpeechSynthesisUtterance(texts[code]);
    u.lang = bcp;
    u.onstart = () => set(k, { ms: Math.round(performance.now() - t0) });
    u.onerror = (e) => set(k, { err: e.error });
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  const card = { background: 'var(--c-void)', border: '1px solid var(--lq-line)', borderRadius: 16, padding: 20 } as const;
  const btn = { border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', background: 'transparent' } as const;
  const fmt = (r?: Res) => !r ? '' : r.err ? `Hata: ${r.err}` : r.busy ? 'Üretiliyor…' : `İlk ses: ${r.ms} ms${r.bytes ? ` · çıktı ${(r.bytes / 1024).toFixed(0)} KB` : ''}${r.size ? ` · model ${(r.size / 1048576).toFixed(1)} MB` : ''}`;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--c-void)', color: 'var(--lq-white)', padding: '48px 24px', fontFamily: 'var(--font-display)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 20 }}>
        <h1 style={{ fontSize: 32, fontWeight: 500 }}>TTS karşılaştırma (yalnızca geliştirme)</h1>
        <p style={{ color: 'var(--lq-silver)' }}>Piper (WebAssembly, tarayıcıda) ile tarayıcı sesi. İlk çalıştırmada model indirilir ve önbelleğe alınır.</p>
        {LANGS.map((l) => (
          <section key={l.code} style={card}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>{l.label}</h2>
            <textarea value={texts[l.code]} onChange={(e) => setTexts((s) => ({ ...s, [l.code]: e.target.value }))} rows={2}
              style={{ width: '100%', background: 'transparent', color: 'var(--lq-white)', border: '1px solid var(--lq-line)', borderRadius: 12, padding: 12 }} />
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {l.voices.map((v) => (
                <div key={v.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <button data-voice={v.id} style={btn} onClick={() => playPiper(l.code, v)}>Piper ({v.id})</button>
                  <span style={{ color: 'var(--lq-silver)', fontSize: 13 }}>
                    {res[v.id]?.busy ? `İndirme: ${prog[v.id] ?? '…'} · ` : ''}{fmt(res[v.id])}
                  </span>
                  <span style={{ color: 'var(--lq-mist)', fontSize: 12, flexBasis: '100%' }}>Lisans: {v.license} · Ticari kullanım: {v.commercial ? 'evet' : 'HAYIR'}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button style={btn} onClick={() => playBrowser(l.code, l.bcp)}>Tarayıcı sesi</button>
                <span style={{ color: 'var(--lq-silver)', fontSize: 13 }}>{fmt(res[`browser-${l.code}`])}</span>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
