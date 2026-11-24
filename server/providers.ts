// Admin "Hesaplar ve API": one place for every external account/API: key set?, masked hint (last 4 only), where it is used,
// live usage where an official read-only endpoint exists (ElevenLabs, Apify, Resend domains), plus the owner's manual cost entries.
// Key values are never returned or logged; only "••••" + last 4 characters.
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { dbOn, kvGet, kvSet } from './db.js';
import { rlStore } from './rateStore.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'data/providers-state.json');
const K_MANUAL = 'providers.manual';
const kvx = {
  async get<T>(k: string): Promise<T | null> {
    if (dbOn()) return kvGet<T>(k);
    try { return (JSON.parse(fs.readFileSync(FILE, 'utf8')) as Record<string, T>)[k] ?? null; } catch { return null; }
  },
  async set(k: string, v: unknown) {
    if (dbOn()) return kvSet(k, v);
    let o: Record<string, unknown> = {}; try { o = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { /* new */ }
    o[k] = v; fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(o));
  },
};

type Cat = 'ai' | 'voice' | 'data' | 'mail' | 'infra' | 'pay' | 'ads';
interface Def { id: string; name: string; cat: Cat; env?: string; keyless?: boolean; where: string; billing: string }
const DEFS: Def[] = [
  { id: 'groq', name: 'Groq', cat: 'ai', env: 'GROQ_API_KEY', where: 'Yazılı sohbet, analiz, taslaklar', billing: 'https://console.groq.com/settings/billing' },
  { id: 'gemini', name: 'Google Gemini', cat: 'ai', env: 'GEMINI_API_KEY', where: 'Sesli asistan (canlı) ve metin yedeği', billing: 'https://aistudio.google.com/usage' },
  { id: 'openai', name: 'OpenAI', cat: 'ai', env: 'OPENAI_API_KEY', where: 'Yedek dil modeli', billing: 'https://platform.openai.com/settings/organization/billing/overview' },
  { id: 'mistral', name: 'Mistral', cat: 'ai', env: 'MISTRAL_API_KEY', where: 'Yedek dil modeli', billing: 'https://console.mistral.ai/billing' },
  { id: 'elevenlabs', name: 'ElevenLabs', cat: 'voice', env: 'ELEVENLABS_API_KEY', where: 'Tanıtım videoları için ses', billing: 'https://elevenlabs.io/app/subscription' },
  { id: 'vapi', name: 'Vapi', cat: 'voice', where: 'Voice Agent: telefonla arayan asistan', billing: 'https://dashboard.vapi.ai/billing' },
  { id: 'azure', name: 'Azure Speech', cat: 'voice', env: 'AZURE_SPEECH_KEY', where: 'Sesli asistan konuşma sentezi', billing: 'https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview' },
  { id: 'apify', name: 'Apify', cat: 'data', env: 'APIFY_TOKEN', where: 'Site tarama (ileride)', billing: 'https://console.apify.com/billing' },
  { id: 'fal', name: 'fal.ai', cat: 'data', env: 'FAL_KEY', where: 'Tanıtım görseli ve videosu üretimi (yalnızca yerel)', billing: 'https://fal.ai/dashboard/usage-billing/credits' },
  { id: 'pagespeed', name: 'Google PageSpeed', cat: 'data', keyless: true, where: 'Satış bölümü: site hız notu (anahtarsız, kota sınırlı)', billing: 'https://console.cloud.google.com/apis/api/pagespeedonline.googleapis.com/metrics' },
  { id: 'youtube', name: 'YouTube Data', cat: 'data', env: 'YOUTUBE_API_KEY', where: 'Trend Radar', billing: 'https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas' },
  { id: 'x', name: 'X (Twitter)', cat: 'data', env: 'X_BEARER_TOKEN', where: 'Trend Radar', billing: 'https://developer.x.com/en/portal/dashboard' },
  { id: 'scrapecreators', name: 'ScrapeCreators', cat: 'data', env: 'SCRAPECREATORS_API_KEY', where: 'Trend Radar: TikTok ve Instagram', billing: 'https://app.scrapecreators.com' },
  { id: 'github', name: 'GitHub', cat: 'data', env: 'GITHUB_TOKEN', where: 'Trend Radar: istek sınırını yükseltir', billing: 'https://github.com/settings/billing' },
  { id: 'resend', name: 'Resend', cat: 'mail', env: 'RESEND_API_KEY', where: 'E-posta gönderimi (bülten, bildirim, teklif)', billing: 'https://resend.com/settings/billing' },
  { id: 'supabase', name: 'Supabase', cat: 'infra', env: 'SUPABASE_SECRET_KEY', where: 'Veritabanı ve dosyalar', billing: 'https://supabase.com/dashboard/org/_/billing' },
  { id: 'sentry', name: 'Sentry', cat: 'infra', env: 'SENTRY_DSN_API', where: 'Hata izleme (sunucu ve tarayıcı)', billing: 'https://sentry.io/settings/billing/' },
  { id: 'vercel', name: 'Vercel', cat: 'infra', env: 'VERCEL_TOKEN', where: 'Barındırma ve yayın (GitHub üzerinden)', billing: 'https://vercel.com/account/billing' },
  { id: 'stripe', name: 'Stripe', cat: 'pay', env: 'STRIPE_SECRET_KEY', where: 'Teklif ödemeleri', billing: 'https://dashboard.stripe.com/settings/billing' },
  { id: 'meta', name: 'Meta reklam kitaplığı', cat: 'ads', env: 'META_ADLIB_TOKEN', where: 'Trend Radar: rakip reklamları', billing: 'https://developers.facebook.com/apps/' },
];

const mask = (v: string | undefined | null) => (v && v.length >= 8 ? `••••${v.slice(-4)}` : v ? '••••' : null);

// ── live usage (cached 5 min, 6 s timeout, never throws, never logs) ──
export type Usage =
  | { kind: 'bar'; label: string; used: number; limit: number; pct: number; unit: string; resets: string | null }
  | { kind: 'text'; label: string }
  | { kind: 'error' };
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
async function getJson(url: string, headers: Record<string, string>): Promise<any> {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error('http');
  return r.json();
}
const LIVE: Record<string, (k: string) => Promise<Usage | null>> = {
  async elevenlabs(k) {
    const j = await getJson('https://api.elevenlabs.io/v1/user/subscription', { 'xi-api-key': k });
    const used = num(j.character_count), limit = num(j.character_limit); if (used === null || !limit) return { kind: 'error' };
    const reset = num(j.next_character_count_reset_unix);
    return { kind: 'bar', label: `Paket: ${typeof j.tier === 'string' ? j.tier.slice(0, 30) : '?'}`, used, limit, pct: Math.round((used / limit) * 100), unit: 'karakter', resets: reset ? new Date(reset * 1000).toISOString() : null };
  },
  async apify(k) {
    const d = (await getJson('https://api.apify.com/v2/users/me/limits', { Authorization: `Bearer ${k}` })).data ?? {};
    const used = num(d.current?.monthlyUsageUsd), limit = num(d.limits?.maxMonthlyUsageUsd); if (used === null || !limit) return { kind: 'error' };
    return { kind: 'bar', label: 'Aylık kullanım', used: Math.round(used * 100) / 100, limit, pct: Math.round((used / limit) * 100), unit: 'USD', resets: typeof d.monthlyUsageCycle?.endAt === 'string' ? d.monthlyUsageCycle.endAt : null };
  },
  async resend(k) {
    const list: { status?: string }[] = (await getJson('https://api.resend.com/domains', { Authorization: `Bearer ${k}` })).data ?? [];
    if (!list.length) return { kind: 'text', label: 'Alan adı tanımlı değil (gönderim doğrulanmamış)' };
    const ok = list.filter((x) => x.status === 'verified').length;
    return { kind: 'text', label: `Alan adı doğrulaması: ${ok}/${list.length} doğrulandı` };
  },
};
const cache = new Map<string, { at: number; u: Usage | null }>();
async function liveOf(id: string, key: string | undefined): Promise<Usage | null> {
  const fn = LIVE[id]; if (!fn || !key) return null;
  const hit = cache.get(id); if (hit && Date.now() - hit.at < 300_000) return hit.u;
  let u: Usage | null; try { u = await fn(key); } catch { u = { kind: 'error' }; }
  cache.set(id, { at: Date.now(), u }); return u;
}

// ── fal.ai estimate from the local promo log (development only) ──
function falEstimate(): { monthUsd: number; totalUsd: number; count: number } | null {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return null;
  try {
    const month = new Date().toISOString().slice(0, 7); let m = 0, t = 0, n = 0;
    for (const ln of fs.readFileSync(path.join(ROOT, 'tanitim/araclar/fal-harcama.log'), 'utf8').split('\n')) {
      const p = ln.split('\t'); const v = Number(/\$([\d.]+)/.exec(p[2] ?? '')?.[1]); if (!p[0] || !Number.isFinite(v)) continue;
      t += v; n++; if (p[0].startsWith(month)) m += v;
    }
    return { monthUsd: Math.round(m * 100) / 100, totalUsd: Math.round(t * 100) / 100, count: n };
  } catch { return null; }
}

async function vapiLast4(): Promise<string | null> {
  try {
    const s = dbOn() ? await kvGet<{ vapiKeyEnc?: string; vapiKeyLast4?: string }>('voiceAgent.settings')
      : (JSON.parse(fs.readFileSync(path.join(ROOT, 'data/va-kv.json'), 'utf8')) as Record<string, { vapiKeyEnc?: string; vapiKeyLast4?: string }>)['voiceAgent.settings'];
    return s?.vapiKeyEnc ? (s.vapiKeyLast4 ?? '') : null;
  } catch { return null; }
}

const Manual = z.object({
  plan: z.string().trim().max(80).default(''),
  fee: z.number().min(0).max(100000).nullable().default(null),
  currency: z.enum(['EUR', 'USD']).default('EUR'),
  cycle: z.enum(['monthly', 'yearly', 'usage']).default('monthly'),
  renewal: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).default(''),
  prepaid: z.number().min(0).max(1000000).nullable().default(null),
  cap: z.number().min(0).max(1000000).nullable().default(null),
  notes: z.string().trim().max(500).default(''),
}).strict();
type ManualT = z.infer<typeof Manual>;

export function registerProviders(app: Express, deps: { requireAdmin: (req: Request, res: Response) => Promise<boolean> }) {
  const A = '/api/admin/providers';
  const guard = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    deps.requireAdmin(req, res).then((ok) => (ok ? fn(req, res) : undefined)).catch(() => { if (!res.headersSent) res.status(500).json({ error: 'server', message: 'Sunucu hatası.' }); });
  const limit = rateLimit({ store: rlStore('providers'), windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'rate_limited', message: 'Çok fazla istek, bir dakika bekleyin.' } });

  app.get(A, limit, guard(async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    const manual = (await kvx.get<Record<string, unknown>>(K_MANUAL).catch(() => null)) ?? {};
    const vapi4 = await vapiLast4();
    const providers = await Promise.all(DEFS.map(async (d) => {
      const val = d.env ? process.env[d.env] : undefined;
      let configured = d.keyless ? true : !!val, hint = d.keyless ? null : mask(val);
      if (d.id === 'vapi') { configured = vapi4 !== null; hint = vapi4 === null ? null : vapi4 ? `••••${vapi4}` : '••••'; }
      if (d.id === 'vercel' && !val && process.env.VERCEL) configured = true;   // hosted on Vercel: no token needed
      const usage = configured ? await liveOf(d.id, val) : null;
      const m = Manual.safeParse(manual[d.id] ?? {});
      return { id: d.id, name: d.name, category: d.cat, configured, keyless: !!d.keyless, hint, where: d.where, billingUrl: d.billing, usage, manual: m.success ? m.data : Manual.parse({}) };
    }));
    return res.json({ providers, fal: falEstimate(), at: new Date().toISOString() });
  }));

  app.put(`${A}/:id`, limit, guard(async (req, res) => {
    const id = String(req.params.id);
    if (!DEFS.some((d) => d.id === id)) return res.status(404).json({ error: 'not_found', message: 'Bulunamadı.' });
    const b = Manual.safeParse(req.body ?? {});
    if (!b.success) return res.status(400).json({ error: 'invalid', message: 'Geçersiz değer.' });
    const all = (await kvx.get<Record<string, ManualT>>(K_MANUAL)) ?? {};
    all[id] = b.data; await kvx.set(K_MANUAL, all);
    res.set('Cache-Control', 'no-store'); return res.json({ ok: true, manual: b.data });
  }));
}
