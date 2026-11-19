import { useMemo, useState } from 'react';
import { useMoneyFormatter } from '../../lib/currency';
import { T, type Lang } from '../../translations';
import { fill } from '../../lib/demoAccess';
import AppShell, { Icon, BarChart, RankList, Avatar, type IconName } from './AppShell';
import { Stat, Panel, Label, PrimaryBtn, GhostBtn, Pill, field, inputCls, useToast, uid, card, type DemoProps } from './ui';
import { CRM_UI } from './i18n/crm';
import { CRM_DATA } from './data/crm';

interface Contact { id: string; name: string; company: string; phone: string; channel: number; tags: number[]; value: number; stage: number; last: number }
interface Msg { from: 'c' | 'b'; text: string; at: number }
interface Conv { id: string; name: string; contactId?: string; channel: number; unread: boolean; msgs: Msg[] }
interface Task { id: string; text: string; contactId: string; due: number; done: boolean }

const LOCALES: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };
const CHANNEL_ICON: IconName[] = ['instagram', 'whatsapp', 'globe'];
const sum = (a: number[]) => a.reduce((s, n) => s + n, 0);

export default function CrmDemo({ lang, t }: DemoProps) {
  const k = t.crm;
  const u = CRM_UI[lang];
  const data = CRM_DATA[lang];
  const x = T[lang].demos.extras;
  const formatMoney = useMoneyFormatter();
  const toast = useToast();
  const rtf = useMemo(() => new Intl.RelativeTimeFormat(LOCALES[lang], { numeric: 'auto', style: 'short' }), [lang]);
  const rel = (mins: number) => mins < 2 ? rtf.format(0, 'minute') : mins < 60 ? rtf.format(-mins, 'minute') : mins < 1440 ? rtf.format(-Math.round(mins / 60), 'hour') : rtf.format(-Math.round(mins / 1440), 'day');
  const relDays = (d: number) => rtf.format(-d, 'day');
  const last = k.stages.length - 1;

  const [contacts, setContacts] = useState<Contact[]>(() => data.contacts.map((c, i) => ({ id: `c${i}`, ...c })));
  const [convs, setConvs] = useState<Conv[]>(() => data.conversations.map((c, i) => ({
    id: `v${i}`, name: c.name, contactId: c.contact === undefined ? undefined : `c${c.contact}`, channel: c.channel, unread: c.unread,
    msgs: c.msgs.map(([from, text, at]) => ({ from, text, at })),
  })));
  const [tasks, setTasks] = useState<Task[]>(() => data.tasks.map((tk, i) => ({ id: `t${i}`, text: tk.text, contactId: `c${tk.contact}`, due: tk.due, done: false })));

  const [leadForm, setLeadForm] = useState({ name: '', value: '', source: 0 });
  const [aiFor, setAiFor] = useState<string | null>(null);
  const [sel, setSel] = useState<string>(() => data.conversations.length ? 'v0' : '');
  const [showConv, setShowConv] = useState(false);
  const [reply, setReply] = useState('');
  const [aiDraft, setAiDraft] = useState(false);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState(-1);
  const [cForm, setCForm] = useState({ name: '', company: '', phone: '', channel: 0 });
  const [tForm, setTForm] = useState({ text: '', contactId: 'c0', due: 0 });

  const nameOf = (id: string) => contacts.find((c) => c.id === id)?.name ?? '';
  const unread = convs.filter((c) => c.unread).length;
  const dueNow = tasks.filter((tk) => !tk.done && tk.due <= 0).length;

  // ---------- Pipeline ----------
  const renderPipeline = () => {
    const leads = contacts.filter((c) => c.stage >= 0);
    const open = leads.filter((l) => l.stage < last);
    const won = leads.filter((l) => l.stage === last);
    const conversion = leads.length ? Math.round((won.length / leads.length) * 100) : 0;
    const move = (id: string, delta: number) =>
      setContacts(contacts.map((c) => (c.id === id ? { ...c, stage: Math.min(last, Math.max(0, c.stage + delta)) } : c)));
    const add = (e: React.FormEvent) => {
      e.preventDefault();
      if (!leadForm.name.trim()) return;
      setContacts([...contacts, { id: uid(), name: leadForm.name.trim(), company: '', phone: '', channel: leadForm.source, tags: [0], value: Number(leadForm.value) || 0, stage: 0, last: 0 }]);
      setLeadForm({ name: '', value: '', source: leadForm.source });
      toast.show(t.saved);
    };
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label={k.pipeline} value={formatMoney(sum(open.map((l) => l.value)))} accent />
          <Stat label={k.won} value={formatMoney(sum(won.map((l) => l.value)))} />
          <Stat label={k.conversion} value={`${conversion}%`} />
        </div>
        <Panel title={k.newLead}>
          <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <Label text={k.company}><input value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} className={inputCls} style={field} maxLength={40} /></Label>
            <Label text={k.value}><input inputMode="numeric" value={leadForm.value} onChange={(e) => setLeadForm({ ...leadForm, value: e.target.value.replace(/\D/g, '').slice(0, 7) })} className={inputCls} style={field} /></Label>
            <Label text={k.source}>
              <select value={leadForm.source} onChange={(e) => setLeadForm({ ...leadForm, source: Number(e.target.value) })} className={inputCls} style={field}>
                {k.sources.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </select>
            </Label>
            <PrimaryBtn type="submit" disabled={!leadForm.name.trim()}>{t.add}</PrimaryBtn>
          </form>
        </Panel>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {k.stages.map((stage, si) => {
            const col = leads.filter((l) => l.stage === si);
            return (
              <section key={stage} className="rounded-2xl p-3" style={{ background: si === last ? 'var(--color-lime-soft)' : 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)' }}>
                <div className="flex items-center justify-between px-1 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-ink-strongest)' }}>{stage}</h3>
                  <Pill>{col.length}</Pill>
                </div>
                <ul className="space-y-2 min-h-[60px]">
                  {col.map((l) => {
                    const text = fill(x.aiReplyText, { name: l.name });
                    return (
                      <li key={l.id} className="rounded-xl p-3" style={card}>
                        <p className="text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{l.company || l.name}</p>
                        {l.company && <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{l.name}</p>}
                        <div className="flex items-center justify-between mt-1 mb-2">
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-ink-muted)' }}>{formatMoney(l.value)}</span>
                          <Pill tone="lime">{k.sources[l.channel]}</Pill>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <GhostBtn onClick={() => move(l.id, -1)} disabled={si === 0}>‹ {k.movePrev}</GhostBtn>
                          <GhostBtn onClick={() => move(l.id, 1)} disabled={si === last}>{k.moveNext} ›</GhostBtn>
                          {si < last && <GhostBtn onClick={() => setAiFor(aiFor === l.id ? null : l.id)}>✦ {x.aiReply}</GhostBtn>}
                        </div>
                        {aiFor === l.id && (
                          <div className="mt-2 rounded-lg p-2.5" style={{ background: 'var(--color-lime-soft)' }}>
                            <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-ink-muted)' }}>{x.aiLabel}</p>
                            <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-ink-strongest)' }}>{text}</p>
                            <a target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline underline-offset-2" style={{ color: 'var(--color-ink-strongest)' }}
                              href={`https://wa.me/?text=${encodeURIComponent(text)}`}>{x.openWhatsapp} ↗</a>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------- Inbox ----------
  const renderInbox = () => {
    const conv = convs.find((c) => c.id === sel);
    const contact = conv?.contactId ? contacts.find((c) => c.id === conv.contactId) : undefined;
    const pick = (id: string) => {
      setSel(id); setShowConv(true); setReply(''); setAiDraft(false);
      setConvs(convs.map((c) => (c.id === id ? { ...c, unread: false } : c)));
    };
    const suggest = () => {
      if (!conv) return;
      const lastIn = [...conv.msgs].reverse().find((m) => m.from === 'c')?.text.toLowerCase() ?? '';
      const has = (kws: string[]) => kws.some((w) => lastIn.includes(w));
      const tpl = has(u.ai.complaint_kw) ? u.ai.complaint : has(u.ai.price_kw) ? u.ai.price : has(u.ai.avail_kw) ? u.ai.avail : u.ai.generic;
      setReply(fill(tpl, { name: conv.name.split(' ')[0], shop: data.brand.name }));
      setAiDraft(true);
    };
    const send = (e: React.FormEvent) => {
      e.preventDefault();
      if (!conv || !reply.trim()) return;
      setConvs(convs.map((c) => (c.id === conv.id ? { ...c, msgs: [...c.msgs, { from: 'b', text: reply.trim(), at: 0 }] } : c)));
      setReply(''); setAiDraft(false);
      toast.show(u.inbox.sent);
    };
    const createLead = () => {
      if (!conv) return;
      if (contact) {
        if (contact.stage >= 0) { toast.show(u.inbox.leadExists); return; }
        setContacts(contacts.map((c) => (c.id === contact.id ? { ...c, stage: 0 } : c)));
      } else {
        const id = uid();
        setContacts([...contacts, { id, name: conv.name, company: '', phone: '', channel: conv.channel, tags: [0], value: 0, stage: 0, last: 0 }]);
        setConvs(convs.map((c) => (c.id === conv.id ? { ...c, contactId: id } : c)));
      }
      toast.show(u.inbox.leadCreated);
    };
    const preview = (c: Conv) => c.msgs[c.msgs.length - 1];
    return (
      <div className="grid lg:grid-cols-[300px_1fr] gap-4 lg:h-[560px]">
        <section className={`rounded-2xl overflow-hidden flex flex-col ${showConv ? 'hidden lg:flex' : ''}`} style={card}>
          <h3 className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--color-ink-strongest)', borderBottom: '1px solid var(--color-border-card)' }}>{u.inbox.title}</h3>
          <ul className="overflow-y-auto flex-1 max-h-[480px] lg:max-h-none">
            {convs.map((c) => {
              const m = preview(c);
              const on = c.id === sel;
              return (
                <li key={c.id} style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                  <button type="button" onClick={() => pick(c.id)} className="w-full flex gap-3 px-4 py-3 text-left"
                    style={{ background: on ? 'var(--color-lime-soft)' : 'transparent' }}>
                    <Avatar name={c.name} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-sm truncate" style={{ color: 'var(--color-ink-strongest)', fontWeight: c.unread ? 800 : 600 }}>{c.name}</span>
                        <span style={{ color: 'var(--color-ink-muted)' }}><Icon name={CHANNEL_ICON[c.channel]} size={13} /></span>
                        <span className="ml-auto text-[11px] shrink-0" style={{ color: 'var(--color-ink-muted)' }}>{rel(m.at)}</span>
                      </span>
                      <span className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs truncate flex-1" style={{ color: 'var(--color-ink-muted)' }}>{m.from === 'b' ? `${u.inbox.you}: ` : ''}{m.text}</span>
                        {c.unread && <span className="w-2 h-2 rounded-full shrink-0" aria-label={u.inbox.unread} style={{ background: 'var(--color-feature-success)' }} />}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={`rounded-2xl overflow-hidden flex-col ${showConv ? 'flex' : 'hidden lg:flex'}`} style={card}>
          {conv ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-card)' }}>
                <button type="button" onClick={() => setShowConv(false)} className="lg:hidden text-xs font-semibold px-2 py-1 rounded-lg" style={{ border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strongest)' }}>‹ {u.inbox.back}</button>
                <Avatar name={conv.name} size={32} />
                <span className="min-w-0 mr-auto">
                  <span className="block text-sm font-bold truncate" style={{ color: 'var(--color-ink-strongest)' }}>{conv.name}</span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-ink-muted)' }}><Icon name={CHANNEL_ICON[conv.channel]} size={12} />{k.sources[conv.channel]}</span>
                </span>
                <GhostBtn onClick={createLead}>+ {u.inbox.createLead}</GhostBtn>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[360px] lg:max-h-none" style={{ background: 'var(--background)' }}>
                {conv.msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'b' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[82%] rounded-2xl px-3.5 py-2" style={m.from === 'b'
                      ? { background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)' }
                      : { background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)', color: 'var(--color-ink-strongest)' }}>
                      <p className="text-sm leading-snug">{m.text}</p>
                      <p className="text-[11px] mt-0.5 text-right" style={{ color: 'var(--color-ink-muted)' }}>{rel(m.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="p-3 space-y-2" style={{ borderTop: '1px solid var(--color-border-card)' }}>
                {aiDraft && <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-ink-muted)' }}>✦ {x.aiLabel}</p>}
                <textarea value={reply} onChange={(e) => { setReply(e.target.value); setAiDraft(false); }} rows={3} placeholder={u.inbox.placeholder} className={`${inputCls} resize-none`} style={field} />
                <div className="flex gap-2 justify-between">
                  <GhostBtn onClick={suggest}>✦ {u.inbox.ai}</GhostBtn>
                  <PrimaryBtn type="submit" disabled={!reply.trim()}>{u.inbox.send}</PrimaryBtn>
                </div>
              </form>
            </>
          ) : <p className="p-6 text-sm" style={{ color: 'var(--color-ink-muted)' }}>{u.inbox.empty}</p>}
        </section>
      </div>
    );
  };

  // ---------- Contacts ----------
  const renderContacts = () => {
    const shown = contacts.filter((c) => (tag < 0 || c.tags.includes(tag)) && `${c.name} ${c.company}`.toLowerCase().includes(q.trim().toLowerCase()));
    const add = (e: React.FormEvent) => {
      e.preventDefault();
      if (!cForm.name.trim()) return;
      setContacts([{ id: uid(), name: cForm.name.trim(), company: cForm.company.trim(), phone: cForm.phone.trim(), channel: cForm.channel, tags: [0], value: 0, stage: -1, last: 0 }, ...contacts]);
      setCForm({ name: '', company: '', phone: '', channel: cForm.channel });
      toast.show(u.contacts.added);
    };
    const th = 'text-left text-[11px] font-semibold px-3 py-2 whitespace-nowrap';
    return (
      <div className="space-y-5">
        <Panel title={u.contacts.add}>
          <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <Label text={u.contacts.name}><input value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} className={inputCls} style={field} maxLength={40} /></Label>
            <Label text={u.contacts.company}><input value={cForm.company} onChange={(e) => setCForm({ ...cForm, company: e.target.value })} className={inputCls} style={field} maxLength={40} /></Label>
            <Label text={u.contacts.phone}><input inputMode="tel" value={cForm.phone} onChange={(e) => setCForm({ ...cForm, phone: e.target.value.replace(/[^\d+ ]/g, '').slice(0, 20) })} className={inputCls} style={field} /></Label>
            <Label text={u.contacts.channel}>
              <select value={cForm.channel} onChange={(e) => setCForm({ ...cForm, channel: Number(e.target.value) })} className={inputCls} style={field}>
                {k.sources.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </select>
            </Label>
            <PrimaryBtn type="submit" disabled={!cForm.name.trim()}>{t.add}</PrimaryBtn>
          </form>
        </Panel>
        <section className="rounded-2xl overflow-hidden" style={card}>
          <div className="flex flex-col sm:flex-row gap-3 p-4" style={{ borderBottom: '1px solid var(--color-border-card)' }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={u.contacts.search} className={`${inputCls} sm:flex-1`} style={field} />
            <select value={tag} onChange={(e) => setTag(Number(e.target.value))} className={`${inputCls} sm:w-56`} style={field}>
              <option value={-1}>{u.contacts.allTags}</option>
              {u.tags.map((tg, i) => <option key={tg} value={i}>{tg}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead style={{ color: 'var(--color-ink-muted)', borderBottom: '1px solid var(--color-border-card)' }}>
                <tr><th className={th}>{u.contacts.name}</th><th className={th}>{u.contacts.channel}</th><th className={th}>{u.contacts.tags}</th><th className={th}>{u.contacts.value}</th><th className={th}>{u.contacts.stage}</th><th className={th}>{u.contacts.last}</th></tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid var(--color-border-card)' }}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size={30} />
                        <span className="min-w-0">
                          <span className="block font-semibold" style={{ color: 'var(--color-ink-strongest)' }}>{c.name}</span>
                          <span className="block text-xs" style={{ color: 'var(--color-ink-muted)' }}>{[c.company, c.phone].filter(Boolean).join(' · ')}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-ink-muted)' }}><Icon name={CHANNEL_ICON[c.channel]} size={14} />{k.sources[c.channel]}</span></td>
                    <td className="px-3 py-2.5"><div className="flex flex-wrap gap-1">{c.tags.map((tg) => <Pill key={tg} tone="lime">{u.tags[tg]}</Pill>)}</div></td>
                    <td className="px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-strongest)' }}>{c.value ? formatMoney(c.value) : '–'}</td>
                    <td className="px-3 py-2.5">{c.stage >= 0 ? <Pill tone={c.stage === last ? 'success' : 'neutral'}>{k.stages[c.stage]}</Pill> : <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{u.contacts.noDeal}</span>}</td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: 'var(--color-ink-muted)' }}>{c.last === 0 ? u.contacts.today : relDays(c.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && <p className="p-6 text-sm text-center" style={{ color: 'var(--color-ink-muted)' }}>{u.contacts.empty}</p>}
          </div>
        </section>
      </div>
    );
  };

  // ---------- Tasks ----------
  const renderTasks = () => {
    const add = (e: React.FormEvent) => {
      e.preventDefault();
      if (!tForm.text.trim()) return;
      setTasks([{ id: uid(), text: tForm.text.trim(), contactId: tForm.contactId, due: tForm.due === 2 ? 3 : tForm.due, done: false }, ...tasks]);
      setTForm({ ...tForm, text: '' });
      toast.show(u.tasks.added);
    };
    const toggle = (id: string) => {
      const tk = tasks.find((v) => v.id === id);
      setTasks(tasks.map((v) => (v.id === id ? { ...v, done: !v.done } : v)));
      if (tk && !tk.done) toast.show(u.tasks.doneToast);
    };
    const dueLabel = (d: number) => d < 0 ? u.tasks.overdue : d === 0 ? u.tasks.today : d === 1 ? u.tasks.tomorrow
      : new Date(Date.now() + d * 864e5).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'short' });
    const row = (tk: Task) => (
      <li key={tk.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--color-border-card)' }}>
        <button type="button" onClick={() => toggle(tk.id)} aria-label={tk.text} aria-pressed={tk.done}
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={tk.done ? { background: 'var(--color-feature-success)', color: 'var(--color-surface-raised)' } : { border: '1.5px solid var(--color-ink-muted)', color: 'transparent' }}>
          <Icon name="check" size={14} />
        </button>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold" style={{ color: 'var(--color-ink-strongest)', textDecoration: tk.done ? 'line-through' : 'none', opacity: tk.done ? 0.55 : 1 }}>{tk.text}</span>
          <span className="block text-xs" style={{ color: 'var(--color-ink-muted)' }}>{nameOf(tk.contactId)}</span>
        </span>
        {!tk.done && (tk.due < 0
          ? <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap" style={{ background: 'var(--color-feature-error-soft)', color: 'var(--color-feature-error)' }}>{dueLabel(tk.due)}</span>
          : <Pill tone={tk.due === 0 ? 'lime' : 'neutral'}>{dueLabel(tk.due)}</Pill>)}
      </li>
    );
    const openT = tasks.filter((v) => !v.done).sort((a, b) => a.due - b.due);
    const doneT = tasks.filter((v) => v.done);
    return (
      <div className="space-y-5">
        <Panel title={u.tasks.newTask}>
          <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2"><Label text={u.tasks.text}><input value={tForm.text} onChange={(e) => setTForm({ ...tForm, text: e.target.value })} className={inputCls} style={field} maxLength={80} /></Label></div>
            <Label text={u.tasks.contact}>
              <select value={tForm.contactId} onChange={(e) => setTForm({ ...tForm, contactId: e.target.value })} className={inputCls} style={field}>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Label>
            <Label text={u.tasks.due}>
              <select value={tForm.due} onChange={(e) => setTForm({ ...tForm, due: Number(e.target.value) })} className={inputCls} style={field}>
                {u.tasks.dueOpts.map((o, i) => <option key={o} value={i}>{o}</option>)}
              </select>
            </Label>
            <div className="sm:col-span-4"><PrimaryBtn type="submit" disabled={!tForm.text.trim()}>{t.add}</PrimaryBtn></div>
          </form>
        </Panel>
        <section className="rounded-2xl overflow-hidden" style={card}>
          <h3 className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{u.tasks.open} <Pill>{openT.length}</Pill></h3>
          {openT.length ? <ul>{openT.map(row)}</ul> : <p className="px-4 pb-4 text-sm" style={{ color: 'var(--color-ink-muted)' }}>{u.tasks.noOpen}</p>}
        </section>
        {doneT.length > 0 && (
          <section className="rounded-2xl overflow-hidden" style={card}>
            <h3 className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--color-ink-strongest)' }}>{u.tasks.done} <Pill>{doneT.length}</Pill></h3>
            <ul>{doneT.map(row)}</ul>
          </section>
        )}
      </div>
    );
  };

  // ---------- Reports ----------
  const renderReports = () => {
    const leads = contacts.filter((c) => c.stage >= 0);
    const won = leads.filter((l) => l.stage === last);
    const avg = leads.length ? Math.round(sum(leads.map((l) => l.value)) / leads.length) : 0;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label={u.reports.wonMonth} value={formatMoney(sum(won.map((l) => l.value)))} accent />
          <Stat label={u.reports.avgDeal} value={formatMoney(avg)} />
          <Stat label={u.reports.avgResponse} value={fill(u.reports.minutes, { n: String(data.responseMin) })} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel title={u.reports.byStage}>
            <BarChart data={k.stages.map((s, i) => ({ label: s, value: sum(leads.filter((l) => l.stage === i).map((l) => l.value)) }))} format={(n) => formatMoney(n)} />
          </Panel>
          <Panel title={u.reports.bySource}>
            <RankList items={k.sources.map((s, i) => ({ label: s, value: leads.filter((l) => l.channel === i).length }))} />
            <p className="text-xs mt-4" style={{ color: 'var(--color-ink-muted)' }}>{fill(u.dealsCount, { n: String(leads.length) })}</p>
          </Panel>
        </div>
      </div>
    );
  };

  return (
    <>
      <AppShell
        lang={lang}
        brand={data.brand}
        user={data.user}
        searchPlaceholder={u.searchPlaceholder}
        notificationsTitle={u.notificationsTitle}
        notifications={data.notifications}
        tabs={[
          { key: 'pipeline', label: u.tabs.pipeline, icon: 'pipeline', render: renderPipeline },
          { key: 'inbox', label: u.tabs.inbox, icon: 'inbox', badge: unread, render: renderInbox },
          { key: 'contacts', label: u.tabs.contacts, icon: 'users', render: renderContacts },
          { key: 'tasks', label: u.tabs.tasks, icon: 'check', badge: dueNow, render: renderTasks },
          { key: 'reports', label: u.tabs.reports, icon: 'chart', render: renderReports },
        ]}
      />
      {toast.node}
    </>
  );
}
