import { useCallback, useEffect, useState } from 'react';
import { api, fmtDate } from './api';

// Own error log (server/errors.ts): last 200 server errors, masked, deduplicated per hour. Admin UI is Turkish.
interface Row { id: number | string; t: string; route: string; kind: string; message: string; count: number }

export default function ErrorsView({ onMailSaved }: { onMailSaved?: (email: string) => void } = {}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(() => {
    setErr(null);
    api<{ errors: Row[] }>('/api/admin/errors').then((r) => setRows(r.errors)).catch(() => setErr('Hatalar yüklenemedi.'));
  }, []);
  useEffect(load, [load]);
  const [src, setSrc] = useState<'all' | 'Sunucu' | 'Tarayıcı'>('all');
  const [mail, setMail] = useState('');
  const [mailOn, setMailOn] = useState(true);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => { api<{ email: string; mailConfigured: boolean }>('/api/admin/settings/error-notify').then((r) => { setMail(r.email); setMailOn(r.mailConfigured); }).catch(() => {}); }, []);
  const saveMail = async () => { try { await api('/api/admin/settings/error-notify', 'PUT', { email: mail.trim() }); setNote('Kaydedildi.'); onMailSaved?.(mail.trim()); } catch { setNote('Kaydedilemedi (e-posta geçersiz olabilir).'); } };
  const testMail = async () => { try { await api('/api/admin/settings/error-notify/test', 'POST'); setNote('Deneme e-postası gönderildi.'); } catch { setNote('Gönderilemedi: önce kaydedin; e-posta servisi ayarlı olmalı.'); } };
  const source = (r: Row) => (r.kind.startsWith('client:') ? 'Tarayıcı' : 'Sunucu');
  const clear = async () => {
    if (!window.confirm('Tüm hata kayıtları silinsin mi?')) return;
    try { await api('/api/admin/errors', 'DELETE'); setRows([]); } catch { setErr('Silinemedi.'); }
  };
  return (
    <>
      <h1 className="adm-h1">Hatalar / Errors</h1>
      <p className="adm-sub">Sunucu ve tarayıcı hataları (son 200). E-posta, telefon, IP ve anahtarlar maskelenir; aynı hata bir saat içinde sayaçla birleşir; 30 gün sonra silinir.</p>
      <div id="err-mail-card" className="lq-card adm-card" style={{ marginBottom: 20, border: '1px solid var(--c-lilac)' }}>
        <h2>Hata bildirim e-postası</h2>
        <p className="adm-sub" style={{ marginTop: 6 }}>Sitede yeni bir hata olursa bu adrese e-posta gelir. Adresini aşağıdaki kutuya yaz, sonra <b>Kaydet</b>’e bas.</p>
        <label htmlFor="err-mail" className="adm-sub" style={{ display: 'block', marginTop: 12 }}>E-posta adresin</label>
        <input id="err-mail" className="adm-input" type="email" placeholder="E-posta adresini buraya yaz" value={mail} onChange={(e) => setMail(e.target.value)} maxLength={254} autoComplete="off" style={{ marginTop: 6, maxWidth: 420 }} />
        <div className="adm-actions" style={{ marginTop: 10 }}>
          <button className="lq-btn-ghost adm-btn sm adm-pri" onClick={saveMail}>Kaydet</button>
          <button className="lq-btn-ghost adm-btn sm" onClick={testMail} disabled={!mail.trim() || !mailOn}>Deneme e-postası gönder</button>
        </div>
        {note && <p className="adm-sub" role="status" style={{ marginTop: 8, color: 'var(--c-quartz)' }}>{note}</p>}
        <p className="adm-sub" style={{ marginTop: 8 }}>Alan adı doğrulanana kadar e-posta yalnızca e-posta servisindeki hesap adresine gidebilir. Yeni bir hata türünde en çok 10 dakikada bir e-posta gelir.</p>
      </div>
      <div className="adm-actions" style={{ marginBottom: 16 }}>
        <button className="lq-btn-ghost adm-btn sm" onClick={load}>Yenile</button>
        <button className="lq-btn-ghost adm-btn sm" onClick={clear} disabled={!rows?.length}>Temizle</button>
        <select value={src} onChange={(e) => setSrc(e.target.value as typeof src)} aria-label="Kaynak"><option value="all">Tümü</option><option value="Sunucu">Sunucu</option><option value="Tarayıcı">Tarayıcı</option></select>
        <a className="lq-btn-ghost adm-btn sm" href="https://chioutworks.sentry.io/issues/" target="_blank" rel="noopener noreferrer">Sentry'de aç</a>
      </div>
      {err && <div className="adm-banner" role="alert">{err}</div>}
      {!rows ? (!err && <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>)
        : !rows.length ? <div className="adm-empty">Kayıtlı hata yok.</div>
        : <div className="lq-card adm-card adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Kaynak</th><th>Zaman</th><th>Yol</th><th>Tür</th><th>Mesaj</th><th>Adet</th></tr></thead>
          <tbody>{rows.filter((r) => src === 'all' || source(r) === src).map((r) => (
            <tr key={r.id}><td>{source(r)}</td><td>{fmtDate(r.t)}</td><td>{r.route}</td><td>{r.kind}</td><td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.message}</td><td>{r.count}</td></tr>))}
          </tbody></table></div>}
    </>
  );
}
