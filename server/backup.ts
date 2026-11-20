// Backups (owner, 2026-11-20). Nightly encrypted snapshot of all app tables into the PRIVATE storage bucket 'backups'.
// Key: HKDF-SHA256 over ABUSE_SALT + SUPABASE_SECRET_KEY (no extra secret). Rotating either makes old snapshots unreadable.
// File layout: iv(12) | authTag(16) | AES-256-GCM(gzip(json)). Logs only counts, never rows.
import crypto from 'crypto';
import zlib from 'zlib';
import { dbSelect } from './db.js';

export const BACKUP_TABLES = ['abuse_msgs', 'abuse_pauses', 'abuse_perm', 'abuse_strikes', 'admin_sessions', 'affiliate_clicks', 'analytics_events', 'app_errors', 'consents', 'daily_salts', 'demo_access', 'intakes', 'kv', 'newsletter_subscribers', 'offers', 'projects', 'quote_requests', 'styles', 'voice_sessions'];
const BUCKET = 'backups';
const KEEP = 7;
const base = () => `${(process.env.SUPABASE_URL ?? '').replace(/\/$/, '')}/storage/v1`;
const auth = () => ({ apikey: process.env.SUPABASE_SECRET_KEY ?? '', Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY ?? ''}` });
const J = { 'Content-Type': 'application/json' };

export type Dump = { version: 1; createdAt: string; tables: Record<string, Record<string, unknown>[]> };

/** Reads every app table (paged by dbSelect). A failing table is skipped and reported in `failed`. */
export async function exportAll(): Promise<{ dump: Dump; counts: Record<string, number>; failed: string[] }> {
  const dump: Dump = { version: 1, createdAt: new Date().toISOString(), tables: {} };
  const counts: Record<string, number> = {}; const failed: string[] = [];
  for (const t of BACKUP_TABLES) {
    try { dump.tables[t] = await dbSelect(t, 'select=*'); counts[t] = dump.tables[t].length; } catch { failed.push(t); }
  }
  return { dump, counts, failed };
}

const key = () => Buffer.from(crypto.hkdfSync('sha256', `${process.env.ABUSE_SALT ?? ''}${process.env.SUPABASE_SECRET_KEY ?? ''}`, '', 'chioutworks-backup-v1', 32));
export function encryptDump(dump: Dump): Buffer {
  const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(zlib.gzipSync(JSON.stringify(dump))), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]);
}
/** Returns the gzip bytes (plain .json.gz content). */
export function decryptToGzip(buf: Buffer): Buffer {
  const d = crypto.createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12)); d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]);
}

async function ensureBucket(): Promise<void> {
  const r = await fetch(`${base()}/bucket`, { method: 'POST', headers: { ...auth(), ...J }, body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }) });
  if (!r.ok && r.status !== 409 && !(await r.text()).includes('already exists')) throw new Error(`[backup] bucket → ${r.status}`);
}
export async function listSnapshots(): Promise<{ name: string; size: number }[]> {
  const r = await fetch(`${base()}/object/list/${BUCKET}`, { method: 'POST', headers: { ...auth(), ...J }, body: JSON.stringify({ prefix: 'backups', limit: 200, sortBy: { column: 'name', order: 'desc' } }) });
  if (!r.ok) throw new Error(`[backup] list → ${r.status}`);
  const rows = (await r.json()) as { name: string; metadata?: { size?: number } }[];
  return rows.filter((o) => o.name.endsWith('.json.gz.enc')).map((o) => ({ name: o.name, size: o.metadata?.size ?? 0 })).sort((a, b) => b.name.localeCompare(a.name));
}
export async function downloadSnapshot(name: string): Promise<Buffer> {
  const r = await fetch(`${base()}/object/${BUCKET}/backups/${name}`, { headers: auth() });
  if (!r.ok) throw new Error(`[backup] get → ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

/** Nightly job: export, encrypt, upload backups/YYYY-MM-DD.json.gz.enc, keep newest 7. */
export async function runNightlySnapshot(): Promise<{ file: string; bytes: number; tables: number; rows: number; failed: string[]; pruned: number }> {
  const { dump, counts, failed } = await exportAll();
  if (failed.length > BACKUP_TABLES.length / 2) throw new Error(`[backup] too many tables failed (${failed.length})`);
  await ensureBucket();
  const file = `${dump.createdAt.slice(0, 10)}.json.gz.enc`; const buf = encryptDump(dump);
  const r = await fetch(`${base()}/object/${BUCKET}/backups/${file}`, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/octet-stream', 'x-upsert': 'true' }, body: new Uint8Array(buf) });
  if (!r.ok) throw new Error(`[backup] upload → ${r.status}`);
  const old = (await listSnapshots()).slice(KEEP);
  if (old.length) {
    const d = await fetch(`${base()}/object/${BUCKET}`, { method: 'DELETE', headers: { ...auth(), ...J }, body: JSON.stringify({ prefixes: old.map((o) => `backups/${o.name}`) }) });
    if (!d.ok) throw new Error(`[backup] prune → ${d.status}`);
  }
  return { file, bytes: buf.length, tables: Object.keys(counts).length, rows: Object.values(counts).reduce((a, b) => a + b, 0), failed, pruned: old.length };
}
