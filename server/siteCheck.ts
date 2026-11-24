// Free website check (permission-based lead capture, owner-approved 2026-11-24): form -> double opt-in mail -> on confirm
// the marketing 'audit' runs on the public site -> report by e-mail -> lead (tags opt_in / marketing_ok) in the Satis tab.
// Also carries the calculator's e-mail double opt-in (kind 'roi'). Security: context/GUVENLIK.md. Consent proof (time,
// hashed IP, user agent, texts + version, boxes) goes to the consents table. No cold mail: nothing leaves without a click.
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { dbOn, dbInsert, dbDelete } from './db.js';
import { rlStore } from './rateStore.js';
import { botGate } from './botcheck.js';
import { validate as v, s as str, bool, email as emailZ } from './validate.js';
import { makeStore, leadsStore, fetchSite, analyze, urlProblem, rid, IDP, type Row } from './sales.js';
import { siteAudit } from './marketing.js';
import { nlActivate, nlSuppress, nlDeleteByEmail } from './newsletter.js';
import { confirmMail, sendMail, shell, button, esc, MAIL, originOf, langOf, mailOn, type L } from './mail.js';
import { SLUGS } from '../src/lib/routes.js';
import { SITE_CHECK_UI, SITE_CHECK_AREAS, CONSENT_VERSION } from '../src/site/i18n/siteCheck.js';

const store = makeStore('site_checks', 'site-checks');
const DAY = 864e5;
const CAP = { perEmailDay: 2, perDomainDay: 3, globalDay: 100 };
const salt = () => process.env.ABUSE_SALT || 'chioutworks-form-v1';
const hmac = (t: string) => crypto.createHmac('sha256', salt()).update(t).digest('base64url');
const sha = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
const ipHash = (req: Request) => hmac(`ip|${req.ip ?? ''}`).slice(0, 32);
const ua = (req: Request) => String(req.get('user-agent') ?? '').slice(0, 200);
const unsubTok = (id: string) => `${id}.${hmac(`sc-unsub|${id}`).slice(0, 24)}`;
const unsubUrl = (o: string, id: string, lang: L) => `${o}/api/site-check/unsubscribe?t=${encodeURIComponent(unsubTok(id))}&l=${lang}`;
const unsubOk = (t: string) => { const i = t.lastIndexOf('.'); if (i < 1) return null; const id = t.slice(0, i); const a = Buffer.from(t.slice(i + 1)), b = Buffer.from(hmac(`sc-unsub|${id}`).slice(0, 24)); return a.length === b.length && crypto.timingSafeEqual(a, b) && IDP.test(id) ? id : null; };
const back = (lang: L, q: string) => `/${lang}/${SLUGS[lang].siteCheck}?check=${q}&l=${lang}`;

// ── consent proof (consents table, local fallback data/consents.json) ──
const CONSENT_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/consents.json');
async function proofSave(id: string, data: Record<string, unknown>) {
  const rec = { id, ...data };
  if (dbOn()) return dbInsert('consents', { consent_id: id, at: data.confirmedAt, data: rec });
  let all: any[] = []; try { all = JSON.parse(fs.readFileSync(CONSENT_FILE, 'utf8')); } catch { all = []; }
  all.push(rec); fs.mkdirSync(path.dirname(CONSENT_FILE), { recursive: true }); fs.writeFileSync(CONSENT_FILE, JSON.stringify(all.slice(-20000), null, 2));
}
async function proofDel(id?: string) {
  if (!id) return;
  if (dbOn()) return dbDelete('consents', `consent_id=eq.${encodeURIComponent(id)}`);
  try { fs.writeFileSync(CONSENT_FILE, JSON.stringify((JSON.parse(fs.readFileSync(CONSENT_FILE, 'utf8')) as any[]).filter((x) => x.id !== id), null, 2)); } catch { /* none */ }
}

// ── leads ──
const EMPTY_ANALYSIS = { company: '', city: '', country: '', sector: '', summary: '', has: [], missing: [], reasonable_cause: '', grade: 'D', grade_reason: '', first_step: '', opener: '' };
async function upsertLead(rec: Row, site: Awaited<ReturnType<typeof fetchSite>>, analysis: unknown) {
  const ex = (await leadsStore.list()).find((x) => x.domain === site.domain);
  const { phone: _p, email: _e, ...signals } = site.signals;   // the scraped phone is never kept for an opt-in lead (consent was for e-mail only)
  const tags = [...new Set([...(ex?.tags ?? []), 'opt_in', ...(rec.marketing ? ['marketing_ok'] : [])])];
  const lead: Row = { ...(ex ?? { id: rid('lead'), createdAt: new Date().toISOString(), status: 'new', notes: [] }), url: site.finalUrl, domain: site.domain, analysis: analysis ?? ex?.analysis ?? EMPTY_ANALYSIS, signals, email: rec.email, tags, analyzedAt: new Date().toISOString() };
  await leadsStore.put(lead);
  rec.leadId = lead.id; rec.leadCreated = !ex;
}
async function leadsOfEmail(email: string) { return (await leadsStore.list()).filter((l) => l.email === email && Array.isArray(l.tags)); }
/** Newsletter / mail unsubscribe: marketing tag off on every lead with this address. */
export async function stripMarketingTag(email: string) {
  for (const l of await leadsOfEmail(email.toLowerCase())) if (l.tags.includes('marketing_ok')) { l.tags = l.tags.filter((t: string) => t !== 'marketing_ok'); await leadsStore.put(l); }
}
/** GDPR delete: record + consent proof + lead (or its tags/e-mail when the lead existed before) (+ newsletter entry unless it must stay as suppression). */
async function purge(rec: Row, suppress: boolean) {
  await proofDel(rec.consentId);
  if (rec.leadId) {
    const l = (await leadsStore.list()).find((x) => x.id === rec.leadId);
    if (l) { if (rec.leadCreated) await leadsStore.del(l.id); else { l.tags = (l.tags ?? []).filter((t: string) => t !== 'opt_in' && t !== 'marketing_ok'); if (l.email === rec.email) delete l.email; await leadsStore.put(l); } }
  }
  await store.del(rec.id);
  if (suppress) await nlSuppress(rec.email, rec.lang); else await nlDeleteByEmail(rec.email);
}

// ── report ──
const reportMd = (domain: string, r: { scores: { area: string; score: number; note: string }[]; fixes: string[] }) =>
  [`# Site kontrolü: ${domain}`, '', '## Puanlar (0-10)', ...r.scores.map((s) => `- **${SITE_CHECK_AREAS.tr[s.area as keyof typeof SITE_CHECK_AREAS.tr]}: ${s.score}/10** ${s.note}`), '', '## En önemli 5 düzeltme', ...r.fixes.map((f, i) => `${i + 1}. ${f}`)].join('\n');

async function sendReport(rec: Row, origin: string): Promise<boolean> {
  const lang = rec.lang as L; const m = MAIL[lang]; const r = rec.report; const names = SITE_CHECK_AREAS[lang];
  const un = unsubUrl(origin, rec.id, lang); const contact = `${origin}/${lang}/${SLUGS[lang].contact}`;
  const rows = r.scores.map((s: any) => `<tr><td style="padding:6px 0;width:42%"><b>${esc(names[s.area as keyof typeof names])}</b></td><td style="padding:6px 8px"><div style="background:#dfe7f5;border-radius:6px;height:10px"><div style="background:#2f6fed;border-radius:6px;height:10px;width:${s.score * 10}%"></div></div></td><td style="padding:6px 0;width:48px;text-align:right"><b>${s.score}/10</b></td></tr><tr><td colspan="3" style="padding:0 0 8px;font-size:14px;color:#44546f">${esc(s.note)}</td></tr>`).join('');
  const fixes = r.fixes.map((f: string) => `<li style="margin:0 0 8px">${esc(f)}</li>`).join('');
  const html = shell(lang, m.reportTitle(r.domain), `<p>${esc(m.reportIntro)}</p><h2 style="font-size:17px;color:#0b2a5b;margin:20px 0 6px">${esc(m.scoresTitle)}</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table><h2 style="font-size:17px;color:#0b2a5b;margin:20px 0 6px">${esc(m.fixesTitle)}</h2><ol style="padding-left:20px;margin:0">${fixes}</ol><p style="margin-top:22px">${esc(m.ctaText)}</p>${button(contact, m.ctaBtn)}<p style="font-size:12px;color:#5a6a85">${esc(m.disclaimer)}</p>`, `${esc(m.footer)} <a href="${esc(un)}" style="color:#5a6a85">${esc(m.unsub)}</a>`);
  const text = [m.reportIntro, '', m.scoresTitle, ...r.scores.map((s: any) => `- ${names[s.area as keyof typeof names]}: ${s.score}/10 (${s.note})`), '', m.fixesTitle, ...r.fixes.map((f: string, i: number) => `${i + 1}. ${f}`), '', `${m.ctaText} ${contact}`, '', m.disclaimer, '', `${m.unsub}: ${un}`].join('\n');
  return sendMail({ to: rec.email, subject: m.reportSubject(r.domain), html, text, headers: { 'List-Unsubscribe': `<${un}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } });
}

/** Make sure a report exists (run the audit once), mail it, update status. Never throws. */
async function deliver(rec: Row, origin: string) {
  try {
    if (!rec.report) {
      const site = await fetchSite(rec.url);
      const [audit, an] = await Promise.allSettled([siteAudit(site, rec.lang), analyze(site.finalUrl, site)]);
      if (audit.status === 'rejected') throw audit.reason;
      rec.domain = site.domain;
      rec.report = { ...audit.value, domain: site.domain, md: reportMd(site.domain, audit.value) };
      await upsertLead(rec, site, an.status === 'fulfilled' ? an.value.analysis : null);
    }
    const ok = await sendReport(rec, origin);
    rec.status = ok ? 'sent' : 'confirmed'; rec.error = ok ? undefined : 'mail'; if (ok) rec.sentAt = new Date().toISOString();
  } catch (e) {
    const m = (e as Error)?.message ?? '';
    rec.status = 'confirmed'; rec.error = m.startsWith('llm') ? 'llm' : 'fetch';
    console.error('[site-check] report failed', rec.error);
  }
  await store.put(rec);
}

const SCHEMA = z.object({ website: str(2000), ft: str(500), url: z.string().trim().min(3).max(500), email: emailZ, company: str(100), marketing: bool, consent: bool, lang: str(8) });
let swept = 0;
async function sweep(list: Row[]) {
  if (Date.now() - swept < 36e5) return; swept = Date.now();
  for (const r of list) {
    const age = Date.now() - Date.parse(r.createdAt);
    if ((['pending', 'pending_mail'].includes(r.status) && age > 7 * DAY) || (age > 365 * DAY && !r.marketing)) await purge(r, false).catch(() => undefined);
  }
}
const hostOf = (u: string) => new URL(u).hostname.replace(/^www\./, '').toLowerCase();

export function registerSiteCheck(app: Express, deps: { requireAdmin: (req: Request, res: Response) => Promise<boolean>; rateSkip?: () => boolean; saveRequest: (rec: any) => Promise<unknown> }) {
  const startRoiOptIn = async (req: Request, requestRec: Row & { email: string; lang: string }): Promise<boolean> => {
    const email = requestRec.email.toLowerCase(); const lang = langOf(requestRec.lang);
    if (await capProblem(email)) return false;
    const rec = { ...base(req, 'roi', email, lang, false), roiRec: requestRec };
    await sendConfirm(rec, originOf(req)); return true;
  };

  const ipLimit = rateLimit({ store: rlStore('siteCheckIp'), windowMs: 3600_000, max: 3, skip: deps.rateSkip, standardHeaders: true, legacyHeaders: false, message: { ok: false, error: 'rate_limited' } });
  /** per e-mail 2/day, per domain 3/day, global 100/day (protects the AI quota) */
  const capProblem = async (email: string, domain?: string): Promise<'rate_limited' | 'busy' | null> => {
    const recent = (await store.list()).filter((x) => Date.now() - Date.parse(x.createdAt) < DAY);
    if (recent.length >= CAP.globalDay) return 'busy';
    if (recent.filter((x) => x.email === email).length >= CAP.perEmailDay) return 'rate_limited';
    if (domain && recent.filter((x) => x.domain === domain).length >= CAP.perDomainDay) return 'rate_limited';
    return null;
  };
  const newToken = (rec: Row) => { const t = crypto.randomBytes(24).toString('base64url'); rec.confirmHash = sha(t); rec.confirmExp = new Date(Date.now() + 48 * 3600_000).toISOString(); return t; };
  const sendConfirm = async (rec: Row, origin: string) => {
    const t = newToken(rec); const lang = rec.lang as L;
    const ok = await confirmMail(rec.kind === 'roi' ? 'roi' : 'site', rec.email, lang, `${origin}/api/site-check/confirm?t=${encodeURIComponent(t)}&l=${lang}`, unsubUrl(origin, rec.id, lang)).catch(() => false);
    rec.status = ok ? 'pending' : 'pending_mail'; await store.put(rec); return ok;
  };
  const base = (req: Request, kind: 'site' | 'roi', email: string, lang: L, marketing: boolean): Row => ({ id: rid('sc'), createdAt: new Date().toISOString(), kind, status: 'pending_mail', email, lang, marketing, ipHash: ipHash(req), ua: ua(req), consentVersion: CONSENT_VERSION });

  // 1) request (nothing is analysed or sent before the confirm click)
  app.post('/api/site-check', ipLimit, botGate, v(SCHEMA), async (req, res) => {
    try {
      const b = req.body; const lang = langOf(b.lang); const email = String(b.email).toLowerCase();
      if (b.consent !== true) return res.status(400).json({ ok: false, error: 'consent' });
      const url = /^[a-z][a-z0-9+.-]*:/i.test(b.url) ? b.url : `https://${b.url}`;
      if (urlProblem(url)) return res.status(400).json({ ok: false, error: 'invalid' });
      const domain = hostOf(url);
      void sweep(await store.list());
      const p = await capProblem(email, domain); if (p) return res.status(p === 'busy' ? 503 : 429).json({ ok: false, error: p });
      const rec = { ...base(req, 'site', email, lang, b.marketing === true), url, domain, company: String(b.company ?? '').slice(0, 100) };
      await sendConfirm(rec, originOf(req));   // false (domain not verified yet) keeps it 'pending_mail' for the admin
      return res.json({ ok: true });
    } catch { return res.status(500).json({ ok: false, error: 'server' }); }
  });


  // 2) confirm click: proof, report, lead
  app.get('/api/site-check/confirm', async (req, res) => {
    const lang = langOf(req.query.l);
    try {
      const h = sha(String(req.query.t ?? '').slice(0, 200));
      const rec = (await store.list()).find((x) => x.confirmHash === h);
      if (!rec) return res.redirect(back(lang, 'invalid'));
      const l = rec.lang as L;
      if (rec.confirmedAt) return res.redirect(back(l, rec.kind === 'roi' ? 'roi' : 'ok'));
      if (Date.parse(rec.confirmExp) < Date.now()) return res.redirect(back(l, 'invalid'));
      rec.confirmedAt = new Date().toISOString();
      const ui = SITE_CHECK_UI[l]; const consentId = crypto.randomUUID();
      await proofSave(consentId, { kind: rec.kind === 'roi' ? 'calculator-email' : 'site-check', recordId: rec.id, lang: l, version: CONSENT_VERSION, submittedAt: rec.createdAt, confirmedAt: rec.confirmedAt, ipHashSubmit: rec.ipHash, ipHashConfirm: ipHash(req), uaSubmit: rec.ua, uaConfirm: ua(req), boxes: rec.kind === 'roi' ? { email: true } : { report: true, marketing: !!rec.marketing }, texts: rec.kind === 'roi' ? { email: ui.roiConsent } : { report: ui.consentReport, ...(rec.marketing ? { marketing: ui.consentMarketing } : {}) } });
      rec.consentId = consentId;
      if (rec.kind === 'roi') {
        await deps.saveRequest({ ...rec.roiRec, emailConfirmedAt: rec.confirmedAt }); delete rec.roiRec; rec.status = 'confirmed'; await store.put(rec);
        return res.redirect(back(l, 'roi'));
      }
      rec.status = 'confirmed'; await store.put(rec);
      if (rec.marketing) await nlActivate(rec.email, l, 'site-check').catch(() => undefined);
      await deliver(rec, originOf(req));
      return res.redirect(back(l, 'ok'));
    } catch { return res.redirect(back(lang, 'invalid')); }
  });

  // 3) unsubscribe / withdraw (link in every mail; GET and RFC 8058 one-click POST): deletes the data, keeps only a suppression entry
  const OUT: Record<L, [string, string]> = {
    tr: ['Abonelikten çıktınız', 'Verileriniz silindi, size başka e-posta gönderilmeyecek.'], en: ['You have unsubscribed', 'Your data was deleted and you will not receive further e-mails.'],
    de: ['Sie haben sich abgemeldet', 'Ihre Daten wurden gelöscht, Sie erhalten keine weiteren E-Mails.'], el: ['Διαγραφήκατε', 'Τα δεδομένα σας διαγράφηκαν και δεν θα λάβετε άλλα e-mail.'],
  };
  const unsub = async (req: Request, res: Response) => {
    const lang = langOf(req.query.l ?? req.body?.l); const id = unsubOk(String(req.query.t ?? req.body?.t ?? ''));
    try {
      if (id) {
        const list = await store.list(); const rec = list.find((x) => x.id === id);
        if (rec) { for (const r of list.filter((x) => x.email === rec.email)) await purge(r, true); await stripMarketingTag(rec.email); }
      }
    } catch { /* idempotent: page is shown anyway */ }
    const [t, b] = OUT[lang];
    return res.type('html').send(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(t)}</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#d7dceb;font:16px/1.6 system-ui,sans-serif"><main style="max-width:460px;padding:32px;border:1px solid #24375a;border-radius:12px;background:#0e111b"><h1 style="margin:0 0 8px;font-size:22px;color:#fff">${esc(t)}</h1><p>${esc(b)}</p></main></body></html>`);
  };
  app.get('/api/site-check/unsubscribe', unsub);
  app.post('/api/site-check/unsubscribe', unsub);

  // ── admin ──
  const A = '/api/admin/site-checks';
  const admin = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    deps.requireAdmin(req, res).then((ok) => (ok ? fn(req, res) : undefined)).catch(() => { if (!res.headersSent) res.status(500).json({ error: 'server', message: 'Sunucu hatası.' }); });
  const pick = (id: string) => (IDP.test(id) ? store.list().then((l) => l.find((x) => x.id === id)) : Promise.resolve(undefined));
  app.get(A, admin(async (_req, res) => res.json({
    mailReady: mailOn(),
    items: (await store.list()).map((r) => ({ id: r.id, createdAt: r.createdAt, kind: r.kind, status: r.status, email: r.email, url: r.url ?? '', domain: r.domain ?? '', company: r.company ?? '', marketing: !!r.marketing, lang: r.lang, error: r.error ?? '', confirmedAt: r.confirmedAt ?? '', sentAt: r.sentAt ?? '', hasReport: !!r.report, leadId: r.leadId ?? '' })),
  })));
  app.get(`${A}/:id`, admin(async (req, res) => { const r = await pick(req.params.id); return r ? res.json({ markdown: r.report?.md ?? '' }) : res.status(404).json({ error: 'not_found' }); }));
  app.post(`${A}/:id/resend`, admin(async (req, res) => {
    const r = await pick(req.params.id); if (!r) return res.status(404).json({ error: 'not_found' });
    if (r.kind === 'roi' && r.confirmedAt) return res.status(400).json({ error: 'invalid', message: 'Bu kayıt zaten onaylandı.' });
    if (!r.confirmedAt) { await sendConfirm(r, originOf(req)); } else { await deliver(r, originOf(req)); }
    const ok = r.status === 'pending' || r.status === 'sent';
    return res.json({ ok, status: r.status, message: ok ? 'E-posta gönderildi.' : 'E-posta gönderilemedi (alan adı doğrulanmadı veya gönderim ayarı yok); kayıt bekliyor.' });
  }));
  app.delete(`${A}/:id`, admin(async (req, res) => { const r = await pick(req.params.id); if (r) await purge(r, false); return res.json({ ok: true }); }));
  return { startRoiOptIn };
}
