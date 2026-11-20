import { useState, useEffect, useRef } from 'react';
import { PROJECTS, PORTFOLIO_HEADER } from '../data/sections';
import { T, type Lang } from '../translations';

interface Props { lang: Lang; }

// Full-page screenshots that animate as if scrolling
const FULL_PREVIEWS: Record<string, string> = {
  workero: '/images/workero-full.webp',
  tmpr:    '/images/tmpr-full.webp',
};

const LOGO_BG: Record<string, string> = {
  workero: 'var(--color-lime-300)',
  tmpr:    '#fff',
};

export default function PortfolioSection({ lang }: Props) {
  const header = PORTFOLIO_HEADER[lang];
  const projects = PROJECTS[lang];
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('.reveal');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('visible'); }),
      { threshold: 0.08 }
    );
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="py-24 px-6"
      style={{ background: 'var(--background)', borderTop: '1px solid var(--color-border-card)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Section-level staging only — the live site previews inside the cards are never touched */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(38,35,35,0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden className="spotlight-glow blob-1" style={{ top: -100, right: -100, width: 420, height: 420, opacity: 0.55 }} />
      <div aria-hidden className="spotlight-glow blob-3" style={{ bottom: -80, left: -60, width: 300, height: 300, opacity: 0.35 }} />
      {[[10, 20], [92, 65], [22, 88], [78, 12]].map(([left, top], i) => (
        <span
          key={i}
          aria-hidden
          className="dot-particle"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${i * 1.1}s` }}
        />
      ))}

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="reveal" style={{ marginBottom: 48 }}>
          <p className="eyebrow mb-4" style={{ color: 'var(--color-accent-brown)' }}>
            {header.eyebrow}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 38px)',
              letterSpacing: '-0.04em', lineHeight: 1.1,
              color: 'var(--color-ink-strongest)', margin: 0,
            }}>
              {header.title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', maxWidth: 300, margin: 0 }}>
              {header.desc}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {projects.map((proj, idx) => {
            const isHovered = hoveredId === proj.id;
            const fullPreview = FULL_PREVIEWS[proj.id];
            const logoBg = LOGO_BG[proj.id] ?? 'var(--color-lime-300)';

            return (
              <div
                key={proj.id}
                className="reveal"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div
                  style={{
                    background: isHovered ? '#fff' : 'var(--color-surface-raised)',
                    border: `1px solid ${isHovered ? 'rgba(187,244,81,0.4)' : 'var(--color-border-card)'}`,
                    borderRadius: 24,
                    overflow: 'hidden',
                    transform: isHovered ? 'translateY(-5px)' : 'none',
                    boxShadow: isHovered
                      ? '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(187,244,81,0.15)'
                      : 'var(--shadow-card)',
                    transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                    display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={() => setHoveredId(proj.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* ── Scroll-animated browser preview ── */}
                  {fullPreview && (
                    <div style={{
                      borderBottom: `1px solid ${isHovered ? 'rgba(187,244,81,0.2)' : 'var(--color-border-card)'}`,
                      transition: 'border-color 0.3s',
                    }}>
                      {/* Browser chrome */}
                      <div style={{
                        padding: '9px 13px',
                        background: isHovered ? '#f8f8f6' : 'var(--color-surface-raised)',
                        borderBottom: '1px solid var(--color-border-card)',
                        display: 'flex', alignItems: 'center', gap: 5,
                        transition: 'background 0.3s',
                      }}>
                        {['#ff5f57','#ffbd2e','#28c840'].map((c, i) => (
                          <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }} />
                        ))}
                        <div style={{
                          flex: 1, height: 18, borderRadius: 5,
                          background: 'var(--color-surface-darker)',
                          marginLeft: 6, display: 'flex', alignItems: 'center', paddingLeft: 8,
                        }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--color-ink-faint)' }}>
                            {proj.url.replace('https://', '')}
                          </span>
                        </div>
                        {/* Live indicator */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          fontSize: 9.5, fontWeight: 700,
                          color: 'var(--color-feature-success)',
                          letterSpacing: '0.04em',
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--color-feature-success)',
                            display: 'block',
                          }} />
                          {T[lang].ui.live.toUpperCase()}
                        </div>
                      </div>

                      {/* Scrolling screenshot window */}
                      <div style={{
                        height: 240,
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                      }}>
                        <img
                          src={fullPreview}
                          alt={`${proj.name} page scroll`}
                          className="portfolio-scroll-img"
                          style={{
                            width: '100%',
                            display: 'block',
                            filter: isHovered ? 'none' : 'grayscale(8%) brightness(0.98)',
                            transition: 'filter 0.4s ease',
                            animationDuration: '48s',
                          }}
                        />
                        {/* Top fade */}
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 32,
                          background: `linear-gradient(to bottom, ${isHovered ? '#f8f8f6' : 'var(--color-surface-raised)'}, transparent)`,
                          pointerEvents: 'none', zIndex: 2,
                          transition: 'background 0.3s',
                        }} />
                        {/* Bottom fade */}
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                          background: `linear-gradient(to bottom, transparent, ${isHovered ? '#fff' : 'var(--color-surface-raised)'})`,
                          pointerEvents: 'none', zIndex: 2,
                          transition: 'background 0.3s',
                        }} />
                        {/* LIVE badge */}
                        <div style={{
                          position: 'absolute', top: 10, right: 10, zIndex: 3,
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 9999,
                          padding: '3px 10px',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: '#4ade80',
                            boxShadow: '0 0 6px #4ade80',
                            display: 'block',
                          }} />
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>{T[lang].ui.live.toUpperCase()}</span>
                        </div>
                        {/* Hover hint */}
                        {!isHovered && (
                          <div style={{
                            position: 'absolute', inset: 0, zIndex: 2,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card content */}
                  <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Logo + name */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: logoBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid var(--color-border-card)',
                          flexShrink: 0, overflow: 'hidden',
                          boxShadow: proj.id === 'workero' ? '0 2px 8px rgba(187,244,81,0.3)' : 'none',
                        }}>
                          {proj.id === 'workero' ? (
                            <span style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 800, fontSize: 17,
                              color: '#0e0e0d',
                            }}>W</span>
                          ) : (
                            <img
                              src={proj.logo}
                              alt={proj.logoAlt}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 5 }}
                              onError={e => {
                                const el = e.currentTarget;
                                el.style.display = 'none';
                                if (el.parentElement) {
                                  el.parentElement.innerHTML = `<span style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:15px;color:#0e0e0d">${proj.name[0]}</span>`;
                                }
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, letterSpacing: '-0.02em', color: 'var(--color-ink-strongest)' }}>
                            {proj.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-ink-faint)', marginTop: 1 }}>{proj.year}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10.5, fontWeight: 600,
                        padding: '3px 9px', borderRadius: 9999,
                        background: 'var(--color-surface-darker)',
                        color: 'var(--color-ink-muted)',
                        border: '1px solid var(--color-border-card)',
                        whiteSpace: 'nowrap',
                      }}>
                        {proj.type}
                      </span>
                    </div>

                    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-ink-muted)', margin: '0 0 14px', flex: 1 }}>
                      {proj.desc}
                    </p>

                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
                      {proj.stack.map(tag => (
                        <span key={tag} style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10, fontWeight: 500,
                          padding: '3px 8px', borderRadius: 6,
                          background: 'var(--color-surface-darker)',
                          color: 'var(--color-ink-muted)',
                          border: '1px solid var(--color-border-card)',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ fontSize: 13.5, justifyContent: 'center' }}
                    >
                      {proj.ctaLabel}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
