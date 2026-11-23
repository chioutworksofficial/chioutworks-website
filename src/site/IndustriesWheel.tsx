import { SCRUB } from '../lib/smoothScroll';
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '../translations';
import { liveDemos, previewDemos } from '../data/demos';
import { demoText } from '../components/demos/demoText';
import { demoPath, pagePath } from '../lib/routes';
import Logo from './Logo';
import { INDUSTRIES_UI } from './i18n/industries';

gsap.registerPlugin(ScrollTrigger);

const SIZE = 1500; // wheel diameter
const CY = -55; // wheel centre, px from section top
const DISC = 620; // centre disc diameter
const RC = 535; // content radius

/** Same wheel on every screen: desktop at full size, tablets and phones scaled so the centre card stays readable. */
const geo = () => {
  const vw = typeof window === 'undefined' ? 1440 : window.innerWidth;
  const k = vw >= 1280 ? 1 : vw >= 768 ? 0.85 : 0.7;
  return { k, size: SIZE * k, c: (SIZE * k) / 2, cy: CY * k, disc: DISC * k, rc: RC * k, card: vw >= 1280 ? 230 : vw >= 768 ? 210 : 190, reach: vw >= 768 ? 2 : 1, head: vw >= 768 ? 96 : 52, small: vw < 768 };
};

const svg = (d: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lq-white)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const ICONS: Record<string, ReactNode> = {
  demokuafor: svg(<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.1 8.1 20 20M8.1 15.9 20 4" /></>),
  demoklinik: svg(<><path d="M5 3v6a4 4 0 0 0 8 0V3" /><path d="M9 13v2a5 5 0 0 0 10 0v-1" /><circle cx="19" cy="12" r="2" /></>),
  demotemizlik: svg(<><path d="M14 3 11 11" /><path d="M7 11h8l2 4H5z" /><path d="M5 15 4 21h14l-1-6" /></>),
  democrm: svg(<path d="M3 4h18l-7 8v7l-4 2v-9z" />),
  demoemlak: svg(<><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>),
  demokafe: svg(<><path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M16 9h2a2 2 0 0 1 0 5h-2" /><path d="M8 3v2M12 3v2" /></>),
  demosadakat: svg(<><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12" /><path d="M12 8C9 8 8 4 10 4s2 4 2 4Zm0 0c3 0 4-4 2-4s-2 4-2 4Z" /></>),
  demokariyer: svg(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" /></>),
  demolojistik: svg(<><path d="M2 6h12v10H2zM14 9h4l3 3v4h-7" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>),
  demoozel: svg(<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></>),
};

const Arrow = ({ dir }: { dir: 'l' | 'r' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'l' ? <path d="M19 12H5m6-6-6 6 6 6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
  </svg>
);

interface Item { slug: string; to: string; name: string; desc: string }

function Card({ it, wheel }: { it: Item; wheel?: boolean }) {
  return (
    <>
      <span className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 10, background: 'color-mix(in srgb, var(--lq-kelp) 70%, transparent)', border: '1px solid var(--lq-line-strong)' }}>
        {ICONS[it.slug] ?? ICONS.demoozel}
      </span>
      <span style={{ marginTop: 14, fontSize: 16, fontWeight: 500, lineHeight: 1.25, color: 'var(--lq-white)' }}>{it.name}</span>
      <span aria-hidden="true" style={{ marginTop: 10, width: 28, height: 1, background: 'var(--lq-gradient)' }} />
      <span style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: 'var(--lq-silver)', display: '-webkit-box', WebkitLineClamp: wheel ? 3 : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{it.desc}</span>
    </>
  );
}

export default function IndustriesWheel({ lang }: { lang: Lang }) {
  const ui = INDUSTRIES_UI[lang];
  const items: Item[] = [...liveDemos(lang), ...previewDemos(lang).filter((d) => d.openable)].map((d) => ({ slug: d.slug, to: demoPath(lang, d.slug), ...demoText(lang, d.slug) }));
  items.push({ slug: 'demoozel', to: pagePath(lang, 'contact'), ...demoText(lang, 'demoozel') });
  const n = items.length;
  const a = 360 / n;
  const h = ((a / 2) * Math.PI) / 180;

  const root = useRef<HTMLElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const st = useRef({ step: 0, scroll: 0 });
  const trig = useRef<ScrollTrigger | null>(null);
  const reduce = useRef(false);
  const [idx, setIdx] = useState(0);
  const [g, setG] = useState(geo);
  useLayoutEffect(() => {
    let t = 0;
    const on = () => { window.clearTimeout(t); t = window.setTimeout(() => setG((o) => { const n2 = geo(); return n2.k === o.k && n2.card === o.card ? o : n2; }), 150); };
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('resize', on); window.clearTimeout(t); };
  }, []);

  const apply = useCallback(() => {
    const w = st.current.step * a + st.current.scroll;
    wheel.current?.style.setProperty('--w', `${w}deg`);
    setIdx(Math.round(w / a));
  }, [a]);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: reduce)', () => { reduce.current = true; return () => { reduce.current = false; }; });
      mm.add('(prefers-reduced-motion: no-preference)', () => {   // same scroll-driven wheel on phones, tablets and desktop
        const tw = gsap.fromTo(st.current, { scroll: 0 }, {
          scroll: (n - 3) * a, ease: 'none', onUpdate: apply,
          scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${Math.round(window.innerHeight * (window.innerWidth >= 1280 ? 3.4 : 2.1))}`   /* slower turn (owner, 2026-11-23; was 2.65 / 1.6); phones/tablets stay a bit shorter */, pin: true, scrub: SCRUB, invalidateOnRefresh: true },
        });
        trig.current = tw.scrollTrigger ?? null;
        return () => { trig.current = null; };
      });
    }, root);
    apply();
    return () => { ctx.revert(); mm.revert(); };
  }, [apply, n, a, g.k]);

  const go = (d: 1 | -1) => {
    const t = trig.current;
    if (t) {
      const y = window.scrollY;
      if (d > 0 ? y < t.end - 1 : y > t.start + 1) {
        const slice = (t.end - t.start) / (n - 3);
        window.scrollTo({ top: Math.min(t.end, Math.max(t.start, y + d * slice)), behavior: 'smooth' });
        return;
      }
    }
    const target = Math.round(st.current.step) + d;
    if (reduce.current) { st.current.step = target; apply(); return; }
    gsap.to(st.current, { step: target, duration: 0.9, ease: 'power3.inOut', overwrite: 'auto', onUpdate: apply });
  };

  const off = (i: number) => (((i - idx + n / 2) % n) + n) % n - n / 2;

  const btn = 'inline-flex items-center gap-2 px-3 py-3 rounded-[6px] focus-visible:outline focus-visible:outline-1';
  const btnStyle = { fontSize: 12, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lq-white)' } as const;

  return (
    <section id="industries" ref={root} aria-label={ui.label} className="relative overflow-hidden">
      {/* Wheel (all screens; scaled by g) */}
      <div className="relative" style={{ height: g.k === 1 ? 'max(810px, 100svh)' : 'max(560px, 100svh)' }}>
        <div ref={wheel} aria-hidden="false" className="absolute" style={{ width: g.size, height: g.size, left: '50%', top: g.cy - g.c, marginLeft: -g.c, ['--w' as string]: '0deg', transform: 'rotate(var(--w))', willChange: 'transform' }}>
          {items.map((it, i) => {
            const phi = i * a;
            const r = (v: number) => 820 * g.k * v;
            const p = (ang: number) => `${g.c + r(Math.sin(ang))}px ${g.c + r(Math.cos(ang))}px`;
            const ph = (phi * Math.PI) / 180;
            const visible = Math.abs(off(i)) <= g.reach;
            return (
              <div key={it.slug}>
                <div className="absolute inset-0" style={{
                  borderRadius: '50%',
                  clipPath: `polygon(${g.c}px ${g.c}px, ${p(ph - h)}, ${p(ph + h)})`,
                  background: `radial-gradient(circle at 50% 50%, var(--lq-deep) 0, var(--lq-kelp) 42%, color-mix(in srgb, var(--lq-g2) ${i % 2 ? 22 : 30}%, var(--lq-kelp)) 100%)`,
                }} />
                <span aria-hidden="true" className="absolute" style={{ left: g.c, top: g.c, width: 1, height: g.c, background: 'var(--lq-line)', transformOrigin: 'top', transform: `rotate(${-(phi + a / 2)}deg)` }} />
                <Link
                  to={it.to}
                  tabIndex={visible ? 0 : -1}
                  aria-hidden={visible ? undefined : true}
                  className="absolute flex flex-col items-center text-center focus-visible:outline focus-visible:outline-1"
                  style={{ left: g.c + g.rc * Math.sin(ph), top: g.c + g.rc * Math.cos(ph), width: g.card, transform: 'translate(-50%, -50%) rotate(calc(var(--w) * -1))', transformOrigin: 'center', opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .4s' }}
                >
                  <Card it={it} wheel />
                </Link>
              </div>
            );
          })}
          <span aria-hidden="true" className="absolute rounded-full" style={{ inset: 0, border: '1px solid var(--lq-line-strong)' }} />
        </div>

        {/* phones/tablets: soft top edge so the wheel blends into the hero above (no visible cut line) */}
        {g.k < 1 && <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: g.small ? 170 : 220, background: 'linear-gradient(to bottom, var(--c-void) 0%, color-mix(in srgb, var(--c-void) 70%, transparent) 45%, transparent 100%)', zIndex: 1 }} />}

        {/* centre disc */}
        <div aria-hidden="true" className="absolute rounded-full" style={{ width: g.disc, height: g.disc, left: '50%', top: g.cy - g.disc / 2, marginLeft: -g.disc / 2, background: 'var(--lq-abyss)', border: '1px solid var(--lq-line)' }} />
        <div className="absolute left-1/2 flex flex-col items-center -translate-x-1/2" style={{ top: g.head, gap: g.small ? 14 : 28, zIndex: 2 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' }}>{ui.kicker}</p>
          <Logo size={g.small ? 34 : 44} stacked />
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' }}>{ui.sub}</p>
        </div>

        <button type="button" onClick={() => go(-1)} className={`${btn} absolute ${g.small ? 'left-3' : 'left-9'}`} style={{ ...btnStyle, bottom: g.k === 1 ? 28 : 'calc(20px + env(safe-area-inset-bottom, 0px))' }}><Arrow dir="l" />{ui.prev}</button>
        <button type="button" onClick={() => go(1)} className={`${btn} absolute ${g.small ? 'right-3' : 'right-9'}`} style={{ ...btnStyle, bottom: g.k === 1 ? 28 : 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>{ui.next}<Arrow dir="r" /></button>
      </div>

    </section>
  );
}
