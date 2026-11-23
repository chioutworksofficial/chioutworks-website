// Client intake ("Analiz formu"): private token links, schema-driven definition, autosave, submit,
// admin management. Storage: data/intakes.json (atomic writes). Wired from server/index.ts.
import type { Express, Request, Response } from 'express';
import type Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EN, EN_SECTIONS } from '../src/data/intakeEn.js';
import { dbOn, dbSelect, dbUpsert, dbDelete, kvGet, kvSet } from './db.js';
import {
  AI_Q, APP_Q, AUTO_Q, BOOKING_Q, CONSENT, FINAL_Q, INV_Q, QR_Q, CONSENT_AI, CRM_Q, SECTION_STATIC, SECTOR_LABEL, SECTOR_OVERRIDE, START_Q, TECH_Q, UNSURE_LABEL, YN_LABEL, isSector, l4,
  type L, type L4, type Market, type SectorKey, type StaticQ, type QDef, type SecDef, type Definition,
} from '../src/data/intakeSectors.js';
import { INTAKE_SLUG } from '../src/lib/routes.js';
import { AUTOMATION_FLOW, COST_IDS, COST_NOTE, DREAM_IDS, DREAM_TITLE, EXAMPLES_Q, EXAMPLES_TITLE, EXTRA_SYSTEM, LEGAL_Q, ONETIME_ACK_Q, SUPPORT_Q, LENGTH_NOTE, MERGE_INTO, MESSENGER_Q, MOVE_AFTER, ORDER_NO_WEBSITE, QUICK_IDS, SPLIT_PAGES, QUESTION_HELP, SECTION_INTRO, SECTION_META, SECTION_ORDER, SHOW_IF, STYLE_TITLE, SUGGESTIONS } from '../src/data/intakeHelp.js';
import { isVisible, visibleSections } from '../src/lib/intakeLogic.js';
import { applyChoice, saveChoice, styleSummary, type StyleRec } from './styles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(__dirname, '../data/intakes.json');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/intakeSchema.json'), 'utf8'));
const LANGS: L[] = ['tr', 'en', 'de', 'el'];
const DAY = 24 * 3600e3;

export interface Intake {
  id: string; token: string; requestId: string | null; lang: L; secondLang: L | null; market: Market; sector: SectorKey;
  prefill: { company: string; contact: string; email: string; phone: string; website: string };
  answers: Record<string, string | boolean>;
  status: 'sent' | 'opened' | 'in_progress' | 'submitted';
  createdAt: string; openedAt: string | null; submittedAt: string | null; expiresAt: string;
  closesAt?: string | null; cancelledAt?: string | null; consentAt?: string | null; emailedAt?: string | null; updatedAt?: string | null;
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

/** English source texts of a definition that the helper translation covers (static question texts only, never answers). */
export const translatableTexts = (def: ReturnType<typeof buildDefinition>) => {
  const src = new Set<string>();
  const add = (x?: L4) => { if (x?.en) src.add(x.en); };
  for (const s of def.sections) { add(s.title); add(s.intro); add(s.forWho); add(s.outcome); s.flow?.forEach(add); for (const q of s.qs) { add(q.t); add(q.help); add(q.costNote); q.suggestions?.forEach(add); q.opts?.forEach((o) => add(o.t)); } }
  add(def.consent); add(def.unsureLabel); add(def.lengthNote);
  return src;
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
const pick = (d: Record<string, string> | undefined, lang: L, market: Market): string => {
  if (!d) return '';
  const key = lang === 'tr' && market === 'TR' ? 'tr_TR' : lang === 'el' && market === 'GR' ? 'el_GR' : lang;
  return d[key] ?? d[lang] ?? '';
};
const all4 = (d: Record<string, string> | undefined, enText: string | undefined, market: Market): L4 =>
  l4(LANGS.map((l) => (l === 'en' ? enText ?? '' : pick(d, l, market))) as [string, string, string, string]);

export const wantsOf = (a: Record<string, string | boolean>) => ['website', 'booking', 'qr', 'automation', 'crm', 'invoices', 'app', 'ai', 'all'].filter((k) => a[`wants__${k}`] === true);

const COMPACT = ['booking', 'qr', 'invoices', 'ai', 'crm', 'automation'];
export function buildDefinition(market: Market, sector: SectorKey, wants: string[]): Definition {
  const ov = SECTOR_OVERRIDE[sector] ?? {};
  const websiteFlow = wants.length === 0 || wants.includes('website') || wants.includes('all');
  const skip = new Set(websiteFlow ? [] : ['website', 'design', 'marketing']);
  const fromStatic = (q: StaticQ): QDef => ({ id: q.id, type: q.type, t: q.t, required: q.required, detail: q.detail,
    opts: q.type === 'yn' ? ['yes', 'no', 'unsure'].map((id) => ({ id, t: YN_LABEL[id] })) : q.options?.map((o) => ({ id: o.id, t: o.t })) });

  const secs: SecDef[] = [{ id: 'start', title: SECTION_STATIC.start, qs: START_Q.map(fromStatic) }];
  const toolsQ = TECH_Q.filter((q) => q.id === 'tech_tools');
  const BLOCKS: Record<string, [SecDef['id'], StaticQ[]]> = {
    booking: ['booking', BOOKING_Q], qr: ['qr', QR_Q], crm: ['crm', CRM_Q], invoices: ['invoices', INV_Q], ai: ['ai', AI_Q], automation: ['automation', AUTO_Q],
  };
  const blockSec = (k: string, tools = false): SecDef => ({ id: BLOCKS[k][0], title: SECTION_STATIC[BLOCKS[k][0] as 'qr'], qs: [...BLOCKS[k][1], ...(tools && (k === 'crm' || k === 'invoices') && !(k === 'invoices' && wants.includes('crm')) ? toolsQ : [])].map(fromStatic) });
  const visualPages = (): SecDef[] => [{ id: 'style', title: STYLE_TITLE, qs: [], kind: 'style' }, { id: 'examples', title: EXAMPLES_TITLE, qs: EXAMPLES_Q.map((q) => ({ ...q })) }];
  const focused = wants.length > 0 && wants.every((w) => COMPACT.includes(w));
  if (focused) {
    for (const k of COMPACT) if (wants.includes(k)) secs.push(blockSec(k, true));
    if (wants.includes('qr')) secs.push(...visualPages());
    secs.push({ id: 'final', title: SECTION_STATIC.final, qs: FINAL_Q.map(fromStatic) });
    return { sections: friendly(dedupe(secs)), consent: consentOf(market), market, sector, wants, unsureLabel: UNSURE_LABEL, lengthNote: LENGTH_NOTE };
  }
  for (const s of SCHEMA.sections as any[]) {
    if (skip.has(s.id)) continue;
    const qs: QDef[] = [];
    for (const q of s.questions as any[]) {
      if (q.type === 'consent' || q.id === 'domain') continue; // consent has its own step; domain is covered by the tech block
      const en = EN[q.id];
      let type: QDef['type'] = q.type;
      const t = ov.text?.[q.id] ?? all4(q.text, en?.t, market);
      if (ov.toText?.includes(q.id)) type = 'text';
      let opts: { id: string; t: L4 }[] | undefined;
      if (type === 'yn') opts = ['yes', 'no', 'unsure'].map((id) => ({ id, t: YN_LABEL[id] }));
      else if (q.options && type !== 'text') {
        const base: { id: string; t: L4 }[] = ov.replace?.[q.id] ?? (q.options as any[]).map((o) => ({ id: o.id, t: all4(o.text, en?.o?.[o.id], market) }));
        const drop = new Set(ov.drop?.[q.id] ?? []);
        opts = [...base.filter((o) => !drop.has(o.id) && !(o.id === 'viber' && market !== 'GR')), ...(ov.add?.[q.id] ?? [])];
      }
      qs.push({ id: q.id, no: q.no, type, t, opts, other: !!q.other, detail: !!q.detail });
    }
    if (s.id === 'current') {
      secs.push({ id: s.id, title: all4(s.title, EN_SECTIONS[s.id], market), qs });
      secs.push({ id: 'tech', title: SECTION_STATIC.tech, qs: TECH_Q.map(fromStatic) });
      if (wants.includes('crm') || wants.includes('all')) secs.push({ id: 'crm', title: SECTION_STATIC.crm, qs: CRM_Q.map(fromStatic) });
      if (wants.includes('app') || wants.includes('all')) secs.push({ id: 'app', title: SECTION_STATIC.app, qs: APP_Q.map(fromStatic) });
      if (wants.includes('automation') || wants.includes('all')) secs.push({ id: 'autodetail', title: SECTION_STATIC.auto, qs: AUTO_Q.map(fromStatic) });
      continue;
    }
    if (qs.length) secs.push({ id: s.id, title: all4(s.title, EN_SECTIONS[s.id], market), qs });
  }
  for (const k of ['booking', 'qr', 'invoices', 'ai']) if (wants.includes(k)) secs.push(blockSec(k));
  if (wants.length === 0 || ['website', 'app', 'qr', 'all'].some((w) => wants.includes(w))) secs.push(...visualPages());
  return { sections: friendly(dedupe(secs)), consent: consentOf(market), market, sector, wants, unsureLabel: UNSURE_LABEL, lengthNote: LENGTH_NOTE };
}

const dedupe = (secs: SecDef[]): SecDef[] => { const seen = new Set<string>(); for (const s of secs) s.qs = s.qs.filter((q) => !seen.has(q.id) && !!seen.add(q.id)); return secs; };
const consentOf = (market: Market) => {
  const base = market === 'TR' ? CONSENT.kvkk : CONSENT.gdpr;
  return l4(LANGS.map((l) => `${base[l]} ${CONSENT_AI[l]}`) as [string, string, string, string]);
};
/** Friendlier flow: motivating "dream" page second, technical + budget pages last, plain-language help and intros. No question is dropped. */
function friendly(secs: SecDef[]): SecDef[] {
  // fewer pages: related pages are merged, no question is dropped
  for (const [from, m] of Object.entries(MERGE_INTO)) {
    const a = secs.find((s) => s.id === from), b = secs.find((s) => s.id === m.into);
    if (!a) continue;
    if (!b) { a.id = m.into; a.title = m.title; continue; }
    b.title = m.title; b.qs = m.front ? [...a.qs, ...b.qs] : [...b.qs, ...a.qs]; secs.splice(secs.indexOf(a), 1);
  }
  const dream: QDef[] = [];
  for (const id of DREAM_IDS) for (const s of secs) { const i = s.qs.findIndex((q) => q.id === id); if (i >= 0) { dream.push(s.qs[i]); s.qs.splice(i, 1); break; } }
  const project = secs.find((s) => s.id === 'project');
  if (project && !project.qs.some((q) => q.id === LEGAL_Q.id)) { const at = project.qs.findIndex((q) => q.id === 'budget_onetime'); project.qs.splice(at < 0 ? project.qs.length : at, 0, LEGAL_Q); }
  for (const s of secs) { const at = s.qs.findIndex((q) => q.id === 'budget_monthly'); if (at >= 0 && !s.qs.some((q) => q.id === SUPPORT_Q.id)) s.qs.splice(at, 0, SUPPORT_Q, ONETIME_ACK_Q); }
  for (const [id, [to, after]] of Object.entries(MOVE_AFTER)) {
    const dst = secs.find((s) => s.id === to); if (!dst) continue;
    for (const s of secs) { const i = s.qs.findIndex((q) => q.id === id); if (i >= 0) { const [q] = s.qs.splice(i, 1); const at = dst.qs.findIndex((x) => x.id === after); dst.qs.splice(at < 0 ? dst.qs.length : at + 1, 0, q); break; } }
  }
  for (const p of SPLIT_PAGES) {
    const qs: QDef[] = [];
    for (const id of p.ids) for (const s of secs) { const i = s.qs.findIndex((q) => q.id === id); if (i >= 0) { qs.push(s.qs[i]); s.qs.splice(i, 1); break; } }
    if (qs.length) secs.push({ id: p.id, title: p.title, qs });
  }
  const all = [...secs.filter((s) => s.qs.length || s.kind === 'style'), ...(dream.length ? [{ id: 'dream', title: DREAM_TITLE, qs: dream }] : [])];
  const order = secs.some((s) => s.id === 'website') ? SECTION_ORDER : ORDER_NO_WEBSITE;
  const rank = (id: string) => { const r = order.indexOf(id); return r < 0 ? order.length : r; };
  const sorted = all.sort((a, b) => rank(a.id) - rank(b.id));
  const decorate = (q: QDef): QDef => {
    const base = q.id === MESSENGER_Q.id ? MESSENGER_Q : q.id === LEGAL_Q.id ? LEGAL_Q : q;
    const help = base === q ? QUESTION_HELP[q.id] ?? EXTRA_SYSTEM[q.id] : undefined;
    const cost = COST_IDS.has(q.id);
    const out: QDef = help ? { ...q, help, ...(cost ? { costNote: COST_NOTE } : {}), ...(cost || MUST_READ.has(q.id) ? { mustRead: true } : {}) } : { ...base };
    if (SHOW_IF[out.id]) out.showIf = SHOW_IF[out.id];
    if (out.type === 'text' && SUGGESTIONS[out.id]) out.suggestions = SUGGESTIONS[out.id];
    if (out.type === 'multi' && out.opts) out.opts = out.opts.map((o) => (o.id === 'none' || o.id === 'unsure' ? { ...o, exclusive: true } : o));
    if (!out.required && !out.id.startsWith('meta_') && out.format !== 'url' && !out.opts?.some((o) => o.id === 'unsure')) out.unsure = true;
    return out;
  };
  return sorted.map((s, i) => ({
    ...s, ...(s.id === 'project' && SECTION_INTRO.tech ? { intro: l4(LANGS.map((l) => `${SECTION_INTRO.tech[l]} ${SECTION_INTRO.project[l]}`) as [string, string, string, string]) } : SECTION_INTRO[s.id] ? { intro: SECTION_INTRO[s.id] } : {}),
    ...(s.id === 'automation' ? { flow: AUTOMATION_FLOW } : {}), ...(SECTION_META[s.id] ?? {}),
    ...(QUICK_IDS.has(s.id) ? { quick: true } : {}),
    skippable: i > 0 && i < sorted.length - 1 && !s.qs.some((q) => q.required),
    qs: s.qs.map(decorate),
  }));
}


/** Questions whose explanation must be read (starred button); add-on systems are added automatically. */
const MUST_READ = new Set(['legal_texts', 'tech_access']);

export const defOf = (i: Intake) => {
  const sector = isSector(i.answers.biz_type) ? (i.answers.biz_type as SectorKey) : i.sector;
  return buildDefinition(i.market, sector, wantsOf(i.answers));
};

// ── Readable answers (like read_answers.py) ─────────────────────────────────
export const styleOf = (v: unknown): Record<string, unknown> | null => { try { const o = JSON.parse(String(v)); return o && typeof o === 'object' && !Array.isArray(o) ? o : null; } catch { return null; } };
/** Owner-facing text of the style choice stored in the form (same wording as the admin style view). */
const styleText = (v: unknown): string => {
  const o = styleOf(v); if (!o) return '';
  const rec: StyleRec = { token: '', ref: '', lang: 'tr', createdAt: '', doneAt: null, likes: [], dislikes: [], refs: [], note: '' };
  return applyChoice(rec, o, true) ? styleSummary(rec) : '';
};
export function formatAnswers(i: Intake, lang: L = 'tr') {
  const def = defOf(i);
  const a = i.answers;
  def.sections = visibleSections(def, a); // hidden questions (answers kept stored) stay out of summaries
  const str = (k: string) => (typeof a[k] === 'string' ? (a[k] as string).trim() : '');
  const sections = def.sections.map((s) => ({
    title: s.title[lang],
    items: [...(s.kind === 'style' && styleText(a.style_choice) ? [{ no: null, id: 'style_choice', q: s.title[lang], a: styleText(a.style_choice) }] : []), ...s.qs.map((q) => {
      let ans: string[] = [];
      if (q.type === 'multi') ans = (q.opts ?? []).filter((o) => a[`${q.id}__${o.id}`] === true || a[q.id] === o.id).map((o) => o.t[lang]); // a[q.id]: answers saved before the question became multi
      else if (q.type === 'single' || q.type === 'yn') { const o = q.opts?.find((x) => x.id === a[q.id]); if (o) ans = [o.t[lang]]; }
      else if (str(q.id)) ans = [str(q.id)];
      if (q.other && str(`${q.id}__other`)) ans.push(`(+ ${str(`${q.id}__other`)})`);
      if (q.detail && str(`${q.id}__detail`)) ans.push(`(${str(`${q.id}__detail`)})`);
      return { no: q.no ?? null, id: q.id, q: q.t[lang], a: ans.join(', ') };
    })],
  }));
  return { sections, consent: a.consent === true };
}

const SUPPORT_LINE = (i: Intake, lang: L): string => {
  const m = i.answers.support_model; if (typeof m !== 'string' || !m) return '';
  const o = SUPPORT_Q.opts?.find((x) => x.id === m); if (!o) return '';
  const ack = m === 'onetime' ? (i.answers.onetime_ack === 'ack' ? ' (acknowledged)' : ' (NOT acknowledged)') : '';
  return `${lang === 'tr' ? 'DESTEK MODELİ' : 'SUPPORT MODEL'}: ${o.t[lang]}${ack}`;
};
export function answersMarkdown(i: Intake, lang: L = 'tr'): string {
  const f = formatAnswers(i, lang);
  const md = [`# Chioutworks intake – ${str0(i.answers.meta_company) || 'unknown'}`, '',
    `- Dil: ${i.lang}${i.secondLang ? ' + ' + i.secondLang : ''} · Pazar: ${i.market} · Sektör: ${SECTOR_LABEL[defOf(i).sector][lang]}`,
    ...(SUPPORT_LINE(i, 'tr') ? [`- ${SUPPORT_LINE(i, 'tr')}`] : []),
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
    const rows = s.items.filter((it) => it.a && !it.id.startsWith('meta_') && it.id !== 'biz_type' && it.id !== 'wants' && it.id !== 'budget_range');
    if (rows.length) out.push(`\n## ${s.title}`, ...rows.map((it) => `- ${it.q} => ${it.a}`));
  }
  const budget = f.sections.flatMap((s) => s.items).find((it) => it.id === 'budget_range')?.a;
  if (budget) out.splice(1, 0, `CLIENT BUDGET RANGE (stated first; size the scope to it): ${budget}`);
  const sup = SUPPORT_LINE(i, 'en'); if (sup) out.splice(1, 0, sup);
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
/** Once the visitor saved a first answer, closesAt (first answer + 24 h) replaces the creation-time expiry. */
const expired = (i: Intake) => !i.closesAt && new Date(i.expiresAt).getTime() < Date.now();
const closed = (i: Intake) => !!i.closesAt && new Date(i.closesAt).getTime() < Date.now();
const KEY_RE = /^[a-z0-9_]{1,60}$/;
const REQUIRED = ['meta_company', 'meta_contact', 'meta_email', 'biz_type', 'budget_range'];
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
/** Keeps the style choice and example sites inside the form in sync with the admin style record (ref intake:<id>, as the old post-submit page). */
async function syncStyle(i: Intake) {
  const a = i.answers; const sc = styleOf(a.style_choice);
  const refs = [1, 2, 3].map((n) => str0(a[`example_url_${n}`])).filter(Boolean).map((url) => ({ url, what: '' }));
  const note = str0(a.example_likes);
  if (sc || refs.length || note) await saveChoice(`intake:${i.id}`, i.lang, { ...(sc ?? {}), refs, note });
}

import { validate as v, z, s, bool, anyObj, idP, tokenP, LANG } from './validate.js';
const answersS = z.object({ answers: z.record(z.string(), z.any()) });
const createS = z.object({ lang: s(8), secondLang: s(8), market: s(20), sector: s(40), requestId: s(60), prefill: anyObj }).passthrough();
const actionS = z.object({ action: z.enum(['cancel', 'renew', 'reopen']).nullish() });
const mailS = z.object({ to: s(120), origin: s(200) });

import { recordError } from './errors.js';
export function registerIntake(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 60 * 1000, max: 90, skip: d.rateSkip, standardHeaders: true, legacyHeaders: false, message: { error: 'rate_limited' } });
  const live = async (token: string): Promise<Intake | null> => {
    if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
    const i = await getIntakeByToken(token);
    return i && !i.cancelledAt && !expired(i) ? i : null;
  };
  const pub = (i: Intake) => ({
    lang: i.lang, secondLang: i.secondLang, market: i.market, status: i.status, expiresAt: i.expiresAt, closesAt: i.closesAt ?? null, submittedAt: i.submittedAt,
    definition: defOf(i), answers: i.answers,
  });

  app.get('/api/intake/:token', limiter, async (req, res) => {
    const i = await live(String(req.params.token));
    if (!i) {
      const r = /^[A-Za-z0-9_-]{40,60}$/.test(String(req.params.token)) ? await getIntakeByToken(String(req.params.token)) : null;
      return res.status(r?.cancelledAt ? 410 : 404).json({ error: r?.cancelledAt ? 'revoked' : 'not_found' });
    }
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
    const src = translatableTexts(def);
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
        void recordError('intake/translate-failed', e); console.error('[intake] translate failed', (e as Error).message);
        return res.status(502).json({ error: 'ai_failed' });
      }
    }
    res.set('Cache-Control', 'no-store');
    return res.json({ to, map: Object.fromEntries([...src].filter((x) => have[x]).map((x) => [x, have[x]])) });
  });

  app.patch('/api/intake/:token', limiter, v(answersS, tokenP), async (req, res) => {
    const i = await getIntakeByToken(String(req.params.token));
    if (!i || i.cancelledAt || expired(i)) return res.status(404).json({ error: 'not_found' });
    if (closed(i)) return res.status(410).json({ error: 'closed' });
    const inc = req.body?.answers;
    if (!inc || typeof inc !== 'object' || Array.isArray(inc)) return res.status(400).json({ error: 'bad_request' });
    const before = JSON.stringify([i.answers.biz_type, wantsOf(i.answers)]);
    const next = { ...i.answers };
    let n = 0; const badUrls: string[] = [];
    for (const [k, v] of Object.entries(inc as Record<string, unknown>)) {
      const [qid, sub] = k.split('__');
      if (!KEY_RE.test(qid) || (sub !== undefined && !KEY_RE.test(sub)) || k.length > 130 || ++n > 400) return res.status(400).json({ error: 'bad_key' });
      if (typeof v === 'string' && v.trim()) {
        if (k === 'style_choice') { if (v.length > 1500 || !styleOf(v)) return res.status(400).json({ error: 'bad_value' }); }
        else if (/^example_url_[123]$/.test(k)) { // only http(s) addresses are stored; invalid ones are reported back, other answers still save
          const u = /^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`;
          if (u.length > 200 || !URL_RE.test(u)) { badUrls.push(k); continue; }
          next[k] = u; continue;
        }
      }
      if (v === false || v === '' || v === null) delete next[k];
      else if (v === true) next[k] = true;
      else if (typeof v === 'string') next[k] = clean(v, 4000);
      else return res.status(400).json({ error: 'bad_value' });
    }
    if (Object.keys(next).length > 600) return res.status(413).json({ error: 'too_large' });
    i.answers = next;
    if (isSector(next.biz_type)) i.sector = next.biz_type;
    if (!i.closesAt && Object.values(inc as Record<string, unknown>).some((x) => x === true || (typeof x === 'string' && x.trim()))) i.closesAt = new Date(Date.now() + DAY).toISOString();
    if (i.status === 'sent' || i.status === 'opened') i.status = 'in_progress';
    // Edits after submission update the same record (no new intake); admin sees "updated" and a stale-analysis hint
    if (i.status === 'submitted') i.updatedAt = new Date().toISOString();
    await saveIntake(i);
    if (i.status === 'submitted') await syncStyle(i);
    const changed = before !== JSON.stringify([i.answers.biz_type, wantsOf(i.answers)]);
    return res.json({ ok: true, closesAt: i.closesAt ?? null, ...(changed ? { definition: defOf(i) } : {}), ...(badUrls.length ? { badUrls } : {}) });
  });

  app.post('/api/intake/:token/submit', limiter, v(undefined, tokenP), async (req, res) => {
    const i = await getIntakeByToken(String(req.params.token));
    if (!i || i.cancelledAt || expired(i)) return res.status(404).json({ error: 'not_found' });
    if (closed(i)) return res.status(410).json({ error: 'closed' });
    const missing = REQUIRED.filter((k) => !str0(i.answers[k]));
    for (const s of defOf(i).sections) for (const q of s.qs) if (q.required && !REQUIRED.includes(q.id) && isVisible(q, i.answers) && !Object.keys(i.answers).some((k) => (k === q.id || k.startsWith(`${q.id}__`)) && i.answers[k] !== false && i.answers[k] !== '')) missing.push(q.id);
    if (!wantsOf(i.answers).length) missing.push('wants');
    if (i.answers.consent !== true) missing.push('consent');
    if (missing.length) return res.status(422).json({ error: 'missing', missing });
    if (i.status === 'submitted') return res.json({ ok: true });
    const now = new Date().toISOString();
    i.status = 'submitted'; i.submittedAt = now; i.consentAt = now;
    await saveIntake(i);
    await syncStyle(i);
    return res.json({ ok: true });
  });

  // ── Admin ──
  const brief = (i: Intake) => ({
    id: i.id, requestId: i.requestId, lang: i.lang, secondLang: i.secondLang, market: i.market, sector: i.sector, status: i.status,
    createdAt: i.createdAt, openedAt: i.openedAt, submittedAt: i.submittedAt, expiresAt: i.expiresAt, closesAt: i.closesAt ?? null, cancelledAt: i.cancelledAt ?? null,
    emailedAt: i.emailedAt ?? null, company: str0(i.answers.meta_company) || i.prefill.company, contact: str0(i.answers.meta_contact) || i.prefill.contact,
    email: str0(i.answers.meta_email) || i.prefill.email, budgetRange: str0(i.answers.budget_range) || null, hasAnalysis: !!i.analysis, updatedAt: i.updatedAt ?? null,
    analysisStale: !!(i.analysis && i.updatedAt && i.updatedAt > ((i.analysis as { at?: string }).at ?? '')), path: pathOf(i), expired: expired(i), closed: closed(i),
  });

  app.post('/api/admin/intakes', v(createS), async (req, res) => {
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

  app.patch('/api/admin/intakes/:id', v(actionS, idP), async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    const i = await getIntake(String(req.params.id));
    if (!i) return res.status(404).json({ error: 'not_found' });
    if (req.body?.action === 'cancel') i.cancelledAt = new Date().toISOString();
    else if (req.body?.action === 'renew') { if (i.cancelledAt) return res.status(409).json({ error: 'revoked' }); i.token = mkToken(); i.cancelledAt = null; i.expiresAt = new Date(Date.now() + 30 * DAY).toISOString(); }
    else if (req.body?.action === 'reopen') { if (i.cancelledAt) return res.status(409).json({ error: 'revoked' }); i.closesAt = new Date(Date.now() + DAY).toISOString(); }
    else return res.status(400).json({ error: 'bad_action' });
    await saveIntake(i);
    return res.json({ intake: brief(i) });
  });

  app.delete('/api/admin/intakes/:id', v(undefined, idP), async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    if (!(await deleteIntake(String(req.params.id)))) return res.status(404).json({ error: 'not_found' });
    return res.json({ ok: true });
  });

  // Never throws, never 5xx for "no verified domain": the admin UI shows a clear message instead.
  app.post('/api/admin/intakes/:id/email', v(mailS, idP), async (req, res) => {
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
      void recordError('intake/Resend-request-failed', e); console.error('[intake] Resend request failed', (e as Error).message);
      return res.json({ ok: false, reason: 'send_failed' });
    }
  });
}

// helpers for the analysis module
export const readIntakes = listIntakes;
export const writeIntakes = async (all: Intake[]): Promise<void> => { if (dbOn()) { if (all.length) await dbUpsert('intakes', all.map(toRow), 'id'); } else write(all); };
