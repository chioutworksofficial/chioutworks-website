import { useState } from 'react';
import { api, fmtDate, type Req } from '../api';
import { useNote } from '../bulk';
import { PT, ST, mask, msgOf } from './shared';
import type { Cust, Summary } from './types';

const PRIO = { high: 'Yüksek', normal: 'Normal', low: 'Düşük' } as const;

export default function QueueTab({ queue, reqs, sum, reload }: { queue: Cust[]; reqs: Req[] | null; sum: Summary | null; reload: () => Promise<void> }) {
  const note = useNote();
  const [picker, setPicker] = useState(false);
  const [pick, setPick] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<string | null>(null);   // live call confirmation (customer id)
  const [busy, setBusy] = useState('');
  const rows = queue.filter((c) => !c.doNotCall && c.status !== 'booked');
  const have = new Set(queue.map((c) => c.sourceRequestId));
  const withPhone = (reqs ?? []).filter((r) => (r.phone ?? '').trim() && !r.archived && (!r.replyPreference || r.replyPreference === 'phone'));
  const run = async (id: string, fn: () => Promise<unknown>, ok: string, fail: string) => {
    setBusy(id);
    try { await fn(); await reload(); note.show({ ok: true, text: ok }); } catch (x) { note.show({ ok: false, text: msgOf(x, fail) }); }
    setBusy('');
  };
  const start = (c: Cust) => run(c.id, async () => { const r = await api<{ message: string }>('/api/admin/voice-agent/start', 'POST', { customerIds: [c.id] }); setConfirm(null); note.show({ ok: true, text: r.message }); }, `${c.name}: kayıt oluşturuldu.`, 'Başlatılamadı.');
  const add = async () => {
    try { const r = await api<{ added: number; skipped: number }>('/api/admin/voice-agent/queue', 'POST', { requestIds: [...pick] }); setPick(new Set()); setPicker(false); await reload(); note.show({ ok: true, text: `${r.added} kişi eklendi${r.skipped ? `, ${r.skipped} atlandı` : ''}.` }); }
    catch (x) { note.show({ ok: false, text: msgOf(x, 'Eklenemedi.') }); }
  };
  const liveOn = !!sum?.liveReady;
  return (
    <div className="lq-card adm-card">
      <div className="adm-head"><h2>Aranacaklar</h2><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setPicker(!picker)}>{picker ? 'Kapat' : 'Taleplerden ekle'}</button></div>
      <p className="adm-sub">Yalnızca telefonla aranmayı seçmiş ve "aranmasın" listesinde olmayan kişiler. Her satırda aramanın makul sebebi görünür.</p>
      {note.el}
      {picker && <div className="adm-banner">
        {!withPhone.length ? 'Telefon numarası olan talep yok.' : <div className="vo-pick">{withPhone.map((r) => (
          <label key={r.id}><input type="checkbox" className="adm-check" disabled={have.has(r.id)} checked={pick.has(r.id)} onChange={() => setPick((p) => { const n = new Set(p); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} />
            <span>{r.name || 'İsimsiz'} · {mask(r.phone ?? '')}{have.has(r.id) ? ' · kuyrukta' : ''}</span></label>))}</div>}
        <div className="adm-actions" style={{ marginTop: 10 }}><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!pick.size} onClick={add}>Ekle ({pick.size})</button></div>
      </div>}
      {!rows.length ? <div className="adm-empty">Kuyrukta kimse yok</div> : <ul className="vo-q">{rows.map((c) => (
        <li key={c.id} className="vo-qrow">
          <div className="vo-qmain">
            <div className="vo-qtop"><b>{c.name}</b><span className="adm-meta">{mask(c.phone)} · {c.sector}</span><span className="adm-chip" data-state={c.status}>{ST[c.status]}</span></div>
            <p className="vo-reason"><span className="adm-label">Makul sebep</span>{c.notes || 'Belirtilmemiş'}</p>
            <div className="vo-qmeta"><span className="adm-chip tag">Öncelik: {PRIO[c.priority ?? 'normal']}</span><span className="adm-meta">Zaman: {c.scheduledAt ? fmtDate(c.scheduledAt) : PT[c.preferred_time] ?? '-'}</span></div>
          </div>
          <div className="vo-qact">
            {confirm === c.id ? <div className="vo-confirm" role="alert"><span>{c.name} GERÇEKTEN aranacak. Emin misiniz?</span>
              <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!!busy} onClick={() => start(c)}>Evet, ara</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(null)}>Vazgeç</button></div> : <>
              <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!!busy || sum?.mode === 'live'} title={sum?.mode === 'live' ? 'Canlı modda simülasyon kapalı' : ''} onClick={() => run(c.id, () => api('/api/admin/voice-agent/start', 'POST', { customerIds: [c.id] }), 'Simülasyon kaydı oluşturuldu, arama yapılmadı.', 'Başlatılamadı.')}>Simülasyon araması başlat</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!liveOn || !!busy} title={liveOn ? '' : 'Canlı mod ve Vapi ayarları gerekir'} onClick={() => setConfirm(c.id)}>Canlı ara</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => run(c.id, () => api(`/api/admin/voice-agent/queue/${c.id}`, 'DELETE'), 'Kuyruktan çıkarıldı.', 'Çıkarılamadı.')}>Kuyruktan çıkar</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => run(c.id, () => api(`/api/admin/voice-agent/queue/${c.id}`, 'PATCH', { doNotCall: true }), 'Aranmasın olarak işaretlendi.', 'İşaretlenemedi.')}>Aranmasın işaretle</button></>}
          </div>
        </li>))}</ul>}
    </div>
  );
}
