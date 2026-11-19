import { T, type Lang } from '../translations';
import { useRevealGroup } from '../hooks/useReveal';

interface Props { lang: Lang; }

const sizes = ['text-xl', 'text-2xl', 'text-base', 'text-3xl', 'text-lg', 'text-xl', 'text-2xl', 'text-base', 'text-xl', 'text-3xl', 'text-lg', 'text-2xl', 'text-xl', 'text-base'];
const weights = ['font-normal', 'font-semibold', 'font-light', 'font-bold', 'font-medium', 'font-semibold', 'font-normal', 'font-medium', 'font-bold', 'font-normal', 'font-semibold', 'font-light', 'font-medium', 'font-semibold'];
const opacities = [0.8, 1, 0.55, 1, 0.7, 0.88, 0.6, 0.78, 1, 0.65, 0.82, 0.55, 0.88, 0.72];

export default function UseCases({ lang }: Props) {
  const d = T[lang].usecases;
  const sectionRef = useRevealGroup<HTMLElement>(0.1);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6"
      style={{ borderTop: '1px solid var(--color-border-card)', background: 'var(--color-surface-darker)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Dot grid background */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(38,35,35,0.1) 1.2px, transparent 1.2px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Lime spotlight, drifting slowly like a stage light */}
      <div aria-hidden className="spotlight-glow blob-1" style={{ top: -80, right: -80, width: 400, height: 400 }} />
      <div aria-hidden className="spotlight-glow blob-2" style={{ bottom: -100, left: -100, width: 360, height: 360, opacity: 0.75 }} />
      <div aria-hidden className="spotlight-glow blob-3" style={{ top: '40%', left: '45%', width: 280, height: 280, opacity: 0.45 }} />
      {/* Orbit rings — the word cloud sits inside a slowly turning system */}
      <div aria-hidden className="orbit-ring" style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 620, height: 620, marginTop: -310, marginLeft: -310,
        borderRadius: '50%', border: '2px dashed rgba(187,244,81,0.4)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden className="orbit-ring-reverse" style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 460, height: 460, marginTop: -230, marginLeft: -230,
        borderRadius: '50%', border: '1.5px dashed rgba(38,35,35,0.16)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="reveal" style={{ marginBottom: 56, textAlign: 'center' }}>
          <p className="eyebrow mb-4" style={{ color: 'var(--color-feature-success)' }}>
            {d.eyebrow}
          </p>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 38px)',
            letterSpacing: '-0.04em', lineHeight: 1.1,
            color: 'var(--color-ink-strongest)', margin: 0,
          }}>
            {d.title}
          </h2>
        </div>

        <div className="reveal" style={{ '--stagger': 1 } as React.CSSProperties}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            alignItems: 'baseline', gap: '12px 20px', maxWidth: 800, margin: '0 auto',
          }}>
            {d.tags.map((tag, i) => (
              <span
                key={i}
                className={`${sizes[i % sizes.length]} ${weights[i % weights.length]}`}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: 'var(--color-ink-strongest)',
                  opacity: opacities[i % opacities.length],
                  cursor: 'default',
                  letterSpacing: '-0.02em',
                  display: 'inline-block',
                  transition: 'opacity 0.2s ease, color 0.2s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.color = 'var(--color-lime-400)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = String(opacities[i % opacities.length]);
                  e.currentTarget.style.color = 'var(--color-ink-strongest)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
