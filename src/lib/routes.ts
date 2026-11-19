import type { Lang } from '../translations.js';

// Single source of truth for every public URL. Each page has a clean, localized
// slug per language: /tr/ana-sayfa, /en/home, /de/startseite, /el/arxiki …
// Greek slugs use Latin transliteration (safe in URLs, readable when shared).

export const LANGS: Lang[] = ['en', 'de', 'tr', 'el'];

export type PageKey = 'home' | 'services' | 'about' | 'portfolio' | 'demos' | 'blog' | 'faq' | 'resources' | 'contact' | 'solutions' | 'privacy' | 'terms' | 'docs' | 'tools' | 'packages';

export const SLUGS: Record<Lang, Record<PageKey, string>> = {
  en: { home: 'home', services: 'services', about: 'about', portfolio: 'portfolio', demos: 'demos', blog: 'blog', faq: 'faq', resources: 'resources', contact: 'contact', solutions: 'solutions', privacy: 'privacy', terms: 'terms', docs: 'docs', tools: 'tools', packages: 'packages' },
  de: { home: 'startseite', services: 'leistungen', about: 'ueber-mich', portfolio: 'portfolio', demos: 'demos', blog: 'blog', faq: 'faq', resources: 'ressourcen', contact: 'kontakt', solutions: 'loesungen', privacy: 'datenschutz', terms: 'agb', docs: 'dokumentation', tools: 'werkzeuge', packages: 'pakete' },
  tr: { home: 'ana-sayfa', services: 'hizmetler', about: 'hakkimda', portfolio: 'portfoy', demos: 'demolar', blog: 'blog', faq: 'sss', resources: 'kaynaklar', contact: 'iletisim', solutions: 'cozumler', privacy: 'gizlilik', terms: 'kullanim-kosullari', docs: 'belgeler', tools: 'araclar', packages: 'paketler' },
  el: { home: 'arxiki', services: 'ypiresies', about: 'schetika', portfolio: 'erga', demos: 'epideixeis', blog: 'arthra', faq: 'syxnes-erotiseis', resources: 'poroi', contact: 'epikoinonia', solutions: 'lyseis', privacy: 'aporrito', terms: 'oroi-xrisis', docs: 'tekmiriosi', tools: 'ergaleia', packages: 'paketa' },
};

/** Private client intake form: /:lang/<slug>/:token (noindex, not in sitemap, not a PageKey) */
export const INTAKE_SLUG: Record<Lang, string> = { tr: 'analiz', en: 'brief', de: 'analyse', el: 'analysi' };
export const intakePath = (lang: Lang, token: string) => `/${lang}/${INTAKE_SLUG[lang]}/${token}`;

/** Private client offer: /:lang/<slug>/:token (noindex, not in sitemap, not a PageKey) */
export const OFFER_SLUG: Record<Lang, string> = { tr: 'teklif', en: 'offer', de: 'angebot', el: 'prosfora' };
export const offerPath = (lang: Lang, token: string) => `/${lang}/${OFFER_SLUG[lang]}/${token}`;
/** Live project page (client portal), same slugs as server/projects.ts */
export const PROJECT_SLUG: Record<Lang, string> = { tr: 'proje', en: 'project', de: 'projekt', el: 'ergo' };

export const isLang = (s: string | undefined): s is Lang => !!s && (LANGS as string[]).includes(s);

/** URL of a page in a language, e.g. pagePath('tr', 'contact') → "/tr/iletisim" */
export const pagePath = (lang: Lang, page: PageKey) => `/${lang}/${SLUGS[lang][page]}`;

/** URL of a single demo, e.g. demoPath('tr', 'demokuafor') → "/tr/demolar/demokuafor" */
export const demoPath = (lang: Lang, slug: string) => `${pagePath(lang, 'demos')}/${slug}`;

/** URL of a solution deck, e.g. solutionPath('tr', 'demokuafor') → "/tr/cozumler/demokuafor" */
export const solutionPath = (lang: Lang, slug: string) => `${pagePath(lang, 'solutions')}/${slug}`;

/** URL of a partner tool page, e.g. toolPath('tr', 'hostinger') → "/tr/araclar/hostinger" */
export const toolPath = (lang: Lang, id: string) => `${pagePath(lang, 'tools')}/${id}`;

/** URL of a blog article, e.g. blogPath('tr', 'ai-jobs-reality') → "/tr/blog/ai-jobs-reality" */
export const blogPath = (lang: Lang, id: string) => `${pagePath(lang, 'blog')}/${id}`;

/** URL of a package page, e.g. packagePath('tr', 'booking') → "/tr/paketler/booking" */
export const packagePath = (lang: Lang, id: string) => `${pagePath(lang, 'packages')}/${id}`;

/** Which page a slug refers to in a given language (null if unknown) */
export function pageFromSlug(lang: Lang, slug: string | undefined): PageKey | null {
  if (!slug) return 'home';
  const entry = (Object.entries(SLUGS[lang]) as [PageKey, string][]).find(([, s]) => s === slug);
  return entry ? entry[0] : null;
}

/** Same page in another language — used by the language switcher */
export function switchLangPath(pathname: string, to: Lang): string {
  const [, from, slug, demo] = pathname.split('/');
  if (!isLang(from)) return pagePath(to, 'home');
  const page = pageFromSlug(from, slug) ?? 'home';
  if (demo && page === 'demos') return demoPath(to, demo);
  if (demo && page === 'solutions') return solutionPath(to, demo);
  if (demo && page === 'tools') return toolPath(to, demo);
  if (demo && page === 'packages') return packagePath(to, demo);
  if (demo && page === 'blog') return blogPath(to, demo);
  return pagePath(to, page);
}

/**
 * Country from the device's own time zone (local only, nothing is sent anywhere).
 * Germany/Austria/Switzerland/Liechtenstein/Luxembourg → de, Greece/Cyprus → el, Turkey/Azerbaijan/Northern Cyprus → tr.
 */
const TZ_LANG: Record<string, Lang> = {
  'Europe/Berlin': 'de', 'Europe/Busingen': 'de', 'Europe/Vienna': 'de', 'Europe/Zurich': 'de', 'Europe/Vaduz': 'de', 'Europe/Luxembourg': 'de',
  'Europe/Athens': 'el', 'Asia/Nicosia': 'el', 'Europe/Nicosia': 'el',
  'Europe/Istanbul': 'tr', 'Asia/Istanbul': 'tr', 'Asia/Baku': 'tr', 'Asia/Famagusta': 'tr',
};

/**
 * Preferred language for "/" (owner's rule: the visitor is greeted in the language of the country they connect from):
 * their country (time zone) → their own earlier choice (only outside DE/AT/CH/GR/CY/TR) → their browser language → English.
 * Links that already carry a language (/de/…, /tr/…) are never changed.
 */
export function preferredLang(): Lang {
  try {
    const byCountry = TZ_LANG[Intl.DateTimeFormat().resolvedOptions().timeZone];
    if (byCountry) return byCountry;
  } catch { /* Intl unavailable */ }
  try {
    const saved = localStorage.getItem('cw-lang');
    if (isLang(saved ?? undefined)) return saved as Lang;
  } catch { /* storage blocked */ }
  const navs = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
  for (const n of navs) { const l = n.slice(0, 2).toLowerCase(); if (isLang(l)) return l; }
  return 'en';
}

/** Legacy "#section" hrefs (still used in translations, e.g. footer colLinks) → page URL */
const HASH_TO_PAGE: Record<string, PageKey> = {
  '#': 'home', '#hero': 'home', '#services': 'services', '#about': 'about',
  '#portfolio': 'portfolio', '#demos': 'demos', '#blog': 'blog', '#faq': 'faq', '#resources': 'resources', '#contact': 'contact',
};
export const hashToPath = (lang: Lang, href: string) =>
  href in HASH_TO_PAGE ? pagePath(lang, HASH_TO_PAGE[href]) : href;
