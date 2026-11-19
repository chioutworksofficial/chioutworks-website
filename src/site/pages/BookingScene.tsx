import { SceneHint } from './PackageScenes';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Lang } from '../../translations';
import { PACKAGE_TEXT } from '../i18n/packages';
import { BOOKING_SCENE } from '../i18n/bookingScene';

/**
 * Booking package scene (owner, 2026-11-19): instead of cable boxes, one realistic scene that plays as you scroll.
 * Left: the customer's phone with the booking page (past days greyed, Thursday fully booked, Friday with full and
 * free slots). The cursor first tries a full slot (tooltip), then picks a free one and confirms. Right: the owner's
 * calendar, where the new appointment drops in between existing ones; then a reminder reaches the phone, the
 * customer confirms, and on the day the appointment is marked as arrived. On phones the two panes take turns.
 * Reduced motion: final state, no sticky scroll.
 */
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
const FULL = new Set(['09:00', '09:30', '10:30', '11:30', '13:00', '14:00', '15:00', '16:30']);
const TRY = '14:00', PICK = '14:30';
const fmt = (lang: Lang, hm: string) => {
  if (lang !== 'en') return hm;
  const [h, m] = hm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};

export default function BookingScene({ lang }: { lang: Lang }) {
  const x = PACKAGE_TEXT.booking[lang];
  const t = BOOKING_SCENE[lang];
  const root = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStill(true); setP(1); return; }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = root.current; if (!el) return;
      const r = el.getBoundingClientRect();
      setP(clamp(-r.top / Math.max(1, r.height - window.innerHeight)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const s = p * 100;
  const step = s < 44 ? 0 : s < 62 ? 1 : s < 82 ? 2 : 3;
  const tryFull = s >= 13 && s < 25;            // cursor rests on a full slot, tooltip shows
  const picked = s >= 30;
  const pressing = s >= 38 && s < 44;
  const booked = s >= 44;
  const dropped = s >= 50;
  const notif = s >= 64;
  const tapYes = s >= 72 && s < 76;
  const confirmed = s >= 76;
  const arrived = s >= 86;
  const summary = s >= 90;
  const done = s >= 96;
  // where the cursor points (key of a data-cur element inside the phone), or null when hidden
  const target = s < 4 ? null : s < 24 ? 'try' : s < 36 ? 'pick' : s < 46 ? 'confirm' : s >= 66 && s < 78 ? 'yes' : null;

  const [cur, setCur] = useState<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const ph = phone.current; if (!ph || !target) { setCur(null); return; }
    const el = ph.querySelector<HTMLElement>(`[data-cur="${target}"]`); if (!el) return;
    const a = ph.getBoundingClientRect(), b = el.getBoundingClientRect();
    setCur({ x: b.left - a.left + b.width * 0.55, y: b.top - a.top + b.height * 0.6 });
  }, [target, notif]);

  const filled = FULL.size + (dropped ? 1 : 0);
  const cal = [
    { at: '13:00', len: 1, who: t.others[0], what: t.services[0] },
    { at: '14:00', len: 1, who: t.others[1], what: t.services[1] },
    { at: '15:00', len: 1, who: t.others[2], what: t.services[2] },
    { at: '16:30', len: 1, who: t.others[3], what: t.services[3] },
  ];
  const rowOf = (hm: string) => { const [h, m] = hm.split(':').map(Number); return (h - 13) * 2 + (m ? 1 : 0); };
  const ROW = 30;
  const newState = arrived ? t.arrived : confirmed ? t.confirmed : t.newB;

  return (
    <div ref={root} className={`bks ${still ? 'is-still' : ''}`} style={still ? undefined : { height: '340vh' }}>
      <div className="bks-sticky">
        {!still && <SceneHint lang={lang} p={p} />}
        <div className="bks-grid">
          {/* the scene */}
          <div className={`bks-stage show-${step === 1 || step === 3 ? 'cal' : 'phone'}`}>
            {/* customer phone */}
            <div ref={phone} className="bks-phone" aria-hidden="true">
              <div className="bks-status"><span>09:41</span><span className="bks-notch" /><span>●●● ▮</span></div>
              <div className="bks-app">
                <p className="bks-app-t">{t.title}</p>
                <p className="bks-app-sub">{t.service}</p>
                <div className="bks-days">
                  {t.days.map((d, i) => {
                    const date = 16 + i, past = i < 3, full = i === 3, sel = i === 4;
                    return (
                      <span key={d} className={`bks-day ${past ? 'is-past' : ''} ${full ? 'is-full' : ''} ${sel ? 'is-sel' : ''}`}>
                        <small>{d}</small><b>{date}</b>{full && <em>{t.full}</em>}{i === 3 && !full && <em>{t.today}</em>}
                      </span>
                    );
                  })}
                </div>
                <p className="bks-label">{t.dayLabel}</p>
                <div className="bks-slots">
                  {SLOTS.map((hm) => {
                    const full = FULL.has(hm), sel = picked && hm === PICK;
                    return (
                      <span key={hm} data-cur={hm === TRY ? 'try' : hm === PICK ? 'pick' : undefined}
                        className={`bks-slot ${full ? 'is-full' : ''} ${sel ? 'is-sel' : ''} ${full && hm === TRY && tryFull ? 'is-deny' : ''}`}>
                        {fmt(lang, hm)}{full && <small>{t.full}</small>}
                        {hm === TRY && <i className={`bks-tip ${tryFull ? 'is-on' : ''}`}>{t.fullTip}</i>}
                      </span>
                    );
                  })}
                </div>
                <span data-cur="confirm" className={`bks-btn ${picked ? 'is-ready' : ''} ${pressing ? 'is-press' : ''}`}>{picked ? `${t.confirm} · ${fmt(lang, PICK)}` : t.pick}</span>
              </div>
              <div className={`bks-toast ${booked && !notif ? 'is-on' : ''}`}><span>✓</span><div><b>{t.booked}</b><small>{t.dayLabel} · {fmt(lang, PICK)}</small></div></div>
              <div className={`bks-notif ${notif ? 'is-on' : ''}`}>
                <div className="bks-notif-h"><span className="bks-notif-ic">🔔</span><b>{t.reminderApp}</b><small>{t.now}</small></div>
                <p>{t.reminder(fmt(lang, PICK))}</p>
                {confirmed
                  ? <span className="bks-notif-ok">✓ {t.confirmed}</span>
                  : <div className="bks-notif-a"><span data-cur="yes" className={tapYes ? 'is-press' : ''}>{t.yes}</span><span>{t.later}</span></div>}
              </div>
              {cur && <span className="bks-cursor" style={{ transform: `translate(${cur.x}px, ${cur.y}px)` }}><svg width="20" height="20" viewBox="0 0 20 20"><path d="M3 2l13 7-6 1.5L7.5 17z" fill="var(--c-quartz)" stroke="var(--c-void)" strokeWidth="1.2" strokeLinejoin="round" /></svg>{(pressing || tapYes) && <i className="bks-ripple" />}</span>}
            </div>

            {/* owner calendar */}
            <div className="bks-cal" aria-hidden="true">
              <div className="bks-cal-h"><b>{t.cal}</b><span>{t.dayLabel}</span></div>
              <div className="bks-cal-body" style={{ height: ROW * 8 }}>
                {Array.from({ length: 8 }, (_, i) => <span key={i} className="bks-cal-row" style={{ top: i * ROW }}><small>{i % 2 ? '' : fmt(lang, `${13 + i / 2}:00`)}</small></span>)}
                {cal.map((c) => (
                  <span key={c.at} className="bks-ev" style={{ top: rowOf(c.at) * ROW + 2, height: c.len * ROW - 4 }}><b>{fmt(lang, c.at)}</b> {c.who} · {c.what}</span>
                ))}
                <span className={`bks-ev is-new ${dropped ? 'is-in' : ''} ${confirmed ? 'is-ok' : ''} ${arrived ? 'is-done' : ''}`} style={{ top: rowOf(PICK) * ROW + 2, height: ROW - 4 }}>
                  <b>{fmt(lang, PICK)}</b> {t.customer} · {t.services[3]}<em>{newState}</em>
                </span>
              </div>
              <div className={`bks-fill ${summary ? 'is-on' : ''}`}>
                <div><span style={{ width: `${(filled / SLOTS.length) * 100}%` }} /></div>
                <small>{filled} / {SLOTS.length} {t.fill}</small>
              </div>
            </div>
          </div>

          {/* steps */}
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
