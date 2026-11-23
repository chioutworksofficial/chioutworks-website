// Error monitoring (owner, 2026-11-23): active only when SENTRY_DSN_API is set. Errors only: no tracing, no replay, no PII.
// Events are scrubbed before leaving the server: only method + path (ids -> :id), masked messages/stacks, no bodies/cookies/headers/IP/query.
import * as Sentry from '@sentry/node';
import { maskText, normRoute } from './errors.js';

const mask = (s: unknown) => maskText(String(s ?? '')).slice(0, 300);

export function scrubEvent<T extends Sentry.ErrorEvent>(event: T): T | null {
  const e = event as any;
  const path = normRoute(String(e.request?.url ?? '').replace(/^https?:\/\/[^/]+/, ''));
  e.request = e.request?.method || path ? { method: e.request?.method, url: path } : undefined;
  e.user = undefined;
  e.server_name = undefined;
  e.breadcrumbs = undefined;
  e.extra = undefined;
  e.contexts = e.contexts ? { runtime: e.contexts.runtime } : undefined;
  for (const x of e.exception?.values ?? []) { x.value = mask(x.value); for (const f of x.stacktrace?.frames ?? []) f.vars = undefined; }
  if (e.message) e.message = mask(e.message);
  e.tags = e.tags ? Object.fromEntries(Object.entries(e.tags).map(([k, v]) => [k, mask(v)])) : undefined;
  return event;
}

export const sentryOn = !!process.env.SENTRY_DSN_API;
if (sentryOn) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_API,
    environment: process.env.VERCEL_ENV || 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: 0,
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false, databaseQueryData: false }, // v11 replaces sendDefaultPii
    beforeSend: scrubEvent,
  });
}

export function captureServerError(err: unknown) {
  if (sentryOn) try { Sentry.captureException(err); } catch { /* never break a request */ }
}
export async function flushSentry(ms = 2000) {
  if (sentryOn) try { await Sentry.flush(ms); } catch { /* ignore */ }
}
