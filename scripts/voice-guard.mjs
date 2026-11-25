// Locks voice-assistant behaviour the owner approved. Run before committing any voice change:
//   node scripts/voice-guard.mjs
// If a check fails, a working rule was changed: restore it or get the owner's OK first.
import fs from 'node:fs';

const srv = fs.readFileSync(new URL('../server/geminiLive.ts', import.meta.url), 'utf8');
const cli = fs.readFileSync(new URL('../src/lib/geminiLive.ts', import.meta.url), 'utf8');

const must = [
  ['brand spoken map', srv, "const SPOKEN: Record<string, string> = { en: 'Shee-oot works', de: 'Schiut-Works', tr: 'Şiut-vörks', el: 'Σιούτ-γουόρκς' };"],
  ['tr greeting (Bey/Hanım + spoken brand)', srv, "ben ${SPOKEN.tr}'ün sesli yapay zekâ asistanıyım. Size nasıl yardımcı olabilirim?"],
  ['de greeting', srv, 'Guten Tag${deName(v)}, ich bin der KI-Sprachassistent von ${SPOKEN.de}. Wie kann ich Ihnen helfen?'],
  ['en greeting', srv, "Hello${enName(v)}, I'm the AI voice assistant of ${SPOKEN.en}. How can I help you?"],
  ['el greeting', srv, 'είμαι ο φωνητικός βοηθός τεχνητής νοημοσύνης της'],
  ['VAD explicitly enabled', srv + cli, 'disabled: false'],
];
const mustNot = [
  ['removed palette sentence (tr)', srv, 'renk paleti ve tarz seçimi'],
  ['removed palette sentence (de)', srv, 'Farbpalette und Stil'],
  ['removed palette sentence (en)', srv, 'colour palette and style selection'],
];

let bad = 0;
for (const [name, src, s] of must) if (!src.includes(s)) { bad++; console.log('FAIL (missing):', name); }
for (const [name, src, s] of mustNot) if (src.includes(s)) { bad++; console.log('FAIL (came back):', name); }
console.log(bad ? `${bad} protected rule(s) changed` : 'voice guard OK: all protected rules intact');
process.exit(bad ? 1 : 0);
