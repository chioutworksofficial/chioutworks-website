// Typed action registry (Jarvis-readiness). Modules register {name, description, params schema, handler, requiresConfirm};
// nothing here talks to a voice/LLM command UI yet. Admin-only HTTP surface: list + run (requiresConfirm actions need confirm:true).
import type { Express, Request, Response } from 'express';
import { z } from 'zod';

export interface Action<S extends z.ZodType = z.ZodType> {
  name: string; description: string; params: S; requiresConfirm: boolean;
  handler: (p: z.infer<S>) => Promise<unknown>;
}
const reg = new Map<string, Action>();
export const registerAction = <S extends z.ZodType>(a: Action<S>) => { reg.set(a.name, a as unknown as Action); };
export const listActions = () => [...reg.values()].map((a) => ({ name: a.name, description: a.description, requiresConfirm: a.requiresConfirm, params: z.toJSONSchema(a.params) }));
export async function runAction(name: string, raw: unknown, confirmed = false): Promise<{ ok: true; result: unknown } | { ok: false; error: 'unknown_action' | 'invalid_params' | 'confirm_required' }> {
  const a = reg.get(name); if (!a) return { ok: false, error: 'unknown_action' };
  const p = a.params.safeParse(raw ?? {}); if (!p.success) return { ok: false, error: 'invalid_params' };
  if (a.requiresConfirm && !confirmed) return { ok: false, error: 'confirm_required' };
  return { ok: true, result: await a.handler(p.data) };
}

export function registerActionRoutes(app: Express, deps: { requireAdmin: (req: Request, res: Response) => Promise<boolean> }) {
  const guard = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    deps.requireAdmin(req, res).then((ok) => (ok ? fn(req, res) : undefined)).catch(() => { if (!res.headersSent) res.status(500).json({ error: 'server', message: 'Sunucu hatası.' }); });
  app.get('/api/admin/actions', guard(async (_req, res) => { res.set('Cache-Control', 'no-store'); return res.json({ actions: listActions() }); }));
  app.post('/api/admin/actions/run', guard(async (req, res) => {
    const b = z.object({ name: z.string().max(80), params: z.unknown().optional(), confirm: z.boolean().optional() }).safeParse(req.body ?? {});
    if (!b.success) return res.status(400).json({ error: 'invalid', message: 'Geçersiz istek.' });
    const r = await runAction(b.data.name, b.data.params, b.data.confirm === true);
    return res.status(r.ok ? 200 : r.error === 'unknown_action' ? 404 : r.error === 'confirm_required' ? 409 : 400).json(r);
  }));
}
