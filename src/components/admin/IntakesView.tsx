import { useCallback, useEffect, useState } from 'react';
import type { Tab } from '../../pages/Admin';
import { api, fmtDate, type Analysis, type IntakeBrief } from './api';
import { IntakeLink, LANG_NAME, SECTORS } from './IntakeCreate';
import AnalysisPanel from './AnalysisPanel';
import { StartOffer } from './OffersView';
import { PreviewFrame, type PreviewData } from '../../site/IntakePreview';
import { download } from './analysisMd';

interface Detail { intake: IntakeBrief; formatted: { sections: { title: string; items: { no: number | null; q: string; a: string }[] }[]; consent: boolean }; markdown: string; analysis: Analysis | null; preview?: PreviewData | null }

const statusOf = (i: IntakeBrief) => i.cancelledAt ? 'İptal edildi' : i.status === 'submitted' ? 'Teslim edildi' : i.expired ? 'Süresi doldu'
  : ({ sent: 'Gönderildi', opened: 'Açıldı', in_progress: 'Dolduruluyor' } as const)[i.status as 'sent'];
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

function printDetail(d: Detail) {
  const w = window.open('', '_blank');
  if (!w) return;
  const body = d.formatted.sections.map((s) => `<h2>${esc(s.title)}</h2>${s.items.map((it) => `<p><b>${it.no ? it.no + '. ' : ''}${esc(it.q)}</b><br>${it.a ? esc(it.a).replace(/\n/g, '<br>') : '<i>—</i>'}</p>`).join('')}`).join('');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.intake.company || 'Analiz')}</title><style>body{font:14px/1.5 system-ui,sans-serif;max-width:760px;margin:24px auto;padding:0 16px;color:#111}h1{font-size:22px}h2{font-size:16px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:24px}p{margin:8px 0}</style></head><body><h1>Chioutworks · ${esc(d.intake.company || 'Analiz')}</h1><p>${esc(d.intake.contact)} · ${esc(d.intake.email)} · ${esc(d.intake.market)} · ${esc(LANG_NAME[d.intake.lang] ?? d.intake.lang)}</p>${body}<script>onload=()=>print()</script></body></html>`);
  w.document.close();
}

export default function IntakesView({ go }: { go: (t: Tab, id?: string) => void }) {
  const [list, setList] = useState<IntakeBrief[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(() => { api<{ intakes: IntakeBrief[] }>('/api/admin/intakes').then((r) => setList(r.intakes)).catch(() => { setList([]); setMsg('Liste yüklenemedi.'); }); }, []);
  useEffect(load, [load]);
  const view = useCallback((id: string) => {
    setOpenId(id); setDetail(null); setConfirm(false); setMsg(null);
    api<Detail>(`/api/admin/intakes/${id}`).then(setDetail).catch(() => setMsg('Kayıt açılamadı.'));
  }, []);
  const act = async (action: 'renew' | 'cancel') => {
    if (!openId) return;
    try { await api(`/api/admin/intakes/${openId}`, 'PATCH', { action }); view(openId); load(); }
    catch { setMsg('İşlem yapılamadı, tekrar deneyin.'); }
  };
  const remove = async () => {
    if (!openId) return;
    try { await api(`/api/admin/intakes/${openId}`, 'DELETE'); setOpenId(null); setDetail(null); load(); }
    catch { setMsg('Silinemedi, tekrar deneyin.'); }
  };

  const i = detail?.intake;
  return (
    <>
      <h1 className="adm-h1">Analiz formları</h1>
      <p className="adm-sub">{list ? `${list.length} form` : 'Yükleniyor…'} · Formu bir talebin detayından oluşturun.</p>
      {msg && !openId && <div className="adm-banner" role="alert">{msg}</div>}
      {list === null ? <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>
        : list.length === 0 ? <div className="adm-empty">Henüz analiz formu yok</div>
        : <div className="adm-list">{list.map((x) => (
          <div key={x.id} className="adm-row" aria-current={x.id === openId}>
            <button className="adm-rowmain" onClick={() => view(x.id)}>
              <span style={{ minWidth: 0, flex: '1 1 200px' }}>
                <span className="adm-name">{x.company || x.contact || 'İsimsiz'}</span><br />
                <span className="adm-meta">Oluşturuldu {fmtDate(x.createdAt)}{x.openedAt ? ` · açıldı ${fmtDate(x.openedAt)}` : ''}{x.submittedAt ? ` · teslim ${fmtDate(x.submittedAt)}` : ''}{x.updatedAt ? ` · güncellendi ${fmtDate(x.updatedAt)}` : ''}</span>
              </span>
              <span className="adm-chip tag">{statusOf(x)}</span>
              <span className="adm-chip">{LANG_NAME[x.lang] ?? x.lang}{x.secondLang ? ` + ${x.secondLang.toUpperCase()}` : ''} · {x.market}</span>
              {x.updatedAt && <span className="adm-chip tag">Güncellendi</span>}
              {x.hasAnalysis && <span className="adm-chip tag">{x.analysisStale ? 'Analiz eski' : 'Analiz var'}</span>}
            </button>
            {x.requestId && <button className="adm-link" onClick={() => go('requests', x.requestId!)}>Talebi aç</button>}
          </div>))}</div>}

      {openId && <>
        <div className="adm-drawer-bg" onClick={() => setOpenId(null)} />
        <aside className="adm-drawer" role="dialog" aria-label="Analiz formu detayı" style={{ width: 'min(620px, 100%)' }}>
          <div className="adm-head" style={{ marginBottom: 0 }}>
            <h2 className="adm-h1" style={{ fontSize: 22, margin: 0 }}>{i?.company || i?.contact || 'Analiz formu'}</h2>
            <button className="lq-btn-ghost adm-btn sm" onClick={() => setOpenId(null)}>Kapat</button>
          </div>
          {msg && <div className="adm-banner" role="alert" style={{ margin: 0 }}>{msg}</div>}
          {!detail || !i ? <div className="adm-skel" /> : <>
            <div className="adm-chips" style={{ margin: 0 }}>
              <span className="adm-chip tag">{statusOf(i)}</span>
              <span className="adm-chip">{SECTORS.find(([k]) => k === i.sector)?.[1]}</span>
              <span className="adm-chip">{LANG_NAME[i.lang]}{i.secondLang ? ` + ${LANG_NAME[i.secondLang]}` : ''} · {i.market}</span>
              <span className="adm-chip">Geçerlilik: {fmtDate(i.expiresAt)}</span>
            </div>
            {!i.cancelledAt && !i.expired && <IntakeLink b={i} defaultEmail={i.email} />}
            <div className="adm-actions">
              <button className="lq-btn-ghost adm-btn sm" onClick={() => act('renew')}>Linki yenile</button>
              {!i.cancelledAt && <button className="lq-btn-ghost adm-btn sm" onClick={() => act('cancel')}>İptal et</button>}
              {!confirm ? <button className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(true)}>Sil</button>
                : <><button className="lq-btn-ghost adm-btn sm" onClick={remove}>Evet, sil</button><button className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(false)}>Vazgeç</button></>}
              {i.requestId && <button className="lq-btn-ghost adm-btn sm" onClick={() => go('requests', i.requestId!)}>Talebi aç</button>}
              {i.status === 'submitted' && <StartOffer intakeId={i.id} onOpen={(id) => go('offers', id)} />}
            </div>
            <h3 className="adm-label" style={{ margin: '8px 0 0' }}>Yanıtlar</h3>
            <div className="adm-actions">
              <button className="lq-btn-ghost adm-btn sm" onClick={() => printDetail(detail)}>PDF / Yazdır</button>
              <button className="lq-btn-ghost adm-btn sm" onClick={() => download(`analiz-${i.id}.md`, detail.markdown)}>Markdown indir</button>
            </div>
            {detail.formatted.sections.map((s) => (
              <div key={s.title} className="lq-card adm-card">
                <h2 style={{ marginBottom: 8 }}>{s.title}</h2>
                {s.items.map((it) => (
                  <div key={it.q} className="adm-field" style={{ marginBottom: 8 }}>
                    <span className="adm-label">{it.no ? `${it.no}. ` : ''}{it.q}</span>
                    <div style={{ color: it.a ? 'var(--c-quartz)' : 'var(--c-ash)' }}>{it.a || '—'}</div>
                  </div>))}
              </div>))}
            <p className="adm-meta">Onay: {detail.formatted.consent ? 'verildi' : 'yok'}</p>
            {detail.preview && <><h3 className="adm-label" style={{ margin: '8px 0 0' }}>Müşterinin gördüğü site ön izlemesi (YZ)</h3><PreviewFrame d={detail.preview} lang={i.lang as 'tr' | 'en' | 'de' | 'el'} /></>}
            {i.updatedAt && <div className="adm-banner" role="status" style={{ margin: 0 }}>Müşteri cevaplarını teslimden sonra güncelledi ({fmtDate(i.updatedAt)}).{i.analysisStale ? ' Yapay zekâ analizi bu güncellemeden önce yapıldı; yeniden çalıştırın.' : ''}</div>}
            {i.status === 'submitted' && <AnalysisPanel type="intake" id={i.id} title={i.company || i.contact} analysis={detail.analysis}
              onDone={(a) => { setDetail({ ...detail, analysis: a }); load(); }} />}
          </>}
        </aside>
      </>}
    </>
  );
}
