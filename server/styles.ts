// "Choose your style" (owner, 2026-11-17): after the intake form or a voice call the visitor can like style cards and name
// example websites. The result is attached to the request and shown to the owner (and to the AI offer planner) in Turkish.
// Storage: data/styles.json. Moves to Supabase with the rest before go-live.
import type { Express, Request, Response } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbOn, dbSelect, dbUpsert } from './db.js';
import { PALETTES, FONT_PAIRS, customPalette } from '../src/data/styleOptions.js';

const STORE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/styles.json');
type L = 'tr' | 'en' | 'de' | 'el';
export const STYLE_SLUG: Record<L, string> = { tr: 'tarz', en: 'style', de: 'stil', el: 'styl' };
// same ids and owner-facing tags as src/data/stylePresets.ts
const TAGS: Record<string, string> = {
  minimal: 'sade, açık renk, bol boşluk', lux: 'koyu, lüks, altın vurgu, zarif yazı', photo: 'büyük fotoğraf, görsel ağırlıklı',
  bold: 'canlı renk, cesur, büyük başlık', corporate: 'kurumsal, lacivert, düzenli', warm: 'samimi, sıcak tonlar, yuvarlak hatlar',
  nature: 'doğal, yeşil tonlar, sakin', tech: 'modern, koyu, teknolojik, keskin',
};
const WHAT: Record<string, string> = { colors: 'renklerini', layout: 'düzenini', photos: 'fotoğraflarını', all: 'her şeyini' };

export interface StyleRec {
  token: string; ref: string; lang: L; createdAt: string; doneAt: string | null;
  likes: string[]; dislikes: string[]; refs: { url: string; what: string }[]; note: string;
  palette?: { id: string } | { custom: { accent: string; dark: boolean; bg?: string; surface?: string; text?: string; muted?: string } } | null; font?: string | null;
}
const PAL_TR: Record<string, string> = { bg: 'zemin', surface: 'yüzey', text: 'yazı', muted: 'ikincil yazı', accent: 'vurgu', onAccent: 'vurgu üstü yazı' };
const palText = (pal: Record<string, string>) => Object.entries(pal).map(([k, v]) => `${PAL_TR[k] ?? k} ${v}`).join(', ');
const read = (): StyleRec[] => { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { return []; } };
const write = (all: StyleRec[]) => { fs.mkdirSync(path.dirname(STORE), { recursive: true }); const t = STORE + '.tmp'; fs.writeFileSync(t, JSON.stringify(all, null, 2)); fs.renameSync(t, STORE); };
const HEX = /^#[0-9a-f]{6}$/i;
const clean = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

export const stylePath = (lang: L, token: string) => `/${lang}/${STYLE_SLUG[lang]}/${token}`;
/** Creates (once) the style link for a request reference such as "intake:<id>" or "voice:<sessionId>". */
const q = async (filter: string) => (await dbSelect<{ data: StyleRec }>('styles', `select=data&${filter}`)).map((r) => r.data);
const all_ = async (): Promise<StyleRec[]> => (dbOn() ? q('order=created_at.asc') : read());
const getByToken = async (token: string) => (dbOn() ? (await q(`token=eq.${encodeURIComponent(token)}&limit=1`))[0] ?? null : read().find((x) => x.token === token) ?? null);
async function saveStyle(s: StyleRec): Promise<void> {
  if (dbOn()) return dbUpsert('styles', { token: s.token, ref: s.ref, done_at: s.doneAt, created_at: s.createdAt, data: s }, 'token');
  const all = read(); const k = all.findIndex((x) => x.token === s.token);
  if (k < 0) all.push(s); else all[k] = s;
  write(all);
}
export async function ensureStyle(ref: string, lang: L): Promise<StyleRec> {
  const ex = (await all_()).find((s) => s.ref === ref); if (ex) return ex;
  const s: StyleRec = { token: crypto.randomBytes(16).toString('base64url'), ref, lang, createdAt: new Date().toISOString(), doneAt: null, likes: [], dislikes: [], refs: [], note: '' };
  await saveStyle(s); return s;
}
export const styleFor = async (refs: string[]) => { const all = await all_(); return refs.map((r) => all.find((s) => s.ref === r && s.doneAt)).find(Boolean) ?? null; };
/** Owner-facing summary in Turkish (admin + AI offer planner). */
export function styleSummary(s: StyleRec | null): string {
  if (!s?.doneAt) return '';
  const parts = [`Beğendiği tarz: ${s.likes.map((k) => TAGS[k] ?? k).join(' / ') || '—'}`];
  if (s.dislikes.length) parts.push(`Beğenmediği: ${s.dislikes.map((k) => TAGS[k] ?? k).join(' / ')}`);
  if (s.palette && 'id' in s.palette) { const p = PALETTES.find((x) => x.id === (s.palette as { id: string }).id); if (p) parts.push(`Renk paleti: ${p.name.tr} (${palText(p.pal)})`); }
  else if (s.palette && 'custom' in s.palette) { const c = s.palette.custom; const full = { ...customPalette(c.accent, c.dark), ...(c.bg ? { bg: c.bg } : {}), ...(c.surface ? { surface: c.surface } : {}), ...(c.text ? { text: c.text } : {}), ...(c.muted ? { muted: c.muted } : {}) }; parts.push(`Kendi paleti (${c.dark ? 'koyu' : 'açık'} temel): ${palText(full)}`); }
  if (s.font) { const f = FONT_PAIRS.find((x) => x.id === s.font); if (f) parts.push(`Yazı tipi: ${f.name.tr} (başlık ${f.head}, metin ${f.body})`); }
  if (s.refs.length) parts.push(`Örnek site: ${s.refs.map((r) => `${r.url}${r.what ? ` (${WHAT[r.what] ?? r.what} beğendi)` : ''}`).join(', ')}`);
  if (s.note) parts.push(`Not: ${s.note}`);
  return parts.join(' · ');
}

interface Deps {
  requireAdmin: (req: Request, res: Response) => boolean | Promise<boolean>; rateSkip?: () => boolean;
  /** Proves the visitor owns this request: intake token, or voice session id + secret. Returns the reference + language. */
  /** request id behind a reference (intake → its request), so the admin can show the style on the request */
  requestOf?: (ref: string) => string | null | Promise<string | null>;
  verify: (b: { kind?: string; token?: string; sessionId?: string; secret?: string; lang?: string }) => Promise<{ ref: string; lang: L } | null>;
}
import { validate as v, z, s, bool, anyObj, tokenP } from './validate.js';
const styStartS = z.object({ kind: s(20), token: s(200), sessionId: s(64), secret: s(200), lang: s(8) });
const styS = z.object({ likes: z.array(z.any()).max(40).nullish(), dislikes: z.array(z.any()).max(40).nullish(), refs: z.array(z.any()).max(10).nullish(), palette: z.any().optional(), note: s(2000) }).passthrough();

export function registerStyles(app: Express, d: Deps) {
  const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false, skip: d.rateSkip });
  app.post('/api/style/start', limiter, express.json({ limit: '2kb' }), v(styStartS), async (req, res) => {
    const v = await d.verify(req.body ?? {}); if (!v) return res.status(404).json({ error: 'not_found' });
    const s = await ensureStyle(v.ref, v.lang); return res.json({ token: s.token, path: stylePath(s.lang, s.token), done: !!s.doneAt });
  });
  app.get('/api/style/:token', limiter, async (req, res) => {
    const s = await getByToken(String(req.params.token)); if (!s) return res.status(404).json({ error: 'not_found' });
    res.set('Cache-Control', 'no-store');
    return res.json({ lang: s.lang, done: !!s.doneAt, likes: s.likes, dislikes: s.dislikes, refs: s.refs, note: s.note, palette: s.palette ?? null, font: s.font ?? null });
  });
  app.post('/api/style/:token', limiter, express.json({ limit: '8kb' }), v(styS, tokenP), async (req, res) => {
    const s = await getByToken(String(req.params.token)); if (!s) return res.status(404).json({ error: 'not_found' });
    const b = req.body ?? {};
    const ids = (v: unknown) => [...new Set((Array.isArray(v) ? v : []).map((x) => clean(x, 20)).filter((x) => TAGS[x]))].slice(0, 8);
    const likes = ids(b.likes); if (!likes.length) return res.status(400).json({ error: 'min_one' });
    s.likes = likes; s.dislikes = ids(b.dislikes).filter((x) => !likes.includes(x));
    s.refs = (Array.isArray(b.refs) ? b.refs : []).slice(0, 2).map((r: any) => ({ url: clean(r?.url, 200), what: WHAT[r?.what] ? String(r.what) : '' }))
      .filter((r: { url: string }) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(r.url));
    const pb = b.palette ?? null;
    s.palette = pb && typeof pb.id === 'string' && PALETTES.some((x) => x.id === pb.id) ? { id: pb.id }
      : pb?.custom && HEX.test(String(pb.custom.accent)) ? { custom: { accent: String(pb.custom.accent).toLowerCase(), dark: pb.custom.dark === true,
        ...Object.fromEntries((['bg', 'surface', 'text', 'muted'] as const).filter((k) => HEX.test(String(pb.custom[k]))).map((k) => [k, String(pb.custom[k]).toLowerCase()])) } } : null;
    s.font = typeof b.font === 'string' && FONT_PAIRS.some((x) => x.id === b.font) ? b.font : null;
    s.note = clean(b.note, 600); s.doneAt = new Date().toISOString(); await saveStyle(s);
    return res.json({ ok: true });
  });
  app.get('/api/admin/styles', async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    const done = (await all_()).filter((s) => s.doneAt);
    return res.json({ styles: await Promise.all(done.map(async (s) => ({ ref: s.ref, requestId: (await d.requestOf?.(s.ref)) ?? null, summary: styleSummary(s), at: s.doneAt }))) });
  });
}
