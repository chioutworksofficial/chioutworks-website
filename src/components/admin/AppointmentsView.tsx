import { useState } from 'react';
import { deleteAppointment, getAppointments, updateAppointmentStatus, type AppointmentStatus } from '../../lib/appointments';
import { fmtDate, fmtDay } from './api';
import { BulkBar, Check, SelectHeader, useNote, useSelection } from './bulk';

const LABEL: Record<AppointmentStatus, string> = { pending: 'Bekliyor', confirmed: 'Onaylandı', cancelled: 'İptal' };

export default function AppointmentsView() {
  const [items, setItems] = useState(() => getAppointments().sort((a, b) => b.createdAt - a.createdAt));
  const [f, setF] = useState<AppointmentStatus | 'all'>('all');
  const reload = () => setItems(getAppointments().sort((a, b) => b.createdAt - a.createdAt));
  const shown = items.filter((a) => f === 'all' || a.status === f);
  const sel = useSelection(shown.map((a) => a.id));
  const note = useNote();
  const setAll = (st: AppointmentStatus) => { const n = sel.sel.length; sel.sel.forEach((id) => updateAppointmentStatus(id, st)); sel.clear(); reload(); note.show({ ok: true, text: `${n} kayıt ${st === 'confirmed' ? 'onaylandı' : 'iptal edildi'}` }); };
  const delAll = () => { const n = sel.sel.length; sel.sel.forEach((id) => deleteAppointment(id)); sel.clear(); reload(); note.show({ ok: true, text: `${n} kayıt silindi` }); };
  return (
    <>
      <h1 className="adm-h1">Randevular</h1>
      <p className="adm-sub">Bu tarayıcıdaki veriler</p>
      <div className="adm-banner">Randevu kayıtları sunucuya gönderilmez; yalnızca randevuyu oluşturan kişinin kendi tarayıcısında saklanır. Ziyaretçilerin aldığı randevular burada görünmez. Gerçek talepler için “Talepler” bölümüne bakın.</div>
      <div className="adm-chips">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
          <button key={s} className="adm-chip" aria-pressed={f === s} onClick={() => setF(s)}>{s === 'all' ? `Tümü (${items.length})` : `${LABEL[s]} (${items.filter((a) => a.status === s).length})`}</button>
        ))}
      </div>
      {note.el}
      <SelectHeader s={sel} total={shown.length} />
      {!shown.length ? <div className="adm-empty">Bu tarayıcıda randevu kaydı yok</div> : <div className="adm-list">{shown.map((a) => (
        <div key={a.id} className="lq-card adm-card" style={sel.has(a.id) ? { borderColor: 'var(--c-lilac)' } : undefined}>
          <div className="adm-head"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><Check checked={sel.has(a.id)} label={`Seç: ${a.name}`} onToggle={(sh) => sel.toggle(a.id, sh)} /><span className="adm-name">{a.name}</span></span><span className="adm-chip tag">{LABEL[a.status]}</span></div>
          <div className="adm-meta">{fmtDay(a.date)} {a.preferredTime} · {a.email}{a.phone ? ` · ${a.phone}` : ''}{a.address ? ` · ${a.address}` : ''}</div>
          {a.message && <p style={{ margin: '8px 0 0', fontSize: 14 }}>{a.message}</p>}
          <div className="adm-actions" style={{ marginTop: 12 }}>
            <span className="adm-meta">Oluşturuldu: {fmtDate(a.createdAt)}</span><span style={{ flex: 1 }} />
            {a.status !== 'confirmed' && <button className="lq-btn-ghost adm-btn sm" onClick={() => { updateAppointmentStatus(a.id, 'confirmed'); reload(); }}>Onayla</button>}
            {a.status !== 'cancelled' && <button className="lq-btn-ghost adm-btn sm" onClick={() => { updateAppointmentStatus(a.id, 'cancelled'); reload(); }}>İptal et</button>}
            <button className="lq-btn-ghost adm-btn sm" onClick={() => { if (confirm('Randevu silinsin mi?')) { deleteAppointment(a.id); reload(); } }}>Sil</button>
          </div>
        </div>))}</div>}
      <BulkBar count={sel.sel.length} onDelete={delAll}>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => setAll('confirmed')}>Onayla</button>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => setAll('cancelled')}>İptal et</button>
      </BulkBar>
    </>
  );
}
