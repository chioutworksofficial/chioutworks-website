import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Cookieless page statistics: nothing is stored on the device. A page view is sent only once the page has really
// been seen (visible ≥ 2 s or a scroll / tap / key press), so simple bots that never "look" are filtered out.
// The server stores no IP address (see server/analytics.ts). Admin pages are not counted.
const TZ_CC: Record<string, string> = {
  'Europe/Berlin': 'de', 'Europe/Vienna': 'at', 'Europe/Zurich': 'ch', 'Europe/Istanbul': 'tr', 'Asia/Baku': 'az', 'Europe/Athens': 'gr',
  'Asia/Nicosia': 'cy', 'Europe/London': 'gb', 'Europe/Paris': 'fr', 'Europe/Amsterdam': 'nl', 'Europe/Brussels': 'be', 'Europe/Rome': 'it',
  'Europe/Madrid': 'es', 'Europe/Warsaw': 'pl', 'Europe/Stockholm': 'se', 'Europe/Copenhagen': 'dk', 'Europe/Luxembourg': 'lu',
  'America/New_York': 'us', 'America/Chicago': 'us', 'America/Denver': 'us', 'America/Los_Angeles': 'us', 'America/Toronto': 'ca',
};
// Referrer only for the first page of the visit and only when it is another site (in-app navigation is not a referrer)
let firstRef: string | null = (() => { try { const r = document.referrer; return r && new URL(r).host !== location.host ? r : ''; } catch { return ''; } })();
const rid = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
const send = (body: object) => {
  try { fetch('/api/a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {}); } catch { /* ignore */ }
};

export default function ServerTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/admin') || import.meta.env.DEV && new URLSearchParams(location.search).has('notrack')) return;
    const id = rid();
    const start = performance.now();
    let sent = false;
    let cc = '';
    try { cc = TZ_CC[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? ''; } catch { /* ignore */ }
    const pv = (eng: boolean) => {
      if (sent) return; sent = true;
      const ref = firstRef ?? ''; firstRef = '';
      send({ k: 'pv', id, path: pathname, ref, lang: document.documentElement.lang, cc, eng, wd: navigator.webdriver === true });
    };
    const engage = () => pv(true);
    const timer = window.setTimeout(() => { if (document.visibilityState === 'visible') engage(); }, 2000);
    const onClick = (e: MouseEvent) => {
      engage();
      const el = (e.target as Element | null)?.closest('a, button, [role="button"]');
      if (!el) return;
      const label = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50);
      if (label) send({ k: 'click', id, label, path: pathname });
    };
    const leave = () => {
      if (!sent) pv(false);
      send({ k: 'leave', id, ms: Math.round(performance.now() - start) });
    };
    const onHide = () => { if (document.visibilityState === 'hidden') leave(); };
    window.addEventListener('scroll', engage, { once: true, passive: true });
    window.addEventListener('keydown', engage, { once: true });
    window.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', leave);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', engage); window.removeEventListener('keydown', engage); window.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', leave);
      if (sent) send({ k: 'leave', id, ms: Math.round(performance.now() - start) });
    };
  }, [pathname]);

  return null;
}
