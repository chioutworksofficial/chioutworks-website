// Soft UI sounds for the chat (owner, 2026-11-19): open, send, reply. Synthesised with the Web Audio API — no audio
// files, nothing loaded from other sites. Played only after a user gesture (opening the chat is one). Muting is a
// per-tab preference (sessionStorage), toggled in the chat header.
const KEY = 'cw-chat-sound';
let ctx: AudioContext | null = null;

export function soundOn(): boolean {
  try { return sessionStorage.getItem(KEY) !== 'off'; } catch { return true; }
}
export function setSoundOn(on: boolean) {
  try { sessionStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = ctx ?? new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}

/** One soft bell-like note: sine + quiet octave, quick attack, gentle decay. */
function note(a: AudioContext, freq: number, at: number, dur: number, vol: number) {
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  g.connect(a.destination);
  for (const [mult, v] of [[1, 1], [2, 0.18]] as const) {
    const o = a.createOscillator(); const og = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(freq * mult, at);
    og.gain.value = v; o.connect(og); og.connect(g);
    o.start(at); o.stop(at + dur + 0.02);
  }
}

function play(seq: [number, number, number][], vol = 0.06) {
  if (!soundOn()) return;
  const a = audio(); if (!a) return;
  const t0 = a.currentTime + 0.01;
  for (const [f, dt, dur] of seq) note(a, f, t0 + dt, dur, vol);
}

/** Chat opens: a soft rising two-note chime. */
export const playOpen = () => play([[659.25, 0, 0.32], [987.77, 0.09, 0.42]], 0.05);
/** Visitor sends: a short, light tick. */
export const playSend = () => play([[880, 0, 0.12]], 0.035);
/** Reply arrives: a warm falling two-note chime. */
export const playReply = () => play([[783.99, 0, 0.26], [1174.66, 0.08, 0.36]], 0.045);
