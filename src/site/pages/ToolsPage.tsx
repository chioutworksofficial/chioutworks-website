import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Lang } from '../../translations';
import { AFFILIATES, type Affiliate } from '../../data/affiliates';
import { TOOLS_UI, TOOL_TEXT } from '../i18n/tools';
import { pagePath, toolPath } from '../../lib/routes';
import { usePageMeta } from '../../hooks/usePageMeta';

/**
 * "Tools I use": overview (cards) and one persuasive page per partner tool (owner, 2026-11-18).
 * The referral link is never in the page: the button goes to /api/go/<id>, the server counts the click (cookieless)
 * and redirects. Every page carries the German "Anzeige" disclosure next to the button.
 * Look (owner, 2026-11-19): 3D brand stage, tilting cards, scroll reveal; styles in theme.css (.tool-*).
 */
const visible = (a: Affiliate) => a.active || import.meta.env.DEV;

/** Scroll reveal for .tool-reveal, pointer tilt for .tool-tilt, pointer parallax for .tool-stage (desktop, motion allowed). */
function useToolFx() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveal = [...el.querySelectorAll<HTMLElement>('.tool-reveal')];
    if (reduced || !('IntersectionObserver' in window)) reveal.forEach((n) => n.classList.add('is-in'));
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io?.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;
    if (!reduced) reveal.forEach((n) => io?.observe(n));

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const offs: (() => void)[] = [];
    if (fine && !reduced) {
      el.querySelectorAll<HTMLElement>('.tool-tilt').forEach((n) => {
        const move = (e: PointerEvent) => {
          const r = n.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
          n.style.setProperty('--ry', `${(x - 0.5) * 8}deg`); n.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
          n.style.setProperty('--mx', `${x * 100}%`); n.style.setProperty('--my', `${y * 100}%`); n.style.setProperty('--glow', '1');
        };
        const leave = () => { n.style.setProperty('--rx', '0deg'); n.style.setProperty('--ry', '0deg'); n.style.setProperty('--glow', '0'); };
        n.addEventListener('pointermove', move); n.addEventListener('pointerleave', leave);
        offs.push(() => { n.removeEventListener('pointermove', move); n.removeEventListener('pointerleave', leave); });
      });
      el.querySelectorAll<HTMLElement>('.tool-stage').forEach((n) => {
        const inner = n.querySelector<HTMLElement>('.tool-stage-inner');
        if (!inner) return;
        const move = (e: PointerEvent) => {
          const r = n.getBoundingClientRect();
          inner.style.setProperty('--sry', `${((e.clientX - r.left) / r.width - 0.5) * 26 - 8}deg`);
          inner.style.setProperty('--srx', `${(0.5 - (e.clientY - r.top) / r.height) * 18 + 8}deg`);
        };
        const leave = () => { inner.style.removeProperty('--sry'); inner.style.removeProperty('--srx'); };
        n.addEventListener('pointermove', move); n.addEventListener('pointerleave', leave);
        offs.push(() => { n.removeEventListener('pointermove', move); n.removeEventListener('pointerleave', leave); });
      });
    }
    return () => { io?.disconnect(); offs.forEach((f) => f()); };
  }, []);
  return root;
}

export function BrandPill({ a, h = 76, w = 200 }: { a: Affiliate; h?: number; w?: number }) {
  return (
    <span className="inline-flex items-center justify-center shrink-0" aria-hidden="true"
      style={{ height: h, minWidth: w, padding: `0 ${Math.round(h * 0.4)}px`, borderRadius: Math.round(h * 0.26), background: a.pill, border: `1px solid ${a.pillEdge ?? 'transparent'}`,
        boxShadow: `0 30px 60px -24px color-mix(in srgb, ${a.pill} 70%, transparent), inset 0 1px 0 color-mix(in srgb, var(--c-quartz) 35%, transparent)` }}>
      <img src={a.logo} alt="" draggable={false} style={{ maxHeight: Math.round(h * 0.46), maxWidth: w * 0.78, width: 'auto', height: 'auto', display: 'block' }} />
    </span>
  );
}

/** Brand pill floating in a tilted 3D scene with orbits and (optionally) reason chips at different depths */
function BrandStage({ a, chips = [], card }: { a: Affiliate; chips?: string[]; card?: boolean }) {
  // Right-hand chips are anchored to the right edge so long labels (e.g. Greek) never run off the screen
  const pos: React.CSSProperties[] = [
    { left: '2%', top: '14%', ['--z' as string]: '110px' }, { right: '2%', top: '8%', ['--z' as string]: '40px' },
    { right: '4%', top: '78%', ['--z' as string]: '120px' }, { left: '0%', top: '74%', ['--z' as string]: '60px' },
  ];
  const far = [false, true, false, true];
  return (
    <div className={`tool-stage ${card ? 'tool-stage--card' : ''}`} aria-hidden="true">
      <div className="tool-stage-inner">
        <span className="tool-glow" style={{ background: a.pill }} />
        <span className="tool-orbit" style={{ width: card ? 300 : 520, height: card ? 300 : 520, ['--t' as string]: '34s' }}><i /></span>
        <span className="tool-orbit" style={{ width: card ? 200 : 360, height: card ? 200 : 360, ['--t' as string]: '22s', animationDirection: 'reverse' }}><i /></span>
        <span className="tool-shadow" />
        <span className="tool-float"><BrandPill a={a} h={card ? 72 : 104} w={card ? 190 : 270} /></span>
        {chips.slice(0, 4).map((c, i) => (
          <span key={c} className={`tool-chip ${far[i] ? 'tool-chip--far' : ''}`} style={{ ...pos[i], ['--d' as string]: `${-i * 1.6}s` }}>
            <b>✓</b>{c}
          </span>
        ))}
      </div>
    </div>
  );
}

const goHref = (a: Affiliate, lang: Lang, src: string) => `/api/go/${a.id}?l=${lang}&s=${src}`;

function GoButton({ a, lang, src, big }: { a: Affiliate; lang: Lang; src: string; big?: boolean }) {
  const t = TOOLS_UI[lang];
  return (
    <div className="flex flex-col items-start gap-3">
      <a href={goHref(a, lang, src)} target="_blank" rel="sponsored nofollow noopener" className="tool-go inline-flex items-center gap-3"
        style={{ padding: big ? '19px 32px' : '16px 26px', fontSize: big ? 17 : 15.5, fontWeight: 600, letterSpacing: '0.01em', background: 'var(--c-quartz)', color: 'var(--c-void)', fontFamily: 'var(--font-display)' }}>
        {t.go(a.name)}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
        <span className="sr-only">({t.goSub})</span>
      </a>
      <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--c-ash)', maxWidth: 400, margin: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-lilac)' }}>{t.adTag}</span><br />{t.disclosure}
      </p>
    </div>
  );
}

const kickerStyle: React.CSSProperties = { fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' };
const h2Style: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px, 3.4vw, 46px)', lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--lq-white)', margin: 0 };
const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` }) as React.CSSProperties;

function HeroRings() {
  return (
    <div aria-hidden="true" className="deco-fade absolute inset-0 pointer-events-none">
      {[1500, 1100, 760].map((s) => (
        <span key={s} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: s, height: s, transform: 'translate(-50%, -50%)', border: '1px solid var(--lq-line)' }} />
      ))}
      <span className="absolute left-1/2 top-1/2 rounded-full" style={{ width: 900, height: 900, transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g1) 22%, transparent), transparent 65%)' }} />
    </div>
  );
}

/** /:lang/<tools> */
export default function ToolsPage({ lang }: { lang: Lang }) {
  const t = TOOLS_UI[lang];
  const items = AFFILIATES.filter(visible);
  const root = useToolFx();
  return (
    <div ref={root}>
      <section className="relative overflow-hidden" style={{ minHeight: '62vh' }}>
        <HeroRings />
        <div className="relative mx-auto px-5 md:px-9 pt-32 md:pt-44 pb-12 md:pb-16 flex flex-col justify-end" style={{ maxWidth: 1200, minHeight: '62vh' }}>
          <p className="mb-6 tool-reveal" style={kickerStyle}>{t.kicker}</p>
          <h1 className="tool-reveal" style={{ ...d(80), fontSize: 'clamp(40px, 5.6vw, 88px)', fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', maxWidth: 1050 }}>{t.title}</h1>
          <p className="mt-8 tool-reveal" style={{ ...d(160), fontSize: 16, lineHeight: 1.55, color: 'var(--lq-silver)', maxWidth: 620 }}>{t.sub}</p>
        </div>
      </section>

      <section className="mx-auto px-5 md:px-9 pb-24" style={{ maxWidth: 1200 }}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => {
            const x = TOOL_TEXT[a.id][lang];
            return (
              <div key={a.id} className="tool-reveal" style={d(i * 120)}>
                <Link to={toolPath(lang, a.id)} className="lq-card tool-card tool-tilt flex flex-col overflow-hidden h-full" style={{ opacity: a.active ? 1 : 0.5 }}>
                  <div style={{ background: `radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, ${a.pill} 16%, transparent), transparent 70%)`, borderBottom: '1px solid var(--c-edge)' }}>
                    <BrandStage a={a} card />
                  </div>
                  <div className="flex flex-col gap-4 p-7 flex-1 tool-lift">
                    <p style={{ ...kickerStyle, fontSize: 11, color: 'var(--c-lilac)', margin: 0 }}>{x.category}</p>
                    <h2 style={{ ...h2Style, fontSize: 26 }}>{a.name}</h2>
                    <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--lq-silver)', margin: 0 }}>{x.short}</p>
                    <ul className="flex flex-col gap-2" style={{ margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
                      {x.reasons.slice(0, 3).map((r) => (
                        <li key={r.t} className="flex items-start gap-3" style={{ fontSize: 14, color: 'var(--lq-white)' }}>
                          <span aria-hidden="true" style={{ color: 'var(--c-lilac)', lineHeight: 1.4 }}>✓</span>{r.t}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto pt-4 inline-flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-lilac)' }}>
                      {t.cardCta}<span aria-hidden="true" className="tool-arrow">→</span>
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-10 tool-reveal" style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--c-ash)', maxWidth: 720 }}>{t.overviewNote}</p>
      </section>
    </div>
  );
}

/** /:lang/<tools>/:id */
export function ToolPage({ lang, a }: { lang: Lang; a: Affiliate }) {
  const t = TOOLS_UI[lang];
  const x = TOOL_TEXT[a.id][lang];
  usePageMeta(lang, 'tools', { title: `${x.tagline} — Chioutworks`, description: x.short, path: toolPath(lang, a.id), alt: (l) => toolPath(l, a.id), crumbs: [{ name: x.tagline, path: toolPath(lang, a.id) }] });
  const root = useToolFx();
  return (
    <div ref={root}>
      {/* Hero: why + 3D brand stage + button */}
      <section className="relative overflow-hidden">
        <HeroRings />
        <span aria-hidden="true" className="absolute pointer-events-none" style={{ right: '-10%', top: '10%', width: 700, height: 700, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.18, background: a.pill }} />
        <div className="relative mx-auto px-5 md:px-9 pt-24 md:pt-40 pb-12 md:pb-16" style={{ maxWidth: 1240 }}>
          <Link to={pagePath(lang, 'tools')} className="tool-reveal inline-flex items-center gap-2 mb-4 md:mb-10" style={{ fontSize: 13, color: 'var(--lq-silver)' }}>
            <span aria-hidden="true">←</span>{t.back}
          </Link>
          <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <p className="mb-6 tool-reveal" style={{ ...kickerStyle, ...d(60) }}>{x.category}</p>
              <h1 className="tool-reveal" style={{ ...d(120), fontSize: 'clamp(36px, 4.6vw, 70px)', fontWeight: 500, lineHeight: 1.04, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: 0 }}>{x.tagline}</h1>
              <p className="mt-8 tool-reveal" style={{ ...d(200), fontSize: 17, lineHeight: 1.6, color: 'var(--lq-silver)', maxWidth: 600 }}>{x.intro}</p>
              <div className="mt-10 tool-reveal" style={d(280)}><GoButton a={a} lang={lang} src="hero" /></div>
            </div>
            <div className="tool-reveal order-first lg:order-none" style={d(150)}>
              <BrandStage a={a} chips={x.reasons.map((r) => r.t)} />
            </div>
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="mx-auto px-5 md:px-9 py-20" style={{ maxWidth: 1200 }}>
        <h2 className="tool-reveal" style={h2Style}>{t.why}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {x.reasons.map((r, i) => (
            <div key={r.t} className="tool-reveal" style={d(i * 100)}>
              <div className="lq-card tool-tilt p-8 h-full">
                <span className="tool-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="tool-lift" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, color: 'var(--lq-white)', margin: '18px 0 0' }}>{r.t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--lq-silver)', margin: '12px 0 0' }}>{r.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who it suits / honest downsides */}
      <section className="mx-auto px-5 md:px-9 py-10" style={{ maxWidth: 1200 }}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="tool-reveal">
            <div className="lq-card tool-tilt p-8 h-full">
              <h2 style={{ ...h2Style, fontSize: 26 }}>{t.forWhom}</h2>
              <ul className="flex flex-col gap-4" style={{ margin: '24px 0 0', padding: 0, listStyle: 'none' }}>
                {x.forWhom.map((w) => <li key={w} className="flex items-start gap-3" style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--lq-white)' }}><span aria-hidden="true" style={{ color: 'var(--c-lilac)' }}>✓</span>{w}</li>)}
              </ul>
            </div>
          </div>
          <div className="tool-reveal" style={d(120)}>
            <div className="lq-card tool-tilt p-8 h-full">
              <h2 style={{ ...h2Style, fontSize: 26 }}>{t.honest}</h2>
              <ul className="flex flex-col gap-4" style={{ margin: '24px 0 0', padding: 0, listStyle: 'none' }}>
                {x.cons.map((c) => <li key={c} className="flex items-start gap-3" style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--lq-silver)' }}><span aria-hidden="true" style={{ color: 'var(--c-ash)' }}>–</span>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Steps with a growing rail */}
      <section className="mx-auto px-5 md:px-9 py-20" style={{ maxWidth: 1200 }}>
        <h2 className="tool-reveal" style={h2Style}>{t.start}</h2>
        <div className="relative mt-10 tool-reveal">
          <span aria-hidden="true" className="tool-rail hidden md:block" />
          <ol className="relative grid gap-5 md:grid-cols-3" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {x.steps.map((s, i) => (
              <li key={s} className="lq-card tool-tilt p-7 flex flex-col gap-4">
                <span className="inline-flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: 'var(--c-abyss)', border: '1px solid var(--c-lilac)', color: 'var(--c-lilac)', fontFamily: 'var(--font-mono)', fontSize: 14, boxShadow: '0 0 24px -6px var(--c-lilac)' }}>{i + 1}</span>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lq-white)', margin: 0 }}>{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto px-5 md:px-9 py-10" style={{ maxWidth: 900 }}>
        <h2 className="tool-reveal" style={h2Style}>{t.faq}</h2>
        <div className="mt-8 flex flex-col gap-3">
          {x.faq.map((f, i) => (
            <details key={f.q} className="lq-card tool-faq tool-reveal" style={{ ...d(i * 80), padding: '20px 24px' }}>
              <summary style={{ cursor: 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--lq-white)', listStyle: 'none' }}>{f.q}</summary>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lq-silver)', margin: '12px 0 0' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section className="mx-auto px-5 md:px-9 py-20" style={{ maxWidth: 1200 }}>
        <div className="tool-reveal">
          <div className="lq-card lq-card--highlight tool-border relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center" style={{ padding: 'clamp(32px, 5vw, 64px)' }}>
            <div>
              <h2 style={{ ...h2Style, color: 'var(--c-quartz)' }}>{t.finalTitle(a.name)}</h2>
              <p className="mt-5" style={{ fontSize: 16, lineHeight: 1.6, color: 'color-mix(in srgb, var(--c-quartz) 78%, transparent)', maxWidth: 560 }}>{t.finalSub}</p>
              <div className="mt-8"><GoButton a={a} lang={lang} src="final" big /></div>
            </div>
            <div className="hidden lg:block" style={{ width: 360 }}><BrandStage a={a} card /></div>
          </div>
        </div>
        <div className="mt-6 tool-reveal" style={d(120)}>
          <div className="lq-card p-7 flex flex-col md:flex-row md:items-center gap-5 justify-between">
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--lq-white)', margin: 0 }}>{t.helpTitle}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--lq-silver)', margin: '8px 0 0', maxWidth: 640 }}>{t.helpSub}</p>
            </div>
            <Link to={pagePath(lang, 'contact')} className="inline-flex items-center gap-2 shrink-0" style={{ padding: '12px 22px', fontSize: 14, fontWeight: 600, border: '1px solid var(--c-lilac)', color: 'var(--lq-white)' }}>{t.helpCta}<span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
