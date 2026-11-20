import { useEffect } from 'react';
import type { BlogPost } from '../data/sections';
import { T, type Lang } from '../translations';
import { pagePath } from '../lib/routes';
import { useDialogA11y } from './ui/useDialogA11y';

interface Props {
  post: BlogPost;
  onClose: () => void;
  lang?: Lang;
}

export default function BlogModal({ post, onClose, lang = 'en' }: Props) {
  const trapRef = useDialogA11y();
  const u = T[lang].ui;
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const paragraphs = (post.content ?? post.excerpt).split('\n\n');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(20,18,18,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 0',
        animation: 'hero-enter 0.25s cubic-bezier(0.22,1,0.36,1)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={trapRef} role="dialog" aria-modal="true" aria-label={post.title}
        style={{
          width: '100%', maxWidth: 760,
          maxHeight: '90dvh',
          background: 'var(--background)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--color-border-card)',
          borderBottom: 'none',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -24px 80px rgba(0,0,0,0.18)',
        }}
      >
        {/* Handle */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          padding: '14px 0 4px',
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 4, borderRadius: 9999,
            background: 'var(--color-border-card)',
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '12px 32px 20px',
          borderBottom: '1px solid var(--color-border-card)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: 'var(--color-surface-darker)',
                color: 'var(--color-ink-muted)',
                padding: '3px 10px', borderRadius: 9999,
              }}>
                {post.tag}
              </span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, color: 'var(--color-ink-faint)',
              }}>
                {post.date} · {post.readMin} min read
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 'clamp(18px, 3vw, 24px)',
              letterSpacing: '-0.035em', lineHeight: 1.2,
              color: 'var(--color-ink-strongest)',
              margin: 0,
            }}>
              {post.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: '1px solid var(--color-border-card)',
              background: 'var(--color-surface-raised)',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-ink-muted)',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-ink-strongest)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface-raised)'; e.currentTarget.style.color = 'var(--color-ink-muted)'; }}
            aria-label={u.close}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{
          overflowY: 'auto', padding: '28px 32px 48px',
          flex: 1,
        }}>
          {paragraphs.map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**') && para.indexOf('**', 2) === para.length - 2) {
              return (
                <h3
                  key={i}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800, fontSize: 16,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-ink-strongest)',
                    margin: '28px 0 10px',
                  }}
                >
                  {para.slice(2, -2)}
                </h3>
              );
            }
            const esc = para.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');   // escape first, then the only allowed markup
            const rendered = esc.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            return (
              <p
                key={i}
                dangerouslySetInnerHTML={{ __html: rendered }}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 15, lineHeight: 1.78,
                  color: 'var(--color-ink-muted)',
                  margin: '0 0 18px',
                }}
              />
            );
          })}

          {/* Footer */}
          <div style={{
            marginTop: 36, paddingTop: 24,
            borderTop: '1px solid var(--color-border-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="/IMG_7937.webp"
                alt="Chousein Chiout"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top' }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-strongest)' }}>Chousein Chiout</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-ink-faint)' }}>{u.blogLocation}</div>
              </div>
            </div>
            <a
              href={pagePath(lang, 'contact')}
              className="btn-lime"
              style={{ fontSize: 13, padding: '9px 20px' }}
              onClick={e => {
                e.preventDefault();
                onClose();
                setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
            >
              {u.workWithMe}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
