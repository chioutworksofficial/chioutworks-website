import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// Monthly newsletter idea (server/newsletterIssues.ts): upcoming/last issues per language, preview, regenerate, send now, auto-send + pause. Admin UI is Turkish.
type L = 'tr' | 'en' | 'de' | 'el';
const LANGS: L[] = ['tr', 'en', 'de', 'el'];
interface Item { title: string; paras: string[]; at: string }
interface Issue { id: string; items: Partial<Record<L, Item>>; errors: Partial<Record<L, string>>; release: boolean; sentAt: string | null; lastError: string | null; sentCount: Record<L, number> }
interface State {
  settings: { autoSend: boolean; paused: boolean }; issues: Issue[]; subscribers: { active: number; pending: number; byLang: Record<L, number> };
  mailConfigured: boolean; unsubConfigured: boolean; originConfigured: boolean; dailyCap: number; currentId: string;
}
const A = '/api/admin/newsletter-issues';

export default function NewsletterView() {
  const [st, setSt] = useState<State | null>(null);
  const [lang, setLang] = useState<L>('tr');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const load = useCallback(() => { api<State>(A).then(setSt).catch(() => setNote('Yüklenemedi.')); }, []);
  useEffect(load, [load]);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true); setNote(null);
    try { await fn(); setNote(ok); load(); } catch { setNote('İşlem başarısız (başka bir işlem sürüyor olabilir).'); } finally { setBusy(false); }
  };
  const toggle = (k: 'autoSend' | 'paused', v: boolean) => run(() => api(`${A}/settings`, 'PUT', { [k]: v }), 'Kaydedildi.');
  if (!st) return <><h1 className="adm-h1">Bülten</h1>{note ? <div className="adm-banner" role="alert">{note}</div> : <div className="adm-list"><div className="adm-skel" /></div>}</>;
  const issues = st.issues.length ? st.issues : [];
  const sel = issues.find((i) => i.id === (openId ?? st.currentId)) ?? issues[0];
  const item = sel?.items[lang];
  const pending = (i: Issue, l: L) => Math.max(0, st.subscribers.byLang[l] - i.sentCount[l]);
  return (
    <>
      <h1 className="adm-h1">Bülten (aylık fikir)</h1>
      <p className="adm-sub">Ayda bir kez, her abonenin kendi dilinde tek kısa fikir. Yalnızca çift onaylı aboneler; her e-postada abonelikten çıkma bağlantısı var. Metinler yapay zekâ taslağıdır.</p>
      {(!st.mailConfigured || !st.unsubConfigured || !st.originConfigured) && <div className="adm-banner" role="status">Gönderim kapalı: {[!st.mailConfigured && 'e-posta servisi/alan adı ayarlı değil', !st.unsubConfigured && 'abonelik anahtarı (SETTINGS_ENC_KEY veya ADMIN_TOKEN) yok', !st.originConfigured && 'PUBLIC_ORIGIN yok'].filter(Boolean).join(', ')}. Taslaklar yine de hazırlanır.</div>}
      <div className="lq-card adm-card" style={{ marginBottom: 16 }}>
        <h2>Ayarlar</h2>
        <label className="adm-sub" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}><input type="checkbox" checked={st.settings.autoSend} disabled={busy} onChange={(e) => toggle('autoSend', e.target.checked)} /> Aylık otomatik gönderim (ayın ilk 7 günü hazırlanır ve gönderilir)</label>
        <label className="adm-sub" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}><input type="checkbox" checked={st.settings.paused} disabled={busy} onChange={(e) => toggle('paused', e.target.checked)} /> Duraklat (hiçbir otomatik hazırlık veya gönderim olmaz)</label>
        <p className="adm-sub" style={{ marginTop: 8 }}>Aktif abone: {st.subscribers.active} ({LANGS.map((l) => `${l.toUpperCase()} ${st.subscribers.byLang[l]}`).join(' · ')}); onay bekleyen: {st.subscribers.pending}. Günlük gönderim sınırı {st.dailyCap}; fazlası ertesi gün devam eder.</p>
      </div>
      <div className="adm-actions" style={{ marginBottom: 12 }}>
        <select value={sel?.id ?? ''} onChange={(e) => setOpenId(e.target.value)} aria-label="Sayı">{issues.map((i) => <option key={i.id} value={i.id}>{i.id}{i.id === st.currentId ? ' (bu ay)' : ''}</option>)}</select>
        {LANGS.map((l) => <button key={l} className={`lq-btn-ghost adm-btn sm${l === lang ? ' adm-pri' : ''}`} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
        <button className="lq-btn-ghost adm-btn sm" disabled={busy} onClick={() => run(() => api(`${A}/generate`, 'POST', { id: sel?.id ?? st.currentId }), 'Taslak hazırlandı.')}>{sel ? 'Tüm dilleri yeniden üret' : 'Bu ayın taslağını üret'}</button>
        {sel && <button className="lq-btn-ghost adm-btn sm" disabled={busy} onClick={() => run(() => api(`${A}/generate`, 'POST', { id: sel.id, lang }), `${lang.toUpperCase()} yeniden üretildi.`)}>{lang.toUpperCase()} yeniden üret</button>}
        {sel && <button className="lq-btn-ghost adm-btn sm adm-pri" disabled={busy || st.settings.paused} onClick={() => { if (window.confirm('Bu sayı onaylı abonelere şimdi gönderilsin mi?')) void run(async () => { const r = await api<{ sent: number; remaining: number; note?: string }>(`${A}/${sel.id}/send`, 'POST'); setNote(r.note ? `Gönderilmedi: ${r.note}` : `${r.sent} e-posta gönderildi; kalan: ${r.remaining}.`); }, ''); }}>Şimdi gönder</button>}
        <button className="lq-btn-ghost adm-btn sm" onClick={load}>Yenile</button>
      </div>
      {note && <p className="adm-sub" role="status">{note}</p>}
      {!sel ? <div className="adm-empty">Henüz sayı yok. Otomatik gönderim açıksa ayın ilk günlerinde hazırlanır; isterseniz yukarıdan şimdi üretin.</div> : (
        <div className="lq-card adm-card">
          <p className="adm-sub">Durum: {sel.sentAt ? `gönderildi (${sel.sentAt.slice(0, 10)})` : sel.release ? 'gönderim sürüyor' : 'taslak'} · {lang.toUpperCase()}: gönderilen {sel.sentCount[lang]}, bekleyen {pending(sel, lang)}{sel.lastError ? ' · son gönderimde hata' : ''}</p>
          {item ? (<><h2 style={{ marginTop: 10 }}>{item.title}</h2>{item.paras.map((p, i) => <p key={i} style={{ marginTop: 8 }}>{p}</p>)}</>)
            : <div className="adm-empty">{sel.errors[lang] ? `Bu dil için metin üretilemedi (${sel.errors[lang]}). Yeniden üretin.` : 'Bu dil için metin yok.'}</div>}
        </div>
      )}
    </>
  );
}
