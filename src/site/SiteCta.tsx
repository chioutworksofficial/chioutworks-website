import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { T, type Lang } from '../translations';
import { pagePath } from '../lib/routes';
import BtnArrow from './BtnArrow';

gsap.registerPlugin(ScrollTrigger);

export default function SiteCta({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const c = T[lang].ctaSection;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-cta]', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } });
      });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  return (
    <section id="start" ref={root} className="relative overflow-hidden px-5 md:px-9" style={{ paddingBlock: 140 }}>
      <div aria-hidden="true" className="deco-fade absolute inset-0 pointer-events-none">
        <span className="absolute left-1/2 top-1/2 rounded-full" style={{ width: 900, height: 900, maxWidth: '160vw', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g2) 22%, transparent), transparent 65%)' }} />
        {[1300, 960, 640].map((s) => (
          <span key={s} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: s, height: s, transform: 'translate(-50%, -50%)', border: '1px solid var(--lq-line)' }} />
        ))}
      </div>
      <div className="relative mx-auto text-center flex flex-col items-center" style={{ maxWidth: 900 }}>
        <h2 data-cta style={{ fontSize: 'clamp(36px, 6vw, 61px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{c.title}</h2>
        <p data-cta className="mt-7 max-w-xl" style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--lq-silver)' }}>{c.sub}</p>
        <Link data-cta to={pagePath(lang, 'contact')} className="mt-10 lq-btn-ghost">
          {c.btn}
          <BtnArrow />
        </Link>
      </div>
    </section>
  );
}
