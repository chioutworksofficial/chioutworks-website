import { useMemo, useState } from 'react';
import { T, type Lang } from '../../translations';
import { fill } from '../../lib/demoAccess';
import QrImage from './QrImage';
import AppShell, { BarChart, RankList, Avatar } from './AppShell';
import { Stat, Panel, Label, PrimaryBtn, GhostBtn, Pill, field, inputCls, useToast, uid, type DemoProps } from './ui';
import { SADAKAT_UI } from './i18n/sadakat';
import { SADAKAT_DATA } from './data/sadakat';

const LOCALES: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };
const JOIN_URL = 'https://chioutworks.com/demo/demosadakat?join=1';

interface Customer { id: string; name: string; phone: string; stamps: number; visits: number; daysAgo: number; bday?: boolean }
interface Reward { id: string; stamps: number; name: string }
interface Campaign { id: string; name: string; type: number; channel: number; audience: number; date: string; status: 'sent' | 'scheduled'; sent: number; opened: number; redeemed: number }

const isoDay = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
const digits = (s: string) => s.replace(/\D/g, '');

export default function SadakatDemo({ lang, t }: DemoProps) {
  const k = t.sadakat;
  const u = SADAKAT_UI[lang];
  const data = SADAKAT_DATA[lang];
  const x = T[lang].demos.extras;
  const loc = LOCALES[lang];
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>(() => data.customers.map((c, i) => ({ id: `c${i}`, ...c })));
  const [rewards, setRewards] = useState<Reward[]>(() => data.rewards.map((r, i) => ({ id: `r${i}`, ...r })));
  const [goalId, setGoalId] = useState('r0');
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => data.campaigns.map((c, i) => ({ id: `m${i}`, ...c, date: isoDay(c.inDays) })));
  const [week, setWeek] = useState(data.week);
  const [redeemedMonth, setRedeemedMonth] = useState(data.rewardsMonth);
  const [stampsToday, setStampsToday] = useState(14);
  const [redeemedToday, setRedeemedToday] = useState(3);

  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [qrFor, setQrFor] = useState<string | null>(null);
  const [scanPhone, setScanPhone] = useState('');
  const [scanPick, setScanPick] = useState('');

  const [camp, setCamp] = useState({ name: '', type: 0, channel: 0, date: isoDay(1) });
  const [rForm, setRForm] = useState({ stamps: '8', name: '' });

  const goalReward = rewards.find((r) => r.id === goalId) ?? rewards[0];
  const goal = goalReward?.stamps ?? 10;
  const biz = data.brand.poster;

  const audienceOf = (type: number) =>
    type === 1 ? customers.filter((c) => c.bday).length : type === 2 ? customers.filter((c) => c.daysAgo >= 30).length : customers.length;

  const filtered = useMemo(() => {
    const s = q.toLowerCase().replace(/\s/g, '');
    return customers.filter((c) => c.name.toLowerCase().replace(/\s/g, '').includes(s) || c.phone.replace(/\s/g, '').includes(s));
  }, [customers, q]);

  const lastVisit = (d: number) => (d === 0 ? u.today : d === 1 ? u.yesterday : fill(u.daysAgo, { n: String(d) }));

  const addStamp = (id: string): Customer | undefined => {
    const c = customers.find((cc) => cc.id === id);
    if (!c) return undefined;
    const upd = { ...c, stamps: Math.min(goal, c.stamps + 1), visits: c.visits + 1, daysAgo: 0 };
    setCustomers(customers.map((cc) => (cc.id === id ? upd : cc)));
    setStampsToday((n) => n + 1);
    setWeek((w) => w.map((v, i) => (i === w.length - 1 ? v + 1 : v)));
    return upd;
  };
  const redeem = (id: string) => {
    setCustomers(customers.map((c) => (c.id === id ? { ...c, stamps: 0 } : c)));
    setRedeemedToday((n) => n + 1);
    setRedeemedMonth((n) => n + 1);
    toast.show(k.redeemed);
  };
  const addCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setCustomers([{ id: uid(), name: form.name.trim(), phone: form.phone.trim(), stamps: 1, visits: 1, daysAgo: 0 }, ...customers]);
    setStampsToday((n) => n + 1);
    setWeek((w) => w.map((v, i) => (i === w.length - 1 ? v + 1 : v)));
    toast.show(fill(u.newCustomerDone, { name: form.name.trim() }));
    setForm({ name: '', phone: '' });
  };
  const scan = (e: React.FormEvent) => {
    e.preventDefault();
    const found = scanPick ? customers.find((c) => c.id === scanPick) : digits(scanPhone).length >= 6 ? customers.find((c) => digits(c.phone).endsWith(digits(scanPhone)) || digits(scanPhone).endsWith(digits(c.phone))) : undefined;
    if (!found) return toast.show(u.scanNone, true);
    const upd = addStamp(found.id);
    if (upd) toast.show(fill(u.scanDone, { name: upd.name, n: String(upd.stamps), goal: String(goal) }));
    setScanPhone('');
    setScanPick('');
  };

  const messageFor = (type: number, name: string) => fill(u.msgs[type], { name, biz, reward: goalReward?.name ?? '' });
  const previewName = customers[0]?.name.split(' ')[0] ?? '';

  const createCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!camp.name.trim()) return toast.show(u.campNameMissing, true);
    setCampaigns([{ id: uid(), name: camp.name.trim(), type: camp.type, channel: camp.channel, audience: audienceOf(camp.type), date: camp.date, status: 'scheduled', sent: 0, opened: 0, redeemed: 0 }, ...campaigns]);
    setCamp({ ...camp, name: '' });
    toast.show(u.campCreated);
  };
  const sendNow = (id: string) => {
    const c = campaigns.find((cc) => cc.id === id);
    if (!c) return;
    const sent = c.audience;
    setCampaigns(campaigns.map((cc) => (cc.id === id ? { ...cc, status: 'sent', date: isoDay(0), sent, opened: Math.round(sent * 0.72), redeemed: Math.round(sent * 0.3) } : cc)));
    toast.show(fill(u.campSent, { n: String(sent) }));
  };

  const addReward = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(rForm.stamps, 10);
    if (!rForm.name.trim() || !n || n < 1 || n > 50) return;
    setRewards([...rewards, { id: uid(), stamps: n, name: rForm.name.trim() }]);
    setRForm({ stamps: '8', name: '' });
    toast.show(u.rewardAdded);
  };
  const updateReward = (id: string, patch: Partial<Reward>) => setRewards(rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeReward = (id: string) => {
    if (rewards.length <= 1 || id === goalReward?.id) return toast.show(u.rewardKeep, true);
    setRewards(rewards.filter((r) => r.id !== id));
    toast.show(u.rewardRemoved);
  };
  const setGoal = (r: Reward) => {
    setGoalId(r.id);
    setCustomers(customers.map((c) => ({ ...c, stamps: Math.min(c.stamps, r.stamps) })));
    toast.show(fill(u.rewardSetDone, { n: String(r.stamps) }));
  };

  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString(loc, { weekday: 'short' });
  }), [loc]);
  const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString(loc, { day: 'numeric', month: 'short' });
  const repeatRate = Math.round((customers.filter((c) => c.visits >= 2).length / Math.max(1, customers.length)) * 100);
  const top = [...customers].sort((a, b) => b.visits - a.visits).slice(0, 5).map((c) => ({ label: c.name, value: c.visits }));
  const activeCamps = campaigns.filter((c) => c.status === 'scheduled').length;

  /* ---------- tabs ---------- */
  const cardsTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label={k.stampsGiven} value={stampsToday} accent />
        <Stat label={k.rewardsRedeemed} value={redeemedToday} />
        <Stat label={k.activeCards} value={customers.length} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title={k.customers} className="lg:col-span-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className={`${inputCls} mb-4`} style={field} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((c) => {
              const ready = c.stamps >= goal;
              return (
                <div key={c.id} className="rounded-2xl p-4" style={{ border: `1px solid ${ready ? 'var(--color-lime-300)' : 'var(--color-border-card)'}`, background: ready ? 'var(--color-lime-soft)' : 'transparent' }}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={c.name} size={32} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{c.name}</p>
                        <p className="text-[11px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>{c.phone}</p>
                      </div>
                    </div>
                    {ready ? <Pill tone="success">{k.rewardReady}</Pill> : <Pill>{c.stamps}/{goal}</Pill>}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2" aria-label={`${c.stamps}/${goal}`}>
                    {Array.from({ length: goal }, (_, i) => (
                      <span key={i} className="w-4 h-4 rounded-full" style={{ background: i < c.stamps ? 'var(--color-ink-strongest)' : 'var(--color-border-card)' }} />
                    ))}
                  </div>
                  <p className="text-[11px] mb-3" style={{ color: 'var(--color-ink-muted)' }}>{u.lastVisit}: {lastVisit(c.daysAgo)} · {c.visits} {u.visits}</p>
                  <div className="flex flex-wrap gap-2">
                    {ready
                      ? <PrimaryBtn onClick={() => redeem(c.id)}>{k.redeem} · {goalReward?.name}</PrimaryBtn>
                      : <GhostBtn onClick={() => { const r = addStamp(c.id); if (r) toast.show(fill(u.scanDone, { name: r.name, n: String(r.stamps), goal: String(goal) })); }}>{k.stamp}</GhostBtn>}
                    <GhostBtn onClick={() => setQrFor(qrFor === c.id ? null : c.id)}>{x.cardQr}</GhostBtn>
                  </div>
                  {qrFor === c.id && (
                    <div className="mt-3 flex items-center gap-3">
                      <QrImage value={`https://chioutworks.com/demo/demosadakat?card=${c.id}`} size={88} label={x.cardQr} />
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{x.cardQrHint}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title={u.scanTitle}>
            <form onSubmit={scan} className="space-y-3">
              <Label text={u.scanPhone}><input type="tel" value={scanPhone} onChange={(e) => { setScanPhone(e.target.value); setScanPick(''); }} className={inputCls} style={field} maxLength={20} /></Label>
              <Label text={u.scanPick}>
                <select value={scanPick} onChange={(e) => { setScanPick(e.target.value); setScanPhone(''); }} className={inputCls} style={field}>
                  <option value="">—</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Label>
              <PrimaryBtn type="submit" disabled={!scanPhone.trim() && !scanPick}>{u.scanBtn}</PrimaryBtn>
            </form>
          </Panel>
          <Panel title={k.newCustomer}>
            <form onSubmit={addCustomer} className="space-y-3">
              <Label text={k.name}><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} style={field} maxLength={40} /></Label>
              <Label text={k.phone}><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} style={field} maxLength={20} /></Label>
              <PrimaryBtn type="submit" disabled={!form.name.trim() || !form.phone.trim()}>{t.add}</PrimaryBtn>
            </form>
            <div className="mt-5 rounded-2xl p-4 text-center" style={{ background: 'var(--color-ink-strongest)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-lime-300)' }}>{u.goal}: {goal} ×</p>
              <p className="text-base font-bold" style={{ color: 'var(--background)' }}>{goalReward?.name}</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );

  const campaignsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <Panel title={u.campNew} className="lg:col-span-2">
        <form onSubmit={createCampaign} className="space-y-3">
          <Label text={u.campName}><input value={camp.name} onChange={(e) => setCamp({ ...camp, name: e.target.value })} className={inputCls} style={field} maxLength={40} /></Label>
          <Label text={u.campType}>
            <select value={camp.type} onChange={(e) => setCamp({ ...camp, type: Number(e.target.value) })} className={inputCls} style={field}>
              {u.types.map((n, i) => <option key={n} value={i}>{n}</option>)}
            </select>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Label text={u.campChannel}>
              <select value={camp.channel} onChange={(e) => setCamp({ ...camp, channel: Number(e.target.value) })} className={inputCls} style={field}>
                {u.channels.map((n, i) => <option key={n} value={i}>{n}</option>)}
              </select>
            </Label>
            <Label text={u.campDate}><input type="date" value={camp.date} onChange={(e) => setCamp({ ...camp, date: e.target.value })} className={inputCls} style={field} /></Label>
          </div>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-muted)' }}>{u.campAudience}: <span style={{ color: 'var(--color-ink-strongest)' }}>{fill(u.audienceN, { n: String(audienceOf(camp.type)) })}</span></p>
          <PrimaryBtn type="submit">{u.campCreate}</PrimaryBtn>
        </form>
        <p className="text-[11px] font-semibold mt-5 mb-2" style={{ color: 'var(--color-ink-muted)' }}>{u.campPreview} · {u.channels[camp.channel]}</p>
        <div className="rounded-2xl p-3" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)' }}>
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm px-3 py-2 text-sm leading-relaxed" style={{ background: 'var(--color-lime-soft)', color: 'var(--color-ink-strongest)' }}>
            {messageFor(camp.type, previewName)}
          </div>
        </div>
      </Panel>

      <Panel title={u.campList} className="lg:col-span-3">
        <ul className="space-y-3">
          {campaigns.map((c) => (
            <li key={c.id} className="rounded-xl p-4" style={{ border: '1px solid var(--color-border-card)' }}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{u.types[c.type]} · {u.channels[c.channel]} · {fmtDate(c.date)}</p>
                </div>
                <Pill tone={c.status === 'sent' ? 'success' : 'lime'}>{c.status === 'sent' ? u.statusSent : u.statusScheduled}</Pill>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                {[[u.colSent, c.sent], [u.colOpened, c.opened], [u.colRedeemed, c.redeemed]].map(([l, v]) => (
                  <div key={String(l)} className="rounded-lg py-2" style={{ background: 'var(--background)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{v}</p>
                    <p className="text-[11px]" style={{ color: 'var(--color-ink-muted)' }}>{l}</p>
                  </div>
                ))}
              </div>
              {c.status === 'scheduled' && <PrimaryBtn onClick={() => sendNow(c.id)}>{u.campSend} · {fill(u.audienceN, { n: String(c.audience) })}</PrimaryBtn>}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );

  const rewardsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Panel title={u.rewardsTitle} className="lg:col-span-2">
        <ul className="space-y-3">
          {rewards.map((r) => {
            const isGoal = r.id === goalReward?.id;
            return (
              <li key={r.id} className="rounded-xl p-3 flex flex-wrap items-end gap-3" style={{ border: `1px solid ${isGoal ? 'var(--color-lime-300)' : 'var(--color-border-card)'}`, background: isGoal ? 'var(--color-lime-soft)' : 'transparent' }}>
                <div className="w-24">
                  <Label text={u.rewardStamps}><input type="number" min={1} max={50} value={r.stamps} onChange={(e) => updateReward(r.id, { stamps: Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)) })} className={inputCls} style={field} /></Label>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <Label text={u.rewardName}><input value={r.name} onChange={(e) => updateReward(r.id, { name: e.target.value })} className={inputCls} style={field} maxLength={50} /></Label>
                </div>
                <div className="flex items-center gap-2">
                  {isGoal ? <Pill tone="success">{u.rewardDefault}</Pill> : <GhostBtn onClick={() => setGoal(r)}>{u.rewardSet}</GhostBtn>}
                  <GhostBtn onClick={() => removeReward(r.id)}>{u.rewardRemove}</GhostBtn>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel title={u.rewardAdd}>
        <form onSubmit={addReward} className="space-y-3">
          <Label text={u.rewardStamps}><input type="number" min={1} max={50} value={rForm.stamps} onChange={(e) => setRForm({ ...rForm, stamps: e.target.value })} className={inputCls} style={field} /></Label>
          <Label text={u.rewardName}><input value={rForm.name} onChange={(e) => setRForm({ ...rForm, name: e.target.value })} className={inputCls} style={field} maxLength={50} /></Label>
          <PrimaryBtn type="submit" disabled={!rForm.name.trim()}>{t.add}</PrimaryBtn>
        </form>
      </Panel>
    </div>
  );

  const qrTab = () => (
    <Panel title={u.qrTitle} action={<PrimaryBtn onClick={() => { toast.show(u.printing); setTimeout(() => window.print(), 300); }}>{u.print}</PrimaryBtn>}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-[420px] rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface-raised)', border: '2px solid var(--color-ink-strongest)', aspectRatio: '148 / 210' }}>
          <div className="flex flex-col items-center justify-between h-full gap-4">
            <p className="text-sm font-black tracking-wide" style={{ color: 'var(--color-ink-strongest)' }}>{biz}</p>
            <h4 className="text-2xl font-black leading-tight px-2 py-1 rounded-lg" style={{ background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)' }}>{u.posterHeadline}</h4>
            <QrImage value={JOIN_URL} size={160} label={u.posterScan} />
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{fill(u.posterCta, { n: String(goal) })}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{goalReward?.name}</p>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{u.posterHint}</p>
      </div>
    </Panel>
  );

  const reportsTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label={u.repVisitsWeek} value={week.reduce((s, v) => s + v, 0)} accent />
        <Stat label={u.repRepeat} value={`${repeatRate}%`} />
        <Stat label={u.repRedeemed} value={redeemedMonth} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title={u.repTitleVisits} className="lg:col-span-2">
          <BarChart data={week.map((v, i) => ({ label: weekdays[i], value: v }))} />
        </Panel>
        <Panel title={u.repTop}><RankList items={top} /></Panel>
      </div>
    </div>
  );

  return (
    <>
      <AppShell
        lang={lang}
        brand={{ name: data.brand.name, tagline: data.brand.tagline, initials: data.brand.initials }}
        user={data.user}
        searchPlaceholder={u.search}
        notificationsTitle={u.notifTitle}
        notifications={data.notifications}
        tabs={[
          { key: 'cards', label: u.tabCards, icon: 'card', render: cardsTab },
          { key: 'campaigns', label: u.tabCampaigns, icon: 'megaphone', badge: activeCamps || undefined, render: campaignsTab },
          { key: 'rewards', label: u.tabRewards, icon: 'gift', render: rewardsTab },
          { key: 'qr', label: u.tabQr, icon: 'tag', render: qrTab },
          { key: 'reports', label: u.tabReports, icon: 'chart', render: reportsTab },
        ]}
      />
      {toast.node}
    </>
  );
}
