import { useState, type ReactNode } from 'react';
import type { ShellTab } from './AppShell';

// Shared "public website" frame for website-type demos (real estate, café, careers,
// logistics): browser chrome with a fictional domain, site header with brand + nav
// (each nav item is a page), content, footer. Text-free: labels come from the demo.

export interface SiteShellProps {
  domain: string;
  brand: { name: string; tagline: string; initials: string };
  pages: ShellTab[];
  /** Optional call-to-action button in the header that jumps to a page key */
  cta?: { label: string; page: string };
  footer: ReactNode;
  /** Controlled mode (optional): lets a demo switch pages programmatically */
  active?: string;
  onActiveChange?: (key: string) => void;
}

export default function SiteShell({ domain, brand, pages, cta, footer, active: activeProp, onActiveChange }: SiteShellProps) {
  const [inner, setInner] = useState(pages[0]?.key);
  const active = activeProp ?? inner;
  const go = (k: string) => { setInner(k); onActiveChange?.(k); };
  const page = pages.find((p) => p.key === active) ?? pages[0];

  return (
    <div className="rounded-3xl overflow-hidden min-h-[720px] flex flex-col"
      style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)', boxShadow: '0 40px 80px -48px var(--color-overlay)' }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: 'var(--background)', borderBottom: '1px solid var(--color-border-card)' }}>
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-border-card)' }} />)}
        </span>
        <span className="flex-1 max-w-md mx-auto text-xs rounded-lg px-3 py-1.5 text-center truncate"
          style={{ background: 'var(--color-surface-raised)', color: 'var(--color-ink-muted)', border: '1px solid var(--color-border-card)', fontFamily: '"IBM Plex Mono", monospace' }}>
          {domain}/{page.key === pages[0].key ? '' : page.key}
        </span>
        <span className="w-12" aria-hidden="true" />
      </div>

      {/* Site header */}
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 md:px-8 py-4" style={{ borderBottom: '1px solid var(--color-border-card)' }}>
        <button type="button" onClick={() => go(pages[0].key)} className="flex items-center gap-2.5 mr-auto">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: 'var(--color-ink-strongest)', color: 'var(--color-lime-300)' }}>
            {brand.initials}
          </span>
          <span className="text-left">
            <span className="block text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{brand.name}</span>
            <span className="block text-[11px]" style={{ color: 'var(--color-ink-muted)' }}>{brand.tagline}</span>
          </span>
        </button>
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full" aria-label={brand.name}>
          {pages.map((p) => {
            const on = p.key === page.key;
            return (
              <button key={p.key} type="button" onClick={() => go(p.key)} aria-current={on ? 'page' : undefined}
                className="relative rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap"
                style={{ color: on ? 'var(--color-ink-strongest)' : 'var(--color-ink-muted)', background: on ? 'var(--background)' : 'transparent' }}>
                {p.label}
                {!!p.badge && (
                  <span className="ml-1.5 inline-flex min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold items-center justify-center"
                    style={{ background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)' }}>{p.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
        {cta && (
          <button type="button" onClick={() => go(cta.page)} className="rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap"
            style={{ background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)' }}>
            {cta.label}
          </button>
        )}
      </header>

      <main className="flex-1 p-5 md:p-8" style={{ background: 'var(--background)' }}>{page.render()}</main>

      <footer className="px-5 md:px-8 py-5 text-xs" style={{ borderTop: '1px solid var(--color-border-card)', color: 'var(--color-ink-muted)' }}>
        {footer}
      </footer>
    </div>
  );
}
