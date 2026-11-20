import { useEffect } from 'react';
import type { Lang } from '../translations';
import { LANGS, pagePath, type PageKey } from '../lib/routes';
import { PAGE_META } from '../data/pageMeta';
import { buildPageLd, type Crumb } from '../lib/structuredData';

function setHeadLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setRobots(content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!content) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('meta');
    el.name = 'robots';
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLd(data: object | null) {
  let el = document.head.querySelector<HTMLScriptElement>('script#ld-page');
  if (!data) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'ld-page';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Keeps <html lang>, <title>, meta description, canonical and hreflang alternates
 * in sync with the current localized page. Pass `title` to override (e.g. demo pages).
 */
export function usePageMeta(lang: Lang, page: PageKey, opts: { title?: string; description?: string; path?: string; noindex?: boolean; keepTitle?: boolean; alt?: (l: Lang) => string; crumbs?: Crumb[]; ld?: Record<string, unknown>[] } = {}) {
  const { title, description, path, noindex, keepTitle, alt, crumbs, ld } = opts;
  const ldKey = JSON.stringify([crumbs, ld]);
  const altKey = alt ? LANGS.map(alt).join('|') : '';
  useEffect(() => {
    document.documentElement.lang = lang;
    const meta = PAGE_META[lang][page] ?? PAGE_META[lang].home!;
    if (!keepTitle) document.title = title ?? meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description ?? meta.description);
    const origin = window.location.origin;
    setHeadLink('canonical', origin + (path ?? pagePath(lang, page)));
    const altOf = (l: Lang) => (alt ? alt(l) : pagePath(l, page));
    LANGS.forEach((l) => setHeadLink('alternate', origin + altOf(l), l));
    setHeadLink('alternate', origin + altOf('en'), 'x-default');
    setRobots(noindex ? 'noindex, nofollow' : null);
    setLd(noindex ? null : buildPageLd(lang, page, path ?? pagePath(lang, page), crumbs, ld));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alt is compared by its output (altKey)
  }, [lang, page, title, description, path, noindex, keepTitle, altKey, ldKey]);
}
