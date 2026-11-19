import { SCRUB } from '../../lib/smoothScroll';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { T, type Lang } from '../../translations';
import { ABOUT, LANGUAGES, LANG_HEADER } from '../../data/sections';
import { ABOUT_UI } from '../i18n/aboutPage';
import { lqCard } from '../lqCard';

gsap.registerPlugin(ScrollTrigger);

const kicker = { fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' } as const;
const h2 = { fontSize: 'clamp(36px, 5vw, 61px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' } as const;

export default function AboutPage({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const a = ABOUT[lang];
  const u = ABOUT_UI[lang];
  const lh = LANG_HEADER[lang];
  const langs = LANGUAGES[lang];
  const stats = T[lang].stats;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-in]').forEach((el) => {
          gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
        });
        gsap.fromTo('[data-fill]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-tl]', start: 'top 60%', end: 'bottom 60%', scrub: SCRUB } });
        gsap.utils.toArray<HTMLElement>('[data-node]').forEach((el) => {
          gsap.fromTo(el, { opacity: 0.35 }, { opacity: 1, scrollTrigger: { trigger: el, start: 'top 62%', toggleActions: 'play none none reverse' } });
        });
        gsap.utils.toArray<HTMLElement>('[data-bar]').forEach((el) => {
          gsap.from(el, { scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
        });
      });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  return (
    <section id="about" ref={root} style={{ color: 'var(--lq-silver)', fontFamily: 'var(--lq-font)' }}>
      {/* HERO */}
      <div className="relative overflow-hidden px-5 md:px-9" style={{ minHeight: '70vh', paddingTop: 76 + 80, paddingBottom: 80 }}>
        <div aria-hidden="true" className="deco-fade absolute inset-0 pointer-events-none">
          <span className="absolute left-1/2 top-1/2 rounded-full" style={{ width: 900, height: 900, maxWidth: '160vw', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g2) 20%, transparent), transparent 65%)' }} />
          {[1300, 960, 640].map((s) => (
            <span key={s} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: s, height: s, transform: 'translate(-50%, -50%)', border: '1px solid var(--lq-line)' }} />
          ))}
        </div>
        <div className="relative mx-auto flex flex-col justify-center" style={{ maxWidth: 1200, minHeight: 'calc(70vh - 160px)' }}>
          <p data-in style={kicker}>{a.eyebrow}</p>
          <h1 data-in className="mt-6" style={{ fontSize: 'clamp(44px, 6vw, 96px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', maxWidth: 1100 }}>{a.title}</h1>
          <p data-in className="mt-8" style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 560 }}>{u.intro}</p>
        </div>
      </div>

      {/* FOUNDER */}
      <div className="px-5 md:px-9" style={{ paddingBlock: 68 }}>
        <div className="mx-auto grid gap-12 lg:gap-20 lg:grid-cols-[minmax(280px,440px)_1fr] items-start" style={{ maxWidth: 1200 }}>
          <div data-in className="relative">
            <span aria-hidden="true" className="absolute pointer-events-none" style={{ inset: '-20%', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g2) 28%, transparent), transparent 65%)' }} />
            <div className="lq-card relative overflow-hidden">
              <img src="/IMG_7937.png" alt="Chousein Chiout" style={{ display: 'block', width: '100%', height: 'auto' }} />
              <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--lq-abyss) 85%, transparent))' }} />
              <div className="absolute left-4 bottom-4">
                <p style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>Chousein Chiout</p>
                <p style={{ ...kicker, fontSize: 11, marginTop: 4 }}>{u.role.split('Chioutworks').flatMap((part, i) => (i === 0 ? [part] : [<span key={i} lang="en">Chioutworks</span>, part]))} · Kelsterbach, {{ en: 'Germany', de: 'Deutschland', tr: 'Almanya', el: 'Γερμανία' }[lang]}</p>
              </div>
            </div>
          </div>
          <div>
            <p data-in style={kicker}>{u.storyKicker}</p>
            <div className="mt-8 flex flex-col gap-5">
              {a.paragraphs.map((p, i) => (
                <p key={i} data-in style={{ fontSize: 16, lineHeight: 1.5, color: i === 0 ? 'var(--lq-mist)' : 'var(--lq-silver)' }}>{p}</p>
              ))}
            </div>
            <a data-in href="https://www.linkedin.com/in/chousein-chiout-29345323a/" target="_blank" rel="noreferrer" className="mt-10 lq-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              {a.linkedinBtn}
            </a>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="px-5 md:px-9" style={{ paddingBlock: 68 }}>
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <p data-in style={kicker}>{u.journeyKicker}</p>
          <h2 data-in className="mt-5" style={h2}>{u.journeyTitle}</h2>
          <div data-tl className="relative mt-16 md:mt-24 mx-auto" style={{ maxWidth: 820 }}>
            <span aria-hidden="true" className="absolute top-0 bottom-0" style={{ left: 19, width: 2, background: 'var(--lq-line)' }} />
            <span data-fill aria-hidden="true" className="absolute top-0 bottom-0" style={{ left: 19, width: 2, background: 'linear-gradient(180deg, var(--lq-g1), var(--lq-g2), var(--lq-g3))', transformOrigin: 'top center' }} />
            <ol className="flex flex-col gap-16 md:gap-24">
              {a.timeline.map(([icon, label], i) => (
                <li key={i} data-node className="relative flex items-start gap-6" style={{ paddingLeft: 0 }}>
                  <span className="relative shrink-0 flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: 'var(--lq-abyss)', border: '1px solid var(--lq-line-strong)', fontSize: 13, color: 'var(--lq-white)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={`${lqCard(1)} flex-1 p-6`}>
                    <div style={{ fontSize: 'clamp(22px, 2.6vw, 32px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{label}</div>
                    <div className="mt-3" style={{ fontSize: 20 }} aria-hidden="true">{icon}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="px-5 md:px-9" style={{ paddingBlock: 68 }}>
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <p data-in style={kicker}>{u.statsKicker}</p>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(([n, l], i) => (
              <div key={i} data-in className={`${lqCard(i + 2)} p-6 md:p-8`}>
                <div style={{ fontSize: 'clamp(48px, 6vw, 96px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-lavender)' }}>{n}</div>
                <div className="mt-4" style={{ ...kicker, fontSize: 11 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LANGUAGES */}
      <div className="px-5 md:px-9" style={{ paddingBlock: 68, paddingBottom: 140 }}>
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <p data-in style={kicker}>{lh.eyebrow}</p>
          <h2 data-in className="mt-5" style={{ ...h2, maxWidth: 900 }}>{lh.title}</h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {langs.map((l, i) => (
              <div key={i} data-in className={`${lqCard(i)} p-6 md:p-8`}>
                <div style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{l.name}</div>
                <div className="mt-3" style={{ ...kicker, fontSize: 11 }}>{l.level}</div>
                <div className="mt-6 flex gap-1.5" role="img" aria-label={`${u.langHint}: ${l.level}`}>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <span key={k} data-bar className="flex-1" style={{ height: 6, borderRadius: 3, background: k < Math.round(l.pct / 20) ? 'linear-gradient(90deg, var(--lq-g1), var(--lq-g2))' : 'var(--lq-line)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
