import type { Lang } from '../translations';
import { VOICE_UI } from '../site/i18n/voice';

export interface VoiceTurn { role: 'user' | 'assistant'; text: string; at: number }
interface Stored { id: string; secret: string; savedAt: number }

const KEY = 'cw-voice-session';
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function readVoiceSession(): Stored | null {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Stored | null;
    if (j && typeof j.id === 'string' && typeof j.secret === 'string' && Date.now() - j.savedAt < WEEK) return j;
  } catch { /* ignore */ }
  return null;
}
export function writeVoiceSession(id: string, secret: string) {
  try { localStorage.setItem(KEY, JSON.stringify({ id, secret, savedAt: Date.now() })); } catch { /* ignore */ }
}
export function clearVoiceSession() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

const pad = (n: number) => String(n).padStart(2, '0');
const dateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function lines(turns: VoiceTurn[], lang: Lang, name: string) {
  const t = VOICE_UI[lang];
  const now = new Date();
  const head = [`Chioutworks - ${t.transcriptTitle}`, `${t.dateLabel}: ${now.toLocaleString(lang)}`, `${t.langLabel}: ${t.langName}`, `${t.nameField}: ${name || t.notGiven}`];
  const body = turns.map((x) => `[${new Date(x.at).toLocaleTimeString(lang)}] ${x.role === 'user' ? (name || t.visitor) : t.assistant}: ${x.text}`);
  return { head, body: [...body, '', t.transcriptFooter], now };
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTranscript(turns: VoiceTurn[], lang: Lang, name: string) {
  const { head, body, now } = lines(turns, lang, name);
  save(new Blob([[...head, '', ...body].join('\n')], { type: 'text/plain;charset=utf-8' }), `chioutworks-gorusme-${dateStr(now)}.txt`);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/** Opens a print-styled view; the browser's print dialog offers "Save as PDF". */
export function printTranscript(turns: VoiceTurn[], lang: Lang, name: string) {
  const { head, body } = lines(turns, lang, name);
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(head[0])}</title><style>body{font:14px/1.5 system-ui,sans-serif;margin:32px;color:black}h1{font-size:20px}p{margin:6px 0}.m{color:dimgray;margin-bottom:16px}@media print{body{margin:0}}</style></head><body><h1>${esc(head[0])}</h1><div class="m">${head.slice(1).map((l) => `<p>${esc(l)}</p>`).join('')}</div>${body.map((l) => `<p>${esc(l)}</p>`).join('')}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}
