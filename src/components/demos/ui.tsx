import { useCallback, useRef, useState, type ReactNode } from 'react';
import { T, type Lang } from '../../translations';

export type AppT = (typeof T)[Lang]['demos']['app'];

export interface DemoProps {
  lang: Lang;
  t: AppT;
}

export const card: React.CSSProperties = {
  background: 'var(--color-surface-raised)',
  border: '1px solid var(--color-border-card)',
};

export const field: React.CSSProperties = {
  background: 'var(--background)',
  border: '1px solid var(--color-border-card)',
  color: 'var(--color-ink-strongest)',
};

export function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-4" style={accent ? { background: 'var(--color-lime-300)', border: '1px solid var(--color-lime-300)' } : card}>
      <p className="text-xs font-semibold mb-1" style={{ color: accent ? 'var(--color-ink-strongest)' : 'var(--color-ink-muted)' }}>{label}</p>
      <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-ink-strongest)' }}>{value}</p>
    </div>
  );
}

export function Panel({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl p-5 ${className}`} style={card}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--color-ink-muted)' }}>{text}</span>
      {children}
    </label>
  );
}

export const inputCls = 'w-full rounded-lg px-3 py-2 text-sm outline-none';

export function PrimaryBtn({ children, onClick, type = 'button', disabled }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="rounded-lg px-4 py-2 text-sm font-bold transition-opacity"
      style={{ background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="rounded-lg px-3 py-1.5 text-xs font-semibold"
      style={{ border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strongest)', opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'lime' | 'success' }) {
  const style: React.CSSProperties =
    tone === 'lime' ? { background: 'transparent', color: 'var(--color-ink-strongest)', border: '1px solid color-mix(in srgb, var(--c-quartz) 28%, transparent)' }
      // no green on the site: "success/popular" uses the logo lilac, tinted
      : tone === 'success' ? { background: 'color-mix(in srgb, var(--c-lilac) 18%, transparent)', color: 'var(--c-lilac)', border: '1px solid color-mix(in srgb, var(--c-lilac) 45%, transparent)' }
        : { background: 'var(--background)', color: 'var(--color-ink-muted)', border: '1px solid var(--color-border-card)' };
  return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap" style={style}>{children}</span>;
}

/** Minimal toast for demo feedback */
export function useToast() {
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((text: string, error = false) => {
    setMsg({ text, error });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);
  const node = msg ? (
    <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg"
      style={msg.error
        ? { background: 'var(--color-feature-error-soft)', color: 'var(--color-feature-error)', border: '1px solid var(--color-feature-error)' }
        : { background: 'var(--color-ink-strongest)', color: 'var(--background)' }}>
      {msg.text}
    </div>
  ) : null;
  return { show, node };
}

export const uid = () => Math.random().toString(36).slice(2, 9);
