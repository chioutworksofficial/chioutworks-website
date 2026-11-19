import { useMemo, useState } from 'react';
import { useMoneyFormatter } from '../../lib/currency';
import { fill } from '../../lib/demoAccess';
import SiteShell from './SiteShell';
import { Icon, type IconName } from './AppShell';
import { Panel, Label, PrimaryBtn, GhostBtn, Pill, field, inputCls, useToast, uid, card, type DemoProps } from './ui';
import QrImage from './QrImage';
import { KAFE_UI } from './i18n/kafe';
import { KAFE_DATA, type Cat } from './data/kafe';

const LOCALES = { tr: 'tr-TR', de: 'de-DE', el: 'el-GR', en: 'en-GB' } as const;
const CATS: Cat[] = ['br', 'hot', 'cold', 'cake', 'des', 'sav'];
const SLOTS = Array.from({ length: 25 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
const PICKUP = Array.from({ length: 19 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
const muted = { color: 'var(--color-ink-muted)' };
const strong = { color: 'var(--color-ink-strongest)' };

interface Booking { id: string; ref: string; name: string; phone: string; party: number; day: number; time: string; note: string; done: boolean; isNew: boolean }
interface Line { name: string; qty: number; price: number }
interface Order { id: string; ref: string; name: string; phone: string; lines: Line[]; day: number; time: string; note: string; total: number; done: boolean; isNew: boolean }
interface Enquiry { id: string; name: string; type: number; guests: number; day: number; message: string; done: boolean; isNew: boolean }

const sum = (l: Line[]) => l.reduce((a, x) => a + x.qty * x.price, 0);

function Photo({ icon, caption, tall }: { icon: IconName; caption: string; tall?: boolean }) {
  return (
    <div className={`rounded-2xl flex flex-col items-center justify-center gap-2 ${tall ? 'min-h-[220px]' : 'min-h-[120px]'}`}
      style={{ background: 'linear-gradient(135deg, var(--color-lime-soft), var(--color-lime-300))', color: 'var(--color-ink-strongest)' }}>
      <Icon name={icon} size={tall ? 40 : 28} />
      <span className="text-xs font-semibold">{caption}</span>
    </div>
  );
}

export default function KafeDemo({ lang }: DemoProps) {
  const u = KAFE_UI[lang];
  const D = KAFE_DATA[lang];
  const formatMoney = useMoneyFormatter();
  const toast = useToast();
  const locale = LOCALES[lang];

  const dayLabel = (off: number, long = false) => {
    if (off === 0 && !long) return u.today;
    if (off === 1 && !long) return u.tomorrow;
    const d = new Date(); d.setDate(d.getDate() + off);
    return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  };
  const days = Array.from({ length: 14 }, (_, i) => i);

  const [active, setActive] = useState(() => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'qr' ? u.slugs[6] : u.slugs[0]));
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Cat | 'all'>('all');

  const [bookings, setBookings] = useState<Booking[]>(() => D.seedBookings.map((b) => ({ ...b, id: uid(), ref: `K-${uid().slice(0, 4).toUpperCase()}`, day: 0, done: false, isNew: false })));
  const [orders, setOrders] = useState<Order[]>(() => D.seedOrders.map((o) => {
    const lines = o.lines.map(([name, qty, price]) => ({ name, qty, price }));
    return { id: uid(), ref: `P-${uid().slice(0, 4).toUpperCase()}`, name: o.name, phone: o.phone, lines, day: o.day, time: o.time, note: o.note, total: sum(lines), done: false, isNew: false };
  }));
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => D.seedEnquiries.map((e) => ({ ...e, id: uid(), done: false, isNew: true })));

  // booking form
  const [bDay, setBDay] = useState(0);
  const [bParty, setBParty] = useState(2);
  const [bTime, setBTime] = useState('');
  const [bName, setBName] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bNote, setBNote] = useState('');
  const [bDone, setBDone] = useState<Booking | null>(null);

  // pre-order
  const preItems = useMemo(() => [
    ...D.whole.map((w) => ({ name: w.name, sub: `${u.whole} · ${u.serves(w.serves)}`, price: w.price })),
    ...D.items.filter((i) => i[0] === 'cake' || i[0] === 'des').map((i) => ({ name: i[1], sub: u.piece, price: i[3] })),
  ], [D, u]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pDay, setPDay] = useState(1);
  const [pTime, setPTime] = useState('15:00');
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pNote, setPNote] = useState('');
  const [pDone, setPDone] = useState<Order | null>(null);
  const cartLines: Line[] = preItems.filter((i) => cart[i.name]).map((i) => ({ name: i.name, qty: cart[i.name], price: i.price }));
  const setQty = (name: string, d: number) => setCart((c) => {
    const n = Math.max(0, (c[name] ?? 0) + d);
    const { [name]: _drop, ...rest } = c;
    return n ? { ...rest, [name]: n } : rest;
  });

  // events
  const [eName, setEName] = useState('');
  const [ePhone, setEPhone] = useState('');
  const [eType, setEType] = useState(0);
  const [eGuests, setEGuests] = useState(20);
  const [eDate, setEDate] = useState('');
  const [eMsg, setEMsg] = useState('');
  const [eDone, setEDone] = useState<Enquiry | null>(null);

  const isFull = (day: number, idx: number) => !D.seedBookings.some((b) => b.time === SLOTS[idx]) && (day * 5 + idx * 7) % 6 === 0;

  const submitBooking = () => {
    if (!bName.trim() || !bPhone.trim()) return toast.show(u.required, true);
    if (!bTime) return toast.show(u.pickTime, true);
    const b: Booking = { id: uid(), ref: `K-${uid().slice(0, 4).toUpperCase()}`, name: bName.trim(), phone: bPhone.trim(), party: bParty, day: bDay, time: bTime, note: bNote.trim(), done: false, isNew: true };
    setBookings((x) => [...x, b]); setBDone(b); toast.show(u.bookedToast);
  };
  const resetBooking = () => { setBDone(null); setBTime(''); setBName(''); setBPhone(''); setBNote(''); };

  const submitOrder = () => {
    if (!cartLines.length) return toast.show(u.cartEmpty, true);
    if (!pName.trim() || !pPhone.trim()) return toast.show(u.required, true);
    const o: Order = { id: uid(), ref: `P-${uid().slice(0, 4).toUpperCase()}`, name: pName.trim(), phone: pPhone.trim(), lines: cartLines, day: pDay, time: pTime, note: pNote.trim(), total: sum(cartLines), done: false, isNew: true };
    setOrders((x) => [...x, o]); setPDone(o); setCart({}); toast.show(u.orderedToast);
  };
  const resetOrder = () => { setPDone(null); setPName(''); setPPhone(''); setPNote(''); };

  const submitEnquiry = () => {
    if (!eName.trim() || !ePhone.trim()) return toast.show(u.required, true);
    if (eGuests > D.capacity.standing) return toast.show(fill(u.evGuestsErr, { max: String(D.capacity.standing) }), true);
    const e: Enquiry = { id: uid(), name: eName.trim(), type: eType, guests: eGuests, day: 7, message: eMsg.trim() || ePhone.trim(), done: false, isNew: true };
    if (eDate) e.day = Math.max(0, Math.round((new Date(eDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 864e5));
    setEnquiries((x) => [e, ...x]); setEDone(e); toast.show(u.evToast);
  };
  const resetEnquiry = () => { setEDone(null); setEName(''); setEPhone(''); setEMsg(''); setEDate(''); };

  const goto = (i: number) => setActive(u.slugs[i]);
  const heading = (t: string, s?: string) => (
    <div className="mb-6">
      <h2 className="text-2xl font-black tracking-tight" style={strong}>{t}</h2>
      {s && <p className="text-sm mt-1" style={muted}>{s}</p>}
    </div>
  );
  const dateSelect = (v: number, set: (n: number) => void, from = 0) => (
    <select className={inputCls} style={field} value={v} onChange={(e) => set(Number(e.target.value))}>
      {days.filter((d) => d >= from).map((d) => <option key={d} value={d}>{dayLabel(d, true)}</option>)}
    </select>
  );
  const confirmBox = (title: string, text: string, ref: string, onNew: () => void, newLabel: string) => (
    <div className="max-w-xl mx-auto rounded-2xl p-6 text-center" style={card}>
      <span className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-feature-success)', color: 'var(--color-surface-raised)' }}><Icon name="check" size={24} /></span>
      <h3 className="text-xl font-black" style={strong}>{title}</h3>
      <p className="text-sm mt-2" style={muted}>{text}</p>
      <p className="text-sm mt-4" style={muted}>{u.ref}: <b style={{ ...strong, fontFamily: '"IBM Plex Mono", monospace' }}>{ref}</b></p>
      <div className="flex flex-wrap gap-2 justify-center mt-5">
        <PrimaryBtn onClick={() => goto(5)}>{u.viewOwner}</PrimaryBtn>
        <GhostBtn onClick={onNew}>{newLabel}</GhostBtn>
      </div>
    </div>
  );

  const filtered = D.items.map((it, i) => ({ it, i })).filter(({ it }) =>
    (cat === 'all' || it[0] === cat) && (`${it[1]} ${it[2]}`.toLowerCase().includes(q.trim().toLowerCase())));

  const tags = (a: string, dt: string) => (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {dt && <Pill tone={dt === 'vg' ? 'success' : 'lime'}>{u.diet[dt as 'v' | 'vg']}</Pill>}
      {a.split('').map((c) => <Pill key={c}>{u.allergens[c as 'g' | 'n' | 'm' | 'e']}</Pill>)}
    </div>
  );

  const home = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <Pill tone="success">{u.openNow} · {u.times[0]}</Pill>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-4" style={strong}>{u.heroTitle}</h2>
          <p className="text-base mt-3" style={muted}>{u.heroText}</p>
          <div className="flex flex-wrap gap-2 mt-6">
            <PrimaryBtn onClick={() => goto(2)}>{u.cta}</PrimaryBtn>
            <GhostBtn onClick={() => goto(3)}>{u.goPre}</GhostBtn>
            <GhostBtn onClick={() => goto(1)}>{u.goMenu}</GhostBtn>
          </div>
        </div>
        <Photo icon="gift" caption={u.heroCaption} tall />
      </div>
      <div>
        <h3 className="text-lg font-bold mb-3" style={strong}>{u.specials}</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {D.specials.map((i) => {
            const it = D.items[i];
            return (
              <div key={i} className="rounded-2xl p-4" style={card}>
                <Photo icon="sparkle" caption={u.cats[it[0]]} />
                <p className="font-bold mt-3" style={strong}>{it[1]}</p>
                <p className="text-sm" style={muted}>{it[2]}</p>
                <p className="font-bold mt-2" style={strong}>{formatMoney(it[3])}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Panel title={u.hours}>
          {u.days.map((d, i) => (
            <div key={d} className="flex justify-between text-sm py-1.5" style={{ borderBottom: i < 2 ? '1px solid var(--color-border-card)' : 'none' }}>
              <span style={muted}>{d}</span><b style={strong}>{u.times[i]}</b>
            </div>
          ))}
        </Panel>
        <Panel title={u.visit}>
          <p className="text-sm" style={strong}>{D.address.street}<br />{D.address.city}</p>
          <p className="text-sm mt-2" style={muted}>{D.address.phone}<br />{D.address.email}</p>
          <div className="mt-3"><GhostBtn onClick={() => toast.show(`${D.address.street}, ${D.address.city}`)}>{u.directions}</GhostBtn></div>
        </Panel>
      </div>
    </div>
  );

  const menu = () => (
    <div className="max-w-6xl mx-auto">
      {heading(u.nav[1], u.allergenNote)}
      <input className={`${inputCls} mb-3`} style={field} value={q} onChange={(e) => setQ(e.target.value)} placeholder={u.search} aria-label={u.search} />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {(['all', ...CATS] as const).map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className="rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap"
            style={cat === c ? { background: 'var(--color-ink-strongest)', color: 'var(--color-lime-300)' } : { ...card, color: 'var(--color-ink-muted)' }}>
            {c === 'all' ? u.all : u.cats[c]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? <p className="text-sm py-8 text-center" style={muted}>{u.noResults}</p> : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(({ it, i }) => (
            <div key={i} className="rounded-2xl p-4 flex justify-between gap-3" style={card}>
              <div className="min-w-0">
                <p className="font-bold" style={strong}>{it[1]}</p>
                <p className="text-sm" style={muted}>{it[2]}</p>
                {tags(it[4], it[5])}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold" style={strong}>{formatMoney(it[3])}</p>
                {(it[0] === 'cake' || it[0] === 'des') && (
                  <div className="mt-2"><GhostBtn onClick={() => { setQty(it[1], 1); toast.show(`${it[1]} · ${u.nav[3]}`); }}>{u.add}</GhostBtn></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const [qCart, setQCart] = useState<Record<number, number>>({});
  const [qCat, setQCat] = useState<Cat>('br');
  const qCount = Object.values(qCart).reduce((a, n) => a + n, 0);
  const qTotal = Object.entries(qCart).reduce((a, [i, n]) => a + n * D.items[Number(i)][3], 0);
  const qr = () => (
    <div className="max-w-6xl mx-auto">
      {heading(u.qrHead, u.qrSub)}
      <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
        <div className="rounded-[2.2rem] p-2.5 mx-auto w-full max-w-[320px]" style={{ background: 'var(--color-ink-strongest)' }}>
          <div className="rounded-[1.7rem] overflow-hidden flex flex-col h-[600px]" style={{ background: 'var(--background)' }}>
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-border-card)' }}>
              <div className="flex justify-between items-center">
                <b className="text-sm" style={strong}>{D.brand.name.split('·')[0].trim()}</b>
                <Pill tone="lime">{u.qrTable}</Pill>
              </div>
              <div className="flex gap-1.5 overflow-x-auto mt-3">
                {CATS.map((c) => (
                  <button key={c} type="button" onClick={() => setQCat(c)} className="rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
                    style={qCat === c ? { background: 'var(--color-ink-strongest)', color: 'var(--color-lime-300)' } : { ...card, color: 'var(--color-ink-muted)' }}>{u.cats[c]}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {D.items.map((it, i) => ({ it, i })).filter(({ it }) => it[0] === qCat).map(({ it, i }) => (
                <div key={i} className="rounded-xl p-3" style={card}>
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-bold" style={strong}>{it[1]}</p>
                    <b className="text-sm shrink-0" style={strong}>{formatMoney(it[3])}</b>
                  </div>
                  <p className="text-xs mt-0.5" style={muted}>{it[2]}</p>
                  {tags(it[4], it[5])}
                  <div className="mt-2 flex items-center gap-2">
                    {qCart[i] ? <><GhostBtn onClick={() => setQCart((c) => ({ ...c, [i]: Math.max(0, c[i] - 1) }))}>−</GhostBtn><b className="text-sm" style={strong}>{qCart[i]}</b></> : null}
                    <GhostBtn onClick={() => setQCart((c) => ({ ...c, [i]: (c[i] ?? 0) + 1 }))}>{qCart[i] ? '+' : u.qrAdd}</GhostBtn>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3" style={{ borderTop: '1px solid var(--color-border-card)', background: 'var(--color-surface-raised)' }}>
              <div className="flex justify-between text-sm font-bold mb-2" style={strong}><span>{u.qrCart} · {qCount} {u.qrItems}</span><span>{formatMoney(qTotal)}</span></div>
              <PrimaryBtn onClick={() => { if (!qCount) return toast.show(u.qrEmpty, true); setQCart({}); toast.show(u.qrSent); }}>{u.qrSend}</PrimaryBtn>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center" style={card}>
            <QrImage value="https://example.com/qr-menu?table=7" size={140} label={u.qrHead} />
            <div>
              <Pill tone="success">{u.qrTable}</Pill>
              <p className="text-sm mt-3" style={muted}>{u.qrHow}</p>
            </div>
          </div>
          <p className="text-xs" style={muted}>{u.allergenNote}</p>
        </div>
      </div>
    </div>
  );

  const booking = () => (
    <div className="max-w-6xl mx-auto">
      {bDone ? confirmBox(u.bookedTitle, fill(u.bookedText, { name: bDone.name, party: u.persons(bDone.party), date: dayLabel(bDone.day, true), time: bDone.time }), bDone.ref, resetBooking, u.newBooking) : (
        <>
          {heading(u.bookTitle)}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Label text={u.date}>{dateSelect(bDay, setBDay)}</Label>
            <Label text={u.party}>
              <select className={inputCls} style={field} value={bParty} onChange={(e) => setBParty(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{u.persons(n)}</option>)}
              </select>
            </Label>
          </div>
          <p className="text-[11px] font-semibold mb-2" style={muted}>{u.time}</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
            {SLOTS.map((s, i) => {
              const full = isFull(bDay, i);
              const on = bTime === s && !full;
              return (
                <button key={s} type="button" disabled={full} onClick={() => setBTime(s)} title={full ? u.full : undefined}
                  className="rounded-lg py-2 text-sm font-semibold"
                  style={on ? { background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)', border: '1px solid var(--color-lime-300)' }
                    : { ...card, color: 'var(--color-ink-strongest)', opacity: full ? 0.4 : 1, textDecoration: full ? 'line-through' : 'none', cursor: full ? 'not-allowed' : 'pointer' }}>
                  {s}
                </button>
              );
            })}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Label text={u.name}><input className={inputCls} style={field} value={bName} onChange={(e) => setBName(e.target.value)} /></Label>
            <Label text={u.phone}><input className={inputCls} style={field} type="tel" value={bPhone} onChange={(e) => setBPhone(e.target.value)} /></Label>
          </div>
          <div className="mt-4"><Label text={u.note}><textarea className={inputCls} style={field} rows={2} value={bNote} onChange={(e) => setBNote(e.target.value)} /></Label></div>
          <div className="mt-5"><PrimaryBtn onClick={submitBooking}>{u.confirm}</PrimaryBtn></div>
        </>
      )}
    </div>
  );

  const preorder = () => (
    <div className="max-w-6xl mx-auto">
      {pDone ? confirmBox(u.orderedTitle, fill(u.orderedText, { name: pDone.name, date: dayLabel(pDone.day, true), time: pDone.time }) + ` (${formatMoney(pDone.total)})`, pDone.ref, resetOrder, u.newOrder) : (
        <>
          {heading(u.preTitle, u.preText)}
          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            <div className="grid sm:grid-cols-2 gap-3 content-start">
              {preItems.map((p) => (
                <div key={p.name} className="rounded-2xl p-4 flex flex-col justify-between gap-3" style={card}>
                  <div>
                    <p className="font-bold" style={strong}>{p.name}</p>
                    <p className="text-xs" style={muted}>{p.sub}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <b style={strong}>{formatMoney(p.price)}</b>
                    {cart[p.name] ? (
                      <span className="flex items-center gap-2">
                        <GhostBtn onClick={() => setQty(p.name, -1)}>−</GhostBtn>
                        <b className="w-5 text-center" style={strong}>{cart[p.name]}</b>
                        <GhostBtn onClick={() => setQty(p.name, 1)}>+</GhostBtn>
                      </span>
                    ) : <GhostBtn onClick={() => setQty(p.name, 1)}>{u.add}</GhostBtn>}
                  </div>
                </div>
              ))}
            </div>
            <Panel title={u.cart} className="self-start">
              {cartLines.length === 0 ? <p className="text-sm" style={muted}>{u.emptyCart}</p> : (
                <ul className="space-y-2 mb-3">
                  {cartLines.map((l) => (
                    <li key={l.name} className="flex justify-between gap-2 text-sm">
                      <span style={strong}>{l.qty} × {l.name}</span>
                      <span className="shrink-0" style={muted}>{formatMoney(l.qty * l.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-between font-bold py-3" style={{ ...strong, borderTop: '1px solid var(--color-border-card)' }}>
                <span>{u.total}</span><span>{formatMoney(sum(cartLines))}</span>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Label text={u.pickup}>{dateSelect(pDay, setPDay, 1)}</Label>
                  <Label text={u.pickupTime}>
                    <select className={inputCls} style={field} value={pTime} onChange={(e) => setPTime(e.target.value)}>
                      {PICKUP.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Label>
                </div>
                <Label text={u.name}><input className={inputCls} style={field} value={pName} onChange={(e) => setPName(e.target.value)} /></Label>
                <Label text={u.phone}><input className={inputCls} style={field} type="tel" value={pPhone} onChange={(e) => setPPhone(e.target.value)} /></Label>
                <Label text={u.cakeNote}><textarea className={inputCls} style={field} rows={2} value={pNote} onChange={(e) => setPNote(e.target.value)} /></Label>
                <p className="text-xs" style={muted}>{u.pay}</p>
                <PrimaryBtn onClick={submitOrder}>{u.placeOrder}</PrimaryBtn>
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );

  const events = () => (
    <div className="max-w-6xl mx-auto">
      {heading(u.evTitle, u.evText)}
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <div className="space-y-4">
          <Photo icon="gift" caption={D.events.join(' · ')} tall />
          <Panel title={u.capacity}>
            <div className="flex gap-6 text-sm" style={muted}>
              <span><b className="text-2xl" style={strong}>{D.capacity.seated}</b> {u.seated}</span>
              <span><b className="text-2xl" style={strong}>{D.capacity.standing}</b> {u.standing}</span>
            </div>
          </Panel>
        </div>
        {eDone ? (
          <div className="rounded-2xl p-6 text-center self-start" style={card}>
            <span className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-feature-success)', color: 'var(--color-surface-raised)' }}><Icon name="check" size={24} /></span>
            <h3 className="text-xl font-black" style={strong}>{u.evSent}</h3>
            <p className="text-sm mt-2" style={muted}>{fill(u.evSentText, { name: eDone.name })}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-5">
              <PrimaryBtn onClick={() => goto(5)}>{u.viewOwner}</PrimaryBtn>
              <GhostBtn onClick={resetEnquiry}>{u.another}</GhostBtn>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 space-y-3 self-start" style={card}>
            <div className="grid grid-cols-2 gap-3">
              <Label text={u.name}><input className={inputCls} style={field} value={eName} onChange={(e) => setEName(e.target.value)} /></Label>
              <Label text={u.phone}><input className={inputCls} style={field} type="tel" value={ePhone} onChange={(e) => setEPhone(e.target.value)} /></Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Label text={u.evType}>
                <select className={inputCls} style={field} value={eType} onChange={(e) => setEType(Number(e.target.value))}>
                  {D.events.map((n, i) => <option key={n} value={i}>{n}</option>)}
                </select>
              </Label>
              <Label text={u.guests}><input className={inputCls} style={field} type="number" min={2} max={D.capacity.standing} value={eGuests} onChange={(e) => setEGuests(Number(e.target.value) || 0)} /></Label>
            </div>
            <Label text={u.evDate}><input className={inputCls} style={field} type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} /></Label>
            <Label text={u.message}><textarea className={inputCls} style={field} rows={3} value={eMsg} onChange={(e) => setEMsg(e.target.value)} /></Label>
            <PrimaryBtn onClick={submitEnquiry}>{u.evSend}</PrimaryBtn>
          </div>
        )}
      </div>
    </div>
  );

  const toggle = <T extends { id: string; done: boolean; isNew: boolean }>(set: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    set((x) => x.map((r) => (r.id === id ? { ...r, done: !r.done, isNew: false } : r)));
    toast.show(u.doneToast);
  };
  const row = (key: string, main: React.ReactNode, sub: string, done: boolean, isNew: boolean, onToggle: () => void, extra?: React.ReactNode) => (
    <li key={key} className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: '1px solid var(--color-border-card)', opacity: done ? 0.55 : 1 }}>
      <div className="min-w-0">
        <p className="text-sm font-bold" style={{ ...strong, textDecoration: done ? 'line-through' : 'none' }}>{main} {isNew && <Pill tone="lime">{u.newBadge}</Pill>}</p>
        <p className="text-sm" style={muted}>{sub}</p>
        {extra}
      </div>
      <GhostBtn onClick={onToggle}>{done ? u.undo : u.markDone}</GhostBtn>
    </li>
  );
  const byTime = <T extends { day: number; time: string }>(a: T[]) => [...a].sort((x, y) => x.day - y.day || x.time.localeCompare(y.time));

  const owner = () => (
    <div className="max-w-6xl mx-auto">
      {heading(u.ownerTitle, u.ownerSub)}
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title={u.resTitle}>
          {bookings.length === 0 ? <p className="text-sm" style={muted}>{u.none}</p> : <ul>{byTime(bookings.map((b) => ({ ...b }))).map((b) =>
            row(b.id, <>{b.time} · {b.name}</>, `${b.day ? dayLabel(b.day) + ' · ' : ''}${u.persons(b.party)} · ${b.phone}${b.note ? ' · ' + b.note : ''}`, b.done, b.isNew, () => toggle(setBookings, b.id)))}</ul>}
        </Panel>
        <Panel title={u.ordersTitle}>
          {orders.length === 0 ? <p className="text-sm" style={muted}>{u.none}</p> : <ul>{byTime(orders).map((o) =>
            row(o.id, <>{o.name} · {formatMoney(o.total)}</>, `${u.pickupShort}: ${dayLabel(o.day)} ${o.time}${o.note ? ' · ' + o.note : ''}`, o.done, o.isNew, () => toggle(setOrders, o.id),
              <p className="text-xs mt-1" style={muted}>{o.lines.map((l) => `${l.qty} × ${l.name}`).join(', ')}</p>))}</ul>}
        </Panel>
        <Panel title={u.enqTitle}>
          {enquiries.length === 0 ? <p className="text-sm" style={muted}>{u.none}</p> : <ul>{enquiries.map((e) =>
            row(e.id, <>{e.name} · {D.events[e.type]}</>, `${e.guests} ${u.guestsShort} · ${dayLabel(e.day, true)}`, e.done, e.isNew, () => toggle(setEnquiries, e.id),
              <p className="text-xs mt-1" style={muted}>{e.message}</p>))}</ul>}
        </Panel>
      </div>
    </div>
  );

  const newCount = [...bookings, ...orders, ...enquiries].filter((r) => r.isNew && !r.done).length;
  const renders = [home, menu, booking, preorder, events, owner, qr];
  const icons: IconName[] = ['home', 'tag', 'calendar', 'gift', 'star', 'inbox', 'tag'];

  return (
    <>
      <SiteShell
        domain={D.domain}
        brand={D.brand}
        pages={u.slugs.map((key, i) => ({ key, label: u.nav[i], icon: icons[i], badge: i === 5 ? newCount : undefined, render: renders[i] }))}
        cta={{ label: u.cta, page: u.slugs[2] }}
        active={active}
        onActiveChange={setActive}
        footer={<div className="flex flex-wrap justify-between gap-2"><span>{D.brand.name} · {D.address.street}, {D.address.city}</span><span>{u.footer}</span></div>}
      />
      {toast.node}
    </>
  );
}
