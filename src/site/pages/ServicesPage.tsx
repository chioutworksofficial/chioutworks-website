import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { T, type Lang } from '../../translations';
import { pagePath } from '../../lib/routes';
import PopularPackages from '../PopularPackages';
import { SERVICES_UI } from '../i18n/servicesPage';
import { lqCard } from '../lqCard';
import BtnArrow from '../BtnArrow';

gsap.registerPlugin(ScrollTrigger);

const line = 'var(--lq-line)';
const panel: CSSProperties = { background: 'color-mix(in srgb, var(--lq-abyss) 55%, transparent)', border: '1px solid color-mix(in srgb, var(--lq-white) 18%, transparent)', borderRadius: 10 };
const bar = (w: string | number, h = 8, o = 0.5): CSSProperties => ({ width: w, height: h, borderRadius: 4, background: `color-mix(in srgb, var(--lq-white) ${o * 100}%, transparent)` });
const mono: CSSProperties = { fontFamily: 'var(--lq-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lq-mist)' };

type Mock = ReturnType<(typeof SERVICES_UI)['en']['mock'] extends infer M ? () => M : never>;

function Node({ label, active }: { label: string; active?: boolean }) {
  return (
    <div style={{ ...panel, padding: '12px 16px', minWidth: 110, background: active ? 'color-mix(in srgb, var(--lq-abyss) 80%, transparent)' : panel.background }}>
      <div style={mono}>{label}</div>
      <div className="mt-2" style={bar('70%')} />
    </div>
  );
}

function Automation({ m }: { m: Mock }) {
  const dot = <span style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--lq-gradient)' }} />;
  return (
    <div className="flex flex-col gap-3 items-center">
      <Node label={m.trigger} active />
      <div style={{ width: 1, height: 22, background: 'var(--lq-white)', opacity: 0.4 }} />
      <div className="flex gap-3"><Node label={m.action} /><Node label={m.action} /></div>
      <div style={{ width: 1, height: 22, background: 'var(--lq-white)', opacity: 0.4 }} />
      <div style={{ ...panel, padding: '10px 18px' }} className="flex items-center gap-2">{dot}<span style={mono}>{m.done}</span></div>
    </div>
  );
}

function Wireframe() {
  return (
    <div style={{ ...panel, width: '100%', maxWidth: 340, padding: 14 }}>
      <div className="flex gap-1.5 mb-3">{[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 7, background: 'var(--lq-silver)' }} />)}</div>
      <div style={{ ...bar('100%', 70, 0.14), borderRadius: 6 }} className="flex flex-col justify-center gap-2 p-3"><div style={bar('55%', 10, 0.7)} /><div style={bar('35%', 6)} /></div>
      <div className="grid grid-cols-3 gap-2 mt-3">{[0, 1, 2].map((i) => <div key={i} style={{ ...bar('100%', 54, 0.12), borderRadius: 6 }} />)}</div>
      <div className="mt-3" style={bar('80%', 6)} /><div className="mt-2" style={bar('60%', 6, 0.3)} />
    </div>
  );
}

function Chat({ m }: { m: Mock }) {
  return (
    <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 300 }}>
      <div style={{ ...panel, padding: '10px 14px', alignSelf: 'flex-end', fontSize: 13, color: 'var(--lq-white)' }}>{m.you}</div>
      <div style={{ ...panel, padding: '10px 14px', alignSelf: 'flex-start', background: 'color-mix(in srgb, var(--lq-abyss) 80%, transparent)', fontSize: 13, color: 'var(--lq-white)' }}>{m.bot}</div>
      <div style={{ ...panel, padding: '10px 14px', alignSelf: 'flex-start' }} className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--lq-mist)', opacity: 1 - i * 0.3 }} />)}</div>
    </div>
  );
}

function Chart({ m }: { m: Mock }) {
  const h = [30, 42, 38, 58, 52, 74, 92];
  return (
    <div style={{ ...panel, width: '100%', maxWidth: 340, padding: 16 }}>
      <div className="flex justify-between mb-3"><span style={mono}>{m.visitors}</span><span style={mono}>{m.leads}</span></div>
      <svg viewBox="0 0 280 110" width="100%" aria-hidden="true">
        {h.map((v, i) => <rect key={i} x={i * 40 + 4} y={110 - v} width={26} height={v} rx={4} style={{ fill: 'color-mix(in srgb, var(--lq-white) 22%, transparent)' }} />)}
        <polyline fill="none" strokeWidth={2.5} strokeLinecap="round" style={{ stroke: 'var(--lq-white)' }} points={h.map((v, i) => `${i * 40 + 17},${100 - v}`).join(' ')} />
        {h.map((v, i) => <circle key={i} cx={i * 40 + 17} cy={100 - v} r={3.5} style={{ fill: 'var(--lq-abyss)', stroke: 'var(--lq-white)' }} />)}
      </svg>
    </div>
  );
}

export default function ServicesPage({ lang }: { lang: Lang }) {
  // Light up the bullet chains when they scroll into view (purely visual)
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('.svc-chain')];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-on')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-on'); io.unobserve(e.target); } }), { threshold: 0.4 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  const root = useRef<HTMLElement>(null);
  const t = T[lang];
  const u = SERVICES_UI[lang];
  const mockups: ReactNode[] = [<Automation m={u.mock} />, <Wireframe />, <Chat m={u.mock} />, <Chart m={u.mock} />];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-hero]', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
        gsap.utils.toArray<HTMLElement>('[data-row]').forEach((row) => {
          gsap.from(row.querySelectorAll('[data-in]'), { y: 24, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 75%' } });
        });
        gsap.from('[data-pill]', { y: 18, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out', scrollTrigger: { trigger: '[data-cloud]', start: 'top 80%' } });
        gsap.from('[data-strip]', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '[data-strip]', start: 'top 85%' } });
      });
    }, root);
    return () => ctx.revert();
  }, [lang]);

  return (
    <section id="services" ref={root}>
      {/* hero */}
      <div className="relative overflow-hidden px-5 md:px-9 flex items-center" style={{ minHeight: '70vh', paddingTop: 76 + 56, paddingBottom: 80 }}>
        <div aria-hidden="true" className="deco-fade absolute inset-0 pointer-events-none">
          <span className="absolute rounded-full" style={{ width: 900, height: 900, maxWidth: '160vw', left: '70%', top: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g2) 22%, transparent), transparent 65%)' }} />
          {[1300, 960, 640].map((s) => <span key={s} className="absolute rounded-full" style={{ width: s, height: s, left: '70%', top: '50%', transform: 'translate(-50%, -50%)', border: `1px solid ${line}` }} />)}
        </div>
        <div className="relative mx-auto w-full" style={{ maxWidth: 1200 }}>
          <p data-hero style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' }}>{t.nav[0]}</p>
          <h1 data-hero className="mt-6" style={{ maxWidth: 1000, fontSize: 'clamp(44px, 6vw, 96px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{t.guide.title}</h1>
          <p data-hero className="mt-8" style={{ maxWidth: 560, fontSize: 16, lineHeight: 1.5, color: 'var(--lq-silver)' }}>{u.intro}</p>
        </div>
      </div>

      <PopularPackages lang={lang} />

      {/* services */}
      <div className="px-5 md:px-9">
        <div className="mx-auto flex flex-col" style={{ maxWidth: 1200, gap: 96 }}>
          {t.guide.chapters.map((ch, i) => (
            <div key={i} data-row className="grid md:grid-cols-2 items-center gap-10 md:gap-20">
              <div className={i % 2 ? 'md:order-2' : ''}>
                <div data-in style={{ fontSize: 'clamp(64px, 8vw, 120px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-lavender)' }}>{ch.num}</div>
                <h2 data-in className="mt-6" style={{ fontSize: 'clamp(36px, 4.2vw, 61px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{ch.title}</h2>
                <p data-in className="mt-5" style={{ maxWidth: 520, fontSize: 16, lineHeight: 1.5, color: 'var(--lq-mist)' }}>{ch.desc}</p>
                {/* Bullets joined by a thin cable that draws down when the list comes into view; dots light up one by one */}
                <ul data-in className="svc-chain mt-6 flex flex-col gap-3" style={{ maxWidth: 520 }}>
                  {u.bullets[i].map((b, k) => (
                    <li key={b} className="flex gap-3 items-start" style={{ fontSize: 15, lineHeight: 1.4, color: 'var(--lq-silver)', ['--i' as string]: k }}>
                      <span aria-hidden="true" className="svc-dot shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </div>
              <div data-in className={`${lqCard(i)} relative overflow-hidden flex items-center justify-center ${i % 2 ? 'md:order-1' : ''}`}
                style={{ minHeight: 380, padding: 28 }}>
                <span aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '45%', background: 'linear-gradient(180deg, color-mix(in srgb, var(--lq-white) 18%, transparent), transparent)' }} />
                <div className="relative w-full flex justify-center">{mockups[i]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* sectors */}
      <div className="px-5 md:px-9" style={{ paddingBlock: 140 }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1000 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' }}>{t.usecases.eyebrow}</p>
          <h2 className="mt-5" style={{ fontSize: 'clamp(36px, 4.2vw, 61px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{t.usecases.title}</h2>
          <div data-cloud className="mt-12 flex flex-wrap justify-center gap-3">
            {t.usecases.tags.map((tag) => (
              <span key={tag} data-pill className="rounded-full px-5 py-2.5"
                style={{ fontSize: 15, color: 'var(--lq-mist)', background: 'var(--lq-kelp)', border: `1px solid ${line}`, transition: 'border-color .2s, color .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lq-g2)'; e.currentTarget.style.color = 'var(--lq-white)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--lq-line)'; e.currentTarget.style.color = 'var(--lq-mist)'; }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div className="px-5 md:px-9" style={{ paddingBottom: 100 }}>
        <div data-strip className="lq-card mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden" style={{ maxWidth: 1200, padding: 36 }}>
          <span aria-hidden="true" className="absolute pointer-events-none" style={{ width: 500, height: 500, right: -120, top: -250, background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g2) 25%, transparent), transparent 65%)' }} />
          <div className="relative">
            <h3 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{u.ctaTitle}</h3>
            <p className="mt-3" style={{ fontSize: 15, lineHeight: 1.4, color: 'var(--lq-silver)', maxWidth: 520 }}>{u.ctaSub}</p>
          </div>
          <Link to={pagePath(lang, 'contact')} className="relative lq-btn-ghost self-start md:self-auto">{u.ctaBtn}<BtnArrow /></Link>
        </div>
      </div>
    </section>
  );
}
