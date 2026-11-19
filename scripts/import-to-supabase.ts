// One-off import of the local file stores (data/, git-ignored, personal data) into Supabase.
// Usage: npx tsx scripts/import-to-supabase.ts [--apply]   (default: dry run). Prints only store names and counts, never content.
import '../server/env.ts';
import fs from 'node:fs';
import path from 'node:path';
import { dbOn, dbUpsert, dbInsert, dbSelect, kvSet } from '../server/db.ts';
import { storagePut } from '../server/projects.ts';

const APPLY = process.argv.includes('--apply');
const D = path.join(import.meta.dirname, '../data');
const KEEP_DAYS = 400, DAY = 864e5, HOUR = 36e5;
const iso = (ms: number) => new Date(ms).toISOString();
const day = (ms: number) => iso(ms).slice(0, 10);
if (!dbOn()) { console.error('Supabase is not configured (SUPABASE_URL / SUPABASE_SECRET_KEY in .env). Aborting.'); process.exit(2); }

const exists = (f: string) => fs.existsSync(path.join(D, f));
const readJson = <T,>(f: string): T | null => { try { return JSON.parse(fs.readFileSync(path.join(D, f), 'utf8')) as T; } catch { return null; } };
const readLines = (f: string): any[] => { try { return fs.readFileSync(path.join(D, f), 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
const base = () => (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
const hdr = () => ({ apikey: process.env.SUPABASE_SECRET_KEY ?? '', Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY ?? ''}` });
async function count(table: string): Promise<number> {
  const r = await fetch(`${base()}/rest/v1/${table}?select=*`, { headers: { ...hdr(), Prefer: 'count=exact', Range: '0-0', 'Range-Unit': 'items' } });
  if (!r.ok) throw new Error(`count ${table} → ${r.status}`);
  return Number(r.headers.get('content-range')?.split('/')[1] ?? 0);
}
async function bucketCount(): Promise<number> {
  let n = 0;
  const ls = async (prefix: string) => {
    const r = await fetch(`${base()}/storage/v1/object/list/project-files`, { method: 'POST', headers: { ...hdr(), 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix, limit: 1000 }) });
    if (!r.ok) throw new Error(`bucket list → ${r.status}`);
    for (const e of (await r.json()) as { name: string; id: string | null }[]) { if (e.id) n++; else await ls(prefix ? `${prefix}/${e.name}` : e.name); }
  };
  await ls(''); return n;
}
const chunks = <T,>(a: T[], n = 500) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

interface Store { name: string; file: number; write: () => Promise<void>; after: () => Promise<number>; expected?: number; note?: string; skip?: string }
const stores: Store[] = [];
const kv = (name: string, file: string, key: string) => {
  const v = readJson<unknown>(file); if (v == null) return;
  stores.push({ name, file: 1, write: () => kvSet(key, v), after: async () => (await dbSelect('kv', `select=key&key=eq.${key}`)).length });
};
const upsertStore = (name: string, file: string, table: string, conflict: string, row: (r: any) => object, keep: (r: any) => boolean = () => true) => {
  const all = readJson<any[]>(file); if (!all) return;
  const rows = all.filter(keep);
  stores.push({
    name, file: all.length, expected: rows.length, note: rows.length !== all.length ? `${all.length - rows.length} skipped` : undefined,
    write: async () => { for (const c of chunks(rows)) await dbUpsert(table, c.map(row), conflict); }, after: () => count(table),
  });
};
/** Identity-key tables: only written when the target is empty. */
const identityStore = (name: string, table: string, fileCount: number, rows: object[]) => {
  stores.push({ name, file: fileCount, expected: fileCount, write: async () => { if (await count(table)) { console.log(`${name}: already imported, skipped`); return; } for (const c of chunks(rows, 200)) await dbInsert(table, c); }, after: () => count(table) });
};

upsertStore('quote_requests', 'quote-requests.json', 'quote_requests', 'id', (r) => ({ id: r.id, created_at: r.createdAt, data: r }));
upsertStore('voice_sessions', 'voice-sessions.json', 'voice_sessions', 'id', (r) => ({ id: r.id, created_at: r.createdAt, data: r }));
upsertStore('intakes', 'intakes.json', 'intakes', 'id', (i) => ({ id: i.id, token: i.token, request_id: i.requestId ?? null, status: i.status, created_at: i.createdAt, updated_at: i.updatedAt ?? new Date().toISOString(), data: i }));
upsertStore('styles', 'styles.json', 'styles', 'token', (s) => ({ token: s.token, ref: s.ref, done_at: s.doneAt, created_at: s.createdAt, data: s }));
upsertStore('offers', 'offers.json', 'offers', 'id', (o) => ({ id: o.id, token: o.token, intake_id: o.intakeId, request_id: o.requestId, status: o.status, created_at: o.createdAt, data: o }));
upsertStore('projects', 'projects.json', 'projects', 'id', (p) => ({ id: p.id, token: p.token, offer_id: p.offerId, created_at: p.createdAt, data: p }));
upsertStore('newsletter_subscribers', 'newsletter.json', 'newsletter_subscribers', 'id', (s) => ({ id: s.id, email: s.email, token: s.token, status: s.status, data: s }));
upsertStore('demo_access', 'demo-access.json', 'demo_access', 'code', (l) => ({ code: l.code, email: l.email, expires_at: iso(l.expiresAt), data: l }), (l) => l.expiresAt >= Date.now() - 30 * DAY);
kv('kv intake_translations', 'intake-translations.json', 'intake_translations');
kv('kv project_ui_i18n', 'project-ui-i18n.json', 'project_ui_i18n');
kv('kv availability', 'availability.json', 'availability');
kv('kv fx_rates', 'rates.json', 'fx_rates');
kv('kv tts_usage', 'tts-usage.json', 'tts_usage');
kv('kv live_usage', 'gemini-live-usage.json', 'live_usage');

const consents = readJson<any[]>('consents.json');
if (consents) identityStore('consents', 'consents', consents.length, consents.map((r) => ({ consent_id: r.id, at: r.at, data: r })));
const clicks = readLines('affiliate-clicks.jsonl');
if (clicks.length) identityStore('affiliate_clicks', 'affiliate_clicks', clicks.length, clicks.map((c) => ({ t: iso(c.t), data: c })));
const evs: any[] = [];
const aDir = path.join(D, 'analytics');
if (fs.existsSync(aDir)) for (const f of fs.readdirSync(aDir).filter((x) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(x))) evs.push(...readLines(`analytics/${f}`));
const minDay = day(Date.now() - KEEP_DAYS * DAY);
const evKeep = evs.filter((e) => day(e.t) >= minDay);
if (evs.length) {
  // Backfill: only events strictly older than the earliest row already in Supabase (no duplicates on re-run).
  const first = (await dbSelect<{ t: string }>('analytics_events', 'select=t&order=t.asc&limit=1'))[0]?.t;
  const cut = first ? Date.parse(first) : Infinity;
  const fresh = evKeep.filter((e) => e.t < cut);
  const existing = await count('analytics_events');
  stores.push({
    name: 'analytics_events', file: evs.length, expected: existing + fresh.length,
    note: `${evs.length - evKeep.length} outside KEEP_DAYS, ${evKeep.length - fresh.length} not older than existing rows, ${existing} already in supabase`,
    write: async () => { for (const c of chunks(fresh)) await dbInsert('analytics_events', c.map((e) => ({ day: day(e.t), t: iso(e.t), data: e }))); },
    after: () => count('analytics_events'),
  });
}

// Uploads → Storage
const upDir = path.join(D, 'uploads/projects');
const files: string[] = [];
if (fs.existsSync(upDir)) for (const p of fs.readdirSync(upDir)) { const d = path.join(upDir, p); if (fs.statSync(d).isDirectory()) for (const f of fs.readdirSync(d)) files.push(`${p}/${f}`); }
const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', heic: 'image/heic', pdf: 'application/pdf', zip: 'application/zip' };
if (files.length) stores.push({ name: 'storage project-files', file: files.length, write: async () => { for (const f of files) await storagePut(f, fs.readFileSync(path.join(upDir, f)), MIME[f.split('.').pop() ?? ''] ?? 'application/octet-stream'); }, after: bucketCount });

// Abuse (only when the file salt equals ABUSE_SALT)
const ab = readJson<any>('abuse.json');
if (ab) {
  if (!process.env.ABUSE_SALT || ab.salt !== process.env.ABUSE_SALT) console.log('abuse: SKIPPED (file salt differs from ABUSE_SALT; old hashes would never match visitors)');
  else {
    const now = Date.now();
    const ev = (ab.ev ?? []).filter((e: any) => e.t > now - 48 * HOUR), st = (ab.strikes ?? []).filter((e: any) => e.t > now - 30 * DAY),
      pa = (ab.pauses ?? []).filter((e: any) => e.until > now), pe = (ab.perm ?? []).filter((e: any) => e.t > now - 365 * DAY);
    identityStore('abuse_msgs', 'abuse_msgs', ev.length, ev.map((e: any) => ({ h: e.h.slice(0, 1), t: iso(e.t) })));
    identityStore('abuse_strikes', 'abuse_strikes', st.length, st.map((e: any) => ({ h: e.h, t: iso(e.t) })));
    identityStore('abuse_pauses', 'abuse_pauses', pa.length, pa.map((e: any) => ({ k: e.k, until: iso(e.until) })));
    identityStore('abuse_perm', 'abuse_perm', pe.length, pe.map((e: any) => ({ k: e.k, t: iso(e.t) })));
  }
}

console.log(APPLY ? 'APPLY mode' : 'DRY RUN (use --apply to write)');
if (!APPLY) { for (const s of stores) console.log(`${s.name}: file ${s.file} → would write ${s.expected ?? s.file}${s.note ? ` (${s.note})` : ''}`); process.exit(0); }
let bad = 0;
for (const s of stores) { await s.write(); }
for (const s of stores) {
  const m = await s.after(), want = s.expected ?? s.file, ok = m === want;
  if (!ok) bad++;
  console.log(`${s.name}: file ${s.file} / supabase ${m}${s.note ? ` (${s.note})` : ''}${ok ? '' : '  MISMATCH (expected ' + want + ')'}`);
}
process.exit(bad ? 1 : 0);
