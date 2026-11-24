import { useEffect, useState } from 'react';
import { api, fmtDay } from './api';
import type { Tab } from '../../pages/Admin';

// Takvim: takip girdileri (server/calendar.ts). Yalnızca kimliği belli adaylar (sesli asistan, sohbet, form); anonim oturumlar ve bülten/site kontrolü girdi oluşturmaz.
interface Entry { id: string; day: string; kind: 'hot' | 'call' | 'remind'; source: string; title: string; refTab: 'requests' | 'voice'; refId: string; preferredChannel: string; score: string }
const CH: Record<string, string> = { email: 'E-posta', phone: 'Telefon (aranabilir)', whatsapp: 'WhatsApp' };

export default function CalendarEntries({ go }: { go: (t: Tab, id?: string) => void }) {
  const [items, setItems] = useState<Entry[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { api<{ entries: Entry[] }>('/api/admin/calendar-entries').then((r) => setItems(r.entries)).catch(() => setErr(true)); }, []);
  const days = [...new Set((items ?? []).map((e) => e.day))].sort().reverse();
  return (
    <section style={{ marginTop: 28 }} aria-label="Takip girdileri">
      <h2 className="adm-h1" style={{ fontSize: 20 }}>Takip girdileri</h2>
      <p className="adm-sub">Kimliği belli adaylar için gün gün takip listesi.</p>
      {err && <div className="adm-banner" role="alert">Girdiler yüklenemedi.</div>}
      {items && !items.length && <div className="adm-empty">Henüz takip girdisi yok</div>}
      {days.map((d) => (
        <div key={d} style={{ marginBottom: 16 }}>
          <div className="adm-meta" style={{ marginBottom: 6 }}>{fmtDay(d)}</div>
          <div className="adm-list">{(items ?? []).filter((e) => e.day === d).map((e) => (
            <div key={e.id} className="lq-card adm-card">
              <div className="adm-head"><span className="adm-name">{e.title}</span>
                <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="adm-chip tag">{e.score}</span>
                  <span className="adm-chip">{CH[e.preferredChannel] ?? e.preferredChannel}</span>
                </span></div>
              <div className="adm-actions" style={{ marginTop: 8 }}><button className="lq-btn-ghost adm-btn sm" onClick={() => go(e.refTab, e.refId)}>Kaydı aç</button></div>
            </div>))}
          </div>
        </div>))}
    </section>
  );
}
