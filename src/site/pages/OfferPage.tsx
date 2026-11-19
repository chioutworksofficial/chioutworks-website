import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LogoMark } from '../Logo';
import { OFFER_UI } from '../offerUi';
import { termsIn } from '../offerGlossary';
import ContractStep from '../ContractStep';
import { isLang } from '../../lib/routes';
import type { Lang } from '../../translations';

interface Msg { id: string; from: 'client' | 'owner'; text: string; at: string }
interface Offer {
  lang: Lang; currency: string; company: string; contact: string; title: string; message: string;
  items: { title: string; detail: string; amount: number }[]; total: number; depositPct: number; installments: number;
  monthly: number; monthlyIncludes: string; validUntil: string; status: 'sent' | 'accepted' | 'declined'; expired: boolean;
  acceptedAt: string | null; paid: boolean; messages: Msg[]; contractSigned?: boolean; contractAt?: string | null; contractLang?: Lang; pay?: import('../ContractStep').PayState; project?: string | null;
}

const LOCALE: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };

/** Private offer page: the client reads the priced offer, asks questions and accepts. Language = the offer's language (no switcher, no mixing). */
export default function OfferPage() {
  const { lang: urlLang, slug: token = '' } = useParams(); // route: /:lang/:page/:slug (the offer token is the last part)
  const [data, setData] = useState<Offer | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'invalid'>('loading');
  const [name, setName] = useState(''); const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [msg, setMsg] = useState(''); const [msgBusy, setMsgBusy] = useState(false); const [msgErr, setMsgErr] = useState('');

  const lang: Lang = data?.lang ?? (isLang(urlLang) ? urlLang : 'en');
  const u = OFFER_UI[lang];

  const load = useCallback(() => {
    fetch(`/api/offer/${encodeURIComponent(token)}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: Offer) => { setData(j); setState('ok'); }).catch(() => setState('invalid'));
  }, [token]);
  useEffect(() => { load(); }, [load]);
  // Pick up the owner's replies without a manual reload
  useEffect(() => { if (state !== 'ok') return; const t = setInterval(load, 30_000); return () => clearInterval(t); }, [state, load]);

  useEffect(() => {
    document.title = u.tabTitle; document.documentElement.lang = lang;
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'; document.head.appendChild(m);
    return () => { m.remove(); };
  }, [u.tabTitle, lang]);

  const fmt = (n: number) => new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: data?.currency || 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  const fmtDate = (s: string) => new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: 'medium' }).format(new Date(s.length === 10 ? `${s}T12:00:00` : s));
  const fmtTime = (s: string) => new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: 'short', timeStyle: 'short' }).format(new Date(s));

  const accept = async () => {
    if (!name.trim() || !confirm) { setErr(u.acceptErr); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/offer/${encodeURIComponent(token)}/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), confirm: true }) });
      if (!r.ok) throw new Error(String(r.status));
      setData(await r.json());
    } catch { setErr(u.acceptErr); }
    setBusy(false);
  };
  const send = async () => {
    if (!msg.trim()) return;
    setMsgBusy(true); setMsgErr('');
    try {
      const r = await fetch(`/api/offer/${encodeURIComponent(token)}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: msg.trim() }) });
      if (!r.ok) throw new Error(String(r.status));
      setData(await r.json()); setMsg('');
    } catch { setMsgErr(u.sendErr); }
    setMsgBusy(false);
  };

  const card: React.CSSProperties = { padding: 28, marginBottom: 20 };
  const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--c-quartz)', margin: '0 0 14px' };
  const input: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 'var(--r-input)', border: '1px solid var(--c-hairline)', background: 'var(--c-abyss)', color: 'var(--c-quartz)', fontFamily: 'inherit', fontSize: 15 };
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--c-edge)' };

  const shell = (children: React.ReactNode) => (
    <div data-site-theme="liquid" data-mode-lock="" lang={lang} style={{ minHeight: '100dvh', background: 'var(--c-void)', color: 'var(--c-mist)' }}>
      <header style={{ borderBottom: '1px solid var(--c-edge)', background: 'var(--c-abyss)' }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-3"><LogoMark size={26} /><span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.14em', fontSize: 13, color: 'var(--c-quartz)' }}>CHIOUT<span style={{ color: 'var(--c-lilac)' }}>WORKS</span></span></span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-ash)' }}>{u.brand}</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-10">{children}</main>
    </div>
  );

  if (state === 'loading') return shell(<p style={{ color: 'var(--c-ash)' }}>{u.loading}</p>);
  if (state === 'invalid' || !data) return shell(
    <div className="lq-card" style={card}>
      <h1 style={{ ...h2, fontSize: 28 }}>{u.invalidTitle}</h1>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{u.invalidBody}</p>
    </div>);

  const dep = Math.round(data.total * data.depositPct) / 100;
  const rest = data.total - dep;
  const inst = data.installments > 0 ? Math.round((rest / data.installments) * 100) / 100 : 0;
  const open = data.status === 'sent' && !data.expired;

  return shell(<>
    <p style={{ fontSize: 17, margin: '0 0 6px' }}>{u.hello(data.contact.split(' ')[0] ?? '')}</p>
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--c-quartz)', margin: '0 0 16px', lineHeight: 1.2 }}>{data.title || data.company || u.brand}</h1>
    {data.message && <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: '0 0 28px' }}>{data.message}</p>}

    {data.status === 'accepted' && <ContractStep token={token} lang={data.contractLang ?? lang} signed={!!data.contractSigned} onSigned={load} pay={data.pay} currency={data.currency} project={data.project} />}
    {data.status === 'accepted' && data.paid && (
      <div className="lq-card" style={{ ...card, borderColor: 'var(--c-signal)' }} role="status">
        <h2 style={h2}>{u.acceptedTitle}</h2>
        <p style={{ margin: 0, lineHeight: 1.6 }}>{u.paidBody}</p>
      </div>)}
    {data.expired && data.status === 'sent' && <div className="lq-card" style={card} role="status"><p style={{ margin: 0 }}>{u.expired}</p></div>}

    <section className="lq-card" style={card} aria-label={u.items}>
      <h2 style={h2}>{u.items}</h2>
      {data.items.map((it, i) => (
        <div key={i} style={row}>
          <span><span style={{ color: 'var(--c-quartz)', fontWeight: 500 }}>{it.title}</span>{it.detail && <span style={{ display: 'block', fontSize: 14, color: 'var(--c-ash)', marginTop: 4, lineHeight: 1.5 }}>{it.detail}</span>}</span>
          <span style={{ whiteSpace: 'nowrap', color: 'var(--c-quartz)' }}>{fmt(it.amount)}</span>
        </div>))}
      <div style={{ ...row, borderBottom: 'none', fontWeight: 600, color: 'var(--c-quartz)', fontSize: 17 }}><span>{u.total}</span><span>{fmt(data.total)}</span></div>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--c-ash)' }}>{u.vatNote}</p>
    </section>

    {(() => {
      const terms = termsIn([data.title, data.message, data.monthlyIncludes, ...data.items.flatMap((it) => [it.title, it.detail])]);
      return terms.length ? (
        <section className="lq-card" style={card} aria-label={u.glossary}>
          <h2 style={h2}>{u.glossary}</h2>
          <dl style={{ margin: 0, display: 'grid', gap: 12 }}>
            {terms.map((g) => <div key={g.name}><dt style={{ color: 'var(--c-quartz)', fontWeight: 500 }}>{g.name}</dt><dd style={{ margin: '2px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--c-mist)' }}>{g.t[lang]}</dd></div>)}
          </dl>
        </section>) : null;
    })()}

    <section className="lq-card" style={card} aria-label={u.payment}>
      <h2 style={h2}>{u.payment}</h2>
      {data.depositPct > 0 && <div style={row}><span>{u.deposit} · %{data.depositPct}</span><span style={{ color: 'var(--c-quartz)' }}>{fmt(dep)}</span></div>}
      {rest > 0 && Array.from({ length: data.installments }, (_, i) => (
        <div key={i} style={row}><span>{u.installment(i + 1, data.installments)}</span><span style={{ color: 'var(--c-quartz)' }}>{fmt(inst)}</span></div>))}
      {data.monthly > 0 && <div style={{ ...row, borderBottom: 'none' }}><span>{u.monthly}</span><span style={{ color: 'var(--c-quartz)' }}>{fmt(data.monthly)} {u.perMonth}</span></div>}
      {data.monthly > 0 && data.monthlyIncludes && <p style={{ margin: '4px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--c-ash)' }}><b style={{ fontWeight: 500 }}>{u.monthlyIncludes}:</b> {data.monthlyIncludes}</p>}
      {data.validUntil && <p style={{ margin: '14px 0 0', fontSize: 14, color: 'var(--c-ash)' }}>{u.validUntil}: {fmtDate(data.validUntil)}</p>}
    </section>

    {open && (
      <section className="lq-card" style={card} aria-label={u.acceptTitle}>
        <h2 style={h2}>{u.acceptTitle}</h2>
        <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }} htmlFor="offer-name">{u.acceptName}</label>
        <input id="offer-name" style={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 14, fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}>
          <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} style={{ marginTop: 3 }} />{u.acceptConfirm}
        </label>
        {err && <p role="alert" style={{ color: 'var(--c-lilac)', fontSize: 14, margin: '12px 0 0' }}>{err}</p>}
        <button type="button" className="lq-btn-ghost" style={{ marginTop: 18 }} onClick={accept} disabled={busy}>{busy ? u.accepting : u.accept}</button>
      </section>)}

    <section className="lq-card" style={card} aria-label={u.questions}>
      <h2 style={h2}>{u.questions}</h2>
      <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.6, color: 'var(--c-ash)' }}>{u.questionsIntro}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {data.messages.length === 0 ? <p style={{ margin: 0, fontSize: 14, color: 'var(--c-ash)' }}>{u.noMessages}</p>
          : data.messages.map((m) => (
            <div key={m.id} style={{ alignSelf: m.from === 'client' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '10px 14px', borderRadius: 'var(--r-card)', background: m.from === 'client' ? 'var(--c-cobalt)' : 'var(--c-deep-sea)', border: '1px solid var(--c-hairline)' }}>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--c-ash)', marginBottom: 4 }}>{m.from === 'client' ? u.you : u.me} · {fmtTime(m.at)}</span>
              <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, color: 'var(--c-quartz)' }}>{m.text}</span>
            </div>))}
      </div>
      <textarea style={{ ...input, minHeight: 96, resize: 'vertical' }} placeholder={u.msgPh} aria-label={u.msgPh} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} />
      {msgErr && <p role="alert" style={{ color: 'var(--c-lilac)', fontSize: 14, margin: '10px 0 0' }}>{msgErr}</p>}
      <button type="button" className="lq-btn-ghost" style={{ marginTop: 12 }} onClick={send} disabled={msgBusy || !msg.trim()}>{msgBusy ? u.sending : u.send}</button>
    </section>
  </>);
}
