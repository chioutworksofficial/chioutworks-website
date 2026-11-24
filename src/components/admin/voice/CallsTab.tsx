import { useCallback, useEffect, useState } from 'react';
import { api, fmtDate } from '../api';
import { useNote } from '../bulk';
import CallDrawer from './CallDrawer';
import { msgOf } from './shared';
import { download, fmtDur, OUTCOME, toCsv, type CallPage, type CallRow, type Outcome } from './types';

interface F { from: string; to: string; outcome: '' | Outcome; direction: '' | 'in' | 'out'; recording: boolean; q: string }
const F0: F = { from: '', to: '', outcome: '', direction: '', recording: false, q: '' };
const PAGE = 20;
const qs = (f: F, extra: Record<string, string | number>) => {
  const p = new URLSearchParams(); Object.entries(extra).forEach(([k, v]) => p.set(k, String(v)));
  if (f.from) p.set('from', f.from); if (f.to) p.set('to', f.to); if (f.outcome) p.set('outcome', f.outcome); if (f.direction) p.set('direction', f.direction); if (f.recording) p.set('recording', '1'); if (f.q.trim()) p.set('q', f.q.trim());
  return p.toString();
};

export default function CallsTab({ inbound, version }: { inbound?: boolean; version: number }) {
  const [f, setF] = useState<F>(F0);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CallPage | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const note = useNote();
  const eff: F = inbound ? { ...f, direction: 'in' } : f;
  useEffect(() => { const t = window.setTimeout(() => { setF((x) => ({ ...x, q })); setPage(1); }, 300); return () => window.clearTimeout(t); }, [q]);
  const load = useCallback(() => api<CallPage>(`/api/admin/voice-agent/calls?${qs(eff, { page, limit: PAGE })}`).then(setData).catch((x) => note.show({ ok: false, text: msgOf(x, 'Kayıtlar yüklenemedi.') })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [f, page, inbound, version]);
  useEffect(() => { load(); }, [load]);
  const set = <K extends keyof F>(k: K, v: F[K]) => { setF((x) => ({ ...x, [k]: v })); setPage(1); };
  const filtered = !!(f.from || f.to || f.outcome || (!inbound && f.direction) || f.recording || f.q);
  const exportCsv = async () => {
    try {
      const all = await api<CallPage>(`/api/admin/voice-agent/calls?${qs(eff, { page: 1, limit: 1000 })}`);
      download(`arama-kayitlari-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([['Tarih', 'Kişi', 'İşletme', 'Yön', 'Süre (sn)', 'Sonuç', 'Özet'], ...all.calls.map((c) => [fmtDate(c.createdAt), c.person, c.business, c.direction === 'in' ? 'Gelen' : 'Giden', String(c.durationSec), OUTCOME[c.outcome], c.summary])]), 'text/csv');
    } catch (x) { note.show({ ok: false, text: msgOf(x, 'Dışa aktarılamadı.') }); }
  };
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE)) : 1;
  const who = (c: CallRow) => c.person || 'Bilinmeyen arayan';
  const badge = (c: CallRow) => <span className="adm-chip" data-state={c.outcome}>{OUTCOME[c.outcome]}</span>;
  return (
    <div className="lq-card adm-card">
      <div className="adm-head"><h2>{inbound ? 'Gelen aramalar' : 'Arama kayıtları'}</h2><button type="button" className="lq-btn-ghost adm-btn sm" onClick={exportCsv} disabled={!data?.total}>CSV indir</button></div>
      {note.el}
      {inbound && !filtered && data?.total === 0 ? <div className="adm-empty">Henüz gelen arama yok. Vapi'de bir telefon numarası bu asistana bağlanıp arama aldığında, Vapi'nin "end-of-call-report" bildirimiyle burada listelenir.</div> : <>
        <div className="vo-filters">
          <label className="adm-label">Başlangıç<input className="adm-input" type="date" value={f.from} max={f.to || undefined} onChange={(e) => set('from', e.target.value)} /></label>
          <label className="adm-label">Bitiş<input className="adm-input" type="date" value={f.to} min={f.from || undefined} onChange={(e) => set('to', e.target.value)} /></label>
          <label className="adm-label">Sonuç<select className="adm-input" value={f.outcome} onChange={(e) => set('outcome', e.target.value as F['outcome'])}><option value="">Hepsi</option>{(Object.keys(OUTCOME) as Outcome[]).map((o) => <option key={o} value={o}>{OUTCOME[o]}</option>)}</select></label>
          {!inbound && <label className="adm-label">Yön<select className="adm-input" value={f.direction} onChange={(e) => set('direction', e.target.value as F['direction'])}><option value="">Hepsi</option><option value="out">Giden</option><option value="in">Gelen</option></select></label>}
          <label className="adm-label vo-search">Ara<input className="adm-input" type="search" placeholder="Kişi, işletme, özet" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <label className="vo-rec"><input type="checkbox" className="adm-check" checked={f.recording} onChange={(e) => set('recording', e.target.checked)} /><span>Ses kaydı olanlar</span></label>
          {filtered && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => { setF(F0); setQ(''); setPage(1); }}>Temizle</button>}
        </div>
        {!data ? <div className="adm-skel" style={{ height: 160 }} /> : !data.calls.length ? <div className="adm-empty">{filtered ? 'Filtreye uyan kayıt yok' : 'Henüz kayıt yok'}</div> : <>
          <div className="adm-table-wrap vo-desk"><table className="adm-table"><thead><tr><th>Tarih</th><th>Kişi / işletme</th><th>Yön</th><th>Süre</th><th>Sonuç</th><th>Özet</th><th /></tr></thead><tbody>{data.calls.map((c) => (
            <tr key={c.id}><td>{fmtDate(c.createdAt)}</td><td><b>{who(c)}</b>{c.business && <div className="adm-meta">{c.business}</div>}</td><td>{c.direction === 'in' ? 'Gelen' : 'Giden'}</td><td>{fmtDur(c.durationSec)}</td><td>{badge(c)}</td>
              <td className="vo-sum">{c.summary || '-'}</td><td><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setOpen(c.id)}>Detay</button></td></tr>))}</tbody></table></div>
          <ul className="vo-cards">{data.calls.map((c) => (
            <li key={c.id}><button type="button" className="vo-card" onClick={() => setOpen(c.id)}>
              <span className="vo-card-top"><b>{who(c)}</b>{badge(c)}</span>
              <span className="adm-meta">{fmtDate(c.createdAt)} · {c.direction === 'in' ? 'Gelen' : 'Giden'} · {fmtDur(c.durationSec)}{c.business ? ` · ${c.business}` : ''}</span>
              {c.summary && <span className="vo-card-sum">{c.summary}</span>}</button></li>))}</ul>
          <div className="vo-pager"><button type="button" className="lq-btn-ghost adm-btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Önceki</button><span className="adm-meta">Sayfa {page} / {pages} · {data.total} kayıt</span><button type="button" className="lq-btn-ghost adm-btn sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Sonraki</button></div></>}
      </>}
      {open && <CallDrawer id={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
