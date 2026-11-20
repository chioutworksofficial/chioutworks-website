// express-rate-limit Store backed by the Supabase rl_hit() RPC (shared across serverless instances).
// Falls back to the in-memory store when Supabase is not configured; fails OPEN on a DB error (logged once, no personal data).
import crypto from 'node:crypto';
import { MemoryStore, type Store, type Options, type ClientRateLimitInfo } from 'express-rate-limit';
import { dbOn, dbRpc } from './db.js';

let warned = false;
export class DbRateStore implements Store {
  localKeys = false;
  private mem = new MemoryStore();
  private windowMs = 60_000;
  constructor(private tag: string) {}
  init(options: Options) { this.windowMs = options.windowMs; this.mem.init?.(options); }
  // Only a salted hash of the key (IP) reaches the database.
  private k(key: string) { return crypto.createHash('sha256').update(`${process.env.ABUSE_SALT || 'chioutworks-rl-v1'}|${this.tag}|${key}`).digest('hex').slice(0, 40); }
  async increment(key: string): Promise<ClientRateLimitInfo> {
    if (!dbOn()) return this.mem.increment(key);
    try {
      const hits = Number(await dbRpc<number>('rl_hit', { p_key: this.k(key), p_window_sec: Math.max(1, Math.round(this.windowMs / 1000)) }));
      return { totalHits: Number.isFinite(hits) ? hits : 1, resetTime: new Date(Date.now() + this.windowMs) };
    } catch {
      if (!warned) { warned = true; console.error('[ratelimit] shared store unavailable, failing open'); }
      return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) };
    }
  }
  async decrement(key: string) { if (!dbOn()) await this.mem.decrement(key); }
  async resetKey(key: string) { if (!dbOn()) await this.mem.resetKey(key); }
}
export const rlStore = (prefix: string) => new DbRateStore(prefix);
