import { SCRUB } from '../lib/smoothScroll';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '../translations';
import { demoPath, pagePath } from '../lib/routes';
import { FEATURES_UI } from './i18n/features';
import { ageText, makeFmt, makeRng, RATE, useSim } from './featureSim';

gsap.registerPlugin(ScrollTrigger);
// Phones (owner, 2026-11-23: card run felt stuck while scrolling): don't recompute every pin when the address bar hides/shows,
// and follow the finger closely instead of trailing behind native touch scrolling.
ScrollTrigger.config({ ignoreMobileResize: true });
const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const DEV = (import.meta as unknown as { env: { DEV: boolean } }).env.DEV;

type Mock = (typeof FEATURES_UI)['en']['mock'];
const SHOTS: (string | null)[] = [null, 'demokuafor', 'democrm', 'demoklinik', 'demotemizlik', null, null, null, 'demokuafor', 'demotemizlik', 'demosadakat', 'demokafe'];

/** Display order (indices into items/SHOTS/MOCK_BY): demo cards first, info cards after. */
const ORDER = [1, 2, 11, 4, 3, 8, 10, 9, 0, 7, 5, 6];

const panel: CSSProperties = { background: 'linear-gradient(180deg, color-mix(in srgb, var(--c-quartz, #ffffff) 8%, var(--c-deep-sea, #0d172b)), var(--c-abyss, #0e111b))', border: '1px solid var(--c-edge, #172540)', borderTopColor: 'var(--c-hairline, #24375a)', borderRadius: 12 };
const tiny: CSSProperties = { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-ash, #abaebb)' };
const dot = (c = 'var(--c-lilac, #85a6e9)'): CSSProperties => ({ width: 6, height: 6, borderRadius: 999, background: c, flex: 'none' });
const Toast = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-2 px-3 py-2" style={{ ...panel, fontSize: 12, color: 'var(--c-quartz, #ffffff)', background: 'color-mix(in srgb, var(--c-lilac, #85a6e9) 28%, var(--c-abyss, #0e111b))' }}>
    <span style={dot()} />{children}
  </div>
);

const Star = ({ size }: { size: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 100 100" className="flex-none" style={{ margin: '0 0.6em' }}>
    <path d="M50 2C54 34 66 46 98 50C66 54 54 66 50 98C46 66 34 54 2 50C34 46 46 34 50 2Z" fill="none" style={{ stroke: 'color-mix(in srgb, var(--c-lilac, #85a6e9) 22%, transparent)' }} strokeWidth="5" vectorEffect="non-scaling-stroke" />
  </svg>
);

const outline: CSSProperties = { WebkitTextStroke: '1.5px color-mix(in srgb, var(--c-lilac, #85a6e9) 26%, transparent)', color: 'transparent', fontWeight: 500, lineHeight: 0.9, letterSpacing: '-0.03em', whiteSpace: 'nowrap' };

function Row({ text, refEl }: { text: string; refEl: (el: HTMLDivElement | null) => void }) {
  return (
    <div ref={refEl} className="flex items-center w-max will-change-transform" style={{ fontSize: 'clamp(110px, 17.5vw, 252px)', ...outline }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex items-center">{text}<Star size={185} /></span>
      ))}
    </div>
  );
}

type Sim = (typeof FEATURES_UI)['en']['sim'];
type P = { m: Mock; s: Sim; x: FX; lang: Lang };
type FX = (typeof FEATURES_UI)['en']['x'];
const Q = 'var(--c-quartz, #ffffff)', MI = 'var(--c-mist, #c7c9d1)', AS = 'var(--c-ash, #abaebb)', LI = 'var(--c-lilac, #85a6e9)', AB = 'var(--c-abyss, #0e111b)';
const ini = (n: string) => { const p = n.split(' '); return p[0][0] + (p[1]?.[0] ?? ''); };
const FX_CSS = `
.fx{animation-duration:10s;animation-iteration-count:infinite;animation-fill-mode:both;animation-timing-function:ease-in-out;animation-delay:var(--d,0s)}
.fx-bar{animation-name:fx-bar;animation-duration:var(--du,1.1s);animation-direction:alternate}
@keyframes fx-bar{from{transform:scaleY(.28)}to{transform:scaleY(1)}}
.fx-ring{animation-name:fx-ring;animation-duration:2.6s;animation-timing-function:ease-out}
@keyframes fx-ring{0%{transform:scale(.95);opacity:.7}100%{transform:scale(1.8);opacity:0}}
.fx-blink{animation-name:fx-blink;animation-duration:1s;animation-timing-function:steps(2,start)}
@keyframes fx-blink{50%{opacity:0}}
.fx-pulse{animation-name:fx-pulse;animation-duration:2s}
@keyframes fx-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.5)}}
.fx-dots i{animation:fx-dot 1.2s ease-in-out infinite both;animation-delay:var(--dd,0s)}
@keyframes fx-dot{0%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
.fx-enter{animation:fx-enter .5s cubic-bezier(.2,.8,.2,1) both}
@keyframes fx-enter{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
.fx-flash{display:inline-block;animation:fx-flash .6s ease-out both}
@keyframes fx-flash{from{opacity:.4;transform:translateY(-3px)}to{opacity:1;transform:none}}
.fx-shift{animation:fx-shift .5s ease-out both}
@keyframes fx-shift{from{transform:translateX(var(--sh,5%))}to{transform:none}}
.fx-root{transform-style:preserve-3d;transition:transform .3s ease-out;transform:rotateY(calc(var(--px,0)*3deg + var(--tx,0)*-2deg)) rotateX(calc(var(--py,0)*-2.5deg))}
.fx-scan{animation-name:fx-scan;animation-duration:2.4s;animation-direction:alternate;animation-timing-function:ease-in-out}
@keyframes fx-scan{from{top:4px}to{top:calc(100% - 6px)}}
.fx-z1,.fx-z2{transition:transform .3s ease-out}
.fx-z1{transform:translate3d(calc(var(--px,0)*4px + var(--tx,0)*-3px),calc(var(--py,0)*3px),18px)}
.fx-z2{transform:translate3d(calc(var(--px,0)*8px + var(--tx,0)*-6px),calc(var(--py,0)*6px),38px)}
.fx-shell{box-shadow:0 2px 6px -2px color-mix(in srgb,var(--c-void,#0b0c0e) 45%,transparent),0 22px 44px -22px color-mix(in srgb,var(--c-void,#0b0c0e) 75%,transparent)}
html[data-mode="light"] .fx-shell{box-shadow:0 2px 6px -2px color-mix(in srgb,var(--c-void,#0b0c0e) 18%,transparent),0 18px 36px -20px color-mix(in srgb,var(--c-void,#0b0c0e) 38%,transparent)}
.fx-card[data-act="0"] .fx,.fx-card[data-act="0"] .fx-dots i{animation-play-state:paused}
@media (prefers-reduced-motion: reduce){.fx-card .fx,.fx-card .fx-dots i,.fx-enter,.fx-flash,.fx-shift{animation:none!important}.fx-ring{display:none}.fx-root,.fx-z1,.fx-z2{transform:none!important}}
`;

/** The "Demo" badge sits on the card's top edge like a tab (outside the screen), so it never covers the animation.
 *  Draws the card's mock screen at one fixed design size and scales it to the card's real size (owner, 2026-11-23):
 *  cards shrink with the viewport (56svh), and the content used to overflow at the bottom on shorter screens. */
const FIT_W = 427, FIT_H = 520;   // the card's own max size: at full size nothing changes (scale 1), smaller cards scale down instead of overflowing
function FitBox({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => { const h = el.clientHeight, w = el.clientWidth; if (h && w) setK(Math.min(1, h / FIT_H, w / FIT_W)); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
      <div className="absolute left-0 top-0" style={{ width: FIT_W, height: FIT_H, transform: `scale(${k || 1})`, transformOrigin: '0 0', transformStyle: 'preserve-3d', visibility: k ? 'visible' : 'hidden' }}>{children}</div>
    </div>
  );
}

function Float({ z = 2, className = '', children }: { z?: 1 | 2; className?: string; children: ReactNode }) {
  return (
    <div className={`relative ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      <span aria-hidden="true" className="absolute pointer-events-none" style={{ left: '8%', right: '8%', bottom: -10, height: 14, filter: 'blur(8px)', background: 'radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--c-void, #0b0c0e) 85%, transparent), transparent)' }} />
      <div className={`h-full ${z === 2 ? 'fx-z2' : 'fx-z1'}`}>{children}</div>
    </div>
  );
}
const Num = ({ v, f }: { v: number; f: (n: number) => string }) => <span key={v} className="fx-flash">{f(v)}</span>;

const pill = (on?: boolean): CSSProperties => ({ fontSize: 10.5, fontWeight: 500, borderRadius: 9999, padding: '3px 9px', whiteSpace: 'nowrap', color: on ? AB : MI, background: on ? LI : 'color-mix(in srgb, var(--c-quartz, #ffffff) 10%, transparent)', border: '1px solid var(--c-edge, #172540)' });
const sub: CSSProperties = { background: 'color-mix(in srgb, var(--c-quartz, #ffffff) 7%, transparent)', border: '1px solid var(--c-edge, #172540)', borderRadius: 12 };
const mono: CSSProperties = { fontFamily: 'var(--font-mono, monospace)' };
const Av = ({ n, size = 26 }: { n: string; size?: number }) => (
  <span className="flex-none flex items-center justify-center rounded-full" style={{ width: size, height: size, fontSize: size * 0.38, fontWeight: 600, color: Q, background: 'color-mix(in srgb, var(--c-signal, #2862d7) 45%, var(--c-abyss, #0e111b))', border: '1px solid var(--c-hairline, #24375a)' }}>{ini(n)}</span>
);
function AppBar({ title, sub: sb, av }: { title: string; sub?: ReactNode; av: string }) {
  return (
    <div className="flex items-center gap-2.5 flex-none" style={{ height: 32, paddingRight: 96 }}>
      <Av n={av} size={30} />
      <div className="min-w-0"><p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: Q, lineHeight: 1.15 }}>{title}</p>{sb != null && <p className="truncate" style={{ fontSize: 10.5, color: AS, lineHeight: 1.2 }}>{sb}</p>}</div>
    </div>
  );
}
const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const Ico = ({ d, size = 16, sw = 1.6, fill = 'none', c = Q }: { d: string; size?: number; sw?: number; fill?: string; c?: string }) => <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
const Live = ({ children }: { children: ReactNode }) => <span className="inline-flex items-center gap-1.5" style={pill(false)}><span className="fx fx-pulse" style={dot()} />{children}</span>;
const lblMono = (extra?: CSSProperties): CSSProperties => ({ ...tiny, fontSize: 9.5, letterSpacing: '0.08em', ...extra });
const weekDates = () => { const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return { days: Array.from({ length: 5 }, (_, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); return x; }), today: Math.min(4, (d.getDay() + 6) % 7) }; };

function Timer({ from }: { from: number }) {
  const [t, setT] = useState(from);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const i = window.setInterval(() => setT((v) => v + 1), 1000);
    return () => window.clearInterval(i);
  }, []);
  return <span style={{ ...mono, fontSize: 12, color: Q }}>{String(Math.floor(t / 60)).padStart(2, '0')}:{String(t % 60).padStart(2, '0')}</span>;
}

function VoiceMock({ s, x }: P) {
  const [st, ref] = useSim(() => ({ k: 0, ph: 2, n: 999 }), (z, r) => {
    if (z.ph === 2) { z.k = (z.k + 1) % s.voice.length; z.ph = 0; z.n = 0; return 700; }
    z.n++;
    const len = (z.ph === 0 ? s.voice[z.k] : x.voiceA[z.k]).length;
    if (z.n >= len) { if (z.ph === 0) { z.ph = 1; z.n = 0; return 550; } z.ph = 2; return 3400; }
    return 38 + r.f() * 40;
  }, 11);
  const heights = [8, 14, 22, 30, 38, 30, 44, 36, 24, 34, 42, 28, 20, 30, 38, 24, 14, 10, 8];
  const cust = s.voice[st.k], bot = x.voiceA[st.k];
  const nm = s.names[st.k % s.names.length];
  const botTyping = st.ph === 1, botShown = st.ph === 2 ? bot : st.ph === 1 ? bot.slice(0, st.n) : '';
  const custShown = st.ph === 0 ? cust.slice(0, st.n) : cust;
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={nm} title={nm} sub={x.phones[st.k % x.phones.length]} />
      <Float z={1}>
        <div className="flex items-center justify-between px-3 py-2" style={panel}>
          <span className="flex items-center gap-2"><Live>{x.live}</Live><span style={{ fontSize: 11, color: AS }}>{x.call}</span></span>
          <Timer key={st.k} from={12 + st.k * 23} />
        </div>
      </Float>
      <div className="flex items-center justify-center gap-[4px] px-3" style={{ ...sub, height: 58 }}>
        {heights.map((h, i) => <span key={i} className="fx fx-bar rounded-full" style={{ width: 3, height: h, background: i % 3 === 0 ? LI : Q, opacity: 0.5 + h / 100, ['--du' as string]: `${0.8 + (i % 5) * 0.17}s`, ['--d' as string]: `${-i * 0.19}s` }} />)}
      </div>
      <Float z={2} className="flex-1 min-h-0">
        <div className="h-full px-3.5 py-3 flex flex-col gap-3" style={panel}>
          <div>
            <p className="flex items-center gap-2" style={lblMono()}>{x.cust}<span style={{ ...pill(false), padding: '1px 6px', fontSize: 9 }}>{x.lt}</span></p>
            <p style={{ fontSize: 12.5, color: Q, marginTop: 4, lineHeight: 1.35, minHeight: 34 }}>{custShown}{st.ph === 0 && <span aria-hidden="true" className="fx fx-blink inline-block align-middle ml-0.5" style={{ width: 1.5, height: 13, background: Q }} />}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--c-edge, #172540)', paddingTop: 10 }}>
            <p className="flex items-center gap-2" style={lblMono({ color: LI })}><span style={dot()} />{x.bot}</p>
            <p style={{ fontSize: 12.5, color: MI, marginTop: 4, lineHeight: 1.35, minHeight: 34 }}>{botShown}{botTyping && <span aria-hidden="true" className="fx fx-blink inline-block align-middle ml-0.5" style={{ width: 1.5, height: 13, background: LI }} />}</p>
          </div>
        </div>
      </Float>
      <div className="flex items-center justify-center gap-4 flex-none">
        {['M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3', 'M4 6h16M4 12h16M4 18h16'].map((d, i) => <span key={i} className="flex items-center justify-center rounded-full" style={{ width: 38, height: 38, ...sub, borderRadius: 9999 }}><Ico d={d} size={16} /></span>)}
        <span className="flex items-center justify-center rounded-full" style={{ width: 44, height: 38, borderRadius: 9999, background: 'var(--c-pulse, #305fbd)' }}><Ico d="M4 15c4-4 12-4 16 0l-2 3-3-1.5v-2.5c-2-.7-4-.7-6 0v2.5L6 18z" size={18} sw={1.4} /></span>
      </div>
    </div>
  );
}

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const CAL0: [number, number, number][] = [[0, 0, 1], [0, 3, 4], [1, 1, 2], [1, 4, 0], [2, 2, 5], [2, 5, 3], [3, 0, 3], [3, 3, 1], [4, 1, 4], [4, 6, 2]];
function CalMock({ m, s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  const wk = useMemo(weekDates, []);
  type St = { booked: Record<string, string>; toast: { id: number; t: string; name: string; day: number }; id: number };
  const seed = () => Object.fromEntries(CAL0.map(([d, h, n]) => [`${d}-${h}`, s.names[n]]));
  const [st, ref] = useSim<St>(() => ({ booked: seed(), toast: { id: 0, t: HOURS[3], name: s.names[1], day: 3 }, id: 0 }), (z, r) => {
    if (Object.keys(z.booked).length >= 17) z.booked = seed();
    const free: string[] = [];
    for (let d = 0; d < 5; d++) for (let h = 0; h < 8; h++) if (!(`${d}-${h}` in z.booked)) free.push(`${d}-${h}`);
    const k = r.pick(free); const name = r.pick(s.names);
    z.booked[k] = name; const [d, h] = k.split('-').map(Number);
    z.toast = { id: ++z.id, t: HOURS[h], name, day: d };
    return r.i(2200, 4000);
  }, 23);
  const cell = (d: number, h: number) => {
    const b = st.booked[`${d}-${h}`];
    return b ? <div key={`${d}-${h}-${b}`} className="fx-enter flex items-center px-1.5 truncate" style={{ height: 31, borderRadius: 6, fontSize: 9.5, fontWeight: 500, color: AB, background: d === wk.today ? LI : 'color-mix(in srgb, var(--c-lilac, #85a6e9) 78%, var(--c-abyss, #0e111b))' }}>{b}</div> : <div key={`${d}-${h}`} style={{ height: 31, borderRadius: 6, border: '1px dashed color-mix(in srgb, var(--c-hairline, #24375a) 70%, transparent)' }} />;
  };
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={x.calTitle} sub={f.dt({ month: 'long', year: 'numeric' }, wk.days[0])} />
      <Float z={1} className="flex-1 min-h-0">
        <div className="p-2.5 h-full" style={panel}>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: '30px repeat(5, 1fr)' }}>
            <span />
            {wk.days.map((d, i) => (
              <div key={i} className="text-center">
                <p style={{ fontSize: 9.5, color: AS }}>{m.days[i]}</p>
                <p className="mx-auto flex items-center justify-center" style={{ fontSize: 12, fontWeight: 600, width: 22, height: 22, borderRadius: 9999, marginTop: 1, color: i === wk.today ? AB : Q, background: i === wk.today ? LI : 'transparent' }}>{d.getDate()}</p>
              </div>
            ))}
            {HOURS.map((h, hi) => (
              <div key={h} className="contents">
                <span style={{ ...mono, fontSize: 9.5, color: AS, paddingTop: 9 }}>{h}</span>
                {[0, 1, 2, 3, 4].map((d) => cell(d, hi))}
              </div>
            ))}
          </div>
        </div>
      </Float>
      <Float z={2}>
        <div key={st.toast.id} className="fx-enter"><Toast>{m.confirmed} ✓ · {m.days[st.toast.day]} {st.toast.t} · {st.toast.name}</Toast></div>
      </Float>
    </div>
  );
}

type Lead = { id: number; name: string; v: number; d: number };
function CrmMock({ s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  const stages = FEATURES_UI[lang].mock.stages;
  const [st, ref] = useSim<{ cols: Lead[][]; id: number; won: number }>(() => ({ id: 9, won: 0, cols: [[{ id: 0, name: s.names[0], v: 4200, d: 0 }, { id: 1, name: s.names[1], v: 1800, d: 3 }, { id: 6, name: s.names[5], v: 2600, d: 4 }], [{ id: 2, name: s.names[2], v: 9500, d: 2 }, { id: 3, name: s.names[3], v: 3100, d: 1 }, { id: 7, name: s.names[0], v: 5400, d: 5 }], [{ id: 4, name: s.names[4], v: 12000, d: 5 }, { id: 5, name: s.names[5], v: 6400, d: 4 }, { id: 8, name: s.names[1], v: 7800, d: 0 }]] }), (z, r) => {
    if (r.f() < 0.32 && z.cols[1].length < 4) {
      z.cols[0].unshift({ id: ++z.id, name: r.pick(s.names), v: r.i(12, 140) * 100, d: r.i(0, 5) });
      if (z.cols[0].length > 4) z.cols[0].pop();
    } else {
      const c = z.cols[1].length >= 4 || (z.cols[1].length && r.f() < 0.5) ? 1 : z.cols[0].length ? 0 : 1;
      const card = z.cols[c].pop();
      if (card) { z.cols[c + 1].unshift(card); if (c === 1) z.won++; if (z.cols[2].length > 4) z.cols[2].pop(); }
    }
    return r.i(2800, 5200);
  }, 37);
  const sum = (a: Lead[]) => a.reduce((t, l) => t + l.v, 0);
  const base = [4, 2, 7];
  const wonTotal = 41300 + st.won * 5200;
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={x.crmTitle} sub={`${x.pipe} · ${f.cur(sum(st.cols[0]) + sum(st.cols[1]) + 21800)}`} />
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
        {stages.map((stg, c) => (
          <Float key={stg} z={1} className="min-h-0">
            <div className="p-1.5 flex flex-col gap-1.5 h-full" style={panel}>
              <div className="px-1 pt-0.5">
                <p className="flex items-center justify-between" style={lblMono({ fontSize: 9 })}><span className="flex items-center gap-1.5 truncate"><span style={dot(c === 2 ? Q : LI)} />{stg}</span><span style={{ ...pill(false), padding: '0 6px', fontSize: 9.5, letterSpacing: 0 }}>{st.cols[c].length + base[c] + (c === 2 ? st.won : 0)}</span></p>
                <p style={{ fontSize: 10.5, color: MI, marginTop: 3, fontWeight: 500 }}>{f.cur(c === 2 ? wonTotal : sum(st.cols[c]) + [11800, 7300, 0][c])}</p>
              </div>
              {st.cols[c].map((l) => (
                <div key={`${l.id}-${c}`} className="fx-enter p-2" style={sub}>
                  <p className="truncate" style={{ fontSize: 10.5, color: Q, fontWeight: 500 }}>{x.deals[l.d]}</p>
                  <p className="flex items-center gap-1 mt-1 min-w-0" style={{ fontSize: 9.5, color: AS }}><Av n={l.name} size={14} /><span className="truncate">{l.name}</span></p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: LI, marginTop: 5, letterSpacing: '-0.02em' }}>{f.cur(l.v)}</p>
                </div>
              ))}
            </div>
          </Float>
        ))}
      </div>
    </div>
  );
}

type Row = { id: number; name: string; time: string; svc: string; st: number };
function QueueMock({ m, s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  const [st, ref] = useSim<{ rows: Row[]; done: number; total: number; next: number; id: number }>(() => ({ id: 5, done: 9, total: 15, next: 11 * 60 + 30, rows: [{ id: 9, name: s.names[5], time: '09:00', svc: s.svc[2], st: 2 }, { id: 0, name: s.names[0], time: '09:30', svc: s.svc[0], st: 2 }, { id: 1, name: s.names[1], time: '10:00', svc: s.svc[1], st: 2 }, { id: 2, name: s.names[2], time: '10:30', svc: s.svc[2], st: 1 }, { id: 3, name: s.names[3], time: '11:00', svc: s.svc[3], st: 0 }, { id: 4, name: s.names[4], time: '11:30', svc: s.svc[1], st: 0 }].map((q, i) => ({ ...q, id: i })) }), (z, r) => {
    const cur = z.rows.find((q) => q.st === 1), wait = z.rows.find((q) => q.st === 0);
    const waiting = z.rows.filter((q) => q.st === 0).length;
    if (waiting < 2 || (!cur && !wait)) {
      z.next += r.pick([30, 30, 45]); z.total++;
      z.rows.push({ id: ++z.id, name: r.pick(s.names), time: hhmm(z.next + 30), svc: r.pick(s.svc), st: 0 });
    } else if (cur) { cur.st = 2; z.done++; } else if (wait) wait.st = 1;
    while (z.rows.length > 6) z.rows.shift();
    return r.i(2400, 4200);
  }, 41);
  const pct = Math.round((st.done / st.total) * 100);
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.clDr} title={x.clTitle} sub={`${x.clDr} · ${f.dt({ weekday: 'short', day: 'numeric', month: 'short' }, new Date())}`} />
      <Float z={2}>
        <div className="px-3 py-2.5" style={panel}>
          <div className="flex items-baseline justify-between"><p style={{ fontSize: 12, color: Q }}><Num v={st.done} f={f.n} /> / {st.total} <span style={{ color: AS }}>{x.clDone}</span></p><p style={{ ...mono, fontSize: 11, color: LI }}>{pct}%</p></div>
          <div className="mt-2" style={{ height: 5, borderRadius: 9999, background: 'color-mix(in srgb, var(--c-quartz, #ffffff) 14%, transparent)' }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, background: LI, transition: 'width .6s ease' }} /></div>
        </div>
      </Float>
      <Float z={1} className="flex-1 min-h-0">
        <div className="flex flex-col gap-1.5 h-full justify-end">
          {st.rows.map((q) => (
            <div key={q.id} className="fx-enter flex items-center gap-2.5 px-3 py-2" style={{ ...panel, opacity: q.st === 2 ? 0.62 : 1 }}>
              <span style={{ ...mono, fontSize: 11, color: q.st === 1 ? LI : AS, width: 34 }}>{q.time}</span>
              <Av n={q.name} size={26} />
              <div className="flex-1 min-w-0"><p className="truncate" style={{ fontSize: 12.5, color: Q, fontWeight: 500 }}>{q.name}</p><p className="truncate" style={{ fontSize: 10.5, color: AS }}>{q.svc}</p></div>
              <span key={q.st} className="fx-flash" style={pill(q.st === 1)}>{q.st === 2 ? '✓ ' : ''}{m.st[q.st]}</span>
            </div>
          ))}
        </div>
      </Float>
    </div>
  );
}

const AREAS = [40, 45, 55, 60, 75, 90, 120, 150];
function PriceMock({ m, s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  const [st, ref] = useSim(() => ({ area: 60, target: 60, e0: true, e1: false }), (z, r) => {
    if (z.area !== z.target) { z.area += Math.sign(z.target - z.area) * 5; return 70; }
    z.target = r.pick(AREAS.filter((a) => a !== z.area));
    if (r.f() < 0.6) { z.e0 = r.f() < 0.5; z.e1 = r.f() < 0.5; }
    return r.i(2200, 3600);
  }, 53);
  const pct = ((st.area - 30) / 120) * 100;
  const base = Math.round((st.area * RATE[lang]) / 5) * 5, ex = [Math.round(12 * RATE[lang]), Math.round(8 * RATE[lang])];
  const extra = (st.e0 ? ex[0] : 0) + (st.e1 ? ex[1] : 0), net = base + extra, vat = Math.round((net * x.vatPct) / 100);
  const line = (a: string, b: number, bold?: boolean) => <div className="flex justify-between" style={{ fontSize: 11.5, color: bold ? Q : MI }}><span>{a}</span><span style={{ color: Q }}>{f.cur(b)}</span></div>;
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={x.pcTitle} sub={x.pcSvc} />
      <Float z={1}>
        <div className="px-3.5 py-3" style={panel}>
          <div className="flex justify-between items-baseline"><span style={lblMono()}>{s.area}</span><span style={{ ...mono, fontSize: 13, color: Q }}>{st.area} m²</span></div>
          <div className="relative mt-3.5" style={{ height: 4, borderRadius: 4, background: 'color-mix(in srgb, var(--c-quartz, #ffffff) 16%, transparent)' }}>
            <span className="absolute left-0 top-0 h-full" style={{ width: `${pct}%`, borderRadius: 4, background: LI, transition: 'width .07s linear' }} />
            <span className="absolute" style={{ left: `${pct}%`, top: -6, width: 16, height: 16, borderRadius: 999, background: Q, marginLeft: -8, transition: 'left .07s linear' }} />
          </div>
          <div className="flex justify-between mt-2.5" style={{ ...mono, fontSize: 9, color: AS }}>{[30, 60, 90, 120, 150].map((n) => <span key={n}>{n}</span>)}</div>
        </div>
      </Float>
      <div className="flex flex-col gap-1.5">
        {x.pcExtras.map((l, i) => {
          const on = i === 0 ? st.e0 : st.e1;
          return (
            <div key={l} className="flex items-center gap-2.5 px-3 py-2" style={sub}>
              <span className="flex items-center justify-center" style={{ width: 16, height: 16, borderRadius: 5, background: on ? LI : 'transparent', border: `1px solid ${on ? LI : AS}`, transition: 'background .25s' }}>{on && <Ico d="M5 12l5 5 9-10" size={11} sw={3} c={AB} />}</span>
              <span className="flex-1" style={{ fontSize: 12, color: MI }}>{l}</span>
              <span style={{ fontSize: 11.5, color: AS }}>+{f.cur(ex[i])}</span>
            </div>
          );
        })}
      </div>
      <Float z={2}>
        <div className="px-3.5 py-3 flex flex-col gap-1.5" style={panel}>
          {line(x.pcBase, base)}{line(x.pcExtra, extra)}{line(`${x.pcVat} ${x.vatPct}%`, vat)}
          <div className="flex items-end justify-between mt-1.5" style={{ borderTop: '1px solid var(--c-edge, #172540)', paddingTop: 8 }}>
            <span style={lblMono()}>{m.est} · {x.pcTot}</span>
            <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: LI }}><Num v={net + vat} f={f.cur} /></span>
          </div>
        </div>
      </Float>
      <div className="text-center py-2.5 mt-auto" style={{ ...pill(true), fontSize: 13, fontWeight: 600 }}>{m.book}</div>
    </div>
  );
}

function PropMock({ m, s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  const w = x.site;
  type St = { k: number; ph: number; n: number; vis: number; enq: number; last: { name: string; at: number } };
  const [st, ref] = useSim<St>(() => ({ k: 0, ph: 0, n: 0, vis: 1284, enq: 37, last: { name: s.names[2], at: Date.now() - 22000 } }), (z, r) => {
    const txt = [s.names[z.k % 6], x.phones[z.k % 6], s.voice[z.k % s.voice.length]];
    if (z.ph < 3) { z.n++; if (z.n >= txt[z.ph].length) { z.ph++; z.n = 0; return 320; } return 42 + r.f() * 36; }
    if (z.ph === 3) { z.ph = 4; z.enq++; z.last = { name: s.names[z.k % 6], at: Date.now() }; return 3000; }
    z.k++; z.ph = 0; z.n = 0; z.vis += r.i(2, 9); return 700;
  }, 67);
  const txt = [s.names[st.k % 6], x.phones[st.k % 6], s.voice[st.k % s.voice.length]];
  const val = (i: number) => (st.ph > i ? txt[i] : st.ph === i ? txt[i].slice(0, st.n) : '');
  const sent = st.ph >= 4;
  const field = (i: number, l: string) => (
    <div key={l}>
      <p style={lblMono({ fontSize: 9 })}>{l}</p>
      <p className="truncate mt-1 px-2.5 flex items-center" style={{ height: 28, fontSize: 11.5, color: Q, borderRadius: 8, background: 'color-mix(in srgb, var(--c-abyss, #0e111b) 55%, transparent)', border: `1px solid ${st.ph === i ? 'var(--c-lilac, #85a6e9)' : 'var(--c-edge, #172540)'}` }}>{val(i)}{st.ph === i && <span aria-hidden="true" className="fx fx-blink inline-block ml-0.5" style={{ width: 1.5, height: 13, background: Q }} />}</p>
    </div>
  );
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={w.url} sub={<span className="inline-flex items-center gap-1.5"><span className="fx fx-pulse" style={dot()} />{f.n(st.vis)} {w.visits}</span>} />
      <Float z={1}>
        <div className="p-3 flex flex-col gap-3" style={panel}>
          <div className="flex items-center justify-between"><span className="flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 600, color: Q }}><span style={{ ...dot(), width: 9, height: 9 }} />{x.brand}</span><span className="flex gap-2.5" style={{ fontSize: 10, color: AS }}>{w.nav.map((n) => <span key={n}>{n}</span>)}</span></div>
          <div className="flex items-end justify-between gap-2"><div><p style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: Q, lineHeight: 1.1 }}>{w.h1}</p><p style={{ fontSize: 10.5, color: AS, marginTop: 4 }}>{w.sub}</p></div><span style={{ ...pill(true), padding: '5px 12px', fontSize: 11 }}>{w.cta}</span></div>
          <div className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--c-edge, #172540)', paddingTop: 10 }}>
            {field(0, w.fName)}{field(1, w.fPhone)}{field(2, w.fMsg)}
            <div className="text-center py-2 fx-flash" key={sent ? 1 : 0} style={{ ...pill(sent), fontSize: 11.5, fontWeight: 600 }}>{sent ? `✓ ${w.sent}` : w.send}</div>
          </div>
        </div>
      </Float>
      <div className="grid grid-cols-3 gap-2">
        {[[s.visitors, f.n(st.vis)], [m.k1, f.n(st.enq)], [m.k3, m.kv3]].map(([l, v]) => <div key={l} className="px-2.5 py-2" style={sub}><p className="truncate" style={lblMono({ fontSize: 9, letterSpacing: '0.04em' })}>{l}</p><p style={{ fontSize: 15, fontWeight: 600, color: Q, marginTop: 2, whiteSpace: 'nowrap' }}>{v}</p></div>)}
      </div>
      <Float z={2}>
        <div key={st.last.at} className="fx-enter flex items-center gap-2.5 px-3 py-2.5" style={panel}>
          <Av n={st.last.name} size={26} /><div className="flex-1 min-w-0"><p style={{ fontSize: 11.5, color: Q, fontWeight: 500 }}>{m.n1} · <span style={{ color: LI }}>{f.n(st.enq)}</span></p><p className="truncate" style={{ fontSize: 10.5, color: AS }}>{st.last.name}</p></div>
          <span style={{ fontSize: 10.5, color: AS }}>{ageText(st.last.at, s.now, s.ago)}</span>
        </div>
      </Float>
    </div>
  );
}

type Msg = { id: number; me?: boolean; text?: string; t: string };
function ChatMock({ m, s, x }: P) {
  const [st, ref] = useSim<{ msgs: Msg[]; k: number; stage: number; id: number; min: number; notif: { name: string; at: number } }>(() => ({ k: 0, stage: 4, id: 2, min: 14 * 60 + 8, msgs: [{ id: 0, me: true, text: s.chat[0][0], t: '14:07' }, { id: 1, text: s.chat[0][1], t: '14:07' }], notif: { name: s.names[0], at: Date.now() - 9000 } }), (z, r) => {
    const push = (g: Msg) => { z.msgs.push(g); if (z.msgs.length > 3) z.msgs.shift(); };
    const [q, a] = s.chat[z.k];
    switch (z.stage) {
      case 0: z.min += r.i(0, 1); push({ id: ++z.id, me: true, text: q, t: hhmm(z.min) }); z.stage = 1; return 1100;
      case 1: push({ id: ++z.id, t: '' }); z.stage = 2; return 500 + a.length * 32;
      case 2: z.msgs[z.msgs.length - 1] = { id: ++z.id, text: a, t: hhmm(z.min) }; z.stage = 3; return 900;
      case 3: z.notif = { name: r.pick(s.names), at: Date.now() }; z.stage = 4; return r.i(3200, 5000);
      default: z.k = (z.k + 1) % s.chat.length; z.stage = 0; z.min += 2; return 300;
    }
  }, 79);
  const typing = st.msgs[st.msgs.length - 1]?.text == null;
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={x.brand} sub={<span className="inline-flex items-center gap-1.5"><span style={dot()} />{typing ? x.typing : x.online}</span>} />
      <Float z={1} className="flex-1 min-h-0">
        <div className="h-full flex flex-col gap-2 justify-end overflow-hidden">
          <p className="mx-auto" style={{ ...pill(false), fontSize: 9.5, marginBottom: 'auto' }}>{m.queue}</p>
          {st.msgs.map((g) => (
            <div key={g.id} className={`fx-enter max-w-[84%] px-3 py-2 ${g.me ? 'self-end' : 'self-start'}`}
              style={{ fontSize: 12.5, lineHeight: 1.35, color: g.me ? AB : MI, background: g.me ? LI : 'color-mix(in srgb, var(--c-abyss, #0e111b) 60%, transparent)', border: '1px solid var(--c-edge, #172540)', borderRadius: g.me ? '14px 14px 4px 14px' : '14px 14px 14px 4px' }}>
              {g.text ?? <span className="fx-dots inline-flex items-center gap-1 py-1">{[0, 1, 2].map((i) => <i key={i} style={{ ...dot(MI), ['--dd' as string]: `${i * 0.18}s` }} />)}</span>}
              {g.text != null && <span className="flex items-center justify-end gap-1" style={{ fontSize: 9.5, marginTop: 2, color: g.me ? 'color-mix(in srgb, var(--c-abyss, #0e111b) 85%, transparent)' : AS }}>{g.t}{g.me && <Ico d="M2 13l4 4L14 7M9 14l3 3 8-10" size={11} sw={2.2} c={AB} />}</span>}
            </div>
          ))}
        </div>
      </Float>
      <Float z={2}>
        <div key={st.notif.at} className="fx-enter flex items-center gap-2.5 px-3 py-2.5" style={{ ...panel, background: 'color-mix(in srgb, var(--c-quartz, #ffffff) 10%, var(--c-deep-sea, #0d172b))' }}>
          <span className="flex-none flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: 'var(--c-signal, #2862d7)' }}><Ico d="M21 4L3 11l6 2 2 6 3-4 5 4z" size={14} sw={1.5} /></span>
          <div className="flex-1 min-w-0"><p className="flex items-center justify-between" style={{ fontSize: 11.5, color: Q, fontWeight: 600 }}>Telegram<span style={{ fontSize: 10, fontWeight: 400, color: AS }}>{ageText(st.notif.at, s.now, s.ago)}</span></p><p className="truncate" style={{ fontSize: 11, color: MI }}>{m.nb} · {st.notif.name}</p></div>
        </div>
      </Float>
      <div className="flex items-center gap-2 flex-none px-3" style={{ ...sub, height: 36, borderRadius: 9999 }}>
        <span className="flex-1 truncate" style={{ fontSize: 11.5, color: AS }}>{m.ask}</span>
        <span className="flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: LI }}><Ico d="M5 12h14M13 6l6 6-6 6" size={13} sw={2} c={AB} /></span>
      </div>
    </div>
  );
}

function DashMock({ m, s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  type St = { vis: number; bk: number; rev: number; pts: number[]; seq: number; last: { name: string; svc: string; at: number } };
  const [st, ref] = useSim<St>(() => ({ vis: 1284, bk: 37, rev: 48920, seq: 0, pts: [30, 33, 31, 38, 36, 41, 45, 43, 49, 52, 50, 56, 58, 61, 60, 66], last: { name: s.names[1], svc: s.svc[0], at: Date.now() - 16000 } }), (z, r) => {
    z.vis += r.i(1, 4); z.seq++;
    z.pts.push(Math.min(76, Math.max(20, z.pts[z.pts.length - 1] + r.i(-3, 6)))); if (z.pts.length > 16) z.pts.shift();
    if (r.f() < 0.3) { z.bk++; z.rev += r.i(8, 30) * RATE[lang] * 4; z.last = { name: r.pick(s.names), svc: r.pick(s.svc), at: Date.now() }; }
    return r.i(1600, 3600);
  }, 97);
  const xy = st.pts.map((v, i) => `${(i / (st.pts.length - 1)) * 300} ${112 - (v / 80) * 104}`);
  const line = 'M' + xy.join(' L');
  const today = new Date();
  const xl = [29, 20, 10, 0].map((d) => f.dt({ day: 'numeric', month: 'short' }, new Date(today.getTime() - d * 864e5)));
  const kpis: [string, ReactNode, string][] = [[s.visitors, <Num key="a" v={st.vis} f={f.n} />, '+12%'], [m.k2, <Num key="b" v={st.bk} f={f.n} />, '+8%'], [s.rev, <Num key="c" v={st.rev} f={f.cur} />, '+15%']];
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={x.dashTitle} sub={x.brand} />
      <div className="flex gap-1.5 flex-none">{x.ranges.map((r, i) => <span key={r} style={pill(i === 1)}>{r}</span>)}</div>
      <Float z={2}>
        <div className="grid grid-cols-3 gap-2">
          {kpis.map(([l, v, d], i) => (
            <div key={i} className="px-2.5 py-2" style={panel}>
              <p className="truncate" style={lblMono({ fontSize: 9, letterSpacing: '0.04em' })}>{l}</p>
              <p style={{ fontSize: i === 2 ? 14 : 19, fontWeight: 600, letterSpacing: '-0.04em', color: Q, marginTop: 3, whiteSpace: 'nowrap' }}>{v}</p>
              <p style={{ fontSize: 10, color: LI, marginTop: 2 }}>▲ {d}</p>
            </div>
          ))}
        </div>
      </Float>
      <div className="flex-1 px-3 pt-2.5 pb-2 flex flex-col min-h-0" style={panel}>
        <p className="flex items-center justify-between" style={{ fontSize: 10.5, color: MI }}><span className="flex items-center gap-1.5"><span className="fx fx-pulse" style={dot()} />{x.metric}</span><span style={{ color: AS }}>{m.ch}</span></p>
        <div className="flex-1 flex gap-2 mt-2 min-h-0">
          <div className="flex flex-col justify-between flex-none" style={{ ...mono, fontSize: 9, color: AS, paddingBottom: 2 }}>{[80, 40, 0].map((n) => <span key={n}>{n}</span>)}</div>
          <div className="flex-1 relative overflow-hidden">
            {[0, 1, 2].map((i) => <span key={i} className="absolute left-0 right-0" style={{ top: `${i * 50}%`, borderTop: '1px dashed color-mix(in srgb, var(--c-hairline, #24375a) 80%, transparent)' }} />)}
            <svg key={st.seq} viewBox="0 0 300 120" preserveAspectRatio="none" className="fx-shift w-full h-full relative" style={{ ['--sh' as string]: `${100 / 15}%` }}>
              <defs><linearGradient id="fs-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: LI, stopOpacity: 0.4 }} /><stop offset="1" style={{ stopColor: LI, stopOpacity: 0 }} /></linearGradient></defs>
              <path d={`${line} L300 120 L0 120Z`} fill="url(#fs-area)" />
              <path d={line} fill="none" stroke={LI} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
        <div className="flex justify-between mt-1" style={{ ...mono, fontSize: 9, color: AS, paddingLeft: 24 }}>{xl.map((l, i) => <span key={i}>{l}</span>)}</div>
      </div>
      <Float z={1}>
        <div key={st.last.at} className="fx-enter flex items-center gap-2.5 px-3 py-2" style={panel}>
          <Av n={st.last.name} size={24} /><p className="flex-1 truncate" style={{ fontSize: 11.5, color: MI }}>{st.last.name} · {st.last.svc}</p>
          <span style={{ fontSize: 10.5, color: AS }}>{ageText(st.last.at, s.now, s.ago)}</span>
        </div>
      </Float>
    </div>
  );
}

const STAR = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z';
const Stars = ({ n, size = 12 }: { n: number; size?: number }) => (
  <span className="inline-flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} fill={i < n ? LI : 'none'} stroke={LI} strokeWidth="1.5" strokeLinejoin="round" /></svg>)}</span>
);
const amt = (lang: Lang, r: { i: (a: number, b: number) => number }) => r.i(5, 30) * RATE[lang] * 4;

function ReviewsMock({ s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  type Rv = { id: number; name: string; text: string; stars: number; at: number };
  const [st, ref] = useSim<{ c: number[]; id: number; list: Rv[] }>(() => ({ c: [0, 1, 4, 15, 108], id: 2, list: [{ id: 2, name: s.names[2], text: s.rvTexts[0], stars: 5, at: Date.now() - 20000 }, { id: 1, name: s.names[4], text: s.rvTexts[1], stars: 5, at: Date.now() - 52000 }, { id: 0, name: s.names[0], text: s.rvTexts[2], stars: 4, at: Date.now() - 96000 }] }), (z, r) => {
    const stars = r.f() < 0.72 ? 5 : 4;
    z.c[stars - 1]++;
    const used = z.list.slice(0, 2); z.list.unshift({ id: ++z.id, name: r.pick(s.names.filter((n) => !used.some((u) => u.name === n))), text: r.pick(s.rvTexts.filter((t) => !used.some((u) => u.text === t))), stars, at: Date.now() });
    if (z.list.length > 3) z.list.pop();
    return r.i(3200, 6000);
  }, 101);
  const n = st.c.reduce((a, b) => a + b, 0), avg = st.c.reduce((a, b, i) => a + b * (i + 1), 0) / n;
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av="Google" title={x.rvTitle} sub={x.brand} />
      <Float z={2}>
        <div className="flex items-center gap-4 px-4 py-3" style={panel}>
          <div className="text-center flex-none"><p style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.04em', color: Q, lineHeight: 1 }}><Num v={Math.round(avg * 10)} f={(v) => f.d1(v / 10)} /></p><div className="mt-1.5"><Stars n={5} size={11} /></div><p style={{ fontSize: 10, color: AS, marginTop: 3 }}>{s.rv} · <Num v={n} f={f.n} /></p></div>
          <div className="flex-1 flex flex-col gap-1">{[4, 3, 2, 1, 0].map((i) => <div key={i} className="flex items-center gap-1.5"><span style={{ ...mono, fontSize: 9, color: AS, width: 8 }}>{i + 1}</span><div className="flex-1" style={{ height: 4, borderRadius: 9999, background: 'color-mix(in srgb, var(--c-quartz, #ffffff) 12%, transparent)' }}><div style={{ width: `${(st.c[i] / n) * 100}%`, height: '100%', borderRadius: 9999, background: LI, transition: 'width .6s ease' }} /></div></div>)}</div>
        </div>
      </Float>
      <Float z={1} className="flex-1 min-h-0">
        <div className="flex flex-col gap-2">
          {st.list.map((g, gi) => (
            <div key={g.id} className="fx-enter px-3 py-2.5" style={panel}>
              <div className="flex items-center gap-2"><Av n={g.name} size={26} /><div className="flex-1 min-w-0"><p style={{ fontSize: 12, color: Q, fontWeight: 500 }}>{g.name}</p><p style={{ fontSize: 10, color: AS }}>{ageText(g.at, s.now, s.ago)}</p></div><Stars n={g.stars} /></div>
              <p style={{ fontSize: 11.5, color: MI, marginTop: 6, lineHeight: 1.35 }}>{g.text}</p>
              {gi === 0 && <p className="flex items-center gap-1.5" style={{ fontSize: 10.5, color: LI, marginTop: 6 }}><Ico d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 6 6v3" size={11} sw={1.8} c={LI} />{x.rvReply}</p>}
            </div>
          ))}
        </div>
      </Float>
      <p className="flex items-center gap-2 px-3 py-2 flex-none" style={{ ...sub, fontSize: 11, color: MI, borderRadius: 9999 }}><span className="fx fx-pulse" style={dot()} />{s.rvReq}</p>
    </div>
  );
}

function QuoteMock({ s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  type Ln = { n: string; q: number; p: number };
  const [st, ref] = useSim<{ no: number; client: string; lines: Ln[]; status: number }>(() => ({ no: 1042, client: s.names[3], status: 2, lines: s.qLines.map((n, i) => ({ n, q: 1, p: [45, 90, 60, 35][i] * RATE[lang] * 2 })) }), (z, r) => {
    if (z.status === 2 && z.lines.length === 4) { z.no++; z.client = r.pick(s.names); z.lines = []; z.status = 0; return 900; }
    if (z.lines.length < 4) { const q = r.pick([1, 1, 2]); z.lines.push({ n: s.qLines[z.lines.length], q, p: amt(lang, r) * q }); return r.i(900, 1700); }
    if (z.status === 0) { z.status = 1; return r.i(1800, 2800); }
    z.status = 2; return r.i(4500, 6500);
  }, 113);
  const net = st.lines.reduce((a, l) => a + l.p, 0), vat = Math.round((net * x.vatPct) / 100);
  const row = (a: string, b: number) => <div className="flex justify-between" style={{ fontSize: 11.5, color: MI }}><span>{a}</span><span style={{ color: Q }}>{f.cur(b)}</span></div>;
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={`${s.qu} #${st.no}`} sub={x.valid} />
      <Float z={1} className="flex-1 min-h-0">
        <div className="p-3.5 h-full flex flex-col" style={panel}>
          <div className="flex items-start justify-between"><div><p style={lblMono({ fontSize: 9 })}>{x.client}</p><p style={{ fontSize: 13, color: Q, fontWeight: 500, marginTop: 2 }}>{st.client}</p></div><span key={st.status} className="fx-flash" style={pill(st.status === 2)}>{st.status === 2 ? `✓ ${s.qOk}` : st.status === 1 ? s.qSent : '…'}</span></div>
          <div className="grid mt-3.5 pb-1.5" style={{ gridTemplateColumns: '1fr 34px 76px', ...lblMono({ fontSize: 9 }), borderBottom: '1px solid var(--c-hairline, #24375a)' }}><span>{x.item}</span><span className="text-center">{x.qty}</span><span className="text-right">{s.qTotal}</span></div>
          <div className="flex flex-col" style={{ minHeight: 124 }}>
            {st.lines.map((l) => (
              <div key={l.n} className="fx-enter grid items-center" style={{ gridTemplateColumns: '1fr 34px 76px', fontSize: 12, color: MI, borderBottom: '1px solid var(--c-edge, #172540)', height: 31 }}><span>{l.n}</span><span className="text-center" style={{ ...mono, color: AS }}>{l.q}</span><span className="text-right" style={{ color: Q }}>{f.cur(l.p)}</span></div>
            ))}
          </div>
          <div className="flex flex-col gap-1 mt-auto pt-2">
            {row(x.sub, net)}{row(`${x.vat} ${x.vatPct}%`, vat)}
            <div className="flex items-end justify-between mt-1" style={{ borderTop: '1px solid var(--c-hairline, #24375a)', paddingTop: 8 }}><span style={lblMono()}>{s.qTotal}</span><span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: LI }}><Num v={net + vat} f={f.cur} /></span></div>
          </div>
        </div>
      </Float>
    </div>
  );
}

function LoyaltyMock({ s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  const [st, ref] = useSim<{ filled: number; members: number; last: { name: string; at: number }; won: boolean }>(() => ({ filled: 6, members: 214, won: false, last: { name: s.names[3], at: Date.now() - 14000 } }), (z, r) => {
    if (z.won) { z.won = false; z.filled = 1; z.last = { name: r.pick(s.names), at: Date.now() }; return r.i(3000, 4800); }
    z.filled++; z.last = { name: r.pick(s.names), at: Date.now() };
    if (r.f() < 0.35) z.members += r.i(1, 2);
    if (z.filled >= 10) { z.won = true; return 3200; }
    return r.i(2800, 4800);
  }, 127);
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={x.brand} sub={s.ly} />
      <Float z={1}>
        <div className="p-4" style={{ ...panel, background: 'linear-gradient(150deg, color-mix(in srgb, var(--c-signal, #2862d7) 38%, var(--c-deep-sea, #0d172b)), var(--c-abyss, #0e111b))' }}>
          <div className="flex items-start justify-between"><div><p style={lblMono({ fontSize: 9 })}>{x.lyNo}</p><p style={{ ...mono, fontSize: 12, color: Q, marginTop: 2 }}>№ 0214</p></div><p style={{ ...mono, fontSize: 18, color: Q, fontWeight: 600 }}>{Math.min(st.filled, 10)}<span style={{ fontSize: 11, color: AS }}> / 10</span></p></div>
          <div className="grid grid-cols-5 gap-y-3 mt-4">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={`${i}-${i < st.filled ? 1 : 0}`} className="flex items-center justify-center rounded-full mx-auto" style={{ width: 44, height: 44, border: '1px solid var(--c-hairline, #24375a)', background: i < st.filled ? LI : 'color-mix(in srgb, var(--c-quartz, #ffffff) 6%, transparent)' }}>
                {i < st.filled ? <span className="fx-flash flex"><Ico d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2" size={18} sw={1.8} c={AB} /></span> : <span style={{ ...mono, fontSize: 10, color: AS }}>{i + 1}</span>}
              </span>
            ))}
          </div>
          <div className="mt-4" style={{ height: 4, borderRadius: 9999, background: 'color-mix(in srgb, var(--c-quartz, #ffffff) 14%, transparent)' }}><div style={{ width: `${Math.min(st.filled, 10) * 10}%`, height: '100%', borderRadius: 9999, background: LI, transition: 'width .5s ease' }} /></div>
          <p style={{ fontSize: 11.5, marginTop: 8, color: st.won ? Q : MI, fontWeight: st.won ? 600 : 400 }}>{st.won ? `★ ${s.lyReward}` : x.lyLeft.replace('{n}', String(Math.max(0, 10 - st.filled)))}</p>
        </div>
      </Float>
      <p className="px-1" style={{ fontSize: 11, color: AS }}>{s.lyReward}</p>
      <Float z={2} className="mt-auto">
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2.5" style={panel}><p style={lblMono({ fontSize: 9 })}>{s.lyMembers}</p><p style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', color: Q }}><Num v={st.members} f={f.n} /></p></div>
          <div key={st.last.at} className="fx-enter px-3 py-2.5" style={panel}><p style={lblMono({ fontSize: 9 })}>{s.lyNew}</p><p className="flex items-center gap-1.5" style={{ fontSize: 12, color: Q, marginTop: 5 }}><Av n={st.last.name} size={20} /><span className="truncate">{st.last.name}</span></p><p style={{ fontSize: 10, color: AS, marginTop: 2 }}>{ageText(st.last.at, s.now, s.ago)}</p></div>
        </div>
      </Float>
    </div>
  );
}

const MENU_P = [4, 3, 3.5, 9, 5.5];
function QrMock({ s, lang, x }: P) {
  const f = useMemo(() => makeFmt(lang), [lang]);
  const price = (i: number) => Math.round(MENU_P[i] * RATE[lang]);
  type Od = { id: number; table: number; items: [number, number][]; at: number; st: number };
  const cells = useMemo(() => { const r = makeRng(5); return Array.from({ length: 81 }, (_, i) => { const xx = i % 9, y = Math.floor(i / 9); const fin = (xx < 3 && y < 3) || (xx > 5 && y < 3) || (xx < 3 && y > 5); return fin ? (xx % 2 === 0 || y % 2 === 0) && !(xx === 1 && y === 1) : r.f() > 0.5; }); }, []);
  const [st, ref] = useSim<{ count: number; rev: number; id: number; list: Od[] }>(() => ({ count: 41, rev: 41 * 9 * RATE[lang], id: 2, list: [{ id: 0, table: 2, items: [[3, 1], [2, 1]], at: Date.now() - 80000, st: 2 }, { id: 1, table: 7, items: [[0, 2], [1, 1]], at: Date.now() - 44000, st: 1 }, { id: 2, table: 4, items: [[1, 2]], at: Date.now() - 18000, st: 0 }] }), (z, r) => {
    const open = z.list.find((o) => o.st < 2);
    if (open && r.f() < 0.45) { open.st++; return r.i(1800, 3000); }
    const a = r.i(0, 4); const items: [number, number][] = [[a, r.i(1, 2)], [(a + r.i(1, 4)) % 5, 1]];
    z.count++; z.rev += items.reduce((a, [i, q]) => a + MENU_P[i] * RATE[lang] * q, 0);
    z.list.push({ id: ++z.id, table: r.pick([1, 2, 3, 5, 6, 8, 9, 10, 11, 12].filter((t) => !z.list.some((o) => o.table === t))), items, at: Date.now(), st: 0 });
    if (z.list.length > 3) z.list.shift();
    return r.i(2500, 4500);
  }, 139);
  const openN = st.list.filter((o) => o.st < 2).length;
  return (
    <div ref={ref} className="fx-root w-full h-full flex flex-col gap-2.5">
      <AppBar av={x.brand} title={x.qrTitle} sub={`${x.qrOpen} · ${openN}`} />
      <Float z={1}>
        <div className="flex items-center gap-3.5 p-3" style={panel}>
          <div className="relative flex-none overflow-hidden" style={{ width: 64, height: 64, padding: 4, borderRadius: 8, background: Q }}>
            <div className="grid grid-cols-9 w-full h-full">{cells.map((on, i) => <span key={i} style={{ background: on ? AB : 'transparent' }} />)}</div>
            <span aria-hidden="true" className="fx fx-scan absolute left-0 right-0" style={{ height: 2, background: 'var(--c-signal, #2862d7)' }} />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div><p style={lblMono({ fontSize: 9 })}>{s.qrOrders}</p><p style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: Q }}><Num v={st.count} f={f.n} /></p></div>
            <div><p style={lblMono({ fontSize: 9 })}>{s.rev}</p><p style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.03em', color: LI, marginTop: 4 }}><Num v={Math.round(st.rev)} f={f.cur} /></p></div>
          </div>
        </div>
      </Float>
      <Float z={2} className="flex-1 min-h-0">
        <div className="flex flex-col gap-2 h-full justify-end">
          {st.list.map((o) => (
            <div key={o.id} className="fx-enter px-3 py-2.5" style={{ ...panel, opacity: o.st === 2 ? 0.65 : 1 }}>
              <div className="flex items-center justify-between"><p style={{ fontSize: 12, color: Q, fontWeight: 600 }}>{s.qrTable} {o.table} <span style={{ ...mono, fontWeight: 400, fontSize: 10, color: AS }}>#{1040 + o.id}</span></p><span style={{ fontSize: 10.5, color: AS }}>{ageText(o.at, s.now, s.ago)}</span></div>
              {o.items.map(([i, q], k) => <div key={k} className="flex justify-between" style={{ fontSize: 11, color: MI, marginTop: 3 }}><span>{q}× {s.menu[i]}</span><span>{f.cur(price(i) * q)}</span></div>)}
              <div className="flex items-center justify-between mt-2"><span key={o.st} className="fx-flash" style={pill(o.st === 1)}>{x.oSt[o.st]}</span><span style={{ fontSize: 12, fontWeight: 600, color: LI }}>{f.cur(o.items.reduce((a, [i, q]) => a + price(i) * q, 0))}</span></div>
            </div>
          ))}
        </div>
      </Float>
    </div>
  );
}

const MOCK_BY: ((p: P) => ReactNode)[] = [VoiceMock, CalMock, CrmMock, QueueMock, PriceMock, PropMock, ChatMock, DashMock, ReviewsMock, QuoteMock, LoyaltyMock, QrMock];

// Scroll distance per card, in viewport heights (owner, 2026-11-23): the card run moves clearly slower than the rest of
// the page so the eye can follow each card; was 0.468. Before and after the pinned run the page scrolls at normal speed.
const CARD_PACE = 0.78;

export default function FeaturesScroll({ lang }: { lang: Lang }) {
  const ui = FEATURES_UI[lang];
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const tilts = useRef<(HTMLDivElement | null)[]>([]);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const [pin, setPin] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: no-preference)').matches);

  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const on = () => setPin(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useLayoutEffect(() => {
    if (!pin || !root.current || !track.current) return;
    const ctx = gsap.context(() => {
      const vh = window.innerHeight;
      const dist = () => track.current!.scrollWidth - window.innerWidth;
      // Card centres are measured once per refresh (relative to the track at x = 0); per frame only the track's x is read.
      // The old version called getBoundingClientRect on every card on every scroll frame, which made the run stutter.
      let base: number[] = [];
      const measure = () => {
        const x0 = Number(gsap.getProperty(track.current!, 'x')) || 0;
        base = tilts.current.map((t) => { if (!t) return 0; const r = t.parentElement!.getBoundingClientRect(); return r.left + r.width / 2 - x0; });
      };
      const tilt = () => {
        const vw = window.innerWidth;
        const x = Number(gsap.getProperty(track.current!, 'x')) || 0;
        tilts.current.forEach((t, i) => {
          if (!t) return;
          const raw = Math.max(-1.4, Math.min(1.4, (base[i] + x - vw / 2) / (vw * 0.5)));
          const a = Math.min(1, Math.abs(raw));
          gsap.set(t, TOUCH ? { rotateZ: raw * 7, scale: 1 - a * 0.05, force3D: true } : { rotateZ: raw * 7, rotateY: raw * -3, rotateX: a * 3, scale: 1 - a * 0.05, force3D: true });
          t.style.setProperty('--tx', raw.toFixed(3));
          const act = Math.abs(raw) < 1.15 ? '1' : '0';
          if (t.dataset.act !== act) t.dataset.act = act;
          const cap = caps.current[i];
          if (cap) gsap.set(cap, { opacity: Math.max(0.3, Math.min(1, 1.25 - a * 1.1)) });
        });
      };
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: tilt,
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: () => { const l = (i: number) => tilts.current[i]!.parentElement!.parentElement as HTMLElement; return `+=${Math.round((dist() * CARD_PACE * vh) / (l(1).offsetLeft - l(0).offsetLeft))}`; }, pin: true, anticipatePin: 1, scrub: TOUCH ? 0.35 : SCRUB, invalidateOnRefresh: true, onRefresh: () => { measure(); tilt(); },
          // No snap (owner, 2026-11-23): snapping stopped and re-settled the scroll at each card, which felt like stuttering.
        },
      });
      tl.fromTo(track.current, { x: 0 }, { x: () => -dist() }, 0)
        .fromTo(rows.current[0], { x: 0 }, { x: -2600 }, 0)
        .fromTo(rows.current[1], { x: -2600 }, { x: 0 }, 0);
      measure();
      tilt();
      if (DEV) {
        (window as unknown as { __cwFeatures: unknown }).__cwFeatures = { goto: (i: number) => {
          const st = tl.scrollTrigger!, d = dist(), l = tilts.current[i]!.parentElement!.parentElement as HTMLElement;
          const top = st.start + ((l.offsetLeft + l.offsetWidth / 2 - window.innerWidth / 2) / d) * (st.end - st.start);
          window.scrollTo({ top, behavior: 'instant' });
        } };
      }
    }, root);
    return () => ctx.revert();
  }, [pin, lang]);

  const onMove = (e: React.PointerEvent) => {
    const el = (e.target as HTMLElement).closest('.fx-card') as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', String(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2))));
    el.style.setProperty('--py', String(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))));
  };
  const onLeave = () => root.current?.querySelectorAll<HTMLElement>('.fx-card').forEach((el) => { el.style.setProperty('--px', '0'); el.style.setProperty('--py', '0'); });

  return (
    <section ref={root} id="features" className="relative overflow-hidden" onPointerMove={pin ? onMove : undefined} onPointerLeave={pin ? onLeave : undefined} style={{ background: 'var(--c-void, #0b0c0e)' }}>
      <style>{FX_CSS}</style>
      <div className={pin ? 'relative h-[100svh]' : 'relative py-16 md:py-24'}>
        {pin ? (
          <>
            <h2 className="sr-only">{ui.heading}</h2>
            <div aria-hidden="true" className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
              <Row text={ui.rowA} refEl={(el) => { rows.current[0] = el; }} />
              <Row text={ui.rowB} refEl={(el) => { rows.current[1] = el; }} />
            </div>
          </>
        ) : (
          <h2 className="mx-auto px-5 md:px-9 mb-10" style={{ maxWidth: 1440, fontFamily: 'var(--font-display, Figtree, sans-serif)', fontSize: 'clamp(32px, 7vw, 52px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--c-quartz, #ffffff)', textTransform: 'uppercase' }}>{ui.heading}</h2>
        )}

        <div ref={track}
          className={pin ? 'absolute inset-y-0 left-0 flex items-start gap-[clamp(180px,22vw,320px)]' : 'flex gap-5 overflow-x-auto snap-x snap-mandatory px-5 md:px-9 pb-4'}
          style={pin ? { paddingTop: 'clamp(56px, 15svh, 160px)', paddingLeft: '110vw', paddingRight: 'calc(50vw - min(213px, 22.9svh, 41vw))', width: 'max-content', willChange: 'transform' } : { scrollbarWidth: 'none' }}>
          {ORDER.map((o, i) => {
            const it = ui.items[o];
            const slug = SHOTS[o];
            const to = slug ? demoPath(lang, slug) + (slug === 'demokafe' ? '?view=qr' : '') : pagePath(lang, 'services');
            const M = MOCK_BY[o];
            return (
              <Link key={i} to={to} aria-label={it.title} className="group flex-none snap-center flex flex-col items-center cursor-pointer rounded-xl outline-offset-8 focus-visible:outline-2 focus-visible:outline" style={{ width: pin ? undefined : 'min(82vw, 340px)', outlineColor: 'var(--c-lilac, #85a6e9)' }}>
                <div style={{ perspective: 1400 }} className={pin ? 'relative' : 'relative w-full'}>
                  <div aria-hidden="true" className="absolute pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100 group-focus-visible:opacity-100" style={{ inset: '-8% -12% -4%', filter: 'blur(48px)', background: 'radial-gradient(60% 60% at 50% 55%, color-mix(in srgb, var(--c-lilac, #85a6e9) 38%, transparent), transparent 70%)' }} />
                  <div ref={(el) => { tilts.current[i] = el; }} className="fx-card cw-keep-dark relative" style={{ height: pin ? 'min(520px, 56svh, calc(82vw * 560 / 460))' : 420, aspectRatio: '460 / 560', transformStyle: 'preserve-3d' }}>
                    <span className="absolute z-30 right-4 rounded-full pl-1.5 pr-3.5 py-1 flex items-center gap-2 transition-colors duration-300 group-hover:bg-[var(--c-lilac, #85a6e9)] group-hover:text-[var(--c-abyss, #0e111b)]" style={{ top: -15, transform: 'translateZ(60px)', fontSize: 12, fontWeight: 500, color: 'var(--c-quartz, #ffffff)', background: 'var(--c-abyss, #0e111b)', boxShadow: '0 6px 14px -8px color-mix(in srgb, var(--c-void, #0b0c0e) 70%, transparent)', border: '1px solid var(--c-hairline, #24375a)' }}>
                        <span className="flex items-center justify-center rounded-full" style={{ width: 18, height: 18, background: 'var(--c-lilac, #85a6e9)' }}><svg width="7" height="8" viewBox="0 0 7 8" aria-hidden="true"><path d="M1 0.8L6.2 4L1 7.2Z" style={{ fill: 'var(--c-abyss, #0e111b)' }} /></svg></span>{ui.demo}
                      </span>
                    <div className="fx-shell absolute inset-0 rounded-xl overflow-hidden transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:[transform:translateZ(40px)_scale(1.03)] group-focus-visible:scale-[1.03]"
                      style={{ background: 'linear-gradient(160deg, var(--c-cobalt, #12244f) 0%, var(--c-deep-sea, #0d172b) 55%, var(--c-abyss, #0e111b) 100%)', border: '1px solid var(--c-hairline, #24375a)' }}>
                      <div aria-hidden="true" className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 z-20" style={{ border: '2px solid var(--c-lilac, #85a6e9)', background: 'radial-gradient(90% 50% at 50% 0%, color-mix(in srgb, var(--c-lilac, #85a6e9) 22%, transparent), transparent 70%)' }} />
                      <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '45%', background: 'linear-gradient(180deg, color-mix(in srgb, var(--c-quartz, #ffffff) 12%, transparent), transparent)' }} />
                      
                      <FitBox>
                        <div className="absolute inset-0 pt-4 px-5 pb-5 flex transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:translate-x-1" style={{ perspective: 900 }}>
                          <M m={ui.mock} s={ui.sim} x={ui.x} lang={lang} />
                        </div>
                      </FitBox>
                    </div>
                  </div>
                </div>
                <div ref={(el) => { caps.current[i] = el; }} className="flex flex-col items-center" style={{ maxWidth: 'min(420px, 86vw)' }}>
                  <h3 className="mt-6 text-center" style={{ fontSize: 'clamp(22px, 2.1vw, 30px)', fontWeight: 500, color: 'var(--c-quartz, #ffffff)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{it.title}</h3>
                  <span aria-hidden="true" className="flex items-center gap-1.5 mt-3"><i style={{ width: 40, height: 1, background: 'var(--c-hairline, #24375a)' }} /><i style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--c-lilac, #85a6e9)' }} /><i style={{ width: 40, height: 1, background: 'var(--c-hairline, #24375a)' }} /></span>
                  <p className="mt-3 text-center" style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--c-ash, #abaebb)' }}>{it.text}</p>
                  <span className="mt-3 inline-flex items-center transition-transform duration-300 group-hover:translate-x-1" style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-lilac, #85a6e9)' }}>{slug ? ui.cta.demo : ui.cta.more}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
