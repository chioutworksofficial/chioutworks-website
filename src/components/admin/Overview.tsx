import { GROUPS, type Tab } from '../../pages/Admin';
import { fmtDate, fmtDay, tagsOf, type Req, type Usage, type VoiceSession } from './api';

interface Props {
  reqs: Req[] | null; sessions: VoiceSession[] | null; usage: Usage | null; blocked: string[];
  go: (t: Tab, id?: string) => void; badges: Partial<Record<Tab, number>>;
}
const nf = (n: number) => n.toLocaleString('tr-TR');

export default function Overview({ reqs, sessions, usage, blocked, go, badges }: Props) {
  const loading = reqs === null || sessions === null;
  const week = Date.now() - 7 * 864e5;
  const now = new Date();
  const newCount = (reqs ?? []).filter((r) => new Date(r.createdAt).getTime() >= week).length;
  const voiceMonth = (sessions ?? []).filter((s) => { const d = new Date(s.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
  const pct = usage ? Math.min(100, (usage.chars / usage.cap) * 100) : 0;
  const stat = (label: string, value: string | number, extra?: React.ReactNode) => (
    <div className="lq-card adm-stat"><span className="adm-label">{label}</span><b>{loading ? '–' : value}</b>{extra}</div>
  );
  return (
    <>
      <h1 className="adm-h1">Genel bakış</h1>
      <p className="adm-sub">Taleplerin, görüşmelerin ve işlerin özeti; aşağıdan her alana geçebilirsiniz.</p>
      <div className="adm-grid4">
        {stat('Yeni talepler (son 7 gün)', newCount)}
        {stat('Toplam talep', reqs?.length ?? 0)}
        {stat('Sesli görüşme (bu ay)', voiceMonth)}
        <div className="lq-card adm-stat">
          <span className="adm-label">Doğal ses kotası</span>
          <b>{usage ? `${Math.round(pct)}%` : '–'}</b>
          {usage && <>
            <div className="adm-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
            <span className="adm-meta">{nf(usage.chars)} / {nf(usage.cap)} karakter</span>
          </>}
        </div>
      </div>
      <h2 className="adm-h2">Alanlar</h2>
      <div className="adm-areas">{GROUPS.filter((g) => g.label !== 'Genel').map((g) => (
        <section key={g.label} className="lq-card adm-card" aria-label={g.label}>
          <h3>{g.label}</h3><p className="adm-meta">{g.desc}</p>
          <div className="adm-list">{g.tabs.map((t) => (
            <button key={t.key} className="adm-row" onClick={() => go(t.key)}>
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
    </>
  );
}
