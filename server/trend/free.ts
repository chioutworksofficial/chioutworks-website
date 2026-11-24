// Keyless sources: Reddit, Hacker News, Polymarket, GitHub. Endpoints and parameters follow last30days (MIT, Matt Van Horn) reddit_public/hackernews/polymarket.
import { type Source, type TItem, tfetch, qs, iso, num, clip, obj, arr } from './types.js';

const reddit: Source = {
  key: 'reddit', label: 'Reddit',
  async fetch(c) {
    const one = async (sort: string) => obj(await tfetch(`https://www.reddit.com/search.json?${qs({ q: c.q, sort, t: 'month', limit: 40, raw_json: 1 })}`));
    const res = await Promise.allSettled([one('relevance'), one('top')]);
    const ok = res.filter((r): r is PromiseFulfilledResult<Record<string, unknown>> => r.status === 'fulfilled');
    if (!ok.length) throw (res[0] as PromiseRejectedResult).reason;
    const seen = new Set<string>(); const out: TItem[] = [];
    for (const r of ok) for (const ch of arr(obj(r.value.data).children)) {
      const p = obj(obj(ch).data); const link = String(p.permalink ?? '');
      if (obj(ch).kind !== 't3' || !link.includes('/comments/') || seen.has(link)) continue; seen.add(link);
      out.push({ source: 'reddit', title: clip(p.title, 200), url: `https://www.reddit.com${link}`, date: iso(num(p.created_utc)), text: clip(p.selftext, 300), author: p.subreddit ? `r/${clip(p.subreddit, 40)}` : undefined,
        eng: { score: num(p.score), comments: num(p.num_comments), ratio: Number(p.upvote_ratio) || 0 } });
    }
    return out;
  },
};

const hn: Source = {
  key: 'hn', label: 'Hacker News',
  async fetch(c) {
    const toks = c.q.split(/\s+/).filter(Boolean);
    const base: Record<string, string | number> = { query: c.q, tags: 'story', numericFilters: `created_at_i>${Math.floor(c.sinceMs / 1000)}`, hitsPerPage: 40 };
    if (toks.length > 1) base.optionalWords = toks.slice(1).join(' ');   // Algolia ANDs tokens by default
    const get = async (ep: string) => arr(obj(await tfetch(`https://hn.algolia.com/api/v1/${ep}?${qs(base)}`)).hits);
    const res = await Promise.allSettled([get('search'), get('search_by_date')]);
    const ok = res.filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled');
    if (!ok.length) throw (res[0] as PromiseRejectedResult).reason;
    const seen = new Set<string>(); const out: TItem[] = [];
    for (const r of ok) for (const h of r.value) {
      const x = obj(h); const id = String(x.objectID ?? ''); if (!id || seen.has(id) || !x.title) continue; seen.add(id);
      out.push({ source: 'hn', title: clip(x.title, 200), url: `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`, date: iso(num(x.created_at_i)), text: clip(x.story_text, 300), author: clip(x.author, 40) || undefined, eng: { points: num(x.points), comments: num(x.num_comments) } });
    }
    return out;
  },
};

const polymarket: Source = {
  key: 'polymarket', label: 'Polymarket',
  async fetch(c) {
    const j = obj(await tfetch(`https://gamma-api.polymarket.com/public-search?${qs({ q: c.q, sort: 'volume', events_status: 'active', keep_closed_markets: 0, limit_per_type: 10 })}`));
    const toks = c.q.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    return arr(j.events).flatMap((e): TItem[] => {
      const x = obj(e); const slug = String(x.slug ?? ''); if (!slug || !x.title) return [];
      if (toks.length && !toks.some((t) => String(x.title).toLowerCase().includes(t))) return [];   // public-search returns high-volume unrelated events for niche queries
      return [{ source: 'polymarket', title: clip(x.title, 200), url: `https://polymarket.com/event/${encodeURIComponent(slug)}`, date: iso(String(x.updatedAt ?? x.createdAt ?? x.startDate ?? '')), eng: { volume: num(x.volume), liquidity: num(x.liquidity) } }];
    });
  },
};

const github: Source = {
  key: 'github', label: 'GitHub',
  async fetch(c) {
    const day = new Date(c.sinceMs).toISOString().slice(0, 10);
    const headers: Record<string, string> = { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' };
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;   // optional: raises the 10/min unauthenticated search limit
    const get = async (kind: 'created' | 'pushed') => arr(obj(await tfetch(`https://api.github.com/search/repositories?${qs({ q: `${c.q} ${kind}:>${day}`, sort: 'stars', order: 'desc', per_page: 25 })}`, { headers })).items);
    const res = await Promise.allSettled([get('created'), get('pushed')]);
    const ok = res.filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled');
    if (!ok.length) throw (res[0] as PromiseRejectedResult).reason;
    const seen = new Set<string>(); const out: TItem[] = [];
    for (const r of ok) for (const it of r.value) {
      const x = obj(it); const url = String(x.html_url ?? ''); if (!url.startsWith('https://github.com/') || seen.has(url)) continue; seen.add(url);
      out.push({ source: 'github', title: clip(x.full_name, 120), url, date: iso(String(x.pushed_at ?? x.created_at ?? '')), text: clip(x.description, 300), eng: { stars: num(x.stargazers_count), forks: num(x.forks_count) } });
    }
    return out;
  },
};

export const FREE_SOURCES: Source[] = [reddit, hn, polymarket, github];
