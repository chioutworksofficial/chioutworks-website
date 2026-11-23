import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LogoMark } from '../Logo';
import { INTAKE_UI } from '../intakeUi';
import IntakeProgress from '../IntakeProgress';
import { LANGS, intakePath, isLang, pagePath } from '../../lib/routes';
import type { Lang } from '../../translations';
import ModeToggle from '../ModeToggle';
import type { Definition, L4, QDef } from '../../data/intakeSectors';
import { visibleSections } from '../../lib/intakeLogic';
import { guardFields, prefetchFormToken } from '../../lib/formGuard';
import { StyleInline, emptyStyle, styleBody, normUrl, URL_RE, type StyleVal } from '../StyleInline';

type Answers = Record<string, string | boolean>;
interface Payload { lang: Lang; secondLang: Lang | null; status: string; definition: Definition; answers: Answers; closesAt?: string | null }

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

/** Parse the saved style_choice JSON back into the picker state. */
const parseStyle = (raw0: unknown): StyleVal => {
  const e = emptyStyle();
  try {
    const o = JSON.parse(String(raw0));
    const pal = o?.palette;
    return { likes: Array.isArray(o?.likes) ? o.likes.filter((x: unknown) => typeof x === 'string') : [], pal: pal?.custom ? 'own' : typeof pal?.id === 'string' ? pal.id : '', pair: typeof o?.font === 'string' ? o.font : '', own: pal?.custom ? { ...e.own, ...pal.custom } : e.own };
  } catch { return e; }
};
/** Selectable card: radio (single) or checkbox (multi); arrow keys move focus inside the group (and select for radios). */
function Chip({ on, onClick, label, sub, role, sec }: { on: boolean; onClick: () => void; label: string; sub?: string; role: 'radio' | 'checkbox'; sec: string | null }) {
  const key = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    const all = Array.from(e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button[role]') ?? []);
    const nx = all[(all.indexOf(e.currentTarget) + d + all.length) % all.length];
    if (!nx) return;
    e.preventDefault(); nx.focus(); if (role === 'radio') nx.click();
  };
  return (
    <button type="button" role={role} aria-checked={on} onClick={onClick} onKeyDown={key} className="cw-opt lq-square">
      <span>{label}</span>{sub && <span lang={sec ?? undefined} style={{ fontSize: 12, color: on ? 'var(--c-mist)' : 'var(--c-ash)' }}>{sub}</span>}
      <i aria-hidden="true">✓</i>
    </button>
  );
}

export default function IntakePage() {
  const { lang: langParam, slug: token = '' } = useParams(); // route: /:lang/:page/:slug
  const lang: Lang = isLang(langParam) ? langParam : 'en';
  const u = INTAKE_UI[lang];

  const [data, setData] = useState<Payload | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'invalid' | 'revoked'>('loading');
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
  const [closesAt, setClosesAt] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [otherOpen, setOtherOpen] = useState<Record<string, boolean>>({});
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [badUrls, setBadUrls] = useState<Record<string, boolean>>({});
  const [svLocal, setSvLocal] = useState<StyleVal | null>(null);

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
      if (!r.ok) { setState(r.status === 410 ? 'revoked' : 'invalid'); return; }
      const p = (await r.json()) as Payload;
      setData(p); setDef(p.definition); setAnswers(p.answers);
      setSecond(p.secondLang); setShowSecond(!!p.secondLang);
      setDone(p.status === 'submitted'); setState('ok');
      setClosesAt(p.closesAt ?? null); setClosed(!!p.closesAt && new Date(p.closesAt).getTime() < Date.now());
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
      if (r.status === 410) { setClosed(true); return; }
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      if (typeof j.closesAt === 'string') setClosesAt(j.closesAt);
      if (j.definition) setDef(j.definition as Definition);
      if (Array.isArray(j.badUrls)) setBadUrls((b) => ({ ...b, ...Object.fromEntries((j.badUrls as string[]).map((k) => [k, true])) }));
      setSave(Object.keys(pending.current).length ? 'saving' : 'saved');
    }).catch(() => { pending.current = { ...batch, ...pending.current }; setSave('error'); }));
    return inflight.current;
  }, [token]);

  useEffect(() => () => { void flush(); }, [flush]);

  const set = (k: string, v: string | boolean) => {
    setAnswers((a) => { const n = { ...a }; if (v === '' || v === false) delete n[k]; else n[k] = v; return n; });
    pending.current[k] = v;
    setBadUrls((b) => (b[k] ? { ...b, [k]: false } : b));
    setSave('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), 800);
  };

  // Adaptive form: only sections/questions whose showIf holds for the current answers (hidden answers stay stored)
  const sections = useMemo(() => (def ? visibleSections(def, answers) : []), [def, answers]);
  const total = sections.length;
  const isReview = step >= total;
  const cur = sections[Math.min(step, total - 1)];
  // the current page can vanish after an earlier answer changed: jump to the nearest visible page
  useEffect(() => { if (total && step > total) setStep(total); }, [step, total]);

  const pick = (q: QDef, id: string) => {
    const k = `${q.id}__${id}`, o = q.opts?.find((x) => x.id === id);
    const turnOn = answers[k] !== true;
    for (const x of q.opts ?? []) { const kk = `${q.id}__${x.id}`; if (kk !== k && answers[kk] === true && turnOn && (o?.exclusive || x.exclusive)) set(kk, false); }
    set(k, turnOn);
  };

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
      if (r.status === 410) { setClosed(true); return; }
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
    <header style={{ borderBottom: '1px solid var(--c-edge)' }}>
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-3"><LogoMark size={26} /><span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.14em', fontSize: 13, color: 'var(--c-quartz)' }}>CHIOUT<span style={{ color: 'var(--c-lilac)' }}>WORKS</span></span></span>
        <div className="flex items-center gap-2"><nav aria-label="Language" className="flex gap-1">
          {LANGS.slice().sort().map((l) => (
            <Link key={l} to={intakePath(l, token)} aria-current={l === lang ? 'true' : undefined} lang={l} title={NAME[l]}
              style={{ padding: '4px 10px', fontSize: 12, border: '1px solid ' + (l === lang ? 'var(--c-lilac)' : 'var(--c-hairline)'), background: l === lang ? 'var(--c-cobalt)' : 'transparent', color: 'var(--c-quartz)' }}>{LABEL[l]}</Link>
          ))}
        </nav><ModeToggle lang={lang} /></div>
      </div>
    </header>
  );

  const shell = (children: React.ReactNode) => (
    <div data-site-theme="liquid" className="cw-intake" style={{ minHeight: '100dvh', color: 'var(--c-mist)' }}>
      {Header}
      <main className="mx-auto px-5 py-10" style={{ maxWidth: 704 }}>{children}</main>
    </div>
  );

  if (state === 'loading') return shell(<p style={{ color: 'var(--c-ash)' }}>{u.loading}</p>);
  if (state === 'invalid' || state === 'revoked' || !data || !def) return shell(
    <div className="lq-card" style={{ padding: 32 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--c-quartz)', margin: '0 0 12px' }}>{u.invalidTitle}</h1>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{state === 'revoked' ? u.revokedBody : u.invalidBody}</p>
    </div>);
  const when = closesAt ? new Date(closesAt).toLocaleString(lang, { dateStyle: 'long', timeStyle: 'short' }) : '';
  if (done && !closed) return shell(<>
    <div className="lq-card" style={{ padding: 40, textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--c-quartz)', margin: '0 0 14px' }}>{u.doneTitle}</h1>
      <p style={{ margin: '0 auto', maxWidth: 520, lineHeight: 1.6, fontSize: 17 }}>{u.doneBody}</p>
      <p style={{ margin: '18px auto 0', maxWidth: 520, lineHeight: 1.6, fontSize: 15, color: 'var(--c-ash)' }}>{u.editNote(when)}</p>
      <button type="button" className="lq-btn-ghost" style={{ marginTop: 22 }} onClick={() => setDone(false)}>{u.editAgain}</button>
    </div>
    {/* the "your website will look like this" demo preview was removed (owner, 2026-11-19); IntakePreview stays for the admin view */}
  </>);

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'var(--c-abyss)', border: '1px solid var(--cw-line)', color: 'var(--c-quartz)', font: '400 16px/1.4 var(--font-body)' };

  const urlBad = (id: string) => { const t = str(answers[id]); return !!badUrls[id] || (!!t && !URL_RE.test(normUrl(t))); };
  const addText = (id: string, t: string) => {
    const cur0 = raw(answers[id]);
    set(id, !cur0.trim() || cur0 === (def.unsureLabel?.[lang] || u.unsureText) ? t : `${cur0.replace(/[,\s]+$/, '')}, ${t}`);
    window.setTimeout(() => { const el = document.getElementById(`q-${id}`) as HTMLTextAreaElement | null; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 0);
  };
  const Question = ({ q }: { q: QDef }) => {
    const v = answers[q.id];
    const label = q.t[lang] || q.t.en;
    const meta = q.id.startsWith('meta_');
    const hint = q.type === 'multi' ? u.many : q.type === 'single' ? u.one : q.type === 'yn' ? u.unsureHint : '';
    const unsureTxt = def.unsureLabel?.[lang] || u.unsureText;
    const unsureOn = v === unsureTxt;
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
        {hint && (q.type === 'multi' ? <p className="cw-hint" style={{ margin: '8px 0 0' }}>{hint}</p> : <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--c-ash)' }}>{hint}</p>)}
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
          : q.format === 'url'
          ? <>
              <input id={`q-${q.id}`} style={inputStyle} type="text" inputMode="url" autoComplete="url" placeholder={u.urlPh} aria-invalid={urlBad(q.id)} value={raw(v)} onChange={(e) => set(q.id, e.target.value)} />
              {urlBad(q.id) && <p role="alert" className="cw-err">{u.badUrl}</p>}
            </>
          : <>
              <textarea id={`q-${q.id}`} style={{ ...inputStyle, minHeight: 84, resize: 'vertical' }} rows={3} placeholder={u.textPh} value={typeof v === 'string' ? v : ''} onChange={(e) => set(q.id, e.target.value)} />
              {(!!q.suggestions?.length || q.unsure) && (
                <div className="cw-sugs"><span>{u.suggest}</span>
                  {q.suggestions?.map((x, i) => { const t = x[lang] || x.en; return <button key={i} type="button" className="cw-sug lq-square" onClick={() => addText(q.id, t)}>{t}{Sub({ x, qid: q.id })}</button>; })}
                  {q.unsure && <button type="button" aria-pressed={unsureOn} className="cw-sug lq-square" onClick={() => set(q.id, unsureOn ? '' : unsureTxt)}>{unsureTxt}{def.unsureLabel ? Sub({ x: def.unsureLabel, qid: q.id }) : null}</button>}
                </div>)}
            </>)}

        {(q.type === 'single' || q.type === 'yn') && (
          <div role="radiogroup" aria-label={label} className={'cw-opts' + (q.id === 'budget_range' ? ' cw-opts--lg' : '')}>
            {q.opts?.map((o) => <Chip sec={helper} key={o.id} role="radio" on={v === o.id} onClick={() => set(q.id, v === o.id ? '' : o.id)} label={o.t[lang] || o.t.en} sub={subOf(o.t, q.id)} />)}
          </div>
        )}

        {q.type === 'multi' && (
          <div role="group" aria-label={label} className="cw-opts">
            {q.opts?.map((o) => {
              const k = `${q.id}__${o.id}`;
              return <Chip sec={helper} key={o.id} role="checkbox" on={answers[k] === true} onClick={() => pick(q, o.id)} label={o.t[lang] || o.t.en} sub={subOf(o.t, q.id)} />;
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

  if (closed) return shell(
    <div className="lq-card" style={{ padding: 28 }}>
      <p style={{ margin: '0 0 20px', lineHeight: 1.6, color: 'var(--c-quartz)' }}>{u.closedBody}</p>
      <dl style={{ margin: 0, display: 'grid', gap: 10, fontSize: 14 }}>
        {sections.flatMap((s) => s.qs).map((q) => { const t = summary(q); return t ? (
          <div key={q.id}><dt style={{ color: 'var(--c-ash)', fontSize: 12 }}>{q.t[lang] || q.t.en}</dt><dd style={{ margin: 0, color: 'var(--c-quartz)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{t}</dd></div>
        ) : null; })}
      </dl>
    </div>);

  const pct = Math.round((Math.min(step, total) / total) * 100);

  return shell(
    <>
      {step === 0 && (
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, color: 'var(--c-quartz)', margin: '0 0 12px', fontWeight: 500 }}>{u.hello(str(answers.meta_contact).split(' ')[0])}</h1>
          <p style={{ margin: '0 0 8px', fontSize: 17, lineHeight: 1.6 }}>{u.intro}</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--c-ash)' }}>{u.time}</p>
          {def.lengthNote && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--c-ash)' }}>{def.lengthNote[lang] || def.lengthNote.en}{Sub({ x: def.lengthNote })}</p>}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={showSecond} onChange={(e) => { setShowSecond(e.target.checked); if (e.target.checked && !helper) setSecond(deviceForeign() ?? LANGS.find((l) => l !== lang) ?? null); }} />
          {u.second}
        </label>
        {showSecond && (
          <select aria-label={u.pickLang} value={helper ?? ''} onChange={(e) => setSecond(e.target.value || null)}
            style={{ padding: '8px 12px', background: 'var(--c-abyss)', border: '1px solid var(--cw-line)', color: 'var(--c-quartz)', fontSize: 14, maxWidth: '100%' }}>
            {deviceForeign() && <optgroup label={u.deviceLang}><option value={deviceForeign()!}>{nativeName(deviceForeign()!)}</option></optgroup>}
            <optgroup label="Chioutworks">{LANGS.filter((l) => l !== lang).map((l) => <option key={l} value={l}>{NAME[l]}</option>)}</optgroup>
            <optgroup label={u.moreLangs}>{MORE_LANGS.map((c) => [c, nativeName(c)] as const).sort((a, b) => a[1].localeCompare(b[1])).map(([c, n]) => <option key={c} value={c}>{n}</option>)}</optgroup>
          </select>
        )}
      </div>

      <div className="cw-step" role="status">
        <span>{u.step} {String(Math.min(step + 1, total + 1)).padStart(2, '0')} {u.of} {String(total + 1).padStart(2, '0')}</span>
        <small>{save === 'saving' ? u.saving : save === 'saved' ? u.saved : save === 'error' ? u.saveErr : ''}</small>
      </div>
      {closesAt && <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--c-ash)' }}>{u.closesAt(when)}</p>}
      <div className="cw-bar" role="progressbar" aria-label={u.stepAria} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ transform: `scaleX(${Math.max(pct, 4) / 100})` }} /></div>

      <IntakeProgress lang={lang} token={token} step={step} total={total} sections={sections} answers={answers} setStep={setStep} />

      <div key={step} className="cw-page">
      {!isReview && cur && (
        <>
          <h2 className="cw-title">{cur.title[lang] || cur.title.en}{Sub({ x: cur.title })}</h2>
          {cur.quick && <p style={{ margin: '-6px 0 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-lilac)' }}>{u.quick}</p>}
          {(cur.forWho || cur.outcome) && (
            <div className="cw-soft">
              {cur.forWho && <p><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg><span>{cur.forWho[lang] || cur.forWho.en}{Sub({ x: cur.forWho })}</span></p>}
              {cur.outcome && <p style={{ color: 'var(--c-quartz)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg><span>{cur.outcome[lang] || cur.outcome.en}{Sub({ x: cur.outcome })}</span></p>}
            </div>)}
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
          {cur.kind === 'style' && (() => { const i = u.styleNote.indexOf(';'); const head = i > 0 ? u.styleNote.slice(0, i + 1) : u.styleNote; const rest = i > 0 ? u.styleNote.slice(i + 1).trim() : ''; return (
            <div role="note" className="cw-style-note" style={{ margin: '0 0 18px', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', borderRadius: 'var(--r-input)', border: '1px solid color-mix(in srgb, var(--c-signal) 55%, transparent)', borderLeft: '4px solid var(--c-signal)', background: 'color-mix(in srgb, var(--c-signal) 12%, transparent)' }}>
              <span aria-hidden="true" style={{ flex: '0 0 auto', width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, background: 'var(--c-signal)', color: 'var(--c-void)' }}>!</span>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--c-quartz)' }}><strong style={{ color: 'var(--c-signal)' }}>{head}</strong>{rest ? ' ' + rest : ''}</p>
            </div>); })()}
          {cur.kind === 'style' && <StyleInline lang={lang} v={svLocal ?? parseStyle(answers.style_choice)} set={(nv) => { setSvLocal(nv); set('style_choice', nv.likes.length || nv.pal || nv.pair ? JSON.stringify(styleBody(nv)) : ''); }} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: cur.kind === 'style' && cur.qs.length ? 14 : 0 }}>
            {cur.qs.map((q) => <div key={q.id} className="cw-q-in">{Question({ q })}</div>)}
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
                  <strong style={{ color: 'var(--c-quartz)', fontWeight: 500 }}>{s.title[lang] || s.title.en}{skipped[s.id] && !s.qs.some((q) => summary(q)) && <em style={{ marginLeft: 8, fontSize: 12, color: 'var(--c-ash)', fontWeight: 400 }}>· {u.skipped}</em>}</strong>
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

      <div className="cw-actions">
        {step > 0 && <button type="button" className="lq-btn-ghost" onClick={() => go(step - 1)}>{u.back}</button>}
        <span className="cw-spacer" />
        {!isReview && cur?.skippable && <button type="button" className={cur.kind === 'style' ? 'cw-primary' : 'lq-btn-ghost'} onClick={() => { setSkipped((x) => ({ ...x, [cur.id]: true })); void go(step + 1); }}>{u.skip}</button>}
        {!isReview
          ? <button type="button" className={!isReview && cur?.kind === 'style' && cur.skippable ? 'lq-btn-ghost' : 'cw-primary'} onClick={() => go(step + 1)}>{step === total - 1 ? u.toReview : u.next}</button>
          : <button type="button" className="cw-primary" onClick={submit} disabled={busy}>{busy ? u.submitting : u.submit}</button>}
      </div>
      </div>

      <p style={{ marginTop: 40, fontSize: 12, color: 'var(--c-ash)', lineHeight: 1.6 }}>
        {u.privacy} <Link to={pagePath(lang, 'privacy')} style={{ color: 'var(--c-lilac)', textDecoration: 'underline' }}>{u.privacyLink}</Link>
      </p>
    </>,
  );
}
