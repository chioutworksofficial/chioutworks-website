// Client error monitoring (owner, 2026-11-23). No env at build time: the public DSN is fetched at runtime and the SDK is a lazy chunk.
// Errors only: no tracing, no replay, no feedback widget. Scrubbed before sending.
const SCRUB = (s: unknown) => String(s ?? '').replace(/[?#][^\s"')]*/g, '')
  .replace(/[^\s@<>"']+@[^\s@<>"']+/g, '[mail]')
  .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]')
  .replace(/\b(?:[0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}\b/gi, '[ip]')
  .replace(/[A-Za-z0-9_\-+/=]{24,}/g, '[token]')
  .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]')
  .slice(0, 300);
const NOISE = /ResizeObserver loop|chrome-extension:|moz-extension:|safari-extension:|AbortError|The user aborted a request|Load failed|Failed to fetch|NetworkError|Non-Error promise rejection/i;

export function scrubClientEvent<T extends { [k: string]: any }>(event: T): T | null {
  const e = event as any;
  const msg = [e.message, ...(e.exception?.values ?? []).map((x: any) => `${x.type} ${x.value}`)].join(' ');
  if (NOISE.test(msg) || (e.exception?.values ?? []).some((x: any) => (x.stacktrace?.frames ?? []).some((f: any) => /-extension:/.test(f.filename ?? '')))) return null;
  e.request = e.request?.url ? { url: String(e.request.url).replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0].slice(0, 200).split('/').map((x) => (/^(?:[0-9a-f-]{8,}|\d+|[\w-]{20,})$/i.test(x) ? ':id' : x)).join('/') } : undefined;
  e.user = undefined; e.breadcrumbs = undefined; e.extra = undefined; e.server_name = undefined;
  if (e.message) e.message = SCRUB(e.message);
  for (const x of e.exception?.values ?? []) { x.value = SCRUB(x.value); for (const f of x.stacktrace?.frames ?? []) { f.vars = undefined; f.filename = SCRUB(f.filename); } }
  e.tags = e.tags ? Object.fromEntries(Object.entries(e.tags).map(([k, v]) => [k, SCRUB(v)])) : undefined;
  e.contexts = e.contexts ? { browser: e.contexts.browser, os: e.contexts.os, device: e.contexts.device } : undefined;
  return event;
}

// Same summary into the own admin error log (works with or without the SDK). Max 5 distinct reports per page load.
const sent = new Set<string>();
function reportOwn(kind: string, message: string) {
  const m = SCRUB(message);
  if (NOISE.test(`${kind} ${m}`) || /-extension:/.test(message) || sent.size >= 5 || sent.has(kind + m)) return;
  sent.add(kind + m);
  const ua = navigator.userAgent;
  const br = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'other';
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'other';
  const path = location.pathname.split('/').map((x) => (/^(?:[0-9a-f-]{8,}|\d+|[\w-]{20,})$/i.test(x) ? ':id' : x)).join('/').slice(0, 200);
  void fetch('/api/client-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify({ message: m, kind: kind.slice(0, 60), path, env: `${br}/${os}` }) }).catch(() => {});
}

export function startMonitoring() {
  window.addEventListener('error', (ev) => reportOwn(ev.error?.name || 'Error', ev.message || String(ev.error)));
  window.addEventListener('unhandledrejection', (ev) => reportOwn('UnhandledRejection', String((ev.reason as Error)?.message ?? ev.reason)));
  const run = async () => {
    try {
      const c = await (await fetch('/api/public-config')).json() as { sentryDsnWeb: string | null; release: string | null; environment: string };
      if (!c?.sentryDsnWeb) return;
      const Sentry = await import('@sentry/react');
      Sentry.init({
        dsn: c.sentryDsnWeb, release: c.release ?? undefined, environment: c.environment,
        tracesSampleRate: 0, dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false, databaseQueryData: false }, // v11 replaces sendDefaultPii integrations: (d) => d.filter((i) => i.name !== 'Breadcrumbs'),
        beforeSend: scrubClientEvent,
      });
    } catch { /* monitoring must never break the site */ }
  };
  const w = window as unknown as { requestIdleCallback?: (f: () => void, o: { timeout: number }) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 4000 }); else window.setTimeout(run, 4000);
}
