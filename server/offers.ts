import { styleFor, styleSummary } from './styles.js';
// Offers ("Teklif"): admin-only planning (AI pricing/scope suggestions + Q&A about the plan), then a priced
// offer sent to the client as its own private link (/:lang/<offer-slug>/:token). The client can read it, ask
// questions (two-way thread) and accept. Payment is marked manually by the owner until Stripe exists.
// Storage: data/offers.json (atomic writes). Contact details (e-mail/phone/address) are NOT sent to the model.
import type { Express, Request, Response } from 'express';
import type Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { answersForAi, readIntakes } from './intake.js';
import { OFFER_SLUG } from '../src/lib/routes.js';
import { buildContract, contractLangFor, contractPlain, marketLang, PROVIDER, type ContractDoc } from './contract.js';
import { ensureProject, projectPath } from './projects.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(__dirname, '../data/offers.json');
const LANGS = ['tr', 'en', 'de', 'el'] as const;
type L = (typeof LANGS)[number];
const CURRENCIES = ['EUR', 'TRY', 'USD'] as const;
const DAY = 24 * 3600e3;

export interface OfferItem { title: string; detail: string; amount: number }
export interface OfferMsg { id: string; from: 'client' | 'owner'; text: string; at: string }
export interface OfferBilling {
  customerId?: string; subscriptionId?: string; subStatus?: string;
  firstPaidAt?: string; firstAmount?: number; restAmount?: number; restUrl?: string; restPaidAt?: string;
  lastInvoiceAt?: string; paymentFailedAt?: string; events?: string[];
  payRequestedAt?: string;   // payment opened (automatically after signing, or by the owner)
  invoices?: { url: string; number: string; at: string }[];   // Stripe invoices (hosted page)
  test?: boolean;            // paid with the TEST payment (dev only, no money)
}
export interface Offer {
  id: string; token: string; intakeId: string | null; requestId: string | null;
  lang: L; currency: (typeof CURRENCIES)[number]; company: string; contact: string;
  // admin-only planning
  ownerNotes: string; plan: { at: string; model: string; data: unknown } | null; planChat: { role: 'owner' | 'ai'; text: string; at: string }[];
  // what the client sees
  title: string; message: string; items: OfferItem[];
  depositPct: number; installments: number; monthly: number; monthlyIncludes: string; validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  messages: OfferMsg[]; unreadOwner: number;
  createdAt: string; sentAt: string | null; viewedAt: string | null; acceptedAt: string | null; acceptedName: string | null;
  paidAt: string | null; cancelledAt: string | null;
  market?: string;   // client country from the intake (decides the contract language)
  billing?: OfferBilling;
  projectToken?: string;   // live project page, created when the first payment is in
  showcase?: { allow: boolean; at: string } | null;   // client's choice (before the contract): may the project be shown as a reference?
  portal?: boolean | null;  // live project page for this offer? null/undefined = automatic (setup > 1000 EUR)
  contract?: { doc: ContractDoc; hash: string; signedAt: string; signer: string; role: string; company: string; address: string; business: true; ipHash: string; ua: string; ownerSignedAt: string } | null;
}

export const readOffers = (): Offer[] => read();
export const writeOffers = (all: Offer[]) => write(all);
const read = (): Offer[] => { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { return []; } };
const write = (all: Offer[]) => {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  const tmp = `${STORE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(all, null, 2));
  fs.renameSync(tmp, STORE);
};

const clean = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, n);
const money = (v: unknown) => { const x = Math.round(Number(v) * 100) / 100; return Number.isFinite(x) && x >= 0 && x <= 10_000_000 ? x : 0; };
const intIn = (v: unknown, lo: number, hi: number, dflt: number) => { const x = Math.round(Number(v)); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt; };
export const setupTotal = (o: Offer) => o.items.reduce((s, it) => s + it.amount, 0);
export const testInvoiceNo = (o: Offer) => `TEST-${(o.billing?.firstPaidAt ?? '').slice(0, 10).replace(/-/g, '')}-${o.id.slice(0, 6).toUpperCase()}`;

/** Guard before the link goes out: the texts must be in the client's language (owner's rule: never Turkish to a German client). */
export function langMismatch(o: Offer): string | null {
  const text = [o.title, o.message, o.monthlyIncludes, ...o.items.flatMap((i) => [i.title, i.detail])].join(' ');
  const turkish = (text.match(/[ğışİĞŞ]/g) ?? []).length + (text.match(/\b(ve|için|ile|kurulumu|destek|aylık|bakım)\b/gi) ?? []).length;
  const greek = (text.match(/[α-ωΑ-Ω]/g) ?? []).length;
  if (o.lang !== 'tr' && turkish >= 2) return 'Teklif metinleri Türkçe görünüyor ama müşteri dili başka. Önce "Müşterinin diline çevir"e basıp kontrol et, sonra linki etkinleştir.';
  if (o.lang === 'el' && greek < 5) return 'Müşteri dili Yunanca ama metinler Yunanca görünmüyor. Önce "Müşterinin diline çevir"e bas.';
  if (o.lang !== 'el' && greek >= 5) return 'Metinlerde Yunanca var ama müşteri dili Yunanca değil. Dili veya metinleri kontrol et.';
  return null;
}

/** Stripe is used only once a secret key and the public site address are configured. */
export const stripeOn = () => !!process.env.STRIPE_SECRET_KEY && !!process.env.PUBLIC_URL;
/** Without Stripe, a clearly marked TEST payment lets the owner try the whole flow. Never in production. */
export const testPayOn = () => !stripeOn() && process.env.NODE_ENV !== 'production';
/** First payment in → the live project page opens (once). */
/** Live project page only for the bigger plans (owner, 2026-11-17): above 1000 EUR setup or set by the owner (panel / CRM / automation). */
export const portalOn = (o: Offer) => o.portal ?? setupTotal(o) > 1000;
export const openProject = (o: Offer) => {
  if (o.projectToken || !portalOn(o)) return;
  o.projectToken = ensureProject({ id: o.id, lang: o.lang as 'tr' | 'en' | 'de' | 'el', company: o.company, contact: o.contact, title: o.title });
  void mailProject(o);
};
const PROJECT_MAIL: Record<string, { s: string; b: (n: string, l: string) => string }> = {
  de: { s: 'Ihre Projektseite ist bereit', b: (n, l) => `Hallo ${n},\n\nvielen Dank für Ihre Zahlung. Ihre persönliche Projektseite ist jetzt bereit: Dort verfolgen Sie Ihr Projekt Schritt für Schritt, schreiben Nachrichten und fügen Dateien hinzu.\n\n${l}\n\nChioutworks` },
  tr: { s: 'Proje sayfanız hazır', b: (n, l) => `Merhaba ${n},\n\nödemeniz için teşekkürler. Size özel proje sayfanız hazır: projenizi adım adım takip edebilir, mesaj yazabilir ve dosya ekleyebilirsiniz.\n\n${l}\n\nChioutworks` },
  el: { s: 'Η σελίδα του έργου σας είναι έτοιμη', b: (n, l) => `Γεια σας ${n},\n\nευχαριστώ για την πληρωμή. Η προσωπική σελίδα του έργου σας είναι έτοιμη: εκεί παρακολουθείτε το έργο βήμα βήμα, γράφετε μηνύματα και προσθέτετε αρχεία.\n\n${l}\n\nChioutworks` },
  en: { s: 'Your project page is ready', b: (n, l) => `Hello ${n},\n\nthank you for your payment. Your personal project page is ready: follow your project step by step, write messages and add files there.\n\n${l}\n\nChioutworks` },
};
/** Project link by e-mail in the client's language (works once a verified sender domain is configured; skipped quietly otherwise). */
async function mailProject(o: Offer) {
  const key = process.env.RESEND_API_KEY; const from = process.env.DEMO_EMAIL_FROM; const origin = (process.env.PUBLIC_URL ?? '').replace(/\/$/, '');
  if (!key || !from || !origin || !o.projectToken) return;
  const i = o.intakeId ? readIntakes().find((x) => x.id === o.intakeId) : undefined;
  const to = typeof i?.answers.meta_email === 'string' ? i.answers.meta_email.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return;
  const tpl = PROJECT_MAIL[o.lang] ?? PROJECT_MAIL.en;
  await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject: tpl.s, text: tpl.b((o.contact || '').split(' ')[0], origin + projectPath(o.lang as 'tr' | 'en' | 'de' | 'el', o.projectToken)) }) })
    .then((r) => { if (!r.ok) console.error('[offers] project mail failed', r.status); }).catch(() => {});
}
/** Charged at the first checkout: the deposit if one is set, otherwise the whole setup fee (2 decimals). */
export const dueNow = (o: Offer) => (o.depositPct > 0 && o.depositPct < 100 ? Math.round(setupTotal(o) * o.depositPct) / 100 : setupTotal(o));
const expired = (o: Offer) => !!o.validUntil && o.status === 'sent' && Date.parse(`${o.validUntil}T23:59:59`) < Date.now();
const pathOf = (o: Offer) => `/${o.lang}/${OFFER_SLUG[o.lang]}/${o.token}`;

// ── AI planning ─────────────────────────────────────────────────────────────
const PLAN_SYSTEM = `You help a one-person studio owner (Chioutworks: websites, automations, AI assistants for small businesses in DE/TR/GR) plan scope and price BEFORE sending an offer.
The owner builds with AI coding assistants (Claude) and this stack: React + Vite or Next.js, Vercel (functions in the Frankfurt region), Supabase (EU / Frankfurt), Stripe, Resend, Groq/Gemini. Automations are built as CUSTOM CODE (TypeScript/Node workers, scheduled jobs, webhooks, small APIs), running either on the owner's own server (a Hostinger VPS that can also run a self-hosted open-source AI model 24/7, so no per-request AI fees) or on Modal (serverless jobs, pay per use). The tooling is chosen per project: prefer custom code or a serverless job platform (like Modal); do NOT default to Make.com, Zapier or n8n. n8n is an option only when it clearly fits (e.g. the client wants a visual tool), noting that visual flows need ongoing maintenance. For EU/German clients prefer EU hosting and say where data is stored. Delivery is faster than a classic agency, but the owner's time, support and running costs (VPS, AI usage, e-mail) are real.
You get the client's answers, an earlier analysis, the client's stated budget (if any) and the owner's own notes. Answer in TURKISH for the owner.

RULES
- Use only facts from the input. Anything inferred starts with "Varsayım: ".
- Prices are SUGGESTIONS for the owner, in the given currency, realistic for small businesses in the client's market. Never promise anything to the client.
- Compare the client's budget honestly with the requested scope. If it does not fit, say so plainly and show how to make it fit (smaller first version, phases, higher setup + lower monthly, or the reverse).
- Prefer the simplest solution that solves the real problem; list concrete ways to save effort and running cost.
- If the client's budget is too small for what they asked, say clearly which parts would be missing at that budget and what the smallest useful first version is.
- List small, cheap things that make the client happy (fast wins, clear communication).
- Running costs (hosting, AI usage, e-mail) should be covered by the monthly fee.
- Hosting/providers are chosen per project (e.g. Vercel, Supabase, Modal with Frankfurt region; or servers in Germany/EU such as Hetzner, IONOS, Hostinger VPS). If the client requires everything in Germany with an EU company, use an EU/German server. For transparency (GDPR), list each external provider used, its company country and where data is stored, one short line each.
- suggestedItems are shown to the CLIENT: write titles and details in plain, non-technical language in the client's language (what they get, not which tool). If a product name matters (e.g. Stripe for payments), put it in brackets after a plain description. The options/scope fields are for the owner and may stay technical.
- Notifications/messaging: prefer a Telegram bot (free, set up in minutes, no per-message cost). WhatsApp only if the client asks: the official route is the Meta WhatsApp Business Platform (business verification, per-conversation fees, longer setup); unofficial gateways (e.g. Evolution API) are cheaper but risk the number being banned, say so. Never promise SMS.
- OWNER'S PRICE PLANS (2026-11-17), use them for the options:
  1) SIMPLE WEBSITE (cheapest option): a plain multi-page website (usually up to ~5 pages), no automation, no admin panel. Setup up to 1000 EUR
     (without any admin panel/login: 600–800 EUR), fixed monthly 45–60 EUR (hosting, maintenance, small updates). NO live project page for this plan.
     (Market reference for the owner only: many freelancers charge 250–350 EUR + 55–75 EUR/month; the owner deliberately uses a fixed, transparent price.)
  2) WEBSITE + PANEL: website with an admin panel and/or an extra simple CRM, or a client login area. Setup above 1000 EUR. Includes the live project page.
  3) AUTOMATION: small to larger automations priced by the answers (what should run by itself, which tools, how many people). Includes the live project page.
  A client may want ONLY an automation, ONLY a simple CRM, or ONLY an own app / login panel (no website): then the options are built around that, not around a website.
- Big add-on systems (staff/team scheduling, customer accounts/login, online payment, self-service booking, automatic quotes) are separate systems: treat each as its own option or line item and say clearly that it raises the price noticeably (roughly +50–70% on top of website + automation, depending on scope). Suggest leaving them for a later phase if the budget is tight.
- VAT: the owner is a German small business (Kleinunternehmer, §19 UStG). No VAT is charged, so all suggested prices are final amounts.
- Legal texts: follow the client's answer (legal_texts). If they want a lawyer, add a line item for it: the lawyer's fee (set by the lawyer, to be confirmed) plus a small coordination share of about 10% — the imprint is usually cheap, privacy policy and terms often cost a few hundred euros depending on the lawyer; if they chose the AI-assisted template, add a small line item and note that it is not a lawyer's review. If they chose the online lawyer package with setup (package_setup), add a small setup line item and mention the monthly package cost is paid by the client (e.g. eRecht24); if they chose package_link, add no line item, just note that the owner will send the provider link. If an AI assistant is included, include the EU AI Act transparency notice (users are told they talk to an AI).

Return ONE JSON object with exactly these keys:
{
 "summary": string (2-3 sentences),
 "clientBudget": string|null (what the client said about budget, verbatim meaning),
 "budgetFit": "fits"|"tight"|"over"|"unknown",
 "budgetReason": string,
 "options": [ { "name": string, "scope": string[], "setup": number, "monthly": number, "effortDays": number, "why": string } ] (2 or 3 options: simplest first, recommended, full),
 "recommended": string (name of the recommended option and one-sentence reason),
 "savings": string[],
 "delighters": string[],
 "risks": string[],
 "askClient": string[] (what to clarify before sending the offer),
 "suggestedItems": [ { "title": string, "detail": string, "amount": number } ] (line items for the recommended option; amounts add up to its setup),
 "suggestedPayment": { "depositPct": number, "installments": number, "monthly": number, "monthlyIncludes": string }
}`;

const arr = (v: unknown, n = 15): string[] => (Array.isArray(v) ? v : []).map((x) => clean(x, 500)).filter(Boolean).slice(0, n);
function normalizePlan(o: any) {
  return {
    summary: clean(o?.summary, 1200),
    clientBudget: o?.clientBudget ? clean(o.clientBudget, 300) : null,
    budgetFit: ['fits', 'tight', 'over', 'unknown'].includes(o?.budgetFit) ? o.budgetFit : 'unknown',
    budgetReason: clean(o?.budgetReason, 800),
    options: (Array.isArray(o?.options) ? o.options : []).slice(0, 3).map((x: any) => ({
      name: clean(x?.name, 80), scope: arr(x?.scope, 12), setup: money(x?.setup), monthly: money(x?.monthly),
      effortDays: intIn(x?.effortDays, 0, 365, 0), why: clean(x?.why, 500),
    })),
    recommended: clean(o?.recommended, 500),
    savings: arr(o?.savings), delighters: arr(o?.delighters), risks: arr(o?.risks), askClient: arr(o?.askClient),
    suggestedItems: (Array.isArray(o?.suggestedItems) ? o.suggestedItems : []).slice(0, 20).map((x: any) => ({
      title: clean(x?.title, 120), detail: clean(x?.detail, 400), amount: money(x?.amount),
    })).filter((x: OfferItem) => x.title),
    suggestedPayment: {
      depositPct: intIn(o?.suggestedPayment?.depositPct, 0, 100, 30), installments: intIn(o?.suggestedPayment?.installments, 1, 12, 2),
      monthly: money(o?.suggestedPayment?.monthly), monthlyIncludes: clean(o?.suggestedPayment?.monthlyIncludes, 400),
    },
  };
}

interface Deps {
  requireAdmin: (req: Request, res: Response) => boolean;
  getGroq: () => Groq | null;
  readQuotes: () => any[];
  rateSkip?: (req: Request) => boolean;
}

/** Style the client picked on the "choose my style" page, for the AI planner (owner, 2026-11-17). */
const styleLine = (o: Offer) => { const st = o.intakeId ? styleSummary(styleFor([`intake:${o.intakeId}`])) : ''; return st ? `\n\nCLIENT'S STYLE CHOICE (use it for design-related items and wording): ${st}` : ''; };

export function registerOffers(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });
  const msgLimiter = rateLimit({ windowMs: 10 * 60_000, max: 20, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });

  const clientInput = (o: Offer): string => {
    let s = '';
    if (o.intakeId) {
      const i = readIntakes().find((x) => x.id === o.intakeId);
      if (i) {
        s += `CLIENT ANSWERS (market ${i.market}, sector ${i.sector})\n${answersForAi(i)}`;
        const a = (i.analysis as { data?: unknown } | undefined)?.data;
        if (a) s += `\n\nEARLIER ANALYSIS\n${JSON.stringify(a)}`;
      }
    } else if (o.requestId) {
      const r = d.readQuotes().find((x) => x.id === o.requestId);
      if (r) {
        s += `CLIENT REQUEST\n${JSON.stringify({ kind: r.kind, business: r.business, message: r.message, language: r.lang, modules: r.modules, roiCalc: r.roiCalc?.results })}`;
        if (r.analysis?.data) s += `\n\nEARLIER ANALYSIS\n${JSON.stringify(r.analysis.data)}`;
      }
    }
    return `${s}\n\nCLIENT LANGUAGE (write suggestedItems and suggestedPayment.monthlyIncludes in this language; everything else in Turkish): ${o.lang}\nCURRENCY: ${o.currency}\nOWNER NOTES: ${o.ownerNotes || '(none)'}`.slice(0, 26000);
  };

  async function ask(groq: Groq, messages: { role: 'system' | 'user' | 'assistant'; content: string }[], json: boolean): Promise<{ model: string; content: string }> {
    const models = [process.env.GROQ_MODEL || 'openai/gpt-oss-120b', process.env.GROQ_FALLBACK_MODEL || 'qwen/qwen3.8-27b'];
    let last: unknown;
    for (const model of models) {
      try {
        const c = await groq.chat.completions.create({
          model, temperature: 0.3, max_tokens: 4000, ...(json ? { response_format: { type: 'json_object' } } : {}),
          reasoning_effort: model.startsWith('openai/') ? 'low' : 'none', messages,
        } as any) as any;
        const content = String(c.choices[0]?.message?.content ?? '').trim();
        if (!content) throw new Error('empty');
        return { model, content };
      } catch (e) { last = e; console.warn(`[offers] ${model} failed`, (e as any)?.status ?? (e as any)?.message); }
    }
    throw last;
  }

  // ── Admin ──
  const brief = (o: Offer) => ({
    id: o.id, intakeId: o.intakeId, requestId: o.requestId, lang: o.lang, currency: o.currency, company: o.company, contact: o.contact,
    title: o.title, status: o.status, total: setupTotal(o), monthly: o.monthly, createdAt: o.createdAt, sentAt: o.sentAt, viewedAt: o.viewedAt,
    acceptedAt: o.acceptedAt, paidAt: o.paidAt, cancelledAt: o.cancelledAt, unreadOwner: o.unreadOwner, hasPlan: !!o.plan, contractAt: o.contract?.signedAt ?? null,
    expired: expired(o), path: pathOf(o),
  });
  const full = (o: Offer) => ({ ...brief(o), ownerNotes: o.ownerNotes, plan: o.plan, planChat: o.planChat, message: o.message, items: o.items,
    depositPct: o.depositPct, installments: o.installments, monthlyIncludes: o.monthlyIncludes, validUntil: o.validUntil,
    messages: o.messages, acceptedName: o.acceptedName,
    contract: o.contract ? { signedAt: o.contract.signedAt, signer: o.contract.signer, role: o.contract.role, company: o.contract.company, hash: o.contract.hash, lang: o.contract.doc.lang } : null, contractLang: contractLangFor(o.market, o.lang),
    project: o.projectToken ? projectPath(o.lang as 'tr' | 'en' | 'de' | 'el', o.projectToken) : null,
    market: o.market ?? null, marketLang: marketLang(o.market), portal: o.portal ?? null, portalAuto: setupTotal(o) > 1000, showcase: o.showcase ?? null,
    billing: { on: stripeOn(), test: testPayOn(), payRequestedAt: o.billing?.payRequestedAt ?? null, testPaid: !!o.billing?.test, due: dueNow(o), rest: Math.max(0, Math.round((setupTotal(o) - dueNow(o)) * 100) / 100), ...(o.billing ? { customer: !!o.billing.customerId, subStatus: o.billing.subStatus ?? null, firstPaidAt: o.billing.firstPaidAt ?? null, restUrl: o.billing.restUrl ?? null, restPaidAt: o.billing.restPaidAt ?? null, paymentFailedAt: o.billing.paymentFailedAt ?? null, lastInvoiceAt: o.billing.lastInvoiceAt ?? null } : {}) } });

  app.post('/api/admin/offers', (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const intakeId = clean(req.body?.intakeId, 64) || null; const requestId = clean(req.body?.requestId, 64) || null;
    let lang: L = 'tr'; let company = ''; let contact = ''; let currency: Offer['currency'] = 'EUR'; let market = '';
    if (intakeId) {
      const i = readIntakes().find((x) => x.id === intakeId);
      if (!i) return res.status(404).json({ error: 'not_found' });
      lang = i.lang; currency = i.market === 'TR' ? 'TRY' : 'EUR'; market = i.market;
      company = clean(i.answers.meta_company, 120) || i.prefill.company; contact = clean(i.answers.meta_contact, 120) || i.prefill.contact;
    } else if (requestId) {
      const r = d.readQuotes().find((x) => x.id === requestId);
      if (!r) return res.status(404).json({ error: 'not_found' });
      lang = (LANGS as readonly string[]).includes(r.lang) ? r.lang : 'en'; company = clean(r.business, 120); contact = clean(r.name, 120);
    } else return res.status(400).json({ error: 'bad_request' });
    const all = read();
    const existing = all.find((x) => !x.cancelledAt && ((intakeId && x.intakeId === intakeId) || (requestId && x.requestId === requestId)));
    if (existing) return res.json({ offer: brief(existing), existed: true });
    const now = new Date();
    const o: Offer = {
      id: crypto.randomUUID(), token: crypto.randomBytes(18).toString('base64url'), intakeId, requestId, lang, currency, company, contact, market,
      ownerNotes: '', plan: null, planChat: [], title: '', message: '', items: [], depositPct: 30, installments: 2, monthly: 0, monthlyIncludes: '',
      validUntil: new Date(now.getTime() + 30 * DAY).toISOString().slice(0, 10), status: 'draft', messages: [], unreadOwner: 0,
      createdAt: now.toISOString(), sentAt: null, viewedAt: null, acceptedAt: null, acceptedName: null, paidAt: null, cancelledAt: null,
    };
    all.push(o); write(all);
    return res.json({ offer: brief(o) });
  });

  app.get('/api/admin/offers', (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    return res.json({ offers: read().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(brief) });
  });

  app.get('/api/admin/offers/:id', (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const all = read(); const o = all.find((x) => x.id === req.params.id);
    if (!o) return res.status(404).json({ error: 'not_found' });
    if (o.unreadOwner) { o.unreadOwner = 0; write(all); }
    return res.json({ offer: full(o) });
  });

  // Save draft fields, or run an action: send | cancel | paid | unpaid | reopen
  app.patch('/api/admin/offers/:id', (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const all = read(); const o = all.find((x) => x.id === req.params.id);
    if (!o) return res.status(404).json({ error: 'not_found' });
    const b = req.body ?? {};
    if (typeof b.ownerNotes === 'string') o.ownerNotes = clean(b.ownerNotes, 4000);
    if (o.status === 'draft' || o.status === 'sent') {
      if (typeof b.title === 'string') o.title = clean(b.title, 160);
      if (typeof b.message === 'string') o.message = clean(b.message, 4000);
      if (Array.isArray(b.items)) o.items = b.items.slice(0, 30).map((x: any) => ({ title: clean(x?.title, 120), detail: clean(x?.detail, 400), amount: money(x?.amount) })).filter((x: OfferItem) => x.title);
      if (b.depositPct !== undefined) o.depositPct = intIn(b.depositPct, 0, 100, o.depositPct);
      if (b.installments !== undefined) o.installments = intIn(b.installments, 1, 12, o.installments);
      if (b.monthly !== undefined) o.monthly = money(b.monthly);
      if (typeof b.monthlyIncludes === 'string') o.monthlyIncludes = clean(b.monthlyIncludes, 600);
      if (typeof b.validUntil === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.validUntil)) o.validUntil = b.validUntil;
      if ((CURRENCIES as readonly string[]).includes(b.currency)) o.currency = b.currency;
      if ((LANGS as readonly string[]).includes(b.lang)) o.lang = b.lang;
      if ('portal' in b) o.portal = b.portal === true ? true : b.portal === false ? false : null;
    }
    const now = new Date().toISOString();
    switch (b.action) {
      case 'send': {
        if (!o.items.length) return res.status(422).json({ error: 'no_items', message: 'Önce en az bir kalem ekleyin.' });
        const wrong = langMismatch(o);
        if (wrong) return res.status(422).json({ error: 'wrong_language', message: wrong });
      }
        o.status = 'sent'; o.sentAt = o.sentAt ?? now; o.cancelledAt = null; break;
      case 'cancel': o.cancelledAt = now; break;
      case 'reopen': o.cancelledAt = null; if (o.status === 'declined') o.status = 'sent'; break;
      case 'paid': if (o.status !== 'accepted') return res.status(409).json({ error: 'not_accepted', message: 'Teklif henüz kabul edilmedi.' }); o.paidAt = now; openProject(o); break;
      case 'unpaid': o.paidAt = null; break;
      case 'payreq':
        if (o.status !== 'accepted' || !o.contract) return res.status(409).json({ error: 'not_ready', message: 'Önce teklif kabul edilmeli ve sözleşme imzalanmalı.' });
        (o.billing ??= {}).payRequestedAt = now; break;
    }
    write(all);
    return res.json({ offer: full(o) });
  });

  app.delete('/api/admin/offers/:id', (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const all = read(); const n = all.length;
    const rest = all.filter((x) => x.id !== req.params.id);
    if (rest.length === n) return res.status(404).json({ error: 'not_found' });
    write(rest); return res.json({ ok: true });
  });

  app.post('/api/admin/offers/:id/plan', async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const groq = d.getGroq();
    if (!groq) return res.status(503).json({ error: 'ai_unavailable', message: 'GROQ_API_KEY tanımlı değil.' });
    const all = read(); const o = all.find((x) => x.id === req.params.id);
    if (!o) return res.status(404).json({ error: 'not_found' });
    if (typeof req.body?.ownerNotes === 'string') o.ownerNotes = clean(req.body.ownerNotes, 4000);
    try {
      const r = await ask(groq, [{ role: 'system', content: PLAN_SYSTEM }, { role: 'user', content: clientInput(o) + styleLine(o) }], true);
      const data = normalizePlan(JSON.parse(r.content));
      if (!data.summary) throw new Error('empty');
      const fresh = read(); const x = fresh.find((y) => y.id === o.id);
      if (!x) return res.status(404).json({ error: 'not_found' });
      x.ownerNotes = o.ownerNotes; x.plan = { at: new Date().toISOString(), model: r.model, data }; x.planChat = [];
      write(fresh);
      return res.json({ offer: full(x) });
    } catch (e) {
      console.error('[offers] plan failed', (e as any)?.message);
      return res.status(502).json({ error: 'ai_failed', message: 'Plan önerisi şu an üretilemedi, tekrar deneyin.' });
    }
  });

  // Owner writes in Turkish → client's language; or shows the client-language texts / client messages in Turkish (not saved).
  app.post('/api/admin/offers/:id/translate', async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const groq = d.getGroq();
    if (!groq) return res.status(503).json({ error: 'ai_unavailable', message: 'GROQ_API_KEY tanımlı değil.' });
    const o = read().find((x) => x.id === req.params.id);
    if (!o) return res.status(404).json({ error: 'not_found' });
    const toClient = req.body?.target !== 'tr';
    const target = toClient ? ({ tr: 'Turkish', en: 'English', de: 'German', el: 'Greek' } as Record<string, string>)[o.lang] ?? 'English' : 'Turkish';
    const src = req.body?.fields ?? {};
    const input = {
      title: clean(src.title ?? o.title, 160), message: clean(src.message ?? o.message, 4000), monthlyIncludes: clean(src.monthlyIncludes ?? o.monthlyIncludes, 600),
      items: (Array.isArray(src.items) ? src.items : o.items).slice(0, 30).map((x: any) => ({ title: clean(x?.title, 120), detail: clean(x?.detail, 400) })),
      clientMessages: toClient ? [] : o.messages.filter((m) => m.from === 'client').slice(-20).map((m) => ({ id: m.id, text: clean(m.text, 2000) })),
    };
    try {
      const r = await ask(groq, [
        { role: 'system', content: `Translate a small-business offer for a web/automation service into ${target}. Natural, professional business wording for SMEs; keep it short and clear.
Keep amounts, numbers, e-mail addresses, domains and product/brand names (Vercel, Supabase, Stripe, Telegram, WhatsApp, Google, Resend) unchanged. Do not add or remove content.
Return ONE JSON object with exactly the same keys and array lengths as the input: { "title", "message", "monthlyIncludes", "items": [{ "title", "detail" }], "clientMessages": [{ "id", "text" }] }.` },
        { role: 'user', content: JSON.stringify(input) },
      ], true);
      const j = JSON.parse(r.content || '{}');
      const out = {
        title: clean(j.title, 160), message: clean(j.message, 4000), monthlyIncludes: clean(j.monthlyIncludes, 600),
        items: input.items.map((it: { title: string; detail: string }, i: number) => ({ title: clean(j.items?.[i]?.title, 120) || it.title, detail: clean(j.items?.[i]?.detail, 400) })),
        clientMessages: Array.isArray(j.clientMessages) ? j.clientMessages.map((m: any) => ({ id: clean(m?.id, 40), text: clean(m?.text, 2000) })) : [],
      };
      return res.json({ target: toClient ? o.lang : 'tr', ...out });
    } catch (e) {
      console.error('[offers] translate failed', (e as any)?.message);
      return res.status(502).json({ error: 'ai_failed', message: 'Çeviri şu an yapılamadı, tekrar deneyin.' });
    }
  });

  // Owner asks a follow-up question about the plan ("ayda 30 € ile yapılabilir mi?")
  app.post('/api/admin/offers/:id/plan-chat', async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const groq = d.getGroq();
    if (!groq) return res.status(503).json({ error: 'ai_unavailable', message: 'GROQ_API_KEY tanımlı değil.' });
    const q = clean(req.body?.text, 2000);
    if (!q) return res.status(400).json({ error: 'bad_request' });
    const all = read(); const o = all.find((x) => x.id === req.params.id);
    if (!o) return res.status(404).json({ error: 'not_found' });
    const history = o.planChat.slice(-12).map((m) => ({ role: (m.role === 'owner' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text }));
    try {
      const r = await ask(groq, [
        { role: 'system', content: `${PLAN_SYSTEM.split('Return ONE JSON')[0]}\nNow answer the owner's follow-up questions in TURKISH, briefly and concretely (plain text, max ~12 lines). Context:\n${clientInput(o)}\n\nCURRENT PLAN\n${JSON.stringify(o.plan?.data ?? null)}\n\nCURRENT OFFER DRAFT\n${JSON.stringify({ items: o.items, depositPct: o.depositPct, installments: o.installments, monthly: o.monthly })}` },
        ...history, { role: 'user', content: q },
      ], false);
      const fresh = read(); const x = fresh.find((y) => y.id === o.id);
      if (!x) return res.status(404).json({ error: 'not_found' });
      const now = new Date().toISOString();
      x.planChat.push({ role: 'owner', text: q, at: now }, { role: 'ai', text: clean(r.content, 6000), at: now });
      x.planChat = x.planChat.slice(-40);
      write(fresh);
      return res.json({ offer: full(x) });
    } catch (e) {
      console.error('[offers] plan chat failed', (e as any)?.message);
      return res.status(502).json({ error: 'ai_failed', message: 'Cevap şu an üretilemedi, tekrar deneyin.' });
    }
  });

  app.post('/api/admin/offers/:id/messages', (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const text = clean(req.body?.text, 4000);
    if (!text) return res.status(400).json({ error: 'bad_request' });
    const all = read(); const o = all.find((x) => x.id === req.params.id);
    if (!o) return res.status(404).json({ error: 'not_found' });
    o.messages.push({ id: crypto.randomUUID(), from: 'owner', text, at: new Date().toISOString() });
    o.messages = o.messages.slice(-200);
    write(all);
    return res.json({ offer: full(o) });
  });

  // ── Client (private link) ──
  const live = (token: string) => {
    const all = read(); const o = all.find((x) => x.token === token);
    return { all, o: o && !o.cancelledAt && o.status !== 'draft' ? o : null };
  };
  const pub = (o: Offer) => ({
    lang: o.lang, currency: o.currency, company: o.company, contact: o.contact, title: o.title, message: o.message, items: o.items,
    total: setupTotal(o), depositPct: o.depositPct, installments: o.installments, monthly: o.monthly, monthlyIncludes: o.monthlyIncludes,
    validUntil: o.validUntil, status: o.status, expired: expired(o), acceptedAt: o.acceptedAt, paid: !!o.paidAt,
    contractSigned: !!o.contract, contractAt: o.contract?.signedAt ?? null, showcase: o.showcase ?? null, contractLang: contractLangFor(o.market, o.lang),
    project: o.projectToken ? projectPath(o.lang as 'tr' | 'en' | 'de' | 'el', o.projectToken) : null,
    pay: { ready: (stripeOn() || testPayOn()) && !!o.billing?.payRequestedAt && !!o.contract && !o.billing?.firstPaidAt && !o.paidAt, test: testPayOn(), firstPaid: !!o.billing?.firstPaidAt, now: dueNow(o), monthly: o.monthly,
      restUrl: o.billing?.restUrl && !o.billing.restPaidAt ? o.billing.restUrl : null, portal: stripeOn() && !!o.billing?.customerId,
      invoices: [...(o.billing?.invoices ?? []).map((x) => ({ url: x.url, number: x.number, test: false })), ...(o.billing?.test && o.billing.firstPaidAt ? [{ url: `/api/offer/${o.token}/test-invoice`, number: testInvoiceNo(o), test: true }] : [])] },
    messages: o.messages.map((m) => ({ id: m.id, from: m.from, text: m.text, at: m.at })),
  });

  app.get('/api/offer/:token', limiter, (req, res) => {
    const { all, o } = live(String(req.params.token));
    if (!o) return res.status(404).json({ error: 'not_found' });
    if (!o.viewedAt) { o.viewedAt = new Date().toISOString(); write(all); }
    res.set('Cache-Control', 'no-store');
    return res.json(pub(o));
  });

  app.post('/api/offer/:token/accept', limiter, (req, res) => {
    const { all, o } = live(String(req.params.token));
    if (!o) return res.status(404).json({ error: 'not_found' });
    if (o.status === 'accepted') return res.json(pub(o));
    if (o.status !== 'sent' || expired(o)) return res.status(409).json({ error: 'not_open' });
    const name = clean(req.body?.name, 120);
    if (!name || req.body?.confirm !== true) return res.status(400).json({ error: 'need_name' });
    o.status = 'accepted'; o.acceptedAt = new Date().toISOString(); o.acceptedName = name; o.unreadOwner += 1;
    write(all);
    console.log('[offers] offer accepted');
    return res.json(pub(o));
  });

  // ── Contract (after acceptance): preview → sign (simple e-signature with evidence) → printable copy ──
  const contractInput = (o: Offer, client: { company: string; address: string; signer: string; role: string }, date: string) => ({
    lang: contractLangFor(o.market, o.lang), currency: o.currency, items: o.items, total: setupTotal(o), depositPct: o.depositPct,
    installments: o.installments, monthly: o.monthly, monthlyIncludes: o.monthlyIncludes, client, date, showcase: o.showcase?.allow === true,
  });
  app.get('/api/offer/:token/contract', limiter, (req, res) => {
    const { o } = live(String(req.params.token));
    if (!o || o.status !== 'accepted') return res.status(404).json({ error: 'not_found' });
    res.set('Cache-Control', 'no-store');
    if (o.contract) return res.json({ signed: true, doc: o.contract.doc, signedAt: o.contract.signedAt, hash: o.contract.hash, showcase: o.showcase ?? null });
    // the reference question comes first; the contract is prepared after the client answered it
    if (!o.showcase) return res.json({ signed: false, needShowcase: true, lang: contractLangFor(o.market, o.lang) });
    const doc = buildContract(contractInput(o, { company: o.company, address: '', signer: o.acceptedName || o.contact, role: '' }, new Date().toISOString()));
    return res.json({ signed: false, doc, showcase: o.showcase, prefill: { company: o.company, signer: o.acceptedName || o.contact } });
  });
  app.post('/api/offer/:token/showcase', limiter, (req, res) => {
    const { all, o } = live(String(req.params.token));
    if (!o || o.status !== 'accepted') return res.status(404).json({ error: 'not_found' });
    if (o.contract) return res.status(409).json({ error: 'already_signed' });   // after signing only by writing (see clause)
    if (typeof req.body?.allow !== 'boolean') return res.status(400).json({ error: 'missing' });
    o.showcase = { allow: req.body.allow, at: new Date().toISOString() }; write(all);
    return res.json({ ok: true, showcase: o.showcase });
  });
  app.post('/api/offer/:token/sign', limiter, (req, res) => {
    const { all, o } = live(String(req.params.token));
    if (!o || o.status !== 'accepted') return res.status(404).json({ error: 'not_found' });
    if (o.contract) return res.json({ ok: true, signedAt: o.contract.signedAt, hash: o.contract.hash });
    const b = req.body ?? {};
    const client = { company: clean(b.company, 120), address: clean(b.address, 200), signer: clean(b.signer, 120), role: clean(b.role, 80) };
    if (!client.company || !client.address || !client.signer || b.business !== true || b.agree !== true) return res.status(400).json({ error: 'missing' });
    const now = new Date().toISOString();
    const doc = buildContract(contractInput(o, client, now));
    const hash = crypto.createHash('sha256').update(contractPlain(doc)).digest('hex');
    o.contract = { doc, hash, signedAt: now, ...client, business: true, ipHash: crypto.createHash('sha256').update(`${req.ip ?? ''}|chioutworks-contract`).digest('hex').slice(0, 32), ua: clean(req.get('user-agent'), 200), ownerSignedAt: o.sentAt ?? now };
    o.unreadOwner += 1;
    (o.billing ??= {}).payRequestedAt = o.billing.payRequestedAt ?? now;   // payment opens automatically after signing (owner's wish)
    write(all);
    console.log('[offers] contract signed');
    void mailSigned(o);
    return res.json({ ok: true, signedAt: now, hash });
  });
  // Signed contract by e-mail: to the client (address from the intake) and a short note to the owner.
  // Works only when a sender on a verified domain is configured (DEMO_EMAIL_FROM + RESEND_API_KEY + PUBLIC_URL); otherwise it is skipped quietly.
  const SIGNED_MAIL: Record<string, { s: string; b: (link: string) => string }> = {
    de: { s: 'Ihr unterzeichneter Vertrag', b: (l) => `Guten Tag,\n\nvielen Dank für Ihr Vertrauen. Ihren unterzeichneten Vertrag können Sie hier jederzeit ansehen und als PDF speichern:\n${l}\n\nDen Zahlungslink erhalten Sie separat.\n\nChioutworks` },
    tr: { s: 'İmzalı sözleşmeniz', b: (l) => `Merhaba,\n\ngüveniniz için teşekkürler. İmzalı sözleşmenizi buradan istediğiniz zaman görüntüleyip PDF olarak kaydedebilirsiniz:\n${l}\n\nÖdeme bağlantısı size ayrıca iletilecek.\n\nChioutworks` },
    el: { s: 'Η υπογεγραμμένη σύμβασή σας', b: (l) => `Καλησπέρα σας,\n\nευχαριστώ για την εμπιστοσύνη σας. Μπορείτε να δείτε την υπογεγραμμένη σύμβαση και να την αποθηκεύσετε ως PDF εδώ:\n${l}\n\nΤον σύνδεσμο πληρωμής θα τον λάβετε ξεχωριστά.\n\nChioutworks` },
    en: { s: 'Your signed agreement', b: (l) => `Hello,\n\nthank you for your trust. You can view your signed agreement and save it as a PDF here at any time:\n${l}\n\nThe payment link will be sent to you separately.\n\nChioutworks` },
  };
  async function mailSigned(o: Offer) {
    const key = process.env.RESEND_API_KEY; const from = process.env.DEMO_EMAIL_FROM; const origin = (process.env.PUBLIC_URL ?? '').replace(/\/$/, '');
    if (!key || !from || !origin || !o.contract) return;
    const intake = o.intakeId ? readIntakes().find((x) => x.id === o.intakeId) : undefined;
    const to = typeof intake?.answers.meta_email === 'string' ? intake.answers.meta_email.trim() : '';
    const send = (rcpt: string, subject: string, text: string) => fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [rcpt], subject, text }),
    }).then((r) => { if (!r.ok) console.error('[offers] Resend error', r.status); }).catch((e) => console.error('[offers] Resend request failed', (e as Error).message));
    const tpl = SIGNED_MAIL[o.contract.doc.lang] ?? SIGNED_MAIL.en;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) await send(to, tpl.s, tpl.b(`${origin}/api/offer/${encodeURIComponent(o.token)}/contract/view`));
    const owner = process.env.QUOTE_NOTIFY_EMAIL;
    if (owner) await send(owner, `Sözleşme imzalandı: ${o.contract.company}`, `${o.contract.signer} (${o.contract.company}) sözleşmeyi imzaladı.\nAdmin paneli → Teklifler.`);
  }
  const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] as string));
  const SIGNED: Record<string, { by: string; owner: string; client: string; print: string; evidence: string }> = {
    de: { by: 'Elektronisch unterzeichnet', owner: 'Auftragnehmer', client: 'Auftraggeber', print: 'Drucken / als PDF speichern', evidence: 'Prüfsumme (SHA-256) des unterzeichneten Textes' },
    tr: { by: 'Elektronik olarak imzalandı', owner: 'Hizmet veren', client: 'Müşteri', print: 'Yazdır / PDF olarak kaydet', evidence: 'İmzalanan metnin doğrulama özeti (SHA-256)' },
    el: { by: 'Υπογράφηκε ηλεκτρονικά', owner: 'Πάροχος', client: 'Πελάτης', print: 'Εκτύπωση / αποθήκευση ως PDF', evidence: 'Άθροισμα ελέγχου (SHA-256) του υπογεγραμμένου κειμένου' },
    en: { by: 'Signed electronically', owner: 'Provider', client: 'Client', print: 'Print / save as PDF', evidence: 'Checksum (SHA-256) of the signed text' },
  };
  const contractHtml = (o: Offer) => {
    const c = o.contract!; const d = c.doc; const t = SIGNED[d.lang];
    const when = (iso: string) => new Intl.DateTimeFormat({ de: 'de-DE', tr: 'tr-TR', el: 'el-GR', en: 'en-GB' }[d.lang], { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));
    return `<!doctype html><html lang="${d.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(d.title)}</title>
<style>body{font:15px/1.6 Georgia,serif;color:#111;max-width:760px;margin:32px auto;padding:0 20px}h1{font-size:22px}h2{font-size:16px;margin:22px 0 6px}p{margin:4px 0}.sig{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:32px}.sig div{border-top:1px solid #111;padding-top:8px;font-size:13px}.ev{margin-top:28px;font:11px/1.5 monospace;color:#555;word-break:break-all}button{margin:16px 0;padding:8px 14px}@media print{button{display:none}}</style></head><body>
<button onclick="print()">${esc(t.print)}</button><h1>${esc(d.title)}</h1>${d.parties.map((x) => `<p>${esc(x)}</p>`).join('')}
${d.sections.map((s) => `<h2>${esc(s.title)}</h2>${s.body.map((x) => `<p>${esc(x)}</p>`).join('')}`).join('')}
<p style="margin-top:20px">${esc(d.footer)}</p>
<div class="sig"><div><b>${esc(t.owner)}</b><br>${esc(PROVIDER.name)} · ${esc(PROVIDER.owner)}<br>${esc(t.by)}: ${esc(when(c.ownerSignedAt))}</div>
<div><b>${esc(t.client)}</b><br>${esc(c.company)} · ${esc(c.signer)}${c.role ? ` (${esc(c.role)})` : ''}<br>${esc(t.by)}: ${esc(when(c.signedAt))}</div></div>
<p class="ev">${esc(t.evidence)}: ${c.hash}</p></body></html>`;
  };
  app.get('/api/offer/:token/contract/view', limiter, (req, res) => {
    const { o } = live(String(req.params.token));
    if (!o?.contract) return res.status(404).send('not found');
    res.set('Cache-Control', 'no-store'); return res.type('html').send(contractHtml(o));
  });
  app.get('/api/admin/offers/:id/contract', (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const o = read().find((x) => x.id === req.params.id);
    if (!o?.contract) return res.status(404).send('not found');
    return res.type('html').send(contractHtml(o));
  });

  app.post('/api/offer/:token/messages', msgLimiter, (req, res) => {
    const { all, o } = live(String(req.params.token));
    if (!o) return res.status(404).json({ error: 'not_found' });
    const text = clean(req.body?.text, 2000);
    if (!text) return res.status(400).json({ error: 'bad_request' });
    if (o.messages.filter((m) => m.from === 'client').length >= 100) return res.status(429).json({ error: 'too_many' });
    o.messages.push({ id: crypto.randomUUID(), from: 'client', text, at: new Date().toISOString() });
    o.unreadOwner += 1;
    write(all);
    console.log('[offers] new client message');
    return res.json(pub(o));
  });
}
