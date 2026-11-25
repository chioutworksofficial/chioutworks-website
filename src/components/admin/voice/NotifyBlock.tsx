import { useEffect, useState } from 'react';
import { api, fmtDate } from '../api';
import { useNote } from '../bulk';
import { msgOf } from './shared';
import type { NotifyRes } from './types';

const KINDS: ['hot' | 'abuse' | 'booked', string][] = [['hot', 'Sıcak sonuç'], ['abuse', 'Kötüye kullanım şüphesi'], ['booked', 'Randevu alındı']];

export default function NotifyBlock({ version, onChange }: { version: number; onChange: () => void }) {
  const [d, setD] = useState<NotifyRes | null>(null);
  const note = useNote();
  const load = () => api<NotifyRes>('/api/admin/voice-agent/notify').then(setD).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [version]);
  if (!d) return null;
  const set = async (k: 'hot' | 'abuse' | 'booked') => {
    const s = { ...d.settings, [k]: !d.settings[k] };
    try { await api('/api/admin/voice-agent/notify', 'PUT', s); setD({ ...d, settings: s }); } catch (x) { note.show({ ok: false, text: msgOf(x, 'Kaydedilemedi.') }); }
  };
  const seen = async () => { try { await api('/api/admin/voice-agent/notify/seen', 'POST'); await load(); onChange(); } catch (x) { note.show({ ok: false, text: msgOf(x, 'İşaretlenemedi.') }); } };
  return (
    <section id="vo-notify">
      <div className="adm-head"><h2>Bildirimler</h2>{d.unseen > 0 && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={seen}>{d.unseen} yeni · okundu işaretle</button>}</div>
      {note.el}
      <p className="adm-meta">Seçilen olaylarda Voice Agent sekmesinde rozet görünür. {d.mailConfigured ? 'Ayrıca Hatalar bölümündeki bildirim adresine kişisel veri içermeyen kısa bir e-posta gider (aynı olay türü için en çok 10 dakikada bir).' : 'E-posta yok: bildirim e-postası için e-posta kurulumu ve Hatalar bölümünde bir bildirim adresi gerekir; şimdilik yalnızca rozet çalışır.'}</p>
      <div className="adm-chips" role="group" aria-label="Bildirim olayları">{KINDS.map(([k, l]) => <button key={k} type="button" className="adm-chip" aria-pressed={d.settings[k]} onClick={() => set(k)}>{l}</button>)}</div>
      {d.alerts.length > 0 ? <ul className="vo-links">{d.alerts.slice(0, 8).map((a) => <li key={a.id}>{fmtDate(a.at)} · {a.label}{a.seen ? '' : ' · yeni'}</li>)}</ul> : <p className="adm-meta">Henüz bildirim yok.</p>}
    </section>
  );
}
