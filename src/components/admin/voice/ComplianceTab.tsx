import { useEffect, useMemo, useState } from 'react';
import { api, fmtDate } from '../api';
import { useNote } from '../bulk';
import { msgOf } from './shared';
import { download, fmtDur, OUTCOME, toCsv, type CompRes, type CompRow } from './types';

const PAGE = 20;
const disc = (r: CompRow) => (r.disclosure === 'yes' ? 'Verildi' : r.disclosure === 'no' ? 'Verilmedi' : 'Transkript yok');
const rec = (r: CompRow) => (!r.recording.on ? 'Kapalı' : r.recording.consent === 'asked' ? 'Açık, izin soruldu' : 'Açık, izin sorulmadı');
const proof = (r: CompRow) => (r.proof.ok === null ? 'Gerekmiyor (gelen)' : r.proof.ok ? 'Var' : 'Yok');

export default function ComplianceTab({ version }: { version: number }) {
  const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [dir, setDir] = useState<'' | 'in' | 'out'>(''); const [issue, setIssue] = useState(false);
  const [d, setD] = useState<CompRes | null>(null); const [page, setPage] = useState(1);
  const note = useNote();
  const qs = useMemo(() => { const p = new URLSearchParams(); if (from) p.set('from', from); if (to) p.set('to', to); if (dir) p.set('direction', dir); if (issue) p.set('flag', 'issue'); return p.toString(); }, [from, to, dir, issue]);
  useEffect(() => { setPage(1); api<CompRes>(`/api/admin/voice-agent/compliance?${qs}`).then(setD).catch((x) => note.show({ ok: false, text: msgOf(x, 'Kayıt yüklenemedi.') })); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [qs, version]);
  const exportCsv = () => d && download(`uyum-kaydi-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([['Tarih', 'Kişi', 'Numara (maskeli)', 'Yön', 'Süre (sn)', 'YZ bildirimi', 'Kayıt', 'Telefon tercihi kanıtı', 'Kanıt türü', 'Kanıt kaydı', 'Kanıt zamanı', 'Not', 'Sonuç', 'Uyarı'],
    ...d.rows.map((r) => [fmtDate(r.createdAt), r.person, r.phoneMasked, r.direction === 'in' ? 'Gelen' : 'Giden', String(r.durationSec), disc(r), rec(r), proof(r), r.proof.kind, r.proof.refId, r.proof.at ? fmtDate(r.proof.at) : '', r.proof.note, OUTCOME[r.outcome], r.issue ? 'Evet' : 'Hayır'])]), 'text/csv');
  const rows = d?.rows.slice((page - 1) * PAGE, page * PAGE) ?? []; const pages = d ? Math.max(1, Math.ceil(d.rows.length / PAGE)) : 1;
  const chip = (ok: boolean | null, t: string) => <span className="adm-chip" data-state={ok === null ? 'to_call' : ok ? 'paid' : 'bad'}>{t}</span>;
  return (
    <div className="lq-card adm-card">
      <div className="adm-head"><h2>Uyum kaydı</h2><button type="button" className="lq-btn-ghost adm-btn sm" onClick={exportCsv} disabled={!d?.rows.length}>CSV indir</button></div>
      <p className="adm-sub">Her gerçek arama için KVKK/GDPR ve UWG sorularına karşı kanıt: yapay zekâ bildirimi (ilk asistan satırından), ses kaydı ve izin, telefon tercihi kaydı, sonuç. Simülasyonlar dahil değildir. Hukuki değerlendirme avukat incelemesinin yerini tutmaz.</p>
      {note.el}
      <div className="vo-filters">
        <label className="adm-label">Başlangıç<input className="adm-input" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="adm-label">Bitiş<input className="adm-input" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></label>
        <label className="adm-label">Yön<select className="adm-input" value={dir} onChange={(e) => setDir(e.target.value as typeof dir)}><option value="">Hepsi</option><option value="out">Giden</option><option value="in">Gelen</option></select></label>
        <label className="vo-rec"><input type="checkbox" className="adm-check" checked={issue} onChange={(e) => setIssue(e.target.checked)} /><span>Yalnızca uyarılılar</span></label>
        {(from || to || dir || issue) && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => { setFrom(''); setTo(''); setDir(''); setIssue(false); }}>Temizle</button>}
      </div>
      {!d ? <div className="adm-skel" style={{ height: 160 }} /> : <>
        <p className="adm-meta">{d.total} arama{d.issues ? ` · ${d.issues} uyarılı` : ' · uyarı yok'}</p>
        {!d.rows.length ? <div className="adm-empty">{qs ? 'Filtreye uyan kayıt yok' : 'Henüz gerçek arama yok. Arama yapıldıkça burada kanıt satırı oluşur.'}</div> : <>
          <div className="adm-table-wrap vo-desk"><table className="adm-table"><thead><tr><th>Tarih</th><th>Kişi</th><th>Yön</th><th>YZ bildirimi</th><th>Ses kaydı</th><th>Telefon tercihi kanıtı</th><th>Sonuç</th></tr></thead><tbody>{rows.map((r) => (
            <tr key={r.id} data-issue={r.issue ? '1' : undefined}><td>{fmtDate(r.createdAt)}</td><td><b>{r.person || 'Bilinmeyen'}</b><div className="adm-meta">{r.phoneMasked} · {fmtDur(r.durationSec)}</div></td><td>{r.direction === 'in' ? 'Gelen' : 'Giden'}</td>
              <td>{chip(r.disclosure === 'unknown' ? null : r.disclosure === 'yes', disc(r))}</td><td>{chip(r.recording.on ? r.recording.consent === 'asked' : null, rec(r))}</td>
              <td className="vo-sum">{chip(r.proof.ok, proof(r))}<div className="adm-meta">{r.proof.note}{r.proof.refId ? ` · kayıt ${r.proof.refId}` : ''}{r.proof.at ? ` · ${fmtDate(r.proof.at)}` : ''}</div></td><td><span className="adm-chip" data-state={r.outcome}>{OUTCOME[r.outcome]}</span></td></tr>))}</tbody></table></div>
          <ul className="vo-cards">{rows.map((r) => (
            <li key={r.id} className="vo-card vo-ccrd" data-issue={r.issue ? '1' : undefined}><span className="vo-card-top"><b>{r.person || 'Bilinmeyen'}</b><span className="adm-chip" data-state={r.outcome}>{OUTCOME[r.outcome]}</span></span>
              <span className="adm-meta">{fmtDate(r.createdAt)} · {r.direction === 'in' ? 'Gelen' : 'Giden'} · {fmtDur(r.durationSec)}</span>
              <span className="vo-kv"><span className="adm-label">YZ bildirimi</span>{chip(r.disclosure === 'unknown' ? null : r.disclosure === 'yes', disc(r))}</span>
              <span className="vo-kv"><span className="adm-label">Ses kaydı</span>{chip(r.recording.on ? r.recording.consent === 'asked' : null, rec(r))}</span>
              <span className="vo-kv"><span className="adm-label">Telefon tercihi</span>{chip(r.proof.ok, proof(r))}</span>
              <span className="adm-meta">{r.proof.note}</span></li>))}</ul>
          <div className="vo-pager"><button type="button" className="lq-btn-ghost adm-btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Önceki</button><span className="adm-meta">Sayfa {page} / {pages}</span><button type="button" className="lq-btn-ghost adm-btn sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Sonraki</button></div></>}
      </>}
    </div>
  );
}
