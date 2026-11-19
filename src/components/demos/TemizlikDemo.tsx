import { useMemo, useState } from 'react';
import { useMoneyFormatter } from '../../lib/currency';
import { fill } from '../../lib/demoAccess';
import type { Lang } from '../../translations';
import AppShell, { BarChart, RankList, Avatar, Icon } from './AppShell';
import { TEMIZLIK } from './sampleData';
import { TEMIZLIK_UI } from './i18n/temizlik';
import { TEMIZLIK_DATA } from './data/temizlik';
import { Stat, Panel, Label, PrimaryBtn, GhostBtn, Pill, field, inputCls, useToast, uid, type DemoProps } from './ui';

interface Customer { id: string; name: string; district: string; address: string; phone: string; ctype: number; freq: number; base: number }
interface Job { id: string; cid: string; date: string; time: string; type: number; team: number; price: number; done: boolean; freq: number }
interface Invoice { id: string; number: string; cid: string; date: string; net: number; paid: boolean; jobId?: string }

const LOCALES: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };
const iso = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const HOURS = [2.5, 4, 5];
const sel = 'rounded-lg px-2 py-1 text-[11px] outline-none';

export default function TemizlikDemo({ lang, t }: DemoProps) {
  const k = t.temizlik;
  const u = TEMIZLIK_UI[lang];
  const m = TEMIZLIK_DATA[lang];
  const market = TEMIZLIK[lang];
  const loc = LOCALES[lang];
  const formatMoney = useMoneyFormatter();
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>(() => m.customers.map((c, i) => ({ id: `c${i}`, ...c })));
  const [jobs, setJobs] = useState<Job[]>(() => m.jobs.map((j, i) => ({
    id: `j${i}`, cid: `c${j.c}`, date: iso(j.d), time: j.time, type: j.type, team: j.team, price: j.price, done: j.d < 0, freq: m.customers[j.c].freq,
  })));
  const [invoices, setInvoices] = useState<Invoice[]>(() => m.invoices.map((v, i) => ({
    id: `i${i}`, number: `${m.prefix}-${new Date().getFullYear()}-${String(41 + i).padStart(4, '0')}`, cid: `c${v.c}`, date: iso(v.d),
    net: v.job !== undefined ? m.jobs[v.job].price : v.net ?? 0, paid: v.paid, jobId: v.job !== undefined ? `j${v.job}` : undefined,
  })).sort((a, b) => b.date.localeCompare(a.date)));

  const cust = (id: string) => customers.find((c) => c.id === id);
  const fmtDate = (d: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }) => new Date(d + 'T12:00:00').toLocaleDateString(loc, opts);
  const overdueLimit = iso(-14);
  const isOverdue = (v: Invoice) => !v.paid && v.date < overdueLimit;
  const statusOf = (v: Invoice) => (v.paid ? 1 : isOverdue(v) ? 2 : 0);
  const lifetime = (c: Customer) => c.base + jobs.filter((j) => j.cid === c.id && j.done).reduce((s, j) => s + j.price, 0);
  const todayOpen = jobs.filter((j) => j.date === iso(0) && !j.done).length;

  /* ---------- Tab 1: pricing & booking ---------- */
  const PricingTab = () => {
    const [area, setArea] = useState(80);
    const [rooms, setRooms] = useState(3);
    const [type, setType] = useState(0);
    const [extras, setExtras] = useState<boolean[]>([false, false, false]);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [freq, setFreq] = useState(0);
    const [date, setDate] = useState(iso(2));

    const price = useMemo(() => {
      const base = Math.max(area, 20) * market.rate[type] + rooms * market.perRoom;
      const ex = extras.reduce((s, on, i) => s + (on ? market.extras[i] : 0), 0);
      return Math.round((base + ex) / market.round) * market.round;
    }, [area, rooms, type, extras]);

    const book = (e: React.FormEvent) => {
      e.preventDefault();
      const n = name.trim();
      if (!n) return;
      let c = customers.find((x) => x.name.toLowerCase() === n.toLowerCase());
      if (!c) {
        c = { id: uid(), name: n, district: district.trim(), address: address.trim(), phone: '', ctype: 0, freq, base: 0 };
        setCustomers((p) => [...p, c!]);
      } else if (freq) setCustomers((p) => p.map((x) => (x.id === c!.id ? { ...x, freq } : x)));
      const load = [0, 1, 2].map((tm) => jobs.filter((j) => j.date === date && j.team === tm).length);
      const team = load.indexOf(Math.min(...load));
      setJobs((p) => [...p, { id: uid(), cid: c!.id, date, time: '10:00', type, team, price, done: false, freq }]);
      setName(''); setAddress(''); setDistrict(''); setFreq(0);
      toast.show(`${u.booked} ${k.teams[team]}`);
    };

    const revenue = jobs.reduce((s, j) => s + j.price, 0);
    const sorted = [...jobs].sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label={k.bookings} value={jobs.length} accent />
          <Stat label={t.total} value={formatMoney(revenue)} />
          <Stat label={u.todayJobs} value={todayOpen} />
          <Stat label={k.team} value={k.teams.length} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Panel title={k.calc} className="lg:col-span-2">
            <form onSubmit={book} className="space-y-4">
              <Label text={`${k.area}: ${area}`}>
                <input type="range" min={20} max={300} step={5} value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full accent-current" style={{ color: 'var(--color-ink-strongest)' }} />
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Label text={k.rooms}>
                  <input type="number" min={1} max={12} value={rooms} onChange={(e) => setRooms(Math.min(12, Math.max(1, Number(e.target.value) || 1)))} className={inputCls} style={field} />
                </Label>
                <Label text={k.date}>
                  <input type="date" min={iso(0)} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} style={field} />
                </Label>
              </div>
              <div>
                <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--color-ink-muted)' }}>{k.type}</p>
                <div className="flex flex-wrap gap-2">
                  {k.types.map((ty, i) => (
                    <button key={ty} type="button" onClick={() => setType(i)} className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={type === i ? { background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)' } : { border: '1px solid var(--color-border-card)', color: 'var(--color-ink-muted)' }}>{ty}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--color-ink-muted)' }}>{k.extras}</p>
                <div className="flex flex-wrap gap-3">
                  {k.extraList.map((ex, i) => (
                    <label key={ex} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-ink-strongest)' }}>
                      <input type="checkbox" checked={extras[i]} onChange={() => setExtras(extras.map((v, j) => (j === i ? !v : v)))} />
                      {ex} <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>+{formatMoney(market.extras[i])}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--color-lime-soft)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-ink-muted)' }}>{k.price}</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{formatMoney(price)}</span>
              </div>
              <Label text={k.customer}>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={field} maxLength={50} list="tmz-customers" />
                <datalist id="tmz-customers">{customers.map((c) => <option key={c.id} value={c.name} />)}</datalist>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Label text={u.address}><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} style={field} maxLength={60} /></Label>
                <Label text={u.district}><input value={district} onChange={(e) => setDistrict(e.target.value)} className={inputCls} style={field} maxLength={30} /></Label>
              </div>
              <Label text={u.recurring}>
                <select value={freq} onChange={(e) => setFreq(Number(e.target.value))} className={inputCls} style={field}>
                  {u.freqs.map((f, i) => <option key={f} value={i}>{f}</option>)}
                </select>
              </Label>
              <PrimaryBtn type="submit" disabled={!name.trim()}>{k.book}</PrimaryBtn>
            </form>
          </Panel>
          <Panel title={k.bookings} className="lg:col-span-3">
            <ul className="space-y-2">
              {sorted.map((b) => {
                const c = cust(b.cid);
                return (
                  <li key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl px-4 py-3" style={{ border: '1px solid var(--color-border-card)', opacity: b.done ? 0.65 : 1 }}>
                    <span className="font-mono text-xs w-20" style={{ color: 'var(--color-ink-muted)' }}>{fmtDate(b.date)} {b.time}</span>
                    <span className="flex-1 min-w-[140px]">
                      <span className="block text-sm font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{c?.name}</span>
                      <span className="block text-[11px]" style={{ color: 'var(--color-ink-muted)' }}>{k.types[b.type]}{c?.district ? ` · ${c.district}` : ''}{b.freq ? ` · ${u.freqs[b.freq]}` : ''}</span>
                    </span>
                    {b.done && <Pill tone="success">{u.done}</Pill>}
                    <Pill tone="lime">{k.teams[b.team]}</Pill>
                    <span className="text-sm font-bold w-20 text-right" style={{ color: 'var(--color-ink-strongest)' }}>{formatMoney(b.price)}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    );
  };

  /* ---------- Tab 2: team plan ---------- */
  const moveJob = (id: string, team: number) => {
    setJobs((p) => p.map((j) => (j.id === id ? { ...j, team } : j)));
    toast.show(`${u.moved} ${k.teams[team]}`);
  };
  const markDone = (id: string) => {
    setJobs((p) => p.map((j) => (j.id === id ? { ...j, done: true } : j)));
    toast.show(u.doneToast);
  };
  const PlanTab = () => {
    const days = Array.from({ length: 7 }, (_, i) => iso(i));
    return (
      <Panel title={u.planTitle}>
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-[980px] grid gap-2" style={{ gridTemplateColumns: '150px repeat(7, minmax(120px, 1fr))' }}>
            <div />
            {days.map((d, i) => (
              <div key={d} className="text-xs font-bold px-1 pb-1" style={{ color: i === 0 ? 'var(--color-ink-strongest)' : 'var(--color-ink-muted)' }}>
                {fmtDate(d, { weekday: 'short', day: 'numeric', month: 'numeric' })}
              </div>
            ))}
            {[0, 1, 2].map((tm) => {
              const week = jobs.filter((j) => j.team === tm && days.includes(j.date));
              const hours = week.reduce((s, j) => s + HOURS[j.type], 0);
              const pct = Math.min(100, Math.round((hours / m.cap) * 100));
              return (
                <div key={tm} className="contents">
                  <div className="rounded-xl p-3" style={{ background: 'var(--color-lime-soft)' }}>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{k.teams[tm]}</p>
                    <p className="text-[11px] mb-2" style={{ color: 'var(--color-ink-muted)' }}>{m.members[tm].join(', ')}</p>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--color-border-card)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: 'var(--color-ink-strongest)' }} />
                    </div>
                    <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--color-ink-muted)' }}>{u.util} {pct} % · {hours}{u.hoursShort}</p>
                  </div>
                  {days.map((d) => {
                    const cell = week.filter((j) => j.date === d).sort((a, b) => a.time.localeCompare(b.time));
                    return (
                      <div key={d} className="rounded-xl p-1.5 space-y-1.5 min-h-[72px]" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)' }}>
                        {cell.length === 0 && <p className="text-[11px] px-1 pt-1" style={{ color: 'var(--color-ink-muted)' }}>{u.noJobs}</p>}
                        {cell.map((j) => (
                          <div key={j.id} className="rounded-lg p-2" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)', opacity: j.done ? 0.6 : 1 }}>
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{cust(j.cid)?.name}</p>
                            <p className="text-[11px] mb-1.5" style={{ color: 'var(--color-ink-muted)' }}>{j.time} · {k.types[j.type]}</p>
                            <div className="flex items-center gap-1">
                              <select aria-label={u.move} value={j.team} onChange={(e) => moveJob(j.id, Number(e.target.value))} className={`${sel} flex-1 min-w-0`} style={field}>
                                {k.teams.map((tn, i) => <option key={tn} value={i}>{tn}</option>)}
                              </select>
                              {j.done ? <Icon name="check" size={16} className="shrink-0" /> : (
                                <button type="button" title={u.markDone} aria-label={u.markDone} onClick={() => markDone(j.id)} className="rounded-lg p-1 shrink-0" style={{ background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)' }}>
                                  <Icon name="check" size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    );
  };

  /* ---------- Tab 3: customers ---------- */
  const CustomersTab = () => {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [f, setF] = useState({ name: '', district: '', phone: '', ctype: 0, freq: 0 });
    const list = customers.filter((c) => `${c.name} ${c.district} ${c.phone}`.toLowerCase().includes(q.trim().toLowerCase()));
    const sel1 = customers.find((c) => c.id === open);
    const save = (e: React.FormEvent) => {
      e.preventDefault();
      if (!f.name.trim()) return;
      setCustomers((p) => [...p, { id: uid(), name: f.name.trim(), district: f.district.trim(), address: '', phone: f.phone.trim(), ctype: f.ctype, freq: f.freq, base: 0 }]);
      setF({ name: '', district: '', phone: '', ctype: 0, freq: 0 });
      setAdding(false);
      toast.show(u.custAdded);
    };
    return (
      <div className="space-y-5">
        <Panel title={u.custTitle} action={<PrimaryBtn onClick={() => setAdding(!adding)}>{adding ? t.cancel : `+ ${u.newCust}`}</PrimaryBtn>}>
          {adding && (
            <form onSubmit={save} className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5 items-end">
              <Label text={u.name}><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} style={field} maxLength={50} /></Label>
              <Label text={u.district}><input value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} className={inputCls} style={field} maxLength={30} /></Label>
              <Label text={u.phone}><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inputCls} style={field} maxLength={24} /></Label>
              <Label text={u.ctype}>
                <select value={f.ctype} onChange={(e) => setF({ ...f, ctype: Number(e.target.value) })} className={inputCls} style={field}>{u.ctypes.map((x, i) => <option key={x} value={i}>{x}</option>)}</select>
              </Label>
              <Label text={u.freq}>
                <select value={f.freq} onChange={(e) => setF({ ...f, freq: Number(e.target.value) })} className={inputCls} style={field}>{u.freqs.map((x, i) => <option key={x} value={i}>{x}</option>)}</select>
              </Label>
              <PrimaryBtn type="submit" disabled={!f.name.trim()}>{t.save}</PrimaryBtn>
            </form>
          )}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className={`${inputCls} mb-4`} style={field} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-[11px]" style={{ color: 'var(--color-ink-muted)' }}>
                  <th className="pb-2 font-semibold">{u.name}</th><th className="pb-2 font-semibold">{u.district}</th><th className="pb-2 font-semibold">{u.phone}</th>
                  <th className="pb-2 font-semibold">{u.ctype}</th><th className="pb-2 font-semibold">{u.freq}</th><th className="pb-2 font-semibold text-right">{u.lifetime}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} onClick={() => setOpen(c.id)} className="cursor-pointer" style={{ borderTop: '1px solid var(--color-border-card)', background: open === c.id ? 'var(--color-lime-soft)' : undefined }}>
                    <td className="py-2.5 pr-3"><span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--color-ink-strongest)' }}><Avatar name={c.name} size={28} />{c.name}</span></td>
                    <td className="py-2.5 pr-3" style={{ color: 'var(--color-ink-muted)' }}>{c.district}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{c.phone || '–'}</td>
                    <td className="py-2.5 pr-3"><Pill>{u.ctypes[c.ctype]}</Pill></td>
                    <td className="py-2.5 pr-3"><Pill tone={c.freq ? 'lime' : 'neutral'}>{u.freqs[c.freq]}</Pill></td>
                    <td className="py-2.5 text-right font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{formatMoney(lifetime(c))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <p className="text-sm py-6 text-center" style={{ color: 'var(--color-ink-muted)' }}>{u.noMatch}</p>}
          </div>
        </Panel>
        {sel1 && (
          <Panel title={`${u.history} · ${sel1.name}`} action={<GhostBtn onClick={() => setOpen(null)}>{u.close}</GhostBtn>}>
            <p className="text-xs mb-3" style={{ color: 'var(--color-ink-muted)' }}>{[sel1.address, sel1.district].filter(Boolean).join(', ')}</p>
            <ul className="space-y-2">
              {jobs.filter((j) => j.cid === sel1.id).sort((a, b) => b.date.localeCompare(a.date)).map((j) => (
                <li key={j.id} className="flex flex-wrap items-center gap-3 rounded-xl px-4 py-2.5" style={{ border: '1px solid var(--color-border-card)' }}>
                  <span className="font-mono text-xs w-20" style={{ color: 'var(--color-ink-muted)' }}>{fmtDate(j.date, { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                  <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{k.types[j.type]}</span>
                  <Pill>{k.teams[j.team]}</Pill>
                  {j.done && <Pill tone="success">{u.done}</Pill>}
                  <span className="text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{formatMoney(j.price)}</span>
                </li>
              ))}
              {!jobs.some((j) => j.cid === sel1.id) && <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{u.noHistory}</p>}
            </ul>
          </Panel>
        )}
      </div>
    );
  };

  /* ---------- Tab 4: invoices ---------- */
  const InvoicesTab = () => {
    const [pick, setPick] = useState('');
    const invoiced = new Set(invoices.map((v) => v.jobId));
    const open = jobs.filter((j) => j.done && !invoiced.has(j.id));
    const month = iso(0).slice(0, 7);
    const monthInv = invoices.filter((v) => v.date.slice(0, 7) === month);
    const gross = (n: number) => n * (1 + m.vat);
    const create = () => {
      const j = jobs.find((x) => x.id === (pick || open[0]?.id));
      if (!j) return;
      const n = invoices.length + 41;
      setInvoices((p) => [{ id: uid(), number: `${m.prefix}-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`, cid: j.cid, date: iso(0), net: j.price, paid: false, jobId: j.id }, ...p]);
      setPick('');
      toast.show(u.invCreated);
    };
    const pay = (id: string) => { setInvoices((p) => p.map((v) => (v.id === id ? { ...v, paid: true } : v))); toast.show(u.invPaid); };
    const remindUrl = (v: Invoice) => {
      const c = cust(v.cid);
      const text = fill(u.remindText, { name: c?.name ?? '', number: v.number, amount: formatMoney(gross(v.net)), brand: m.brand.name });
      return `https://wa.me/${(c?.phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    };
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label={u.invoicedMonth} value={formatMoney(gross(monthInv.reduce((s, v) => s + v.net, 0)))} accent />
          <Stat label={u.collected} value={formatMoney(gross(invoices.filter((v) => v.paid).reduce((s, v) => s + v.net, 0)))} />
          <Stat label={u.outstanding} value={formatMoney(gross(invoices.filter((v) => !v.paid).reduce((s, v) => s + v.net, 0)))} />
        </div>
        <Panel title={u.createFrom}>
          {open.length === 0 ? <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{u.noneToInvoice}</p> : (
            <div className="flex flex-wrap items-end gap-3">
              <Label text={u.pickJob}>
                <select value={pick || open[0].id} onChange={(e) => setPick(e.target.value)} className={inputCls} style={field}>
                  {open.map((j) => <option key={j.id} value={j.id}>{`${cust(j.cid)?.name} · ${fmtDate(j.date)} · ${formatMoney(j.price)}`}</option>)}
                </select>
              </Label>
              <PrimaryBtn onClick={create}>{u.create}</PrimaryBtn>
            </div>
          )}
        </Panel>
        <Panel title={u.invTitle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-[11px]" style={{ color: 'var(--color-ink-muted)' }}>
                  <th className="pb-2 font-semibold">{u.number}</th><th className="pb-2 font-semibold">{u.customer}</th><th className="pb-2 font-semibold">{u.date}</th>
                  <th className="pb-2 font-semibold text-right">{u.net}</th><th className="pb-2 font-semibold text-right">{u.vat}</th><th className="pb-2 font-semibold text-right">{u.gross}</th>
                  <th className="pb-2 font-semibold pl-4">{u.status}</th><th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((v) => {
                  const s = statusOf(v);
                  return (
                    <tr key={v.id} style={{ borderTop: '1px solid var(--color-border-card)' }}>
                      <td className="py-2.5 pr-3 font-mono text-xs whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{v.number}</td>
                      <td className="py-2.5 pr-3 font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{cust(v.cid)?.name}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{fmtDate(v.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td className="py-2.5 text-right" style={{ color: 'var(--color-ink-strongest)' }}>{formatMoney(v.net)}</td>
                      <td className="py-2.5 text-right" style={{ color: 'var(--color-ink-muted)' }}>{formatMoney(v.net * m.vat)}</td>
                      <td className="py-2.5 text-right font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{formatMoney(gross(v.net))}</td>
                      <td className="py-2.5 pl-4">
                        {s === 2 ? <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-feature-error-soft)', color: 'var(--color-feature-error)' }}>{u.st[2]}</span>
                          : <Pill tone={s === 1 ? 'success' : 'lime'}>{u.st[s]}</Pill>}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        {!v.paid && (
                          <span className="inline-flex gap-2">
                            <a href={remindUrl(v)} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1" style={{ border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strongest)' }}>
                              <Icon name="whatsapp" size={14} />{u.remind}
                            </a>
                            <GhostBtn onClick={() => pay(v.id)}>{u.markPaid}</GhostBtn>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    );
  };

  /* ---------- Tab 5: reports ---------- */
  const ReportsTab = () => {
    const now = new Date();
    const currentDone = jobs.filter((j) => j.done && j.date.slice(0, 7) === iso(0).slice(0, 7)).reduce((s, j) => s + j.price, 0);
    const data = m.months.map((v, i) => ({
      label: new Date(now.getFullYear(), now.getMonth() - 5 + i, 1).toLocaleDateString(loc, { month: 'short' }),
      value: i === 5 ? v + currentDone : v,
    }));
    const byType = k.types.map((label, i) => ({ label, value: m.typeBase[i] + jobs.filter((j) => j.type === i).length }));
    const avg = jobs.length ? Math.round(jobs.reduce((s, j) => s + j.price, 0) / jobs.length) : 0;
    const repeat = customers.length ? Math.round((customers.filter((c) => c.freq > 0 || jobs.filter((j) => j.cid === c.id).length > 1).length / customers.length) * 100) : 0;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Stat label={u.avgJob} value={formatMoney(avg)} accent />
          <Stat label={u.repeat} value={`${repeat} %`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Panel title={u.revenue6} className="lg:col-span-3"><BarChart data={data} format={formatMoney} /></Panel>
          <Panel title={u.byType} className="lg:col-span-2"><RankList items={byType} format={(n) => `${n} ${u.jobsWord}`} /></Panel>
        </div>
      </div>
    );
  };

  return (
    <>
      <AppShell
        lang={lang}
        brand={m.brand}
        user={m.user}
        searchPlaceholder={u.search}
        notificationsTitle={u.notifTitle}
        notifications={m.notifications}
        tabs={[
          { key: 'pricing', label: u.tabs.pricing, icon: 'broom', render: () => <PricingTab /> },
          { key: 'plan', label: u.tabs.plan, icon: 'team', badge: todayOpen, render: () => <PlanTab /> },
          { key: 'customers', label: u.tabs.customers, icon: 'users', render: () => <CustomersTab /> },
          { key: 'invoices', label: u.tabs.invoices, icon: 'file', render: () => <InvoicesTab /> },
          { key: 'reports', label: u.tabs.reports, icon: 'chart', render: () => <ReportsTab /> },
        ]}
      />
      {toast.node}
    </>
  );
}
