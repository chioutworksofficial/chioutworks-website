import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Lang } from '../../translations';
import Logo from '../Logo';
import { STYLE_PRESETS, type StylePreset } from '../../data/stylePresets';
import { STYLE_UI, STYLE_TUNE, STYLE_LEAVE } from '../i18n/style';
import { PALETTES, FONT_PAIRS, customPalette, fontCss, pairsFor, type Pal } from '../../data/styleOptions';
import '../../styles/fonts-style.css';

// "Choose your style" page (owner, 2026-11-17; realistic previews + palette + fonts 2026-11-19): like style cards,
// then fine-tune colours (palette or own main colour) and a font pair on a live preview, optionally name example sites,
// send. The owner sees the exact colour codes and font names. Each card is a drawn sample site, not a screenshot.
type What = 'colors' | 'layout' | 'photos' | 'all';
export const FONT: Record<StylePreset['font'], string> = {
  sans: '"Inter", system-ui, sans-serif', serif: '"Playfair Display", Georgia, serif', rounded: '"Nunito", system-ui, sans-serif', mono: '"Space Grotesk", system-ui, sans-serif',
};
export const BODY: Record<StylePreset['font'], string> = { sans: '"Inter", system-ui, sans-serif', serif: '"Lato", system-ui, sans-serif', rounded: '"Nunito", system-ui, sans-serif', mono: '"DM Sans", system-ui, sans-serif' };
export type Look = { p: StylePreset; pal: Pal; head: string; body: string };

/** Keeps a fixed-width drawing (W px) scaled to its container width. */
export function Scaled({ w: W = 640, children }: { w?: number; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null); const inner = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.4); const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const fit = () => { const kk = el.clientWidth / W; setK(kk); setH((inner.current?.offsetHeight ?? 0) * kk); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [W]);
  // the drawing is absolutely positioned so its fixed width never widens the card (transform does not affect layout)
  return <div ref={box} style={{ position: 'relative', width: '100%', minWidth: 0, height: h || 160, overflow: 'hidden', borderRadius: 10 }}>
    <div ref={inner} style={{ position: 'absolute', top: 0, left: 0, width: W, transform: `scale(${k})`, transformOrigin: 'top left' }}>{children}</div></div>;
}

/** A realistic sample website in the look's colours and fonts: nav, hero (by layout type), service cards, footer. */
export function SitePreview({ look, lang }: { look: Look; lang: Lang }) {
  const { p, pal: c, head, body } = look; const t = STYLE_TUNE[lang];
  const r = p.font === 'rounded' ? 14 : p.font === 'mono' ? 4 : 8;
  const photo = p.photo ?? `linear-gradient(135deg, ${c.accent}, ${c.surface})`;
  const btn = <span style={{ display: 'inline-block', padding: '11px 20px', borderRadius: r, background: c.accent, color: c.onAccent, fontWeight: 700, fontSize: 14, fontFamily: body }}>{t.cta}</span>;
  const h1 = (size: number, color = c.text, align: 'left' | 'center' = 'left') => <div style={{ fontFamily: head, fontWeight: 700, fontSize: size, lineHeight: 1.12, color, letterSpacing: p.font === 'serif' ? 0 : '-0.01em', textAlign: align }}>{t.hero}</div>;
  const sub = (color = c.muted, align: 'left' | 'center' = 'left') => <p style={{ margin: '12px 0 18px', fontFamily: body, fontSize: 15, lineHeight: 1.55, color, textAlign: align }}>{t.sub}</p>;
  const hero = p.hero === 'photo'
    ? <div style={{ position: 'relative', height: 250, borderRadius: r, background: photo, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 26 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,.55))' }} />
        <div style={{ position: 'relative', maxWidth: 420 }}>{h1(32, '#ffffff')}{sub('rgba(255,255,255,.85)')}{btn}</div></div>
    : p.hero === 'split'
      ? <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 26, alignItems: 'center', padding: '14px 0' }}>
          <div>{h1(32)}{sub()}{btn}</div>
          <div style={{ height: 210, borderRadius: r, background: photo, boxShadow: `0 20px 40px -24px ${c.text}` }} /></div>
      : p.hero === 'block'
        ? <div style={{ padding: '22px 0 8px' }}><div style={{ maxWidth: 520 }}>{h1(42)}</div>{sub()}{btn}</div>
        : <div style={{ padding: '30px 40px 12px', display: 'grid', justifyItems: 'center' }}>{h1(34, c.text, 'center')}{sub(c.muted, 'center')}{btn}</div>;
  return (
    <div aria-hidden="true" style={{ background: c.bg, color: c.text, padding: '18px 26px 0', fontFamily: body }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: `1px solid ${c.surface}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 22, height: 22, borderRadius: r / 2 + 3, background: c.accent }} /><b style={{ fontFamily: head, fontSize: 16 }}>{t.biz}</b></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13, color: c.muted }}>{t.nav.map((n) => <span key={n}>{n}</span>)}<span style={{ padding: '5px 12px', borderRadius: r, border: `1px solid ${c.accent}`, color: c.accent, fontWeight: 600 }}>{t.cta}</span></div>
      </div>
      <div style={{ padding: '22px 0' }}>{hero}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {t.cards.map((x, i) => (
          <div key={x} style={{ background: c.surface, borderRadius: r, padding: 16 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: r / 2 + 2, background: c.accent, color: c.onAccent, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{['✓', '★', '☎'][i]}</span>
            <div style={{ fontFamily: head, fontWeight: 700, fontSize: 15 }}>{x}</div>
            <div style={{ fontSize: 12.5, color: c.muted, marginTop: 5, lineHeight: 1.45 }}>{t.cardText}</div>
          </div>))}
      </div>
      <div style={{ marginTop: 22, padding: '14px 0', borderTop: `1px solid ${c.surface}`, fontSize: 12, color: c.muted, display: 'flex', justifyContent: 'space-between' }}><span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: c.accent }} />{t.foot}</span><span style={{ display: 'flex', gap: 14 }}>{t.nav.map((n) => <span key={n}>{n}</span>)}</span></div>
    </div>
  );
}
export const presetLook = (p: StylePreset): Look => ({ p, pal: p.pal, head: FONT[p.font], body: BODY[p.font] });

export default function StylePage() {
  const { lang: urlLang, slug: token = '' } = useParams();
  const lang = (['tr', 'en', 'de', 'el'].includes(urlLang ?? '') ? urlLang : 'en') as Lang;
  const t = STYLE_UI[lang];
  const tt = STYLE_TUNE[lang];
  const [state, setState] = useState<'load' | 'bad' | 'pick' | 'tune' | 'refs' | 'done'>('load');
  const [palId, setPalId] = useState(''); const [own, setOwn] = useState(() => ({ ...customPalette('#1f5fbf', false), dark: false })); const [pairId, setPairId] = useState('');
  const [already, setAlready] = useState(false);
  const [likes, setLikes] = useState<string[]>([]); const [dislikes, setDislikes] = useState<string[]>([]);
  const [refs, setRefs] = useState<{ url: string; what: What | '' }[]>([{ url: '', what: '' }]);
  const [note, setNote] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const base = `/api/style/${encodeURIComponent(token)}`;
  // Leave guard: unsent choices → the logo opens a confirm banner; closing the tab shows the browser's own prompt.
  const [leaveAsk, setLeaveAsk] = useState(false); const leaving = useRef(false);
  const dirty = (state === 'pick' || state === 'tune' || state === 'refs') && (likes.length > 0 || dislikes.length > 0 || !!palId || !!pairId);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { if (leaving.current) return; e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
  const onHeaderClick = (e: React.MouseEvent) => {
    if (!dirty || !(e.target as HTMLElement).closest('a')) return;
    e.preventDefault(); e.stopPropagation(); setLeaveAsk(true);
  };

  useEffect(() => {
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'; document.head.appendChild(m);
    document.title = `${t.kicker} · Chioutworks`;
    fetch(base).then((r) => (r.ok ? r.json() : Promise.reject())).then((j) => {
      setLikes(j.likes ?? []); setDislikes(j.dislikes ?? []); setNote(j.note ?? '');
      if (j.palette?.id) setPalId(j.palette.id); if (j.palette?.custom) { setPalId('own'); setOwn({ ...customPalette(j.palette.custom.accent, !!j.palette.custom.dark), ...j.palette.custom }); } if (j.font) setPairId(j.font);
      if (j.refs?.length) setRefs(j.refs); setAlready(!!j.done); setState('pick');
    }).catch(() => setState('bad'));
    return () => m.remove();
  }, [base, t.kicker]);

  const toggle = (id: string, list: 'like' | 'dis') => {
    if (list === 'like') { setLikes((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])); setDislikes((d) => d.filter((x) => x !== id)); }
    else { setDislikes((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id])); setLikes((l) => l.filter((x) => x !== id)); }
    setErr('');
  };
  const send = async () => {
    const list = refs.map((r) => ({ ...r, url: r.url.trim() && !/^https?:\/\//i.test(r.url.trim()) ? `https://${r.url.trim()}` : r.url.trim() })).filter((r) => r.url);
    if (list.some((r) => !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(r.url))) { setErr(t.badUrl); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ likes, dislikes, refs: list, note, palette: palId === 'own' ? { custom: { accent: own.accent, dark: own.dark, bg: own.bg, surface: own.surface, text: own.text, muted: own.muted } } : palId ? { id: palId } : null, font: pairId || null }) });
      if (!r.ok) throw new Error(); setState('done');
    } catch { setErr(t.err); } finally { setBusy(false); }
  };

  const input: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 'var(--r-input)', border: '1px solid var(--c-hairline)', background: 'var(--c-abyss)', color: 'var(--c-quartz)', fontFamily: 'inherit', fontSize: 16, boxSizing: 'border-box' };
  const h1: React.CSSProperties = { margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 5vw, 36px)', color: 'var(--c-quartz)', lineHeight: 1.15 };

  return (
    <main data-site-theme="liquid" data-mode-lock="" lang={lang} style={{ minHeight: '100svh', background: 'var(--glow-hero), var(--c-void)', color: 'var(--c-mist)' }}>
      <header onClickCapture={onHeaderClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px clamp(16px, 4vw, 36px)', borderBottom: '1px solid var(--c-inkline)' }}>
        <a href={`/${lang}`} aria-label="Chioutworks" className="lq-square" style={{ display: 'inline-flex' }}><Logo size={26} /></a>
        <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-ash)' }}>{t.kicker}</span>
      </header>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(20px, 5vw, 48px) clamp(16px, 4vw, 24px) 80px' }}>
        {state === 'load' && <p>…</p>}
        {state === 'bad' && <p role="alert">{t.notFound}</p>}

        {state === 'pick' && <>
          <h1 style={h1}>{t.title}</h1>
          <p style={{ margin: '0 0 8px', lineHeight: 1.6, maxWidth: 640 }}>{t.intro}</p>
          {already && <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--c-ash)' }}>{t.already}</p>}
          <div className="st-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(210px, 100%), 1fr))', gap: 14, margin: '20px 0' }}>
            {STYLE_PRESETS.map((p) => {
              const on = likes.includes(p.id), off = dislikes.includes(p.id);
              return (
                <div key={p.id} className="lq-card" style={{ padding: 10, display: 'grid', gap: 10, minWidth: 0, borderColor: on ? 'var(--c-signal)' : undefined, opacity: off ? 0.55 : 1, transition: 'opacity .2s, border-color .2s' }}>
                  <button type="button" onClick={() => toggle(p.id, 'like')} aria-pressed={on} aria-label={`${p.label[lang]}: ${on ? t.liked : t.like}`}
                    style={{ display: 'block', width: '100%', minWidth: 0, padding: 0, border: 0, background: 'none', cursor: 'pointer', borderRadius: 10, position: 'relative', textAlign: 'start' }}>
                    <Scaled><SitePreview look={presetLook(p)} lang={lang} /></Scaled>
                    <span aria-hidden="true" style={{ position: 'absolute', top: 8, insetInlineEnd: 8, width: 30, height: 30, borderRadius: 9999, display: 'grid', placeItems: 'center', fontSize: 16,
                      background: on ? 'var(--c-signal)' : 'color-mix(in srgb, var(--c-void) 70%, transparent)', color: on ? 'var(--c-on-accent)' : 'var(--c-quartz)' }}>{on ? '♥' : '♡'}</span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <strong style={{ color: 'var(--c-quartz)', fontSize: 15 }}>{p.label[lang]}</strong>
                    <button type="button" onClick={() => toggle(p.id, 'dis')} aria-pressed={off} style={{ fontSize: 12, color: off ? 'var(--c-quartz)' : 'var(--c-ash)', background: 'none', border: 0, cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                      {off ? `✕ ${t.notMeOn}` : t.notMe}</button>
                  </div>
                </div>);
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <button type="button" className="lq-btn-ghost" style={likes.length ? { background: 'var(--c-signal)', color: 'var(--c-on-accent)', borderColor: 'var(--c-signal)' } : undefined}
              onClick={() => { if (!likes.length) { setErr(t.min); return; } setErr(''); setState('tune'); window.scrollTo(0, 0); }}>{t.next} →</button>
            {likes.length > 0 && <span style={{ fontSize: 14, color: 'var(--c-ash)' }}>♥ {t.count(likes.length)}</span>}
          </div>
          {err && <p role="alert" style={{ color: 'var(--c-lilac)', fontSize: 14, margin: '10px 0 0' }}>{err}</p>}
        </>}

        {state === 'tune' && (() => {
          const base = STYLE_PRESETS.find((x) => x.id === likes[0]) ?? STYLE_PRESETS[0];
          const pal = palId === 'own' ? { ...customPalette(own.accent, own.dark), bg: own.bg, surface: own.surface, text: own.text, muted: own.muted, accent: own.accent } : PALETTES.find((x) => x.id === palId)?.pal ?? base.pal;
          const pair = FONT_PAIRS.find((x) => x.id === pairId);
          const look: Look = { p: base, pal, head: pair ? fontCss(pair.head) : FONT[base.font], body: pair ? fontCss(pair.body) : BODY[base.font] };
          const chip = (on: boolean): React.CSSProperties => ({ padding: 12, borderRadius: 14, border: `1px solid ${on ? 'var(--c-signal)' : 'var(--c-hairline)'}`, background: on ? 'color-mix(in srgb, var(--c-signal) 14%, transparent)' : 'var(--c-abyss)', cursor: 'pointer', textAlign: 'start', color: 'var(--c-quartz)', display: 'grid', gap: 7 });
          const label: React.CSSProperties = { fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-ash)', margin: '0 0 10px' };
          return <>
            <h1 style={h1}>{tt.title}</h1>
            <p style={{ margin: '0 0 18px', lineHeight: 1.6, maxWidth: 640 }}>{tt.intro}</p>
            <div className="st-tune" style={{ display: 'grid', gap: 22, alignItems: 'start' }}>
              <div className="st-prev" style={{ display: 'grid', gap: 8 }}>
                <p style={label}>{tt.preview} · {tt.basedOn}: {base.label[lang]}</p>
                <div className="lq-card" style={{ padding: 8 }}><Scaled w={680}><SitePreview look={look} lang={lang} /></Scaled></div>
              </div>
              <div style={{ display: 'grid', gap: 22 }}>
                <section>
                  <p style={label}>{tt.palette}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: 8 }}>
                    {PALETTES.map((x) => (
                      <button key={x.id} type="button" aria-pressed={palId === x.id} onClick={() => setPalId(palId === x.id ? '' : x.id)} className="st-chip lq-square" style={chip(palId === x.id)}>
                        <span style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--c-hairline)' }}>
                          {[x.pal.bg, x.pal.surface, x.pal.accent, x.pal.text].map((col, i) => <i key={i} style={{ flex: i === 2 ? 1.6 : 1, background: col }} />)}</span>
                        <span style={{ fontSize: 13 }}>{x.name[lang]}</span>
                      </button>))}
                    <button type="button" aria-pressed={palId === 'own'} onClick={() => setPalId('own')} className="st-chip lq-square" style={chip(palId === 'own')}>
                      <span style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--c-hairline)' }}>
                        {[own.bg, own.surface, own.accent, own.text].map((col, i) => <i key={i} style={{ flex: i === 2 ? 1.6 : 1, background: col }} />)}</span>
                      <span style={{ fontSize: 13 }}>{tt.own}</span>
                    </button>
                  </div>
                  {palId === 'own' && <div className="lq-card" style={{ marginTop: 10, padding: 14, display: 'grid', gap: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--c-ash)' }}>{tt.ownHint}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                      {(['accent', 'bg', 'surface', 'text', 'muted'] as const).map((k) => (
                        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, border: '1px solid var(--c-hairline)', background: 'var(--c-abyss)', cursor: 'pointer' }}>
                          <input type="color" value={own[k]} onChange={(e) => setOwn((o) => (k === 'accent' ? { ...o, ...customPalette(e.target.value, o.dark), dark: o.dark } : { ...o, [k]: e.target.value }))}
                            style={{ width: 36, height: 36, padding: 0, border: 0, borderRadius: 8, background: 'none', cursor: 'pointer', flex: 'none' }} />
                          <span style={{ display: 'grid', gap: 2, minWidth: 0 }}><span style={{ fontSize: 13, color: 'var(--c-quartz)' }}>{tt.roles[k]}</span><code style={{ fontSize: 11.5, color: 'var(--c-ash)' }}>{own[k]}</code></span>
                        </label>))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {[false, true].map((d) => <button key={String(d)} type="button" className="lq-btn-ghost" aria-pressed={own.dark === d} onClick={() => setOwn({ ...customPalette(own.accent, d), dark: d })}
                        style={{ padding: '6px 12px', fontSize: 13, ...(own.dark === d ? { background: 'var(--c-signal)', color: 'var(--c-on-accent)', borderColor: 'var(--c-signal)' } : {}) }}>{d ? tt.dark : tt.light}</button>)}
                    </div>
                  </div>}
                </section>
                <section>
                  <p style={label}>{tt.fonts}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                    {pairsFor(lang).map((x) => (
                      <button key={x.id} type="button" aria-pressed={pairId === x.id} onClick={() => setPairId(pairId === x.id ? '' : x.id)} className="st-chip lq-square" style={chip(pairId === x.id)}>
                        <span style={{ fontFamily: fontCss(x.head), fontWeight: 700, fontSize: 19, lineHeight: 1.1 }}>{x.name[lang]}</span>
                        <span style={{ fontFamily: fontCss(x.body), fontSize: 12.5, color: 'var(--c-mist)' }}>{tt.sub.split('.')[0]}.</span>
                        <span style={{ fontSize: 11, color: 'var(--c-ash)' }}>{x.head === x.body ? x.head : `${x.head} + ${x.body}`}</span>
                      </button>))}
                  </div>
                </section>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
              <button type="button" className="lq-btn-ghost" onClick={() => setState('pick')}>← {tt.back}</button>
              <button type="button" className="lq-btn-ghost" onClick={() => { setState('refs'); window.scrollTo(0, 0); }} style={{ background: 'var(--c-signal)', color: 'var(--c-on-accent)', borderColor: 'var(--c-signal)' }}>{tt.next} →</button>
            </div>
          </>;
        })()}

        {state === 'refs' && <>
          <h1 style={h1}>{t.refTitle}</h1>
          <p style={{ margin: '0 0 18px', lineHeight: 1.6, maxWidth: 640 }}>{t.refIntro}</p>
          {refs.map((r, i) => (
            <div key={i} className="lq-card" style={{ padding: 16, marginBottom: 12, display: 'grid', gap: 10 }}>
              <input style={input} type="url" inputMode="url" placeholder={t.refPh} value={r.url} aria-label={t.refTitle}
                onChange={(e) => setRefs(refs.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              <div role="group" aria-label={t.what} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>{t.what}</span>
                {(Object.keys(t.whatOpts) as What[]).map((w) => (
                  <button key={w} type="button" className="lq-btn-ghost" aria-pressed={r.what === w} onClick={() => setRefs(refs.map((x, j) => (j === i ? { ...x, what: x.what === w ? '' : w } : x)))}
                    style={{ padding: '6px 12px', fontSize: 13, ...(r.what === w ? { background: 'var(--c-signal)', color: 'var(--c-on-accent)', borderColor: 'var(--c-signal)' } : {}) }}>{t.whatOpts[w]}</button>))}
              </div>
            </div>))}
          {refs.length < 2 && <button type="button" onClick={() => setRefs([...refs, { url: '', what: '' }])} style={{ fontSize: 14, color: 'var(--c-lilac)', background: 'none', border: 0, cursor: 'pointer', marginBottom: 14 }}>{t.addRef}</button>}
          <textarea style={{ ...input, minHeight: 90 }} placeholder={t.notePh} value={note} onChange={(e) => setNote(e.target.value)} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            <button type="button" className="lq-btn-ghost" onClick={() => setState('tune')}>← {t.back}</button>
            <button type="button" className="lq-btn-ghost" disabled={busy} onClick={send} style={{ background: 'var(--c-signal)', color: 'var(--c-on-accent)', borderColor: 'var(--c-signal)' }}>
              {busy ? t.sending : refs.some((r) => r.url.trim()) || note.trim() ? t.send : `${t.skip} & ${t.send}`}</button>
          </div>
          {err && <p role="alert" style={{ color: 'var(--c-lilac)', fontSize: 14, margin: '10px 0 0' }}>{err}</p>}
        </>}

        {state === 'done' && (
          <div className="lq-card" style={{ padding: 40, textAlign: 'center' }}>
            <h1 style={h1}>✓ {t.doneTitle}</h1>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{t.doneBody}</p>
          </div>)}
      </div>
      {leaveAsk && (() => { const L = STYLE_LEAVE[lang]; return (
        <div role="dialog" aria-modal="true" aria-labelledby="st-leave-t" onClick={() => setLeaveAsk(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', padding: 16, background: 'color-mix(in srgb, var(--c-void) 72%, transparent)', backdropFilter: 'blur(6px)' }}>
          <div className="lq-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, width: '100%', padding: 'clamp(22px, 5vw, 32px)', display: 'grid', gap: 14, background: 'var(--c-abyss)' }}>
            <h2 id="st-leave-t" style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--c-quartz)', lineHeight: 1.2 }}>{L.title}</h2>
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>{L.body}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
              <button type="button" className="lq-btn-ghost" autoFocus onClick={() => setLeaveAsk(false)} style={{ background: 'var(--c-signal)', color: 'var(--c-on-accent)', borderColor: 'var(--c-signal)' }}>{L.stay}</button>
              <button type="button" onClick={() => { leaving.current = true; window.location.assign(`/${lang}`); }}
                style={{ background: 'none', border: 0, color: 'var(--c-ash)', fontSize: 14, textDecoration: 'underline', cursor: 'pointer', padding: '8px 4px' }}>{L.leave}</button>
            </div>
          </div>
        </div>); })()}
    </main>
  );
}

/** Button shown after the intake / voice call: opens (and creates once) the personal style link. */
export function StyleCta({ lang, body, newTab }: { lang: Lang; body: Record<string, string>; newTab?: boolean }) {
  const t = STYLE_UI[lang];
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(false);
  const go = async () => {
    setBusy(true); setErr(false);
    try {
      const r = await fetch('/api/style/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, lang }) });
      const j = await r.json(); if (!r.ok || !j.path) throw new Error();
      if (newTab) { window.open(j.path, '_blank', 'noopener'); setBusy(false); } else window.location.assign(j.path);
    } catch { setErr(true); setBusy(false); }
  };
  return (
    <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--r-input)', background: 'var(--c-deep-sea)', border: '1px solid var(--c-hairline)', textAlign: 'start' }}>
      <strong style={{ display: 'block', color: 'var(--c-quartz)', marginBottom: 4 }}>{t.ctaTitle}</strong>
      <p style={{ margin: '0 0 12px', lineHeight: 1.55, fontSize: 14 }}>{t.ctaBody}</p>
      <button type="button" className="lq-btn-ghost" disabled={busy} onClick={go}>{t.ctaBtn}</button>
      {err && <p role="alert" style={{ color: 'var(--c-lilac)', fontSize: 14, margin: '8px 0 0' }}>{t.err}</p>}
    </div>
  );
}
