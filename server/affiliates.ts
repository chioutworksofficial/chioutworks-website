// Partner (affiliate) redirects: the referral links live ONLY here, never in the browser bundle or the page.
// The "Go to …" button on a tool page links to /api/go/<id>?l=<lang>&s=<where>; this counts the click and redirects.
// Counting is cookieless: no IP, no visitor id, nothing stored on the device. Stored per click: time, tool, page
// language, button position, country (from the hosting header, live only), device type and a bot flag.
// Storage: data/affiliate-clicks.jsonl (git-ignored). Admin: GET /api/admin/affiliates.
import { dbOn, dbInsert, dbSelect } from './db.js';
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BOT_UA } from './analytics';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../data/affiliate-clicks.jsonl');

type Lang = 'tr' | 'en' | 'de' | 'el';
const LANGS: Lang[] = ['tr', 'en', 'de', 'el'];

/** Referral link per tool, in the visitor's language where the partner supports it. */
const LINKS: Record<string, (l: Lang) => string> = {
  // Hostinger: German site for German, the international site otherwise (it picks a locale itself; /tr answered 403 in a test).
  hostinger: (l) => (l === 'de' ? 'https://www.hostinger.com/de?REFERRALCODE=V4RCHCG1' : 'https://www.hostinger.com/?REFERRALCODE=V4RCHCG1'),
  // N26: link from the owner; page language German for German visitors, English otherwise (no Turkish/Greek version).
  n26: (l) => `https://n26.com/r/chouseic7027?cid=76Y&lang=${l === 'de' ? 'de' : 'en'}`,
  // Wise: invite link from the owner (Wise shows the page in the visitor's browser language itself).
  wise: () => 'https://wise.com/invite/ilpc/chouseinc1',
};

const SOURCES = ['hero', 'final', 'card', 'ring'];
const device = (ua: string) => (/ipad|tablet/i.test(ua) ? 'tablet' : /mobi|iphone|android/i.test(ua) ? 'mobile' : 'desktop');
const day = (t: number) => new Date(t).toISOString().slice(0, 10);

interface Click { t: number; id: string; lang: Lang; src: string; cc: string; dev: string; bot: boolean }

async function readAll(since: number): Promise<Click[]> {
  if (dbOn()) {
    const rows = await dbSelect<{ data: Click }>('affiliate_clicks', `select=data&t=gte.${new Date(since).toISOString()}&order=t.asc`);
    return rows.map((r) => r.data);
  }
  return readFile().filter((c) => c.t >= since);
}
function readFile(): Click[] {
  let txt = ''; try { txt = fs.readFileSync(FILE, 'utf8'); } catch { return []; }
  const out: Click[] = [];
  for (const line of txt.split('\n')) { if (!line) continue; try { out.push(JSON.parse(line)); } catch { /* skip */ } }
  return out;
}

interface Deps { requireAdmin: (req: Request, res: Response) => boolean }

export function registerAffiliates(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });

  app.get('/api/go/:id', limiter, (req: Request, res: Response) => {
    const id = String(req.params.id ?? '').toLowerCase();
    const link = LINKS[id];
    const lang = (LANGS as string[]).includes(String(req.query.l)) ? (String(req.query.l) as Lang) : 'en';
    if (!link) return res.redirect(302, `/${lang}`);
    try {
      const ua = String(req.get('user-agent') ?? '');
      const hdr = String(req.get('x-vercel-ip-country') ?? req.get('cf-ipcountry') ?? '');
      const click: Click = {
        t: Date.now(), id, lang,
        src: SOURCES.includes(String(req.query.s)) ? String(req.query.s) : 'other',
        cc: /^[a-z]{2}$/i.test(hdr) ? hdr.toLowerCase() : '',
        dev: device(ua),
        bot: BOT_UA.test(ua) || !req.get('accept-language'),
      };
      if (dbOn()) void dbInsert('affiliate_clicks', { t: new Date(click.t).toISOString(), data: click }).catch((e) => console.warn(String(e)));
      else { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.appendFileSync(FILE, JSON.stringify(click) + '\n'); }
    } catch { /* never block the visitor */ }
    res.set('Cache-Control', 'no-store');
    res.set('X-Robots-Tag', 'noindex, nofollow');
    res.set('Referrer-Policy', 'origin');
    return res.redirect(302, link(lang));
  });

  app.get('/api/admin/affiliates', async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
    const since = Date.now() - days * 864e5;
    const all = await readAll(since).catch((e) => { console.warn(String(e)); return [] as Click[]; });
    const human = all.filter((c) => !c.bot);
    const tally = (xs: string[]) => { const m = new Map<string, number>(); xs.forEach((x) => m.set(x || '—', (m.get(x || '—') ?? 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })); };
    const daily: { day: string; value: number }[] = [];
    for (let i = days - 1; i >= 0; i--) { const k = day(Date.now() - i * 864e5); daily.push({ day: k, value: human.filter((c) => day(c.t) === k).length }); }
    return res.json({
      days, total: human.length, bots: all.length - human.length,
      tools: tally(human.map((c) => c.id)),
      sources: tally(human.map((c) => c.src)),
      languages: tally(human.map((c) => c.lang)),
      countries: tally(human.map((c) => c.cc.toUpperCase())),
      devices: tally(human.map((c) => c.dev)),
      daily,
    });
  });
}
