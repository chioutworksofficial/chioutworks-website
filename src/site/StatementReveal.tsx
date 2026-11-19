import { SCRUB } from '../lib/smoothScroll';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '../translations';
import { STATEMENT_UI } from './i18n/statement';

gsap.registerPlugin(ScrollTrigger);

// x/y in %, depth 0 (far) … 1 (near), dot = tiny leading accent
const POS = [
  { x: 14, y: 16, d: 0.9, dot: true },
  { x: 58, y: 9, d: 0.35, dot: false },
  { x: 76, y: 20, d: 0.8, dot: false },
  { x: 5, y: 44, d: 0.3, dot: true },
  { x: 76, y: 48, d: 1, dot: false },
  { x: 20, y: 74, d: 0.6, dot: true },
  { x: 66, y: 76, d: 0.4, dot: false },
  { x: 38, y: 86, d: 0.85, dot: false },
  { x: 82, y: 84, d: 0.25, dot: true },
  { x: 30, y: 5, d: 0.7, dot: false },
];

const markStyle = { fontFamily: 'var(--lq-font)', fontWeight: 400, color: 'var(--lq-silver)', letterSpacing: '0' } as const;
const Dot = () => <span aria-hidden="true" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 9999, marginRight: 8, verticalAlign: 'middle', background: 'var(--lq-g2)' }} />;

type Override = { text?: string; caption?: string; items?: string[]; body?: string; id?: string };

export default function StatementReveal({ lang, text, caption, items, body, id = 'statement' }: { lang: Lang } & Override) {
  const ui = { ...STATEMENT_UI[lang], ...(text && { text }), ...(caption !== undefined && { caption }), ...(items && { items }) };
  const MARKS = POS.slice(0, ui.items.length).map((p, i) => ({ ...p, n: ui.items[i] }));
  // Phones: a ring with few labels looks empty, so short lists are repeated (copies are hidden on larger screens)
  const DUPS = MARKS.length && MARKS.length < 8 ? Array.from({ length: 8 - MARKS.length }, (_, i) => MARKS[i % MARKS.length]) : [];
  const root = useRef<HTMLElement>(null);
  const words = ui.text.split(' ').map((w) => {
    const em = w.includes('*');
    return { w: w.replace(/\*/g, ''), em };
  });

  const words_n = words.length;
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const words = (tl: gsap.core.Timeline) => {
        const cnt = Math.max(words_n, 2);
        tl.fromTo('.st-word', { opacity: 0.15, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', ease: 'none', stagger: (1.35 - 0.4) / (cnt - 1), duration: 0.4 }, 0);
        if (el.querySelector('.st-body')) tl.fromTo('.st-body', { opacity: 0.15, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', ease: 'none', duration: 0.4 }, 1.2);
      };
      // All screens (lialive style, owner 2026-11-16): the labels come in from the right and settle into a turning ring
      // around the centred text, while the words sharpen out of a blur. The ring scales with the screen.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const marks = gsap.utils.toArray<HTMLElement>('.st-mark');
        const n = marks.length;
        gsap.set(marks, { left: 0, top: 0, right: 'auto', xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const place = (p: number) => {
          const w = el.clientWidth, h = el.clientHeight;
          const inn = ease(Math.min(1, p / 0.35));                  // first third: the ring slides in from the right
          const wide = w >= 768;
          const cx = w * (0.5 + 1.1 * (1 - inn)), cy = h * 0.5, rx = wide ? Math.min(w * 0.4, 620) : w * 0.5, ry = h * (wide ? 0.38 : 0.36);
          const turn = 25 + p * 210;                                // keeps turning while scrolling
          marks.forEach((m, i) => {
            const rad = ((i / n) * 360 + turn) * (Math.PI / 180);
            const depth = (Math.sin(rad) + 1) / 2;                  // 1 = lower (front), 0 = upper (back)
            const out = 1 - Math.max(0, Math.min(1, (p - 0.86) / 0.12));   // labels leave before the section ends (no lone label left behind)
            gsap.set(m, { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad), scale: 0.88 + 0.22 * depth, opacity: (0.6 + 0.4 * depth) * (0.3 + 0.7 * inn) * out });
          });
        };
        const st = { p: 0 };
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=140%', pin: true, scrub: SCRUB, onRefresh: () => place(st.p) } });
        words(tl);
        tl.fromTo(st, { p: 0 }, { p: 1, ease: 'none', duration: 1.6, onUpdate: () => place(st.p) }, 0);
        if (el.querySelector('.st-caption')) tl.fromTo('.st-caption', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.2 }, 1.42);   // caption appears at the end
        tl.to({}, { duration: 0.2 });
        place(0);
      });
    }, el);
    return () => ctx.revert();
  }, [lang, ui.text]);

  return (
    <section ref={root} id={id} translate="no" className="st-root relative overflow-hidden h-[100svh]" >
      <div aria-hidden="true" className="st-marks absolute inset-0 pointer-events-none">
        {MARKS.map((m) => (
          <span
            key={m.n}
            data-d={m.d}
            className="st-mark absolute"
            style={{ ...markStyle, ...(m.x > 50 ? { right: `${100 - m.x - 8}%` } : { left: `${m.x}%` }), top: `${m.y}%`, fontSize: `clamp(${11 + m.d * 2}px, ${1 + m.d * 0.25}vw, ${15 + m.d * 3}px)`, whiteSpace: 'nowrap', opacity: 0.35 + m.d * 0.5, filter: `blur(${(1 - m.d) * 4}px)` }}
          >
            {m.dot && <Dot />}{m.n}
          </span>
        ))}
        {DUPS.map((m, i) => (
          <span key={`dup-${i}`} data-d={m.d} className="st-mark st-dup absolute"
            style={{ ...markStyle, left: `${m.x}%`, top: `${m.y}%`, fontSize: 14, whiteSpace: 'nowrap', opacity: 0 }}>
            {m.dot && <Dot />}{m.n}
          </span>
        ))}
      </div>

      <div className="st-inner relative mx-auto flex flex-col items-center justify-center px-5 md:px-9 h-full text-center" style={{ maxWidth: 1200 }}>
        <p style={{ maxWidth: 720, fontSize: 'clamp(28px, 3.2vw, 44px)', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>
          {words.map((x, i) => (
            <span
              key={i}
              className="st-word inline-block"
              style={x.em ? { fontStyle: 'italic', color: 'var(--lq-mist)', marginRight: '0.28em' } : { marginRight: '0.28em' }}
            >
              {x.w}
            </span>
          ))}
        </p>
        {body && <p className="st-body mt-8" style={{ maxWidth: 640, fontSize: 17, lineHeight: 1.7, color: 'var(--lq-mist)' }}>{body}</p>}
        {ui.caption && <p className="st-caption mt-8" style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' }}>{ui.caption}</p>}
        <ul className="st-list mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 list-none p-0">
          {MARKS.map((m) => (
            <li key={m.n} style={{ ...markStyle, fontSize: 16 }}>{m.dot && <Dot />}{m.n}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
