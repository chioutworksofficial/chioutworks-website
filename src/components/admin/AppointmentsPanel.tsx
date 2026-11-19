import { useEffect, useMemo, useState } from 'react';
import {
  getAppointments, updateAppointmentStatus, deleteAppointment,
  getClosedDays, toggleClosedDay,
  type Appointment, type AppointmentStatus,
} from '../../lib/appointments';
import MonthCalendar from '../MonthCalendar';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylandı',
  cancelled: 'İptal',
};

const STATUS_COLOR: Record<AppointmentStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef9c3', text: '#854d0e' },
  confirmed: { bg: '#dcfce7', text: '#166534' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AppointmentsPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [closedDays, setClosedDaysState] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const reload = () => {
    setAppointments(getAppointments());
    setClosedDaysState(getClosedDays());
  };

  useEffect(() => { reload(); }, []);

  const closedDaysSet = useMemo(() => new Set(closedDays), [closedDays]);

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return appointments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!term) return true;
      return [a.name, a.email, a.phone, a.address, a.date, a.message]
        .some((f) => f.toLowerCase().includes(term));
    });
  }, [appointments, filter, statusFilter]);

  const counts = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }), [appointments]);

  const handleStatus = (id: string, status: AppointmentStatus) => {
    updateAppointmentStatus(id, status);
    reload();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu randevu talebini silmek istediğinize emin misiniz?')) {
      deleteAppointment(id);
      reload();
    }
  };

  const handleToggleClosedDay = (date: string) => {
    toggleClosedDay(date);
    reload();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 flex flex-col gap-1">
          <p className="eyebrow" style={{ color: 'var(--color-ink-faint)' }}>Toplam Talep</p>
          <p className="stat-num">{counts.total}</p>
        </div>
        <div className="card p-5 flex flex-col gap-1">
          <p className="eyebrow" style={{ color: 'var(--color-ink-faint)' }}>Bekleyen</p>
          <p className="stat-num">{counts.pending}</p>
        </div>
        <div className="card p-5 flex flex-col gap-1">
          <p className="eyebrow" style={{ color: 'var(--color-ink-faint)' }}>Onaylanan</p>
          <p className="stat-num">{counts.confirmed}</p>
        </div>
        <div className="card p-5 flex flex-col gap-1">
          <p className="eyebrow" style={{ color: 'var(--color-ink-faint)' }}>İptal</p>
          <p className="stat-num">{counts.cancelled}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Appointments table */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-sm" style={{ color: 'var(--color-ink-strongest)' }}>Randevu Talepleri</p>
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="pill-tag"
                  style={{
                    background: statusFilter === s ? 'var(--color-lime-300)' : 'var(--color-surface-raised)',
                    color: statusFilter === s ? '#1a1a1a' : 'var(--color-ink-muted)',
                    border: '1px solid var(--color-border-card)',
                    cursor: 'pointer',
                  }}
                >
                  {s === 'all' ? 'Tümü' : STATUS_LABEL[s]}
                </button>
              ))}
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="İsim, e-posta, telefon, adres ara..."
                className="px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{ background: 'var(--color-surface-darker)', border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strongest)' }}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              {appointments.length === 0 ? 'Henüz randevu talebi yok.' : 'Filtreyle eşleşen talep yok.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                    {['Tarih/Saat', 'İsim', 'İletişim', 'Adres', 'Mesaj', 'Durum', ''].map((h) => (
                      <th key={h} className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-ink-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const sc = STATUS_COLOR[a.status];
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                        <td className="py-2 px-3 whitespace-nowrap" style={{ color: 'var(--color-ink-strong)' }}>
                          {a.date} · {a.preferredTime}
                          <div style={{ fontSize: 10.5, color: 'var(--color-ink-faint)' }}>{formatDate(a.createdAt)} alındı</div>
                        </td>
                        <td className="py-2 px-3" style={{ color: 'var(--color-ink-strong)' }}>{a.name}</td>
                        <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>
                          <div>{a.email}</div>
                          <div>{a.phone}</div>
                        </td>
                        <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)', maxWidth: 180 }}>{a.address}</td>
                        <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)', maxWidth: 200 }}>{a.message || '—'}</td>
                        <td className="py-2 px-3">
                          <span className="pill-tag" style={{ background: sc.bg, color: sc.text }}>{STATUS_LABEL[a.status]}</span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {a.status !== 'confirmed' && (
                              <button onClick={() => handleStatus(a.id, 'confirmed')} className="btn-secondary text-xs px-3 py-1.5">Onayla</button>
                            )}
                            {a.status !== 'cancelled' && (
                              <button onClick={() => handleStatus(a.id, 'cancelled')} className="btn-secondary text-xs px-3 py-1.5">İptal et</button>
                            )}
                            <button onClick={() => handleDelete(a.id)} className="btn-secondary text-xs px-3 py-1.5" style={{ color: '#d92d20' }}>Sil</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Closed days calendar */}
        <div className="card p-5 flex flex-col gap-3">
          <p className="font-bold text-sm" style={{ color: 'var(--color-ink-strongest)' }}>Kapalı Günler</p>
          <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
            Bir güne tıklayarak o günü kapatın/açın. Kapalı günler ziyaretçiye randevu formunda dolu olarak görünür.
          </p>
          <MonthCalendar
            selected={null}
            onSelectDay={handleToggleClosedDay}
            markedDays={closedDaysSet}
          />
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-ink-faint)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(217,45,32,0.12)', display: 'inline-block' }} />
            Kapalı gün
          </div>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--color-ink-faint)' }}>
        Randevu verileri bu tarayıcının yerel deposunda (localStorage) saklanır. Başka bir cihazdan/tarayıcıdan
        alınan randevuları görmek için ileride Supabase entegrasyonu eklenmesi gerekir.
      </p>
    </div>
  );
}
