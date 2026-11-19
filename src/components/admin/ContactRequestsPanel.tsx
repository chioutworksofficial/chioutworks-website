import { useCallback, useEffect, useState } from 'react';

const TOKEN_KEY = 'cw_admin_token';
const readToken = () => { try { return localStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; } };
const saveToken = (t: string) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } };
const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

interface Req {
  id: string; createdAt: string; kind?: string; name?: string; email?: string; phone?: string; address?: string;
  business?: string; message?: string; lang?: string; page?: string; demo?: string; modules?: string[];
  voiceSessionId?: string; replyPreference?: 'written' | 'phone'; preferredStart?: string; callTime?: string; topic?: string;
}

const KIND: Record<string, string> = { contact: 'İletişim formu', quote: 'Teklif talebi', 'demo-request': 'Demo talebi' };
const TOPIC: Record<string, string> = { 'res-qr': 'Kaynak: QR kod', 'res-review': 'Kaynak: Google yorum', 'res-messages': 'Kaynak: Mesaj şablonları', 'res-legal': 'Kaynak: Yasal kontrol' };
const fmt = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function ContactRequestsPanel() {
  const [token, setToken] = useState(readToken);
  const [input, setInput] = useState('');
  const [items, setItems] = useState<Req[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [voiceOpen, setVoiceOpen] = useState<string | null>(null);
  const [voiceTurns, setVoiceTurns] = useState<{ role: string; text: string; at: number }[] | null>(null);

  const showVoice = async (id: string) => {
    if (voiceOpen === id) { setVoiceOpen(null); return; }
    setVoiceOpen(id); setVoiceTurns(null);
    try {
      const r = await fetch('/api/admin/voice-sessions', { headers: { 'x-admin-token': token } });
      const j = await r.json() as { sessions: { id: string; turns: { role: string; text: string; at: number }[] }[] };
      setVoiceTurns(j.sessions.find((x) => x.id === id)?.turns ?? []);
    } catch { setVoiceTurns([]); }
  };

  const load = useCallback(async (t: string) => {
    setError(null);
    try {
      const r = await fetch('/api/admin/quote-requests', { headers: { 'x-admin-token': t } });
      if (r.status === 503) { setError('Yönetici şifresi henüz ayarlanmamış. Kurulum için Claude\'a sorun.'); return; }
      if (r.status === 401) { clearToken(); setToken(''); setError('Şifre yanlış.'); return; }
      if (!r.ok) throw new Error(String(r.status));
      setItems(((await r.json()) as { requests: Req[] }).requests);
    } catch {
      setError('Kayıtlar yüklenemedi.');
    }
  }, []);

  useEffect(() => { if (token) load(token); }, [token, load]);

  const card: React.CSSProperties = { background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-card)', borderRadius: 16 };

  if (!token) {
    return (
      <form
        className="flex flex-col gap-3" style={{ ...card, padding: 24, maxWidth: 420 }}
        onSubmit={(e) => { e.preventDefault(); saveToken(input.trim()); setToken(input.trim()); }}
      >
        <p className="font-bold" style={{ color: 'var(--color-ink-strongest)' }}>Yönetici şifresi</p>
        <input
          type="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Yönetici şifresi" aria-label="Yönetici şifresi"
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
        <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>{items.length} talep</p>
        <button className="pill-tag" onClick={() => load(token)} style={{ cursor: 'pointer', border: '1px solid var(--color-border-card)' }}>Yenile</button>
        <button className="pill-tag" onClick={() => { clearToken(); setToken(''); }} style={{ cursor: 'pointer', border: '1px solid var(--color-border-card)' }}>Çıkış</button>
      </div>
      {error && <p className="text-sm" style={{ color: 'var(--color-ink-strongest)' }}>{error}</p>}
      {!error && items.length === 0 && <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Henüz talep yok.</p>}
      {items.map((r) => (
        <div key={r.id} className="flex flex-col gap-1" style={{ ...card, padding: '14px 18px', color: 'var(--color-ink-strongest)' }}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-sm">{KIND[r.kind ?? 'quote'] ?? r.kind}</span>
            <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{fmt(r.createdAt)}</span>
            {r.lang && <span className="text-xs uppercase" style={{ color: 'var(--color-ink-muted)' }}>{r.lang}</span>}
            {r.topic && TOPIC[r.topic] && <span className="pill-tag" style={{ border: '1px solid var(--color-border-card)' }}>{TOPIC[r.topic]}</span>}
            {r.kind === 'contact' && (
              <span className="text-xs font-semibold">{r.replyPreference === 'phone' ? 'Gerekirse telefon' : 'Yazılı cevap'}</span>
            )}
          </div>
          <p className="text-sm">{[r.name, r.business, r.email, r.phone, r.address].filter(Boolean).join(' · ')}</p>
          {(r.preferredStart || r.callTime) && (
            <p className="text-xs font-semibold">{[r.preferredStart && `Başlangıç tarihi: ${r.preferredStart}`, r.callTime && `Arama saati: ${r.callTime}`].filter(Boolean).join(' · ')}</p>
          )}
          {r.message && <p className="text-sm" style={{ color: 'var(--color-ink-muted)', whiteSpace: 'pre-wrap' }}>{r.message}</p>}
          {r.voiceSessionId && (
            <div className="flex flex-col gap-1">
              <button className="pill-tag" onClick={() => showVoice(r.voiceSessionId!)} style={{ cursor: 'pointer', border: '1px solid var(--color-border-card)', alignSelf: 'flex-start' }}>Sesli görüşme</button>
              {voiceOpen === r.voiceSessionId && (voiceTurns ?? []).map((t, i) => (
                <p key={i} className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                  <strong>{t.role === 'user' ? 'Ziyaretçi' : 'Asistan'}</strong> · {new Date(t.at).toLocaleTimeString('tr-TR')}: {t.text}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
