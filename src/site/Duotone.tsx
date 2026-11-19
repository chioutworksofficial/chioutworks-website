/** Screenshot in original colours, slightly dimmed; bright with a soft glow on hover. `active` is controlled by the parent card. */
export default function Duotone({ src, alt, active, className = '', fit = 'object-left-top' }: { src: string; alt: string; active: boolean; className?: string; fit?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: 'var(--lq-deep)', outline: active ? '1px solid var(--lq-g2)' : '1px solid transparent', outlineOffset: '-1px' }}>
      <img src={src} alt={alt} loading="lazy" draggable={false}
        className={`w-full h-full object-cover ${fit}`}
        style={{ filter: active ? 'brightness(1.04) saturate(1.05)' : 'brightness(0.72) saturate(0.95)', transform: active ? 'scale(1.03)' : 'scale(1)', transformOrigin: 'top left', transition: 'filter .45s ease, transform .5s ease' }} />
      <span aria-hidden="true" className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--lq-g2) 22%, transparent), transparent 60%)', opacity: active ? 1 : 0, transition: 'opacity .45s ease', pointerEvents: 'none', mixBlendMode: 'screen' }} />
    </div>
  );
}
