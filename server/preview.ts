// AI demo for a submitted intake: Groq writes CONTENT only (JSON), our own templates render it as a clickable demo
// (website, CRM and/or automation, depending on what the client asked for). No AI-written code is ever executed.
// Which features the demo shows (booking, quote form, payment, accounts, assistant, notifications, languages) is taken
// from the client's ANSWERS, not guessed by the model. Stored on the intake (intake.preview), max 3 generations per link.
// Contact details (e-mail/phone) are not sent to the model; the company name is (it appears on the demo).
import type { Express, Request, Response } from 'express';
import type Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';
import { answersForAi, defOf, readIntakes, writeIntakes, wantsOf, type Intake } from './intake.js';

export const PREVIEW_THEMES = ['ocean', 'forest', 'sand', 'graphite', 'sunset'] as const;
const MAX_GENERATIONS = 3;
type View = 'website' | 'crm' | 'automation';

export interface PreviewFeatures {
  booking: boolean; quote: boolean; payment: boolean; accounts: boolean; assistant: boolean;
  notify: 'telegram' | 'whatsapp' | 'email' | null; languages: string[];
}
export interface PreviewData {
  brand: string; tagline: string; heroTitle: string; heroText: string; cta: string;
  services: { title: string; text: string }[]; about: string; highlights: string[]; contactLine: string;
  theme: (typeof PREVIEW_THEMES)[number]; domain: string;
  // added 2026-11-14 (optional: older previews stay valid)
  views?: View[]; features?: PreviewFeatures;
  steps?: { title: string; text: string }[]; faq?: { q: string; a: string }[]; quoteFields?: string[];
  assistant?: { q: string; a: string }[];
  crm?: { stages: string[]; fields: string[]; records: { name: string; note: string; stage: number }[] };
  flows?: { name: string; trigger: string; steps: string[]; result: string }[];
}

const SYSTEM = `You write the CONTENT for a clickable demo for a small business, based on its answers to a questionnaire.
The demo can contain a website, a customer management system (CRM) and/or automation flows; VIEWS tells you which ones.
Write EVERY string in the language given as LANGUAGE (use only that language; the English in this instruction is not a template). Friendly, concrete, professional; no exaggeration, no invented facts,
no prices, no fake reviews or testimonials, no fake statistics, no phone numbers or e-mail addresses. Use the business name if given.
Pick the colour theme that fits the sector and any stated style: ocean (calm blue, trust: clinics, consulting), forest (green: cleaning, garden, wellness),
sand (warm beige: cafes, beauty, crafts), graphite (dark, modern: agencies, tech, real estate), sunset (orange: food, events, energetic brands).
Return ONE JSON object with ALL of these keys:
{ "brand": string (business name, max 40), "tagline": string (max 60), "heroTitle": string (max 70), "heroText": string (max 220),
  "cta": string (button text, max 28), "services": [{"title": string (max 40), "text": string (max 120)}] (3 to 6, from their real services),
  "about": string (max 320, only from their answers), "highlights": [string] (3 items, max 50 each, only things they want),
  "contactLine": string (max 120), "theme": "ocean"|"forest"|"sand"|"graphite"|"sunset",
  "domain": string (plausible example domain from the business name, lowercase, no protocol),
  "steps": [{"title": string (max 40), "text": string (max 110)}] (3 items: how working with this business goes, from their process),
  "faq": [{"q": string (max 90), "a": string (max 200)}] (3 questions their customers would really ask; answers only from their answers, otherwise general and honest),
  "quoteFields": [string] (3 to 5 short form-field labels a customer fills in to ask this business for a quote, max 30 each),
  "assistant": [{"q": string (max 70), "a": string (max 220)}] (3 typical customer questions and the answer a helpful website assistant would give, honest, no prices),
  "crm": { "stages": [string] (4 to 6 pipeline stages, from their answers if given, max 24 each), "fields": [string] (4 to 6 customer fields they need, max 24 each),
           "records": [{"name": string (clearly invented example customer, typical for the market, must not be a real or well-known company, max 40), "note": string (max 90, next step or last contact), "stage": number (index into stages)}] (6 to 8) },
  "flows": [{"name": string (max 50), "trigger": string (max 80, a "when this happens" sentence written in LANGUAGE, never in English unless LANGUAGE is en), "steps": [string] (3 to 5, each max 80, what happens by itself), "result": string (max 100, the benefit, e.g. time saved, no invented numbers)}]
           (1 to 3 flows built from their repetitive tasks and automation wishes; if they gave none, sensible ones for their sector) }`;

const cut = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const arr = (v: unknown, max: number) => (Array.isArray(v) ? v.slice(0, max) : []);

function normalize(o: any, fallbackBrand: string, views: View[], features: PreviewFeatures): PreviewData {
  const services = arr(o?.services, 6).map((s: any) => ({ title: cut(s?.title, 40), text: cut(s?.text, 120) })).filter((s) => s.title);
  const highlights = arr(o?.highlights, 3).map((h) => cut(h, 50)).filter(Boolean);
  const domain = cut(o?.domain, 60).toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9.-]/g, '') || 'ihre-firma.de';
  const stages = arr(o?.crm?.stages, 6).map((x) => cut(x, 24)).filter(Boolean);
  const crm = stages.length >= 2 ? {
    stages,
    fields: arr(o?.crm?.fields, 6).map((x) => cut(x, 24)).filter(Boolean),
    records: arr(o?.crm?.records, 8).map((r: any) => ({ name: cut(r?.name, 40), note: cut(r?.note, 90), stage: Math.min(stages.length - 1, Math.max(0, Math.floor(Number(r?.stage) || 0))) })).filter((r) => r.name),
  } : undefined;
  const flows = arr(o?.flows, 3).map((f: any) => ({ name: cut(f?.name, 50), trigger: cut(f?.trigger, 80), steps: arr(f?.steps, 5).map((x) => cut(x, 80)).filter(Boolean), result: cut(f?.result, 100) }))
    .filter((f) => f.name && f.steps.length >= 2);
  return {
    brand: cut(o?.brand, 40) || fallbackBrand || 'Ihre Firma', tagline: cut(o?.tagline, 60), heroTitle: cut(o?.heroTitle, 70), heroText: cut(o?.heroText, 220),
    cta: cut(o?.cta, 28) || '→', services, about: cut(o?.about, 320), highlights, contactLine: cut(o?.contactLine, 120),
    theme: (PREVIEW_THEMES as readonly string[]).includes(o?.theme) ? o.theme : 'ocean', domain,
    views: views.filter((v) => (v === 'crm' ? !!crm : v === 'automation' ? flows.length > 0 : true)),
    features,
    steps: arr(o?.steps, 3).map((s: any) => ({ title: cut(s?.title, 40), text: cut(s?.text, 110) })).filter((s) => s.title),
    faq: arr(o?.faq, 3).map((f: any) => ({ q: cut(f?.q, 90), a: cut(f?.a, 200) })).filter((f) => f.q && f.a),
    quoteFields: arr(o?.quoteFields, 5).map((x) => cut(x, 30)).filter(Boolean),
    assistant: arr(o?.assistant, 3).map((f: any) => ({ q: cut(f?.q, 70), a: cut(f?.a, 220) })).filter((f) => f.q && f.a),
    crm, flows,
  };
}

/** What the demo shows comes from the answers. */
function viewsOf(i: Intake): View[] {
  const w = wantsOf(i.answers); const a = i.answers;
  const all = w.includes('all') || w.length === 0;
  const autoYes = ['auto_crm', 'auto_email', 'auto_quotes', 'auto_follow_up', 'invoicing', 'booking_system'].some((k) => a[k] === 'yes') || Object.keys(a).some((k) => k.startsWith('auto_goal__'));
  const v: View[] = [];
  if (all || w.includes('website')) v.push('website');
  if (all || w.includes('crm')) v.push('crm');
  if (all || w.includes('automation') || autoYes) v.push('automation');
  return v.length ? v : ['website'];
}
function featuresOf(i: Intake): PreviewFeatures {
  const a = i.answers; const w = wantsOf(a); const yes = (k: string) => a[k] === 'yes';
  const ch = String(a.messenger_notify ?? '');
  let languages: string[] = [];
  try {
    const q = defOf(i).sections.flatMap((s) => s.qs).find((x) => x.id === 'website_languages');
    languages = (q?.opts ?? []).filter((o) => a[`website_languages__${o.id}`] === true).map((o) => (o.t[i.lang] || o.t.en).replace(/\s*\(.*\)$/, '')).slice(0, 6);
  } catch { /* definition unavailable: no language switcher */ }
  return {
    booking: yes('online_booking') || yes('booking_system') || a.web_goal === 'booking' || w.includes('booking'), quote: yes('quote_form'), payment: yes('online_payment') || a.web_goal === 'sell', accounts: yes('customer_accounts'),
    assistant: w.includes('ai') || w.includes('all'), notify: ch === 'telegram' || ch === 'whatsapp' || ch === 'email' ? ch : null, languages,
  };
}

interface Deps { getGroq: () => Groq | null; rateSkip?: () => boolean }

export function registerPreview(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });
  const find = async (token: string) => {
    const all = await readIntakes(); const i = all.find((x) => x.token === token);
    return { all, i: i && !i.cancelledAt && Date.parse(i.expiresAt) > Date.now() ? i : null };
  };
  const pub = (p: any) => (p ? { data: p.data as PreviewData, at: p.at as string, left: Math.max(0, MAX_GENERATIONS - (p.count ?? 1)) } : null);

  app.get('/api/intake/:token/preview', async (req: Request, res: Response) => {
    const { i } = await find(String(req.params.token));
    if (!i) return res.status(404).json({ error: 'not_found' });
    res.set('Cache-Control', 'no-store');
    return res.json({ preview: pub((i as any).preview) });
  });

  app.post('/api/intake/:token/preview', limiter, async (req: Request, res: Response) => {
    const { i } = await find(String(req.params.token));
    if (!i) return res.status(404).json({ error: 'not_found' });
    if (i.status !== 'submitted') return res.status(409).json({ error: 'not_submitted' });
    const prev = (i as any).preview;
    if (prev && !req.body?.again) return res.json({ preview: pub(prev) });
    if (prev && (prev.count ?? 1) >= MAX_GENERATIONS) return res.status(429).json({ error: 'limit', preview: pub(prev) });
    const groq = d.getGroq();
    if (!groq) return res.status(503).json({ error: 'ai_unavailable' });
    const company = typeof i.answers.meta_company === 'string' ? i.answers.meta_company.trim() : i.prefill.company;
    const views = viewsOf(i); const features = featuresOf(i);
    const models = [process.env.GROQ_MODEL || 'openai/gpt-oss-120b', process.env.GROQ_FALLBACK_MODEL || 'qwen/qwen3.8-27b'];
    for (const model of models) {
      try {
        const c = await groq.chat.completions.create({
          model, temperature: prev ? 0.8 : 0.5, max_tokens: 5000, response_format: { type: 'json_object' },
          reasoning_effort: model.startsWith('openai/') ? 'low' : 'none',
          messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `LANGUAGE: ${i.lang}\nVIEWS: ${views.join(', ')}\n\n${answersForAi(i).slice(0, 16000)}` }],
        } as any) as any;
        const data = normalize(JSON.parse(c.choices[0]?.message?.content ?? '{}'), company, views, features);
        if (!data.heroTitle || data.services.length < 2) throw new Error('thin');
        const fresh = await readIntakes(); const x = fresh.find((y) => y.id === i.id);
        if (!x) return res.status(404).json({ error: 'not_found' });
        (x as any).preview = { at: new Date().toISOString(), model, data, count: (prev?.count ?? 0) + 1 };
        await writeIntakes(fresh);
        return res.json({ preview: pub((x as any).preview) });
      } catch (e) { console.warn(`[preview] ${model} failed`, (e as Error).message); }
    }
    return res.status(502).json({ error: 'ai_failed' });
  });
}
