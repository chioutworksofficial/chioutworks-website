// Own bot check, client side: a signed "form opened" token (server must see >= 3 s between issue and submit) + hidden honeypot value.
let tok: { t: string; at: number } | null = null;
let pending: Promise<void> | null = null;
const load = () => (pending ??= fetch('/api/form-token').then((r) => r.json()).then((j) => { tok = { t: String(j.t), at: Date.now() }; }).catch(() => {}).finally(() => { pending = null; }));
/** Call when a form mounts so the token is already old enough at submit time. */
export const prefetchFormToken = () => { if (!tok || Date.now() - tok.at > 100 * 60_000) void load(); };
/** Fields to merge into the submit body: { ft, website }. Waits (max 3 s) if the form was opened a moment ago. */
export async function guardFields(): Promise<{ ft: string; website: string }> {
  if (!tok || Date.now() - tok.at > 100 * 60_000) { tok = null; await load(); }
  if (tok) { const wait = 3100 - (Date.now() - tok.at); if (wait > 0) await new Promise((r) => setTimeout(r, wait)); }
  const hp = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-hp]')).map((i) => i.value).join('');
  return { ft: tok?.t ?? '', website: hp };
}
