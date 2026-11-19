import { useState, useEffect } from 'react';
import { T, type Lang } from '../translations';
import { pagePath } from '../lib/routes';

interface NavbarProps {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}

const LANGS: Lang[] = ['en', 'de', 'tr', 'el'];

export default function Navbar({ lang, onLangChange }: NavbarProps) {
  const d = T[lang];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = d.nav.map((label, i) => ({
    label,
    href: pagePath(lang, (['services', 'about', 'portfolio', 'demos', 'contact'] as const)[i]),
  }));

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? 'rgba(245,245,242,0.93)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? 'var(--color-border-card)' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'background 180ms ease, border-color 180ms ease',
      }}
    >
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <a href={pagePath(lang, 'home')} style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: 19,
            letterSpacing: '-0.04em',
            color: 'var(--color-ink-strongest)',
            userSelect: 'none',
          }}>
            Chioutworks
          </span>
        </a>

        {/* Nav links — desktop */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="max-md:hidden">
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14, fontWeight: 500,
                padding: '8px 14px', borderRadius: 8,
                color: 'var(--color-ink-muted)',
                textDecoration: 'none',
                transition: 'color 0.12s, background 0.12s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-ink-strongest)'; e.currentTarget.style.background = 'rgba(38,35,35,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-ink-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right — lang picker only */}
        <div style={{ display: 'flex', gap: 2 }}>
          {LANGS.map(l => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11, fontWeight: 700,
                padding: '5px 9px', borderRadius: 6,
                border: 'none', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: lang === l ? 'var(--color-ink-strongest)' : 'transparent',
                color: lang === l ? '#fff' : 'var(--color-ink-muted)',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { if (lang !== l) e.currentTarget.style.background = 'rgba(38,35,35,0.07)'; }}
              onMouseLeave={e => { if (lang !== l) e.currentTarget.style.background = 'transparent'; }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

    </header>
  );
}
