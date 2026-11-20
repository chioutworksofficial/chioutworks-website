import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LogoMark } from '../Logo';
import { INTAKE_UI } from '../intakeUi';
import IntakeProgress from '../IntakeProgress';
import { LANGS, intakePath, isLang, pagePath } from '../../lib/routes';
import type { Lang } from '../../translations';
import { StyleCta } from './StylePage';
import type { Definition, L4, QDef } from '../../data/intakeSectors';
import { guardFields, prefetchFormToken } from '../../lib/formGuard';

type Answers = Record<string, string | boolean>;
interface Payload { lang: Lang; secondLang: Lang | null; status: string; definition: Definition; answers: Answers }

const LABEL: Record<Lang, string> = { tr: 'TR', en: 'EN', de: 'DE', el: 'EL' };
const NAME: Record<Lang, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', el: 'Ελληνικά' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Extra helper languages (machine-translated on demand); shown with their own native names. */
const MORE_LANGS = ['az', 'ru', 'uk', 'ar', 'fa', 'ku', 'ka', 'hy', 'bg', 'ro', 'pl', 'cs', 'sk', 'hu', 'sr', 'hr', 'bs', 'sq', 'mk', 'sl', 'it', 'es', 'pt', 'fr', 'nl', 'sv', 'da', 'nb', 'fi', 'et', 'lv', 'lt', 'zh', 'ja', 'ko', 'vi', 'th', 'id', 'ms', 'tl', 'hi', 'ur', 'bn', 'pa', 'ta', 'he', 'am', 'so', 'sw', 'ps', 'uz', 'kk', 'ky', 'tk', 'tg', 'mn'];
const nativeName = (code: string) => { try { const n = new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code; return n.charAt(0).toLocaleUpperCase(code) + n.slice(1); } catch { return code; } };
/** First device language that is not one of the 4 site languages (e.g. 'az'), if any. */
const deviceForeign = (): string | null => {
  const navs = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
  for (const n of navs) { const c = n.slice(0, 2).toLowerCase(); if (!isLang(c) && MORE_LANGS.includes(c)) return c; }
  return null;
};
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
// Untrimmed value for controlled inputs: trimming on every keystroke swallows the space the user just typed
const raw = (v: unknown) => (typeof v === 'string' ? v : '');

const chipStyle = (on: boolean): React.CSSProperties => ({
  display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'left',
  minHeight: 48, padding: '10px 18px', cursor: 'pointer', fontSize: 15, lineHeight: 1.25,
  background: on ? 'var(--c-cobalt)' : 'var(--c-abyss)', border: '1px solid ' + (on ? 'var(--c-lilac)' : 'var(--c-hairline)'), color: 'var(--c-quartz)',
});
function Chip({ on, onClick, label, sub, role, sec }: { on: boolean; onClick: () => void; label: string; sub?: string; role: 'radio' | 'checkbox'; sec: string | null }) {
  return (
    <button type="button" role={role} aria-checked={on} onClick={onClick} style={chipStyle(on)}>
      <span>{label}</span>{sub && <span lang={sec ?? undefined} style={{ fontSize: 12, color: on ? 'var(--c-mist)' : 'var(--c-ash)' }}>{sub}</span>}
    </button>
  );
}

export default function IntakePage() {
  const { lang: langParam, slug: token = '' } = useParams(); // route: /:lang/:page/:slug
  const lang: Lang = isLang(langParam) ? langParam : 'en';
  const u = INTAKE_UI[lang];

  const [data, setData] = useState<Payload | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'invalid'>('loading');
  const [answers, setAnswers] = useState<Answers>({});
  const [def, setDef] = useState<Definition | null>(null);
  const [step, setStep] = useState(0);
  const [second, setSecond] = useState<string | null>(null);
  const [foreign, setForeign] = useState<{ to: string; map: Record<string, string> } | null>(null);
  const [trans, setTrans] = useState<'idle' | 'loading' | 'error'>('idle');
  const [qOpen, setQOpen] = useState<Record<string, boolean>>({});   // per-question translation
  const [helpOpen, setHelpOpen] = useState<Record<string, boolean>>({});
  const [showSecond, setShowSecond] = useState(false);
  const [save, setSave] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [otherOpen, setOtherOpen] = useState<Record<string, boolean>>({});

  const pending = useRef<Answers>({});
  const timer = useRef<number | undefined>(undefined);
  const inflight = useRef<Promise<void>>(Promise.resolve());

  // head: noindex, title, html lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = u.tabTitle;
    const m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, [lang, u.tabTitle]);

  useEffect(() => {
    let live = true;
    fetch(`/api/intake/${encodeURIComponent(token)}`).then(async (r) => {
      if (!live) return;
      if (!r.ok) { setState('invalid'); return; }
      const p = (await r.json()) as Payload;
      setData(p); setDef(p.definition); setAnswers(p.answers);
      setSecond(p.secondLang); setShowSecond(!!p.secondLang);
      setDone(p.status === 'submitted'); setState('ok');
      setOtherOpen(Object.fromEntries(Object.keys(p.answers).filter((k) => k.endsWith('__other')).map((k) => [k.slice(0, -7), true])));
    }).catch(() => live && setState('invalid'));
    return () => { live = false; };
  }, [token]);

  const flush = useCallback((): Promise<void> => {
    window.clearTimeout(timer.current);
    const batch = pending.current;
    if (!Object.keys(batch).length) return inflight.current;
    pending.current = {};
    setSave('saving');
    inflight.current = inflight.current.then(() => fetch(`/api/intake/${encodeURIComponent(token)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: batch }),
    }).then(async (r) => {
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      if (j.definition) setDef(j.definition as Definition);
      setSave(Object.keys(pending.current).length ? 'saving' : 'saved');
    }).catch(() => { pending.current = { ...batch, ...pending.current }; setSave('error'); }));
    return inflight.current;
  }, [token]);

  useEffect(() => () => { void flush(); }, [flush]);

  const set = (k: string, v: string | boolean) => {
    setAnswers((a) => { const n = { ...a }; if (v === '' || v === false) delete n[k]; else n[k] = v; return n; });
    pending.current[k] = v;
    setSave('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), 800);
  };

  const sections = def?.sections ?? [];
  const total = sections.length;
  const isReview = step >= total;
  const cur = sections[Math.min(step, total - 1)];

  const startOk = () => {
    if (!str(answers.meta_company) || !str(answers.meta_contact) || !str(answers.meta_email) || !str(answers.biz_type)) return u.needFields;
    if (!EMAIL_RE.test(str(answers.meta_email))) return u.badEmail;
    if (!def?.wants.length && !['website', 'booking', 'qr', 'automation', 'crm', 'invoices', 'app', 'ai', 'all'].some((k) => answers[`wants__${k}`] === true)) return u.needFields;
    return null;
  };
  const go = async (to: number) => {
    if (step === 0 && to > 0) { const e = startOk(); if (e) { setErr(e); return; } }
    setErr(null);
    await flush();
    setStep(Math.max(0, Math.min(to, total)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    const e = startOk();
    if (e) { setErr(e); return; }
    if (answers.consent !== true) { setErr(u.needConsent); return; }
    setBusy(true); setErr(null);
    try {
      prefetchFormToken();
      await flush();
      const r = await fetch(`/api/intake/${encodeURIComponent(token)}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(await guardFields()) });
      if (!r.ok) throw new Error(String(r.status));
      setDone(true); window.scrollTo({ top: 0 });
    } catch { setErr(u.submitErr); }
    setBusy(false);
  };

  // Second (helper) language: one of the 4 site languages, or any other language translated on demand by the server.
  useEffect(() => {
    if (!second || isLang(second) || foreign?.to === second) return;
    let live = true; setTrans('loading');
    fetch(`/api/intake/${encodeURIComponent(token)}/translate?to=${encodeURIComponent(second)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: { to: string; map: Record<string, string> }) => { if (live) { setForeign(j); setTrans('idle'); } })
      .catch(() => live && setTrans('error'));
    return () => { live = false; };
  }, [second, token, foreign?.to]);
  // Questions change with the sector / wanted services: fetch the helper translation again (server cache makes this cheap)
  useEffect(() => { setForeign(null); }, [def]);
  const helper = second && second !== lang ? second : null;
  const t2 = (x?: L4): string => (!x || !helper ? '' : isLang(helper) ? x[helper] : (foreign?.to === helper ? foreign.map[x.en] ?? '' : ''));
  const sec: string | null = showSecond && helper ? helper : null;
  /** Translation line under a text: shown for the whole page (toggle) or for one question (its translate button). */
  const Sub = ({ x, qid }: { x?: L4; qid?: string }) => {
    const on = !!sec || (!!qid && !!qOpen[qid] && !!helper);
    const s = on ? t2(x) : '';
    return s ? <span lang={helper ?? undefined} style={{ display: 'block', fontSize: '0.82em', color: 'var(--c-ash)', fontWeight: 400, marginTop: 2 }}>{s}{helper && !isLang(helper) && <em style={{ fontSize: '0.85em', opacity: 0.8 }}> · {u.autoTrans}</em>}</span> : null;
  };
  const subOf = (x: L4, qid?: string) => ((!!sec || (!!qid && !!qOpen[qid])) ? t2(x) : '') || undefined;
  const openQ = (qid: string) => {
    if (!helper) setSecond(deviceForeign() ?? (lang === 'en' ? LANGS.find((l) => l !== 'en')! : 'en'));
    setQOpen((o) => ({ ...o, [qid]: !o[qid] }));
  };

  const Header = (
    <header style={{ borderBottom: '1px solid var(--c-edge)', background: 'var(--c-abyss)' }}>
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-3"><LogoMark size={26} /><span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.14em', fontSize: 13, color: 'var(--c-quartz)' }}>CHIOUT<span style={{ color: 'var(--c-lilac)' }}>WORKS</span></span></span>
        <nav aria-label="Language" className="flex gap-1">
          {LANGS.slice().sort().map((l) => (
            <Link key={l} to={intakePath(l, token)} aria-current={l === lang ? 'true' : undefined} lang={l} title={NAME[l]}
              style={{ padding: '4px 10px', fontSize: 12, border: '1px solid ' + (l === lang ? 'var(--c-lilac)' : 'var(--c-hairline)'), background: l === lang ? 'var(--c-cobalt)' : 'transparent', color: 'var(--c-quartz)' }}>{LABEL[l]}</Link>
          ))}
        </nav>
      </div>
    </header>
  );

  const shell = (children: React.ReactNode) => (
    <div data-site-theme="liquid" data-mode-lock="" style={{ minHeight: '100dvh', background: 'var(--c-void)', color: 'var(--c-mist)' }}>
      {Header}
      <main className="max-w-3xl mx-auto px-5 py-10">{children}</main>
    </div>
  );

  if (state === 'loading') return shell(<p style={{ color: 'var(--c-ash)' }}>{u.loading}</p>);
  if (state === 'invalid' || !data || !def) return shell(
    <div className="lq-card" style={{ padding: 32 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--c-quartz)', margin: '0 0 12px' }}>{u.invalidTitle}</h1>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{u.invalidBody}</p>
    </div>);
  if (done) return shell(<>
    <div className="lq-card" style={{ padding: 40, textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--c-quartz)', margin: '0 0 14px' }}>{u.doneTitle}</h1>
      <p style={{ margin: '0 auto', maxWidth: 520, lineHeight: 1.6, fontSize: 17 }}>{u.doneBody}</p>
      <p style={{ margin: '18px auto 0', maxWidth: 520, lineHeight: 1.6, fontSize: 15, color: 'var(--c-ash)' }}>{u.editNote}</p>
      <button type="button" className="lq-btn-ghost" style={{ marginTop: 22 }} onClick={() => setDone(false)}>{u.editAgain}</button>
        {(!['website', 'booking', 'qr', 'automation', 'crm', 'invoices', 'app', 'ai', 'all'].some((k) => answers[`wants__${k}`] === true) || ['website', 'qr', 'app', 'all'].some((k) => answers[`wants__${k}`] === true)) && <StyleCta lang={lang} body={{ kind: 'intake', token }} />}
    </div>
    {/* the "your website will look like this" demo preview was removed (owner, 2026-11-19); IntakePreview stays for the admin view */}
  </>);

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'var(--c-abyss)', border: '1px solid var(--c-hairline)', color: 'var(--c-quartz)', font: '400 16px/1.4 var(--font-body)' };

  const Question = ({ q }: { q: QDef }) => {
    const v = answers[q.id];
    const label = q.t[lang] || q.t.en;
    const meta = q.id.startsWith('meta_');
    const hint = q.type === 'multi' ? u.many : q.type === 'single' ? u.one : q.type === 'yn' ? u.unsureHint : '';
    const unsureOn = v === u.unsureText;
    return (
      <fieldset className="lq-card" style={{ padding: '20px 22px', margin: 0, minInlineSize: 0 }}>
        <legend style={{ display: 'contents' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <label htmlFor={`q-${q.id}`} style={{ color: 'var(--c-quartz)', fontSize: 17, lineHeight: 1.4, fontWeight: 500 }}>
            {label}{q.required && <span aria-hidden="true" style={{ color: 'var(--c-lilac)' }}> *</span>}
            {Sub({ x: q.t, qid: q.id })}
          </label>
          <span style={{ fontSize: 11, color: 'var(--c-ash)', whiteSpace: 'nowrap', letterSpacing: '.04em' }}>{q.required ? u.required : u.optional}</span>
        </div>
        {hint && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--c-ash)' }}>{hint}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: '6px 0 12px' }}>
          {q.help && <button type="button" aria-expanded={!!helpOpen[q.id]} onClick={() => setHelpOpen((o) => ({ ...o, [q.id]: !o[q.id] }))}
            style={q.mustRead
              ? { fontSize: 13, fontWeight: 600, color: 'var(--c-quartz)', cursor: 'pointer', padding: '4px 10px', border: '1px solid var(--c-lilac)', borderRadius: 'var(--r-pill)', background: 'var(--c-cobalt)' }
              : { fontSize: 13, color: 'var(--c-lilac)', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
            {q.mustRead && <span aria-hidden="true" style={{ color: 'var(--c-lilac)', marginRight: 5 }}>★</span>}{u.helpBtn}{q.mustRead && ` (${q.costNote ? u.costLabel : u.readLabel})`}</button>}
          {!sec && <button type="button" aria-pressed={!!qOpen[q.id]} onClick={() => openQ(q.id)} title={u.translateQ}
            style={{ fontSize: 13, color: 'var(--c-ash)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></svg>{u.translateQ}</button>}
          {trans === 'loading' && (sec || qOpen[q.id]) && <span style={{ fontSize: 12, color: 'var(--c-ash)' }}>{u.translating}</span>}
          {trans === 'error' && (sec || qOpen[q.id]) && <span role="alert" style={{ fontSize: 12, color: 'var(--c-lilac)' }}>{u.transErr}</span>}
        </div>
        {q.costNote && helpOpen[q.id] && (
          <p role="note" style={{ margin: '0 0 8px', padding: '12px 14px', fontSize: 14, lineHeight: 1.55, background: 'var(--c-cobalt)', border: '1px solid var(--c-lilac)', borderRadius: 'var(--r-input)', color: 'var(--c-quartz)' }}>
            <span aria-hidden="true" style={{ color: 'var(--c-lilac)', marginRight: 6 }}>★</span>{q.costNote[lang] || q.costNote.en}{Sub({ x: q.costNote, qid: q.id })}
          </p>)}
        {q.help && helpOpen[q.id] && (
          <p style={{ margin: '0 0 14px', padding: '10px 14px', fontSize: 14, lineHeight: 1.55, background: 'var(--c-deep-sea)', borderLeft: '2px solid var(--c-lilac)', color: 'var(--c-mist)' }}>
            {q.help[lang] || q.help.en}{Sub({ x: q.help, qid: q.id })}
          </p>)}

        {q.type === 'text' && (meta
          ? <input id={`q-${q.id}`} style={inputStyle} type={q.id === 'meta_email' ? 'email' : q.id === 'meta_phone' ? 'tel' : 'text'} autoComplete={q.id === 'meta_email' ? 'email' : q.id === 'meta_contact' ? 'name' : q.id === 'meta_phone' ? 'tel' : 'organization'}
              value={raw(v)} onChange={(e) => set(q.id, e.target.value)} />
          : <>
              <textarea id={`q-${q.id}`} style={{ ...inputStyle, minHeight: 84, resize: 'vertical' }} rows={3} placeholder={u.textPh} value={typeof v === 'string' ? v : ''} onChange={(e) => set(q.id, e.target.value)} />
              <div style={{ marginTop: 10 }}>
                <button type="button" aria-pressed={unsureOn} className="lq-btn-ghost" onClick={() => set(q.id, unsureOn ? '' : u.unsureText)}
                  style={{ padding: '8px 14px', fontSize: 11, background: unsureOn ? 'var(--c-cobalt)' : undefined }}>{u.unsureText}</button>
              </div>
            </>)}

        {(q.type === 'single' || q.type === 'yn') && (
          <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {q.opts?.map((o) => <Chip sec={helper} key={o.id} role="radio" on={v === o.id} onClick={() => set(q.id, v === o.id ? '' : o.id)} label={o.t[lang] || o.t.en} sub={subOf(o.t, q.id)} />)}
          </div>
        )}

        {q.type === 'multi' && (
          <div role="group" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {q.opts?.map((o) => {
              const k = `${q.id}__${o.id}`;
              return <Chip sec={helper} key={o.id} role="checkbox" on={answers[k] === true} onClick={() => set(k, answers[k] !== true)} label={o.t[lang] || o.t.en} sub={subOf(o.t, q.id)} />;
            })}
            {q.other && <Chip sec={helper} role="checkbox" on={!!otherOpen[q.id]} label={u.other} onClick={() => { if (otherOpen[q.id]) set(`${q.id}__other`, ''); setOtherOpen((s) => ({ ...s, [q.id]: !s[q.id] })); }} />}
          </div>
        )}
        {q.type === 'multi' && q.other && otherOpen[q.id] && (
          <input style={{ ...inputStyle, marginTop: 12 }} placeholder={u.otherPh} aria-label={u.other} autoFocus value={raw(answers[`${q.id}__other`])} onChange={(e) => set(`${q.id}__other`, e.target.value)} />
        )}
        {q.detail && (v === 'yes' || v === 'unsure') && (
          <input style={{ ...inputStyle, marginTop: 12 }} placeholder={u.detailPh} aria-label={u.detailPh} value={raw(answers[`${q.id}__detail`])} onChange={(e) => set(`${q.id}__detail`, e.target.value)} />
        )}
      </fieldset>
    );
  };

  const summary = (q: QDef): string => {
    if (q.type === 'multi') {
      const l = (q.opts ?? []).filter((o) => answers[`${q.id}__${o.id}`] === true).map((o) => o.t[lang] || o.t.en);
      if (str(answers[`${q.id}__other`])) l.push(str(answers[`${q.id}__other`]));
      return l.join(', ');
    }
    if (q.type === 'single' || q.type === 'yn') {
      const o = q.opts?.find((x) => x.id === answers[q.id]);
      return [o ? (o.t[lang] || o.t.en) : '', str(answers[`${q.id}__detail`])].filter(Boolean).join(' · ');
    }
    return str(answers[q.id]);
  };

  const pct = Math.round((Math.min(step, total) / total) * 100);

  return shell(
    <>
      {step === 0 && (
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, color: 'var(--c-quartz)', margin: '0 0 12px', fontWeight: 500 }}>{u.hello(str(answers.meta_contact).split(' ')[0])}</h1>
          <p style={{ margin: '0 0 8px', fontSize: 17, lineHeight: 1.6 }}>{u.intro}</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--c-ash)' }}>{u.time}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={showSecond} onChange={(e) => { setShowSecond(e.target.checked); if (e.target.checked && !helper) setSecond(deviceForeign() ?? LANGS.find((l) => l !== lang) ?? null); }} />
          {u.second}
        </label>
        {showSecond && (
          <select aria-label={u.pickLang} value={helper ?? ''} onChange={(e) => setSecond(e.target.value || null)}
            style={{ padding: '8px 12px', background: 'var(--c-abyss)', border: '1px solid var(--c-hairline)', color: 'var(--c-quartz)', fontSize: 14, maxWidth: '100%' }}>
            {deviceForeign() && <optgroup label={u.deviceLang}><option value={deviceForeign()!}>{nativeName(deviceForeign()!)}</option></optgroup>}
            <optgroup label="Chioutworks">{LANGS.filter((l) => l !== lang).map((l) => <option key={l} value={l}>{NAME[l]}</option>)}</optgroup>
            <optgroup label={u.moreLangs}>{MORE_LANGS.map((c) => [c, nativeName(c)] as const).sort((a, b) => a[1].localeCompare(b[1])).map(([c, n]) => <option key={c} value={c}>{n}</option>)}</optgroup>
          </select>
        )}
      </div>

      <div aria-hidden="true" style={{ height: 6, borderRadius: 9999, background: 'var(--c-inkline)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--c-signal)', borderRadius: 9999, transition: 'width .3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--c-ash)', margin: '8px 0 24px' }} role="status">
        <span>{u.step} {Math.min(step + 1, total + 1)} {u.of} {total + 1}</span>
        <span>{save === 'saving' ? u.saving : save === 'saved' ? u.saved : save === 'error' ? u.saveErr : ''}</span>
      </div>

      <IntakeProgress lang={lang} token={token} step={step} total={total} def={def} answers={answers} setStep={setStep} />

      {!isReview && cur && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--c-quartz)', margin: '0 0 16px', fontWeight: 500 }}>
            {cur.title[lang] || cur.title.en}{Sub({ x: cur.title })}
          </h2>
          {cur.intro && <p style={{ margin: '-4px 0 18px', fontSize: 15, lineHeight: 1.6, color: 'var(--c-mist)' }}>{cur.intro[lang] || cur.intro.en}{Sub({ x: cur.intro })}</p>}
          {cur.flow && (
            <ol aria-label={cur.title[lang]} style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 8 }}>
              {cur.flow.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="lq-card" style={{ padding: '10px 14px', fontSize: 14, lineHeight: 1.4, color: 'var(--c-quartz)', maxWidth: 200 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-lilac)', marginBottom: 2 }}>{i + 1}</span>{f[lang] || f.en}{Sub({ x: f })}
                  </span>
                  {i < cur.flow!.length - 1 && <span aria-hidden="true" style={{ color: 'var(--c-lilac)', fontSize: 18 }}>→</span>}
                </li>))}
            </ol>)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cur.qs.map((q) => <Fragment key={q.id}>{Question({ q })}</Fragment>)}
          </div>
        </>
      )}

      {isReview && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--c-quartz)', margin: '0 0 6px', fontWeight: 500 }}>{u.reviewTitle}</h2>
          <p style={{ margin: '0 0 20px', color: 'var(--c-ash)' }}>{u.reviewSub}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sections.map((s, i) => (
              <div key={s.id} className="lq-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong style={{ color: 'var(--c-quartz)', fontWeight: 500 }}>{s.title[lang] || s.title.en}</strong>
                  <button type="button" className="lq-btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => go(i)}>{u.edit}</button>
                </div>
                {!s.qs.some((q) => summary(q)) && <p style={{ margin: 0, fontSize: 13, color: 'var(--c-ash)' }}>{u.empty}</p>}
                <dl style={{ margin: 0, display: 'grid', gap: 6, fontSize: 14 }}>
                  {s.qs.map((q) => { const t = summary(q); return t ? (
                    <div key={q.id}><dt style={{ color: 'var(--c-ash)', fontSize: 12 }}>{q.t[lang] || q.t.en}</dt><dd style={{ margin: 0, color: 'var(--c-quartz)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{t}</dd></div>
                  ) : null; })}
                </dl>
              </div>
            ))}
          </div>

          <div className="lq-card lq-card--highlight" style={{ padding: '18px 20px', marginTop: 20 }}>
            <h3 style={{ margin: '0 0 8px', color: 'var(--c-quartz)', fontWeight: 500, fontSize: 17 }}>{u.consentTitle}</h3>
            <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', lineHeight: 1.5, fontSize: 14 }}>
              <input type="checkbox" style={{ marginTop: 4, width: 18, height: 18, flex: 'none' }} checked={answers.consent === true} onChange={(e) => set('consent', e.target.checked)} />
              <span>{def.consent[lang]}{Sub({ x: def.consent })}</span>
            </label>
          </div>
        </>
      )}

      {err && <div role="alert" style={{ margin: '18px 0 0', padding: '12px 14px', border: '1px solid var(--c-lilac)', background: 'var(--c-inkline)', color: 'var(--c-quartz)', borderRadius: 12, fontSize: 14 }}>{err}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
        <button type="button" className="lq-btn-ghost" onClick={() => go(step - 1)} disabled={step === 0} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>{u.back}</button>
        {!isReview
          ? <button type="button" className="lq-btn-ghost" onClick={() => go(step + 1)}>{step === total - 1 ? u.toReview : u.next}</button>
          : <button type="button" className="lq-btn-ghost" onClick={submit} disabled={busy}>{busy ? u.submitting : u.submit}</button>}
      </div>

      <p style={{ marginTop: 40, fontSize: 12, color: 'var(--c-ash)', lineHeight: 1.6 }}>
        {u.privacy} <Link to={pagePath(lang, 'privacy')} style={{ color: 'var(--c-lilac)', textDecoration: 'underline' }}>{u.privacyLink}</Link>
      </p>
    </>,
  );
}
