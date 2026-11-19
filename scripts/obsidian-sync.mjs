#!/usr/bin/env node
// Mirrors the project memory (context/*.md) into the Obsidian vault "obsidian/Chioutworks Official".
// Only the block between <!-- otomatik:başla --> and <!-- otomatik:bitir --> is rewritten; anything the owner
// writes under "## Notlarım" (or anywhere after the block) is kept. Safe to run any time; no network.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = path.join(ROOT, 'obsidian', 'Chioutworks Official');
if (!fs.existsSync(VAULT)) process.exit(0);

const today = new Date().toISOString().slice(0, 10);
const START = '<!-- otomatik:başla -->', END = '<!-- otomatik:bitir -->';
const TAIL = '\n## Notlarım\n\n(Bu başlığın altına elle yazdıklarınız korunur.)\n';
const read = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return null; } };

/** Write/refresh one note: frontmatter + auto block; keep what follows the auto block (or an existing "## Notlarım"). */
function note(rel, { tur, tags, body }) {
  const file = path.join(VAULT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const fm = `---\ntür: "${tur}"\ndurum: "güncel"\nproje: "chioutworks"\ntarih: "${today}"\ntags: [${tags.map((t) => `"${t}"`).join(', ')}]\n---\n\n`;
  let keep = TAIL;
  if (fs.existsSync(file)) {
    const old = fs.readFileSync(file, 'utf8');
    const e = old.indexOf(END);
    if (e >= 0) keep = old.slice(e + END.length);
    else { const n = old.indexOf('## Notlarım'); if (n >= 0) keep = '\n' + old.slice(n); }
  }
  const next = `${fm}${START}\n${body.trim()}\n\nSon otomatik güncelleme: ${today} (scripts/obsidian-sync.mjs)\n${END}${keep.startsWith('\n') ? keep : '\n' + keep}`;
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  // Ignore the date line when deciding whether anything changed (no churn on every run)
  const strip = (s) => s.replace(/tarih: "[^"]*"/, '').replace(/Son otomatik güncelleme: \S+/, '');
  if (strip(prev) !== strip(next)) fs.writeFileSync(file, next);
}

const sources = [
  ['context/HARITA.md', '00 Proje Haritası.md', 'harita', ['harita', 'durum']],
  ['context/SON-DURUM.md', 'Oturum/Son durum.md', 'oturum-durumu', ['oturum', 'son-durum']],
  ['context/kararlar.md', 'Kararlar/Karar listesi.md', 'indeks', ['karar', 'indeks']],
  ['context/CANLIYA-ALMA.md', 'Yol Haritası/Canlıya alma.md', 'yol-haritası', ['yol-haritası', 'yayın']],
  ['context/hedefler.md', 'Proje/Hedefler.md', 'proje', ['proje', 'hedef']],
  ['context/ozellikler/sozlesme-iptal-devir.md', 'Özellikler/Sözleşme, iptal ve devir.md', 'özellik', ['özellik', 'sözleşme']],
  ['context/kurallar-ve-sinirlar.md', 'Kurallar/Kurallar ve sınırlar.md', 'kural', ['kural']],
  ['context/ozellikler/yayin-8-faz-plani.md', 'Yol Haritası/Yayına hazırlık 8 faz.md', 'yol-haritası', ['yol-haritası', 'yayın', 'güvenlik']],
];
for (const [src, dst, tur, tags] of sources) {
  const body = read(src);
  if (body) note(dst, { tur, tags, body: `> Kaynak: \`${src}\` (projede değiştirin; burası otomatik güncellenir)\n\n${body}` });
}

// Daily note: created once per day, linking to the current state
const daily = path.join(VAULT, 'Günlük', `${today}.md`);
if (!fs.existsSync(daily)) {
  fs.mkdirSync(path.dirname(daily), { recursive: true });
  fs.writeFileSync(daily, `---\ntür: "günlük"\nproje: "chioutworks"\ntarih: "${today}"\ntags: ["günlük"]\n---\n\n# ${today}\n\n- [[Oturum/Son durum|Son durum]]\n- [[Yol Haritası/Canlıya alma|Canlıya alma]]\n- [[Kararlar/Karar listesi|Kararlar]]\n${TAIL}`);
}
