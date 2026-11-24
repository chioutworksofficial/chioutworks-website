// Key-ready sources: disabled until the env key exists. Keys are read only here, sent only as headers (never in URLs/logs).
// TikTok / Instagram request+response shapes follow last30days (MIT, Matt Van Horn) tiktok.py / instagram.py (ScrapeCreators).
import { type Source, type TItem, SourceError, tfetch, qs, iso, num, clip, obj, arr } from './types.js';

const youtube: Source = {
  key: 'youtube', label: 'YouTube', envKey: 'YOUTUBE_API_KEY',
  async fetch(c) {
    const h = { 'x-goog-api-key': process.env.YOUTUBE_API_KEY ?? '' };
    const s = obj(await tfetch(`https://www.googleapis.com/youtube/v3/search?${qs({ part: 'snippet', type: 'video', q: c.q, order: 'relevance', maxResults: 25, publishedAfter: new Date(c.sinceMs).toISOString() })}`, { headers: h }));
    const ids = arr(s.items).map((i) => String(obj(obj(i).id).videoId ?? '')).filter(Boolean);
    if (!ids.length) return [];
    const v = obj(await tfetch(`https://www.googleapis.com/youtube/v3/videos?${qs({ part: 'snippet,statistics', id: ids.join(',') })}`, { headers: h }));
    return arr(v.items).map((i): TItem => {
      const x = obj(i); const sn = obj(x.snippet); const st = obj(x.statistics);
      return { source: 'youtube', title: clip(sn.title, 200), url: `https://www.youtube.com/watch?v=${encodeURIComponent(String(x.id))}`, date: iso(String(sn.publishedAt ?? '')), text: clip(sn.description, 300), author: clip(sn.channelTitle, 60) || undefined,
        eng: { views: num(st.viewCount), likes: num(st.likeCount), comments: num(st.commentCount) } };
    });
  },
};

const x: Source = {
  key: 'x', label: 'X', envKey: 'X_BEARER_TOKEN',
  async fetch(c) {
    const q = `${c.q.replace(/[()"]/g, ' ').trim()} -is:retweet`;   // recent search = last 7 days only (X API limit)
    const j = obj(await tfetch(`https://api.x.com/2/tweets/search/recent?${qs({ query: q, max_results: 50, 'tweet.fields': 'created_at,public_metrics' })}`, { headers: { authorization: `Bearer ${process.env.X_BEARER_TOKEN ?? ''}` } }));
    return arr(j.data).map((t): TItem => {
      const o = obj(t); const m = obj(o.public_metrics);
      return { source: 'x', title: clip(o.text, 200), url: `https://x.com/i/status/${encodeURIComponent(String(o.id))}`, date: iso(String(o.created_at ?? '')), eng: { likes: num(m.like_count), reposts: num(m.retweet_count), replies: num(m.reply_count), quotes: num(m.quote_count) } };
    });
  },
};

const sc = () => ({ 'x-api-key': process.env.SCRAPECREATORS_API_KEY ?? '' });
const tiktok: Source = {
  key: 'tiktok', label: 'TikTok', envKey: 'SCRAPECREATORS_API_KEY',
  async fetch(c) {
    const j = obj(await tfetch(`https://api.scrapecreators.com/v1/tiktok/search/keyword?${qs({ query: c.q, sort_by: 'relevance' })}`, { headers: sc() }));
    return arr(j.search_item_list ?? j.data).map((e): TItem => {
      const r = obj(obj(e).aweme_info ?? e); const st = obj(r.statistics); const au = obj(r.author); const share = String(r.share_url ?? '').split('?')[0];
      const id = String(r.aweme_id ?? ''); const user = String(au.unique_id ?? '');
      return { source: 'tiktok', title: clip(r.desc, 200), url: share || (user && id ? `https://www.tiktok.com/@${encodeURIComponent(user)}/video/${encodeURIComponent(id)}` : ''), date: iso(num(r.create_time)), author: user || undefined,
        eng: { views: num(st.play_count), likes: num(st.digg_count), comments: num(st.comment_count), shares: num(st.share_count) } };
    }).filter((i) => i.url.startsWith('https://'));
  },
};
const instagram: Source = {
  key: 'instagram', label: 'Instagram', envKey: 'SCRAPECREATORS_API_KEY',
  async fetch(c) {
    const j = obj(await tfetch(`https://api.scrapecreators.com/v2/instagram/reels/search?${qs({ query: c.q })}`, { headers: sc() }).catch((e) => { if (e instanceof SourceError && e.message === 'status 404') return {}; throw e; }));   // 404 = "no reels found"
    return arr(j.reels ?? j.items ?? j.data).map((e): TItem => {
      const r = obj(e); const cap = obj(r.caption); const code = String(r.shortcode ?? r.code ?? '');
      const own = obj(r.owner ?? r.user);
      return { source: 'instagram', title: clip(typeof r.caption === 'string' ? r.caption : cap.text ?? r.desc ?? r.text, 200), url: String(r.url ?? '') || (code ? `https://www.instagram.com/reel/${encodeURIComponent(code)}` : ''), date: iso(typeof r.taken_at === 'number' ? r.taken_at : String(r.taken_at ?? '')), author: String(own.username ?? '') || undefined,
        eng: { views: num(r.video_play_count ?? r.video_view_count ?? r.play_count), likes: num(r.like_count), comments: num(r.comment_count) } };
    }).filter((i) => i.url.startsWith('https://www.instagram.com/'));
  },
};

// Competitor ads (Meta Ad Library, Graph API v21.0). Not in the reference (it uses a scraper); request shape from Meta's public docs - verify with a real token.
const metaads: Source = {
  key: 'metaads', label: 'Meta reklam kitaplığı', envKey: 'META_ADLIB_TOKEN',
  async fetch(c) {
    const fields = 'id,page_name,ad_creative_bodies,ad_creative_link_titles,ad_delivery_start_time,ad_snapshot_url';
    const j = obj(await tfetch(`https://graph.facebook.com/v21.0/ads_archive?${qs({ search_terms: c.q, ad_reached_countries: JSON.stringify(['DE', 'TR', 'GR']), ad_active_status: 'ALL', ad_type: 'ALL', fields, limit: 40 })}`, { headers: { authorization: `Bearer ${process.env.META_ADLIB_TOKEN ?? ''}` } }));
    const byPage = new Map<string, TItem>();
    for (const a of arr(j.data)) {   // Meta gives no reach for commercial ads: count variants per advertiser as the engagement proxy (as last30days does)
      const o = obj(a); const page = clip(o.page_name, 80) || 'Reklam veren'; const cur = byPage.get(page);
      if (cur) { cur.eng.variants += 1; continue; }
      byPage.set(page, { source: 'metaads', title: `${page}: ${clip(arr(o.ad_creative_link_titles)[0] ?? arr(o.ad_creative_bodies)[0], 160)}`, url: `https://www.facebook.com/ads/library/?id=${encodeURIComponent(String(o.id))}`, date: iso(String(o.ad_delivery_start_time ?? '')), text: clip(arr(o.ad_creative_bodies)[0], 300), author: page, eng: { variants: 1 } });
    }
    return [...byPage.values()];
  },
};

export const KEYED_SOURCES: Source[] = [youtube, x, tiktok, instagram, metaads];
