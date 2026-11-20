import { useEffect, useState } from 'react';
import { hasConsent, onConsentChange } from '../lib/consent';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackClick, flushVisitDuration } from '../lib/analytics';

function describeTarget(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const text = (el.textContent || '').trim().slice(0, 40);
  if (text) return `${tag}: ${text}`;
  const aria = el.getAttribute('aria-label');
  if (aria) return `${tag}: ${aria}`;
  const id = el.id;
  if (id) return `${tag}#${id}`;
  return tag;
}

/** Mounted once at the app root. Records page views and click events
 *  into localStorage for the /admin dashboard. Renders nothing. */
export default function AnalyticsTracker() {
  const location = useLocation();
  // Statistics only with the visitor's consent (cookie banner); otherwise nothing is stored
  const [allowed, setAllowed] = useState(() => hasConsent('statistics'));
  useEffect(() => onConsentChange((c) => setAllowed(c.statistics)), []);

  useEffect(() => {
    if (!allowed) return;
    const lang = document.documentElement.lang || 'tr';
    trackPageView(location.pathname + location.hash, lang);

    return () => {
      flushVisitDuration();
    };
  }, [location.pathname, location.hash, allowed]);

  useEffect(() => {
    if (!allowed) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const interactive = target.closest('a, button, [role="button"], input, select, textarea');
      if (!interactive) return;
      trackClick(describeTarget(interactive), location.pathname + location.hash);
    };

    const handleUnload = () => flushVisitDuration();

    window.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleUnload);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleUnload);
    };
  }, [location.pathname, location.hash, allowed]);

  return null;
}
