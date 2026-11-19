import { useEffect, useState, type ReactNode } from 'react';
import type { Lang } from '../../translations';
import { MESSAGING_UI } from './i18n/messaging';

// Demo pages must never open WhatsApp/Telegram. Any click on such a link inside
// this wrapper is cancelled and the message is shown as a preview instead.
const PATTERN = /(^|\/\/)(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|t\.me|telegram\.me)\b/i;

function extractText(href: string): string {
  try {
    const u = new URL(href);
    return u.searchParams.get('text') || u.searchParams.get('url') || '';
  } catch {
    return '';
  }
}

export default function MessageGuard({ lang, children }: { lang: Lang; children: ReactNode }) {
  const m = MESSAGING_UI[lang];
  const [preview, setPreview] = useState<{ channel: 'whatsapp' | 'telegram'; text: string } | null>(null);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreview(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const onClickCapture = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a');
    const href = a?.getAttribute('href') || '';
    if (!a || !PATTERN.test(href)) return;
    e.preventDefault();
    e.stopPropagation();
    setPreview({ channel: /t(elegram)?\.me/i.test(href) ? 'telegram' : 'whatsapp', text: extractText(href) });
  };

  return (
    <div onClickCapture={onClickCapture}>
      {children}
      {preview && (
        <div role="dialog" aria-modal="true" aria-labelledby="msg-guard-title"
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4"
          style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(4px)' }}
          onMouseDown={(e) => e.target === e.currentTarget && setPreview(null)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)' }}>
            <p id="msg-guard-title" className="text-base font-bold mb-1" style={{ color: 'var(--color-ink-strongest)' }}>{m.title}</p>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--color-ink-muted)' }}>{m.body}</p>
            <div className="rounded-2xl p-3 mb-5" style={{ background: 'var(--background)', border: '1px solid var(--color-border-card)' }}>
              <p className="text-[11px] font-bold mb-2" style={{ color: 'var(--color-ink-muted)' }}>{m.channels[preview.channel]}</p>
              <p className="text-sm leading-relaxed rounded-2xl rounded-tl-sm px-3 py-2 whitespace-pre-line"
                style={{ background: 'var(--color-lime-soft)', color: 'var(--color-ink-strongest)' }}>
                {preview.text || '…'}
              </p>
            </div>
            <button type="button" onClick={() => setPreview(null)} className="w-full rounded-xl py-3 text-sm font-bold"
              style={{ background: 'var(--color-lime-300)', color: 'var(--color-ink-strongest)' }}>
              {m.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
