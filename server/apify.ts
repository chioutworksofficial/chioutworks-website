// Apify client + monthly budget guard. Owner-triggered only (no automatic runs). Security: context/GUVENLIK.md.
// Actor: apify/website-content-crawler. Endpoint (verified in the official API docs): POST /v2/acts/apify~website-content-crawler/run-sync-get-dataset-items
// (query: timeout [s], memory [MB], maxTotalChargeUsd; the sync endpoint answers 408 after 300 s). Auth by Bearer header, the token is never put in a URL or log.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbOn, kvGet, kvSet } from './db.js';
import { hostBad } from './voiceAgent.js';

const ACTOR = 'apify~website-content-crawler';
const API = 'https://api.apify.com';
/** Monthly budget set by the owner (USD). */
export const MONTHLY_BUDGET_USD = 1.5;
const LEDGER_KEY = 'apify.ledger';
const LEDGER_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/apify-ledger.json');

export type ApifyErrCode = 'no_token' | 'budget' | 'blocked_url' | 'http' | 'timeout' | 'empty';
export class ApifyError extends Error {
  constructor(public code: ApifyErrCode, public userMessage: string) { super(code); }
}
export const apifyToken = () => (process.env.APIFY_TOKEN ?? process.env.APIFY_API_TOKEN ?? '').trim();
export const apifyOn = () => apifyToken().length > 0;

// ── cost estimate (public list price: ~$0.25 per compute unit; README: ~$0.2 per 1000 pages raw HTTP, $0.5-5 per 1000 pages headless browser) ──
export type Crawler = 'cheerio' | 'playwright:firefox';
const START_USD = 0.012;                                    // start-up overhead of one run (small container boot)
const PER_PAGE: Record<Crawler, number> = { cheerio: 0.002, 'playwright:firefox': 0.006 };
/** Conservative estimate (rounded up). Shown to the owner before the run and used for the budget check. */
export const estimateUsd = (crawler: Crawler, pages: number) => Math.ceil((START_USD + PER_PAGE[crawler] * pages) * 1000) / 1000;

// ── ledger (kv `apify.ledger`, file fallback without database) ──
export interface LedgerRun { at: string; kind: string; crawler: Crawler; pages: number; estUsd: number }
export interface Ledger { month: string; runs: LedgerRun[] }
const monthOf = (d = new Date()) => d.toISOString().slice(0, 7);
async function ledgerLoad(): Promise<Ledger> {
  let l: Ledger | null = null;
  try { l = dbOn() ? await kvGet<Ledger>(LEDGER_KEY) : JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8')); } catch { l = null; }
  return l && l.month === monthOf() && Array.isArray(l.runs) ? l : { month: monthOf(), runs: [] };
}
async function ledgerSave(l: Ledger) {
  if (dbOn()) return kvSet(LEDGER_KEY, l);
  fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true }); fs.writeFileSync(LEDGER_FILE, JSON.stringify(l, null, 2));
}

export interface Budget { on: boolean; limit: number; spent: number; remaining: number; source: 'apify' | 'ledger'; ledgerSpent: number; monthlyCapUsd: number | null }
/** Real usage from GET /v2/users/me/limits when available (it also counts other uses of the account), else the local ledger (estimates). */
export async function budgetStatus(fetchImpl: typeof fetch = fetch): Promise<Budget> {
  const led = await ledgerLoad();
  const ledgerSpent = Math.round(led.runs.reduce((s, r) => s + r.estUsd, 0) * 1000) / 1000;
  let real: number | null = null; let cap: number | null = null;
  if (apifyOn()) {
    try {
      const r = await fetchImpl(`${API}/v2/users/me/limits`, { headers: { Authorization: `Bearer ${apifyToken()}` }, signal: AbortSignal.timeout(8000) });
      if (r.ok) { const d: any = (await r.json())?.data; const u = d?.current?.monthlyUsageUsd; if (typeof u === 'number' && Number.isFinite(u)) real = u; const c = d?.limits?.maxMonthlyUsageUsd; if (typeof c === 'number') cap = c; }
    } catch { /* ledger stays authoritative */ }
  }
  const spent = real ?? ledgerSpent;
  return { on: apifyOn(), limit: MONTHLY_BUDGET_USD, spent: Math.round(spent * 1000) / 1000, remaining: Math.max(0, Math.round((MONTHLY_BUDGET_USD - spent) * 1000) / 1000), source: real === null ? 'ledger' : 'apify', ledgerSpent, monthlyCapUsd: cap };
}

/** Throws ApifyError('no_token' | 'budget'). Returns the budget when the run may start. */
export async function assertCanRun(estUsd: number, fetchImpl: typeof fetch = fetch): Promise<Budget> {
  if (!apifyOn()) throw new ApifyError('no_token', 'Apify anahtarı yok.');
  const b = await budgetStatus(fetchImpl);
  if (estUsd > b.remaining) throw new ApifyError('budget', `Aylık Apify bütçesi yetmiyor: tahmini maliyet $${estUsd.toFixed(3)}, kalan $${b.remaining.toFixed(3)} (limit $${b.limit.toFixed(2)}).`);
  return b;
}

// ── actor run ──
export interface CrawlOpts { startUrl: string; crawler: Crawler; maxPages: number; maxDepth?: number; timeoutSecs?: number; kind: string }
export interface CrawlItem { url: string; loadedUrl: string; status: number; title: string; description: string; lang: string; text: string; markdown: string; html: string; headers: Record<string, string> }

/** Input verified against the actor's input schema (build `default`): crawlerType enum is cheerio | jsdom | playwright:adaptive | playwright:firefox | playwright:chrome. */
export function buildInput(o: CrawlOpts) {
  const u = new URL(o.startUrl); const host = u.hostname.replace(/^www\./, '');
  return {
    startUrls: [{ url: u.toString() }], crawlerType: o.crawler, maxCrawlPages: o.maxPages, maxCrawlDepth: o.maxDepth ?? 1, maxResults: o.maxPages,
    includeUrlGlobs: [{ glob: `http?(s)://${host}/**` }, { glob: `http?(s)://www.${host}/**` }],   // same domain only
    useSitemaps: false, respectRobotsTxtFile: true, saveMarkdown: true, saveHtml: true, htmlTransformer: 'none', removeElementsCssSelector: 'noscript',
    removeCookieWarnings: true, blockMedia: true, dynamicContentWaitSecs: 5, maxRequestRetries: 1, proxyConfiguration: { useApifyProxy: true },
  };
}

const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '');
export function parseItems(data: unknown): CrawlItem[] {
  if (!Array.isArray(data)) return [];
  return data.map((x: any): CrawlItem => ({
    url: str(x?.url, 600), loadedUrl: str(x?.crawl?.loadedUrl, 600) || str(x?.url, 600), status: Number(x?.crawl?.httpStatusCode) || 200,
    title: str(x?.metadata?.title, 300), description: str(x?.metadata?.description, 500), lang: str(x?.metadata?.languageCode, 12),
    text: str(x?.text, 60_000), markdown: str(x?.markdown, 60_000), html: str(x?.html, 1_500_000),
    headers: Object.fromEntries(Object.entries(x?.metadata?.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)])),
  })).filter((i) => /^https?:\/\//.test(i.loadedUrl));
}

/** Runs the crawler synchronously, charges the ledger, returns parsed items. Always capped with maxTotalChargeUsd. */
export async function runCrawler(o: CrawlOpts, fetchImpl: typeof fetch = fetch): Promise<{ items: CrawlItem[]; estUsd: number }> {
  let p: URL; try { p = new URL(o.startUrl); } catch { throw new ApifyError('blocked_url', 'Web adresi geçersiz.'); }
  if ((p.protocol !== 'https:' && p.protocol !== 'http:') || p.username || p.password || hostBad(p.hostname)) throw new ApifyError('blocked_url', 'Bu adres taranamaz (yerel veya özel ağ adresi).');
  const est = estimateUsd(o.crawler, o.maxPages);
  const b = await assertCanRun(est, fetchImpl);
  const cap = Math.min(b.remaining, Math.max(est * 2, 0.02));                 // hard server-side ceiling for this run
  const q = new URLSearchParams({ timeout: String(o.timeoutSecs ?? 50), memory: o.crawler === 'cheerio' ? '1024' : '2048', maxTotalChargeUsd: cap.toFixed(3) });
  const led = await ledgerLoad(); led.runs.push({ at: new Date().toISOString(), kind: o.kind, crawler: o.crawler, pages: o.maxPages, estUsd: est }); await ledgerSave(led);   // charged up front: a failed run still costs
  let r: Response;
  try {
    r = await fetchImpl(`${API}/v2/acts/${ACTOR}/run-sync-get-dataset-items?${q}`, { method: 'POST', headers: { Authorization: `Bearer ${apifyToken()}`, 'content-type': 'application/json' }, body: JSON.stringify(buildInput(o)), signal: AbortSignal.timeout(((o.timeoutSecs ?? 50) + 15) * 1000) });
  } catch { throw new ApifyError('timeout', 'Apify zaman aşımı veya erişim yok.'); }
  if (r.status === 408) throw new ApifyError('timeout', 'Apify çalışması zaman aşımına uğradı.');
  if (r.status === 401 || r.status === 403) throw new ApifyError('http', 'Apify anahtarı geçersiz veya yetkisiz.');
  if (!r.ok && r.status !== 201) throw new ApifyError('http', `Apify yanıtı ${r.status}.`);
  const items = parseItems(await r.json().catch(() => null));
  if (!items.length) throw new ApifyError('empty', 'Apify sayfa döndürmedi (site engellemiş olabilir).');
  return { items, estUsd: est };
}
