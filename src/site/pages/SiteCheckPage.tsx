import { useEffect, useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Lang } from '../../translations';
import { SITE_CHECK_UI } from '../i18n/siteCheck';
import { pagePath } from '../../lib/routes';
import { guardFields, prefetchFormToken } from '../../lib/formGuard';
import Honeypot from '../../components/Honeypot';
import NewsletterBox from '../NewsletterBox';
import BtnArrow from '../BtnArrow';

const field: React.CSSProperties = { width: '100%', padding: '11px 12px', borderRadius: 8, border: '1px solid var(--lq-line)', background: 'var(--lq-deep)', color: 'var(--lq-white)', fontSize: 16, fontFamily: 'var(--lq-font)', outline: 'none', minWidth: 0 };
const lab: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lq-silver)' };
const chk: React.CSSProperties = { display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.5, color: 'var(--lq-mist)' };
const box: React.CSSProperties = { marginTop: 3, width: 18, height: 18, flex: '0 0 auto', accentColor: 'var(--lq-g2)' };

export default function SiteCheckPage({ lang }: { lang: Lang }) {
  const u = SITE_CHECK_UI[lang]; const id = useId();
  const [sp] = useSearchParams(); const check = sp.get('check');
  const [state, setState] = useState<'form' | 'sent'>('form');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [url, setUrl] = useState(''); const [mail, setMail] = useState(''); const [company, setCompany] = useState('');
  useEffect(() => { prefetchFormToken(); }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const els = e.currentTarget.elements;
    const consent = (els.namedItem('consent') as HTMLInputElement).checked; const marketing = (els.namedItem('marketing') as HTMLInputElement).checked;
    if (!consent) { setErr(u.errConsent); return; }
    setBusy(true); setErr('');
    try {
      const g = await guardFields();
      const r = await fetch('/api/site-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim(), email: mail.trim(), company: company.trim(), consent, marketing, lang, ...g }) });
      if (r.ok) setState('sent');
      else { const j = (await r.json().catch(() => ({}))) as { error?: string }; setErr(j.error === 'rate_limited' ? u.errRate : j.error === 'busy' ? u.errBusy : j.error === 'invalid' || j.error === 'consent' ? u.errInvalid : u.errGeneric); }
    } catch { setErr(u.errGeneric); }
    setBusy(false);
  };

  const card = (title: string, body: string, extra?: React.ReactNode) => (
    <div className="lq-card" role="status" style={{ padding: 'clamp(20px, 4vw, 32px)', maxWidth: 640 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: 'var(--lq-white)', fontFamily: 'var(--font-display)' }}>{title}</h2>
      <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--lq-mist)' }}>{body}</p>
      {extra}
    </div>
  );

  return (
    <section className="relative overflow-hidden" style={{ paddingTop: 76 }}>
      <div className="relative mx-auto px-5 md:px-9" style={{ maxWidth: 1200, paddingTop: 'clamp(32px, 5vh, 56px)', paddingBottom: 'clamp(48px, 8vh, 96px)' }}>
        <h1 style={{ margin: 0, lineHeight: 1, fontSize: 'clamp(34px, 6vw, 72px)', fontWeight: 800, color: 'var(--lq-silver)', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)', overflowWrap: 'anywhere' }}>{u.word}</h1>
        <p className="mt-5" style={{ maxWidth: 620, fontSize: 16, lineHeight: 1.6, color: 'var(--lq-mist)' }}>{u.intro}</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 order-1">
            {check === 'ok' || check === 'roi' ? card(u.confirmedTitle, check === 'roi' ? u.roiConfirmedBody : u.confirmedBody, <div style={{ marginTop: 22 }}><NewsletterBox lang={lang} source="site-check-thanks" /></div>)
              : state === 'sent' ? card(u.doneTitle, u.doneBody, <div style={{ marginTop: 22 }}><NewsletterBox lang={lang} source="site-check-thanks" /></div>)
              : (
                <form onSubmit={submit} noValidate className="lq-card relative flex flex-col gap-4" style={{ padding: 'clamp(20px, 4vw, 32px)', maxWidth: 640 }}>
                  <Honeypot />
                  {check === 'invalid' && <p role="alert" style={{ margin: 0, fontSize: 14, color: 'var(--lq-white)' }}>{u.badLink}</p>}
                  <label style={lab} htmlFor={`${id}-u`}>{u.url}<input id={`${id}-u`} type="url" inputMode="url" required maxLength={500} placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} style={field} /></label>
                  <label style={lab} htmlFor={`${id}-e`}>{u.email}<input id={`${id}-e`} type="email" autoComplete="email" required maxLength={254} value={mail} onChange={(e) => setMail(e.target.value)} style={field} /></label>
                  <label style={lab} htmlFor={`${id}-c`}>{u.company}<input id={`${id}-c`} type="text" autoComplete="organization" maxLength={100} value={company} onChange={(e) => setCompany(e.target.value)} style={field} /></label>
                  <label style={chk}><input type="checkbox" name="consent" required style={box} /><span>{u.consentReport}</span></label>
                  <label style={chk}><input type="checkbox" name="marketing" style={box} /><span>{u.consentMarketing}</span></label>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--lq-silver)' }}><Link to={pagePath(lang, 'privacy')} style={{ textDecoration: 'underline' }}>{u.privacy}</Link></p>
                  {err && <p role="alert" style={{ margin: 0, fontSize: 14, color: 'var(--lq-white)' }}>{err}</p>}
                  <div><button type="submit" className="lq-btn-ghost" disabled={busy || !url.trim() || !mail.trim()} style={{ lineHeight: 1.5, paddingBlock: 12 }}>{busy ? u.sending : u.submit}<BtnArrow /></button></div>
                </form>
              )}
          </div>
          <aside className="lg:col-span-5 order-2">
            <h2 style={{ margin: 0, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)', fontWeight: 600 }}>{u.getsTitle}</h2>
            <ul className="mt-4 flex flex-col gap-3" style={{ listStyle: 'none', padding: 0 }}>
              {u.gets.map((g) => <li key={g} style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--lq-mist)', paddingLeft: 18, position: 'relative' }}><span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: 'var(--lq-g2)' }} />{g}</li>)}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
