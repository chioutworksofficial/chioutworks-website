#!/usr/bin/env node
// Mobile layout check (dev server must be running): visits the site's pages at common phone/tablet sizes and reports
// horizontal overflow (side-scrolling), elements sticking out of the screen, inputs that make iOS zoom in (< 16px)
// and small tap targets. It measures; it does not judge looks. Usage: node scripts/mobile-check.mjs [baseUrl] [--deep]
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const BASE = (process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:3000').replace(/\/$/, '');
const SIZES = [
  ['iPhone SE (1. nesil) 320×568', 320, 568], ['Küçük Android 360×740', 360, 740], ['iPhone 8 / SE 375×667', 375, 667],
  ['iPhone 12–16 390×844', 390, 844], ['iPhone Plus/Pro Max 430×932', 430, 932], ['Galaxy Fold kapalı 280×653', 280, 653],
  ['Yatay telefon 740×360', 740, 360],
];
const START = ['/tr', '/de', '/en', '/el'];
const LIST = process.argv.find((a) => a.startsWith('--paths='));   // optional JSON file with paths to check

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => { try {
  localStorage.setItem('cw-consent', JSON.stringify({ v: 1, id: 'check', necessary: true, functional: false, statistics: false, at: new Date().toISOString() }));
  localStorage.setItem('cw-demo-access', JSON.stringify({ email: 'check@example.invalid', expiresAt: Date.now() + 86400000 }));   // test browser only: lets the check open the live demos
} catch { /* ignore */ } });

// Collect internal pages from the start pages
const paths = new Set(LIST ? JSON.parse(fs.readFileSync(LIST.slice(8), 'utf8')) : START);
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
for (const s of LIST ? [] : START) {
  try {
    await page.goto(BASE + s, { waitUntil: 'networkidle2', timeout: 30000 });
    const links = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
    for (const l of links) { const p = (l ?? '').split('#')[0].split('?')[0]; if (p && !p.startsWith('/api') && !p.includes('admin') && paths.size < 40) paths.add(p); }
  } catch { /* page failed: reported below */ }
}

const problems = [];
for (const p of paths) {
  for (const [name, w, h] of SIZES) {
    try { await page.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch { problems.push({ p, name, issue: 'sayfa açılmadı' }); continue; }
    await new Promise((r) => setTimeout(r, 1500));
    let r;
    try { r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = document.documentElement.scrollWidth - vw;
      const desc = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
      const sticking = [];
      for (const el of document.querySelectorAll('body *')) {
        const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
        const cs = getComputedStyle(el); if (cs.position === 'fixed' && cs.visibility === 'hidden') continue;
        let clipped = false; for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') { clipped = true; break; } }
        if (!clipped && b.right > vw + 1) sticking.push(`${desc(el)} (+${Math.round(b.right - vw)}px)`);
        if (sticking.length >= 4) break;
      }
      const smallInputs = [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea, select')].filter((x) => x.getBoundingClientRect().width && parseFloat(getComputedStyle(x).fontSize) < 16).length;
      const smallTaps = [...document.querySelectorAll('a, button, [role=button]')].filter((x) => { const b = x.getBoundingClientRect(); return b.width && b.height && (b.height < 32 || b.width < 32) && getComputedStyle(x).display !== 'inline'; }).length;
      return { over, sticking, smallInputs, smallTaps };
    }); } catch { problems.push({ p, name, issue: 'ölçülemedi (sayfa yenilendi)' }); continue; }
    if (r.over > 1 || r.sticking.length) problems.push({ p, name, issue: `yana taşma ${Math.max(0, r.over)}px`, detail: r.sticking.join(', ') });
    if (r.smallInputs && w < 700) problems.push({ p, name, issue: `${r.smallInputs} giriş alanı 16px'ten küçük (iPhone yakınlaştırır)` });
    if (r.smallTaps > 0 && w === 390) problems.push({ p, name, issue: `${r.smallTaps} küçük dokunma alanı (<32px)` });
  }
}
await browser.close();

console.log(`Sayfa sayısı: ${paths.size} · ekran boyutu: ${SIZES.length}`);
if (!problems.length) console.log('Sorun bulunmadı.');
const byIssue = new Map();
for (const x of problems) { const k = `${x.p} | ${x.issue.replace(/\d+px/, 'Npx')}`; if (!byIssue.has(k)) byIssue.set(k, []); byIssue.get(k).push(x); }
for (const [k, list] of byIssue) console.log(`- ${k} → ${list.map((x) => x.name.split(' ').slice(0, 3).join(' ')).join('; ')}${list[0].detail ? `\n    ${list[0].detail}` : ''}`);
