import { useEffect, useState } from 'react';
import type { Lang } from '../translations';
import { VOICE_UI } from './i18n/voice';
import { CONTACT_PAGE_UI } from './i18n/contactPage';
import { clearVoiceSession, type VoiceTurn } from '../lib/voiceSession';

/** Read-only transcript of a saved voice session (id+secret is the capability). */
export default function VoiceTranscriptModal({ lang, id, secret, onClose, onDeleted }: { lang: Lang; id: string; secret: string; onClose: () => void; onDeleted?: () => void }) {
  const t = VOICE_UI[lang];
  const u = CONTACT_PAGE_UI[lang];
  const [turns, setTurns] = useState<VoiceTurn[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [delFailed, setDelFailed] = useState(false);

  const del = async () => {
    try {
      const r = await fetch(`/api/voice/session/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-voice-secret': secret } });
      if (!r.ok && r.status !== 404) { setDelFailed(true); return; }
    } catch { setDelFailed(true); return; }
    clearVoiceSession(); onDeleted?.(); onClose();
  };

  useEffect(() => {
    fetch(`/api/voice/session/${encodeURIComponent(id)}`, { headers: { 'x-voice-secret': secret } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { turns: VoiceTurn[] }) => setTurns(j.turns))
      .catch(() => setFailed(true));
  }, [id, secret]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" data-lenis-prevent aria-label={u.voiceTitle} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'color-mix(in srgb, var(--lq-abyss) 85%, transparent)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="lq-card"
        style={{ width: '100%', maxWidth: 560, maxHeight: '80vh', overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--lq-abyss)', color: 'var(--lq-white)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{u.voiceTitle}</strong>
          <button type="button" onClick={onClose} style={{ cursor: 'pointer', color: 'var(--lq-silver)' }}>{u.voiceClose} ✕</button>
        </div>
        {failed && <p style={{ color: 'var(--lq-silver)' }}>{u.voiceError}</p>}
        {turns?.map((x, i) => (
          <div key={i} style={{ alignSelf: x.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ fontSize: 11, color: 'var(--lq-silver)', textAlign: x.role === 'user' ? 'right' : 'left' }}>
              {x.role === 'user' ? t.you : t.assistant} · {new Date(x.at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ padding: '8px 12px', borderRadius: 'var(--lq-radius-card)', border: '1px solid var(--lq-line)', background: x.role === 'user' ? 'var(--lq-kelp)' : 'transparent', lineHeight: 1.5 }}>{x.text}</div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 14, marginTop: 6 }}>
          {!confirm ? (
            <button type="button" onClick={() => setConfirm(true)} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--lq-silver)' }}>{t.deleteBtn}</button>
          ) : (
            <>
              <span role="alert">{t.deleteConfirm}</span>
              <button type="button" onClick={del} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{t.deleteYes}</button>
              <button type="button" onClick={() => setConfirm(false)} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--lq-silver)' }}>{t.deleteNo}</button>
            </>
          )}
          {delFailed && <span role="status" style={{ color: 'var(--lq-silver)' }}>{t.deleteFail}</span>}
        </div>
      </div>
    </div>
  );
}
