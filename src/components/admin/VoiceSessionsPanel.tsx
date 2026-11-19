import { useCallback, useEffect, useState } from 'react';

const TOKEN_KEY = 'cw_admin_token';
const readToken = () => { try { return localStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; } };
const saveToken = (t: string) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } };
const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

interface Turn { role: 'user' | 'assistant'; text: string; at: number }
interface VoiceSession {
  id: string;
  createdAt: string;
  lang: string;
  turns: Turn[];
  contactSubmitted: boolean;
  contact?: { name?: string; email?: string; phone?: string; message?: string };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function VoiceSessionsPanel() {
  const [token, setToken] = useState(readToken);
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ chars: number; cap: number } | null>(null);

  const load = useCallback(async (t: string) => {
    setError(null);
    try {
      const r = await fetch('/api/admin/voice-sessions', { headers: { 'x-admin-token': t } });
      if (r.status === 503) { setError('Yönetici şifresi henüz ayarlanmamış. Kurulum için Claude\'a sorun.'); return; }
      if (r.status === 401) { clearToken(); setToken(''); setError('Şifre yanlış.'); return; }
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json() as { sessions: VoiceSession[] };
      setSessions(data.sessions);
      const u = await fetch('/api/admin/tts-usage', { headers: { 'x-admin-token': t } });
      if (u.ok) setUsage(await u.json() as { chars: number; cap: number });
    } catch {
      setError('Kayıtlar yüklenemedi.');
    }
  }, []);

  useEffect(() => { if (token) load(token); }, [token, load]);

  const card: React.CSSProperties = {
    background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)', borderRadius: 16,
  };

  if (!token) {
    return (
      <form
        className="flex flex-col gap-3" style={{ ...card, padding: 24, maxWidth: 420 }}
        onSubmit={(e) => { e.preventDefault(); saveToken(input.trim()); setToken(input.trim()); }}
      >
        <p className="font-bold" style={{ color: 'var(--color-ink-strongest)' }}>Yönetici şifresi</p>
        <input
          type="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Yönetici şifresi"
          aria-label="Yönetici şifresi"
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border-card)', background: 'transparent', color: 'var(--color-ink-strongest)' }}
        />
        <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>Bu bölümde ziyaretçilerin kişisel bilgileri var; bu yüzden şifre ister. Şifre bu tarayıcıda hatırlanır.</p>
        {error && <p className="text-xs" style={{ color: 'var(--color-ink-strongest)' }}>{error}</p>}
        <button type="submit" className="btn-lime" style={{ justifyContent: 'center' }}>Giriş</button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{sessions.length} görüşme</p>
        <button className="pill-tag" onClick={() => load(token)} style={{ cursor: 'pointer', border: '1px solid var(--color-border-card)' }}>Yenile</button>
        <button className="pill-tag" onClick={() => { clearToken(); setToken(''); }} style={{ cursor: 'pointer', border: '1px solid var(--color-border-card)' }}>Çıkış</button>
      </div>
      {usage && (
        <div style={{ ...card, padding: '10px 18px' }}>
          <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
            Bu ay doğal ses: {usage.chars.toLocaleString('tr-TR')} / {usage.cap.toLocaleString('tr-TR')} karakter
          </p>
          <div style={{ height: 6, borderRadius: 3, marginTop: 6, background: 'var(--color-border-card)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (usage.chars / usage.cap) * 100)}%`, background: 'var(--color-feature-success)' }} />
          </div>
        </div>
      )}
      {error && <p className="text-sm" style={{ color: 'var(--color-ink-strongest)' }}>{error}</p>}
      {!error && sessions.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Henüz sesli görüşme yok.</p>
      )}
      {sessions.map((s) => {
        const isOpen = open === s.id;
        return (
          <div key={s.id} style={card}>
            <button
              onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}
              className="w-full flex flex-wrap items-center gap-x-6 gap-y-1 text-left"
              style={{ padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-ink-strongest)' }}
            >
              <span className="font-semibold text-sm">{fmt(s.createdAt)}</span>
              <span className="text-xs uppercase" style={{ color: 'var(--color-ink-muted)' }}>{s.lang}</span>
              <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{s.turns.length} mesaj</span>
              <span className="text-xs font-semibold">{s.contactSubmitted ? 'Talebe dönüştü: Evet' : 'Talebe dönüştü: Hayır'}</span>
              {s.contact && <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{s.contact.name} · {s.contact.email}</span>}
            </button>
            {isOpen && (
              <div className="flex flex-col gap-2" style={{ padding: '4px 18px 18px' }}>
                {s.contact && (
                  <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                    {[s.contact.name, s.contact.email, s.contact.phone].filter(Boolean).join(' · ')}
                    {s.contact.message ? ` — ${s.contact.message}` : ''}
                  </p>
                )}
                {s.turns.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: t.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div
                      className="text-sm"
                      style={{
                        maxWidth: '78%', padding: '8px 12px', borderRadius: 14,
                        background: t.role === 'user' ? 'var(--color-lime-300)' : 'var(--color-surface-darker)',
                        color: t.role === 'user' ? 'var(--color-ink-strongest)' : 'var(--color-ink-strongest)',
                        border: '1px solid var(--color-border-card)',
                      }}
                    >
                      <span className="block text-[10px] opacity-60">
                        {t.role === 'user' ? 'Ziyaretçi' : 'Asistan'} · {new Date(t.at).toLocaleTimeString('tr-TR')}
                      </span>
                      {t.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
