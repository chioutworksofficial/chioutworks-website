// Delivery markup the model may emit in voice mode: [pause] [long pause] [slow]..[/slow] [warm]..[/warm].
// stripMarkup() removes it for display; parseMarkup() turns it into segments for Piper.
export type Style = 'n' | 'slow' | 'warm';
export type Seg = { kind: 'text'; text: string; style: Style } | { kind: 'pause'; ms: number };

const TAG = /\[\s*(\/?)\s*(long pause|pause|slow|warm)\s*\]/gi;
export const PAUSE_MS = 350, LONG_PAUSE_MS = 800;

export const stripMarkup = (s: string) => s.replace(TAG, ' ').replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.!?;:…])/g, '$1').trim();

export function parseMarkup(s: string): Seg[] {
  const out: Seg[] = [];
  let style: Style = 'n', last = 0;
  const text = (t: string) => { if (t.trim()) out.push({ kind: 'text', text: t, style }); };
  for (const m of s.matchAll(TAG)) {
    text(s.slice(last, m.index));
    last = m.index + m[0].length;
    const name = m[2].toLowerCase(), closing = m[1] === '/';
    if (name === 'pause') out.push({ kind: 'pause', ms: PAUSE_MS });
    else if (name === 'long pause') out.push({ kind: 'pause', ms: LONG_PAUSE_MS });
    else style = closing ? 'n' : (name as Style);
  }
  text(s.slice(last));
  return out;
}

/** Piper parameters per style (length_scale > 1 = slower; noise_w lower = steadier rhythm). null = voice default. */
export const STYLE_PARAMS: Record<Style, { ls: number; nw?: number } | null> = { n: null, slow: { ls: 1.15 }, warm: { ls: 1.08, nw: 0.6 } };
