import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Lang } from '../translations';
import { demoPath, pagePath } from '../lib/routes';
import { MARKET_CURRENCY } from '../lib/currency';
import {
  calcRoi, clamp, DEFAULT_COST, fmtDate, fmtMoney, fmtNum, MAX_TASKS, SECTOR_DEMO, SECTOR_KEYS, SECTOR_NUM, saveRoi, UNITS,
  type RoiCalc, type RoiTask, type SectorKey,
} from '../lib/roiModel';
import { ROI_SECTORS, ROI_UI } from './i18n/roi';
import BtnArrow from './BtnArrow';
import { guardFields, prefetchFormToken } from '../lib/formGuard';

gsap.registerPlugin(ScrollTrigger);

const R = 150;
const ARC = `M 20 170 A ${R} ${R} 0 0 1 320 170`;
const SITE_URL = 'chioutworks.com';

const presetTasks = (lang: Lang, s: SectorKey): RoiTask[] =>
  ROI_SECTORS[lang][s].tasks.map((name, i) => ({ name, min: SECTOR_NUM[s][i][0], perWeek: SECTOR_NUM[s][i][1], auto: SECTOR_NUM[s][i][2] }));

/** Shrink a result value until it fits its column; below 60% allow it to wrap instead of clipping. */
function fit(el: HTMLElement | null) {
  const box = el?.parentElement;
  if (!el || !box) return;
  el.style.fontSize = ''; el.style.whiteSpace = 'nowrap';
  const avail = box.clientWidth, need = el.scrollWidth;
  if (!avail || need <= avail) return;
  const base = parseFloat(getComputedStyle(el).fontSize);
  const k = avail / need;
  el.style.fontSize = `${Math.max(base * 0.6, base * k * 0.98)}px`;
  if (k < 0.6) el.style.whiteSpace = 'normal';
}

const STAT_KEYS = ['weekH', 'monthH', 'yearH', 'moneyMonth', 'moneyYear', 'days'] as const;

function Inner({ lang }: { lang: Lang }) {
  const ui = ROI_UI[lang];
  const un = UNITS[lang];
  const navigate = useNavigate();
  const currency = MARKET_CURRENCY[lang];
  const root = useRef<HTMLElement>(null);
  const arc = useRef<SVGPathElement>(null);
  const shown = useRef({ weekH: 0, monthH: 0, yearH: 0, moneyMonth: 0, moneyYear: 0, days: 0 });
  const cells = useRef<(HTMLSpanElement | null)[]>([]);
  const [sector, setSector] = useState<SectorKey>('salon');
  const [tasks, setTasks] = useState<RoiTask[]>(() => presetTasks(lang, 'salon'));
  const [staff, setStaff] = useState(2);
  const [cost, setCost] = useState(DEFAULT_COST[lang]);
  const [repName, setRepName] = useState('');
  const [repCompany, setRepCompany] = useState('');
  const [customSector, setCustomSector] = useState('');
  const [repEmail, setRepEmail] = useState('');   // visitor's own industry when "other" is chosen
  const sectorName = (s: SectorKey) => (s === 'other' && customSector.trim() ? customSector.trim() : ROI_SECTORS[lang][s].label);
  const money = useCallback((v: number) => fmtMoney(lang, currency, v), [lang, currency]);

  // language change → sector presets, task names and the local default cost follow the language
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setTasks(presetTasks(lang, sector)); setCost(DEFAULT_COST[lang]);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (s: SectorKey) => { setSector(s); setTasks(presetTasks(lang, s)); };
  const upd = (i: number, p: Partial<RoiTask>) => setTasks((ts) => ts.map((t, j) => (j === i ? { ...t, ...p } : t)));

  const res = useMemo(() => calcRoi(tasks, staff, cost), [tasks, staff, cost]);
  const frac = Math.min(1, Math.sqrt(res.monthH / 4000));

  // animate gauge + counters when inputs change
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmt = (k: (typeof STAT_KEYS)[number], v: number) => (k === 'moneyMonth' || k === 'moneyYear' ? money(v) : k === 'days' ? `${fmtNum(lang, v)}` : `${fmtNum(lang, v)} ${un.h}`);
    const write = () => {
      STAT_KEYS.forEach((k, i) => { const c = cells.current[i]; if (c) c.textContent = fmt(k, shown.current[k]); });
      cells.current.forEach((c) => fit(c));
    };
    if (reduce) {
      Object.assign(shown.current, res); write();
      arc.current?.setAttribute('stroke-dashoffset', String(1 - frac));
      return;
    }
    const tw = gsap.to(shown.current, { ...res, duration: 0.8, ease: 'power3.out', onUpdate: write });
    const tw2 = arc.current ? gsap.to(arc.current, { attr: { 'stroke-dashoffset': 1 - frac }, duration: 0.9, ease: 'power3.out' }) : null;
    return () => { tw.kill(); tw2?.kill(); };
  }, [res, frac, lang, money, un.h]);

  useLayoutEffect(() => {
    const re = () => cells.current.forEach((c) => fit(c));
    window.addEventListener('resize', re);
    return () => window.removeEventListener('resize', re);
  }, []);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-reveal]', {
          opacity: 0, y: 28, duration: 0.8, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        });
      });
    }, root);
    return () => { ctx.revert(); mm.revert(); };
  }, [lang]);

  const calc = (): RoiCalc => ({
    v: 1, sector, sectorLabel: sectorName(sector).slice(0, 60), tasks: tasks.map((t) => ({ ...t, name: t.name.slice(0, 60) })), staff, cost, currency, lang,
  });
  const send = () => { saveRoi(calc()); navigate(pagePath(lang, 'contact')); };
  useEffect(() => { prefetchFormToken(); }, []);
  const download = () => {
    // Optional e-mail: kept with the calculation so the owner can reply (no newsletter); the PDF itself is made in the browser
    const mail = repEmail.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
      void guardFields().then((g) => fetch('/api/roi-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ email: mail, name: repName.trim(), company: repCompany.trim(), lang, page: window.location.pathname, roiCalc: calc(), ...g }) })).catch(() => {});
    }
    const done = () => { document.body.classList.remove('roi-printing'); window.removeEventListener('afterprint', done); };
    document.body.classList.add('roi-printing');
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 50);
  };

  const label = { fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--lq-silver)' };
  const input: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--lq-line)', background: 'var(--lq-deep)', color: 'var(--lq-white)', fontSize: 14, fontFamily: 'var(--lq-font)', outline: 'none', minWidth: 0 };
  const num = (id: string, text: string, v: number, lo: number, hi: number, set: (n: number) => void, suffix?: string, compact = false) => (
    <label htmlFor={id} className="flex flex-col justify-end gap-1 min-w-0" style={{ fontSize: 11, color: 'var(--lq-silver)' }}>
      <span className={compact ? 'roi-task-lbl' : undefined} style={{ lineHeight: 1.25 }}>{text}</span>
      <span className="relative block">
        <input id={id} type="number" inputMode="decimal" min={lo} max={hi} value={v} onChange={(e) => set(clamp(Number(e.target.value), lo, hi))} style={{ ...input, paddingRight: suffix ? 34 : 10 }} />
        {suffix && <span aria-hidden="true" className="absolute pointer-events-none" style={{ right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--lq-silver)' }}>{suffix}</span>}
      </span>
    </label>
  );
  const stat = (i: number, text: string) => (
    <div className="min-w-0">
      <div style={{ fontSize: 'clamp(20px, 1.9vw, 26px)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', lineHeight: 1.05, color: 'var(--lq-lavender)' }}><span ref={(el) => { cells.current[i] = el; }} style={{ display: 'inline-block', maxWidth: '100%' }} /></div>
      <div className="mt-1" style={{ fontSize: 12, color: 'var(--lq-silver)' }}>{text}</div>
    </div>
  );
  const chip = (on: boolean): React.CSSProperties => ({ borderRadius: 6, fontSize: 13, border: '1px solid var(--lq-line-strong)', background: on ? 'var(--c-quartz)' : 'transparent', color: on ? 'var(--c-abyss)' : 'var(--lq-mist)', fontWeight: 500 });
  const demo = SECTOR_DEMO[sector];

  return (
    <section id="roi" ref={root} className="relative">
      <div className="mx-auto px-5 md:px-9 py-[60px] lg:py-20" style={{ maxWidth: 1200 }}>
        <h2 data-reveal style={{ fontSize: 'clamp(32px, 3.1vw, 44px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{ui.title}</h2>
        <p data-reveal className="mt-6" style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--lq-silver)', maxWidth: 560 }}>{ui.desc}</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.08fr_1fr] gap-6 lg:gap-8 items-start">
          {/* inputs */}
          <div data-reveal className="lq-card p-5 sm:p-7 min-w-0">
            <div style={label}>{ui.sector}</div>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={ui.sector}>
              {SECTOR_KEYS.map((s) => (
                <button key={s} type="button" aria-pressed={sector === s} onClick={() => pick(s)} className="px-3 py-2" style={chip(sector === s)}>{sectorName(s)}</button>
              ))}
            </div>
            {sector === 'other' && (
              <input type="text" maxLength={60} aria-label={ui.customSector} placeholder={ui.customSector} value={customSector}
                onChange={(e) => setCustomSector(e.target.value)} className="mt-3" style={{ ...input, maxWidth: 360 }} autoFocus />
            )}

            <div className="mt-5" style={label}>{ui.tasks}</div>
            <div className="roi-task roi-task-head mt-2" aria-hidden="true">
              <span>{ui.taskName}</span><span>{ui.taskMin}</span><span>{ui.taskPerWeek}</span><span>{ui.taskAuto}</span><span />
            </div>
            <ul className="mt-1 flex flex-col gap-2 list-none p-0 m-0">
              {tasks.map((t, i) => (
                <li key={i} className="roi-task">
                  <label className="roi-task-name flex flex-col gap-1 min-w-0" style={{ fontSize: 11, color: 'var(--lq-silver)' }}>
                    <span className="roi-task-lbl">{ui.taskName}</span>
                    <input type="text" maxLength={60} value={t.name} onChange={(e) => upd(i, { name: e.target.value })} style={input} />
                  </label>
                  {num(`roi-m-${i}`, ui.taskMin, t.min, 0, 1440, (n) => upd(i, { min: n }), un.min.length <= 4 ? un.min : undefined, true)}
                  {num(`roi-w-${i}`, ui.taskPerWeek, t.perWeek, 0, 1000, (n) => upd(i, { perWeek: n }), undefined, true)}
                  {num(`roi-a-${i}`, ui.taskAuto, t.auto, 0, 100, (n) => upd(i, { auto: n }), '%', true)}
                  <button type="button" className="roi-task-x" aria-label={ui.removeTask} title={ui.removeTask} onClick={() => setTasks((ts) => ts.filter((_, j) => j !== i))} style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid var(--lq-line)', color: 'var(--lq-mist)', cursor: 'pointer', flexShrink: 0 }}>×</button>
                </li>
              ))}
            </ul>
            <button type="button" disabled={tasks.length >= MAX_TASKS} onClick={() => setTasks((ts) => [...ts, { name: '', min: 5, perWeek: 10, auto: 50 }])} className="mt-3 px-3 py-2" style={{ ...chip(false), cursor: tasks.length >= MAX_TASKS ? 'default' : 'pointer', opacity: tasks.length >= MAX_TASKS ? 0.5 : 1 }}>{ui.addTask}</button>
            {tasks.length >= MAX_TASKS && <span className="ml-3" style={{ fontSize: 12, color: 'var(--lq-silver)' }}>{ui.maxTasks}</span>}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {num('roi-staff', ui.staff, staff, 1, 1000, setStaff)}
              {num('roi-cost', `${ui.cost} (${currency})`, cost, 0, 100000, setCost)}
            </div>
          </div>

          {/* results */}
          <div data-reveal className="lq-card relative overflow-hidden p-5 sm:p-7 min-w-0 lg:sticky lg:top-24">
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: 0, background: 'radial-gradient(60% 40% at 50% 0%, color-mix(in srgb, var(--lq-g2) 18%, transparent), transparent)' }} />
            {/* Brand mark inside the result card: screenshots of the result carry the source */}
            <span aria-hidden="true" className="absolute pointer-events-none select-none" style={{ top: 14, right: 18, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lq-silver)', opacity: 0.7 }}>chioutworks.com</span>
            <div className="relative">
              <svg viewBox="0 0 340 190" className="w-full mx-auto block" style={{ maxWidth: 300 }} role="img" aria-label={ui.gauge}>
                <defs>
                  <linearGradient id="roi-grad" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="320" y2="0">
                    <stop offset="0%" style={{ stopColor: 'var(--lq-g1)' }} />
                    <stop offset="50%" style={{ stopColor: 'var(--lq-g2)' }} />
                    <stop offset="100%" style={{ stopColor: 'var(--lq-g3)' }} />
                  </linearGradient>
                </defs>
                <path d={ARC} fill="none" strokeWidth="18" strokeLinecap="round" style={{ stroke: 'var(--lq-line)' }} />
                <path ref={arc} d={ARC} fill="none" strokeWidth="18" strokeLinecap="round" stroke="url(#roi-grad)" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
                <text x="170" y="150" textAnchor="middle" style={{ fill: 'var(--lq-silver)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{ui.gauge}</text>
                <text x="170" y="178" textAnchor="middle" style={{ fill: 'var(--lq-lavender)', fontSize: 26, fontWeight: 500 }}>{money(res.moneyYear)}</text>
              </svg>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4">
                {stat(0, ui.hWeek)}{stat(1, ui.hMonth)}{stat(2, ui.hYear)}{stat(3, ui.mMonth)}{stat(4, ui.mYear)}{stat(5, ui.days)}
              </div>

              <details className="mt-4" style={{ fontSize: 13, color: 'var(--lq-silver)' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--lq-mist)' }}>{ui.assumptionsTitle}</summary>
                <ul className="mt-2 pl-5 flex flex-col gap-1" style={{ listStyle: 'disc', lineHeight: 1.5 }}>
                  {ui.assumptions.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </details>

              <p className="mt-4" style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--lq-white)' }}>{ROI_SECTORS[lang][sector].nudge}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={send} className="lq-btn-ghost" style={{ lineHeight: 1.5, paddingBlock: 12, textAlign: "left" }}>{ui.send}<BtnArrow /></button>
                <Link to={demo ? demoPath(lang, demo) : pagePath(lang, 'solutions')} className="lq-btn-ghost">{ui.demo}<BtnArrow /></Link>
              </div>
              <p className="mt-3" style={{ fontSize: 12, color: 'var(--lq-silver)' }}>{ui.privacy}</p>

              <details className="mt-4" style={{ fontSize: 13, color: 'var(--lq-silver)' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--lq-mist)' }}>{ui.download}</summary>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 min-w-0" style={{ fontSize: 11, color: 'var(--lq-silver)' }}>{ui.repName}<input type="text" maxLength={60} value={repName} onChange={(e) => setRepName(e.target.value)} style={input} /></label>
                  <label className="flex flex-col gap-1 min-w-0" style={{ fontSize: 11, color: 'var(--lq-silver)' }}>{ui.repCompany}<input type="text" maxLength={60} value={repCompany} onChange={(e) => setRepCompany(e.target.value)} style={input} /></label>
                </div>
                <p className="mt-2" style={{ fontSize: 12, color: 'var(--lq-silver)' }}>{ui.repNote}</p>
                <label className="mt-3 flex flex-col gap-1 min-w-0" style={{ fontSize: 11, color: 'var(--lq-silver)', maxWidth: 360 }}>{ui.repEmail}
                  <input type="email" autoComplete="email" maxLength={254} value={repEmail} onChange={(e) => setRepEmail(e.target.value)} style={input} /></label>
                <p className="mt-2" style={{ fontSize: 12, color: 'var(--lq-silver)' }}>{ui.repEmailNote}</p>
                <button type="button" onClick={download} className="mt-3 lq-btn-ghost" style={{ lineHeight: 1.5, paddingBlock: 12 }}>{ui.download}<BtnArrow /></button>
              </details>
            </div>
          </div>
        </div>
      </div>
      {createPortal(
        <div className="roi-print-root" lang={lang} aria-hidden="true">
          <h1>{ui.rTitle}</h1>
          <p className="roi-muted">{ui.rDate}: {fmtDate(lang)}{(repName || repCompany) && ` · ${ui.rFor}: ${[repName, repCompany].filter(Boolean).join(', ')}`}</p>
          <h2>{ui.rInputs}</h2>
          <p>{ui.sector}: {sectorName(sector)} · {ui.rStaff}: {fmtNum(lang, staff)} · {ui.rCost}: {money(cost)}</p>
          <table>
            <thead><tr><th>{ui.taskName}</th><th>{ui.taskMin}</th><th>{ui.taskPerWeek}</th><th>{ui.taskAuto}</th></tr></thead>
            <tbody>{tasks.map((t, i) => <tr key={i}><td>{t.name}</td><td>{fmtNum(lang, t.min)} {un.min}</td><td>{fmtNum(lang, t.perWeek)}</td><td>{fmtNum(lang, t.auto)} %</td></tr>)}</tbody>
          </table>
          <h2>{ui.rResults}</h2>
          <table>
            <tbody>
              <tr><td>{ui.hWeek}</td><td>{fmtNum(lang, res.weekH)} {un.h}</td></tr>
              <tr><td>{ui.hMonth}</td><td>{fmtNum(lang, res.monthH)} {un.h}</td></tr>
              <tr><td>{ui.hYear}</td><td>{fmtNum(lang, res.yearH)} {un.h}</td></tr>
              <tr><td>{ui.mMonth}</td><td>{money(res.moneyMonth)}</td></tr>
              <tr><td>{ui.mYear}</td><td>{money(res.moneyYear)}</td></tr>
              <tr><td>{ui.days}</td><td>≈ {fmtNum(lang, res.days)} {un.day}</td></tr>
            </tbody>
          </table>
          <h2>{ui.rAssump}</h2>
          <ul>{ui.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
          <p className="roi-cta">{ui.rCta} {SITE_URL}</p>
          <p className="roi-muted">{ui.rEst}</p>
        </div>,
        document.body,
      )}
    </section>
  );
}

export default function RoiCalculator({ lang }: { lang: Lang }) {
  return <Inner lang={lang} />;
}
