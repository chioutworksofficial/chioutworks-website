import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '../translations';
import { PROJECTS } from '../data/sections';
import { OUTRO_UI } from './i18n/outro';
import { lqCard } from './lqCard';
import Duotone from './Duotone';

gsap.registerPlugin(ScrollTrigger);

const IMG: Record<string, string> = { workero: '/images/workero-preview.webp', tmpr: '/images/tmpr-preview.webp' };

export default function ProjectsCarousel({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState<string | null>(null);
  const ui = OUTRO_UI[lang];
  const projects = PROJECTS[lang];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-p-head]', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
        gsap.from('[data-p-card]', { y: 50, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: track.current, start: 'top 85%' } });
      });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  const scrollBy = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 440), behavior: reduce ? 'auto' : 'smooth' });
  };

  const btn = { border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase' as const };

  return (
    <section id="projects" ref={root} className="relative" style={{ paddingBlock: 96 }}>
      <div className="mx-auto px-5 md:px-9" style={{ maxWidth: 1200 }}>
        <div data-p-head className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <p className="mb-4" style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' }}>{ui.kicker}</p>
            <h2 style={{ fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{ui.projectsTitle}</h2>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => scrollBy(-1)} aria-label={ui.prev} className="rounded-[6px] px-4 py-3" style={btn}>←</button>
            <button type="button" onClick={() => scrollBy(1)} aria-label={ui.next} className="rounded-[6px] px-4 py-3" style={btn}>→</button>
          </div>
        </div>

        <div ref={track} className="flex gap-5 overflow-x-auto pb-4" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
          {projects.map((p, i) => (
            <article key={p.id} data-p-card onMouseEnter={() => setHov(p.id)} onMouseLeave={() => setHov(null)} className={`${lqCard(i)} shrink-0 flex flex-col p-4`}
              style={{ width: 'min(86vw, 440px)', scrollSnapAlign: 'start' }}>
              <Duotone src={IMG[p.id] ?? p.logo} alt={p.name} active={hov === p.id} fit="object-top" className="mb-5 [aspect-ratio:16/10] rounded-[10px]" />
              <div className="flex flex-wrap gap-2 mb-4">
                {p.stack.map((s) => (
                  <span key={s} className="rounded-full px-3 py-1" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--lq-mist)', border: '1px solid var(--lq-line-strong)' }}>{s}</span>
                ))}
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{p.name}</h3>
              <p className="mt-3 mb-5" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--lq-silver)' }}>{p.desc}</p>
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-auto self-start" style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lq-white)' }}>
                  {ui.open} →
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
