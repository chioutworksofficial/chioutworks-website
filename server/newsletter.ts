// Newsletter / e-mail campaign infrastructure (live on the site: footer box + website-check thank-you page).
// Rules (UWG §7, GDPR): separate unticked opt-in, double opt-in (confirmation link), proof of consent, one-click
// unsubscribe in every mail (also RFC 8058 List-Unsubscribe-Post), and unsubscribed addresses are never mailed again.
// Storage: data/newsletter.json. No campaign sending here yet: future senders must call canSend() and add the
// List-Unsubscribe headers from unsubscribeHeaders().
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbOn, dbSelect, dbUpsert, dbDelete } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(__dirname, '../data/newsletter.json');
const LANGS = ['tr', 'en', 'de', 'el'] as const;
type L = (typeof LANGS)[number];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONSENT_TEXT_VERSION = 1;   // bump when the opt-in wording changes

export interface Subscriber {
  id: string; email: string; lang: L; source: string;
  status: 'pending' | 'active' | 'unsubscribed';
  token: string;                  // for confirm + unsubscribe links (never shown elsewhere)
  consentVersion: number; createdAt: string; confirmedAt: string | null; unsubscribedAt: string | null;
}

const read = (): Subscriber[] => { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { return []; } };
const write = (all: Subscriber[]) => {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  const tmp = `${STORE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(all, null, 2));
  fs.renameSync(tmp, STORE);
};

const TABLE = 'newsletter_subscribers';
const find = async (col: 'email' | 'token', val: string): Promise<Subscriber | undefined> => {
  if (!dbOn()) return read().find((x) => x[col] === val);
  return (await dbSelect<{ data: Subscriber }>(TABLE, `select=data&${col}=eq.${encodeURIComponent(val)}&limit=1`))[0]?.data;
};
const save = async (s: Subscriber) => {
  if (!dbOn()) { const all = read(); const i = all.findIndex((x) => x.id === s.id); if (i < 0) all.push(s); else all[i] = s; return write(all); }
  await dbUpsert(TABLE, { id: s.id, email: s.email, token: s.token, status: s.status, data: s }, 'id');
};

const all = async (): Promise<Subscriber[]> => (dbOn() ? (await dbSelect<{ data: Subscriber }>(TABLE, 'select=data')).map((r) => r.data) : read());
const emailKey = (e: string) => e.trim().toLowerCase();
/** Marketing consent proven elsewhere (double opt-in on the website-check form): subscriber becomes active. */
export async function nlActivate(email: string, lang: L, source: string) {
  const e = emailKey(email); const now = new Date().toISOString();
  const s = (await find('email', e)) ?? { id: crypto.randomUUID(), email: e, lang, source, status: 'pending' as const, token: crypto.randomBytes(24).toString('base64url'), consentVersion: CONSENT_TEXT_VERSION, createdAt: now, confirmedAt: null, unsubscribedAt: null };
  s.status = 'active'; s.confirmedAt = now; s.unsubscribedAt = null; await save(s);
}
/** Stop mailing an address for good (suppression entry: only the status stays). */
export async function nlSuppress(email: string, lang: L = 'en') {
  const e = emailKey(email); const now = new Date().toISOString();
  const s = (await find('email', e)) ?? { id: crypto.randomUUID(), email: e, lang, source: 'suppress', status: 'unsubscribed' as const, token: crypto.randomBytes(24).toString('base64url'), consentVersion: CONSENT_TEXT_VERSION, createdAt: now, confirmedAt: null, unsubscribedAt: now };
  s.status = 'unsubscribed'; s.unsubscribedAt ??= now; await save(s);
}
export async function nlDeleteByEmail(email: string) {
  const s = await find('email', emailKey(email)); if (!s) return;
  if (dbOn()) return dbDelete(TABLE, `id=eq.${encodeURIComponent(s.id)}`);
  write(read().filter((x) => x.id !== s.id));
}

/** Only confirmed, not unsubscribed addresses may receive campaign mail. */
export async function canSend(email: string): Promise<boolean> {
  const s = await find('email', email.trim().toLowerCase());
  return !!s && s.status === 'active';
}
export const unsubscribeUrl = (origin: string, token: string) => `${origin}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
/** Headers every campaign mail must carry (one-click unsubscribe in mail apps). */
export const unsubscribeHeaders = (origin: string, token: string) => ({
  'List-Unsubscribe': `<${unsubscribeUrl(origin, token)}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
});

const PAGE: Record<L, { ok: string; okBody: string; out: string; outBody: string; bad: string }> = {
  tr: { ok: 'Aboneliğiniz onaylandı', okBody: 'Ara sıra faydalı ipuçları göndereceğim. Her e-postada tek tıkla abonelikten çıkabilirsiniz.', out: 'Abonelikten çıktınız', outBody: 'Artık size kampanya e-postası gönderilmeyecek.', bad: 'Bu bağlantı geçerli değil.' },
  en: { ok: 'Subscription confirmed', okBody: 'I will send useful tips now and then. You can unsubscribe with one click in every e-mail.', out: 'You have unsubscribed', outBody: 'You will not receive any more campaign e-mails.', bad: 'This link is not valid.' },
  de: { ok: 'Anmeldung bestätigt', okBody: 'Ich sende Ihnen gelegentlich nützliche Tipps. In jeder E-Mail können Sie sich mit einem Klick abmelden.', out: 'Sie haben sich abgemeldet', outBody: 'Sie erhalten keine Kampagnen-E-Mails mehr.', bad: 'Dieser Link ist nicht gültig.' },
  el: { ok: 'Η εγγραφή επιβεβαιώθηκε', okBody: 'Θα σας στέλνω περιστασιακά χρήσιμες συμβουλές. Σε κάθε e-mail μπορείτε να διαγραφείτε με ένα κλικ.', out: 'Διαγραφήκατε', outBody: 'Δεν θα λαμβάνετε πλέον e-mail καμπάνιας.', bad: 'Ο σύνδεσμος δεν είναι έγκυρος.' },
};
const html = (lang: L, title: string, body: string) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#d7dceb;font:16px/1.6 system-ui,sans-serif}main{max-width:460px;padding:32px;border:1px solid #24375a;border-radius:12px;background:#0e111b}h1{margin:0 0 8px;font-size:22px;color:#fff}</style></head><body><main><h1>${title}</h1><p>${body}</p></main></body></html>`;

interface Deps { rateSkip?: () => boolean; onUnsubscribe?: (email: string) => Promise<void> | void; sendConfirm?: (to: string, lang: L, confirmUrl: string, unsubUrl: string) => Promise<boolean> }

import { validate as v, z, s as str, bool, email } from './validate.js';
const nlSubS = z.object({ website: str(2000), ft: str(500), email, consent: bool, lang: str(8), source: str(40) });
const nlUnsubS = z.object({ token: str(200) });
export function registerNewsletter(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });
  const langOf = (v: unknown): L => ((LANGS as readonly string[]).includes(String(v)) ? (String(v) as L) : 'en');

  // Opt-in (only from an explicit, unticked checkbox). Always answers the same, so addresses cannot be probed.
  app.post('/api/newsletter/subscribe', limiter, v(nlSubS), async (req: Request, res: Response) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase().slice(0, 254);
    if (!EMAIL_RE.test(email) || req.body?.consent !== true) return res.status(400).json({ error: 'bad_request' });
    let s = await find('email', email);
    if (s?.status === 'active') return res.json({ ok: true });
    if (!s) { s = { id: crypto.randomUUID(), email, lang: langOf(req.body?.lang), source: String(req.body?.source ?? 'site').slice(0, 40), status: 'pending', token: crypto.randomBytes(24).toString('base64url'), consentVersion: CONSENT_TEXT_VERSION, createdAt: new Date().toISOString(), confirmedAt: null, unsubscribedAt: null }; }
    else { s.status = 'pending'; s.unsubscribedAt = null; s.consentVersion = CONSENT_TEXT_VERSION; }
    await save(s);
    const origin = `${req.protocol}://${req.get('host')}`;
    // Without a verified sending domain nothing is mailed; the address simply stays "pending" (never mailed).
    await d.sendConfirm?.(email, s.lang, `${origin}/api/newsletter/confirm?token=${encodeURIComponent(s.token)}`, unsubscribeUrl(origin, s.token)).catch(() => false);
    return res.json({ ok: true });
  });

  app.get('/api/newsletter/confirm', async (req, res) => {
    const s = await find('token', String(req.query.token ?? ''));
    if (!s || s.status === 'unsubscribed') return res.status(404).type('html').send(html(s?.lang ?? 'en', PAGE[s?.lang ?? 'en'].bad, ''));
    if (s.status === 'pending') { s.status = 'active'; s.confirmedAt = new Date().toISOString(); await save(s); }
    return res.type('html').send(html(s.lang, PAGE[s.lang].ok, PAGE[s.lang].okBody));
  });

  // One click from the mail (GET) and RFC 8058 one-click from mail apps (POST)
  const unsubscribe = async (req: Request, res: Response) => {
    const token = String(req.query.token ?? req.body?.token ?? '');
    const s = await find('token', token);
    if (!s) return res.status(404).type('html').send(html('en', PAGE.en.bad, ''));
    if (s.status !== 'unsubscribed') { s.status = 'unsubscribed'; s.unsubscribedAt = new Date().toISOString(); await save(s); }
    await Promise.resolve(d.onUnsubscribe?.(s.email)).catch(() => undefined);
    return res.type('html').send(html(s.lang, PAGE[s.lang].out, PAGE[s.lang].outBody));
  };
  app.get('/api/newsletter/unsubscribe', unsubscribe);
  app.post('/api/newsletter/unsubscribe', v(nlUnsubS), unsubscribe);
}

/** Admin: subscriber list (count, status, unsubscribe, delete). Tokens never leave the server. */
export function registerNewsletterAdmin(app: Express, deps: { requireAdmin: (req: Request, res: Response) => Promise<boolean>; onUnsubscribe?: (email: string) => Promise<void> | void }) {
  const A = '/api/admin/newsletter'; const onUnsub = deps.onUnsubscribe;
  const guard = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    deps.requireAdmin(req, res).then((ok) => (ok ? fn(req, res) : undefined)).catch(() => { if (!res.headersSent) res.status(500).json({ error: 'server', message: 'Sunucu hatası.' }); });
  app.get(A, guard(async (_req, res) => {
    const list = (await all()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(({ token, ...x }) => x);
    return res.json({ subscribers: list });
  }));
  const byId = async (id: string) => (await all()).find((x) => x.id === id);
  app.post(`${A}/:id/unsubscribe`, guard(async (req, res) => {
    const s = await byId(String(req.params.id)); if (!s) return res.status(404).json({ error: 'not_found' });
    await nlSuppress(s.email, s.lang); await Promise.resolve(onUnsub?.(s.email)).catch(() => undefined); return res.json({ ok: true });
  }));
  app.delete(`${A}/:id`, guard(async (req, res) => {
    const s = await byId(String(req.params.id)); if (s) { await nlDeleteByEmail(s.email); await Promise.resolve(onUnsub?.(s.email)).catch(() => undefined); }
    return res.json({ ok: true });
  }));
}
