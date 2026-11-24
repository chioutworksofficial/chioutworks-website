import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../translations';
import { WIZ_UI } from './i18n/wizard';
import { guardFields } from '../lib/formGuard';
import { StyleInline, ExamplesInline, emptyStyle, emptyEx, styleBody, normUrl, URL_RE, type StyleVal, type ExVal } from './StyleInline';

// Post-call request wizard (owner, 2026-11-20): 1 details → 2 style → 3 examples → send, all inline on one page.
// A server draft (voice session id + secret) and sessionStorage keep it for 24 h; nothing reaches the owner before "Send".
export interface WizCard { service: string; business: string; city: string; firstName: string; lastName: string; phone: string; email: string; notes: string }
export interface WizDraft { step: number; card: Record<string, string>; style?: { likes: string[]; pal: string; pair: string; own: Record<string, string | boolean> } | null; ex?: ExVal | null }
const KEY = 'cw-req-wiz';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VISUAL_RE = /web|site|sayfa|tasar[ıi]m|design|uygulama|\bapp\b|qr|logo|görsel|visual|brand|marka|kurumsal|portfolio|shop|mağaza|σχεδ|ιστο|εφαρμογ|λογότυπ|gestalt|grafik|seite|anwendung|auftritt|onlineshop/i;
const cleanName = (s: string) => s.replace(/[<>"&\u0000-\u001f]/g, '').trim().slice(0, 40);

/** Restore: server draft first (24 h), sessionStorage as fallback. Returns null when nothing usable. */
export async function loadWizardDraft(): Promise<{ id: string; secret: string; lang?: string; draft: WizDraft } | null> {
  try {
    const l = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as { id: string; secret: string; at: number; draft: WizDraft } | null;
    if (!l?.id || Date.now() - l.at > 24 * 3600_000) return null;
    try {
      const r = await fetch('/api/voice/draft/load', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: l.id, secret: l.secret }) });
      if (r.ok) return { id: l.id, secret: l.secret, draft: ((await r.json()) as { draft: WizDraft }).draft };
      if (r.status === 404) { sessionStorage.removeItem(KEY); return null; }
    } catch { /* offline: use the local copy */ }
    return { id: l.id, secret: l.secret, draft: l.draft };
  } catch { return null; }
}

export default function RequestWizard({ lang, initial, restored, getSession, onClose, channel }: {
  lang: Lang; initial: WizCard; restored?: WizDraft | null; channel?: 'email' | 'phone' | 'whatsapp'; getSession: () => Promise<{ id: string; secret: string } | null>; onClose: () => void;
}) {
  const w = WIZ_UI[lang];
  const [c, setC] = useState<Record<string, string>>(() => restored?.card ?? { ...initial, site: '', contactWhen: '', startWhen: '', budget: '' });
  const [step, setStep] = useState(restored?.step ?? 1);
  const [sv, setSv] = useState<StyleVal>(() => restored?.style ?? emptyStyle());
  const [ex, setEx] = useState<ExVal>(() => restored?.ex ?? emptyEx());
  const [skipStyle, setSkipStyle] = useState(false);
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const set = (k: string, v: string) => setC((o) => ({ ...o, [k]: v }));

  const mailOk = EMAIL_RE.test(c.email.trim()), phoneDigits = c.phone.replace(/\D/g, '').length >= 7, phoneOptional = channel === 'email', phoneOk = phoneDigits || (phoneOptional && !c.phone.trim());   // phone only required when Phone / WhatsApp was chosen
  const missing = ['firstName', 'lastName', 'business', 'city', 'service'].filter((k) => !c[k].trim());
  const valid = missing.length === 0 && mailOk && phoneOk;
  const visual = VISUAL_RE.test(`${c.service} ${c.notes}`);
  const steps = visual ? w.steps : w.stepsShort;

  const draft = (): WizDraft => ({ step, card: c, style: sv, ex });
  // local copy on every change; server copy at each step change
  useEffect(() => { void getSession().then((s) => { if (s) try { sessionStorage.setItem(KEY, JSON.stringify({ ...s, at: Date.now(), draft: draft() })); } catch { /* storage full */ } }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [c, step, sv, ex]);
  const saveDraft = async () => {
    const s = await getSession(); if (!s) return;
    try { await fetch('/api/voice/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: s.id, secret: s.secret, draft: draft() }) }); } catch { /* local copy remains */ }
  };
  const go = (n: number) => { setStep(n); setErr(''); top.current?.scrollIntoView({ block: 'start' }); };
  const next1 = () => {
    setTouched(true);
    if (!valid) { setErr(!mailOk && c.email.trim() ? w.badEmail : !phoneOk && c.phone.trim() ? w.badPhone : w.fixFields); return; }
    if (c.site.trim() && !URL_RE.test(normUrl(c.site))) { setErr(w.badUrl); return; }
    void saveDraft(); go(visual ? 2 : 3);
  };

  const submit = async () => {
    const urls = ex.none || !visual ? [] : ex.urls.map(normUrl).filter(Boolean);
    if (urls.some((u) => !URL_RE.test(u))) { setErr(w.badUrl); return; }
    setBusy(true); setErr('');
    try {
      const s = await getSession(); if (!s) throw new Error();
      const name = [cleanName(c.firstName), cleanName(c.lastName)].filter(Boolean).join(' ');
      const r = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(await guardFields()), name, email: c.email.trim(), phone: c.phone.trim(), business: c.business.trim(), city: c.city.trim(), message: c.service.trim().slice(0, 1000), replyPreference: 'written', ...(channel ? { preferredChannel: channel } : {}), via: 'assistant', lang, page: window.location.pathname, voiceSessionId: s.id, voiceSecret: s.secret,
          wiz: { site: c.site.trim() ? normUrl(c.site) : '', contactWhen: c.contactWhen, startWhen: c.startWhen, budget: c.budget, notes: c.notes.trim(), exUrls: urls, exNote: ex.none ? '' : ex.note.trim(), exNone: ex.none,
            style: visual && !skipStyle && sv.likes.length ? styleBody(sv) : null } }),
      });
      if (!r.ok) throw new Error(String(r.status));
      try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
      setSent(true);
    } catch { setErr(w.err); }
    setBusy(false);
  };

  const inp: React.CSSProperties = { padding: '10px 14px', borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 15, width: '100%', boxSizing: 'border-box' };
  const btn: React.CSSProperties = { borderRadius: 'var(--lq-radius-sm)', padding: '12px 20px', fontSize: 15, cursor: 'pointer', border: '1px solid var(--lq-line-strong)', background: 'transparent', color: 'var(--lq-white)', fontFamily: 'inherit' };
  const primary: React.CSSProperties = { ...btn, borderRadius: 9999, background: 'color-mix(in srgb, var(--c-lilac) 14%, var(--c-abyss))', border: '1px solid var(--c-lilac)', letterSpacing: '0.08em', fontSize: 13.5, fontWeight: 500 };
  const field = (k: string, label: string, req: boolean, type = 'text', max = 100) => {
    const bad = touched && req && !c[k].trim();
    return (
      <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--lq-silver)' }}>
        {label}{req ? ' *' : ''}
        <input type={type} aria-required={req || undefined} aria-invalid={bad || undefined} value={c[k]} maxLength={max} onChange={(e) => set(k, e.target.value)} style={{ ...inp, ...(bad ? { borderColor: 'var(--lq-white)' } : {}) }} />
      </label>);
  };
  const select = (k: string, label: string, opts: [string, string][]) => (
    <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--lq-silver)' }}>{label}
      <select value={c[k]} onChange={(e) => set(k, e.target.value)} style={inp}><option value="">{w.choose}</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </label>);

  if (sent) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ margin: 0, textAlign: 'center', fontSize: 'clamp(20px, 3vw, 26px)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{w.doneTitle}</h2>
      <p role="status" style={{ textAlign: 'center', color: 'var(--lq-silver)', lineHeight: 1.6, margin: 0 }}>{w.doneBody}</p>
      <button type="button" style={primary} onClick={onClose}>{w.close}</button>
    </div>);

  return (
    <div ref={top} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ol aria-label={w.title1} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', margin: 0, padding: 0, listStyle: 'none', fontSize: 13 }}>
        {steps.map((s, i) => <li key={s} aria-current={(visual ? step : step === 3 ? 2 : 1) === i + 1 ? 'step' : undefined} style={{ color: (visual ? step : step === 3 ? 2 : 1) === i + 1 ? 'var(--lq-white)' : 'var(--lq-silver)', fontWeight: (visual ? step : step === 3 ? 2 : 1) === i + 1 ? 600 : 400 }}>{s}</li>)}
      </ol>
      {step === 1 && (
        <form noValidate onSubmit={(e) => { e.preventDefault(); next1(); }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ margin: 0, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{w.title1}</h3>
          <p style={{ margin: 0, color: 'var(--lq-silver)', fontSize: 13.5, textAlign: 'center' }}>{w.hint}</p>
          {field('firstName', w.first, true, 'text', 40)}{field('lastName', w.last, true, 'text', 40)}{field('business', w.business, true)}{field('city', w.city, true, 'text', 80)}
          {field('email', w.email, true, 'email', 254)}{field('phone', w.phone, !phoneOptional, 'tel', 40)}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--lq-silver)' }}>{w.need} *
            <textarea value={c.service} maxLength={600} rows={3} aria-required onChange={(e) => set('service', e.target.value)} style={{ ...inp, resize: 'vertical', ...(touched && !c.service.trim() ? { borderColor: 'var(--lq-white)' } : {}) }} />
          </label>
          {field('site', w.site, false, 'url', 200)}
          {select('contactWhen', w.contactWhen, w.cw)}{select('startWhen', w.startWhen, w.sw)}{select('budget', w.budget, w.bg)}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--lq-silver)' }}>{w.notes}
            <textarea value={c.notes} maxLength={600} rows={3} onChange={(e) => set('notes', e.target.value)} style={{ ...inp, resize: 'vertical' }} />
          </label>
          {err && <p role="alert" style={{ margin: 0, color: 'var(--lq-white)', fontSize: 13.5 }}>{err}</p>}
          <button type="submit" style={{ ...primary, opacity: valid ? 1 : 0.5 }} disabled={!valid}>{visual ? w.toStyle : w.toNext}</button>
        </form>)}
      {step === 2 && <>
        <h3 style={{ margin: 0, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{w.styleTitle}</h3>
        <StyleInline lang={lang} v={sv} set={setSv} />
        {err && <p role="alert" style={{ margin: 0, color: 'var(--lq-white)', fontSize: 13.5 }}>{err}</p>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={() => go(1)}>{w.back}</button>
          <button type="button" style={primary} onClick={() => { if (!sv.likes.length) { setErr(w.pickMin); return; } setSkipStyle(false); void saveDraft(); go(3); }}>{w.toNext}</button>
          <button type="button" style={{ ...btn, border: 0, textDecoration: 'underline', fontSize: 13 }} onClick={() => { setSkipStyle(true); void saveDraft(); go(3); }}>{w.skipStyle}</button>
        </div>
      </>}
      {step === 3 && <>
        <h3 style={{ margin: 0, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{visual ? w.exTitle : w.readyTitle}</h3>
        {visual ? <ExamplesInline lang={lang} v={ex} set={setEx} /> : <p style={{ margin: 0, color: 'var(--lq-silver)', textAlign: 'center' }}>{w.readyText}</p>}
        {err && <p role="alert" style={{ margin: 0, color: 'var(--lq-white)', fontSize: 13.5 }}>{err}</p>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={() => go(visual ? 2 : 1)}>{w.back}</button>
          <button type="button" style={primary} disabled={busy} onClick={() => void submit()}>{busy ? w.sending : w.send}</button>
        </div>
      </>}
    </div>
  );
}
