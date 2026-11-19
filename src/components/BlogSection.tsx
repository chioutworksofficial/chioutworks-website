import { useState } from 'react';
import { BLOG_POSTS, BLOG_HEADER, type BlogPost } from '../data/sections';
import { T, type Lang } from '../translations';
import BlogModal from './BlogModal';
import { useRevealGroup } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';

interface Props { lang: Lang; }

const tagColors: Record<string, { bg: string; text: string }> = {
  Automation:        { bg: '#dcfce7', text: '#166534' },
  Automatisierung:   { bg: '#dcfce7', text: '#166534' },
  Otomasyon:         { bg: '#dcfce7', text: '#166534' },
  Αυτοματισμός:      { bg: '#dcfce7', text: '#166534' },
  AI:                { bg: '#dbeafe', text: '#1e40af' },
  KI:                { bg: '#dbeafe', text: '#1e40af' },
  YZ:                { bg: '#dbeafe', text: '#1e40af' },
  'Web Development': { bg: '#f3e8ff', text: '#6b21a8' },
  Webentwicklung:    { bg: '#f3e8ff', text: '#6b21a8' },
  'Web Geliştirme':  { bg: '#f3e8ff', text: '#6b21a8' },
  'Ανάπτυξη Ιστού':    { bg: '#f3e8ff', text: '#6b21a8' },
  Personal:          { bg: '#fff7ed', text: '#9a3412' },
  'Persönlich':      { bg: '#fff7ed', text: '#9a3412' },
  Kişisel:           { bg: '#fff7ed', text: '#9a3412' },
  Προσωπικό:         { bg: '#fff7ed', text: '#9a3412' },
};
const defaultColor = { bg: 'var(--color-surface-darker)', text: 'var(--color-ink-muted)' };

function FeaturedCard({ post, cta, onOpen }: { post: BlogPost; cta: string; onOpen: () => void }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  return (
    <div
      className="reveal"
      style={{ gridRow: 'span 2', cursor: 'pointer' }}
      onClick={onOpen}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        className="tilt-card"
        style={{
          background: 'var(--color-ink-strongest)',
          borderRadius: 24,
          padding: 32,
          height: '100%', minHeight: 320,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          transition: 'box-shadow 0.2s ease',
          boxShadow: 'var(--shadow-card)',
          position: 'relative', overflow: 'hidden',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 64px rgba(0,0,0,0.28)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; onMouseLeave(); }}
      >
        <div aria-hidden style={{
          position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(187,244,81,0.18) 0%, transparent 70%)',
          filter: 'blur(30px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '4px 11px', borderRadius: 9999,
              background: 'var(--color-lime-300)',
              color: '#1a1a1a',
              letterSpacing: '0.02em',
            }}>
              {post.tag}
            </span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, color: 'rgba(255,255,255,0.3)',
            }}>
              {post.readMin} min read
            </span>
          </div>
          <h3 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: 'clamp(18px, 2.5vw, 24px)',
            letterSpacing: '-0.035em', lineHeight: 1.2,
            color: '#fff', margin: '0 0 14px',
          }}>
            {post.title}
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.48)', margin: 0 }}>
            {post.excerpt}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>{post.date}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600,
            color: 'var(--color-lime-300)',
          }}>
            {cta}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, index, cta, onOpen }: { post: BlogPost; index: number; cta: string; onOpen: () => void }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);
  const tc = tagColors[post.tag] ?? defaultColor;
  return (
    <div
      className="reveal"
      style={{ '--stagger': index + 1, cursor: 'pointer' } as React.CSSProperties}
      onClick={onOpen}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        className="tilt-card"
        style={{
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border-card)',
          borderRadius: 20, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 12,
          height: '100%',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
          boxShadow: 'var(--shadow-card)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface-raised)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; onMouseLeave(); }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: tc.bg, color: tc.text }}>
            {post.tag}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: 'var(--color-ink-faint)' }}>
            {post.readMin} min
          </span>
        </div>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: 15,
          letterSpacing: '-0.025em', lineHeight: 1.3,
          color: 'var(--color-ink-strongest)', margin: 0,
        }}>
          {post.title}
        </h3>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-ink-muted)', margin: 0 }}>
          {post.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8 }}>
          <span style={{ fontSize: 11.5, color: 'var(--color-ink-faint)' }}>{post.date}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {cta}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BlogSection({ lang }: Props) {
  const header = BLOG_HEADER[lang];
  const posts = BLOG_POSTS[lang];
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);
  const sectionRef = useRevealGroup<HTMLElement>(0.08);

  return (
    <>
      <section
        ref={sectionRef}
        className="py-24 px-6"
        style={{ borderTop: '1px solid var(--color-border-card)', position: 'relative', overflow: 'hidden' }}
      >
        <span aria-hidden className="watermark-ghost" style={{ top: '4%', left: '50%', transform: 'translateX(-50%)', opacity: 0.06 }}>
          {header.eyebrow}
        </span>
        <div aria-hidden className="spotlight-glow" style={{ bottom: -120, right: '5%', width: 420, height: 420, opacity: 0.6 }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div className="reveal" style={{ marginBottom: 48, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p className="eyebrow mb-4" style={{ color: 'var(--color-feature-success)' }}>
                {header.eyebrow}
              </p>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 38px)',
                letterSpacing: '-0.04em', lineHeight: 1.1,
                color: 'var(--color-ink-strongest)', margin: 0,
              }}>
                {header.title}
              </h2>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--color-ink-faint)', margin: 0 }}>
              {T[lang].ui.blogHint}
            </p>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, perspective: 1600 }}>
            <FeaturedCard post={posts[0]} cta={header.cta} onOpen={() => setOpenPost(posts[0])} />
            {posts.slice(1).map((post, i) => (
              <PostCard key={post.id} post={post} index={i} cta={header.cta} onOpen={() => setOpenPost(post)} />
            ))}
          </div>
        </div>
      </section>

      {openPost && (
        <BlogModal lang={lang} post={openPost} onClose={() => setOpenPost(null)} />
      )}
    </>
  );
}
