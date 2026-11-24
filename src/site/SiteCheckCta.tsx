import { Link } from 'react-router-dom';
import type { Lang } from '../translations';
import { SITE_CHECK_UI } from './i18n/siteCheck';
import { pagePath } from '../lib/routes';
import BtnArrow from './BtnArrow';

/** Short home-page call to action for the free website check. */
export default function SiteCheckCta({ lang }: { lang: Lang }) {
  const u = SITE_CHECK_UI[lang];
  return (
    <section className="px-5 md:px-9" style={{ paddingBlock: 'clamp(40px, 7vh, 80px)' }}>
      <div className="lq-card mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5" style={{ maxWidth: 1000, padding: 'clamp(20px, 4vw, 32px)' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, color: 'var(--lq-white)', fontFamily: 'var(--font-display)' }}>{u.ctaTitle}</h2>
          <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5, color: 'var(--lq-mist)', maxWidth: 560 }}>{u.ctaText}</p>
        </div>
        <Link to={pagePath(lang, 'siteCheck')} className="lq-btn-ghost" style={{ flex: '0 0 auto', alignSelf: 'flex-start' }}>{u.ctaBtn}<BtnArrow /></Link>
      </div>
    </section>
  );
}
