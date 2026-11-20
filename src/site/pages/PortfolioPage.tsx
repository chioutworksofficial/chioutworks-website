import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { T, type Lang } from '../../translations';
import { PROJECTS } from '../../data/sections';
import { PORTFOLIO_PAGE_UI } from '../i18n/portfolioPage';
import { lqCard } from '../lqCard';
import Duotone from '../Duotone';
import BtnArrow from '../BtnArrow';

gsap.registerPlugin(ScrollTrigger);

const FULL: Record<string, string> = { workero: '/images/workero-full.webp', tmpr: '/images/tmpr-full.webp' };
const kicker: React.CSSProperties = { fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' };
const h2: React.CSSProperties = { fontSize: 'clamp(32px, 4.6vw, 61px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' };

function Duo({ src, alt }: { src: string; alt: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="h-full" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <Duotone src={src} alt={alt} active={hov} fit="object-top" className="h-full" />
    </div>
  );
}

const pill: React.CSSProperties = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--lq-line-strong)', borderRadius: 999, padding: '5px 12px', color: 'var(--lq-mist)' };

export default function PortfolioPage({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const ui = PORTFOLIO_PAGE_UI[lang];
  const live = T[lang].ui.live;
  const projects = PROJECTS[lang];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-hero]', { y: 28, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) =>
          gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
      });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  return (
    <section id="portfolio" ref={root} style={{ color: 'var(--lq-silver)', overflow: 'clip' }}>
      {/* hero */}
      <div className="pf-hero relative overflow-hidden px-5 md:px-9 flex items-center" style={{ minHeight: '70vh', paddingTop: 76 + 60, paddingBottom: 80 }}>
        <div aria-hidden className="deco-fade absolute inset-0 pointer-events-none">
          <span className="absolute left-1/2 top-1/2 rounded-full" style={{ width: 900, height: 900, maxWidth: '160vw', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g2) 18%, transparent), transparent 65%)' }} />
          {[1300, 960, 640].map((s) => <span key={s} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: s, height: s, transform: 'translate(-50%,-50%)', border: '1px solid var(--lq-line)' }} />)}
        </div>
        <div className="relative mx-auto w-full" style={{ maxWidth: 1200 }}>
          <p data-hero style={kicker}>{ui.kicker}</p>
          <h1 data-hero className="mt-6" style={{ fontSize: 'clamp(44px, 6vw, 96px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', maxWidth: 1000 }}>{ui.title}</h1>
          <p data-hero className="mt-7" style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 560 }}>{ui.intro}</p>
        </div>
      </div>

      {/* projects */}
      <div className="px-5 md:px-9" style={{ paddingBlock: 68 }}>
        <div className="mx-auto flex flex-col" style={{ maxWidth: 1200, gap: 96 }}>
          {projects.map((p, i) => (
            <article key={p.id} data-reveal className="grid items-center gap-8 lg:gap-14 lg:grid-cols-2">
              <div className={i % 2 ? 'lg:order-2' : ''}>
                <div className={`${lqCard(i)} relative overflow-hidden`} style={{ aspectRatio: '16 / 11' }}>
                  <div className="flex items-center gap-2 px-4" style={{ height: 36, borderBottom: '1px solid var(--lq-line)', background: 'var(--lq-deep)' }}>
                    {[0, 1, 2].map((d) => <span key={d} style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--lq-line-strong)' }} />)}
                    <span className="ml-3 truncate" style={{ fontFamily: 'var(--lq-mono)', fontSize: 11, color: 'var(--lq-silver)' }}>{p.url.replace('https://', '')}</span>
                  </div>
                  <div style={{ height: 'calc(100% - 36px)' }}>
                    {FULL[p.id] ? <Duo src={FULL[p.id]} alt={p.name} /> : (
                      <div className="h-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--lq-g2) 25%, transparent), transparent 60%)' }}>
                        <span style={{ fontSize: 96, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-line-strong)' }}>{p.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <span className="absolute flex items-center gap-2" style={{ top: 48, right: 14, ...pill, background: 'color-mix(in srgb, var(--lq-abyss) 70%, transparent)', backdropFilter: 'blur(8px)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--lq-g2)' }} />{live}
                  </span>
                </div>
              </div>
              <div>
                <p style={kicker}>{String(i + 1).padStart(2, '0')} · {p.year}</p>
                <h2 className="mt-4" style={{ fontSize: 'clamp(36px, 3.4vw, 44px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{p.name}</h2>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span style={{ ...pill, color: 'var(--lq-abyss)', background: 'var(--lq-g2)', borderColor: 'transparent' }}>{p.type}</span>
                  {p.stack.map((s) => <span key={s} style={pill}>{s}</span>)}
                </div>
                <p className="mt-6" style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 520 }}>{p.desc}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="lq-btn-ghost">{p.ctaLabel}<BtnArrow /></a>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="rounded-[6px] px-7 py-4" style={{ border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)', fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{ui.visit}</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* how a project runs */}
      <div className="px-5 md:px-9" style={{ paddingBlock: 100, background: 'var(--lq-deep)' }}>
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <div data-reveal className="max-w-3xl">
            <p style={kicker}>{ui.processKicker}</p>
            <h2 className="mt-4" style={h2}>{ui.processTitle}</h2>
          </div>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ui.steps.map((st, i) => (
              <li key={st.t} data-reveal className="lq-card p-6 flex flex-col">
                <span style={{ fontFamily: 'var(--lq-mono)', fontSize: 12, letterSpacing: '0.15em', color: 'var(--lq-g2)' }}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-5" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{st.t}</h3>
                <p className="mt-3" style={{ fontSize: 15, lineHeight: 1.45 }}>{st.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
