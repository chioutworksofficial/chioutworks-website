import { useEffect, useState } from 'react';
import { api } from './api';

// Real visitor statistics from the server (cookieless, bots filtered). Source: server/analytics.ts
interface Row { label: string; value: number }
interface Stats {
  days: number; pageviews: number; visitors: number; bots: number; avgSeconds: number;
  daily: { day: string; pageviews: number; visitors: number; bots: number }[];
  pages: Row[]; referrers: Row[]; countries: Row[]; languages: Row[]; devices: Row[]; browsers: Row[]; systems: Row[]; clicks: Row[]; botReasons: Row[];
}

const LANGS: Record<string, string> = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', el: 'Yunanca' };
const DEV: Record<string, string> = { desktop: 'Masaüstü', mobile: 'Telefon', tablet: 'Tablet' };
const BOT: Record<string, string> = { ua: 'Kendini bot olarak tanıtan', webdriver: 'Otomasyon aracı', 'no-lang': 'Tarayıcı dili yok', flood: 'Aşırı istek', 'no-engagement': 'Etkileşimsiz (2 sn altı, kaydırma yok)' };
const dur = (s: number) => (s < 60 ? `${s} sn` : `${Math.floor(s / 60)} dk ${s % 60} sn`);
const country = (cc: string) => { try { return cc === '—' ? 'Bilinmiyor' : new Intl.DisplayNames(['tr'], { type: 'region' }).of(cc) ?? cc; } catch { return cc; } };

function HBars({ rows, map }: { rows: Row[]; map?: (s: string) => string }) {
  if (!rows.length) return <div className="adm-empty">Veri yok</div>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return <>{rows.map((r) => {
    const l = map ? map(r.label) : r.label;
    return <div className="adm-hbar" key={r.label}><span title={l}>{l}</span><div className="adm-bar"><i style={{ width: `${(r.value / max) * 100}%` }} /></div><b>{r.value}</b></div>;
  })}</>;
}
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="lq-card adm-card"><div className="adm-head"><h2>{title}</h2></div>{children}</section>;
const Stat = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => <div className="lq-card adm-stat"><span className="adm-label">{label}</span><b>{value}</b>{hint && <span className="adm-meta">{hint}</span>}</div>;

// Partner (affiliate) clicks: visitors sent from a tool page to the partner site. Source: server/affiliates.ts
interface Aff { days: number; total: number; bots: number; tools: Row[]; sources: Row[]; languages: Row[]; countries: Row[]; devices: Row[] }
const TOOL: Record<string, string> = { hostinger: 'Hostinger', n26: 'N26', wise: 'Wise' };
const SRC: Record<string, string> = { hero: 'Sayfa başındaki buton', final: 'Sayfa sonundaki buton', card: 'Genel sayfadaki kart', ring: 'Ana sayfa halkası', other: 'Diğer' };

function AffiliateClicks({ days }: { days: number }) {
  const [a, setA] = useState<Aff | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { setA(null); setErr(false); api<Aff>(`/api/admin/affiliates?days=${days}`).then(setA).catch(() => setErr(true)); }, [days]);
  return (
    <>
      <h2 className="adm-h1" style={{ fontSize: 22, marginTop: 36 }}>Ortak sitelerine gidenler</h2>
      <p className="adm-sub">Araç sayfalarındaki butonla Hostinger, N26 veya Wise sitesine geçen ziyaretçiler. Çerezsiz, kişi bilgisi yok. Kaydolup kaydolmadıklarını ortak panelinden görürsün.</p>
      {err && <div className="adm-banner" role="alert">Ortak tıklamaları yüklenemedi.</div>}
      {a && <>
        <div className="adm-grid4">
          <Stat label="Ortak sitesine giden" value={a.total} hint={`son ${a.days} gün`} />
          <Stat label="Ayıklanan bot" value={a.bots} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 16 }}>
          <Card title="Ortağa göre"><HBars rows={a.tools} map={(t) => TOOL[t] ?? t} /></Card>
          <Card title="Hangi butondan"><HBars rows={a.sources} map={(x) => SRC[x] ?? x} /></Card>
          <Card title="Sayfa dili"><HBars rows={a.languages} map={(l) => LANGS[l] ?? l} /></Card>
          <Card title="Ülke"><HBars rows={a.countries} map={country} /></Card>
          <Card title="Cihaz"><HBars rows={a.devices} map={(d) => DEV[d] ?? d} /></Card>
        </div>
      </>}
    </>
  );
}

// Chat locks (abuse protection): permanent closures and temporary pauses, hashed keys only. Source: server/abuse.ts
interface Locks { permanent: { k: string; t: number; strikes: number }[]; paused: { k: string; until: number }[] }

function ChatLocks() {
  const [l, setL] = useState<Locks | null>(null);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const load = () => { setErr(false); return api<Locks>('/api/admin/abuse').then(setL).catch(() => setErr(true)); };
  useEffect(() => { load(); }, []);
  const unlock = async (k: string) => {
    setBusy(k);
    try { await api('/api/admin/abuse/unlock', 'POST', { k }); await load(); } catch { setErr(true); } finally { setBusy(null); }
  };
  const btn = (k: string) => <button className="lq-btn-ghost adm-btn sm" onClick={() => unlock(k)} disabled={busy === k}>Kilidi aç</button>;
  const row = (k: string, text: string) => <div className="adm-hbar" key={k} style={{ gridTemplateColumns: '1fr auto' }}><span><code>{k.slice(0, 8)}</code> · {text}</span>{btn(k)}</div>;
  return (
    <>
      <h2 className="adm-h1" style={{ fontSize: 22, marginTop: 36 }}>Sohbet kilitleri</h2>
      <p className="adm-sub">Kötüye kullanım nedeniyle kapanan veya beklemeye alınan sohbet anahtarları. Kişi bilgisi yok, yalnızca tuzlu özet.</p>
      <button className="lq-btn-ghost adm-btn" onClick={load}>Yenile</button>
      {err && <div className="adm-banner" role="alert">Sohbet kilitleri yüklenemedi.</div>}
      {l && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 16 }}>
        <Card title="Kalıcı kapalı">{l.permanent.length ? l.permanent.map((p) => row(p.k, `${new Date(p.t).toLocaleString('tr-TR')} · ${p.strikes} ihlal`)) : <div className="adm-empty">Kilit yok</div>}</Card>
        <Card title="Beklemede">{l.paused.length ? l.paused.map((p) => row(p.k, `bitiş ${new Date(p.until).toLocaleString('tr-TR')}`)) : <div className="adm-empty">Kilit yok</div>}</Card>
      </div>}
    </>
  );
}

export default function AnalyticsView() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setS(null); setErr(null);
    api<Stats>(`/api/admin/analytics?days=${days}`).then(setS).catch(() => setErr('İstatistikler yüklenemedi.'));
  }, [days]);

  const max = s ? Math.max(...s.daily.map((d) => d.pageviews + d.bots), 1) : 1;

  return (
    <>
      <h1 className="adm-h1">Ziyaret analizi</h1>
      <p className="adm-sub">Sunucuda tutulan gerçek ziyaret verisi. Çerezsiz, IP adresi saklanmaz. Botlar ayrı sayılır, aşağıdaki sayılara dahil değildir.</p>
      <div className="adm-chips" role="group" aria-label="Zaman aralığı">
        {([7, 30, 90] as const).map((d) => <button key={d} className="adm-chip" aria-pressed={days === d} onClick={() => setDays(d)}>Son {d} gün</button>)}
      </div>
      {err && <div className="adm-banner" role="alert">{err}</div>}
      {!s ? (!err && <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>) : <>
        <div className="adm-grid4">
          <Stat label="Gerçek ziyaretçi" value={s.visitors} hint="günlük tekil, toplam" />
          <Stat label="Sayfa görüntüleme" value={s.pageviews} />
          <Stat label="Ort. süre" value={dur(s.avgSeconds)} />
          <Stat label="Ayıklanan bot / şüpheli" value={s.bots} />
        </div>
        <Card title="Günlük">
          <div className="adm-cols" aria-label="Günlük ziyaret grafiği">
            {s.daily.map((d) => (
              <div key={d.day} title={`${d.day}: ${d.visitors} ziyaretçi, ${d.pageviews} görüntüleme, ${d.bots} bot`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <i style={{ height: `${(d.bots / max) * 100}%`, opacity: 0.35 }} />
                <i style={{ height: `${(d.pageviews / max) * 100}%` }} />
              </div>))}
          </div>
          <div className="adm-axis"><span>{s.daily[0]?.day}</span><span>{s.daily[s.daily.length - 1]?.day}</span></div>
          <p className="adm-meta" style={{ margin: '6px 0 0' }}>Koyu: gerçek görüntüleme · Soluk: bot / şüpheli</p>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <Card title="En çok görülen sayfalar"><HBars rows={s.pages} /></Card>
          <Card title="Nereden geldiler"><HBars rows={s.referrers} /></Card>
          <Card title="Ülke"><HBars rows={s.countries} map={country} /></Card>
          <Card title="Site dili"><HBars rows={s.languages} map={(l) => LANGS[l] ?? l} /></Card>
          <Card title="Cihaz"><HBars rows={s.devices} map={(d) => DEV[d] ?? d} /></Card>
          <Card title="Tarayıcı"><HBars rows={s.browsers} /></Card>
          <Card title="İşletim sistemi"><HBars rows={s.systems} /></Card>
          <Card title="En çok tıklananlar"><HBars rows={s.clicks} /></Card>
          <Card title="Bot ayıklama nedenleri"><HBars rows={s.botReasons} map={(b) => BOT[b] ?? b} /></Card>
        </div>
      </>}
      <AffiliateClicks days={days} />
      <ChatLocks />
    </>
  );
}
