// Stripe payments (INFRASTRUCTURE ONLY until the owner adds keys). Talks to the Stripe REST API with fetch: no extra package.
// Flow (owner's decision, 2026-11-14): after the contract is signed the client pays the setup fee (or the deposit) once;
// the monthly fee starts automatically two months later as a subscription. A remaining setup balance gets its own payment link.
// Nothing happens unless STRIPE_SECRET_KEY + PUBLIC_URL are set (test mode first: an sk_test_… key). Webhook: STRIPE_WEBHOOK_SECRET.
// The webhook route needs the RAW body: server/index.ts mounts express.raw() for /api/stripe/webhook before express.json().
// No card data ever touches this server: payment happens on Stripe's own checkout page.
import type { Express, Request, Response } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { readIntakes } from './intake.js';
import { offerPath } from '../src/lib/routes.js';
import { contractLangFor } from './contract.js';
import { dueNow, openProject, readOffers, setupTotal, stripeOn, testInvoiceNo, testPayOn, writeOffers, type Offer } from './offers.js';

const API = 'https://api.stripe.com/v1';
const FIRST_MONTHLY_AFTER_DAYS = 61;          // "monthly fee starts two months after the setup payment"
const LOCALE: Record<string, string> = { de: 'de', tr: 'tr', el: 'el', en: 'en' };

/** Stripe expects form encoding with bracket keys: a[b][0][c]=… */
function form(obj: Record<string, unknown>, prefix = '', out = new URLSearchParams()) {
  for (const [k, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(val)) val.forEach((x, i) => (typeof x === 'object' ? form(x as Record<string, unknown>, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(x))));
    else if (typeof val === 'object') form(val as Record<string, unknown>, key, out);
    else out.append(key, String(val));
  }
  return out;
}
async function stripe<T = any>(path: string, body: Record<string, unknown>, idem?: string): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded', ...(idem ? { 'Idempotency-Key': idem } : {}) },
    body: form(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`stripe ${r.status}: ${(j as any)?.error?.code ?? (j as any)?.error?.type ?? 'error'}`);
  return j as T;
}

const cents = (eur: number) => Math.round(eur * 100);
const origin = () => (process.env.PUBLIC_URL ?? '').replace(/\/$/, '');
const offerUrl = (o: Offer) => `${origin()}${offerPath(o.lang, o.token)}`;
const clientEmail = (o: Offer) => {
  const i = o.intakeId ? readIntakes().find((x) => x.id === o.intakeId) : undefined;
  const e = typeof i?.answers.meta_email === 'string' ? i.answers.meta_email.trim() : '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : undefined;
};
const live = (all: Offer[], token: string) => all.find((x) => x.token === token && !x.cancelledAt && x.status === 'accepted');

/** Verifies the Stripe-Signature header (HMAC-SHA256 over "t.payload", 5-minute tolerance). */
function verify(raw: Buffer, header: string | undefined, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]).filter((p) => p.length === 2)) as Record<string, string>;
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const t = Number(parts.t);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw.toString('utf8')}`).digest('hex');
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

interface Deps { requireAdmin: (req: Request, res: Response) => boolean; rateSkip?: () => boolean }

export function registerBilling(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });

  // 1) Client: first payment (setup fee or deposit) + monthly subscription starting two months later
  app.post('/api/offer/:token/checkout', limiter, async (req, res) => {
    if (!stripeOn()) return res.status(503).json({ error: 'not_configured' });
    const all = readOffers(); const o = live(all, String(req.params.token));
    if (!o || !o.contract) return res.status(404).json({ error: 'not_found' });
    if (o.billing?.firstPaidAt || o.paidAt) return res.status(409).json({ error: 'already_paid' });
    const lang = contractLangFor(o.market, o.lang); const cur = o.currency.toLowerCase();
    const now = dueNow(o);
    const setupName = `${o.title || 'Projekt'} · ${o.depositPct > 0 && o.depositPct < 100 ? `${o.depositPct}%` : '100%'}`;
    const common = {
      client_reference_id: o.id, customer_email: o.billing?.customerId ? undefined : clientEmail(o), customer: o.billing?.customerId,
      locale: LOCALE[lang] ?? 'auto', success_url: `${offerUrl(o)}?paid=1`, cancel_url: offerUrl(o), metadata: { offerId: o.id, kind: 'first' },
      billing_address_collection: 'required', tax_id_collection: { enabled: true },
    };
    try {
      const session = o.monthly > 0
        ? await stripe('/checkout/sessions', {
          ...common, mode: 'subscription',
          line_items: [
            { quantity: 1, price_data: { currency: cur, unit_amount: cents(now), product_data: { name: setupName } } },   // one-time, charged right away
            { quantity: 1, price_data: { currency: cur, unit_amount: cents(o.monthly), recurring: { interval: 'month' }, product_data: { name: o.monthlyIncludes ? `Monatlich · ${o.monthlyIncludes}`.slice(0, 120) : 'Monatlich' } } },
          ],
          subscription_data: { trial_end: Math.floor(Date.now() / 1000) + FIRST_MONTHLY_AFTER_DAYS * 86400, metadata: { offerId: o.id } },
        }, `first-${o.id}-${cents(now)}-${cents(o.monthly)}`)
        : await stripe('/checkout/sessions', {
          ...common, mode: 'payment', invoice_creation: { enabled: true },
          line_items: [{ quantity: 1, price_data: { currency: cur, unit_amount: cents(now), product_data: { name: setupName } } }],
        }, `first-${o.id}-${cents(now)}`);
      return res.json({ url: session.url });
    } catch (e) { console.error('[billing] checkout failed', (e as Error).message); return res.status(502).json({ error: 'stripe_failed' }); }
  });

  // 1b) TEST payment (owner's wish, 2026-11-17): only while Stripe is NOT configured and NEVER in production.
  //     Lets the owner see the whole flow (pay → live project page). No money moves; the offer is marked as test-paid.
  app.post('/api/offer/:token/test-pay', limiter, (req, res) => {
    if (!testPayOn()) return res.status(404).json({ error: 'not_available' });
    const all = readOffers(); const o = live(all, String(req.params.token));
    if (!o || !o.contract || !o.billing?.payRequestedAt) return res.status(404).json({ error: 'not_found' });
    const at = new Date().toISOString(); const b = o.billing;
    if (!b.firstPaidAt) { b.firstPaidAt = at; b.firstAmount = dueNow(o); b.test = true; }
    if (setupTotal(o) - dueNow(o) <= 0) o.paidAt = o.paidAt ?? at;
    openProject(o); o.unreadOwner += 1; writeOffers(all);
    console.log('[billing] TEST payment recorded (no money)');
    return res.json({ ok: true, project: o.projectToken });
  });

  // 1c) TEST invoice (only for test payments): clearly marked as not valid; real invoices come from Stripe.
  const TINV: Record<string, { t: string; warn: string; no: string; date: string; to: string; from: string; item: string; sum: string; vat: string; print: string }> = {
    de: { t: 'Testrechnung', warn: 'TEST – keine gültige Rechnung. Echte Rechnungen erstellt Stripe automatisch bei jeder Zahlung.', no: 'Nummer', date: 'Datum', to: 'Rechnungsempfänger', from: 'Leistungserbringer', item: 'Leistung', sum: 'Bezahlt (Test)', vat: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', print: 'Drucken / als PDF speichern' },
    tr: { t: 'Test faturası', warn: 'TEST – geçerli bir fatura değildir. Gerçek faturaları her ödemede Stripe otomatik oluşturur.', no: 'Numara', date: 'Tarih', to: 'Fatura alıcısı', from: 'Hizmet veren', item: 'Hizmet', sum: 'Ödenen (test)', vat: 'Alman KDV Kanunu §19 gereği KDV hesaplanmaz.', print: 'Yazdır / PDF olarak kaydet' },
    el: { t: 'Δοκιμαστικό τιμολόγιο', warn: 'ΔΟΚΙΜΗ – δεν είναι έγκυρο τιμολόγιο. Τα πραγματικά τιμολόγια εκδίδονται αυτόματα από το Stripe σε κάθε πληρωμή.', no: 'Αριθμός', date: 'Ημερομηνία', to: 'Παραλήπτης', from: 'Πάροχος', item: 'Υπηρεσία', sum: 'Πληρώθηκε (δοκιμή)', vat: 'Σύμφωνα με την §19 UStG δεν χρεώνεται ΦΠΑ.', print: 'Εκτύπωση / αποθήκευση ως PDF' },
    en: { t: 'Test invoice', warn: 'TEST – not a valid invoice. Real invoices are created automatically by Stripe with every payment.', no: 'Number', date: 'Date', to: 'Bill to', from: 'Supplier', item: 'Service', sum: 'Paid (test)', vat: 'No VAT is charged under § 19 UStG (small business).', print: 'Print / save as PDF' },
  };
  app.get('/api/offer/:token/test-invoice', limiter, (req, res) => {
    const o = live(readOffers(), String(req.params.token));
    if (!o || !o.billing?.test || !o.billing.firstPaidAt) return res.status(404).send('not found');
    const t = TINV[contractLangFor(o.market, o.lang)] ?? TINV.en;
    const esc = (s: string) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
    const money = (n: number) => new Intl.NumberFormat(o.lang, { style: 'currency', currency: o.currency }).format(n);
    const c = o.contract;
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }).type('html').send(`<!doctype html><html lang="${o.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t.t}</title>
<style>body{font:15px/1.55 system-ui,sans-serif;max-width:760px;margin:24px auto;padding:0 18px;color:#111}h1{margin:0 0 4px}.w{padding:12px 14px;border:2px dashed #c0392b;color:#c0392b;font-weight:600;margin:14px 0}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{padding:8px;border-bottom:1px solid #ddd;text-align:left}td.r,th.r{text-align:right}.g{display:grid;grid-template-columns:1fr 1fr;gap:16px}button{margin-top:16px;padding:10px 16px}@media print{button{display:none}}</style></head><body>
<h1>${t.t}</h1><div class="w">${t.warn}</div>
<p>${t.no}: <b>${testInvoiceNo(o)}</b> · ${t.date}: ${esc(o.billing.firstPaidAt.slice(0, 10))}</p>
<div class="g"><div><b>${t.from}</b><br>Chioutworks · Chousein Chiout<br>Waldstraße 124E, 65451 Kelsterbach<br>USt-IdNr. DE368407083</div><div><b>${t.to}</b><br>${esc(c?.company ?? o.company)}<br>${esc(c?.address ?? '')}<br>${esc(c?.signer ?? o.contact)}</div></div>
<table><tr><th>${t.item}</th><th class="r"></th></tr>${o.items.map((i) => `<tr><td>${esc(i.title)}</td><td class="r">${money(i.amount)}</td></tr>`).join('')}
<tr><th>${t.sum}</th><th class="r">${money(o.billing.firstAmount ?? dueNow(o))}</th></tr></table><p>${t.vat}</p>
<button onclick="print()">${t.print}</button></body></html>`);
  });

  // 2) Client: Stripe customer portal (payment method, invoices). Cancellation rules (6-month minimum) come with the cancellation flow.
  app.post('/api/offer/:token/portal', limiter, async (req, res) => {
    if (!stripeOn()) return res.status(503).json({ error: 'not_configured' });
    const o = live(readOffers(), String(req.params.token));
    if (!o?.billing?.customerId) return res.status(404).json({ error: 'not_found' });
    try {
      const s = await stripe('/billing_portal/sessions', { customer: o.billing.customerId, return_url: offerUrl(o), locale: LOCALE[contractLangFor(o.market, o.lang)] ?? 'auto' });
      return res.json({ url: s.url });
    } catch (e) { console.error('[billing] portal failed', (e as Error).message); return res.status(502).json({ error: 'stripe_failed' }); }
  });

  // 3) Admin: payment link for the remaining setup balance (after a deposit)
  app.post('/api/admin/offers/:id/rest-link', async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    if (!stripeOn()) return res.status(503).json({ error: 'not_configured' });
    const all = readOffers(); const o = all.find((x) => x.id === req.params.id);
    if (!o || !o.billing?.firstPaidAt) return res.status(409).json({ error: 'first_not_paid' });
    const rest = Math.round((setupTotal(o) - dueNow(o)) * 100) / 100;
    if (rest <= 0 || o.billing.restPaidAt) return res.status(409).json({ error: 'nothing_due' });
    try {
      const s = await stripe('/checkout/sessions', {
        mode: 'payment', customer: o.billing.customerId, client_reference_id: o.id, invoice_creation: { enabled: true },
        locale: LOCALE[contractLangFor(o.market, o.lang)] ?? 'auto', success_url: `${offerUrl(o)}?paid=1`, cancel_url: offerUrl(o),
        metadata: { offerId: o.id, kind: 'rest' },
        line_items: [{ quantity: 1, price_data: { currency: o.currency.toLowerCase(), unit_amount: cents(rest), product_data: { name: `${o.title || 'Projekt'} · Rest` } } }],
      });
      o.billing.restUrl = s.url; o.billing.restAmount = rest; writeOffers(all);
      return res.json({ ok: true, url: s.url });
    } catch (e) { console.error('[billing] rest link failed', (e as Error).message); return res.status(502).json({ error: 'stripe_failed' }); }
  });

  // 4) Webhook (raw body). Each event is processed once (event ids kept per offer).
  app.post('/api/stripe/webhook', (req, res) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const raw = req.body as Buffer;
    if (!secret || !Buffer.isBuffer(raw) || !verify(raw, req.get('stripe-signature'), secret)) return res.status(400).json({ error: 'bad_signature' });
    let ev: any; try { ev = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).json({ error: 'bad_json' }); }
    const obj = ev?.data?.object ?? {};
    const offerId: string | undefined = obj.metadata?.offerId ?? obj.subscription_details?.metadata?.offerId ?? obj.parent?.subscription_details?.metadata?.offerId;
    const all = readOffers();
    const o = offerId ? all.find((x) => x.id === offerId) : all.find((x) => x.billing?.customerId && x.billing.customerId === obj.customer);
    if (!o) return res.json({ received: true, matched: false });
    const b = (o.billing ??= {});
    if (b.events?.includes(ev.id)) return res.json({ received: true, duplicate: true });
    b.events = [...(b.events ?? []).slice(-49), ev.id];
    const at = new Date().toISOString();
    switch (ev.type) {
      case 'checkout.session.completed':
        if (obj.payment_status !== 'paid' && obj.payment_status !== 'no_payment_required') break;
        if (obj.customer) b.customerId = obj.customer;
        if (obj.subscription) b.subscriptionId = obj.subscription;
        if (obj.metadata?.kind === 'rest') { b.restPaidAt = at; b.restUrl = undefined; } else { b.firstPaidAt = at; b.firstAmount = (obj.amount_total ?? 0) / 100; openProject(o); }
        if (b.firstPaidAt && (b.restPaidAt || setupTotal(o) - dueNow(o) <= 0)) o.paidAt = o.paidAt ?? at;
        o.unreadOwner += 1;
        break;
      case 'invoice.paid':
        b.lastInvoiceAt = at; b.paymentFailedAt = undefined;
        if (obj.hosted_invoice_url) b.invoices = [...(b.invoices ?? []).filter((x) => x.number !== obj.number), { url: obj.hosted_invoice_url, number: String(obj.number ?? ''), at }].slice(-60);
        break;
      case 'invoice.payment_failed': b.paymentFailedAt = at; o.unreadOwner += 1; break;
      case 'customer.subscription.created': case 'customer.subscription.updated': case 'customer.subscription.deleted':
        b.subscriptionId = obj.id ?? b.subscriptionId; b.subStatus = ev.type.endsWith('deleted') ? 'canceled' : obj.status; break;
      default: break;
    }
    writeOffers(all);
    console.log(`[billing] ${ev.type}`);
    return res.json({ received: true });
  });
}
