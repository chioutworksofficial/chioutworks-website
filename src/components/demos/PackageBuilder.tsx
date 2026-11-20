import { useEffect, useState } from 'react';
import { T, type Lang } from '../../translations';
import type { DemoSlug } from '../../data/demos';
import { demoText } from './demoText';
import { fill, type DemoErrorCode } from '../../lib/demoAccess';
import { Label, Pill } from './ui';

const card: React.CSSProperties = { background: 'var(--lq-kelp)', border: '1px solid var(--lq-line)' };
const field: React.CSSProperties = { background: 'var(--lq-deep)', border: '1px solid var(--lq-line)', color: 'var(--lq-white)' };
const inputCls = 'w-full rounded-[6px] px-3 py-2.5 text-sm outline-none focus:border-[color:var(--lq-g2)]! placeholder:text-[color:var(--lq-silver)]';
const h3Cls = 'text-lg tracking-[-0.02em] mb-3';
import { BUILDER_UI } from './i18n/builder';
import BtnArrow from '../../site/BtnArrow';
import { guardFields, prefetchFormToken } from '../../lib/formGuard';
import Honeypot from '../Honeypot';

export type ModuleKey = 'core' | 'qr' | 'whatsapp' | 'telegram' | 'ai' | 'payments' | 'calendar' | 'reviews' | 'hosting';
type CostType = 'none' | 'usage' | 'message' | 'transaction' | 'monthly';

// popular  = quick to deliver (≈1 day), shown first as "most popular"
// advanced = needs third-party approval (Meta, merchant account) → longer setup, higher price
const MODULES: { key: ModuleKey; cost: CostType; popular?: boolean; advanced?: boolean }[] = [
  { key: 'core', cost: 'none' },
  { key: 'telegram', cost: 'none', popular: true },
  { key: 'qr', cost: 'none', popular: true },
  { key: 'ai', cost: 'usage', popular: true },
  { key: 'reviews', cost: 'none', popular: true },
  { key: 'calendar', cost: 'none' },
  { key: 'hosting', cost: 'monthly' },
  { key: 'whatsapp', cost: 'message', advanced: true },
  { key: 'payments', cost: 'transaction', advanced: true },
];

/** Modules pre-selected per demo — only quick-to-deliver ones; advanced modules are opt-in */
const RECOMMENDED: Partial<Record<DemoSlug, ModuleKey[]>> = {
  demokuafor: ['telegram', 'qr', 'calendar', 'reviews'],
  demoklinik: ['telegram', 'calendar', 'ai'],
  demotemizlik: ['telegram', 'ai', 'calendar'],
  demosadakat: ['telegram', 'qr', 'reviews'],
  democrm: ['telegram', 'ai', 'qr'],
  demoemlak: ['telegram', 'ai', 'reviews', 'hosting'],
  demokafe: ['qr', 'telegram', 'reviews', 'hosting'],
  demokariyer: ['telegram', 'ai', 'hosting'],
  demolojistik: ['telegram', 'ai', 'hosting'],
  demoozel: ['ai', 'telegram', 'hosting'],
};
const DEFAULT_RECOMMENDED: ModuleKey[] = ['telegram', 'qr', 'ai'];
const recommendedFor = (slug: DemoSlug) => RECOMMENDED[slug] ?? DEFAULT_RECOMMENDED;

export default function PackageBuilder({ lang, slug, email: initialEmail, compact = false }: { lang: Lang; slug: DemoSlug; email: string; compact?: boolean }) {
  const b = T[lang].demos.builder;
  const bx = BUILDER_UI[lang];
  const features = demoText(lang, slug).features;
  const errors = T[lang].demos.modal.errors;
  const [selected, setSelected] = useState<Set<ModuleKey>>(() => new Set<ModuleKey>(['core', ...recommendedFor(slug)]));
  const [form, setForm] = useState({ email: initialEmail, name: '', business: '', message: '' });
  useEffect(() => { prefetchFormToken(); }, []);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<DemoErrorCode | null>(null);

  const toggle = (k: ModuleKey) => {
    if (k === 'core') return;
    const next = new Set(selected);
    if (next.has(k)) next.delete(k); else next.add(k);
    setSelected(next);
  };

  const costTypes = [...new Set(MODULES.filter((m) => selected.has(m.key) && m.cost !== 'none').map((m) => m.cost))];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setError('invalid_email');
    setState('sending');
    try {
      const r = await fetch('/api/demo/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, demo: slug, lang, modules: [...selected], ...(await guardFields()) }),
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
    <section className={compact ? 'space-y-5' : 'mt-12 space-y-5'} aria-labelledby="builder-title">
      <div className="max-w-3xl">
        <h2 id="builder-title" className="text-3xl md:text-5xl tracking-[-0.04em] leading-none mb-3" style={{ color: 'var(--lq-white)' }}>{b.title}</h2>
        <p className="text-sm" style={{ color: 'var(--lq-silver)' }}>{b.sub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl p-5" style={card}>
            <h3 className={h3Cls} style={{ color: 'var(--lq-white)' }}>{b.whatsIncluded}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((f) => (
                <li key={f} className="flex gap-2 text-sm" style={{ color: 'var(--lq-white)' }}>
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: 'color-mix(in srgb, var(--c-signal) 18%, transparent)', color: 'var(--c-lilac)', border: '1px solid color-mix(in srgb, var(--c-signal) 45%, transparent)' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-5" style={card}>
            <h3 className={h3Cls} style={{ color: 'var(--lq-white)' }}>{b.modulesTitle}</h3>
            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--color-lime-soft)', border: '1px solid var(--lq-line-strong)' }}>
              <p className="text-lg tracking-[-0.02em] mb-1" style={{ color: 'var(--lq-white)' }}>★ {bx.whyTelegramTitle}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--lq-white)' }}>{bx.whyTelegram}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODULES.map(({ key, cost, popular, advanced }) => {
                const m = b.modules[key];
                const on = selected.has(key);
                const rec = recommendedFor(slug).includes(key);
                return (
                  <button key={key} type="button" onClick={() => toggle(key)} aria-pressed={on}
                    className="lq-card text-left rounded-xl p-4 transition-colors"
                    style={{ border: `1.5px solid ${on ? 'var(--lq-g2)' : 'var(--lq-line)'}`, background: on ? 'var(--color-lime-soft)' : 'transparent', cursor: key === 'core' ? 'default' : 'pointer' }}>
                    <span className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--lq-white)' }}>{m.name}</span>
                      <span className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold"
                        style={{ background: on ? 'var(--lq-g2)' : 'transparent', color: 'var(--lq-abyss)', border: `1.5px solid ${on ? 'var(--lq-g2)' : 'var(--lq-line-strong)'}` }}>
                        {on ? '✓' : ''}
                      </span>
                    </span>
                    <span className="block text-xs leading-relaxed mb-2" style={{ color: 'var(--lq-silver)' }}>{m.desc}</span>
                    {advanced && (
                      <span className="block text-[11px] leading-relaxed mb-2 rounded-lg px-2.5 py-2"
                        style={{ background: 'var(--color-feature-error-soft)', color: 'var(--lq-white)' }}>
                        {bx.notes[key as 'whatsapp' | 'payments']}
                      </span>
                    )}
                    <span className="flex flex-wrap gap-1.5">
                      {key === 'core' && <Pill tone="success">{b.included}</Pill>}
                      {popular && <Pill tone="success">★ {bx.popular}</Pill>}
                      {advanced && <Pill>⚙ {bx.advanced}</Pill>}
                      {rec && <Pill tone="lime">{b.recommended}</Pill>}
                      <Pill>{b.runningCost}: {b.costTypes[cost]}</Pill>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl p-5 h-fit lg:sticky lg:top-20" style={card}>
          <h3 className="text-lg tracking-[-0.02em] mb-1" style={{ color: 'var(--lq-white)' }}>{b.summaryTitle}</h3>
          <p className="text-xs mb-3" style={{ color: 'var(--lq-silver)' }}>{fill(b.selectedCount, { n: String(selected.size) })}</p>
          <ul className="flex flex-wrap gap-1.5 mb-4">
            {MODULES.filter((m) => selected.has(m.key)).map((m) => <li key={m.key}><Pill tone="lime">{b.modules[m.key].name}</Pill></li>)}
          </ul>
          {costTypes.length > 0 && (
            <div className="rounded-xl p-3 mb-3" style={{ background: 'var(--lq-deep)' }}>
              <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--lq-silver)' }}>{b.runningCost}</p>
              <ul className="space-y-1">
                {costTypes.map((c) => <li key={c} className="text-xs" style={{ color: 'var(--lq-white)' }}>• {b.costTypes[c]}</li>)}
              </ul>
            </div>
          )}
          {MODULES.some((m) => m.advanced && selected.has(m.key)) && (
            <p className="text-[11px] font-semibold leading-relaxed mb-2 rounded-lg px-2.5 py-2"
              style={{ background: 'var(--color-feature-error-soft)', color: 'var(--lq-white)' }}>
              ⚙ {bx.advancedSummary}
            </p>
          )}
          <p className="text-[11px] leading-relaxed mb-4" style={{ color: 'var(--lq-silver)' }}>{b.costNote}</p>

          {state === 'sent' ? (
            <p role="status" className="rounded-[6px] p-4 text-sm font-medium" style={{ background: 'var(--c-quartz)', color: 'var(--c-abyss)' }}>{b.sent}</p>
          ) : (
            <form onSubmit={submit} className="space-y-2.5" noValidate>
            <Honeypot />
              <Label text={b.email}><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} style={field} /></Label>
              <div className="grid grid-cols-2 gap-2">
                <Label text={b.name}><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} style={field} maxLength={80} /></Label>
                <Label text={b.business}><input value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} className={inputCls} style={field} maxLength={100} /></Label>
              </div>
              <Label text={b.message}><textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} style={{ ...field, resize: 'vertical' }} maxLength={1000} /></Label>
              {error && <p role="alert" className="text-xs rounded-lg px-3 py-2" style={{ color: 'var(--color-feature-error)', background: 'var(--color-feature-error-soft)' }}>{errors[error]}</p>}
              <button type="submit" disabled={state === 'sending'} className="lq-btn-ghost lq-btn-block"
                style={{ opacity: state === 'sending' ? 0.6 : 1 }}>
                {state === 'sending' ? b.sending : b.send}<BtnArrow />
              </button>
            </form>
          )}
        </aside>
      </div>
    </section>
  );
}
