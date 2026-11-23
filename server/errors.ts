// Own error tracking (owner, 2026-11-20): no third-party service. Rows live in public.app_errors (RLS on, server key only).
// Route has ids/query stripped, message is masked (e-mail, IP, phone, tokens) and cut to 300 chars. Never throws.
import { captureServerError } from './sentry.js';
import { dbOn, dbSelect, dbInsert, dbUpdate, kvGet, kvSet } from './db.js';

const SEG = /^(?:[0-9a-f-]{8,}|\d+|[\w-]{20,}|[a-z]{1,4}_[0-9a-f]{6,})$/i;
export const normRoute = (p: string) => String(p ?? '').split('?')[0].split('#')[0].slice(0, 200)
  .split('/').map((s) => (s && SEG.test(s) ? ':id' : s)).join('/');

export const maskText = (s: string) => s
  .replace(/[^\s@<>"']+@[^\s@<>"']+/g, '[mail]')
  .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]')
  .replace(/\b(?:[0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}\b/gi, '[ip]')
  .replace(/[A-Za-z0-9_\-+/=]{24,}/g, '[token]')
  .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]')
  .slice(0, 300);

export async function recordError(route: string, err: unknown): Promise<void> {
  captureServerError(err);
  try {
    if (!dbOn()) return;
    const e = err as { name?: string; status?: number; statusCode?: number; message?: string } | null;
    const r = normRoute(route);
    const kind = maskText(String(e?.status ?? e?.statusCode ?? e?.name ?? 'Error')).slice(0, 60);
    const message = maskText(String(e?.message ?? err ?? ''));
    const since = new Date(Date.now() - 3600_000).toISOString();
    const q = `select=id,count&route=eq.${encodeURIComponent(r)}&kind=eq.${encodeURIComponent(kind)}&message=eq.${encodeURIComponent(message)}&t=gte.${since}&limit=1`;
    const ex = (await dbSelect<{ id: number | string; count: number }>('app_errors', q))[0];
    if (ex) await dbUpdate('app_errors', `id=eq.${ex.id}`, { count: (ex.count ?? 1) + 1 });
    else { await dbInsert('app_errors', { t: new Date().toISOString(), route: r, kind, message, count: 1 }); void notifyNewError(r, kind, message); }
  } catch { /* tracking must never break a request */ }
}

export const ERR_MAIL_KEY = 'settings.errorNotifyEmail';
/** Plain e-mail through the existing Resend setup. Resolves to an error code or null on success. Never throws. */
export async function sendErrorMail(to: string, subject: string, text: string): Promise<string | null> {
  if (!process.env.RESEND_API_KEY || !process.env.DEMO_EMAIL_FROM) return 'mail_not_configured';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.DEMO_EMAIL_FROM, to: [to], subject, text }),
    });
    return r.ok ? null : `mail_failed_${r.status}`;
  } catch { return 'mail_failed'; }
}
/** First occurrence of a route+kind+message only; at most one mail per 10 minutes overall. Nothing happens without a saved address. */
async function notifyNewError(route: string, kind: string, message: string) {
  try {
    const to = (await kvGet<{ email?: string }>(ERR_MAIL_KEY))?.email;
    if (!to || !process.env.RESEND_API_KEY || !process.env.DEMO_EMAIL_FROM) return;
    const last = (await kvGet<{ t?: number }>('settings.errorNotifyLast'))?.t ?? 0;
    if (Date.now() - last < 600_000) return;
    await kvSet('settings.errorNotifyLast', { t: Date.now() });
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    await sendErrorMail(to, `Sitede yeni hata: ${kind}`, [`Yol: ${route}`, `Tür: ${kind}`, `Mesaj: ${message}`, `Zaman: ${new Date().toISOString()}`, '', `Yönetim paneli, Hatalar: ${host ? `https://${host}` : ''}/admin`].join('\n'));
  } catch { /* never break a request */ }
}
