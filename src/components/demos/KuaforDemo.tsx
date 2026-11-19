import { useState } from 'react';
import { useMoneyFormatter } from '../../lib/currency';
import { KUAFOR } from './sampleData';
import { T } from '../../translations';
import { fill } from '../../lib/demoAccess';
import AppShell, { BarChart, RankList, Avatar, Icon } from './AppShell';
import QrImage from './QrImage';
import { Stat, Panel, Label, PrimaryBtn, GhostBtn, Pill, field, inputCls, useToast, uid, type DemoProps } from './ui';
import { KUAFOR_UI } from './i18n/kuafor';
import { KUAFOR_DATA } from './data/kuafor';

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const LOCALES = { tr: 'tr-TR', de: 'de-DE', el: 'el-GR', en: 'en-GB' } as const;
const STATUSES = ['confirmed', 'arrived', 'noShow'] as const;
type Status = (typeof STATUSES)[number];

interface Service { id: string; name: string; min: number; price: number; online: boolean }
interface Appt { id: string; customer: string; service: string; stylist: number; time: string; status: Status }
interface Customer { id: string; name: string; phone: string; visits: number; lastDays: number | null; spent: number; fav: string; note: string; history: { daysAgo: number; service: string }[] }

const muted = { color: 'var(--color-ink-muted)' };
const strong = { color: 'var(--color-ink-strongest)' };
const num = (v: string) => Math.max(0, Number(v.replace(/[^\d]/g, '')) || 0);

export default function KuaforDemo({ lang, t }: DemoProps) {
  const k = t.kuafor;
  const u = KUAFOR_UI[lang];
  const D = KUAFOR_DATA[lang];
  const x = T[lang].demos.extras;
  const formatMoney = useMoneyFormatter();
  const { stylists: STYLISTS, prices, appts: seed } = KUAFOR[lang];
  const toast = useToast();
  const locale = LOCALES[lang];

  const [services, setServices] = useState<Service[]>(() => [
    ...k.services.map((name, i) => ({ id: `s${i}`, name, min: D.durations[i], price: prices[i], online: true })),
    ...D.extraServices.map((s, i) => ({ id: `s${k.services.length + i}`, name: s.name, min: s.min, price: s.price, online: i === 0 })),
  ]);
  const [appts, setAppts] = useState<Appt[]>(() => seed.map((a, i) => ({ id: `a${i}`, customer: a.customer, service: `s${a.service}`, stylist: a.stylist, time: a.time, status: i < 2 ? 'arrived' : 'confirmed' })));
  const [customers, setCustomers] = useState<Customer[]>(() => D.customers.map((c, i) => ({
    id: `c${i}`, name: c.name, phone: c.phone, visits: c.visits, lastDays: c.lastDays, spent: c.spent, fav: `s${c.fav}`, note: c.note,
    history: Array.from({ length: Math.min(c.visits, 4) }, (_, j) => ({ daysAgo: c.lastDays + j * 27, service: j % 2 ? `s${(c.fav + 1) % 4}` : `s${c.fav}` })),
  })));

  // tab-local state lives here so it survives re-renders
  const [form, setForm] = useState({ customer: '', service: services[0].id, stylist: 0, time: '12:00' });
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState({ name: '', phone: '' });
  const [nw, setNw] = useState({ name: '', min: '45', price: '' });
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState({ service: '', stylist: -1, time: '' });
  const [who, setWho] = useState({ name: '', phone: '' });

  const svc = (id: string) => services.find((s) => s.id === id);
  const price = (id: string) => svc(id)?.price ?? 0;
  const at = (stylist: number, time: string) => appts.find((a) => a.stylist === stylist && a.time === time);
  const dayFmt = (daysAgo: number) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }); };

  const addAppt = (a: { customer: string; service: string; stylist: number; time: string; phone?: string }) => {
    if (at(a.stylist, a.time)) return false;
    setAppts((p) => [...p, { id: uid(), customer: a.customer, service: a.service, stylist: a.stylist, time: a.time, status: 'confirmed' }]);
    setCustomers((p) => p.some((c) => c.name.toLowerCase() === a.customer.toLowerCase()) ? p
      : [{ id: uid(), name: a.customer, phone: a.phone ?? '', visits: 0, lastDays: null, spent: 0, fav: a.service, note: '', history: [] }, ...p]);
    return true;
  };

  /* ---------------- Calendar ---------------- */
  const calendarTab = () => {
    const live = appts.filter((a) => a.status !== 'noShow');
    const revenue = live.reduce((s, a) => s + price(a.service), 0);
    const free = STYLISTS.length * HOURS.length - appts.length;
    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.customer.trim()) return;
      if (!addAppt({ ...form, customer: form.customer.trim() })) return toast.show(k.slotTaken, true);
      setForm({ ...form, customer: '' });
      toast.show(k.emailSent);
    };
    const cycle = (a: Appt) => setAppts((p) => p.map((q) => q.id === a.id ? { ...q, status: STATUSES[(STATUSES.indexOf(q.status) + 1) % 3] } : q));
    const tone = (s: Status) => s === 'arrived' ? 'success' : s === 'noShow' ? 'neutral' : 'lime';
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label={k.today} value={appts.length} accent />
          <Stat label={k.revenue} value={formatMoney(revenue, lang)} />
          <Stat label={k.free} value={free} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel title={k.today} className="lg:col-span-2">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full min-w-[560px] text-sm border-separate" style={{ borderSpacing: '4px' }}>
                <thead>
                  <tr>
                    <th className="text-left text-[11px] font-semibold w-14" style={muted}>{k.time}</th>
                    {STYLISTS.map((s) => <th key={s} className="text-left text-xs font-bold" style={strong}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((h) => (
                    <tr key={h}>
                      <td className="text-xs font-mono" style={muted}>{h}</td>
                      {STYLISTS.map((_, si) => {
                        const a = at(si, h);
                        return (
                          <td key={si} className="align-top">
                            {a ? (
                              <div className="rounded-lg px-2.5 py-1.5 relative" style={{ background: a.status === 'noShow' ? 'var(--color-feature-error-soft)' : 'var(--color-lime-soft)', border: `1px solid ${a.status === 'noShow' ? 'var(--color-feature-error)' : 'var(--color-lime-300)'}` }}>
                                <button type="button" aria-label={u.remove} title={u.remove}
                                  onClick={() => { setAppts((p) => p.filter((q) => q.id !== a.id)); toast.show(u.apptRemoved); }}
                                  className="absolute top-0.5 right-1 text-sm leading-none px-1" style={muted}>×</button>
                                <span className="block text-xs font-bold truncate pr-4" style={strong}>{a.customer}</span>
                                <span className="block text-[11px] truncate mb-1" style={muted}>{svc(a.service)?.name}</span>
                                <button type="button" title={u.statusHint} onClick={() => cycle(a)}><Pill tone={tone(a.status)}>{u.status[a.status]}</Pill></button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => setForm({ ...form, stylist: si, time: h })}
                                className="w-full rounded-lg px-2.5 py-1.5 text-[11px] text-left" style={{ border: '1px dashed var(--color-border-card)', ...muted }}>+</button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title={k.newAppt}>
            <form onSubmit={submit} className="space-y-3">
              <Label text={k.customer}>
                <input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className={inputCls} style={field} maxLength={40} list="kf-customers" />
                <datalist id="kf-customers">{customers.map((c) => <option key={c.id} value={c.name} />)}</datalist>
              </Label>
              <Label text={k.service}>
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className={inputCls} style={field}>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {formatMoney(s.price, lang)}</option>)}
                </select>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Label text={k.stylist}>
                  <select value={form.stylist} onChange={(e) => setForm({ ...form, stylist: Number(e.target.value) })} className={inputCls} style={field}>
                    {STYLISTS.map((s, i) => <option key={s} value={i}>{s}</option>)}
                  </select>
                </Label>
                <Label text={k.time}>
                  <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} style={field}>
                    {HOURS.map((h) => <option key={h} value={h}>{h}{at(form.stylist, h) ? ` · ${k.booked}` : ''}</option>)}
                  </select>
                </Label>
              </div>
              <PrimaryBtn type="submit" disabled={!form.customer.trim()}>{t.save}</PrimaryBtn>
            </form>
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--color-border-card)' }}>
              <p className="text-xs font-bold mb-3" style={strong}>{x.remind}</p>
              <ul className="space-y-1.5 max-h-56 overflow-y-auto">
                {[...appts].sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono w-11" style={muted}>{a.time}</span>
                    <span className="flex-1 truncate font-semibold" style={strong}>{a.customer}</span>
                    <a target="_blank" rel="noopener noreferrer"
                      href={`https://wa.me/?text=${encodeURIComponent(fill(x.remindText, { name: a.customer, service: svc(a.service)?.name ?? '', time: a.time }))}`}
                      className="rounded-md px-2 py-1 font-bold" style={{ background: 'var(--color-lime-soft)', ...strong }}>WhatsApp ↗</a>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>
    );
  };

  /* ---------------- Customers ---------------- */
  const customersTab = () => {
    const list = customers.filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()));
    const open = customers.find((c) => c.id === openId);
    const addCustomer = (e: React.FormEvent) => {
      e.preventDefault();
      if (!adding.name.trim()) return;
      setCustomers((p) => [{ id: uid(), name: adding.name.trim(), phone: adding.phone.trim(), visits: 0, lastDays: null, spent: 0, fav: 's0', note: '', history: [] }, ...p]);
      setAdding({ name: '', phone: '' });
      toast.show(u.clientAdded);
    };
    const book = (c: Customer) => {
      for (let si = 0; si < STYLISTS.length; si++) for (const h of HOURS) {
        if (!at(si, h)) { addAppt({ customer: c.name, service: c.fav, stylist: si, time: h, phone: c.phone }); return toast.show(fill(u.booked, { time: h, stylist: STYLISTS[si] })); }
      }
      toast.show(u.fullDay, true);
    };
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel title={u.tabs.customers} className="xl:col-span-2" action={<Pill>{list.length}</Pill>}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={u.searchClients} className={`${inputCls} mb-3`} style={field} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold" style={muted}>
                  <th className="py-2">{u.name}</th><th>{u.phone}</th><th>{u.visits}</th><th>{u.lastVisit}</th><th>{u.spent}</th><th>{u.favourite}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer" style={{ borderTop: '1px solid var(--color-border-card)', background: c.id === openId ? 'var(--color-lime-soft)' : 'transparent' }}>
                    <td className="py-2 pr-3"><span className="flex items-center gap-2"><Avatar name={c.name} size={28} /><span className="font-semibold whitespace-nowrap" style={strong}>{c.name}</span></span></td>
                    <td className="pr-3 whitespace-nowrap text-xs" style={muted}>{c.phone || '—'}</td>
                    <td className="pr-3" style={strong}>{c.visits}</td>
                    <td className="pr-3 text-xs whitespace-nowrap" style={muted}>{c.lastDays === null ? '—' : dayFmt(c.lastDays)}</td>
                    <td className="pr-3 font-semibold whitespace-nowrap" style={strong}>{formatMoney(c.spent, lang)}</td>
                    <td className="text-xs whitespace-nowrap" style={muted}>{svc(c.fav)?.name}</td>
                  </tr>
                ))}
                {!list.length && <tr><td colSpan={6} className="py-6 text-center text-xs" style={muted}>{u.noResults}</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-5">
          {open ? (
            <Panel title={open.name} action={<GhostBtn onClick={() => setOpenId(null)}>{u.close}</GhostBtn>}>
              <p className="text-xs mb-3" style={muted}>{open.phone || '—'} · {open.visits} {u.visits.toLowerCase()} · {formatMoney(open.spent, lang)}</p>
              <p className="text-xs font-bold mb-2" style={strong}>{u.history}</p>
              <ul className="space-y-1.5 mb-4">
                {open.history.map((h, i) => (
                  <li key={i} className="flex justify-between text-xs rounded-lg px-2.5 py-1.5" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)' }}>
                    <span className="font-semibold" style={strong}>{svc(h.service)?.name}</span>
                    <span style={muted}>{dayFmt(h.daysAgo)} · {formatMoney(price(h.service), lang)}</span>
                  </li>
                ))}
                {!open.history.length && <li className="text-xs" style={muted}>{u.noHistory}</li>}
              </ul>
              <Label text={u.note}>
                <textarea rows={3} value={open.note} placeholder={u.notePlaceholder} className={inputCls} style={field}
                  onChange={(e) => setCustomers((p) => p.map((c) => c.id === open.id ? { ...c, note: e.target.value } : c))} />
              </Label>
              <div className="flex gap-2 mt-3 flex-wrap">
                <GhostBtn onClick={() => toast.show(u.noteSaved)}>{u.saveNote}</GhostBtn>
                <PrimaryBtn onClick={() => book(open)}>{u.bookAppt}</PrimaryBtn>
              </div>
            </Panel>
          ) : null}
          <Panel title={u.addClient}>
            <form onSubmit={addCustomer} className="space-y-3">
              <Label text={u.name}><input value={adding.name} onChange={(e) => setAdding({ ...adding, name: e.target.value })} className={inputCls} style={field} maxLength={40} /></Label>
              <Label text={u.phone}><input value={adding.phone} onChange={(e) => setAdding({ ...adding, phone: e.target.value })} className={inputCls} style={field} maxLength={24} inputMode="tel" /></Label>
              <PrimaryBtn type="submit" disabled={!adding.name.trim()}>{t.add}</PrimaryBtn>
            </form>
          </Panel>
        </div>
      </div>
    );
  };

  /* ---------------- Services ---------------- */
  const servicesTab = () => {
    const upd = (id: string, patch: Partial<Service>) => setServices((p) => p.map((s) => s.id === id ? { ...s, ...patch } : s));
    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!nw.name.trim()) return;
      setServices((p) => [...p, { id: uid(), name: nw.name.trim(), min: num(nw.min) || 30, price: num(nw.price), online: true }]);
      setNw({ name: '', min: '45', price: '' });
      toast.show(u.serviceAdded);
    };
    const mini = 'rounded-lg px-2 py-1.5 text-sm outline-none w-20';
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel title={u.tabs.services} className="xl:col-span-2">
          <p className="text-xs mb-3" style={muted}>{u.editHint}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-[11px] font-semibold" style={muted}><th className="py-2">{k.service}</th><th>{u.duration} ({u.min})</th><th>{u.price}</th><th>{u.bookableOnline}</th></tr></thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--color-border-card)' }}>
                    <td className="py-2 pr-3 font-semibold" style={strong}>{s.name}</td>
                    <td className="pr-3"><input value={s.min} inputMode="numeric" aria-label={u.duration} onChange={(e) => upd(s.id, { min: num(e.target.value) })} onBlur={() => toast.show(u.priceSaved)} className={mini} style={field} /></td>
                    <td className="pr-3"><input value={s.price} inputMode="numeric" aria-label={u.price} onChange={(e) => upd(s.id, { price: num(e.target.value) })} onBlur={() => toast.show(u.priceSaved)} className={mini} style={field} /></td>
                    <td>
                      <button type="button" role="switch" aria-checked={s.online} aria-label={u.bookableOnline} onClick={() => upd(s.id, { online: !s.online })}
                        className="w-10 h-6 rounded-full relative transition-colors" style={{ background: s.online ? 'var(--color-feature-success)' : 'var(--color-border-card)' }}>
                        <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all" style={{ left: s.online ? 18 : 2, background: 'var(--color-surface-raised)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title={u.addService}>
          <form onSubmit={submit} className="space-y-3">
            <Label text={u.serviceName}><input value={nw.name} onChange={(e) => setNw({ ...nw, name: e.target.value })} className={inputCls} style={field} maxLength={40} /></Label>
            <div className="grid grid-cols-2 gap-3">
              <Label text={`${u.duration} (${u.min})`}><input value={nw.min} inputMode="numeric" onChange={(e) => setNw({ ...nw, min: e.target.value })} className={inputCls} style={field} /></Label>
              <Label text={u.price}><input value={nw.price} inputMode="numeric" onChange={(e) => setNw({ ...nw, price: e.target.value })} className={inputCls} style={field} /></Label>
            </div>
            <PrimaryBtn type="submit" disabled={!nw.name.trim()}>{t.add}</PrimaryBtn>
          </form>
        </Panel>
      </div>
    );
  };

  /* ---------------- Online booking ---------------- */
  const bookingTab = () => {
    const online = services.filter((s) => s.online);
    const freeSlots = sel.stylist < 0 ? [] : HOURS.filter((h) => !at(sel.stylist, h));
    const reset = () => { setStep(0); setSel({ service: '', stylist: -1, time: '' }); setWho({ name: '', phone: '' }); };
    const confirm = (e: React.FormEvent) => {
      e.preventDefault();
      if (!who.name.trim() || !addAppt({ customer: who.name.trim(), phone: who.phone.trim(), service: sel.service, stylist: sel.stylist, time: sel.time })) return toast.show(k.slotTaken, true);
      setStep(4);
      toast.show(u.confirmToast);
    };
    const opt = (on: boolean): React.CSSProperties => ({ background: on ? 'var(--color-lime-soft)' : 'var(--background)', border: `1px solid ${on ? 'var(--color-lime-300)' : 'var(--color-border-card)'}`, ...strong });
    const titles = [u.stepService, u.stepStylist, u.stepTime, u.stepDetails];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 flex flex-col items-center">
          <p className="text-xs mb-3" style={muted}>{u.previewTitle}</p>
          <div className="w-full max-w-[340px] rounded-[2rem] p-2.5" style={{ background: 'var(--color-ink-strongest)' }}>
            <div className="rounded-[1.5rem] overflow-hidden min-h-[460px] flex flex-col" style={{ background: 'var(--background)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border-card)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black" style={{ background: 'var(--color-ink-strongest)', color: 'var(--color-lime-300)' }}>{D.brand.initials}</span>
                <span className="text-sm font-bold truncate" style={strong}>{D.brand.name}</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                {step < 4 ? (
                  <>
                    <div className="flex gap-1 mb-3">{[0, 1, 2, 3].map((i) => <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= step ? 'var(--color-lime-300)' : 'var(--color-border-card)' }} />)}</div>
                    <h4 className="text-sm font-bold mb-3" style={strong}>{titles[step]}</h4>
                    <div className="flex-1">
                      {step === 0 && (
                        <ul className="space-y-2">
                          {online.map((s) => (
                            <li key={s.id}><button type="button" onClick={() => { setSel({ ...sel, service: s.id }); setStep(1); }} className="w-full rounded-xl px-3 py-2.5 text-left flex justify-between gap-2 text-sm" style={opt(sel.service === s.id)}>
                              <span><span className="block font-semibold">{s.name}</span><span className="block text-[11px]" style={muted}>{s.min} {u.min}</span></span>
                              <span className="font-bold">{formatMoney(s.price, lang)}</span>
                            </button></li>
                          ))}
                        </ul>
                      )}
                      {step === 1 && (
                        <ul className="space-y-2">
                          {STYLISTS.map((s, i) => (
                            <li key={s}><button type="button" onClick={() => { setSel({ ...sel, stylist: i, time: '' }); setStep(2); }} className="w-full rounded-xl px-3 py-2.5 text-left flex items-center gap-3 text-sm font-semibold" style={opt(sel.stylist === i)}><Avatar name={s} size={30} />{s}</button></li>
                          ))}
                        </ul>
                      )}
                      {step === 2 && (freeSlots.length ? (
                        <>
                          <p className="text-[11px] mb-2" style={muted}>{u.today}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {freeSlots.map((h) => <button key={h} type="button" onClick={() => { setSel({ ...sel, time: h }); setStep(3); }} className="rounded-lg py-2 text-sm font-mono font-semibold" style={opt(sel.time === h)}>{h}</button>)}
                          </div>
                        </>
                      ) : <p className="text-xs" style={muted}>{u.noSlots}</p>)}
                      {step === 3 && (
                        <form id="kf-book" onSubmit={confirm} className="space-y-3">
                          <p className="text-xs rounded-lg px-3 py-2" style={opt(true)}>{svc(sel.service)?.name} · {STYLISTS[sel.stylist]} · {sel.time}</p>
                          <Label text={u.yourName}><input value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} className={inputCls} style={field} maxLength={40} /></Label>
                          <Label text={u.yourPhone}><input value={who.phone} onChange={(e) => setWho({ ...who, phone: e.target.value })} className={inputCls} style={field} inputMode="tel" maxLength={24} /></Label>
                        </form>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      {step > 0 && <GhostBtn onClick={() => setStep(step - 1)}>{u.back}</GhostBtn>}
                      {step === 3 && <button type="submit" form="kf-book" disabled={!who.name.trim()} className="flex-1 rounded-lg px-4 py-2 text-sm font-bold" style={{ background: 'var(--color-lime-300)', ...strong, opacity: who.name.trim() ? 1 : 0.5 }}>{u.confirmBooking}</button>}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--color-feature-success)', color: 'var(--color-surface-raised)' }}><Icon name="check" size={28} /></span>
                    <h4 className="text-base font-bold" style={strong}>{u.doneTitle}</h4>
                    <p className="text-xs" style={muted}>{fill(u.doneText, { service: svc(sel.service)?.name ?? '', stylist: STYLISTS[sel.stylist], time: sel.time })}</p>
                    <GhostBtn onClick={reset}>{u.newBooking}</GhostBtn>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Panel title={u.qrTitle} className="lg:col-span-2 self-start">
          <div className="flex flex-col items-center text-center gap-3">
            <QrImage value={D.bookUrl} size={180} label={u.qrLabel} />
            <p className="text-xs break-all font-mono" style={muted}>{D.bookUrl}</p>
            <p className="text-sm" style={strong}>{u.qrCaption}</p>
          </div>
        </Panel>
      </div>
    );
  };

  /* ---------------- Reports ---------------- */
  const reportsTab = () => {
    const todayIdx = (new Date().getDay() + 6) % 7;
    const live = appts.filter((a) => a.status !== 'noShow').reduce((s, a) => s + price(a.service), 0);
    const monday = new Date(2024, 0, 1);
    const days = Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * 864e5).toLocaleDateString(locale, { weekday: 'short' }));
    const week = D.weekRevenue.map((v, i) => ({ label: days[i], value: i === todayIdx ? live : v || Math.round(D.weekRevenue[0] * 0.7) }));
    const counts = services.map((s, i) => ({ label: s.name, value: (D.serviceCounts[i] ?? 6) + appts.filter((a) => a.service === s.id).length }))
      .sort((a, b) => b.value - a.value).slice(0, 5);
    const missed = D.noShow.missed + appts.filter((a) => a.status === 'noShow').length;
    const rate = Math.round((missed / (D.noShow.total + appts.length)) * 1000) / 10;
    const newCount = D.newCustomers + customers.filter((c) => c.visits === 0).length;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label={u.noShowRate} value={`${rate.toLocaleString(locale)} %`} accent />
          <Stat label={u.newClients} value={newCount} />
          <Stat label={u.returningClients} value={D.returning} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel title={u.weekRevenue} className="lg:col-span-2"><BarChart data={week} format={(n) => formatMoney(n, lang)} highlightLast={false} /></Panel>
          <Panel title={u.topServices} action={<span className="text-[11px]" style={muted}>{u.last30}</span>}><RankList items={counts} format={(n) => `${n} ${u.appts}`} /></Panel>
        </div>
      </div>
    );
  };

  const todayCount = appts.length;
  return (
    <>
      <AppShell lang={lang} brand={D.brand} user={D.user} searchPlaceholder={u.searchPlaceholder} notificationsTitle={u.notifTitle} notifications={D.notifications}
        tabs={[
          { key: 'calendar', label: u.tabs.calendar, icon: 'calendar', badge: todayCount, render: () => calendarTab() },
          { key: 'customers', label: u.tabs.customers, icon: 'users', render: () => customersTab() },
          { key: 'services', label: u.tabs.services, icon: 'scissors', render: () => servicesTab() },
          { key: 'booking', label: u.tabs.booking, icon: 'globe', render: () => bookingTab() },
          { key: 'reports', label: u.tabs.reports, icon: 'chart', render: () => reportsTab() },
        ]} />
      {toast.node}
    </>
  );
}
