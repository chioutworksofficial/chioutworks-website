import { useState } from 'react';
import { api, ApiError, type Req } from './api';
import { LANG_NAME } from './IntakeCreate';

const EMPTY = { name: '', business: '', email: '', phone: '', address: '', lang: 'tr', message: '' };

/** "+ Manuel kişi ekle": the owner types in details received by phone / in person; the new request opens so an intake link can be created. */
export default function ManualAdd({ onAdded }: { onAdded: (r: Req) => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    if (!f.name.trim() || (!f.email.trim() && !f.phone.trim())) { setErr('Ad ve e-posta ya da telefon gerekli.'); return; }
    setBusy(true); setErr(null);
    try {
      const r = await api<{ request: Req }>('/api/admin/quote-requests', 'POST', f);
      onAdded(r.request); setF(EMPTY); setOpen(false);
    } catch (x) { setErr(x instanceof ApiError && x.data?.message ? String(x.data.message) : 'Kaydedilemedi, tekrar deneyin.'); }
    setBusy(false);
  };

  if (!open) return <button className="lq-btn-ghost adm-btn sm" style={{ marginBottom: 12 }} onClick={() => setOpen(true)}>+ Manuel kişi ekle</button>;
  return (
    <div className="lq-card adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
      <div className="adm-head" style={{ margin: 0 }}><h2>Manuel kişi ekle</h2></div>
      <p className="adm-meta" style={{ margin: 0 }}>Kaydettikten sonra talep açılır; oradan "Analiz formu" linkini oluşturup e-postayla gönderebilir ya da kopyalayabilirsin.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
        <input className="adm-input" placeholder="Ad Soyad *" value={f.name} onChange={set('name')} autoComplete="off" />
        <input className="adm-input" placeholder="Firma" value={f.business} onChange={set('business')} autoComplete="off" />
        <input className="adm-input" type="email" placeholder="E-posta" value={f.email} onChange={set('email')} autoComplete="off" />
        <input className="adm-input" type="tel" placeholder="Telefon" value={f.phone} onChange={set('phone')} autoComplete="off" />
        <input className="adm-input" placeholder="Adres / şehir (pazarı tahmin etmek için)" value={f.address} onChange={set('address')} autoComplete="off" />
        <select className="adm-input" aria-label="Müşterinin dili" value={f.lang} onChange={set('lang')}>
          {(['tr', 'de', 'el', 'en'] as const).map((l) => <option key={l} value={l}>Dil: {LANG_NAME[l]}</option>)}
        </select>
      </div>
      <textarea className="adm-input" style={{ minHeight: 70 }} placeholder="Notların (ne istiyor, nereden tanışıyorsunuz…)" value={f.message} onChange={set('message')} />
      {err && <div className="adm-banner" role="alert" style={{ margin: 0 }}>{err}</div>}
      <div className="adm-actions">
        <button className="lq-btn-ghost adm-btn" onClick={save} disabled={busy}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => { setOpen(false); setErr(null); }}>Vazgeç</button>
      </div>
    </div>
  );
}
