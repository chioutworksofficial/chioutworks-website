const TOOLS = [
  { name: 'React',       color: '#61dafb' },
  { name: 'TypeScript',  color: '#3178c6' },
  { name: 'n8n',         color: '#ea4b71' },
  { name: 'Make.com',    color: '#6d00cc' },
  { name: 'Claude AI',   color: '#cc785c' },
  { name: 'Supabase',    color: '#3ecf8e' },
  { name: 'Vercel',      color: '#000000' },
  { name: 'Node.js',     color: '#68a063' },
  { name: 'Vite',        color: '#646cff' },
  { name: 'Tailwind',    color: '#06b6d4' },
  { name: 'OpenAI',      color: '#10a37f' },
  { name: 'Zapier',      color: '#ff4a00' },
  { name: 'Shopify',     color: '#96bf48' },
  { name: 'PostgreSQL',  color: '#336791' },
  { name: 'Docker',      color: '#2496ed' },
  { name: 'Stripe',      color: '#635bff' },
];

// Duplicate for seamless loop
const ITEMS = [...TOOLS, ...TOOLS];

export default function TechMarquee() {
  return (
    <div style={{
      background: 'var(--color-surface-darker)',
      borderTop: '1px solid var(--color-border-card)',
      borderBottom: '1px solid var(--color-border-card)',
      padding: '14px 0',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Left fade */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 80,
        background: 'linear-gradient(to right, var(--color-surface-darker), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      {/* Right fade */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
        background: 'linear-gradient(to left, var(--color-surface-darker), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div className="marquee-track">
        {ITEMS.map((tool, i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 18px',
              marginRight: 6,
              borderRadius: 9999,
              border: '1px solid var(--color-border-card)',
              background: 'var(--color-surface-raised)',
              whiteSpace: 'nowrap',
              cursor: 'default',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-lime-300)';
              e.currentTarget.style.background = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border-card)';
              e.currentTarget.style.background = 'var(--color-surface-raised)';
            }}
          >
            {/* Color dot */}
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: tool.color, flexShrink: 0,
              opacity: 0.85,
            }} />
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12.5, fontWeight: 600,
              color: 'var(--color-ink-muted)',
              letterSpacing: '-0.01em',
            }}>
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
