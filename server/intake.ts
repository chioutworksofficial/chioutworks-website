// Client intake ("Analiz formu"): private token links, schema-driven definition, autosave, submit,
// admin management. Storage: data/intakes.json (atomic writes). Wired from server/index.ts.
import type { Express, Request, Response } from 'express';
import type Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbOn, dbSelect, dbUpsert, dbDelete, kvGet, kvSet } from './db.js';
import {
  AI_Q, APP_Q, AUTO_Q, BOOKING_Q, CONSENT, FINAL_Q, INV_Q, QR_Q, CONSENT_AI, CRM_Q, NOTSURE_Q, SECTION_STATIC, SECTOR_LABEL, START_Q, WEB_Q, YN_LABEL, isSector, l4,
  type L, type L4, type Market, type SectorKey, type StaticQ, type QDef, type SecDef, type Definition,
} from '../src/data/intakeSectors.js';
import { INTAKE_SLUG } from '../src/lib/routes.js';
import { AUTOMATION_FLOW, COST_IDS, COST_NOTE, EXTRA_SYSTEM, MESSENGER_Q, QUESTION_HELP, SECTION_INTRO, SECTION_ORDER } from '../src/data/intakeHelp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(__dirname, '../data/intakes.json');
const LANGS: L[] = ['tr', 'en', 'de', 'el'];
const DAY = 24 * 3600e3;

export interface Intake {
  id: string; token: string; requestId: string | null; lang: L; secondLang: L | null; market: Market; sector: SectorKey;
  prefill: { company: string; contact: string; email: string; phone: string; website: string };
  answers: Record<string, string | boolean>;
  status: 'sent' | 'opened' | 'in_progress' | 'submitted';
  createdAt: string; openedAt: string | null; submittedAt: string | null; expiresAt: string;
  cancelledAt?: string | null; consentAt?: string | null; emailedAt?: string | null; updatedAt?: string | null;
  analysis?: unknown;
}

const TRANS = path.join(__dirname, '../data/intake-translations.json');
const readTrans = async (): Promise<Record<string, Record<string, string>>> => {
  if (dbOn()) return (await kvGet<Record<string, Record<string, string>>>('intake_translations')) ?? {};
  try { return JSON.parse(fs.readFileSync(TRANS, 'utf8')); } catch { return {}; }
};
const writeTrans = async (all: Record<string, Record<string, string>>) => {
  if (dbOn()) return kvSet('intake_translations', all);
  fs.mkdirSync(path.dirname(TRANS), { recursive: true });
  const tmp = `${TRANS}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(all));
  fs.renameSync(tmp, TRANS);
};

const read = (): Intake[] => { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { return []; } };
/** For the style picker: the intake behind a client link (only once it was submitted). */
const col = async (filter: string) => (await dbSelect<{ data: Intake }>('intakes', `select=data&${filter}&limit=1`))[0]?.data ?? null;
export const getIntake = async (id: string): Promise<Intake | null> => (dbOn() ? col(`id=eq.${encodeURIComponent(id)}`) : read().find((i) => i.id === id) ?? null);
export const getIntakeByToken = async (token: string): Promise<Intake | null> => (dbOn() ? col(`token=eq.${encodeURIComponent(token)}`) : read().find((i) => i.token === token) ?? null);
export const intakeById = getIntake;
export const submittedIntake = async (token: string) => { const i = await getIntakeByToken(token); return i && i.status === 'submitted' ? i : null; };
export const listIntakes = async (): Promise<Intake[]> => (dbOn() ? (await dbSelect<{ data: Intake }>('intakes', 'select=data')).map((r) => r.data) : read());
const toRow = (i: Intake) => ({ id: i.id, token: i.token, request_id: i.requestId ?? null, status: i.status, created_at: i.createdAt, updated_at: i.updatedAt ?? new Date().toISOString(), data: i });
export async function saveIntake(rec: Intake): Promise<void> {
  if (dbOn()) return dbUpsert('intakes', toRow(rec), 'id');
  const all = read(); const k = all.findIndex((x) => x.id === rec.id);
  if (k < 0) all.push(rec); else all[k] = rec;
  write(all);
}
export async function deleteIntake(id: string): Promise<boolean> {
  if (!(await getIntake(id))) return false;
  if (dbOn()) await dbDelete('intakes', `id=eq.${encodeURIComponent(id)}`); else write(read().filter((x) => x.id !== id));
  return true;
}
const write = (all: Intake[]) => {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  const tmp = `${STORE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(all, null, 2));
  fs.renameSync(tmp, STORE);
};

// ── Definition ──────────────────────────────────────────────────────────────
export const wantsOf = (a: Record<string, string | boolean>) => ['website', 'booking', 'qr', 'automation', 'crm', 'invoices', 'app', 'ai', 'all'].filter((k) => a[`wants__${k}`] === true);

export function buildDefinition(market: Market, sector: SectorKey, wants: string[]): Definition {
  const fromStatic = (q: StaticQ): QDef => ({ id: q.id, type: q.type, t: q.t, required: q.required, detail: q.detail,
    opts: q.type === 'yn' ? ['yes', 'no', 'unsure'].map((id) => ({ id, t: YN_LABEL[id] })) : q.options?.map((o) => ({ id: o.id, t: o.t })) });
  const sec = (id: SecDef['id'], qs: StaticQ[]): SecDef => ({ id, title: SECTION_STATIC[id as 'qr'], qs: qs.map(fromStatic) });
  // One short block per wanted item (5-10 questions each, tailored per product); the long schema sections are gone on purpose.
  const BLOCKS: [string, StaticQ[]][] = [['website', WEB_Q], ['booking', BOOKING_Q], ['qr', QR_Q], ['crm', CRM_Q], ['invoices', INV_Q], ['automation', AUTO_Q], ['app', APP_Q], ['ai', AI_Q]];
  const secs: SecDef[] = [sec('start', START_Q)];
  if (!wants.length || wants.includes('all')) secs.push(sec('notsure', NOTSURE_Q));
  else for (const [k, qs] of BLOCKS) if (wants.includes(k)) secs.push(sec(k, qs));
  secs.push(sec('final', FINAL_Q));
  return { sections: friendly(secs), consent: consentOf(market), market, sector, wants };
}

const consentOf = (market: Market) => {
  const base = market === 'TR' ? CONSENT.kvkk : CONSENT.gdpr;
  return l4(LANGS.map((l) => `${base[l]} ${CONSENT_AI[l]}`) as [string, string, string, string]);
};
/** Plain-language help and intros per section, in the fixed page order. */
function friendly(secs: SecDef[]): SecDef[] {
  const rank = (id: string) => { const r = SECTION_ORDER.indexOf(id); return r < 0 ? SECTION_ORDER.length : r; };
  return secs.filter((s) => s.qs.length).sort((a, b) => rank(a.id) - rank(b.id)).map((s) => ({
    ...s, ...(SECTION_INTRO[s.id] ? { intro: SECTION_INTRO[s.id] } : {}), ...(s.id === 'automation' ? { flow: AUTOMATION_FLOW } : {}),
    qs: s.qs.map((q) => {
      if (q.id === MESSENGER_Q.id) return MESSENGER_Q;
      const base = QUESTION_HELP[q.id] ?? EXTRA_SYSTEM[q.id];
      if (!base) return q;
      const cost = COST_IDS.has(q.id);
      return { ...q, help: base, ...(cost ? { costNote: COST_NOTE } : {}), ...(cost || MUST_READ.has(q.id) ? { mustRead: true } : {}) };
    }),
  }));
}


/** Questions whose explanation must be read (starred button); add-on systems are added automatically. */
const MUST_READ = new Set(['legal_texts', 'tech_access']);

export const defOf = (i: Intake) => {
  const sector = isSector(i.answers.biz_type) ? (i.answers.biz_type as SectorKey) : i.sector;
  return buildDefinition(i.market, sector, wantsOf(i.answers));
};

// ── Readable answers (like read_answers.py) ─────────────────────────────────
export function formatAnswers(i: Intake, lang: L = 'tr') {
  const def = defOf(i);
  const a = i.answers;
  const str = (k: string) => (typeof a[k] === 'string' ? (a[k] as string).trim() : '');
  const sections = def.sections.map((s) => ({
    title: s.title[lang],
    items: s.qs.map((q) => {
      let ans: string[] = [];
      if (q.type === 'multi') ans = (q.opts ?? []).filter((o) => a[`${q.id}__${o.id}`] === true).map((o) => o.t[lang]);
      else if (q.type === 'single' || q.type === 'yn') { const o = q.opts?.find((x) => x.id === a[q.id]); if (o) ans = [o.t[lang]]; }
      else if (str(q.id)) ans = [str(q.id)];
      if (q.other && str(`${q.id}__other`)) ans.push(`(+ ${str(`${q.id}__other`)})`);
      if (q.detail && str(`${q.id}__detail`)) ans.push(`(${str(`${q.id}__detail`)})`);
      return { no: q.no ?? null, id: q.id, q: q.t[lang], a: ans.join(', ') };
    }),
  }));
  return { sections, consent: a.consent === true };
}

export function answersMarkdown(i: Intake, lang: L = 'tr'): string {
  const f = formatAnswers(i, lang);
  const md = [`# Chioutworks intake – ${str0(i.answers.meta_company) || 'unknown'}`, '',
    `- Dil: ${i.lang}${i.secondLang ? ' + ' + i.secondLang : ''} · Pazar: ${i.market} · Sektör: ${SECTOR_LABEL[defOf(i).sector][lang]}`,
    `- Durum: ${i.status}${i.submittedAt ? ' · gönderildi ' + i.submittedAt : ''}`, ''];
  for (const s of f.sections) {
    md.push(`## ${s.title}`, '');
    for (const it of s.items) md.push(`**${it.no ? it.no + '. ' : ''}${it.q}**  `, it.a || '_—_', '');
  }
  md.push(`**Onay / consent:** ${f.consent ? '✔' : '—'}`);
  return md.join('\n');
}
const str0 = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** Compact text of answered questions only (input for the AI analysis; no contact details). */
export function answersForAi(i: Intake): string {
  const f = formatAnswers(i, 'en');
  const d = defOf(i);
  const out = [`Market: ${i.market}; sector: ${SECTOR_LABEL[d.sector].en}; form language: ${i.lang}; wants: ${d.wants.join(', ') || 'not stated'}`];
  for (const s of f.sections) {
    const rows = s.items.filter((it) => it.a && !it.id.startsWith('meta_') && it.id !== 'biz_type' && it.id !== 'wants');
    if (rows.length) out.push(`\n## ${s.title}`, ...rows.map((it) => `- ${it.q} => ${it.a}`));
  }
  const company = str0(i.answers.meta_company);
  if (company) out.splice(1, 0, `Company: ${company}`);
  return out.join('\n');
}

// ── Mail ────────────────────────────────────────────────────────────────────
const MAIL: Record<L, { s: string; b: (name: string, url: string) => string }> = {
  tr: { s: 'İhtiyaç analizi formunuz', b: (n, u) => `Merhaba${n ? ' ' + n : ''},\n\nteklifi doğru hazırlayabilmem için kısa bir form hazırladım. Adım adım ilerleyebilir, istediğiniz zaman bırakıp aynı bağlantıdan devam edebilirsiniz:\n\n${u}\n\nBağlantı 30 gün geçerlidir ve size özeldir.\n\nChousein Chiout · Chioutworks` },
  en: { s: 'Your project brief form', b: (n, u) => `Hello${n ? ' ' + n : ''},\n\nto prepare your offer properly I have set up a short form. You can go step by step, stop at any time and continue later from the same link:\n\n${u}\n\nThe link is valid for 30 days and private to you.\n\nChousein Chiout · Chioutworks` },
  de: { s: 'Ihr Formular zur Bedarfsanalyse', b: (n, u) => `Guten Tag${n ? ' ' + n : ''},\n\num Ihr Angebot passend vorzubereiten, habe ich ein kurzes Formular erstellt. Sie können Schritt für Schritt vorgehen, jederzeit unterbrechen und über denselben Link später weitermachen:\n\n${u}\n\nDer Link ist 30 Tage gültig und nur für Sie bestimmt.\n\nChousein Chiout · Chioutworks` },
  el: { s: 'Η φόρμα ανάλυσης αναγκών σας', b: (n, u) => `Γεια σας${n ? ' ' + n : ''},\n\nγια να ετοιμάσω σωστά την προσφορά σας, δημιούργησα μια σύντομη φόρμα. Μπορείτε να προχωρήσετε βήμα βήμα, να σταματήσετε όποτε θέλετε και να συνεχίσετε αργότερα από τον ίδιο σύνδεσμο:\n\n${u}\n\nΟ σύνδεσμος ισχύει για 30 ημέρες και είναι προσωπικός.\n\nChousein Chiout · Chioutworks` },
};

// ── Routes ──────────────────────────────────────────────────────────────────
interface Deps {
  requireAdmin: (req: Request, res: Response) => boolean | Promise<boolean>;
  rateSkip: () => boolean;
  emailFrom: () => { key: string; from: string } | null;
  getGroq?: () => Groq | null;
}
const isL = (v: unknown): v is L => LANGS.includes(v as L);
const MARKET_SET = new Set(['DE', 'TR', 'GR', 'other']);
const clean = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const pathOf = (i: Intake) => `/${i.lang}/${INTAKE_SLUG[i.lang]}/${i.token}`;
const mkToken = () => crypto.randomBytes(32).toString('base64url');
const expired = (i: Intake) => new Date(i.expiresAt).getTime() < Date.now();
const KEY_RE = /^[a-z0-9_]{1,60}$/;
const REQUIRED = ['meta_company', 'meta_contact', 'meta_email', 'biz_type'];

export function registerIntake(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 60 * 1000, max: 90, skip: d.rateSkip, standardHeaders: true, legacyHeaders: false, message: { error: 'rate_limited' } });
  const live = async (token: string): Promise<Intake | null> => {
    if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
    const i = await getIntakeByToken(token);
    return i && !i.cancelledAt && !expired(i) ? i : null;
  };
  const pub = (i: Intake) => ({
    lang: i.lang, secondLang: i.secondLang, market: i.market, status: i.status, expiresAt: i.expiresAt, submittedAt: i.submittedAt,
    definition: defOf(i), answers: i.answers,
  });

  app.get('/api/intake/:token', limiter, async (req, res) => {
    const i = await live(String(req.params.token));
    if (!i) return res.status(404).json({ error: 'not_found' });
    if (i.status === 'sent') {
      i.status = 'opened'; i.openedAt = new Date().toISOString(); await saveIntake(i);
    }
    res.set('Cache-Control', 'no-store');
    return res.json(pub(i));
  });

  // Helper translation of the form texts into ANY language the client picks (only question texts are sent to the model,
  // never answers or contact details). Cached per language in data/intake-translations.json, so each text is translated once.
  const transLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 12, skip: d.rateSkip, standardHeaders: true, legacyHeaders: false, message: { error: 'rate_limited' } });
  app.get('/api/intake/:token/translate', transLimiter, async (req, res) => {
    const i = await live(String(req.params.token));
    if (!i) return res.status(404).json({ error: 'not_found' });
    const to = String(req.query.to ?? '');
    if (!/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(to) || LANGS.includes(to as L)) return res.status(400).json({ error: 'bad_lang' });
    const def = defOf(i);
    const src = new Set<string>();
    const add = (x?: L4) => { if (x?.en) src.add(x.en); };
    for (const s of def.sections) { add(s.title); add(s.intro); s.flow?.forEach(add); for (const q of s.qs) { add(q.t); add(q.help); add(q.costNote); q.opts?.forEach((o) => add(o.t)); } }
    add(def.consent);
    const cache = await readTrans(); const have = (cache[to] ??= {});
    const missing = [...src].filter((x) => !have[x]);
    if (missing.length) {
      const groq = d.getGroq?.();
      if (!groq) return res.status(503).json({ error: 'ai_unavailable' });
      let name = to; try { name = new Intl.DisplayNames(['en'], { type: 'language' }).of(to) ?? to; } catch { /* keep code */ }
      try {
        for (let k = 0; k < missing.length; k += 40) {
          const batch = missing.slice(k, k + 40);
          const c = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', temperature: 0.2, max_tokens: 6000, response_format: { type: 'json_object' },
            reasoning_effort: (process.env.GROQ_MODEL || 'openai/gpt-oss-120b').startsWith('openai/') ? 'low' : 'none',
            messages: [
              { role: 'system', content: `Translate each English UI text of a small-business questionnaire into ${name} (${to}). Plain, polite, natural wording a non-technical business owner understands. Keep brand and product names (Google, WhatsApp, Vercel, Excel, CRM) unchanged. Return JSON {"t": [..]} with exactly one translation per input, same order.` },
              { role: 'user', content: JSON.stringify(batch) },
            ],
          } as any) as any;
          const out = JSON.parse(c.choices[0]?.message?.content ?? '{}')?.t;
          if (!Array.isArray(out) || out.length !== batch.length) throw new Error('shape');
          batch.forEach((x, j) => { const v = String(out[j] ?? '').trim().slice(0, 2000); if (v) have[x] = v; });
        }
        await writeTrans(cache);
      } catch (e) {
        console.error('[intake] translate failed', (e as Error).message);
        return res.status(502).json({ error: 'ai_failed' });
      }
    }
    res.set('Cache-Control', 'no-store');
    return res.json({ to, map: Object.fromEntries([...src].filter((x) => have[x]).map((x) => [x, have[x]])) });
  });

  app.patch('/api/intake/:token', limiter, async (req, res) => {
    const i = await getIntakeByToken(String(req.params.token));
    if (!i || i.cancelledAt || expired(i)) return res.status(404).json({ error: 'not_found' });
    const inc = req.body?.answers;
    if (!inc || typeof inc !== 'object' || Array.isArray(inc)) return res.status(400).json({ error: 'bad_request' });
    const before = JSON.stringify([i.answers.biz_type, wantsOf(i.answers)]);
    const next = { ...i.answers };
    let n = 0;
    for (const [k, v] of Object.entries(inc as Record<string, unknown>)) {
      const [qid, sub] = k.split('__');
      if (!KEY_RE.test(qid) || (sub !== undefined && !KEY_RE.test(sub)) || k.length > 130 || ++n > 400) return res.status(400).json({ error: 'bad_key' });
      if (v === false || v === '' || v === null) delete next[k];
      else if (v === true) next[k] = true;
      else if (typeof v === 'string') next[k] = clean(v, 4000);
      else return res.status(400).json({ error: 'bad_value' });
    }
    if (Object.keys(next).length > 600) return res.status(413).json({ error: 'too_large' });
    i.answers = next;
    if (isSector(next.biz_type)) i.sector = next.biz_type;
    if (i.status === 'sent' || i.status === 'opened') i.status = 'in_progress';
    // Edits after submission update the same record (no new intake); admin sees "updated" and a stale-analysis hint
    if (i.status === 'submitted') i.updatedAt = new Date().toISOString();
    await saveIntake(i);
    const changed = before !== JSON.stringify([i.answers.biz_type, wantsOf(i.answers)]);
    return res.json(changed ? { ok: true, definition: defOf(i) } : { ok: true });
  });

  app.post('/api/intake/:token/submit', limiter, async (req, res) => {
    const i = await getIntakeByToken(String(req.params.token));
    if (!i || i.cancelledAt || expired(i)) return res.status(404).json({ error: 'not_found' });
    const missing = REQUIRED.filter((k) => !str0(i.answers[k]));
    if (!wantsOf(i.answers).length) missing.push('wants');
    if (i.answers.consent !== true) missing.push('consent');
    if (missing.length) return res.status(422).json({ error: 'missing', missing });
    if (i.status === 'submitted') return res.json({ ok: true });
    const now = new Date().toISOString();
    i.status = 'submitted'; i.submittedAt = now; i.consentAt = now;
    await saveIntake(i);
    return res.json({ ok: true });
  });

  // ── Admin ──
  const brief = (i: Intake) => ({
    id: i.id, requestId: i.requestId, lang: i.lang, secondLang: i.secondLang, market: i.market, sector: i.sector, status: i.status,
    createdAt: i.createdAt, openedAt: i.openedAt, submittedAt: i.submittedAt, expiresAt: i.expiresAt, cancelledAt: i.cancelledAt ?? null,
    emailedAt: i.emailedAt ?? null, company: str0(i.answers.meta_company) || i.prefill.company, contact: str0(i.answers.meta_contact) || i.prefill.contact,
    email: str0(i.answers.meta_email) || i.prefill.email, hasAnalysis: !!i.analysis, updatedAt: i.updatedAt ?? null,
    analysisStale: !!(i.analysis && i.updatedAt && i.updatedAt > ((i.analysis as { at?: string }).at ?? '')), path: pathOf(i), expired: expired(i),
  });

  app.post('/api/admin/intakes', async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    const b = req.body ?? {};
    const lang: L = isL(b.lang) ? b.lang : 'tr';
    const second: L | null = isL(b.secondLang) && b.secondLang !== lang ? b.secondLang : null;
    const market: Market = MARKET_SET.has(b.market) ? b.market : 'other';
    const sector: SectorKey = isSector(b.sector) ? b.sector : 'other';
    const p = b.prefill ?? {};
    const prefill = { company: clean(p.company, 120), contact: clean(p.contact, 80), email: clean(p.email, 120), phone: clean(p.phone, 40), website: clean(p.website, 120) };
    const now = Date.now();
    const i: Intake = {
      id: 'in_' + crypto.randomBytes(6).toString('hex'), token: mkToken(), requestId: b.requestId ? clean(b.requestId, 60) : null,
      lang, secondLang: second, market, sector, prefill,
      answers: { meta_company: prefill.company, meta_contact: prefill.contact, meta_email: prefill.email, meta_phone: prefill.phone, meta_website: prefill.website, biz_type: sector },
      status: 'sent', createdAt: new Date(now).toISOString(), openedAt: null, submittedAt: null, expiresAt: new Date(now + 30 * DAY).toISOString(),
    };
    for (const k of Object.keys(i.answers)) if (!i.answers[k]) delete i.answers[k];
    await saveIntake(i);
    return res.json({ intake: brief(i) });
  });

  app.get('/api/admin/intakes', async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    return res.json({ intakes: (await listIntakes()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(brief) });
  });

  app.get('/api/admin/intakes/:id', async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    const i = await getIntake(String(req.params.id));
    if (!i) return res.status(404).json({ error: 'not_found' });
    return res.json({ intake: brief(i), formatted: formatAnswers(i, 'tr'), markdown: answersMarkdown(i, 'tr'), analysis: i.analysis ?? null, preview: (i as { preview?: { data: unknown } }).preview?.data ?? null });
  });

  app.patch('/api/admin/intakes/:id', async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    const i = await getIntake(String(req.params.id));
    if (!i) return res.status(404).json({ error: 'not_found' });
    if (req.body?.action === 'cancel') i.cancelledAt = new Date().toISOString();
    else if (req.body?.action === 'renew') { i.token = mkToken(); i.cancelledAt = null; i.expiresAt = new Date(Date.now() + 30 * DAY).toISOString(); }
    else return res.status(400).json({ error: 'bad_action' });
    await saveIntake(i);
    return res.json({ intake: brief(i) });
  });

  app.delete('/api/admin/intakes/:id', async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    if (!(await deleteIntake(String(req.params.id)))) return res.status(404).json({ error: 'not_found' });
    return res.json({ ok: true });
  });

  // Never throws, never 5xx for "no verified domain": the admin UI shows a clear message instead.
  app.post('/api/admin/intakes/:id/email', async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    const i = await getIntake(String(req.params.id));
    if (!i) return res.status(404).json({ error: 'not_found' });
    const to = clean(req.body?.to, 120);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return res.status(400).json({ error: 'bad_email' });
    const origin = /^https?:\/\/[^\s/]+$/.test(String(req.body?.origin ?? '')) ? String(req.body.origin) : (process.env.PUBLIC_URL ?? '');
    const cfg = d.emailFrom();
    if (!cfg || !origin) return res.json({ ok: false, reason: 'not_configured' });
    const tpl = MAIL[i.lang];
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: cfg.from, to: [to], subject: tpl.s, text: tpl.b(str0(i.answers.meta_contact).split(' ')[0] || '', origin + pathOf(i)) }),
      });
      if (!r.ok) { console.error('[intake] Resend error', r.status); return res.json({ ok: false, reason: 'send_failed' }); }
      i.emailedAt = new Date().toISOString(); await saveIntake(i);
      return res.json({ ok: true });
    } catch (e) {
      console.error('[intake] Resend request failed', (e as Error).message);
      return res.json({ ok: false, reason: 'send_failed' });
    }
  });
}

// helpers for the analysis module
export const readIntakes = listIntakes;
export const writeIntakes = async (all: Intake[]): Promise<void> => { if (dbOn()) { if (all.length) await dbUpsert('intakes', all.map(toRow), 'id'); } else write(all); };
