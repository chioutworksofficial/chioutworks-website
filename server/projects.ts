// Live project page (client portal) — opens automatically once the first payment of an offer is in.
// The client follows the project step by step, writes messages, sees the current state of the website (preview link +
// screenshots) and both sides can add images / PDF / ZIP (max 25 MB, type checked by the file CONTENT, not the name).
// Storage: Supabase when configured (table projects, kv 'project_ui_i18n', private Storage bucket project-files), otherwise
// data/projects.json (+ files in data/uploads/projects/<id>/).
import type { Express, Request, Response } from 'express';
import type Groq from 'groq-sdk';
import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbOn, dbSelect, dbUpsert, dbDelete, kvGet, kvSet } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(__dirname, '../data/projects.json');
const FILES = path.join(__dirname, '../data/uploads/projects');
const MAX_BYTES = 25 * 1024 * 1024;
// Client uploads (owner, 2026-11-17): only a logo or photo, small, one at a time; big files / ZIP / PDF only from the owner
const CLIENT_MAX = 5 * 1024 * 1024; const CLIENT_GAP_MS = 60_000; const CLIENT_MAX_FILES = 30;

type L = 'tr' | 'en' | 'de' | 'el';
export const STAGES = ['planning', 'design', 'build', 'test', 'launch'] as const;
type Stage = (typeof STAGES)[number];
interface StageItem { id: string; text: string; done: boolean }
interface StageState { key: Stage; status: 'todo' | 'doing' | 'done'; note: string; at: string | null; items?: StageItem[] }   // items: decisions / to-dos of this step
interface PFile { id: string; name: string; size: number; type: string; from: 'client' | 'owner'; at: string; preview: boolean }
interface PMsg { id: string; from: 'client' | 'owner'; text: string; at: string; fileId?: string }
interface PRequest { id: string; text: string; at: string; done: boolean; doneAt: string | null }
export interface Project {
  id: string; token: string; offerId: string; lang: L; company: string; contact: string; title: string;
  createdAt: string; stages: StageState[]; previewUrl: string;
  messages: PMsg[]; files: PFile[]; requests: PRequest[]; unreadOwner: number; unreadClient: number;
  tr?: Record<string, Record<string, string>>;   // translation cache: language → text hash → translated text
  view?: string;                                  // language the client reads the page in (any of VIEW_LANGS); stays until the project ends
  viewBy?: 'auto' | 'client';                     // auto = from country / browser on first open, client = picked by the client
}

/** Languages of the live project page (owner, 2026-11-17). tr/en/de/el have hand-written texts; the others are translated once and cached. */
export const VIEW_LANGS: Record<string, { name: string; en: string; rtl?: boolean }> = {
  tr: { name: 'Türkçe', en: 'Turkish' }, en: { name: 'English', en: 'English' }, de: { name: 'Deutsch', en: 'German' }, el: { name: 'Ελληνικά', en: 'Greek' },
  fr: { name: 'Français', en: 'French' }, it: { name: 'Italiano', en: 'Italian' }, es: { name: 'Español', en: 'Spanish' }, pt: { name: 'Português', en: 'Portuguese' },
  nl: { name: 'Nederlands', en: 'Dutch' }, pl: { name: 'Polski', en: 'Polish' }, ro: { name: 'Română', en: 'Romanian' }, bg: { name: 'Български', en: 'Bulgarian' },
  sq: { name: 'Shqip', en: 'Albanian' }, hr: { name: 'Hrvatski', en: 'Croatian' }, sr: { name: 'Srpski', en: 'Serbian (Latin script)' }, ru: { name: 'Русский', en: 'Russian' },
  uk: { name: 'Українська', en: 'Ukrainian' }, ar: { name: 'العربية', en: 'Arabic', rtl: true },
};
const COUNTRY_LANG: Record<string, string> = {
  DE: 'de', AT: 'de', CH: 'de', LI: 'de', LU: 'de', TR: 'tr', AZ: 'tr', GR: 'el', CY: 'el', FR: 'fr', BE: 'fr', MC: 'fr', IT: 'it', SM: 'it',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', PT: 'pt', BR: 'pt', NL: 'nl', PL: 'pl', RO: 'ro', MD: 'ro', BG: 'bg', AL: 'sq', XK: 'sq',
  HR: 'hr', BA: 'hr', RS: 'sr', ME: 'sr', RU: 'ru', BY: 'ru', KZ: 'ru', UA: 'uk', SA: 'ar', AE: 'ar', EG: 'ar', QA: 'ar', KW: 'ar', JO: 'ar', LB: 'ar', IQ: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar',
  GB: 'en', IE: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en',
};
const UI_STORE = path.join(__dirname, '../data/project-ui-i18n.json');

const read = (): Project[] => { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { return []; } };
const write = (all: Project[]) => { const tmp = STORE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(all, null, 2)); fs.renameSync(tmp, STORE); };
export async function listProjects(): Promise<Project[]> {
  if (!dbOn()) return read();
  return (await dbSelect<{ data: Project }>('projects', 'select=data&order=created_at.asc')).map((r) => r.data);
}
export async function getProject(id: string): Promise<Project | undefined> {
  if (!dbOn()) return read().find((p) => p.id === id);
  return (await dbSelect<{ data: Project }>('projects', `select=data&id=eq.${encodeURIComponent(id)}`))[0]?.data;
}
export async function getProjectByToken(token: string): Promise<Project | undefined> {
  if (!dbOn()) return read().find((p) => p.token === token);
  return (await dbSelect<{ data: Project }>('projects', `select=data&token=eq.${encodeURIComponent(token)}`))[0]?.data;
}
export async function saveProject(p: Project): Promise<void> {
  if (dbOn()) return dbUpsert('projects', { id: p.id, token: p.token, offer_id: p.offerId, created_at: p.createdAt, data: p }, 'id');
  const all = read(); const i = all.findIndex((x) => x.id === p.id);
  if (i >= 0) all[i] = p; else all.push(p);
  write(all);
}
const uiRead = async (): Promise<Record<string, Record<string, string>>> => {
  if (dbOn()) return (await kvGet<Record<string, Record<string, string>>>('project_ui_i18n')) ?? {};
  try { return JSON.parse(fs.readFileSync(UI_STORE, 'utf8')); } catch { return {}; }
};
const uiWrite = async (store: Record<string, Record<string, string>>) => { if (dbOn()) await kvSet('project_ui_i18n', store); else fs.writeFileSync(UI_STORE, JSON.stringify(store)); };

// Private Supabase Storage bucket 'project-files' (path <projectId>/<fileId>.<ext>); used only when the database is on.
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/heic': 'heic', 'application/pdf': 'pdf', 'application/zip': 'zip' };
const sUrl = (p?: string) => `${(process.env.SUPABASE_URL ?? '').replace(/\/$/, '')}/storage/v1/object/project-files${p ? '/' + p : ''}`;
const sAuth = () => ({ apikey: process.env.SUPABASE_SECRET_KEY ?? '', Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY ?? ''}` });
export async function storagePut(p: string, buf: Buffer, type: string): Promise<void> {
  const r = await fetch(sUrl(p), { method: 'POST', headers: { ...sAuth(), 'Content-Type': type, 'x-upsert': 'true' }, body: new Uint8Array(buf) });
  if (!r.ok) throw new Error(`[storage] put → ${r.status}`);
}
export async function storageGet(p: string): Promise<Buffer | null> {
  const r = await fetch(sUrl(p), { headers: sAuth() });
  return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
}
export async function storageDel(p: string): Promise<void> {
  const r = await fetch(sUrl(), { method: 'DELETE', headers: { ...sAuth(), 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [p] }) });
  if (!r.ok) throw new Error(`[storage] delete → ${r.status}`);
}
const clean = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);
const newId = () => crypto.randomBytes(8).toString('hex');

export const PROJECT_SLUG: Record<L, string> = { tr: 'proje', en: 'project', de: 'projekt', el: 'ergo' };
export const projectPath = (lang: L, token: string) => `/${lang}/${PROJECT_SLUG[lang]}/${token}`;

/** Creates the project for a paid offer (once). Returns its token. Called by the offer "paid" action, Stripe and the test payment. */
export async function ensureProject(o: { id: string; lang: L; company: string; contact: string; title: string }): Promise<string> {
  const ex = (await listProjects()).find((p) => p.offerId === o.id);
  if (ex) return ex.token;
  const now = new Date().toISOString();
  const p: Project = {
    id: newId(), token: crypto.randomBytes(18).toString('base64url'), offerId: o.id, lang: o.lang, company: o.company, contact: o.contact, title: o.title,
    createdAt: now, stages: STAGES.map((key, i) => ({ key, status: i === 0 ? 'doing' : 'todo', note: '', at: i === 0 ? now : null })),
    previewUrl: '', messages: [], files: [], requests: [], unreadOwner: 0, unreadClient: 0,
  };
  await saveProject(p);
  return p.token;
}

/** File type from the first bytes (the name/extension is not trusted). */
function sniff(b: Buffer): { type: string; ext: string } | null {
  const h = (n: number) => b.subarray(0, n).toString('hex');
  if (h(8) === '89504e470d0a1a0a') return { type: 'image/png', ext: 'png' };
  if (h(3) === 'ffd8ff') return { type: 'image/jpeg', ext: 'jpg' };
  if (b.subarray(0, 4).toString('latin1') === 'GIF8') return { type: 'image/gif', ext: 'gif' };
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return { type: 'image/webp', ext: 'webp' };
  if (b.subarray(4, 8).toString('latin1') === 'ftyp' && /hei[cf]|mif1|msf1/.test(b.subarray(8, 12).toString('latin1'))) return { type: 'image/heic', ext: 'heic' };
  if (b.subarray(0, 5).toString('latin1') === '%PDF-') return { type: 'application/pdf', ext: 'pdf' };
  if (h(4) === '504b0304') return { type: 'application/zip', ext: 'zip' };
  return null;
}
const safeName = (n: string) => clean(n, 120).replace(/[/\\?%*:|"<>]/g, '_') || 'datei';

interface Deps { requireAdmin: (req: Request, res: Response) => boolean; rateSkip?: () => boolean; getGroq?: () => Groq | null }

export function registerProjects(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });
  const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });
  const raw = express.raw({ type: 'application/octet-stream', limit: MAX_BYTES });
  const LANG_NAME: Record<string, string> = Object.fromEntries(Object.entries(VIEW_LANGS).map(([k, v]) => [k, v.en]));
  const viewOf = (p: Project) => (p.view && VIEW_LANGS[p.view] ? p.view : p.lang);
  /** First open: language from the visitor's country (hosting header) or, locally, from the browser. Never overrides a client choice. */
  const detect = (req: Request): string | null => {
    const c = String(req.headers['x-vercel-ip-country'] ?? req.headers['cf-ipcountry'] ?? '').toUpperCase();
    if (COUNTRY_LANG[c]) return COUNTRY_LANG[c];
    const b = String(req.query.bl ?? '').toLowerCase().slice(0, 2);
    return VIEW_LANGS[b] ? b : null;
  };
  const hash = (t: string) => crypto.createHash('sha1').update(t).digest('hex').slice(0, 16);
  /** Translates texts into `lang` (owner may write Turkish; the client always reads their own language). Cached per project,
   *  so every text is translated once. If the AI is down, the original text is shown. */
  const localize = async (projectId: string, lang: string, texts: string[]): Promise<string[]> => {
    const cache = (await getProject(projectId))?.tr?.[lang] ?? {};
    const need = [...new Set(texts.filter((t) => t && !cache[hash(t)]))].slice(0, 60);
    const groq = d.getGroq?.();
    if (need.length && groq) {
      try {
        const c = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', temperature: 0.1, max_tokens: 6000, response_format: { type: 'json_object' }, reasoning_effort: 'low',
          messages: [{ role: 'system', content: `Translate each text into ${LANG_NAME[lang] ?? 'English'} for a small-business client of a web studio. If a text is already in that language, return it unchanged. Keep numbers, names, URLs, line breaks and brand names. Return a JSON object {"texts": [...]} with the same number of entries in the same order.` },
            { role: 'user', content: JSON.stringify({ texts: need }) }],
        } as any) as any;
        const out = JSON.parse(c.choices[0]?.message?.content ?? '{}');
        const fresh: Record<string, string> = {};
        need.forEach((t, i) => { const v = clean(out.texts?.[i], 4000); if (v) fresh[hash(t)] = v; });
        // re-read before writing: the file may have changed while the AI was answering
        const p = await getProject(projectId);
        if (p) { p.tr = p.tr ?? {}; p.tr[lang] = { ...(p.tr[lang] ?? {}), ...fresh }; await saveProject(p); }
        Object.assign(cache, fresh);
      } catch (e) { console.error('[projects] localize failed', (e as Error).message); }
    }
    return texts.map((t) => (t ? cache[hash(t)] ?? t : t));
  };
  /** Client view in the client's language: everything the owner wrote (messages, step notes, step items) translated. */
  const pubLocal = async (p: Project) => {
    const out = pub(p);
    const src: string[] = [];
    out.messages.forEach((m) => { if (m.from === 'owner' && m.text) src.push(m.text); });
    out.stages.forEach((s) => { if (s.note) src.push(s.note); (s.items ?? []).forEach((i) => src.push(i.text)); });
    const tr = await localize(p.id, viewOf(p), src); let k = 0;
    return { ...out,
      messages: out.messages.map((m) => (m.from === 'owner' && m.text ? { ...m, text: tr[k++] } : m)),
      stages: out.stages.map((s) => { const note = s.note ? tr[k++] : s.note; return { ...s, note, items: (s.items ?? []).map((i) => ({ ...i, text: tr[k++] })) }; }) };
  };

  const pub = (p: Project) => ({
    lang: p.lang, view: viewOf(p), langs: Object.entries(VIEW_LANGS).map(([code, v]) => ({ code, name: v.name, rtl: !!v.rtl })), company: p.company, contact: p.contact, title: p.title, createdAt: p.createdAt, stages: p.stages, previewUrl: p.previewUrl,
    messages: p.messages, files: p.files.map(({ id, name, size, type, from, at, preview }) => ({ id, name, size, type, from, at, preview })),
    requests: p.requests,
  });
  const brief = (p: Project) => ({ id: p.id, company: p.company, contact: p.contact, title: p.title, createdAt: p.createdAt, unreadOwner: p.unreadOwner,
    stage: (p.stages.find((s) => s.status === 'doing') ?? p.stages.filter((s) => s.status === 'done').pop())?.key ?? 'planning',
    openRequests: p.requests.filter((r) => !r.done).length, path: projectPath(p.lang, p.token) });

  const saveFile = async (p: Project, buf: Buffer, name: string, from: 'client' | 'owner'): Promise<PFile | string> => {
    if (!buf?.length) return 'empty';
    if (buf.length > MAX_BYTES) return 'too_large';
    const t = sniff(buf); if (!t) return 'type_not_allowed';
    const f: PFile = { id: newId(), name: safeName(name), size: buf.length, type: t.type, from, at: new Date().toISOString(), preview: false };
    if (dbOn()) {
      try { await storagePut(`${p.id}/${f.id}.${t.ext}`, buf, t.type); } catch (e) { console.error('[projects] upload failed', (e as Error).message); return 'storage_failed'; }
    } else {
      const dir = path.join(FILES, p.id); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${f.id}.${t.ext}`), buf);
    }
    p.files.push(f);
    return f;
  };
  const sendFile = async (res: Response, p: Project, fileId: string) => {
    const f = p.files.find((x) => x.id === fileId); if (!f) return res.status(404).end();
    const hdr = { 'Content-Type': f.type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=300',
      'Content-Disposition': `${f.type.startsWith('image/') ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(f.name)}` };
    if (dbOn()) {
      let buf: Buffer | null = null;
      try { buf = await storageGet(`${p.id}/${f.id}.${EXT[f.type] ?? ''}`); } catch { /* treated as missing */ }
      if (!buf) return res.status(404).end();
      res.set(hdr); return res.send(buf);
    }
    const dir = path.join(FILES, p.id); const file = fs.readdirSync(dir).find((n) => n.startsWith(f.id + '.'));
    if (!file) return res.status(404).end();
    res.set(hdr);
    return res.sendFile(path.join(dir, file));
  };

  // ── Client (token link) ──
  app.get('/api/project/:token', limiter, async (req, res) => {
    const p = await getProjectByToken(String(req.params.token));
    if (!p) return res.status(404).json({ error: 'not_found' });
    let dirty = false;
    if (p.unreadClient) { p.unreadClient = 0; dirty = true; }
    if (!p.viewBy) { const l = detect(req); if (l) { p.view = l; if (['tr', 'en', 'de', 'el'].includes(l)) p.lang = l as L; } p.viewBy = 'auto'; dirty = true; }
    if (dirty) await saveProject(p);
    res.set('Cache-Control', 'no-store'); return res.json(await pubLocal(p));
  });
  app.post('/api/project/:token/ui', limiter, express.json({ limit: '24kb' }), async (req, res) => {
    const p = await getProjectByToken(String(req.params.token)); if (!p) return res.status(404).json({ error: 'not_found' });
    const lang = String(req.body?.lang ?? ''); if (!VIEW_LANGS[lang]) return res.status(400).json({ error: 'bad_lang' });
    const src = req.body?.texts && typeof req.body.texts === 'object' ? req.body.texts as Record<string, unknown> : {};
    const keys = Object.keys(src).slice(0, 80); const texts = keys.map((k) => clean(src[k], 400));
    let store = await uiRead();
    const cache = store[lang] ?? {};
    const need = [...new Set(texts.filter((t) => t && !cache[hash(t)]))];
    const groq = d.getGroq?.();
    if (need.length && groq) {
      try {
        const c = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', temperature: 0.1, max_tokens: 6000, response_format: { type: 'json_object' }, reasoning_effort: 'low',
          messages: [{ role: 'system', content: `Translate these short website interface texts (buttons, labels, hints of a client project page of a small web studio) from English into ${LANG_NAME[lang]}. Polite, natural, short. Keep {name}, numbers, "MB", file types (JPG, PNG, WEBP, GIF, HEIC) and the brand "Chioutworks" unchanged. Return a JSON object {"texts": [...]} with the same number of entries in the same order.` },
            { role: 'user', content: JSON.stringify({ texts: need }) }],
        } as any) as any;
        const out = JSON.parse(c.choices[0]?.message?.content ?? '{}');
        need.forEach((t, i) => { const v = clean(out.texts?.[i], 400); if (v) cache[hash(t)] = v; });
        store = await uiRead();
        store[lang] = { ...(store[lang] ?? {}), ...cache }; await uiWrite(store);
      } catch (e) { console.error('[projects] ui translate failed', (e as Error).message); }
    }
    return res.json({ texts: Object.fromEntries(keys.map((k, i) => [k, cache[hash(texts[i])] ?? texts[i]])) });
  });
  // The client picks the language of their project page; it stays until the project ends (e-mails follow it too)
  app.post('/api/project/:token/lang', limiter, express.json({ limit: '1kb' }), async (req, res) => {
    const p = await getProjectByToken(String(req.params.token));
    if (!p) return res.status(404).json({ error: 'not_found' });
    const l = String(req.body?.lang ?? ''); if (!VIEW_LANGS[l]) return res.status(400).json({ error: 'bad_lang' });
    p.view = l; p.viewBy = 'client';
    if (['tr', 'en', 'de', 'el'].includes(l)) p.lang = l as L;   // site language (link, e-mails) follows when it is one of the 4 site languages
    await saveProject(p); return res.json({ ok: true, path: projectPath(p.lang, p.token) });
  });
  app.post('/api/project/:token/messages', limiter, express.json({ limit: '16kb' }), async (req, res) => {
    const p = await getProjectByToken(String(req.params.token));
    if (!p) return res.status(404).json({ error: 'not_found' });
    const text = clean(req.body?.text, 4000); if (!text) return res.status(400).json({ error: 'empty' });
    p.messages.push({ id: newId(), from: 'client', text, at: new Date().toISOString() }); p.unreadOwner += 1; await saveProject(p);
    return res.json({ ok: true });
  });
  app.post('/api/project/:token/requests', limiter, express.json({ limit: '16kb' }), async (req, res) => {
    const p = await getProjectByToken(String(req.params.token));
    if (!p) return res.status(404).json({ error: 'not_found' });
    const text = clean(req.body?.text, 2000); if (!text) return res.status(400).json({ error: 'empty' });
    p.requests.push({ id: newId(), text, at: new Date().toISOString(), done: false, doneAt: null }); p.unreadOwner += 1; await saveProject(p);
    return res.json({ ok: true });
  });
  app.post('/api/project/:token/files', uploadLimiter, raw, async (req, res) => {
    const p = await getProjectByToken(String(req.params.token));
    if (!p) return res.status(404).json({ error: 'not_found' });
    const buf = req.body as Buffer;
    if (buf?.length > CLIENT_MAX) return res.status(400).json({ error: 'too_large' });
    if (!sniff(buf ?? Buffer.alloc(0))?.type.startsWith('image/')) return res.status(400).json({ error: 'images_only' });
    const mine = p.files.filter((f) => f.from === 'client');
    if (mine.length >= CLIENT_MAX_FILES) return res.status(400).json({ error: 'limit' });
    const last = mine[mine.length - 1]; if (last && Date.now() - Date.parse(last.at) < CLIENT_GAP_MS) return res.status(429).json({ error: 'too_soon' });
    const r = await saveFile(p, buf, String(req.query.name ?? ''), 'client');
    if (typeof r === 'string') return res.status(400).json({ error: r });
    p.messages.push({ id: newId(), from: 'client', text: '', at: r.at, fileId: r.id }); p.unreadOwner += 1; await saveProject(p);
    return res.json({ ok: true, file: r });
  });
  app.get('/api/project/:token/files/:fileId', limiter, async (req, res) => {
    const p = await getProjectByToken(String(req.params.token)); if (!p) return res.status(404).end();
    return sendFile(res, p, String(req.params.fileId));
  });

  // ── Admin ──
  app.get('/api/admin/projects', async (req, res) => { if (!d.requireAdmin(req, res)) return; return res.json({ projects: (await listProjects()).map(brief).reverse() }); });
  app.get('/api/admin/projects/:id', async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const p = await getProject(req.params.id); if (!p) return res.status(404).json({ error: 'not_found' });
    if (p.unreadOwner) { p.unreadOwner = 0; await saveProject(p); }
    // The owner reads what the client wrote in Turkish as well
    const out = pub(p);
    const src = [...out.messages.filter((m) => m.from === 'client' && m.text).map((m) => m.text), ...out.requests.map((r) => r.text)];
    const tr = viewOf(p) === 'tr' ? src : await localize(p.id, 'tr', src); let k = 0;
    return res.json({ project: { ...out, id: p.id, offerId: p.offerId, path: projectPath(p.lang, p.token), viewName: VIEW_LANGS[viewOf(p)]?.name, viewBy: p.viewBy ?? null,
      messages: out.messages.map((m) => (m.from === 'client' && m.text ? { ...m, textTr: tr[k++] } : m)),
      requests: out.requests.map((r) => ({ ...r, textTr: tr[k++] })) } });
  });
  app.patch('/api/admin/projects/:id', express.json({ limit: '32kb' }), async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const p = await getProject(req.params.id); if (!p) return res.status(404).json({ error: 'not_found' });
    const b = req.body ?? {}; const now = new Date().toISOString();
    if (typeof b.previewUrl === 'string') { const u = clean(b.previewUrl, 400); p.previewUrl = /^https?:\/\//.test(u) || !u ? u : ''; }
    if (b.stage && STAGES.includes(b.stage.key)) {
      const s = p.stages.find((x) => x.key === b.stage.key)!;
      if (['todo', 'doing', 'done'].includes(b.stage.status) && s.status !== b.stage.status) {
        s.status = b.stage.status; s.at = now;
        // a finished step starts the next one, so the client always sees where the project is
        if (s.status === 'done' && !p.stages.some((x) => x.status === 'doing')) { const next = p.stages.find((x) => x.status === 'todo'); if (next) { next.status = 'doing'; next.at = now; } }
      }
      if (typeof b.stage.note === 'string') s.note = clean(b.stage.note, 600);
      if (Array.isArray(b.stage.items)) s.items = b.stage.items.slice(0, 40).map((x: any) => ({ id: clean(x?.id, 20) || newId(), text: clean(x?.text, 300), done: !!x?.done })).filter((x: StageItem) => x.text);
    }
    if (b.requestDone) { const r = p.requests.find((x) => x.id === b.requestDone.id); if (r) { r.done = !!b.requestDone.done; r.doneAt = r.done ? now : null; } }
    if (b.preview) { const f = p.files.find((x) => x.id === b.preview.id); if (f && f.type.startsWith('image/')) f.preview = !!b.preview.on; }
    p.unreadClient += 1; await saveProject(p);
    return res.json({ ok: true });
  });
  // Owner writes in Turkish → the client's language (texts of one step: note + items). Not saved here; the admin saves.
  app.post('/api/admin/projects/:id/translate', express.json({ limit: '32kb' }), async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const groq = d.getGroq?.(); if (!groq) return res.status(503).json({ error: 'ai_unavailable' });
    const p = await getProject(req.params.id); if (!p) return res.status(404).json({ error: 'not_found' });
    const texts: string[] = (Array.isArray(req.body?.texts) ? req.body.texts : []).slice(0, 41).map((t: unknown) => clean(t, 600));
    const target = LANG_NAME[viewOf(p)] ?? 'English';
    try {
      const c = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', temperature: 0.2, max_tokens: 3000, response_format: { type: 'json_object' }, reasoning_effort: 'low',
        messages: [{ role: 'system', content: `Translate short project notes for a small-business client into ${target}. Keep it natural and brief. Keep numbers, names, URLs and brand names unchanged. Return a JSON object {"texts": [...]} with the same number of entries in the same order.` },
          { role: 'user', content: JSON.stringify({ texts }) }],
      } as any) as any;
      const out = JSON.parse(c.choices[0]?.message?.content ?? '{}');
      return res.json({ texts: texts.map((t, i) => clean(out.texts?.[i], 600) || t) });
    } catch (e) { console.error('[projects] translate failed', (e as Error).message); return res.status(502).json({ error: 'ai_failed' }); }
  });
  app.post('/api/admin/projects/:id/messages', express.json({ limit: '16kb' }), async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const p = await getProject(req.params.id); if (!p) return res.status(404).json({ error: 'not_found' });
    const text = clean(req.body?.text, 4000); if (!text) return res.status(400).json({ error: 'empty' });
    p.messages.push({ id: newId(), from: 'owner', text, at: new Date().toISOString() }); p.unreadClient += 1; await saveProject(p);
    return res.json({ ok: true });
  });
  app.post('/api/admin/projects/:id/files', raw, async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const p = await getProject(req.params.id); if (!p) return res.status(404).json({ error: 'not_found' });
    const r = await saveFile(p, req.body as Buffer, String(req.query.name ?? ''), 'owner');
    if (typeof r === 'string') return res.status(400).json({ error: r });
    if (r.type.startsWith('image/') && req.query.preview === '1') r.preview = true;
    p.messages.push({ id: newId(), from: 'owner', text: '', at: r.at, fileId: r.id }); p.unreadClient += 1; await saveProject(p);
    return res.json({ ok: true, file: r });
  });
  // Owner only: remove a message, a file (with its chat bubble) or a change request. Files are deleted from disk too.
  app.delete('/api/admin/projects/:id/:kind/:itemId', async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const p = await getProject(req.params.id); if (!p) return res.status(404).json({ error: 'not_found' });
    const id = String(req.params.itemId);
    const dropFile = async (fid: string) => {
      const gone = p.files.find((f) => f.id === fid);
      p.files = p.files.filter((f) => f.id !== fid); p.messages = p.messages.filter((m) => m.fileId !== fid);
      if (dbOn()) { if (gone) try { await storageDel(`${p.id}/${fid}.${EXT[gone.type] ?? ''}`); } catch (e) { console.error('[projects] file delete failed', (e as Error).message); } return; }
      const dir = path.join(FILES, p.id);
      try { for (const n of fs.readdirSync(dir)) if (n.startsWith(fid + '.')) fs.unlinkSync(path.join(dir, n)); } catch { /* no folder */ }
    };
    if (req.params.kind === 'messages') { const m = p.messages.find((x) => x.id === id); if (!m) return res.status(404).json({ error: 'not_found' }); if (m.fileId) await dropFile(m.fileId); else p.messages = p.messages.filter((x) => x.id !== id); }
    else if (req.params.kind === 'files') { if (!p.files.some((f) => f.id === id)) return res.status(404).json({ error: 'not_found' }); await dropFile(id); }
    else if (req.params.kind === 'requests') { if (!p.requests.some((r) => r.id === id)) return res.status(404).json({ error: 'not_found' }); p.requests = p.requests.filter((r) => r.id !== id); }
    else return res.status(400).json({ error: 'bad_kind' });
    await saveProject(p); return res.json({ ok: true });
  });
  app.get('/api/admin/projects/:id/files/:fileId', async (req, res) => {
    if (!d.requireAdmin(req, res)) return;
    const p = await getProject(req.params.id); if (!p) return res.status(404).end();
    return sendFile(res, p, String(req.params.fileId));
  });
}
