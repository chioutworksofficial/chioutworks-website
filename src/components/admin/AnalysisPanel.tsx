import { useState } from 'react';
import { api, ApiError, fmtDate, type Analysis } from './api';
import { download, specMarkdown } from './analysisMd';

const Block = ({ title, items }: { title: string; items: string[] }) => items.length ? (
  <div className="adm-field"><span className="adm-label">{title}</span>
    <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: 'var(--c-quartz)' }}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
) : null;

interface Props { type: 'intake' | 'request' | 'session'; id: string; title: string; analysis?: Analysis | null; onDone: (a: Analysis) => void }

/** "Yapay zekâ analizi" button + cached report + gereksinimler.md download. */
export default function AnalysisPanel({ type, id, title, analysis, onDone }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    setBusy(true); setErr(null);
    try { const r = await api<{ analysis: Analysis }>('/api/admin/analyze', 'POST', { type, id }); onDone(r.analysis); }
    catch (x) { setErr(x instanceof ApiError && x.data?.message ? x.data.message : 'Analiz üretilemedi, tekrar deneyin.'); }
    setBusy(false);
  };
  const d = analysis?.data;
  return (
    <div className="adm-stack" style={{ gap: 12 }}>
      <div className="adm-actions">
        <button className="lq-btn-ghost adm-btn" onClick={run} disabled={busy}>{busy ? 'Analiz ediliyor…' : analysis ? 'Analizi yeniden çalıştır' : 'Yapay zekâ analizi'}</button>
        {d && <button className="lq-btn-ghost adm-btn" onClick={() => download('gereksinimler.md', specMarkdown(d, title))}>gereksinimler.md indir</button>}
      </div>
      {err && <div className="adm-banner" role="alert" style={{ margin: 0 }}>{err}</div>}
      {analysis && d && (
        <div className="lq-card adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="adm-head" style={{ margin: 0 }}>
            <h2>Yapay zekâ analizi</h2>
            <span className="adm-meta">{fmtDate(analysis.at)} · {analysis.model}</span>
          </div>
          <div className="adm-field"><span className="adm-label">Özet</span><div>{d.summary}</div></div>
          <div className="adm-field"><span className="adm-label">Önerilen çözüm</span>
            <div style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              {d.recommended.website && <span><b>Web sitesi:</b> {d.recommended.website}</span>}
              {d.recommended.automation && <span><b>Otomasyon:</b> {d.recommended.automation}</span>}
              {d.recommended.aiAssistant && <span><b>YZ asistanı:</b> {d.recommended.aiAssistant}</span>}
            </div></div>
          <Block title="Temel gereksinimler" items={d.requirements} />
          <Block title="Müşteriye sorulacaklar" items={d.openQuestions} />
          <Block title="Riskler" items={d.risks} />
          <div className="adm-field"><span className="adm-label">Karmaşıklık (fiyat yok)</span><div><span><span className="adm-chip tag">{d.complexity}</span> {d.complexityReason}</span></div></div>
          <Block title="Önerilen teknoloji" items={d.stack} />
          <p className="adm-note" style={{ margin: 0 }}>Yapay zekâ çıktısıdır; "Varsayım:" satırlarını müşteriyle doğrulayın.</p>
        </div>
      )}
    </div>
  );
}
