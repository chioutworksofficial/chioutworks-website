import { useEffect, useState } from 'react';
import { api, fmtDate } from '../api';
import { useNote } from '../bulk';
import { msgOf } from './shared';
import type { DncItem, DncRes } from './types';

const SRC: Record<DncItem['source'], string> = { call: 'Aramada', manual: 'Elle', form: 'Form', unknown: 'Eski kayıt' };

export default function DncTab({ onChange }: { onChange: () => void }) {
  const [d, setD] = useState<DncRes | null>(null);
  const [phone, setPhone] = useState(''); const [reason, setReason] = useState(''); const [source, setSource] = useState<'manual' | 'form' | 'call'>('manual');
  const [rm, setRm] = useState<{ id: string; note: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const note = useNote();
  const load = () => api<DncRes>('/api/admin/voice-agent/dnc').then(setD).catch((x) => note.show({ ok: false, text: msgOf(x, 'Liste yüklenemedi.') }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);
  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api<{ existed: boolean }>('/api/admin/voice-agent/dnc', 'POST', { phone, reason, source }); setPhone(''); setReason(''); await load(); onChange(); note.show({ ok: true, text: r.existed ? 'Numara zaten listede.' : 'Listeye eklendi.' }); }
    catch (x) { note.show({ ok: false, text: msgOf(x, 'Eklenemedi.') }); }
    setBusy(false);
  };
  const remove = async () => {
    if (!rm) return; setBusy(true);
    try { await api(`/api/admin/voice-agent/dnc/${rm.id}`, 'DELETE', { note: rm.note }); setRm(null); await load(); onChange(); note.show({ ok: true, text: 'Listeden kaldırıldı; not kayda yazıldı.' }); }
    catch (x) { note.show({ ok: false, text: msgOf(x, 'Kaldırılamadı.') }); }
    setBusy(false);
  };
  const confirm = (id: string) => rm?.id === id && (
    <div className="vo-confirm vo-rm" role="alert"><span>Bu numara tekrar aranabilir hale gelir. Neden kaldırıyorsunuz?</span>
      <input className="adm-input" aria-label="Kaldırma notu" placeholder="Kısa not (en az 3 karakter)" maxLength={300} value={rm.note} onChange={(e) => setRm({ id, note: e.target.value })} />
      <div className="vo-qact"><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={busy || rm.note.trim().length < 3} onClick={remove}>Evet, kaldır</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setRm(null)}>Vazgeç</button></div></div>);
  return (
    <div className="lq-card adm-card">
      <div className="adm-head"><h2>Aranmasın listesi</h2><span className="adm-chip tag">{d ? d.total : '…'} numara</span></div>
      <p className="adm-sub">Bu numaralar kuyruğa girmez ve aranmaz. Numaralar maskeli gösterilir; tam numara arayüze dönmez. Ret aramada, formda veya elle kaydedilebilir.</p>
      {note.el}
      <form className="vo-dncform" onSubmit={add}>
        <label className="adm-label">Numara (ülke koduyla)<input className="adm-input" inputMode="tel" autoComplete="off" placeholder="+49 170 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>
        <label className="adm-label">Neden<input className="adm-input" maxLength={200} placeholder="Örn. e-postayla aranmak istemediğini bildirdi" value={reason} onChange={(e) => setReason(e.target.value)} /></label>
        <label className="adm-label">Kaynak<select className="adm-input" value={source} onChange={(e) => setSource(e.target.value as typeof source)}><option value="manual">Elle</option><option value="form">Form</option><option value="call">Arama</option></select></label>
        <button type="submit" className="lq-btn-ghost adm-btn adm-pri" disabled={busy || phone.trim().length < 6}>Ekle</button>
      </form>
      {!d ? <div className="adm-skel" style={{ height: 140 }} /> : !d.items.length ? <div className="adm-empty">Listede numara yok</div> : <>
        <div className="adm-table-wrap vo-desk"><table className="adm-table"><thead><tr><th>Numara</th><th>Neden</th><th>Tarih</th><th>Kaynak</th><th /></tr></thead><tbody>{d.items.map((i) => (
          <tr key={i.id}><td><code>{i.masked}</code></td><td className="vo-sum">{i.reason || '-'}</td><td>{i.at ? fmtDate(i.at) : '-'}</td><td>{SRC[i.source]}</td>
            <td>{rm?.id === i.id ? confirm(i.id) : <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setRm({ id: i.id, note: '' })}>Kaldır</button>}</td></tr>))}</tbody></table></div>
        <ul className="vo-cards">{d.items.map((i) => (
          <li key={i.id} className="vo-card vo-dcard"><span className="vo-card-top"><b><code>{i.masked}</code></b><span className="adm-chip tag">{SRC[i.source]}</span></span>
            <span className="adm-meta">{i.at ? fmtDate(i.at) : 'Tarih yok'}</span>{i.reason && <span className="vo-card-sum">{i.reason}</span>}
            {rm?.id === i.id ? confirm(i.id) : <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setRm({ id: i.id, note: '' })}>Kaldır</button>}</li>))}</ul></>}
      {d && d.log.length > 0 && <details className="vo-holidays"><summary>Son kaldırmalar ({d.log.length})</summary><ul className="vo-links">{d.log.map((l, k) => <li key={k}>{fmtDate(l.at)} · {l.masked} · {l.note}</li>)}</ul></details>}
    </div>
  );
}
