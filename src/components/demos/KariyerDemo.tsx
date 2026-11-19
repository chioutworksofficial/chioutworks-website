import { useMemo, useState } from 'react';
import { useMoneyFormatter } from '../../lib/currency';
import { fill } from '../../lib/demoAccess';
import SiteShell from './SiteShell';
import { Icon } from './AppShell';
import { Stat, Label, PrimaryBtn, GhostBtn, Pill, card, field, inputCls, useToast, uid, type DemoProps } from './ui';
import { KARIYER_UI } from './i18n/kariyer';
import { KARIYER_DATA, type Area, type Contract, type Job, type SeedApp, type Status } from './data/kariyer';

interface App extends Omit<SeedApp, 'startIn'> { start: Date }
const ink = { color: 'var(--color-ink-strongest)' } as const;
const muted = { color: 'var(--color-ink-muted)' } as const;
const AREAS: Area[] = ['production', 'sales', 'driver', 'office', 'apprentice'];
const CONTRACTS: Contract[] = ['full', 'part', 'mini'];
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function KariyerDemo({ lang }: DemoProps) {
  const u = KARIYER_UI[lang];
  const d = KARIYER_DATA[lang];
  const formatMoney = useMoneyFormatter();
  const { show, node } = useToast();
  const fmtDate = (dt: Date) => dt.toLocaleDateString(d.locale, { day: 'numeric', month: 'long', year: 'numeric' });

  const [page, setPage] = useState('');
  const [fBranch, setFBranch] = useState('all');
  const [fArea, setFArea] = useState('all');
  const [fContract, setFContract] = useState('all');
  const [selJob, setSelJob] = useState<string | null>(null);
  const [selBranch, setSelBranch] = useState<number | null>(null);
  const [showLd, setShowLd] = useState(false);
  const [ownerBranch, setOwnerBranch] = useState('all');
  const [apps, setApps] = useState<App[]>(() => d.apps.map(({ startIn, ...a }) => ({ ...a, start: addDays(startIn) })));
  const [done, setDone] = useState<{ name: string; branch: string } | null>(null);
  const [err, setErr] = useState('');
  const emptyForm = { name: '', phone: '', email: '', branch: '', job: '', start: iso(addDays(7)), note: '', cv: '' };
  const [form, setForm] = useState(emptyForm);
  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const jobs = useMemo(() => d.jobs.map((j) => ({ ...j, startDate: addDays(j.startIn) })), [d]);
  const jobCount = (b: number) => jobs.filter((j) => j.branch === b).length;
  const newCount = apps.filter((a) => a.status === 'new').length;
  const filtered = jobs.filter((j) => (fBranch === 'all' || j.branch === +fBranch) && (fArea === 'all' || j.area === fArea) && (fContract === 'all' || j.contract === fContract));
  const jobById = (id: string) => d.jobs.find((j) => j.id === id);
  const payText = (j: Job) => fill(j.unit === 'h' ? u.perHour : u.perMonth, { x: formatMoney(j.pay) });

  const go = (k: string) => { setPage(k); setSelJob(null); setSelBranch(null); };
  const applyFor = (j: Job | null, b?: number) => {
    setForm({ ...emptyForm, job: j?.id ?? '', branch: String(j ? j.branch : b ?? ''), start: iso(j ? addDays(j.startIn) : addDays(7)) });
    setDone(null); setErr(''); setPage(d.slugs[3]); setSelJob(null); setSelBranch(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = form.phone.replace(/\D/g, '');
    if (!form.name.trim() || digits.length < 6) return setErr(u.required);
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setErr(u.badEmail);
    if (form.branch === '') return setErr(u.pickBranch);
    const b = +form.branch;
    setApps((a) => [{ id: uid(), name: form.name.trim(), phone: form.phone, email: form.email, branch: b, job: form.job, start: new Date(form.start), note: form.note, cv: form.cv, status: 'new', ago: lang === 'tr' ? 'Az önce' : lang === 'de' ? 'gerade eben' : lang === 'el' ? 'μόλις τώρα' : 'Just now' }, ...a]);
    setDone({ name: form.name.trim(), branch: d.branches[b].name });
    setErr(''); show(u.sentToast);
  };
  const setStatus = (id: string, s: Status, msg: string) => { setApps((a) => a.map((x) => (x.id === id ? { ...x, status: s } : x))); show(msg); };

  const select = (value: string, onChange: (v: string) => void, opts: [string, string][]) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={field}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  const photo = (icon: 'home' | 'gift' | 'star', caption: string, h = 'h-40') => (
    <div className={`${h} rounded-2xl flex flex-col items-center justify-center gap-2`} style={{ background: 'linear-gradient(135deg, var(--color-lime-soft), var(--color-surface-raised))', border: '1px solid var(--color-border-card)', ...ink }}>
      <Icon name={icon} size={32} /><span className="text-xs font-semibold" style={muted}>{caption}</span>
    </div>
  );

  const jobCard = (j: Job & { startDate: Date }) => (
    <button key={j.id} type="button" onClick={() => setSelJob(j.id)} className="text-left rounded-2xl p-5 flex flex-col gap-3" style={card}>
      <span className="flex flex-wrap gap-1.5"><Pill tone="lime">{u.areas[j.area]}</Pill><Pill>{u.contracts[j.contract]}</Pill></span>
      <span className="text-base font-bold" style={ink}>{j.title}</span>
      <span className="text-sm flex flex-wrap gap-x-4 gap-y-1" style={muted}>
        <span>{d.branches[j.branch].name}</span><span>{payText(j)}</span><span>{fmtDate(j.startDate)}</span>
      </span>
    </button>
  );

  const home = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={ink}>{u.heroTitle}</h1>
          <p className="text-base mb-5" style={muted}>{u.heroText}</p>
          <div className="flex flex-wrap gap-2"><PrimaryBtn onClick={() => go(d.slugs[1])}>{u.heroBtn1}</PrimaryBtn><GhostBtn onClick={() => applyFor(null)}>{u.heroBtn2}</GhostBtn></div>
        </div>
        {photo('home', d.brand.name, 'h-56')}
      </section>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={u.statBranches} value={d.branches.length} accent /><Stat label={u.statTeam} value={d.employees} />
        <Stat label={u.statJobs} value={jobs.length} /><Stat label={u.statSince} value={d.founded} />
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4" style={ink}>{u.benefitsTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {d.benefits.map((b) => (
            <div key={b.title} className="rounded-2xl p-5" style={card}>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--color-lime-soft)', ...ink }}><Icon name={b.icon} /></span>
              <p className="text-sm font-bold mb-1" style={ink}>{b.title}</p><p className="text-sm" style={muted}>{b.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between" style={{ background: 'var(--color-ink-strongest)' }}>
        <div><h2 className="text-xl font-bold mb-1" style={{ color: 'var(--background)' }}>{u.ctaTitle}</h2><p className="text-sm" style={{ color: 'var(--background)', opacity: 0.8 }}>{u.ctaText}</p></div>
        <PrimaryBtn onClick={() => applyFor(null)}>{u.heroBtn2}</PrimaryBtn>
      </section>
    </div>
  );

  const jobDetail = (id: string) => {
    const j = jobs.find((x) => x.id === id)!;
    const at = u.area_text[j.area];
    const ld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'JobPosting', title: j.title, datePosted: iso(new Date()), validThrough: iso(addDays(60)), employmentType: j.contract === 'full' ? 'FULL_TIME' : j.contract === 'part' ? 'PART_TIME' : 'TEMPORARY', hiringOrganization: { '@type': 'Organization', name: d.brand.name }, jobLocation: { '@type': 'Place', address: d.branches[j.branch].address } }, null, 2);
    const list = (items: string[]) => <ul className="space-y-1.5">{items.map((t) => <li key={t} className="flex gap-2 text-sm" style={muted}><span style={{ color: 'var(--color-feature-success)' }}><Icon name="check" size={16} /></span>{t}</li>)}</ul>;
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <GhostBtn onClick={() => setSelJob(null)}>← {u.back}</GhostBtn>
        <div className="rounded-2xl p-5 md:p-7 space-y-5" style={card}>
          <div className="flex flex-wrap gap-1.5"><Pill tone="lime">{u.areas[j.area]}</Pill><Pill>{u.contracts[j.contract]}</Pill><Pill tone="success">{u.googleBadge}</Pill></div>
          <h2 className="text-2xl font-bold tracking-tight" style={ink}>{j.title}</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {([[u.branchH, d.branches[j.branch].name], [u.startDate, fmtDate(j.startDate)], [u.pay, payText(j)], [u.contract, u.contracts[j.contract]]] as [string, string][]).map(([k, v]) => (
              <div key={k}><dt className="text-[11px] font-semibold" style={muted}>{k}</dt><dd className="font-bold" style={ink}>{v}</dd></div>))}
          </dl>
          <div className="grid md:grid-cols-2 gap-5">
            <div><h3 className="text-sm font-bold mb-2" style={ink}>{u.tasks}</h3>{list(at.tasks)}</div>
            <div><h3 className="text-sm font-bold mb-2" style={ink}>{u.requirements}</h3>{list(at.reqs)}</div>
          </div>
          <div><h3 className="text-sm font-bold mb-2" style={ink}>{u.benefitsH}</h3><div className="flex flex-wrap gap-1.5">{d.benefits.slice(0, 4).map((b) => <Pill key={b.title}>{b.title}</Pill>)}</div></div>
          <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)', ...muted }}>
            {u.googleText}{' '}
            <button type="button" onClick={() => setShowLd((v) => !v)} className="font-semibold underline" style={ink}>{showLd ? u.hideData : u.showData}</button>
            {showLd && <pre className="mt-2 overflow-x-auto text-[11px]" style={{ fontFamily: '"IBM Plex Mono", monospace', ...ink }}>{ld}</pre>}
          </div>
          <PrimaryBtn onClick={() => applyFor(j)}>{u.applyNow}</PrimaryBtn>
        </div>
      </div>
    );
  };

  const jobsPage = () => {
    if (selJob) return jobDetail(selJob);
    const dirty = fBranch !== 'all' || fArea !== 'all' || fContract !== 'all';
    return (
      <div className="max-w-7xl mx-auto space-y-5">
        <div><h2 className="text-2xl font-bold tracking-tight" style={ink}>{u.jobsTitle}</h2><p className="text-sm" style={muted}>{u.jobsSub}</p></div>
        <div className="rounded-2xl p-4 grid sm:grid-cols-3 gap-3" style={card}>
          <Label text={u.branch}>{select(fBranch, setFBranch, [['all', u.all], ...d.branches.map((b, i) => [String(i), b.name] as [string, string])])}</Label>
          <Label text={u.area}>{select(fArea, setFArea, [['all', u.all], ...AREAS.map((a) => [a, u.areas[a]] as [string, string])])}</Label>
          <Label text={u.contract}>{select(fContract, setFContract, [['all', u.all], ...CONTRACTS.map((c) => [c, u.contracts[c]] as [string, string])])}</Label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold" style={ink} aria-live="polite">{fill(u.results, { n: String(filtered.length) })}</p>
          {dirty && <GhostBtn onClick={() => { setFBranch('all'); setFArea('all'); setFContract('all'); }}>{u.reset}</GhostBtn>}
        </div>
        {filtered.length ? <div className="grid md:grid-cols-2 gap-3">{filtered.map(jobCard)}</div> : <p className="rounded-2xl p-8 text-center text-sm" style={{ ...card, ...muted }}>{u.noResults}</p>}
      </div>
    );
  };

  const branchesPage = () => {
    if (selBranch !== null) {
      const b = d.branches[selBranch];
      const bj = jobs.filter((j) => j.branch === selBranch);
      return (
        <div className="max-w-5xl mx-auto space-y-5">
          <GhostBtn onClick={() => setSelBranch(null)}>← {u.back}</GhostBtn>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5 space-y-3" style={card}>
              <h2 className="text-2xl font-bold" style={ink}>{b.name}</h2>
              <p className="text-sm" style={muted}>{b.address}</p><p className="text-sm font-semibold" style={ink}>{b.phone}</p>
              <table className="w-full text-sm"><tbody>{u.days.map((day, i) => <tr key={day} style={{ borderTop: '1px solid var(--color-border-card)' }}><td className="py-2" style={muted}>{day}</td><td className="py-2 text-right font-semibold" style={ink}>{b.hours[i]}</td></tr>)}</tbody></table>
            </div>
            <div className="rounded-2xl min-h-56 relative overflow-hidden" style={{ background: 'var(--color-lime-soft)', border: '1px solid var(--color-border-card)' }} role="img" aria-label={u.mapPlaceholder}>
              {[20, 45, 70].map((p) => <span key={p} className="absolute left-0 right-0 h-px" style={{ top: `${p}%`, background: 'var(--color-border-card)' }} />)}
              {[25, 55, 80].map((p) => <span key={p} className="absolute top-0 bottom-0 w-px" style={{ left: `${p}%`, background: 'var(--color-border-card)' }} />)}
              <span className="absolute left-[55%] top-[45%] -translate-x-1/2 -translate-y-full w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-ink-strongest)', color: 'var(--color-lime-300)' }}><Icon name="home" size={16} /></span>
              <span className="absolute bottom-3 left-3 text-xs font-semibold rounded-lg px-2 py-1" style={{ background: 'var(--color-surface-raised)', ...ink }}>{u.mapPlaceholder}: {b.name}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold" style={ink}>{u.jobsAtBranch}</h3>
          {bj.length ? <div className="grid md:grid-cols-2 gap-3">{bj.map(jobCard)}</div> : (
            <div className="rounded-2xl p-6 text-sm flex flex-wrap items-center gap-3" style={{ ...card, ...muted }}>{u.noJobsHere}<GhostBtn onClick={() => applyFor(null, selBranch)}>{u.heroBtn2}</GhostBtn></div>)}
        </div>
      );
    }
    return (
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-4">
        {d.branches.map((b, i) => (
          <div key={b.name} className="rounded-2xl p-5 space-y-3" style={card}>
            <div className="flex items-center justify-between gap-2"><h3 className="text-lg font-bold" style={ink}>{b.name}</h3><Pill tone="lime">{fill(u.openJobsHere, { n: String(jobCount(i)) })}</Pill></div>
            <p className="text-sm" style={muted}>{b.address}</p>
            <table className="w-full text-sm"><caption className="sr-only">{u.hours}</caption><tbody>{u.days.map((day, k) => <tr key={day} style={{ borderTop: '1px solid var(--color-border-card)' }}><td className="py-1.5" style={muted}>{day}</td><td className="py-1.5 text-right font-semibold" style={ink}>{b.hours[k]}</td></tr>)}</tbody></table>
            <PrimaryBtn onClick={() => setSelBranch(i)}>{u.viewBranch}</PrimaryBtn>
          </div>
        ))}
      </div>
    );
  };

  const applyPage = () => (
    <div className="max-w-2xl mx-auto">
      {done ? (
        <div className="rounded-3xl p-8 text-center space-y-3" style={card}>
          <span className="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--color-feature-success)', color: 'var(--color-surface-raised)' }}><Icon name="check" size={24} /></span>
          <h2 className="text-xl font-bold" style={ink}>{u.doneTitle}</h2>
          <p className="text-sm" style={muted}>{fill(u.doneText, done)}</p>
          <div className="flex flex-wrap justify-center gap-2"><PrimaryBtn onClick={() => go(d.slugs[4])}>{u.seeOwner}</PrimaryBtn><GhostBtn onClick={() => applyFor(null)}>{u.another}</GhostBtn></div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="rounded-3xl p-5 md:p-7 space-y-4" style={card}>
          <div><h2 className="text-2xl font-bold tracking-tight" style={ink}>{u.applyTitle}</h2><p className="text-sm" style={muted}>{u.applySub}</p></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Label text={u.name}><input className={inputCls} style={field} value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /></Label>
            <Label text={u.phone}><input className={inputCls} style={field} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" /></Label>
            <Label text={u.email}><input className={inputCls} style={field} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" /></Label>
            <Label text={u.earliest}><input className={inputCls} style={field} type="date" value={form.start} onChange={(e) => set('start', e.target.value)} /></Label>
            <Label text={u.prefBranch}>{select(form.branch, (v) => set('branch', v), [['', '—'], ...d.branches.map((b, i) => [String(i), b.name] as [string, string])])}</Label>
            <Label text={u.position}>{select(form.job, (v) => { set('job', v); const j = jobById(v); if (j) set('branch', String(j.branch)); }, [['', u.initiative], ...d.jobs.map((j) => [j.id, j.title] as [string, string])])}</Label>
          </div>
          <Label text={u.note}><textarea rows={3} className={inputCls} style={field} placeholder={u.notePh} value={form.note} onChange={(e) => set('note', e.target.value)} /></Label>
          <Label text={u.cv}>
            <span className="flex items-center gap-3 text-sm" style={muted}>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => set('cv', e.target.files?.[0]?.name ?? '')} className="text-xs max-w-full" aria-label={u.cvChoose} />
              {!form.cv && <span className="text-xs">{u.cvNone}</span>}
            </span>
          </Label>
          {err && <p role="alert" className="text-sm font-semibold" style={{ color: 'var(--color-feature-error)' }}>{err}</p>}
          <PrimaryBtn type="submit">{u.submit}</PrimaryBtn>
        </form>
      )}
    </div>
  );

  const ownerPage = () => {
    const list = apps.filter((a) => ownerBranch === 'all' || a.branch === +ownerBranch);
    const tone = (s: Status) => (s === 'hired' ? 'success' : s === 'new' ? 'lime' : 'neutral');
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-2xl font-bold tracking-tight" style={ink}>{u.ownerTitle}</h2><p className="text-sm" style={muted}>{u.ownerSub}</p></div>
          <div className="w-52">{select(ownerBranch, setOwnerBranch, [['all', u.allBranches], ...d.branches.map((b, i) => [String(i), b.name] as [string, string])])}</div>
        </div>
        {list.length === 0 && <p className="rounded-2xl p-8 text-center text-sm" style={{ ...card, ...muted }}>{u.noApps}</p>}
        {list.map((a) => (
          <article key={a.id} className="rounded-2xl p-5 space-y-3" style={card}>
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <h3 className="text-base font-bold" style={ink}>{a.name}</h3>
              <span className="flex items-center gap-2">{a.status === 'new' && <Pill tone="lime">{u.newBadge}</Pill>}<Pill tone={tone(a.status)}>{u.status[a.status]}</Pill><span className="text-xs" style={muted}>{a.ago}</span></span>
            </div>
            <p className="text-sm" style={muted}>{u.appliedFor}: <b style={ink}>{jobById(a.job)?.title ?? u.initiative}</b> · {d.branches[a.branch].name} · {u.startsFrom} {fmtDate(a.start)}</p>
            <p className="text-sm" style={muted}>{a.phone}{a.email && ` · ${a.email}`}</p>
            {a.note && <p className="text-sm rounded-xl p-3" style={{ background: 'var(--background)', ...muted }}>{u.noteH}: {a.note}</p>}
            {a.cv && <p className="text-xs font-semibold flex items-center gap-1.5" style={ink}><Icon name="file" size={14} />{u.cvH}: {a.cv}</p>}
            {(a.status === 'new' || a.status === 'invited') && (
              <div className="flex flex-wrap gap-2">
                {a.status === 'new' ? <PrimaryBtn onClick={() => setStatus(a.id, 'invited', u.toastInvited)}>{u.invite}</PrimaryBtn> : <PrimaryBtn onClick={() => setStatus(a.id, 'hired', u.toastHired)}>{u.hire}</PrimaryBtn>}
                <GhostBtn onClick={() => setStatus(a.id, 'declined', u.toastDeclined)}>{u.decline}</GhostBtn>
              </div>
            )}
          </article>
        ))}
      </div>
    );
  };

  const pages = [
    { key: d.slugs[0], label: u.tabs.home, icon: 'home' as const, render: home },
    { key: d.slugs[1], label: u.tabs.jobs, icon: 'clipboard' as const, badge: jobs.length, render: jobsPage },
    { key: d.slugs[2], label: u.tabs.branches, icon: 'globe' as const, render: branchesPage },
    { key: d.slugs[3], label: u.tabs.apply, icon: 'file' as const, render: applyPage },
    { key: d.slugs[4], label: u.tabs.owner, icon: 'inbox' as const, badge: newCount, render: ownerPage },
  ];

  return (
    <>
      <SiteShell domain={d.domain} brand={d.brand} pages={pages} cta={{ label: u.cta, page: d.slugs[1] }} active={page || d.slugs[0]} onActiveChange={go}
        footer={<div className="flex flex-wrap justify-between gap-2"><span>© {new Date().getFullYear()} {d.brand.name}. {u.footer}</span><span>{d.email}</span></div>} />
      {node}
    </>
  );
}
