import puppeteer from 'puppeteer';
import fs from 'node:fs';
const [SP, W, H, tag] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
const b = await puppeteer.launch({ headless: true });
const p = await b.newPage();
p.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 120)));
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('cw-consent', JSON.stringify({ v: 1, id: 'x', necessary: true, functional: false, statistics: false, at: new Date().toISOString() })); localStorage.setItem('cw-mode', 'light'); } catch {} });
await p.setViewport({ width: W, height: H, isMobile: W < 800, hasTouch: W < 800, deviceScaleFactor: 1 });
const shots = [];
const visit = async (url, fracs) => {
  try { await p.goto('http://localhost:3000' + url, { waitUntil: 'domcontentloaded', timeout: 180000 }); } catch { console.log('fail', url); return; }
  for (let i = 0; i < 40; i++) { if (await p.$('main')) break; await new Promise((r) => setTimeout(r, 1500)); }
  await new Promise((r) => setTimeout(r, 3500));
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (const f of fracs) { await p.evaluate((y) => window.scrollTo(0, y), Math.round((total - H) * f)); await new Promise((r) => setTimeout(r, 1400)); const file = `${SP}/L-${tag}-${shots.length}.png`; await p.screenshot({ path: file }); shots.push([`${url} ${Math.round(f * 100)}%`, file]); }
};
await visit('/tr/ana-sayfa', [0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 1]);
for (const u of (process.argv[6] === 'homeonly' ? [] : ['/tr/hizmetler', '/tr/iletisim', '/tr/cozumler/demokuafor'])) await visit(u, [0, 0.5]);
const per = W < 800 ? 6 : 3;
for (let s = 0; s < shots.length; s += per) {
  const part = shots.slice(s, s + per); const cw = W < 800 ? 396 : 700;
  const html = `<html><body style="margin:0;background:#666;display:flex;gap:6px;width:${per * cw}px">${part.map(([l, f]) => `<div style="width:${cw - 6}px;font:13px sans-serif;color:#fff"><div>${l}</div><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:${cw - 6}px"></div>`).join('')}</body></html>`;
  const q = await b.newPage(); await q.setViewport({ width: per * cw, height: 900 }); await q.setContent(html); await q.screenshot({ path: `${SP}/LS-${tag}-${s / per}.png`, fullPage: true }); await q.close();
}
await b.close(); console.log('sheets', Math.ceil(shots.length / per));
