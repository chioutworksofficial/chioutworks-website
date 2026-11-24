import { useEffect, useId, useState } from 'react';
import type { Lang } from '../translations';
import { SITE_CHECK_UI } from './i18n/siteCheck';
import { pagePath } from '../lib/routes';
import { guardFields, prefetchFormToken } from '../lib/formGuard';
import Honeypot from '../components/Honeypot';
import { Link } from 'react-router-dom';

/** Newsletter opt-in: required consent box (unticked), honeypot + signed form token; the server mails a confirmation link (double opt-in). */
export default function NewsletterBox({ lang, source }: { lang: Lang; source: string }) {
  const u = SITE_CHECK_UI[lang]; const id = useId();
  const [mail, setMail] = useState(''); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  useEffect(() => { prefetchFormToken(); }, []);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const consent = (e.currentTarget.elements.namedItem('nl-consent') as HTMLInputElement).checked;
    if (!consent) { setErr(u.nlErr); return; }
    setBusy(true); setErr('');
    try {
      const g = await guardFields();
      const r = await fetch('/api/newsletter/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: mail.trim(), consent: true, lang, source, ...g }) });
      if (r.ok) setOk(true); else setErr(u.nlErr);
    } catch { setErr(u.nlErr); }
    setBusy(false);
  };
  const field: React.CSSProperties = { flex: '1 1 220px', minWidth: 0, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--lq-line)', background: 'var(--lq-deep)', color: 'var(--lq-white)', fontSize: 15, fontFamily: 'var(--lq-font)', outline: 'none' };
  return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: 'var(--lq-white)' }}>{u.nlTitle}</p>
      {ok ? <p role="status" style={{ margin: 0, fontSize: 14, color: 'var(--lq-mist)' }}>{u.nlDone}</p> : (
        <form onSubmit={submit} className="relative" noValidate>
          <Honeypot />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <label htmlFor={`${id}-m`} className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{u.nlEmail}</label>
            <input id={`${id}-m`} type="email" autoComplete="email" maxLength={254} required placeholder={u.nlEmail} value={mail} onChange={(e) => setMail(e.target.value)} style={field} />
            <button type="submit" className="lq-btn-ghost" disabled={busy || !mail.trim()} style={{ paddingBlock: 10 }}>{u.nlBtn}</button>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, fontSize: 12.5, lineHeight: 1.45, color: 'var(--lq-silver)' }}>
            <input type="checkbox" name="nl-consent" required style={{ marginTop: 3, width: 16, height: 16, flex: '0 0 auto', accentColor: 'var(--lq-g2)' }} />
            <span>{u.nlConsent} <Link to={pagePath(lang, 'privacy')} style={{ textDecoration: 'underline' }}>{u.privacy}</Link></span>
          </label>
          {err && <p role="alert" style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--lq-white)' }}>{err}</p>}
        </form>
      )}
    </div>
  );
}
