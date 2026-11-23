import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fmtDate } from './api';
import { download } from './analysisMd';
import { useNote } from './bulk';
import MarkdownView from './MarkdownView';

type Tool = 'audit' | 'copy' | 'seo' | 'emails' | 'proposal' | 'social';
const TOOLS: { key: Tool; label: string; desc: string; input: 'url' | 'lead' | 'topic' }[] = [
  { key: 'audit', label: 'Denetim', desc: 'Konumlandırma, açıklık, CTA, güven, SEO ve mobil puanları + 5 düzeltme.', input: 'url' },
  { key: 'copy', label: 'Metin', desc: 'Hero, CTA ve hakkında metinleri için önce/sonra.', input: 'url' },
  { key: 'seo', label: 'SEO', desc: 'Title, açıklama, başlık ve anahtar kelime önerileri.', input: 'url' },
  { key: 'emails', label: 'E-posta', desc: '3 adımlı, izin dostu B2B e-posta dizisi.', input: 'topic' },
  { key: 'proposal', label: 'Teklif', desc: 'Kayıtlı bir potansiyel müşteriye teklif taslağı (fiyatlar yer tutucu).', input: 'lead' },
  { key: 'social', label: 'Sosyal', desc: '2 haftalık gönderi planı.', input: 'topic' },
];
interface Doc { id: string; createdAt: string; tool: Tool; title: string; markdown?: string }
interface LeadLite { id: string; domain: string; analysis: { company: string } }
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? (x.status === 401 ? 'Oturum süresi doldu, yeniden giriş yapın.' : d) : d);

export default function MarketingView() {
  const [tool, setTool] = useState<Tool>('audit');
  const [url, setUrl] = useState(''); const [topic, setTopic] = useState(''); const [leadId, setLeadId] = useState('');
  const [leads, setLeads] = useState<LeadLite[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [cur, setCur] = useState<Doc | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const n = useNote();

  const load = useCallback(async () => { setDocs((await api<{ docs: Doc[] }>('/api/admin/marketing/docs')).docs); }, []);
  useEffect(() => {
    load().catch((x) => n.show({ ok: false, text: msgOf(x, 'Geçmiş yüklenemedi.') }));
    api<{ leads: LeadLite[] }>('/api/admin/sales/leads').then((r) => setLeads(r.leads)).catch(() => {});
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const t = TOOLS.find((x) => x.key === tool)!;
  const ready = t.input === 'url' ? !!(url.trim() || leadId) : t.input === 'lead' ? !!leadId : !!topic.trim();
  const run = async () => {
    setBusy(true); setCur(null);
    try {
      const body: Record<string, string> = { tool };
      if (t.input === 'url' && url.trim()) body.url = url.trim();
      if (leadId && t.input !== 'topic') body.leadId = leadId;
      if (t.input === 'topic') body.topic = topic.trim();
      setCur((await api<{ doc: Doc }>('/api/admin/marketing/run', 'POST', body)).doc); await load();
    } catch (x) { n.show({ ok: false, text: msgOf(x, 'Çalıştırılamadı.') }); }
    setBusy(false);
  };
  const openDoc = async (id: string) => { try { setCur((await api<{ doc: Doc }>(`/api/admin/marketing/docs/${id}`)).doc); window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Açılamadı.') }); } };
  const del = async (id: string) => { setConfirm(null); try { await api(`/api/admin/marketing/docs/${id}`, 'DELETE'); if (cur?.id === id) setCur(null); await load(); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Silinemedi.') }); } };
  const copy = async () => { try { await navigator.clipboard.writeText(cur?.markdown ?? ''); n.show({ ok: true, text: 'Kopyalandı.' }); } catch { n.show({ ok: false, text: 'Kopyalanamadı, elle seçin.' }); } };

  return (
    <>
      <h1 className="adm-h1">Pazarlama</h1>
      <p className="adm-sub">Site denetimi, metin, SEO, e-posta dizisi, teklif ve sosyal plan. Çıktılar yapay zekâ taslağıdır; yayımlamadan önce kontrol edin.</p>
      <div className="lq-card adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-chips">{TOOLS.map((x) => <button key={x.key} type="button" className="adm-chip" aria-pressed={tool === x.key} onClick={() => setTool(x.key)}>{x.label}</button>)}</div>
        <p className="adm-meta" style={{ margin: '0 0 10px' }}>{t.desc}</p>
        {n.el}
        <div style={{ display: 'grid', gap: 10 }}>
          {t.input === 'url' && <label className="adm-label">Web adresi<input className="adm-input" inputMode="url" placeholder="https://firma.de" value={url} onChange={(e) => setUrl(e.target.value)} /></label>}
          {t.input === 'topic' && <label className="adm-label">Konu veya teklif<textarea className="adm-input" rows={3} maxLength={500} value={topic} onChange={(e) => setTopic(e.target.value)} /></label>}
          {t.input !== 'topic' || leads.length > 0 ? <label className="adm-label">{t.input === 'lead' ? 'Potansiyel müşteri' : 'veya kayıtlı potansiyel müşteri (isteğe bağlı)'}
            <select className="adm-input" value={leadId} onChange={(e) => setLeadId(e.target.value)}><option value="">Seçin…</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.analysis.company || l.domain}</option>)}</select></label> : null}
          <div className="adm-actions"><button type="button" className="lq-btn-ghost adm-btn adm-pri" disabled={!ready || busy} onClick={run}>{busy ? 'Çalışıyor…' : 'Çalıştır'}</button></div>
        </div>
      </div>

      {cur && <div className="lq-card adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-head"><h2>{cur.title}</h2><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setCur(null)}>Kapat</button></div>
        <div className="adm-actions" style={{ marginBottom: 12 }}>
          <button type="button" className="lq-btn-ghost adm-btn sm" onClick={copy}>Kopyala</button>
          <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => download(`${cur.tool}-${cur.id}.md`, cur.markdown ?? '')}>İndir (.md)</button></div>
        <MarkdownView text={cur.markdown ?? ''} />
      </div>}

      <div className="lq-card adm-card">
        <div className="adm-head"><h2>Geçmiş</h2></div>
        {!docs.length ? <div className="adm-empty">Henüz kayıt yok</div> : <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Tarih</th><th>Başlık</th><th /></tr></thead><tbody>{docs.map((d) => (
          <tr key={d.id}><td>{fmtDate(d.createdAt)}</td><td style={{ whiteSpace: 'normal' }}>{d.title}</td>
            <td>{confirm === d.id ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>Silinsin mi?<button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={() => del(d.id)}>Evet</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(null)}>Vazgeç</button></span>
              : <span style={{ display: 'inline-flex', gap: 6 }}><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => openDoc(d.id)}>Aç</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(d.id)}>Sil</button></span>}</td></tr>))}</tbody></table></div>}
      </div>
    </>
  );
}
