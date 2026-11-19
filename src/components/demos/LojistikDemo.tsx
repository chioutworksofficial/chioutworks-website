import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import SiteShell from './SiteShell';
import { Icon, type IconName, type ShellTab } from './AppShell';
import { Pill, PrimaryBtn, GhostBtn, Label, inputCls, field, card, useToast, uid, type DemoProps } from './ui';
import { fill } from '../../lib/demoAccess';
import { LOJISTIK_UI } from './i18n/lojistik';
import { LOJISTIK_DATA, type Job } from './data/lojistik';

interface Req { id: string; kind: 'quote' | 'job'; name: string; org: string; summary: string; ref: string; date: Date; status: 0 | 1 | 2; file?: string }

const ink = 'var(--color-ink-strongest)';
const muted = 'var(--color-ink-muted)';
const ERR = 'var(--color-feature-error)';
const heading: CSSProperties = { color: ink };
const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const SERVICE_ICONS: IconName[] = ['globe', 'inbox', 'clipboard', 'clock', 'file'];

function Photo({ icon, caption, h = 'h-40' }: { icon: IconName; caption: string; h?: string }) {
  return (
    <div className={`${h} rounded-2xl flex flex-col items-center justify-center gap-2 text-xs font-semibold`}
      style={{ background: 'linear-gradient(135deg, var(--color-lime-soft), var(--color-surface-raised))', border: '1px solid var(--color-border-card)', color: ink }}>
      <Icon name={icon} size={28} />
      <span style={{ color: muted }}>{caption}</span>
    </div>
  );
}

export default function LojistikDemo({ lang }: DemoProps) {
  const u = LOJISTIK_UI[lang];
  const d = LOJISTIK_DATA[lang];
  const { show, node } = useToast();
  const fmtDate = (x: Date) => x.toLocaleDateString(d.locale);
  const nf = (n: number) => n.toLocaleString(d.locale);

  const [active, setActive] = useState('home');
  const [svc, setSvc] = useState(0);
  const [applying, setApplying] = useState<Job | null>(null);
  const [appDone, setAppDone] = useState<string | null>(null);
  const [quoteDone, setQuoteDone] = useState<Req | null>(null);
  const [filter, setFilter] = useState<'all' | 'quote' | 'job'>('all');
  const [reqs, setReqs] = useState<Req[]>(() => d.seed.map((s, i) => ({
    id: uid(), kind: s.kind, name: s.name, org: s.org, summary: s.summary, status: s.status,
    ref: `${d.prefix}-${new Date().getFullYear()}-${String(4180 + i * 17)}`,
    date: new Date(Date.now() - s.daysAgo * 864e5),
    file: s.kind === 'job' ? s.summary.split(': ').pop() : undefined,
  })));

  const defaultPickup = useMemo(() => isoDay(new Date(Date.now() + 2 * 864e5)), []);
  const emptyQ = { service: 'road', fromPost: '', fromCity: '', toPost: '', toCity: '', pallets: '', weight: '', pickup: defaultPickup, goods: d.goods[0], haz: 'no', company: '', person: '', email: '', phone: '' };
  const [q, setQ] = useState(emptyQ);
  const [qErr, setQErr] = useState<string[]>([]);
  const emptyA = { name: '', email: '', phone: '', licence: d.licences[d.licences.length - 1], msg: '', file: '' };
  const [a, setA] = useState(emptyA);
  const [aErr, setAErr] = useState<string[]>([]);

  const rel = (x: Date) => {
    const n = Math.round((Date.now() - x.getTime()) / 864e5);
    if (n <= 0) return u.today;
    if (n === 1) return u.yesterday;
    return fill(u.daysAgo, { n: String(n) });
  };
  const go = (k: string) => { setActive(k); };
  const errStyle = (bad: boolean, key: string, errs: string[]): CSSProperties => (errs.includes(key) && bad ? { ...field, borderColor: ERR } : field);

  // ---------- Home ----------
  const home = () => (
    <div className="max-w-7xl mx-auto space-y-12">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Pill tone="lime">{d.short}</Pill>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-4" style={heading}>{u.heroTitle}</h1>
          <p className="text-base mb-6" style={{ color: muted }}>{u.heroSub}</p>
          <div className="flex flex-wrap gap-3">
            <PrimaryBtn onClick={() => go('quote')}>{u.cta}</PrimaryBtn>
            <GhostBtn onClick={() => go('services')}>{u.seeServices}</GhostBtn>
          </div>
        </div>
        <Photo icon="globe" caption={d.brand} h="h-64" />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([[u.nVehicles, d.numbers.vehicles], [u.nSqm, d.numbers.sqm], [u.nDaily, d.numbers.daily], [u.nYears, d.numbers.years]] as const).map(([l, v]) => (
          <div key={l} className="rounded-2xl p-5" style={card}>
            <p className="text-3xl font-black tracking-tight" style={heading}>{nf(v)}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: muted }}>{l}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4" style={heading}>{u.servicesTeaser}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {d.services.slice(0, 4).map((s, i) => (
            <button key={s.id} type="button" onClick={() => { setSvc(i); go('services'); }} className="rounded-2xl p-5 text-left flex flex-col gap-2" style={card}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-lime-soft)', color: ink }}><Icon name={SERVICE_ICONS[i]} /></span>
              <span className="text-sm font-bold" style={heading}>{s.title}</span>
              <span className="text-xs" style={{ color: muted }}>{s.desc}</span>
              <span className="text-xs font-bold mt-auto" style={heading}>{u.learnMore} →</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold mb-3 text-center" style={{ color: muted }}>{u.clientsTitle}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {d.clients.map((c) => (
            <div key={c} className="rounded-xl px-3 py-4 text-center text-xs font-bold" style={{ ...card, color: muted }}>{c}</div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4" style={heading}>{u.newsTitle}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {d.news.map((n) => (
            <article key={n.title} className="rounded-2xl p-5 flex flex-col gap-2" style={card}>
              <p className="text-[11px] font-semibold" style={{ color: muted }}>{fmtDate(new Date(Date.now() - n.daysAgo * 864e5))}</p>
              <h3 className="text-sm font-bold" style={heading}>{n.title}</h3>
              <p className="text-sm" style={{ color: muted }}>{n.body}</p>
              <button type="button" onClick={() => show(u.readToast)} className="text-xs font-bold text-left" style={heading}>{u.read} →</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );

  // ---------- Services ----------
  const services = () => {
    const s = d.services[svc];
    return (
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[260px_1fr] gap-6">
        <div className="flex lg:flex-col gap-2 overflow-x-auto">
          {d.services.map((x, i) => (
            <button key={x.id} type="button" onClick={() => setSvc(i)} aria-pressed={i === svc}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left whitespace-nowrap"
              style={i === svc ? { background: 'var(--color-lime-300)', color: ink, border: '1px solid var(--color-lime-300)' } : { ...card, color: ink }}>
              <Icon name={SERVICE_ICONS[i]} size={16} /> {x.title}
            </button>
          ))}
        </div>
        <div className="rounded-2xl p-6 space-y-5" style={card}>
          <div>
            <h2 className="text-2xl font-black tracking-tight" style={heading}>{s.title}</h2>
            <p className="text-sm mt-1" style={{ color: muted }}>{s.desc}</p>
          </div>
          <Photo icon={SERVICE_ICONS[svc]} caption={s.title} h="h-32" />
          <div>
            <h3 className="text-sm font-bold mb-2" style={heading}>{u.included}</h3>
            <ul className="space-y-1.5">
              {s.includes.map((it) => (
                <li key={it} className="flex gap-2 text-sm" style={{ color: muted }}>
                  <span style={{ color: 'var(--color-feature-success)' }}><Icon name="check" size={16} /></span>{it}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)' }}>
              <p className="text-[11px] font-semibold mb-1" style={{ color: muted }}>{u.customers}</p>
              <p className="text-sm font-semibold" style={heading}>{s.customers}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)' }}>
              <p className="text-[11px] font-semibold mb-1" style={{ color: muted }}>{u.capacity}</p>
              <p className="text-sm font-semibold" style={heading}>{s.capacity}</p>
            </div>
          </div>
          <PrimaryBtn onClick={() => { setQ((p) => ({ ...p, service: s.id })); go('quote'); }}>{u.quoteForService}</PrimaryBtn>
        </div>
      </div>
    );
  };

  // ---------- Locations ----------
  const locations = () => (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-black tracking-tight mb-5" style={heading}>{u.locTitle}</h2>
      <div className="grid lg:grid-cols-3 gap-4">
        {d.locations.map((l) => (
          <article key={l.city} className="rounded-2xl p-5 flex flex-col gap-4" style={card}>
            <Photo icon="globe" caption={`${u.mapLabel} · ${l.city}`} h="h-28" />
            <div>
              <h3 className="text-lg font-bold" style={heading}>{l.city}</h3>
              <p className="text-xs" style={{ color: muted }}>{l.note}</p>
            </div>
            <p className="text-sm" style={heading}>{l.address}</p>
            <dl className="text-sm space-y-2">
              <div><dt className="text-[11px] font-semibold" style={{ color: muted }}>{u.contact}</dt><dd style={heading}>{l.person}, {l.role}</dd><dd style={{ color: muted }}>{l.phone} · {l.email}</dd></div>
              <div><dt className="text-[11px] font-semibold" style={{ color: muted }}>{u.hours}</dt><dd style={heading}>{l.hours}</dd></div>
            </dl>
            <div className="flex gap-2 mt-auto">
              <PrimaryBtn onClick={() => show(fill(u.callToast, { phone: l.phone }))}>{u.call}</PrimaryBtn>
              <GhostBtn onClick={() => show(u.routeToast)}>{u.route}</GhostBtn>
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  // ---------- Careers ----------
  const submitApp = () => {
    const bad: string[] = [];
    if (!a.name.trim()) bad.push('name');
    if (!/^\S+@\S+\.\S+$/.test(a.email)) bad.push('email');
    if (!a.file) bad.push('file');
    setAErr(bad);
    if (bad.length || !applying) { if (bad.length) show(u.required, true); return; }
    const r: Req = {
      id: uid(), kind: 'job', name: a.name.trim(), org: applying.title, status: 0, date: new Date(), file: a.file,
      ref: `${d.prefix}-${new Date().getFullYear()}-${4300 + reqs.length}`,
      summary: `${a.licence}, ${a.file}`,
    };
    setReqs((p) => [r, ...p]);
    setAppDone(a.name.trim());
    setApplying(null);
    setA(emptyA);
    show(u.appToast);
  };

  const careers = () => (
    <div className="max-w-4xl mx-auto">
      {appDone ? (
        <div className="rounded-2xl p-8 text-center space-y-3" style={card}>
          <span className="inline-flex w-12 h-12 rounded-full items-center justify-center" style={{ background: 'var(--color-feature-success)', color: 'var(--color-surface-raised)' }}><Icon name="check" size={24} /></span>
          <h2 className="text-xl font-bold" style={heading}>{u.appSent}</h2>
          <p className="text-sm" style={{ color: muted }}>{fill(u.appSentText, { name: appDone })}</p>
          <div className="flex justify-center gap-2 pt-2">
            <PrimaryBtn onClick={() => setAppDone(null)}>{u.backToJobs}</PrimaryBtn>
            <GhostBtn onClick={() => { setAppDone(null); go('owner'); }}>{u.viewOwner}</GhostBtn>
          </div>
        </div>
      ) : applying ? (
        <form noValidate onSubmit={(e) => { e.preventDefault(); submitApp(); }} className="rounded-2xl p-6 space-y-4" style={card}>
          <h2 className="text-lg font-bold" style={heading}>{fill(u.applyFor, { job: applying.title })}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Label text={u.name}><input className={inputCls} style={errStyle(!a.name.trim(), 'name', aErr)} value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} /></Label>
            <Label text={u.email}><input type="email" className={inputCls} style={errStyle(!/^\S+@\S+\.\S+$/.test(a.email), 'email', aErr)} value={a.email} onChange={(e) => setA({ ...a, email: e.target.value })} /></Label>
            <Label text={u.phone}><input type="tel" placeholder={d.phonePh} className={inputCls} style={field} value={a.phone} onChange={(e) => setA({ ...a, phone: e.target.value })} /></Label>
            <Label text={u.licence}>
              <select className={inputCls} style={field} value={a.licence} onChange={(e) => setA({ ...a, licence: e.target.value })}>
                {d.licences.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Label>
          </div>
          <Label text={u.cv}>
            <input type="file" accept=".pdf,.doc,.docx" className={inputCls} style={errStyle(!a.file, 'file', aErr)}
              onChange={(e) => setA({ ...a, file: e.target.files?.[0]?.name ?? '' })} />
            <span className="block text-[11px] mt-1" style={{ color: muted }}>{a.file || u.noFile} · {u.cvHint}</span>
          </Label>
          <Label text={u.message}><textarea rows={3} className={inputCls} style={field} value={a.msg} onChange={(e) => setA({ ...a, msg: e.target.value })} /></Label>
          <div className="flex gap-2">
            <PrimaryBtn type="submit">{u.send}</PrimaryBtn>
            <GhostBtn onClick={() => { setApplying(null); setAErr([]); }}>{u.cancel}</GhostBtn>
          </div>
        </form>
      ) : (
        <>
          <h2 className="text-2xl font-black tracking-tight" style={heading}>{u.careersTitle}</h2>
          <p className="text-sm mb-5" style={{ color: muted }}>{u.careersSub}</p>
          <div className="space-y-3">
            {d.jobs.map((j) => (
              <article key={j.id} className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3" style={card}>
                <div className="flex-1">
                  <h3 className="text-sm font-bold" style={heading}>{j.title}</h3>
                  <div className="flex flex-wrap gap-1.5 my-1.5"><Pill>{j.place}</Pill><Pill>{j.type}</Pill>{j.licence && <Pill tone="lime">{u.licenceReq}</Pill>}</div>
                  <p className="text-sm" style={{ color: muted }}>{j.desc}</p>
                </div>
                <PrimaryBtn onClick={() => { setApplying(j); setAErr([]); if (j.licence) setA((p) => ({ ...p, licence: d.licences[2] })); }}>{u.apply}</PrimaryBtn>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ---------- Quote ----------
  const submitQuote = () => {
    const bad: string[] = [];
    (['fromPost', 'fromCity', 'toPost', 'toCity', 'company', 'person'] as const).forEach((k) => { if (!q[k].trim()) bad.push(k); });
    if (!(Number(q.pallets) > 0)) bad.push('pallets');
    if (!(Number(q.weight) > 0)) bad.push('weight');
    if (!q.pickup) bad.push('pickup');
    if (!/^\S+@\S+\.\S+$/.test(q.email)) bad.push('email');
    setQErr(bad);
    if (bad.length) { show(u.required, true); return; }
    const svcTitle = d.services.find((s) => s.id === q.service)?.title ?? '';
    const r: Req = {
      id: uid(), kind: 'quote', name: q.person.trim(), org: q.company.trim(), status: 0, date: new Date(),
      ref: `${d.prefix}-${new Date().getFullYear()}-${4300 + reqs.length}`,
      summary: `${q.pallets} · ${q.weight} kg · ${q.fromPost} ${q.fromCity} → ${q.toPost} ${q.toCity} · ${q.goods}${q.haz === 'yes' ? ' · ADR' : ''} · ${svcTitle}`,
    };
    setReqs((p) => [r, ...p]);
    setQuoteDone(r);
    show(u.quoteToast);
  };
  const qf = (k: keyof typeof q, text: string, extra?: { type?: string; ph?: string }) => (
    <Label text={text}>
      <input type={extra?.type ?? 'text'} placeholder={extra?.ph} className={inputCls} style={errStyle(!String(q[k]).trim() || (k === 'pallets' || k === 'weight' ? !(Number(q[k]) > 0) : false) || (k === 'email' ? !/^\S+@\S+\.\S+$/.test(q.email) : false), k, qErr)}
        value={q[k]} min={extra?.type === 'number' ? 1 : undefined} onChange={(e) => setQ({ ...q, [k]: e.target.value })} />
    </Label>
  );

  const quote = () => (
    <div className="max-w-3xl mx-auto">
      {quoteDone ? (
        <div className="rounded-2xl p-8 space-y-4" style={card}>
          <div className="text-center space-y-2">
            <span className="inline-flex w-12 h-12 rounded-full items-center justify-center" style={{ background: 'var(--color-feature-success)', color: 'var(--color-surface-raised)' }}><Icon name="check" size={24} /></span>
            <h2 className="text-xl font-bold" style={heading}>{u.quoteSent}</h2>
            <p className="text-sm" style={{ color: muted }}>{u.quoteSentText}</p>
          </div>
          <div className="rounded-xl p-4 space-y-1.5 text-sm" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)' }}>
            <p className="text-[11px] font-semibold" style={{ color: muted }}>{u.refLabel}</p>
            <p className="text-lg font-black" style={{ ...heading, fontFamily: '"IBM Plex Mono", monospace' }}>{quoteDone.ref}</p>
            <p className="text-[11px] font-semibold pt-2" style={{ color: muted }}>{u.summary}</p>
            <p style={heading}>{quoteDone.org} · {quoteDone.name}</p>
            <p style={{ color: muted }}>{quoteDone.summary}</p>
            {q.haz === 'yes' && <p className="text-xs font-semibold" style={heading}>{u.hazNote}</p>}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <PrimaryBtn onClick={() => go('owner')}>{u.viewOwner}</PrimaryBtn>
            <GhostBtn onClick={() => { setQuoteDone(null); setQ(emptyQ); setQErr([]); }}>{u.newRequest}</GhostBtn>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={(e) => { e.preventDefault(); submitQuote(); }} className="rounded-2xl p-6 space-y-5" style={card}>
          <div>
            <h2 className="text-2xl font-black tracking-tight" style={heading}>{u.quoteTitle}</h2>
            <p className="text-sm" style={{ color: muted }}>{u.quoteSub}</p>
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold mb-2" style={heading}>{u.secShipment}</legend>
            <Label text={u.service}>
              <select className={inputCls} style={field} value={q.service} onChange={(e) => setQ({ ...q, service: e.target.value })}>
                {d.services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {qf('fromPost', u.fromPost, { ph: d.postPh })}{qf('fromCity', u.fromCity)}
              {qf('toPost', u.toPost)}{qf('toCity', u.toCity)}
              {qf('pallets', u.pallets, { type: 'number' })}{qf('weight', u.weight, { type: 'number' })}
              <Label text={u.pickup}><input type="date" min={isoDay(new Date())} className={inputCls} style={errStyle(!q.pickup, 'pickup', qErr)} value={q.pickup} onChange={(e) => setQ({ ...q, pickup: e.target.value })} /></Label>
              <Label text={u.goods}>
                <select className={inputCls} style={field} value={q.goods} onChange={(e) => setQ({ ...q, goods: e.target.value })}>
                  {d.goods.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Label>
            </div>
            <div role="radiogroup" aria-label={u.hazardous} className="flex items-center gap-4 text-sm" style={heading}>
              <span className="font-semibold">{u.hazardous}</span>
              {(['yes', 'no'] as const).map((v) => (
                <label key={v} className="flex items-center gap-1.5">
                  <input type="radio" name="haz" checked={q.haz === v} onChange={() => setQ({ ...q, haz: v })} /> {v === 'yes' ? u.yes : u.no}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold mb-2" style={heading}>{u.secContact}</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {qf('company', u.company)}{qf('person', u.contactPerson)}
              {qf('email', u.email, { type: 'email' })}
              <Label text={u.phone}><input type="tel" placeholder={d.phonePh} className={inputCls} style={field} value={q.phone} onChange={(e) => setQ({ ...q, phone: e.target.value })} /></Label>
            </div>
          </fieldset>
          <PrimaryBtn type="submit">{u.submitQuote}</PrimaryBtn>
        </form>
      )}
    </div>
  );

  // ---------- Owner view ----------
  const owner = () => {
    const list = reqs.filter((r) => filter === 'all' || r.kind === filter);
    const tone = (s: number) => (s === 2 ? 'success' : s === 1 ? 'lime' : 'neutral') as 'success' | 'lime' | 'neutral';
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-2xl font-black tracking-tight" style={heading}>{u.ownerTitle}</h2><Pill tone="lime">{u.ownerBadge}</Pill></div>
          <p className="text-sm" style={{ color: muted }}>{u.ownerSub}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([['all', u.all], ['quote', u.quotes], ['job', u.applications]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={filter === k} className="rounded-lg px-3 py-1.5 text-xs font-bold"
              style={filter === k ? { background: 'var(--color-lime-300)', color: ink } : { ...card, color: ink }}>
              {l} ({k === 'all' ? reqs.length : reqs.filter((r) => r.kind === k).length})
            </button>
          ))}
        </div>
        {list.length === 0 && <p className="text-sm py-6 text-center" style={{ color: muted }}>{u.empty}</p>}
        <div className="space-y-3">
          {list.map((r) => (
            <article key={r.id} className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3" style={card}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-lime-soft)', color: ink }}><Icon name={r.kind === 'quote' ? 'file' : 'team'} /></span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <Pill>{r.kind === 'quote' ? u.kindQuote : u.kindJob}</Pill>
                  <span className="text-[11px]" style={{ color: muted, fontFamily: '"IBM Plex Mono", monospace' }}>{r.ref}</span>
                  <span className="text-[11px]" style={{ color: muted }}>{u.received}: {fmtDate(r.date)} ({rel(r.date)})</span>
                </div>
                <p className="text-sm font-bold" style={heading}>{r.name} · {r.org}</p>
                <p className="text-sm break-words" style={{ color: muted }}>{r.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone={tone(r.status)}>{u.status[r.status]}</Pill>
                <select aria-label={u.statusLabel} className="rounded-lg px-2 py-1.5 text-xs" style={field} value={r.status}
                  onChange={(e) => { const s = Number(e.target.value) as 0 | 1 | 2; setReqs((p) => p.map((x) => (x.id === r.id ? { ...x, status: s } : x))); show(u.statusToast); }}>
                  {u.status.map((l, i) => <option key={l} value={i}>{l}</option>)}
                </select>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  };

  const defs: [string, string, IconName, () => ReactNode, number?][] = [
    ['home', u.pHome, 'home', home], ['services', u.pServices, 'clipboard', services], ['locations', u.pLocations, 'globe', locations],
    ['careers', u.pCareers, 'team', careers], ['quote', u.pQuote, 'file', quote], ['owner', u.pOwner, 'inbox', owner, reqs.filter((r) => r.status === 0).length],
  ];
  const pages: ShellTab[] = defs.map(([k, label, icon, render, badge]) => ({ key: u.slugs[k as keyof typeof u.slugs], label, icon, render, badge }));
  const keyOf = (k: string) => u.slugs[k as keyof typeof u.slugs];
  const logical = (slug: string) => defs.find(([k]) => keyOf(k) === slug)?.[0] ?? 'home';

  return (
    <>
      <SiteShell domain={d.domain} brand={{ name: d.brand, tagline: d.tagline, initials: d.initials }} pages={pages}
        cta={{ label: u.cta, page: keyOf('quote') }} active={keyOf(active)} onActiveChange={(s) => setActive(logical(s))}
        footer={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>© {new Date().getFullYear()} {d.short}. {u.footerRights}</span>
            <button type="button" onClick={() => show(u.footerToast)}>{u.imprint}</button>
            <button type="button" onClick={() => show(u.footerToast)}>{u.privacy}</button>
            <span className="w-full md:w-auto md:ml-auto">{u.footerDemo}</span>
          </div>
        } />
      {node}
    </>
  );
}
