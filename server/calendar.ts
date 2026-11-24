// Admin "Takvim": one follow-up entry per identified lead per day (voice, chat or form with e-mail/phone).
// Anonymous sessions and newsletter / site-check sign-ups never create entries. Entries hold NO e-mail or phone: only a hashed id (idempotency), the source, the day, the callConsent flag and a pointer to the original record. Security: context/GUVENLIK.md.
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbOn, kvGet, kvSet } from './db.js';
import { rlStore } from './rateStore.js';

export type EntrySource = 'voice' | 'chat' | 'form';
export type EntryKind = 'hot' | 'call' | 'remind';
export interface CalEntry { id: string; lk: string; kind: EntryKind; day: string; source: EntrySource; title: string; refTab: 'requests' | 'voice'; refId: string; preferredChannel: string; score: string; createdAt: string }
const LABEL: Record<EntrySource, string> = { voice: 'Sesli asistan', chat: 'Sohbet', form: 'Form' };
const TITLE: Record<EntryKind, string> = { hot: 'yazılı cevap ver (1 iş günü)', call: 'ara', remind: 'hatırlatma gönderildi mi?' };
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/calendar-entries.json');
const KEY = 'calendar.entries';

const load = async (): Promise<CalEntry[]> => {
  if (dbOn()) return (await kvGet<CalEntry[]>(KEY)) ?? [];
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return []; }
};
const save = async (list: CalEntry[]) => {
  const keep = list.slice(-600);
  if (dbOn()) return kvSet(KEY, keep);
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`; fs.writeFileSync(tmp, JSON.stringify(keep, null, 2)); fs.renameSync(tmp, FILE);
};
const berlinDay = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const phoneKey = (p: string) => p.replace(/\D/g, '').replace(/^0+/, '').slice(-9);

let chain: Promise<unknown> = Promise.resolve();   // serialises read-modify-write inside one instance
const whoOf = (email?: string, phone?: string) => email?.trim() ? `e:${email.trim().toLowerCase()}` : phoneKey(phone ?? '').length >= 7 ? `p:${phoneKey(phone ?? '')}` : '';
const lkOf = (who: string) => crypto.createHash('sha256').update(who).digest('hex').slice(0, 16);

/** Idempotent: one entry per lead (e-mail or phone) per kind per day. Never throws; never logs personal data. */
export function addCalendarEntry(o: { kind: EntryKind; source: EntrySource; email?: string; phone?: string; refTab: 'requests' | 'voice'; refId: string; preferredChannel: string; score: string; inDays?: number }): Promise<void> {
  const who = whoOf(o.email, o.phone);
  if (!who) return Promise.resolve();
  const day = berlinDay(new Date(Date.now() + (o.inDays ?? 0) * 86400e3));
  const lk = lkOf(who);
  const id = `c_${crypto.createHash('sha256').update(`${who}|${o.kind}|${day}`).digest('hex').slice(0, 16)}`;
  const run = async () => {
    const list = await load();
    if (list.some((e) => e.id === id)) return;
    list.push({ id, lk, kind: o.kind, day, source: o.source, title: `${LABEL[o.source]}: ${TITLE[o.kind]}`, refTab: o.refTab, refId: o.refId, preferredChannel: o.preferredChannel, score: o.score, createdAt: new Date().toISOString() });
    await save(list);
  };
  chain = chain.then(run).catch(() => { console.error('[calendar] entry failed'); });
  return chain as Promise<void>;
}
/** Removes a pending entry of a kind for a lead (e.g. the reminder, once the form was submitted). */
export function dropCalendarEntry(kind: EntryKind, email?: string, phone?: string): Promise<void> {
  const who = whoOf(email, phone); if (!who) return Promise.resolve();
  const lk = lkOf(who);
  chain = chain.then(async () => { const list = await load(); const keep = list.filter((e) => !(e.lk === lk && e.kind === kind)); if (keep.length !== list.length) await save(keep); }).catch(() => { console.error('[calendar] drop failed'); });
  return chain as Promise<void>;
}

export function registerCalendar(app: Express, d: { requireAdmin: (req: Request, res: Response) => Promise<boolean> }) {
  const limit = rateLimit({ store: rlStore('adminCalendar'), windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'rate_limited' } });
  app.get('/api/admin/calendar-entries', limit, async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    try { res.set('Cache-Control', 'no-store'); return res.json({ entries: (await load()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }); }
    catch { console.error('[calendar] list failed'); return res.status(500).json({ error: 'server' }); }
  });
}
