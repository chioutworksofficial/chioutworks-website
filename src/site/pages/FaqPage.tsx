import { Link } from 'react-router-dom';
import type { Lang } from '../../translations';
import { pagePath } from '../../lib/routes';
import { FAQ_UI } from '../i18n/faq';
import { FAQ_PAGE_UI } from '../i18n/faqPage';
import FaqCards from '../FaqCards';
import PageHero from '../PageHero';

const pill: React.CSSProperties = { border: '1px solid var(--lq-line-strong)', borderRadius: 999, color: 'var(--lq-mist)', background: 'transparent' };

export default function FaqPage({ lang }: { lang: Lang }) {
  const ui = FAQ_PAGE_UI[lang];
  const items = FAQ_UI[lang].items;
  return (
    <div>
      <PageHero word={ui.word} intro={ui.intro} explore={ui.explore} targetId="faq-cards" />
      <section id="faq-cards" className="mx-auto px-5 md:px-9 pt-12 pb-16" style={{ maxWidth: 1200, scrollMarginTop: 90 }}>
        <FaqCards items={items} id="faqp" />
        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <p style={{ fontSize: 14, color: 'var(--lq-silver)' }}>{ui.still}</p>
          <Link to={pagePath(lang, 'contact')} className="inline-flex items-center gap-2 px-6 py-3" style={{ ...pill, fontSize: 14 }}>
            {ui.write}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
