import { ABOUT } from '../data/sections';
import type { Lang } from '../translations';
import { useRevealGroup } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import { useVideoInView } from '../hooks/useVideoInView';

interface Props { lang: Lang; }

export default function AboutSection({ lang }: Props) {
  const d = ABOUT[lang];
  const sectionRef = useRevealGroup<HTMLElement>(0.1);
  const { ref: photoRef, onMouseMove: photoMove, onMouseLeave: photoLeave } = useTilt(4);
  const videoRef = useVideoInView(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 px-6"
      style={{ borderTop: '1px solid var(--color-border-card)', position: 'relative', overflow: 'hidden' }}
    >
      {/* ambient.mp4 — heavily blurred/dimmed abstract motion, "life in motion" behind the story, never competing with the photo or copy */}
      <div aria-hidden className="video-bg-wrap">
        <video ref={videoRef} muted loop playsInline preload="metadata" aria-hidden style={{ opacity: 0.14, filter: 'blur(18px) saturate(85%)', transform: 'scale(1.1)' }}>
          <source src="/videos/ambient.mp4" type="video/mp4" />
        </video>
        <div className="video-bg-overlay" style={{ background: 'var(--background)', opacity: 0.86 }} />
      </div>
      <div aria-hidden className="spotlight-glow" style={{ top: '20%', left: '-10%', width: 420, height: 420 }} />
      <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'clamp(260px, 30%, 360px) 1fr',
            gap: '4rem',
            alignItems: 'start',
            perspective: 1600,
          }}
          className="max-lg:grid-cols-1"
        >

          {/* LEFT — Photo + timeline */}
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Photo — tilts gently toward the cursor, like a framed still */}
            <div
              ref={photoRef}
              onMouseMove={photoMove}
              onMouseLeave={photoLeave}
              className="tilt-card"
              style={{
                borderRadius: '1.5rem',
                overflow: 'hidden',
                border: '1px solid var(--color-border-card)',
                position: 'relative',
                boxShadow: '0 20px 56px rgba(0,0,0,0.14)',
              }}
            >
              <img
                src="/IMG_7937.webp"
                alt="Chousein Chiout"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  filter: 'grayscale(12%)',
                }}
              />
              {/* Name badge over photo */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border-card)',
                  borderRadius: '0.75rem',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-ink-strongest)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
              >
                Chousein Chiout
                <span style={{ marginLeft: '0.4rem', fontWeight: 400, color: 'var(--color-ink-faint)', fontSize: '0.72rem' }}>
                  · Kelsterbach, {{ en: 'Germany', de: 'Deutschland', tr: 'Almanya', el: 'Γερμανία' }[lang]}
                </span>
              </div>
            </div>

            {/* Timeline card */}
            <div
              style={{
                borderRadius: '1rem',
                padding: '1.25rem',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border-card)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {d.timeline.map(([icon, label], i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: i < d.timeline.length - 1 ? '0.75rem' : 0 }}>
                  <span style={{ fontSize: '1.1rem', lineHeight: 1, marginTop: '0.1rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--color-ink)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Story */}
          <div className="reveal" style={{ '--stagger': 1 } as React.CSSProperties}>
            <p
              style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-feature-success)', marginBottom: '1rem' }}
            >
              {d.eyebrow}
            </p>
            <h2
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--color-ink-strongest)', marginBottom: '2rem' }}
            >
              {d.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '2.5rem' }}>
              {d.paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--color-ink-muted)', margin: 0 }}>
                  {p}
                </p>
              ))}
            </div>

            <a
              href="https://www.linkedin.com/in/chousein-chiout-29345323a/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0.65rem 1.4rem',
                borderRadius: '9999px',
                background: '#0a66c2',
                color: '#fff',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              {d.linkedinBtn}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
