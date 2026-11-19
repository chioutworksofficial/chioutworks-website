import { useEffect, useRef, useState } from 'react';
import { T, type Lang } from '../translations';
import { pagePath } from '../lib/routes';

interface Props { lang: Lang; }

const TEXT: Record<Lang, string> = {
  en: 'I combine technical precision with creative thinking to build automated systems and digital products that give businesses back their most valuable resource — time.',
  de: 'Ich verbinde technische Präzision mit kreativem Denken, um automatisierte Systeme zu entwickeln, die Unternehmen ihre wertvollste Ressource zurückgeben — Zeit.',
  tr: 'Teknik hassasiyeti yaratıcı düşünceyle birleştirerek, işletmelere en değerli kaynakları olan zamanı geri veren otomatik sistemler inşa ediyorum.',
  el: 'Συνδυάζω τεχνική ακρίβεια με δημιουργική σκέψη για να κατασκευάζω αυτοματοποιημένα συστήματα που επιστρέφουν στις επιχειρήσεις τον πολυτιμότερο πόρο τους — τον χρόνο.',
};

export default function ScrollRevealSection({ lang }: Props) {
  const text = TEXT[lang];
  const words = text.split(' ');
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const wh = window.innerHeight;
      const raw = (wh * 0.85 - rect.top) / (wh * 0.65);
      setProgress(Math.max(0, Math.min(1, raw)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const focusPull = reducedMotion ? 1 : progress;
  const ctaOpacity = reducedMotion ? 1 : Math.max(0, Math.min(1, (progress - 0.8) / 0.2));

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#fff',
        padding: 'clamp(72px, 10vw, 112px) 24px',
        borderTop: '1px solid var(--color-border-card)',
        borderBottom: '1px solid var(--color-border-card)',
        position: 'relative',
        overflow: 'hidden',
        perspective: '1400px',
      }}
    >
      {/* Giant ghosted quotation mark — this is a spoken line, staged like one */}
      <span aria-hidden style={{
        position: 'absolute', top: '-6%', left: 'clamp(8px, 4vw, 40px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800, fontSize: 'clamp(220px, 30vw, 420px)',
        lineHeight: 1, color: 'var(--color-lime-300)',
        opacity: 0.16 + focusPull * 0.1,
        pointerEvents: 'none', zIndex: 0, userSelect: 'none',
        transition: 'opacity 0.05s linear',
      }}>
        "
      </span>
      <div aria-hidden className="spotlight-glow" style={{ top: '55%', right: '5%', width: 420, height: 420, opacity: 0.35 + focusPull * 0.35 }} />

      <div
        ref={containerRef}
        style={{
          maxWidth: 880,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          transform: `scale(${0.96 + focusPull * 0.04}) translateY(${(1 - focusPull) * 14}px)`,
          filter: `blur(${(1 - focusPull) * 3}px)`,
          transition: 'transform 0.05s linear, filter 0.05s linear',
        }}
      >
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(22px, 3.5vw, 40px)',
          letterSpacing: '-0.04em',
          lineHeight: 1.35,
          margin: '0 0 40px',
        }}>
          {words.map((word, i) => {
            const wordStart = i / words.length;
            const localP = Math.max(0, Math.min(1, (progress - wordStart * 0.7) / 0.25));
            const opacity = 0.12 + localP * 0.88;
            return (
              <span
                key={i}
                style={{
                  color: 'var(--color-ink-strongest)',
                  opacity,
                  transition: 'opacity 0.08s ease',
                  display: 'inline',
                }}
              >
                {word}{' '}
              </span>
            );
          })}
        </p>

        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap',
          opacity: ctaOpacity,
          transform: `translateY(${(1 - ctaOpacity) * 10}px)`,
          transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <a href={pagePath(lang, 'contact')} className="btn-primary" style={{ fontSize: 14 }}>
            {T[lang].ui.startProject}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href={pagePath(lang, 'about')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 600,
            color: 'var(--color-ink-muted)',
            textDecoration: 'none',
            transition: 'color 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink-strongest)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-muted)')}
          >
            Read my story →
          </a>
        </div>
      </div>
    </section>
  );
}
