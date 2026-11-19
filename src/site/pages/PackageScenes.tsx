import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Lang } from '../../translations';
import { PACKAGE_TEXT, type PackageId } from '../i18n/packages';
import { PKG_SCENES } from '../i18n/packageScenes';

/**
 * Scroll-driven scenes for the CRM, website, invoices and QR packages (owner, 2026-11-19). Same frame as BookingScene:
 * a sticky stage (main device + side panel) beside the step list; on phones the two panes take turns.
 * Reduced motion: final state, no sticky scroll.
 */
const clamp = (v: number) => Math.min(1, Math.max(0, v));
type Pane = 'main' | 'side';

function useProgress() {
  const root = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0); const [still, setStill] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStill(true); setP(1); return; }
    let raf = 0;
    const tick = () => { raf = 0; const el = root.current; if (!el) return; const r = el.getBoundingClientRect(); setP(clamp(-r.top / Math.max(1, r.height - window.innerHeight))); };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return { root, s: p * 100, still };
}

function Shell({ id, lang, pane, render }: { id: PackageId; lang: Lang; pane: (step: number) => Pane; render: (s: number, step: number) => { main: ReactNode; side: ReactNode } }) {
  const x = PACKAGE_TEXT[id][lang];
  const { root, s, still } = useProgress();
  const step = s < 25 ? 0 : s < 50 ? 1 : s < 75 ? 2 : 3;
  const done = s >= 96;
  const { main, side } = render(s, step);
  return (
    <div ref={root} className={`bks ${still ? 'is-still' : ''}`} style={still ? undefined : { height: '340vh' }}>
      <div className="bks-sticky">
        {!still && <SceneHint lang={lang} p={s / 100} />}
        <div className="bks-grid">
          <div className={`bks-stage psc-stage psc-${id} show-${pane(step)}`} aria-hidden="true">
            <div className="psc-main">{main}</div>
            <div className="psc-side">{side}</div>
          </div>
          <ol className="bks-steps">
            {x.steps.map((st, i) => (
              <li key={st.t} className={`${i === step ? 'is-on' : ''} ${i < step || done ? 'is-past' : ''}`}>
                <span className="bks-num">{String(i + 1).padStart(2, '0')}</span>
                <div><b>{st.t}</b><small>{st.ex}</small></div>
              </li>
            ))}
            <li className={`bks-result ${done ? 'is-on' : ''}`}><span className="bks-num">✓</span><div><b>{x.result}</b></div></li>
          </ol>
        </div>
      </div>
    </div>
  );
}


/** "Scroll to watch" hint + progress bar for every package scene (owner, 2026-11-19: visitors must see it scrolls). */
const HINT: Record<Lang, string> = { tr: 'Aşağı kaydırın, adım adım izleyin', en: 'Scroll down to watch it step by step', de: 'Nach unten scrollen und Schritt für Schritt ansehen', el: 'Κάντε κύλιση προς τα κάτω για να το δείτε βήμα βήμα' };
export function SceneHint({ lang, p }: { lang: Lang; p: number }) {
  return <>
    <div className={`psc-hint ${p < 0.04 ? 'is-on' : ''}`} aria-hidden={p >= 0.04}><span className="psc-mouse"><i /></span>{HINT[lang]}<b>↓</b></div>
    <div className="psc-prog" aria-hidden="true"><i style={{ transform: `scaleX(${p})` }} />{[0.25, 0.5, 0.75].map((m) => <span key={m} style={{ left: `${m * 100}%` }} className={p >= m ? 'is-on' : ''} />)}</div>
  </>;
}

const Status = () => <div className="bks-status"><span>09:41</span><span className="bks-notch" /><span>●●● ▮</span></div>;

/* ── CRM: the new lead's card moves New → Quote → Won ─────────────────────────────── */
export function CrmScene({ lang }: { lang: Lang }) {
  const t = PKG_SCENES[lang].crm;
  return <Shell id="crm" lang={lang} pane={(st) => (st === 1 || st === 2 ? 'side' : 'main')} render={(s) => {
    const col = s < 62 ? 0 : s < 85 ? 1 : 2;
    const card = s >= 12 && (
      <div key={`m${col}`} className={`psc-kcard is-lead ${col === 2 ? 'is-won' : ''}`}>
        <b>{t.who}</b><small>{t.job}</small>{col === 2 && <em>✓ {t.won}</em>}
      </div>);
    const main = (
      <div className="bks-cal psc-board">
        <div className="psc-board-h"><b>{t.board}</b><span className={`psc-toast ${s >= 8 && s < 34 ? 'is-on' : ''}`}>● {t.newLead}: {t.who} · {t.ask}</span></div>
        <div className="psc-cols">
          {t.cols.map((c, i) => (
            <div key={c} className="psc-col">
              <p className="psc-col-h">{c}<span>{1 + (col === i && s >= 12 ? 1 : 0)}</span></p>
              {col === i && card}
              <div className="psc-kcard"><b>{t.others[i][0]}</b><small>{t.others[i][1]}</small></div>
            </div>))}
        </div>
        <p className={`psc-stat ${s >= 90 ? 'is-on' : ''}`}>{t.stat}</p>
      </div>);
    const side = (
      <div className={`bks-cal psc-detail ${s >= 26 ? 'is-in' : ''}`}>
        <div className="bks-cal-h"><b>{t.who}</b><span>{t.job} · <i className="psc-pill">{t.cols[col]}</i></span></div>
        <dl className="ast-fields is-on">{t.detail.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <div className={`psc-rem ${s >= 52 ? 'is-on' : ''} ${s >= 64 ? 'is-done' : ''}`}><span>{s >= 64 ? '✓' : '⏰'}</span><div><b>{t.reminder}</b><small>{t.remTime}</small></div></div>
      </div>);
    return { main, side };
  }} />;
}

/* ── Website: search → fast site → services → contact form ─────────────────────────── */
export function WebsiteScene({ lang }: { lang: Lang }) {
  const t = PKG_SCENES[lang].web;
  return <Shell id="website" lang={lang} pane={(st) => (st === 3 ? 'side' : 'main')} render={(s, step) => {
    const typed = t.query.slice(0, Math.round(clamp((s - 2) / 12) * t.query.length));
    const screen = step === 0 ? (
      <div className="psc-scr" key="a">
        <div className="psc-search"><span>⌕</span><b>{typed}<i className="psc-caret" /></b></div>
        {s >= 14 && t.results.map(([h, d], i) => <div key={h} className={`psc-res ${i === 0 && s >= 18 ? 'is-hit' : ''}`}><b>{h}</b><small>{d}</small></div>)}
      </div>
    ) : step === 1 ? (
      <div className="psc-scr" key="b">
        <div className="psc-load"><i style={{ width: `${clamp((s - 25) / 8) * 100}%` }} /></div>
        <div className="psc-site-nav"><b>{t.site}</b><span>☰</span></div>
        <div className="psc-site-hero"><b>{t.hero}</b><span className="psc-site-btn">{t.cta}</span></div>
        {s >= 34 && <span className="psc-speed">⚡ {t.load}</span>}
      </div>
    ) : step === 2 ? (
      <div className="psc-scr" key="c">
        <div className="psc-site-nav"><b>{t.site}</b><span>☰</span></div>
        {t.services.map(([n, pr], i) => <div key={n} className="psc-svc" style={{ animationDelay: `${i * 80}ms` }}><span>{n}</span><b>{pr}</b></div>)}
        <div className="psc-map"><span>📍</span>{t.where}</div>
      </div>
    ) : (
      <div className="psc-scr" key="d">
        <div className="psc-site-nav"><b>{t.site}</b><span>☰</span></div>
        <p className="psc-form-t">{t.formTitle}</p>
        <div className="psc-field">{s >= 77 ? t.name : ''}</div>
        <div className="psc-field is-area">{s >= 80 ? t.msg : ''}</div>
        <span className={`psc-site-btn is-wide ${s >= 84 && s < 87 ? 'is-press' : ''}`}>{s >= 87 ? t.sent : t.send}</span>
      </div>
    );
    const main = <div className="bks-phone"><Status /><div className="psc-app">{screen}</div></div>;
    const side = (
      <div className="psc-side-col">
        <div className="bks-cal psc-checks">
          {[[t.search, step >= 0], [t.load, step >= 1], [t.services.map((x) => x[0]).join(' · '), step >= 2], [t.formTitle, step >= 3]].map(([l, on], i) =>
            <p key={i} className={`psc-check ${on ? 'is-on' : ''}`}><span>{on ? '✓' : '○'}</span>{l as string}</p>)}
        </div>
        <div className={`bks-cal psc-note ${s >= 88 ? 'is-in' : ''}`}><b>✉ {t.inbox}</b><p><strong>{t.who}:</strong> {t.msg}</p></div>
      </div>);
    return { main, side };
  }} />;
}

/* ── Invoices: offer fills itself → sent → paid ─────────────────────────────────────── */
export function InvoiceScene({ lang }: { lang: Lang }) {
  const t = PKG_SCENES[lang].inv;
  return <Shell id="invoices" lang={lang} pane={(st) => (st === 3 ? 'side' : 'main')} render={(s) => {
    const main = (
      <div className="psc-paper">
        <div className="psc-paper-h"><b>{s >= 52 ? t.invoice : s >= 26 ? t.offer : t.pick}</b><small>{t.date}</small></div>
        <div className="psc-paper-to"><span className={s >= 8 ? 'is-on' : ''}>{t.customer}</span><span className={s >= 14 ? 'is-on' : ''}>{t.service}</span></div>
        <div className="psc-lines">
          {t.lines.map(([n, v], i) => <div key={n} className={s >= 30 + i * 6 ? 'is-on' : ''}><span>{n}</span><b>{v}</b></div>)}
          <div className={`psc-total ${s >= 42 ? 'is-on' : ''}`}><span>{t.total} <small>{t.tax}</small></span><b>{t.totalVal}</b></div>
        </div>
        <span className={`psc-stamp ${s >= 58 ? 'is-on' : ''}`}>{t.sent}</span>
        <span className={`psc-stamp is-paid ${s >= 86 ? 'is-on' : ''}`}>{t.paid}</span>
      </div>);
    const side = (
      <div className="psc-side-col">
        <div className={`bks-cal psc-note ${s >= 60 ? 'is-in' : ''}`}><b>✉ {t.invoice}</b><p>{t.mailTo}</p></div>
        <div className="bks-cal">
          <div className="bks-cal-h"><b>{t.payments}</b></div>
          <div className="psc-pay"><span>{t.customer}</span><b>{t.totalVal}</b><i className={s >= 84 ? 'is-paid' : ''}>{s >= 84 ? t.paidLbl : t.open}</i></div>
          <div className="psc-pay is-old"><span>#2026-021</span><b>—</b><i className="is-paid">{t.paidLbl}</i></div>
        </div>
      </div>);
    return { main, side };
  }} />;
}

/* ── QR menu: scan → menu → current items → order on the bar screen ────────────────── */
function QrCode({ size = 92 }: { size?: number }) {
  const n = 21, cells: ReactNode[] = [];
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let on: boolean;
    if (finder(x, y)) { const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y; on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5); }
    else on = ((x * 7 + y * 13 + x * y) % 5) < 2;
    if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  }
  return <svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="psc-qr"><rect x="-1" y="-1" width={n + 2} height={n + 2} className="psc-qr-bg" />{cells}</svg>;
}
export function QrScene({ lang }: { lang: Lang }) {
  const t = PKG_SCENES[lang].qr;
  return <Shell id="qr" lang={lang} pane={() => 'main'} render={(s, step) => {
    const qty = s >= 64 ? 2 : s >= 60 ? 1 : 0;
    const screen = step === 0 ? (
      <div className="psc-scr psc-cam" key="a"><div className="psc-cam-box"><QrCode size={110} /><i className="psc-scan" /></div><p>{s >= 16 ? `✓ ${t.table}` : t.scan}</p></div>
    ) : (
      <div className="psc-scr" key="b">
        <div className="psc-site-nav"><b>{t.cafe}</b><small>{t.table}</small></div>
        <div className="psc-tabs">{t.tabs.map((x, i) => <span key={x} className={i === 2 ? 'is-on' : ''}>{x}</span>)}</div>
        {t.items.map(([n, pr, flag]) => (
          <div key={n} className={`psc-item ${flag === 'out' ? 'is-out' : ''} ${flag === 'fresh' && step >= 2 ? 'is-fresh' : ''}`}>
            <div><b>{n}</b><small>{flag === 'out' ? t.soldOut : flag === 'fresh' && step >= 2 ? t.fresh : ''}</small></div>
            <span>{pr}</span>{n === t.items[0][0] && <em>{qty ? `${qty}` : '+'}</em>}
          </div>))}
        {step === 3 && <div className="psc-cart"><span>{t.cart}: {t.ticket}</span><b className={s >= 80 && s < 84 ? 'is-press' : ''}>{s >= 84 ? t.ordered : t.order}</b></div>}
      </div>
    );
    const main = <div className="bks-phone"><Status /><div className="psc-app">{screen}</div></div>;
    const side = (
      <div className="psc-side-col">
        <div className="bks-cal psc-tent"><QrCode /><b>{t.table}</b><small>{t.scan}</small></div>
        <div className={`bks-cal psc-note ${s >= 86 ? 'is-in' : ''}`}><b>{t.bar}</b><p><strong>{t.table}</strong> · {t.ticket}</p></div>
      </div>);
    return { main, side };
  }} />;
}
