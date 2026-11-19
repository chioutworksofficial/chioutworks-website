import { CrmScene, WebsiteScene, InvoiceScene, QrScene } from './PackageScenes';
import AssistantScene from './AssistantScene';
import BookingScene from './BookingScene';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Lang } from '../../translations';
import { demoPath, pagePath } from '../../lib/routes';
import { POPULAR_UI } from '../i18n/popular';
import { PACKAGES_UI, PACKAGE_TEXT, PACKAGE_DEMO, PACKAGE_IDS, type PackageId, type FlowIcon } from '../i18n/packages';

/**
 * Package detail page (owner, 2026-11-19). The "how it works" flow is scroll-driven: scrolling down draws a cable from
 * box to box; when its plug reaches the next box, that box lights up, and data pulses keep running along connected
 * cables. When the last box is connected, everything glows and the result card opens with a light ring and sparks.
 * Colours: theme tokens only. Reduced motion: everything shown connected.
 */
const sv = (children: ReactNode) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
const ICON: Record<FlowIcon, ReactNode> = {
  user: sv(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>),
  globe: sv(<><circle cx="12" cy="12" r="9" /><path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>),
  phone: sv(<><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>),
  calendar: sv(<><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>),
  bell: sv(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>),
  check: sv(<><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16.5 9.5" /></>),
  chat: sv(<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z" />),
  inbox: sv(<><path d="M3 13l2.5-8h13L21 13v6H3z" /><path d="M3 13h5l1.5 2.5h5L16 13h5" /></>),
  doc: sv(<><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></>),
  mail: sv(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>),
  euro: sv(<><path d="M17.5 6.5a7 7 0 1 0 0 11" /><path d="M4 10h9M4 14h9" /></>),
  qr: sv(<><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" /><path d="M14 14h2v2h-2zM18 14h2M14 18h2v2M18 18v2h2" /></>),
  list: sv(<><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>),
  chart: sv(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>),
  spark: sv(<path d="M12 2.5 9.8 9.8 2.5 12l7.3 2.2L12 21.5l2.2-7.3 7.3-2.2-7.3-2.2z" />),
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const NOW: Record<Lang, string> = { tr: 'şimdi', en: 'now', de: 'jetzt', el: 'τώρα' };
const TIMES = ['09:41', '09:41', '09:42', '09:42'];

/** A realistic snippet: incoming message (avatar, bubble, time), reply (typing… then bubble with read ticks),
 *  notification card, or a record line. Appears when its box lights up. */
function Example({ lang, step, i, lit }: { lang: Lang; step: { ex: string; kind: 'in' | 'out' | 'chip' | 'note' }; i: number; lit: boolean }) {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!lit || step.kind !== 'out') { setTyping(false); return; }
    setTyping(true);
    const h = window.setTimeout(() => setTyping(false), 900);
    return () => window.clearTimeout(h);
  }, [lit, step.kind]);
  const name = (step.ex.split('—')[1] ?? '').trim();
  const text = step.ex.split('—')[0].trim();
  if (step.kind === 'in') return (
    <div className="pkg-ex pkg-ex--in">
      <span className="pkg-av">{name ? name[0] : '•'}</span>
      <div><div className="pkg-bubble">{text}</div><div className="pkg-meta">{name ? `${name} · ` : ''}{TIMES[i]}</div></div>
    </div>
  );
  if (step.kind === 'out') return (
    <div className="pkg-ex pkg-ex--out">
      {typing ? <div className="pkg-bubble pkg-bubble--out pkg-typing"><i /><i /><i /></div>
        : <div><div className="pkg-bubble pkg-bubble--out">{text}</div><div className="pkg-meta pkg-meta--out">{TIMES[i]} <span className="pkg-ticks">✓✓</span></div></div>}
    </div>
  );
  if (step.kind === 'chip') return (
    <div className="pkg-ex pkg-ex--chip">
      <span className="pkg-app">CW</span><span className="pkg-chip-t">{step.ex}</span><span className="pkg-meta">{NOW[lang]}</span>
    </div>
  );
  return <div className="pkg-ex pkg-ex--note"><span className="pkg-note-dot" />{step.ex}</div>;
}

function FlowCable({ f, from, to, carry }: { f: number; from: number; to: number; carry?: string }) {
  // Drawn in real pixels (measured width), so the "draw" animation and stroke widths stay exact on every screen.
  // Wide screens: curve from the centre of one box to the next (from/to in % of the width); phones: straight down.
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = w > 0 && w < 768;
  const h = narrow ? 70 : 110;
  const x1 = narrow ? w / 2 : (w * from) / 100, x2 = narrow ? w / 2 : (w * to) / 100;
  const d = `M${x1} 0 C${x1} ${h / 2}, ${x2} ${h / 2}, ${x2} ${h}`;
  const on = f >= 1;
  // the label rides on the tip of the cable while it is being drawn
  const pathRef = useRef<SVGPathElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const el = pathRef.current;
    if (!el || !carry || f <= 0.02 || f >= 1) { setTip(null); return; }
    const pt = el.getPointAtLength(el.getTotalLength() * f);
    setTip({ x: pt.x, y: pt.y });
  }, [f, w, carry]);
  return (
    <div ref={ref} className="pkg-cable" aria-hidden="true">
      {tip && <span className="pkg-carry" style={{ left: tip.x, top: tip.y }}>{carry}</span>}
      {w > 0 && (
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
          <path ref={pathRef} d={d} className="pkg-cable-bg" />
          <path d={d} className="pkg-cable-fg" pathLength={1} style={{ strokeDashoffset: 1 - f }} />
          {on && <path d={d} className="pkg-cable-flow" pathLength={1} />}
        </svg>
      )}
    </div>
  );
}

function Flow({ lang, id }: { lang: Lang; id: PackageId }) {
  const x = PACKAGE_TEXT[id][lang];
  const root = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);   // 0 … 1 scroll progress through the flow
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setP(1); return; }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = root.current; if (!el) return;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      // starts when the flow's top reaches 75% of the screen, ends when its bottom reaches 70%
      setP(clamp((vh * 0.75 - r.top) / Math.max(1, r.height - vh * 0.05)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const n = x.steps.length;
  const seg = p * n;                       // 0 … n: how far along the chain we are
  const lit = (i: number) => seg >= i + 0.15;
  const done = p >= 0.985;
  return (
    <div ref={root} className={`pkg-flow ${done ? 'is-done' : ''}`}>
      {x.steps.map((s, i) => (
        <div key={s.t} className="pkg-step">
          <div className={`pkg-node ${i % 2 ? 'is-right' : 'is-left'} ${lit(i) ? 'is-lit' : ''}`}>
            <div className="pkg-node-head">
              <span className="pkg-node-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="pkg-node-ic">{ICON[s.icon]}</span>
              <span className="pkg-node-t">{s.t}</span>
            </div>
            <Example lang={lang} step={s} i={i} lit={lit(i)} />
            <span className="pkg-plug" aria-hidden="true" />
          </div>
          {i < n - 1 && <FlowCable f={clamp(seg - i - 0.35)} from={i % 2 ? 75 : 25} to={i % 2 ? 25 : 75} carry={s.carry} />}
        </div>
      ))}
      <FlowCable f={clamp(seg - (n - 1) - 0.35)} from={(n - 1) % 2 ? 75 : 25} to={50} />
      <div className={`pkg-result ${done ? 'is-on' : ''}`}>
        <span className="pkg-result-ring" aria-hidden="true" />
        {Array.from({ length: 10 }, (_, k) => <i key={k} className="pkg-spark" style={{ ['--a' as string]: `${k * 36}deg`, ['--d' as string]: `${(k % 3) * 60}ms` }} aria-hidden="true" />)}
        <span className="pkg-result-ic">{ICON.check}</span>
        <span className="pkg-result-t">{x.result}</span>
      </div>
    </div>
  );
}

export default function PackagePage({ lang, id }: { lang: Lang; id: PackageId }) {
  const t = PACKAGES_UI[lang];
  const x = PACKAGE_TEXT[id][lang];
  const pop = POPULAR_UI[lang].items[PACKAGE_IDS.indexOf(id)];
  const demo = PACKAGE_DEMO[id];
  const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(26px, 3.2vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--lq-white)', margin: 0 };
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="deco-fade absolute inset-0 pointer-events-none">
          {[1400, 1000, 680].map((s) => <span key={s} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: s, height: s, transform: 'translate(-50%, -50%)', border: '1px solid var(--lq-line)' }} />)}
          <span className="absolute left-1/2 top-1/2 rounded-full" style={{ width: 860, height: 860, transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g1) 22%, transparent), transparent 65%)' }} />
        </div>
        <div className="relative mx-auto px-5 md:px-9 pt-24 md:pt-36 pb-10" style={{ maxWidth: 1100 }}>
          <Link to={`${pagePath(lang, 'home')}#popular`} className="inline-flex items-center gap-2 mb-8" style={{ fontSize: 13, color: 'var(--lq-silver)' }}><span aria-hidden="true">←</span>{t.back}</Link>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 500, lineHeight: 1.04, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: 0, maxWidth: 900 }}>{pop.title}</h1>
          <p className="mt-6" style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--lq-silver)', maxWidth: 680 }}>{x.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={pagePath(lang, 'contact')} className="pkg-btn pkg-btn--main">{t.cta} →</Link>
            {demo && <Link to={demoPath(lang, demo) + (id === 'qr' ? '?view=qr' : '')} className="pkg-btn">{t.demo} →</Link>}
            <span style={{ fontFamily: 'var(--lq-mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--lq-mist)', marginLeft: 6 }}>{t.time}: {pop.time}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto px-5 md:px-9 py-14" style={{ maxWidth: 1140 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)', textAlign: 'center', margin: 0 }}>{t.how}</p>
        <h2 className="mt-3" style={{ ...h2, textAlign: 'center' }}>{x.flowTitle}</h2>
        <div className="mt-12">{id === 'booking' ? <BookingScene lang={lang} /> : id === 'assistant' ? <AssistantScene lang={lang} /> : id === 'crm' ? <CrmScene lang={lang} /> : id === 'website' ? <WebsiteScene lang={lang} /> : id === 'invoices' ? <InvoiceScene lang={lang} /> : id === 'qr' ? <QrScene lang={lang} /> : <Flow lang={lang} id={id} />}</div>
      </section>

      <section className="mx-auto px-5 md:px-9 py-14" style={{ maxWidth: 1100 }}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="lq-card p-8">
            <h2 style={{ ...h2, fontSize: 24 }}>{t.incl}</h2>
            <ul className="mt-6 flex flex-col gap-4" style={{ margin: '24px 0 0', padding: 0, listStyle: 'none' }}>
              {x.included.map((w) => <li key={w} className="flex items-start gap-3" style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--lq-white)' }}><span aria-hidden="true" style={{ color: 'var(--c-lilac)' }}>✓</span>{w}</li>)}
            </ul>
          </div>
          <div className="lq-card p-8">
            <h2 style={{ ...h2, fontSize: 24 }}>{t.who}</h2>
            <ul className="mt-6 flex flex-col gap-4" style={{ margin: '24px 0 0', padding: 0, listStyle: 'none' }}>
              {x.forWhom.map((w) => <li key={w} className="flex items-start gap-3" style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--lq-silver)' }}><span aria-hidden="true" style={{ color: 'var(--c-lilac)' }}>→</span>{w}</li>)}
            </ul>
          </div>
        </div>
        <div className="lq-card lq-card--highlight mt-6 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h2 style={{ ...h2, fontSize: 26, color: 'var(--c-quartz)' }}>{t.cta}</h2>
            <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.6, color: 'color-mix(in srgb, var(--c-quartz) 78%, transparent)', maxWidth: 560 }}>{t.ctaSub}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={pagePath(lang, 'contact')} className="pkg-btn pkg-btn--main">{t.cta} →</Link>
            {demo && <Link to={demoPath(lang, demo) + (id === 'qr' ? '?view=qr' : '')} className="pkg-btn">{t.demo} →</Link>}
          </div>
        </div>
      </section>
    </>
  );
}
