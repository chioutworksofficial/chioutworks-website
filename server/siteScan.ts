// Admin "Satış": deep site scan. Pluggable fetching layer (SiteFetcher) + deterministic checks + strict scoring + opportunity list.
// Security: context/GUVENLIK.md (SSRF): every request (and every redirect hop) is checked with hostBad, DNS result validated at connect time with privateIp.
// Only the public site is read; no page text, phone or e-mail is logged.
import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { privateIp, hostBad } from './voiceAgent.js';
import { runCrawler, type CrawlItem } from './apify.js';

// ── fetching layer ──
export interface FetchedDoc { url: string; finalUrl: string; status: number; headers: Record<string, string>; body: string; bytes: number; ms: number; redirects: number }
export interface GetOpts { maxBytes: number; timeoutMs: number; html: boolean }
/** Fetching is replaceable per run (DefaultFetcher, ApifyFetcher: same interface). Implementations must keep the SSRF rules. */
export interface SiteFetcher { name: string; get(url: string, o: GetOpts): Promise<FetchedDoc> }

const guardedLookup = ((host: string, opts: any, cb: any) => {
  dns.lookup(host, { all: true }, (err, addrs) => {
    if (err) return cb(err);
    if (!addrs.length || addrs.some((a) => privateIp(a.address))) return cb(new Error('blocked_address'));
    const a = addrs[0]; return opts?.all ? cb(null, [a]) : cb(null, a.address, a.family);
  });
}) as any;

export const scanUrlProblem = (u: string): string | null => {
  let p: URL; try { p = new URL(u); } catch { return 'Web adresi geçersiz.'; }
  if (p.protocol !== 'https:' && p.protocol !== 'http:') return 'Yalnızca http veya https adresi olabilir.';
  if (p.username || p.password) return 'Adreste kullanıcı bilgisi olamaz.';
  if (p.port && !['80', '443'].includes(p.port)) return 'Yalnızca standart portlar okunur.';
  if (hostBad(p.hostname)) return 'Yerel veya özel ağ adreslerine izin verilmez.';
  return null;
};

const UA = 'Mozilla/5.0 (compatible; ChioutworksSiteCheck/2.0; +https://chioutworks.com)';
function once(u: URL, o: GetOpts): Promise<{ status: number; headers: http.IncomingHttpHeaders; location?: string; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request(u, { method: 'GET', lookup: guardedLookup, timeout: o.timeoutMs, headers: { 'user-agent': UA, accept: o.html ? 'text/html,application/xhtml+xml,*/*;q=0.5' : 'text/plain,text/xml,application/xml,*/*;q=0.5', 'accept-encoding': 'gzip, deflate, br' } }, (res) => {
      const st = res.statusCode ?? 0;
      if (st >= 300 && st < 400) { res.resume(); return resolve({ status: st, headers: res.headers, location: res.headers.location, body: Buffer.alloc(0) }); }
      const ct = String(res.headers['content-type'] ?? '');
      if (st < 400 && ct && !(o.html ? /text\/html|xhtml|text\/plain/i : /text\/|xml|json/i).test(ct)) { res.destroy(); return reject(new Error('not_html')); }
      const chunks: Buffer[] = []; let n = 0;
      res.on('data', (c: Buffer) => { n += c.length; if (n > o.maxBytes) { res.destroy(); return reject(new Error('too_big')); } chunks.push(c); });
      res.on('end', () => resolve({ status: st, headers: res.headers, body: Buffer.concat(chunks) }));
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    const kill = setTimeout(() => req.destroy(new Error('timeout')), o.timeoutMs); req.on('close', () => clearTimeout(kill));
    req.end();
  });
}
function decode(b: Buffer, enc: string, max: number): string {
  const e = enc.toLowerCase();
  try {
    if (e.includes('br')) b = zlib.brotliDecompressSync(b, { maxOutputLength: max });
    else if (e.includes('gzip')) b = zlib.gunzipSync(b, { maxOutputLength: max });
    else if (e.includes('deflate')) b = zlib.inflateSync(b, { maxOutputLength: max });
  } catch { throw new Error('too_big'); }
  return b.toString('utf8');
}

class DefaultFetcher implements SiteFetcher {
  name = 'default';
  async get(url: string, o: GetOpts): Promise<FetchedDoc> {
    const t0 = Date.now(); let cur = url;
    for (let i = 0; i <= 3; i++) {
      if (scanUrlProblem(cur)) throw new Error('blocked_url');
      const r = await once(new URL(cur), o);
      if (r.status >= 300 && r.status < 400) { if (!r.location) throw new Error('bad_redirect'); cur = new URL(r.location, cur).toString(); continue; }
      const headers: Record<string, string> = {}; for (const [k, v] of Object.entries(r.headers)) headers[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v ?? '');
      return { url, finalUrl: cur, status: r.status, headers, body: decode(r.body, headers['content-encoding'] ?? '', o.maxBytes * 4), bytes: r.body.length, ms: Date.now() - t0, redirects: i };
    }
    throw new Error('too_many_redirects');
  }
}
/** Static, SSRF-safe fetcher (default). The browser-rendered Apify fetcher is chosen per run (owner-triggered), see createApifyFetcher. */
export function pickFetcher(): SiteFetcher { return new DefaultFetcher(); }

const pageKey = (u: string) => { try { const x = new URL(u); x.hash = ''; return `${x.protocol}//${x.hostname.replace(/^www\./, '').toLowerCase()}${x.pathname.replace(/\/+$/, '')}${x.search}`; } catch { return u; } };
const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Serves pages from one Apify crawl (browser-rendered HTML). Everything it does not hold (robots.txt, sitemap, uncrawled pages) falls back to the default fetcher, which keeps the SSRF rules. */
export class ApifyFetcher implements SiteFetcher {
  name = 'apify';
  private docs = new Map<string, FetchedDoc>();
  private fallback = new DefaultFetcher();
  constructor(items: CrawlItem[]) {
    for (const it of items) {
      const body = it.html || `<html><head><title>${escHtml(it.title)}</title></head><body>${it.text.split(/\n+/).map((l) => `<p>${escHtml(l)}</p>`).join('')}</body></html>`;
      const doc: FetchedDoc = { url: it.url, finalUrl: it.loadedUrl, status: it.status, headers: it.headers, body, bytes: Buffer.byteLength(body), ms: 0, redirects: 0 };
      this.docs.set(pageKey(it.loadedUrl), doc); this.docs.set(pageKey(it.url), doc);
    }
  }
  get pageCount() { return new Set(this.docs.values()).size; }
  async get(url: string, o: GetOpts): Promise<FetchedDoc> {
    if (scanUrlProblem(url)) throw new Error('blocked_url');
    const d = o.html ? this.docs.get(pageKey(url)) : undefined;
    return d ? { ...d, url } : this.fallback.get(url, o);
  }
}
/** One Apify run (playwright, 3 pages, same domain), then a SiteFetcher over its results. `run` is injectable for tests. Budget is checked inside runCrawler. */
export async function createApifyFetcher(url: string, run: typeof runCrawler = runCrawler): Promise<ApifyFetcher> {
  const { items } = await run({ startUrl: url, crawler: 'playwright:firefox', maxPages: 3, maxDepth: 1, timeoutSecs: 55, kind: 'render-scan' });
  return new ApifyFetcher(items);
}

/** For local REA browser capture by the owner's assistant: renders a page in a real local browser. NOT wired to anything (REA is a local tool, not available on the server). */
export async function renderedProbe(_url: string): Promise<FetchedDoc> { throw new Error('not_wired: local REA capture only'); }

// ── model ──
export type Status = 'pass' | 'partial' | 'fail' | 'na' | 'unknown';
export type CatKey = 'tech' | 'seo' | 'conv' | 'trust' | 'auto' | 'content';
export interface Check { id: string; cat: CatKey; label: string; status: Status; evidence: string; weight: number; critical?: boolean }
export const CATS: { key: CatKey; label: string; weight: number }[] = [
  { key: 'tech', label: 'Teknik ve hız', weight: 20 }, { key: 'seo', label: 'SEO', weight: 20 }, { key: 'conv', label: 'Dönüşüm ve iletişim', weight: 20 },
  { key: 'trust', label: 'Güven ve yasal', weight: 15 }, { key: 'auto', label: 'Otomasyon (yüksek = hazır)', weight: 10 }, { key: 'content', label: 'İçerik ve netlik', weight: 15 },
];
export interface Profile { company: string; city: string; country: string; sector: string; summary: string; needsBooking: boolean | null; lang: string; clarity: number | null; offer: number | null; positioning: number | null; contentNote: string; reasonableCause: string; opener: string }
export interface Opp { id: string; title: string; what: string; why: string; impact: 'yüksek' | 'orta' | 'düşük'; effort: 'düşük' | 'orta' | 'yüksek'; service: string; reason: string }
export interface Scan {
  version: 2; fetcher: string; at: string; pages: { url: string; status: number; bytes: number; ms: number }[]; psi: { score: number | null; lcp?: string; note?: string };
  facts: { cms: string; lang: string; country: string; booking: string[]; chat: string[]; whatsapp: boolean; hreflang: string[]; socials: string[]; forms: number; htmlBytes: number; scripts: number; thirdParty: number; title: string; description: string; de: boolean; jsShell: boolean; spa: boolean };
  score: number; rawScore: number; grade: 'A' | 'B' | 'C' | 'D' | 'E'; capped: string[]; categories: { key: CatKey; label: string; weight: number; score: number | null; n: number }[];
  checks: Check[]; opportunities: Opp[]; noNeed: { label: string; reason: string }[]; unmeasured: { label: string; reason: string }[]; priority: 'İletişime değer' | 'Belki' | 'Gerek yok'; summary: string;
  contact: { phone?: string; email?: string };
}

// ── helpers ──
const decodeEnt = (s: string) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&copy;/g, '©');
export const pageText = (html: string) => decodeEnt(html.replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const attr = (tag: string, n: string) => new RegExp(`\\b${n}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag)?.slice(1).find((x) => x !== undefined);
const metaOf = (html: string, n: string) => { for (const m of html.matchAll(/<meta\b[^>]*>/gi)) { const k = attr(m[0], 'name') ?? attr(m[0], 'property'); if (k?.toLowerCase() === n) return decodeEnt(attr(m[0], 'content') ?? '').trim(); } return ''; };
const baseHost = (h: string) => h.replace(/^www\./, '').toLowerCase();
const sameSite = (h: string, site: string) => { const a = baseHost(h); return a === site || a.endsWith(`.${site}`); };
const clamp = (n: number) => Math.max(0, Math.min(100, n));

interface Link { href: string; text: string; internal: boolean }
function linksOf(html: string, base: string, site: string): Link[] {
  const out: Link[] = [];
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const h = attr(m[1], 'href'); if (!h || /^(javascript|mailto|tel|#)/i.test(h.trim())) continue;
    try {
      const u = new URL(h, base); if (u.protocol !== 'http:' && u.protocol !== 'https:') continue; u.hash = '';
      out.push({ href: u.toString(), text: (pageText(m[2]) || attr(m[1], 'aria-label') || attr(m[1], 'title') || '').slice(0, 60), internal: sameSite(u.hostname, site) });
    } catch { /* skip */ }
  }
  return out;
}

const KINDS: { k: string; re: RegExp }[] = [
  { k: 'contact', re: /contact|kontakt|ileti[sş]im|επικοινων|anfahrt/i }, { k: 'services', re: /services?|leistungen|hizmet|angebot|l[öo]sungen|solutions|produkte|products|behandlung|speisekarte|menu/i },
  { k: 'about', re: /about|[üu]ber-?uns|ueber-?uns|hakk[ıi]m[ıi]zda|kurumsal|team|wer-wir/i }, { k: 'booking', re: /termin|booking|reserv|randevu|appointment|buchen|book-/i },
  { k: 'prices', re: /preise|prices?|pricing|fiyat|tarif|kosten/i }, { k: 'privacy', re: /datenschutz|privacy|data-protection|gizlilik|kvkk|privatsph/i }, { k: 'impressum', re: /impressum|imprint|legal[-\s]?(notice|info)|yasal[-\s]?bilgi|anbieterkennzeichnung|rechtliche[-\s]?hinweise|corporate[-\s]?information/i },
];
const BOOKING = ['calendly.com', 'treatwell', 'doctolib', 'shore.com', 'jameda', 'timify', 'setmore', 'simplybook', 'opentable', 'resmio', 'planity', 'booksy', 'fresha', 'acuityscheduling', 'cal.com', 'termin-online', 'onlinetermin', 'etermin', 'terminland', 'quandoo', 'thefork', 'bookingkit', 'amelia', 'bookly', 'eversports', 'zenchef', 'tilla', 'appointlet', 'youcanbook', 'reservio', 'smoobu', 'beds24', 'booking.com', 'tebi.co', 'dienstleistungen-online', 'termin.io'];
const CHAT = ['tidio', 'intercom', 'crisp.chat', 'tawk.to', 'drift.com', 'livechat', 'zendesk', 'hubspot', 'userlike', 'smartsupp', 'freshchat', 'jivosite', 'chatbot', 'botpress', 'landbot', 'manychat', 'olark', 'zopim', 'whatsapp-chat', 'chaport', 'brevo.com/conversations'];
const CMP = ['cookiebot', 'usercentrics', 'onetrust', 'borlabs', 'complianz', 'cookieyes', 'iubenda', 'consentmanager', 'cookie-notice', 'cmplz', 'cookiefirst', 'termly', 'osano', 'cookieconsent', 'klaro', 'axeptio', 'didomi', 'trustarc', 'real-cookie-banner', 'cookie-law-info', 'moove_gdpr', 'gdpr-cookie'];
const TRACK = ['googletagmanager', 'google-analytics', 'gtag(', 'connect.facebook.net', 'fbq(', 'matomo', 'piwik', 'hotjar', 'clarity.ms', 'linkedin.com/px', 'analytics.tiktok', 'plausible.io', 'fathom'];
const REVIEW = ['trustpilot', 'provenexpert', 'ekomi', 'trustindex', 'elfsight', 'google.com/maps/place', 'reviews.io', 'jameda', 'trusted-shops', 'trustedshops', 'tripadvisor', 'yelp.', 'proven.expert', 'sociablekit', 'reviewbuddy', 'wp-review', 'g.page', 'search.google.com/local/reviews'];
const NEWS = ['mailchimp', 'newsletter', 'brevo', 'sendinblue', 'klaviyo', 'mailerlite', 'cleverreach', 'rapidmail', 'convertkit', 'activecampaign', 'abonnieren', 'e-bülten', 'ebulten', 'subscribe', 'inxmail', 'getresponse', 'optin'];
const SOCIAL = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 'tiktok.com', 'youtube.com', 'pinterest.', 'xing.com'];
const CTA = /termin|angebot|anfrage|anfragen|jetzt|buchen|reservier|kontakt aufnehmen|beratung|kostenlos|unverbindlich|randevu|teklif|ara[yı]n|hemen|[üu]cretsiz|ileti[sş]ime|bize ula|book|get a quote|get started|contact us|call us|request|free|schedule|demo|sign up|επικοινων|ραντεβού|προσφορά/i;
const CMSS: [string, RegExp][] = [['WordPress', /wp-content|wp-includes|name=["']generator["'][^>]*wordpress/i], ['Wix', /wixstatic\.com|wix\.com|x-wix/i], ['Jimdo', /jimdo/i], ['Squarespace', /squarespace/i], ['Shopify', /cdn\.shopify|myshopify|shopify\.theme/i], ['Webflow', /webflow/i], ['Weebly', /weebly/i], ['TYPO3', /typo3/i], ['Joomla', /name=["']generator["'][^>]*joomla|\/media\/jui\//i], ['Drupal', /drupal/i], ['Framer', /framer\.(com|website)|framerusercontent/i], ['IONOS MyWebsite', /ionos|1und1|website-start\.de/i], ['Next.js', /\/_next\//i], ['Nuxt', /\/_nuxt\//i], ['Gatsby', /gatsby/i]];
const hit = (hay: string, list: string[]) => list.filter((k) => hay.includes(k));

interface PageInfo { url: string; html: string; text: string; status: number; kind?: string }
function isGerman(url: string, html: string, text: string) {
  const host = new URL(url).hostname; const lang = /<html[^>]*\blang=["']?([a-z]{2})/i.exec(html)?.[1]?.toLowerCase();
  return /\.(de|at)$/.test(host) || lang === 'de' || /\b(impressum|datenschutz|über uns|leistungen|kontakt)\b/i.test(text.slice(0, 6000));
}
const countryOf = (host: string, lang: string) => (/\.de$/.test(host) ? 'Almanya' : /\.at$/.test(host) ? 'Avusturya' : /\.ch$/.test(host) ? 'İsviçre' : /\.tr$/.test(host) ? 'Türkiye' : /\.gr$/.test(host) ? 'Yunanistan' : lang === 'de' ? 'Almanya (tahmini)' : lang === 'tr' ? 'Türkiye (tahmini)' : lang === 'el' ? 'Yunanistan (tahmini)' : '');

export interface RawScan { fetcher: string; pages: Scan['pages']; infos: PageInfo[]; home: FetchedDoc; checks: Check[]; facts: Scan['facts']; contact: Scan['contact']; text: string; psi: Scan['psi']; robots: boolean; sitemap: boolean; httpsFailed: boolean }

async function psiRun(url: string): Promise<Scan['psi']> {
  try {
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(20_000) });
    if (!r.ok) return { score: null, note: r.status === 429 ? 'PageSpeed kotası dolu' : `PageSpeed yanıtı ${r.status}` };
    const j: any = await r.json(); const s = j?.lighthouseResult?.categories?.performance?.score;
    if (typeof s !== 'number') return { score: null, note: 'PageSpeed sonuç vermedi' };
    return { score: Math.round(s * 100), lcp: j.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue };
  } catch { return { score: null, note: 'PageSpeed zaman aşımı veya erişim yok' }; }
}

/** Fetch homepage + up to 6 internal pages + robots/sitemap, run deterministic checks. Throws fetch error codes when the homepage cannot be read. */
export async function scanSite(inputUrl: string, fetcher: SiteFetcher = pickFetcher()): Promise<RawScan> {
  const deadline = Date.now() + 25_000;
  const left = () => deadline - Date.now();
  const get = (u: string, html: boolean, maxBytes: number) => { if (left() < 800) return Promise.reject(new Error('deadline')); return fetcher.get(u, { html, maxBytes, timeoutMs: Math.min(8000, left()) }); };

  let httpsFailed = false; let home: FetchedDoc;
  try { home = await get(inputUrl, true, 1.5 * 1024 * 1024); }
  catch (e) {
    const m = (e as Error).message;
    if (inputUrl.startsWith('https:') && !['blocked_url', 'blocked_address', 'not_html', 'too_big'].includes(m)) { httpsFailed = true; home = await get(inputUrl.replace(/^https:/, 'http:'), true, 1.5 * 1024 * 1024); } else throw e;
  }
  if (home.status >= 400) throw new Error(`status_${home.status}`);
  const finalUrl = home.finalUrl; const host = new URL(finalUrl).hostname; const site = baseHost(host); const origin = new URL(finalUrl).origin;
  const psiP = psiRun(finalUrl);
  const html = home.body; const lower = html.toLowerCase();
  const homeLinks = linksOf(html, finalUrl, site);

  // aux files (parallel) and sitemap URL candidates
  const [robotsR, sitemapR] = await Promise.allSettled([get(`${origin}/robots.txt`, false, 100_000), get(`${origin}/sitemap.xml`, false, 600_000)]);
  const robots = robotsR.status === 'fulfilled' && robotsR.value.status === 200 && /user-agent|sitemap|disallow/i.test(robotsR.value.body);
  let sitemapBody = sitemapR.status === 'fulfilled' && sitemapR.value.status === 200 && /<(urlset|sitemapindex)/i.test(sitemapR.value.body) ? sitemapR.value.body : '';
  if (!sitemapBody && robots) {
    const sm = /^sitemap:\s*(\S+)/im.exec((robotsR as PromiseFulfilledResult<FetchedDoc>).value.body)?.[1];
    if (sm) { try { const d = await get(sm, false, 600_000); if (d.status === 200 && /<(urlset|sitemapindex)/i.test(d.body)) sitemapBody = d.body; } catch { /* optional */ } }
  }
  const sitemap = !!sitemapBody;
  const smUrls = [...sitemapBody.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]).filter((u) => { try { return sameSite(new URL(u).hostname, site) && !/sitemap.*\.xml$/i.test(u); } catch { return false; } }).slice(0, 400);

  // choose internal pages (priority order, one per kind, then fill) – max 6
  const order = ['contact', 'services', 'about', 'booking', 'prices', 'privacy', 'impressum'];
  const cand = (k: string) => { const re = KINDS.find((x) => x.k === k)!.re; const hay = (l: Link) => `${new URL(l.href).pathname} ${l.text}`; return homeLinks.find((l) => l.internal && re.test(hay(l)) && l.href !== finalUrl) ?? smUrls.map((u) => ({ href: u, text: '', internal: true })).find((l) => re.test(new URL(l.href).pathname)); };
  const picks: { url: string; kind: string }[] = [];
  for (const k of order) { const c = cand(k); if (c && !picks.some((p) => p.url === c.href) && picks.length < 6) picks.push({ url: c.href, kind: k }); }
  const infos: PageInfo[] = [{ url: finalUrl, html, text: pageText(html), status: home.status, kind: 'home' }];
  const pages: Scan['pages'] = [{ url: finalUrl, status: home.status, bytes: home.bytes, ms: home.ms }];
  const broken: string[] = [];
  let idx = 0;
  await Promise.all([0, 1, 2].map(async () => {
    while (idx < picks.length) {
      const p = picks[idx++];
      try { const d = await get(p.url, true, 1_000_000); pages.push({ url: d.finalUrl, status: d.status, bytes: d.bytes, ms: d.ms }); if (d.status >= 400) { if (d.status === 404 || d.status === 410 || d.status >= 500) broken.push(`${new URL(p.url).pathname} (${d.status})`); } else infos.push({ url: d.finalUrl, html: d.body, text: pageText(d.body), status: d.status, kind: p.kind }); }
      catch { /* timeout / not html: not counted as broken */ }
    }
  }));

  const allHtml = infos.map((i) => i.html).join('\n'); const allLower = allHtml.toLowerCase();
  const allText = infos.map((i) => i.text).join(' ');
  const urlsOf = (h: string) => [...h.matchAll(/\b(?:src|href|action|data-src|data-url)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1].toLowerCase()).join(' ');
  const hay = `${urlsOf(allHtml)} ${[...allHtml.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].slice(0, 4000)).join(' ').toLowerCase()}`;
  const text = infos[0].text; const words = text ? text.split(/\s+/).length : 0;
  const jsShell = words < 40 && /<div[^>]+id=["'](root|app|__next|__nuxt)["']/i.test(html);
  const de = isGerman(finalUrl, html, allText);
  const langAttr = /<html[^>]*\blang=["']?([A-Za-z-]{2,8})/i.exec(html)?.[1]?.toLowerCase().slice(0, 2) ?? '';
  const lang = langAttr || (de ? 'de' : '');
  const cms = CMSS.find(([, re]) => re.test(html))?.[0] ?? (metaOf(html, 'generator') || 'Özel / bilinmiyor');

  const C: Check[] = []; const add = (id: string, cat: CatKey, label: string, status: Status, evidence: string, weight: number, critical = false) => C.push({ id, cat, label, status, evidence, weight, critical });
  const H = home.headers;

  // TECH
  const isHttps = finalUrl.startsWith('https:');
  add('https', 'tech', 'HTTPS', isHttps ? 'pass' : 'fail', isHttps ? 'Site https ile açılıyor.' : httpsFailed ? 'https bağlantısı kurulamadı; yalnızca http çalışıyor.' : 'Site http ile açılıyor, https yok.', 5, true);
  add('hsts', 'tech', 'HSTS başlığı', !isHttps ? 'fail' : H['strict-transport-security'] ? 'pass' : 'fail', H['strict-transport-security'] ? 'Strict-Transport-Security var.' : 'Strict-Transport-Security başlığı yok.', 1);
  const csp = !!H['content-security-policy']; const xfo = !!H['x-frame-options'] || /frame-ancestors/i.test(H['content-security-policy'] ?? ''); const refp = !!H['referrer-policy']; const sec = [csp, xfo, refp].filter(Boolean).length;
  add('sec_headers', 'tech', 'Güvenlik başlıkları', sec === 3 ? 'pass' : sec ? 'partial' : 'fail', `CSP: ${csp ? 'var' : 'yok'}, X-Frame-Options/frame-ancestors: ${xfo ? 'var' : 'yok'}, Referrer-Policy: ${refp ? 'var' : 'yok'}.`, 1.5);
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html); const vp = metaOf(html, 'viewport');
  add('viewport', 'tech', 'Mobil görünüm (viewport)', hasViewport && /device-width/i.test(vp) ? 'pass' : hasViewport ? 'partial' : 'fail', hasViewport ? `viewport: ${vp.slice(0, 80) || 'boş'}` : 'viewport meta etiketi yok; mobilde küçülmüş masaüstü sayfası görünür.', 3);
  const noZoom = /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(vp); const tiny = (allHtml.match(/font-size:\s*(?:[0-9]|1[01])px/gi) ?? []).length;
  add('tap', 'tech', 'Dokunma hedefleri (tahmini)', !hasViewport || jsShell ? 'unknown' : noZoom || tiny > 6 ? 'partial' : 'pass', jsShell ? 'Sayfa JavaScript ile yükleniyor; kod tabanlı tahmin yapılamadı.' : !hasViewport ? 'viewport yok; tahmin yapılamadı.' : `Kod tabanlı tahmin: ${noZoom ? 'yakınlaştırma kapalı; ' : ''}${tiny} küçük (≤11px) satır içi yazı.`, 0.5);
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => m[1]); const ext = new Set<string>();
  for (const m of html.matchAll(/<(?:script|iframe|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)) { try { const u = new URL(m[1], finalUrl); if (/^https?:$/.test(u.protocol) && !sameSite(u.hostname, site)) ext.add(baseHost(u.hostname)); } catch { /* skip */ } }
  const kb = Math.round(home.bytes / 1024); const kbRaw = Math.round(html.length / 1024);
  add('weight', 'tech', 'Sayfa ağırlığı', kbRaw <= 250 && scripts.length <= 20 && ext.size <= 8 ? 'pass' : kbRaw <= 600 && scripts.length <= 40 && ext.size <= 15 ? 'partial' : 'fail', `Ana sayfa HTML ${kbRaw} KB (aktarılan ${kb} KB), ${scripts.length} betik, ${ext.size} üçüncü taraf alan adı.`, 2);
  const head = /<head[\s\S]*?<\/head>/i.exec(html)?.[0] ?? '';
  const blockJs = [...head.matchAll(/<script\b[^>]*\bsrc=[^>]*>/gi)].filter((m) => !/\b(async|defer)\b|type=["']module["']/i.test(m[0])).length; const css = (head.match(/<link\b[^>]*rel=["']stylesheet["']/gi) ?? []).length;
  add('render_block', 'tech', 'Render engelleyici kaynaklar', blockJs <= 1 && css <= 5 ? 'pass' : blockJs <= 4 && css <= 10 ? 'partial' : 'fail', `<head> içinde ${blockJs} async/defer olmayan betik, ${css} stil dosyası.`, 1);
  add('favicon', 'tech', 'Favicon', /<link[^>]+rel=["'][^"']*icon/i.test(html) ? 'pass' : 'partial', /<link[^>]+rel=["'][^"']*icon/i.test(html) ? 'Favicon tanımlı.' : 'Sayfada favicon bağlantısı yok.', 0.5);
  add('broken', 'tech', 'Kırık iç bağlantılar', broken.length ? 'fail' : 'pass', broken.length ? `Okunan sayfalar arasında kırık: ${broken.slice(0, 3).join(', ')}.` : `Okunan ${pages.length} sayfada kırık iç bağlantı yok.`, 1.5);
  const psi = await psiP;
  add('psi', 'tech', 'Mobil hız (PageSpeed)', psi.score === null ? 'unknown' : psi.score >= 90 ? 'pass' : psi.score >= 50 ? 'partial' : 'fail', psi.score === null ? (psi.note ?? 'ölçülemedi') : `Mobil performans puanı ${psi.score}/100${psi.lcp ? `, LCP ${psi.lcp}` : ''}.`, 4);

  // SEO
  const title = decodeEnt(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').replace(/\s+/g, ' ').trim(); const desc = metaOf(html, 'description');
  add('title', 'seo', 'Sayfa başlığı (title)', !title ? 'fail' : title.length >= 25 && title.length <= 65 ? 'pass' : 'partial', title ? `${title.length} karakter: "${title.slice(0, 70)}"` : 'title etiketi yok veya boş.', 2);
  add('desc', 'seo', 'Meta açıklama', !desc ? 'fail' : desc.length >= 70 && desc.length <= 165 ? 'pass' : 'partial', desc ? `${desc.length} karakter (ideal 70-160).` : 'meta description yok.', 2);
  const hs = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ l: +m[1], t: pageText(m[2]) })); const h1s = hs.filter((h) => h.l === 1 && h.t);
  add('h1', 'seo', 'Tek H1 başlığı', jsShell ? 'unknown' : h1s.length === 1 ? 'pass' : h1s.length === 0 ? 'fail' : 'partial', jsShell ? 'Sayfa JavaScript ile yükleniyor.' : h1s.length === 1 ? `H1: "${h1s[0].t.slice(0, 60)}"` : h1s.length === 0 ? 'Ana sayfada H1 yok.' : `${h1s.length} adet H1 var (tek olmalı).`, 2);
  let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i].l > hs[i - 1].l + 1) skips++;
  add('heading_order', 'seo', 'Başlık sırası', hs.length < 2 ? 'unknown' : skips === 0 ? 'pass' : skips <= 2 ? 'partial' : 'fail', hs.length < 2 ? 'Yeterli başlık yok; değerlendirilemedi.' : skips ? `${skips} yerde başlık seviyesi atlanıyor.` : 'Başlık seviyeleri sırayla.', 1);
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]).filter((t) => !/\bdata-src-ignore\b/.test(t)); const withAlt = imgs.filter((t) => (attr(t, 'alt') ?? '').trim().length > 0).length; const cov = imgs.length ? Math.round((withAlt / imgs.length) * 100) : 100;
  add('alt', 'seo', 'Görsel alt metni', !imgs.length ? 'na' : cov >= 90 ? 'pass' : cov >= 50 ? 'partial' : 'fail', imgs.length ? `${imgs.length} görselin %${cov}'inde alt metni var.` : 'Ana sayfada <img> yok.', 1.5);
  const og = ['og:title', 'og:description', 'og:image'].filter((k) => metaOf(html, k)).length; const tw = !!metaOf(html, 'twitter:card');
  add('og', 'seo', 'Open Graph / Twitter etiketleri', og === 3 ? 'pass' : og || tw ? 'partial' : 'fail', `Open Graph ${og}/3, twitter:card ${tw ? 'var' : 'yok'}. Paylaşım önizlemesi bunlara bağlı.`, 1);
  const ld = [...allHtml.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]); const ldTypes = [...new Set(ld.join(' ').match(/"@type"\s*:\s*"([A-Za-z]+)"/g)?.map((x) => x.replace(/.*:\s*"/, '').replace('"', '')) ?? [])];
  const biz = ldTypes.some((t) => /LocalBusiness|Organization|Restaurant|Store|Dentist|Physician|MedicalBusiness|ProfessionalService|HealthAndBeautyBusiness|AutoRepair|LegalService|Hotel|Corporation|WebSite/i.test(t));
  add('schema', 'seo', 'Yapılandırılmış veri (schema.org)', biz ? 'pass' : ldTypes.length ? 'partial' : 'fail', ldTypes.length ? `JSON-LD türleri: ${ldTypes.slice(0, 5).join(', ')}.` : 'schema.org (JSON-LD) işaretlemesi yok.', 2);
  add('lang', 'seo', 'Sayfa dili (lang)', langAttr ? 'pass' : 'fail', langAttr ? `<html lang="${langAttr}">` : '<html> üzerinde lang özniteliği yok.', 1);
  const hl = [...new Set([...html.matchAll(/hreflang=["']([A-Za-z-]{2,10})["']/gi)].map((m) => m[1].toLowerCase()))].slice(0, 12);
  const langLinks = homeLinks.filter((l) => l.internal && /\/(en|de|tr|el|fr|es|it|nl)(\/|$)/i.test(new URL(l.href).pathname)).length;
  const multi = hl.length > 1 || langLinks >= 2;
  add('hreflang', 'seo', 'Çok dillilik / hreflang', multi ? (hl.length > 1 ? 'pass' : 'partial') : 'na', multi ? (hl.length > 1 ? `hreflang: ${hl.join(', ')}` : 'Dil bağlantıları var ama hreflang etiketi yok.') : 'Tek dilli site; hreflang gerekmiyor.', 1);
  const canon = /<link[^>]+rel=["']canonical["']/i.test(html);
  add('canonical', 'seo', 'Canonical bağlantı', canon ? 'pass' : 'fail', canon ? 'canonical tanımlı.' : 'canonical etiketi yok.', 1);
  add('robots_sitemap', 'seo', 'robots.txt ve sitemap.xml', robots && sitemap ? 'pass' : robots || sitemap ? 'partial' : 'fail', `robots.txt: ${robots ? 'var' : 'yok'}, sitemap: ${sitemap ? 'var' : 'yok'}.`, 1.5);

  // CONVERSION
  const tel = /href=["']tel:/i.test(allHtml); const mail = /href=["']mailto:/i.test(allHtml); const wa = /wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(allHtml);
  const forms = [...allHtml.matchAll(/<form\b[\s\S]*?<\/form>/gi)].map((m) => m[0]).filter((f) => !/type=["']search["']|role=["']search["']|name=["']s["']|login|passwort|password/i.test(f) || /<textarea/i.test(f));
  const fields = forms.map((f) => [...f.matchAll(/<(input|textarea|select)\b[^>]*>/gi)].filter((m) => !/type=["'](hidden|submit|button|checkbox|image)["']/i.test(m[0])).length);
  const fw = /__NEXT_DATA__|astro-island|data-astro|_app\/immutable|data-svelte-h|q:container|data-hk=|data-reactroot|ng-version|__NUXT__|id=["']__next["']|id=["']__nuxt["']|data-n-head|ember-application|data-server-rendered/i.test(html);
  const legalStatic = KINDS.filter((k) => ['impressum', 'privacy', 'contact'].includes(k.k)).some((k) => homeLinks.some((l) => k.re.test(`${new URL(l.href).pathname} ${l.text}`)));
  const noFooter = !/<footer\b|id=["'][^"']*footer|class=["'][^"']*footer/i.test(html);
  const spa = jsShell || homeLinks.length < 6 || (fw && (words < 150 || !legalStatic)) || (scripts.length >= 15 && noFooter && !legalStatic && cms === 'Özel / bilinmiyor');
  if (spa) {
    // common URL probes (same SSRF guard): a found page counts as present
    const probes: [string, string][] = [['/impressum', 'impressum'], ['/imprint', 'impressum'], ['/kontakt', 'contact'], ['/contact', 'contact'], ['/datenschutz', 'privacy'], ['/privacy', 'privacy']];
    await Promise.all(probes.map(async ([path, kind]) => { try { const d = await get(origin + path, true, 300_000); if (d.status === 200 && new URL(d.finalUrl).pathname.length > 1 && !infos.some((x) => x.kind === kind)) infos.push({ url: d.finalUrl, html: d.body, text: pageText(d.body), status: 200, kind }); } catch { /* not found */ } }));
  }
  const thin = spa; const thinMsg = 'Ölçülemedi: site JavaScript ile oluşturuluyor; sabit HTML\'de ve yaygın adreslerde bulunamadı.';
  const contactPage = infos.some((i) => i.kind === 'contact') || homeLinks.some((l) => l.internal && KINDS[0].re.test(`${new URL(l.href).pathname} ${l.text}`));
  const kinds = [tel && 'telefon', mail && 'e-posta', wa && 'WhatsApp', forms.length > 0 && 'form'].filter(Boolean) as string[];
  add('contact_path', 'conv', 'İletişim yolları', kinds.length >= 2 ? 'pass' : kinds.length === 1 ? 'partial' : thin ? 'unknown' : 'fail', kinds.length ? `Bulunan: ${kinds.join(', ')}.` : thin ? thinMsg : 'Telefon, e-posta bağlantısı, WhatsApp ve form bulunamadı.', 4, true);
  add('contact_page', 'conv', 'İletişim sayfası', contactPage ? 'pass' : thin ? 'unknown' : 'fail', contactPage ? 'İletişim sayfası/bağlantısı var.' : thin ? 'Sayfa bağlantıları okunamadı (JavaScript ile yükleniyor olabilir).' : 'İletişim sayfasına bağlantı bulunamadı.', 1.5);
  const maxF = Math.max(0, ...fields);
  add('form', 'conv', 'Talep formu kalitesi', !forms.length ? 'fail' : maxF <= 6 && maxF >= 2 ? 'pass' : 'partial', forms.length ? `${forms.length} form, alan sayıları: ${fields.join(', ')}${maxF > 6 ? ' (uzun form dönüşümü düşürür)' : maxF < 2 ? ' (çok az alan)' : ''}.` : 'Lead toplayan form yok.', 2);
  const btns = [...html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => pageText(m[2])).filter((t) => t.length > 2 && t.length < 50); const ctaHit = btns.filter((t) => CTA.test(t));
  add('cta', 'conv', 'Net eylem çağrısı (CTA)', ctaHit.length >= 2 ? 'pass' : ctaHit.length === 1 ? 'partial' : jsShell ? 'unknown' : 'fail', ctaHit.length ? `Örnek: "${ctaHit[0].slice(0, 40)}" (${ctaHit.length} adet).` : jsShell ? 'Sayfa JavaScript ile yükleniyor.' : 'Ana sayfada eylem çağrısı içeren düğme/bağlantı bulunamadı.', 1.5);

  // TRUST & LEGAL
  const has = (k: string) => { const re = KINDS.find((x) => x.k === k)!.re; return homeLinks.some((l) => re.test(`${new URL(l.href).pathname} ${l.text}`)) || infos.some((i) => i.kind === k); };
  const imp = has('impressum'); const priv = has('privacy');
  add('impressum', 'trust', 'Impressum', !de ? 'na' : imp ? 'pass' : thin ? 'unknown' : 'fail', !de ? 'Almanya/Avusturya sitesi gibi görünmüyor; Impressum zorunluluğu değerlendirilmedi.' : imp ? 'Impressum bağlantısı/sayfası var.' : thin ? thinMsg : 'DE/AT sitesinde Impressum bağlantısı bulunamadı (yasal zorunluluk).', 3, de);
  add('privacy', 'trust', 'Gizlilik / Datenschutz', priv ? 'pass' : thin ? 'unknown' : 'fail', priv ? 'Gizlilik sayfası bağlantısı var.' : thin ? thinMsg : 'Gizlilik politikası bağlantısı bulunamadı.', 2.5);
  const cmp = hit(hay, CMP); const trk = hit(hay, TRACK);
  add('cookie', 'trust', 'Çerez onay aracı', cmp.length ? 'pass' : trk.length ? 'fail' : 'na', cmp.length ? `Onay aracı: ${cmp.slice(0, 2).join(', ')}.` : trk.length ? `İzleyici var (${trk.slice(0, 3).join(', ')}) ama onay aracı bulunamadı.` : 'İzleyici/çerez betiği görülmedi; onay banner\'ı gerekmiyor.', 1.5);
  const rev = hit(hay, REVIEW); const revTxt = /bewertung|kundenstimmen|referenzen|erfahrungen|testimonials|müşteri yorum|yorumlar|reviews|μαρτυρ|κριτικ/i.test(allText);
  add('reviews', 'trust', 'Yorum / referans / güven işareti', rev.length ? 'pass' : revTxt ? 'partial' : 'fail', rev.length ? `Bulunan: ${rev.slice(0, 3).join(', ')}.` : revTxt ? 'Yorum/referans ifadesi var ama harici yorum aracı görülmedi.' : 'Yorum, referans veya harici güven işareti bulunamadı.', 2);
  const soc = SOCIAL.filter((s) => hay.includes(`${s}/`));
  add('social', 'trust', 'Sosyal medya bağlantıları', soc.length >= 2 ? 'pass' : soc.length === 1 ? 'partial' : 'fail', soc.length ? `Bulunan: ${soc.join(', ')}.` : 'Sosyal medya bağlantısı yok.', 1);
  const years = [...(allText.match(/(?:©|copyright)\s*(?:20\d{2}\s*[-–—]\s*)?(20\d{2})/gi) ?? [])].map((x) => +x.slice(-4)); const yr = years.length ? Math.max(...years) : 0; const nowY = new Date().getFullYear();
  add('copyright', 'trust', 'Telif yılı güncelliği', !yr ? 'unknown' : yr >= nowY - 1 ? 'pass' : yr >= nowY - 3 ? 'partial' : 'fail', yr ? `Alt bilgide © ${yr}${yr < nowY - 1 ? ' (site bakımsız görünebilir)' : ''}.` : 'Telif yılı görülmedi.', 1);
  add('about', 'trust', 'Hakkında / ekip sayfası', has('about') ? 'pass' : 'fail', has('about') ? 'Hakkında sayfası bağlantısı var.' : 'Hakkında/ekip sayfası bulunamadı.', 1);

  // AUTOMATION
  const book = hit(hay, BOOKING); const chat = hit(hay, CHAT); const news = hit(hay, NEWS);
  add('booking', 'auto', 'Online randevu / rezervasyon', book.length ? 'pass' : 'fail', book.length ? `Araç: ${book.slice(0, 3).join(', ')}.` : 'Online randevu veya rezervasyon aracı görülmedi.', 3);
  add('chat', 'auto', 'Canlı sohbet / sohbet botu', chat.length ? 'pass' : 'fail', chat.length ? `Araç: ${chat.slice(0, 3).join(', ')}.` : 'Canlı sohbet veya sohbet botu görülmedi.', 2);
  add('newsletter', 'auto', 'Bülten / e-posta toplama', news.length && (forms.length || /mailchimp|brevo|klaviyo/.test(hay)) ? 'pass' : news.length ? 'partial' : 'fail', news.length ? `İşaret: ${news.slice(0, 2).join(', ')}.` : 'Bülten kaydı veya e-posta toplama formu görülmedi.', 1.5);
  add('analytics', 'auto', 'Ölçüm / analitik', trk.length ? 'pass' : 'fail', trk.length ? `Bulunan: ${trk.slice(0, 3).join(', ')}.` : 'Ziyaretçi ölçümü (analitik) görülmedi.', 1.5);
  add('whatsapp', 'auto', 'WhatsApp kanalı', wa ? 'pass' : 'fail', wa ? 'WhatsApp bağlantısı var.' : 'WhatsApp bağlantısı yok.', 1);

  // CONTENT (deterministic part)
  add('text_volume', 'content', 'Ana sayfa metin miktarı', jsShell ? 'unknown' : words >= 150 ? 'pass' : words >= 60 ? 'partial' : 'fail', jsShell ? 'Metin JavaScript ile yükleniyor; okunamadı.' : `Ana sayfada yaklaşık ${words} kelime.`, 2);
  add('services_page', 'content', 'Hizmet / ürün sayfası', has('services') ? 'pass' : 'fail', has('services') ? 'Hizmet/ürün sayfası bağlantısı var.' : 'Ayrı hizmet/ürün sayfası bulunamadı.', 1.5);
  add('prices', 'content', 'Fiyat / paket bilgisi', has('prices') || /€|eur\b|ab \d+|\d+\s?tl\b|₺/i.test(allText) ? 'pass' : 'partial', has('prices') || /€|₺/.test(allText) ? 'Fiyat/paket bilgisi var.' : 'Fiyat veya paket bilgisi görülmedi (her sektörde şart değil).', 0.5);
  add('multilingual', 'content', 'Dil kapsamı', multi ? 'pass' : 'na', multi ? `Birden çok dil sunuluyor (${hl.join(', ') || 'dil bağlantıları'}).` : 'Tek dilli; yerel pazar için sorun değil.', 0.5);

  const contact = { phone: (/href=["']tel:([^"']+)["']/i.exec(allHtml)?.[1] ?? /(\+\d{1,3}[\s./-]?\(?\d{2,5}\)?[\s./-]?\d[\d\s./-]{4,12}\d)/.exec(allText)?.[1]), email: /href=["']mailto:([^"'?]+)/i.exec(allHtml)?.[1] ?? /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.exec(allText)?.[0] };
  if (contact.phone) { try { contact.phone = decodeURIComponent(contact.phone).replace(/[^\d+()\s./-]/g, '').trim().slice(0, 30) || undefined; } catch { contact.phone = undefined; } }
  if (contact.email) { try { contact.email = decodeURIComponent(contact.email).slice(0, 100); } catch { contact.email = undefined; } }
  const facts: Scan['facts'] = { cms, lang, country: countryOf(host, lang), booking: book, chat, whatsapp: wa, hreflang: hl, socials: soc, forms: forms.length, htmlBytes: home.bytes, scripts: scripts.length, thirdParty: ext.size, title: title.slice(0, 200), description: desc.slice(0, 300), de, jsShell, spa };
  // text for the LLM: home + most useful pages, ≤ 10k chars
  const per = Math.floor(10_000 / infos.length); const llmText = infos.map((i) => `[${i.url}] ${i.text.slice(0, per)}`).join('\n\n').slice(0, 10_000);
  return { fetcher: fetcher.name, pages, infos, home, checks: C, facts, contact, text: llmText, psi, robots, sitemap, httpsFailed };
}

// ── scoring ──
const VAL: Record<Status, number | null> = { pass: 1, partial: 0.5, fail: 0, na: null, unknown: null };
export const gradeOf = (s: number): Scan['grade'] => (s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 65 ? 'C' : s >= 50 ? 'D' : 'E');

export function finalize(raw: RawScan, p: Profile | null): Scan {
  const checks = raw.checks.map((c) => ({ ...c }));
  if (p?.needsBooking === false) { const b = checks.find((c) => c.id === 'booking'); if (b && b.status === 'fail') { b.status = 'na'; b.evidence = 'Bu sektörde online randevu tipik değil; gerekmiyor.'; } }
  const llm = p && [p.clarity, p.offer, p.positioning].every((x) => typeof x === 'number') ? Math.round(((p.clarity as number) + (p.offer as number) + (p.positioning as number)) / 3) : null;
  const categories = CATS.map((c) => {
    const cs = checks.filter((x) => x.cat === c.key && VAL[x.status] !== null); const w = cs.reduce((a, x) => a + x.weight, 0);
    let score: number | null = w ? Math.round((cs.reduce((a, x) => a + x.weight * (VAL[x.status] as number), 0) / w) * 100) : null;
    if (c.key === 'content' && llm !== null) score = score === null ? llm : Math.round(score * 0.5 + llm * 0.5);
    return { ...c, score, n: cs.length };
  });
  const rated = categories.filter((c) => c.score !== null); const tw = rated.reduce((a, c) => a + c.weight, 0);
  const rawScore = tw ? Math.round(rated.reduce((a, c) => a + c.weight * (c.score as number), 0) / tw) : 0;
  const capped: string[] = [];
  for (const c of checks) if (c.critical && c.status === 'fail') capped.push(c.label);
  const score = capped.length ? Math.min(rawScore, 79) : rawScore;
  const grade = gradeOf(score);

  // opportunities
  const st = (id: string) => checks.find((c) => c.id === id); const bad = (id: string) => ['fail', 'partial'].includes(st(id)?.status ?? '');
  const fail = (id: string) => st(id)?.status === 'fail'; const ev = (id: string) => st(id)?.evidence ?? '';
  const O: Opp[] = [];
  const opp = (o: Opp) => O.push(o);
  if (fail('booking')) opp({ id: 'booking', title: 'Online randevu ve otomatik hatırlatma', what: 'Randevu/rezervasyonun site üzerinden alınması, takvime ve hatırlatma mesajına bağlanması.', why: ev('booking') + (p?.needsBooking ? '' : ' (Sektör doğrulanamadı; randevu gerekli olmayabilir.)'), impact: p?.needsBooking ? 'yüksek' : 'orta', effort: 'orta', service: 'İş otomasyonu', reason: 'Sitenizde online randevu aracı görmedim; telefonla gelen taleplerin otomatik takvime ve hatırlatmaya bağlanması zaman kazandırabilir.' });
  if (fail('chat')) opp({ id: 'chat', title: 'Yazılı ve sesli YZ asistanı', what: 'Ziyaretçilerin sorularını gün boyu yanıtlayan, talebi forma çeviren asistan.', why: ev('chat'), impact: fail('contact_path') || fail('form') ? 'yüksek' : 'orta', effort: 'orta', service: 'YZ asistanı', reason: 'Sitede canlı sohbet veya asistan görmedim; mesai dışı gelen sorular cevapsız kalıyor olabilir.' });
  if (fail('contact_path') || fail('contact_page') || (st('form')?.status === 'fail' && !fail('contact_path'))) opp({ id: 'contact', title: 'Net iletişim yolu ve talep formu', what: 'Görünür telefon/e-posta/WhatsApp ve kısa bir talep formu; taleplerin tek yerde toplanması.', why: [ev('contact_path'), ev('form')].join(' '), impact: fail('contact_path') ? 'yüksek' : 'orta', effort: 'düşük', service: 'Web sitesi / uygulaması', reason: 'Ziyaretçinin size ulaşması için sitede net bir yol bulamadım; bu doğrudan kaçan talep demek olabilir.' });
  else if (bad('form') && /uzun/.test(ev('form'))) opp({ id: 'form', title: 'Formu kısaltmak', what: 'Talep formunu en gerekli 3-5 alana indirmek.', why: ev('form'), impact: 'orta', effort: 'düşük', service: 'Web sitesi / uygulaması', reason: 'Talep formunuz uzun görünüyor; kısaltmak gelen talep sayısını artırabilir.' });
  const ps = raw.psi.score;
  if ((ps !== null && ps < 50) || fail('weight') || (ps === null && fail('render_block'))) opp({ id: 'speed', title: 'Hız ve teknik yenileme', what: 'Sayfa yükünü azaltma, görsel ve betik düzeni; gerekirse siteyi yeniden kurma.', why: [ps !== null ? ev('psi') : '', ev('weight')].filter(Boolean).join(' '), impact: ps !== null && ps < 30 ? 'yüksek' : 'orta', effort: 'yüksek', service: 'Web sitesi / uygulaması', reason: ps !== null ? `Sitenin mobil hız puanı ${ps}/100 ölçüldü; yavaş açılan sayfa ziyaretçi kaybettirir.` : 'Ana sayfa ağır görünüyor; mobilde yavaş açılma ihtimali var.' });
  const seoBad = ['title', 'desc', 'h1', 'schema', 'canonical', 'robots_sitemap', 'og'].filter((i) => bad(i));
  if (seoBad.length >= 3) opp({ id: 'seo', title: 'SEO temellerinin düzeltilmesi', what: 'Başlık, açıklama, H1, yapılandırılmış veri, sitemap ve paylaşım etiketlerinin düzeni.', why: seoBad.map((i) => st(i)!.label).join(', ') + ' eksik veya zayıf.', impact: 'orta', effort: 'düşük', service: 'Dijital strateji', reason: `Aramada görünürlüğü etkileyen ${seoBad.length} temel öğe eksik veya zayıf; düzeltmesi hızlı bir iş.` });
  if (fail('impressum')) opp({ id: 'impressum', title: 'Impressum eksikliğinin giderilmesi', what: 'Yasal künye sayfası ve alt bilgi bağlantısı (metin için hukuki danışmanlık gerekir).', why: ev('impressum'), impact: 'yüksek', effort: 'düşük', service: 'Web sitesi / uygulaması', reason: 'Sitede Impressum bağlantısı bulamadım; Almanya\'da bu zorunlu bir bölüm.' });
  if (fail('privacy') || fail('cookie')) opp({ id: 'privacy', title: 'Gizlilik sayfası ve çerez onayı', what: 'Gizlilik politikası bağlantısı ve izleyiciler için onay aracı (metin için hukuki danışmanlık gerekir).', why: [ev('privacy'), ev('cookie')].join(' '), impact: 'orta', effort: 'düşük', service: 'Web sitesi / uygulaması', reason: 'Gizlilik veya çerez onayı tarafında eksik gördüm; bu hem yasal risk hem güven konusu.' });
  if (fail('reviews')) opp({ id: 'reviews', title: 'Gerçek müşteri yorumu / referans bölümü', what: 'İzinli, gerçek yorumların veya Google yorumlarının sitede gösterilmesi.', why: ev('reviews'), impact: 'orta', effort: 'düşük', service: 'Web sitesi / uygulaması', reason: 'Sitede yorum veya referans göremedim; yeni ziyaretçi için güven işareti eksik.' });
  if (fail('newsletter') && !fail('contact_path')) opp({ id: 'newsletter', title: 'Bülten ve otomatik e-posta serisi', what: 'E-posta toplama ve ilk ziyaretten sonra otomatik takip e-postaları.', why: ev('newsletter'), impact: 'düşük', effort: 'orta', service: 'İş otomasyonu', reason: 'İlk kez gelen ziyaretçiyi geri getirecek bir e-posta toplama alanı görmedim.' });
  if (fail('analytics')) opp({ id: 'analytics', title: 'Ölçüm kurulumu', what: 'İzinli, sade ziyaretçi ölçümü; hangi sayfanın talep getirdiğini görmek.', why: ev('analytics'), impact: 'düşük', effort: 'düşük', service: 'Dijital strateji', reason: 'Sitede ölçüm aracı görmedim; hangi sayfanın talep getirdiği bilinmiyor olabilir.' });
  if (st('copyright')?.status === 'fail' || (/Jimdo|Weebly|IONOS MyWebsite/.test(raw.facts.cms) && score < 65)) opp({ id: 'refresh', title: 'Sitenin yenilenmesi', what: 'Güncel, mobil öncelikli yeni site; mevcut içerik taşınır.', why: [ev('copyright'), /Jimdo|Weebly|IONOS/.test(raw.facts.cms) ? `Altyapı: ${raw.facts.cms}.` : ''].filter(Boolean).join(' '), impact: 'orta', effort: 'yüksek', service: 'Web sitesi / uygulaması', reason: 'Sitenin bakımsız veya eski bir altyapıda göründüğünü gözlemledim.' });
  if (p && p.clarity !== null && p.clarity < 50) opp({ id: 'clarity', title: 'Mesajın ve teklifin netleştirilmesi', what: 'Ana sayfada kime ne sunulduğunun ilk ekranda anlaşılır olması.', why: p.contentNote || 'İçerik analizi mesajı belirsiz buldu.', impact: 'orta', effort: 'düşük', service: 'Dijital strateji', reason: 'Ana sayfa metninde işletmenin ne sunduğu net anlaşılmıyor.' });
  const ord = { 'yüksek': 0, 'orta': 1, 'düşük': 2 } as const; const eff = { 'düşük': 0, 'orta': 1, 'yüksek': 2 } as const;
  O.sort((a, b) => ord[a.impact] - ord[b.impact] || eff[a.effort] - eff[b.effort]);

  // no-need / unmeasured
  const noNeed: { label: string; reason: string }[] = [];
  for (const c of checks) if (c.status === 'pass' && c.weight >= 1.5) noNeed.push({ label: c.label, reason: `Tamam: ${c.evidence}` });
  for (const c of checks) if (c.status === 'na') noNeed.push({ label: c.label, reason: c.evidence });
  if (raw.psi.score !== null && raw.psi.score >= 90) noNeed.unshift({ label: 'Hız çalışması', reason: `PageSpeed ${raw.psi.score}/100; hız için iş yapmaya gerek yok.` });
  const unmeasured = checks.filter((c) => c.status === 'unknown').map((c) => ({ label: c.label, reason: c.evidence }));
  if (raw.facts.spa) unmeasured.push({ label: 'Tam sayfa görünümü', reason: 'Site JavaScript ile oluşturuluyor; iletişim, yasal sayfa ve içerik kontrolleri eksik olabilir. Tam doğrulama için sayfayı çalıştıran bir tarayıcı hizmeti (Apify) sonradan eklenecek.' });
  if (!p) unmeasured.push({ label: 'İçerik netliği (YZ)', reason: 'Ölçülemedi: içerik analizi yapılamadı.' });
  else if (raw.facts.jsShell) unmeasured.push({ label: 'İçerik netliği (YZ)', reason: 'Ölçülemedi: sayfa metni JavaScript ile yükleniyor.' });

  const high = O.filter((o) => o.impact === 'yüksek').length; const mid = O.filter((o) => o.impact === 'orta').length;
  const priority: Scan['priority'] = high >= 2 || (high >= 1 && score < 70) || (mid >= 3 && score < 65) ? 'İletişime değer' : score >= 85 || (!high && !mid) ? 'Gerek yok' : 'Belki';
  const topNames = O.slice(0, 2).map((o) => o.title.toLowerCase()).join(' ve ');
  const sum = p?.summary || `${raw.facts.title || 'Site'} için ${rawScore >= 80 ? 'genel olarak düzenli bir tablo' : 'belirgin eksikler olan bir tablo'} görüldü (${score}/100, ${grade}). ${O.length ? `En öne çıkan fırsatlar: ${topNames}.` : 'Öne çıkan bir fırsat bulunamadı.'} ${priority === 'İletişime değer' ? 'Makul bir sebeple iletişime geçmeye değer.' : priority === 'Belki' ? 'İletişim için güçlü bir neden yok, isteğe bağlı.' : 'Şimdilik iletişime gerek görünmüyor.'}`;
  return { version: 2, fetcher: raw.fetcher, at: new Date().toISOString(), pages: raw.pages, psi: raw.psi, facts: raw.facts, score, rawScore, grade, capped, categories, checks, opportunities: O, noNeed: noNeed.slice(0, 14), unmeasured, priority, summary: sum, contact: raw.contact };
}
