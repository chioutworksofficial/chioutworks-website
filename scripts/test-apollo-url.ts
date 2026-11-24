// Unit test: server/apolloUrl.ts must reproduce the owner's md examples byte for byte (example 1, T1, plus companies example 8 and T4). Run: npx tsx scripts/test-apollo-url.ts
import { buildApolloUrl, sanitize, apolloCard } from '../server/apolloUrl.js';

const cases: [string, Record<string, unknown>, string][] = [
  ['example 1 (Netherlands dental)', {
    titles: ['Owner', 'Practice Manager', 'Clinic Manager', 'Dentist'], seniorities: ['owner', 'founder', 'manager'], country: 'Netherlands', employeeRanges: ['1,10', '11,20'],
    keywords: ['dental clinic', 'dental practice', 'orthodontics'], keywordFields: ['tags', 'name'], emailStatus: ['verified'], excludeCatchAll: true,
  }, 'https://app.apollo.io/#/people?page=1&sortByField=recommendations_score&sortAscending=false&personTitles[]=Owner&personTitles[]=Practice%20Manager&personTitles[]=Clinic%20Manager&personTitles[]=Dentist&personSeniorities[]=owner&personSeniorities[]=founder&personSeniorities[]=manager&personLocations[]=Netherlands&organizationNumEmployeesRanges[]=1%2C10&organizationNumEmployeesRanges[]=11%2C20&qOrganizationKeywordTags[]=dental%20clinic&qOrganizationKeywordTags[]=dental%20practice&qOrganizationKeywordTags[]=orthodontics&includedOrganizationKeywordFields[]=tags&includedOrganizationKeywordFields[]=name&contactEmailStatusV2[]=verified&contactEmailExcludeCatchAll=true'],
  ['example T1 (Turkey software)', {
    titles: ['Founder', 'Kurucu', 'Genel Müdür', 'General Manager', 'CTO'], seniorities: ['owner', 'founder', 'c_suite'], country: 'Turkey', employeeRanges: ['11,20', '21,50', '51,100'],
    keywords: ['software', 'Yazılım', 'Bilişim'], keywordFields: ['tags', 'name'], emailStatus: ['verified'], excludeCatchAll: true,
  }, 'https://app.apollo.io/#/people?page=1&sortByField=recommendations_score&sortAscending=false&personTitles[]=Founder&personTitles[]=Kurucu&personTitles[]=Genel%20M%C3%BCd%C3%BCr&personTitles[]=General%20Manager&personTitles[]=CTO&personSeniorities[]=owner&personSeniorities[]=founder&personSeniorities[]=c_suite&personLocations[]=Turkey&personLocations[]=T%C3%BCrkiye&organizationNumEmployeesRanges[]=11%2C20&organizationNumEmployeesRanges[]=21%2C50&organizationNumEmployeesRanges[]=51%2C100&qOrganizationKeywordTags[]=software&qOrganizationKeywordTags[]=Yaz%C4%B1l%C4%B1m&qOrganizationKeywordTags[]=Bili%C5%9Fim&includedOrganizationKeywordFields[]=tags&includedOrganizationKeywordFields[]=name&contactEmailStatusV2[]=verified&contactEmailStatusV2[]=likely_to_engage'],
  ['example 2 (Shopify, technology + seo_description)', {
    titles: ['Founder', 'Owner', 'Ecommerce Manager', 'Head of Ecommerce', 'Marketing Manager'], seniorities: ['owner', 'founder', 'head', 'manager'], country: 'United States', employeeRanges: ['1,10', '11,20', '21,50'],
    techs: ['shopify'], keywords: ['ecommerce', 'online store'], keywordFields: ['tags', 'seo_description'], emailStatus: ['verified'], excludeCatchAll: true,
  }, 'https://app.apollo.io/#/people?page=1&sortByField=recommendations_score&sortAscending=false&personTitles[]=Founder&personTitles[]=Owner&personTitles[]=Ecommerce%20Manager&personTitles[]=Head%20of%20Ecommerce&personTitles[]=Marketing%20Manager&personSeniorities[]=owner&personSeniorities[]=founder&personSeniorities[]=head&personSeniorities[]=manager&personLocations[]=United%20States&organizationNumEmployeesRanges[]=1%2C10&organizationNumEmployeesRanges[]=11%2C20&organizationNumEmployeesRanges[]=21%2C50&currentlyUsingAnyOfTechnologyUids[]=shopify&qOrganizationKeywordTags[]=ecommerce&qOrganizationKeywordTags[]=online%20store&includedOrganizationKeywordFields[]=tags&includedOrganizationKeywordFields[]=seo_description&contactEmailStatusV2[]=verified&contactEmailExcludeCatchAll=true'],
  ['example 8 (companies, Netherlands)', { kind: 'companies', country: 'Netherlands', employeeRanges: ['1,10', '11,20'], keywords: ['dental clinic'], keywordFields: ['tags', 'name'] },
    'https://app.apollo.io/#/companies?page=1&organizationLocations[]=Netherlands&organizationNumEmployeesRanges[]=1%2C10&organizationNumEmployeesRanges[]=11%2C20&qOrganizationKeywordTags[]=dental%20clinic&includedOrganizationKeywordFields[]=tags&includedOrganizationKeywordFields[]=name'],
  ['example T4 (companies, Turkey)', { kind: 'companies', country: 'Türkiye', employeeRanges: ['21,50', '51,100'], keywords: ['Yazılım', 'software'], keywordFields: ['tags', 'name'] },
    'https://app.apollo.io/#/companies?page=1&organizationLocations[]=Turkey&organizationNumEmployeesRanges[]=21%2C50&organizationNumEmployeesRanges[]=51%2C100&qOrganizationKeywordTags[]=Yaz%C4%B1l%C4%B1m&qOrganizationKeywordTags[]=software&includedOrganizationKeywordFields[]=tags&includedOrganizationKeywordFields[]=name'],
];
let bad = 0;
for (const [name, input, want] of cases) {
  const got = buildApolloUrl(sanitize(input));
  const ok = got === want && !/\s/.test(got);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) { bad++; console.log(' got :', got); console.log(' want:', want); }
}
// rules: Turkey drops 1-10 and catch-all; non-Turkey drops non-ASCII keywords; sanitize ignores unknown seniority
const t = buildApolloUrl(sanitize({ titles: ['Owner'], seniorities: ['owner', 'boss'], country: 'Turkey', employeeRanges: ['1,10', '11,20'], keywords: ['x'], excludeCatchAll: true }));
const d = sanitize({ titles: ['Inhaber', 'Zahnärztin'], seniorities: ['owner'], country: 'Germany', keywords: ['dental clinic', 'Zahnklinik ü'] });
const rules: [string, boolean][] = [
  ['Turkey: no 1-10, no catch-all, likely_to_engage, unknown seniority dropped', !t.includes('1%2C10') && !t.includes('CatchAll') && t.includes('likely_to_engage') && !t.includes('boss')],
  ['non-Turkey: non-ASCII title/keyword dropped', d.titles.join() === 'Inhaber' && d.keywords.join() === 'dental clinic'],
  ['card has the md blocks', ['🎯', '🏢', '📏', '🌍', 'APOLLO URL:', 'Az sonuç gelirse:', 'Çok sonuç gelirse:'].every((s) => apolloCard(sanitize(cases[0][1]), 'u').includes(s))],
];
for (const [n, ok] of rules) { console.log(`${ok ? 'PASS' : 'FAIL'} ${n}`); if (!ok) bad++; }
process.exit(bad ? 1 : 0);
