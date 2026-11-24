// Trend Radar shared types + SSRF-safe fetch. Idea source: last30days (MIT, Copyright 2026 Matt Van Horn); re-implemented, no code copied.
export type SourceKey = 'reddit' | 'hn' | 'polymarket' | 'github' | 'youtube' | 'x' | 'tiktok' | 'instagram' | 'metaads';
export interface TItem {
  source: SourceKey; title: string; url: string; date: string | null;   // ISO or null
  text?: string; author?: string;
  eng: Record<string, number>;       // raw engagement numbers (shown in UI)
  score?: number;                    // 0-100 after ranking
}
export interface Ctx { q: string; sinceMs: number; midMs: number }   // sinceMs = now-30d, midMs = now-7d
export interface Source {
  key: SourceKey; label: string; envKey?: string;     // envKey: needs this env var (key-ready slot)
  fetch: (c: Ctx) => Promise<TItem[]>;
}
export class SourceError extends Error { constructor(public code: 'soon' | 'http' | 'timeout' | 'blocked' | 'bad', m = code) { super(m); } }

/** Exact-host allowlist: nothing else is ever requested from the server. */
export const ALLOWED_HOSTS = new Set([
  'www.reddit.com', 'hn.algolia.com', 'gamma-api.polymarket.com', 'api.github.com',
  'www.googleapis.com', 'api.x.com', 'api.scrapecreators.com', 'graph.facebook.com',
]);
const UA = 'web:chioutworks-trend-radar:1.0 (admin research tool, manual use)';

export async function tfetch(url: string, init: { headers?: Record<string, string> } = {}): Promise<unknown> {
  const u = new URL(url);
  if (u.protocol !== 'https:' || !ALLOWED_HOSTS.has(u.hostname) || u.username || u.password || u.port) throw new SourceError('blocked');
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 8000);
  try {
    const r = await fetch(u, { redirect: 'manual', signal: ac.signal, headers: { 'user-agent': UA, accept: 'application/json', ...init.headers } });
    if (r.status >= 300) throw new SourceError('http', `status ${r.status}`);
    const len = Number(r.headers.get('content-length') ?? 0);
    if (len > 3_000_000) throw new SourceError('bad', 'too large');
    const txt = await r.text();
    if (txt.length > 3_000_000) throw new SourceError('bad', 'too large');
    try { return JSON.parse(txt); } catch { throw new SourceError('bad', 'not json'); }
  } catch (e) {
    if (e instanceof SourceError) throw e;
    throw new SourceError((e as Error)?.name === 'AbortError' ? 'timeout' : 'http');
  } finally { clearTimeout(t); }
}
export const qs = (o: Record<string, string | number>) => new URLSearchParams(Object.entries(o).map(([k, v]) => [k, String(v)])).toString();
export const iso = (sec: number | string | undefined | null) => {
  if (sec == null || sec === '') return null; const d = typeof sec === 'number' ? new Date(sec * 1000) : new Date(sec); return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
export const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 0; };
export const clip = (s: unknown, n: number) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export { obj, arr };
