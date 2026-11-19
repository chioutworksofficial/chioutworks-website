// Run: npx tsx scripts/test-language-guard.mjs
import { languageOk } from '../server/languageGuard.ts';
const cases = [
  ['tr', 'Merhaba, işletmeniz için doğru dijital çözümü birlikte bulabiliriz. Hangi sektörde çalışıyorsunuz?', true],
  ['tr', 'Merhaba, işletmeniz için 你好世界 doğru çözümü bulabiliriz. Hangi sektördesiniz?', false],
  ['tr', 'Merhaba. We can help you with the website and the booking for your business, and you are welcome.', false],
  ['el', 'Γεια σας, μπορώ να σας βοηθήσω να βρείτε τη σωστή ψηφιακή λύση για την επιχείρησή σας.', true],
  ['el', 'Geia sas, mporo na sas voithiso na vreite tin sosti psifiaki lysi gia tin epixeirisi sas.', false],
  ['de', 'Guten Tag, ich helfe Ihnen gern, die passende digitale Lösung für Ihr Unternehmen zu finden.', true],
  ['en', 'Hello, I can help you find the right digital solution for your business.', true],
  ['de', 'Здравствуйте, ich helfe Ihnen gern.', false],
];
let bad = 0;
for (const [l, t, exp] of cases) { const r = languageOk(t, l); if (r !== exp) bad++; console.log(r === exp ? 'PASS' : 'FAIL', l, 'ok=' + r, t.slice(0, 40)); }
process.exit(bad ? 1 : 0);
