/**
 * Chioutworks lockup adapted to the Liquid palette without changing the logo's shapes:
 * the original CW monogram is split into its two parts (public/brand/mark-layer-green.png
 * and mark-layer-white.png, used as CSS masks). The former green stroke is painted with the
 * solid Frosted Lilac, the former white stroke with Quartz.
 * Wordmark is live text in the site font: CHIOUT (white, 500) + WORKS (aqua, 400).
 */
const RATIO = 552 / 364; // mark-layer-*.png aspect ratio

function layer(src: string, background: string): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    background,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  };
}

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <span aria-hidden="true" className="relative inline-block shrink-0" style={{ height: size, width: Math.round(size * RATIO) }}>
      <span style={layer('/brand/mark-layer-green.png', 'var(--c-lilac)')} />
      <span style={layer('/brand/mark-layer-white.png', 'var(--c-quartz)')} />
    </span>
  );
}

export default function Logo({ size = 30, stacked = false }: { size?: number; stacked?: boolean }) {
  return (
    <span className={stacked ? 'inline-flex flex-col items-center gap-3' : 'inline-flex items-center gap-3'} role="img" aria-label="Chioutworks">
      <LogoMark size={size} />
      <span aria-hidden="true" lang="en" style={{ fontSize: Math.round(size * (stacked ? 0.4 : 0.47)), letterSpacing: '0.16em', lineHeight: 1, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
        <span style={{ fontWeight: 500, color: 'var(--c-quartz)' }}>CHIOUT</span>
        <span style={{ fontWeight: 500, color: 'var(--c-lilac)' }}>WORKS</span>
      </span>
    </span>
  );
}
