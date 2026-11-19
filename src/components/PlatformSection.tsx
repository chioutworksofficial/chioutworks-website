import { T, type Lang } from '../translations';
import { useRevealGroup } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';

interface Props { lang: Lang; }

const icons = [
  <svg key="bolt" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  <svg key="users" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  <svg key="link" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  <svg key="monitor" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
];

function PlatformCard({ card, icon, index }: { card: { title: string; desc: string }; icon: React.ReactNode; index: number }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(6);
  return (
    <div
      className="reveal card tilt-card"
      style={{ '--stagger': index, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden' } as React.CSSProperties}
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div aria-hidden className="spotlight-glow" style={{ top: -60, right: -60, width: 160, height: 160, opacity: 0.6 }} />
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-lime-300)',
        color: '#1a1a1a',
        flexShrink: 0,
        position: 'relative', zIndex: 1,
        boxShadow: '0 8px 20px rgba(187,244,81,0.3)',
      }}>
        {icon}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: 16,
          letterSpacing: '-0.02em',
          color: 'var(--color-ink-strongest)',
          margin: '0 0 8px',
        }}>
          {card.title}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--color-ink-muted)', margin: 0 }}>
          {card.desc}
        </p>
      </div>
    </div>
  );
}

export default function PlatformSection({ lang }: Props) {
  const d = T[lang].platform;
  const sectionRef = useRevealGroup<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-24 px-6"
      style={{ background: '#fff', paddingTop: 16, position: 'relative', overflow: 'hidden' }}
    >
      {/* Concentric orbit rings — "systems in motion" behind the icon grid */}
      <div aria-hidden className="orbit-ring" style={{
        position: 'absolute', top: '32%', right: '-8%',
        width: 480, height: 480, borderRadius: '50%',
        border: '2px dashed rgba(187,244,81,0.65)',
        boxShadow: '0 0 60px rgba(187,244,81,0.15)',
        transformOrigin: 'center',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden className="orbit-ring-reverse" style={{
        position: 'absolute', top: '40%', right: '-2%',
        width: 320, height: 320, borderRadius: '50%',
        border: '1.5px dashed rgba(38,35,35,0.2)',
        transformOrigin: 'center',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="reveal mb-14">
          <p className="eyebrow mb-4" style={{ color: 'var(--color-feature-success)' }}>
            {d.eyebrow}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)',
              letterSpacing: '-0.04em', lineHeight: 1.1,
              color: 'var(--color-ink-strongest)', margin: 0, maxWidth: 500,
            }}>
              {d.title}
            </h2>
            <p style={{
              fontSize: 15, lineHeight: 1.65, maxWidth: 340,
              color: 'var(--color-ink-muted)', margin: 0,
            }}>
              {d.desc}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, perspective: 1400 }}>
          {d.cards.map((card, i) => (
            <PlatformCard key={i} card={card} icon={icons[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
