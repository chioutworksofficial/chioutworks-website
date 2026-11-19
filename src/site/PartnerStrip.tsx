import { useEffect, useRef, useState } from 'react';
import { AFFILIATES, type Affiliate } from '../data/affiliates';
import { PARTNERS_UI } from './i18n/partners';
import type { Lang } from '../translations';
import { toolPath } from '../lib/routes';

const visible = (a: Affiliate) => a.active || import.meta.env.DEV;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const MIN_RING = 7; // fewer partners are repeated so the orbit never looks empty
const MIN_RING_PHONE = 5; // phones: fewer, bigger pills so nothing is cramped or cut off (owner, 2026-11-19)

/**
 * Partner / affiliate logos orbiting a headline (inspired by lialive.ai's "Trusted by" section, own implementation).
 * The section pins for a while; scrolling turns the ring. Logos in the back are smaller, dimmer and blurred,
 * logos in front are sharp and clickable. The headline words sharpen out of a blur as the section comes in.
 * No own background (blends with the sections around it). Reduced motion: a static, centred list.
 */
export default function PartnerStrip({ lang }: { lang: Lang }) {
  const t = PARTNERS_UI[lang];
  const items = AFFILIATES.filter(visible);
  const root = useRef<HTMLElement>(null);
  const logos = useRef<(HTMLElement | null)[]>([]);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches); on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = () => setPhone(mq.matches); on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const minRing = phone ? MIN_RING_PHONE : MIN_RING;
  const ring = items.length ? Array.from({ length: Math.max(items.length, Math.ceil(minRing / items.length) * items.length) }, (_, i) => items[i % items.length]) : [];
  const titleWords = t.kicker.split(' ');

  useEffect(() => {
    const sec = root.current;
    if (!sec || reduced || !ring.length) return;
    let raf = 0;
    const frame = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight, vw = window.innerWidth;
      const p = clamp(-r.top / Math.max(1, r.height - vh));          // 0..1 while pinned
      const enter = clamp((vh - r.top) / vh);                         // 0..1 while scrolling in
      // Headline: starts blurred; while the section is pinned, scrolling sharpens it word by word (first ~55% of the pin)
      const nw = words.current.length;
      words.current.forEach((w, i) => {
        if (!w) return;
        const start = (i / nw) * 0.4, k = clamp((p - start) / 0.15);
        w.style.opacity = String(0.1 + 0.9 * k);
        w.style.filter = k >= 1 ? 'none' : `blur(${(1 - k) * 18}px)`;
        w.style.transform = `translateY(${(1 - k) * 10}px)`;
      });
      const n = logos.current.length;
      // All screens (lialive style, owner 2026-11-16): the logos slide in from the right and form a turning ring around the
      // centred headline; no blur on the logos, depth via size and opacity. The ring scales with the screen.
      {
        const wide = vw >= 768;
        const inn = 1 - Math.pow(1 - clamp(p / 0.3), 3);
        // Phones: the ring stays inside the screen (half a pill from each edge) and above the affiliate note at the bottom
        const cx = vw * (0.5 + 1.1 * (1 - inn)), cy = vh * (wide ? 0.5 : 0.46), rx = wide ? Math.min(vw * 0.4, 620) : Math.max(90, vw * 0.5 - 70), ry = vh * (wide ? 0.38 : 0.29);
        const turn = 25 + p * 230;
        const fadeEnd = 1 - clamp((p - 0.92) / 0.08);
        const noteEl = sec.querySelector<HTMLElement>('.partner-note');
        if (noteEl) noteEl.style.opacity = String(clamp((p - 0.8) / 0.12));   // affiliate note shows up at the end of the scroll
        logos.current.forEach((el, i) => {
          if (!el) return;
          const rad = ((i / n) * 360 + turn) * (Math.PI / 180);
          const depth = (Math.sin(rad) + 1) / 2;                     // 1 = lower (front), 0 = upper (back)
          const o = ((wide ? 0.35 : 0.55) + (wide ? 0.65 : 0.45) * depth) * (0.25 + 0.75 * inn) * fadeEnd * clamp(enter * 1.4);
          el.style.transform = `translate(-50%, -50%) translate3d(${cx + rx * Math.cos(rad) - vw / 2}px, ${cy + ry * Math.sin(rad) - vh / 2}px, 0) scale(${wide ? 0.72 + 0.3 * depth : 0.7 + 0.18 * depth})`;
          el.style.opacity = String(o);
          el.style.filter = 'none';
          el.style.zIndex = String(depth > 0.5 ? 30 : 5);
          el.style.pointerEvents = depth > 0.6 && o > 0.5 ? 'auto' : 'none';
        });
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [reduced, ring.length]);

  if (!items.length) return null;

  const Logo = ({ a, dup, i }: { a: Affiliate; dup: boolean; i?: number }) => {
    const inner = a.logo
      ? <img src={a.logo} alt={dup ? '' : a.name} loading="lazy" decoding="async" draggable={false} style={{ maxHeight: 40, maxWidth: 160, width: 'auto', height: 'auto', display: 'block' }} />
      : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--c-abyss)' }}>{a.name}</span>;
    const style: React.CSSProperties = reduced ? {} : { position: 'absolute', left: '50%', top: '50%', willChange: 'transform, filter, opacity', opacity: 0 };
    const ref = (el: HTMLElement | null) => { if (i !== undefined) logos.current[i] = el; };
    // Brand pill: each partner as the brand presents itself (owner, 2026-11-18); a click opens its "why I use it" page on this site
    const brand: React.CSSProperties = { background: a.pill, borderColor: a.pillEdge ?? 'transparent' };
    const common = { ref, className: 'partner-logo', style: { ...style, ...brand, opacity: reduced ? (a.active ? 1 : 0.45) : style.opacity } };
    return <a {...common} href={toolPath(lang, a.id)} aria-label={dup ? undefined : `${a.name}: ${t.more}`} aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined}>{inner}</a>;
  };

  const headline = (
    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(28px, 4.2vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--c-quartz)', textAlign: 'center', maxWidth: 760, margin: 0, padding: '0 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.26em' }}>
      {titleWords.map((w, i) => (
        <span key={i} ref={(el) => { words.current[i] = el; }} style={{ display: 'inline-block', opacity: reduced ? 1 : 0.1, filter: reduced ? 'none' : 'blur(18px)', ...(i % 3 === 2 ? { fontStyle: 'italic', fontWeight: 300, color: 'var(--c-lilac)' } : {}) }}>{w}</span>))}
    </h2>
  );
  const note = <p style={{ textAlign: 'center', fontSize: 12, lineHeight: 1.6, color: 'var(--c-ash)', maxWidth: 620, margin: 0, padding: '0 16px' }}>{t.note}</p>;

  if (reduced) return (
    <section aria-label={t.label} style={{ padding: '96px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
      {headline}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, padding: '0 16px' }}>{items.map((a, i) => <Logo key={i} a={a} dup={false} />)}</div>
      {note}
    </section>
  );

  return (
    <section ref={root} aria-label={t.label} style={{ position: 'relative', height: '380vh' }}>
      <div className="partner-stage" style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>{headline}</div>
        {ring.map((a, i) => <Logo key={i} a={a} i={i} dup={i >= items.length} />)}
        <div className="partner-note" style={{ position: 'absolute', left: 0, right: 0, bottom: 28, zIndex: 40, display: 'flex', justifyContent: 'center' }}>{note}</div>
      </div>
    </section>
  );
}
