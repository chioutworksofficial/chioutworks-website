import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Lang } from '../translations';
import { SITE_CHECK_UI, SITE_CHECK_AREAS } from './i18n/siteCheck';
import { pagePath } from '../lib/routes';
import BtnArrow from './BtnArrow';

const KEYS = ['positioning', 'clarity', 'cta', 'trust', 'seo', 'mobile'] as const;
const FILL = [0.82, 0.64, 0.9, 0.52, 0.74, 0.88]; // illustrative sample view, labelled as such

/** Home-page band for the free website check: hook, button and an animated sample scan (CSS only, paused off-screen). */
export default function SiteCheckCta({ lang }: { lang: Lang }) {
  const u = SITE_CHECK_UI[lang]; const a = SITE_CHECK_AREAS[lang]; const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('sc-on', e.isIntersecting), { rootMargin: '80px' });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="sc-band" aria-labelledby="sc-hook">
      <div className="sc-card">
        <div className="sc-text">
          <h2 id="sc-hook">{u.scHook}</h2>
          <p>{u.scSub}</p>
          <Link to={pagePath(lang, 'siteCheck')} className="sc-btn">{u.ctaBtn}<BtnArrow /></Link>
        </div>
        <div className="sc-vis" role="img" aria-label={`${u.ctaTitle}: ${u.scSample}`}>
          <div className="sc-frame" aria-hidden="true">
            <div className="sc-bar"><i /><i /><i /><span className="sc-url" /></div>
            <div className="sc-page">
              <span className="sc-sk sc-sk1" /><span className="sc-sk sc-sk2" /><span className="sc-sk sc-sk3" />
              <span className="sc-scan" />
            </div>
            <ul className="sc-rows">
              {KEYS.map((k, i) => (
                <li key={k} style={{ ['--w' as string]: FILL[i], ['--d' as string]: `${i * 0.55}s` }}>
                  <span className="sc-lbl">{a[k]}</span>
                  <span className="sc-track"><span className="sc-fill" /></span>
                </li>
              ))}
            </ul>
          </div>
          <small className="sc-cap">{u.scSample}</small>
        </div>
      </div>
    </section>
  );
}
