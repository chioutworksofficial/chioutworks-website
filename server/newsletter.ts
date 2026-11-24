// Newsletter / e-mail campaign infrastructure (live on the site: footer box + website-check thank-you page).
// Rules (UWG §7, GDPR): separate unticked opt-in, double opt-in (confirmation link), proof of consent, one-click
// unsubscribe in every mail (also RFC 8058 List-Unsubscribe-Post), and unsubscribed addresses are never mailed again.
// Storage: data/newsletter.json or Supabase. Monthly issues: server/newsletterIssues.ts. Unsubscribe token = HMAC (nothing stored);
// unsubscribing deletes the personal row and keeps only a SHA-256 suppression entry.
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
const find = async (col: 'email' | 'token' | 'id', val: string): Promise<Subscriber | undefined> => {
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
const sha = (x: string) => crypto.createHash('sha256').update(x).digest('hex');
/** Stop mailing an address for good: the personal row is deleted, only a SHA-256 suppression entry stays (no address, no name). */
export async function nlSuppress(email: string, lang: L = 'en') {
  const e = emailKey(email); const h = sha(e); const now = new Date().toISOString();
  await nlDeleteByEmail(e);
  await save({ id: `sup_${h}`, email: `sha256:${h}`, lang, source: 'suppress', status: 'unsubscribed', token: `sup:${h}`, consentVersion: CONSENT_TEXT_VERSION, createdAt: now, confirmedAt: null, unsubscribedAt: now });
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
/** Unguessable unsubscribe token: `<id>.<HMAC(id)>`. Nothing is stored; verified in constant time. Needs SETTINGS_ENC_KEY or ADMIN_TOKEN. */
const hmacKey = () => process.env.SETTINGS_ENC_KEY || process.env.ADMIN_TOKEN || '';
const mac = (id: string) => crypto.createHmac('sha256', Buffer.from(crypto.hkdfSync('sha256', hmacKey(), 'chioutworks-newsletter', 'unsub-v1', 32))).update(id).digest('base64url').slice(0, 32);
export const unsubOn = () => hmacKey().length >= 8;
export const unsubToken = (id: string) => `${id}.${mac(id)}`;
const tokenId = (t: string): string | null => {
  const [id, m] = t.split('.'); if (!id || !m || !unsubOn()) return null;
  const a = Buffer.from(m); const b = Buffer.from(mac(id));
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? id : null;
};
export const unsubscribeUrl = (origin: string, token: string) => `${origin}/api/newsletter/unsubscribe?t=${encodeURIComponent(token)}`;
/** Headers every campaign mail must carry (RFC 8058 one-click unsubscribe in mail apps). */
export const unsubscribeHeaders = (origin: string, token: string) => ({
  'List-Unsubscribe': `<${unsubscribeUrl(origin, token)}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
});
/** Confirmed subscribers (the only ones campaign mail may go to). */
export const nlActive = async () => (await all()).filter((x) => x.status === 'active' && !x.id.startsWith('sup_'));
export const nlCounts = async () => { const a = (await all()).filter((x) => !x.id.startsWith('sup_')); const n = (st: string) => a.filter((x) => x.status === st).length; return { active: n('active'), pending: n('pending'), byLang: Object.fromEntries(LANGS.map((l) => [l, a.filter((x) => x.status === 'active' && x.lang === l).length])) as Record<L, number> }; };

const PAGE: Record<L, { ok: string; okBody: string; out: string; outBody: string; bad: string; ask: string; askBody: string; btn: string }> = {
  tr: { ok: 'Aboneliğiniz onaylandı', okBody: 'Ayda yaklaşık bir kez kısa ve faydalı bir fikir göndereceğim. Her e-postada tek tıkla abonelikten çıkabilirsiniz.', out: 'Abonelikten çıktınız', outBody: 'Artık size kampanya e-postası gönderilmeyecek.', bad: 'Bu bağlantı geçerli değil.' , ask: 'Abonelikten çıkmak istiyor musunuz?', askBody: 'Onaylarsanız e-posta adresiniz silinir ve size bir daha e-posta gönderilmez.', btn: 'Abonelikten çık' },
  en: { ok: 'Subscription confirmed', okBody: 'I will send one short, useful idea about once a month. You can unsubscribe with one click in every e-mail.', out: 'You have unsubscribed', outBody: 'You will not receive any more campaign e-mails.', bad: 'This link is not valid.' , ask: 'Do you want to unsubscribe?', askBody: 'If you confirm, your e-mail address is deleted and you will not be mailed again.', btn: 'Unsubscribe' },
  de: { ok: 'Anmeldung bestätigt', okBody: 'Ich sende Ihnen etwa einmal im Monat eine kurze, nützliche Idee. In jeder E-Mail können Sie sich mit einem Klick abmelden.', out: 'Sie haben sich abgemeldet', outBody: 'Sie erhalten keine Kampagnen-E-Mails mehr.', bad: 'Dieser Link ist nicht gültig.' , ask: 'Möchten Sie sich abmelden?', askBody: 'Wenn Sie bestätigen, wird Ihre E-Mail-Adresse gelöscht und Sie erhalten keine E-Mails mehr.', btn: 'Abmelden' },
  el: { ok: 'Η εγγραφή επιβεβαιώθηκε', okBody: 'Θα σας στέλνω περίπου μία φορά τον μήνα μια σύντομη, χρήσιμη ιδέα. Σε κάθε e-mail μπορείτε να διαγραφείτε με ένα κλικ.', out: 'Διαγραφήκατε', outBody: 'Δεν θα λαμβάνετε πλέον e-mail καμπάνιας.', bad: 'Ο σύνδεσμος δεν είναι έγκυρος.' , ask: 'Θέλετε να διαγραφείτε;', askBody: 'Αν επιβεβαιώσετε, το e-mail σας διαγράφεται και δεν θα λάβετε ξανά μηνύματα.', btn: 'Διαγραφή' },
};
const html = (lang: L, title: string, body: string) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#d7dceb;font:16px/1.6 system-ui,sans-serif}main{max-width:460px;padding:32px;border:1px solid #24375a;border-radius:12px;background:#0e111b}h1{margin:0 0 8px;font-size:22px;color:#fff}</style></head><body><main><h1>${title}</h1><p>${body}</p></main></body></html>`;

interface Deps { rateSkip?: () => boolean; onUnsubscribe?: (email: string) => Promise<void> | void; sendConfirm?: (to: string, lang: L, confirmUrl: string, unsubUrl: string) => Promise<boolean> }

import { validate as v, z, s as str, bool, email } from './validate.js';
const nlSubS = z.object({ website: str(2000), ft: str(500), email, consent: bool, lang: str(8), source: str(40) });
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
    await d.sendConfirm?.(email, s.lang, `${origin}/api/newsletter/confirm?token=${encodeURIComponent(s.token)}`, unsubscribeUrl(origin, unsubToken(s.id))).catch(() => false);
    return res.json({ ok: true });
  });

  app.get('/api/newsletter/confirm', async (req, res) => {
    const s = await find('token', String(req.query.token ?? ''));
    if (!s || s.status === 'unsubscribed') return res.status(404).type('html').send(html(s?.lang ?? 'en', PAGE[s?.lang ?? 'en'].bad, ''));
    if (s.status === 'pending') { s.status = 'active'; s.confirmedAt = new Date().toISOString(); await save(s); }
    return res.type('html').send(html(s.lang, PAGE[s.lang].ok, PAGE[s.lang].okBody));
  });

  // GET only shows a confirmation page (link scanners must not unsubscribe anyone); POST (page button or RFC 8058 one-click from mail apps) does it. Idempotent.
  const tokenOf = (req: Request) => String(req.query.t ?? req.query.token ?? '').slice(0, 200);
  const subOf = async (t: string) => { const id = tokenId(t); return id ? { id, s: await find('id', id) } : { id: null, s: await find('token', t) }; };
  app.get('/api/newsletter/unsubscribe', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const t = tokenOf(req); const { id, s } = await subOf(t);
    if (!s && !id) return res.status(404).type('html').send(html('en', PAGE.en.bad, ''));
    const lang = s?.lang ?? langOf(req.query.l);
    if (!s) return res.type('html').send(html(lang, PAGE[lang].out, PAGE[lang].outBody));   // already unsubscribed
    return res.type('html').send(html(lang, PAGE[lang].ask, `${PAGE[lang].askBody}</p><form method="post" action="/api/newsletter/unsubscribe?t=${encodeURIComponent(t)}"><button type="submit" style="background:#2f6fed;color:#fff;border:0;padding:12px 22px;border-radius:999px;font:600 16px system-ui,sans-serif;cursor:pointer">${PAGE[lang].btn}</button></form><p>`));
  });
  app.post('/api/newsletter/unsubscribe', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const { id, s } = await subOf(tokenOf(req));
    if (!s && !id) return res.status(404).type('html').send(html('en', PAGE.en.bad, ''));
    if (s) { await Promise.resolve(d.onUnsubscribe?.(s.email)).catch(() => undefined); await nlSuppress(s.email, s.lang); }
    const lang = s?.lang ?? 'en';
    return res.type('html').send(html(lang, PAGE[lang].out, PAGE[lang].outBody));
  });
}

/** Admin: subscriber list (count, status, unsubscribe, delete). Tokens never leave the server. */
export function registerNewsletterAdmin(app: Express, deps: { requireAdmin: (req: Request, res: Response) => Promise<boolean>; onUnsubscribe?: (email: string) => Promise<void> | void }) {
  const A = '/api/admin/newsletter'; const onUnsub = deps.onUnsubscribe;
  const guard = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    deps.requireAdmin(req, res).then((ok) => (ok ? fn(req, res) : undefined)).catch(() => { if (!res.headersSent) res.status(500).json({ error: 'server', message: 'Sunucu hatası.' }); });
  app.get(A, guard(async (_req, res) => {
    const list = (await all()).filter((x) => !x.id.startsWith('sup_')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(({ token, ...x }) => x);
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
