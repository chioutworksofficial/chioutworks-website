// Regenerates public/demos/live/{lang}/{slug}-{card,dash,mobil}.jpg from the running dev app.
// Needs `npm run dev` (Vite :3000 + API :3001). Gets past the 24h demo gate like the UI does:
// request-code (dev/simulated mode returns devCode) -> verify -> store in localStorage.
// Usage: npm run shots [-- --lang=de --slug=demokafe]
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.SHOTS_BASE ?? 'http://localhost:3000';
const LANGS = ['tr', 'en', 'de', 'el'];
const SLUGS = ['demokuafor', 'demoklinik', 'demotemizlik', 'democrm', 'demoemlak', 'demokafe', 'demosadakat', 'demokariyer', 'demolojistik'];
const DEMOS = { tr: 'demolar', en: 'demos', de: 'demos', el: 'epideixeis' };
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1];
const langs = arg('lang') ? [arg('lang')] : LANGS;
const slugs = arg('slug') ? [arg('slug')] : SLUGS;

async function api(p, body) {
  const r = await fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}
const req = await api('/api/demo/request-code', { email: 'shots@chioutworks.local', demo: 'all', lang: 'en' });
if (!req.ok || !req.devCode) throw new Error('No devCode (server not in simulation mode?): ' + JSON.stringify(req));
const ver = await api('/api/demo/verify', { code: req.devCode });
if (!ver.ok) throw new Error('verify failed: ' + JSON.stringify(ver));
const access = JSON.stringify({ code: req.devCode, email: ver.email, expiresAt: ver.expiresAt });

const browser = await puppeteer.launch({ headless: 'shell' });
async function open(lang, slug, vp) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.evaluateOnNewDocument((a, l) => { localStorage.setItem('cw-demo-access', a); localStorage.setItem('cw-lang', l); }, access, lang);
  await page.goto(`${BASE}/${lang}/${DEMOS[lang]}/${slug}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-demo-theme]');
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(() => window.scrollTo(0, 0));
  const box = await (await page.$('[data-demo-theme] > div')).boundingBox() // inner rounded frame;
  return { page, box };
}
const jpg = (p) => ({ type: 'jpeg', quality: 82, captureBeyondViewport: true, ...p });

for (const lang of langs) {
  const dir = path.join(ROOT, 'public/demos/live', lang);
  fs.mkdirSync(dir, { recursive: true });
  for (const slug of slugs) {
    // desktop: card = 640x400 top-left crop, dash = 1232x835 (both @2x)
    let { page, box } = await open(lang, slug, { width: 1320, height: 900, deviceScaleFactor: 2 });
    await page.screenshot(jpg({ path: path.join(dir, `${slug}-card.jpg`), clip: { x: box.x, y: box.y, width: 640, height: 400 } }));
    await page.screenshot(jpg({ path: path.join(dir, `${slug}-dash.jpg`), clip: { x: box.x, y: box.y, width: 1232, height: 835 } }));
    await page.close();
    // mobile: viewport 462 so the frame is 390 wide; 390x844 @2x from the frame's top
    ({ page, box } = await open(lang, slug, { width: 462, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }));
    await page.screenshot(jpg({ path: path.join(dir, `${slug}-mobil.jpg`), clip: { x: box.x, y: box.y, width: 390, height: 844 } }));
    await page.close();
    console.log('ok', lang, slug);
  }
}
await browser.close();
