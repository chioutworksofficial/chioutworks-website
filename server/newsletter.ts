// Newsletter / e-mail campaign infrastructure (prepared, not yet shown on the site).
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

/** Only confirmed, not unsubscribed addresses may receive campaign mail. */
export function canSend(email: string): boolean {
  const s = read().find((x) => x.email === email.trim().toLowerCase());
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

interface Deps { rateSkip?: () => boolean; sendConfirm?: (to: string, lang: L, confirmUrl: string, unsubUrl: string) => Promise<boolean> }

export function registerNewsletter(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });
  const langOf = (v: unknown): L => ((LANGS as readonly string[]).includes(String(v)) ? (String(v) as L) : 'en');

  // Opt-in (only from an explicit, unticked checkbox). Always answers the same, so addresses cannot be probed.
  app.post('/api/newsletter/subscribe', limiter, async (req: Request, res: Response) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase().slice(0, 254);
    if (!EMAIL_RE.test(email) || req.body?.consent !== true) return res.status(400).json({ error: 'bad_request' });
    const all = read(); let s = all.find((x) => x.email === email);
    if (s?.status === 'active') return res.json({ ok: true });
    if (!s) { s = { id: crypto.randomUUID(), email, lang: langOf(req.body?.lang), source: String(req.body?.source ?? 'site').slice(0, 40), status: 'pending', token: crypto.randomBytes(24).toString('base64url'), consentVersion: CONSENT_TEXT_VERSION, createdAt: new Date().toISOString(), confirmedAt: null, unsubscribedAt: null }; all.push(s); }
    else { s.status = 'pending'; s.unsubscribedAt = null; s.consentVersion = CONSENT_TEXT_VERSION; }
    write(all);
    const origin = `${req.protocol}://${req.get('host')}`;
    // Without a verified sending domain nothing is mailed; the address simply stays "pending" (never mailed).
    await d.sendConfirm?.(email, s.lang, `${origin}/api/newsletter/confirm?token=${encodeURIComponent(s.token)}`, unsubscribeUrl(origin, s.token)).catch(() => false);
    return res.json({ ok: true });
  });

  app.get('/api/newsletter/confirm', (req, res) => {
    const all = read(); const s = all.find((x) => x.token === String(req.query.token ?? ''));
    if (!s || s.status === 'unsubscribed') return res.status(404).type('html').send(html(s?.lang ?? 'en', PAGE[s?.lang ?? 'en'].bad, ''));
    if (s.status === 'pending') { s.status = 'active'; s.confirmedAt = new Date().toISOString(); write(all); }
    return res.type('html').send(html(s.lang, PAGE[s.lang].ok, PAGE[s.lang].okBody));
  });

  // One click from the mail (GET) and RFC 8058 one-click from mail apps (POST)
  const unsubscribe = (req: Request, res: Response) => {
    const token = String(req.query.token ?? req.body?.token ?? '');
    const all = read(); const s = all.find((x) => x.token === token);
    if (!s) return res.status(404).type('html').send(html('en', PAGE.en.bad, ''));
    if (s.status !== 'unsubscribed') { s.status = 'unsubscribed'; s.unsubscribedAt = new Date().toISOString(); write(all); }
    return res.type('html').send(html(s.lang, PAGE[s.lang].out, PAGE[s.lang].outBody));
  };
  app.get('/api/newsletter/unsubscribe', unsubscribe);
  app.post('/api/newsletter/unsubscribe', unsubscribe);
}
