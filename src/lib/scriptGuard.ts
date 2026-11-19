/** Live audio cannot pass the server language guard: this checks the OUTPUT TRANSCRIPT. true = wrong script/language for `lang`. */
const FOREIGN = /[Ѐ-ӿ֐-׿؀-ۿऀ-ॿ฀-๿぀-ヿ㐀-䶿一-鿿가-힯]/u;
export function wrongScript(text: string, lang: string): boolean {
  if (FOREIGN.test(text)) return true;
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length < 12) return false;
  const greek = letters.filter((c) => /[Ͱ-Ͽἀ-῿]/.test(c)).length;
  return lang === 'el' ? greek / letters.length < 0.5 : greek / letters.length > 0.05;
}

/** true = the output names the owner personally, which must never be spoken. */
export const namesOwner = (text: string) => /chousein/i.test(text);

/** true = the assistant speaks as "we" (the business is not a team). Checks assistant output only. */
const L = '(?<![\\p{L}])', R = '(?![\\p{L}])';
const WE: Record<string, RegExp> = {
  tr: new RegExp(`${L}(?:biz|bizim|buradayız)${R}|${L}\\p{L}*(?:[ıiuü]yoruz|[ae]biliriz|[ae]ceğiz|[ae]cağız)${R}`, 'iu'),
  de: new RegExp(`${L}(?:wir|unser\\p{L}*)${R}`, 'iu'),
  el: new RegExp(`${L}(?:εμείς|μας|\\p{L}*(?:ουμε|ούμε|όμαστε))${R}`, 'iu'),
  en: new RegExp(`${L}(?:we|our|ours|us)${R}`, 'iu'),
};
export const usesWe = (text: string, lang: string) => (WE[lang] ?? WE.en).test(text);
