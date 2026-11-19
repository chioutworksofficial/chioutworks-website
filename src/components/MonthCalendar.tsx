import { useState } from 'react';
import { T, type Lang } from '../translations';

interface Props {
  /** Currently selected day, 'YYYY-MM-DD', or null. */
  selected?: string | null;
  onSelectDay: (date: string) => void;
  /** Days that should render disabled (booking mode: closed/full days). */
  disabledDays?: Set<string>;
  /** Days that should render marked/highlighted (admin mode: closed days). */
  markedDays?: Set<string>;
  disabledLabel?: string;
  /** Owner-blocked days: hatched + struck. Clickable only if blockedClickable (admin toggle). */
  blockedDays?: Set<string>;
  blockedClickable?: boolean;
  lang?: Lang;
}

function toKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function MonthCalendar({ selected, onSelectDay, disabledDays, markedDays, disabledLabel, blockedDays, blockedClickable, lang = 'en' }: Props) {
  const u = T[lang].ui;
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          aria-label={u.prevMonth} className="cw-cal-nav"
          style={{
            width: 30, height: 30, borderRadius: 6, border: '1px solid var(--c-hairline)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--c-quartz)',
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-quartz)' }}>
          {cursor.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          aria-label={u.nextMonth} className="cw-cal-nav"
          style={{
            width: 30, height: 30, borderRadius: 6, border: '1px solid var(--c-hairline)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--c-quartz)',
          }}
        >
          ›
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: 'narrow' })).map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 500, color: 'var(--c-ash)', padding: '2px 0' }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = toKey(year, month, day);
          const isPast = key < todayKey;
          const isClosed = disabledDays?.has(key) ?? false;
          const isMarked = markedDays?.has(key) ?? false;
          const isBlocked = blockedDays?.has(key) ?? false;
          const disabled = isPast || isClosed || (isBlocked && !blockedClickable);
          const isSelected = selected === key;
          const isToday = key === todayKey;

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              title={isClosed || isBlocked ? disabledLabel : undefined}
              onClick={() => onSelectDay(key)}
              style={{
                aspectRatio: '1',
                borderRadius: 9999,
                border: isSelected ? '1px solid var(--c-lilac)' : isToday ? '1px solid var(--c-hairline)' : '1px solid transparent',
                background: isBlocked
                  ? 'repeating-linear-gradient(45deg, color-mix(in srgb, var(--c-slate) 35%, transparent) 0 3px, transparent 3px 6px)'
                  : isSelected
                  ? 'color-mix(in srgb, var(--c-lilac) 18%, transparent)'
                  : isMarked
                  ? 'color-mix(in srgb, var(--c-quartz) 12%, transparent)'
                  : 'transparent',
                color: isSelected
                  ? 'var(--c-quartz)'
                  : isMarked
                  ? 'var(--c-quartz)'
                  : disabled
                  ? 'var(--c-ash)'
                  : 'var(--c-mist)',
                fontSize: 12.5,
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                textDecoration: disabled || isBlocked ? 'line-through' : 'none',
                textDecorationColor: disabled ? 'var(--cal-strike, var(--c-hairline))' : undefined,
                textDecorationThickness: disabled ? '1.5px' : undefined,
                opacity: disabled && !isBlocked ? 0.7 : 1,
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
