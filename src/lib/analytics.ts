// Lightweight client-side analytics tracker.
// Stores visits, clicks and sessions in localStorage so the /admin
// dashboard can render real charts based on real visitors of THIS browser
// (and any browser that loads the site, persisted on their own device).
// Designed so it can later be swapped for a Supabase-backed implementation
// without changing the consumer (AdminDashboard / AnalyticsTracker) much.

export interface VisitRecord {
  id: string;
  sessionId: string;
  visitorId: string;
  timestamp: number;
  path: string;
  referrer: string;
  lang: string;
  device: 'Mobile' | 'Tablet' | 'Desktop';
  browser: string;
  os: string;
  country: string;
  countryCode: string;
  city: string;
  ip: string;
  duration: number; // seconds, updated on unload
}

export interface ClickRecord {
  id: string;
  sessionId: string;
  timestamp: number;
  path: string;
  label: string;
}

interface AnalyticsStore {
  visits: VisitRecord[];
  clicks: ClickRecord[];
}

const STORE_KEY = 'cw_analytics_v1';
const SESSION_KEY = 'cw_analytics_session';
const VISITOR_KEY = 'cw_analytics_visitor';
const MAX_VISITS = 1000;
const MAX_CLICKS = 2000;

function readStore(): AnalyticsStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { visits: [], clicks: [] };
    const parsed = JSON.parse(raw);
    return {
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      clicks: Array.isArray(parsed.clicks) ? parsed.clicks : [],
    };
  } catch {
    return { visits: [], clicks: [] };
  }
}

function writeStore(store: AnalyticsStore) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* storage full or unavailable – ignore */
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uid();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Persistent across sessions (localStorage) – used to tell new vs. returning visitors apart. */
export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uid();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

// ── User-agent parsing (no external deps) ─────────────────────────────────
function detectDevice(ua: string): VisitRecord['device'] {
  if (/iPad|Tablet/i.test(ua)) return 'Tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
  return 'Diğer';
}

function detectOS(ua: string): string {
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad|iOS/.test(ua)) return 'iOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Diğer';
}

// ── Geo guess (local only: navigator.language + time zone; nothing is sent anywhere) ──
interface GeoInfo {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
}

const TZ_COUNTRY: Record<string, string> = {
  'Europe/Berlin': 'de', 'Europe/Vienna': 'at', 'Europe/Zurich': 'ch', 'Europe/Istanbul': 'tr',
  'Europe/Athens': 'gr', 'Europe/London': 'gb', 'Europe/Paris': 'fr', 'Europe/Madrid': 'es',
  'Europe/Rome': 'it', 'Europe/Amsterdam': 'nl', 'Europe/Nicosia': 'cy',
};

async function getGeoInfo(): Promise<GeoInfo> {
  const unknown = 'Bilinmiyor';
  let code = '';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    code = TZ_COUNTRY[tz] ?? (navigator.language.split('-')[1] ?? '').toLowerCase();
  } catch { /* ignore */ }
  let country = unknown;
  try { if (code) country = new Intl.DisplayNames(['tr'], { type: 'region' }).of(code.toUpperCase()) ?? unknown; } catch { /* ignore */ }
  return { ip: unknown, country, countryCode: code, city: unknown };
}

// ── Public API ──────────────────────────────────────────────────────────-

let activeVisitId: string | null = null;
let visitStart = 0;

export async function trackPageView(path: string, lang: string) {
  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const ua = navigator.userAgent;
  const geo = await getGeoInfo();

  const record: VisitRecord = {
    id: uid(),
    sessionId,
    visitorId,
    timestamp: Date.now(),
    path,
    referrer: document.referrer || 'Direkt',
    lang,
    device: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
    country: geo.country,
    countryCode: geo.countryCode,
    city: geo.city,
    ip: geo.ip,
    duration: 0,
  };

  const store = readStore();
  store.visits.push(record);
  if (store.visits.length > MAX_VISITS) {
    store.visits = store.visits.slice(store.visits.length - MAX_VISITS);
  }
  writeStore(store);

  activeVisitId = record.id;
  visitStart = Date.now();
}

export function trackClick(label: string, path: string) {
  const record: ClickRecord = {
    id: uid(),
    sessionId: getSessionId(),
    timestamp: Date.now(),
    path,
    label,
  };
  const store = readStore();
  store.clicks.push(record);
  if (store.clicks.length > MAX_CLICKS) {
    store.clicks = store.clicks.slice(store.clicks.length - MAX_CLICKS);
  }
  writeStore(store);
}

export function flushVisitDuration() {
  if (!activeVisitId) return;
  const elapsed = Math.round((Date.now() - visitStart) / 1000);
  if (elapsed <= 0) return;

  const store = readStore();
  const visit = store.visits.find((v) => v.id === activeVisitId);
  if (visit) {
    visit.duration = elapsed;
    writeStore(store);
  }
}

export function getAnalyticsData(): AnalyticsStore {
  return readStore();
}

export function clearAnalyticsData() {
  writeStore({ visits: [], clicks: [] });
}

// ── Demo data seeding (so the dashboard isn't empty on first run) ─────────
const DEMO_PATHS = ['/', '/#hizmetler', '/#portfolio', '/#blog', '/#iletisim', '/privacy', '/docs'];
const DEMO_COUNTRIES: { country: string; countryCode: string; city: string }[] = [
  { country: 'Almanya', countryCode: 'de', city: 'Berlin' },
  { country: 'Almanya', countryCode: 'de', city: 'Münih' },
  { country: 'Türkiye', countryCode: 'tr', city: 'İstanbul' },
  { country: 'Türkiye', countryCode: 'tr', city: 'Ankara' },
  { country: 'Avusturya', countryCode: 'at', city: 'Viyana' },
  { country: 'Yunanistan', countryCode: 'gr', city: 'Atina' },
  { country: 'ABD', countryCode: 'us', city: 'New York' },
  { country: 'İsviçre', countryCode: 'ch', city: 'Zürih' },
];
const DEMO_DEVICES: VisitRecord['device'][] = ['Desktop', 'Mobile', 'Mobile', 'Desktop', 'Tablet'];
const DEMO_BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Chrome', 'Chrome'];
const DEMO_OS = ['Windows', 'macOS', 'Android', 'iOS', 'Linux'];
const DEMO_LANGS = ['tr', 'en', 'de', 'el'];
const DEMO_LABELS = [
  'Nav: Hizmetler', 'Nav: Portfolyo', 'Nav: İletişim', 'CTA: Teklif Al',
  'Hero: Başla Butonu', 'Buton: WhatsApp', 'Link: LinkedIn', 'Buton: Dil Değiştir',
  'Footer: Email', 'Blog: Yazıyı Oku', 'Servis Kartı: Otomasyon', 'Servis Kartı: Web Geliştirme',
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function seedDemoData(days = 14, visitsPerDay = 12) {
  const store = readStore();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // A pool of "returning" visitors – ~35% of visits reuse one of these IDs.
  const returningPool = Array.from({ length: 12 }, () => uid());

  for (let d = days - 1; d >= 0; d--) {
    const dayStart = now - d * dayMs;
    const count = randInt(Math.max(2, visitsPerDay - 6), visitsPerDay + 6);
    for (let i = 0; i < count; i++) {
      const geo = pick(DEMO_COUNTRIES);
      const sessionId = uid();
      const visitorId = Math.random() < 0.35 ? pick(returningPool) : uid();
      const timestamp = dayStart - randInt(0, dayMs - 1);
      store.visits.push({
        id: uid(),
        sessionId,
        visitorId,
        timestamp,
        path: pick(DEMO_PATHS),
        referrer: pick(['Direkt', 'google.com', 'instagram.com', 'linkedin.com', 'Direkt']),
        lang: pick(DEMO_LANGS),
        device: pick(DEMO_DEVICES),
        browser: pick(DEMO_BROWSERS),
        os: pick(DEMO_OS),
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        ip: `${randInt(10, 250)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
        duration: randInt(8, 320),
      });

      const clickCount = randInt(0, 4);
      for (let c = 0; c < clickCount; c++) {
        store.clicks.push({
          id: uid(),
          sessionId,
          timestamp: timestamp + randInt(1000, 60000),
          path: pick(DEMO_PATHS),
          label: pick(DEMO_LABELS),
        });
      }
    }
  }

  if (store.visits.length > MAX_VISITS) store.visits = store.visits.slice(store.visits.length - MAX_VISITS);
  if (store.clicks.length > MAX_CLICKS) store.clicks = store.clicks.slice(store.clicks.length - MAX_CLICKS);

  writeStore(store);
}

export function hasAnyData(): boolean {
  const store = readStore();
  return store.visits.length > 0;
}

// ── CSV export ──────────────────────────────────────────────────────────-
function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function exportVisitsCSV(visits: VisitRecord[]) {
  const headers = [
    'Tarih', 'Sayfa', 'Ülke', 'Şehir', 'IP', 'Cihaz', 'Tarayıcı', 'OS',
    'Dil', 'Süre (sn)', 'Kaynak', 'Ziyaretçi ID', 'Oturum ID',
  ];
  const rows = visits.map((v) => [
    new Date(v.timestamp).toISOString(),
    v.path || '/',
    v.country,
    v.city,
    v.ip,
    v.device,
    v.browser,
    v.os,
    v.lang,
    v.duration,
    v.referrer,
    v.visitorId,
    v.sessionId,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chioutworks-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
