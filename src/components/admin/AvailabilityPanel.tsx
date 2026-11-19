import { useEffect, useState } from 'react';
import MonthCalendar from '../MonthCalendar';
import { api, ApiError } from './api';

export default function AvailabilityPanel({ onSaved }: { onSaved?: (b: string[]) => void }) {
  const [blocked, setBlocked] = useState<Set<string> | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ blocked: string[] }>('/api/availability').then((j) => setBlocked(new Set(j.blocked))).catch(() => { setBlocked(new Set()); setMsg({ ok: false, text: 'Takvim yüklenemedi.' }); });
  }, []);

  const toggle = (d: string) => {
    setMsg(null);
    setBlocked((b) => { const n = new Set(b); if (n.has(d)) n.delete(d); else n.add(d); return n; });
  };

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const list = [...(blocked ?? [])].sort();
      await api('/api/admin/availability', 'PUT', { blocked: list });
      onSaved?.(list);
      setMsg({ ok: true, text: 'Kaydedildi.' });
    } catch (x) { setMsg({ ok: false, text: x instanceof ApiError && x.status === 401 ? 'Oturum süresi doldu, yeniden giriş yapın.' : 'Kaydedilemedi, tekrar deneyin.' }); }
    setSaving(false);
  };

  return (
    <>
      <h1 className="adm-h1">Takvim</h1>
      <p className="adm-sub">Dolu olduğunuz günlere tıklayın; ziyaretçiler bu günleri seçemez.</p>
      {msg && !msg.ok && <div className="adm-banner" role="alert">{msg.text}</div>}
      <div className="lq-card adm-card" style={{ maxWidth: 380 }}>
        {blocked === null ? <div className="adm-skel" style={{ height: 280 }} /> : <MonthCalendar lang="tr" onSelectDay={toggle} blockedDays={blocked} blockedClickable disabledLabel="Dolu" />}
        <p className="adm-meta" style={{ margin: '12px 0' }}>{blocked?.size ?? 0} dolu gün</p>
        <div className="adm-actions">
          <button type="button" onClick={save} disabled={saving || blocked === null} className="lq-btn-ghost adm-btn">{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
          {msg?.ok && <span role="status" className="adm-meta">{msg.text}</span>}
        </div>
      </div>
    </>
  );
}
