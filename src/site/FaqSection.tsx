import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '../translations';
import { pagePath } from '../lib/routes';
import { FAQ_UI } from './i18n/faq';
import { FAQ_PAGE_UI } from './i18n/faqPage';
import FaqCards from './FaqCards';

gsap.registerPlugin(ScrollTrigger);

export default function FaqSection({ lang }: { lang: Lang }) {
  const ui = FAQ_UI[lang];
  const root = useRef<HTMLElement>(null);
  
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-reveal]', {
          opacity: 0, y: 28, duration: 0.8, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        });
      });
    }, root);
    return () => { ctx.revert(); mm.revert(); };
  }, [lang]);

  return (
    <section id="faq" ref={root} className="relative">
      <div className="mx-auto px-5 md:px-9 pt-[68px] lg:pt-24 pb-10" style={{ maxWidth: 1200 }}>
        <div>
          <h2 data-reveal style={{ fontSize: 'clamp(32px, 3.1vw, 44px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', maxWidth: 520 }}>{ui.title}</h2>
          <p data-reveal className="mt-8" style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lq-silver)', maxWidth: 540 }}>{ui.p1}</p>
          <p data-reveal className="mt-4" style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lq-silver)', maxWidth: 540 }}>{ui.p2}</p>
        </div>
      </div>
      <div className="mx-auto px-5 md:px-9 pb-[68px] lg:pb-24" style={{ maxWidth: 1200 }}>
        <div data-reveal><FaqCards items={ui.items.slice(0, 5)} id="faqh" /></div>
        <Link
          data-reveal
          to={pagePath(lang, 'faq')}
          className="inline-flex items-center gap-2 mt-8 px-6 py-3"
          style={{ border: '1px solid var(--lq-line-strong)', borderRadius: 999, color: 'var(--lq-mist)', fontSize: 14 }}
        >
          {FAQ_PAGE_UI[lang].all}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </section>
  );
}
