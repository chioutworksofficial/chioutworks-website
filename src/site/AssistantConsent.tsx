import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lang } from '../translations';
import { pagePath } from '../lib/routes';
import { VOICE_UI } from './i18n/voice';
import { writeConsent, type ConsentMode } from '../lib/assistantConsent';

interface Action { label: string; run: () => void }

const btn: React.CSSProperties = {
  borderRadius: 'var(--lq-radius-sm)', padding: '12px 20px', fontSize: 15, cursor: 'pointer', textDecoration: 'none', textAlign: 'center',
  border: '1px solid var(--lq-line-strong)', background: 'transparent', color: 'var(--lq-white)', fontFamily: 'inherit',
};
const primary: React.CSSProperties = { ...btn, borderRadius: 9999, background: 'color-mix(in srgb, var(--c-lilac) 14%, var(--c-abyss))', border: '1px solid var(--c-lilac)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 13, fontWeight: 500 };

/**
 * Consent before the AI assistant (owner, 2026-11-19: transparent, calm, no provider names on the screen; names stay in the
 * privacy policy). Required: AI disclosure acknowledgement (EU AI Act Art. 50) + processing/transfer consent.
 * Voice only, optional: a dropped live call may continue in writing with the backup provider; unticked = the call just ends.
 * Text chat runs on the backup provider itself, so there it is part of the required consent. Declining shows a no-AI path.
 */
export default function AssistantConsent({ lang, mode = 'voice', compact, primaryAction, secondaryAction, onNavigate }: {
  lang: Lang; mode?: ConsentMode; compact?: boolean; primaryAction: Action; secondaryAction?: Action; onNavigate?: () => void;
}) {
  const t = VOICE_UI[lang];
  const voice = mode === 'voice';
  const [ai, setAi] = useState(false);
  const [data, setData] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [declined, setDeclined] = useState(false);
  // Voice: two required ticks (owner). Text chat: only the processing/transfer consent is legally required; the AI notice
  // (AI Act Art. 50) is shown as plain information there, without a tick.
  const ok = voice ? ai && data : true;   // text chat: the button itself is the explicit consent (its label says so)
  const go = (a: Action) => { if (!ok) return; writeConsent(mode, voice && fallback); a.run(); };
  const fs = compact ? 13 : 14;
  const [wide] = useState(() => typeof window === 'undefined' || window.innerWidth > 640);   // details open on desktop, closed on phones

  if (declined) {
    return (
      <div role="region" aria-label={t.noAiTitle} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
        <h2 style={{ fontSize: compact ? 18 : 'clamp(22px, 3.5vw, 28px)', fontWeight: 600, fontFamily: 'var(--font-display)', margin: 0 }}>{t.noAiTitle}</h2>
        <p style={{ color: 'var(--lq-silver)', lineHeight: 1.6, margin: 0 }}>{t.noAiText}</p>
        <Link to={pagePath(lang, 'faq')} onClick={onNavigate} style={btn}>{t.noAiFaq}</Link>
        <Link to={pagePath(lang, 'contact')} onClick={onNavigate} style={primary}>{t.noAiContact}</Link>
      </div>
    );
  }

  const box = (title: string, body: React.ReactNode) => (
    <div style={{ border: '1px solid var(--lq-line-strong)', borderRadius: 'var(--lq-radius-sm)', padding: compact ? '10px 12px' : '12px 14px', flex: '1 1 220px' }}>
      <p style={{ margin: '0 0 6px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-lilac)' }}>{title}</p>
      {body}
    </div>
  );
  const check = (checked: boolean, set: (v: boolean) => void, label: string, required: boolean) => (
    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: fs, lineHeight: 1.5, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
      <span>
        <span style={{ display: 'inline-block', marginRight: 8, padding: '1px 8px', borderRadius: 9999, fontSize: 11, letterSpacing: '0.04em', verticalAlign: 'middle',
          border: `1px solid ${required ? 'var(--c-lilac)' : 'var(--lq-line-strong)'}`, color: required ? 'var(--c-lilac)' : 'var(--lq-silver)' }}>{required ? t.consentReq : t.consentOpt}</span>
        {label}
      </span>
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 14 }}>
      <style>{`.cw-consent-sum{display:none}@media (max-width:640px){.cw-consent-sum{display:list-item;cursor:pointer;min-height:44px;line-height:44px;color:var(--lq-white);font-size:14px;text-decoration:underline}.cw-consent-det>*+*{margin-top:12px}.cw-consent-act{padding-bottom:env(safe-area-inset-bottom)}.cw-consent-act label{min-height:44px;align-items:center!important;font-size:14px!important;line-height:1.45!important}.cw-consent-act label span{font-size:inherit!important}.cw-consent-act button{min-height:44px}}`}</style>
      <h2 style={{ fontSize: compact ? 18 : 'clamp(24px, 4vw, 34px)', fontWeight: 600, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', margin: 0, textAlign: 'center' }}>{t.consentTitle}</h2>
      <p style={{ color: 'var(--lq-silver)', lineHeight: 1.6, margin: 0, fontSize: compact ? 14 : undefined }}>{t.consentLead}</p>
      <details className="cw-consent-det" open={wide} style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 14 }}>
      <summary className="cw-consent-sum">{t.consentShow}</summary>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 0 }}>
        {box(t.consentYesTitle, <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', color: 'var(--lq-silver)', fontSize: fs, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>{t.consentYes.split('\n').map((l, i) => <li key={i}>{l}</li>)}</ul>)}
        {box(t.consentNoTitle, <p style={{ margin: 0, color: 'var(--lq-silver)', fontSize: fs, lineHeight: 1.5 }}>{t.consentNo}</p>)}
      </div>
      <p style={{ color: 'var(--lq-silver)', lineHeight: 1.55, margin: 0, fontSize: fs }}>{voice ? t.consentWhereVoice : t.consentWhereText}</p>
      <p style={{ color: 'var(--c-ash)', lineHeight: 1.5, margin: 0, fontSize: 12 }}>
        {voice ? t.consentLegalVoice : t.consentLegalText}{' '}
        <a href={`${pagePath(lang, 'privacy')}#voice-assistant`} target="_blank" rel="noopener" style={{ color: 'var(--lq-white)', textDecoration: 'underline' }}>{t.consentDetails} →</a>
      </p>
      </details>
      <div className="cw-consent-act" style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 14 }}>
      {voice ? check(ai, setAi, t.consentAi, true) : <p role="note" style={{ margin: 0, fontSize: fs, lineHeight: 1.5, color: 'var(--lq-white)' }}>{t.consentAiNote}</p>}
      {voice ? check(data, setData, t.consentDataVoice, true) : <p style={{ margin: 0, fontSize: fs, lineHeight: 1.5, color: 'var(--lq-white)' }}>{t.consentDataText}</p>}
      {voice && check(fallback, setFallback, t.consentFallback, false)}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={{ ...primary, opacity: ok ? 1 : 0.45, cursor: ok ? 'pointer' : 'not-allowed' }} disabled={!ok} onClick={() => go(primaryAction)}>{primaryAction.label}</button>
        {/* "Type instead": leaves the voice consent without ticking anything; the text chat asks its own (shorter) consent */}
        {secondaryAction && <button style={btn} onClick={() => secondaryAction.run()}>{secondaryAction.label}</button>}
      </div>
      <button style={{ color: 'var(--lq-silver)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', alignSelf: 'center' }} onClick={() => setDeclined(true)}>{t.consentDecline}</button>
      </div>
    </div>
  );
}
