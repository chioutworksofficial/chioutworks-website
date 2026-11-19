import type { Lang } from '../translations';

// Demo showcase catalogue. Texts: src/components/demos/demoText.ts.
// Built demos run in-site at /demo/:slug (access code). Images are real screenshots
// per language in public/demos/live/<lang>/. Kit previews are screenshots of the
// purchased Turkish app kits, so they are only listed on the Turkish page.

export type LiveDemoSlug = 'demokuafor' | 'demoklinik' | 'demotemizlik' | 'democrm' | 'demoemlak' | 'demokafe';
export type ExtraDemoSlug = 'demosadakat' | 'demokariyer' | 'demolojistik';
export type BuiltDemoSlug = LiveDemoSlug | ExtraDemoSlug;
export type KitDemoSlug = 'demoburo' | 'demobaski' | 'demoekitap' | 'demokarusel' | 'demopatika';
export type DemoSlug = BuiltDemoSlug | KitDemoSlug | 'demoozel';

export interface DemoMeta {
  slug: DemoSlug;
  /** Shown in the top "live demos" grid */
  live: boolean;
  /** Can be opened in-site at /demo/:slug */
  openable: boolean;
  card: string;
  shots: string[];
}

export const BUILT_SLUGS: BuiltDemoSlug[] = [
  'demokuafor', 'demoklinik', 'demotemizlik', 'democrm', 'demoemlak', 'demokafe',
  'demosadakat', 'demokariyer', 'demolojistik',
];

const KIT_FOLDER: Record<KitDemoSlug, string> = {
  demoburo: 'buro', demobaski: 'baski', demoekitap: 'ekitap', demokarusel: 'karusel', demopatika: 'patibakici',
};

/** Most in-demand business types first, per market */
const LIVE_ORDER: Record<Lang, LiveDemoSlug[]> = {
  de: ['demotemizlik', 'demokuafor', 'demoemlak', 'demoklinik', 'demokafe', 'democrm'],
  tr: ['demokuafor', 'demoemlak', 'democrm', 'demokafe', 'demoklinik', 'demotemizlik'],
  el: ['demokafe', 'demokuafor', 'demoemlak', 'demoklinik', 'democrm', 'demotemizlik'],
  en: ['demokuafor', 'demotemizlik', 'demoemlak', 'demokafe', 'demoklinik', 'democrm'],
};

const EXTRA_ORDER: Record<Lang, ExtraDemoSlug[]> = {
  de: ['demokariyer', 'demolojistik', 'demosadakat'],
  tr: ['demosadakat', 'demokariyer', 'demolojistik'],
  el: ['demosadakat', 'demokariyer', 'demolojistik'],
  en: ['demokariyer', 'demolojistik', 'demosadakat'],
};

const KIT_ORDER_TR: KitDemoSlug[] = ['demobaski', 'demokarusel', 'demoburo', 'demoekitap', 'demopatika'];

const built = (lang: Lang, slug: BuiltDemoSlug, live: boolean): DemoMeta => ({
  slug,
  live,
  openable: true,
  card: `/demos/live/${lang}/${slug}-card.jpg`,
  shots: [`/demos/live/${lang}/${slug}-dash.jpg`, `/demos/live/${lang}/${slug}-mobil.jpg`],
});

export function liveDemos(lang: Lang): DemoMeta[] {
  return LIVE_ORDER[lang].map((slug) => built(lang, slug, true));
}

export function previewDemos(lang: Lang): DemoMeta[] {
  const extras = EXTRA_ORDER[lang].map((slug) => built(lang, slug, false));
  if (lang !== 'tr') return extras;
  const kits = KIT_ORDER_TR.map((slug): DemoMeta => {
    const f = KIT_FOLDER[slug];
    return { slug, live: false, openable: false, card: `/demos/${f}/card.jpg`, shots: ['dash', 'landing', 'mobil'].map((n) => `/demos/${f}/${n}.jpg`) };
  });
  return [...extras, ...kits];
}

export const isBuiltSlug = (s: string | undefined): s is BuiltDemoSlug =>
  !!s && (BUILT_SLUGS as string[]).includes(s);
