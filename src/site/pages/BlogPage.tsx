import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogPath } from '../../lib/routes';
import { PenIcon } from './BlogArticle';
import { type Lang } from '../../translations';
import { BLOG_POSTS, type BlogPost } from '../../data/sections';
import { BLOG_PAGE_UI } from '../i18n/blogPage';
import BlogCover from '../BlogCover';
import PageHero from '../PageHero';
import { readMinutes } from '../blogMeta';

const kicker: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lq-lavender)' };
const metaText: React.CSSProperties = { fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lq-silver)' };
const Arrow = ({ size = 13 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const roleBtn = (open: () => void) => ({ role: 'button' as const, tabIndex: 0, onClick: open, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } } });
const circle: React.CSSProperties = { background: 'color-mix(in srgb, var(--c-void) 60%, transparent)', border: '1px solid var(--c-hairline)', color: 'var(--lq-white)', borderRadius: 999, backdropFilter: 'blur(6px)' };

function Row({ p, n, ui, onOpen, lang }: { p: BlogPost; n: number; ui: (typeof BLOG_PAGE_UI)[Lang]; onOpen: () => void; lang: Lang }) {
  const num = String(n).padStart(2, '0');
  const meta = (cls: string) => (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${cls}`} style={{ ...metaText, letterSpacing: '0.14em' }}>
      <span style={{ color: 'var(--lq-lavender)' }}>{p.tag}</span><span>{readMinutes(p)} {ui.min}</span><span>{p.date}</span>
    </div>
  );
  return (
    <li className="border-b" style={{ borderColor: 'var(--lq-line)' }}>
      <div {...roleBtn(onOpen)} aria-label={p.title} className="group block cursor-pointer py-8 sm:grid sm:items-center sm:gap-12 sm:py-12 sm:grid-cols-[minmax(0,1fr)_180px] lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative overflow-hidden rounded-2xl sm:hidden" style={{ aspectRatio: '16/10', border: '1px solid var(--lq-line)' }}>
          <BlogCover id={p.id} lang={lang} className="transition-transform duration-700 ease-out group-hover:scale-105" />
          <span className="absolute left-4 top-4 px-2.5 py-1" style={{ ...circle, fontSize: 10, letterSpacing: '0.16em' }}>{num}</span>
          <span className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center" style={circle}><Arrow /></span>
        </div>
        <div className="min-w-0 mt-5 sm:mt-0">
          <div className="flex items-baseline gap-6 sm:gap-10">
            <span className="hidden sm:block shrink-0 tabular-nums" style={{ fontSize: 13, color: 'var(--lq-lavender)' }}>{num}</span>
            <div className="min-w-0">
              <h3 className="transition-colors duration-200 text-[22px] sm:text-[34px]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)', color: 'var(--lq-mist)' }}>
                <span className="group-hover:[color:var(--c-quartz)] transition-colors">{p.title}</span>
              </h3>
              <p className="mt-3 line-clamp-2" style={{ fontSize: 13, lineHeight: 1.625, color: 'var(--lq-silver)', maxWidth: 576 }}>{p.excerpt}</p>
            </div>
          </div>
          {meta('mt-4 sm:mt-5 sm:pl-[3.25rem]')}
        </div>
        <div className="relative hidden sm:block overflow-hidden" style={{ aspectRatio: '16/10', border: '1px solid var(--lq-line)', clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)' }}>
          <BlogCover id={p.id} lang={lang} className="transition-transform duration-700 ease-out group-hover:scale-105" />
          <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6, background: 'linear-gradient(to right, color-mix(in srgb, var(--c-cobalt) 40%, transparent), transparent)' }} />
          <div aria-hidden className="absolute inset-y-0 left-0 w-px pointer-events-none" style={{ transform: 'rotate(5.5deg)', transformOrigin: 'top left', background: 'color-mix(in srgb, var(--c-lilac) 50%, transparent)', boxShadow: '0 0 14px color-mix(in srgb, var(--c-lilac) 65%, transparent)' }} />
          <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5" style={circle}><Arrow /></span>
        </div>
      </div>
    </li>
  );
}

export default function BlogPage({ lang }: { lang: Lang }) {
  const ui = BLOG_PAGE_UI[lang];
  const posts = BLOG_POSTS[lang];
  const navigate = useNavigate();
  const setOpen = (p: BlogPost) => navigate(blogPath(lang, p.id));   // articles have their own pages now
  const [first, ...rest] = posts;
  // Pen trail: an ink line drawn down the archive as you scroll, with a pen at its tip
  const listRef = useRef<HTMLUListElement>(null);
  const [ink, setInk] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setInk(1); return; }
    let raf = 0;
    const tick = () => { raf = 0; const el = listRef.current; if (!el) return; const r = el.getBoundingClientRect(); setInk(Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / Math.max(1, r.height)))); };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ color: 'var(--lq-silver)' }}>
      <PageHero word={ui.word} intro={ui.intro} explore={ui.explore} targetId="blog-featured" />

      {first && (
        <section id="blog-featured" className="px-5 md:px-9 pt-12 pb-20" style={{ scrollMarginTop: 80 }}>
          <div className="mx-auto grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16" style={{ maxWidth: 1600 }}>
            <div>
              <p style={kicker}>{ui.kickerFeatured}</p>
              <h2 {...roleBtn(() => setOpen(first))} className="mt-7 cursor-pointer text-[34px] lg:text-[50px] hover:[color:var(--c-quartz)] transition-colors" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{first.title}</h2>
              <p className="mt-6 max-w-md" style={{ fontSize: 15, lineHeight: 1.625, color: 'var(--lq-mist)' }}>{first.excerpt}</p>
              <div className="mt-10 flex items-center gap-4" style={metaText}>
                <span>{first.date}</span><span className="h-px w-10" style={{ background: 'var(--c-hairline)' }} /><span>{readMinutes(first)} {ui.min}</span>
              </div>
            </div>
            <div {...roleBtn(() => setOpen(first))} aria-label={first.title} className="group order-first lg:order-none block cursor-pointer overflow-hidden" style={{ border: '1px solid var(--lq-line)' }}>
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/11' }}>
                <BlogCover id={first.id} lang={lang} className="transition-transform duration-[900ms] ease-out group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <span style={{ ...kicker, letterSpacing: '0.2em' }}>{ui.read}</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: 'var(--lq-silver)' }}><Arrow /></span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-5 md:px-9 pb-24">
        <div className="mx-auto" style={{ maxWidth: 1600 }}>
          <div className="flex items-end justify-between pt-14 pb-12">
            <h2 className="text-[30px] sm:text-[38px]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.01em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{ui.archive}</h2>
            <p style={metaText}>{String(rest.length).padStart(2, '0')} {ui.stories}</p>
          </div>
          <div className="relative">
            <div className="blog-ink" aria-hidden="true"><i style={{ transform: `scaleY(${ink})` }} /><span style={{ top: `${ink * 100}%` }}><PenIcon size={22} /></span></div>
            <ul ref={listRef} className="border-t" style={{ borderColor: 'var(--lq-line)' }}>
              {rest.map((p, i) => <Row key={p.id} p={p} n={i + 1} ui={ui} onOpen={() => setOpen(p)} lang={lang} />)}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
