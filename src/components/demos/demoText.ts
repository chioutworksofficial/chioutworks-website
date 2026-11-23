import type { Lang } from '../../translations.js';
import { DEMO_ITEMS } from '../../translationsDemoItems.js';
import { CATALOG_UI } from './i18n/catalog.js';
import { CUSTOM_UI } from './i18n/custom.js';

export interface DemoText {
  name: string;
  desc: string;
  features: string[];
}

/** Name, card description and feature bullets for any demo slug, in the given language. */
export function demoText(lang: Lang, slug: string): DemoText {
  if (slug === 'demoozel') {
    const c = CUSTOM_UI[lang];
    return { name: c.name, desc: c.desc, features: c.features };
  }
  const cat = (CATALOG_UI[lang] as Record<string, DemoText | undefined>)[slug];
  if (cat) return cat;
  const items = DEMO_ITEMS[lang].items as unknown as Record<string, { name: string; desc: string } | undefined>;
  const feats = DEMO_ITEMS[lang].features as unknown as Record<string, readonly string[] | undefined>;
  const it = items[slug];
  return {
    name: it?.name ?? slug,
    desc: it?.desc ?? '',
    features: [...(feats[slug] ?? (it?.desc ? [it.desc] : []))],
  };
}
