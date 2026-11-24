import ModeToggle from '../site/ModeToggle';
import { useCallback, useEffect, useState } from 'react';
import '../components/admin/admin.css';
import { api, ApiError, DEMO, SESSION_LOST, type Req, type Usage, type VoiceSession } from '../components/admin/api';
import Overview from '../components/admin/Overview';
import RequestsView from '../components/admin/RequestsView';
import VoiceView from '../components/admin/VoiceView';
import AnalyticsView from '../components/admin/AnalyticsView';
import IntakesView from '../components/admin/IntakesView';
import OffersView from '../components/admin/OffersView';
import ProjectsView from '../components/admin/ProjectsView';
import ErrorsView from '../components/admin/ErrorsView';
import VoiceAgentView from '../components/admin/VoiceAgentView';
import SalesView from '../components/admin/SalesView';
import MarketingView from '../components/admin/MarketingView';
import NewsletterView from '../components/admin/NewsletterView';
import LeadsView from '../components/admin/LeadsView';
import TrendRadarView from '../components/admin/TrendRadarView';
import ProvidersView from '../components/admin/ProvidersView';
import TabHint from '../components/admin/TabHint';
import { GROUP_ICON, GROUP_ID, HINTS, TAB_ICON } from '../components/admin/hints';
import CalendarView, { type CalSection } from '../components/admin/CalendarView';

type Auth = 'checking' | 'out' | 'in' | 'unset';
export type Tab = 'overview' | 'requests' | 'voice' | 'calendar' | 'analytics' | 'appointments' | 'intakes' | 'offers' | 'projects' | 'errors' | 'voiceAgent' | 'sales' | 'marketing' | 'newsletter' | 'leads' | 'trend' | 'providers';
export type Group = { label: string; desc: string; tabs: { key: Tab; label: string; desc: string }[] };
// Navigation map (owner, 2026-11-24). 'appointments' is no longer a tab: it lives inside Takvim (ALIAS keeps old links working).
export const GROUPS: Group[] = [
  { label: 'Genel', desc: '', tabs: [{ key: 'overview', label: 'Genel bakış', desc: 'Özet ve kısayollar' }] },
  { label: 'Gelenler', desc: 'Size ulaşan kişiler ve formlar', tabs: [
    { key: 'leads', label: 'Müşteri adayları', desc: 'Tüm kanallardan gelen kişiler' }, { key: 'requests', label: 'Talepler', desc: 'Form, sohbet ve paket talepleri' },
    { key: 'voice', label: 'Sesli görüşmeler', desc: 'Asistanla yapılan görüşmeler' }, { key: 'intakes', label: 'Analiz formları', desc: 'Müşterinin doldurduğu ayrıntılı form' },
    { key: 'newsletter', label: 'Bülten', desc: 'Aylık fikir e-postası' }] },
  { label: 'Satış ve işler', desc: 'Teklif, proje ve aramalar', tabs: [
    { key: 'offers', label: 'Teklifler', desc: 'Teklif, onay ve ödeme' }, { key: 'projects', label: 'Projeler', desc: 'Devam eden işler ve mesajlar' },
    { key: 'sales', label: 'Satış ve site kontrolleri', desc: 'Site analizi, potansiyel müşteriler' }, { key: 'voiceAgent', label: 'Voice Agent', desc: 'Telefonla arayan asistan' }] },
  { label: 'Planlama', desc: 'Dolu günler, takip ve randevular', tabs: [{ key: 'calendar', label: 'Takvim', desc: 'Dolu günler, takip girdileri, randevular' }] },
  { label: 'Pazarlama', desc: 'Yapay zekâ taslakları', tabs: [{ key: 'marketing', label: 'Pazarlama araçları', desc: 'Denetim, metin, SEO, e-posta, sosyal plan' }, { key: 'trend', label: 'Trend Radar', desc: 'Son 30 gün: içerik fikri, görüşme hazırlığı, rakip' }] },
  { label: 'Site ve sistem', desc: 'Ziyaretler ve hatalar', tabs: [
    { key: 'analytics', label: 'Ziyaret analizi', desc: 'Ziyaretçiler, ülkeler, sayfalar' }, { key: 'errors', label: 'Hatalar ve e-posta', desc: 'Hata kaydı ve bildirim e-postası' },
    { key: 'providers', label: 'Hesaplar ve API', desc: 'Anahtarlar, paketler, ücretler' }] },
];
/** Old tab ids / deep links -> current place. */
const ALIAS: Record<string, { tab: Tab; cal?: CalSection }> = {
  appointments: { tab: 'calendar', cal: 'appointments' }, 'voice-agent': { tab: 'voiceAgent' }, voiceagent: { tab: 'voiceAgent' },
  followups: { tab: 'calendar', cal: 'followups' }, inbox: { tab: 'leads' }, home: { tab: 'overview' },
};
const TAB_KEYS = GROUPS.flatMap((g) => g.tabs.map((t) => t.key));
function fromUrl(): { tab: Tab; cal: CalSection } {
  const id = location.pathname.endsWith('/voice-agent') ? 'voice-agent' : (location.hash.replace(/^#\/?/, '') || new URLSearchParams(location.search).get('tab') || '');
  const al = ALIAS[id];
  if (al) return { tab: al.tab, cal: al.cal ?? 'blocked' };
  return { tab: (TAB_KEYS as string[]).includes(id) ? (id as Tab) : 'overview', cal: 'blocked' };
}

function Login({ unset, note, onDone }: { unset: boolean; note?: boolean; onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true); setErr(null);
    try { await api('/api/admin/login', 'POST', { password: pw, remember }); onDone(); }
    catch (x) {
      const s = x instanceof ApiError ? x.status : 0;
      setErr(s === 401 ? 'Şifre yanlış.' : s === 429 ? (x as ApiError).data?.message ?? 'Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.'
        : s === 503 ? 'Yönetici şifresi henüz ayarlanmadı. .env dosyasındaki ADMIN_TOKEN satırını doldurup sunucuyu yeniden başlatın.' : 'Bağlantı hatası, tekrar deneyin.');
    }
    setBusy(false);
  };
  return (
    <div className="adm-login">
      <form className="lq-card" onSubmit={submit}>
        <div className="adm-logo" style={{ padding: 0 }}>Chioutworks</div>
        <h1 className="adm-h1" style={{ fontSize: 24 }}>Yönetici girişi</h1>
        {unset
          ? <div className="adm-banner" role="alert" style={{ margin: 0 }}>Yönetici şifresi henüz ayarlanmadı. .env dosyasındaki ADMIN_TOKEN satırını doldurup sunucuyu yeniden başlatın.</div>
          : <>
              <label className="adm-label" htmlFor="adm-pw">Şifre</label>
              <input id="adm-pw" className="adm-input" type="password" autoComplete="current-password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} />
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Bu cihazda 30 gün açık kalsın
              </label>
              {note && !err && <div className="adm-banner" role="alert" style={{ margin: 0 }}>Oturum sona erdi, lütfen tekrar giriş yapın.</div>}
              {err && <div className="adm-banner" role="alert" style={{ margin: 0 }}>{err}</div>}
              <button type="submit" className="lq-btn-ghost lq-btn-block" disabled={busy || !pw} style={{ justifyContent: 'center' }}>{busy ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
            </>}
      </form>
    </div>
  );
}

export default function Admin() {
  const [auth, setAuth] = useState<Auth>(DEMO ? 'in' : 'checking');
  const [tab, setTab] = useState<Tab>(() => fromUrl().tab);
  const [calSec, setCalSec] = useState<CalSection>(() => fromUrl().cal);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hideNotify, setHideNotify] = useState(() => { try { return sessionStorage.getItem('cw_adm_hide_notify') === '1'; } catch { return false; } });
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [sessions, setSessions] = useState<VoiceSession[] | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [openReq, setOpenReq] = useState<string | null>(null);
  const [openVoice, setOpenVoice] = useState<string | null>(null);
  const [openOffer, setOpenOffer] = useState<string | null>(null);
  const [offerUnread, setOfferUnread] = useState(0);
  const [projectUnread, setProjectUnread] = useState(0);
  const [notifyMail, setNotifyMail] = useState<string | null>(null);   // null = not loaded yet
  useEffect(() => { if (auth !== 'in' || DEMO) return; api<{ email: string }>('/api/admin/settings/error-notify').then((r) => setNotifyMail(r.email ?? '')).catch(() => {}); }, [auth]);

  useEffect(() => {
    try { localStorage.removeItem('cw_admin_token'); } catch { /* ignore */ }
    const m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, []);

  // Session lost (401 from any admin call, or failed re-check): drop all loaded data and show the login screen
  const lost = useCallback(() => {
    setReqs(null); setSessions(null); setUsage(null); setBlocked([]); setErr(null);
    setOpenReq(null); setOpenVoice(null); setOpenOffer(null); setOfferUnread(0); setProjectUnread(0); setNotifyMail(null);
    setMenuOpen(false); setExpired(true); setAuth('out');
  }, []);
  useEffect(() => { window.addEventListener(SESSION_LOST, lost); return () => window.removeEventListener(SESSION_LOST, lost); }, [lost]);
  // Re-validate on focus, tab visible, hash change and every 5 minutes
  useEffect(() => {
    if (auth !== 'in' || DEMO) return;
    const re = () => { api('/api/admin/me').catch((x) => { if (x instanceof ApiError && x.status === 401) lost(); }); };
    const vis = () => { if (document.visibilityState === 'visible') re(); };
    window.addEventListener('focus', re); window.addEventListener('hashchange', re); document.addEventListener('visibilitychange', vis);
    const t = window.setInterval(re, 5 * 60 * 1000);
    return () => { window.removeEventListener('focus', re); window.removeEventListener('hashchange', re); document.removeEventListener('visibilitychange', vis); window.clearInterval(t); };
  }, [auth, lost]);

  const check = useCallback(() => {
    api('/api/admin/me').then(() => setAuth('in')).catch((x) => setAuth(x instanceof ApiError && x.status === 503 ? 'unset' : 'out'));
  }, []);
  useEffect(() => { if (!DEMO) check(); }, [check]);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [r, v] = await Promise.all([
        api<{ requests: Req[] }>('/api/admin/quote-requests'),
        api<{ sessions: VoiceSession[] }>('/api/admin/voice-sessions'),
      ]);
      setReqs(r.requests); setSessions(v.sessions);
      api<Usage>('/api/admin/tts-usage').then(setUsage).catch(() => setUsage(null));
      api<{ blocked: string[] }>('/api/availability').then((a) => setBlocked(a.blocked)).catch(() => setBlocked([]));
    } catch (x) {
      if (x instanceof ApiError && x.status === 401) { lost(); return; }
      setErr('Kayıtlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
      setReqs((p) => p ?? []); setSessions((p) => p ?? []);
    }
  }, [lost]);
  useEffect(() => { if (auth === 'in') load(); }, [auth, load]);
  // Badge for client messages / acceptances on offers (refreshed when switching tabs)
  useEffect(() => {
    if (auth !== 'in' || DEMO) return;
    api<{ offers: { unreadOwner: number }[] }>('/api/admin/offers').then((r) => setOfferUnread(r.offers.reduce((s, x) => s + x.unreadOwner, 0))).catch(() => {});
    api<{ projects: { unreadOwner: number }[] }>('/api/admin/projects').then((r) => setProjectUnread(r.projects.reduce((s, x) => s + x.unreadOwner, 0))).catch(() => {});
  }, [auth, tab]);

  useEffect(() => {
    if (!menuOpen) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [menuOpen]);
  useEffect(() => {
    const on = () => { const u = fromUrl(); setTab(u.tab); setCalSec(u.cal); };
    window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on);
  }, []);

  const logout = async () => { try { await api('/api/admin/logout', 'POST'); } catch { /* ignore */ } if (DEMO) return; setReqs(null); setSessions(null); setAuth('out'); };

  const [tip, setTip] = useState<{ text: string; top: number; left: number } | null>(null);

  if (auth === 'checking') return <div data-site-theme="liquid" className="adm-login" />;
  if (auth !== 'in') return <div data-site-theme="liquid"><Login unset={auth === 'unset'} note={expired} onDone={() => { setExpired(false); setAuth('in'); }} /></div>;

  const unread = (reqs ?? []).filter((r) => !r.read).length;
  const badges: Partial<Record<Tab, number>> = { requests: unread, offers: offerUnread, projects: projectUnread };
  const go = (t: Tab, id?: string, smooth = false) => {
    const al = ALIAS[t]; const target = al ? al.tab : t;
    if (al?.cal) setCalSec(al.cal);
    setTab(target); setMenuOpen(false);
    if (target === 'requests') setOpenReq(id ?? null); if (target === 'voice') setOpenVoice(id ?? null); if (target === 'offers') setOpenOffer(id ?? null);
    if (!location.pathname.endsWith('/voice-agent')) history.replaceState(null, '', `${location.pathname}${location.search}#${target}`);
    window.scrollTo({ top: 0, behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  };
  const home = () => { setTip(null); go('overview', undefined, true); };
  const showTip = (e: React.SyntheticEvent<HTMLElement>, text: string) => { const r = e.currentTarget.getBoundingClientRect(); setTip({ text, top: r.top + r.height / 2, left: r.right + 10 }); };
  const nav = (sheet: boolean) => GROUPS.map((g) => {
    const sum = g.tabs.reduce((n, t) => n + (badges[t.key] ?? 0), 0);
    const gid = GROUP_ID[g.label]; const GI = GROUP_ICON[gid];
    return (
      <div key={g.label} className="adm-group" data-g={gid}>
        {g.label !== 'Genel' && <span className="adm-grouplabel" lang="tr"><GI size={16} aria-hidden="true" />{g.label}{sum > 0 && <span className="adm-grouplabel-n" aria-label={`${sum} yeni`}>{sum}</span>}</span>}
        {g.tabs.map((t) => { const TI = TAB_ICON[t.key]; const one = HINTS[t.key].what.split(/(?<=\.)\s/)[0]; return (
          <button key={t.key} className="adm-nav" data-g={gid} aria-current={tab === t.key ? 'page' : undefined} onClick={() => { setTip(null); go(t.key); }}
            {...(sheet ? {} : { onMouseEnter: (e: React.MouseEvent<HTMLElement>) => showTip(e, one), onFocus: (e: React.FocusEvent<HTMLElement>) => showTip(e, one), onMouseLeave: () => setTip(null), onBlur: () => setTip(null), 'aria-describedby': 'adm-tip' })}>
            <TI size={16} className="adm-nav-ic" aria-hidden="true" />
            <span className="adm-nav-tx">{t.label}{sheet && <small>{one}</small>}</span>{(badges[t.key] ?? 0) > 0 && <span className="adm-badge">{badges[t.key]}</span>}
          </button>); })}
      </div>);
  });
  const curGroup = GROUPS.find((g) => g.tabs.some((t) => t.key === tab));
  const curLabel = GROUPS.flatMap((g) => g.tabs).find((t) => t.key === tab)?.label ?? '';
  const totalNew = unread + offerUnread + projectUnread;

  return (
    <div data-site-theme="liquid" className="adm">
      <aside className="adm-side" aria-label="Yönetim menüsü">
        <button type="button" className="adm-logo adm-logo-btn" aria-label="Genel bakışa git" onClick={home}>Chioutworks<small>Yönetim</small></button>
        <nav className="adm-navlist">{nav(false)}</nav>
        {tip && <div id="adm-tip" role="tooltip" className="adm-tip" style={{ top: tip.top, left: tip.left }}>{tip.text}</div>}
        <div className="adm-sidefoot">
          <div style={{ padding: '0 12px 8px' }}><ModeToggle lang="tr" /></div>
          <button className="adm-nav" onClick={logout}>Çıkış</button>
        </div>
      </aside>
      <header className="adm-topbar">
        <button className="adm-menubtn" aria-expanded={menuOpen} aria-controls="adm-sheet" onClick={() => setMenuOpen(true)}>
          <span className="adm-burger" aria-hidden="true" />Menü{totalNew > 0 && <span className="adm-badge">{totalNew}</span>}
        </button>
        <span className="adm-curtitle" data-g={GROUP_ID[curGroup?.label ?? 'Genel']}>{curLabel}</span>
        <ModeToggle lang="tr" />
      </header>
      {menuOpen && <>
        <div className="adm-sheet-bg" onClick={() => setMenuOpen(false)} />
        <div id="adm-sheet" className="adm-sheet" role="dialog" aria-modal="true" aria-label="Menü">
          <div className="adm-sheet-head"><button type="button" className="adm-logo adm-logo-btn" style={{ padding: 0 }} aria-label="Genel bakışa git" onClick={home}>Chioutworks<small>Yönetim</small></button><button className="lq-btn-ghost adm-btn sm" onClick={() => setMenuOpen(false)}>Kapat</button></div>
          <nav className="adm-navlist">{nav(true)}</nav>
          <button className="adm-nav" onClick={logout}>Çıkış</button>
        </div>
      </>}
      <main className="adm-main">
        {err && <div className="adm-banner" role="alert">{err}</div>}
        {notifyMail === '' && tab !== 'errors' && !hideNotify && <div className="adm-banner adm-banner-slim" role="status"><span>Hata bildirim e-postası henüz girilmedi.</span><button className="lq-btn-ghost adm-btn sm adm-pri" onClick={() => go('errors')}>E-postamı yaz</button><button className="adm-x" aria-label="Bu oturumda gizle" onClick={() => { setHideNotify(true); try { sessionStorage.setItem('cw_adm_hide_notify', '1'); } catch { /* ignore */ } }}>×</button></div>}
        <TabHint key={tab} tab={tab} group={curGroup?.label ?? 'Genel'} label={curLabel} hideCard={tab === 'overview'} />
        {tab === 'overview' && <Overview reqs={reqs} sessions={sessions} usage={usage} blocked={blocked} go={go} badges={badges} notifyMail={notifyMail} />}
        {tab === 'requests' && <RequestsView reqs={reqs} setReqs={setReqs} openId={openReq} setOpenId={setOpenReq} go={go} setSessions={setSessions} />}
        {tab === 'intakes' && <IntakesView go={go} />}
        {tab === 'offers' && <OffersView openId={openOffer} setOpenId={setOpenOffer} onUnread={setOfferUnread} />}
        {tab === 'projects' && <ProjectsView onUnread={setProjectUnread} />}
        {tab === 'voice' && <VoiceView sessions={sessions} setSessions={setSessions} openId={openVoice} setOpenId={setOpenVoice} go={go} setReqs={setReqs} />}
        {tab === 'calendar' && <CalendarView section={calSec} onSection={setCalSec} onBlocked={setBlocked} go={go} />}
        {tab === 'analytics' && <AnalyticsView />}
        {tab === 'voiceAgent' && <VoiceAgentView reqs={reqs} />}
        {tab === 'sales' && <SalesView />}
        {tab === 'marketing' && <MarketingView />}
        {tab === 'trend' && <TrendRadarView />}
        {tab === 'leads' && <LeadsView go={go} />}
        {tab === 'newsletter' && <NewsletterView />}
        {tab === 'providers' && <ProvidersView />}
        {tab === 'errors' && <ErrorsView onMailSaved={setNotifyMail} />}
      </main>
    </div>
  );
}
