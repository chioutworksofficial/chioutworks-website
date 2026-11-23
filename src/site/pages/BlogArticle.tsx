import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS, type BlogPost } from '../../data/sections';
import { T, type Lang } from '../../translations';
import { blogPath, pagePath } from '../../lib/routes';
import { usePageMeta } from '../../hooks/usePageMeta';
import { articleLd } from '../../lib/structuredData';
import { BLOG_PAGE_UI } from '../i18n/blogPage';
import BlogCover from '../BlogCover';
import { readMinutes } from '../blogMeta';

/**
 * Blog article on its own page (owner, 2026-11-19; replaces the full-screen overlay): /:lang/blog/:id.
 * Pen theme: a reading line with a pen riding its tip, the title underlined by a pen stroke, and key figures
 * (**bold**) underlined by hand when they scroll into view. Sources are listed under the text.
 */
const label: React.CSSProperties = { fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' };
const Arrow = ({ flip }: { flip?: boolean }) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
export const PenIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14.5 3.5l6 6L9 21H3v-6z" fill="var(--c-abyss)" stroke="var(--c-lilac)" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12.5 5.5l6 6" stroke="var(--c-lilac)" strokeWidth="1.6" />
    <path d="M3 21l3.2-1-2.2-2.2z" fill="var(--c-lilac)" />
  </svg>
);
const SOURCES: Record<Lang, string> = { tr: 'Kaynaklar', en: 'Sources', de: 'Quellen', el: 'Πηγές' };

export default function BlogArticle({ lang, id }: { lang: Lang; id: string }) {
  const ui = BLOG_PAGE_UI[lang];
  const u = T[lang].ui;
  const posts = BLOG_POSTS[lang];
  const post = posts.find((p) => p.id === id) ?? posts[0];
  usePageMeta(lang, 'blog', { title: `${post.title} — Chioutworks`, description: post.excerpt.slice(0, 155), path: blogPath(lang, post.id), alt: (l) => blogPath(l, post.id), crumbs: [{ name: post.title, path: blogPath(lang, post.id) }], ld: [articleLd(lang, post, BLOG_POSTS.en.find((p) => p.id === post.id)?.date, blogPath(lang, post.id))] });
  const idx = posts.findIndex((p) => p.id === post.id);
  const prev = posts[idx - 1], next = posts[idx + 1];
  const more = posts.filter((p) => p.id !== post.id).slice(0, 3);
  const paras = (post.content ?? post.excerpt).split('\n\n');
  const art = useRef<HTMLElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const barPen = useRef<HTMLSpanElement>(null);
  const pen = useRef<HTMLSpanElement>(null);
  const band = useRef<HTMLSpanElement>(null);
  const sweep = useRef<HTMLElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<{ h: number; d: string; ticks: number[] }>({ h: 0, d: '', ticks: [] });

  /*
   * Reading pen (owner, 2026-11-19): the pen follows the line the visitor is reading, like eyes moving down the
   * page. The reading point sits at 42% of the viewport; the pen snaps to the text line under it, a faint band
   * sweeps across that line, and a hand-drawn ink line grows in the margin behind the pen with a small tick at
   * every paragraph it passes. Figures in **bold** light up once the pen has passed them. No underlining.
   * Everything moves through refs (no React re-render per scroll frame).
   */
  useEffect(() => {
    const box = text.current; if (!box) return;
    type Block = { top: number; h: number; lh: number };
    let blocks: Block[] = [], marks: { el: HTMLElement; top: number }[] = [], ticks: number[] = [];
    let total = 1, h = 1, raf = 0;
    const measure = () => {
      const els = [...box.children].filter((el) => el.matches('p,h2')) as HTMLElement[];
      blocks = els.map((el) => {
        const lh = parseFloat(getComputedStyle(el).lineHeight) || 30;
        return { top: el.offsetTop, h: el.offsetHeight, lh };
      });
      ticks = els.filter((el) => el.tagName === 'P').map((el) => el.offsetTop + 6);
      marks = [...box.querySelectorAll<HTMLElement>('.blog-mark')].map((el) => {
        let top = 0; let n: HTMLElement | null = el;
        while (n && n !== box) { top += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
        return { el, top };
      });
      h = box.offsetHeight;
      // hand-drawn margin line: gentle wobble every 18px
      let d = 'M 6 0';
      for (let y = 18, i = 1; y <= h + 18; y += 18, i++) d += ` L ${(6 + Math.sin(i * 0.7) * 1.3 + Math.sin(i * 2.3) * 0.6).toFixed(2)} ${Math.min(y, h)}`;
      setGeo({ h, d, ticks });
    };
    const tick = () => {
      raf = 0;
      const a = art.current;
      if (a && bar.current) {
        const r = a.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / Math.max(1, r.height)));
        bar.current.style.transform = `scaleX(${p})`;
        if (barPen.current) barPen.current.style.left = `${p * 100}%`;
      }
      if (!blocks.length) return;
      const readY = window.innerHeight * 0.42 - box.getBoundingClientRect().top;
      const on = readY > blocks[0].top - 40 && readY < h + 80;
      let b = blocks[0];
      for (const x of blocks) { if (x.top <= readY) b = x; else break; }
      const lines = Math.max(1, Math.round(b.h / b.lh));
      const idx = Math.min(lines - 1, Math.max(0, Math.floor((readY - b.top) / b.lh)));
      const lineTop = b.top + idx * b.lh;
      const frac = readY < b.top ? 0 : readY > b.top + b.h ? 1 : Math.min(1, Math.max(0, (readY - lineTop) / b.lh));
      const tipY = lineTop + b.lh * 0.55;
      if (pen.current) {
        pen.current.style.opacity = on ? '1' : '0';
        pen.current.style.transform = `translate(0, ${tipY}px) rotate(${idx % 2 ? -5 : 4}deg)`;
      }
      if (band.current) {
        band.current.style.opacity = on && readY <= h ? '1' : '0';
        band.current.style.transform = `translateY(${lineTop}px)`;
        band.current.style.height = `${b.lh}px`;
      }
      if (sweep.current) sweep.current.style.transform = `scaleX(${0.08 + frac * 0.92})`;
      const drawn = Math.max(0, Math.min(h, tipY));
      if (trail.current) trail.current.style.strokeDashoffset = String(total * (1 - drawn / Math.max(1, h)));
      box.querySelectorAll<SVGElement>('.blog-tick').forEach((t, i) => t.classList.toggle('is-on', ticks[i] !== undefined && ticks[i] < drawn));
      for (const m of marks) m.el.classList.toggle('is-on', m.top < readY);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    measure();
    requestAnimationFrame(() => {
      if (trail.current) { total = trail.current.getTotalLength() || 1; trail.current.style.strokeDasharray = String(total); }
      tick();
    });
    const ro = new ResizeObserver(() => { measure(); requestAnimationFrame(() => { if (trail.current) { total = trail.current.getTotalLength() || 1; trail.current.style.strokeDasharray = String(total); } tick(); }); });
    ro.observe(box);
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); ro.disconnect(); };
  }, [post.id]);

  const navLink = (p: BlogPost | undefined, text: string, back: boolean) => p
    ? <Link to={blogPath(lang, p.id)} className={`group inline-flex items-center gap-2.5 transition-colors hover:[color:var(--c-quartz)] ${back ? '' : 'ml-auto'}`} style={{ ...label, fontWeight: 500, color: 'var(--lq-silver)' }}>{back && <Arrow flip />}{text}{!back && <Arrow />}</Link>
    : <span />;

  return (
    <div style={{ color: 'var(--lq-mist)' }}>
      {/* pen reading line */}
      <div className="blog-readline" aria-hidden="true"><i ref={bar} style={{ transform: 'scaleX(0)' }} /><span ref={barPen} style={{ left: 0 }}><PenIcon size={20} /></span></div>

      {/* Hero: title on the left, the notebook cover as a framed card on the right (no busy full-bleed background) */}
      <div className="relative w-full overflow-hidden">
        <span aria-hidden className="absolute pointer-events-none" style={{ right: '-10%', top: '-20%', width: 800, height: 800, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.22, background: 'var(--c-signal)' }} />
        <div className="relative mx-auto grid gap-10 px-5 md:px-9 pb-12 lg:grid-cols-[1.05fr_1fr] lg:items-center" style={{ maxWidth: 1200, paddingTop: 120 }}>
          <div className="order-2 lg:order-1">
            <span style={{ ...label, color: 'var(--lq-lavender)' }}>{post.tag}</span>
            <h1 className="text-[32px] md:text-[50px]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: '16px 0 0' }}>{post.title}</h1>
            <svg className="blog-title-stroke" viewBox="0 0 400 14" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 C 80 3, 160 12, 240 6 S 360 4, 398 8" pathLength={1} /></svg>
            <p className="mt-6" style={{ fontSize: 16.5, lineHeight: 1.6, color: 'var(--lq-silver)', maxWidth: 560 }}>{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2" style={{ ...label, color: 'var(--lq-mist)' }}>
              <span>{post.date}</span><span className="h-px w-6" style={{ background: 'var(--c-hairline)' }} /><span style={{ color: 'var(--lq-lavender)' }}>{readMinutes(post)} {ui.min}</span>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative overflow-hidden" style={{ aspectRatio: '16/11', borderRadius: 20, border: '1px solid var(--lq-line)', boxShadow: '0 40px 90px -40px color-mix(in srgb, var(--c-signal) 70%, transparent)' }}>
            <BlogCover id={post.id} lang={lang} />
          </div>
        </div>
      </div>

      <article ref={art} className="mx-auto px-5 md:px-9 pt-12 pb-24" style={{ maxWidth: 1100 }}>
        <Link to={pagePath(lang, 'blog')} className="inline-flex items-center gap-2 transition-colors hover:[color:var(--c-quartz)]" style={{ ...label, fontWeight: 500, color: 'var(--lq-silver)' }}><Arrow flip />{ui.allArticles}</Link>
        <div ref={text} className="blog-body relative mt-12" style={{ maxWidth: 760 }}>
          {/* reading pen layer: band on the current line, margin ink line with paragraph ticks, the pen itself */}
          <span ref={band} className="blog-band" aria-hidden="true"><i ref={sweep} /></span>
          <svg className="blog-trail" width="12" height={geo.h || 1} viewBox={`0 0 12 ${geo.h || 1}`} aria-hidden="true">
            <path ref={trail} d={geo.d} />
            <circle className="blog-start" cx="6" cy="0" r="3.2" />
            {geo.ticks.map((y, i) => <circle key={i} className="blog-tick" cx="6" cy={y + 6} r="2.4" />)}
          </svg>
          <span ref={pen} className="blog-pen" aria-hidden="true"><PenIcon size={26} /></span>
          {paras.map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**') && para.indexOf('**', 2) === para.length - 2)
              return <h2 key={i} style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', lineHeight: 1.15, color: 'var(--lq-white)', margin: '48px 0 14px' }}>{para.slice(2, -2)}</h2>;
            return (
              <p key={i} style={{ fontSize: 17.5, lineHeight: 1.8, color: 'var(--lq-mist)', margin: i ? '22px 0 0' : 0, whiteSpace: 'pre-line' }}>
                {para.split(/\*\*([^*]+)\*\*/g).map((s, j) => (j % 2 ? <strong key={j} className="blog-mark">{s}</strong> : s))}
              </p>
            );
          })}
        </div>

        {post.sources && post.sources.length > 0 && (
          <section className="mt-14 pt-6" style={{ maxWidth: 760, borderTop: '1px solid var(--lq-line)' }}>
            <h2 style={{ ...label, fontWeight: 600, color: 'var(--lq-lavender)', margin: 0 }}>{SOURCES[lang]}</h2>
            <ol className="mt-4 flex flex-col gap-2" style={{ paddingLeft: 18, margin: '16px 0 0' }}>
              {post.sources.map((s) => <li key={s.url} style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--lq-silver)' }}><a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lq-silver)', textDecoration: 'underline' }}>{s.t}</a></li>)}
            </ol>
          </section>
        )}

        <div className="mt-14 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between" style={{ maxWidth: 760, borderRadius: 16, border: '1px solid var(--lq-line)', background: 'var(--lq-kelp)' }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--lq-mist)', margin: 0 }}>{ui.ctaTitle}</p>
          <Link to={pagePath(lang, 'contact')} className="inline-flex shrink-0 items-center gap-2.5 px-5 py-2.5" style={{ fontSize: 14, fontWeight: 500, color: 'var(--lq-white)', border: '1px solid var(--c-hairline)' }}>{u.workWithMe}<Arrow /></Link>
        </div>

        <nav className="mt-14 flex items-stretch justify-between gap-4 pt-6" style={{ borderTop: '1px solid var(--lq-line)' }}>
          {navLink(prev, ui.prev, true)}{navLink(next, ui.next, false)}
        </nav>

        <section className="mt-20">
          <h2 style={{ ...label, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--lq-lavender)' }}>{ui.keep}</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 pt-8 md:grid-cols-3" style={{ borderTop: '1px solid var(--lq-line)' }}>
            {more.map((p, i) => (
              <Link key={p.id} to={blogPath(lang, p.id)} className="group block lq-square">
                <div className="relative mb-5 w-full overflow-hidden" style={{ aspectRatio: '16/11', border: '1px solid var(--lq-line)' }}>
                  <BlogCover id={p.id} lang={lang} className="transition-transform duration-[900ms] ease-out group-hover:scale-105" />
                </div>
                <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--lq-lavender)' }}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 transition-colors group-hover:[color:var(--c-quartz)]" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.35, fontFamily: 'var(--font-display)', color: 'var(--lq-mist)' }}>{p.title}</h3>
                <p className="mt-2 line-clamp-2" style={{ fontSize: 13, lineHeight: 1.625, color: 'var(--lq-silver)' }}>{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
