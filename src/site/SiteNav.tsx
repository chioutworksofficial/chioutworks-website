import { FAQ_PAGE_UI } from './i18n/faqPage';
import { RESOURCES_UI } from './i18n/resources';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ModeToggle from './ModeToggle';
import { T, type Lang } from '../translations';
import { demoText } from '../components/demos/demoText';
import { liveDemos, previewDemos } from '../data/demos';
import { LANGS, pagePath, solutionPath, switchLangPath, type PageKey } from '../lib/routes';
import { SITE_UI } from './i18n';
import { SOLUTION_UI } from './i18n/solutionDeck';
import Logo from './Logo';
import { getLenis } from '../lib/smoothScroll';

/** Top bar: logo · MENU + · "Get in touch" pill. MENU opens a right-hand slide-in panel with pages, demos and languages. */
export default function SiteNav({ lang }: { lang: Lang }) {
  const ui = SITE_UI[lang];
  const nav = T[lang].nav; // [services, about, portfolio, demos, contact]
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<'live' | 'apps' | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => panelRef.current?.focus(), 60);
    const toggle = toggleRef.current;
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); window.clearTimeout(t); toggle?.focus(); };
  }, [open]);

  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const els = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href],button') ?? []).filter((el) => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden');
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (document.activeElement === panelRef.current) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const pages: { key: PageKey; label: string }[] = [
    { key: 'services', label: nav[0] },
    { key: 'portfolio', label: nav[2] },
    { key: 'resources', label: RESOURCES_UI[lang].nav },
    { key: 'demos', label: nav[3] },
    { key: 'about', label: nav[1] },
    { key: 'blog', label: ui.blogLabel },
    { key: 'faq', label: FAQ_PAGE_UI[lang].nav },
    { key: 'contact', label: nav[4] },
  ];

  const bigStyle: React.CSSProperties = { fontSize: 'clamp(20px, 1.9vw, 26px)', fontWeight: 400, textTransform: 'none', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)', lineHeight: 1.25 };
  const subStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0, lineHeight: 1.25, color: 'color-mix(in srgb, var(--c-quartz) 78%, transparent)' };
  const labelStyle: React.CSSProperties = { fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--lq-white)' };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[60] transition-colors duration-300"
        style={{ background: 'transparent' /* lialive: header never forms a bar; content scrolls under it */ }}>
        <div className="site-nav-row mx-auto flex items-center justify-between gap-4 px-5 md:px-9 h-[76px]">
          <Link to={pagePath(lang, 'home')} aria-label="Chioutworks" className="site-nav-logo shrink-0" onClick={(e) => {
            setOpen(false);
            if (pathname.replace(/\/+$/, '') !== pagePath(lang, 'home').replace(/\/+$/, '')) return; // other page: router navigates, App resets scroll to top
            e.preventDefault();
            const l = getLenis();
            if (l) l.scrollTo(0, { duration: 1.2 });
            else window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
          }}>
            <span className="nav-logo-desk"><Logo size={30} /></span>
            <span className="nav-logo-mob"><Logo size={22} stacked /></span>
          </Link>
          <div className="site-nav-right flex items-center gap-3 md:gap-6">
            <button type="button" ref={toggleRef} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-menu"
              className="site-nav-menu flex items-center gap-2.5 py-2" style={labelStyle}>
              <span className="site-nav-menu-label">{open ? ui.close : ui.menu}</span>
              <span aria-hidden="true" className="relative w-3.5 h-3.5 inline-block transition-transform duration-300" style={{ transform: open ? 'rotate(135deg)' : 'none' }}>
                <span className="absolute left-0 top-1/2 w-full h-[1.5px] -translate-y-1/2" style={{ background: 'var(--lq-white)' }} />
                <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2"
                  style={{ background: 'var(--lq-white)', }} />
              </span>
            </button>
            <Link to={pagePath(lang, 'contact')} aria-label={ui.getInTouch} className="site-nav-cta inline-flex shrink-0 items-center rounded-full transition-colors hover:[background:color-mix(in_srgb,var(--c-lilac)_14%,transparent)]" style={{ border: '1.5px solid var(--c-lilac)' }}>
              <span className="rounded-full px-5 py-2.5" style={{ ...labelStyle, color: 'var(--c-quartz)' }}><span className="nav-cta-long">{ui.getInTouch}</span><span className="nav-cta-short" aria-hidden="true">{ui.getInTouchShort}</span></span>
            </Link>
            <ModeToggle lang={lang} />
          </div>
        </div>
      </header>

      {/* Click catcher (page stays visible, no dimming) */}
      <div className="fixed inset-0 z-[54]" onClick={() => setOpen(false)} aria-hidden="true" style={{ display: open ? 'block' : 'none' }} />

      {/* Right slide-in panel */}
      <div id="site-menu" ref={panelRef} role="dialog" aria-modal="true" data-lenis-prevent aria-label={ui.menu} inert={!open} tabIndex={-1}
        onKeyDown={onPanelKey}
        className="site-menu-panel fixed top-0 right-0 bottom-0 z-[55] flex flex-col overflow-y-auto"
        style={{
          width: 'min(440px, 100vw)',
          background: 'linear-gradient(to bottom, var(--lq-deep), color-mix(in srgb, var(--lq-kelp) 70%, var(--lq-deep)))',
          borderLeft: '1px solid var(--lq-line)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          visibility: open ? 'visible' : 'hidden',
          transition: `transform .5s cubic-bezier(.22,1,.36,1), visibility 0s linear ${open ? '0s' : '.5s'}`,
        }}>
        <style>{`.site-menu-panel a:focus-visible,.site-menu-panel button:focus-visible{outline:2px solid var(--lq-g2);outline-offset:4px;border-radius:6px}.site-menu-panel .sub{transition:color .2s}.site-menu-panel .sub:hover{color:var(--c-quartz)!important}.site-menu-panel{outline:none}`}</style>
        <nav className="flex-1 px-7 md:pl-14 md:pr-9 pt-[100px] pb-6" aria-label={ui.pages}>
          <ul>
            {pages.map((p, i) => {
              const liStyle = (idx: number): React.CSSProperties => ({ transition: 'transform .5s, opacity .5s', transitionDelay: `${open ? 150 + idx * 40 : 0}ms`, transform: open ? 'none' : 'translateY(24px)', opacity: open ? 1 : 0 });
              if (p.key === 'demos') {
                const groups = [
                  { id: 'live' as const, label: p.label, items: liveDemos(lang) },
                  { id: 'apps' as const, label: SOLUTION_UI[lang].appsGroup, items: previewDemos(lang) },
                ];
                return groups.map((g, gi) => {
                  const expanded = group === g.id;
                  return (
                    <li key={g.id} style={liStyle(i + gi)}>
                      <button type="button" onClick={() => setGroup(expanded ? null : g.id)} aria-expanded={expanded} aria-controls={`site-menu-${g.id}`}
                        className="flex items-center gap-4 py-[0.3em] text-left" style={{ ...bigStyle, color: expanded ? 'var(--lq-g2)' : 'var(--lq-white)', transition: 'color .2s' }}>
                        {g.label}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                          style={{ color: 'var(--lq-silver)', transition: 'transform .3s', transform: expanded ? 'rotate(180deg)' : 'none' }}><path d="m6 9 6 6 6-6" /></svg>
                      </button>
                      <div id={`site-menu-${g.id}`} style={{ display: 'grid', gridTemplateRows: expanded ? '1fr' : '0fr', transition: 'grid-template-rows .35s ease' }}>
                        <ul className="overflow-hidden" style={{ marginLeft: 26, borderLeft: '1px solid var(--c-hairline)', paddingLeft: 0, visibility: expanded ? 'visible' : 'hidden', transition: `visibility 0s linear ${expanded ? '0s' : '.35s'}` }}>
                          {g.items.map((d) => (
                            <li key={d.slug}>
                              <Link to={solutionPath(lang, d.slug)} className="sub inline-block py-1.5 pl-5" style={subStyle}>{demoText(lang, d.slug).name}</Link>
                            </li>
                          ))}
                          <li className="pb-2" aria-hidden="true" />
                        </ul>
                      </div>
                    </li>
                  );
                });
              }
              const active = pathname === pagePath(lang, p.key);
              const itemStyle = (hover: boolean): React.CSSProperties => ({ ...bigStyle, color: active ? 'var(--lq-lavender)' : hover ? 'var(--lq-g2)' : 'var(--lq-white)', transform: hover ? 'translateX(6px)' : 'none', transition: 'color .2s, transform .25s' });
              return (
                <li key={p.key} style={liStyle(i + 1)}>
                  <Link to={pagePath(lang, p.key)} className="inline-block py-[0.3em]" style={itemStyle(hovered === p.key)}
                    onMouseEnter={() => setHovered(p.key)} onMouseLeave={() => setHovered(null)}>
                    {p.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="px-7 md:pl-20 md:pr-9 pb-8">
          <div className="h-px mb-5" style={{ background: 'var(--lq-line)' }} />
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2" role="group" aria-label={ui.language}>
              {LANGS.map((l) => (
                <Link key={l} to={switchLangPath(pathname, l)} aria-current={l === lang ? 'true' : undefined} hrefLang={l}
                  className="rounded-[6px] px-3 py-1.5"
                  style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, background: l === lang ? 'var(--lq-kelp)' : 'transparent', color: l === lang ? 'var(--lq-white)' : 'var(--lq-silver)', border: `1px solid ${l === lang ? 'var(--lq-line-strong)' : 'transparent'}` }}>
                  {l}
                </Link>
              ))}
            </div>
            <a href="https://www.linkedin.com/in/chousein-chiout-29345323a/" target="_blank" rel="noopener noreferrer" className="text-sm inline-flex items-center gap-2 py-1" style={{ color: 'var(--lq-silver)', minHeight: 24 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>LinkedIn</a>
          </div>
        </div>
      </div>
    </>
  );
}
