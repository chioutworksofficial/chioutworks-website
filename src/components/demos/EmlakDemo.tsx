import { useMemo, useState, type ReactNode } from 'react';
import SiteShell from './SiteShell';
import { Icon, type IconName } from './AppShell';
import { GhostBtn, Label, Panel, Pill, PrimaryBtn, card, field, inputCls, uid, useToast, type DemoProps } from './ui';
import { fill } from '../../lib/demoAccess';
import { MARKET_CURRENCY, useMoneyFormatter } from '../../lib/currency';
import { EMLAK_UI } from './i18n/emlak';
import { EMLAK_DATA, type Deal, type Listing, type PType, type ReqKind, type ReqStatus } from './data/emlak';
import type { Lang } from '../../translations';

type U = (typeof EMLAK_UI)[Lang];
type Fm = (n: number) => string;
type Role = 'home' | 'list' | 'val' | 'search' | 'inbox';
interface Req { id: string; kind: ReqKind; name: string; email: string; phone: string; at: number; status: ReqStatus; detail: string[] }
interface Filters { deal: Deal; type: '' | PType; rooms: number; min: string; max: string; loc: string; sort: 'new' | 'asc' | 'desc' | 'area' }

const TYPES: PType[] = ['apartment', 'house', 'land', 'commercial'];
const TYPE_ICON: Record<PType, IconName> = { apartment: 'home', house: 'home', land: 'globe', commercial: 'tag' };
const GRADS = [
  'linear-gradient(135deg, var(--color-lime-soft), var(--color-surface-raised))',
  'linear-gradient(135deg, var(--color-border-card), var(--background))',
  'linear-gradient(160deg, var(--color-lime-300), var(--color-lime-soft))',
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const num = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0;

function ago(ts: number, u: U) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return u.justNow;
  if (m < 60) return fill(u.agoM, { n: String(m) });
  if (m < 1440) return fill(u.agoH, { n: String(Math.round(m / 60)) });
  return fill(u.agoD, { n: String(Math.round(m / 1440)) });
}

function Sel({ value, onChange, children }: { value: string | number; onChange: (v: string) => void; children: ReactNode }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={field}>{children}</select>;
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs mt-1" style={{ color: 'var(--color-feature-error)' }}>{msg}</p> : null;
}

function Photo({ l, u, idx, tall }: { l: Listing; u: U; idx: number; tall?: boolean }) {
  return (
    <div className={`relative flex flex-col items-center justify-center gap-1 ${tall ? 'h-56 md:h-72' : 'h-40'}`}
      style={{ background: GRADS[idx % GRADS.length], color: 'var(--color-ink-strongest)' }}>
      <Icon name={TYPE_ICON[l.type]} size={tall ? 44 : 32} />
      <span className="text-xs font-semibold" style={{ color: 'var(--color-ink-muted)' }}>{u[l.type]} · {l.loc}</span>
      {l.badge && (
        <span className="absolute top-3 left-3"><Pill tone={l.badge === 'new' ? 'lime' : 'neutral'}>{l.badge === 'new' ? u.badgeNew : u.badgeReserved}</Pill></span>
      )}
    </div>
  );
}

function priceText(l: Listing, fm: Fm, u: U) { return l.deal === 'rent' ? `${fm(l.price)} ${u.perMonth}` : fm(l.price); }

function Card({ l, idx, u, fm, onOpen }: { l: Listing; idx: number; u: U; fm: Fm; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="rounded-2xl overflow-hidden text-left flex flex-col" style={card}>
      <Photo l={l} u={u} idx={idx} />
      <div className="p-4 flex flex-col gap-1.5">
        <p className="text-lg font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{priceText(l, fm, u)}</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{l.title}</p>
        <p className="text-xs flex flex-wrap gap-x-3" style={{ color: 'var(--color-ink-muted)' }}>
          <span>{l.area} m²</span>{l.rooms > 0 && <span>{l.rooms} {u.fRooms.toLowerCase()}</span>}<span>{l.loc}</span>
        </p>
      </div>
    </button>
  );
}

interface ContactVals { name: string; email: string; phone: string }
function validateContact(v: ContactVals, u: U) {
  const e: Record<string, string> = {};
  if (!v.name.trim()) e.name = u.errName;
  if (!EMAIL_RE.test(v.email.trim())) e.email = u.errEmail;
  if (v.phone.replace(/\D/g, '').length < 6) e.phone = u.errPhone;
  return e;
}

function ContactFields({ v, set, err, u }: { v: ContactVals; set: (p: Partial<ContactVals>) => void; err: Record<string, string>; u: U }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2"><Label text={u.name}><input className={inputCls} style={field} value={v.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" /></Label><Err msg={err.name} /></div>
      <div><Label text={u.email}><input className={inputCls} style={field} type="email" value={v.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" /></Label><Err msg={err.email} /></div>
      <div><Label text={u.phone}><input className={inputCls} style={field} type="tel" value={v.phone} onChange={(e) => set({ phone: e.target.value })} autoComplete="tel" /></Label><Err msg={err.phone} /></div>
    </div>
  );
}

function Done({ title, text, again, onAgain, extra }: { title: string; text: string; again: string; onAgain: () => void; extra?: ReactNode }) {
  return (
    <div className="text-center py-8 flex flex-col items-center gap-3">
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--color-feature-success)', color: 'var(--color-surface-raised)' }}><Icon name="check" size={28} /></span>
      <h3 className="text-xl font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{title}</h3>
      <p className="text-sm max-w-md" style={{ color: 'var(--color-ink-muted)' }}>{text}</p>
      <div className="flex flex-wrap gap-2 justify-center">{extra}<GhostBtn onClick={onAgain}>{again}</GhostBtn></div>
    </div>
  );
}

function Enquiry({ l, u, defName, onSend }: { l: Listing; u: U; defName: string; onSend: (r: Omit<Req, 'id' | 'at' | 'status'>) => void }) {
  const [v, setV] = useState<ContactVals>({ name: '', email: '', phone: '' });
  const [msg, setMsg] = useState(() => fill(u.msgDefault, { title: l.title }));
  const [err, setErr] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  void defName;
  if (sent) return <Done title={u.sentTitle} text={u.sentText} again={u.sendAnother} onAgain={() => { setSent(false); setV({ name: '', email: '', phone: '' }); }} />;
  const submit = () => {
    const e = validateContact(v, u);
    if (!msg.trim()) e.msg = u.errField;
    setErr(e);
    if (Object.keys(e).length) return;
    onSend({ kind: 'enquiry', ...v, detail: [`${u.property}: ${l.title}`, `${u.message}: ${msg.trim()}`] });
    setSent(true);
  };
  return (
    <div className="flex flex-col gap-3">
      <ContactFields v={v} set={(p) => setV({ ...v, ...p })} err={err} u={u} />
      <div><Label text={u.message}><textarea rows={4} className={inputCls} style={field} value={msg} onChange={(e) => setMsg(e.target.value)} /></Label><Err msg={err.msg} /></div>
      <div><PrimaryBtn onClick={submit}>{u.send}</PrimaryBtn></div>
    </div>
  );
}

function Detail({ l, idx, u, fm, lang, onBack, onSend }: { l: Listing; idx: number; u: U; fm: Fm; lang: Lang; onBack: () => void; onSend: (r: Omit<Req, 'id' | 'at' | 'status'>) => void }) {
  const facts: [string, string][] = [
    [u.fPrice, priceText(l, fm, u)], [u.fDeal, l.deal === 'buy' ? u.buy : u.rent], [u.fType, u[l.type]], [u.fArea, `${l.area} m²`],
    [u.fRooms, l.rooms ? String(l.rooms) : '–'], [u.fYear, l.year ? String(l.year) : '–'], [u.fEnergy, l.energy], [u.fLocation, `${l.loc}`],
  ];
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      <div><GhostBtn onClick={onBack}>← {u.back}</GhostBtn></div>
      <div className="rounded-2xl overflow-hidden" style={card}><Photo l={l} u={u} idx={idx} tall /></div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-ink-strongest)' }}>{l.title}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>{l.loc}</p>
          </div>
          <Panel title={u.keyFacts}>
            <dl className="grid sm:grid-cols-2 gap-x-8">
              {facts.map(([k, val]) => (
                <div key={k} className="flex justify-between gap-3 py-2 text-sm" style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                  <dt style={{ color: 'var(--color-ink-muted)' }}>{k}</dt><dd className="font-semibold text-right" style={{ color: 'var(--color-ink-strongest)' }}>{val}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title={u.description}><p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{l.desc}</p></Panel>
        </div>
        <Panel title={u.enquireTitle} className="self-start"><Enquiry key={lang + l.id} l={l} u={u} defName="" onSend={onSend} /></Panel>
      </div>
    </div>
  );
}

function Valuation({ u, lang, onSend, onInbox }: { u: U; lang: Lang; onSend: (r: Omit<Req, 'id' | 'at' | 'status'>) => void; onInbox: () => void }) {
  const [step, setStep] = useState(1);
  const [ptype, setPtype] = useState<PType | ''>('');
  const [p, setP] = useState({ address: '', area: '', rooms: '', year: '' });
  const [cond, setCond] = useState<'condNew' | 'condGood' | 'condRenov' | ''>('');
  const [v, setV] = useState<ContactVals>({ name: '', email: '', phone: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const steps = [u.stepType, u.stepProp, u.stepCond, u.stepContact];
  const reset = () => { setStep(1); setPtype(''); setP({ address: '', area: '', rooms: '', year: '' }); setCond(''); setV({ name: '', email: '', phone: '' }); setErr({}); setDone(false); };
  const next = () => {
    const e: Record<string, string> = {};
    if (step === 1 && !ptype) e.ptype = u.errField;
    if (step === 2) { if (!p.address.trim()) e.address = u.errField; if (!num(p.area)) e.area = u.errField; }
    if (step === 3 && !cond) e.cond = u.errField;
    if (step === 4) Object.assign(e, validateContact(v, u));
    setErr(e);
    if (Object.keys(e).length) return;
    if (step < 4) { setStep(step + 1); return; }
    onSend({ kind: 'valuation', ...v, detail: [
      `${u.fType}: ${ptype ? u[ptype] : ''}`, `${u.address}: ${p.address.trim()}`,
      `${u.areaIn}: ${num(p.area)} · ${u.roomsN}: ${p.rooms || '–'} · ${u.yearBuilt}: ${p.year || '–'}`, `${u.condition}: ${cond ? u[cond] : ''}`] });
    setDone(true);
  };
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-ink-strongest)' }}>{u.valTitle}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>{u.valSub}</p>
      </div>
      <div className="rounded-2xl p-5 md:p-6" style={card}>
        {done ? (
          <Done title={u.valDone} text={u.valDoneText} again={u.sendAnother} onAgain={reset} extra={<PrimaryBtn onClick={onInbox}>{u.navInbox}</PrimaryBtn>} />
        ) : (
          <>
            <div className="flex items-center justify-between text-xs font-semibold mb-2" style={{ color: 'var(--color-ink-muted)' }}>
              <span>{fill(u.step, { n: String(step), t: '4' })}</span><span>{steps[step - 1]}</span>
            </div>
            <div className="flex gap-1.5 mb-5" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step}>
              {steps.map((s, i) => <span key={s} className="h-1.5 flex-1 rounded-full" style={{ background: i < step ? 'var(--color-lime-300)' : 'var(--color-border-card)' }} />)}
            </div>
            {step === 1 && (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {TYPES.map((tp) => (
                    <button key={tp} type="button" onClick={() => setPtype(tp)} className="rounded-xl p-4 flex flex-col items-center gap-2 text-sm font-semibold"
                      style={{ background: ptype === tp ? 'var(--color-lime-soft)' : 'var(--background)', border: `1px solid ${ptype === tp ? 'var(--color-ink-strongest)' : 'var(--color-border-card)'}`, color: 'var(--color-ink-strongest)' }}>
                      <Icon name={TYPE_ICON[tp]} size={24} />{u[tp]}
                    </button>
                  ))}
                </div>
                <Err msg={err.ptype} />
              </div>
            )}
            {step === 2 && (
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3"><Label text={u.address}><input className={inputCls} style={field} value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></Label><Err msg={err.address} /></div>
                <div><Label text={u.areaIn}><input className={inputCls} style={field} inputMode="numeric" value={p.area} onChange={(e) => setP({ ...p, area: e.target.value })} /></Label><Err msg={err.area} /></div>
                <Label text={u.roomsN}><input className={inputCls} style={field} inputMode="numeric" value={p.rooms} onChange={(e) => setP({ ...p, rooms: e.target.value })} /></Label>
                <Label text={u.yearBuilt}><input className={inputCls} style={field} inputMode="numeric" value={p.year} onChange={(e) => setP({ ...p, year: e.target.value })} /></Label>
              </div>
            )}
            {step === 3 && (
              <div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {(['condNew', 'condGood', 'condRenov'] as const).map((c) => (
                    <button key={c} type="button" onClick={() => setCond(c)} className="rounded-xl p-4 text-sm font-semibold"
                      style={{ background: cond === c ? 'var(--color-lime-soft)' : 'var(--background)', border: `1px solid ${cond === c ? 'var(--color-ink-strongest)' : 'var(--color-border-card)'}`, color: 'var(--color-ink-strongest)' }}>{u[c]}</button>
                  ))}
                </div>
                <Err msg={err.cond} />
              </div>
            )}
            {step === 4 && <ContactFields key={lang} v={v} set={(x) => setV({ ...v, ...x })} err={err} u={u} />}
            <div className="flex justify-between mt-6">
              {step > 1 ? <GhostBtn onClick={() => setStep(step - 1)}>{u.prev}</GhostBtn> : <span />}
              <PrimaryBtn onClick={next}>{step < 4 ? u.next : u.submitVal}</PrimaryBtn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SearchReq({ u, lang, onSend, onInbox }: { u: U; lang: Lang; onSend: (r: Omit<Req, 'id' | 'at' | 'status'>) => void; onInbox: () => void }) {
  const blank = { deal: 'buy' as Deal, cat: 'catRes' as 'catRes' | 'catCom' | 'catInv', type: 'apartment' as PType, size: '', rooms: '', loc: '', max: '' };
  const [f, setF] = useState(blank);
  const [v, setV] = useState<ContactVals>({ name: '', email: '', phone: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const submit = () => {
    const e = validateContact(v, u);
    if (!f.loc.trim()) e.loc = u.errField;
    setErr(e);
    if (Object.keys(e).length) return;
    onSend({ kind: 'search', ...v, detail: [
      `${f.deal === 'buy' ? u.buy : u.rent} · ${u[f.cat]} · ${u[f.type]}`,
      `${u.minSize}: ${num(f.size) || '–'} · ${u.fRooms}: ${f.rooms || '–'}`,
      `${u.desiredLoc}: ${f.loc.trim()} · ${u.maxPrice}: ${num(f.max) ? num(f.max).toLocaleString(lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : lang === 'el' ? 'el-GR' : 'en-GB') : '–'}`] });
    setDone(true);
  };
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-ink-strongest)' }}>{u.srTitle}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>{u.srSub}</p>
      </div>
      <div className="rounded-2xl p-5 md:p-6" style={card}>
        {done ? (
          <Done title={u.srDone} text={u.srDoneText} again={u.sendAnother} onAgain={() => { setDone(false); setF(blank); setV({ name: '', email: '', phone: '' }); }} extra={<PrimaryBtn onClick={onInbox}>{u.navInbox}</PrimaryBtn>} />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <Label text={u.anyOffer}><Sel value={f.deal} onChange={(x) => setF({ ...f, deal: x as Deal })}><option value="buy">{u.buy}</option><option value="rent">{u.rent}</option></Sel></Label>
              <Label text={u.category}><Sel value={f.cat} onChange={(x) => setF({ ...f, cat: x as typeof f.cat })}><option value="catRes">{u.catRes}</option><option value="catCom">{u.catCom}</option><option value="catInv">{u.catInv}</option></Sel></Label>
              <Label text={u.type}><Sel value={f.type} onChange={(x) => setF({ ...f, type: x as PType })}>{TYPES.map((tp) => <option key={tp} value={tp}>{u[tp]}</option>)}</Sel></Label>
              <Label text={u.minSize}><input className={inputCls} style={field} inputMode="numeric" value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })} /></Label>
              <Label text={u.rooms}><input className={inputCls} style={field} inputMode="numeric" value={f.rooms} onChange={(e) => setF({ ...f, rooms: e.target.value })} /></Label>
              <Label text={`${u.maxPrice} (${MARKET_CURRENCY[lang]})`}><input className={inputCls} style={field} inputMode="numeric" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} /></Label>
              <div className="sm:col-span-3"><Label text={u.desiredLoc}><input className={inputCls} style={field} value={f.loc} onChange={(e) => setF({ ...f, loc: e.target.value })} /></Label><Err msg={err.loc} /></div>
            </div>
            <ContactFields key={lang} v={v} set={(x) => setV({ ...v, ...x })} err={err} u={u} />
            <div><PrimaryBtn onClick={submit}>{u.srSubmit}</PrimaryBtn></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Inbox({ reqs, u, setStatus }: { reqs: Req[]; u: U; setStatus: (id: string, s: ReqStatus) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const kindLabel: Record<ReqKind, string> = { enquiry: u.kEnquiry, valuation: u.kValuation, search: u.kSearch };
  const stLabel: Record<ReqStatus, string> = { new: u.stNew, contacted: u.stContacted, done: u.stDone };
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-ink-strongest)' }}>{u.inboxTitle}</h2>
      <p className="text-sm mt-1 mb-5" style={{ color: 'var(--color-ink-muted)' }}>{u.inboxSub}</p>
      <div className="flex flex-col gap-3">
        {reqs.length === 0 && <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{u.noReq}</p>}
        {reqs.map((r) => {
          const isOpen = open === r.id;
          return (
            <div key={r.id} className="rounded-2xl p-4" style={card}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={r.kind === 'enquiry' ? 'lime' : 'neutral'}>{kindLabel[r.kind]}</Pill>
                <Pill tone={r.status === 'new' ? 'lime' : r.status === 'done' ? 'success' : 'neutral'}>{stLabel[r.status]}</Pill>
                <span className="text-xs ml-auto" style={{ color: 'var(--color-ink-muted)' }}>{ago(r.at, u)}</span>
              </div>
              <p className="mt-2 text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{r.name}</p>
              <p className="text-xs break-all" style={{ color: 'var(--color-ink-muted)' }}>{r.email} · {r.phone}</p>
              {isOpen && (
                <ul className="mt-3 text-sm flex flex-col gap-1 rounded-xl p-3" style={{ background: 'var(--background)', color: 'var(--color-ink-strongest)' }}>
                  {r.detail.map((d) => <li key={d}>{d}</li>)}
                </ul>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <GhostBtn onClick={() => setOpen(isOpen ? null : r.id)}>{isOpen ? u.hide : u.details}</GhostBtn>
                {r.status === 'new' && <GhostBtn onClick={() => setStatus(r.id, 'contacted')}>{u.markContacted}</GhostBtn>}
                {r.status === 'contacted' && <GhostBtn onClick={() => setStatus(r.id, 'done')}>{u.markDone}</GhostBtn>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EmlakDemo({ lang }: DemoProps) {
  const u = EMLAK_UI[lang];
  const d = EMLAK_DATA[lang];
  const fm = useMoneyFormatter() as Fm;
  const { show, node } = useToast();
  const S = d.slugs;
  const [role, setRole] = useState<Role>('home');
  const [openId, setOpenId] = useState<string | null>(null);
  const [f, setF] = useState<Filters>({ deal: 'buy', type: '', rooms: 0, min: '', max: '', loc: '', sort: 'new' });
  const [reqs, setReqs] = useState<Req[]>(() => d.seeds.map((s) => ({ id: uid(), kind: s.kind, name: s.name, email: s.email, phone: s.phone, at: Date.now() - s.minAgo * 60000, status: s.status, detail: s.detail })));
  // reseed on language change (data is language specific)
  const [seedLang, setSeedLang] = useState(lang);
  if (seedLang !== lang) {
    setSeedLang(lang); setOpenId(null); setF({ deal: 'buy', type: '', rooms: 0, min: '', max: '', loc: '', sort: 'new' });
    setReqs(d.seeds.map((s) => ({ id: uid(), kind: s.kind, name: s.name, email: s.email, phone: s.phone, at: Date.now() - s.minAgo * 60000, status: s.status, detail: s.detail })));
  }

  const go = (r: Role) => { setRole(r); setOpenId(null); };
  const send = (r: Omit<Req, 'id' | 'at' | 'status'>) => { setReqs((p) => [{ ...r, id: uid(), at: Date.now(), status: 'new' }, ...p]); show(u.toastSent); };
  const setStatus = (id: string, status: ReqStatus) => setReqs((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
  const newCount = reqs.filter((r) => r.status === 'new').length;

  const list = useMemo(() => {
    const min = num(f.min), max = num(f.max);
    const out = d.listings.filter((l) => l.deal === f.deal && (!f.type || l.type === f.type) && l.rooms >= f.rooms && (!min || l.price >= min) && (!max || l.price <= max) && (!f.loc || l.loc === f.loc));
    const order = (l: Listing) => d.listings.indexOf(l);
    return out.sort((a, b) => f.sort === 'asc' ? a.price - b.price : f.sort === 'desc' ? b.price - a.price : f.sort === 'area' ? b.area - a.area : (a.badge === 'new' ? 0 : 1) - (b.badge === 'new' ? 0 : 1) || order(a) - order(b));
  }, [d, f]);

  const idxOf = (l: Listing) => d.listings.indexOf(l);
  const patch = (p: Partial<Filters>) => setF({ ...f, ...p });

  const home = (
    <div className="max-w-7xl mx-auto flex flex-col gap-10">
      <section className="rounded-3xl p-6 md:p-10" style={{ background: GRADS[0], border: '1px solid var(--color-border-card)' }}>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl" style={{ color: 'var(--color-ink-strongest)' }}>{u.heroTitle}</h1>
        <p className="mt-3 text-sm md:text-base max-w-xl" style={{ color: 'var(--color-ink-muted)' }}>{u.heroSub}</p>
        <div className="mt-6 rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end" style={card}>
          <Label text={u.anyOffer}><Sel value={f.deal} onChange={(x) => patch({ deal: x as Deal })}><option value="buy">{u.buy}</option><option value="rent">{u.rent}</option></Sel></Label>
          <Label text={u.type}><Sel value={f.type} onChange={(x) => patch({ type: x as Filters['type'] })}><option value="">{u.anyType}</option>{TYPES.map((tp) => <option key={tp} value={tp}>{u[tp]}</option>)}</Sel></Label>
          <Label text={u.location}><Sel value={f.loc} onChange={(x) => patch({ loc: x })}><option value="">{u.anyLoc}</option>{d.locs.map((l) => <option key={l} value={l}>{l}</option>)}</Sel></Label>
          <PrimaryBtn onClick={() => go('list')}>{u.searchBtn}</PrimaryBtn>
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{u.featured}</h2>
          <GhostBtn onClick={() => { setF({ ...f, deal: 'buy', type: '', loc: '', rooms: 0, min: '', max: '' }); go('list'); }}>{u.viewAll}</GhostBtn>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[d.listings[0], d.listings[1], d.listings[6]].map((l) => (
            <Card key={l.id} l={l} idx={idxOf(l)} u={u} fm={fm} onOpen={() => { setRole('list'); setOpenId(l.id); setF({ ...f, deal: l.deal }); }} />
          ))}
        </div>
      </section>
      <section className="grid grid-cols-3 gap-3">
        {[[String(d.years), u.years], [String(d.sold), u.sold], [`${d.rating} / 5`, u.rating]].map(([val, lab]) => (
          <div key={lab} className="rounded-2xl p-4 text-center" style={card}>
            <p className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{val}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-ink-muted)' }}>{lab}</p>
          </div>
        ))}
      </section>
      <section className="rounded-3xl p-6 md:p-8 flex flex-wrap items-center gap-4 justify-between" style={{ background: 'var(--color-ink-strongest)' }}>
        <div className="max-w-xl">
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--background)' }}>{u.valCtaTitle}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-border-card)' }}>{u.valCtaText}</p>
        </div>
        <PrimaryBtn onClick={() => go('val')}>{u.valCtaBtn}</PrimaryBtn>
      </section>
    </div>
  );

  const opened = openId ? d.listings.find((l) => l.id === openId) : undefined;
  const listings = opened ? (
    <Detail l={opened} idx={idxOf(opened)} u={u} fm={fm} lang={lang} onBack={() => setOpenId(null)} onSend={send} />
  ) : (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      <div className="rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end" style={card}>
        <Label text={u.anyOffer}><Sel value={f.deal} onChange={(x) => patch({ deal: x as Deal })}><option value="buy">{u.buy}</option><option value="rent">{u.rent}</option></Sel></Label>
        <Label text={u.type}><Sel value={f.type} onChange={(x) => patch({ type: x as Filters['type'] })}><option value="">{u.anyType}</option>{TYPES.map((tp) => <option key={tp} value={tp}>{u[tp]}</option>)}</Sel></Label>
        <Label text={u.rooms}><Sel value={f.rooms} onChange={(x) => patch({ rooms: Number(x) })}><option value={0}>{u.anyRooms}</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}</Sel></Label>
        <Label text={u.location}><Sel value={f.loc} onChange={(x) => patch({ loc: x })}><option value="">{u.anyLoc}</option>{d.locs.map((l) => <option key={l} value={l}>{l}</option>)}</Sel></Label>
        <Label text={`${u.priceMin} (${MARKET_CURRENCY[lang]})`}><input className={inputCls} style={field} inputMode="numeric" value={f.min} onChange={(e) => patch({ min: e.target.value })} /></Label>
        <Label text={`${u.priceMax} (${MARKET_CURRENCY[lang]})`}><input className={inputCls} style={field} inputMode="numeric" value={f.max} onChange={(e) => patch({ max: e.target.value })} /></Label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{fill(u.results, { n: String(list.length) })}</p>
        <div className="flex items-center gap-2">
          <GhostBtn onClick={() => setF({ deal: f.deal, type: '', rooms: 0, min: '', max: '', loc: '', sort: 'new' })}>{u.reset}</GhostBtn>
          <div className="w-48"><Sel value={f.sort} onChange={(x) => patch({ sort: x as Filters['sort'] })} >
            <option value="new">{u.sortNew}</option><option value="asc">{u.sortPriceAsc}</option><option value="desc">{u.sortPriceDesc}</option><option value="area">{u.sortArea}</option>
          </Sel></div>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl p-8 text-center text-sm flex flex-col items-center gap-3" style={{ ...card, color: 'var(--color-ink-muted)' }}>
          {u.noResults}<PrimaryBtn onClick={() => go('search')}>{u.srTitle}</PrimaryBtn>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((l) => <Card key={l.id} l={l} idx={idxOf(l)} u={u} fm={fm} onOpen={() => setOpenId(l.id)} />)}
        </div>
      )}
    </div>
  );

  const pageDefs: { role: Role; label: string; icon: IconName; badge?: number; render: () => ReactNode }[] = [
    { role: 'home', label: u.navHome, icon: 'home', render: () => home },
    { role: 'list', label: u.navList, icon: 'search', render: () => listings },
    { role: 'val', label: u.navVal, icon: 'money', render: () => <Valuation key={lang} u={u} lang={lang} onSend={send} onInbox={() => go('inbox')} /> },
    { role: 'search', label: u.navSearch, icon: 'clipboard', render: () => <SearchReq key={lang} u={u} lang={lang} onSend={send} onInbox={() => go('inbox')} /> },
    { role: 'inbox', label: u.navInbox, icon: 'inbox', badge: newCount, render: () => <Inbox reqs={reqs} u={u} setStatus={setStatus} /> },
  ];

  return (
    <>
      <SiteShell domain={d.domain} brand={{ name: d.name, tagline: d.tagline, initials: d.initials }}
        pages={pageDefs.map((p) => ({ key: S[p.role], label: p.label, icon: p.icon, badge: p.badge, render: p.render }))}
        cta={{ label: u.cta, page: S.val }}
        active={S[role]}
        onActiveChange={(k) => go((Object.keys(S) as Role[]).find((r) => S[r] === k) ?? 'home')}
        footer={(
          <div className="flex flex-wrap gap-x-8 gap-y-1 justify-between">
            <span>{d.name} · {d.address}</span>
            <span>{u.call}: {d.phone} · {d.mail}</span>
            <span>{d.hours}</span>
            <span>© {new Date().getFullYear()} {d.name}. {u.footRights}</span>
          </div>
        )} />
      {node}
    </>
  );
}
