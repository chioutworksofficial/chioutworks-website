import { LANGUAGES, LANG_HEADER } from '../data/sections';
import type { Lang } from '../translations';
import { useRevealGroup } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';

interface Props { lang: Lang; }

function LanguageCard({ l, index }: { l: { name: string; level: string; pct: number }; index: number }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(6);
  return (
    <div className="reveal" style={{ '--stagger': index } as React.CSSProperties}>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        className="rounded-2xl p-5 tilt-card"
        style={{
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border-card)',
          boxShadow: 'var(--shadow-card)',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface-raised)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; onMouseLeave(); }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-base" style={{ color: 'var(--color-ink-strongest)' }}>
            {l.name}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{
              background: l.pct === 100 ? 'var(--color-lime-200)' : 'var(--color-surface-darker)',
              color: l.pct === 100 ? '#1a3a00' : 'var(--color-ink-muted)',
            }}
          >
            {l.level}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--color-border-card)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${l.pct}%`,
              background: l.pct === 100 ? 'var(--color-feature-success)' : 'var(--color-lime-300)',
              boxShadow: l.pct === 100 ? '0 0 10px rgba(45,164,78,0.4)' : '0 0 10px rgba(187,244,81,0.4)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LanguagesSection({ lang }: Props) {
  const header = LANG_HEADER[lang];
  const langs = LANGUAGES[lang];
  const sectionRef = useRevealGroup<HTMLElement>(0.1);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6"
      style={{ background: 'var(--color-surface-darker)', borderTop: '1px solid var(--color-border-card)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Connection rings — languages spanning distances, slowly orbiting */}
      <div aria-hidden className="spotlight-glow" style={{ top: '-15%', right: '-10%', width: 380, height: 380, opacity: 0.55 }} />
      <div aria-hidden className="orbit-ring" style={{
        position: 'absolute', top: '-18%', right: '-8%',
        width: 360, height: 360, borderRadius: '50%',
        border: '2px dashed rgba(187,244,81,0.55)',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <span style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-lime-400)' }} />
      </div>
      <div aria-hidden className="orbit-ring-reverse" style={{
        position: 'absolute', top: '-8%', right: '2%',
        width: 220, height: 220, borderRadius: '50%',
        border: '1.5px dashed rgba(38,35,35,0.18)',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <span className="ping" style={{ position: 'absolute', bottom: 6, left: 10, width: 5, height: 5, borderRadius: '50%', background: 'var(--color-feature-success)' }} />
      </div>

      <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="reveal mb-12">
          <p
            className="text-xs tracking-[0.15em] uppercase font-medium mb-4"
            style={{ color: 'var(--color-accent-brown)' }}
          >
            {header.eyebrow}
          </p>
          <h2
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ color: 'var(--color-ink-strongest)' }}
          >
            {header.title}
          </h2>
        </div>

        {/* Language bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ perspective: 1400 }}>
          {langs.map((l, i) => (
            <LanguageCard key={i} l={l} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
