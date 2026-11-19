import { useState, useEffect, useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { T, type Lang } from '../translations';
import { GoogleGeminiEffect } from './ui/google-gemini-effect';
import { pagePath } from '../lib/routes';

interface HeroSectionProps { lang: Lang; }

export default function HeroSection({ lang }: HeroSectionProps) {
  const d = T[lang];
  const [typeText, setTypeText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [ready, setReady] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Tighter range [0, 0.4] = daha hızlı açılır (eski [0, 0.7] idi)
  const p0 = useTransform(scrollYProgress, [0, 0.4], [0.05, 1]);
  const p1 = useTransform(scrollYProgress, [0, 0.4], [0.04, 1]);
  const p2 = useTransform(scrollYProgress, [0, 0.4], [0.03, 1]);
  const p3 = useTransform(scrollYProgress, [0, 0.4], [0.02, 1]);
  const p4 = useTransform(scrollYProgress, [0, 0.4], [0.01, 1]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const words = d.hero.typeWords;
    const cur = words[wordIdx % words.length];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx <= cur.length) {
      t = setTimeout(() => { setTypeText(cur.slice(0, charIdx)); setCharIdx(c => c + 1); }, 62 + Math.random() * 38);
    } else if (!deleting && charIdx > cur.length) {
      t = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && charIdx > 0) {
      t = setTimeout(() => { setTypeText(cur.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 28);
    } else {
      setDeleting(false);
      setWordIdx(w => w + 1);
    }
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, d.hero.typeWords]);

  const fade = (i: number): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
  });

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        background: 'var(--background)',
        paddingTop: 'max(14dvh, 108px)',
        paddingBottom: 120,
        paddingLeft: 24,
        paddingRight: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Gemini scroll-drawn paths (background) ── */}
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}>
        <GoogleGeminiEffect pathLengths={[p0, p1, p2, p3, p4]} />
      </div>

      {/* ── Soft blobs behind content ── */}
      <div aria-hidden className="blob-1" style={{
        position: 'absolute', top: -220, right: -140,
        width: 620, height: 620, borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 40%, rgba(187,244,81,0.22) 0%, rgba(187,244,81,0.06) 50%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden className="blob-2" style={{
        position: 'absolute', bottom: -60, left: -140,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle at 60% 60%, rgba(187,244,81,0.15) 0%, rgba(187,244,81,0.04) 55%, transparent 72%)',
        filter: 'blur(48px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Content ── */}
      <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Status badge */}
        <div style={fade(0)}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px 6px 10px', borderRadius: 9999, marginBottom: 32,
            border: '1px solid var(--color-border-card)',
            background: 'rgba(251,251,248,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            fontSize: 13, fontWeight: 500,
            color: 'var(--color-ink-muted)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--color-feature-success)', flexShrink: 0,
              boxShadow: '0 0 0 3px rgba(45,164,78,0.18)',
            }} />
            {d.hero.tag}
          </span>
        </div>

        {/* H1 line 1 */}
        <div style={fade(1)}>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(42px, 6.8vw, 80px)',
            letterSpacing: '-0.048em', lineHeight: 1.02,
            color: 'var(--color-ink-strongest)',
            margin: '0 0 6px',
          }}>
            {d.hero.h1a}
          </h1>
        </div>

        {/* H1 line 2 — typewriter */}
        <div style={{ ...fade(2), marginBottom: 36 }}>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(42px, 6.8vw, 80px)',
            letterSpacing: '-0.048em', lineHeight: 1.02,
            margin: 0,
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--color-lime-300)',
              borderRadius: 16,
              padding: '3px 24px 8px',
              minWidth: 'min(290px, 52vw)',
              boxShadow: '0 6px 40px rgba(187,244,81,0.3), 0 2px 12px rgba(187,244,81,0.2)',
            }}>
              <span style={{ color: '#111' }}>{typeText}</span>
              <span style={{
                display: 'inline-block', width: 3, height: '0.75em',
                background: '#111', borderRadius: 2, marginLeft: 5,
                animation: 'cursor-blink 0.9s step-end infinite',
              }} />
            </span>
          </h1>
        </div>

        {/* Subtext */}
        <div style={{ ...fade(3), marginBottom: 40 }}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(16px, 1.9vw, 18.5px)',
            fontWeight: 400, lineHeight: 1.72,
            color: 'var(--color-ink-muted)', margin: 0,
            maxWidth: 560,
          }}>
            {d.hero.sub}
          </p>
        </div>

        {/* CTAs */}
        <div style={{ ...fade(4), display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 68 }}>
          <a href={pagePath(lang, 'contact')} className="btn-primary" style={{ fontSize: 15 }}>
            {d.hero.btn1}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href={pagePath(lang, 'portfolio')} className="btn-secondary" style={{ fontSize: 15 }}>
            {d.hero.btn2}
          </a>
          <a
            href="https://www.linkedin.com/in/chousein-chiout-29345323a/"
            target="_blank" rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: 15 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.55 }}>
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            {d.hero.linkedin}
          </a>
        </div>

        {/* Stats bar */}
        <div style={fade(5)}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${d.stats.length}, 1fr)`,
            gap: 1,
            background: 'var(--color-border-card)',
            borderRadius: 18, overflow: 'hidden',
            border: '1px solid var(--color-border-card)',
            boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
          }}>
            {d.stats.map(([num, label], i) => (
              <div key={i} style={{
                background: 'rgba(251,251,248,0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '22px 22px',
              }}>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(26px, 3vw, 38px)',
                  letterSpacing: '-0.04em',
                  color: 'var(--color-ink-strongest)',
                  lineHeight: 1, marginBottom: 5,
                }}>
                  {num}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', lineHeight: 1.3 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fade into next section ── */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 100,
        background: 'linear-gradient(to bottom, transparent 0%, #fff 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
    </section>
  );
}
