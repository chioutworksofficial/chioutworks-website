import { useEffect, useRef, useState } from 'react';
import { T, type Lang } from '../translations';
import { useTilt } from '../hooks/useTilt';
import { useVideoInView } from '../hooks/useVideoInView';
import { pagePath } from '../lib/routes';

interface Props { lang: Lang; }

const COPY: Record<Lang, { eyebrow: string; title: string; sub: string }> = {
  en: { eyebrow: 'Work Preview', title: 'Designed to convert. Built to perform.', sub: 'Every project ships with precision — from first pixel to production.' },
  de: { eyebrow: 'Arbeitsvorschau', title: 'Entworfen, um zu überzeugen. Gebaut für Leistung.', sub: 'Jedes Projekt wird mit Präzision geliefert — vom ersten Pixel bis zur Produktion.' },
  tr: { eyebrow: 'Çalışma Önizlemesi', title: 'Dönüştürmek için tasarlandı. Performans için inşa edildi.', sub: 'Her proje ilk pikselden üretime kadar hassasiyetle teslim edilir.' },
  el: { eyebrow: 'Προεπισκόπηση Έργων', title: 'Σχεδιασμένο να μετατρέπει. Χτισμένο για απόδοση.', sub: 'Κάθε έργο παραδίδεται με ακρίβεια — από το πρώτο εικονοστοιχείο μέχρι την παραγωγή.' },
};

export default function VideoShowcase({ lang }: Props) {
  const d = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { ref: frameRef, onMouseMove: frameMove, onMouseLeave: frameLeave } = useTilt(5);
  const videoRef = useVideoInView(sectionRef);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const anim = (delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.985)',
    filter: visible ? 'blur(0)' : 'blur(4px)',
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6"
      style={{ background: 'var(--color-surface-darker)', borderTop: '1px solid var(--color-border-card)', position: 'relative', overflow: 'hidden' }}
    >
      {/* work-reel.mp4 — the literal work reel, dimmed well under the copy for legibility */}
      <div aria-hidden className="video-bg-wrap">
        <video ref={videoRef} muted loop playsInline preload="metadata" aria-hidden style={{ opacity: 0.16, filter: 'grayscale(15%)' }}>
          <source src="/videos/work-reel.mp4" type="video/mp4" />
        </video>
        <div className="video-bg-overlay" style={{ background: 'var(--color-surface-darker)', opacity: 0.82 }} />
        <div className="video-bg-fallback" style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(187,244,81,0.1) 0%, transparent 60%)' }} />
      </div>
      <div aria-hidden className="spotlight-glow" style={{ top: '10%', right: '5%', width: 380, height: 380, opacity: visible ? 0.7 : 0 }} />
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(32px, 5vw, 64px)',
        alignItems: 'center',
        position: 'relative', zIndex: 1,
        perspective: 1600,
      }}
      className="max-md:grid-cols-1"
      >
        {/* Left — text */}
        <div>
          <p style={{ ...anim(0), fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-feature-success)', marginBottom: 20 }}>
            {d.eyebrow}
          </p>
          <h2 style={{
            ...anim(0.08),
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(24px, 3.5vw, 38px)',
            letterSpacing: '-0.04em', lineHeight: 1.1,
            color: 'var(--color-ink-strongest)',
            margin: '0 0 16px',
          }}>
            {d.title}
          </h2>
          <p style={{ ...anim(0.14), fontSize: 15, lineHeight: 1.7, color: 'var(--color-ink-muted)', margin: '0 0 28px' }}>
            {d.sub}
          </p>
          <div style={anim(0.2)}>
            <a href={pagePath(lang, 'portfolio')} className="btn-primary" style={{ fontSize: 14 }}>
              {T[lang].ui.viewPortfolio}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right — GIF in a tilting browser frame */}
        <div style={anim(0.1)}>
          <div
            ref={frameRef}
            onMouseMove={frameMove}
            onMouseLeave={frameLeave}
            className="tilt-card"
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid var(--color-border-card)',
              background: '#fff',
              boxShadow: '0 24px 72px rgba(0,0,0,0.14)',
            }}
          >
            {/* Browser chrome */}
            <div style={{
              padding: '10px 14px',
              background: 'var(--color-surface-raised)',
              borderBottom: '1px solid var(--color-border-card)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />
              ))}
              <div style={{
                flex: 1, height: 22, borderRadius: 6,
                background: 'var(--color-surface-darker)',
                marginLeft: 8,
                display: 'flex', alignItems: 'center', paddingLeft: 10,
              }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--color-ink-faint)' }}>
                  chioutworks.com
                </span>
              </div>
            </div>
            <img
              src="/images/ai-work.gif"
              alt="Work preview"
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
