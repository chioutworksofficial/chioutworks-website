import { useEffect, useRef, useState } from 'react';
import { lqCard } from './lqCard';

type Item = { q: string; a: string };

const P = 'M112 62 C 160 6, 214 40, 249 108';

/** Decorative 3D hint: floating answer sheets + dashed guide to the + button. */
function FaqHint({ i, open }: { i: number; open: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const card = el?.parentElement;
    if (!el || !card) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('on', e.isIntersecting), { threshold: 0.1 });
    io.observe(card);
    // keep the hint out of the question text: shrink the stack, then drop the whole hint when space is tight
    const h3 = card.querySelector('h3') as HTMLElement | null;
    const measure = () => {
      if (!h3) return;
      const gap = card.clientHeight - 24 - 140 - (h3.offsetTop + h3.offsetHeight);
      el.classList.toggle('tight', gap < 40);
      el.classList.toggle('none', gap < -24);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    measure();
    let off = () => {};
    if (window.matchMedia('(prefers-reduced-motion:no-preference)').matches) {   // mouse hover on desktop, finger press on phones
      const mv = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        el.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width) * 2 - 1) * 8}deg`);
        el.style.setProperty('--rx', `${-(((e.clientY - r.top) / r.height) * 2 - 1) * 8}deg`);
      };
      const lv = () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
      card.addEventListener('pointermove', mv);
      card.addEventListener('pointerleave', lv);
      card.addEventListener('pointerup', lv);
      card.addEventListener('pointercancel', lv);
      off = () => { card.removeEventListener('pointermove', mv); card.removeEventListener('pointerleave', lv); card.removeEventListener('pointerup', lv); card.removeEventListener('pointercancel', lv); };
    }
    return () => { io.disconnect(); ro.disconnect(); off(); };
  }, []);
  const ph = { ['--ph' as string]: `${-((i * 1.7) % 6)}s`, ['--dur' as string]: `${6.5 + (i % 3) * 0.7}s` } as React.CSSProperties;
  return (
    <div ref={ref} className={`faq-hint${open ? ' shut' : ''}`} aria-hidden="true" style={ph}>
      <svg className="faq-path" width="280" height="140" viewBox="0 0 280 140" fill="none">
        <path d={P} stroke="var(--c-hairline,#24375a)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
        <path d="M249.3 97.7 L249 108 L240.4 102.3" stroke="var(--c-lilac,#85a6e9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
      </svg>
      <div className="faq-dot" style={{ offsetPath: `path('${P}')` }} />
      <div className="faq-ring" />
      <div className="faq-scene">
        <div className="faq-tilt">
          <div className="faq-stack">
            {[0, 1, 2].map((k) => (
              <div key={k} className={`faq-sheet s${k}`}>
                <i style={{ width: '58%' }} /><i /><i style={{ width: '76%' }} /><i style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const hintCss = `
.faq-hint{position:absolute;right:24px;bottom:24px;width:280px;height:140px;pointer-events:none;transition:opacity .35s ease,transform .45s ease;transform-origin:85% 85%}
.faq-hint.shut,.faq-hint.none{opacity:0;transform:scale(.85)}
.faq-hint.tight .faq-scene{display:none}
.faq-hint>*{position:absolute;left:0;top:0}
.faq-scene{width:130px;height:100px;left:6px;top:14px;perspective:520px}
.faq-tilt{width:100%;height:100%;transform-style:preserve-3d;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .4s ease}
.faq-stack{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(56deg) rotateZ(-30deg);animation:faqFloat var(--dur) ease-in-out var(--ph) infinite paused}
.faq-sheet{position:absolute;left:18px;top:6px;width:84px;height:64px;border-radius:12px;border:1px solid var(--c-hairline,#24375a);padding:12px 11px;display:flex;flex-direction:column;gap:7px;background:linear-gradient(145deg,color-mix(in srgb,var(--c-cobalt,#12244f) 85%,transparent),color-mix(in srgb,var(--c-deep-sea,#0d172b) 70%,transparent));backface-visibility:hidden}
.faq-sheet i{display:block;height:4px;width:100%;border-radius:4px;background:var(--c-ash,#abaebb);opacity:.28;filter:blur(1.2px)}
.faq-sheet.s0{transform:translateZ(0);opacity:.55}
.faq-sheet.s1{transform:translateZ(16px);opacity:.8;animation:faqLift var(--dur) ease-in-out var(--ph) infinite paused}
.faq-sheet.s2{transform:translateZ(32px);border-color:var(--c-signal,#2862d7);animation:faqLift2 var(--dur) ease-in-out var(--ph) infinite paused}
.faq-sheet.s2 i:first-child{background:var(--c-lilac,#85a6e9);opacity:.6}
.faq-path{overflow:visible}
.faq-dot{width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:var(--c-quartz,#fff);offset-rotate:0deg;offset-distance:0%;animation:faqTravel 3.2s cubic-bezier(.45,0,.4,1) var(--ph) infinite paused;filter:blur(.3px)}
.faq-ring{left:244px;top:104px;width:36px;height:36px;border-radius:50%;border:1.5px solid var(--c-lilac,#85a6e9);opacity:0;animation:faqRing 3.2s ease-out var(--ph) infinite paused}
.faq-hint.on .faq-stack,.faq-hint.on .faq-sheet,.faq-hint.on .faq-dot,.faq-hint.on .faq-ring{animation-play-state:running}
.faq-card:hover .faq-dot,.faq-card:hover .faq-ring{animation-duration:1.7s}
@keyframes faqFloat{0%,100%{transform:rotateX(56deg) rotateZ(-30deg) translateZ(0)}50%{transform:rotateX(52deg) rotateZ(-24deg) translateZ(8px)}}
@keyframes faqLift{0%,100%{transform:translateZ(14px)}50%{transform:translateZ(22px)}}
@keyframes faqLift2{0%,100%{transform:translateZ(28px)}50%{transform:translateZ(42px)}}
@keyframes faqTravel{0%{offset-distance:0%;opacity:0}12%{opacity:1}85%{opacity:1}100%{offset-distance:100%;opacity:0}}
@keyframes faqRing{0%,70%{transform:scale(.9);opacity:0}78%{opacity:.7}100%{transform:scale(1.9);opacity:0}}
@media (max-width:767px){.faq-hint{transform:scale(.8);right:16px;bottom:18px}.faq-hint.shut{transform:scale(.7)}}
@media (prefers-reduced-motion:reduce){.faq-hint *{animation:none!important}.faq-dot{offset-distance:62%}.faq-ring{opacity:.35}}
`;

/** Shared FAQ card grid: rows alternate 3 equal columns, then 65/35. One card open at a time. */
export default function FaqCards({ items, id }: { items: readonly Item[]; id: string }) {
  const [open, setOpen] = useState(-1);
  const rows: { start: number; items: readonly Item[]; wide: boolean }[] = [];
  for (let i = 0, r = 0; i < items.length; r++) {
    const n = r % 2 === 0 ? 3 : 2;
    rows.push({ start: i, items: items.slice(i, i + n), wide: n === 2 });
    i += n;
  }
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div key={row.start} className={`grid grid-cols-1 gap-4 items-start ${row.wide && row.items.length === 2 ? 'lg:grid-cols-[13fr_7fr]' : 'lg:grid-cols-3'}`}>
          {row.items.map((it, j) => {
            const i = row.start + j;
            const isOpen = open === i;
            return (
              <div
                key={it.q}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={`${lqCard(i)} faq-card relative flex flex-col cursor-pointer`}
                style={{ minHeight: 380, padding: 32 }}
              >
                <span style={{ fontFamily: 'var(--lq-mono)', fontSize: 11, color: 'var(--c-lilac)' }}>{String(i + 1).padStart(2, '0')}.</span>
                <h3 className="mt-5" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.4, color: 'var(--lq-mist)', maxWidth: 420 }}>{it.q}</h3>
                <div id={`${id}-a-${i}`} role="region" aria-labelledby={`${id}-q-${i}`} style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0, transform: isOpen ? 'none' : 'translateY(8px)', transition: 'grid-template-rows .4s ease, opacity .4s ease, transform .4s ease' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p className="pt-5 pb-14" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--lq-silver)' }}>{it.a}</p>
                  </div>
                </div>
                <FaqHint i={i} open={isOpen} />
                <button
                  type="button"
                  id={`${id}-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${id}-a-${i}`}
                  aria-label={it.q}
                  onClick={(e) => { e.stopPropagation(); setOpen(isOpen ? -1 : i); }}
                  className="absolute flex items-center justify-center faq-plus"
                  style={{ right: 24, bottom: 24, width: 36, height: 36, borderRadius: 999, border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-silver)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ transition: 'transform .35s ease', transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ))}
      <style>{`.faq-plus:focus-visible{outline:2px solid var(--lq-g2);outline-offset:3px}${hintCss}`}</style>
    </div>
  );
}
