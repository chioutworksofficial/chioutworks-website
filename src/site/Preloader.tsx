import { useEffect, useState } from 'react';
import type { Lang } from '../translations';

/**
 * First-load intro (lialive-style): the overlay #cw-pre is painted by index.html before JS;
 * this component fills its bar from real readiness (fonts + page content), holds a minimum,
 * never exceeds a hard max, then fades out (200ms) and fires 'cw:preloader-done'.
 * Lenis is paused via body{overflow:hidden} (see smoothScroll.ts).
 */
const LABEL: Record<Lang, string> = { tr: 'Yükleniyor', en: 'Loading', de: 'Wird geladen', el: 'Φόρτωση' };
const MIN = 1500;
const MAX = 2500;

export default function Preloader({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(() => !!document.getElementById('cw-pre'));

  useEffect(() => {
    const el = document.getElementById('cw-pre');
    if (!el) return;
    const bar = el.querySelector<HTMLElement>('.b i');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = (window as unknown as { __cwPre?: number }).__cwPre ?? performance.now();
    let ready = false;
    let raf = 0;
    document.fonts.ready.then(() => { ready = !!document.querySelector('main h1, main section'); }).catch(() => { ready = true; });
    const poll = window.setInterval(() => { if (!ready && document.fonts.status === 'loaded' && document.querySelector('main h1, main section')) ready = true; }, 50);

    const finish = () => {
      cancelAnimationFrame(raf);
      clearInterval(poll);
      el.setAttribute('data-out', '');
      window.setTimeout(() => {
        el.remove();
        document.body.style.overflow = '';
        (window as unknown as { __cwPreDone?: boolean }).__cwPreDone = true;
        window.dispatchEvent(new Event('cw:preloader-done'));
        setActive(false);
      }, reduced ? 300 : 200);
    };

    const tick = (now: number) => {
      const t = now - start;
      const time = Math.min(t / MIN, 1);
      const p = ready ? time : Math.min(time, 0.9);
      if (bar) bar.style.transform = `scaleX(${1 - Math.pow(1 - p, 2)})`;
      if (t >= MAX || (ready && time >= 1)) { if (bar) bar.style.transform = 'scaleX(1)'; finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    if (reduced) {
      const w = window.setInterval(() => { if (ready || performance.now() - start >= MAX) { clearInterval(w); finish(); } }, 50);
      return () => { clearInterval(w); clearInterval(poll); };
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearInterval(poll); };
  }, []);

  return active ? <span className="sr-only" role="status">{LABEL[lang]}</span> : null;
}
