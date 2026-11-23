import { NAV, FOOTER_LEGAL, RESOURCES_NAV, TOOLS_KICKER } from './navLabels';
import { openConsentSettings } from '../lib/consent';

import { CONSENT_UI } from './i18n/consent';
import { Link, useLocation } from 'react-router-dom';
import type { Lang } from '../translations';
import { LANGS, pagePath, switchLangPath, type PageKey } from '../lib/routes';
import { SITE_UI } from './i18n';
import { OUTRO_UI } from './i18n/outro';
import { FAQ_PAGE_UI } from './i18n/faqPage';
import Logo from './Logo';

// text sits over the globe outline — a soft dark halo keeps it readable without a visible box
const halo = '0 0 14px var(--c-void), 0 0 4px var(--c-void)';
const head = { fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--c-ash)', textShadow: halo };
const link = { fontSize: 15, color: 'color-mix(in srgb, var(--c-quartz) 88%, transparent)', textShadow: halo };

export default function SiteFooter({ lang, variant = 'default' }: { lang: Lang; variant?: 'default' | 'overlay' }) {
  const overlay = variant === 'overlay';
  const { pathname } = useLocation();
  const ui = SITE_UI[lang];
  const o = OUTRO_UI[lang];
  const nav: readonly string[] = NAV[lang];
  const pages: [PageKey, string][] = [['services', nav[0]], ['portfolio', nav[2]], ['resources', RESOURCES_NAV[lang]], ['tools', TOOLS_KICKER[lang]], ['demos', nav[3]], ['about', nav[1]], ['blog', ui.blogLabel], ['faq', FAQ_PAGE_UI[lang].nav], ['contact', nav[4]]];
  const legal: [PageKey, string][] = [['privacy', FOOTER_LEGAL[lang][0]], ['terms', FOOTER_LEGAL[lang][1]], ['docs', FOOTER_LEGAL[lang][2]]];

  return (
    <footer style={overlay ? { background: 'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--c-void) 55%, transparent) 30%, color-mix(in srgb, var(--c-void) 70%, transparent))' } : { background: 'transparent' }}>
      <div className={`mx-auto px-5 md:px-9 pb-6 ${overlay ? 'pt-6' : 'pt-12'}`} style={{ maxWidth: 1200 }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className={`md:col-span-5 ${overlay ? 'md:pt-14' : ''}`}>{/* desktop: logo sits inside the globe, not on its edge */}
            <Link to={pagePath(lang, 'home')} aria-label="Chioutworks"><Logo size={32} /></Link>
            <p className="mt-4 max-w-sm" style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--c-mist)', textShadow: halo }}>{o.tagline}</p>
            <ul className="mt-4 flex flex-col gap-2">
              <li><a href="https://www.linkedin.com/in/chousein-chiout-29345323a/" target="_blank" rel="noopener noreferrer" style={{ ...link, color: 'var(--lq-mist)', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 24 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>LinkedIn</a></li>
            </ul>
          </div>
          <nav aria-label={o.pages} className="md:col-span-4">
            <p className="mb-3" style={head}>{o.pages}</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
              {pages.map(([k, l]) => <li key={k}><Link to={pagePath(lang, k)} style={link}>{l}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label={o.legal} className="md:col-span-3">
            <p className="mb-3" style={head}>{o.legal}</p>
            <ul className="flex flex-col gap-2">
              {legal.map(([k, l]) => <li key={k}><Link to={pagePath(lang, k)} style={link}>{l}</Link></li>)}
              <li><Link to={`${pagePath(lang, 'docs')}#imprint`} style={link}>{FOOTER_LEGAL[lang][3]}</Link></li>
              <li><button type="button" onClick={openConsentSettings} style={{ ...link, cursor: 'pointer', textAlign: 'left', minHeight: 24, padding: '2px 0' }}>{CONSENT_UI[lang].footerLink}</button></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 pt-2 flex flex-wrap items-center justify-between gap-4">
          <p style={{ fontSize: 13, color: 'var(--c-mist)', textShadow: halo }}>© {new Date().getFullYear()} Chioutworks</p>
          <ul className="flex gap-4">
            {LANGS.map((l) => (
              <li key={l}>
                <Link to={switchLangPath(pathname, l)} hrefLang={l} aria-current={l === lang ? 'true' : undefined}
                  style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: l === lang ? 'var(--lq-white)' : 'var(--c-mist)' }}>{l}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
