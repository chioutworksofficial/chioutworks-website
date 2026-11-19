import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { T, type Lang } from '../translations';
import { useRevealGroup } from '../hooks/useReveal';
import { pagePath, hashToPath } from '../lib/routes';

interface Props { lang: Lang; }

export default function FooterSection({ lang }: Props) {
  const d = T[lang].footer;
  const u = T[lang].ui;
  const footerRef = useRef<HTMLElement>(null);
  const gridRef = useRevealGroup<HTMLDivElement>(0.15);
  const [scanY, setScanY] = useState(100); // % — 100 = altta, 0 = üstte

  useEffect(() => {
    const onScroll = () => {
      const el = footerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const wh = window.innerHeight;
      // rect.bottom = altı, rect.top = üstü
      // Ekrana girmeye başladığında (bottom = wh) → 100%
      // Tamamen görünür olduğunda (top = 0) → 0%
      const progress = 1 - Math.max(0, Math.min(1, (rect.bottom - wh) / rect.height + 1));
      setScanY(Math.round((1 - progress) * 110)); // 110→0
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <footer ref={footerRef}>
      {/* CTA strip — lime */}
      <div style={{
        background: 'var(--color-lime-300)',
        padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 20, flexWrap: 'wrap',
      }}>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: 14.5,
          letterSpacing: '-0.02em', color: '#1a1a1a', margin: 0,
        }}>
          {u.footerCta}
        </p>
        <a
          href={pagePath(lang, 'contact')}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: 13,
            color: '#1a1a1a',
            background: 'rgba(0,0,0,0.1)',
            padding: '7px 18px', borderRadius: 9999,
            textDecoration: 'none',
            border: '1px solid rgba(0,0,0,0.14)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            transition: 'background 0.15s',
            display: 'inline-flex', alignItems: 'center', gap: 7,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.1)')}
        >
          {u.footerBook}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>

      {/* Main footer — kremsi arka plan, koyu noktalar, yukarı yansıma */}
      <div style={{
        background: 'var(--background)',
        borderTop: '1px solid var(--color-border-card)',
        position: 'relative',
        overflow: 'hidden',
        padding: '60px 24px 0',
      }}>
        {/* Lime nokta grid */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(187,244,81,0.35) 1.4px, transparent 1.4px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Scroll'a bağlı yukarı kayan tarama ışığı */}
        <div aria-hidden style={{
          position: 'absolute', left: 0, right: 0,
          top: `${scanY - 30}%`,
          height: '60%',
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(187,244,81,0.55) 0%, rgba(187,244,81,0.15) 40%, transparent 70%)',
          filter: 'blur(24px)',
          transition: 'top 0.15s ease-out',
          pointerEvents: 'none', zIndex: 1,
          mixBlendMode: 'multiply',
        }} />

        {/* Sabit üst parıltısı */}
        <div aria-hidden style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 700, height: 140,
          background: 'linear-gradient(to bottom, rgba(187,244,81,0.18) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 2,
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 'clamp(24px, 4vw, 52px)',
              paddingBottom: 52,
              borderBottom: '1px solid var(--color-border-card)',
            }}
            className="max-md:grid-cols-2 max-sm:grid-cols-1"
          >
            {/* Brand */}
            <div className="reveal" style={{ '--stagger': 0 } as React.CSSProperties}>
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: 20,
                  letterSpacing: '-0.04em',
                  color: 'var(--color-ink-strongest)',
                }}>
                  Chioutworks
                </span>
                <span style={{
                  display: 'inline-block',
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--color-feature-success)',
                  marginLeft: 4, verticalAlign: 'middle',
                  boxShadow: '0 0 8px rgba(45,164,78,0.5)',
                }} />
              </div>
              <p style={{
                fontSize: 13.5, lineHeight: 1.7,
                color: 'var(--color-ink-muted)',
                margin: '0 0 22px', maxWidth: 260,
              }}>
                {u.footerBlurb}
              </p>

              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  {
                    href: 'https://www.linkedin.com/in/chousein-chiout-29345323a/',
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
                  },
                  {
                    href: pagePath(lang, 'contact'),
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
                  },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      border: '1px solid var(--color-border-card)',
                      background: 'var(--color-surface-raised)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-ink-muted)',
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--color-lime-300)';
                      e.currentTarget.style.borderColor = 'var(--color-lime-300)';
                      e.currentTarget.style.color = '#111';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--color-surface-raised)';
                      e.currentTarget.style.borderColor = 'var(--color-border-card)';
                      e.currentTarget.style.color = 'var(--color-ink-muted)';
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="reveal" style={{ '--stagger': 1 } as React.CSSProperties}>
              <p className="eyebrow mb-4" style={{ color: 'var(--color-accent-brown)' }}>{u.footerServicesTitle}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {u.footerServices.map(item => (
                  <a key={item} href={pagePath(lang, 'services')} style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--color-ink-muted)', textDecoration: 'none', transition: 'color 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink-strongest)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-muted)')}>
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div className="reveal" style={{ '--stagger': 2 } as React.CSSProperties}>
              <p className="eyebrow mb-4" style={{ color: 'var(--color-accent-brown)' }}>{u.footerCompany}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {d.colLinks.map((link, i) => (
                  <a key={i} href={hashToPath(lang, link.href)} style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--color-ink-muted)', textDecoration: 'none', transition: 'color 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink-strongest)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-muted)')}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="reveal" style={{ '--stagger': 3 } as React.CSSProperties}>
              <p className="eyebrow mb-4" style={{ color: 'var(--color-accent-brown)' }}>{u.footerLocation}</p>
              <address style={{ fontStyle: 'normal' }}>
                <span style={{ fontSize: 13.5, color: 'var(--color-ink-muted)', lineHeight: 1.65, display: 'block', marginBottom: 12 }}>
                  Waldstraße 124E<br />
                  65451 Kelsterbach<br />
                  {u.footerCountry}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 10.5, fontWeight: 700,
                  background: 'var(--color-lime-100)',
                  color: '#1a4400',
                  border: '1px solid rgba(187,244,81,0.5)',
                  padding: '4px 10px', borderRadius: 9999,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-feature-success)', boxShadow: '0 0 6px rgba(45,164,78,0.6)' }} />
                  {u.footerAvailable}
                </span>
              </address>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            padding: '18px 0 26px',
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', margin: 0 }}>
              {d.copy}
            </p>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {[
                { label: d.legal[0], to: pagePath(lang, 'privacy') },
                { label: d.legal[1], to: pagePath(lang, 'terms') },
                { label: d.legal[2], to: pagePath(lang, 'docs') },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.to}
                  style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink-faint)', textDecoration: 'none', transition: 'color 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-faint)')}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
