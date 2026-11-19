// Supabase data layer (owner, 2026-11-19). Server-only: uses SUPABASE_URL + SUPABASE_SECRET_KEY from .env (never sent
// to the browser). When these are not set, callers keep using their local JSON files, so the site works the same
// locally and on Vercel. Talks to the PostgREST API directly (no extra dependency). Tables: see Supabase migrations.
const url = () => (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
const key = () => process.env.SUPABASE_SECRET_KEY ?? '';

/** True when the Supabase store is configured (secret key of the right kind present). */
export const dbOn = () => Boolean(url()) && key().startsWith('sb_secret_');

async function call(path: string, init: RequestInit & { prefer?: string } = {}): Promise<Response> {
  const headers: Record<string, string> = { apikey: key(), 'Content-Type': 'application/json' };
  if (init.prefer) headers.Prefer = init.prefer;
  const r = await fetch(`${url()}/rest/v1/${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string> | undefined) } });
  if (!r.ok) throw new Error(`[db] ${init.method ?? 'GET'} ${path.split('?')[0]} → ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r;
}

/** Insert one or more rows. */
export async function dbInsert(table: string, rows: object | object[]): Promise<void> {
  await call(table, { method: 'POST', body: JSON.stringify(rows), prefer: 'return=minimal' });
}
/** Insert or update by primary key / unique column(s). */
export async function dbUpsert(table: string, rows: object | object[], onConflict?: string): Promise<void> {
  await call(`${table}${onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : ''}`, {
    method: 'POST', body: JSON.stringify(rows), prefer: 'resolution=merge-duplicates,return=minimal',
  });
}
/** Select rows. `query` is a PostgREST query string, e.g. "select=data&t=gte.2026-01-01&order=t.asc". */
export async function dbSelect<T = Record<string, unknown>>(table: string, query = 'select=*'): Promise<T[]> {
  const out: T[] = []; const page = 1000;
  for (let from = 0; ; from += page) {
    const r = await call(`${table}?${query}`, { headers: { Range: `${from}-${from + page - 1}`, 'Range-Unit': 'items' } });
    const rows = (await r.json()) as T[];
    out.push(...rows);
    if (rows.length < page) return out;
  }
}
/** Update rows matching a filter, e.g. dbUpdate('kv', 'key=eq.x', { value }). */
export async function dbUpdate(table: string, filter: string, patch: object): Promise<void> {
  await call(`${table}?${filter}`, { method: 'PATCH', body: JSON.stringify(patch), prefer: 'return=minimal' });
}
/** Delete rows matching a filter (a filter is required, never deletes a whole table by accident). */
export async function dbDelete(table: string, filter: string): Promise<void> {
  if (!filter) throw new Error('[db] delete without filter refused');
  await call(`${table}?${filter}`, { method: 'DELETE', prefer: 'return=minimal' });
}
/** Small settings / counters: kv table. */
export async function kvGet<T>(k: string): Promise<T | null> {
  const rows = await dbSelect<{ value: T }>('kv', `select=value&key=eq.${encodeURIComponent(k)}`);
  return rows[0]?.value ?? null;
}
export async function kvSet(k: string, value: unknown): Promise<void> {
  await dbUpsert('kv', { key: k, value, updated_at: new Date().toISOString() }, 'key');
}
