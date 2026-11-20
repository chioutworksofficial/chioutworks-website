// Post-build prerender: renders every public sitemap route in headless Chrome and writes dist/<path>/index.html.
// Never fails the build: any problem (no browser, crash, timeout) logs a warning and leaves the plain SPA in dist/.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE_URL = /export const SITE_URL = '([^']+)'/.exec(readFileSync(join(ROOT, 'src/lib/structuredData.ts'), 'utf8'))?.[1];
const OG_LOCALE = { en: 'en_GB', de: 'de_DE', tr: 'tr_TR', el: 'el_GR' };
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.wasm': 'application/wasm', '.txt': 'text/plain', '.xml': 'application/xml' };

async function launch() {
  const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];
  const { default: puppeteer } = await import('puppeteer-core');
  if (process.platform === 'linux') {
    try {
      const { default: chromium } = await import('@sparticuz/chromium');
      return await puppeteer.launch({ args: [...chromium.args, ...args], executablePath: await chromium.executablePath(), headless: 'shell' });
    } catch (e) { console.warn('[prerender] @sparticuz/chromium unavailable:', e.message); }
  }
  const { executablePath } = await import('puppeteer');
  return await puppeteer.launch({ args, executablePath: await executablePath(), headless: true });
}

async function main() {
  if (!SITE_URL || !existsSync(join(DIST, 'index.html'))) throw new Error('dist/index.html or SITE_URL missing');
  const shell = readFileSync(join(DIST, 'index.html'), 'utf8');
  const preloader = /<div id="cw-pre"[\s\S]*?<\/span><\/div>/.exec(shell)?.[0];
  const paths = [...readFileSync(join(ROOT, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => !process.argv[2] || p.includes(process.argv[2]));

  const server = createServer((req, res) => {
    const p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p.startsWith('/api/')) { res.writeHead(404); return res.end(); }
    let f = join(DIST, p);
    if (!f.startsWith(DIST) || !existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
    res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const browser = await launch();
  let done = 0;
  const queue = [...paths];
  const retried = new Set();
  const worker = async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', (r) => (/\/api\//.test(r.url()) ? r.abort() : r.continue()));
    await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem('cw-pre', '1'); } catch { /* ignore */ } });
    for (let path; (path = queue.shift()); ) {
      try {
        await page.goto(origin + path, { waitUntil: 'load', timeout: 30000 });
        await page.waitForFunction(() => (document.querySelector('h1') || document.querySelector('h2')) && document.querySelector('script#ld-page'), { timeout: 20000 });
        await new Promise((r) => setTimeout(r, 600));
        const html = await page.evaluate((site, locale, path2) => {
          const set = (sel, attr, v) => document.head.querySelector(sel)?.setAttribute(attr, v);
          const title = document.title;
          const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
          set('meta[property="og:title"]', 'content', title); set('meta[name="twitter:title"]', 'content', title);
          set('meta[property="og:description"]', 'content', desc); set('meta[name="twitter:description"]', 'content', desc);
          set('meta[property="og:url"]', 'content', site + path2);
          set('meta[property="og:locale"]', 'content', locale);
          document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((m) => m.getAttribute('content') === locale && m.remove());
          document.querySelectorAll('.cw-consent, #cw-pre').forEach((e) => e.remove());
          return '<!doctype html>\n' + document.documentElement.outerHTML;
        }, SITE_URL, OG_LOCALE[path.split('/')[1]] || 'en_GB', path);
        let out = html.replaceAll(origin, SITE_URL).replace(/<body[^>]*>/, '<body>');
        if (preloader) out = out.replace('<div id="root">', preloader + '<div id="root">');
        const dir = join(DIST, path);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), out);
        done++;
      } catch (e) { if (!retried.has(path)) { retried.add(path); queue.push(path); continue; } console.warn(`[prerender] skip ${path}: ${e.message}`, process.env.PRERENDER_DEBUG ? await page.evaluate(() => [!!document.querySelector('h1'), !!document.querySelector('script#ld-page'), document.body.innerText.slice(0, 120)]).catch(() => '') : ''); }
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  await browser.close();
  server.close();
  console.log(`[prerender] ${done}/${paths.length} pages written`);
}

const timer = setTimeout(() => { console.warn('[prerender] timeout, shipping SPA'); process.exit(0); }, 4 * 60 * 1000);
main().catch((e) => console.warn('[prerender] skipped:', e.message)).finally(() => { clearTimeout(timer); process.exit(0); });
