import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fmtDate, type Req } from './api';
import { Check, SelectHeader, useNote, useSelection } from './bulk';
import CallScript from './CallScript';

type St = 'to_call' | 'calling' | 'booked' | 'no_answer';
const ST: Record<St, string> = { to_call: 'Aranacak', calling: 'Aranıyor', booked: 'Randevu alındı', no_answer: 'Cevap yok' };
const PT: Record<string, string> = { morning: 'Sabah', afternoon: 'Öğleden sonra', any: 'Fark etmez' };
const DAYS = [[1, 'Pzt'], [2, 'Sal'], [3, 'Çar'], [4, 'Per'], [5, 'Cum'], [6, 'Cmt'], [0, 'Paz']] as const;
interface Sched { days: number[]; start: string; end: string; slotMinutes: number; buffer: number }
interface Cfg { mode: 'simulation' | 'live'; retellAgentId: string; retellPhoneNumber: string; n8nWebhookUrl: string; schedule: Sched; retellKey: { configured: boolean; last4: string }; token: { exists: boolean; createdAt: string | null }; baseUrl: string; endpoints: string[] }
interface Cust { id: string; name: string; phone: string; sector: string; preferred_time: string; status: St }
interface Call { id: string; createdAt: string; customer_name: string; status: string; summary: string; recordingUrl: string; appointmentStart: string; simulated: boolean }
interface Appt { id: string; name: string; start: string; end: string; notes: string }
const mask = (p: string) => (p.length > 3 ? `${'•'.repeat(Math.min(p.length - 3, 8))}${p.slice(-3)}` : p);
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? (x.status === 401 ? 'Oturum süresi doldu, yeniden giriş yapın.' : d) : d);
const fmtSlot = (s: string) => `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)} ${s.slice(11, 16)}`;

export default function VoiceAgentView({ reqs }: { reqs: Req[] | null }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [form, setForm] = useState({ key: '', agent: '', phone: '', n8n: '', mode: 'simulation' as 'simulation' | 'live', sc: { days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00', slotMinutes: 30, buffer: 0 } as Sched });
  const [token, setToken] = useState<string | null>(null);
  const [queue, setQueue] = useState<Cust[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [picker, setPicker] = useState(false);
  const [pick, setPick] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const setNote = useNote(); const qNote = useNote(); const pNote = useNote();
  const sel = useSelection(queue.map((c) => c.id));

  const loadCfg = useCallback(async () => {
    const c = await api<Cfg>('/api/admin/voice-agent/settings'); setCfg(c);
    setForm({ key: '', agent: c.retellAgentId, phone: c.retellPhoneNumber, n8n: c.n8nWebhookUrl, mode: c.mode, sc: c.schedule });
  }, []);
  const loadAll = useCallback(async () => {
    const [q, c, a] = await Promise.all([api<{ customers: Cust[] }>('/api/admin/voice-agent/queue'), api<{ calls: Call[] }>('/api/admin/voice-agent/calls'), api<{ appointments: Appt[] }>('/api/admin/voice-agent/appointments')]);
    setQueue(q.customers); setCalls(c.calls); setAppts(a.appointments);
  }, []);
  useEffect(() => { loadCfg().catch((x) => setNote.show({ ok: false, text: msgOf(x, 'Ayarlar yüklenemedi.') })); loadAll().catch(() => qNote.show({ ok: false, text: 'Liste yüklenemedi.' })); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api('/api/admin/voice-agent/settings', 'PUT', { retellApiKey: form.key, retellAgentId: form.agent, retellPhoneNumber: form.phone, n8nWebhookUrl: form.n8n, mode: form.mode, schedule: form.sc });
      await loadCfg(); setNote.show({ ok: true, text: 'Kaydedildi.' });
    } catch (x) { setNote.show({ ok: false, text: msgOf(x, 'Kaydedilemedi, tekrar deneyin.') }); }
    setBusy(false);
  };
  const makeToken = async () => { try { const r = await api<{ token: string }>('/api/admin/voice-agent/token', 'POST'); setToken(r.token); await loadCfg(); } catch (x) { setNote.show({ ok: false, text: msgOf(x, 'Token oluşturulamadı.') }); } };
  const revoke = async () => { try { await api('/api/admin/voice-agent/token', 'DELETE'); setToken(null); await loadCfg(); setNote.show({ ok: true, text: 'Token iptal edildi.' }); } catch (x) { setNote.show({ ok: false, text: msgOf(x, 'İptal edilemedi.') }); } };
  const copy = async () => { try { await navigator.clipboard.writeText(token ?? ''); setNote.show({ ok: true, text: 'Kopyalandı.' }); } catch { setNote.show({ ok: false, text: 'Kopyalanamadı, elle seçin.' }); } };

  const have = new Set(queue.map((c) => (c as unknown as { sourceRequestId?: string }).sourceRequestId));
  const withPhone = (reqs ?? []).filter((r) => (r.phone ?? '').trim() && !r.archived);
  const add = async () => {
    try { const r = await api<{ added: number; skipped: number }>('/api/admin/voice-agent/queue', 'POST', { requestIds: [...pick] }); setPick(new Set()); setPicker(false); await loadAll(); qNote.show({ ok: true, text: `${r.added} kişi eklendi${r.skipped ? `, ${r.skipped} atlandı` : ''}.` }); }
    catch (x) { qNote.show({ ok: false, text: msgOf(x, 'Eklenemedi.') }); }
  };
  const setSt = async (id: string, status: St) => { try { await api(`/api/admin/voice-agent/queue/${id}`, 'PATCH', { status }); await loadAll(); } catch (x) { qNote.show({ ok: false, text: msgOf(x, 'Güncellenemedi.') }); } };
  const del = async (id: string) => { try { await api(`/api/admin/voice-agent/queue/${id}`, 'DELETE'); await loadAll(); } catch (x) { qNote.show({ ok: false, text: msgOf(x, 'Silinemedi.') }); } };
  const start = async () => {
    setConfirm(false); setBusy(true);
    try { const r = await api<{ message: string; results: { info: string }[] }>('/api/admin/voice-agent/start', 'POST', { customerIds: sel.sel }); sel.clear(); await loadAll(); qNote.show({ ok: true, text: `${r.message} ${[...new Set(r.results.map((x) => x.info))].join('; ')}` }); }
    catch (x) { qNote.show({ ok: false, text: msgOf(x, 'Başlatılamadı.') }); }
    setBusy(false);
  };
  const delAppt = async (id: string) => { try { await api(`/api/admin/voice-agent/appointments/${id}`, 'DELETE'); await loadAll(); } catch (x) { pNote.show({ ok: false, text: msgOf(x, 'Silinemedi.') }); } };
  const live = form.mode === 'live';
  const toggleDay = (d: number) => setForm((f) => ({ ...f, sc: { ...f.sc, days: f.sc.days.includes(d) ? f.sc.days.filter((x) => x !== d) : [...f.sc.days, d] } }));
  const num = (k: 'slotMinutes' | 'buffer') => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, sc: { ...f.sc, [k]: Number(e.target.value) } }));
  const fld = { display: 'grid', gap: 6, marginBottom: 12 } as const;

  return (
    <>
      <h1 className="adm-h1">Voice Agent</h1>
      <p className="adm-sub">Telefonda arayan yapay zekâ asistanı: ayarlar, arama kuyruğu, günlükler ve randevular. Simülasyon modunda gerçek arama yapılmaz.</p>

      <div className="lq-card adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-head"><h2>Ayarlar</h2><span className="adm-chip" data-state={live ? 'bad' : 'paid'}>{live ? 'CANLI' : 'SİMÜLASYON'}</span></div>
        {setNote.el}
        {!cfg ? <div className="adm-skel" style={{ height: 200 }} /> : <>
          <div style={fld}><label className="adm-label" htmlFor="va-key">Retell API Key</label>
            <input id="va-key" className="adm-input" type="password" autoComplete="off" value={form.key} placeholder={cfg.retellKey.configured ? `Kayıtlı ••••${cfg.retellKey.last4} (boş bırakırsanız korunur)` : 'Anahtarı yapıştırın'} onChange={(e) => setForm({ ...form, key: e.target.value })} /></div>
          <div style={fld}><label className="adm-label" htmlFor="va-agent">Retell Agent ID</label><input id="va-agent" className="adm-input" value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} /></div>
          <div style={fld}><label className="adm-label" htmlFor="va-phone">Retell Phone Number</label><input id="va-phone" className="adm-input" inputMode="tel" placeholder="+49…" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div style={fld}><label className="adm-label" htmlFor="va-n8n">n8n Webhook URL</label><input id="va-n8n" className="adm-input" inputMode="url" placeholder="https://…" value={form.n8n} onChange={(e) => setForm({ ...form, n8n: e.target.value })} /></div>
          <div style={fld}><span className="adm-label">Sistem Modu</span>
            <div className="adm-chips" style={{ marginBottom: 0 }}>
              <button type="button" className="adm-chip" aria-pressed={!live} onClick={() => setForm({ ...form, mode: 'simulation' })}>Simülasyon</button>
              <button type="button" className="adm-chip" aria-pressed={live} onClick={() => setForm({ ...form, mode: 'live' })}>Canlı</button>
            </div>
            <span className="adm-meta">Canlı mod için anahtar, Agent ID ve telefon numarası girilmiş olmalı.</span></div>
          <div style={fld}><span className="adm-label">Randevu saatleri (Europe/Berlin)</span>
            <div className="adm-chips" style={{ marginBottom: 0 }}>{DAYS.map(([d, l]) => <button key={d} type="button" className="adm-chip" aria-pressed={form.sc.days.includes(d)} onClick={() => toggleDay(d)}>{l}</button>)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
              <label className="adm-label">Başlangıç<input className="adm-input" type="time" value={form.sc.start} onChange={(e) => setForm({ ...form, sc: { ...form.sc, start: e.target.value } })} /></label>
              <label className="adm-label">Bitiş<input className="adm-input" type="time" value={form.sc.end} onChange={(e) => setForm({ ...form, sc: { ...form.sc, end: e.target.value } })} /></label>
              <label className="adm-label">Randevu süresi (dk)<input className="adm-input" type="number" min={5} max={240} value={form.sc.slotMinutes} onChange={num('slotMinutes')} /></label>
              <label className="adm-label">Ara (dk)<input className="adm-input" type="number" min={0} max={120} value={form.sc.buffer} onChange={num('buffer')} /></label>
            </div><span className="adm-meta">Dolu günler (Takvim) ve alınmış randevular otomatik çıkarılır.</span></div>
          <div className="adm-actions"><button type="button" className="lq-btn-ghost adm-btn adm-pri" onClick={save} disabled={busy}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button></div>

          <div className="adm-banner" style={{ marginTop: 16, marginBottom: 0 }}>
            <b>Bağlantı bilgileri</b>
            <p className="adm-meta" style={{ margin: '6px 0' }}>Base URL: <code>{cfg.baseUrl}</code></p>
            <ul className="adm-meta" style={{ margin: '0 0 10px', paddingLeft: 18 }}>{cfg.endpoints.map((e) => <li key={e}><code>{e}</code></li>)}</ul>
            <p className="adm-meta" style={{ margin: '0 0 10px' }}>Her istekte <code>Authorization: Bearer &lt;token&gt;</code> gönderilir.</p>
            {token && <div role="alert" style={{ marginBottom: 10 }}>
              <code style={{ wordBreak: 'break-all', display: 'block', marginBottom: 6 }}>{token}</code>
              <p className="adm-meta" style={{ margin: '0 0 6px' }}>Bu token bir daha gösterilmeyecek; şimdi kopyalayıp güvenli bir yere kaydedin.</p>
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={copy}>Kopyala</button></div>}
            <div className="adm-actions">
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={makeToken}>{cfg.token.exists ? 'Yeni token oluştur' : 'Token oluştur'}</button>
              {cfg.token.exists && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={revoke}>Token'ı iptal et</button>}
              <span className="adm-meta">{cfg.token.exists && cfg.token.createdAt ? `Oluşturulma: ${fmtDate(cfg.token.createdAt)}` : 'Aktif token yok'}</span></div>
          </div>
        </>}
      </div>

      <div className="lq-card adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-head"><h2>Arama Kuyruğu</h2><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setPicker(!picker)}>{picker ? 'Kapat' : 'Taleplerden ekle'}</button></div>
        {qNote.el}
        {picker && <div className="adm-banner">
          {!withPhone.length ? 'Telefon numarası olan talep yok.' : <div style={{ display: 'grid', gap: 8, maxHeight: 260, overflowY: 'auto' }}>{withPhone.map((r) => (
            <label key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
              <input type="checkbox" className="adm-check" disabled={have.has(r.id)} checked={pick.has(r.id)} onChange={() => setPick((p) => { const n = new Set(p); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} />
              <span>{r.name || 'İsimsiz'} · {mask(r.phone ?? '')}{have.has(r.id) ? ' · kuyrukta' : ''}</span></label>))}</div>}
          <div className="adm-actions" style={{ marginTop: 10 }}><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!pick.size} onClick={add}>Ekle ({pick.size})</button></div>
        </div>}
        <SelectHeader s={sel} total={queue.length} />
        {!queue.length ? <div className="adm-empty">Kuyrukta kimse yok</div> : <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th /><th>Ad</th><th>Telefon</th><th>Sektör</th><th>Tercih</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>{queue.map((c) => (
          <tr key={c.id}>
            <td><Check checked={sel.has(c.id)} label={`Seç: ${c.name}`} onToggle={(sh) => sel.toggle(c.id, sh)} /></td>
            <td>{c.name}</td><td>{mask(c.phone)}</td><td>{c.sector}</td><td>{PT[c.preferred_time] ?? '-'}</td>
            <td><span className="adm-chip" data-state={c.status}>{ST[c.status]}</span></td>
            <td><span style={{ display: 'inline-flex', gap: 6 }}>
              <select className="adm-input" aria-label="Durum değiştir" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }} value={c.status} onChange={(e) => setSt(c.id, e.target.value as St)}>{(Object.keys(ST) as St[]).map((s) => <option key={s} value={s}>{ST[s]}</option>)}</select>
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => del(c.id)}>Sil</button></span></td>
          </tr>))}</tbody></table></div>}
        <div style={{ marginTop: 12 }}>
          {confirm ? <div className="adm-banner" role="alert" style={{ marginBottom: 0 }}>
            {sel.sel.length} kişi için {live ? 'GERÇEK arama başlatılacak' : 'simülasyon başlatılacak (arama yapılmaz)'}. Emin misiniz?
            <div className="adm-actions" style={{ marginTop: 8 }}><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={start}>Evet, başlat</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(false)}>Vazgeç</button></div></div>
            : <button type="button" className="lq-btn-ghost adm-btn adm-pri" disabled={!sel.sel.length || busy} onClick={() => setConfirm(true)}>Seçilenleri Aramaya Başlat ({live ? 'Canlı' : 'Simülasyon'})</button>}
        </div>
      </div>

      <CallScript />

      <div className="lq-card adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-head"><h2>Arama Logları</h2></div>
        {!calls.length ? <div className="adm-empty">Henüz kayıt yok</div> : <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Tarih</th><th>Müşteri</th><th>Durum</th><th>Özet</th><th>Ses kaydı</th><th>Randevu</th></tr></thead><tbody>{calls.map((c) => (
          <tr key={c.id}><td>{fmtDate(c.createdAt)}</td><td>{c.customer_name}</td><td><span className="adm-chip" data-state={c.status}>{ST[c.status as St] ?? c.status}</span></td>
            <td style={{ whiteSpace: 'normal', minWidth: 200 }}>{c.summary || '-'}</td>
            <td>{c.recordingUrl ? <a href={c.recordingUrl} target="_blank" rel="noopener noreferrer">Dinle</a> : '-'}</td>
            <td>{c.appointmentStart ? fmtSlot(c.appointmentStart) : '-'}</td></tr>))}</tbody></table></div>}
      </div>

      <div className="lq-card adm-card">
        <div className="adm-head"><h2>Randevular (Voice Agent)</h2></div>
        {pNote.el}
        {!appts.length ? <div className="adm-empty">Voice Agent randevusu yok</div> : <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Başlangıç</th><th>Bitiş</th><th>Müşteri</th><th>Not</th><th /></tr></thead><tbody>{appts.map((a) => (
          <tr key={a.id}><td>{fmtSlot(a.start)}</td><td>{a.end.slice(11, 16)}</td><td>{a.name}</td><td style={{ whiteSpace: 'normal' }}>{a.notes || '-'}</td><td><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => delAppt(a.id)}>Sil</button></td></tr>))}</tbody></table></div>}
      </div>
    </>
  );
}
