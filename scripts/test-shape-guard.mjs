// Run: npx tsx scripts/test-shape-guard.mjs
import { shapeReply, tooLong, truncateReply } from '../server/shapeGuard.ts';
const Q = (t, l) => (t.match(l === 'el' ? /[?;]/g : /\?/g) ?? []).length;
const cases = [
  ['tr', 'Merhaba, size yardımcı olabilirim.\n\nTemizlik şirketleri için otomasyon kurarız. Hangi sektördesiniz? Müşterileriniz hangi dilleri konuşuyor?', 1, false],
  ['de', '[pause] Gern helfe ich Ihnen.\n\nWie nehmen Sie heute Termine an? Und welche Sprachen sprechen Ihre Patienten?', 1, false],
  ['el', 'Γεια σας. Πώς διαχειρίζεστε τις κρατήσεις; Ποιες γλώσσες μιλούν οι πελάτες σας;', 1, false],
  ['el', 'Καλημέρα, χαίρομαι. Τι δουλειά κάνετε? Και πόσους πελάτες έχετε;', 1, false],
  ['en', '**Great!**\n- We build chatbots\n- We build sites\n1. And more\nWhat sector are you in?', 1, false],
  ['en', 'One. Two. Three. Four. Five. Six.', 0, true],
];
let bad = 0;
const chk = (n, ok) => { if (!ok) bad++; console.log(ok ? 'PASS' : 'FAIL', n); };
for (const [l, t, q, long] of cases) {
  const r = shapeReply(t, l);
  chk(`${l} q=${Q(r, l)} oneParagraph=${!/\n/.test(r)} noMd=${!/[*#]|^- /.test(r)}`, Q(r, l) === q && !/\n/.test(r) && !/[*#]|\s-\s|\d\./.test(r));
  chk(`${l} tooLong=${tooLong(r, l)}`, tooLong(r, l) === long);
}
chk('tag survives', shapeReply('[pause] Hallo. Wie geht es?', 'de').startsWith('[pause]'));
chk('truncate', truncateReply('One. Two. Three. Four. What now?', 'en') === 'One. Two. What now?');
process.exit(bad ? 1 : 0);
