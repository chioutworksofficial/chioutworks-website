// Colour palettes and font pairs for the style page (owner, 2026-11-19): after liking a look, the visitor picks a
// palette (or their own main colour) and a font pair; the live preview updates and the owner sees the exact codes.
// Like the style presets, these are the sample sites' own colours (no purple / pink tones). Fonts are self-hosted
// (src/styles/fonts-style.css, public/fonts/style); never loaded from a font CDN at runtime.
import type { Lang } from '../translations.js';
import type { StylePreset } from './stylePresets.js';

export type Pal = StylePreset['pal'];
export interface Palette { id: string; name: Record<Lang, string>; pal: Pal }

export const PALETTES: Palette[] = [
  { id: 'ocean', name: { tr: 'Okyanus', en: 'Ocean', de: 'Ozean', el: 'Ωκεανός' }, pal: { bg: '#f5f8fc', surface: '#e6eef8', text: '#0f1d33', muted: '#5b6b82', accent: '#1f5fbf', onAccent: '#ffffff' } },
  { id: 'navy', name: { tr: 'Lacivert kurumsal', en: 'Corporate navy', de: 'Marine', el: 'Ναυτικό μπλε' }, pal: { bg: '#ffffff', surface: '#eef1f6', text: '#13213a', muted: '#5f6b7e', accent: '#1b2f5b', onAccent: '#ffffff' } },
  { id: 'forest', name: { tr: 'Orman', en: 'Forest', de: 'Wald', el: 'Δάσος' }, pal: { bg: '#f6f7f2', surface: '#e7ecdf', text: '#1d2a1c', muted: '#5f6b5a', accent: '#2f6b3a', onAccent: '#ffffff' } },
  { id: 'olive', name: { tr: 'Zeytin', en: 'Olive', de: 'Olive', el: 'Ελιά' }, pal: { bg: '#faf8f1', surface: '#eeeadb', text: '#2b2a1f', muted: '#6d6a58', accent: '#6b7a2c', onAccent: '#ffffff' } },
  { id: 'terracotta', name: { tr: 'Toprak', en: 'Terracotta', de: 'Terrakotta', el: 'Τερακότα' }, pal: { bg: '#fbf6f1', surface: '#f2e6da', text: '#2e211a', muted: '#7a6658', accent: '#b5562f', onAccent: '#ffffff' } },
  { id: 'sun', name: { tr: 'Güneş', en: 'Sunshine', de: 'Sonne', el: 'Ήλιος' }, pal: { bg: '#fffcf3', surface: '#fbf0cf', text: '#2a2410', muted: '#6e6440', accent: '#e0a100', onAccent: '#1f1700' } },
  { id: 'coral', name: { tr: 'Mercan', en: 'Coral', de: 'Koralle', el: 'Κοράλλι' }, pal: { bg: '#fff8f5', surface: '#fbe7de', text: '#2c1a14', muted: '#7b5f55', accent: '#e4572e', onAccent: '#ffffff' } },
  { id: 'teal', name: { tr: 'Turkuaz', en: 'Teal', de: 'Petrol', el: 'Τιρκουάζ' }, pal: { bg: '#f3faf9', surface: '#dff0ee', text: '#10302d', muted: '#557370', accent: '#0f8a7e', onAccent: '#ffffff' } },
  { id: 'mono', name: { tr: 'Siyah beyaz', en: 'Black & white', de: 'Schwarz-weiß', el: 'Ασπρόμαυρο' }, pal: { bg: '#ffffff', surface: '#f1f1f1', text: '#111111', muted: '#666666', accent: '#111111', onAccent: '#ffffff' } },
  { id: 'gold', name: { tr: 'Gece ve altın', en: 'Night & gold', de: 'Nacht & Gold', el: 'Νύχτα & χρυσό' }, pal: { bg: '#0f0f10', surface: '#1b1b1d', text: '#f2efe8', muted: '#a39e92', accent: '#c9a54c', onAccent: '#17130a' } },
  { id: 'midnight', name: { tr: 'Gece mavisi', en: 'Midnight', de: 'Mitternacht', el: 'Μεσάνυχτα' }, pal: { bg: '#0b1220', surface: '#141e33', text: '#e7edf7', muted: '#8a98b0', accent: '#3b82f6', onAccent: '#ffffff' } },
  { id: 'sand', name: { tr: 'Kum', en: 'Sand', de: 'Sand', el: 'Άμμος' }, pal: { bg: '#f7f3ec', surface: '#ebe3d6', text: '#2a251e', muted: '#756b5e', accent: '#8a6d46', onAccent: '#ffffff' } },
];

/** Palette from the visitor's own main colour (light or dark base). */
export function customPalette(accent: string, dark: boolean): Pal {
  const hex = /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#1f5fbf';
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const mix = (base: number[], t: number) => '#' + base.map((c, i) => Math.round(c * (1 - t) + [r, g, b][i] * t).toString(16).padStart(2, '0')).join('');
  return dark
    ? { bg: '#0f1115', surface: mix([26, 29, 36], 0.12), text: '#f2f4f7', muted: '#9aa3b2', accent: hex, onAccent: lum > 0.6 ? '#111111' : '#ffffff' }
    : { bg: '#ffffff', surface: mix([255, 255, 255], 0.1), text: '#151a22', muted: '#636b78', accent: hex, onAccent: lum > 0.6 ? '#111111' : '#ffffff' };
}

export interface FontPair { id: string; name: Record<Lang, string>; head: string; body: string; greek: boolean }
const F = (n: string, fb: 'sans' | 'serif') => `"${n}", ${fb === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif'}`;
export const FONT_PAIRS: FontPair[] = [
  { id: 'modern', name: { tr: 'Modern', en: 'Modern', de: 'Modern', el: 'Μοντέρνο' }, head: 'Montserrat', body: 'Inter', greek: false },
  { id: 'friendly', name: { tr: 'Samimi', en: 'Friendly', de: 'Freundlich', el: 'Φιλικό' }, head: 'Poppins', body: 'Nunito', greek: false },
  { id: 'elegant', name: { tr: 'Zarif', en: 'Elegant', de: 'Elegant', el: 'Κομψό' }, head: 'Playfair Display', body: 'Lato', greek: false },
  { id: 'classic', name: { tr: 'Klasik', en: 'Classic', de: 'Klassisch', el: 'Κλασικό' }, head: 'Lora', body: 'Roboto', greek: false },
  { id: 'clean', name: { tr: 'Sade', en: 'Clean', de: 'Schlicht', el: 'Λιτό' }, head: 'Inter', body: 'Inter', greek: true },
  { id: 'tech', name: { tr: 'Teknolojik', en: 'Tech', de: 'Technisch', el: 'Τεχνολογικό' }, head: 'Space Grotesk', body: 'DM Sans', greek: false },
  { id: 'editorial', name: { tr: 'Dergi', en: 'Editorial', de: 'Magazin', el: 'Περιοδικό' }, head: 'Source Serif 4', body: 'Inter', greek: true },
  { id: 'strong', name: { tr: 'Güçlü', en: 'Strong', de: 'Kräftig', el: 'Δυναμικό' }, head: 'Raleway', body: 'Roboto', greek: false },
  { id: 'readable', name: { tr: 'Okunaklı', en: 'Readable', de: 'Lesefreundlich', el: 'Ευανάγνωστο' }, head: 'Merriweather', body: 'Lato', greek: false },
  { id: 'neutral', name: { tr: 'Nötr', en: 'Neutral', de: 'Neutral', el: 'Ουδέτερο' }, head: 'Roboto', body: 'Roboto', greek: true },
  { id: 'serifmix', name: { tr: 'Klasik ve net', en: 'Classic & crisp', de: 'Klassisch & klar', el: 'Κλασικό & καθαρό' }, head: 'Source Serif 4', body: 'Roboto', greek: true },
];
const SERIF = new Set(['Playfair Display', 'Lora', 'Merriweather', 'Source Serif 4']);
export const fontCss = (n: string) => F(n, SERIF.has(n) ? 'serif' : 'sans');
/** Greek pages only offer pairs whose fonts include Greek letters (otherwise the preview would show a fallback). */
export const pairsFor = (lang: Lang) => (lang === 'el' ? FONT_PAIRS.filter((p) => p.greek) : FONT_PAIRS);
