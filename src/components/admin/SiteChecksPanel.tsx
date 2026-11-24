import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fmtDate } from './api';
import { useNote } from './bulk';
import MarkdownView from './MarkdownView';

interface Check { id: string; createdAt: string; kind: 'site' | 'roi'; status: 'pending' | 'pending_mail' | 'confirmed' | 'sent'; email: string; url: string; domain: string; company: string; marketing: boolean; lang: string; error: string; confirmedAt: string; sentAt: string; hasReport: boolean }
interface Sub { id: string; email: string; lang: string; source: string; status: 'pending' | 'active' | 'unsubscribed'; createdAt: string; confirmedAt: string | null; unsubscribedAt: string | null }
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? d : d);
const statusOf = (c: Check) => (c.status === 'pending' ? 'bekliyor' : c.status === 'pending_mail' ? 'e-posta bekliyor' : c.status === 'sent' ? 'rapor gönderildi' : c.error === 'mail' ? 'onaylandı · rapor e-postası bekliyor' : c.error === 'fetch' ? 'onaylandı · site okunamadı' : c.error === 'llm' ? 'onaylandı · analiz yapılamadı' : 'onaylandı');
const SUB: Record<Sub['status'], string> = { pending: 'onay bekliyor', active: 'aktif', unsubscribed: 'abonelikten çıktı' };

export default function SiteChecksPanel() {
  const [items, setItems] = useState<Check[]>([]); const [mailReady, setMailReady] = useState(true);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [md, setMd] = useState<{ title: string; text: string } | null>(null);
  const [del, setDel] = useState<string | null>(null); const [delSub, setDelSub] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const n = useNote();

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([api<{ items: Check[]; mailReady: boolean }>('/api/admin/site-checks'), api<{ subscribers: Sub[] }>('/api/admin/newsletter')]);
    setItems(a.items); setMailReady(a.mailReady); setSubs(b.subscribers);
  }, []);
  useEffect(() => { load().catch((x) => n.show({ ok: false, text: msgOf(x, 'Liste yüklenemedi.') })); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const act = async (key: string, fn: () => Promise<unknown>, okText: string, fail: string) => { setBusy(key); try { const r = (await fn()) as { ok?: boolean; message?: string } | undefined; await load(); n.show({ ok: r?.ok !== false, text: r?.message ?? okText }); } catch (x) { n.show({ ok: false, text: msgOf(x, fail) }); } setBusy(null); };
  const view = async (c: Check) => { try { const r = await api<{ markdown: string }>(`/api/admin/site-checks/${c.id}`); setMd({ title: c.domain || c.email, text: r.markdown }); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Rapor açılamadı.') }); } };
  const resend = (c: Check) => act(c.id, () => api(`/api/admin/site-checks/${c.id}/resend`, 'POST'), 'E-posta gönderildi.', 'Gönderilemedi.');
  const remove = (c: Check) => { setDel(null); return act(c.id, () => api(`/api/admin/site-checks/${c.id}`, 'DELETE'), 'Kayıt, potansiyel müşteri girişi ve onay kanıtı silindi.', 'Silinemedi.'); };
  const count = (s: Sub['status']) => subs.filter((x) => x.status === s).length;

  return (
    <>
      <div className="lq-card adm-card" style={{ marginTop: 16 }}>
        <div className="adm-head"><h2>Site kontrolleri ({items.length})</h2></div>
        {n.el}
        {!mailReady && <p className="adm-meta" style={{ marginTop: 0 }}>E-posta gönderimi kapalı (Resend anahtarı veya doğrulanmış alan adı yok): kayıtlar “e-posta bekliyor” durumunda kalır.</p>}
        {!items.length ? <div className="adm-empty">Kayıt yok</div> : <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Tarih</th><th>E-posta</th><th>Adres</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>{items.map((c) => (
          <tr key={c.id}>
            <td>{fmtDate(c.createdAt)}</td>
            <td>{c.email}{c.marketing && <div className="adm-meta">pazarlama izni</div>}</td>
            <td style={{ whiteSpace: 'normal', overflowWrap: 'anywhere', maxWidth: 240 }}>{c.kind === 'roi' ? 'Tasarruf hesaplayıcı' : c.url}{c.company && <div className="adm-meta">{c.company}</div>}</td>
            <td><span className="adm-chip">{statusOf(c)}</span></td>
            <td>{del === c.id ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>Kayıt + potansiyel müşteri + onay kanıtı silinsin mi?<button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={() => remove(c)}>Evet</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setDel(null)}>Vazgeç</button></span>
              : <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                {c.hasReport && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => view(c)}>Raporu gör</button>}
                {!(c.kind === 'roi' && c.confirmedAt) && <button type="button" className="lq-btn-ghost adm-btn sm" disabled={busy === c.id} onClick={() => resend(c)}>{busy === c.id ? 'Gönderiliyor…' : c.confirmedAt ? 'Raporu yeniden gönder' : 'Onay e-postasını yeniden gönder'}</button>}
                <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setDel(c.id)}>Sil</button></span>}</td>
          </tr>))}</tbody></table></div>}
        {md && <div style={{ marginTop: 14 }}><div className="adm-head"><h2 style={{ fontSize: 15 }}>Rapor: {md.title}</h2><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setMd(null)}>Kapat</button></div><MarkdownView text={md.text || 'Rapor henüz yok.'} /></div>}
      </div>

      <div className="lq-card adm-card" style={{ marginTop: 16 }}>
        <div className="adm-head"><h2>Bülten aboneleri ({subs.length})</h2></div>
        <p className="adm-meta" style={{ marginTop: 0 }}>Aktif {count('active')} · onay bekleyen {count('pending')} · abonelikten çıkan {count('unsubscribed')}</p>
        {!subs.length ? <div className="adm-empty">Abone yok</div> : <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>E-posta</th><th>Durum</th><th>Dil</th><th>Kaynak</th><th>Tarih</th><th>İşlem</th></tr></thead><tbody>{subs.map((s) => (
          <tr key={s.id}>
            <td>{s.email}</td><td>{SUB[s.status]}</td><td>{s.lang}</td><td>{s.source}</td><td>{fmtDate(s.createdAt)}</td>
            <td>{delSub === s.id ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>Silinsin mi?<button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={() => { setDelSub(null); void act(s.id, () => api(`/api/admin/newsletter/${s.id}`, 'DELETE'), 'Abone silindi.', 'Silinemedi.'); }}>Evet</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setDelSub(null)}>Vazgeç</button></span>
              : <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                {s.status !== 'unsubscribed' && <button type="button" className="lq-btn-ghost adm-btn sm" disabled={busy === s.id} onClick={() => act(s.id, () => api(`/api/admin/newsletter/${s.id}/unsubscribe`, 'POST'), 'Abonelikten çıkarıldı.', 'İşlem başarısız.')}>Abonelikten çıkar</button>}
                <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setDelSub(s.id)}>Sil</button></span>}</td>
          </tr>))}</tbody></table></div>}
      </div>
    </>
  );
}
