import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  getAnalyticsData, seedDemoData, clearAnalyticsData, hasAnyData, exportVisitsCSV,
  type VisitRecord, type ClickRecord,
} from '../lib/analytics';
import { getAppointments } from '../lib/appointments';
import AppointmentsPanel from '../components/admin/AppointmentsPanel';
import VoiceSessionsPanel from '../components/admin/VoiceSessionsPanel';
import ContactRequestsPanel from '../components/admin/ContactRequestsPanel';
import AvailabilityPanel from '../components/admin/AvailabilityPanel';

const AUTH_KEY = 'cw_admin_auth';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

const COLORS = ['#bbf451', '#262323e0', '#9ee82a', '#8c5a4a', '#2da44e', '#dee2de', '#d8f999'];

const LANG_NAMES: Record<string, string> = {
  tr: 'Türkçe', en: 'English', de: 'Deutsch', el: 'Ελληνικά',
};

function flagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = [...countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}sn`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}dk ${s}sn`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Login ───────────────────────────────────────────────────────────────-
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      onSuccess();
    } else {
      setError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--background)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-sm p-8 flex flex-col gap-5"
      >
        <div>
          <p className="eyebrow" style={{ color: 'var(--color-feature-success)' }}>Yönetim Paneli</p>
          <h1 className="text-2xl font-extrabold mt-1" style={{ color: 'var(--color-ink-strongest)' }}>
            Giriş Yap
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-ink-muted)' }}>
            Site analizlerini görüntülemek için giriş yapın.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--color-ink-strong)' }}>
            Kullanıcı adı
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--color-surface-darker)',
              border: '1px solid var(--color-border-card)',
              color: 'var(--color-ink-strongest)',
            }}
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--color-ink-strong)' }}>
            Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--color-surface-darker)',
              border: '1px solid var(--color-border-card)',
              color: 'var(--color-ink-strongest)',
            }}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm font-medium" style={{ color: '#d92d20' }}>{error}</p>
        )}

        <button type="submit" className="btn-lime w-full justify-center mt-1">
          Giriş Yap
        </button>
      </form>
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────-
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <p className="eyebrow" style={{ color: 'var(--color-ink-faint)' }}>{label}</p>
      <p className="stat-num">{value}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <p className="font-bold text-sm" style={{ color: 'var(--color-ink-strongest)' }}>{title}</p>
      {children}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────-
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<'analytics' | 'appointments' | 'voice' | 'requests' | 'calendar'>('analytics');
  const [pendingCount, setPendingCount] = useState(0);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [clicks, setClicks] = useState<ClickRecord[]>([]);
  const [range, setRange] = useState<7 | 14 | 30>(14);
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const reload = () => {
    const data = getAnalyticsData();
    setVisits(data.visits);
    setClicks(data.clicks);
    setLastUpdated(Date.now());
    setPendingCount(getAppointments().filter((a) => a.status === 'pending').length);
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(reload, 15000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const { cutoff, upperBound } = useMemo(() => {
    if (customRange?.from && customRange?.to) {
      return {
        cutoff: new Date(customRange.from).setHours(0, 0, 0, 0),
        upperBound: new Date(customRange.to).setHours(23, 59, 59, 999),
      };
    }
    return { cutoff: Date.now() - range * 24 * 60 * 60 * 1000, upperBound: Date.now() };
  }, [range, customRange]);

  const rangedVisits = useMemo(
    () => visits.filter((v) => v.timestamp >= cutoff && v.timestamp <= upperBound),
    [visits, cutoff, upperBound]
  );
  const rangedClicks = useMemo(
    () => clicks.filter((c) => c.timestamp >= cutoff && c.timestamp <= upperBound),
    [clicks, cutoff, upperBound]
  );

  // Visitors active in the last 5 minutes
  const activeNow = useMemo(() => {
    const recentCutoff = Date.now() - 5 * 60 * 1000;
    return new Set(visits.filter((v) => v.timestamp >= recentCutoff).map((v) => v.sessionId)).size;
  }, [visits, lastUpdated]);

  const rangeLabel = customRange?.from && customRange?.to ? 'Seçili aralık' : `Son ${range} gün`;

  const totalVisits = rangedVisits.length;
  const uniqueVisitors = useMemo(
    () => new Set(rangedVisits.map((v) => v.sessionId)).size,
    [rangedVisits]
  );
  const avgDuration = useMemo(() => {
    if (rangedVisits.length === 0) return 0;
    const sum = rangedVisits.reduce((acc, v) => acc + v.duration, 0);
    return Math.round(sum / rangedVisits.length);
  }, [rangedVisits]);

  // Visits per day
  const visitsByDay = useMemo(() => {
    const map = new Map<string, { date: string; ziyaret: number; tekil: number }>();
    const seenSession = new Map<string, Set<string>>();
    for (let i = range - 1; i >= 0; i--) {
      const ts = Date.now() - i * 24 * 60 * 60 * 1000;
      const key = dayKey(ts);
      const label = new Date(ts).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      map.set(key, { date: label, ziyaret: 0, tekil: 0 });
      seenSession.set(key, new Set());
    }
    for (const v of rangedVisits) {
      const key = dayKey(v.timestamp);
      const entry = map.get(key);
      if (!entry) continue;
      entry.ziyaret += 1;
      const sessions = seenSession.get(key)!;
      if (!sessions.has(v.sessionId)) {
        sessions.add(v.sessionId);
        entry.tekil += 1;
      }
    }
    return Array.from(map.values());
  }, [rangedVisits, range]);

  // Top pages
  const topPages = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of rangedVisits) {
      map.set(v.path, (map.get(v.path) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([path, count]) => ({ path: path || '/', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rangedVisits]);

  // Device breakdown
  const deviceData = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of rangedVisits) {
      map.set(v.device, (map.get(v.device) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [rangedVisits]);

  // Browser breakdown
  const browserData = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of rangedVisits) {
      map.set(v.browser, (map.get(v.browser) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rangedVisits]);

  // Country breakdown
  const countryData = useMemo(() => {
    const map = new Map<string, { country: string; countryCode: string; count: number }>();
    for (const v of rangedVisits) {
      const key = v.country || 'Bilinmiyor';
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { country: key, countryCode: v.countryCode, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [rangedVisits]);

  // Language breakdown
  const langData = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of rangedVisits) {
      const key = LANG_NAMES[v.lang] || v.lang.toUpperCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rangedVisits]);

  // Hourly traffic distribution (0-23)
  const hourlyData = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h.toString().padStart(2, '0')}:00`, ziyaret: 0 }));
    for (const v of rangedVisits) {
      buckets[new Date(v.timestamp).getHours()].ziyaret += 1;
    }
    return buckets;
  }, [rangedVisits]);

  // New vs returning visitors
  const visitorTypeData = useMemo(() => {
    const firstSeen = new Map<string, number>();
    for (const v of visits) {
      const existing = firstSeen.get(v.visitorId);
      if (existing === undefined || v.timestamp < existing) firstSeen.set(v.visitorId, v.timestamp);
    }
    const seen = new Set<string>();
    let newCount = 0;
    let returningCount = 0;
    for (const v of rangedVisits) {
      if (seen.has(v.visitorId)) continue;
      seen.add(v.visitorId);
      const first = firstSeen.get(v.visitorId);
      if (first !== undefined && first < cutoff) returningCount += 1;
      else newCount += 1;
    }
    return [
      { name: 'Yeni Ziyaretçi', value: newCount },
      { name: 'Dönen Ziyaretçi', value: returningCount },
    ];
  }, [rangedVisits, visits, cutoff]);

  // Bounce rate & pages-per-session
  const sessionStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of rangedVisits) {
      map.set(v.sessionId, (map.get(v.sessionId) || 0) + 1);
    }
    const sessions = map.size;
    if (sessions === 0) return { bounceRate: 0, avgPages: 0 };
    const singlePage = Array.from(map.values()).filter((c) => c === 1).length;
    const totalPages = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return {
      bounceRate: Math.round((singlePage / sessions) * 100),
      avgPages: Math.round((totalPages / sessions) * 10) / 10,
    };
  }, [rangedVisits]);

  // Conversion funnel: visitors -> engaged (any click) -> CTA / contact click
  const CTA_PATTERN = /CTA|İletişim|WhatsApp|Email|Teklif|Başla/i;
  const funnelData = useMemo(() => {
    const sessionsWithClick = new Set(rangedClicks.map((c) => c.sessionId));
    const sessionsWithCta = new Set(
      rangedClicks.filter((c) => CTA_PATTERN.test(c.label)).map((c) => c.sessionId)
    );
    const totalSessions = new Set(rangedVisits.map((v) => v.sessionId)).size;
    return [
      { label: 'Ziyaretçi', count: totalSessions },
      { label: 'Etkileşimde Bulundu', count: sessionsWithClick.size },
      { label: 'CTA / İletişime Tıkladı', count: sessionsWithCta.size },
    ];
  }, [rangedVisits, rangedClicks]);

  // Per-page engagement: visits + clicks per page
  const pageEngagement = useMemo(() => {
    const visitMap = new Map<string, number>();
    for (const v of rangedVisits) {
      visitMap.set(v.path || '/', (visitMap.get(v.path || '/') || 0) + 1);
    }
    const clickMap = new Map<string, number>();
    for (const c of rangedClicks) {
      clickMap.set(c.path || '/', (clickMap.get(c.path || '/') || 0) + 1);
    }
    const pages = new Set([...visitMap.keys(), ...clickMap.keys()]);
    return Array.from(pages)
      .map((path) => {
        const v = visitMap.get(path) || 0;
        const c = clickMap.get(path) || 0;
        return { path, visits: v, clicks: c, rate: v > 0 ? Math.round((c / v) * 100) : 0 };
      })
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8);
  }, [rangedVisits, rangedClicks]);

  // Most clicked elements
  const topClicks = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of rangedClicks) {
      map.set(c.label, (map.get(c.label) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rangedClicks]);

  // Recent visitors table
  const [tableFilter, setTableFilter] = useState('');
  const recentVisitors = useMemo(() => {
    const sorted = [...visits].sort((a, b) => b.timestamp - a.timestamp);
    const term = tableFilter.trim().toLowerCase();
    const filtered = term
      ? sorted.filter((v) =>
          [v.country, v.city, v.ip, v.device, v.browser, v.os, v.path, v.referrer]
            .some((field) => field.toLowerCase().includes(term))
        )
      : sorted;
    return filtered.slice(0, 15);
  }, [visits, tableFilter]);

  const handleSeed = () => {
    seedDemoData();
    reload();
  };

  const handleClear = () => {
    if (confirm('Tüm analiz verilerini silmek istediğinize emin misiniz?')) {
      clearAnalyticsData();
      reload();
    }
  };

  const handleExport = () => {
    exportVisitsCSV([...rangedVisits].sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    onLogout();
  };

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow" style={{ color: 'var(--color-feature-success)' }}>Chioutworks</p>
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--color-ink-strongest)' }}>
              {view === 'analytics' ? 'Analiz Paneli' : view === 'voice' ? 'Sesli Görüşmeler' : view === 'requests' ? 'Talepler' : view === 'calendar' ? 'Takvim' : 'Randevular'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="lime-dot"
                style={{ background: activeNow > 0 ? 'var(--color-feature-success)' : 'var(--color-border-card)' }}
              />
              <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                {view === 'analytics' ? (
                  <>
                    {activeNow > 0 ? `Şu an aktif: ${activeNow} ziyaretçi` : 'Şu an aktif ziyaretçi yok'}
                    {' · '}Güncellendi: {new Date(lastUpdated).toLocaleTimeString('tr-TR')}
                  </>
                ) : view === 'voice' ? (
                  'Mikrofondan gelen konuşma kayıtları'
                ) : view === 'requests' ? (
                  'İletişim formu, teklif ve demo talepleri'
                ) : view === 'calendar' ? (
                  'Dolu günleri işaretleyin'
                ) : (
                  pendingCount > 0 ? `${pendingCount} bekleyen randevu talebi` : 'Bekleyen randevu talebi yok'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 pill-tag" style={{ background: 'var(--color-surface-darker)', border: '1px solid var(--color-border-card)', padding: 3 }}>
              <button
                onClick={() => setView('analytics')}
                className="pill-tag"
                style={{
                  background: view === 'analytics' ? 'var(--color-ink-strongest)' : 'transparent',
                  color: view === 'analytics' ? '#fff' : 'var(--color-ink-muted)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Analytics
              </button>
              <button
                onClick={() => setView('appointments')}
                className="pill-tag"
                style={{
                  background: view === 'appointments' ? 'var(--color-ink-strongest)' : 'transparent',
                  color: view === 'appointments' ? '#fff' : 'var(--color-ink-muted)',
                  border: 'none', cursor: 'pointer',
                  position: 'relative',
                }}
              >
                Randevular
                {pendingCount > 0 && (
                  <span style={{
                    marginLeft: 6, display: 'inline-block', minWidth: 16, padding: '0 4px', borderRadius: 9999,
                    background: 'var(--color-lime-300)', color: '#1a1a1a', fontSize: 10, fontWeight: 800, lineHeight: '16px',
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setView('voice')}
                className="pill-tag"
                style={{
                  background: view === 'voice' ? 'var(--color-ink-strongest)' : 'transparent',
                  color: view === 'voice' ? '#fff' : 'var(--color-ink-muted)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Sesli Görüşmeler
              </button>
              <button
                onClick={() => setView('requests')}
                className="pill-tag"
                style={{
                  background: view === 'requests' ? 'var(--color-ink-strongest)' : 'transparent',
                  color: view === 'requests' ? '#fff' : 'var(--color-ink-muted)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Talepler
              </button>
              <button
                onClick={() => setView('calendar')}
                className="pill-tag"
                style={{
                  background: view === 'calendar' ? 'var(--color-ink-strongest)' : 'transparent',
                  color: view === 'calendar' ? '#fff' : 'var(--color-ink-muted)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Takvim
              </button>
            </div>
            {view === 'analytics' && ([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRange(r); setCustomRange(null); }}
                className="pill-tag"
                style={{
                  background: !customRange && range === r ? 'var(--color-lime-300)' : 'var(--color-surface-raised)',
                  color: !customRange && range === r ? '#1a1a1a' : 'var(--color-ink-muted)',
                  border: '1px solid var(--color-border-card)',
                  cursor: 'pointer',
                }}
              >
                Son {r} gün
              </button>
            ))}
            {view === 'analytics' && (
              <>
                <input
                  type="date"
                  value={customRange?.from ?? ''}
                  onChange={(e) => setCustomRange((prev) => ({ from: e.target.value, to: prev?.to ?? e.target.value }))}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strong)' }}
                />
                <span className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>—</span>
                <input
                  type="date"
                  value={customRange?.to ?? ''}
                  onChange={(e) => setCustomRange((prev) => ({ from: prev?.from ?? e.target.value, to: e.target.value }))}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strong)' }}
                />
                <label className="flex items-center gap-1.5 pill-tag" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)', color: 'var(--color-ink-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                  Otomatik yenile
                </label>
                <button onClick={handleSeed} className="btn-secondary text-xs px-4 py-2">
                  Demo veri ekle
                </button>
                <button onClick={handleExport} className="btn-secondary text-xs px-4 py-2">
                  CSV indir
                </button>
                <button onClick={handleClear} className="btn-secondary text-xs px-4 py-2">
                  Verileri temizle
                </button>
              </>
            )}
            <button onClick={handleLogout} className="btn-primary text-xs px-4 py-2">
              Çıkış Yap
            </button>
          </div>
        </div>

        {view === 'appointments' && <AppointmentsPanel />}
        {view === 'voice' && <VoiceSessionsPanel />}
        {view === 'requests' && <ContactRequestsPanel />}
        {view === 'calendar' && <AvailabilityPanel />}

        {view === 'analytics' && !hasAnyData() && (
          <div className="card p-5" style={{ background: 'var(--color-lime-100)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-ink-strong)' }}>
              Henüz hiç ziyaret verisi yok. Sitende gezinerek gerçek veri toplayabilir
              veya görselleri test etmek için "Demo veri ekle" butonuna basabilirsin.
            </p>
          </div>
        )}

        {view === 'analytics' && (
        <>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Toplam Ziyaret" value={totalVisits.toString()} sub={rangeLabel} />
          <StatCard label="Tekil Ziyaretçi" value={uniqueVisitors.toString()} sub={rangeLabel} />
          <StatCard label="Ort. Süre" value={formatDuration(avgDuration)} sub="Sayfa başına" />
          <StatCard label="Toplam Tıklama" value={rangedClicks.length.toString()} sub={rangeLabel} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Hemen Çıkma Oranı" value={`%${sessionStats.bounceRate}`} sub="Tek sayfa görüntüleyenler" />
          <StatCard label="Oturum Başına Sayfa" value={sessionStats.avgPages.toString()} sub={rangeLabel} />
          <StatCard label="Yeni Ziyaretçi" value={(visitorTypeData[0]?.value ?? 0).toString()} sub={rangeLabel} />
          <StatCard label="Dönen Ziyaretçi" value={(visitorTypeData[1]?.value ?? 0).toString()} sub={rangeLabel} />
        </div>

        {/* Visits over time */}
        <ChartCard title="Zaman İçinde Ziyaretler">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={visitsByDay}>
              <defs>
                <linearGradient id="colorZiyaret" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bbf451" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#bbf451" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-ink-faint)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--color-ink-faint)" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="ziyaret" name="Ziyaret" stroke="#262323e0" fill="url(#colorZiyaret)" strokeWidth={2} />
              <Area type="monotone" dataKey="tekil" name="Tekil Ziyaretçi" stroke="#9ee82a" fillOpacity={0} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Hourly traffic */}
        <ChartCard title="Günün Saatine Göre Trafik">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="var(--color-ink-faint)" interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--color-ink-faint)" />
              <Tooltip />
              <Bar dataKey="ziyaret" name="Ziyaret" fill="#9ee82a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Language breakdown */}
          <ChartCard title="Dil Tercihi">
            {langData.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Henüz veri yok.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={langData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {langData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* New vs returning */}
          <ChartCard title="Yeni vs. Dönen Ziyaretçi">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={visitorTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {visitorTypeData.map((_, i) => <Cell key={i} fill={[COLORS[0], COLORS[1]][i % 2]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top pages */}
          <ChartCard title="En Çok Ziyaret Edilen Sayfalar">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topPages} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--color-ink-faint)" />
                <YAxis type="category" dataKey="path" width={100} tick={{ fontSize: 12 }} stroke="var(--color-ink-faint)" />
                <Tooltip />
                <Bar dataKey="count" name="Ziyaret" fill="#bbf451" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Most clicked */}
          <ChartCard title="En Çok Tıklanan Öğeler">
            {topClicks.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Henüz tıklama verisi yok.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topClicks} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--color-ink-faint)" />
                  <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11 }} stroke="var(--color-ink-faint)" />
                  <Tooltip />
                  <Bar dataKey="count" name="Tıklama" fill="#262323e0" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device breakdown */}
          <ChartCard title="Cihaz Türü">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Browser breakdown */}
          <ChartCard title="Tarayıcı">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={browserData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {browserData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Country breakdown */}
          <ChartCard title="Ülkeye Göre Ziyaretçiler">
            {countryData.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Henüz konum verisi yok.</p>
            ) : (
              <div className="flex flex-col gap-3 mt-1">
                {countryData.map((c) => {
                  const pct = totalVisits > 0 ? Math.round((c.count / totalVisits) * 100) : 0;
                  return (
                    <div key={c.country} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--color-ink-strong)' }}>
                          {flagEmoji(c.countryCode)} {c.country}
                        </span>
                        <span style={{ color: 'var(--color-ink-muted)' }}>{c.count} ({pct}%)</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill progress-fill-lime" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion funnel */}
          <ChartCard title="Dönüşüm Hunisi">
            {funnelData[0].count === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Henüz veri yok.</p>
            ) : (
              <div className="flex flex-col gap-3 mt-1">
                {funnelData.map((step, i) => {
                  const pct = funnelData[0].count > 0 ? Math.round((step.count / funnelData[0].count) * 100) : 0;
                  return (
                    <div key={step.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--color-ink-strong)' }}>{step.label}</span>
                        <span style={{ color: 'var(--color-ink-muted)' }}>{step.count} ({pct}%)</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs mt-1" style={{ color: 'var(--color-ink-faint)' }}>
                  "CTA / İletişime Tıkladı" — etiketinde CTA, İletişim, WhatsApp, Email, Teklif veya Başla geçen
                  öğelere tıklayan oturumlar.
                </p>
              </div>
            )}
          </ChartCard>

          {/* Per-page engagement */}
          <ChartCard title="Sayfa Bazlı Etkileşim">
            {pageEngagement.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Henüz veri yok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                      {['Sayfa', 'Ziyaret', 'Tıklama', 'Etkileşim Oranı'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-ink-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageEngagement.map((p) => (
                      <tr key={p.path} style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                        <td className="py-2 px-3" style={{ color: 'var(--color-ink-strong)' }}>{p.path}</td>
                        <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>{p.visits}</td>
                        <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>{p.clicks}</td>
                        <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>%{p.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Recent visitors table */}
        <ChartCard title="Son Ziyaretçiler">
          <input
            type="text"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            placeholder="Ülke, şehir, IP, cihaz, tarayıcı veya sayfaya göre filtrele..."
            className="px-4 py-2 rounded-xl text-sm outline-none w-full md:w-96"
            style={{
              background: 'var(--color-surface-darker)',
              border: '1px solid var(--color-border-card)',
              color: 'var(--color-ink-strongest)',
            }}
          />
          {recentVisitors.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Henüz veri yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                    {['Tarih', 'Sayfa', 'Konum', 'IP', 'Cihaz', 'Tarayıcı', 'OS', 'Dil', 'Süre', 'Kaynak'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-ink-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentVisitors.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                      <td className="py-2 px-3 whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{formatDate(v.timestamp)}</td>
                      <td className="py-2 px-3" style={{ color: 'var(--color-ink-strong)' }}>{v.path || '/'}</td>
                      <td className="py-2 px-3 whitespace-nowrap" style={{ color: 'var(--color-ink-strong)' }}>
                        {flagEmoji(v.countryCode)} {v.city}, {v.country}
                      </td>
                      <td className="py-2 px-3 font-mono" style={{ color: 'var(--color-ink-muted)', fontSize: 12 }}>{v.ip}</td>
                      <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>{v.device}</td>
                      <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>{v.browser}</td>
                      <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>{v.os}</td>
                      <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>{v.lang.toUpperCase()}</td>
                      <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>{formatDuration(v.duration)}</td>
                      <td className="py-2 px-3" style={{ color: 'var(--color-ink-muted)' }}>{v.referrer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <p className="text-xs text-center" style={{ color: 'var(--color-ink-faint)' }}>
          Veriler bu tarayıcının yerel deposunda (localStorage) saklanır. Tüm cihazlardan
          merkezi veri toplamak için ileride Supabase entegrasyonu eklenebilir.
        </p>
        </>
        )}
      </div>
    </div>
  );
}

// ── Page entry ──────────────────────────────────────────────────────────-
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === 'true');
    setChecked(true);
  }, []);

  if (!checked) return null;

  return authed ? (
    <Dashboard onLogout={() => setAuthed(false)} />
  ) : (
    <LoginForm onSuccess={() => setAuthed(true)} />
  );
}
