import { useState } from 'react';
import { T, type Lang } from '../translations';
import { useRevealGroup } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import { pagePath } from '../lib/routes';

interface Props { lang: Lang; }

const featureIcons = [
  /* Automation — zap */
  <svg key="zap" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  /* Web Dev — code */
  <svg key="code" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  /* AI — cpu */
  <svg key="cpu" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>,
  /* Strategy — bar-chart */
  <svg key="chart" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>,
];

const checkIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function FeatureShowcase({ lang }: Props) {
  const features = T[lang].features;
  const [active, setActive] = useState(0);
  const sectionRef = useRevealGroup<HTMLElement>(0.08);
  const { ref: cardRef, onMouseMove: cardMove, onMouseLeave: cardLeave } = useTilt(5);

  const f = features[active];

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6"
      style={{ background: '#fff', borderTop: '1px solid var(--color-border-card)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Faint dot-grid + a glow that breathes with the active tab, like the "System running" mock behind it */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(38,35,35,0.09) 1.2px, transparent 1.2px)',
        backgroundSize: '26px 26px',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden className="spotlight-glow glow-lime" style={{ top: '15%', right: '2%', width: 460, height: 460, opacity: 0.65 }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Tab bar */}
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', gap: 4,
            background: 'var(--color-surface-darker)',
            border: '1px solid var(--color-border-card)',
            borderRadius: 14, padding: 5,
            flexWrap: 'wrap',
          }}>
            {features.map((feat, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 13.5, fontWeight: active === i ? 700 : 500,
                  padding: '9px 18px', borderRadius: 10,
                  border: 'none', cursor: 'pointer',
                  background: active === i ? 'var(--color-ink-strongest)' : 'transparent',
                  color: active === i ? '#fff' : 'var(--color-ink-muted)',
                  transition: 'all 0.18s ease',
                  letterSpacing: '-0.01em',
                }}
              >
                {feat.eyebrow}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div
          className="reveal"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            alignItems: 'center',
            perspective: 1600,
          }}
        >
          {/* Left — text */}
          <div key={active} style={{ opacity: 0, animation: 'hero-enter 0.45s cubic-bezier(0.22,1,0.36,1) forwards' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--color-lime-300)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1a1a1a',
              marginBottom: 24,
              boxShadow: '0 8px 20px rgba(187,244,81,0.32)',
            }}>
              {featureIcons[active]}
            </div>

            <p className="eyebrow mb-3" style={{ color: 'var(--color-accent-brown)' }}>
              {f.eyebrow}
            </p>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 'clamp(22px, 3vw, 34px)',
              letterSpacing: '-0.04em', lineHeight: 1.1,
              color: 'var(--color-ink-strongest)',
              margin: '0 0 16px',
            }}>
              {f.title}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-ink-muted)', margin: '0 0 28px' }}>
              {f.desc}
            </p>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {f.items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 8,
                    background: 'var(--color-lime-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-feature-success)',
                    flexShrink: 0,
                  }}>
                    {checkIcon}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink-strong)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 36 }}>
              <a href={pagePath(lang, 'contact')} className="btn-primary" style={{ fontSize: 14 }}>
                {T[lang].ui.startProject}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — visual card, tilts toward the cursor like a staged monitor */}
          <div key={`card-${active}`} style={{ opacity: 0, animation: 'hero-enter 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s forwards', position: 'relative' }}>
            <div aria-hidden className="spotlight-glow" style={{ top: -40, right: -40, width: 220, height: 220, opacity: 0.55 }} />
            <div
              ref={cardRef}
              onMouseMove={cardMove}
              onMouseLeave={cardLeave}
              className="tilt-card"
              style={{
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border-card)',
                borderRadius: 24,
                padding: 32,
                boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
                position: 'relative',
              }}
            >
              {/* Mock UI */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11, color: 'var(--color-ink-faint)',
                  letterSpacing: '0.06em', marginBottom: 16,
                  textTransform: 'uppercase',
                }}>
                  {f.eyebrow} · {T[lang].ui.active}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: 'var(--color-feature-success)',
                    boxShadow: '0 0 8px rgba(45,164,78,0.5)',
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-strongest)' }}>
                    {T[lang].ui.systemRunning}
                  </span>
                </div>
              </div>

              {/* Item bars */}
              {f.items.map((item, i) => (
                <div key={i} style={{ marginBottom: i < f.items.length - 1 ? 14 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-ink-muted)' }}>{item}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: 'var(--color-feature-success)',
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}>
                      {['98%', '100%', '94%', '99%'][i % 4]}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: ['98%', '100%', '94%', '99%'][i % 4] }}
                    />
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: 24, paddingTop: 20,
                borderTop: '1px solid var(--color-border-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>{T[lang].ui.systemName}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: 'var(--color-lime-200)',
                  color: '#1a4d00',
                  padding: '3px 10px', borderRadius: 9999,
                }}>
                  {T[lang].ui.live}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
