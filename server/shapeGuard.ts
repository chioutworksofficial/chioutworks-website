// Output shape guard: one paragraph, no markdown, one question, short. Delivery tags ([pause] etc.) are preserved.
const TAG = /\[\s*\/?\s*(?:long pause|pause|slow|warm)\s*\]/gi;
export const MAX_SENTENCES = 3;
export const MAX_WORDS = 60;

const qmark = (l: string) => (l === 'el' ? /[?;]/ : /\?/);
const splitSentences = (t: string, l: string): string[] =>
  (t.match(l === 'el' ? /[^.!?;…]+(?:[.!?;…]+|$)/g : /[^.!?…]+(?:[.!?…]+|$)/g) ?? []).map((s) => s.trim()).filter(Boolean);
const isQuestion = (s: string, l: string) => qmark(l).test(s.replace(TAG, '').trim().slice(-1));
const wordCount = (t: string) => (t.replace(TAG, ' ').match(/\S+/g) ?? []).length;

export function normalizeShape(raw: string, _lang: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^[ \t]*(?:#{1,6}|[-*•]|\d+[.)])[ \t]+/gm, '')
    .replace(/[*`#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Keep everything up to and including the FIRST question when there is more than one. */
function oneQuestion(t: string, l: string): string {
  const s = splitSentences(t, l);
  const qs = s.filter((x) => isQuestion(x, l));
  if (qs.length <= 1) return t;
  return s.slice(0, s.indexOf(qs[0]) + 1).join(' ');
}

export function tooLong(t: string, lang: string): boolean {
  return splitSentences(t, lang).length > MAX_SENTENCES || wordCount(t) > MAX_WORDS;
}

export function shapeReply(raw: string, lang: string): string {
  return oneQuestion(normalizeShape(raw, lang), lang);
}

/** Last resort: first 2 sentences + the first question if present. */
export function truncateReply(t: string, lang: string): string {
  const s = splitSentences(t, lang);
  const keep = s.slice(0, 2);
  const q = s.find((x) => isQuestion(x, lang));
  if (q && !keep.includes(q)) keep.push(q);
  return keep.join(' ');
}
