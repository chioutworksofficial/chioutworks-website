import type { Lang } from '../translations';

// 24h demo access. The server (server/index.ts → /api/demo/*) is the source of
// truth for codes; the browser only remembers a verified code until it expires.

const KEY = 'cw-demo-access';

export interface DemoAccess {
  code: string;
  email: string;
  expiresAt: number;
}

export type DemoErrorCode = 'invalid_email' | 'invalid_code' | 'expired' | 'rate_limited' | 'server';

export function getDemoAccess(): DemoAccess | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as DemoAccess;
    if (!a?.expiresAt || a.expiresAt <= Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return a;
  } catch {
    return null;
  }
}

export function saveDemoAccess(a: DemoAccess) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* private mode: access lasts for this page view only */
  }
}

async function post<T>(url: string, body: unknown): Promise<T | { ok: false; error: DemoErrorCode }> {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => null);
    if (r.status === 429) return { ok: false, error: 'rate_limited' };
    if (!data) return { ok: false, error: 'server' };
    return data;
  } catch {
    return { ok: false, error: 'server' };
  }
}

export type RequestCodeResult =
  | { ok: true; expiresAt: number; simulated: boolean; devCode?: string }
  | { ok: false; error: DemoErrorCode };

export function requestDemoCode(input: { email: string; name?: string; phone?: string; demo: string; lang: Lang }) {
  return post<RequestCodeResult>('/api/demo/request-code', input);
}

export type VerifyCodeResult =
  | { ok: true; expiresAt: number; email: string }
  | { ok: false; error: DemoErrorCode };

export function verifyDemoCode(code: string) {
  return post<VerifyCodeResult>('/api/demo/verify', { code });
}

/** "23:41" (hours:minutes) — language neutral */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

const LOCALES: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };

export function formatDateTime(ts: number, lang: Lang): string {
  return new Date(ts).toLocaleString(LOCALES[lang], { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatMoney(n: number, lang: Lang): string {
  const currency = lang === 'tr' ? 'TRY' : 'EUR';
  return new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

export const fill = (s: string, vars: Record<string, string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
