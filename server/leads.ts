// Admin "Leads" (Musteri adaylari): every collected contact in one place, source kept separate. Read-only aggregation of the
// existing stores (newsletter, site checks, voice sessions, quote/contact requests, intakes) + a small per-lead status/note (kv
// key leads.state, or data/leads-state.json locally). Admin-only. No personal data in logs. Security: context/GUVENLIK.md.
// Gender is only set from the visitor's own salutation choice in the salutation form (structured field), never inferred.
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbOn, dbSelect, kvGet, kvSet } from './db.js';
import { rlStore } from './rateStore.js';
import { makeStore } from './sales.js';
import { idp } from './validate.js';
import { leadScore } from './leadFlow.js';
import { dncList, dncSet } from './voiceAgent.js';
import { z } from 'zod';

export type LeadSource = 'newsletter' | 'sitecheck' | 'voice' | 'chat' | 'form';
type Social = { platform: string; url: string };
type Ref = { source: LeadSource; tab: 'newsletter' | 'sales' | 'voice' | 'requests' | 'intakes'; id: string };
interface Lead {
  id: string; source: LeadSource; sources: LeadSource[]; refs: Ref[]; refId: string; createdAt: string; lastSeen: string;
  name?: string; email?: string; phone?: string; website?: string; address?: string; socials?: Social[]; company?: string;
  language?: string; country?: string; gender?: 'm' | 'f'; consent?: string; status?: string; summary: string;
  state?: { status: string; note: string; at: string };
  doNotCall?: boolean;
  score?: 'sıcak' | 'kararsız'; preferredChannel?: string; callConsent?: boolean;   // callConsent = chose "phone" (the only group the Voice Agent may call)
}
const STATUSES = ['yeni', 'iletisime-gecildi', 'musteri', 'ilgisiz'] as const;

// ── conservative extraction from free text ──
const EMAIL_G = /[^\s@,;<>()"']+@[^\s@,;<>()"']+\.[^\s@,;<>()"']{2,}/g;
const URL_G = /\bhttps?:\/\/[^\s<>"'`]+|\bwww\.[^\s<>"'`]+|\b(?:[a-z]{2,3}\.)?(?:instagram|facebook|linkedin|tiktok|youtube|twitter|x)\.com\/[^\s<>"'`]+|\bfb\.com\/[^\s<>"'`]+|\bt\.me\/[^\s<>"'`]+/gi;
const PHONE_G = /(?<![\w@./-])(?:\+|00|0)\d[\d\s().\/-]{7,17}\d(?![\w])/g;
const SOCIAL_HOSTS: [RegExp, string][] = [[/(^|\.)instagram\.com$/, 'instagram'], [/(^|\.)(facebook|fb)\.com$/, 'facebook'], [/(^|\.)linkedin\.com$/, 'linkedin'], [/(^|\.)tiktok\.com$/, 'tiktok'], [/(^|\.)(x|twitter)\.com$/, 'x'], [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'youtube'], [/^t\.me$/, 'telegram']];
const cleanUrl = (raw: string): string | null => {
  const t = raw.replace(/[.,;:!?)\]}]+$/, '');
  try { const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`); if (!u.hostname.includes('.') || u.username || u.password) return null; return u.href.slice(0, 300); } catch { return null; }
};
const platformOf = (url: string) => { try { const h = new URL(url).hostname.toLowerCase(); return SOCIAL_HOSTS.find(([r]) => r.test(h))?.[1] ?? null; } catch { return null; } };
const normPhone = (raw: string): string | null => {
  const t = raw.trim().replace(/^00/, '+'); const d = t.replace(/\D/g, '');
  if (d.length < 7 || d.length > 15) return null;
  return (t.startsWith('+') ? '+' : '') + d;
};
function extract(text: string) {
  const out: { website?: string; phone?: string; email?: string; socials: Social[] } = { socials: [] };
  if (!text) return out;
  const t = text.slice(0, 20000);
  out.email = t.match(EMAIL_G)?.[0]?.toLowerCase().replace(/[.,;:!?]+$/, '');
  const noMail = t.replace(EMAIL_G, ' ');
  for (const m of noMail.match(URL_G) ?? []) {
    const u = cleanUrl(m); if (!u) continue; const p = platformOf(u);
    if (p) { if (!out.socials.some((s) => s.url === u)) out.socials.push({ platform: p, url: u }); } else if (!out.website) out.website = u;
  }
  const noUrl = noMail.replace(URL_G, ' ');
  for (const m of noUrl.match(PHONE_G) ?? []) {
    const raw = m.trim(); const digits = raw.replace(/\D/g, '').length;
    if (/^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/.test(raw) || digits < 9) continue;   // dates / short numbers
    const p = normPhone(raw); if (p) { out.phone = p; break; }
  }
  out.socials = out.socials.slice(0, 6);
  return out;
}
const str = (v: unknown, n = 200) => (typeof v === 'string' ? v.replace(/[<>\u0000-\u001f]/g, ' ').trim().slice(0, n) : '');
const mailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const webOf = (v: unknown) => { const s = str(v, 300); return s ? cleanUrl(s) ?? undefined : undefined; };
const iso = (v: unknown) => { const t = typeof v === 'number' ? v : Date.parse(String(v ?? '')); return Number.isFinite(t) ? new Date(t).toISOString() : ''; };

// ── per-lead status/note (kv or local file) ──
const STATE_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/leads-state.json');
type State = Record<string, { status: string; note: string; at: string }>;
const stateGet = async (): Promise<State> => {
  if (dbOn()) return (await kvGet<State>('leads.state')) ?? {};
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return {}; }
};
const stateSet = async (s: State) => {
  if (dbOn()) return kvSet('leads.state', s);
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  const tmp = `${STATE_FILE}.${process.pid}.${Date.now()}.tmp`; fs.writeFileSync(tmp, JSON.stringify(s, null, 2)); fs.renameSync(tmp, STATE_FILE);
};

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data');
async function newsletterAll(): Promise<any[]> {
  if (dbOn()) return (await dbSelect<{ data: any }>('newsletter_subscribers', 'select=data')).map((r) => r.data);
  try { return JSON.parse(fs.readFileSync(path.join(DATA, 'newsletter.json'), 'utf8')); } catch { return []; }
}
const siteChecks = makeStore('site_checks', 'site-checks');

type Deps = {
  requireAdmin: (req: Request, res: Response) => Promise<boolean>;
  listRequests: () => Promise<any[]>;
  listVoice: () => Promise<any[]>;
  listIntakes: () => Promise<any[]>;
};

/** One normalised candidate per stored record (merged afterwards). */
type Cand = Omit<Lead, 'sources' | 'refs' | 'refId' | 'lastSeen' | 'id'> & { ref: Ref };

async function collect(d: Deps): Promise<Cand[]> {
  const out: Cand[] = [];
  const [nl, checks, reqs, voices, intakes] = await Promise.all([newsletterAll(), siteChecks.list(), d.listRequests(), d.listVoice(), d.listIntakes()]);
  const sessions = new Map<string, any>(voices.map((v) => [v.id, v]));
  const turnsText = (s: any) => (Array.isArray(s?.turns) ? s.turns.filter((t: any) => t?.role === 'user').map((t: any) => str(t?.text, 2000)).join('\n') : '');

  for (const s of nl) {
    if (!s?.id || String(s.id).startsWith('sup_') || !mailOk(str(s.email, 254))) continue;
    out.push({ source: 'newsletter', createdAt: iso(s.createdAt), email: str(s.email, 254).toLowerCase(), language: str(s.lang, 8), status: s.status === 'active' ? 'onaylı' : s.status === 'pending' ? 'onay bekliyor' : 'çıktı', consent: s.confirmedAt ? `onay: ${iso(s.confirmedAt).slice(0, 10)}` : 'çift onay bekliyor', summary: `Bülten (${str(s.source, 40) || 'site'})`, ref: { source: 'newsletter', tab: 'newsletter', id: String(s.id) } });
  }
  for (const c of checks) {
    if (c.kind === 'roi' || !mailOk(str(c.email, 254))) continue;
    out.push({ source: 'sitecheck', createdAt: iso(c.createdAt), email: str(c.email, 254).toLowerCase(), company: str(c.company, 100) || undefined, website: webOf(c.url) ?? (c.domain ? webOf(c.domain) : undefined), language: str(c.lang, 8), status: str(c.status, 30), consent: `${c.confirmedAt ? 'onaylı' : 'onay bekliyor'}${c.marketing ? ', pazarlama izni var' : ''}`, summary: `Site kontrolü: ${str(c.domain, 100) || 'adres'}`, ref: { source: 'sitecheck', tab: 'sales', id: String(c.id) } });
  }
  for (const r of reqs) {
    if (!r?.id) continue;
    const source: LeadSource = r.source === 'voice' || r.source === 'voice-agent' ? 'voice' : r.source === 'chat' ? 'chat' : 'form';
    const sess = r.voiceSessionId ? sessions.get(r.voiceSessionId) : null;
    const ex = extract(`${str(r.message, 2000)}\n${str(r.existingSite, 300)}\n${str(r.notes, 1000)}\n${sess ? turnsText(sess) : ''}`);
    const email = str(r.email, 254).toLowerCase();
    const phone = normPhone(str(r.phone, 40)) ?? ex.phone;
    if (!mailOk(email) && !phone) continue;
    const ownSite = webOf(r.existingSite);
    out.push({ source, createdAt: iso(r.createdAt), name: str(r.name, 80) || undefined, email: mailOk(email) ? email : undefined, phone, website: ownSite ?? ex.website, address: [str(r.address, 200), str(r.city, 80)].filter(Boolean).join(', ') || undefined, socials: ex.socials, company: str(r.business, 100) || str(sess?.capture?.business, 100) || undefined, language: str(r.lang, 8), gender: sess?.salutation === 'm' || sess?.salutation === 'f' ? sess.salutation : undefined, status: r.read ? 'okundu' : 'yeni', consent: sess?.consentAt ? `onay: ${iso(sess.consentAt).slice(0, 10)}` : undefined, summary: str(r.message, 160) || str(r.kind, 30) || 'Talep', ref: { source, tab: 'requests', id: String(r.id) } });
  }
  for (const s of voices) {
    if (s?.deleted || s.contactId) continue;     // sessions with a saved request are covered by that request
    const ex = extract(turnsText(s));
    const email = str(s.contact?.email, 254).toLowerCase();
    const phone = normPhone(str(s.contact?.phone, 40)) ?? ex.phone;
    const em = mailOk(email) ? email : ex.email && mailOk(ex.email) ? ex.email : undefined;
    if (!em && !phone) continue;
    const source: LeadSource = s.kind === 'text' ? 'chat' : 'voice';
    out.push({ source, createdAt: iso(s.createdAt), name: str(s.contact?.name, 80) || `${str(s.firstName, 40)} ${str(s.lastName, 40)}`.trim() || undefined, email: em, phone, website: ex.website, socials: ex.socials, company: str(s.capture?.business, 100) || undefined, language: str(s.lang, 8), gender: s.salutation === 'm' || s.salutation === 'f' ? s.salutation : undefined, consent: s.consentAt ? `onay: ${iso(s.consentAt).slice(0, 10)}` : undefined, summary: str(s.contact?.message, 160) || (source === 'chat' ? 'Sohbet' : 'Sesli görüşme'), ref: { source, tab: 'voice', id: String(s.id) } });
  }
  for (const i of intakes) {
    const p = i?.prefill ?? {};
    const email = str(p.email, 254).toLowerCase(); const phone = normPhone(str(p.phone, 40)) ?? undefined;
    if (!i?.id || (!mailOk(email) && !phone)) continue;
    const ex = extract(Object.values(i.answers ?? {}).filter((x) => typeof x === 'string').join('\n'));
    out.push({ source: 'form', createdAt: iso(i.createdAt), name: str(p.contact, 80) || undefined, email: mailOk(email) ? email : undefined, phone: phone ?? ex.phone, website: webOf(p.website) ?? ex.website, socials: ex.socials, company: str(p.company, 100) || undefined, language: str(i.lang, 8), status: str(i.status, 20), consent: i.consentAt ? `onay: ${iso(i.consentAt).slice(0, 10)}` : undefined, summary: 'Analiz formu', ref: { source: 'form', tab: 'intakes', id: String(i.id) } });
  }
  const reqById = new Map<string, any>(reqs.map((r) => [r?.id, r]));
  for (const c of out) {   // lead score + preferred channel (simple rules in leadFlow.ts); only for assistant / form leads
    if (c.source !== 'voice' && c.source !== 'chat' && c.source !== 'form') continue;
    if (c.ref.tab !== 'requests' && c.ref.tab !== 'voice') continue;
    const r = c.ref.tab === 'requests' ? reqById.get(c.ref.id) : null;
    const sv = c.ref.tab === 'voice' ? sessions.get(c.ref.id) : r?.voiceSessionId ? sessions.get(r.voiceSessionId) : null;
    c.preferredChannel = r?.preferredChannel ?? sv?.capture?.preferredChannel;
    c.callConsent = c.preferredChannel === 'phone';
    const sc = leadScore({ hasContact: true, submitted: c.ref.tab === 'requests', text: `${str(r?.message, 2000)}\n${sv ? turnsText(sv) : ''}`, timeline: Boolean(r?.startWhen || r?.budget) });
    if (sc !== 'anonim') c.score = sc;
  }
  return out;
}

const phoneKey = (p?: string) => (p ? p.replace(/\D/g, '').replace(/^0+/, '').slice(-9) : '');
const hid = (k: string) => crypto.createHash('sha256').update(k).digest('hex').slice(0, 16);

function merge(cands: Cand[]): Lead[] {
  const byKey = new Map<string, Lead>();
  const leads: Lead[] = [];
  const keysOf = (c: Cand) => [c.email ? `e:${c.email}` : '', phoneKey(c.phone) ? `p:${phoneKey(c.phone)}` : ''].filter(Boolean);
  for (const c of cands.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const keys = keysOf(c);
    let lead = keys.map((k) => byKey.get(k)).find(Boolean);
    if (!lead) {
      lead = { id: `l_${hid(keys[0] ?? `${c.ref.source}:${c.ref.id}`)}`, source: c.source, sources: [], refs: [], refId: '', createdAt: c.createdAt, lastSeen: c.createdAt, summary: c.summary };
      leads.push(lead);
    }
    for (const k of keys) byKey.set(k, lead);
    const L = lead as any, C = c as any;
    for (const f of ['name', 'email', 'phone', 'website', 'address', 'company', 'language', 'country', 'gender'] as const) if (!L[f] && C[f]) L[f] = C[f];
    for (const s of c.socials ?? []) { L.socials = L.socials ?? []; if (!L.socials.some((x: Social) => x.url === s.url)) L.socials.push(s); }
    if (!lead.sources.includes(c.source)) lead.sources.push(c.source);
    lead.refs.push(c.ref);
    if (c.createdAt && (!lead.createdAt || c.createdAt < lead.createdAt)) lead.createdAt = c.createdAt;
    if (c.createdAt > lead.lastSeen) { lead.lastSeen = c.createdAt; lead.summary = c.summary; lead.status = c.status ?? lead.status; }
    if (c.score && (!lead.score || c.score === 'sıcak')) lead.score = c.score;
    if (c.preferredChannel) lead.preferredChannel = c.preferredChannel;
    if (c.callConsent) lead.callConsent = true;
    lead.consent = [lead.consent, c.consent].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(' · ') || undefined;
  }
  for (const l of leads) { l.source = l.sources[0]; l.refId = `${l.refs[0].tab}:${l.refs[0].id}`; }
  return leads.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
}

export function registerLeads(app: Express, d: Deps) {
  const A = '/api/admin/leads';
  const limit = rateLimit({ store: rlStore('adminLeads'), windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'rate_limited' } });
  const admin = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    d.requireAdmin(req, res).then((ok) => (ok ? fn(req, res) : undefined)).catch(() => { console.error('[leads] failed'); if (!res.headersSent) res.status(500).json({ error: 'server' }); });
  app.get(A, limit, admin(async (_req, res) => {
    const [leads, state, dnc] = await Promise.all([collect(d).then(merge), stateGet(), dncList()]);
    res.set('Cache-Control', 'no-store');
    return res.json({ leads: leads.map((l) => ({ ...l, state: state[l.id], doNotCall: dnc.has(phoneKey(l.phone)) })) });
  }));
  // Anonymous assistant sessions: topic only (first visitor message with e-mail / phone / links removed), never names or contact data.
  app.get(`${A}/anonymous`, limit, admin(async (_req, res) => {
    const clean = (t: string) => t.replace(EMAIL_G, ' ').replace(URL_G, ' ').replace(PHONE_G, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
    const rows = (await d.listVoice()).filter((v) => {
      if (!v || v.deleted || v.contactSubmitted || v.contactId || str(v.contact?.email, 254) || str(v.contact?.phone, 40)) return false;
      const t = Array.isArray(v.turns) ? v.turns.filter((x: any) => x?.role === 'user').map((x: any) => str(x?.text, 2000)).join('\n') : '';
      const ex = extract(t); return t.length > 0 && !ex.email && !ex.phone;
    }).map((v) => ({
      id: String(v.id), source: v.kind === 'text' ? 'chat' : 'voice', createdAt: iso(v.createdAt), language: str(v.lang, 8), turns: Array.isArray(v.turns) ? v.turns.length : 0,
      topic: clean(str((v.turns.find((x: any) => x?.role === 'user') ?? {}).text, 2000)),
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 300);
    res.set('Cache-Control', 'no-store');
    return res.json({ sessions: rows });
  }));
  const body = z.object({ status: z.enum(STATUSES), note: z.string().max(1000).default(''), doNotCall: z.boolean().optional() });
  app.put(`${A}/:id`, limit, admin(async (req, res) => {
    if (!idp.safeParse(req.params.id).success) return res.status(400).json({ error: 'invalid' });
    const b = body.safeParse(req.body ?? {}); if (!b.success) return res.status(400).json({ error: 'invalid' });
    if (b.data.doNotCall !== undefined) {
      const lead = (await collect(d).then(merge)).find((l) => l.id === req.params.id);
      if (lead?.phone) await dncSet(lead.phone, b.data.doNotCall);   // the Voice Agent queue and API skip these numbers
    }
    const s = await stateGet();
    if (b.data.status === 'yeni' && !b.data.note) delete s[req.params.id]; else s[req.params.id] = { status: b.data.status, note: b.data.note.replace(/[<>\u0000-\u0008]/g, ' '), at: new Date().toISOString() };
    await stateSet(s);
    return res.json({ ok: true });
  }));
}
