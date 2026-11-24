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

// Live-call transcripts: drop control tokens the model may emit (<no speech>, {pause}, [x]); an unclosed opener at the end of a chunk
// is held back in `tail` until the next chunk completes it. Spoken brand spellings are shown as the written brand.
const LIVE_TOKEN = /<[^<>]{0,40}>|\{[^{}]{0,40}\}|\[[^[\]]{0,40}\]|\([^()]{0,40}\)|\*[^*]{0,40}\*/g;
const LIVE_OPENER = /[<{[(*][^<>{}[\]()*]{0,40}$/;
export function cleanLive(tail: string, x: string): { text: string; tail: string } {
  const s = (tail + x).replace(LIVE_TOKEN, ''), m = LIVE_OPENER.exec(s);
  return { text: (m ? s.slice(0, m.index) : s).replace(/ {2,}/g, ' '), tail: m ? m[0] : '' };
}
// A turn that is only a stage direction such as "(Silence)", "*Stille*", "(σιωπή)": never played, never shown.
const STAGE_WORD = 'silence|silent|stille|schweigen|still|sessizlik|sessiz|σιωπή|σιωπη|παύση|παυση|pause|pausa|no speech|no audio|keine sprache|\\.{3}|…';
const STAGE_TURN = new RegExp(`^\\s*[(*]\\s*(?:${STAGE_WORD})\\s*[.!]?\\s*[)*]\\s*$`, 'iu');
export const isStageTurn = (text: string) => STAGE_TURN.test(text);
export const writtenBrand = (s: string) => s.replace(/Shee-oot works|Schiut-Works|Şiut-vörks|Σιούτ-γουόρκς/gi, 'Chioutworks');
