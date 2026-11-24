// Monthly newsletter idea (owner, 2026-11-24): once a month one short, useful idea per language (tr/en/de/el, never mixed),
// drafted with the LLM layer, validated, stored, and sent to confirmed (double opt-in) subscribers only.
// Storage: Supabase kv (key newsletter.issues / .settings / .lock) or data/newsletter-state.json locally.
// Resend free tier is ~100 mails/day: a run sends at most NEWSLETTER_DAILY_CAP (default 80); the daily cron continues the next day.
// Idempotency: an issue keeps the ids of subscribers already mailed; an id is added only AFTER a successful send and the
// run holds a short lock (compare-and-set), so a run never mistakes its own fresh record for a conflict. No personal data in logs.
import type { Express, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbOn, kvGet, kvSet } from './db.js';
import { llmJson } from './llm.js';
import { languageOk } from './languageGuard.js';
import { sendMail, mailOn, shell, esc, type L } from './mail.js';
import { nlActive, nlCounts, unsubToken, unsubscribeUrl, unsubscribeHeaders, unsubOn } from './newsletter.js';
import { recordError } from './errors.js';

const LANGS: L[] = ['tr', 'en', 'de', 'el'];
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/newsletter-state.json');
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

interface Item { title: string; paras: string[]; at: string; model: string }
export interface Issue {
  id: string; createdAt: string; items: Partial<Record<L, Item>>; errors: Partial<Record<L, string>>;
  sent: Record<L, string[]>; release: boolean; sentDay?: { d: string; n: number }; sentAt?: string; lastError?: string;
}
interface Settings { autoSend: boolean; paused: boolean }
const K_ISSUES = 'newsletter.issues', K_SET = 'newsletter.settings', K_LOCK = 'newsletter.lock';
const getSettings = async (): Promise<Settings> => ({ autoSend: true, paused: false, ...(await kvx.get<Partial<Settings>>(K_SET)) });
const getIssues = async () => (await kvx.get<Issue[]>(K_ISSUES)) ?? [];
const putIssues = (a: Issue[]) => kvx.set(K_ISSUES, a.sort((x, y) => y.id.localeCompare(x.id)).slice(0, 12));
const monthId = (d = new Date()) => d.toISOString().slice(0, 7);
const cap = () => Math.max(1, Math.min(95, Number(process.env.NEWSLETTER_DAILY_CAP) || 80));
const baseOrigin = () => (process.env.PUBLIC_ORIGIN ?? '').split(',')[0].trim().replace(/\/$/, '');

/** Short lock (compare-and-set): only one generate/send run at a time. */
async function withLock<T>(fn: () => Promise<T>): Promise<T | 'busy'> {
  const me = crypto.randomUUID(); const cur = await kvx.get<{ by: string; until: number }>(K_LOCK);
  if (cur && cur.until > Date.now()) return 'busy';
  await kvx.set(K_LOCK, { by: me, until: Date.now() + 5 * 60_000 });
  if ((await kvx.get<{ by: string }>(K_LOCK))?.by !== me) return 'busy';
  try { return await fn(); } finally { await kvx.set(K_LOCK, { by: me, until: 0 }); }
}

// ── texts ──
const SITE_PATH: Record<L, string> = { tr: 'ucretsiz-site-kontrolu', en: 'free-website-check', de: 'kostenloser-website-check', el: 'dorean-elegxos-istoselidas' };
const T: Record<L, { name: string; cta: string; ctaLink: string; unsub: string; why: string; subj: string }> = {
  tr: { name: 'Turkish', cta: 'Kendi web sitenizin nerede durduğunu merak ediyorsanız: ücretsiz web sitesi kontrolü yazılıdır ve bağlayıcı değildir.', ctaLink: 'Ücretsiz site kontrolü', unsub: 'Abonelikten çık', why: 'Bu e-postayı bülten aboneliğinizi onayladığınız için, ayda yaklaşık bir kez alıyorsunuz. Metinler yapay zekâ desteğiyle hazırlanır.', subj: '' },
  en: { name: 'English', cta: 'If you want to see where your own website stands: the free website check is written and non-binding.', ctaLink: 'Free website check', unsub: 'Unsubscribe', why: 'You receive this e-mail about once a month because you confirmed your newsletter subscription. The texts are drafted with AI assistance.', subj: '' },
  de: { name: 'German', cta: 'Wenn Sie wissen möchten, wo Ihre eigene Website steht: Der kostenlose Website-Check ist schriftlich und unverbindlich.', ctaLink: 'Kostenloser Website-Check', unsub: 'Abmelden', why: 'Sie erhalten diese E-Mail etwa einmal im Monat, weil Sie Ihre Newsletter-Anmeldung bestätigt haben. Die Texte entstehen mit KI-Unterstützung.', subj: '' },
  el: { name: 'Greek', cta: 'Αν θέλετε να δείτε πού βρίσκεται η δική σας ιστοσελίδα: ο δωρεάν έλεγχος ιστοσελίδας είναι γραπτός και μη δεσμευτικός.', ctaLink: 'Δωρεάν έλεγχος ιστοσελίδας', unsub: 'Διαγραφή', why: 'Λαμβάνετε αυτό το e-mail περίπου μία φορά τον μήνα επειδή επιβεβαιώσατε την εγγραφή σας στο newsletter. Τα κείμενα συντάσσονται με τη βοήθεια ΤΝ.', subj: '' },
};

// ── generation + validation ──
const BAD_URL = /https?:|www\.|\b[a-z0-9-]+\.(com|de|net|org|io|gr|tr|ai|app|eu)\b/i;
const BAD_PRICE = /[€$₺£]|\b\d[\d.,]*\s?(eur|euro|usd|tl|try|dollar)\b|\b(eur|euro|usd)\s?\d/i;
const BAD_PROMISE = /\d\s?%|percent|prozent|yüzde|τοις εκατό|garant|εγγύηση|guarantee|versprech|\bwir\b|\bunser|\bwe\b|\bour\b|\bbiz\b|\bbizim|\bεμείς\b/i;
const wc = (s: string) => (s.match(/\p{L}+/gu) ?? []).length;
export function validateItem(x: unknown, lang: L): Item | string {
  const o = x as { title?: unknown; paragraphs?: unknown };
  const title = typeof o?.title === 'string' ? o.title.replace(/[*#<>]/g, '').trim() : '';
  const paras = Array.isArray(o?.paragraphs) ? o.paragraphs.filter((p): p is string => typeof p === 'string').map((p) => p.replace(/[*#<>]/g, '').trim()).filter(Boolean) : [];
  const all = [title, ...paras].join('\n'); const n = paras.reduce((a, p) => a + wc(p), 0);
  if (title.length < 8 || title.length > 90) return 'title_length';
  if (paras.length < 3 || paras.length > 5) return 'paragraph_count';
  if (n < 100 || n > 230) return 'word_count';
  if (all.includes('@')) return 'contains_address';
  if (BAD_URL.test(all)) return 'contains_url';
  if (BAD_PRICE.test(all)) return 'contains_price';
  if (BAD_PROMISE.test(all)) return 'promise_or_wrong_voice';
  if (!languageOk(all, lang)) return 'wrong_language';
  return { title, paras, at: new Date().toISOString(), model: 'llm' };
}

async function draft(lang: L, prev: string[]): Promise<{ item?: Item; error?: string }> {
  const system = `You write one short monthly e-mail idea for a one-person tech business (automation, web apps, AI, digital strategy) that serves small businesses in Germany, Turkey and Greece. Write ONLY in ${T[lang].name}. Voice: first person singular ("I"), never "we", no names. Tone: calm, practical, not salesy, no hype. Content: ONE concrete, practical idea a small business can use (for example a small automation, a website improvement, a sensible use of an AI assistant), with a small realistic example and the first step. Hard rules: no prices, no percentages or statistics, no guarantees or promises, no testimonials or invented customers, no e-mail addresses, no links, no markdown. Do not mention a website check (it is added separately). Return JSON: {"title": "max 80 characters", "paragraphs": ["3 to 5 short paragraphs, together 120 to 180 words"]}. ${prev.length ? `Do not repeat these earlier topics: ${prev.map((t) => `"${t}"`).join('; ')}.` : ''}`;
  let last = 'llm_failed';
  for (let i = 0; i < 3; i++) {
    try {
      const r = validateItem(await llmJson({ system, messages: [{ role: 'user', content: `Write this month's idea in ${T[lang].name}.` }], temperature: 0.7, maxTokens: 900 }), lang);
      if (typeof r !== 'string') return { item: r };
      last = r;
    } catch (e) { last = (e as Error).message === 'llm_not_configured' ? 'llm_not_configured' : 'llm_failed'; if (last === 'llm_not_configured') break; }
  }
  return { error: last };
}

async function generate(id: string, langs: L[] = LANGS): Promise<Issue> {
  const issues = await getIssues();
  const issue = issues.find((i) => i.id === id) ?? { id, createdAt: new Date().toISOString(), items: {}, errors: {}, sent: { tr: [], en: [], de: [], el: [] }, release: false };
  const todo = langs.filter((l) => !(issue.sent[l]?.length));   // a language that already went out is never replaced
  await Promise.all(todo.map(async (l) => {
    const prev = issues.filter((i) => i.id !== id).slice(0, 6).map((i) => i.items[l]?.title).filter((t): t is string => !!t);
    const r = await draft(l, prev);
    if (r.item) { issue.items[l] = r.item; delete issue.errors[l]; } else issue.errors[l] = r.error ?? 'failed';
  }));
  await putIssues([issue, ...issues.filter((i) => i.id !== id)]);
  return issue;
}

// ── mail ──
function build(lang: L, item: Item, origin: string, subId: string) {
  const t = T[lang]; const site = `${origin}/${lang}/${SITE_PATH[lang]}`; const un = unsubscribeUrl(origin, unsubToken(subId));
  const body = item.paras.map((p) => `<p style="margin:0 0 14px">${esc(p)}</p>`).join('') + `<p style="margin:20px 0 0;font-size:15px;color:#3a4a66">${esc(t.cta)} <a href="${esc(site)}" style="color:#2f6fed">${esc(t.ctaLink)}</a></p>`;
  return {
    subject: item.title, headers: unsubscribeHeaders(origin, unsubToken(subId)),
    html: shell(lang, item.title, body, `${esc(t.why)}<br><a href="${esc(un)}" style="color:#5a6a85;font-weight:600">${esc(t.unsub)}</a>`),
    text: `${item.title}\n\n${item.paras.join('\n\n')}\n\n${t.cta} ${site}\n\n${t.why}\n${t.unsub}: ${un}`,
  };
}

export type SendResult = { sent: number; remaining: number; note?: string };
async function sendIssue(issue: Issue, origin: string): Promise<SendResult> {
  if (!mailOn()) { console.log('[newsletter] skipped: mail not configured'); return { sent: 0, remaining: -1, note: 'mail_not_configured' }; }
  if (!origin || !unsubOn()) { console.log('[newsletter] skipped: origin or unsubscribe secret missing'); return { sent: 0, remaining: -1, note: 'origin_or_secret_missing' }; }
  const today = new Date().toISOString().slice(0, 10);
  let left = cap() - (issue.sentDay?.d === today ? issue.sentDay.n : 0);
  const subs = await nlActive(); let sent = 0, fails = 0; const t0 = Date.now();
  for (const s of subs) {
    const item = issue.items[s.lang]; if (!item || issue.sent[s.lang].includes(s.id)) continue;
    if (left <= 0 || fails >= 3 || Date.now() - t0 > 40_000) break;
    const ok = await sendMail({ to: s.email, ...build(s.lang, item, origin, s.id) });
    if (!ok) { fails++; continue; }
    fails = 0; left--; sent++; issue.sent[s.lang].push(s.id);
    issue.sentDay = { d: today, n: (issue.sentDay?.d === today ? issue.sentDay.n : 0) + 1 };
    await putIssues([issue, ...(await getIssues()).filter((i) => i.id !== issue.id)]);   // persist after every send: a crash never causes a repeat
  }
  const remaining = subs.filter((s) => issue.items[s.lang] && !issue.sent[s.lang].includes(s.id)).length;
  issue.lastError = fails >= 3 ? 'send_failed' : undefined;
  if (fails >= 3) void recordError('newsletter', new Error('send failed 3x in a row (quota or domain)'));
  if (!remaining && sent) issue.sentAt = new Date().toISOString();
  await putIssues([issue, ...(await getIssues()).filter((i) => i.id !== issue.id)]);
  console.log(`[newsletter] issue ${issue.id}: sent=${sent} remaining=${remaining}`);
  return { sent, remaining };
}

/** Daily cron body: generate this month's issue once (first 7 days), release it if auto-send is on, continue sending within the daily cap. */
export async function runMonthly(origin: string) {
  const st = await getSettings();
  if (st.paused) return { skipped: 'paused' };
  const r = await withLock(async () => {
    const id = monthId(); let issue = (await getIssues()).find((i) => i.id === id);
    if (!issue && st.autoSend && new Date().getUTCDate() <= 7) issue = await generate(id);
    if (!issue) return { skipped: 'nothing_due' };
    if (st.autoSend && issue.id === id && !issue.release && LANGS.some((l) => issue!.items[l])) { issue.release = true; await putIssues([issue, ...(await getIssues()).filter((i) => i.id !== id)]); }
    const out: Record<string, SendResult> = {};
    for (const i of (await getIssues()).filter((x) => x.release).slice(0, 2)) { const full = await sendIssue(i, origin); out[i.id] = full; if (full.sent >= cap()) break; }
    return { issues: out };
  });
  return r === 'busy' ? { skipped: 'busy' } : r;
}

export function registerNewsletterIssues(app: Express, deps: { requireAdmin: (req: Request, res: Response) => Promise<boolean> }) {
  app.get('/api/cron/newsletter-monthly', async (req, res) => {
    const secret = process.env.CRON_SECRET;
    if (!secret) return res.status(503).json({ error: 'cron_not_configured' });
    const h = (x: string) => crypto.createHash('sha256').update(x).digest();
    if (!crypto.timingSafeEqual(h(req.get('authorization') ?? ''), h(`Bearer ${secret}`))) return res.status(401).json({ error: 'unauthorized' });
    try { return res.json({ ok: true, ...(await runMonthly(baseOrigin())) }); } catch (e) { void recordError('cron/newsletter', e); return res.status(500).json({ error: 'failed' }); }
  });

  const A = '/api/admin/newsletter-issues';
  const guard = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    deps.requireAdmin(req, res).then((ok) => (ok ? fn(req, res) : undefined)).catch(() => { if (!res.headersSent) res.status(500).json({ error: 'server', message: 'Sunucu hatası.' }); });
  const view = (i: Issue) => ({ id: i.id, createdAt: i.createdAt, items: i.items, errors: i.errors, release: i.release, sentAt: i.sentAt ?? null, lastError: i.lastError ?? null, sentCount: Object.fromEntries(LANGS.map((l) => [l, i.sent[l].length])) });
  const origin = (req: Request) => baseOrigin() || `${req.protocol}://${req.get('host')}`;

  app.get(A, guard(async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    return res.json({ settings: await getSettings(), issues: (await getIssues()).map(view), subscribers: await nlCounts(), mailConfigured: mailOn(), unsubConfigured: unsubOn(), originConfigured: !!baseOrigin(), dailyCap: cap(), currentId: monthId() });
  }));
  app.put(`${A}/settings`, guard(async (req, res) => {
    const b = (req.body ?? {}) as Partial<Settings>; const cur = await getSettings();
    const next = { autoSend: typeof b.autoSend === 'boolean' ? b.autoSend : cur.autoSend, paused: typeof b.paused === 'boolean' ? b.paused : cur.paused };
    await kvx.set(K_SET, next); return res.json({ ok: true, settings: next });
  }));
  app.post(`${A}/generate`, guard(async (req, res) => {
    const b = (req.body ?? {}) as { id?: unknown; lang?: unknown };
    const id = typeof b.id === 'string' && /^\d{4}-\d{2}$/.test(b.id) ? b.id : monthId();
    const langs = LANGS.includes(b.lang as L) ? [b.lang as L] : LANGS;
    const r = await withLock(() => generate(id, langs)); if (r === 'busy') return res.status(409).json({ error: 'busy' });
    return res.json({ ok: true, issue: view(r) });
  }));
  app.post(`${A}/:id/send`, guard(async (req, res) => {
    const id = String(req.params.id);
    const r = await withLock(async () => {
      const issue = (await getIssues()).find((i) => i.id === id); if (!issue) return null;
      if (!LANGS.some((l) => issue.items[l])) return 'empty' as const;
      issue.release = true; return sendIssue(issue, origin(req));
    });
    if (r === 'busy') return res.status(409).json({ error: 'busy' });
    if (r === null) return res.status(404).json({ error: 'not_found' });
    if (r === 'empty') return res.status(400).json({ error: 'no_text' });
    return res.json({ ok: true, ...r });
  }));
}
