import { useCallback, useEffect, useState } from 'react';
import { api, fmtDate } from './api';

// Own error log (server/errors.ts): last 200 server errors, masked, deduplicated per hour. Admin UI is Turkish.
interface Row { id: number | string; t: string; route: string; kind: string; message: string; count: number }

export default function ErrorsView() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(() => {
    setErr(null);
    api<{ errors: Row[] }>('/api/admin/errors').then((r) => setRows(r.errors)).catch(() => setErr('Hatalar yüklenemedi.'));
  }, []);
  useEffect(load, [load]);
  const clear = async () => {
    if (!window.confirm('Tüm hata kayıtları silinsin mi?')) return;
    try { await api('/api/admin/errors', 'DELETE'); setRows([]); } catch { setErr('Silinemedi.'); }
  };
  return (
    <>
      <h1 className="adm-h1">Hatalar / Errors</h1>
      <p className="adm-sub">Sunucu hataları (son 200). E-posta, telefon, IP ve anahtarlar maskelenir; aynı hata bir saat içinde sayaçla birleşir; 30 gün sonra silinir.</p>
      <div className="adm-actions" style={{ marginBottom: 16 }}>
        <button className="lq-btn-ghost adm-btn sm" onClick={load}>Yenile</button>
        <button className="lq-btn-ghost adm-btn sm" onClick={clear} disabled={!rows?.length}>Temizle</button>
      </div>
      {err && <div className="adm-banner" role="alert">{err}</div>}
      {!rows ? (!err && <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>)
        : !rows.length ? <div className="adm-empty">Kayıtlı hata yok.</div>
        : <div className="lq-card adm-card adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Zaman</th><th>Yol</th><th>Tür</th><th>Mesaj</th><th>Adet</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}><td>{fmtDate(r.t)}</td><td>{r.route}</td><td>{r.kind}</td><td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.message}</td><td>{r.count}</td></tr>))}
          </tbody></table></div>}
    </>
  );
}
