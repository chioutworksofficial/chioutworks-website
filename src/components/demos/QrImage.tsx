import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Lang } from '../../translations';
import { QR_UI } from './i18n/qr';

const LANGS: Lang[] = ['en', 'de', 'tr', 'el'];
const pageLang = (): Lang => {
  const l = (typeof document !== 'undefined' ? document.documentElement.lang : 'en') as Lang;
  return LANGS.includes(l) ? l : 'en';
};

/**
 * Demo-only QR code. It is deliberately NOT scannable: generated with the lowest
 * error correction and covered by a "SAMPLE" stamp, plus a visible note below,
 * so visitors don't try to scan it. Real QR codes are delivered per customer project.
 */
export default function QrImage({ value, size = 160, label }: { value: string; size?: number; label: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const q = QR_UI[pageLang()];

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, { width: size * 2, margin: 1, errorCorrectionLevel: 'L', color: { dark: '#262323', light: '#ffffff' } })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null));
    return () => { alive = false; };
  }, [value, size]);

  return (
    <figure className="inline-flex flex-col items-center gap-1.5 m-0" style={{ maxWidth: Math.max(size + 16, 140) }}>
      <div className="relative rounded-xl p-2" style={{ background: 'var(--lq-mist)', border: '1px solid var(--lq-line-strong)' }}>
        {src
          ? <img src={src} width={size} height={size} alt={`${label} — ${q.note}`} style={{ opacity: 0.55, filter: 'grayscale(1)' }} />
          : <div style={{ width: size, height: size, background: 'var(--lq-deep)' }} aria-label={label} />}
        <span aria-hidden="true"
          className="absolute left-1/2 top-1/2 font-medium tracking-[0.18em] rounded-md whitespace-nowrap"
          style={{
            transform: 'translate(-50%, -50%) rotate(-14deg)',
            background: 'var(--lq-abyss)',
            color: 'var(--lq-g2)',
            fontSize: Math.max(11, Math.round(size / 8)),
            padding: `${Math.round(size / 22)}px ${Math.round(size / 10)}px`,
                      }}>
          {q.stamp}
        </span>
      </div>
      <figcaption className="text-[11px] leading-snug text-center" style={{ color: 'var(--lq-silver)' }}>
        {q.note}
      </figcaption>
    </figure>
  );
}
