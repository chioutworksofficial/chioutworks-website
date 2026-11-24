// DEV-only mock data for screenshots (?admindemo=1). Imported dynamically behind import.meta.env.DEV.
import type { Req, VoiceSession } from './api';

const ago = (h: number) => new Date(Date.now() - h * 3600e3).toISOString();
const day = (n: number) => { const d = new Date(Date.now() + n * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
let requests: Req[] = [
  { id: 'r1', createdAt: ago(2), kind: 'contact', name: 'Mehmet Yılmaz', email: 'mehmet@example.com', phone: '+49 170 1234567', business: 'Yılmaz Kuaför', message: 'Randevu sistemi ve WhatsApp botu hakkında bilgi almak istiyorum. Salonumuzda 4 kişi çalışıyoruz.', lang: 'tr', replyPreference: 'phone', preferredStart: '2026-12-01', callTime: '10:00-12:00', voiceSessionId: 'v1' },
  { id: 'r2', createdAt: ago(20), kind: 'contact', name: 'Anna Schneider', email: 'anna@example.de', message: 'Wir suchen eine Lösung für Online-Buchungen.', lang: 'de', replyPreference: 'written', topic: 'res-qr' },
  { id: 'r3', createdAt: ago(50), kind: 'quote', name: 'Giorgos Papas', email: 'giorgos@example.gr', business: 'Papas Taverna', modules: ['core', 'qr', 'whatsapp'], lang: 'el', read: true },
  { id: 'r4', createdAt: ago(130), kind: 'demo-request', name: 'Sarah Cole', email: 'sarah@example.com', demo: 'demokuafor', lang: 'en', read: true },
  { id: 'r5', createdAt: ago(300), kind: 'contact', name: 'Ayşe Demir', email: 'ayse@example.com', phone: '+90 532 000 0000', message: 'Web sitesi yenileme.', lang: 'tr', replyPreference: 'written', topic: 'res-review', read: true },
  { id: 'r6', createdAt: ago(520), kind: 'quote', name: 'Jonas Weber', email: 'jonas@example.de', modules: ['core', 'ai'], lang: 'de', read: true },
];
const sessions: VoiceSession[] = [
  { id: 'v1', createdAt: ago(2.2), lang: 'tr', contactSubmitted: true, contact: { name: 'Mehmet Yılmaz', email: 'mehmet@example.com' }, turns: [
    { role: 'assistant', text: 'Merhaba, ben Chioutworks asistanıyım. Nasıl yardımcı olabilirim?', at: Date.now() - 8e6 },
    { role: 'user', text: 'Kuaför salonum için randevu sistemi lazım.', at: Date.now() - 7.9e6 },
    { role: 'assistant', text: 'Anladım. Kaç kişilik bir ekibiniz var ve müşteriler şu an nasıl randevu alıyor?', at: Date.now() - 7.8e6 },
    { role: 'user', text: 'Dört kişiyiz, telefonla alıyoruz.', at: Date.now() - 7.7e6 },
  ] },
  { id: 'v2', createdAt: ago(70), lang: 'de', contactSubmitted: false, turns: [
    { role: 'assistant', text: 'Hallo! Wie kann ich helfen?', at: Date.now() - 2.5e8 },
    { role: 'user', text: 'Was kostet eine Website?', at: Date.now() - 2.49e8 },
  ] },
];
export function demoApi(path: string, method: string): unknown {
  if (method === 'PATCH') { const id = path.split('/').pop(); requests = requests.map((r) => r.id === id ? { ...r, read: true } : r); return { ok: true }; }
  if (method !== 'GET') return { ok: true };
  if (path.endsWith('/me')) return { ok: true };
  if (path.includes('quote-requests')) return { requests };
  if (path.includes('voice-sessions')) return { sessions };
  if (path.includes('tts-usage')) return { chars: 182400, cap: 450000 };
  if (path.includes('/admin/providers')) return providersDemo();
  if (path.includes('/admin/sales') || path.includes('/admin/site-checks') || path.includes('/admin/newsletter')) return salesDemo(path, method);
  if (path.includes('availability')) return { blocked: [day(3), day(4), day(9), day(15), day(16), day(22)] };
  return {};
}

function providersDemo() {
  const man = { plan: '', fee: null, currency: 'EUR', cycle: 'monthly', renewal: '', prepaid: null, cap: null, notes: '' };
  const P = (id: string, name: string, category: string, where: string, configured: boolean, hint: string | null, usage: unknown = null, manual: object = {}, keyless = false) =>
    ({ id, name, category, where, configured, hint, usage, keyless, billingUrl: 'https://example.com/billing', manual: { ...man, ...manual } });
  return { at: new Date().toISOString(), fal: { monthUsd: 4.2, totalUsd: 6.1, count: 14 }, providers: [
    P('groq', 'Groq', 'ai', 'Yazılı sohbet, analiz, taslaklar', true, '••••a1b2', null, { plan: 'Ücretsiz', fee: 0 }),
    P('gemini', 'Google Gemini', 'ai', 'Sesli asistan (canlı) ve metin yedeği', true, '••••c3d4'),
    P('openai', 'OpenAI', 'ai', 'Yedek dil modeli', false, null),
    P('elevenlabs', 'ElevenLabs', 'voice', 'Tanıtım videoları için ses', true, '••••e5f6', { kind: 'bar', label: 'Paket: creator', used: 92000, limit: 100000, pct: 92, unit: 'karakter', resets: new Date(Date.now() + 9 * 864e5).toISOString() }, { plan: 'Creator', fee: 22, currency: 'USD', renewal: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10) }),
    P('vapi', 'Vapi', 'voice', 'Voice Agent: telefonla arayan asistan', true, '••••9z8y', null, { prepaid: 8, cap: 50 }),
    P('apify', 'Apify', 'data', 'Site tarama (ileride)', true, '••••7x6w', { kind: 'bar', label: 'Aylık kullanım', used: 4.1, limit: 5, pct: 82, unit: 'USD', resets: new Date(Date.now() + 12 * 864e5).toISOString() }),
    P('fal', 'fal.ai', 'data', 'Tanıtım görseli ve videosu üretimi (yalnızca yerel)', true, '••••5v4u'),
    P('pagespeed', 'Google PageSpeed', 'data', 'Satış bölümü: site hız notu', true, null, null, {}, true),
    P('x', 'X (Twitter)', 'data', 'Trend Radar', false, null),
    P('resend', 'Resend', 'mail', 'E-posta gönderimi', true, '••••3t2s', { kind: 'text', label: 'Alan adı doğrulaması: 0/1 doğrulandı' }, { plan: 'Ücretsiz' }),
    P('supabase', 'Supabase', 'infra', 'Veritabanı ve dosyalar', true, '••••1r0q', { kind: 'error' }, { plan: 'Pro', fee: 25, currency: 'USD', cycle: 'monthly' }),
    P('vercel', 'Vercel', 'infra', 'Barındırma ve yayın', true, null, null, { plan: 'Hobby', fee: 0 }),
    P('stripe', 'Stripe', 'pay', 'Teklif ödemeleri', false, null),
    P('meta', 'Meta reklam kitaplığı', 'ads', 'Trend Radar: rakip reklamları', false, null),
  ] };
}

function salesDemo(path: string, method: string): unknown {
  if (path.includes('/apollo-urls')) return method === 'GET' ? { items: [{ id: 'a1', createdAt: ago(30), idea: 'Diş klinikleri için randevu hatırlatma, Hollanda', fields: { kind: 'people', titles: ['Owner'], notTitles: [], seniorities: ['owner'], country: 'Netherlands', city: '', employeeRanges: ['1,10'], keywords: ['dental clinic'], keywordFields: ['tags', 'name'], techs: [], emailStatus: ['verified'], excludeCatchAll: true }, url: 'https://app.apollo.io/#/people?page=1&personTitles[]=Owner' }] } : { ok: true };
  if (path.includes('/apollo-url')) {
    const url = 'https://app.apollo.io/#/people?page=1&sortByField=recommendations_score&sortAscending=false&personTitles[]=Owner&personTitles[]=Practice%20Manager&personTitles[]=Clinic%20Manager&personTitles[]=Dentist&personSeniorities[]=owner&personSeniorities[]=founder&personSeniorities[]=manager&personLocations[]=Netherlands&organizationNumEmployeesRanges[]=1%2C10&organizationNumEmployeesRanges[]=11%2C20&qOrganizationKeywordTags[]=dental%20clinic&qOrganizationKeywordTags[]=dental%20practice&qOrganizationKeywordTags[]=orthodontics&includedOrganizationKeywordFields[]=tags&includedOrganizationKeywordFields[]=name&contactEmailStatusV2[]=verified&contactEmailExcludeCatchAll=true';
    return { fields: { kind: 'people', titles: ['Owner', 'Practice Manager', 'Clinic Manager', 'Dentist'], notTitles: [], seniorities: ['owner', 'founder', 'manager'], country: 'Netherlands', city: '', employeeRanges: ['1,10', '11,20'], keywords: ['dental clinic', 'dental practice', 'orthodontics'], keywordFields: ['tags', 'name'], techs: [], emailStatus: ['verified'], excludeCatchAll: true }, url,
      card: ['🎯 Kim ödeyecek: Owner, Practice Manager, Clinic Manager, Dentist', '🏢 Nerede çalışıyor: dental clinic, dental practice, orthodontics', '📏 Şirket boyutu: 1-10, 11-20', '🌍 Ülke: Netherlands', '', 'APOLLO URL:', url, '', 'Az sonuç gelirse: personTitles[] sayısını artır, benzer unvanlar ekle; bir çalışan aralığı daha ekle; contactEmailExcludeCatchAll=true satırını sil', 'Çok sonuç gelirse: çalışan aralığını tek aralığa indir; ülkeyi şehre indir; sektör kelimesini daha spesifik yap'].join('\n') };
  }
  if (path.includes('/admin/site-checks')) return { items: [], mailReady: false };
  if (path.includes('/admin/newsletter')) return { subscribers: [] };
  const cat = (key: string, label: string, weight: number, score: number | null) => ({ key, label, weight, score, n: 4 });
  const scan = { version: 2, fetcher: 'demo', at: ago(5), pages: [{ url: 'https://zahnarzt-beispiel.de', status: 200 }], psi: { score: 64 }, score: 58, rawScore: 58, grade: 'D', capped: [],
    categories: [cat('tech', 'Teknik ve hız', 20, 71), cat('seo', 'SEO', 20, 44), cat('conv', 'Dönüşüm ve iletişim', 20, 35), cat('trust', 'Güven ve yasal', 15, 90), cat('auto', 'Otomasyon', 10, 0), cat('content', 'İçerik ve netlik', 15, null)],
    checks: [], opportunities: [{ id: 'booking', title: 'Online randevu ve otomatik hatırlatma', what: 'Randevu site üzerinden alınsın.', why: 'Randevu bağlantısı yok.', impact: 'yüksek', effort: 'orta', service: 'Randevu', reason: 'Sitede randevu yok.' }], noNeed: [], unmeasured: [{ label: 'İçerik netliği', reason: 'Ölçülemedi' }], priority: 'İletişime değer', summary: 'Belirgin eksikler olan bir tablo görüldü.', facts: { cms: 'WordPress', lang: 'de', country: 'Almanya', booking: [], chat: [], whatsapp: false, hreflang: [], socials: [], forms: 1 } };
  const an = { company: 'Zahnarztpraxis Beispiel', city: 'Köln', country: 'Almanya', sector: 'Klinik', summary: 'Diş kliniği.', has: [], missing: [], reasonable_cause: 'Sitede online randevu yok.', grade: 'D', grade_reason: '', first_step: '', opener: '' };
  const sig = { https: true, viewport: true, hasForm: true, booking: [], chat: [], whatsapp: false, hreflang: ['de'], title: 'Zahnarzt', description: '', socials: [] };
  const mk = (id: string, domain: string, extra: object) => ({ id, createdAt: ago(40), analyzedAt: ago(5), url: `https://${domain}`, domain, analysis: an, signals: sig, scan, status: 'new', notes: [], history: [], ...extra });
  return { mailReady: true, leads: [
    mk('l1', 'zahnarzt-beispiel.de', { email: 'x', tags: ['opt_in'], canMail: true, reportSends: [{ id: 's1', at: ago(2), lang: 'de' }], reportAnswer: { at: ago(1), answer: 'yes', when: 'morning' } }),
    mk('l2', 'kfz-beispiel.de', { canMail: false }),
  ] };
}
