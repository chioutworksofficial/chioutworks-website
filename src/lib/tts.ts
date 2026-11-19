// Sentence splitter for speech. (Browser speechSynthesis is intentionally not used anywhere: Piper only.)
/** Split into sentences, keeping each chunk short enough for stable playback. */
export function chunks(text: string): string[] {
  const parts = text.replace(/\s+/g, ' ').trim().match(/[^.!?…;:]+[.!?…;:]*/g) ?? [text];
  const out: string[] = [];
  for (const p of parts) {
    const t = p.trim();
    if (!t) continue;
    if (t.length <= 180) { out.push(t); continue; }
    // very long sentence: split on commas
    let buf = '';
    for (const w of t.split(/(?<=,)\s*/)) {
      if ((buf + ' ' + w).length > 180 && buf) { out.push(buf.trim()); buf = w; } else buf += ' ' + w;
    }
    if (buf.trim()) out.push(buf.trim());
  }
  return out;
}
