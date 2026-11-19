import { uid } from './uid';
// Browser-session consent for the AI assistant. Voice and text chat are asked separately (different providers, see
// AssistantConsent.tsx). The server stamps consentAt/consentVersion on the stored session; this only avoids asking twice
// in one visit. Bump the version whenever the consent texts change materially (server/index.ts VOICE_CONSENT_VERSION too).
export const CONSENT_VERSION = 'assistant-2026-11d';
const KEY = 'cw-ai-consent';
const FALLBACK_KEY = 'cw-ai-fallback';

export type ConsentMode = 'voice' | 'text';

function modes(): string[] {
  try { const v = sessionStorage.getItem(KEY) ?? ''; const [ver, list = ''] = v.split('|'); return ver === CONSENT_VERSION ? list.split(',').filter(Boolean) : []; } catch { return []; }
}

/** Without a mode: consent for any assistant (used for the fair-use browser id). */
export function hasConsent(mode?: ConsentMode): boolean {
  const m = modes();
  return mode ? m.includes(mode) : m.length > 0;
}
export function writeConsent(mode: ConsentMode, fallback = false) {
  try {
    const m = new Set(modes()); m.add(mode);
    sessionStorage.setItem(KEY, `${CONSENT_VERSION}|${[...m].join(',')}`);
    if (mode === 'voice') sessionStorage.setItem(FALLBACK_KEY, fallback ? '1' : '0');
  } catch { /* ignore */ }
}
/** Optional consent: may a dropped voice call continue in writing with the second (backup) provider? */
export function fallbackAllowed(): boolean {
  try { return sessionStorage.getItem(FALLBACK_KEY) === '1'; } catch { return false; }
}

/** Stable random browser id for the server-side fair-use/abuse guard. Created only after consent, never before. */
export function getBid(): string | undefined {
  if (!hasConsent()) return undefined;
  const K = 'cw-bid';
  for (const st of [() => localStorage, () => sessionStorage]) {
    try {
      const s = st();
      let v = s.getItem(K);
      if (!v) { v = uid(); s.setItem(K, v); }
      return v;
    } catch { /* try next storage */ }
  }
  return undefined;
}
