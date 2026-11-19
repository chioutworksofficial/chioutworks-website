import { T, type Lang } from '../translations';
import { useRevealGroup } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';

interface Props { lang: Lang; }

const tagColors = [
  { bg: '#dcfce7', text: '#166534' },
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#fef9c3', text: '#854d0e' },
];

const nums = ['01', '02', '03', '04'];

function ChapterCard({ ch, num, tag, index }: { ch: { title: string; desc: string; tag: string }; num: string; tag: { bg: string; text: string }; index: number }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);
  return (
    <div className="reveal" style={{ '--stagger': index } as React.CSSProperties}>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        className="tilt-card"
        style={{
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border-card)',
          borderRadius: 20,
          padding: 28,
          height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          minHeight: 260,
          cursor: 'pointer',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
          boxShadow: 'var(--shadow-card)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget;
          el.style.background = '#fff';
          el.style.boxShadow = 'var(--shadow-card-hover)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.background = 'var(--color-surface-raised)';
          el.style.boxShadow = 'var(--shadow-card)';
          onMouseLeave();
        }}
      >
        <div>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, fontWeight: 500,
            color: 'var(--color-ink-faint)',
            letterSpacing: '0.08em',
            display: 'block', marginBottom: 20,
          }}>
            {num}
          </span>
          <h3 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: 17,
            letterSpacing: '-0.03em', lineHeight: 1.25,
            color: 'var(--color-ink-strongest)',
            margin: '0 0 12px',
          }}>
            {ch.title}
          </h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-ink-muted)', margin: 0 }}>
            {ch.desc}
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          <span className="pill-tag" style={{ background: tag.bg, color: tag.text }}>
            {ch.tag}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ServicesGuide({ lang }: Props) {
  const d = T[lang].guide;
  const sectionRef = useRevealGroup<HTMLElement>(0.08);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6"
      style={{ background: 'var(--color-surface-darker)', borderTop: '1px solid var(--color-border-card)', position: 'relative', overflow: 'hidden' }}
    >
      <div aria-hidden className="blueprint-grid" />
      <div aria-hidden className="spotlight-glow" style={{ bottom: -120, left: '20%', width: 440, height: 440, opacity: 0.7 }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="reveal" style={{ marginBottom: 48 }}>
          <p className="eyebrow mb-4" style={{ color: 'var(--color-accent-brown)' }}>{d.eyebrow}</p>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 38px)',
            letterSpacing: '-0.04em', lineHeight: 1.1,
            color: 'var(--color-ink-strongest)', margin: 0, maxWidth: 480,
          }}>
            {d.title}
          </h2>
        </div>

        {/* Chapter grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, perspective: 1400 }}>
          {d.chapters.map((ch, i) => (
            <ChapterCard key={i} ch={ch} num={nums[i]} tag={tagColors[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
