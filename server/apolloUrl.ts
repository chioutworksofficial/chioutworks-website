// Apollo people/company search URL builder. Rules come from the owner's file "apollo-url-uretici" (encoding, Turkey rules, value lists).
// Deterministic: the LLM only fills the structured fields (sanitize()), this file writes the URL. No network, no personal data.
export const SENIORITIES = ['owner', 'founder', 'c_suite', 'partner', 'vp', 'head', 'director', 'manager', 'senior', 'entry', 'intern'] as const;
export const EMPLOYEE_RANGES = ['1,10', '11,20', '21,50', '51,100', '101,200', '201,500', '501,1000', '1001,2000', '2001,5000', '5001,10000', '10001,1000000'] as const;
export const EMAIL_STATUS = ['verified', 'likely_to_engage', 'unverified', 'unavailable'] as const;
export const KEYWORD_FIELDS = ['tags', 'name', 'seo_description', 'social_media_description'] as const;

export interface ApolloFields {
  kind: 'people' | 'companies';
  titles: string[]; notTitles: string[]; seniorities: string[];
  country: string; city: string;
  employeeRanges: string[];
  keywords: string[]; keywordFields: string[]; techs: string[];
  emailStatus: string[]; excludeCatchAll: boolean;
}

const TR_MAP: Record<string, string> = { 'İ': 'I', 'ı': 'i', 'Ş': 'S', 'ş': 's', 'Ğ': 'G', 'ğ': 'g', 'Ü': 'U', 'ü': 'u', 'Ö': 'O', 'ö': 'o', 'Ç': 'C', 'ç': 'c' };
const ascii = (s: string) => s.replace(/[İıŞşĞğÜüÖöÇç]/g, (c) => TR_MAP[c]);
const clean = (s: unknown, n = 60) => String(s ?? '').replace(/[\u0000-\u001f<>"&#%\[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const isAscii = (s: string) => /^[\x20-\x7e]+$/.test(s);
const uniq = (a: string[]) => [...new Set(a)];

export const isTurkey = (country: string) => /^(turkey|t[uü]rkiye|turkiye)$/i.test(country.trim());
/** Encoding rules of the md: %20 for space, %2C for comma, UTF-8 percent for Turkish letters; "[]" and "#" stay. */
const enc = (s: string) => encodeURIComponent(s);

export function buildApolloUrl(f: ApolloFields): string {
  const tr = isTurkey(f.country);
  const q: string[] = ['page=1'];
  const add = (k: string, v: string[]) => v.forEach((x) => q.push(`${k}[]=${enc(x)}`));
  const loc = tr ? (f.city ? [`${f.city}, Turkey`] : ['Turkey', 'Türkiye']) : [f.city ? `${f.city}, ${f.country}` : f.country];
  const ranges = tr ? f.employeeRanges.filter((r) => r !== '1,10') : f.employeeRanges;
  if (f.kind === 'companies') {
    add('organizationLocations', tr ? ['Turkey'] : loc);
    add('organizationNumEmployeesRanges', ranges);
    add('currentlyUsingAnyOfTechnologyUids', f.techs);
    add('qOrganizationKeywordTags', f.keywords);
    add('includedOrganizationKeywordFields', f.keywordFields);
    return `https://app.apollo.io/#/companies?${q.join('&')}`;
  }
  q.push('sortByField=recommendations_score', 'sortAscending=false');
  add('personTitles', f.titles);
  add('personNotTitles', f.notTitles);
  add('personSeniorities', f.seniorities);
  add('personLocations', loc);
  add('organizationNumEmployeesRanges', ranges);
  add('currentlyUsingAnyOfTechnologyUids', f.techs);
  add('qOrganizationKeywordTags', f.keywords);
  add('includedOrganizationKeywordFields', f.keywordFields);
  const email = tr && !f.emailStatus.includes('likely_to_engage') ? [...f.emailStatus, 'likely_to_engage'] : f.emailStatus;
  add('contactEmailStatusV2', email);
  if (f.excludeCatchAll && !tr) q.push('contactEmailExcludeCatchAll=true');
  return `https://app.apollo.io/#/people?${q.join('&')}`;
}

/** Turns untrusted (client or LLM) input into valid fields: allow-lists, caps, md rules (3-6 titles, 2-4 keywords, verified always). */
export function sanitize(raw: Record<string, unknown>): ApolloFields {
  const list = (v: unknown, n: number, max = 60) => (Array.isArray(v) ? uniq(v.map((x) => clean(x, max)).filter(Boolean)).slice(0, n) : []);
  const pick = <T extends readonly string[]>(v: unknown, all: T, n = 20) => (Array.isArray(v) ? uniq(v.map(String).filter((x): x is T[number] => (all as readonly string[]).includes(x))).slice(0, n) : []);
  const country = clean(raw.country, 60);
  const tr = isTurkey(country);
  const keepLang = (a: string[]) => (tr ? a : a.filter(isAscii));   // outside Turkey the filter values stay English
  const kind = raw.kind === 'companies' ? 'companies' : 'people';
  let ranges = pick(raw.employeeRanges, EMPLOYEE_RANGES);
  if (!ranges.length) ranges = tr ? ['11,20', '21,50', '51,100'] : ['1,10', '11,20'];
  if (tr) ranges = ranges.filter((r) => r !== '1,10');
  const emailStatus = pick(raw.emailStatus, EMAIL_STATUS);
  const fields = pick(raw.keywordFields, KEYWORD_FIELDS);
  const keywords = keepLang(list(raw.keywords, 8, 40));
  return {
    kind,
    titles: keepLang(list(raw.titles, 12, 60)), notTitles: keepLang(list(raw.notTitles, 6, 40)),
    seniorities: pick(raw.seniorities, SENIORITIES),
    country: tr ? 'Turkey' : country, city: tr ? ascii(clean(raw.city, 40)) : clean(raw.city, 40),
    employeeRanges: ranges, keywords,
    keywordFields: fields.length ? fields : ['tags', 'name'],
    techs: Array.isArray(raw.techs) ? uniq(raw.techs.map((x) => String(x).toLowerCase()).filter((x) => /^[a-z0-9_]{2,40}$/.test(x))).slice(0, 6) : [],
    emailStatus: emailStatus.includes('verified') ? emailStatus : ['verified', ...emailStatus],
    excludeCatchAll: tr ? false : raw.excludeCatchAll !== false,
  };
}

/** What is missing before a URL is worth building (Turkish message for the admin), or '' when fine. */
export const fieldsProblem = (f: ApolloFields): string => {
  if (!f.country) return 'Ülke belirtilmedi: hangi ülke? (tahmin edilmez)';
  if (f.kind === 'people' && (!f.titles.length || !f.seniorities.length)) return 'Unvan ve kıdem gerekli.';
  if (!f.keywords.length) return 'En az bir sektör kelimesi (İngilizce) gerekli.';
  return '';
};

const range = (r: string) => r.replace(',', '-');
/** Output card exactly like the md "Çıktı formatı" + tips from the "Ayar" lists that apply to this URL. */
export function apolloCard(f: ApolloFields, url: string): string {
  const tr = isTurkey(f.country);
  const low = ['personTitles[] sayısını artır, benzer unvanlar ekle', 'bir çalışan aralığı daha ekle'];
  if (f.excludeCatchAll) low.push('contactEmailExcludeCatchAll=true satırını sil');
  if (f.city) low.push('şehir yerine ülke yaz');
  low.push('qOrganizationKeywordTags[] sayısını artır, daha genel kelime kullan');
  const high = ['çalışan aralığını tek aralığa indir'];
  if (!f.city) high.push('ülkeyi şehre indir');
  high.push('sektör kelimesini daha spesifik yap');
  if (f.keywordFields.includes('seo_description')) high.push("includedOrganizationKeywordFields[] içinden seo_description'ı çıkar, sadece tags bırak");
  high.push('personSeniorities[] daralt');
  return [
    `🎯 Kim ödeyecek: ${f.kind === 'people' ? f.titles.join(', ') : 'şirketler (kişi değil)'}`,
    `🏢 Nerede çalışıyor: ${f.keywords.join(', ')}${f.techs.length ? ` · sinyal: ${f.techs.join(', ')}` : ''}`,
    `📏 Şirket boyutu: ${f.employeeRanges.map(range).join(', ')}`,
    `🌍 Ülke: ${f.city ? `${f.city}, ` : ''}${f.country}${tr ? ' (Türkiye kuralları: Türkçe unvan, catch-all yok, 11+ çalışan)' : ''}`,
    '', 'APOLLO URL:', url, '',
    `Az sonuç gelirse: ${low.slice(0, 3).join('; ')}`,
    `Çok sonuç gelirse: ${high.slice(0, 3).join('; ')}`,
    'Doğru hedef 300 ile 2.000 sonuç arasıdır; URL\'i önce tarayıcıda açıp filtrelerin dolu olduğunu kontrol et.',
  ].join('\n');
}
