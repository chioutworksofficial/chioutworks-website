import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fmtDate } from './api';
import { useNote } from './bulk';

type St = 'new' | 'to_call' | 'called' | 'interested' | 'not_interested' | 'won' | 'lost';
const ST: Record<St, string> = { new: 'Yeni', to_call: 'Aranacak', called: 'Arandı', interested: 'İlgili', not_interested: 'İlgisiz', won: 'Kazanıldı', lost: 'Kaybedildi' };
interface Analysis { company: string; city: string; country: string; sector: string; summary: string; has: string[]; missing: string[]; reasonable_cause: string; grade: 'A' | 'B' | 'C' | 'D'; grade_reason: string; first_step: string; opener: string }
interface Signals { https: boolean; viewport: boolean; hasForm: boolean; booking: string[]; chat: string[]; whatsapp: boolean; hreflang: string[]; title: string; description: string; socials: string[] }
interface Lead { id: string; createdAt: string; url: string; domain: string; analysis: Analysis; signals: Signals; phone?: string; email?: string; status: St; notes: { at: string; text: string }[]; analyzedAt?: string }
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? (x.status === 401 ? 'Oturum süresi doldu, yeniden giriş yapın.' : d) : d);
const yn = (b: boolean) => (b ? 'Evet' : 'Hayır');

export default function SalesView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [fSt, setFSt] = useState(''); const [fGr, setFGr] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [note, setNoteText] = useState('');
  const n = useNote();

  const load = useCallback(async () => { setLeads((await api<{ leads: Lead[] }>('/api/admin/sales/leads')).leads); }, []);
  useEffect(() => { load().catch((x) => n.show({ ok: false, text: msgOf(x, 'Liste yüklenemedi.') })); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const analyze = async (u: string, key: string) => {
    setBusy(key);
    try { await api('/api/admin/sales/analyze', 'POST', { url: u }); if (key === 'new') setUrl(''); await load(); n.show({ ok: true, text: 'Analiz tamamlandı.' }); }
    catch (x) { n.show({ ok: false, text: msgOf(x, 'Analiz başarısız.') }); }
    setBusy(null);
  };
  const act = async (fn: () => Promise<unknown>, okText: string, fail: string) => { try { await fn(); await load(); n.show({ ok: true, text: okText }); } catch (x) { n.show({ ok: false, text: msgOf(x, fail) }); } };
  const setSt = (id: string, status: St) => act(() => api(`/api/admin/sales/leads/${id}`, 'PATCH', { status }), 'Durum güncellendi.', 'Güncellenemedi.');
  const addNote = (id: string) => note.trim() && act(async () => { await api(`/api/admin/sales/leads/${id}`, 'PATCH', { note }); setNoteText(''); }, 'Not eklendi.', 'Not eklenemedi.');
  const del = (id: string) => { setConfirm(null); if (open === id) setOpen(null); return act(() => api(`/api/admin/sales/leads/${id}`, 'DELETE'), 'Silindi.', 'Silinemedi.'); };
  const toVa = (id: string) => act(() => api(`/api/admin/sales/leads/${id}/to-voice-agent`, 'POST'), 'Voice Agent kuyruğuna eklendi.', 'Eklenemedi.');
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); n.show({ ok: true, text: 'Kopyalandı.' }); } catch { n.show({ ok: false, text: 'Kopyalanamadı, elle seçin.' }); } };

  const shown = leads.filter((l) => (!fSt || l.status === fSt) && (!fGr || l.analysis.grade === fGr));
  const cur = leads.find((l) => l.id === open);
  const why = (l: Lead) => (!l.analysis.reasonable_cause ? 'Makul sebep yok' : !l.phone ? 'Telefon bulunamadı' : '');
  const chips = (a: string[], empty: string) => (a.length ? <div className="adm-chips" style={{ marginBottom: 0 }}>{a.map((x) => <span key={x} className="adm-chip">{x}</span>)}</div> : <span className="adm-meta">{empty}</span>);

  return (
    <>
      <h1 className="adm-h1">Satış</h1>
      <p className="adm-sub">Yalnızca firmanın herkese açık sitesi okunur; makul sebep yoksa arama yapılmaz.</p>
      <div className="lq-card adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-head"><h2>Yeni analiz</h2></div>
        {n.el}
        <form onSubmit={(e) => { e.preventDefault(); if (url.trim()) analyze(url.trim(), 'new'); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label className="adm-label" htmlFor="sl-url" style={{ flexBasis: '100%' }}>Web adresi</label>
          <input id="sl-url" className="adm-input" style={{ flex: '1 1 220px' }} inputMode="url" placeholder="https://firma.de" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button type="submit" className="lq-btn-ghost adm-btn adm-pri" disabled={!!busy || !url.trim()}>{busy === 'new' ? 'Analiz ediliyor…' : 'Analiz et'}</button>
        </form>
      </div>

      <div className="lq-card adm-card">
        <div className="adm-head"><h2>Potansiyel müşteriler ({shown.length})</h2></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <select className="adm-input" aria-label="Duruma göre filtre" style={{ width: 'auto' }} value={fSt} onChange={(e) => setFSt(e.target.value)}><option value="">Tüm durumlar</option>{(Object.keys(ST) as St[]).map((s) => <option key={s} value={s}>{ST[s]}</option>)}</select>
          <select className="adm-input" aria-label="Puana göre filtre" style={{ width: 'auto' }} value={fGr} onChange={(e) => setFGr(e.target.value)}><option value="">Tüm puanlar</option>{['A', 'B', 'C', 'D'].map((g) => <option key={g} value={g}>{g}</option>)}</select>
        </div>
        {!shown.length ? <div className="adm-empty">Kayıt yok</div> : <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Firma</th><th>Şehir</th><th>Sektör</th><th>Puan</th><th>Makul sebep</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>{shown.map((l) => (
          <tr key={l.id}>
            <td>{l.analysis.company || l.domain}<div className="adm-meta">{l.domain}</div></td><td>{l.analysis.city || '-'}</td><td>{l.analysis.sector || '-'}</td>
            <td><span className="adm-chip" data-state={`g${l.analysis.grade}`}>{l.analysis.grade}</span></td>
            <td style={{ whiteSpace: 'normal', minWidth: 180, maxWidth: 280 }} title={l.analysis.reasonable_cause}>{l.analysis.reasonable_cause ? (l.analysis.reasonable_cause.length > 90 ? `${l.analysis.reasonable_cause.slice(0, 90)}…` : l.analysis.reasonable_cause) : '-'}</td>
            <td><select className="adm-input" aria-label="Durum" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }} value={l.status} onChange={(e) => setSt(l.id, e.target.value as St)}>{(Object.keys(ST) as St[]).map((s) => <option key={s} value={s}>{ST[s]}</option>)}</select></td>
            <td>{confirm === l.id ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>Silinsin mi?<button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={() => del(l.id)}>Evet</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(null)}>Vazgeç</button></span>
              : <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setOpen(l.id)}>Detay</button>
                <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!why(l)} title={why(l) || 'Arama kuyruğuna ekle'} onClick={() => toVa(l.id)}>Voice Agent kuyruğuna ekle</button>
                <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => analyze(l.url, l.id)}>{busy === l.id ? 'Analiz…' : 'Yeniden analiz'}</button>
                <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(l.id)}>Sil</button></span>}</td>
          </tr>))}</tbody></table></div>}
      </div>

      {cur && <>
        <div className="adm-drawer-bg" onClick={() => setOpen(null)} />
        <aside className="adm-drawer" role="dialog" aria-label="Analiz ayrıntısı">
          <div className="adm-head"><h2>{cur.analysis.company || cur.domain}</h2><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setOpen(null)}>Kapat</button></div>
          <div><span className="adm-chip" data-state={`g${cur.analysis.grade}`}>Puan {cur.analysis.grade}</span> <span className="adm-meta">{cur.analysis.grade_reason}</span></div>
          <a href={cur.url} target="_blank" rel="noopener noreferrer" className="adm-meta" style={{ overflowWrap: 'anywhere' }}>{cur.url}</a>
          <p style={{ margin: 0 }}>{cur.analysis.summary || '-'}</p>
          <div><b>Makul sebep</b><p style={{ margin: '4px 0 0' }}>{cur.analysis.reasonable_cause || 'Makul sebep yok: aranamaz.'}</p></div>
          <div><b>Var</b>{chips(cur.analysis.has, 'Belirtilmedi')}</div>
          <div><b>Eksik</b>{chips(cur.analysis.missing, 'Belirtilmedi')}</div>
          <div><b>İlk adım</b><p style={{ margin: '4px 0 0' }}>{cur.analysis.first_step || '-'}</p></div>
          <div><b>Açılış cümlesi</b><p style={{ margin: '4px 0 6px' }}>{cur.analysis.opener || '-'}</p>{cur.analysis.opener && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => copy(cur.analysis.opener)}>Kopyala</button>}</div>
          <div><b>Teknik sinyaller</b>
            <ul className="adm-meta" style={{ margin: '4px 0 0', paddingLeft: 18 }}>
              <li>https: {yn(cur.signals.https)} · mobil uyum (viewport): {yn(cur.signals.viewport)} · form: {yn(cur.signals.hasForm)} · WhatsApp: {yn(cur.signals.whatsapp)}</li>
              <li>Online randevu: {cur.signals.booking.join(', ') || 'yok'} · Canlı sohbet: {cur.signals.chat.join(', ') || 'yok'}</li>
              <li>Diller: {cur.signals.hreflang.join(', ') || 'belirtilmemiş'} · Sosyal: {cur.signals.socials.join(', ') || 'yok'}</li>
              <li>Başlık: {cur.signals.title || '-'}</li><li>Açıklama: {cur.signals.description || '-'}</li>
              <li>Telefon: {cur.phone || '-'} · E-posta: {cur.email || '-'}</li></ul></div>
          <div><b>Notlar</b>
            {cur.notes.length ? <ul className="adm-meta" style={{ margin: '4px 0 8px', paddingLeft: 18 }}>{cur.notes.map((x, i) => <li key={i}>{fmtDate(x.at)}: {x.text}</li>)}</ul> : <p className="adm-meta" style={{ margin: '4px 0 8px' }}>Not yok</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><input className="adm-input" style={{ flex: '1 1 160px' }} aria-label="Yeni not" maxLength={1000} value={note} onChange={(e) => setNoteText(e.target.value)} placeholder="Not ekle…" /><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!note.trim()} onClick={() => addNote(cur.id)}>Ekle</button></div></div>
        </aside>
      </>}
    </>
  );
}
