import { useEffect, useRef } from 'react';
import type { Lang } from '../translations';
import { SITE_CHECK_UI } from './i18n/siteCheck';
import NewsletterBox from './NewsletterBox';

// four circuit traces end at a central chip; a light pulse travels along each (CSS only, paused off-screen)
const TRACES = ['M0 40 H90 L130 80 H150 L188 132', 'M0 260 H80 L120 220 H150 L188 168', 'M500 40 H410 L370 80 H350 L312 132', 'M500 260 H420 L380 220 H350 L312 168'];

/** Full-width opt-in band above the footer: honest hook, inline e-mail field, circuit-board background. */
export default function NewsletterBand({ lang }: { lang: Lang }) {
  const u = SITE_CHECK_UI[lang]; const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('nl-on', e.isIntersecting), { rootMargin: '80px' });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="nl-band" aria-labelledby="nl-hook">
      <div className="nl-card">
        <div className="nl-body">
          <h2 id="nl-hook">{u.nlHook}</h2>
          <p className="nl-sub">{u.nlSub}</p>
          <NewsletterBox lang={lang} source="band" band />
        </div>
        <svg className="nl-art" viewBox="50 20 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <circle cx="250" cy="150" r="120" className="nl-halo" />
          {TRACES.map((d, i) => (
            <g key={i} className={`nl-t nl-t${i}`}>
              <path d={d} className="nl-line" />
              <path d={d} pathLength={1000} className="nl-pulse" />
              <circle cx={[188, 188, 312, 312][i]} cy={[132, 168, 132, 168][i]} r="3.5" className="nl-dot" />
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} className="nl-pin"><rect x={202 + i * 24} y="82" width="4" height="10" rx="1" /><rect x={202 + i * 24} y="208" width="4" height="10" rx="1" /></g>
          ))}
          <rect x="190" y="90" width="120" height="120" rx="14" className="nl-chip" />
          <rect x="214" y="114" width="72" height="72" rx="8" className="nl-chip-in" />
          <circle cx="250" cy="150" r="9" className="nl-core" />
        </svg>
      </div>
    </section>
  );
}
