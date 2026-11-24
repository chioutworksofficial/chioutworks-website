import { useEffect, useState } from 'react';
import { api } from './api';

// Arama senaryosu (server/voiceScript.ts): dil başına adımlar, konuşma tarzı ve dallanmalar. Varsayılan metin sunucuda; düzenlenirse kv'de saklanır
// ve n8n / Retell için GET /api/voice-agent/script ile verilir. Sır ve fiyat içermez.
type L = 'tr' | 'en' | 'de' | 'el';
interface Script { steps: string; style: string; branches: string }
interface Payload { script: Record<L, Script>; rules: Record<L, string[]>; afterCall: Record<L, string>; defaults: Record<L, Script> }
const LANGS: L[] = ['tr', 'en', 'de', 'el'];
const PARTS: [keyof Script, string][] = [['steps', 'Adımlar'], ['style', 'Konuşma tarzı'], ['branches', 'Özel durumlar']];

export default function CallScript() {
  const [p, setP] = useState<Payload | null>(null);
  const [lang, setLang] = useState<L>('tr');
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState<Record<L, Script> | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { api<Payload>('/api/admin/voice-agent/script').then((r) => { setP(r); setDraft(r.script); }).catch(() => setMsg('Senaryo yüklenemedi.')); }, []);
  const save = async () => {
    setMsg('');
    try { await api('/api/admin/voice-agent/script', 'PUT', draft); setP((x) => x && { ...x, script: draft! }); setEdit(false); setMsg('Kaydedildi.'); } catch { setMsg('Kaydedilemedi.'); }
  };
  const reset = async () => { try { await api('/api/admin/voice-agent/script', 'DELETE'); setDraft(p!.defaults); setP((x) => x && { ...x, script: x.defaults }); setEdit(false); setMsg('Varsayılana dönüldü.'); } catch { setMsg('İşlem başarısız.'); } };
  const cur = (edit ? draft : p?.script)?.[lang];
  return (
    <div className="lq-card adm-card" style={{ marginBottom: 16 }}>
      <div className="adm-head"><h2>Arama senaryosu</h2>
        <span className="adm-actions">{!edit ? <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setEdit(true)} disabled={!p}>Düzenle</button>
          : <><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={save}>Kaydet</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => { setDraft(p!.script); setEdit(false); }}>Vazgeç</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={reset}>Varsayılana dön</button></>}</span></div>
      <p className="adm-sub">Arayan yapay zekâ bu metni kullanır. n8n / Retell bunu <code>GET /api/voice-agent/script</code> ile dil başına alır. Marka okunuşu: Şiut-vörks · Shee-oot works · Schiut-Works · Σιούτ-γουόρκς; yazıda Chioutworks.</p>
      <div className="adm-chips" role="tablist">{LANGS.map((l) => <button key={l} role="tab" aria-selected={lang === l} className="adm-chip" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
      {msg && <div className="adm-banner" role="status">{msg}</div>}
      {cur && PARTS.map(([k, label]) => (
        <div key={k} className="adm-field"><label className="adm-label" htmlFor={`cs-${k}`}>{label}</label>
          {edit ? <textarea id={`cs-${k}`} className="adm-input" rows={k === 'style' ? 8 : 12} value={cur[k]} onChange={(e) => setDraft((d) => d && { ...d, [lang]: { ...d[lang], [k]: e.target.value } })} />
            : <p style={{ whiteSpace: 'pre-line', margin: 0, fontSize: 14, lineHeight: 1.55 }}>{cur[k]}</p>}</div>))}
      {p && <>
        <div className="adm-field"><span className="adm-label">Kurallar</span><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{p.rules[lang].map((r) => <li key={r}>{r}</li>)}</ul></div>
        <div className="adm-field"><span className="adm-label">Aramadan sonra</span><p style={{ margin: 0, fontSize: 14 }}>{p.afterCall[lang]}</p></div>
      </>}
    </div>
  );
}
