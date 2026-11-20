// npm run restore-check. Validates the newest local backup against live Supabase. Real restore test: kv only (idempotent upsert
// of identical rows, counts must not change). All other tables: dry-run (row keys must match live columns). Prints counts only.
import '../server/env.js';
import fs from 'fs';
import zlib from 'zlib';
import { dbOn, dbSelect, dbUpsert } from '../server/db.js';

const fail = (m: string): never => { console.error(`FAIL: ${m}`); process.exit(1); };
if (!dbOn()) fail('Supabase is not configured in .env');
const files = fs.existsSync('backups') ? fs.readdirSync('backups').filter((f) => f.endsWith('.json.gz')).sort() : [];
const newest = files.filter((f) => f.startsWith('chioutworks-')).pop() ?? files.pop();
if (!newest) fail('no local backup (run npm run backup)');
let dump: { version: number; tables: Record<string, Record<string, unknown>[]> };
try { dump = JSON.parse(zlib.gunzipSync(fs.readFileSync(`backups/${newest}`)).toString()); } catch { fail('backup is not valid gzip JSON'); }
if (dump!.version !== 1 || typeof dump!.tables !== 'object') fail('unexpected backup format');
console.log(`backup: backups/${newest}`);
let bad = 0;
for (const [t, rows] of Object.entries(dump!.tables)) {
  const live = await dbSelect(t, 'select=*');
  const cols = new Set(Object.keys(live[0] ?? rows[0] ?? {}));
  const schemaOk = rows.every((r) => Object.keys(r).every((k) => cols.has(k)));
  // live may have grown since the backup; fewer live rows than backup rows is worth a warning, not a failure
  const note = live.length < rows.length ? ' (live has fewer rows than backup)' : '';
  console.log(`${t}: backup=${rows.length} live=${live.length} schema=${schemaOk ? 'ok' : 'MISMATCH'}${note}`);
  if (!schemaOk) bad++;
}
const kv = dump!.tables.kv ?? [];
const before = (await dbSelect('kv', 'select=key')).length;
if (kv.length) await dbUpsert('kv', kv, 'key');
const after = (await dbSelect('kv', 'select=key')).length;
const grew = after - before;
console.log(`kv real restore: upserted=${kv.length} live before=${before} after=${after}`);
if (grew !== 0) { console.error('FAIL: kv count changed during restore'); bad++; }
if (bad) process.exit(1);
console.log('restore-check: OK');
