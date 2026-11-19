import { useEffect } from 'react';
import LegalLayout from './LegalLayout';
import { useLang } from '../hooks/useLang';
import { PRIVACY } from '../data/legalTranslations';

export default function PrivacyPolicy() {
  const [lang] = useLang();
  const d = PRIVACY[lang];
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) { window.scrollTo(0, 0); return; }
    // Opened from a link such as "Details →" in the assistant consent: retry until the section exists (the page and the
    // preloader can take a moment), then scroll to it and briefly highlight it.
    let tries = 0;
    const tick = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 40) {
        window.clearInterval(tick);
        if (!el) return;
        el.scrollIntoView({ block: 'start' });
        el.style.transition = 'box-shadow .6s ease'; el.style.boxShadow = '0 0 0 1px var(--c-lilac), 0 0 0 14px color-mix(in srgb, var(--c-lilac) 10%, transparent)'; el.style.borderRadius = '12px';
        window.setTimeout(() => { el.style.boxShadow = 'none'; }, 2600);
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <LegalLayout>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(56px, 9vh, 96px) 20px 120px' }}>
        <p style={{ fontFamily: 'var(--lq-mono)', fontSize: 11, color: 'var(--lq-silver)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 24px' }}>
          {d.updated}
        </p>
        <h1 style={{ fontWeight: 500, fontSize: 'clamp(44px, 5vw, 61px)', lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: '0 0 24px' }}>
          {d.pageTitle}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lq-silver)', margin: '0 0 72px' }}>
          {d.subtitle}
        </p>

        {d.sections.map((section, i) => (
          <section key={i} id={section.id} style={{ marginBottom: 48, scrollMarginTop: 110 }}>
            <h2 style={{ fontWeight: 500, fontSize: 'clamp(20px, 2.2vw, 24px)', lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: '0 0 16px' }}>
              {section.title}
            </h2>
            {section.body.split('\n\n').map((para, j) => (
              <p key={j} style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lq-silver)', margin: '0 0 14px', whiteSpace: 'pre-line' }}>
                {para}
              </p>
            ))}
            {i < d.sections.length - 1 && (
              <div style={{ borderBottom: '1px solid var(--lq-line)', marginTop: 48 }} />
            )}
          </section>
        ))}
      </div>
    </LegalLayout>
  );
}
