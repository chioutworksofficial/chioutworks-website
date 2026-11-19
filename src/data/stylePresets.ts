// Style cards for "which look do you like?" (owner, 2026-11-17). Each card is a small drawn website preview, not a
// screenshot of someone else's site. Colours here are the sample sites' own palettes (like the demos, they keep their own
// theme); no purple / pink tones. `tags` are what the owner sees in the admin (Turkish).
import type { Lang } from '../translations.js';

export interface StylePreset {
  id: string;
  label: Record<Lang, string>;
  tags: string;                       // for the owner (tr)
  pal: { bg: string; surface: string; text: string; muted: string; accent: string; onAccent: string };
  hero: 'photo' | 'plain' | 'split' | 'block';
  font: 'sans' | 'serif' | 'rounded' | 'mono';
  photo?: string;                     // CSS gradient standing in for a photo
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'minimal', label: { tr: 'Sade ve ferah', en: 'Clean and airy', de: 'Schlicht und luftig', el: 'Λιτό και ευάερο' }, tags: 'sade, açık renk, bol boşluk',
    pal: { bg: '#ffffff', surface: '#f3f5f8', text: '#16202c', muted: '#7a8695', accent: '#2563eb', onAccent: '#ffffff' }, hero: 'plain', font: 'sans' },
  { id: 'lux', label: { tr: 'Koyu ve lüks', en: 'Dark and luxurious', de: 'Dunkel und edel', el: 'Σκούρο και πολυτελές' }, tags: 'koyu, lüks, altın vurgu, zarif yazı',
    pal: { bg: '#0f0f10', surface: '#1b1b1d', text: '#f2ede4', muted: '#9b958a', accent: '#c9a45c', onAccent: '#14110b' }, hero: 'split', font: 'serif',
    photo: 'linear-gradient(135deg, #2a2620 0%, #5b4a2e 55%, #c9a45c 120%)' },
  { id: 'photo', label: { tr: 'Büyük fotoğraflı', en: 'Big photos', de: 'Große Fotos', el: 'Μεγάλες φωτογραφίες' }, tags: 'büyük fotoğraf, görsel ağırlıklı',
    pal: { bg: '#ffffff', surface: '#eef1f4', text: '#1a1f24', muted: '#6c7680', accent: '#0e7490', onAccent: '#ffffff' }, hero: 'photo', font: 'sans',
    photo: 'linear-gradient(180deg, #7fb3d5 0%, #a9cce3 40%, #5d8a5e 70%, #3e5e3f 100%)' },
  { id: 'bold', label: { tr: 'Canlı ve cesur', en: 'Bold and vivid', de: 'Kräftig und mutig', el: 'Ζωντανό και τολμηρό' }, tags: 'canlı renk, cesur, büyük başlık',
    pal: { bg: '#ffd23f', surface: '#ffe68a', text: '#111111', muted: '#4a4334', accent: '#111111', onAccent: '#ffd23f' }, hero: 'block', font: 'sans' },
  { id: 'corporate', label: { tr: 'Kurumsal ve güven veren', en: 'Corporate and trustworthy', de: 'Seriös und vertrauenswürdig', el: 'Εταιρικό και αξιόπιστο' }, tags: 'kurumsal, lacivert, düzenli',
    pal: { bg: '#f5f7fb', surface: '#ffffff', text: '#0f2340', muted: '#5c6b80', accent: '#0f3b7a', onAccent: '#ffffff' }, hero: 'split', font: 'sans',
    photo: 'linear-gradient(135deg, #c8d6e8 0%, #8fa9cc 100%)' },
  { id: 'warm', label: { tr: 'Samimi ve sıcak', en: 'Warm and friendly', de: 'Herzlich und warm', el: 'Ζεστό και φιλικό' }, tags: 'samimi, sıcak tonlar, yuvarlak hatlar',
    pal: { bg: '#fbf4ea', surface: '#f3e3cc', text: '#3b2a1d', muted: '#8a715a', accent: '#c0583a', onAccent: '#ffffff' }, hero: 'split', font: 'rounded',
    photo: 'linear-gradient(135deg, #e9c39b 0%, #c0583a 100%)' },
  { id: 'nature', label: { tr: 'Doğal ve yumuşak', en: 'Natural and soft', de: 'Natürlich und sanft', el: 'Φυσικό και απαλό' }, tags: 'doğal, yeşil tonlar, sakin',
    pal: { bg: '#f1f4ee', surface: '#e1e9da', text: '#26331f', muted: '#6f7d66', accent: '#4d7c48', onAccent: '#ffffff' }, hero: 'photo', font: 'serif',
    photo: 'linear-gradient(180deg, #cfe0c3 0%, #8fb381 50%, #4d7c48 100%)' },
  { id: 'tech', label: { tr: 'Modern ve teknolojik', en: 'Modern and techy', de: 'Modern und technisch', el: 'Μοντέρνο και τεχνολογικό' }, tags: 'modern, koyu, teknolojik, keskin',
    pal: { bg: '#0b1220', surface: '#121c2e', text: '#e6edf7', muted: '#8193ad', accent: '#22d3ee', onAccent: '#06202a' }, hero: 'plain', font: 'mono' },
];
