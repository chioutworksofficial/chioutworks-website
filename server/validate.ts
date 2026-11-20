// Request schema validation (zod, owner 2026-11-20). Defence in depth: handlers keep their own sanitising.
// Failure → 400 {ok:false,error:'invalid'}. The parsed body replaces req.body (unknown keys stripped unless the schema is passthrough).
import { z, type ZodType } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export { z };
/** optional free text: truncated to the handler's cap (as before); only absurd payloads (>10x) are rejected */
export const s = (n: number) => z.string().max(n * 10).transform((x) => x.slice(0, n)).nullish();
/** capability token / record id: url-safe characters only */
export const idp = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
export const tokenP = z.object({ token: idp });
export const idP = z.object({ id: idp });
export const LANG = z.enum(['tr', 'en', 'de', 'el']);
export const email = z.string().trim().max(254).email();
/** optional e-mail: empty allowed, otherwise must be valid */
export const emailOpt = z.union([z.literal(''), email]).nullish();
export const bool = z.boolean().nullish();
export const anyObj = z.record(z.string(), z.any()).nullish();

export const validate = (body?: ZodType, params?: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  if (params) { const p = params.safeParse(req.params); if (!p.success) return res.status(400).json({ ok: false, error: 'invalid' }); }
  if (body) {
    const b = body.safeParse(req.body ?? {});
    if (!b.success) return res.status(400).json({ ok: false, error: 'invalid' });
    req.body = b.data;
  }
  return next();
};
