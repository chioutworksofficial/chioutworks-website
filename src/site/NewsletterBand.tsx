import { useEffect, useRef } from 'react';
import type { Lang } from '../translations';
import { SITE_CHECK_UI } from './i18n/siteCheck';
import NewsletterBox from './NewsletterBox';

// four circuit traces end at a central chip; a light pulse travels along each (CSS only, paused off-screen)
const TRACES = ['M0 60 H190 L230 100 H420 L450 130', 'M0 240 H160 L210 190 H400 L440 165', 'M1000 70 H820 L780 110 H600 L560 135', 'M1000 235 H850 L800 190 H610 L565 162'];

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
        <svg className="nl-art" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {TRACES.map((d, i) => (
            <g key={i} className={`nl-t nl-t${i}`}>
              <path d={d} className="nl-line" />
              <path d={d} pathLength={1000} className="nl-pulse" />
              <circle cx={i % 2 ? (i < 2 ? 440 : 565) : (i < 2 ? 450 : 560)} cy={[130, 165, 135, 162][i]} r="3" className="nl-dot" />
            </g>
          ))}
          <rect x="455" y="115" width="110" height="70" rx="10" className="nl-chip" />
          <rect x="475" y="132" width="70" height="36" rx="5" className="nl-chip-in" />
        </svg>
        <div className="nl-body">
          <h2 id="nl-hook">{u.nlHook}</h2>
          <p className="nl-sub">{u.nlSub}</p>
          <NewsletterBox lang={lang} source="band" band />
        </div>
      </div>
    </section>
  );
}
