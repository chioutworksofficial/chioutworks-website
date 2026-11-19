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
  if (path.includes('availability')) return { blocked: [day(3), day(4), day(9), day(15), day(16), day(22)] };
  return {};
}
