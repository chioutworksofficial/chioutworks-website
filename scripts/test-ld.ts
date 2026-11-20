import { buildPageLd, articleLd, serviceLd } from '../src/lib/structuredData';
import { LANGS } from '../src/lib/routes';
import { BLOG_POSTS } from '../src/data/sections';

const ok = (c: boolean, m: string) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
const types = (d: any) => d['@graph'].flatMap((n: any) => [n['@type']].flat());
for (const l of LANGS) {
  const home = JSON.parse(JSON.stringify(buildPageLd(l, 'home', `/${l}/home`)));
  ok(types(home).includes('WebSite') && !types(home).includes('BreadcrumbList'), `home ${l}`);
  const faq = JSON.parse(JSON.stringify(buildPageLd(l, 'faq', `/${l}/faq`)));
  ok(types(faq).includes('FAQPage') && types(faq).includes('BreadcrumbList'), `faq ${l}`);
  const p = BLOG_POSTS[l][0];
  const art = JSON.parse(JSON.stringify(buildPageLd(l, 'blog', `/${l}/blog/${p.id}`, [{ name: p.title, path: `/${l}/blog/${p.id}` }], [articleLd(l, p, BLOG_POSTS.en[0].date, `/${l}/blog/${p.id}`)])));
  const a = art['@graph'].find((n: any) => n['@type'] === 'BlogPosting');
  ok(a.datePublished === '2026-11-19' && a.inLanguage === l && art['@graph'].find((n: any) => n['@type'] === 'BreadcrumbList').itemListElement.length === 3, `article ${l}`);
  const svc = JSON.parse(JSON.stringify(buildPageLd(l, 'packages', `/${l}/x/crm`, [{ name: 'CRM', path: `/${l}/x/crm` }], [serviceLd(l, 'CRM', 'd', `/${l}/x/crm`)])));
  ok(types(svc).includes('Service'), `service ${l}`);
}
console.log('LD OK');
