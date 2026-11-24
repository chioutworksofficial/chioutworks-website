// Ranking, dedupe and "rising" detection. Formula ported from last30days (MIT, Copyright 2026 Matt Van Horn) signals.py / dates.py:
// log1p-weighted engagement per source, linear recency 100 -> 0 over 30 days, source quality. Final = 0.65*engagement + 0.25*recency + 0.10*quality.
import type { SourceKey, TItem } from './types.js';

const l = (v: number | undefined) => Math.log1p(Math.max(0, v ?? 0));
// weighted log engagement + log reference ("very high" item = 100); references follow signals.py _ENGAGEMENT_LOG_REFERENCE where it lists the source.
const ENG: Record<SourceKey, { w: [string, number][]; ref: number }> = {
  reddit: { w: [['score', 0.5], ['comments', 0.35], ['ratio', 0]], ref: 8 },
  hn: { w: [['points', 0.55], ['comments', 0.45]], ref: 7 },
  polymarket: { w: [['volume', 0.6], ['liquidity', 0.4]], ref: 15.2 },
  github: { w: [['stars', 0.7], ['forks', 0.3]], ref: 9.2 },
  youtube: { w: [['views', 0.45], ['likes', 0.32], ['comments', 0.13]], ref: 11 },
  x: { w: [['likes', 0.55], ['reposts', 0.25], ['replies', 0.15], ['quotes', 0.05]], ref: 9.2 },
  tiktok: { w: [['views', 0.45], ['likes', 0.27], ['comments', 0.18]], ref: 11 },
  instagram: { w: [['views', 0.5], ['likes', 0.3], ['comments', 0.2]], ref: 11 },
  metaads: { w: [['variants', 1]], ref: 3 },
};
const QUALITY: Record<SourceKey, number> = { reddit: 0.6, hn: 0.8, polymarket: 0.5, github: 0.7, youtube: 0.85, x: 0.68, tiktok: 0.58, instagram: 0.58, metaads: 0.72 };
const DAY = 86_400_000;

export const recency = (date: string | null, now = Date.now()) => {
  if (!date) return 0; const age = (now - new Date(date).getTime()) / DAY;
  return age < 0 ? 100 : age >= 30 ? 0 : Math.floor(100 * (1 - age / 30));
};
export const engagementScore = (it: TItem) => {
  const c = ENG[it.source]; let raw = c.w.reduce((s, [k, w]) => s + w * l(it.eng[k]), 0);
  if (it.source === 'reddit') raw += 0.05 * (it.eng.ratio ?? 0) * 10;
  return Math.min(100, (100 * raw) / c.ref);
};

const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const grams = (t: string) => { const w = norm(t).split(' '); const s = new Set<string>(); for (let i = 0; i < w.length - 1; i++) s.add(`${w[i]} ${w[i + 1]}`); if (w.length === 1) s.add(w[0]); return s; };
const jac = (a: Set<string>, b: Set<string>) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n); };

/** Score every item (0-100), drop duplicates (same URL or near-identical title; the higher score wins), sort best first. */
export function rank(items: TItem[], now = Date.now()): TItem[] {
  const scored = items.map((it) => ({ ...it, score: Math.round(0.65 * engagementScore(it) + 0.25 * recency(it.date, now) + 0.1 * QUALITY[it.source] * 100) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const out: TItem[] = []; const urls = new Set<string>(); const gs: Set<string>[] = [];
  for (const it of scored) {
    const u = it.url.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase(); const g = grams(it.title);
    if (urls.has(u) || gs.some((x) => jac(x, g) >= 0.8)) continue;
    urls.add(u); gs.push(g); out.push(it);
  }
  return out;
}

const STOP = new Set(('a an the and or of to in on for with is are was be it this that from by as at we you your i my our how what why when who not can do does vs via new use using used into than then they them their more most about just get got like will would should could have has had der die das und oder mit für von zu ist ein eine im den dem des auf nicht wie bir ve ile için bu da de mi mı ne nasıl çok daha gibi olarak ama veya ya ki και το η ο να για με σε από δεν').split(' '));
export interface Rising { daily: number[]; recent7: number; prior23: number; ratio: number; flag: boolean; terms: { term: string; recent: number; prior: number; flag: boolean }[] }
/** Volume of the last 7 days vs the previous 23 (per-day rate); "rising" = recent rate >= 1.5x prior rate with at least 3 recent items. Based on the fetched sample, not full platform volume. */
export function rising(items: TItem[], now = Date.now()): Rising {
  const daily = Array<number>(30).fill(0); let r7 = 0, p23 = 0;
  const tr = new Map<string, [number, number]>();
  for (const it of items) {
    if (!it.date) continue; const age = (now - new Date(it.date).getTime()) / DAY; if (age < 0 || age >= 30) continue;
    daily[29 - Math.floor(age)]++;
    const rec = age < 7; if (rec) r7++; else p23++;
    for (const w of new Set(norm(it.title).split(' '))) if (w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w)) { const e = tr.get(w) ?? [0, 0]; e[rec ? 0 : 1]++; tr.set(w, e); }
  }
  const rate = (a: number, b: number) => (a / 7) / Math.max(b / 23, 0.15);   // floor avoids infinity when nothing happened before
  const ratio = Math.round(rate(r7, p23) * 10) / 10;
  const terms = [...tr.entries()].filter(([, [a, b]]) => a + b >= 3).map(([term, [recent, prior]]) => ({ term, recent, prior, flag: recent >= 2 && rate(recent, prior) >= 1.5 }))
    .sort((a, b) => Number(b.flag) - Number(a.flag) || b.recent + b.prior - (a.recent + a.prior)).slice(0, 12);
  return { daily, recent7: r7, prior23: p23, ratio, flag: r7 >= 3 && ratio >= 1.5, terms };
}
