// Own bot check (no third-party service): hidden honeypot field + HMAC-signed "form opened" timestamp.
// A submit is accepted only when the honeypot is empty and the token is 3 s .. 2 h old.
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { abuseExempt } from './abuse.js';

const MIN_MS = 3000, MAX_MS = 2 * 60 * 60 * 1000;
const sig = (t: string) => crypto.createHmac('sha256', process.env.ABUSE_SALT || 'chioutworks-form-v1').update(`form|${t}`).digest('base64url').slice(0, 32);
export const issueFormToken = () => { const t = String(Date.now()); return `${t}.${sig(t)}`; };

export function tokenState(tok: unknown): 'ok' | 'bad' {
  const [t, s] = String(tok ?? '').split('.');
  if (!t || !s || !/^\d{10,15}$/.test(t)) return 'bad';
  const a = Buffer.from(s), b = Buffer.from(sig(t));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return 'bad';
  const age = Date.now() - Number(t);
  return age >= MIN_MS && age <= MAX_MS ? 'ok' : 'bad';
}

/** Route middleware. Token from body.ft or header x-form-token; honeypot is body.website. */
export function botGate(req: Request, res: Response, next: NextFunction) {
  if (abuseExempt(req.ip ?? 'anon')) return next();   // local dev only (never in production)
  if (String(req.body?.website ?? '').trim()) return res.json({ ok: true });   // honeypot filled: pretend success, store nothing
  if (tokenState(req.body?.ft ?? req.get('x-form-token')) !== 'ok') return res.status(400).json({ ok: false, error: 'bot' });
  return next();
}
