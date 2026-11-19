import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Lang } from '../translations';
import { packagePath, pagePath } from '../lib/routes';
import { PACKAGE_IDS } from './i18n/packages';
import { POPULAR_UI } from './i18n/popular';
import { lqCard } from './lqCard';
import BtnArrow from './BtnArrow';

const sv = (children: ReactNode) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const ICONS: ReactNode[] = [
  sv(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M17 5.5a3 3 0 0 1 0 5.5M21.5 20c-.3-2.4-1.6-4-3.5-4.8" /></>),
  sv(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 6.5h.01M10 6.5h.01" /></>),
  sv(<><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 3v4M16 3v4M3.5 10h17M8.5 15l2.5 2.5 4.5-4.5" /></>),
  sv(<><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></>),
  sv(<><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></>),
  sv(<><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" /><path d="M14 14h2v2h-2zM18 14h2M14 18h2v2M18 18v2h2" /></>),
];

export default function PopularPackages({ lang }: { lang: Lang }) {
  const ui = POPULAR_UI[lang];
  return (
    <section id="popular" className="relative" >
      <div className="mx-auto px-5 md:px-9 py-24" style={{ maxWidth: 1200 }}>
        <div className="text-center mx-auto" style={{ maxWidth: 720 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' }}>{ui.kicker}</p>
          <h2 className="mt-5" style={{ fontSize: 'clamp(32px, 3.1vw, 44px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{ui.title}</h2>
          <p className="mt-5" style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--lq-silver)' }}>{ui.intro}</p>
        </div>

        <ul className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ui.items.map((it, i) => {
            // Every card opens its own package page (owner, 2026-11-19); live demos are opened from there
            const isDemo = false;
            const to = packagePath(lang, PACKAGE_IDS[i]);
            return (
              <li key={it.title} className="flex">
                <Link
                  to={to}
                  className={`${lqCard(i)} group flex flex-col w-full p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
                  style={{ outlineColor: 'var(--lq-g2)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span style={{ color: 'var(--lq-g2)' }}>{ICONS[i]}</span>
                    {i < 3 && (
                      <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid var(--lq-line-strong)', borderRadius: 999, padding: '4px 10px', color: 'var(--lq-mist)' }}>{ui.pill}</span>
                    )}
                  </div>
                  <h3 className="mt-6" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{it.title}</h3>
                  <p className="mt-3" style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--lq-silver)' }}>{it.desc}</p>
                  <p className="mt-5" style={{ fontFamily: 'var(--lq-mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--lq-mist)' }}>{ui.delivery}: {it.time}</p>
                  <span className="mt-auto pt-6" style={{ fontSize: 14, fontWeight: 500, color: 'var(--lq-white)' }}>{isDemo ? ui.demo : ui.details} →</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-6" style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--c-ash)', textAlign: 'center', maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>{ui.timeNote}</p>

        <div className="mt-14 flex flex-col items-center gap-5 text-center">
          <p style={{ fontSize: 18, color: 'var(--lq-mist)' }}>{ui.elseTitle}</p>
          <Link to={pagePath(lang, 'contact')} className="lq-btn-ghost">{ui.elseCta}<BtnArrow /></Link>
        </div>
      </div>
    </section>
  );
}
