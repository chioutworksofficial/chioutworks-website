import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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

/** Rounded right-angle trace through the given points. */
const trace = (pts: number[][], r = 14) => pts.map(([x, y], i) => {
  if (i === 0) return `M${x} ${y}`;
  if (i === pts.length - 1) return `L${x} ${y}`;
  const [px, py] = pts[i - 1], [nx, ny] = pts[i + 1];
  const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y), k = Math.min(r, l1 / 2, l2 / 2);
  return `L${x + ((px - x) / l1) * k} ${y + ((py - y) / l1) * k}Q${x} ${y} ${x + ((nx - x) / l2) * k} ${y + ((ny - y) / l2) * k}`;
}).join('');
const TR: number[][][] = [
  // 0..4: animated pulses (desktop all five, phone the first three); the rest are static traces
  [[60, 112], [320, 112], [320, 76], [560, 76], [560, 98], [640, 98]],
  [[1380, 112], [1120, 112], [1120, 76], [880, 76], [880, 98], [800, 98]],
  [[200, 210], [420, 210], [420, 138], [590, 138], [590, 122], [640, 122]],
  [[1240, 210], [1020, 210], [1020, 138], [850, 138], [850, 122], [800, 122]],
  [[720, 160], [720, 230], [920, 230], [920, 320]],
  [[40, 120], [300, 120], [300, 210], [560, 210], [560, 300], [640, 300]],
  [[1400, 90], [1120, 90], [1120, 190], [900, 190], [900, 290], [820, 290]],
  [[60, 600], [260, 600], [260, 500], [520, 500], [520, 420], [620, 420]],
  [[1380, 610], [1180, 610], [1180, 500], [940, 500], [940, 410], [830, 410]],
  [[420, 20], [420, 60], [500, 60], [500, 150]],
  [[1020, 20], [1020, 60], [940, 60], [940, 150]],
  [[160, 330], [380, 330], [380, 390], [600, 390], [600, 340]],
  [[1290, 340], [1070, 340], [1070, 400], [860, 400], [860, 350]],
];
const PULSES = 5;
const NODES: number[][] = [[320, 76], [1120, 112], [420, 138], [1020, 138], [560, 98], [880, 98], [720, 230], [300, 210], [920, 230], [940, 410]];
const STARS: number[][] = [[90, 60], [210, 250], [480, 60], [700, 40], [980, 70], [1240, 200], [1350, 420], [1300, 560], [800, 640], [520, 640], [120, 440], [660, 560], [1150, 640], [330, 640]];
function Circuit() {
  return (
    <svg aria-hidden="true" className="cf-circ" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice">
      <g className="cf-cstars">{STARS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 1.2 : 1.8} style={i % 3 ? { animation: 'none' } : { animationDelay: `${-i * 1.7}s` }} />)}</g>
      <rect className="cf-chip" x="640" y="40" width="160" height="120" rx="14" fill="none" strokeWidth="1.6" />
      <rect className="cf-chip" x="664" y="62" width="112" height="76" rx="8" fill="none" strokeWidth="1.2" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} className="cf-ct" d={`M${640 - 22} ${70 + i * 18}h22M800 ${70 + i * 18}h22`} fill="none" />)}
      {TR.map((p, i) => <path key={`b${i}`} className="cf-ct" d={trace(p)} fill="none" strokeWidth="1.2" />)}
      {NODES.map(([x, y], i) => <circle key={`n${i}`} className="cf-cn" cx={x} cy={y} r="3.2" style={i % 3 === 0 ? { animationDelay: `${-i * 1.3}s` } : { animation: 'none' }} />)}
      {TR.slice(0, PULSES).map((p, i) => {
        const st = { animationDuration: `${5 + (i % 4) * 1.3}s`, animationDelay: `${-i * 1.9}s` };
        const d = trace(p);
        return (
          <g key={`p${i}`} className={i > 2 ? 'cf-cx' : undefined}>
            <path className="cf-cp cf-ch" d={d} pathLength={100} fill="none" strokeWidth="7" strokeLinecap="round" style={st} />
            <path className="cf-cp" d={d} pathLength={100} fill="none" strokeWidth="2.4" strokeLinecap="round" style={st} />
          </g>
        );
      })}
      <rect className="cf-cglow" x="640" y="40" width="160" height="120" rx="14" />
    </svg>
  );
}

/** Phone-only circuit (2 light pulses + softly glowing chip, CSS only): chip centred above the front card, short traces down the card sides. Sits inside the stage, behind the cards. */
const TRP: number[][][] = [
  [[128, 24], [60, 24], [60, 52], [12, 52], [12, 330]],
  [[272, 24], [340, 24], [340, 52], [388, 52], [388, 330]],
  [[128, 44], [90, 44], [90, 70], [40, 70]],
  [[272, 44], [310, 44], [310, 70], [360, 70]],
];
const NODES_P: number[][] = [[12, 330], [388, 330], [40, 70], [360, 70], [60, 24], [340, 24]];
function CircuitPhone() {
  return (
    <svg aria-hidden="true" className="cf-circp" viewBox="0 0 400 520" preserveAspectRatio="xMidYMin meet">
      <rect className="cf-chip" x="150" y="6" width="100" height="60" rx="10" fill="none" strokeWidth="1.6" />
      <rect className="cf-chip" x="168" y="21" width="64" height="30" rx="6" fill="none" strokeWidth="1.2" />
      {[0, 1, 2, 3].map((i) => <path key={i} className="cf-ct" d={`M128 ${21 + i * 8}h22M250 ${21 + i * 8}h22`} fill="none" />)}
      {TRP.map((t, i) => <path key={i} className="cf-ct" d={trace(t, 10)} fill="none" strokeWidth="1.2" />)}
      {NODES_P.map(([x, y], i) => <circle key={i} className="cf-cn" cx={x} cy={y} r="3" />)}
      {[0, 1].map((i) => <path key={`p${i}`} className="cf-cp" d={trace(TRP[i], 10)} pathLength={100} fill="none" strokeLinecap="round" style={{ animationDelay: `${-i * 2.3}s` }} />)}
      <rect className="cf-pglow" x="150" y="6" width="100" height="60" rx="10" />
    </svg>
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

const BADGE_STRIP = 56;   // top strip of the card reserved for the "Demo" badge (owner, 2026-11-23: badge must not cover the animation)
/** Lays the mock out at the card's real size; only if the content doesn't fit (short screens) it is laid out taller and
 *  scaled down just enough to fit. At normal size nothing changes (scale 1). */
function FitBox({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    let raf = 0, tm = 0;
    // Shrink only (never grow back while the demo runs) so the card doesn't pulse; a viewport resize starts again at 1.
    const check = () => {
      const c = inner.current?.firstElementChild as HTMLElement | null;
      if (!c) return;
      const over = c.scrollHeight / Math.max(1, c.clientHeight);
      if (over > 1.01) setK((v) => Math.max(0.6, v / over));
    };
    const fit = () => { setK(1); cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(check)); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    // The demos add rows over time: re-check (throttled) when their content changes
    const mo = new MutationObserver(() => { if (!tm) tm = window.setTimeout(() => { tm = 0; check(); }, 250); });
    if (inner.current) mo.observe(inner.current, { childList: true, subtree: true });
    return () => { ro.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); window.clearTimeout(tm); };
  }, []);
  return (
    <div ref={box} className="absolute left-0 right-0 bottom-0" style={{ top: BADGE_STRIP, transformStyle: 'preserve-3d' }}>
      <div ref={inner} className="absolute left-0 top-0" style={{ width: `${100 / k}%`, height: `${100 / k}%`, transform: `scale(${k})`, transformOrigin: '0 0', transformStyle: 'preserve-3d' }}>{children}</div>
    </div>
  );
}

function Float({ z = 2, className = '', children }: { z?: 1 | 2; className?: string; children: ReactNode }) {
  return (
    <div className={`relative ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      <span aria-hidden="true" className="absolute pointer-events-none" style={{ left: '8%', right: '8%', bottom: -10, height: 18, background: 'radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--c-void, #0b0c0e) 85%, transparent), transparent)' }} />
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
        <div className="p-2.5 h-full overflow-hidden" style={panel}>
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
            <div className="p-1.5 flex flex-col gap-1.5 h-full overflow-hidden" style={panel}>
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
        <div className="flex flex-col gap-1.5 h-full justify-end overflow-hidden">
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
        <div className="flex flex-col gap-2 h-full justify-end overflow-hidden">
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


// Orbit carousel (owner, 2026-11-24: "exactly like smartbodrum.tech/#vitrin"): cards sit on a 3D ring, the ring eases to the target
// angle every frame; hovering a card pops it to the front with a glow while the rest dim and a starry blue backdrop fades in.
// Phone / no-hover devices: no hover, the centre card is permanently "lit" (lighter glow). 12 cards share a 6-slot look (|d|>3 fades out).
const CF_CSS = `
.cf-circ{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.95;transform:translateZ(0);contain:strict;-webkit-mask-image:radial-gradient(ellipse 95% 100% at 50% 40%,#000 55%,transparent 100%);mask-image:radial-gradient(ellipse 95% 100% at 50% 40%,#000 55%,transparent 100%)}
.cf-ct{stroke:color-mix(in srgb,var(--c-lilac,#85a6e9) 30%,transparent);stroke-width:1.2}
.cf-chip{stroke:color-mix(in srgb,var(--c-lilac,#85a6e9) 55%,transparent)}
.cf-cn{fill:color-mix(in srgb,var(--c-lilac,#85a6e9) 40%,transparent);animation:cf-node 7s ease-in-out infinite}
.cf-cp{stroke:var(--c-signal,#2862d7);stroke-dasharray:7 93;stroke-dashoffset:0;opacity:0;animation:cf-pulse 6s linear infinite}
.cf-ch{stroke:var(--c-lilac,#85a6e9);stroke-width:7;opacity:0}
.cf-cglow{fill:var(--c-signal,#2862d7);opacity:0;animation:cf-glow 9s ease-in-out infinite}
.cf-cstars circle{fill:var(--c-quartz,#fff);opacity:.22;animation:cf-drift 24s ease-in-out infinite alternate}
@keyframes cf-pulse{0%{stroke-dashoffset:7;opacity:0}8%{opacity:.95}60%{opacity:.95}85%{stroke-dashoffset:-93;opacity:0}100%{stroke-dashoffset:-93;opacity:0}}
.cf-ch{animation-name:cf-pulse-h}
@keyframes cf-pulse-h{0%{stroke-dashoffset:7;opacity:0}8%{opacity:.16}60%{opacity:.16}85%{stroke-dashoffset:-93;opacity:0}100%{stroke-dashoffset:-93;opacity:0}}
@keyframes cf-node{0%,70%,100%{opacity:.5}80%{opacity:1;transform:scale(1)}}
@keyframes cf-glow{0%,55%,100%{opacity:0}75%{opacity:.14}}
@keyframes cf-drift{from{transform:translate(0,0);opacity:.1}to{transform:translate(12px,8px);opacity:.3}}
html[data-mode='light'] .cf-circ{opacity:.85}
html[data-mode='light'] .cf-ct{stroke:color-mix(in srgb,var(--c-signal,#2459c8) 28%,transparent)}
html[data-mode='light'] .cf-chip{stroke:color-mix(in srgb,var(--c-signal,#2459c8) 50%,transparent)}
html[data-mode='light'] .cf-cn{fill:color-mix(in srgb,var(--c-signal,#2459c8) 35%,transparent)}
html[data-mode='light'] .cf-ch{stroke:var(--c-signal,#2459c8)}
html[data-mode='light'] .cf-cp{stroke:color-mix(in srgb,var(--c-signal,#2459c8) 70%,transparent)}
html[data-mode='light'] .cf-cstars circle{fill:var(--c-signal,#2459c8);opacity:.14}
#features[data-vis="0"] .cf-cp,#features[data-vis="0"] .cf-ch,#features[data-vis="0"] .cf-cn,#features[data-vis="0"] .cf-cglow,#features[data-vis="0"] .cf-cstars circle{animation-play-state:paused}
@keyframes cf-star{to{background-position:320px 220px}}
.cf-stage{overscroll-behavior-x:contain;touch-action:pan-y}
.cf-stage{margin-top:44px;--w:min(620px,41vw,calc((100svh - 300px)*1.6));--h:calc(var(--w)/1.6);--rx:1.08;--rz:.91;--ty:.17;--top:calc(var(--h)*.62);position:relative;height:calc(var(--h)*1.5);perspective:1800px;perspective-origin:50% 30%;z-index:1;touch-action:pan-y;user-select:none;-webkit-user-select:none;outline:none}
.cf-sec{min-height:100svh;display:flex;flex-direction:column;justify-content:center}
.cf-space{position:absolute;inset:0;z-index:0;opacity:0;visibility:hidden;transition:opacity .7s ease,visibility 0s .7s;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 18%,#000 86%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 18%,#000 86%,transparent 100%);background:radial-gradient(ellipse 60% 70% at 50% 55%,color-mix(in srgb,var(--c-signal,#2862d7) 45%,var(--c-deep-sea,#0d172b)) 0%,var(--c-deep-sea,#0d172b) 45%,var(--c-void,#0b0c0e) 80%)}
.cf-space::before,.cf-space::after{content:"";position:absolute;inset:0;background-repeat:repeat}
.cf-space::before{background-image:radial-gradient(1.2px 1.2px at 20px 30px,var(--c-quartz,#fff),transparent),radial-gradient(1px 1px at 90px 140px,var(--c-mist,#c7c9d1),transparent),radial-gradient(1.4px 1.4px at 160px 60px,var(--c-quartz,#fff),transparent),radial-gradient(1px 1px at 230px 190px,var(--c-lilac,#85a6e9),transparent),radial-gradient(1.1px 1.1px at 300px 100px,var(--c-quartz,#fff),transparent);background-size:320px 220px;opacity:.75;animation:cf-star 60s linear infinite}
.cf-space::after{background-image:radial-gradient(.9px .9px at 50px 80px,var(--c-quartz,#fff),transparent),radial-gradient(1.3px 1.3px at 180px 20px,var(--c-mist,#c7c9d1),transparent),radial-gradient(.8px .8px at 260px 150px,var(--c-quartz,#fff),transparent);background-size:280px 200px;opacity:.5;animation:cf-star 110s linear infinite reverse}
#features[data-vis="0"] .cf-space::before,#features[data-vis="0"] .cf-space::after{animation-play-state:paused}
.cf-stage:not([data-hov="1"]) .cf-space::before,.cf-stage:not([data-hov="1"]) .cf-space::after{animation-play-state:paused}
.cf-stage[data-hov="1"] .cf-space{opacity:1;visibility:visible;transition-delay:0s}
.cf-ring{position:absolute;left:50%;top:var(--top);width:0;height:0;transform-style:preserve-3d}
.cf-card{position:absolute;left:calc(var(--w)/-2);top:calc(var(--h)/-2);width:var(--w);height:var(--h);container-type:inline-size;border-radius:18px;contain:layout style}
.cf-card::before,.cf-card::after{content:"";position:absolute;inset:0;border-radius:18px;pointer-events:none;opacity:calc(var(--depth,0) * .9);transition:opacity .45s}
.cf-card::before{z-index:-1;visibility:hidden;transition:opacity .45s,visibility 0s .45s;box-shadow:0 0 0 1px color-mix(in srgb,var(--c-lilac,#85a6e9) 55%,transparent),0 30px 90px color-mix(in srgb,var(--c-signal,#2862d7) 55%,transparent)}
.cf-card::after{z-index:6;background:var(--c-void,#0b0c0e)}
.cf-stage[data-hov="1"] .cf-card.lit::before{opacity:1;visibility:visible;transition-delay:0s}
.cf-stage[data-hov="1"] .cf-card:not(.lit)::after{opacity:.55}
.cf-frame{position:absolute;inset:0;border-radius:18px;overflow:hidden;background:linear-gradient(160deg,var(--c-cobalt,#12244f) 0%,var(--c-deep-sea,#0d172b) 55%,var(--c-abyss,#0e111b) 100%);border:1px solid color-mix(in srgb,var(--c-signal,#2862d7) 32%,var(--c-hairline,#24375a));box-shadow:0 20px 44px color-mix(in srgb,var(--c-void,#0b0c0e) 55%,transparent)}
.cf-hit{position:absolute;inset:0;z-index:5;border-radius:18px;outline-offset:4px}
.cf-over{position:absolute;left:0;right:0;bottom:0;height:56%;z-index:3;pointer-events:none;background:linear-gradient(to bottom,transparent,color-mix(in srgb,var(--c-void,#0b0c0e) 82%,transparent) 50%,color-mix(in srgb,var(--c-void,#0b0c0e) 94%,transparent))}
.cf-cap{position:absolute;left:0;right:0;bottom:0;z-index:4;display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:0 5cqw 4.2cqw;pointer-events:none}
.cf-t{font-family:var(--font-display,Figtree,sans-serif);font-size:clamp(16px,3.6cqw,34px);font-weight:700;letter-spacing:-.02em;line-height:1.15;color:var(--c-quartz,#fff)}
.cf-s{margin-top:.4em;font-size:clamp(11.5px,2.3cqw,16px);line-height:1.35;color:var(--c-mist,#c7c9d1);opacity:.9;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.cf-cta{flex:none;display:inline-flex;align-items:center;white-space:nowrap;border-radius:10px;background:var(--c-signal,#2862d7);color:var(--c-on-accent,#fff);font-weight:700;font-size:clamp(12px,2.6cqw,16px);padding:.6em 1em;opacity:0;transform:translateY(6px);transition:all .35s}
.cf-card.lit .cf-cta{opacity:1;transform:none}
html[data-mode='light'] .cf-space{background:radial-gradient(ellipse 60% 70% at 50% 55%,color-mix(in srgb,var(--c-signal,#2459c8) 22%,var(--c-deep-sea,#ecf1fa)) 0%,var(--c-deep-sea,#ecf1fa) 50%,var(--c-void,#f4f7fc) 85%)}
html[data-mode='light'] .cf-space::before,html[data-mode='light'] .cf-space::after{opacity:.18}
html[data-mode='light'] .cf-card::before{box-shadow:0 0 0 1px color-mix(in srgb,var(--c-signal,#2459c8) 35%,transparent),0 26px 70px color-mix(in srgb,var(--c-signal,#2459c8) 28%,transparent)}
html[data-mode='light'] .cf-card::after{background:var(--c-void,#f4f7fc)}
html[data-mode='light'] .cf-stage[data-hov="1"] .cf-card:not(.lit)::after{opacity:.4}
html[data-mode='light'] .cf-frame{box-shadow:0 16px 36px -14px color-mix(in srgb,var(--c-signal,#2459c8) 30%,transparent)}
html[data-mode='light'] .cf-tag{background:color-mix(in srgb,var(--c-abyss,#fff) 90%,transparent);border-color:var(--c-hairline,#bccbe3)}
.cf-tag{position:absolute;top:3cqw;left:50%;transform:translateX(-50%);z-index:4;border-radius:9999px;padding:.5em 1.35em;font-size:clamp(12.5px,2.4cqw,18px);font-weight:700;letter-spacing:.02em;color:var(--c-quartz,#fff);background:color-mix(in srgb,var(--c-void,#0b0c0e) 78%,transparent);border:1px solid color-mix(in srgb,var(--c-quartz,#fff) 14%,transparent);max-width:84%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none}
.cf-hit:focus-visible{outline:2px solid var(--c-lilac,#85a6e9);outline-offset:3px}
.cf-card[data-act="0"] .fx,.cf-card[data-act="0"] .fx-dots i,.cf-stage[data-mov="1"] .cf-card .fx,.cf-stage[data-mov="1"] .cf-card .fx-dots i{animation-play-state:paused}
.cf-circp{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:visible}
.cf-circp .cf-cn,.cf-circp .cf-ct{animation:none}
.cf-circp .cf-cp{stroke-width:2.4;animation-duration:4.6s}
.cf-circp .cf-pglow{fill:var(--c-signal,#2862d7);opacity:.04;animation:cf-pg 3.6s ease-in-out infinite}
@keyframes cf-pg{0%,100%{opacity:.04}50%{opacity:.2}}
#features[data-vis="0"] .cf-pglow,.cf-stage[data-mov="1"] .cf-circp .cf-cp,.cf-stage[data-mov="1"] .cf-circp .cf-pglow{animation-play-state:paused}
.cf-note{position:relative;z-index:1;margin:12px auto 0;padding:0 16px;max-width:560px;text-align:center;font-size:13.5px;line-height:1.45;color:var(--c-ash,#abaebb)}
@media (max-width:767px),(pointer:coarse){
  .cf-stage{margin-top:4px;--w:min(88vw,340px);--h:calc(var(--w)*1.2);--rx:.56;--rz:.89;--ty:.16;--top:calc(var(--h)/2 + 78px);perspective:none;height:calc(var(--h) + 122px)}
  .cf-ring{transform-style:flat}
  .cf-card::before,.cf-card::after{transition:none}
  .cf-cta{opacity:0;transform:none;transition:none}
  .cf-card.lit .cf-cta{opacity:1}
  .cf-card .fx-root{transform-style:flat;transform:none;transition:none}
  .cf-card .fx-z1,.cf-card .fx-z2{transform:none;transition:none}
  .cf-card,.cf-frame,.cf-hit{border-radius:16px}
  .cf-space{display:none}
  .cf-circ{opacity:.7}.cf-cx{display:none}
  .cf-card::before{box-shadow:0 0 0 1px color-mix(in srgb,var(--c-lilac,#85a6e9) 30%,transparent),0 14px 34px -8px color-mix(in srgb,var(--c-signal,#2862d7) 45%,transparent)}
  .cf-card.lit::before{opacity:1;visibility:visible;transition-delay:0s}
  .cf-ch{display:none}
  .cf-cap{flex-direction:column;align-items:flex-start;gap:10px;padding:0 5.5cqw 5.5cqw}
  .cf-t{font-size:clamp(17px,6.2cqw,24px)}
  .cf-s{font-size:clamp(12px,3.9cqw,14px)}
  .cf-cta{font-size:13px;padding:.55em 1em}
  .cf-tag{top:12px;font-size:12.5px;max-width:86%}
}
@media (prefers-reduced-motion: reduce){.cf-space{transition:none}.cf-space::before,.cf-space::after,.cf-cp,.cf-ch,.cf-cn,.cf-cglow,.cf-cstars circle,.cf-pglow{animation:none}}
`;


const N = ORDER.length;
const CULL = 2.5; // cards further than this many slots from the front are hidden and render no mock
const CULL_P = 1.5; // phone: only the front card and its two neighbours
const PHONE_Q = '(pointer: coarse), (max-width: 767px)';

type UI = (typeof FEATURES_UI)['en'];
type CardP = { i: number; o: number; ui: UI; lang: Lang; cur: boolean; near: boolean; reg: (i: number, el: HTMLDivElement | null) => void; setHov: (i: number) => void; touch: { current: boolean }; go: (i: number) => void; hov: { current: { hov: number } } };
// memoised with stable props: a front change re-renders only the cards whose cur/near flag flipped
const Card = memo(function Card({ i, o, ui, lang, cur, near, reg, setHov, touch, go, hov }: CardP) {
  const it = ui.items[o];
  const slug = SHOTS[o];
  const to = slug ? demoPath(lang, slug) + (slug === 'demokafe' ? '?view=qr' : '') : pagePath(lang, 'services');
  const M = MOCK_BY[o];
  const tag = it.title.split(/\s+[&·]\s+|,\s*/)[0];
  const rf = useCallback((el: HTMLDivElement | null) => reg(i, el), [reg, i]);
  return (
    <div ref={rf} className="cf-card" data-act={cur ? '1' : '0'} aria-hidden={cur ? undefined : true}
      onMouseEnter={() => { if (!touch.current) setHov(i); }} onMouseLeave={() => { if (hov.current.hov === i) setHov(-1); }}>
      <div className="cf-frame">
        <span className="cf-tag">{tag}</span>
        <FitBox>
          <div className="absolute inset-0 pt-2 px-5 pb-5 flex">
            {near ? <M m={ui.mock} s={ui.sim} x={ui.x} lang={lang} /> : null}
          </div>
        </FitBox>
        <div aria-hidden="true" className="cf-over" />
        <div className="cf-cap">
          <div className="min-w-0">
            <h3 className="cf-t">{it.title}</h3>
            <p className="cf-s">{it.text}</p>
          </div>
          <span className="cf-cta">{slug ? ui.cta.demo : ui.cta.more}</span>
        </div>
      </div>
      <Link to={to} draggable={false} tabIndex={cur ? 0 : -1} aria-label={it.title} className="cf-hit"
        onClick={(e) => { if (touch.current && !cur) { e.preventDefault(); go(i); } }} />
    </div>
  );
});

export default function FeaturesScroll({ lang }: { lang: Lang }) {
  const ui = FEATURES_UI[lang];
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cardEl = useRef<(HTMLDivElement | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE_Q).matches);
  const phoneR = useRef(phone); phoneR.current = phone;
  const calm = useRef(true); const calmT = useRef(0);
  const reduce = useRef(false);
  const touch = useRef(false);
  const kick = useRef<() => void>(() => {});
  const trig = useRef<ScrollTrigger | null>(null);
  // pos: current ring position in card slots; target: set by page scroll; pop: per-card hover pop 0..1
  const S = useRef({ pos: 0, target: 0, hov: -1, pop: new Array<number>(N).fill(0), cur: 0, fr: 0 });

  // scroll the page so that card i becomes the front card
  const go = useCallback((i: number) => {
    const t = trig.current; if (!t) return;
    window.scrollTo({ top: t.start + ((t.end - t.start) * i) / (N - 1), behavior: reduce.current ? 'auto' : 'smooth' });
  }, []);

  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduce.current = mq.matches;
    touch.current = window.matchMedia('(hover: none)').matches;
    const on = () => { reduce.current = mq.matches; };
    mq.addEventListener('change', on);
    const pq = window.matchMedia(PHONE_Q);
    const onP = () => setPhone(pq.matches);
    pq.addEventListener('change', onP);
    return () => { mq.removeEventListener('change', on); pq.removeEventListener('change', onP); };
  }, []);

  // Page scroll drives the ring: the section pins and progress maps to ring position 0..N-1 (snapped to whole cards).
  useLayoutEffect(() => {
    const el = root.current; if (!el) return;
    const s = S.current;
    const per = phone ? 0.45 : 0.6;
    const tw = gsap.fromTo(s, { target: 0 }, {
      target: N - 1, ease: 'none', onUpdate: () => kick.current(),
      scrollTrigger: {
        trigger: el, start: 'top top', end: () => `+=${Math.round(window.innerHeight * per * (N - 1))}`, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        scrub: phone ? true : 0.6,
        snap: { snapTo: 1 / (N - 1), inertia: false, duration: { min: 0.2, max: 0.45 }, delay: 0.1, ease: 'power2.out' },
      },
    });
    trig.current = tw.scrollTrigger ?? null;
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { window.clearTimeout(t); trig.current = null; tw.scrollTrigger?.kill(); tw.kill(); s.target = 0; };
  }, [phone]);

  // Off-screen: pause animations and the frame loop.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Frame loop: runs ONLY while something moves (ring easing, hover pop); stops when settled, off-screen or tab hidden.
  // Transforms go straight to element.style, no React state per frame (idx changes only when the front card changes).
  useEffect(() => {
    if (!vis) return;
    let raf = 0, last = 0, RX = 0, RZ = 0, TY = 0;
    const measure = () => {
      const st = stage.current; if (!st) return;
      const cs = getComputedStyle(st);
      const w = cardEl.current[0]?.offsetWidth || 400;
      RX = (parseFloat(cs.getPropertyValue('--rx')) || 1) * w; RZ = (parseFloat(cs.getPropertyValue('--rz')) || 0.9) * w; TY = (parseFloat(cs.getPropertyValue('--ty')) || 0.17) * w;
    };
    const tick = (ts: number) => {
      raf = 0;
      const s = S.current;
      if (!stage.current || document.hidden) { last = 0; return; }
      const dt = Math.min(64, ts - (last || ts)); last = ts;
      const ph = phoneR.current, cull = ph ? CULL_P : CULL;
      let moving = false;
      const diff = s.target - s.pos;
      if (reduce.current || ph || Math.abs(diff) < 0.001) { moving = Math.abs(diff) > 0.001; s.pos = s.target; }
      else { s.pos += diff * Math.min(1, dt / 90); moving = true; }
      if (ph) {
        // phone: all mock animations and the chip pulses stay paused while the ring moves; the front card resumes ~200 ms after settling
        if (moving) { calm.current = false; window.clearTimeout(calmT.current); calmT.current = 0; stage.current.dataset.mov = '1'; }
        else if (!calm.current && !calmT.current) calmT.current = window.setTimeout(() => { calmT.current = 0; calm.current = true; stage.current?.removeAttribute('data-mov'); start(); }, 200);
      } else calm.current = true;
      const near = ((Math.round(s.pos) % N) + N) % N;
      // phone: stable front with hysteresis (changes only once the position is 0.15 past the half-way point), so lit/CTA/idx never flicker
      let df = s.pos - s.fr; df -= Math.round(df / N) * N;
      if (!ph || Math.abs(df) > 0.65) s.fr = near;
      const cur = s.fr;
      const settled = !moving;
      for (let i = 0; i < N; i++) {
        const c = cardEl.current[i]; if (!c) continue;
        let d = i - s.pos; d -= Math.round(d / N) * N;
        const ad = Math.abs(d), dd = Math.max(-3, Math.min(3, d));
        const th = (dd * 60 * Math.PI) / 180, sn = Math.sin(th), co = Math.cos(th);
        const want = i === s.hov ? 1 : 0; const dp = want - s.pop[i];
        if (Math.abs(dp) < 0.004) s.pop[i] = want; else { s.pop[i] += dp * Math.min(1, dt / 120); moving = true; }
        const p = s.pop[i];
        const fade = ad > cull - 0.5 ? Math.max(0, 1 - (ad - (cull - 0.5)) * 2) : 1;
        if (fade === 0) { if (c.style.visibility !== 'hidden') { c.style.visibility = 'hidden'; c.style.willChange = ''; c.style.pointerEvents = 'none'; } continue; }
        const x = RX * sn * (1 - p * 0.25), z = RZ * co - RZ + p * 260, y = -TY * (1 - co) * (1 - p) + p * 10;
        const sc = (0.6 + 0.4 * (1 + co) / 2) * (1 - p) + 1.16 * p;
        if (ph) {
          // phone: flat 2D (same arrangement, perspective folded into the scale), no 3D compositing
          const pf = 1000 / (1000 - z);
          c.style.transform = `translate3d(${(x * pf).toFixed(1)}px,${(y * pf).toFixed(1)}px,0) scale(${(sc * pf).toFixed(3)})`;
        } else c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(-sn * 22 * (1 - p)).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        c.style.zIndex = String(Math.round(1000 + z));
        // cards stay opaque (the circuit background must never show through them); depth is a dark overlay instead
        c.style.opacity = String(fade);
        c.style.setProperty('--depth', (1 - Math.min(1, Math.max(0.35, 0.55 + 0.45 * co + p))).toFixed(3));
        if (c.style.visibility !== 'visible') c.style.visibility = 'visible';
        c.style.pointerEvents = fade < 0.5 ? 'none' : '';
        c.style.willChange = moving ? 'transform, opacity' : '';
        const lit = s.hov >= 0 ? i === s.hov : i === cur && (ph || settled);
        if (c.classList.contains('lit') !== lit) c.classList.toggle('lit', lit);
        const act = (ph ? i === cur : i === cur || i === s.hov) ? '1' : '0';
        if (c.dataset.act !== act) c.dataset.act = act;
      }
      if (cur !== s.cur) { s.cur = cur; setIdx(cur); }
      if (moving) raf = requestAnimationFrame(tick);
      else { last = 0; for (const c of cardEl.current) if (c) c.style.willChange = ''; }
    };
    const start = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(tick); };
    kick.current = start;
    measure(); start();
    const onResize = () => { measure(); start(); };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', start);
    return () => { cancelAnimationFrame(raf); raf = 0; window.clearTimeout(calmT.current); calmT.current = 0; kick.current = () => {}; window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', start); };
  }, [vis, phone]);

  const reg = useCallback((i: number, el: HTMLDivElement | null) => { cardEl.current[i] = el; }, []);
  const setHov = useCallback((i: number) => { S.current.hov = i; if (i >= 0) stage.current?.setAttribute('data-hov', '1'); else stage.current?.removeAttribute('data-hov'); kick.current(); }, []);

  return (
    <section ref={root} id="features" data-vis={vis ? '1' : '0'} className="relative overflow-hidden pt-3 pb-8 md:pt-5 md:pb-12 cf-sec" style={{ background: 'var(--c-void, #0b0c0e)' }}>
      <style>{FX_CSS}{CF_CSS}</style>
      <h2 className="sr-only">{ui.heading}</h2>
      {phone ? null : <Circuit />}

      <div ref={stage} className="cf-stage" role="region" aria-roledescription="carousel" aria-label={ui.heading}>
        {phone ? <CircuitPhone /> : <div aria-hidden="true" className="cf-space" />}
        <div className="cf-ring">
          {ORDER.map((o, i) => {
            const cur = i === idx;
            const near = Math.min((i - idx + N) % N, (idx - i + N) % N) <= (phone ? 1 : 2);
            return <Card key={i} i={i} o={o} ui={ui} lang={lang} cur={cur} near={near} reg={reg} setHov={setHov} touch={touch} go={go} hov={S} />;
          })}
        </div>
      </div>

      <p className="cf-note">{ui.carouselNote}</p>
    </section>
  );
}
