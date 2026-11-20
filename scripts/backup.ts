// npm run backup [-- --decrypt-latest]. Local plain-gzip export (backups/, git-ignored, mode 600). Prints only names + counts.
import '../server/env.js';
import fs from 'fs';
import zlib from 'zlib';
import { dbOn } from '../server/db.js';
import { exportAll, listSnapshots, downloadSnapshot, decryptToGzip } from '../server/backup.js';

if (!dbOn()) { console.error('Supabase is not configured in .env'); process.exit(1); }
fs.mkdirSync('backups', { recursive: true, mode: 0o700 });
const d = new Date(); const p = (n: number) => String(n).padStart(2, '0');
const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;

if (process.argv.includes('--decrypt-latest')) {
  const [latest] = await listSnapshots();
  if (!latest) { console.error('No nightly snapshot in the bucket yet'); process.exit(1); }
  const out = `backups/nightly-${latest.name.replace('.json.gz.enc', '')}.json.gz`;
  fs.writeFileSync(out, decryptToGzip(await downloadSnapshot(latest.name)), { mode: 0o600 }); fs.chmodSync(out, 0o600);
  const dump = JSON.parse(zlib.gunzipSync(fs.readFileSync(out)).toString());
  for (const [t, rows] of Object.entries(dump.tables as Record<string, unknown[]>)) console.log(`${t}: ${rows.length}`);
  console.log(`decrypted: ${out}`);
} else {
  const { dump, counts, failed } = await exportAll();
  for (const [t, n] of Object.entries(counts)) console.log(`${t}: ${n}`);
  if (failed.length) console.error(`FAILED tables: ${failed.join(', ')}`);
  const out = `backups/chioutworks-${stamp}.json.gz`;
  fs.writeFileSync(out, zlib.gzipSync(JSON.stringify(dump)), { mode: 0o600 }); fs.chmodSync(out, 0o600);
  console.log(`written: ${out}`);
  if (failed.length) process.exit(1);
}
