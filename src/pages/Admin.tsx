import ModeToggle from '../site/ModeToggle';
import { useCallback, useEffect, useState } from 'react';
import '../components/admin/admin.css';
import { api, ApiError, DEMO, type Req, type Usage, type VoiceSession } from '../components/admin/api';
import Overview from '../components/admin/Overview';
import RequestsView from '../components/admin/RequestsView';
import VoiceView from '../components/admin/VoiceView';
import AvailabilityPanel from '../components/admin/AvailabilityPanel';
import AnalyticsView from '../components/admin/AnalyticsView';
import AppointmentsView from '../components/admin/AppointmentsView';
import IntakesView from '../components/admin/IntakesView';
import OffersView from '../components/admin/OffersView';
import ProjectsView from '../components/admin/ProjectsView';
import ErrorsView from '../components/admin/ErrorsView';
import VoiceAgentView from '../components/admin/VoiceAgentView';
import SalesView from '../components/admin/SalesView';
import MarketingView from '../components/admin/MarketingView';
import NewsletterView from '../components/admin/NewsletterView';
import LeadsView from '../components/admin/LeadsView';
import CalendarEntries from '../components/admin/CalendarEntries';

type Auth = 'checking' | 'out' | 'in' | 'unset';
export type Tab = 'overview' | 'requests' | 'voice' | 'calendar' | 'analytics' | 'appointments' | 'intakes' | 'offers' | 'projects' | 'errors' | 'voiceAgent' | 'sales' | 'marketing' | 'newsletter' | 'leads';
const GROUPS: { label: string; tabs: { key: Tab; label: string }[] }[] = [
  { label: 'Gelenler', tabs: [{ key: 'leads', label: 'Müşteri adayları' }, { key: 'requests', label: 'Talepler' }, { key: 'intakes', label: 'Analiz formları' }, { key: 'voice', label: 'Sesli görüşmeler' }, { key: 'newsletter', label: 'Bülten' }] },
  { label: 'İşler', tabs: [{ key: 'offers', label: 'Teklifler' }, { key: 'projects', label: 'Projeler' }, { key: 'calendar', label: 'Takvim' }, { key: 'appointments', label: 'Randevular' }, { key: 'voiceAgent', label: 'Voice Agent' }, { key: 'sales', label: 'Satış' }, { key: 'marketing', label: 'Pazarlama' }] },
  { label: 'Site', tabs: [{ key: 'overview', label: 'Genel bakış' }, { key: 'analytics', label: 'Ziyaret analizi' }, { key: 'errors', label: 'Hatalar ve e-posta' }] },
];

function Login({ unset, onDone }: { unset: boolean; onDone: () => void }) {
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
              {err && <div className="adm-banner" role="alert" style={{ margin: 0 }}>{err}</div>}
              <button type="submit" className="lq-btn-ghost lq-btn-block" disabled={busy || !pw} style={{ justifyContent: 'center' }}>{busy ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
            </>}
      </form>
    </div>
  );
}

export default function Admin() {
  const [auth, setAuth] = useState<Auth>(DEMO ? 'in' : 'checking');
  const [tab, setTab] = useState<Tab>(() => (location.pathname.endsWith('/voice-agent') ? 'voiceAgent' : 'overview'));
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [sessions, setSessions] = useState<VoiceSession[] | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
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
      if (x instanceof ApiError && x.status === 401) { setAuth('out'); return; }
      setErr('Kayıtlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
      setReqs((p) => p ?? []); setSessions((p) => p ?? []);
    }
  }, []);
  useEffect(() => { if (auth === 'in') load(); }, [auth, load]);
  // Badge for client messages / acceptances on offers (refreshed when switching tabs)
  useEffect(() => {
    if (auth !== 'in' || DEMO) return;
    api<{ offers: { unreadOwner: number }[] }>('/api/admin/offers').then((r) => setOfferUnread(r.offers.reduce((s, x) => s + x.unreadOwner, 0))).catch(() => {});
    api<{ projects: { unreadOwner: number }[] }>('/api/admin/projects').then((r) => setProjectUnread(r.projects.reduce((s, x) => s + x.unreadOwner, 0))).catch(() => {});
  }, [auth, tab]);

  const logout = async () => { try { await api('/api/admin/logout', 'POST'); } catch { /* ignore */ } if (DEMO) return; setReqs(null); setSessions(null); setAuth('out'); };

  if (auth === 'checking') return <div data-site-theme="liquid" className="adm-login" />;
  if (auth !== 'in') return <div data-site-theme="liquid"><Login unset={auth === 'unset'} onDone={() => setAuth('in')} /></div>;

  const unread = (reqs ?? []).filter((r) => !r.read).length;
  const go = (t: Tab, id?: string) => { setTab(t); if (t === 'requests') setOpenReq(id ?? null); if (t === 'voice') setOpenVoice(id ?? null); if (t === 'offers') setOpenOffer(id ?? null); window.scrollTo(0, 0); };
  const nav = (cls?: string) => GROUPS.map((g) => (
    <div key={g.label} className="adm-group"><span className="adm-grouplabel">{g.label}</span>{g.tabs.map((t) => (
    <button key={t.key} className="adm-nav" aria-current={tab === t.key ? 'page' : undefined} onClick={() => go(t.key)}>
      {t.label}{t.key === 'requests' && unread > 0 && <span className={cls ?? 'adm-badge'}>{unread}</span>}{t.key === 'offers' && offerUnread > 0 && <span className={cls ?? 'adm-badge'}>{offerUnread}</span>}{t.key === 'projects' && projectUnread > 0 && <span className={cls ?? 'adm-badge'}>{projectUnread}</span>}
    </button>))}</div>
  ));

  return (
    <div data-site-theme="liquid" className="adm">
      <aside className="adm-side">
        <div className="adm-logo">Chioutworks<small>Yönetim</small></div>
        {nav()}
        <div className="adm-spacer" />
        <div style={{ padding: '0 12px 8px' }}><ModeToggle lang="tr" /></div>
        <button className="adm-nav" onClick={logout}>Çıkış</button>
      </aside>
      <header className="adm-topbar">
        <div className="adm-logo">Chioutworks <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><ModeToggle lang="tr" /><button className="lq-btn-ghost adm-btn sm" onClick={logout}>Çıkış</button></span></div>
        <div className="adm-tabs">{nav()}</div>
      </header>
      <main className="adm-main">
        {err && <div className="adm-banner" role="alert">{err}</div>}
        {notifyMail === '' && tab !== 'errors' && <div className="adm-banner" role="status" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>Hata bildirim e-postası henüz girilmedi. <button className="lq-btn-ghost adm-btn sm adm-pri" onClick={() => go('errors')}>E-postamı yaz</button></div>}
        {tab === 'overview' && <Overview reqs={reqs} sessions={sessions} usage={usage} blocked={blocked} go={go} />}
        {tab === 'requests' && <RequestsView reqs={reqs} setReqs={setReqs} openId={openReq} setOpenId={setOpenReq} go={go} setSessions={setSessions} />}
        {tab === 'intakes' && <IntakesView go={go} />}
        {tab === 'offers' && <OffersView openId={openOffer} setOpenId={setOpenOffer} onUnread={setOfferUnread} />}
        {tab === 'projects' && <ProjectsView onUnread={setProjectUnread} />}
        {tab === 'voice' && <VoiceView sessions={sessions} setSessions={setSessions} openId={openVoice} setOpenId={setOpenVoice} go={go} setReqs={setReqs} />}
        {tab === 'calendar' && <><AvailabilityPanel onSaved={setBlocked} /><CalendarEntries go={go} /></>}
        {tab === 'analytics' && <AnalyticsView />}
        {tab === 'appointments' && <AppointmentsView />}
        {tab === 'voiceAgent' && <VoiceAgentView reqs={reqs} />}
        {tab === 'sales' && <SalesView />}
        {tab === 'marketing' && <MarketingView />}
        {tab === 'leads' && <LeadsView go={go} />}
        {tab === 'newsletter' && <NewsletterView />}
        {tab === 'errors' && <ErrorsView onMailSaved={setNotifyMail} />}
      </main>
    </div>
  );
}
