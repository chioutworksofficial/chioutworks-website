export type LiveTurnLike = { role: 'user' | 'assistant'; text: string; at: number };

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** True when one text is a prefix-equal restart of the other (first min(len) chars, at least 6). */
const restart = (a: string, b: string) => {
  const x = norm(a), y = norm(b), n = Math.min(x.length, y.length);
  return n >= 6 && x.slice(0, n) === y.slice(0, n);
};

/**
 * Adds one transcription chunk. `open` = the last bubble still belongs to the current turn (append);
 * `cut` = the last assistant bubble was interrupted (a restart replaces it). Consecutive duplicate assistant bubbles are merged.
 */
export function addLiveChunk<T extends LiveTurnLike>(turns: T[], role: T['role'], text: string, open: boolean, cut: boolean, at = Date.now()): { turns: T[]; cutUsed: boolean } {
  const last = turns[turns.length - 1];
  let out: T[], cutUsed = false;
  if (open && last?.role === role) {
    const sep = /[.,!?;:…]$/.test(last.text) && /^[\p{L}\p{N}]/u.test(text) ? ' ' : '';
    out = [...turns.slice(0, -1), { ...last, text: last.text + sep + text }];
  } else {
    const t = text.trimStart();
    if (role === 'assistant' && cut && last?.role === 'assistant' && restart(last.text, t)) { out = [...turns.slice(0, -1), { ...last, text: t }]; cutUsed = true; }
    else out = [...turns, { role, text: t, at } as T];
  }
  const n = out.length;
  if (n > 1 && out[n - 1].role === 'assistant' && out[n - 2].role === 'assistant' && norm(out[n - 1].text) && norm(out[n - 1].text) === norm(out[n - 2].text)) out = out.slice(0, -1);
  return { turns: out, cutUsed };
}
