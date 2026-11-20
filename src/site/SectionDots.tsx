import { scrollToTarget } from '../lib/smoothScroll';
import { useEffect, useState } from 'react';
import type { Lang } from '../translations';
import { SITE_UI } from './i18n';
import { POPULAR_UI } from './i18n/popular';
import { OUTRO_UI } from './i18n/outro';

/**
 * lialive-style section indicator (compact dashes on the right edge), shown on every page.
 * Home keeps its named sections; other pages detect their sections automatically
 * (the top-level blocks inside <main> plus the shared finale).
 */
type Item = { id: string; label: string };

function detect(lang: Lang, page: string): Item[] {
  const s = SITE_UI[lang].sections;
  const named: Record<string, string> = {
    hero: s.hero, features: s.features, statement: OUTRO_UI[lang].statement, popular: POPULAR_UI[lang].title,
    industries: s.demos, faq: s.faq, roi: s.roi, projects: s.projects, start: s.start,
  };
  const main = document.querySelector('main');
  if (!main) return [];
  // top-level blocks: direct children of <main>, or of its single wrapper element
  let blocks = Array.from(main.children) as HTMLElement[];
  if (blocks.length === 1 && blocks[0].children.length > 1) blocks = Array.from(blocks[0].children) as HTMLElement[];
  const minH = window.innerHeight * 0.35;
  const out: Item[] = [];
  blocks.forEach((wrap, i) => {
    if (wrap.getBoundingClientRect().height < minH) return;
    // GSAP pins wrap the section in a .pin-spacer — use the inner section (it carries the id)
    const inner = wrap.firstElementChild as HTMLElement | null;
    const el = !wrap.id && inner?.id ? inner : wrap;
    if (!el.id) el.id = `${page}-s${i + 1}`;
    // heading first, then any sub-heading / eyebrow / first text line — never a bare number
    const h = el.querySelector('h1, h2') || el.querySelector('h3, h4, legend, label, strong, p');
    const text = ((h as HTMLElement | null)?.innerText || h?.textContent || '').replace(/\s+/g, ' ').trim();
    out.push({ id: el.id, label: named[el.id] || (text.length > 40 ? text.slice(0, 38) + '…' : text) || document.title.split(/\s[|—–-]\s/)[0] });
  });
  const finale = document.getElementById('start');
  if (finale && !out.some((o) => o.id === 'start')) out.push({ id: 'start', label: named.start });
  return out;
}

export default function SectionDots({ lang, page }: { lang: Lang; page: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>('');

  // (re)scan sections after route changes and once late content (pins, images) has mounted
  useEffect(() => {
    const scan = () => setItems(detect(lang, page));
    const t1 = window.setTimeout(scan, 300);
    const t2 = window.setTimeout(scan, 1500);
    window.addEventListener('resize', scan);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.removeEventListener('resize', scan); };
  }, [lang, page]);

  useEffect(() => {
    if (!items.length) return;
    const vis = new Map<string, number>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => vis.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = '', max = 0;
      vis.forEach((r, id) => { if (r > max) { max = r; best = id; } });
      if (best) setActive(best);
    }, { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.01, 0.5, 1] });
    items.forEach(({ id }) => { const el = document.getElementById(id); if (el) io.observe(el); });
    setActive(items[0].id);
    return () => io.disconnect();
  }, [items]);

  const go = (id: string) => {
    scrollToTarget(id);
  };

  if (items.length < 2) return null;
  return (
    <nav aria-label={SITE_UI[lang].sectionsNav} className="hidden lg:flex fixed right-[10px] top-1/2 -translate-y-1/2 z-40 flex-col items-end">
      {items.map(({ id, label }) => {
        const on = id === active;
        return (
          // compact dashes: 2px tall, ~15px apart, active one longer and coloured with a soft glow
          <button key={id} type="button" onClick={() => go(id)} aria-label={label} aria-current={on ? 'true' : undefined}
            className="group relative flex items-center justify-end h-6 w-8">
            <span className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-quartz)', background: 'var(--c-deep-sea)', border: '1px solid var(--c-edge)' }}>{label}</span>
            <span className="block rounded-full transition-all duration-300"
              style={{ height: 2, width: on ? 22 : 10, background: on ? 'var(--c-lilac)' : 'color-mix(in srgb, var(--c-quartz) 38%, transparent)', filter: on ? 'drop-shadow(0 0 4px var(--c-signal))' : 'none' }} />
          </button>
        );
      })}
    </nav>
  );
}
