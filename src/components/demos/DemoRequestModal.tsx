import { useEffect, useState } from 'react';
import { T, type Lang } from '../../translations';
import { fill, type DemoErrorCode } from '../../lib/demoAccess';
import { SHOWCASE_UI } from './i18n/showcase';
import { demoText } from './demoText';
import { Label } from './ui';
import BtnArrow from '../../site/BtnArrow';

const inputCls = 'w-full rounded-[6px] px-3 py-2.5 text-sm outline-none focus:border-[color:var(--lq-g2)]! placeholder:text-[color:var(--lq-silver)]';
const field: React.CSSProperties = { background: 'var(--lq-deep)', border: '1px solid var(--lq-line)', color: 'var(--lq-white)' };

/** "Request a demo" for apps that are not publicly openable — goes to /api/demo/quote as kind=demo-request. */
export default function DemoRequestModal({ lang, slug, email: initialEmail, onClose }: { lang: Lang; slug: string; email: string; onClose: () => void }) {
  const s = SHOWCASE_UI[lang];
  const b = T[lang].demos.builder;
  const errors = T[lang].demos.modal.errors;
  const name = demoText(lang, slug).name;
  const [form, setForm] = useState({ email: initialEmail, name: '', business: '', message: fill(s.requestMessage, { name }) });
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<DemoErrorCode | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setError('invalid_email');
    setState('sending');
    try {
      const r = await fetch('/api/demo/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, demo: slug, lang, modules: [], kind: 'demo-request' }),
      });
      const data = await r.json().catch(() => null);
      if (r.status === 429) throw new Error('rate_limited');
      if (!data?.ok) throw new Error(data?.error || 'server');
      setState('sent');
    } catch (err) {
      const code = (err as Error).message as DemoErrorCode;
      setError(code in errors ? code : 'server');
      setState('idle');
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="demo-request-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto"
        style={{ background: 'var(--lq-deep)', border: '1px solid var(--lq-line)' }}>
        <button type="button" onClick={onClose} aria-label={T[lang].demos.close}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{ color: 'var(--lq-silver)', border: '1px solid var(--lq-line-strong)' }}>×</button>
        <p className="text-[11px] mb-1" style={{ color: 'var(--lq-silver)', fontFamily: 'var(--lq-mono)' }}>{slug}</p>
        <h3 id="demo-request-title" className="text-2xl tracking-[-0.03em] mb-2" style={{ color: 'var(--lq-white)' }}>{s.requestTitle}</h3>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--lq-silver)' }}>{s.requestSub}</p>

        {state === 'sent' ? (
          <p role="status" className="rounded-[6px] p-4 text-sm font-medium" style={{ background: 'var(--c-quartz)', color: 'var(--c-abyss)' }}>{s.sent}</p>
        ) : (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <Label text={b.email}><input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} style={field} /></Label>
            <div className="grid grid-cols-2 gap-2">
              <Label text={b.name}><input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} style={field} maxLength={80} /></Label>
              <Label text={b.business}><input value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} className={inputCls} style={field} maxLength={100} /></Label>
            </div>
            <Label text={b.message}><textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} style={{ ...field, resize: 'vertical' }} maxLength={1000} /></Label>
            {error && <p role="alert" className="text-xs rounded-lg px-3 py-2" style={{ color: 'var(--color-feature-error)', background: 'var(--color-feature-error-soft)' }}>{errors[error]}</p>}
            <button type="submit" disabled={state === 'sending'} className="lq-btn-ghost lq-btn-block"
              style={{ opacity: state === 'sending' ? 0.6 : 1 }}>
              {state === 'sending' ? s.sending : s.send}<BtnArrow />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
