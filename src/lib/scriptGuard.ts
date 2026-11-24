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

/** Scripted prompt sentences that contain "we/our" on purpose (closing "our conversation", language-mismatch "Sollen wir"): not a violation. */
export const SCRIPTED_WE = /unser\p{L}*\s+Gespräch\p{L}*|our conversation|συζήτησής μας|Sollen wir/giu;

/** true = an assistant turn in a tr/de call is English: >= 3 English function words and clearly more than the target-language markers. (el: wrongScript covers it.) */
const EN_W = new Set('the and you your is are that this with please let know anything else glad understand can would like thank thanks of for it what have if there assist enjoyed session help'.split(' '));
const TG_W: Record<string, Set<string>> = {
  tr: new Set('ve bir bu için ile ben siz size mi mı mu mü da de çok daha evet hayır var yok ne nasıl lütfen teşekkürler'.split(' ')),
  de: new Set('ich und der die das ist nicht sie ein eine mit für zu wir ihre ihnen gerne bitte noch auch wie was dass'.split(' ')),
};
export function looksEnglish(text: string, lang: string): boolean {
  if (lang === 'en' || lang === 'el') return false;
  const w = (text.toLowerCase().match(/[\p{L}']+/gu) ?? []).map((x) => x.replace(/'.*$/, ''));
  const en = w.filter((x) => EN_W.has(x)).length, tg = w.filter((x) => TG_W[lang]?.has(x)).length;
  return en >= 3 && en >= 2 * tg;
}
