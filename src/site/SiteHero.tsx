import { useState } from 'react';
import type { Lang } from '../translations';
import { SITE_UI } from './i18n';
import VoiceOrb from './VoiceOrb';
import { useMode } from './ModeToggle';

/** Hero microphone → voice intake dialog (src/site/VoiceIntake.tsx) */
export const openVoice = () => window.dispatchEvent(new CustomEvent('cw:open-voice'));

export const openAssistant = (mic = false) =>
  window.dispatchEvent(new CustomEvent('cw:open-assistant', { detail: { mic } }));

/** Concentric guide radii in orb units (600 viewBox, main ring r=170) */

/** Hero (lialive layout): headline bottom-left · voice orb centre · "Chioutworks for" list right */
export default function SiteHero({ lang }: { lang: Lang }) {
  const ui = SITE_UI[lang];
  const items = ui.heroItems;
  const [touch, setTouch] = useState(false);
  const mode = useMode();   // the orb reads its colours once: re-mount it when light/dark changes

  return (
    <section id="hero" className="relative overflow-hidden flex flex-col lg:block lg:h-[100svh] lg:min-h-[760px] seam-fade-bottom"
      style={{ background: 'var(--glow-hero), var(--c-void)', ['--orb' as string]: 'min(80vw, 380px)' }}>
      <style>{'@media (min-width:1024px){#hero{--orb:min(61.7vh,555px)!important}.hero-rail{height:min(640px,70vh);overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(to bottom,transparent,#000 12%,#000 88%,transparent)}.hero-track{animation:lq-marquee-y 19s linear infinite}.hero-rail:hover .hero-track,.hero-rail:focus-within .hero-track,.hero-track[data-touch="1"]{animation-play-state:paused}}@media (max-width:1023px){.hero-rail{overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent)}.hero-track{width:max-content;gap:0!important;overflow:visible!important;scroll-snap-type:none!important;animation:cw-hero-x 38s linear infinite;will-change:transform}.hero-track>li{margin-right:28px}.hero-track[data-touch="1"]{animation-play-state:paused}}@keyframes cw-hero-x{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}@media (prefers-reduced-motion:reduce){.hero-track{animation:none!important}.hero-rail{overflow:auto}}'}</style>

      {/* Orb + guide rings: centred on the viewport on desktop, top of the stack on mobile */}
      <div className="relative self-center mt-28 lg:mt-0 lg:absolute lg:left-1/2 lg:top-[49%] lg:-translate-x-1/2 lg:-translate-y-1/2" style={{ width: 'var(--orb)', height: 'var(--orb)' }}>
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {[350, 560].map((r) => (
            <span key={r} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: r * 2, height: r * 2, transform: 'translate(-50%, -50%)', border: '1px solid var(--lq-line)', opacity: 0.6 }} />
          ))}
        </div>
        <VoiceOrb key={mode} label={ui.tapToTalk} onTalk={openVoice} />
      </div>

      {/* Left: headline + paragraph */}
      <div className="relative px-5 md:px-9 pt-6 pb-8 lg:p-0 lg:absolute lg:left-9 lg:top-1/2 lg:-translate-y-1/2">
        <h1 className="text-[clamp(34px,9vw,48px)] lg:text-[clamp(34px,3.6vw,54px)] lg:max-w-[400px]" style={{ fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', textTransform: 'uppercase' }}>{ui.heroTitle}</h1>
        <p className="mt-5 lg:mt-7 max-w-[360px] text-[13px]" style={{ lineHeight: 1.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--lq-mist)' }}>{ui.heroSub}</p>
      </div>

      {/* Right: industries (desktop column, mobile snap-scroll row) */}
      <div className="relative pb-16 lg:pb-0 lg:absolute lg:right-9 lg:top-[80px] lg:w-[300px]">
        <p className="px-5 md:px-9 lg:px-0 mb-4 lg:mb-6" style={{ fontSize: 20, fontWeight: 600, color: 'var(--lq-white)' }}>{ui.forLabel}</p>
        <div className="hero-rail" onTouchStart={() => setTouch(true)} onTouchEnd={() => setTouch(false)} onTouchCancel={() => setTouch(false)}>
          <ul className="hero-track flex lg:block gap-4 lg:gap-0 overflow-x-auto lg:overflow-visible snap-x snap-mandatory px-5 md:px-9 lg:px-0 [scrollbar-width:none]" data-touch={touch ? '1' : '0'}>
            {[...items, ...items].map((it, i) => (
              <li key={i} aria-hidden={i >= items.length ? true : undefined} className="snap-start shrink-0 w-[260px] lg:w-auto lg:pb-[54px]">
                <div className="pl-[18px] cursor-default" style={{ borderLeft: '1px solid var(--lq-line-strong)' }}>
                  <span className="block mb-2" style={{ fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--lq-white)' }}>{it.t}</span>
                  <span className="block line-clamp-2" style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--lq-silver)' }}>{it.d}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
