// Yerel dev sunucusundan (localhost:3000) ekran kaydı kareleri alır. Kullanım: node kayit-01.mjs <cikis-dizini>
import { createRequire } from 'module';
const puppeteer = createRequire(import.meta.url)('../../node_modules/puppeteer-core');
import fs from 'fs';
const out = process.argv[2];
const B = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
async function rec(name, url, secs, action, ai = false) {
  const dir = `${out}/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 693, deviceScaleFactor: 2.77, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument((ai) => { localStorage.setItem('cw-consent', JSON.stringify({ functional: true, v: 1 })); sessionStorage.setItem('cw-pre', '1'); if (ai) sessionStorage.setItem('cw-ai-consent', 'assistant-2026-11d|text'); }, ai);
  await page.goto(B + url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
  await sleep(2500);
  const t0 = Date.now(); let n = 0; const ts = []; const act = action ? action(page, t0).catch((e) => console.log(name, 'action:', String(e).slice(0, 160))) : null;
  while (Date.now() - t0 < secs * 1000) {
    ts.push((Date.now() - t0) / 1000); await page.screenshot({ path: `${dir}/${String(n++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 88 });
  }
  await act; const el = (Date.now() - t0) / 1000;
  fs.writeFileSync(`${dir}/ts.txt`, ts.join('\n'));
  console.log(name, n, 'frames', (n / el).toFixed(1), 'fps');
  await page.close();
}
const scroll = (from, to, ms, delay = 0) => async (page) => { await page.evaluate((y) => window.scrollTo(0, y), from); await sleep(delay); const st = Date.now(); while (Date.now() - st < ms) { const k = (Date.now() - st) / ms; await page.evaluate((y) => window.scrollTo(0, y), from + (to - from) * k); await sleep(16); } };
if (!process.env.ONLY || process.env.ONLY === 'a') await rec('a', '/tr/ana-sayfa', 4.4, scroll(0, 520, 2600, 1200));
if (!process.env.ONLY || process.env.ONLY === 'b') await rec('b', '/tr/ana-sayfa', 4.4, async (page) => { await sleep(700); await page.evaluate(() => document.querySelector('[aria-label="Sohbeti aç"]').click()); }, true);
if (!process.env.ONLY || process.env.ONLY === 'c') await rec('c', '/tr/paketler/booking', 5.4, scroll(700, 1900, 4600, 300));
if (!process.env.ONLY || process.env.ONLY === 'd') await rec('d', '/tr/paketler/crm', 4.4, scroll(700, 1700, 3800, 300));
await browser.close();
