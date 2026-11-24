// Unit tests with MOCKED Apify responses (no credits spent): budget guard, no-token error, sync run -> checks run, tech fingerprints, spend table.
// Run: npx tsx scripts/test-apify.ts [samplesDir]   (samplesDir: saved real pages <name>.html + <name>.hdr for the fingerprint check)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const LEDGER = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/apify-ledger.json');
const backup = fs.existsSync(LEDGER) ? fs.readFileSync(LEDGER) : null;
for (const k of ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'APIFY_TOKEN', 'APIFY_API_TOKEN']) delete process.env[k];   // never touch the real database or token
const { runCrawler, budgetStatus, estimateUsd, buildInput, ApifyError, MONTHLY_BUDGET_USD } = await import('../server/apify.js');
const { createApifyFetcher } = await import('../server/siteScan.js');
const { scanSite, finalize } = await import('../server/siteScan.js');
const { detectTech, estimateSpend, socialsOf } = await import('../server/deepResearch.js');

let n = 0; const ok = (m: string) => { n++; console.log('ok', m); };
const j = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });
const limits = (used: number) => j({ data: { current: { monthlyUsageUsd: used }, limits: { maxMonthlyUsageUsd: 5 } } });
const calls: string[] = [];
const mockFetch = (used: number, items: unknown): typeof fetch => (async (u: any, init?: any) => {
  const url = String(u); calls.push(`${init?.method ?? 'GET'} ${url.split('?')[0]}`);
  assert.ok(!url.includes('token='), 'token never in URL');
  if (url.includes('/users/me/limits')) return limits(used);
  if (url.includes('run-sync-get-dataset-items')) { assert.match(String(init?.headers?.Authorization), /^Bearer /); assert.match(url, /maxTotalChargeUsd=/); return j(items, 201); }
  throw new Error('unexpected ' + url);
}) as any;

// 1) no token: clear error, nothing is called
await assert.rejects(runCrawler({ startUrl: 'https://example.com', crawler: 'cheerio', maxPages: 2, kind: 't' }, mockFetch(0, [])), (e: any) => e instanceof ApifyError && e.code === 'no_token' && e.userMessage === 'Apify anahtarı yok.');
assert.equal(calls.length, 0); ok('no token -> "Apify anahtarı yok."');

process.env.APIFY_API_TOKEN = 'test-token-not-real';   // alias accepted
// 2) budget guard refuses when over (real usage 1.49 of 1.50) and never starts the actor
calls.length = 0;
await assert.rejects(runCrawler({ startUrl: 'https://example.com', crawler: 'playwright:firefox', maxPages: 3, kind: 't' }, mockFetch(1.49, [])), (e: any) => e.code === 'budget' && /bütçe/.test(e.userMessage));
assert.ok(!calls.some((c) => c.includes('run-sync'))); ok('over budget -> refused, actor not started');
const b = await budgetStatus(mockFetch(0.4, [])); assert.equal(b.source, 'apify'); assert.equal(b.limit, MONTHLY_BUDGET_USD); assert.ok(Math.abs(b.remaining - 1.1) < 1e-9); ok('budget reads real usage (limits endpoint)');
const bl = await budgetStatus((async () => { throw new Error('net'); }) as any); assert.equal(bl.source, 'ledger'); ok('falls back to local ledger when limits endpoint is unreachable');
// 3) SSRF: private hosts refused before any call
calls.length = 0;
for (const u of ['http://localhost/', 'http://127.0.0.1/', 'http://10.0.0.5/', 'http://169.254.169.254/', 'ftp://example.com']) await assert.rejects(runCrawler({ startUrl: u, crawler: 'cheerio', maxPages: 1, kind: 't' }, mockFetch(0, [])), (e: any) => e.code === 'blocked_url');
assert.equal(calls.length, 0); ok('private/internal start URLs refused');
// 4) input matches the verified actor schema
const inp: any = buildInput({ startUrl: 'https://www.example.de/x', crawler: 'playwright:firefox', maxPages: 3, kind: 't' });
assert.equal(inp.crawlerType, 'playwright:firefox'); assert.equal(inp.maxCrawlPages, 3); assert.equal(inp.saveHtml, true); assert.deepEqual(inp.includeUrlGlobs[0], { glob: 'http?(s)://example.de/**' }); ok('actor input shape');

// 5) sync run returns rendered items -> ApifyFetcher -> the existing ~45 checks run (JS shell becomes measurable) and the scan is re-scored
const filler = 'Zahnarztpraxis Beispiel in Köln. Wir bieten Prophylaxe, Implantate und Kinderzahnheilkunde. Termine nach Vereinbarung. '.repeat(8);
const rendered = `<!doctype html><html lang="de"><head><title>Zahnarzt Beispiel Köln</title><meta name="description" content="Zahnarztpraxis in Köln mit Prophylaxe und Implantaten."><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><header><nav><a href="/kontakt">Kontakt</a> <a href="/leistungen">Leistungen</a> <a href="/impressum">Impressum</a> <a href="/datenschutz">Datenschutz</a> <a href="/team">Team</a> <a href="/preise">Preise</a></nav></header><main><h1>Zahnarztpraxis Beispiel</h1><p>${filler}</p><a href="/kontakt">Jetzt Termin anfragen</a><form><input name="n"><input name="m"></form></main><footer><a href="/impressum">Impressum</a></footer></body></html>`;
const shell = '<!doctype html><html><head><title>x</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>';
const item = (u: string, html: string) => ({ url: u, crawl: { loadedUrl: u, httpStatusCode: 200 }, metadata: { title: 'Zahnarzt', languageCode: 'de', headers: { 'content-type': 'text/html' } }, text: filler, markdown: filler, html });
calls.length = 0;
const fx = await createApifyFetcher('https://render-test.invalid/', (o) => runCrawler(o, mockFetch(0, [item('https://render-test.invalid/', rendered), item('https://render-test.invalid/kontakt', rendered)])));
assert.equal(fx.name, 'apify'); assert.equal(fx.pageCount, 2);
assert.ok(calls.some((c) => c.includes('run-sync-get-dataset-items'))); ok('sync run -> fetcher holds rendered pages');
const rawA = await scanSite('https://render-test.invalid/', fx);
assert.equal(rawA.fetcher, 'apify'); assert.equal(rawA.facts.jsShell, false); assert.ok(rawA.checks.length >= 30, `checks ${rawA.checks.length}`);
const h1 = rawA.checks.find((c) => c.id === 'h1'); assert.equal(h1?.status, 'pass');
const sA = finalize(rawA, null); assert.ok(sA.score > 0 && sA.fetcher === 'apify'); ok(`rendered scan: ${rawA.checks.length} checks, h1 pass, score ${sA.score}`);
const shellFx = { name: 'default', get: async (u: string) => ({ url: u, finalUrl: u, status: 200, headers: {}, body: u.endsWith('.invalid/') ? shell : '', bytes: 100, ms: 1, redirects: 0 }) } as any;
const rawS = await scanSite('https://render-test.invalid/', shellFx); assert.equal(rawS.facts.jsShell, true);
const sS = finalize(rawS, null); ok(`static JS shell: jsShell=true score ${sS.score} -> rendered score ${sA.score}`);

// 6) tech fingerprints + spend table (inline)
const T = detectTech('<script src="https://js.hs-scripts.com/1.js"></script><script src="https://connect.facebook.net/en_US/fbevents.js"></script><script src="https://www.googletagmanager.com/gtm.js?id=GTM-X"></script><link href="https://cdn.shopify.com/s/x.css">', { server: 'cloudflare', 'cf-ray': 'abc' });
for (const w of ['HubSpot', 'Meta Pixel', 'Google Tag Manager', 'Shopify', 'Cloudflare']) assert.ok(T.some((t) => t.name === w), w);
const sp = estimateSpend(T); assert.ok(sp.hi > sp.lo && sp.items.some((i) => i.name === 'Shopify')); ok('inline fingerprint + spend');
assert.deepEqual(socialsOf('<a href="https://www.instagram.com/firma/">x</a><a href="https://www.facebook.com/sharer/sharer.php?u=1">s</a>'), ['https://www.instagram.com/firma']); ok('socials (share links excluded)');

// 7) three saved real public pages (plain fetch, saved by the caller)
const dir = process.argv[2];
if (dir && fs.existsSync(dir)) {
  const exp: Record<string, string[]> = { wordpress_org: ['WordPress'], vercel_com: ['Next.js', 'Vercel'], www_squarespace_com: [] };
  for (const [name, must] of Object.entries(exp)) {
    const html = fs.readFileSync(path.join(dir, `${name}.html`), 'utf8'); const hdr: Record<string, string> = {};
    for (const l of fs.readFileSync(path.join(dir, `${name}.hdr`), 'utf8').split(/\r?\n/)) { const i = l.indexOf(':'); if (i > 0) hdr[l.slice(0, i).toLowerCase()] = l.slice(i + 1).trim(); }
    const hits = detectTech(html, hdr); console.log('  ', name, '->', hits.map((h) => `${h.name}[${h.cat}]`).join(', '));
    for (const m of must) assert.ok(hits.some((h) => h.name === m), `${name}: ${m}`);
    assert.ok(hits.length >= 2, `${name} at least 2 hits`);
  }
  ok('3 real pages fingerprinted');
}
if (backup) fs.writeFileSync(LEDGER, backup); else fs.rmSync(LEDGER, { force: true });
console.log(`\n${n} checks passed`);
