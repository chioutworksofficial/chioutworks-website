import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const pages = [['tr','/tr/ana-sayfa'],['de','/de/startseite'],['en','/en/home'],['el','/el']];
for (const [lang, path] of pages) for (const w of [280, 320, 344, 360, 375, 390, 412, 430]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('cw-consent', JSON.stringify({ functional: true, v: 1 })); sessionStorage.setItem('cw-pre','1'); } catch {} });
  await p.goto('https://chioutworks-website.vercel.app' + path, { waitUntil: 'networkidle2' }); await new Promise((r) => setTimeout(r, 1500));
  const r = await p.evaluate(() => { const t = [...document.querySelectorAll('.cw-mode-toggle')].find((x) => x.offsetParent); if (!t) return 'none'; const q = t.getBoundingClientRect(); const top = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return { l: Math.round(q.left), r: Math.round(q.right), w: Math.round(q.width), vw: innerWidth, covered: !(top === t || t.contains(top)) }; });
  console.log(lang, w, JSON.stringify(r));
  if (lang === 'de' && (w === 360 || w === 412)) await p.screenshot({ path: '/private/tmp/claude-501/-Users-chouseinchiout-Desktop-chioutworks-Chioutworks-Official-Website/c6fb6177-c2f6-4f3d-bdb0-c88b19164b3d/scratchpad/nav-' + lang + w + '.png', clip: { x: 0, y: 0, width: w, height: 90 } });
  await p.close();
}
await b.close();
