// Provider-agnostic LLM layer for new admin tools (Groq default, OpenAI optional). Never logs prompts/responses.
import { recordError } from './errors.js';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };
type Name = 'groq' | 'openai';
export type LlmOpts = { system?: string; messages: Msg[]; json?: boolean; maxTokens?: number; temperature?: number; task?: 'fast' | 'smart' };

const URLS: Record<Name, string> = { groq: 'https://api.groq.com/openai/v1/chat/completions', openai: 'https://api.openai.com/v1/chat/completions' };
const keyOf = (n: Name) => (n === 'groq' ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY) || '';
const modelOf = (n: Name, task: 'fast' | 'smart' = 'smart') =>
  n === 'openai' ? process.env.OPENAI_MODEL || 'gpt-4.1-mini'
    : task === 'fast' ? process.env.GROQ_FALLBACK_MODEL || 'qwen/qwen3.8-27b' : process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const primary = (): Name => (process.env.LLM_PROVIDER === 'openai' ? 'openai' : 'groq');

export function llmStatus() {
  const names: Name[] = ['groq', 'openai'];
  return { providers: names.map((name) => ({ name, configured: !!keyOf(name), model: modelOf(name) })), primary: primary() };
}

class LlmError extends Error { constructor(public status: number, m: string) { super(m); } }

async function call(n: Name, o: LlmOpts): Promise<string> {
  const messages: Msg[] = [...(o.system ? [{ role: 'system' as const, content: o.system }] : []), ...o.messages];
  if (o.json && !messages.some((m) => /json/i.test(m.content))) messages.unshift({ role: 'system', content: 'Respond with valid JSON only.' });
  const body: Record<string, unknown> = { model: modelOf(n, o.task), messages, temperature: o.temperature ?? 0.4 };
  if (o.maxTokens) body[n === 'openai' ? 'max_completion_tokens' : 'max_tokens'] = o.maxTokens;
  if (o.json) body.response_format = { type: 'json_object' };
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 30_000);
  try {
    const r = await fetch(URLS[n], { method: 'POST', signal: ac.signal, headers: { 'content-type': 'application/json', authorization: `Bearer ${keyOf(n)}` }, body: JSON.stringify(body) });
    if (!r.ok) throw new LlmError(r.status, `${n} status ${r.status}`);
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    return String(j.choices?.[0]?.message?.content ?? '');
  } finally { clearTimeout(t); }
}

export async function llmChat(o: LlmOpts): Promise<{ text: string; provider: Name; model: string }> {
  const p = primary();
  const other: Name = p === 'groq' ? 'openai' : 'groq';
  if (!keyOf(p) && !keyOf(other)) throw new Error('llm_not_configured');
  const order = [p, other].filter((n) => keyOf(n));
  let last: unknown;
  for (const n of order) {
    try { return { text: await call(n, o), provider: n, model: modelOf(n, o.task) }; }
    catch (e) {
      last = e;
      const st = e instanceof LlmError ? e.status : 0; // 0 = network/timeout
      await recordError('llm', new Error(`${n} failed status ${st}`));
      if (st >= 400 && st < 500 && st !== 429) break; // client error: other provider will not help
    }
  }
  throw last instanceof Error ? last : new Error('llm_failed');
}

export async function llmJson<T = unknown>(o: Omit<LlmOpts, 'json'>): Promise<T> {
  const { text } = await llmChat({ ...o, json: true });
  try { return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()) as T; }
  catch { throw new Error('llm_invalid_json'); }
}
