import { useEffect, useState } from 'react';
import type { Lang } from '../translations';
import { pagePath } from '../lib/routes';
import { guardFields, prefetchFormToken } from '../lib/formGuard';
import { CAPTURE_UI, CAPTURE_TEXT_VERSION } from './i18n/capture';

export type Channel = 'email' | 'phone' | 'whatsapp';
export interface CaptureResult { business: string; email: string; phone: string; channel: Channel; mailed: boolean; formToken?: string }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Consent-based contact card: e-mail required, phone optional, preferred contact (default e-mail), consent text with privacy link. Typed, never dictated. */
export default function ContactCapture({ lang, variant, getSession, summary, onDone, onDismiss, demo }: {
  lang: Lang; variant: 'card' | 'end' | 'gate'; getSession: () => Promise<{ id: string; secret: string } | null>; summary?: string;
  onDone: (r: CaptureResult) => void; onDismiss: () => void; demo?: boolean;
}) {
  const t = CAPTURE_UI[lang];
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [business, setBusiness] = useState('');
  const [channel, setChannel] = useState<Channel>('email');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<CaptureResult | null>(null);
  useEffect(() => { prefetchFormToken(); }, []);
  const phoneOk = phone.replace(/\D/g, '').length >= 7;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!EMAIL_RE.test(email.trim())) { setErr(t.badEmail); return; }
    if ((channel !== 'email' || phone.trim()) && !phoneOk) { setErr(t.phoneNeeded); return; }
    setErr(''); setBusy(true);
    try {
      if (demo) { const r = { business, email, phone, channel, mailed: false }; setDone(r); onDone(r); return; }
      const s = await getSession();
      if (!s) throw new Error('no session');
      const r = await fetch('/api/capture', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(await guardFields()), sessionId: s.id, secret: s.secret, email: email.trim(), phone: phone.trim(), business: business.trim(), preferredChannel: channel, lang, textVersion: CAPTURE_TEXT_VERSION }) });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json().catch(() => ({}));
      const res: CaptureResult = { business: business.trim(), email: email.trim(), phone: phone.trim(), channel, mailed: j.mailed === true, formToken: typeof j.formToken === 'string' ? j.formToken : undefined };
      setDone(res); onDone(res);
    } catch { setErr(t.error); } finally { setBusy(false); }
  };

  const box: React.CSSProperties = { width: '100%', maxWidth: 460, boxSizing: 'border-box', border: '1px solid var(--lq-line-strong)', borderRadius: 'var(--lq-radius-card)', background: 'var(--lq-abyss)', color: 'var(--lq-white)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' };
  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 14px', minHeight: 44, borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 16 };
  const pill = (on: boolean): React.CSSProperties => ({ flex: '1 1 0', minHeight: 44, padding: '8px 10px', borderRadius: 9999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: 'var(--lq-white)', border: `1px solid ${on ? 'var(--c-lilac)' : 'var(--lq-line-strong)'}`, background: on ? 'color-mix(in srgb, var(--c-lilac) 16%, var(--c-abyss))' : 'transparent' });
  const ghost: React.CSSProperties = { minHeight: 44, padding: '8px 16px', borderRadius: 9999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: 'var(--lq-silver)', border: '1px solid var(--lq-line-strong)', background: 'transparent' };

  if (done) return (
    <div role="status" aria-live="polite" style={box} data-capture-done>
      <strong>{variant === 'gate' ? t.gateTitle : t.offerTitle}</strong>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>{t.thanks}</p>
      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--lq-silver)' }}>{done.mailed ? t.mailed : t.saved}</p>
      <button type="button" style={ghost} onClick={onDismiss}>{t.close}</button>
    </div>);

  return (
    <form onSubmit={submit} noValidate aria-label={variant === 'end' ? t.endTitle : variant === 'gate' ? t.gateTitle : t.offerTitle} style={box} data-capture={variant}>
      <style>{`@media (max-width:520px){[data-capture] .cw-cap-act{flex-direction:column-reverse}[data-capture] .cw-cap-act button{width:100%}}`}</style>
      <strong>{variant === 'end' ? t.endTitle : variant === 'gate' ? t.gateTitle : t.offerTitle}</strong>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--lq-silver)' }}>{variant === 'end' ? t.endText : variant === 'gate' ? t.gate : t.offerText}</p>
      {variant === 'end' && summary && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, padding: '8px 10px', border: '1px solid var(--lq-line)', borderRadius: 'var(--lq-radius-sm)', whiteSpace: 'pre-line' }}><b>{t.summary}: </b>{summary}</p>}
      <input type="text" autoComplete="organization" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder={t.business} aria-label={t.business} maxLength={100} style={inp} />
      <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} aria-label={t.email} maxLength={254} style={inp} />
      <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={variant === 'gate' && channel !== 'email' ? t.phone.replace(/\s*\([^)]*\)/, '') : t.phone} aria-label={t.phone} maxLength={30} style={inp} />
      <div role="radiogroup" aria-label={t.channel} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 12.5, color: 'var(--lq-silver)' }}>{t.channel}</span>
        <div className="cw-cap-ch" style={{ display: 'flex', gap: 8 }}>
          {(['email', 'phone', 'whatsapp'] as const).map((k) => <button key={k} type="button" role="radio" aria-checked={channel === k} onClick={() => setChannel(k)} style={pill(channel === k)}>{t.ch[k]}</button>)}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: 'var(--lq-silver)' }}>{t.consent} <a href={pagePath(lang, 'privacy')} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lq-white)', textDecoration: 'underline' }}>{t.privacy}</a></p>
      {err && <p role="alert" style={{ margin: 0, fontSize: 13.5 }}>{err}</p>}
      <div className="cw-cap-act" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" style={ghost} onClick={onDismiss}>{t.later}</button>
        <button type="submit" disabled={busy} style={{ ...ghost, color: 'var(--lq-white)', borderColor: 'var(--c-lilac)', background: 'color-mix(in srgb, var(--c-lilac) 14%, var(--c-abyss))' }}>{busy ? t.sending : variant === 'gate' ? t.confirm : t.send}</button>
      </div>
    </form>
  );
}
