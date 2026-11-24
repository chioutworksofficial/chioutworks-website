import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Gauge, Inbox, Lightbulb, ListChecks, Mic } from 'lucide-react';
import { GROUPS, type Tab } from '../../pages/Admin';
import { GROUP_ICON, GROUP_ID, TAB_ICON, WEEK } from './hints';
import { api, fmtDate, fmtDay, tagsOf, type Req, type Usage, type VoiceSession } from './api';

interface Props {
  reqs: Req[] | null; sessions: VoiceSession[] | null; usage: Usage | null; blocked: string[];
  go: (t: Tab, id?: string) => void; badges: Partial<Record<Tab, number>>; notifyMail: string | null;
}
interface Sug { tab: Tab; text: string; g: string }
const nf = (n: number) => n.toLocaleString('tr-TR');

export default function Overview({ reqs, sessions, usage, blocked, go, badges, notifyMail }: Props) {
  const [fu, setFu] = useState<number | null>(null);
  const [nl, setNl] = useState<'none' | 'draft' | 'ok' | null>(null);
  useEffect(() => {
    const today = new Date(); const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    api<{ entries: { day: string }[] }>('/api/admin/calendar-entries').then((r) => setFu(r.entries.filter((e) => e.day === ds).length)).catch(() => setFu(0));
    api<{ issues: { id: string; sentAt: string | null }[]; currentId: string }>('/api/admin/newsletter-issues').then((r) => { const c = r.issues.find((i) => i.id === r.currentId); setNl(!c ? 'none' : c.sentAt ? 'ok' : 'draft'); }).catch(() => setNl(null));
  }, []);
  const loading = reqs === null || sessions === null;
  const week = Date.now() - 7 * 864e5;
  const now = new Date();
  const newCount = (reqs ?? []).filter((r) => new Date(r.createdAt).getTime() >= week).length;
  const voiceMonth = (sessions ?? []).filter((s) => { const d = new Date(s.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
  const pct = usage ? Math.min(100, (usage.chars / usage.cap) * 100) : 0;
  const unreadReq = (reqs ?? []).filter((r) => !r.read && !r.archived).length;
  const sugs: Sug[] = [];
  if (unreadReq > 0) sugs.push({ tab: 'requests', g: 'in', text: `${unreadReq} okunmamış talep: Talepler'e bakın.` });
  if ((badges.offers ?? 0) > 0) sugs.push({ tab: 'offers', g: 'biz', text: `Tekliflerde ${badges.offers} yeni müşteri mesajı veya onayı var.` });
  if ((badges.projects ?? 0) > 0) sugs.push({ tab: 'projects', g: 'biz', text: `Projelerde ${badges.projects} okunmamış müşteri mesajı var.` });
  if (fu) sugs.push({ tab: 'calendar', g: 'plan', text: `Bugün ${fu} takip girdisi var: Takvim'e bakın.` });
  if (notifyMail === '') sugs.push({ tab: 'errors', g: 'sys', text: 'Hata bildirim e-postası ayarlı değil: bir kez girin.' });
  if (nl === 'draft') sugs.push({ tab: 'newsletter', g: 'in', text: 'Bülten: bu ayın metni taslakta; okuyup gönderin.' });
  if (nl === 'none') sugs.push({ tab: 'newsletter', g: 'in', text: 'Bülten: bu ayın taslağı henüz üretilmedi.' });
  if (usage && pct >= 80) sugs.push({ tab: 'voice', g: 'in', text: `Doğal ses kotasının %${Math.round(pct)}'i kullanıldı.` });
  const top = sugs.slice(0, 5);
  const stat = (label: string, value: string | number, Ic: typeof Inbox, extra?: React.ReactNode) => (
    <div className="lq-card adm-stat"><span className="adm-label"><Ic size={18} aria-hidden="true" />{label}</span><b>{loading ? '–' : value}</b>{extra}</div>
  );
  return (
    <div className="adm-ov">
      <h1 className="adm-h1">Genel bakış</h1>
      <p className="adm-sub">Taleplerin, görüşmelerin ve işlerin özeti; aşağıdan her alana geçebilirsiniz.</p>
      <section className="lq-card adm-card adm-today" aria-label="Bugün ne yapmalıyım?">
        <h2><Lightbulb size={20} aria-hidden="true" />Bugün ne yapmalıyım?</h2>
        {loading ? <div className="adm-skel" /> : top.length > 0
          ? <ul className="adm-todo">{top.map((x) => { const I = TAB_ICON[x.tab]; return (
            <li key={x.text}><button className="adm-todo-b" data-g={x.g} onClick={() => go(x.tab)}><I size={18} aria-hidden="true" /><span>{x.text}</span><ArrowRight size={16} aria-hidden="true" /></button></li>); })}</ul>
          : <>
            <p className="adm-allok"><CheckCircle2 size={18} aria-hidden="true" />Her şey yolunda. Haftalık rutin:</p>
            <ul className="adm-todo">{WEEK.map((w) => { const I = TAB_ICON[w.tab]; return (
              <li key={w.day}><button className="adm-todo-b" data-g={GROUP_ID[GROUPS.find((g) => g.tabs.some((t) => t.key === w.tab))?.label ?? 'Genel']} onClick={() => go(w.tab)}><I size={18} aria-hidden="true" /><span><b>{w.day}:</b> {w.text}</span><ArrowRight size={16} aria-hidden="true" /></button></li>); })}</ul>
          </>}
      </section>
      <div className="adm-grid4">
        {stat('Yeni talepler (son 7 gün)', newCount, Inbox)}
        {stat('Toplam talep', reqs?.length ?? 0, ListChecks)}
        {stat('Sesli görüşme (bu ay)', voiceMonth, Mic)}
        <div className="lq-card adm-stat">
          <span className="adm-label"><Gauge size={18} aria-hidden="true" />Doğal ses kotası</span>
          <b>{usage ? `${Math.round(pct)}%` : '–'}</b>
          {usage && <>
            <div className="adm-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
            <span className="adm-meta">{nf(usage.chars)} / {nf(usage.cap)} karakter</span>
          </>}
        </div>
      </div>
      <h2 className="adm-h2">Alanlar</h2>
      <div className="adm-areas">{GROUPS.filter((g) => g.label !== 'Genel').map((g) => (
        <section key={g.label} className="lq-card adm-card adm-areacard" data-g={GROUP_ID[g.label]} aria-label={g.label}>
          <h3>{(() => { const GI = GROUP_ICON[GROUP_ID[g.label]]; return <GI size={20} aria-hidden="true" />; })()}{g.label}</h3><p className="adm-meta">{g.desc}</p>
          <div className="adm-list">{g.tabs.map((t) => (
            <button key={t.key} className="adm-row" onClick={() => go(t.key)}>
              {(() => { const TI = TAB_ICON[t.key]; return <TI size={16} className="adm-row-ic" aria-hidden="true" />; })()}
              <span style={{ minWidth: 0, flex: 1 }}><span className="adm-name">{t.label}</span><br /><span className="adm-meta">{t.desc}</span></span>
              {(badges[t.key] ?? 0) > 0 && <span className="adm-badge">{badges[t.key]}</span>}
            </button>))}</div>
        </section>))}</div>
      <div className="adm-grid2">
        <section className="lq-card adm-card">
          <div className="adm-head"><h2>Son talepler</h2><button className="adm-link" onClick={() => go('requests')}>Tümünü gör</button></div>
          {loading ? <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /><div className="adm-skel" /></div>
            : reqs.length === 0 ? <div className="adm-empty">Henüz talep yok</div>
            : <div className="adm-list">{reqs.slice(0, 5).map((r) => (
              <button key={r.id} className="adm-row" onClick={() => go('requests', r.id)}>
                <span className={`adm-dot${r.read ? ' off' : ''}`} aria-label={r.read ? 'Okundu' : 'Yeni'} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="adm-name">{r.name || r.email || 'İsimsiz'}</span><br />
                  <span className="adm-meta">{fmtDate(r.createdAt)} · {tagsOf(r)[0]?.label}</span>
                </span>
              </button>))}</div>}
        </section>
        <section className="lq-card adm-card">
          <div className="adm-head"><h2>Yaklaşan dolu günler</h2><button className="adm-link" onClick={() => go('calendar')}>Takvimi aç</button></div>
          {loading ? <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>
            : blocked.length === 0 ? <div className="adm-empty">Dolu gün işaretlenmemiş</div>
            : <div className="adm-list">{blocked.slice(0, 5).map((d) => (
              <div key={d} className="adm-row plain"><span className="adm-name">{fmtDay(d)}</span><span className="adm-chip tag" style={{ marginLeft: 'auto' }}>Dolu</span></div>))}</div>}
        </section>
      </div>
    </div>
  );
}
