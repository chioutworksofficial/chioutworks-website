// Chioutworks Voice Agent (Retell AI + n8n). Settings (encrypted key), bearer token for external tools, customer queue,
// call logs, availability + appointments. Security: context/GUVENLIK.md §12. No personal data in logs.
// Storage: Supabase tables va_customers / va_calls / va_appointments (id, created_at, data jsonb) + kv; locally data/va-*.json.
import type { Express, Request, Response, NextFunction } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { dbOn, dbSelect, dbUpsert, dbDelete, kvGet, kvSet } from './db.js';
import { rlStore } from './rateStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '../data');
type Row = { id: string; createdAt: string; [k: string]: any };
export interface VaDeps {
  requireAdmin: (req: Request, res: Response) => Promise<boolean>;
  saveRequest: (rec: Row) => Promise<void>;
  deleteRequests: (ids: string[]) => Promise<void>;
  listRequests: () => Promise<Row[]>;
  readBlocked: () => Promise<string[]>;
}

// ── storage ────────────────────────────────────────────────────────────────
const file = (n: string) => path.join(DATA, `va-${n}.json`);
const fread = <T,>(n: string, d: T): T => { try { return JSON.parse(fs.readFileSync(file(n), 'utf8')); } catch { return d; } };
const fwrite = (n: string, v: unknown) => { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(file(n), JSON.stringify(v, null, 2)); };
const tList = async (t: 'customers' | 'calls' | 'appointments'): Promise<Row[]> =>
  dbOn() ? (await dbSelect<{ data: Row }>(`va_${t}`, 'select=data&order=created_at.asc')).map((r) => r.data) : fread<Row[]>(t, []);
const tPut = async (t: 'customers' | 'calls' | 'appointments', rec: Row) => {
  if (dbOn()) return dbUpsert(`va_${t}`, { id: rec.id, created_at: rec.createdAt, data: rec }, 'id');
  const all = fread<Row[]>(t, []); const i = all.findIndex((x) => x.id === rec.id);
  if (i < 0) all.push(rec); else all[i] = rec; fwrite(t, all);
};
const tDel = async (t: 'customers' | 'calls' | 'appointments', id: string) => {
  if (dbOn()) return dbDelete(`va_${t}`, `id=eq.${encodeURIComponent(id)}`);
  fwrite(t, fread<Row[]>(t, []).filter((x) => x.id !== id));
};
const kGet = async <T,>(k: string): Promise<T | null> => (dbOn() ? kvGet<T>(k) : (fread<Record<string, T>>('kv', {})[k] ?? null));
const kSet = async (k: string, v: unknown) => { if (dbOn()) return kvSet(k, v); const o = fread<Record<string, unknown>>('kv', {}); o[k] = v; fwrite('kv', o); };
const kDel = async (k: string) => { if (dbOn()) return dbDelete('kv', `key=eq.${encodeURIComponent(k)}`); const o = fread<Record<string, unknown>>('kv', {}); delete o[k]; fwrite('kv', o); };

// ── settings + encryption (AES-256-GCM, key from SETTINGS_ENC_KEY, else derived from ADMIN_TOKEN) ──
interface Schedule { days: number[]; start: string; end: string; slotMinutes: number; buffer: number }
interface Settings { retellKeyEnc?: string; retellKeyLast4?: string; retellAgentId: string; retellPhoneNumber: string; n8nWebhookUrl: string; mode: 'simulation' | 'live'; schedule: Schedule }
const DEF_SCHEDULE: Schedule = { days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00', slotMinutes: 30, buffer: 0 };
const encKey = () => {
  const secret = process.env.SETTINGS_ENC_KEY || process.env.ADMIN_TOKEN;
  if (!secret) throw new Error('no_enc_secret');
  return Buffer.from(crypto.hkdfSync('sha256', crypto.createHash('sha256').update(secret).digest(), 'chioutworks-voice-agent', 'settings-enc-v1', 32));
};
const encrypt = (plain: string) => {
  const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', encKey(), iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return `v1.${iv.toString('base64url')}.${c.getAuthTag().toString('base64url')}.${ct.toString('base64url')}`;
};
const decrypt = (blob: string) => {
  const [v, iv, tag, ct] = blob.split('.'); if (v !== 'v1') throw new Error('bad_blob');
  const d = crypto.createDecipheriv('aes-256-gcm', encKey(), Buffer.from(iv, 'base64url')); d.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(ct, 'base64url')), d.final()]).toString('utf8');
};
const getSettings = async (): Promise<Settings> => {
  const s = (await kGet<Partial<Settings>>('voiceAgent.settings')) ?? {};
  return { retellAgentId: '', retellPhoneNumber: '', n8nWebhookUrl: '', mode: 'simulation', ...s, schedule: { ...DEF_SCHEDULE, ...(s.schedule ?? {}) } } as Settings;
};

// ── SSRF guard for the n8n URL ─────────────────────────────────────────────
const privateIp = (ip: string) => {
  if (net.isIPv4(ip)) { const [a, b] = ip.split('.').map(Number); return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127); }
  const l = ip.toLowerCase(); if (l.startsWith('::ffff:')) return privateIp(l.slice(7));
  return l === '::1' || l === '::' || l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe8') || l.startsWith('fe9') || l.startsWith('fea') || l.startsWith('feb');
};
const hostBad = (h: string) => { const x = h.replace(/^\[|\]$/g, '').toLowerCase(); return x === 'localhost' || x.endsWith('.localhost') || x.endsWith('.local') || x.endsWith('.internal') || (net.isIP(x) > 0 && privateIp(x)); };
const urlProblem = (u: string): string | null => {
  let p: URL; try { p = new URL(u); } catch { return 'Adres geçersiz.'; }
  if (p.protocol !== 'https:') return 'n8n adresi https ile başlamalı.';
  if (p.username || p.password) return 'Adreste kullanıcı bilgisi olamaz.';
  if (hostBad(p.hostname)) return 'Yerel veya özel ağ adreslerine izin verilmez.';
  return null;
};
/** Resolve at call time too (DNS pointing at a private address is refused). */
const safeFetchUrl = async (u: string) => {
  if (urlProblem(u)) return false;
  try { const r = await dns.lookup(new URL(u).hostname, { all: true }); return r.length > 0 && !r.some((a) => privateIp(a.address)); } catch { return false; }
};

// ── time helpers (Europe/Berlin, DST aware) ────────────────────────────────
const TZ = 'Europe/Berlin';
const offsetMin = (utcMs: number) => {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' }).formatToParts(new Date(utcMs)).find((x) => x.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT([+-])(\d{2}):?(\d{2})?/.exec(p); return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;
};
const berlinToUtc = (ymd: string, hm: string) => {
  const [y, mo, d] = ymd.split('-').map(Number); const [h, mi] = hm.split(':').map(Number);
  const naive = Date.UTC(y, mo - 1, d, h, mi); let t = naive - offsetMin(naive) * 60000; t = naive - offsetMin(t) * 60000; return t;
};
const iso = (utcMs: number) => {
  const o = offsetMin(utcMs); const l = new Date(utcMs + o * 60000).toISOString().slice(0, 19);
  const a = Math.abs(o); return `${l}${o < 0 ? '-' : '+'}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
};
const berlinParts = (utcMs: number) => { const s = iso(utcMs); return { date: s.slice(0, 10), time: s.slice(11, 16) }; };
const hmMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));
const realDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

export async function slotsFor(date: string, deps: Pick<VaDeps, 'readBlocked'>) {
  const sc = (await getSettings()).schedule;
  if ((await deps.readBlocked()).includes(date)) return [];
  if (!sc.days.includes(new Date(`${date}T00:00:00Z`).getUTCDay())) return [];
  const taken = (await tList('appointments')).map((a) => [Date.parse(a.start), Date.parse(a.end)] as const);
  const now = Date.now(); const out: { start: string; end: string; s: number }[] = [];
  const step = sc.slotMinutes + sc.buffer;
  for (let m = hmMin(sc.start); m + sc.slotMinutes <= hmMin(sc.end); m += step) {
    const s = berlinToUtc(date, `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`); const e = s + sc.slotMinutes * 60000;
    if (s <= now) continue;
    if (taken.some(([ts, te]) => ts < e + sc.buffer * 60000 && te + sc.buffer * 60000 > s)) continue;
    out.push({ start: iso(s), end: iso(e), s });
  }
  return out;
}

// ── misc ───────────────────────────────────────────────────────────────────
const STATUS = ['to_call', 'calling', 'booked', 'no_answer'] as const;
const IDP = /^[A-Za-z0-9_-]{1,64}$/;
const sha = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const rid = (p: string) => `${p}_${crypto.randomBytes(8).toString('hex')}`;
const pub = (c: Row) => ({ id: c.id, name: c.name, phone: c.phone, notes: c.notes ?? '', sector: c.sector ?? 'Genel', status: c.status, preferred_time: c.preferred_time ?? 'any' });
const bad = (res: Response, message: string, code = 400) => res.status(code).json({ ok: false, error: 'invalid', message });
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
const scheduleS = z.object({ days: z.array(z.number().int().min(0).max(6)).min(1).max(7), start: z.string().regex(HM), end: z.string().regex(HM), slotMinutes: z.number().int().min(5).max(240), buffer: z.number().int().min(0).max(120) })
  .refine((x) => hmMin(x.start) < hmMin(x.end));
const settingsS = z.object({
  retellApiKey: z.string().max(300).optional(), retellAgentId: z.string().trim().max(120).optional(),
  retellPhoneNumber: z.string().trim().regex(/^(\+?[0-9 ()-]{6,24})?$/).optional(), n8nWebhookUrl: z.string().trim().max(500).optional(),
  mode: z.enum(['simulation', 'live']).optional(), schedule: scheduleS.optional(),
});
const baseUrl = (req: Request) => (process.env.PUBLIC_ORIGIN ?? '').split(',')[0].trim() || `${req.protocol}://${req.get('host')}`;
const ENDPOINTS = ['GET /api/customers?status=to_call', 'GET /api/customers/{id}', 'PATCH /api/customers/{id}', 'GET /api/calendar/availability?date=YYYY-MM-DD', 'POST /api/appointments', 'POST /api/voice-agent/call-log'];
let lock: Promise<unknown> = Promise.resolve();   // serialises booking so two calls cannot take the same slot (single instance)
const exclusive = <T,>(fn: () => Promise<T>) => { const r = lock.then(fn, fn); lock = r.catch(() => {}); return r; };

export function registerVoiceAgent(app: Express, deps: VaDeps) {
  const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    fn(req, res).catch((e) => { console.error('[voice-agent] failed', (e as Error)?.message?.slice(0, 120)); if (!res.headersSent) res.status(500).json({ ok: false, error: 'server' }); });

  // ── token-protected API (no cookies; server-to-server) ──
  const limiter = rateLimit({ store: rlStore('vaLimiter'), windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false, message: { error: 'rate_limited' },
    keyGenerator: (req) => { const a = req.get('authorization'); return a ? `t:${sha(a).slice(0, 24)}` : ipKeyGenerator(req.ip ?? ''); } });
  const requireAgentToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const m = /^Bearer (cwva_[A-Za-z0-9_-]{20,80})$/.exec(req.get('authorization') ?? '');
      const rec = await kGet<{ hash: string }>('voiceAgent.tokenHash');
      if (m && rec?.hash) { const a = crypto.createHash('sha256').update(sha(m[1])).digest(); const b = crypto.createHash('sha256').update(rec.hash).digest(); if (crypto.timingSafeEqual(a, b)) return next(); }
      return res.status(401).json({ error: 'unauthorized' });
    } catch { return res.status(500).json({ error: 'server' }); }
  };
  const guard = [limiter, requireAgentToken];
  app.use(['/api/customers', '/api/calendar', '/api/appointments', '/api/voice-agent'], ...guard);

  app.get('/api/customers', wrap(async (req, res) => {
    const st = req.query.status;
    if (st !== undefined && !(STATUS as readonly string[]).includes(String(st))) return bad(res, 'status geçersiz');
    return res.json((await tList('customers')).filter((c) => !st || c.status === st).map(pub));
  }));
  app.get('/api/customers/:id', wrap(async (req, res) => {
    const c = IDP.test(req.params.id) ? (await tList('customers')).find((x) => x.id === req.params.id) : null;
    return c ? res.json(pub(c)) : res.status(404).json({ error: 'not_found' });
  }));
  app.patch('/api/customers/:id', wrap(async (req, res) => {
    const b = z.object({ status: z.enum(STATUS).optional(), note: z.string().trim().min(1).max(1000).optional() }).safeParse(req.body ?? {});
    if (!b.success) return bad(res, 'geçersiz istek');
    const c = IDP.test(req.params.id) ? (await tList('customers')).find((x) => x.id === req.params.id) : null;
    if (!c) return res.status(404).json({ error: 'not_found' });
    if (b.data.status) c.status = b.data.status;
    if (b.data.note) c.notesHistory = [...(c.notesHistory ?? []), { at: new Date().toISOString(), text: b.data.note }].slice(-200);
    await tPut('customers', c); return res.json(pub(c));
  }));

  app.get('/api/calendar/availability', wrap(async (req, res) => {
    const date = String(req.query.date ?? '');
    if (!realDate(date)) return bad(res, 'date YYYY-MM-DD olmalı');
    return res.json({ date, slots: (await slotsFor(date, deps)).map(({ start, end }) => ({ start, end })) });
  }));

  app.post('/api/appointments', wrap(async (req, res) => {
    const b = z.object({ customer_id: z.string().regex(IDP), start: z.string().max(40), end: z.string().max(40).optional(), notes: z.string().max(1000).optional(), name: z.string().max(80).optional(), phone: z.string().max(40).optional() }).safeParse(req.body ?? {});
    if (!b.success || Number.isNaN(Date.parse(b.data.start))) return bad(res, 'geçersiz istek');
    const out = await exclusive(async () => {
      const cust = (await tList('customers')).find((x) => x.id === b.data.customer_id);
      if (!cust) return { code: 404 as const };
      const t = Date.parse(b.data.start); const { date, time } = berlinParts(t);
      const slot = (await slotsFor(date, deps)).find((x) => x.s === t);
      if (!slot) return { code: 409 as const };
      const name = (b.data.name || cust.name || '').slice(0, 80); const phone = (b.data.phone || cust.phone || '').slice(0, 40);
      const reqId = crypto.randomUUID();
      const appt: Row = { id: rid('appt'), createdAt: new Date().toISOString(), customer_id: cust.id, start: slot.start, end: slot.end, notes: b.data.notes ?? '', name, phone, requestId: reqId };
      await tPut('appointments', appt);
      // Mirror as a request so it shows under "Talepler" (same record shape the contact form saves)
      await deps.saveRequest({ id: reqId, createdAt: appt.createdAt, kind: 'contact', source: 'voice-agent', name, phone, email: '', business: '', city: '', address: '', message: (b.data.notes ?? '').slice(0, 1000), replyPreference: 'phone', lang: 'de', page: '', preferredStart: date, callTime: time, appointmentId: appt.id });
      cust.status = 'booked'; await tPut('customers', cust);
      return { code: 201 as const, appt };
    });
    if (out.code === 404) return res.status(404).json({ error: 'not_found' });
    if (out.code === 409) return res.status(409).json({ error: 'slot_taken' });
    return res.status(201).json({ id: out.appt.id, start: out.appt.start, end: out.appt.end, customer_id: out.appt.customer_id });
  }));

  app.post('/api/voice-agent/call-log', wrap(async (req, res) => {
    const b = z.object({ customer_id: z.string().regex(IDP), call_id: z.string().max(120).optional(), summary: z.string().max(4000).optional(),
      recording_url: z.string().max(500).url().refine((u) => u.startsWith('https://')).optional(), appointment_start: z.string().max(40).optional(),
      status: z.enum(STATUS).optional(), duration_sec: z.number().int().min(0).max(86400).optional() }).safeParse(req.body ?? {});
    if (!b.success) return bad(res, 'geçersiz istek');
    const c = (await tList('customers')).find((x) => x.id === b.data.customer_id);
    if (!c) return res.status(404).json({ error: 'not_found' });
    const rec: Row = { id: rid('call'), createdAt: new Date().toISOString(), customer_id: c.id, customer_name: c.name, callId: b.data.call_id ?? '', summary: b.data.summary ?? '',
      recordingUrl: b.data.recording_url ?? '', appointmentStart: b.data.appointment_start ?? '', status: b.data.status ?? c.status, durationSec: b.data.duration_sec ?? 0, simulated: false };
    await tPut('calls', rec);
    if (b.data.status) { c.status = b.data.status; await tPut('customers', c); }
    return res.status(201).json({ ok: true, id: rec.id });
  }));

  // ── admin (session cookie via /api/admin middleware; CSRF handled there) ──
  const admin = (fn: (req: Request, res: Response) => Promise<unknown>) => wrap(async (req, res) => { if (await deps.requireAdmin(req, res)) await fn(req, res); });
  const A = '/api/admin/voice-agent';
  const view = async (req: Request) => {
    const s = await getSettings(); const t = await kGet<{ createdAt: string }>('voiceAgent.tokenHash');
    return { mode: s.mode, retellAgentId: s.retellAgentId, retellPhoneNumber: s.retellPhoneNumber, n8nWebhookUrl: s.n8nWebhookUrl, schedule: s.schedule,
      retellKey: { configured: !!s.retellKeyEnc, last4: s.retellKeyLast4 ?? '' }, token: { exists: !!t, createdAt: t?.createdAt ?? null }, baseUrl: baseUrl(req), endpoints: ENDPOINTS };
  };
  app.get(`${A}/settings`, admin(async (req, res) => res.json(await view(req))));
  app.put(`${A}/settings`, admin(async (req, res) => {
    const b = settingsS.safeParse(req.body ?? {});
    if (!b.success) return bad(res, 'Girilen değerler geçersiz (telefon, saat veya aralık).');
    const s = await getSettings(); const d = b.data;
    if (d.n8nWebhookUrl) { const p = urlProblem(d.n8nWebhookUrl); if (p) return bad(res, p); }
    if (d.retellApiKey) { s.retellKeyEnc = encrypt(d.retellApiKey.trim()); s.retellKeyLast4 = d.retellApiKey.trim().slice(-4); }   // empty = keep
    if (d.retellAgentId !== undefined) s.retellAgentId = d.retellAgentId;
    if (d.retellPhoneNumber !== undefined) s.retellPhoneNumber = d.retellPhoneNumber;
    if (d.n8nWebhookUrl !== undefined) s.n8nWebhookUrl = d.n8nWebhookUrl;
    if (d.schedule) s.schedule = d.schedule;
    if (d.mode) s.mode = d.mode;
    if (s.mode === 'live' && !(s.retellKeyEnc && s.retellAgentId && s.retellPhoneNumber)) return bad(res, 'Canlı mod için Retell API anahtarı, Agent ID ve telefon numarası girilmiş olmalı.');
    await kSet('voiceAgent.settings', s); return res.json(await view(req));
  }));
  app.post(`${A}/token`, admin(async (_req, res) => {
    const token = `cwva_${crypto.randomBytes(32).toString('base64url')}`; const createdAt = new Date().toISOString();
    await kSet('voiceAgent.tokenHash', { hash: sha(token), createdAt });
    res.set('Cache-Control', 'no-store'); return res.json({ token, createdAt });   // plaintext shown once, never stored
  }));
  app.delete(`${A}/token`, admin(async (_req, res) => { await kDel('voiceAgent.tokenHash'); return res.json({ ok: true }); }));

  app.get(`${A}/queue`, admin(async (_req, res) => res.json({ customers: (await tList('customers')).reverse() })));
  app.post(`${A}/queue`, admin(async (req, res) => {
    const b = z.object({ requestIds: z.array(z.string().max(80)).min(1).max(100) }).safeParse(req.body ?? {});
    if (!b.success) return bad(res, 'geçersiz istek');
    const have = new Set((await tList('customers')).map((c) => c.sourceRequestId)); const ids = new Set(b.data.requestIds);
    let added = 0, skipped = 0;
    for (const r of (await deps.listRequests()).filter((x) => ids.has(x.id))) {
      const phone = String(r.phone ?? '').trim();
      if (!phone || have.has(r.id)) { skipped++; continue; }
      const hr = /^(\d{2}):/.exec(String(r.callTime ?? ''))?.[1];
      await tPut('customers', { id: rid('cust'), createdAt: new Date().toISOString(), sourceRequestId: r.id, name: String(r.name ?? '').slice(0, 80) || 'İsimsiz', phone: phone.slice(0, 40),
        notes: String(r.message || r.topic || r.business || '').slice(0, 500), sector: String(r.roiCalc?.sectorLabel || 'Genel').slice(0, 60), status: 'to_call',
        preferred_time: hr ? (Number(hr) < 12 ? 'morning' : 'afternoon') : 'any', notesHistory: [] });
      added++;
    }
    return res.json({ ok: true, added, skipped });
  }));
  app.patch(`${A}/queue/:id`, admin(async (req, res) => {
    const b = z.object({ status: z.enum(STATUS).optional(), name: z.string().trim().min(1).max(80).optional(), phone: z.string().trim().max(40).optional(), notes: z.string().max(500).optional(),
      sector: z.string().max(60).optional(), preferred_time: z.enum(['morning', 'afternoon', 'any']).optional() }).safeParse(req.body ?? {});
    const c = IDP.test(req.params.id) ? (await tList('customers')).find((x) => x.id === req.params.id) : null;
    if (!b.success || !c) return b.success ? res.status(404).json({ error: 'not_found' }) : bad(res, 'geçersiz istek');
    Object.assign(c, b.data); await tPut('customers', c); return res.json({ ok: true, customer: c });
  }));
  app.delete(`${A}/queue/:id`, admin(async (req, res) => { if (IDP.test(req.params.id)) await tDel('customers', req.params.id); return res.json({ ok: true }); }));

  app.get(`${A}/calls`, admin(async (_req, res) => res.json({ calls: (await tList('calls')).reverse().slice(0, 300) })));
  app.get(`${A}/appointments`, admin(async (_req, res) => res.json({ appointments: (await tList('appointments')).sort((a, b) => b.start.localeCompare(a.start)) })));
  app.delete(`${A}/appointments/:id`, admin(async (req, res) => {
    const a = IDP.test(req.params.id) ? (await tList('appointments')).find((x) => x.id === req.params.id) : null;
    if (a) { await tDel('appointments', a.id); if (a.requestId) await deps.deleteRequests([a.requestId]); }
    return res.json({ ok: true });
  }));

  app.post(`${A}/start`, admin(async (req, res) => {
    const b = z.object({ customerIds: z.array(z.string().regex(IDP)).min(1).max(50) }).safeParse(req.body ?? {});
    if (!b.success) return bad(res, 'Aranacak kişi seçilmedi.');
    const s = await getSettings(); const all = await tList('customers');
    const live = s.mode === 'live';
    let key = '';
    if (live) {
      if (!(s.retellKeyEnc && s.retellAgentId && s.retellPhoneNumber)) return bad(res, 'Canlı mod için Retell ayarları eksik.');
      try { key = decrypt(s.retellKeyEnc); } catch { return bad(res, 'Retell anahtarı çözülemedi, yeniden girin.'); }
    }
    const n8nOk = !live && s.n8nWebhookUrl ? await safeFetchUrl(s.n8nWebhookUrl) : false;
    const base = baseUrl(req); const results: { id: string; ok: boolean; info: string }[] = [];
    for (const id of b.data.customerIds) {
      const c = all.find((x) => x.id === id);
      if (!c) { results.push({ id, ok: false, info: 'bulunamadı' }); continue; }
      c.status = 'calling'; await tPut('customers', c);
      const call: Row = { id: rid('call'), createdAt: new Date().toISOString(), customer_id: c.id, customer_name: c.name, callId: '', summary: '', recordingUrl: '', appointmentStart: '', status: 'calling', durationSec: 0, simulated: !live };
      let info = '';
      if (!live) {
        call.summary = 'Simülasyon: arama yapılmadı';
        if (!s.n8nWebhookUrl) info = 'n8n adresi girilmemiş; yalnızca kayıt oluşturuldu';
        else if (!n8nOk) info = 'n8n adresi güvenli değil veya çözümlenemedi';
        else {
          try {
            const r = await fetch(s.n8nWebhookUrl, { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mode: 'simulation', customer: pub(c), callback: { base_url: base, endpoints: ENDPOINTS } }) });
            info = r.ok ? 'n8n test verisi gönderildi' : `n8n yanıtı: ${r.status}`;
          } catch { info = 'n8n adresine ulaşılamadı'; }
        }
      } else {
        try {
          const r = await fetch('https://api.retellai.com/v2/create-phone-call', { method: 'POST', signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from_number: s.retellPhoneNumber, to_number: c.phone, override_agent_id: s.retellAgentId, metadata: { customer_id: c.id } }) });
          const j = (await r.json().catch(() => ({}))) as { call_id?: string };
          if (!r.ok) throw new Error('retell');
          call.callId = String(j.call_id ?? ''); info = 'arama başlatıldı';
        } catch { c.status = 'to_call'; await tPut('customers', c); call.status = 'to_call'; call.summary = 'Arama başlatılamadı'; info = 'Retell aramayı başlatamadı'; }
      }
      await tPut('calls', call); results.push({ id, ok: !info.includes('başlatamadı'), info });
    }
    return res.json({ ok: true, mode: s.mode, results, message: live ? 'Canlı arama isteği gönderildi.' : 'Simülasyon: gerçek arama yapılmadı.' });
  }));
}
