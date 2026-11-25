import { useState } from 'react';
import { api, fmtDate, type Req } from '../api';
import { useNote } from '../bulk';
import { PT, SRC_BADGE, ST, mask, msgOf } from './shared';
import type { Cust, Summary } from './types';

const PRIO = { high: 'Yüksek', normal: 'Normal', low: 'Düşük' } as const;
const RANK = { high: 0, normal: 1, low: 2 } as const;
const t = (c: Cust) => (c.scheduledAt ? Date.parse(c.scheduledAt) : Infinity);
/** datetime-local value (browser local time) from an ISO string, and back. */
const toLocal = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

export default function QueueTab({ queue, reqs, sum, reload }: { queue: Cust[]; reqs: Req[] | null; sum: Summary | null; reload: () => Promise<void> }) {
  const note = useNote();
  const [picker, setPicker] = useState(false);
  const [pick, setPick] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<string | null>(null);   // live call confirmation (customer id)
  const [busy, setBusy] = useState('');
  const [edit, setEdit] = useState<{ id: string; prio: 'high' | 'normal' | 'low'; at: string } | null>(null);
  const rows = queue.filter((c) => !c.doNotCall && c.status !== 'booked').sort((a, b) => (RANK[a.priority ?? 'normal'] - RANK[b.priority ?? 'normal']) || (t(a) - t(b)) || 0);
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
      <p className="adm-sub">Yalnızca telefonla aranmayı seçmiş ve "aranmasın" listesinde olmayan kişiler. Sıralama: önce öncelik, sonra planlanan zaman. Her aramadan önce Planlama kuralları denetlenir; aranamayan satırda nedeni görünür.</p>
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
            <div className="vo-qtop"><b>{c.name}</b><span className="adm-meta">{mask(c.phone)} · {c.sector}</span><span className="adm-chip" data-state={c.status}>{ST[c.status]}</span>{c.source && SRC_BADGE[c.source] && <span className="adm-chip tag vo-src">{SRC_BADGE[c.source]}</span>}</div>
            <p className="vo-reason"><span className="adm-label">Makul sebep</span>{c.notes || 'Belirtilmemiş'}</p>
            <div className="vo-qmeta"><span className="adm-chip tag" data-prio={c.priority ?? 'normal'}>Öncelik: {PRIO[c.priority ?? 'normal']}</span><span className="adm-meta">Zaman: {c.scheduledAt ? fmtDate(c.scheduledAt) : PT[c.preferred_time] ?? '-'}</span>
              {c.rule && (c.rule.ok ? <span className="adm-chip" data-state="paid">Şimdi aranabilir</span> : <span className="adm-chip" data-state="calling">Şimdi aranamaz</span>)}</div>
            {c.rule && !c.rule.ok && <p className="vo-rule" role="note">{c.rule.reason}{c.rule.nextSlot && c.rule.code !== 'attempts' && c.rule.code !== 'dnc' ? <> <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => run(c.id, () => api(`/api/admin/voice-agent/queue/${c.id}`, 'PATCH', { scheduledAt: c.rule!.nextSlot }), 'Uygun slota atandı.', 'Atanamadı.')}>Uygun slota ata</button></> : null}</p>}
            {edit?.id === c.id && <div className="vo-edit">
              <label className="adm-label">Öncelik<select className="adm-input" value={edit.prio} onChange={(e) => setEdit({ ...edit, prio: e.target.value as 'high' | 'normal' | 'low' })}>{(Object.keys(PRIO) as (keyof typeof PRIO)[]).map((k) => <option key={k} value={k}>{PRIO[k]}</option>)}</select></label>
              <label className="adm-label">Planlanan zaman<input className="adm-input" type="datetime-local" value={edit.at} onChange={(e) => setEdit({ ...edit, at: e.target.value })} /></label>
              <div className="vo-qact"><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!!busy} onClick={() => run(c.id, async () => { await api(`/api/admin/voice-agent/queue/${c.id}`, 'PATCH', { priority: edit.prio, scheduledAt: edit.at ? new Date(edit.at).toISOString() : '' }); setEdit(null); }, 'Öncelik ve zaman kaydedildi.', 'Kaydedilemedi.')}>Kaydet</button>
                <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setEdit(null)}>Vazgeç</button></div>
            </div>}
          </div>
          <div className="vo-qact">
            {confirm === c.id ? <div className="vo-confirm" role="alert"><span>{c.name} GERÇEKTEN aranacak. Emin misiniz?</span>
              <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!!busy} onClick={() => start(c)}>Evet, ara</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(null)}>Vazgeç</button></div> : <>
              <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!!busy || sum?.mode === 'live'} title={sum?.mode === 'live' ? 'Canlı modda simülasyon kapalı' : ''} onClick={() => run(c.id, () => api('/api/admin/voice-agent/start', 'POST', { customerIds: [c.id] }), 'Simülasyon kaydı oluşturuldu, arama yapılmadı.', 'Başlatılamadı.')}>Simülasyon araması başlat</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!liveOn || !!busy} title={liveOn ? '' : 'Canlı mod ve Vapi ayarları gerekir'} onClick={() => setConfirm(c.id)}>Canlı ara</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => setEdit({ id: c.id, prio: c.priority ?? 'normal', at: toLocal(c.scheduledAt) })}>Öncelik / zaman</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => run(c.id, () => api(`/api/admin/voice-agent/queue/${c.id}`, 'DELETE'), 'Kuyruktan çıkarıldı.', 'Çıkarılamadı.')}>Kuyruktan çıkar</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => run(c.id, () => api(`/api/admin/voice-agent/queue/${c.id}`, 'PATCH', { doNotCall: true }), 'Aranmasın olarak işaretlendi.', 'İşaretlenemedi.')}>Aranmasın işaretle</button></>}
          </div>
        </li>))}</ul>}
    </div>
  );
}
