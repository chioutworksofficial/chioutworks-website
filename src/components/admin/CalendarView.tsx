import type { Tab } from '../../pages/Admin';
import AvailabilityPanel from './AvailabilityPanel';
import CalendarEntries from './CalendarEntries';
import AppointmentsView from './AppointmentsView';

// Single calendar place: blocked days, follow-up entries and (browser-local) appointments as sections.
export type CalSection = 'blocked' | 'followups' | 'appointments';
const SECTIONS: { key: CalSection; label: string; hint: string }[] = [
  { key: 'blocked', label: 'Dolu günler', hint: 'Dolu olduğunuz günlere tıklayın; ziyaretçiler bu günleri seçemez.' },
  { key: 'followups', label: 'Takip girdileri', hint: 'Kimliği belli adaylar için gün gün takip listesi (sesli asistan, sohbet, form).' },
  { key: 'appointments', label: 'Randevular', hint: 'Yalnızca bu tarayıcıda saklanan randevu kayıtları; sunucudaki Voice Agent randevuları Voice Agent bölümündedir.' },
];

export default function CalendarView({ section, onSection, onBlocked, go }: {
  section: CalSection; onSection: (s: CalSection) => void; onBlocked: (d: string[]) => void; go: (t: Tab, id?: string) => void;
}) {
  const cur = SECTIONS.find((s) => s.key === section)!;
  return (
    <>
      <h1 className="adm-h1">Takvim</h1>
      <p className="adm-sub">{cur.hint}</p>
      <div className="adm-chips" role="tablist" aria-label="Takvim bölümleri">
        {SECTIONS.map((s) => <button key={s.key} type="button" role="tab" aria-selected={section === s.key} className="adm-chip" aria-pressed={section === s.key} onClick={() => { onSection(s.key); }}>{s.label}</button>)}
      </div>
      <div className="adm-embed" key={section}>
        {section === 'blocked' && <AvailabilityPanel onSaved={onBlocked} />}
        {section === 'followups' && <CalendarEntries go={go} />}
        {section === 'appointments' && <AppointmentsView />}
      </div>
    </>
  );
}
