import { useEffect, useState } from 'react';
import { SHOWCASE_UI } from './i18n/showcase';
import { OFFER_UI } from './offerUi';
import type { Lang } from '../translations';

interface Doc { lang: Lang; title: string; parties: string[]; sections: { title: string; body: string[] }[]; footer: string }

/** Contract step on the offer page (after acceptance). The whole step uses the CONTRACT's language (client's country). */
export interface PayState { ready: boolean; test?: boolean; firstPaid: boolean; now: number; monthly: number; restUrl: string | null; portal: boolean; invoices?: { url: string; number: string; test: boolean }[] }

export default function ContractStep({ token, lang, signed, onSigned, pay, currency, project }: { token: string; lang: Lang; signed: boolean; onSigned: () => void; pay?: PayState; currency: string; project?: string | null }) {
  const u = OFFER_UI[lang];
  const [doc, setDoc] = useState<Doc | null>(null);
  const [f, setF] = useState({ company: '', address: '', signer: '', role: '' });
  const [business, setBusiness] = useState(false); const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [open, setOpen] = useState(!signed);
  const [show, setShow] = useState<{ allow: boolean } | null | undefined>(undefined);   // undefined = loading, null = not chosen yet
  const [reload, setReload] = useState(0);
  const s = SHOWCASE_UI[lang];

  useEffect(() => {
    fetch(`/api/offer/${encodeURIComponent(token)}/contract`).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j) return; setShow(j.needShowcase ? null : j.showcase ?? null); setDoc(j.doc ?? null);
      if (j.prefill) setF((x) => ({ ...x, company: x.company || j.prefill.company || '', signer: x.signer || j.prefill.signer || '' }));
    }).catch(() => {});
  }, [token, signed, reload]);

  const choose = async (allow: boolean) => {
    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/offer/${encodeURIComponent(token)}/showcase`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allow }) });
      if (!r.ok) throw new Error();
      setDoc(null); setReload((x) => x + 1);
    } catch { setErr(s.err); }
    setBusy(false);
  };

  const sign = async () => {
    if (!f.company.trim() || !f.address.trim() || !f.signer.trim() || !business || !agree) { setErr(u.cErr); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/offer/${encodeURIComponent(token)}/sign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, business, agree }) });
      if (!r.ok) throw new Error(String(r.status));
      onSigned(); setOpen(false);
    } catch { setErr(u.cErr); }
    setBusy(false);
  };

  const input: React.CSSProperties = { width: '100%', padding: '11px 13px', borderRadius: 'var(--r-input)', border: '1px solid var(--c-hairline)', background: 'var(--c-abyss)', color: 'var(--c-quartz)', fontFamily: 'inherit', fontSize: 15 };
  const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--c-quartz)', margin: '0 0 12px' };

  return (
    <section lang={lang} className="lq-card" style={{ padding: 28, marginBottom: 20, borderColor: signed ? 'var(--c-signal)' : 'var(--c-lilac)' }} aria-label={u.cTitle}>
      <h2 style={h2}>{signed ? `✓ ${u.cSignedTitle}` : u.cTitle}</h2>
      <p style={{ margin: '0 0 16px', lineHeight: 1.6 }}>{signed ? u.cSignedBody : u.cIntro}</p>
      {signed && <a className="lq-btn-ghost" href={`/api/offer/${encodeURIComponent(token)}/contract/view`} target="_blank" rel="noreferrer">{u.cDownload}</a>}
      {signed && pay && <PayBox token={token} lang={lang} pay={pay} currency={currency} onPaid={onSigned} />}
      {signed && project && (
        <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--r-input)', background: 'color-mix(in srgb, var(--c-signal) 14%, var(--c-deep-sea))', border: '1px solid var(--c-signal)' }}>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>✓ {u.projectReady}</p>
          <a className="lq-btn-ghost" href={project}>{u.projectGo} →</a>
        </div>)}
      {signed && !open && <button type="button" style={{ marginLeft: 14, fontSize: 13, color: 'var(--c-lilac)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setOpen(true)}>{u.cOpen}</button>}
      {!signed && show === null && (
        <div style={{ margin: '4px 0 8px', padding: 'clamp(16px, 4vw, 22px)', borderRadius: 'var(--r-input)', background: 'var(--c-deep-sea)', border: '1px solid var(--c-hairline)' }}>
          <h3 style={{ margin: '0 0 6px', color: 'var(--c-quartz)', fontSize: 18, fontFamily: 'var(--font-display)' }}>{s.title}</h3>
          <p style={{ margin: '0 0 16px', lineHeight: 1.6 }}>{s.intro}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 14 }}>
            <div style={{ padding: 16, borderRadius: 'var(--r-input)', border: '1px solid color-mix(in srgb, var(--c-signal) 55%, transparent)', background: 'color-mix(in srgb, var(--c-signal) 10%, transparent)' }}>
              <strong style={{ display: 'block', marginBottom: 8, color: 'var(--c-quartz)' }}>✓ {s.prosTitle}</strong>
              <ul style={{ margin: 0, paddingInlineStart: 18, display: 'grid', gap: 6, lineHeight: 1.55, fontSize: 14 }}>{s.pros.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div style={{ padding: 16, borderRadius: 'var(--r-input)', border: '1px solid var(--c-hairline)' }}>
              <strong style={{ display: 'block', marginBottom: 8, color: 'var(--c-quartz)' }}>ⓘ {s.consTitle}</strong>
              <ul style={{ margin: 0, paddingInlineStart: 18, display: 'grid', gap: 6, lineHeight: 1.55, fontSize: 14, color: 'var(--c-ash)' }}>{s.cons.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            <button type="button" className="lq-btn-ghost" style={{ background: 'var(--c-signal)', color: 'var(--c-on-accent)', borderColor: 'var(--c-signal)' }} disabled={busy} onClick={() => void choose(true)}>{s.yes}</button>
            <button type="button" className="lq-btn-ghost" disabled={busy} onClick={() => void choose(false)}>{s.no}</button>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--c-ash)', lineHeight: 1.5 }}>{s.note}</p>
          {err && <p role="alert" style={{ color: 'var(--c-lilac)', fontSize: 14, margin: '10px 0 0' }}>{err}</p>}
        </div>)}
      {!signed && show && (
        <p style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.5 }}>{show.allow ? s.chosenYes : s.chosenNo}{' '}
          <button type="button" disabled={busy} onClick={() => setShow(null)} style={{ fontSize: 13, color: 'var(--c-lilac)', textDecoration: 'underline', cursor: 'pointer' }}>{s.change}</button></p>)}
      {doc && open && (
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '16px 18px', margin: '16px 0', borderRadius: 'var(--r-input)', background: 'var(--c-deep-sea)', border: '1px solid var(--c-hairline)', fontSize: 14, lineHeight: 1.6 }} tabIndex={0}>
          <h3 style={{ margin: '0 0 10px', color: 'var(--c-quartz)', fontSize: 16 }}>{doc.title}</h3>
          {doc.parties.map((p) => <p key={p} style={{ margin: '0 0 4px' }}>{p}</p>)}
          {doc.sections.map((s) => (
            <div key={s.title} style={{ marginTop: 14 }}>
              <h4 style={{ margin: '0 0 4px', color: 'var(--c-quartz)', fontSize: 14 }}>{s.title}</h4>
              {s.body.map((b, i) => <p key={i} style={{ margin: '0 0 4px' }}>{b}</p>)}
            </div>))}
          <p style={{ marginTop: 14 }}>{doc.footer}</p>
        </div>)}
      {!signed && show && doc && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            <label style={{ fontSize: 13 }}>{u.cCompany} *<input style={input} value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" /></label>
            <label style={{ fontSize: 13 }}>{u.cAddress} *<input style={input} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} autoComplete="street-address" /></label>
            <label style={{ fontSize: 13 }}>{u.cSigner} *<input style={{ ...input, fontFamily: 'var(--font-display)', fontStyle: 'italic' }} value={f.signer} onChange={(e) => setF({ ...f, signer: e.target.value })} autoComplete="name" /></label>
            <label style={{ fontSize: 13 }}>{u.cRole}<input style={input} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></label>
          </div>
          <label style={{ display: 'flex', gap: 10, marginTop: 14, fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}><input type="checkbox" checked={business} onChange={(e) => setBusiness(e.target.checked)} style={{ marginTop: 3 }} />{u.cBusiness}</label>
          <label style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />{u.cAgree}</label>
          {err && <p role="alert" style={{ color: 'var(--c-lilac)', fontSize: 14, margin: '10px 0 0' }}>{err}</p>}
          <button type="button" className="lq-btn-ghost" style={{ marginTop: 16 }} onClick={sign} disabled={busy}>{busy ? u.cSigning : u.cSign}</button>
        </>)}
    </section>
  );
}

function PayBox({ token, lang, pay, currency, onPaid }: { token: string; lang: Lang; pay: PayState; currency: string; onPaid: () => void }) {
  const u = OFFER_UI[lang];
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [testOpen, setTestOpen] = useState(false);
  const testPay = async () => {
    setBusy(true); setErr('');
    try { const r = await fetch(`/api/offer/${encodeURIComponent(token)}/test-pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); if (!r.ok) throw new Error(); onPaid(); }
    catch { setErr(u.payErr); } finally { setBusy(false); }
  };
  const money = (n: number) => new Intl.NumberFormat(lang, { style: 'currency', currency }).format(n);
  const go = async (path: 'checkout' | 'portal') => {
    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/offer/${encodeURIComponent(token)}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const j = await r.json(); if (!r.ok || !j.url) throw new Error();
      window.location.assign(j.url);
    } catch { setErr(u.payErr); setBusy(false); }
  };
  if (!pay.ready && !pay.firstPaid && !pay.restUrl) return null;   // Stripe not configured yet: "payment link follows separately" stays
  return (
    <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--r-input)', background: 'var(--c-deep-sea)', border: '1px solid var(--c-hairline)' }}>
      {pay.firstPaid ? <>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--c-signal)' }}>✓ {u.payDone}</p>
        {(pay.invoices ?? []).map((inv) => <a key={inv.url} href={inv.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 8, color: 'var(--c-lilac)' }}>🧾 {inv.test ? u.invoiceTest : u.invoice} {inv.number}</a>)}
      </> : <>
        <p style={{ margin: '0 0 4px' }}>{u.payNow(money(pay.now))}</p>
        {pay.monthly > 0 && <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--c-ash)' }}>{u.payMonthly(money(pay.monthly))}</p>}
        {!testOpen && <button type="button" className="lq-btn-ghost" onClick={() => (pay.test ? setTestOpen(true) : go('checkout'))} disabled={busy}>🔒 {u.payBtn}</button>}
        {testOpen && (
          <div role="dialog" aria-label={u.payTestTitle} style={{ marginTop: 6, padding: 16, borderRadius: 'var(--r-input)', border: '1px dashed var(--c-lilac)', background: 'var(--c-abyss)' }}>
            <strong style={{ display: 'block', color: 'var(--c-quartz)', marginBottom: 6 }}>🧪 {u.payTestTitle} · {money(pay.now)}</strong>
            <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.55 }}>{u.payTestNote}</p>
            <button type="button" className="lq-btn-ghost" onClick={testPay} disabled={busy}>{u.payTestBtn}</button>
          </div>)}
      </>}
      {pay.restUrl && <a className="lq-btn-ghost" style={{ display: 'inline-block', marginTop: 12 }} href={pay.restUrl}>{u.payRest}</a>}
      {pay.portal && <button type="button" style={{ display: 'block', marginTop: 12, fontSize: 13, color: 'var(--c-lilac)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => go('portal')} disabled={busy}>{u.payPortal}</button>}
      {err && <p role="alert" style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--c-lilac)' }}>{err}</p>}
    </div>
  );
}
