// Output guard for assistant replies: wrong script / wrong language is rejected before it reaches the visitor.
const TAGS = /\[\s*\/?\s*(long pause|pause|slow|warm)\s*\]/gi;
const FOREIGN = /[Ѐ-ӿ֐-׿؀-ۿऀ-ॿ฀-๿぀-ヿ㐀-䶿一-鿿가-힯]/u;
const STOP: Record<string, string[]> = {
  en: ['the', 'and', 'you', 'your', 'is', 'are', 'with', 'for', 'that', 'this', 'we', 'can'],
  de: ['der', 'die', 'das', 'und', 'ich', 'sie', 'ist', 'nicht', 'mit', 'für', 'ein', 'eine', 'wir', 'können'],
  tr: ['ve', 'bir', 'bu', 'için', 'ile', 'size', 'sizin', 'ben', 'çok', 'ama', 'daha', 'nasıl'],
  el: [],
};
const words = (t: string, l: string) => (t.toLowerCase().match(/\p{L}+/gu) ?? []).filter((w) => STOP[l].includes(w));

/** true = acceptable reply for this language. */
export function languageOk(raw: string, lang: string): boolean {
  const t = raw.replace(TAGS, ' ');
  if (FOREIGN.test(t)) return false;
  const letters = t.match(/\p{L}/gu) ?? [];
  if (letters.length < 8) return true;
  const greek = letters.filter((c) => /[Ͱ-Ͽἀ-῿]/.test(c)).length;
  if (lang === 'el') {
    if (greek / letters.length < 0.6) return false;
    // a long sentence in Latin letters only (transliteration / English) is wrong
    return !(t.match(/[^.!?;·]+/g) ?? []).some((s) => (s.match(/\p{L}/gu) ?? []).length > 40 && !/[Ͱ-Ͽἀ-῿]/.test(s));
  }
  if (greek > 0 && greek / letters.length > 0.05) return false;
  const latin = letters.filter((c) => /\p{Script=Latin}/u.test(c)).length;
  if (latin / letters.length < 0.95) return false;
  const others = Object.keys(STOP).filter((l) => l !== lang && l !== 'el');
  for (const o of others) {
    const hits = new Set(words(t, o));
    if (hits.size >= 3) return false;
  }
  return true;
}

export const SAFE_FALLBACK: Record<string, string> = {
  tr: 'Bunu şu an net yanıtlayamıyorum; yazılı talep bırakırsanız size en kısa sürede dönülür.',
  en: 'I cannot answer that clearly right now; if you leave a written request, we will get back to you as soon as possible.',
  de: 'Das kann ich im Moment nicht eindeutig beantworten; wenn Sie eine schriftliche Anfrage hinterlassen, melden wir uns so schnell wie möglich.',
  el: 'Δεν μπορώ να το απαντήσω με σαφήνεια αυτή τη στιγμή· αν αφήσετε γραπτό αίτημα, θα επικοινωνήσουμε μαζί σας το συντομότερο.',
};
