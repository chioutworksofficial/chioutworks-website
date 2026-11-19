import { useState } from 'react';
import { T, type Lang } from '../../translations';
import { fill } from '../../lib/demoAccess';
import QrImage from './QrImage';
import { copyText } from '../../lib/uid';

/** QR + WhatsApp + Telegram + copy link for the current demo page. All links are real. */
export default function SharePanel({ lang, name }: { lang: Lang; name: string }) {
  const s = T[lang].demos.share;
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = fill(s.text, { name });

  const copy = async () => {
    try {
      if (!(await copyText(url))) throw new Error('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const linkBtn = 'flex items-center justify-center gap-2 rounded-[6px] px-4 py-3 text-[13px] font-medium uppercase tracking-[0.12em]';

  return (
    <section className="rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center" style={{ background: 'var(--lq-kelp)', border: '1px solid var(--lq-line)' }}>
      <QrImage value={url} size={120} label={s.qr} />
      <div className="flex-1 w-full">
        <h3 className="text-lg tracking-[-0.02em] mb-1" style={{ color: 'var(--lq-white)' }}>{s.title}</h3>
        <div className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <a className="lq-btn-ghost lq-btn-block !px-4"
            href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noopener noreferrer">
            {s.whatsapp}
          </a>
          <a className={linkBtn} style={{ border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)' }}
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
            {s.telegram}
          </a>
          <button type="button" onClick={copy} className={linkBtn} style={{ border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)' }}>
            {copied ? s.copied : s.copy}
          </button>
        </div>
      </div>
    </section>
  );
}
