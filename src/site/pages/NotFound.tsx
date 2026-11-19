import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pagePath, preferredLang } from '../../lib/routes';
import type { Lang } from '../../translations';

const T: Record<Lang, { title: string; body: string; home: string; contact: string }> = {
  tr: { title: 'Sayfa bulunamadı', body: 'Aradığınız sayfa taşınmış veya hiç var olmamış olabilir. Ana sayfadan devam edebilir ya da bana yazabilirsiniz.', home: 'Ana sayfa', contact: 'İletişim' },
  en: { title: 'Page not found', body: 'The page you are looking for may have moved or never existed. You can continue from the home page or write to me.', home: 'Home', contact: 'Contact' },
  de: { title: 'Seite nicht gefunden', body: 'Die gesuchte Seite wurde verschoben oder existiert nicht. Sie können auf der Startseite weitermachen oder mir schreiben.', home: 'Startseite', contact: 'Kontakt' },
  el: { title: 'Η σελίδα δεν βρέθηκε', body: 'Η σελίδα που ψάχνετε μπορεί να έχει μετακινηθεί ή να μην υπήρξε ποτέ. Συνεχίστε από την αρχική σελίδα ή γράψτε μου.', home: 'Αρχική', contact: 'Επικοινωνία' },
};

/** Branded 404: shown for unknown addresses instead of silently jumping to the home page (noindex). */
export default function NotFound({ lang }: { lang?: Lang }) {
  const l = lang ?? preferredLang();
  const t = T[l];
  useEffect(() => {
    document.title = `404 · ${t.title} · Chioutworks`; document.documentElement.lang = l;
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.appendChild(m);
    return () => { m.remove(); };
  }, [l, t.title]);
  return (
    <main data-site-theme="liquid" lang={l} style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--glow-hero), var(--c-void)', color: 'var(--c-mist)' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.2em', color: 'var(--c-lilac)', margin: '0 0 12px' }}>404</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 600, color: 'var(--c-quartz)', margin: '0 0 14px' }}>{t.title}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 28px' }}>{t.body}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={pagePath(l, 'home')} className="lq-btn-ghost">{t.home}</Link>
          <Link to={pagePath(l, 'contact')} className="lq-btn-ghost">{t.contact}</Link>
        </div>
      </div>
    </main>
  );
}
