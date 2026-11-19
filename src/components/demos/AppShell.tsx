import { useState, type ReactNode } from 'react';
import type { Lang } from '../../translations';

// Shared "real product" frame for every live demo: sidebar with business brand,
// navigation, top bar with date, search, notifications and user. Text-free:
// every label is passed in by the demo (from its own i18n file).

export type IconName =
  | 'home' | 'calendar' | 'users' | 'scissors' | 'chat' | 'chart' | 'settings' | 'card' | 'inbox'
  | 'file' | 'team' | 'tag' | 'star' | 'bell' | 'search' | 'clipboard' | 'money' | 'pill' | 'broom'
  | 'gift' | 'megaphone' | 'pipeline' | 'phone' | 'clock' | 'check' | 'plus' | 'sparkle' | 'whatsapp' | 'instagram' | 'globe';

const PATHS: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  calendar: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM22 19v-1a4 4 0 0 0-3-3.87M16 3.13a3.5 3.5 0 0 1 0 6.75',
  scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  card: 'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM2 10h20',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13L22 12v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
  team: 'M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 20v-1a4 4 0 0 0-2-3.5',
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
  star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  clipboard: 'M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1zM16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h4',
  money: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  pill: 'm10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7zM8.5 8.5l7 7',
  broom: 'M19 3 9.5 12.5M8 11l5 5-3 5H3l1-6zM6 21l2-4',
  gift: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
  pipeline: 'M3 4h18M6 9h12M9 14h6M11 19h2',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  check: 'M20 6 9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z',
  whatsapp: 'M3 21l1.6-5A9 9 0 1 1 8 19.4zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z',
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.5 6.5h.01',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
};

export function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

export interface ShellTab {
  key: string;
  label: string;
  icon: IconName;
  badge?: number;
  render: () => ReactNode;
}

export interface ShellNotification {
  text: string;
  time: string;
}

export interface AppShellProps {
  lang: Lang;
  brand: { name: string; tagline: string; initials: string };
  user: { name: string; role: string };
  tabs: ShellTab[];
  searchPlaceholder: string;
  notificationsTitle: string;
  notifications: ShellNotification[];
}

const LOCALES: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };

const initialsOf = (name: string) => name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export default function AppShell({ lang, brand, user, tabs, searchPlaceholder, notificationsTitle, notifications }: AppShellProps) {
  const [active, setActive] = useState(tabs[0]?.key);
  const [bellOpen, setBellOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];
  const today = new Date().toLocaleDateString(LOCALES[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[720px]"
      style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)', boxShadow: '0 40px 80px -48px var(--color-overlay)' }}>
      {/* Sidebar */}
      <aside className="md:w-56 shrink-0 flex md:flex-col" style={{ background: 'var(--color-surface-raised)', borderRight: '1px solid var(--color-border-card)' }}>
        <div className="hidden md:flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--color-border-card)' }}>
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: 'var(--color-ink-strongest)', color: 'var(--color-lime-300)' }}>
            {brand.initials}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{brand.name}</span>
            <span className="block text-[11px] truncate" style={{ color: 'var(--color-ink-muted)' }}>{brand.tagline}</span>
          </span>
        </div>
        <nav className="demo-tabs flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto md:overflow-visible w-full" aria-label={brand.name}>
          {tabs.map((t) => {
            const on = t.key === tab.key;
            return (
              <button key={t.key} type="button" onClick={() => setActive(t.key)} aria-current={on ? 'page' : undefined}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
                style={on ? { background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)' } : { color: 'var(--color-ink-muted)' }}>
                <Icon name={t.icon} size={17} />
                <span className="flex-1 text-left">{t.label}</span>
                {!!t.badge && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: on ? 'var(--color-ink-strongest)' : 'var(--color-lime-soft)', color: on ? 'var(--color-lime-300)' : 'var(--color-ink-strongest)' }}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="hidden md:flex mt-auto items-center gap-2.5 px-4 py-4" style={{ borderTop: '1px solid var(--color-border-card)' }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-lime-soft)', color: 'var(--color-ink-strongest)' }}>
            {initialsOf(user.name)}
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{user.name}</span>
            <span className="block text-[11px] truncate" style={{ color: 'var(--color-ink-muted)' }}>{user.role}</span>
          </span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-3 px-4 md:px-6 py-3" style={{ background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border-card)' }}>
          <div className="min-w-0 mr-auto">
            <p className="text-[11px] capitalize" style={{ color: 'var(--color-ink-muted)' }}>{today}</p>
            <h2 className="text-base font-bold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{tab.label}</h2>
          </div>
          <label className="hidden lg:flex items-center gap-2 rounded-xl px-3 py-2 w-64" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)', color: 'var(--color-ink-muted)' }}>
            <Icon name="search" size={15} />
            <input className="bg-transparent outline-none text-sm flex-1 min-w-0" placeholder={searchPlaceholder} style={{ color: 'var(--color-ink-strongest)' }} />
          </label>
          <div className="relative">
            <button type="button" onClick={() => { setBellOpen(!bellOpen); setSeen(true); }} aria-label={notificationsTitle}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strongest)' }}>
              <Icon name="bell" size={17} />
              {!seen && notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--color-feature-error)', color: 'var(--color-surface-raised)' }}>{notifications.length}</span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-11 z-30 w-72 rounded-2xl p-2 shadow-xl" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)' }}>
                <p className="px-2 py-1.5 text-xs font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{notificationsTitle}</p>
                <ul>
                  {notifications.map((n, i) => (
                    <li key={i} className="flex gap-2 rounded-xl px-2 py-2" style={{ borderTop: i ? '1px solid var(--color-border-card)' : 'none' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--color-feature-success)' }} />
                      <span className="min-w-0">
                        <span className="block text-xs leading-snug" style={{ color: 'var(--color-ink-strongest)' }}>{n.text}</span>
                        <span className="block text-[10px]" style={{ color: 'var(--color-ink-muted)' }}>{n.time}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <span className="w-9 h-9 rounded-full flex md:hidden items-center justify-center text-xs font-bold" style={{ background: 'var(--color-lime-soft)', color: 'var(--color-ink-strongest)' }}>
            {initialsOf(user.name)}
          </span>
        </div>
        <div className="flex-1 p-4 md:p-6 overflow-x-hidden">{tab.render()}</div>
      </div>
    </div>
  );
}

/** Simple, dependency-free bar chart (values in any unit; labels shown under bars) */
export function BarChart({ data, format, height = 160, highlightLast = true }: {
  data: { label: string; value: number }[];
  format?: (n: number) => string;
  height?: number;
  highlightLast?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height: height + 40 }}>
      {data.map((d, i) => {
        const h = Math.max(4, Math.round((d.value / max) * height));
        const hl = highlightLast && i === data.length - 1;
        return (
          <div key={d.label + i} className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1.5 h-full">
            <span className="text-[10px] font-semibold truncate max-w-full" style={{ color: 'var(--color-ink-muted)' }}>{format ? format(d.value) : d.value}</span>
            <div className="w-full rounded-t-lg" style={{ height: h, background: hl ? 'var(--color-lime-300)' : 'var(--color-ink-strongest)', opacity: hl ? 1 : 0.82 }} />
            <span className="text-[11px] truncate max-w-full" style={{ color: 'var(--color-ink-muted)' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Horizontal progress bar list, e.g. "top services" */
export function RankList({ items, format }: { items: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{it.label}</span>
            <span style={{ color: 'var(--color-ink-muted)' }}>{format ? format(it.value) : it.value}</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: 'var(--color-border-card)' }}>
            <div className="h-2 rounded-full" style={{ width: `${(it.value / max) * 100}%`, background: 'var(--color-ink-strongest)' }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Avatar with initials */
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36, background: 'var(--color-lime-soft)', color: 'var(--color-ink-strongest)' }}>
      {initialsOf(name)}
    </span>
  );
}
