import type { Lang } from '../translations';
import { LANGS, pagePath, type PageKey } from './routes';
import { PAGE_META } from '../data/pageMeta';
import { FAQ_UI } from '../site/i18n/faq';

/** Single place for the public base URL: change here when the final domain is live (also update index.html). */
export const SITE_URL = 'https://chioutworks.com';
export const SHARE_IMAGE = `${SITE_URL}/og-share.jpg`;

type Json = Record<string, unknown>;
export type Crumb = { name: string; path: string };

const ORG_ID = `${SITE_URL}/#business`;
const LOCALE: Record<Lang, string> = { en: 'en-GB', de: 'de-DE', tr: 'tr-TR', el: 'el-GR' };
const MONTHS: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

/** "Nov 4, 2026" (English blog date) → "2026-11-04" */
export function isoFromEnDate(d: string): string | undefined {
  const m = /^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/.exec(d);
  return m && MONTHS[m[1]] ? `${m[3]}-${String(MONTHS[m[1]]).padStart(2, '0')}-${m[2].padStart(2, '0')}` : undefined;
}

const shortName = (lang: Lang, page: PageKey) => (PAGE_META[lang][page]?.title ?? '').split(' — ')[0] || 'Chioutworks';

const organization = (lang: Lang): Json => ({
  '@type': ['Organization', 'ProfessionalService'],
  '@id': ORG_ID,
  name: 'Chioutworks',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/brand/chioutworks-logo.png`,
  image: SHARE_IMAGE,
  description: PAGE_META[lang].home!.description,
  foundingDate: '2023',
  areaServed: [{ '@type': 'Country', name: 'Germany' }, { '@type': 'Country', name: 'Türkiye' }, { '@type': 'Country', name: 'Greece' }],
  address: { '@type': 'PostalAddress', addressLocality: 'Kelsterbach', addressRegion: 'Hessen', addressCountry: 'DE' },
  availableLanguage: LANGS,
  inLanguage: lang,
  sameAs: ['https://www.linkedin.com/in/chousein-chiout-29345323a/'],
});

/** Page-level nodes that need page data (article / service / extra breadcrumb). */
export const articleLd = (lang: Lang, p: { title: string; excerpt: string; id: string }, enDate: string | undefined, path: string): Json => {
  const iso = enDate ? isoFromEnDate(enDate) : undefined;
  return {
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}${path}#article`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    headline: p.title.slice(0, 110),
    description: p.excerpt,
    inLanguage: lang,
    ...(iso ? { datePublished: iso, dateModified: iso } : {}),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    image: SHARE_IMAGE,
  };
};

export const serviceLd = (lang: Lang, name: string, description: string, path: string): Json => ({
  '@type': 'Service',
  '@id': `${SITE_URL}${path}#service`,
  name,
  description,
  url: `${SITE_URL}${path}`,
  inLanguage: lang,
  provider: { '@id': ORG_ID },
  areaServed: ['DE', 'TR', 'GR'],
});

/** Full JSON-LD document for one route, in the page's language. */
export function buildPageLd(lang: Lang, page: PageKey, path: string, crumbs: Crumb[] = [], extra: Json[] = []): Json {
  const url = SITE_URL + path;
  const trail: Crumb[] = page === 'home' ? [] : [
    { name: 'Chioutworks', path: pagePath(lang, 'home') },
    ...(crumbs.length ? [{ name: shortName(lang, page), path: pagePath(lang, page) }] : []),
    ...(crumbs.length ? crumbs : [{ name: shortName(lang, page), path }]),
  ];
  const graph: Json[] = [
    organization(lang),
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: 'Chioutworks', inLanguage: LANGS.map((l) => LOCALE[l]), publisher: { '@id': ORG_ID } },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, inLanguage: lang, isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': ORG_ID } },
  ];
  if (trail.length) graph.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE_URL + c.path })) });
  if (page === 'faq') graph.push({ '@type': 'FAQPage', '@id': `${url}#faq`, inLanguage: lang, mainEntity: FAQ_UI[lang].items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) });
  return { '@context': 'https://schema.org', '@graph': [...graph, ...extra] };
}
