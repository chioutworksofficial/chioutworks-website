import { useEffect, useRef, useState } from 'react';
import { T, type Lang } from '../translations';
import {
  requestDemoCode, verifyDemoCode, saveDemoAccess, fill, formatDateTime,
  type DemoAccess, type DemoErrorCode,
} from '../lib/demoAccess';
import BtnArrow from '../site/BtnArrow';
import { useDialogA11y } from './ui/useDialogA11y';

interface Props {
  open: boolean;
  lang: Lang;
  demo: string;
  onClose: () => void;
  onUnlocked: (access: DemoAccess) => void;
}

const inputStyle: React.CSSProperties = {
  background: 'var(--lq-deep)',
  border: '1px solid var(--lq-line)',
  color: 'var(--lq-white)',
};

export default function DemoAccessModal({ open, lang, demo, onClose, onUnlocked }: Props) {
  const trapRef = useDialogA11y();
  const m = T[lang].demos.modal;
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DemoErrorCode | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => firstField.current?.focus(), 50);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, step]);

  if (!open) return null;

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('invalid_email');
    setBusy(true);
    const r = await requestDemoCode({ email: email.trim(), name: name || undefined, phone: phone || undefined, demo, lang });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setExpiresAt(r.expiresAt);
    setDevCode(r.simulated && r.devCode ? r.devCode : null);
    setCode('');
    setStep('code');
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) return setError('invalid_code');
    setBusy(true);
    const r = await verifyDemoCode(code);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    const access = { code, email: r.email, expiresAt: r.expiresAt };
    saveDemoAccess(access);
    onUnlocked(access);
  };

  const label = (text: string, optional = false) => (
    <span className="block text-[11px] uppercase tracking-[0.12em] mb-1.5" style={{ color: 'var(--lq-silver)' }}>
      {text}{optional && <span style={{ opacity: 0.7 }}> · {m.optional}</span>}
    </span>
  );

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-access-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto"
        style={{ background: 'var(--lq-deep)', border: '1px solid var(--lq-line)' }}
      >
        <button
          onClick={onClose}
          aria-label={T[lang].demos.close}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{ color: 'var(--lq-silver)', border: '1px solid var(--lq-line-strong)' }}
        >
          ×
        </button>

        <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--lq-gradient)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lq-abyss)' }}>
            <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>

        {step === 'form' ? (
          <form onSubmit={submitEmail} noValidate>
            <h3 id="demo-access-title" className="text-2xl tracking-[-0.03em] mb-2" style={{ color: 'var(--lq-white)' }}>{m.title}</h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--lq-silver)' }}>{m.sub}</p>

            <label className="block mb-4">
              {label(m.email)}
              <input ref={firstField} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[6px] px-3.5 py-3 text-sm outline-none focus:border-[color:var(--lq-g2)]! placeholder:text-[color:var(--lq-silver)]" style={inputStyle} placeholder="name@company.com" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <label className="block">
                {label(m.name, true)}
                <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
                  className="w-full rounded-[6px] px-3.5 py-3 text-sm outline-none focus:border-[color:var(--lq-g2)]! placeholder:text-[color:var(--lq-silver)]" style={inputStyle} />
              </label>
              <label className="block">
                {label(m.phone, true)}
                <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30}
                  className="w-full rounded-[6px] px-3.5 py-3 text-sm outline-none focus:border-[color:var(--lq-g2)]! placeholder:text-[color:var(--lq-silver)]" style={inputStyle} />
              </label>
            </div>

            {error && <ErrorLine text={m.errors[error]} />}

            <button type="submit" disabled={busy}
              className="lq-btn-ghost lq-btn-block"
              style={{ opacity: busy ? 0.6 : 1 }}>
              {busy ? m.sending : m.submit}<BtnArrow />
            </button>
            <p className="text-[11px] leading-relaxed mt-4 text-center" style={{ color: 'var(--lq-silver)' }}>{m.privacy}</p>
          </form>
        ) : (
          <form onSubmit={submitCode} noValidate>
            <h3 id="demo-access-title" className="text-2xl tracking-[-0.03em] mb-2" style={{ color: 'var(--lq-white)' }}>{m.codeTitle}</h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--lq-silver)' }}>{fill(m.codeSub, { email })}</p>

            {devCode && (
              <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--color-lime-soft)', border: '1px dashed var(--lq-line-strong)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--lq-silver)' }}>{m.simNote}</p>
                <button type="button" onClick={() => setCode(devCode)}
                  className="font-mono text-2xl tracking-[0.35em]" style={{ color: 'var(--lq-white)' }}>
                  {devCode}
                </button>
              </div>
            )}

            <label className="block mb-2">
              {label(m.codeLabel)}
              <input ref={firstField} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center font-mono text-2xl tracking-[0.5em] rounded-[6px] px-3.5 py-3 outline-none focus:border-[color:var(--lq-g2)]! placeholder:text-[color:var(--lq-silver)]" style={inputStyle} placeholder="••••••" />
            </label>
            {expiresAt && (
              <p className="text-xs mb-4" style={{ color: 'var(--lq-silver)' }}>{fill(m.validUntil, { date: formatDateTime(expiresAt, lang) })}</p>
            )}

            {error && <ErrorLine text={m.errors[error]} />}

            <button type="submit" disabled={busy || code.length !== 6}
              className="lq-btn-ghost lq-btn-block"
              style={{ opacity: busy || code.length !== 6 ? 0.55 : 1 }}>
              {busy ? m.verifying : m.verify}<BtnArrow />
            </button>
            <button type="button" onClick={() => { setStep('form'); setError(null); }}
              className="w-full text-xs font-semibold mt-4 underline underline-offset-4" style={{ color: 'var(--lq-silver)' }}>
              {m.changeEmail}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p role="alert" className="text-xs font-medium rounded-lg px-3 py-2 mb-4"
      style={{ color: 'var(--color-feature-error)', background: 'var(--color-feature-error-soft)' }}>
      {text}
    </p>
  );
}
