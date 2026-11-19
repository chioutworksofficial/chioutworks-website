// Cookieless, server-side visitor statistics with bot filtering (like Plausible/Umami).
// Nothing is stored on the visitor's device (no consent needed under TDDDG §25); no IP address is stored.
// Unique visitors = SHA-256(daily random salt + IP + user agent), salt rotates every day and old salts are deleted,
// so a visitor cannot be recognised across days or re-identified. Storage: data/analytics/<YYYY-MM-DD>.jsonl
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbOn, dbInsert, dbSelect, dbDelete } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '../data/analytics');
const KEEP_DAYS = 400;

export const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|python|curl|wget|httpclient|axios|node-fetch|go-http|java\/|okhttp|puppeteer|playwright|selenium|phantom|scrapy|facebookexternalhit|preview|monitor|uptime|gptbot|claudebot|perplexity|ccbot|bytespider|ahrefs|semrush|mj12|dotbot/i;

const day = (d = new Date()) => d.toISOString().slice(0, 10);
let saltDay = ''; let salt = '';
let dbCleanDay = '';
async function dbDailySalt(today: string): Promise<string> {
  const read = async () => (await dbSelect<{ salt: string }>('daily_salts', `select=salt&day=eq.${today}`))[0]?.salt;
  let s = await read();
  if (!s) { await dbInsert('daily_salts', { day: today, salt: crypto.randomBytes(32).toString('hex') }).catch(() => { /* race: re-read */ }); s = await read(); }
  if (!s) throw new Error('[analytics] no salt');
  if (dbCleanDay !== today) {   // once per process per day: old salts (unlinkability) and retention
    dbCleanDay = today;
    dbDelete('daily_salts', `day=lt.${today}`).catch(() => { /* retry next restart */ });
    dbDelete('analytics_events', `day=lt.${day(new Date(Date.now() - KEEP_DAYS * 864e5))}`).catch(() => { /* ignore */ });
  }
  return s;
}
async function dailySalt(): Promise<string> {
  const today = day();
  if (saltDay === today) return salt;
  if (dbOn()) { salt = await dbDailySalt(today); saltDay = today; return salt; }
  fs.mkdirSync(DIR, { recursive: true });
  const f = path.join(DIR, `.salt-${today}`);
  try { salt = fs.readFileSync(f, 'utf8'); } catch { salt = crypto.randomBytes(32).toString('hex'); fs.writeFileSync(f, salt); }
  saltDay = today;
  // Delete old salts (unlinkability) and data older than KEEP_DAYS
  for (const n of fs.readdirSync(DIR)) {
    const m = n.match(/(\d{4}-\d{2}-\d{2})/); if (!m) continue;
    if ((n.startsWith('.salt-') && m[1] !== today) || Date.parse(m[1]) < Date.now() - KEEP_DAYS * 864e5) { try { fs.unlinkSync(path.join(DIR, n)); } catch { /* ignore */ } }
  }
  return salt;
}

const device = (ua: string) => (/ipad|tablet/i.test(ua) ? 'tablet' : /mobi|iphone|android/i.test(ua) ? 'mobile' : 'desktop');
const browser = (ua: string) => (/edg\//i.test(ua) ? 'Edge' : /opr\/|opera/i.test(ua) ? 'Opera' : /firefox/i.test(ua) ? 'Firefox' : /chrome|crios/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : 'Diğer');
const os = (ua: string) => (/windows/i.test(ua) ? 'Windows' : /iphone|ipad|ios/i.test(ua) ? 'iOS' : /mac os/i.test(ua) ? 'macOS' : /android/i.test(ua) ? 'Android' : /linux/i.test(ua) ? 'Linux' : 'Diğer');
const clean = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, n);

interface Ev { t: number; k: 'pv' | 'leave' | 'click'; id: string; v: string; bot: string; path?: string; ref?: string; lang?: string; cc?: string; dev?: string; br?: string; os?: string; ms?: number; label?: string }

function append(ev: Ev) {
  if (dbOn()) { dbInsert('analytics_events', { day: day(new Date(ev.t)), t: new Date(ev.t).toISOString(), data: ev }).catch((e) => console.warn('[analytics] insert failed', String(e).slice(0, 120))); return; }
  fs.mkdirSync(DIR, { recursive: true });
  fs.appendFileSync(path.join(DIR, `${day(new Date(ev.t))}.jsonl`), JSON.stringify(ev) + '\n');
}
async function readDays(n: number): Promise<Ev[]> {
  if (dbOn()) return (await dbSelect<{ data: Ev }>('analytics_events', `select=data&day=gte.${day(new Date(Date.now() - (n - 1) * 864e5))}&order=t.asc`)).map((r) => r.data);
  const out: Ev[] = [];
  for (let i = 0; i < n; i++) {
    const f = path.join(DIR, `${day(new Date(Date.now() - i * 864e5))}.jsonl`);
    let txt = ''; try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
    for (const line of txt.split('\n')) { if (!line) continue; try { out.push(JSON.parse(line)); } catch { /* skip */ } }
  }
  return out;
}

interface Deps { requireAdmin: (req: Request, res: Response) => boolean | Promise<boolean>; rateSkip?: () => boolean }

export function registerAnalytics(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });
  const perVisitor = new Map<string, number>();   // events per visitor hash per day (in memory)

  app.post('/api/a', limiter, async (req: Request, res: Response) => {
    res.status(204).end();   // answer at once; never leak anything back
    try {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
      const k = b.k === 'leave' || b.k === 'click' ? b.k : 'pv';
      const ua = String(req.get('user-agent') ?? '');
      const ip = String(req.ip ?? '');
      const v = crypto.createHash('sha256').update(`${await dailySalt()}|${ip}|${ua}`).digest('hex').slice(0, 16);
      const n = (perVisitor.get(`${day()}|${v}`) ?? 0) + 1; perVisitor.set(`${day()}|${v}`, n);
      if (perVisitor.size > 50000) perVisitor.clear();
      // Bot signals: self-declared bot UA, automation flag, no Accept-Language, no human interaction before the beacon, flood
      const bot = BOT_UA.test(ua) ? 'ua' : b.wd === true ? 'webdriver' : !req.get('accept-language') ? 'no-lang' : n > 300 ? 'flood' : (k === 'pv' && b.eng !== true) ? 'no-engagement' : '';
      const id = clean(b.id, 24);
      if (!/^[a-z0-9]{8,24}$/i.test(id)) return;
      const cc = /^[a-z]{2}$/i.test(String(req.get('x-vercel-ip-country') ?? '')) ? String(req.get('x-vercel-ip-country')).toLowerCase() : clean(b.cc, 2).toLowerCase();
      const base = { t: Date.now(), k, id, v, bot } as Ev;
      if (k === 'pv') {
        let ref = '';
        try { const r = new URL(String(b.ref ?? '')); if (r.host && r.host !== req.get('host')) ref = r.host.replace(/^www\./, ''); } catch { /* none */ }
        append({ ...base, path: clean(b.path, 200).split('?')[0], ref, lang: clean(b.lang, 5), cc, dev: device(ua), br: browser(ua), os: os(ua) });
      } else if (k === 'leave') append({ ...base, ms: Math.max(0, Math.min(3_600_000, Number(b.ms) || 0)) });
      else append({ ...base, label: clean(b.label, 60), path: clean(b.path, 200).split('?')[0] });
    } catch { /* never fail the visitor */ }
  });

  app.get('/api/admin/analytics', async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
    let evs: Ev[]; try { evs = await readDays(days); } catch { return res.status(502).json({ error: 'db' }); }
    const pvs = evs.filter((e) => e.k === 'pv');
    const human = pvs.filter((e) => !e.bot);
    const humanIds = new Set(human.map((e) => e.id));
    const leaveMs = new Map(evs.filter((e) => e.k === 'leave' && humanIds.has(e.id)).map((e) => [e.id, e.ms ?? 0]));
    const tally = (xs: (string | undefined)[], n = 10) => { const m = new Map<string, number>(); xs.forEach((x) => { const k2 = x || '—'; m.set(k2, (m.get(k2) ?? 0) + 1); }); return [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value })); };
    const visitorsByDay = new Map<string, Set<string>>(); const pvByDay = new Map<string, number>(); const botByDay = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) { const k2 = day(new Date(Date.now() - i * 864e5)); visitorsByDay.set(k2, new Set()); pvByDay.set(k2, 0); botByDay.set(k2, 0); }
    for (const e of pvs) { const k2 = day(new Date(e.t)); if (!pvByDay.has(k2)) continue; if (e.bot) botByDay.set(k2, botByDay.get(k2)! + 1); else { pvByDay.set(k2, pvByDay.get(k2)! + 1); visitorsByDay.get(k2)!.add(e.v); } }
    const durs = [...leaveMs.values()].filter((x) => x > 0);
    const visitors = new Set(human.map((e) => `${day(new Date(e.t))}|${e.v}`)).size;   // daily-unique visitors summed over the range
    return res.json({
      days, pageviews: human.length, visitors, bots: pvs.length - human.length,
      avgSeconds: durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length / 1000) : 0,
      daily: [...pvByDay.keys()].map((k2) => ({ day: k2, pageviews: pvByDay.get(k2)!, visitors: visitorsByDay.get(k2)!.size, bots: botByDay.get(k2)! })),
      pages: tally(human.map((e) => e.path)), referrers: tally(human.map((e) => e.ref || '(doğrudan)')), countries: tally(human.map((e) => e.cc?.toUpperCase())),
      languages: tally(human.map((e) => e.lang)), devices: tally(human.map((e) => e.dev)), browsers: tally(human.map((e) => e.br)), systems: tally(human.map((e) => e.os)),
      clicks: tally(evs.filter((e) => e.k === 'click' && humanIds.has(e.id)).map((e) => e.label), 12),
      botReasons: tally(pvs.filter((e) => e.bot).map((e) => e.bot), 6),
    });
  });
}
