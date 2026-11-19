import { SceneHint } from './PackageScenes';
import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../../translations';
import { PACKAGE_TEXT } from '../i18n/packages';
import { ASSISTANT_SCENE } from '../i18n/assistantScene';

/**
 * AI assistant package scene (owner, 2026-11-19), same scroll mechanics as BookingScene: a late-evening chat on a
 * salon's website (phone), the assistant looking up the salon's own info (highlighted row), the need and contact
 * collected, and a tidy summary e-mail in the owner's inbox. On phones the panes take turns. Reduced motion: final state.
 */
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export default function AssistantScene({ lang }: { lang: Lang }) {
  const x = PACKAGE_TEXT.assistant[lang];
  const t = ASSISTANT_SCENE[lang];
  const root = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStill(true); setP(1); return; }
    let raf = 0;
    const tick = () => { raf = 0; const el = root.current; if (!el) return; const r = el.getBoundingClientRect(); setP(clamp(-r.top / Math.max(1, r.height - window.innerHeight))); };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const s = p * 100;
  const step = s < 25 ? 0 : s < 45 ? 1 : s < 75 ? 2 : 3;
  // message i is visible from SHOW[i]; the assistant is "typing" during the window before each of its messages
  const SHOW = [6, 40, 50, 60, 66, 72];
  const shown = SHOW.filter((v) => s >= v).length;
  const typing = (s >= 14 && s < 40) || (s >= 55 && s < 60) || (s >= 68 && s < 72);
  const lookup = s >= 28;                 // knowledge row highlighted
  const mail = s >= 80, fields = s >= 84, done = s >= 96;

  useEffect(() => { const el = log.current; if (el) el.scrollTop = el.scrollHeight; }, [shown, typing]);

  const pane = step === 1 ? 'kb' : step === 3 ? 'mail' : 'phone';
  return (
    <div ref={root} className={`bks ${still ? 'is-still' : ''}`} style={still ? undefined : { height: '340vh' }}>
      <div className="bks-sticky">
        {!still && <SceneHint lang={lang} p={p} />}
        <div className="bks-grid">
          <div className={`bks-stage ast-stage show-${pane}`}>
            {/* visitor's phone: the website chat */}
            <div className="bks-phone ast-phone" aria-hidden="true">
              <div className="bks-status"><span>{t.time}</span><span className="bks-notch" /><span>●●● ▮</span></div>
              <div className="ast-app">
                <div className="ast-head"><span className="ast-av">✦</span><div><b>{t.site}</b><small><i className="ast-dot" />{t.online}</small></div></div>
                <div ref={log} className="ast-log">
                  {t.chat.slice(0, shown).map((m, i) => <p key={i} className={`ast-msg is-${m.from}`}>{m.t}</p>)}
                  {typing && <p className="ast-msg is-a ast-typing"><i /><i /><i /><span>{t.typing}</span></p>}
                </div>
                <div className="ast-input"><span>{t.placeholder}</span><b>➤</b></div>
              </div>
            </div>

            <div className="ast-side">
              {/* the business's own info, used for the answer */}
              <div className={`bks-cal ast-kb ${lookup ? 'is-look' : ''}`} aria-hidden="true">
                <div className="bks-cal-h"><b>{t.kbTitle}</b></div>
                {t.kb.map((row, i) => <p key={row} className={`ast-row ${i === 0 && lookup ? 'is-hit' : ''}`}>{row}</p>)}
              </div>
              {/* owner's inbox */}
              <div className={`bks-cal ast-mail ${mail ? 'is-in' : ''}`} aria-hidden="true">
                <div className="ast-mail-top"><b>{t.inbox}</b>{mail && <em>{t.newMail}</em>}</div>
                <div className="ast-mail-card">
                  <div className="ast-mail-h"><span className="ast-av is-sm">✦</span><div><b>{t.from}</b><small>{t.ago}</small></div></div>
                  <p className="ast-subj">{t.subject}</p>
                  <dl className={`ast-fields ${fields ? 'is-on' : ''}`}>
                    {t.fields.map(([k, v], i) => <div key={k} style={{ transitionDelay: `${i * 90}ms` }}><dt>{k}</dt><dd>{v}</dd></div>)}
                  </dl>
                </div>
              </div>
            </div>
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
