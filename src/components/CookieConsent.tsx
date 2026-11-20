import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../hooks/useLang';
import { pagePath } from '../lib/routes';
import { onConsentOpen, readConsent, saveConsent } from '../lib/consent';
import { CONSENT_UI } from '../site/i18n/consent';
import { useDialogA11y } from './ui/useDialogA11y';

/**
 * Cookie / storage consent: a small, non-blocking card (bottom-left) on the first visit, plus a settings dialog
 * that can be reopened at any time from the footer ("Cookie settings"). Buttons have equal weight (no nudging).
 * Necessary storage stays on and cannot be switched off.
 */
export default function CookieConsent() {
  const trapRef = useDialogA11y();
  const [lang] = useLang();
  const u = CONSENT_UI[lang];
  const { pathname } = useLocation();
  const admin = pathname.startsWith('/admin');
  const [banner, setBanner] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [statistics, setStatistics] = useState(false);
  const dlgRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!readConsent()) setBanner(true); }, []);
  useEffect(() => onConsentOpen(() => {
    const c = readConsent();
    setFunctional(!!c?.functional); setStatistics(!!c?.statistics); setDialog(true);
  }), []);
  useEffect(() => {
    if (!dialog) return;
    dlgRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDialog(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  const decide = (choice: { functional: boolean; statistics: boolean }) => { saveConsent(choice); setBanner(false); setDialog(false); };

  if (admin) return null;

  const btn: React.CSSProperties = { flex: '1 1 auto', fontSize: 13, padding: '10px 14px', whiteSpace: 'nowrap' };
  const Switch = ({ on, set, label }: { on: boolean; set?: (v: boolean) => void; label: string }) => (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={!set} onClick={() => set?.(!on)}
      style={{ width: 44, height: 24, borderRadius: 999, flex: 'none', position: 'relative', cursor: set ? 'pointer' : 'not-allowed',
        background: on ? 'var(--c-signal)' : 'var(--c-hairline)', opacity: set ? 1 : 0.6, transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: 999, background: 'var(--c-quartz)', transition: 'left .2s' }} />
    </button>
  );
  const Row = ({ name, desc, on, set, note }: { name: string; desc: string; on: boolean; set?: (v: boolean) => void; note?: string }) => (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderTop: '1px solid var(--c-edge)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: 'var(--c-quartz)', fontWeight: 500, fontSize: 15 }}>{name}{note && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--c-lilac)' }}>{note}</span>}</div>
        <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--c-ash)' }}>{desc}</p>
      </div>
      <Switch on={on} set={set} label={name} />
    </div>
  );

  return (
    <div data-site-theme="liquid" style={{ display: 'contents' }}>
      {banner && !dialog && (
        <section role="region" aria-label={u.title} className="cw-consent"
          style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 80, width: 'min(400px, calc(100vw - 32px))', padding: 18, borderRadius: 'var(--r-card)',
            background: 'color-mix(in srgb, var(--c-abyss) 92%, transparent)', border: '1px solid var(--c-hairline)', backdropFilter: 'blur(12px)',
            boxShadow: '0 18px 50px -20px color-mix(in srgb, var(--c-signal) 45%, transparent)', color: 'var(--c-mist)' }}>
          <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--c-quartz)' }}>{u.title}</h2>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>{u.body} <Link to={pagePath(lang, 'privacy')} style={{ color: 'var(--c-lilac)', textDecoration: 'underline' }}>{u.privacy}</Link></p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            <button type="button" className="lq-btn-ghost" style={btn} onClick={() => decide({ functional: true, statistics: true })}>{u.acceptAll}</button>
            <button type="button" className="lq-btn-ghost" style={btn} onClick={() => decide({ functional: false, statistics: false })}>{u.necessaryOnly}</button>
            <button type="button" className="lq-btn-ghost" style={btn} onClick={() => { setFunctional(false); setStatistics(false); setDialog(true); }}>{u.settings}</button>
          </div>
        </section>
      )}

      {dialog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'color-mix(in srgb, var(--c-void) 70%, transparent)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setDialog(false); }}>
          <div ref={(el) => { dlgRef.current = el; trapRef(el); }} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="cw-consent-title"
            style={{ width: 'min(520px, 100%)', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', padding: 24, borderRadius: 'var(--r-card)', background: 'var(--c-abyss)', border: '1px solid var(--c-hairline)', color: 'var(--c-mist)', outline: 'none' }}>
            <h2 id="cw-consent-title" style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--c-quartz)' }}>{u.title}</h2>
            <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.55 }}>{u.body}</p>
            <Row name={u.necessary.name} desc={u.necessary.desc} on note={u.always} />
            <Row name={u.functional.name} desc={u.functional.desc} on={functional} set={setFunctional} />
            <Row name={u.statistics.name} desc={u.statistics.desc} on={statistics} set={setStatistics} />
            <p style={{ margin: '4px 0 16px', paddingTop: 12, borderTop: '1px solid var(--c-edge)', fontSize: 13, color: 'var(--c-ash)' }}>
              {u.noMarketing} <Link to={pagePath(lang, 'privacy')} onClick={() => setDialog(false)} style={{ color: 'var(--c-lilac)', textDecoration: 'underline' }}>{u.privacy}</Link>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="lq-btn-ghost" style={btn} onClick={() => decide({ functional, statistics })}>{u.save}</button>
              <button type="button" className="lq-btn-ghost" style={btn} onClick={() => decide({ functional: true, statistics: true })}>{u.acceptAll}</button>
              <button type="button" className="lq-btn-ghost" style={btn} onClick={() => decide({ functional: false, statistics: false })}>{u.necessaryOnly}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
