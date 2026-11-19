import { scrollToTarget } from '../lib/smoothScroll';
/** Shared page hero: soft gradient glows (no blurred boxes, so no visible edges), giant word bottom-left, intro + outline pill bottom-right. */
const glows = [
  'radial-gradient(ellipse 55% 75% at 14% 0%, color-mix(in srgb, var(--c-signal) 34%, transparent), transparent 70%)',
  'radial-gradient(ellipse 45% 70% at 86% 6%, color-mix(in srgb, var(--c-lilac) 22%, transparent), transparent 72%)',
  'radial-gradient(ellipse 60% 55% at 38% 78%, color-mix(in srgb, var(--c-pulse) 30%, transparent), transparent 72%)',
].join(',');

export default function PageHero({ word, intro, explore, targetId }: { word: string; intro: string; explore: string; targetId: string }) {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: 450 }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: glows, WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)' }} />
      <div className="relative mx-auto px-5 md:px-9 flex flex-col md:flex-row md:items-end md:justify-between gap-8 pt-28 pb-8" style={{ maxWidth: 1600, minHeight: 450 }}>
        <h1 className="select-none" style={{ marginTop: 'auto', lineHeight: 0.85 }}><span className="page-hero-title" style={{ fontSize: 'clamp(84px, 10vw, 144px)', fontWeight: 800, color: 'var(--lq-silver)', letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}>{word}</span></h1>
        <div style={{ maxWidth: 270 }}>
          <p style={{ fontSize: 14.4, lineHeight: '25.2px', color: 'var(--lq-mist)', marginBottom: 22 }}>{intro}</p>
          <button
            type="button"
            onClick={() => scrollToTarget(targetId)}
            className="inline-flex items-center gap-2"
            style={{ padding: '9.6px 22.4px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid var(--c-hairline)', borderRadius: 999, color: 'var(--lq-white)', background: 'var(--c-deep-sea)' }}
          >
            {explore}
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
