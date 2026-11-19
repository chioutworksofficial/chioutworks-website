import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../data/sections';
import { T, type Lang } from '../translations';
import { pagePath } from '../lib/routes';
import { BLOG_PAGE_UI } from './i18n/blogPage';
import BlogCover from './BlogCover';
import { readMinutes } from './blogMeta';

const label: React.CSSProperties = { fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' };
const Arrow = ({ flip }: { flip?: boolean }) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export default function BlogReader({ post, posts, lang, onClose, onOpen }: { post: BlogPost; posts: BlogPost[]; lang: Lang; onClose: () => void; onOpen: (p: BlogPost) => void }) {
  const ui = BLOG_PAGE_UI[lang];
  const u = T[lang].ui;
  const box = useRef<HTMLDivElement>(null);
  const idx = posts.findIndex((p) => p.id === post.id);
  const prev = posts[idx - 1], next = posts[idx + 1];
  const more = posts.filter((p) => p.id !== post.id).slice(0, 3);

  useEffect(() => {
    const prevOv = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prevOv; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  useEffect(() => { box.current?.scrollTo(0, 0); }, [post.id]);

  const paras = (post.content ?? post.excerpt).split('\n\n');
  const navLink = (p: BlogPost | undefined, text: string, back: boolean) => p
    ? <button onClick={() => onOpen(p)} className={`group inline-flex items-center gap-2.5 transition-colors hover:[color:var(--c-quartz)] ${back ? '' : 'ml-auto'}`} style={{ ...label, fontWeight: 500, color: 'var(--lq-silver)' }}>{back && <Arrow flip />}{text}{!back && <Arrow />}</button>
    : <span />;

  // portal to <body> so no transformed/pinned ancestor can trap the overlay under the fixed header
  return createPortal(
    <div ref={box} role="dialog" aria-modal="true" data-lenis-prevent aria-label={post.title} className="fixed inset-0 overflow-y-auto" style={{ zIndex: 2000, background: 'var(--lq-abyss)', color: 'var(--lq-mist)' }}>
      <div className="relative w-full overflow-hidden" style={{ minHeight: 460 }}>
        <div className="absolute inset-0"><BlogCover id={post.id} /></div>
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--c-abyss) 92%, transparent) 8%, color-mix(in srgb, var(--c-abyss) 35%, transparent) 70%, transparent)' }} />
        <button onClick={onClose} aria-label={u.close} className="absolute flex items-center justify-center" style={{ zIndex: 10, top: 20, right: 20, width: 40, height: 40, border: '1px solid var(--c-hairline)', background: 'color-mix(in srgb, var(--c-void) 60%, transparent)', color: 'var(--lq-white)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <div className="relative mx-auto flex items-end px-5 md:px-9 pb-10" style={{ maxWidth: 1600, minHeight: 460, paddingTop: 120 }}>
          <div style={{ maxWidth: 736 }}>
            <h1 className="text-[34px] md:text-[56px]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{post.title}</h1>
            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 pt-4" style={{ ...label, borderTop: '1px solid var(--c-hairline)', color: 'var(--lq-mist)' }}>
              <span>Chousein Chiout</span><span className="h-px w-6" style={{ background: 'var(--c-hairline)' }} /><span>{post.date}</span><span className="h-px w-6" style={{ background: 'var(--c-hairline)' }} /><span style={{ color: 'var(--lq-lavender)' }}>{readMinutes(post)} {ui.min}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="mx-auto px-5 md:px-9 pt-14 pb-24" style={{ maxWidth: 1600 }}>
        <button onClick={onClose} className="inline-flex items-center gap-2 transition-colors hover:[color:var(--c-quartz)]" style={{ ...label, fontWeight: 500, color: 'var(--lq-silver)' }}><Arrow flip />{ui.allArticles}</button>
        <div className="mt-14">
          {paras.map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**') && para.indexOf('**', 2) === para.length - 2)
              return <h2 key={i} style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', lineHeight: 1.15, color: 'var(--lq-white)', margin: '48px 0 14px' }}>{para.slice(2, -2)}</h2>;
            return (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--lq-mist)', margin: i ? '24px 0 0' : 0, whiteSpace: 'pre-line' }}>
                {para.split(/\*\*([^*]+)\*\*/g).map((s, j) => (j % 2 ? <strong key={j} style={{ fontWeight: 600, color: 'var(--lq-white)' }}>{s}</strong> : s))}
              </p>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderRadius: 16, border: '1px solid var(--lq-line)', background: 'var(--lq-kelp)' }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--lq-mist)' }}>{ui.ctaTitle}</p>
          <Link to={pagePath(lang, 'contact')} onClick={onClose} className="inline-flex shrink-0 items-center gap-2.5 px-5 py-2.5" style={{ fontSize: 14, fontWeight: 500, color: 'var(--lq-white)', border: '1px solid var(--c-hairline)' }}>{u.workWithMe}<Arrow /></Link>
        </div>

        <nav className="mt-14 flex items-stretch justify-between gap-4 pt-6" style={{ borderTop: '1px solid var(--lq-line)' }}>
          {navLink(prev, ui.prev, true)}{navLink(next, ui.next, false)}
        </nav>

        <section className="mt-20">
          <h2 style={{ ...label, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--lq-lavender)' }}>{ui.keep}</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 pt-8 md:grid-cols-3" style={{ borderTop: '1px solid var(--lq-line)' }}>
            {more.map((p, i) => (
              <div key={p.id} role="button" tabIndex={0} onClick={() => onOpen(p)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(p); }} className="group block cursor-pointer">
                <div className="relative mb-5 w-full overflow-hidden" style={{ aspectRatio: '16/11', border: '1px solid var(--lq-line)' }}>
                  <BlogCover id={p.id} className="transition-transform duration-[900ms] ease-out group-hover:scale-105" />
                </div>
                <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--lq-lavender)' }}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 transition-colors group-hover:[color:var(--c-quartz)]" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.35, fontFamily: 'var(--font-display)', color: 'var(--lq-mist)' }}>{p.title}</h3>
                <p className="mt-2 line-clamp-2" style={{ fontSize: 13, lineHeight: 1.625, color: 'var(--lq-silver)' }}>{p.excerpt}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>,
    document.body,
  );
}
