#!/usr/bin/env node
// Text comfort check on phones (dev server must be running): for each page and phone size it reports
// overlapping texts, texts cut off by their box, tiny text (< 11px), cramped multi-line text (line-height < 1.15)
// and tight letter spacing. It measures; it does not judge looks.
// Usage: node scripts/text-check.mjs [baseUrl] --paths=file.json   (JSON array of paths; default: the 4 home pages)
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const BASE = (process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:3000').replace(/\/$/, '');
const LIST = process.argv.find((a) => a.startsWith('--paths='));
const PATHS = LIST ? JSON.parse(fs.readFileSync(LIST.slice(8), 'utf8')) : ['/tr', '/de', '/en', '/el'];
const SIZES = [['280', 280, 653], ['320', 320, 568], ['360', 360, 740], ['390', 390, 844], ['430', 430, 932]];

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => { try {
  localStorage.setItem('cw-consent', JSON.stringify({ v: 1, id: 'check', necessary: true, functional: false, statistics: false, at: new Date().toISOString() }));
  localStorage.setItem('cw-demo-access', JSON.stringify({ email: 'check@example.invalid', expiresAt: Date.now() + 86400000 }));   // test browser only
} catch { /* ignore */ } });

const out = [];
for (const p of PATHS) {
  for (const [name, w, h] of SIZES) {
    try {
      await page.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await new Promise((r) => setTimeout(r, 2500));
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      const found = new Map();
      // Check the page in screen-sized steps so scroll-driven sections are measured where they are visible
      for (let y = 0; y < Math.min(H, 30000); y += Math.round(h * 0.9)) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await new Promise((r) => setTimeout(r, 350));
        const r = await page.evaluate(() => {
          const vw = innerWidth, vh = innerHeight;
          const vis = (el) => { const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.4; };
          const txt = (el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
          // leaf text blocks: elements that directly contain text
          const leaves = [];
          for (const el of document.querySelectorAll('body *')) {
            if (!vis(el) || el.closest('[aria-hidden="true"]')) continue;
            const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
            if (!own) continue;
            const b = el.getBoundingClientRect();
            if (b.width < 2 || b.height < 2 || b.bottom < 0 || b.top > vh || b.right < 0 || b.left > vw) continue;
            leaves.push({ el, b });
          }
          const issues = [];
          const cs = (el) => getComputedStyle(el);
          for (const { el, b } of leaves) {
            const s = cs(el); const fs = parseFloat(s.fontSize);
            if (fs < 11) issues.push(`çok küçük yazı ${fs}px: "${txt(el)}"`);
            const lh = s.lineHeight === 'normal' ? fs * 1.2 : parseFloat(s.lineHeight);
            if (b.height > lh * 1.8 && lh / fs < 1.15) issues.push(`sıkışık satırlar (satır aralığı ${(lh / fs).toFixed(2)}): "${txt(el)}"`);
            const ls = parseFloat(s.letterSpacing); if (!Number.isNaN(ls) && ls / fs < -0.035) issues.push(`sıkışık harfler (${(ls / fs).toFixed(3)}em): "${txt(el)}"`);
            const cut = (s.overflow === 'hidden' || s.overflowX === 'hidden') && !s.webkitLineClamp && s.textOverflow !== 'ellipsis' && (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 3);
            if (cut) issues.push(`kesilen yazı: "${txt(el)}"`);
          }
          // overlaps between text blocks that are not nested in each other
          for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) {
            const a = leaves[i], c = leaves[j];
            if (a.el.contains(c.el) || c.el.contains(a.el)) continue;
            const x = Math.min(a.b.right, c.b.right) - Math.max(a.b.left, c.b.left);
            const yv = Math.min(a.b.bottom, c.b.bottom) - Math.max(a.b.top, c.b.top);
            if (x > 6 && yv > 6 && x * yv > 0.25 * Math.min(a.b.width * a.b.height, c.b.width * c.b.height)) {
              const fixed = (el) => { for (let e = el; e; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
              if (fixed(a.el) || fixed(c.el)) continue;   // header/floating buttons over scrolling content: expected
              issues.push(`üst üste binen yazılar: "${txt(a.el)}" ↔ "${txt(c.el)}"`);
            }
          }
          return issues;
        });
        for (const i of r) found.set(i, (found.get(i) ?? 0) + 1);
      }
      for (const [i] of found) out.push({ p, name, i });
    } catch (e) { out.push({ p, name, i: `ölçülemedi (${String(e.message).slice(0, 40)})` }); }
  }
}
await browser.close();

console.log(`Sayfa: ${PATHS.length} · ekran: ${SIZES.map((s) => s[0]).join('/')} piksel`);
if (!out.length) console.log('Sorun bulunmadı.');
const by = new Map();
for (const x of out) { const k = `${x.p} | ${x.i}`; if (!by.has(k)) by.set(k, []); by.get(k).push(x.name); }
for (const [k, sizes] of by) console.log(`- ${k} → ${sizes.join(', ')} px`);
