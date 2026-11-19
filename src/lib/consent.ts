import { uid } from './uid';
// Cookie / device-storage consent (TDDDG §25, GDPR). Necessary storage is always allowed; "functional" and
// "statistics" only after the visitor's choice. The choice is kept in localStorage (itself necessary) and an
// anonymous proof record (random id, version, choices, time; no IP) is sent to the server.

export type ConsentCategory = 'necessary' | 'functional' | 'statistics';
export interface Consent { v: number; id: string; at: string; functional: boolean; statistics: boolean }

export const CONSENT_VERSION = 1;              // bump when categories or texts change materially → visitors are asked again
const KEY = 'cw-consent';
const MAX_AGE = 365 * 24 * 3600e3;             // ask again after 12 months
const OPEN_EVENT = 'cw-consent-open';
const CHANGE_EVENT = 'cw-consent-change';

export function readConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Consent | null;
    if (!c || c.v !== CONSENT_VERSION || Date.now() - Date.parse(c.at) > MAX_AGE) return null;
    return c;
  } catch { return null; }
}

export const hasConsent = (cat: ConsentCategory): boolean => cat === 'necessary' || !!readConsent()?.[cat];

/** Remove what an optional category stored once it is switched off. */
function cleanup(c: Consent) {
  try {
    if (!c.statistics) { localStorage.removeItem('cw_analytics_v1'); localStorage.removeItem('cw_analytics_visitor'); sessionStorage.removeItem('cw_analytics_session'); }
    if (!c.functional) sessionStorage.removeItem('cw-pre');
  } catch { /* storage blocked */ }
}

export function saveConsent(choice: { functional: boolean; statistics: boolean }): Consent {
  const prev = (() => { try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') as Consent | null; } catch { return null; } })();
  const c: Consent = { v: CONSENT_VERSION, id: prev?.id ?? uid(), at: new Date().toISOString(), ...choice };
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* storage blocked: banner shows again next visit */ }
  cleanup(c);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: c }));
  // Proof of consent (GDPR Art. 7(1)): anonymous record on the server
  fetch('/api/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify(c) }).catch(() => {});
  return c;
}

export const onConsentChange = (fn: (c: Consent) => void) => {
  const h = (e: Event) => fn((e as CustomEvent<Consent>).detail);
  window.addEventListener(CHANGE_EVENT, h);
  return () => window.removeEventListener(CHANGE_EVENT, h);
};
export const openConsentSettings = () => window.dispatchEvent(new Event(OPEN_EVENT));
export const onConsentOpen = (fn: () => void) => { window.addEventListener(OPEN_EVENT, fn); return () => window.removeEventListener(OPEN_EVENT, fn); };
