import type { Lang } from '../../translations';
import { CONTACT_PAGE_UI } from '../i18n/contactPage';
import CTASection from '../../components/CTASection';

export default function ContactPage({ lang }: { lang: Lang }) {
  const u = CONTACT_PAGE_UI[lang];
  return (
    <section id="contact" className="relative overflow-hidden" style={{ paddingTop: 76 }}>
      <div aria-hidden="true" className="deco-fade absolute inset-x-0 top-0 pointer-events-none" style={{ height: 520 }}>
        <span className="absolute left-1/2 rounded-full" style={{ top: 200, width: 900, height: 900, maxWidth: '160vw', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g2) 18%, transparent), transparent 65%)' }} />
        {[1300, 960, 640].map((s) => (
          <span key={s} className="absolute left-1/2 rounded-full" style={{ top: 200, width: s, height: s, transform: 'translate(-50%, -50%)', border: '1px solid var(--lq-line)' }} />
        ))}
      </div>
      <div className="relative mx-auto px-5 md:px-9 flex flex-col md:flex-row md:items-end md:justify-between gap-6" style={{ maxWidth: 1200, paddingTop: 'clamp(32px, 5vh, 56px)', paddingBottom: 'clamp(28px, 4vh, 44px)' }}>
        <h1 className="select-none" style={{ margin: 0, lineHeight: 0.9, fontSize: 'clamp(56px, 8vw, 104px)', fontWeight: 800, color: 'var(--lq-silver)', letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}>{u.word}</h1>
        <p style={{ margin: 0, maxWidth: 340, fontSize: 14.4, lineHeight: '25.2px', color: 'var(--lq-mist)' }}>{u.intro}</p>
      </div>
      <CTASection lang={lang} />
    </section>
  );
}
