import { useState } from 'react';
import type { Lang } from '../translations';
import { STYLE_PRESETS } from '../data/stylePresets';
import { STYLE_TUNE } from './i18n/style';
import { WIZ_UI } from './i18n/wizard';
import { PALETTES, FONT_PAIRS, customPalette, fontCss, pairsFor } from '../data/styleOptions';
import { Scaled, SitePreview, presetLook, FONT, BODY, type Look } from './pages/StylePage';
import '../styles/fonts-style.css';

// Inline style + examples steps (owner, 2026-11-20): rendered inside the request card, never on a separate page.
export interface StyleVal { likes: string[]; pal: string; pair: string; own: Record<string, string | boolean> }
export interface ExVal { urls: string[]; note: string; none: boolean }
export const emptyStyle = (): StyleVal => ({ likes: [], pal: '', pair: '', own: { ...customPalette('#1f5fbf', false), dark: false } });
export const emptyEx = (): ExVal => ({ urls: ['', '', ''], note: '', none: false });
export const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
export const normUrl = (u: string) => (u.trim() && !/^https?:\/\//i.test(u.trim()) ? `https://${u.trim()}` : u.trim());
/** palette + font in the shape the server expects */
export const styleBody = (s: StyleVal) => ({ likes: s.likes, palette: s.pal === 'own' ? { custom: { accent: s.own.accent, dark: s.own.dark, bg: s.own.bg, surface: s.own.surface, text: s.own.text, muted: s.own.muted } } : s.pal ? { id: s.pal } : null, font: s.pair || null });

const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-input)', border: '1px solid var(--c-hairline)', background: 'var(--c-abyss)', color: 'var(--c-quartz)', fontFamily: 'inherit', fontSize: 15, boxSizing: 'border-box' };
const lab: React.CSSProperties = { fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-ash)', margin: '0 0 8px' };
const chip = (on: boolean): React.CSSProperties => ({ padding: 10, borderRadius: 14, border: `1px solid ${on ? 'var(--c-signal)' : 'var(--c-hairline)'}`, background: on ? 'color-mix(in srgb, var(--c-signal) 14%, transparent)' : 'var(--c-abyss)', cursor: 'pointer', textAlign: 'start', color: 'var(--c-quartz)', display: 'grid', gap: 6 });

export function StyleInline({ lang, v, set }: { lang: Lang; v: StyleVal; set: (v: StyleVal) => void }) {
  const w = WIZ_UI[lang], tt = STYLE_TUNE[lang];
  const own = v.own as Record<'accent' | 'bg' | 'surface' | 'text' | 'muted', string> & { dark: boolean };
  const base = STYLE_PRESETS.find((x) => x.id === v.likes[0]) ?? STYLE_PRESETS[0];
  const pal = v.pal === 'own' ? { ...customPalette(own.accent, own.dark), bg: own.bg, surface: own.surface, text: own.text, muted: own.muted, accent: own.accent } : PALETTES.find((x) => x.id === v.pal)?.pal ?? base.pal;
  const pair = FONT_PAIRS.find((x) => x.id === v.pair);
  const look: Look = { p: base, pal, head: pair ? fontCss(pair.head) : FONT[base.font], body: pair ? fontCss(pair.body) : BODY[base.font] };
  const toggle = (id: string) => set({ ...v, likes: v.likes.includes(id) ? v.likes.filter((x) => x !== id) : [...v.likes, id] });
  return (
    <div style={{ display: 'grid', gap: 18, color: 'var(--c-mist)' }}>
      <p style={{ margin: 0, lineHeight: 1.5, fontSize: 14 }}>{w.styleIntro}</p>
      <section>
        <p style={lab}>{w.stylePick}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, 100%), 1fr))', gap: 10 }}>
          {STYLE_PRESETS.map((p) => { const on = v.likes.includes(p.id); return (
            <button key={p.id} type="button" className="lq-square" onClick={() => toggle(p.id)} aria-pressed={on} aria-label={`${p.label[lang]}: ${on ? w.liked : w.like}`}
              style={{ ...chip(on), padding: 6, minWidth: 0, position: 'relative' }}>
              <Scaled><SitePreview look={presetLook(p)} lang={lang} /></Scaled>
              <span style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}><strong>{p.label[lang]}</strong><span aria-hidden>{on ? '♥' : '♡'}</span></span>
            </button>); })}
        </div>
      </section>
      <section>
        <p style={lab}>{w.preview}</p>
        <div className="lq-card" style={{ padding: 6 }}><Scaled w={680}><SitePreview look={look} lang={lang} /></Scaled></div>
      </section>
      <section>
        <p style={lab}>{w.palette}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 8 }}>
          {PALETTES.map((x) => (
            <button key={x.id} type="button" className="lq-square" aria-pressed={v.pal === x.id} onClick={() => set({ ...v, pal: v.pal === x.id ? '' : x.id })} style={chip(v.pal === x.id)}>
              <span style={{ display: 'flex', height: 20, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--c-hairline)' }}>{[x.pal.bg, x.pal.surface, x.pal.accent, x.pal.text].map((c, i) => <i key={i} style={{ flex: i === 2 ? 1.6 : 1, background: c }} />)}</span>
              <span style={{ fontSize: 12.5 }}>{x.name[lang]}</span>
            </button>))}
          <button type="button" className="lq-square" aria-pressed={v.pal === 'own'} onClick={() => set({ ...v, pal: 'own' })} style={chip(v.pal === 'own')}>
            <span style={{ display: 'flex', height: 20, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--c-hairline)' }}>{[own.bg, own.surface, own.accent, own.text].map((c, i) => <i key={i} style={{ flex: i === 2 ? 1.6 : 1, background: c }} />)}</span>
            <span style={{ fontSize: 12.5 }}>{w.own}</span>
          </button>
        </div>
        {v.pal === 'own' && <div className="lq-card" style={{ marginTop: 10, padding: 12, display: 'grid', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--c-ash)' }}>{w.ownHint}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {(['accent', 'bg', 'surface', 'text', 'muted'] as const).map((k) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 12, border: '1px solid var(--c-hairline)', background: 'var(--c-abyss)' }}>
                <input type="color" value={own[k]} onChange={(e) => set({ ...v, own: k === 'accent' ? { ...customPalette(e.target.value, own.dark), dark: own.dark } : { ...v.own, [k]: e.target.value } })} style={{ width: 32, height: 32, padding: 0, border: 0, background: 'none', flex: 'none' }} />
                <span style={{ display: 'grid', minWidth: 0 }}><span style={{ fontSize: 12.5, color: 'var(--c-quartz)' }}>{w.roles[k]}</span><code style={{ fontSize: 11, color: 'var(--c-ash)' }}>{own[k]}</code></span>
              </label>))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[false, true].map((d) => <button key={String(d)} type="button" className="lq-btn-ghost" aria-pressed={own.dark === d} onClick={() => set({ ...v, own: { ...customPalette(own.accent, d), dark: d } })}
              style={{ padding: '5px 12px', fontSize: 13, ...(own.dark === d ? { background: 'var(--c-signal)', color: 'var(--c-on-accent)', borderColor: 'var(--c-signal)' } : {}) }}>{d ? w.dark : w.light}</button>)}
          </div>
        </div>}
      </section>
      <section>
        <p style={lab}>{w.fonts}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {pairsFor(lang).map((x) => (
            <button key={x.id} type="button" className="lq-square" aria-pressed={v.pair === x.id} onClick={() => set({ ...v, pair: v.pair === x.id ? '' : x.id })} style={chip(v.pair === x.id)}>
              <span style={{ fontFamily: fontCss(x.head), fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>{x.name[lang]}</span>
              <span style={{ fontFamily: fontCss(x.body), fontSize: 12, color: 'var(--c-mist)' }}>{tt.sub.split('.')[0]}.</span>
            </button>))}
        </div>
      </section>
    </div>
  );
}

export function ExamplesInline({ lang, v, set, err }: { lang: Lang; v: ExVal; set: (v: ExVal) => void; err?: string }) {
  const w = WIZ_UI[lang];
  return (
    <div style={{ display: 'grid', gap: 10, color: 'var(--c-mist)' }}>
      <p style={{ margin: 0, lineHeight: 1.5 }}>{w.exIntro}</p>
      {v.urls.map((u, i) => (
        <input key={i} style={{ ...inp, opacity: v.none ? 0.5 : 1 }} type="url" inputMode="url" disabled={v.none} placeholder={w.exPh} aria-label={`${w.exTitle} ${i + 1}`} value={u}
          onChange={(e) => set({ ...v, urls: v.urls.map((x, j) => (j === i ? e.target.value : x)) })} />))}
      <textarea style={{ ...inp, minHeight: 70 }} maxLength={300} disabled={v.none} placeholder={w.exNote} aria-label={w.exNote} value={v.note} onChange={(e) => set({ ...v, note: e.target.value })} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
        <input type="checkbox" checked={v.none} onChange={(e) => set({ ...v, none: e.target.checked })} /> {w.exNone}
      </label>
      {err && <p role="alert" style={{ margin: 0, color: 'var(--c-quartz)', fontSize: 13.5 }}>{err}</p>}
    </div>
  );
}

/** Chat request card: style + examples inline at the bottom (only for web/design needs); the card's own save flow is unchanged. */
export function ChatStyleFlow({ lang, sess }: { lang: Lang; sess: { id: string; secret: string } }) {
  const w = WIZ_UI[lang];
  const [step, setStep] = useState<0 | 2 | 3 | 4>(0);
  const [sv, setSv] = useState(emptyStyle); const [ex, setEx] = useState(emptyEx);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const btn: React.CSSProperties = { padding: '9px 14px', borderRadius: 9999, border: '1px solid var(--c-lilac)', background: 'color-mix(in srgb, var(--c-lilac) 14%, var(--c-abyss))', color: 'var(--lq-white)', fontSize: 12.5, cursor: 'pointer' };
  const send = async () => {
    const urls = ex.none ? [] : ex.urls.map(normUrl).filter(Boolean);
    if (urls.some((u) => !URL_RE.test(u))) { setErr(w.badUrl); return; }
    setBusy(true); setErr('');
    try {
      const a = await fetch('/api/style/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'voice', sessionId: sess.id, secret: sess.secret, lang }) });
      const j = await a.json(); if (!a.ok || !j.token) throw new Error();
      const r = await fetch(`/api/style/${encodeURIComponent(j.token)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...styleBody(sv), refs: urls.map((url) => ({ url, what: '' })), note: ex.none ? '' : ex.note }) });
      if (!r.ok) throw new Error(); setStep(4);
    } catch { setErr(w.err); }
    setBusy(false);
  };
  if (step === 0) return <button type="button" style={btn} onClick={() => setStep(2)}>{w.toStyle}</button>;
  if (step === 4) return <p role="status" style={{ margin: 0, fontSize: 13, color: 'var(--lq-white)' }}>{w.doneTitle}</p>;
  return (
    <div style={{ display: 'grid', gap: 12, paddingTop: 6, borderTop: '1px solid var(--lq-line-strong)' }}>
      <strong style={{ fontSize: 13, color: 'var(--lq-white)' }}>{w.steps[0].slice(2)} · {w.steps[step - 1]}</strong>
      {step === 2 ? <StyleInline lang={lang} v={sv} set={setSv} /> : <ExamplesInline lang={lang} v={ex} set={setEx} err={err} />}
      {step === 2 && err && <p role="alert" style={{ margin: 0, fontSize: 13 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" style={btn} onClick={() => { setErr(''); setStep(step === 2 ? 0 : 2); }}>{w.back}</button>
        {step === 2
          ? <button type="button" style={btn} onClick={() => { if (!sv.likes.length) { setErr(w.pickMin); return; } setErr(''); setStep(3); }}>{w.toNext}</button>
          : <button type="button" style={btn} disabled={busy} onClick={() => void send()}>{busy ? w.sending : w.send}</button>}
      </div>
    </div>
  );
}
