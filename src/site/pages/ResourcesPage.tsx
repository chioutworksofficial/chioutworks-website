import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import type { Lang } from '../../translations';
import { pagePath } from '../../lib/routes';
import { RESOURCES_UI, RESOURCES_TPL, RESOURCES_LEGAL, RESOURCES_CTA, COUNTRIES, DEFAULT_COUNTRY, type Country } from '../i18n/resources';
import PageHero from '../PageHero';
import StatementReveal from '../StatementReveal';
import { copyText } from '../../lib/uid';

type UI = (typeof RESOURCES_UI)[Lang];
const mono = { fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--c-ash)', opacity: 0.7 } as const;
const field = { width: '100%', padding: '10px 14px', border: '1px solid var(--c-hairline)', background: 'var(--c-void)', color: 'var(--c-quartz)', fontSize: 14, borderRadius: 8 } as const;
const lbl = { display: 'block', fontSize: 12, color: 'var(--c-ash)', marginBottom: 6 } as const;
const btn = { padding: '9px 18px', fontSize: 13, border: '1px solid var(--c-hairline)', color: 'var(--c-quartz)', background: 'var(--c-deep-sea)' } as const;
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Resolve a CSS variable to #rrggbb that qrcode accepts. */
function tokenColor(name: string): string {
  const raw = getComputedStyle(document.querySelector('[data-site-theme]') ?? document.documentElement).getPropertyValue(name).trim();
  const c = document.createElement('canvas').getContext('2d');
  if (!c) return raw;
  c.fillStyle = raw;
  return c.fillStyle;
}
const qrColors = (style: 'dark' | 'light') => {
  const a = tokenColor('--c-quartz'), b = tokenColor('--c-void');
  return style === 'dark' ? { dark: a, light: b } : { dark: b, light: a };
};
const save = (href: string, name: string) => { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); };

function useCopy(ui: { copied: string; fail: string }, label: string) {
  const [txt, setTxt] = useState(label);
  const run = async (v: string) => {
    setTxt((await copyText(v)) ? ui.copied : ui.fail);
    setTimeout(() => setTxt(label), 1800);
  };
  return [txt, run] as const;
}

function QrBox({ text, ui, name }: { text: string; ui: UI['qr']; name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(512);
  const [style, setStyle] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    if (!text || !ref.current) return;
    QRCode.toCanvas(ref.current, text, { width: size, margin: 2, color: qrColors(style) }).then(() => { if (ref.current) { ref.current.style.width = '200px'; ref.current.style.height = '200px'; } }).catch(() => {});
  }, [text, size, style]);
  const svg = async () => {
    const s = await QRCode.toString(text, { type: 'svg', margin: 2, color: qrColors(style) });
    const url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' }));
    save(url, `${name}.svg`); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <div><span style={lbl}>{ui.size}</span><div className="flex gap-2">{[256, 512, 1024].map((n) => <button key={n} type="button" aria-pressed={size === n} onClick={() => setSize(n)} className="lq-square" style={{ ...btn, padding: '6px 12px', borderRadius: 6, background: size === n ? 'var(--c-cobalt)' : 'var(--c-deep-sea)' }}>{n}</button>)}</div></div>
        <div><span style={lbl}>{ui.style}</span><div className="flex gap-2">{(['dark', 'light'] as const).map((s) => <button key={s} type="button" aria-pressed={style === s} onClick={() => setStyle(s)} className="lq-square" style={{ ...btn, padding: '6px 12px', borderRadius: 6, background: style === s ? 'var(--c-cobalt)' : 'var(--c-deep-sea)' }}>{ui[s]}</button>)}</div></div>
      </div>
      {text ? (
        <div className="flex flex-col items-start gap-4">
          <canvas ref={ref} aria-label={ui.alt} style={{ width: 'min(100%, 200px)', height: 'auto', aspectRatio: '1', borderRadius: 8, border: '1px solid var(--c-hairline)' }} />
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="lq-btn-ghost" style={btn} onClick={() => ref.current && save(ref.current.toDataURL('image/png'), `${name}.png`)}>{ui.png}</button>
            <button type="button" className="lq-btn-ghost" style={btn} onClick={svg}>{ui.svg}</button>
          </div>
        </div>
      ) : <p style={{ fontSize: 13, color: 'var(--c-ash)' }}>{ui.empty}</p>}
    </div>
  );
}

function QrTool({ ui }: { ui: UI }) {
  const [v, setV] = useState('');
  return (<div><label style={lbl} htmlFor="qr-in">{ui.qr.input}</label><input id="qr-in" value={v} onChange={(e) => setV(e.target.value)} placeholder={ui.qr.ph} style={{ ...field, marginBottom: 16 }} /><QrBox text={v.trim()} ui={ui.qr} name="qr" /></div>);
}

function ReviewTool({ ui }: { ui: UI }) {
  const [id, setId] = useState('');
  const link = id.trim() ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id.trim())}` : '';
  const [cp, copy] = useCopy(ui.review, ui.review.copy);
  return (
    <div>
      <label style={lbl} htmlFor="rv-in">{ui.review.input}</label>
      <input id="rv-in" value={id} onChange={(e) => setId(e.target.value)} placeholder={ui.review.ph} style={field} />
      <p className="mt-2 mb-4" style={{ fontSize: 12, color: 'var(--c-ash)' }}>{ui.review.help} <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener" style={{ color: 'var(--c-quartz)', textDecoration: 'underline' }}>{ui.review.helpLink}</a></p>
      {link ? (
        <>
          <span style={lbl}>{ui.review.link}</span>
          <div className="flex gap-2 items-center mb-4"><code style={{ ...field, fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all', flex: 1 }}>{link}</code>
            <button type="button" className="lq-btn-ghost" style={btn} onClick={() => copy(link)}>{cp}</button></div>
          <QrBox text={link} ui={ui.qr} name="google-review" />
        </>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: 'var(--c-ash)', marginBottom: 12 }}>{ui.review.empty}</p>
          <div aria-hidden="true" style={{ opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
            <span style={lbl}>{ui.review.example}</span>
            <code style={{ ...field, display: 'block', fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all', marginBottom: 12 }}>https://search.google.com/local/writereview?placeid=ChIJ...</code>
            <QrBox text="https://search.google.com/local/writereview?placeid=ChIJ" ui={ui.qr} name="sample" />
          </div>
        </div>
      )}
    </div>
  );
}

function MsgTool({ ui, lang }: { ui: UI; lang: Lang }) {
  const [cat, setCat] = useState<keyof typeof RESOURCES_TPL.tr>('closed');
  const [tl, setTl] = useState<Lang>(lang);
  const [f, setF] = useState({ name: '', when: '', link: '' });
  useEffect(() => setTl(lang), [lang]);
  const m = ui.msg;
  const out = RESOURCES_TPL[tl][cat].replace('{name}', f.name || m.namePh).replace('{when}', f.when || m.whenPh).replace('{link}', f.link || m.linkPh);
  const [cp, copy] = useCopy(m, m.copy);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label style={lbl} htmlFor="m-cat">{m.cat}</label><select id="m-cat" value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} style={field}>{Object.entries(m.cats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={lbl} htmlFor="m-lang">{m.lang}</label><select id="m-lang" value={tl} onChange={(e) => setTl(e.target.value as Lang)} style={field}>{([['tr', 'Türkçe'], ['de', 'Deutsch'], ['en', 'English'], ['el', 'Ελληνικά']] as const).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><label style={lbl} htmlFor="m-n">{m.name}</label><input id="m-n" value={f.name} onChange={set('name')} placeholder={m.namePh} style={field} /></div>
        <div><label style={lbl} htmlFor="m-w">{m.when}</label><input id="m-w" value={f.when} onChange={set('when')} placeholder={m.whenPh} style={field} /></div>
        <div><label style={lbl} htmlFor="m-l">{m.link}</label><input id="m-l" value={f.link} onChange={set('link')} placeholder={m.linkPh} style={field} /></div>
      </div>
      <span style={lbl}>{m.preview}</span>
      <p style={{ ...field, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: 14 }}>{out}</p>
      <div><button type="button" className="lq-btn-ghost" style={btn} onClick={() => copy(out)}>{cp}</button></div>
    </div>
  );
}

const KEY = 'cw-legal-check-v2';
type Saved = { country?: Country; checks?: Partial<Record<Country, boolean[]>> };
const readSaved = (): Saved => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Saved; } catch { return {}; } };
function LegalTool({ ui, lang }: { ui: UI; lang: Lang }) {
  const L = ui.legal;
  const D = RESOURCES_LEGAL[lang];
  const [saved, setSaved] = useState<Saved>(readSaved);
  const country: Country = saved.country && COUNTRIES.includes(saved.country) ? saved.country : DEFAULT_COUNTRY[lang];
  const list = [...D.common.map((x) => [x, D.commonHead] as const), ...D.items[country].map((x) => [x, D.names[country]] as const)];
  const done = list.map((_, i) => saved.checks?.[country]?.[i] === true);
  const persist = (n: Saved) => { setSaved(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* ignore */ } };
  const setChecks = (n: boolean[]) => persist({ ...saved, country, checks: { ...saved.checks, [country]: n } });
  const count = done.filter(Boolean).length;
  return (
    <div>
      <span style={lbl}>{D.label}</span>
      <div role="radiogroup" aria-label={D.label} className="flex flex-wrap gap-2 mb-5">
        {COUNTRIES.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={country === c} onClick={() => persist({ ...saved, country: c })}
            style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, cursor: 'pointer', border: country === c ? '1px solid var(--c-signal)' : '1px solid var(--c-hairline)', background: country === c ? 'var(--c-cobalt)' : 'var(--c-deep-sea)', color: 'var(--c-quartz)' }}>{D.names[c]}</button>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div role="progressbar" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={count} style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--c-edge)', overflow: 'hidden' }}><div style={{ width: `${(count / list.length) * 100}%`, height: '100%', background: 'var(--c-signal)', transition: 'width .3s' }} /></div>
        <span style={{ ...mono, opacity: 1 }}>{count}/{list.length} {L.progress}</span>
      </div>
      <ul className="grid gap-3">
        {list.map(([[t, d], g], i) => (
          <li key={country + t}><label className="flex gap-3 items-start" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={done[i]} onChange={() => setChecks(done.map((x, j) => (j === i ? !x : x)))} style={{ marginTop: 4, accentColor: 'var(--c-signal)' }} />
            <span><span style={{ ...mono, fontSize: 10, display: 'block', marginBottom: 2 }}>{g}</span><span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--c-quartz)' }}>{t}</span><span style={{ fontSize: 13, color: 'var(--c-ash)', lineHeight: 1.5 }}>{d}</span></span>
          </label></li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-3"><p style={{ fontSize: 12, color: 'var(--c-mist)' }}>{L.note}</p><button type="button" className="lq-btn-ghost" style={btn} onClick={() => setChecks(list.map(() => false))}>{L.reset}</button></div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const [flat, setFlat] = useState(false);
  return (
    <div style={{ perspective: 1400 }} className="h-full">
      <div onMouseEnter={() => setFlat(true)} onMouseLeave={() => setFlat(false)} onFocus={() => setFlat(true)} onBlur={() => setFlat(false)}
        className="h-full overflow-auto p-5 md:p-6 lg:[transform:var(--tilt)]"
        style={{ ['--tilt' as string]: flat || reduced() ? 'none' : 'rotateY(-7deg) rotateX(2deg)', transition: 'transform .5s', border: '1px solid var(--c-hairline)', borderRadius: 'var(--r-card)', background: 'var(--c-abyss)', boxShadow: '0 30px 60px color-mix(in srgb, var(--c-void) 70%, transparent)' }}>
        {children}
      </div>
    </div>
  );
}

const Icon = ({ i }: { i: number }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--c-signal)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {[<path key="a" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />,
      <path key="b" d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />,
      <path key="c" d="M4 5h16v11H9l-5 4z" />,
      <path key="d" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4" />][i]}
  </svg>
);

export default function ResourcesPage({ lang }: { lang: Lang }) {
  const ui = RESOURCES_UI[lang];
  const keys = ['qr', 'review', 'msg', 'legal'] as const;
  const topics = ['res-qr', 'res-review', 'res-messages', 'res-legal'] as const;
  const cta = RESOURCES_CTA[lang];
  const bodies = [<QrTool ui={ui} />, <ReviewTool ui={ui} />, <MsgTool ui={ui} lang={lang} />, <LegalTool ui={ui} lang={lang} />];
  const wraps = useRef<(HTMLDivElement | null)[]>([]);
  const inner = useRef<(HTMLDivElement | null)[]>([]);
  const veil = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      const desk = window.innerWidth >= 1024;
      wraps.current.forEach((w, i) => {
        const el = inner.current[i], vl = veil.current[i], nx = wraps.current[i + 1];
        if (!el || !vl) return;
        const p = desk && nx ? clamp((vh - nx.getBoundingClientRect().top) / (vh - 110 - 24)) : 0;
        el.style.transform = `scale(${1 - 0.06 * p})`; vl.style.opacity = String(0.55 * p);
        void w;
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div>
      <PageHero word={ui.word} intro={ui.intro} explore={ui.explore} targetId="res-overview" />
      <StatementReveal lang={lang} id="res-overview" text={`${ui.stPre} ${ui.stAccent.split(' ').map((w) => `*${w}*`).join(' ')} ${ui.stPost}`} caption="" items={keys.map((k) => ui.tools[k].title)} body={ui.para} />
      <p className="text-center pb-8" style={mono}>{ui.toolsEyebrow}</p>
      <section className="px-4 lg:px-[100px] pb-24 mx-auto" style={{ maxWidth: 1600 }}>
        {keys.map((k, i) => (
          <div key={k} ref={(e) => { wraps.current[i] = e; }} className="lg:sticky mb-6 lg:mb-10" style={{ top: 110 }}>
            <div ref={(e) => { inner.current[i] = e; }} className="relative lg:h-[min(78vh,720px)] grid lg:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-10 lg:p-14"
              style={{ transformOrigin: 'center top', border: '1px solid var(--c-edge)', borderRadius: 'var(--r-card)', background: 'radial-gradient(ellipse 70% 40% at 50% 0%, color-mix(in srgb, var(--c-cobalt) 35%, transparent), transparent 70%), linear-gradient(to bottom, var(--c-deep-sea), var(--c-void))', overflow: 'hidden' }}>
              <div className="flex flex-col justify-center min-w-0">
                <Icon i={i} />
                <h3 className="mt-6" style={{ fontSize: 'clamp(32px, 3.9vw, 56px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', fontFamily: 'var(--font-display)', color: 'var(--c-quartz)' }}>{ui.tools[k].title}</h3>
                <p className="mt-5" style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--c-ash)' }}>{ui.tools[k].desc}</p>
                <p className="mt-8" style={{ fontSize: 15 }}><Link to={`${pagePath(lang, 'contact')}?topic=${topics[i]}`} style={{ color: 'var(--c-quartz)', textDecoration: 'underline' }}>{cta[k] + ' →'}</Link></p>
                {k === 'legal' && <p className="mt-2" style={{ fontSize: 12, color: 'var(--c-mist)' }}>{cta.legalNote}</p>}
              </div>
              <div className="min-w-0 lg:min-h-0"><Frame>{bodies[i]}</Frame></div>
              <div ref={(e) => { veil.current[i] = e; }} aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'var(--c-void)', opacity: 0 }} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
