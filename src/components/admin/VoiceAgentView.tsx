import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, fmtDate, type Req } from './api';
import { Check, SelectHeader, useNote, useSelection } from './bulk';
import CallScript from './CallScript';

type St = 'to_call' | 'calling' | 'booked' | 'no_answer';
const ST: Record<St, string> = { to_call: 'Aranacak', calling: 'Aranıyor', booked: 'Randevu alındı', no_answer: 'Cevap yok' };
const PT: Record<string, string> = { morning: 'Sabah', afternoon: 'Öğleden sonra', any: 'Fark etmez' };
const DAYS = [[1, 'Pzt'], [2, 'Sal'], [3, 'Çar'], [4, 'Per'], [5, 'Cum'], [6, 'Cmt'], [0, 'Paz']] as const;
interface Sched { days: number[]; start: string; end: string; slotMinutes: number; buffer: number }
interface Cfg { mode: 'simulation' | 'live'; vapiAssistantId: string; vapiPhoneNumberId: string; n8nWebhookUrl: string; schedule: Sched; vapiKey: { configured: boolean; last4: string }; vapiSecret: { configured: boolean; last4: string }; webhookUrl: string; token: { exists: boolean; createdAt: string | null; revealable: boolean; last4: string }; baseUrl: string; endpoints: string[] }
interface Cust { id: string; name: string; phone: string; sector: string; preferred_time: string; status: St }
interface Call { id: string; createdAt: string; customer_name: string; status: string; summary: string; recordingUrl: string; appointmentStart: string; simulated: boolean }
interface Appt { id: string; name: string; start: string; end: string; notes: string }
const mask = (p: string) => (p.length > 3 ? `${'•'.repeat(Math.min(p.length - 3, 8))}${p.slice(-3)}` : p);
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? (x.status === 401 ? 'Oturum süresi doldu, yeniden giriş yapın.' : d) : d);
const fmtSlot = (s: string) => `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)} ${s.slice(11, 16)}`;

export default function VoiceAgentView({ reqs }: { reqs: Req[] | null }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [form, setForm] = useState({ key: '', secret: '', agent: '', phone: '', n8n: '', mode: 'simulation' as 'simulation' | 'live', sc: { days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00', slotMinutes: 30, buffer: 0 } as Sched });
  const [token, setToken] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const [confirmRev, setConfirmRev] = useState(false);
  const hideT = useRef<number>(0);
  const tNote = useNote();
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
    setForm({ key: '', secret: '', agent: c.vapiAssistantId, phone: c.vapiPhoneNumberId, n8n: c.n8nWebhookUrl, mode: c.mode, sc: c.schedule });
  }, []);
  const loadAll = useCallback(async () => {
    const [q, c, a] = await Promise.all([api<{ customers: Cust[] }>('/api/admin/voice-agent/queue'), api<{ calls: Call[] }>('/api/admin/voice-agent/calls'), api<{ appointments: Appt[] }>('/api/admin/voice-agent/appointments')]);
    setQueue(q.customers); setCalls(c.calls); setAppts(a.appointments);
  }, []);
  useEffect(() => { loadCfg().catch((x) => setNote.show({ ok: false, text: msgOf(x, 'Ayarlar yüklenemedi.') })); loadAll().catch(() => qNote.show({ ok: false, text: 'Liste yüklenemedi.' })); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api('/api/admin/voice-agent/settings', 'PUT', { vapiApiKey: form.key, vapiServerSecret: form.secret, vapiAssistantId: form.agent, vapiPhoneNumberId: form.phone, n8nWebhookUrl: form.n8n, mode: form.mode, schedule: form.sc });
      await loadCfg(); setNote.show({ ok: true, text: 'Kaydedildi.' });
    } catch (x) { setNote.show({ ok: false, text: msgOf(x, 'Kaydedilemedi, tekrar deneyin.') }); }
    setBusy(false);
  };
  const hide = () => { window.clearTimeout(hideT.current); setShown(null); };
  useEffect(() => () => window.clearTimeout(hideT.current), []);
  const makeToken = async () => {
    try {
      const r = await api<{ token: string; revealable: boolean; message?: string }>('/api/admin/voice-agent/token', 'POST'); hide(); setToken(r.token); await loadCfg();
      if (!r.revealable) tNote.show({ ok: false, text: r.message ?? 'Görüntüleme için SETTINGS_ENC_KEY gerekli' });
    } catch (x) { tNote.show({ ok: false, text: msgOf(x, 'Token oluşturulamadı.') }); }
  };
  const revoke = async () => { setConfirmRev(false); try { await api('/api/admin/voice-agent/token', 'DELETE'); hide(); setToken(null); await loadCfg(); tNote.show({ ok: true, text: 'Token iptal edildi.' }); } catch (x) { tNote.show({ ok: false, text: msgOf(x, 'İptal edilemedi.') }); } };
  const fetchTok = async () => (await api<{ token: string }>('/api/admin/voice-agent/token/reveal', 'POST')).token;
  const reveal = async () => { try { const t = await fetchTok(); setShown(t); window.clearTimeout(hideT.current); hideT.current = window.setTimeout(() => setShown(null), 30_000); } catch (x) { tNote.show({ ok: false, text: msgOf(x, 'Token görüntülenemedi.') }); } };
  const copyText = async (t: string) => { try { await navigator.clipboard.writeText(t); tNote.show({ ok: true, text: 'Kopyalandı' }); } catch { tNote.show({ ok: false, text: 'Kopyalanamadı, elle seçin.' }); } };
  const copyTok = async () => { try { await copyText(token ?? shown ?? (await fetchTok())); } catch (x) { tNote.show({ ok: false, text: msgOf(x, 'Kopyalanamadı.') }); } };

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
  const testConn = async () => {
    try { const r = await api<{ ok: boolean; message: string }>('/api/admin/voice-agent/test-connection', 'POST'); setNote.show({ ok: r.ok, text: r.message }); }
    catch (x) { setNote.show({ ok: false, text: msgOf(x, 'Önce Vapi private API key girip kaydedin.') }); }
  };
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
          <div className="adm-banner" style={{ marginBottom: 12 }}>
            <b>Kurulum adımları (Vapi)</b>
            <ol className="adm-meta" style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              <li>Vapi hesabı oluşturun (vapi.ai).</li><li>Dashboard'dan bir private API key alın.</li><li>Bir assistant oluşturun (Assistant ID).</li>
              <li>Bir telefon numarası ekleyin (Phone Number ID).</li><li>Assistant'ın Server URL alanına aşağıdaki "Bağlantı bilgileri" kartındaki webhook adresini ve bir secret (X-Vapi-Secret) girin.</li>
              <li>Anahtar, ID'ler ve aynı secret'ı buraya yapıştırıp kaydedin; "Test bağlantısı"na basın.</li><li>Simülasyon modunda deneyin, sonra Canlı'ya geçin.</li></ol></div>
          <div style={fld}><label className="adm-label" htmlFor="va-key">Vapi Private API Key</label>
            <input id="va-key" className="adm-input" type="password" autoComplete="off" value={form.key} placeholder={cfg.vapiKey.configured ? `Kayıtlı ••••${cfg.vapiKey.last4} (boş bırakırsanız korunur)` : 'Anahtarı yapıştırın'} onChange={(e) => setForm({ ...form, key: e.target.value })} /></div>
          <div style={fld}><label className="adm-label" htmlFor="va-agent">Vapi Assistant ID</label><input id="va-agent" className="adm-input" autoComplete="off" value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} /></div>
          <div style={fld}><label className="adm-label" htmlFor="va-phone">Vapi Phone Number ID</label><input id="va-phone" className="adm-input" autoComplete="off" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div style={fld}><label className="adm-label" htmlFor="va-secret">Server URL secret</label>
            <input id="va-secret" className="adm-input" type="password" autoComplete="off" value={form.secret} placeholder={cfg.vapiSecret.configured ? `Kayıtlı ••••${cfg.vapiSecret.last4} (boş bırakırsanız korunur)` : 'Vapi\'de belirlediğiniz secret'} onChange={(e) => setForm({ ...form, secret: e.target.value })} /></div>
          <div style={fld}><label className="adm-label" htmlFor="va-n8n">n8n Webhook URL</label><input id="va-n8n" className="adm-input" inputMode="url" placeholder="https://…" value={form.n8n} onChange={(e) => setForm({ ...form, n8n: e.target.value })} /></div>
          <div style={fld}><span className="adm-label">Sistem Modu</span>
            <div className="adm-chips" style={{ marginBottom: 0 }}>
              <button type="button" className="adm-chip" aria-pressed={!live} onClick={() => setForm({ ...form, mode: 'simulation' })}>Simülasyon</button>
              <button type="button" className="adm-chip" aria-pressed={live} onClick={() => setForm({ ...form, mode: 'live' })}>Canlı</button>
            </div>
            <span className="adm-meta">Canlı mod için anahtar, Assistant ID, Phone Number ID ve secret girilmiş olmalı.</span></div>
          <div style={fld}><span className="adm-label">Randevu saatleri (Europe/Berlin)</span>
            <div className="adm-chips" style={{ marginBottom: 0 }}>{DAYS.map(([d, l]) => <button key={d} type="button" className="adm-chip" aria-pressed={form.sc.days.includes(d)} onClick={() => toggleDay(d)}>{l}</button>)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
              <label className="adm-label">Başlangıç<input className="adm-input" type="time" value={form.sc.start} onChange={(e) => setForm({ ...form, sc: { ...form.sc, start: e.target.value } })} /></label>
              <label className="adm-label">Bitiş<input className="adm-input" type="time" value={form.sc.end} onChange={(e) => setForm({ ...form, sc: { ...form.sc, end: e.target.value } })} /></label>
              <label className="adm-label">Randevu süresi (dk)<input className="adm-input" type="number" min={5} max={240} value={form.sc.slotMinutes} onChange={num('slotMinutes')} /></label>
              <label className="adm-label">Ara (dk)<input className="adm-input" type="number" min={0} max={120} value={form.sc.buffer} onChange={num('buffer')} /></label>
            </div><span className="adm-meta">Dolu günler (Takvim) ve alınmış randevular otomatik çıkarılır.</span></div>
          <div className="adm-actions"><button type="button" className="lq-btn-ghost adm-btn adm-pri" onClick={save} disabled={busy}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button><button type="button" className="lq-btn-ghost adm-btn" onClick={testConn} disabled={busy}>Test bağlantısı</button></div>

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

      {cfg && <div className="lq-card adm-card" style={{ marginTop: 16 }}>
        <div className="adm-head"><h2>Bağlantı bilgileri</h2></div>
        {tNote.el}
        <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          <span className="adm-label">Bearer token</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{!cfg.token.exists ? 'Aktif token yok' : token ?? shown ?? (cfg.token.revealable ? `cwva_••••${cfg.token.last4}` : 'cwva_••••••••')}</code>
            {cfg.token.exists && <>
              {cfg.token.revealable && !token && (shown ? <button type="button" className="lq-btn-ghost adm-btn sm" onClick={hide}>Gizle</button> : <button type="button" className="lq-btn-ghost adm-btn sm" onClick={reveal}>Göster</button>)}
              {(cfg.token.revealable || token) && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={copyTok}>Kopyala</button>}</>}
          </div>
          {token && <span className="adm-meta">{cfg.token.revealable ? 'Yeni token hazır; sayfadan çıksanız da "Göster" ile tekrar görebilirsiniz.' : 'Bu token bir daha gösterilmeyecek; şimdi kopyalayıp güvenli bir yere kaydedin.'}</span>}
          {cfg.token.exists && !cfg.token.revealable && !token && <span className="adm-meta">Bu token eski yöntemle oluşturuldu; görmek için yeni token oluştur.</span>}
          {shown && <span className="adm-meta">Token 30 saniye sonra tekrar gizlenir.</span>}
          <span className="adm-meta">{cfg.token.exists && cfg.token.createdAt ? `Oluşturulma: ${fmtDate(cfg.token.createdAt)}` : 'Aktif token yok'}</span>
          <div className="adm-actions">
            <button type="button" className="lq-btn-ghost adm-btn sm" onClick={makeToken}>{cfg.token.exists ? 'Yeni token oluştur' : 'Token oluştur'}</button>
            {cfg.token.exists && !confirmRev && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirmRev(true)}>Token'ı iptal et</button>}
            {confirmRev && <><span className="adm-meta">Token iptal edilsin mi? Dış araçlar çalışmayı durdurur.</span>
              <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={revoke}>Evet, iptal et</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirmRev(false)}>Vazgeç</button></>}
          </div>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {[`Base URL: ${cfg.baseUrl || window.location.origin}`, ...cfg.endpoints, `Vapi webhook (Assistant > Server URL): ${cfg.webhookUrl}`].map((l) => (
            <div key={l} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all', minWidth: 0 }}>{l}</code>
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => copyText(l.startsWith('Base URL: ') ? l.slice(10) : l.startsWith('Vapi webhook') ? l.slice(l.indexOf('http')) : l)}>Kopyala</button></div>))}
        </div>
        <p className="adm-meta" style={{ margin: '10px 0 0' }}>Vapi'de assistant'ın Server URL alanına yukarıdaki webhook adresini yazın; Custom Credential olarak başlık adı <code style={{ fontFamily: 'var(--font-mono)' }}>X-Vapi-Secret</code> (Bearer öneki kapalı) ve yukarıda kaydettiğiniz secret'ı seçin. Assistant araçları (isteğe bağlı): <code style={{ fontFamily: 'var(--font-mono)' }}>check_availability(date)</code>, <code style={{ fontFamily: 'var(--font-mono)' }}>book_appointment(start, notes)</code>, <code style={{ fontFamily: 'var(--font-mono)' }}>mark_do_not_call()</code>.</p>
        <p className="adm-meta" style={{ margin: '10px 0 0' }}>Bearer token'lı REST uçları (n8n için): her istekte <code style={{ fontFamily: 'var(--font-mono)' }}>Authorization: Bearer &lt;token&gt;</code> gönderilir.</p>
      </div>}
    </>
  );
}
