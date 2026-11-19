import { useMemo, useState } from 'react';
import type { Lang } from '../../translations';
import { useMoneyFormatter } from '../../lib/currency';
import { fill } from '../../lib/demoAccess';
import AppShell, { Avatar, BarChart, RankList } from './AppShell';
import { Stat, Panel, Label, PrimaryBtn, GhostBtn, Pill, field, inputCls, useToast, uid, type DemoProps } from './ui';
import { KLINIK_UI } from './i18n/klinik';
import { KLINIK_MARKET, klinikPatients } from './data/klinik';

const LOCALES: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };
const DAY = 86400000;

interface Patient { id: string; name: string; age: number; phone: string; ins: 0 | 1; complaint: string; notes: string; allergies: string; meds: string; lastVisit: number; history: { d: number; r: string }[] }
interface QueueItem { patientId: string; status: 0 | 1 | 2 }
interface Appt { id: string; doc: number; day: number; slot: number; p: string; reason: string; sent: boolean }
interface Invoice { id: string; no: string; p: string; date: number; amt: number; st: 0 | 1 | 2; paidAt?: number }

const SLOTS = Array.from({ length: 18 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

export default function KlinikDemo({ lang, t }: DemoProps) {
  const u = KLINIK_UI[lang];
  const m = KLINIK_MARKET[lang];
  const loc = LOCALES[lang];
  const formatMoney = useMoneyFormatter();
  const toast = useToast();
  const now = useMemo(() => Date.now(), []);
  const fmt = (ts: number) => new Date(ts).toLocaleDateString(loc);

  const [patients, setPatients] = useState<Patient[]>(() => klinikPatients(lang).map(({ lastDays, ...p }) => ({ ...p, lastVisit: now - lastDays * DAY })));
  const [queue, setQueue] = useState<QueueItem[]>([{ patientId: 'p2', status: 1 }, { patientId: 'p4', status: 0 }, { patientId: 'p1', status: 2 }, { patientId: 'p6', status: 0 }]);
  const [appts, setAppts] = useState<Appt[]>(() => m.appts.map((a) => ({ id: uid(), doc: a.doc, day: a.day, slot: a.slot, p: a.p, sent: a.sent, reason: klinikPatients(lang).find((p) => p.id === a.p)?.complaint ?? '' })));
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const dom = new Date(now).getDate();
    return m.invoices.map((i, n) => {
      const d = i.st === 1 ? Math.min(i.d, dom - 1) : i.d;
      return { id: uid(), no: `${m.invPrefix}-${String(n + 1).padStart(4, '0')}`, p: i.p, date: now - d * DAY, amt: i.amt, st: i.st, paidAt: i.st === 1 ? now - d * DAY : undefined };
    });
  });
  const nameOf = (id: string) => patients.find((p) => p.id === id)?.name ?? '—';
  const waiting = queue.filter((x) => x.status === 0).length;

  const addPatient = (f: { name: string; age: string; phone: string; ins: 0 | 1; complaint: string }) => {
    const p: Patient = { id: uid(), name: f.name.trim(), age: Number(f.age) || 0, phone: f.phone.trim(), ins: f.ins, complaint: f.complaint.trim(), notes: '', allergies: '—', meds: '—', lastVisit: now, history: [] };
    setPatients((ps) => [p, ...ps]);
    toast.show(u.patientAdded);
    return p.id;
  };
  const setNotes = (id: string, notes: string) => setPatients((ps) => ps.map((p) => (p.id === id ? { ...p, notes } : p)));

  const tabs = [
    {
      key: 'today', label: u.tabs.today, icon: 'home' as const, badge: waiting,
      render: () => <TodayTab {...{ lang, t, u, patients, queue, setQueue, appts, fmt, addPatient, setNotes, toast, nameOf }} />,
    },
    { key: 'appts', label: u.tabs.appointments, icon: 'calendar' as const, render: () => <ApptTab {...{ u, m, loc, now, patients, appts, setAppts, toast, nameOf }} /> },
    { key: 'patients', label: u.tabs.patients, icon: 'users' as const, render: () => <PatientsTab {...{ lang, t, u, patients, fmt, loc, now, addPatient, setNotes }} /> },
    { key: 'invoices', label: u.tabs.invoices, icon: 'file' as const, render: () => <InvoicesTab {...{ u, m, patients, invoices, setInvoices, fmt, formatMoney, toast, nameOf, now }} /> },
    { key: 'reports', label: u.tabs.reports, icon: 'chart' as const, render: () => <ReportsTab {...{ u, m, loc, now }} /> },
  ];

  return (
    <>
      <AppShell lang={lang} brand={m.brand} user={m.user} tabs={tabs} searchPlaceholder={u.searchPlaceholder} notificationsTitle={u.notifTitle} notifications={m.notifications} />
      {toast.node}
    </>
  );
}

type U = (typeof KLINIK_UI)[Lang];
type Toast = ReturnType<typeof useToast>;
type AddFn = (f: { name: string; age: string; phone: string; ins: 0 | 1; complaint: string }) => string;

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--background)' }}>
      <p className="text-[11px] font-semibold" style={{ color: 'var(--color-ink-muted)' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{value}</p>
    </div>
  );
}

function PatientDetail({ p, u, t, fmt, loc, now, onNotes, extra }: { p: Patient; u: U; t: DemoProps['t']; fmt: (n: number) => string; loc?: string; now?: number; onNotes: (v: string) => void; extra?: React.ReactNode }) {
  const k = t.klinik;
  let birth = '—';
  if (p.age && now && loc) {
    const d = new Date(now);
    const bd = new Date(d.getFullYear() - p.age, (p.id.length * 5 + p.age) % 12, 3 + (p.age % 24));
    if (new Date(d.getFullYear(), bd.getMonth(), bd.getDate()).getTime() > now) bd.setFullYear(bd.getFullYear() - 1);
    birth = bd.toLocaleDateString(loc);
  }
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <Info label={u.birth} value={`${birth}${p.age ? ` (${p.age})` : ''}`} />
        <Info label={u.phone} value={p.phone || '—'} />
        <Info label={u.insurance} value={u.ins[p.ins]} />
        <Info label={k.lastVisit} value={fmt(p.lastVisit)} />
      </div>
      <Info label={k.complaint} value={p.complaint || '—'} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info label={u.allergies} value={p.allergies} />
        <Info label={u.meds} value={p.meds} />
      </div>
      {p.history.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--color-ink-muted)' }}>{u.history}</p>
          <ul className="space-y-1">
            {p.history.map((h, i) => (
              <li key={i} className="flex justify-between gap-2 text-xs rounded-lg px-3 py-2" style={{ border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strongest)' }}>
                <span>{h.r}</span><span style={{ color: 'var(--color-ink-muted)' }}>{fmt((now ?? Date.now()) - h.d * DAY)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Label text={k.notes}>
        <textarea rows={3} value={p.notes} onChange={(e) => onNotes(e.target.value)} className={inputCls} style={{ ...field, resize: 'vertical' }} maxLength={500} />
      </Label>
      {extra}
    </div>
  );
}

function NewPatientForm({ u, t, onAdd, onDone }: { u: U; t: DemoProps['t']; onAdd: AddFn; onDone: (id: string) => void }) {
  const k = t.klinik;
  const [f, setF] = useState({ name: '', age: '', phone: '', ins: 0 as 0 | 1, complaint: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (f.name.trim()) onDone(onAdd(f)); }} className="space-y-2 mb-4 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
      <Label text={k.name}><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} style={field} maxLength={60} /></Label>
      <div className="grid grid-cols-2 gap-2">
        <Label text={k.age}><input inputMode="numeric" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value.replace(/\D/g, '').slice(0, 3) })} className={inputCls} style={field} /></Label>
        <Label text={u.insurance}>
          <select value={f.ins} onChange={(e) => setF({ ...f, ins: Number(e.target.value) as 0 | 1 })} className={inputCls} style={field}>
            {u.ins.map((x, i) => <option key={x} value={i}>{x}</option>)}
          </select>
        </Label>
      </div>
      <Label text={u.phone}><input inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/[^\d+ ]/g, '').slice(0, 20) })} className={inputCls} style={field} /></Label>
      <Label text={k.complaint}><input value={f.complaint} onChange={(e) => setF({ ...f, complaint: e.target.value })} className={inputCls} style={field} maxLength={60} /></Label>
      <PrimaryBtn type="submit" disabled={!f.name.trim()}>{t.save}</PrimaryBtn>
    </form>
  );
}

function TodayTab({ t, u, patients, queue, setQueue, appts, fmt, addPatient, setNotes, toast, nameOf }: {
  lang: Lang; t: DemoProps['t']; u: U; patients: Patient[]; queue: QueueItem[]; setQueue: (q: QueueItem[]) => void; appts: Appt[];
  fmt: (n: number) => string; addPatient: AddFn; setNotes: (id: string, v: string) => void; toast: Toast; nameOf: (id: string) => string;
}) {
  const k = t.klinik;
  const [selected, setSelected] = useState<string | null>('p2');
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const filtered = patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const current = patients.find((p) => p.id === selected);
  const inQueue = (id: string) => queue.some((x) => x.patientId === id);
  const dow = (new Date().getDay() + 6) % 7;
  const cycle = (id: string) => setQueue(queue.map((x) => (x.patientId === id ? { ...x, status: ((x.status + 1) % 3) as 0 | 1 | 2 } : x)));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label={k.queue} value={queue.length} accent />
        <Stat label={u.waiting} value={queue.filter((x) => x.status === 0).length} />
        <Stat label={u.seenToday} value={queue.filter((x) => x.status === 2).length} />
        <Stat label={u.apptToday} value={appts.filter((a) => a.day === dow).length} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel title={k.patients} action={<GhostBtn onClick={() => setAdding(!adding)}>{adding ? t.cancel : `+ ${k.newPatient}`}</GhostBtn>}>
          {adding && <NewPatientForm u={u} t={t} onAdd={addPatient} onDone={(id) => { setQueue([...queue, { patientId: id, status: 0 }]); setSelected(id); setAdding(false); }} />}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className={`${inputCls} mb-3`} style={field} />
          <ul className="space-y-1.5 max-h-80 overflow-y-auto">
            {filtered.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => setSelected(p.id)} className="w-full text-left rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
                  style={{ background: selected === p.id ? 'var(--color-lime-soft)' : 'transparent', border: `1px solid ${selected === p.id ? 'var(--color-lime-300)' : 'var(--color-border-card)'}` }}>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{p.name}</span>
                    <span className="block text-[11px] truncate" style={{ color: 'var(--color-ink-muted)' }}>{p.complaint || '—'}</span>
                  </span>
                  {inQueue(p.id) && <Pill tone="lime">{k.inQueue}</Pill>}
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{u.noResults}</li>}
          </ul>
        </Panel>

        <Panel title={current ? current.name : k.patients}>
          {current ? (
            <PatientDetail p={current} u={u} t={t} fmt={fmt} onNotes={(v) => setNotes(current.id, v)}
              extra={!inQueue(current.id) && <PrimaryBtn onClick={() => { setQueue([...queue, { patientId: current.id, status: 0 }]); toast.show(t.saved); }}>{k.addToQueue}</PrimaryBtn>} />
          ) : <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{k.select}</p>}
        </Panel>

        <Panel title={k.queue}>
          <ol className="space-y-2">
            {queue.map((x, i) => (
              <li key={x.patientId} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ border: '1px solid var(--color-border-card)', opacity: x.status === 2 ? 0.6 : 1 }}>
                <span className="w-6 h-6 shrink-0 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: 'var(--background)', color: 'var(--color-ink-muted)' }}>{i + 1}</span>
                <span className="flex-1 text-sm font-semibold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{nameOf(x.patientId)}</span>
                <button type="button" onClick={() => cycle(x.patientId)}>
                  <Pill tone={x.status === 1 ? 'lime' : x.status === 2 ? 'success' : 'neutral'}>{k.statuses[x.status]}</Pill>
                </button>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}

function ApptTab({ u, m, loc, now, patients, appts, setAppts, toast, nameOf }: {
  u: U; m: (typeof KLINIK_MARKET)[Lang]; loc: string; now: number; patients: Patient[]; appts: Appt[]; setAppts: (f: (a: Appt[]) => Appt[]) => void; toast: Toast; nameOf: (id: string) => string;
}) {
  const [doc, setDoc] = useState(0);
  const [sel, setSel] = useState<{ day: number; slot: number } | null>(null);
  const [pid, setPid] = useState('');
  const [reason, setReason] = useState('');
  const dow = (new Date(now).getDay() + 6) % 7;
  const monday = now - dow * DAY;
  const days = [0, 1, 2, 3, 4].map((i) => new Date(monday + i * DAY).toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'numeric' }));
  const find = (day: number, slot: number) => appts.find((a) => a.doc === doc && a.day === day && a.slot === slot);
  const cur = sel ? find(sel.day, sel.slot) : undefined;

  const book = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel || !pid) return;
    setAppts((a) => [...a, { id: uid(), doc, day: sel.day, slot: sel.slot, p: pid, reason: reason.trim(), sent: false }]);
    toast.show(u.booked); setSel(null); setPid(''); setReason('');
  };

  return (
    <div className="space-y-4">
      <Panel title={u.week} action={
        <div className="flex gap-1.5">
          {m.doctors.map((d, i) => (
            <button key={d} type="button" onClick={() => { setDoc(i); setSel(null); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ background: doc === i ? 'var(--color-lime-300)' : 'transparent', color: 'var(--color-ink-strongest)', border: `1px solid ${doc === i ? 'var(--color-lime-300)' : 'var(--color-border-card)'}` }}>{d}</button>
          ))}
        </div>
      }>
        <p className="text-xs mb-3" style={{ color: 'var(--color-ink-muted)' }}>{u.hint}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate" style={{ borderSpacing: 3 }}>
            <thead>
              <tr>
                <th className="w-14" />
                {days.map((d, i) => <th key={d} className="text-[11px] font-semibold pb-1" style={{ color: i === dow ? 'var(--color-ink-strongest)' : 'var(--color-ink-muted)' }}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((s, si) => (
                <tr key={s}>
                  <td className="text-[11px] text-right pr-1" style={{ color: 'var(--color-ink-muted)' }}>{s}</td>
                  {days.map((_, di) => {
                    const a = find(di, si);
                    const on = sel?.day === di && sel.slot === si;
                    return (
                      <td key={di}>
                        <button type="button" onClick={() => { setSel({ day: di, slot: si }); setPid(''); setReason(''); }} className="w-full h-8 rounded-md px-1 text-[11px] font-semibold truncate"
                          style={a
                            ? { background: 'var(--color-ink-strongest)', color: 'var(--background)', outline: on ? '2px solid var(--color-lime-300)' : 'none' }
                            : { background: on ? 'var(--color-lime-soft)' : 'var(--background)', color: 'var(--color-ink-muted)', border: `1px solid ${on ? 'var(--color-lime-300)' : 'var(--color-border-card)'}` }}>
                          {a ? nameOf(a.p).split(' ').slice(-1)[0] : ''}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {sel && (
        <Panel title={`${days[sel.day]} · ${SLOTS[sel.slot]} · ${m.doctors[doc]}`} action={<GhostBtn onClick={() => setSel(null)}>{u.close}</GhostBtn>}>
          {cur ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={nameOf(cur.p)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{nameOf(cur.p)}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-ink-muted)' }}>{cur.reason || '—'}</p>
                </div>
                <Pill tone={cur.sent ? 'success' : 'neutral'}>{cur.sent ? u.remSent : u.remScheduled}</Pill>
              </div>
              <div className="flex flex-wrap gap-2">
                {!cur.sent && <GhostBtn onClick={() => { setAppts((a) => a.map((x) => (x.id === cur.id ? { ...x, sent: true } : x))); toast.show(u.remindToast); }}>{u.sendNow}</GhostBtn>}
                <PrimaryBtn onClick={() => { setAppts((a) => a.filter((x) => x.id !== cur.id)); setSel(null); toast.show(u.cancelled); }}>{u.cancelAppt}</PrimaryBtn>
              </div>
            </div>
          ) : (
            <form onSubmit={book} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <Label text={u.patient}>
                <select value={pid} onChange={(e) => { setPid(e.target.value); setReason(patients.find((p) => p.id === e.target.value)?.complaint ?? ''); }} className={inputCls} style={field}>
                  <option value="">{u.pickPatient}</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Label>
              <Label text={u.reason}><input value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} style={field} maxLength={60} /></Label>
              <PrimaryBtn type="submit" disabled={!pid}>{u.book}</PrimaryBtn>
            </form>
          )}
        </Panel>
      )}
    </div>
  );
}

function PatientsTab({ t, u, patients, fmt, loc, now, addPatient, setNotes }: {
  lang: Lang; t: DemoProps['t']; u: U; patients: Patient[]; fmt: (n: number) => string; loc: string; now: number; addPatient: AddFn; setNotes: (id: string, v: string) => void;
}) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const list = patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q));
  const cur = patients.find((p) => p.id === sel);
  const th = 'text-left text-[11px] font-semibold px-3 py-2 whitespace-nowrap';
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
      <Panel className="xl:col-span-3" title={t.klinik.patients} action={<GhostBtn onClick={() => setAdding(!adding)}>{adding ? t.cancel : `+ ${u.newPatient}`}</GhostBtn>}>
        {adding && <NewPatientForm u={u} t={t} onAdd={addPatient} onDone={(id) => { setSel(id); setAdding(false); }} />}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className={`${inputCls} mb-3`} style={field} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead style={{ color: 'var(--color-ink-muted)' }}>
              <tr><th className={th}>{t.klinik.name}</th><th className={th}>{u.birth}</th><th className={th}>{u.phone}</th><th className={th}>{u.insurance}</th><th className={th}>{t.klinik.lastVisit}</th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} onClick={() => setSel(p.id)} className="cursor-pointer" style={{ background: sel === p.id ? 'var(--color-lime-soft)' : 'transparent', borderTop: '1px solid var(--color-border-card)' }}>
                  <td className="px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-strongest)' }}>{p.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{p.age ? `${p.age}` : '—'}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{p.phone || '—'}</td>
                  <td className="px-3 py-2.5"><Pill tone={p.ins ? 'lime' : 'neutral'}>{u.ins[p.ins]}</Pill></td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{fmt(p.lastVisit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="text-sm p-3" style={{ color: 'var(--color-ink-muted)' }}>{u.noResults}</p>}
        </div>
      </Panel>
      <Panel className="xl:col-span-2" title={cur ? cur.name : t.klinik.patients}>
        {cur ? <PatientDetail p={cur} u={u} t={t} fmt={fmt} loc={loc} now={now} onNotes={(v) => setNotes(cur.id, v)} />
          : <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{t.klinik.select}</p>}
      </Panel>
    </div>
  );
}

function InvoicesTab({ u, m, patients, invoices, setInvoices, fmt, formatMoney, toast, nameOf, now }: {
  u: U; m: (typeof KLINIK_MARKET)[Lang]; patients: Patient[]; invoices: Invoice[]; setInvoices: (f: (i: Invoice[]) => Invoice[]) => void;
  fmt: (n: number) => string; formatMoney: (n: number) => string; toast: Toast; nameOf: (id: string) => string; now: number;
}) {
  const month = new Date(now).getMonth();
  const open = invoices.filter((i) => i.st !== 1);
  const paid = invoices.filter((i) => i.st === 1 && i.paidAt && new Date(i.paidAt).getMonth() === month);
  const sum = (l: Invoice[]) => l.reduce((s, i) => s + i.amt, 0);
  const th = 'text-left text-[11px] font-semibold px-3 py-2 whitespace-nowrap';
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label={u.openTotal} value={formatMoney(sum(open))} accent />
        <Stat label={u.paidMonth} value={formatMoney(sum(paid))} />
        <Stat label={u.overdueCount} value={invoices.filter((i) => i.st === 2).length} />
      </div>
      <Panel title={u.tabs.invoices}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead style={{ color: 'var(--color-ink-muted)' }}>
              <tr><th className={th}>{u.invNo}</th><th className={th}>{u.patient}</th><th className={th}>{u.date}</th><th className={th}>{u.amount}</th><th className={th}>{u.insurance}</th><th className={th}>{u.status}</th><th className={th} /></tr>
            </thead>
            <tbody>
              {invoices.map((i) => {
                const p = patients.find((x) => x.id === i.p);
                const msg = fill(u.remindText, { name: nameOf(i.p), no: i.no, amount: formatMoney(i.amt), practice: m.brand.name });
                return (
                  <tr key={i.id} style={{ borderTop: '1px solid var(--color-border-card)' }}>
                    <td className="px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-strongest)' }}>{i.no}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--color-ink-strongest)' }}>{nameOf(i.p)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{fmt(i.date)}</td>
                    <td className="px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-strongest)' }}>{formatMoney(i.amt)}</td>
                    <td className="px-3 py-2.5"><Pill>{p ? u.ins[p.ins] : '—'}</Pill></td>
                    <td className="px-3 py-2.5">
                      {i.st === 2
                        ? <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap" style={{ background: 'var(--color-feature-error-soft)', color: 'var(--color-feature-error)' }}>{u.invStatus[2]}</span>
                        : <Pill tone={i.st === 1 ? 'success' : 'lime'}>{u.invStatus[i.st]}</Pill>}
                    </td>
                    <td className="px-3 py-2.5">
                      {i.st !== 1 && (
                        <div className="flex gap-1.5 justify-end">
                          <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" onClick={() => toast.show(u.remindToast)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strongest)' }}>{u.remind}</a>
                          <GhostBtn onClick={() => { setInvoices((l) => l.map((x) => (x.id === i.id ? { ...x, st: 1, paidAt: now } : x))); toast.show(u.paidToast); }}>{u.markPaid}</GhostBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--color-ink-muted)' }}>{u.taxNote}</p>
      </Panel>
    </div>
  );
}

function ReportsTab({ u, m, loc, now }: { u: U; m: (typeof KLINIK_MARKET)[Lang]; loc: string; now: number }) {
  const data = m.perDay.map((v, i) => ({ label: new Date(now - (6 - i) * DAY).toLocaleDateString(loc, { weekday: 'short' }), value: v }));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label={u.tabs.patients} value={m.perDay.reduce((a, b) => a + b, 0)} accent />
        <Stat label={u.noShow} value={`${m.noShow} %`} />
        <Stat label={u.avgWait} value={`${m.wait} ${u.min}`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Panel className="lg:col-span-3" title={u.perDay}><BarChart data={data} /></Panel>
        <Panel className="lg:col-span-2" title={u.topReasons}><RankList items={m.reasons} format={(n) => `${n} %`} /></Panel>
      </div>
    </div>
  );
}
