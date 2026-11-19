import { useEffect } from 'react';
import LegalLayout from './LegalLayout';
import { useLang } from '../hooks/useLang';
import { TERMS } from '../data/legalTranslations';

export default function TermsOfService() {
  const [lang] = useLang();
  const d = TERMS[lang];
  useEffect(() => { window.scrollTo(0, 0); }, []);

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
          <section key={i} style={{ marginBottom: 48 }}>
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
