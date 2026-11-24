import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError, fmtDate } from './api';
import { useNote } from './bulk';
import SiteChecksPanel from './SiteChecksPanel';
import './sales.css';

type St = 'new' | 'to_call' | 'called' | 'interested' | 'not_interested' | 'won' | 'lost';
const ST: Record<St, string> = { new: 'Yeni', to_call: 'Aranacak', called: 'Arandı', interested: 'İlgili', not_interested: 'İlgisiz', won: 'Kazanıldı', lost: 'Kaybedildi' };
type Grade = 'A' | 'B' | 'C' | 'D' | 'E';
type CStatus = 'pass' | 'partial' | 'fail' | 'na' | 'unknown';
const CS: Record<CStatus, string> = { pass: 'Geçti', partial: 'Kısmen', fail: 'Kaldı', na: 'Gerekmez', unknown: 'Ölçülemedi' };
interface Check { id: string; cat: string; label: string; status: CStatus; evidence: string; weight: number; critical?: boolean }
interface Opp { id: string; title: string; what: string; why: string; impact: string; effort: string; service: string; reason: string }
interface Scan {
  version: number; fetcher: string; at: string; pages: { url: string; status: number }[]; psi: { score: number | null; note?: string }; score: number; rawScore: number; grade: Grade; capped: string[];
  categories: { key: string; label: string; weight: number; score: number | null; n: number }[]; checks: Check[]; opportunities: Opp[]; noNeed: { label: string; reason: string }[]; unmeasured: { label: string; reason: string }[];
  priority: 'İletişime değer' | 'Belki' | 'Gerek yok'; summary: string; facts: { cms: string; lang: string; country: string; booking: string[]; chat: string[]; whatsapp: boolean; hreflang: string[]; socials: string[]; forms: number };
}
interface Analysis { company: string; city: string; country: string; sector: string; summary: string; has: string[]; missing: string[]; reasonable_cause: string; grade: Grade; grade_reason: string; first_step: string; opener: string; score?: number; priority?: string }
interface Signals { https: boolean; viewport: boolean; hasForm: boolean; booking: string[]; chat: string[]; whatsapp: boolean; hreflang: string[]; title: string; description: string; socials: string[] }
interface Lead { id: string; createdAt: string; url: string; domain: string; analysis: Analysis; signals: Signals; scan?: Scan; history?: { at: string; score: number; grade: Grade }[]; phone?: string; email?: string; status: St; tags?: string[]; notes: { at: string; text: string }[]; analyzedAt?: string }
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? (x.status === 401 ? 'Oturum süresi doldu, yeniden giriş yapın.' : d) : d);
const TAG: Record<string, string> = { opt_in: 'izinli', marketing_ok: 'pazarlama izni' };
const yn = (b: boolean) => (b ? 'Evet' : 'Hayır');
const PRIO = { 'İletişime değer': 0, Belki: 1, 'Gerek yok': 2 } as const;
const STEPS = [[0, 'Sayfalar okunuyor'], [5, 'Kontroller yapılıyor'], [11, 'Hız ölçülüyor'], [20, 'Değerlendirme yazılıyor']] as const;
const lvl = (n: number | null) => (n === null ? 'na' : n >= 80 ? 'hi' : n >= 55 ? 'mid' : 'lo');
const prioState = (p?: string) => (p === 'İletişime değer' ? 'gA' : p === 'Belki' ? 'gC' : 'new');
const dateOf = (l: Lead) => l.analyzedAt ?? l.createdAt;
/** Old records have no scan: derive what we can from the legacy shape. */
const info = (l: Lead) => ({
  score: l.scan?.score ?? l.analysis.score ?? null, prio: l.scan?.priority ?? l.analysis.priority ?? '', cms: l.scan?.facts.cms ?? '',
  booking: (l.scan ? l.scan.facts.booking : l.signals.booking).length > 0, chat: (l.scan ? l.scan.facts.chat : l.signals.chat).length > 0,
  where: l.scan?.facts.country || l.analysis.country || (l.signals.hreflang[0] ?? ''),
});
const uniq = (a: string[]) => [...new Set(a.filter(Boolean))].sort((x, y) => x.localeCompare(y, 'tr'));

function Progress({ on }: { on: boolean }) {
  const [t, setT] = useState(0);
  useEffect(() => { if (!on) { setT(0); return; } const i = setInterval(() => setT((x) => x + 1), 1000); return () => clearInterval(i); }, [on]);
  if (!on) return null;
  const cur = STEPS.reduce((a, [at], i) => (t >= at ? i : a), 0);
  return (
    <div className="sl-prog" role="status" aria-live="polite">
      <div className="sl-prog-bar"><i style={{ width: `${Math.min(95, 8 + t * 2.8)}%` }} /></div>
      <ol>{STEPS.map(([, name], i) => <li key={name} data-on={i === cur ? 1 : 0} data-done={i < cur ? 1 : 0}>{i < cur ? '✓ ' : ''}{name}</li>)}</ol>
      <span className="adm-meta">{t} sn · analiz yaklaşık 15-40 sn sürer, sayfadan ayrılmayın.</span>
    </div>
  );
}

function Report({ l, onCopy }: { l: Lead; onCopy: (t: string) => void }) {
  const sc = l.scan!; const [f, setF] = useState<CStatus | ''>('');
  const checks = sc.checks.filter((c) => !f || c.status === f);
  return (
    <>
      <div className="sl-row"><span className="adm-chip" data-state={`g${sc.grade}`}>Not {sc.grade} · {sc.score}/100</span><span className="adm-chip" data-state={prioState(sc.priority)}>{sc.priority}</span>{sc.facts.cms && <span className="adm-chip">{sc.facts.cms}</span>}</div>
      {sc.capped.length > 0 && <p className="adm-meta" style={{ margin: 0 }}>Kritik eksik nedeniyle not en fazla C: {sc.capped.join(', ')} (ham puan {sc.rawScore}).</p>}
      <p style={{ margin: 0 }}>{sc.summary}</p>
      <div className="sl-sec"><h3>Puan dağılımı</h3><div className="sl-cats">{sc.categories.map((c) => (
        <div className="sl-cat" key={c.key}><span>{c.label} <span className="adm-meta">(%{c.weight})</span></span><div className="sl-bar" data-l={lvl(c.score)}><i style={{ width: `${c.score ?? 0}%` }} /></div><b>{c.score ?? '-'}</b></div>))}</div>
        <span className="adm-meta">İçerik puanının yarısı YZ değerlendirmesidir (toplamda en fazla %7,5); geri kalan her şey ölçülen kontrollerdir.</span></div>
      <div className="sl-sec"><h3>Yapılabilir ({sc.opportunities.length})</h3>
        {sc.opportunities.length ? <div className="sl-opps">{sc.opportunities.map((o) => (
          <div className="sl-opp" key={o.id}><h4>{o.title}</h4><p>{o.what}</p>
            <p className="adm-meta"><b>Neden:</b> {o.why}</p>
            <div className="sl-row"><span className="adm-chip" data-state={o.impact === 'yüksek' ? 'gA' : o.impact === 'orta' ? 'gC' : 'new'}>Etki: {o.impact}</span><span className="adm-chip">Efor: {o.effort}</span><span className="adm-chip">{o.service}</span></div>
            <p className="adm-meta"><b>Makul sebep:</b> {o.reason}</p></div>))}</div> : <span className="adm-meta">Öne çıkan fırsat bulunamadı.</span>}</div>
      <div className="sl-sec"><h3>Gerek yok ({sc.noNeed.length})</h3>{sc.noNeed.length ? <ul className="sl-list">{sc.noNeed.map((n, i) => <li key={i}><b>{n.label}:</b> {n.reason}</li>)}</ul> : <span className="adm-meta">-</span>}</div>
      <div className="sl-sec"><h3>Ölçülemedi ({sc.unmeasured.length})</h3>{sc.unmeasured.length ? <ul className="sl-list">{sc.unmeasured.map((n, i) => <li key={i}><b>{n.label}:</b> {n.reason}</li>)}</ul> : <span className="adm-meta">Hepsi ölçüldü.</span>}</div>
      {l.analysis.opener && <div className="sl-sec"><h3>Açılış cümlesi</h3><p style={{ margin: 0 }}>{l.analysis.opener}</p><div><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => onCopy(l.analysis.opener)}>Kopyala</button></div></div>}
      <details className="sl-details"><summary>Tüm kontroller ({sc.checks.length})</summary>
        <div className="adm-chips" style={{ margin: '8px 0' }}>{(['', 'fail', 'partial', 'pass', 'unknown', 'na'] as const).map((k) => <button key={k || 'all'} type="button" className="adm-chip" aria-pressed={f === k} onClick={() => setF(k)}>{k ? `${CS[k]} (${sc.checks.filter((c) => c.status === k).length})` : 'Hepsi'}</button>)}</div>
        <div className="sl-checks">{checks.map((c) => <div className="sl-check" key={c.id}><span className="sl-st" data-s={c.status}>{CS[c.status]}</span><div>{c.label}{c.critical ? ' *' : ''}<small>{c.evidence}</small></div></div>)}</div>
        <span className="adm-meta">* kritik kontrol: kalırsa not en fazla C olur. Okunan sayfalar: {sc.pages.length}. Hız ölçümü: {sc.psi.score === null ? sc.psi.note ?? 'ölçülemedi' : `${sc.psi.score}/100`}.</span></details>
    </>
  );
}

export default function SalesView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [f, setF] = useState({ st: '', gr: '', tag: '', prio: '', sector: '', cms: '', book: '', chat: '', where: '', date: '', min: '', max: '', q: '', sort: 'date' });
  const [fOpen, setFOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [note, setNoteText] = useState('');
  const n = useNote();
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

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

  const opts = useMemo(() => ({ sector: uniq(leads.map((l) => l.analysis.sector)), cms: uniq(leads.map((l) => info(l).cms)), where: uniq(leads.map((l) => info(l).where)) }), [leads]);
  const shown = useMemo(() => {
    const q = f.q.trim().toLowerCase().replace(/^https?:\/\//, ''); const min = f.min === '' ? null : +f.min; const max = f.max === '' ? null : +f.max;
    const since = f.date ? Date.now() - +f.date * 864e5 : 0;
    const r = leads.filter((l) => {
      const i = info(l);
      return (!f.st || l.status === f.st) && (!f.gr || l.analysis.grade === f.gr) && (!f.tag || (l.tags ?? []).includes(f.tag)) && (!f.prio || i.prio === f.prio) && (!f.sector || l.analysis.sector === f.sector) && (!f.cms || i.cms === f.cms)
        && (!f.book || (f.book === 'yes') === i.booking) && (!f.chat || (f.chat === 'yes') === i.chat) && (!f.where || i.where === f.where) && (!since || Date.parse(dateOf(l)) >= since)
        && (min === null || (i.score !== null && i.score >= min)) && (max === null || (i.score !== null && i.score <= max)) && (!q || l.domain.toLowerCase().includes(q) || (l.analysis.company ?? '').toLowerCase().includes(q));
    });
    const sc = (l: Lead) => info(l).score ?? -1; const pr = (l: Lead) => PRIO[info(l).prio as keyof typeof PRIO] ?? 3;
    return r.sort((a, b) => (f.sort === 'low' ? sc(a) - sc(b) : f.sort === 'high' ? sc(b) - sc(a) : f.sort === 'prio' ? pr(a) - pr(b) || sc(a) - sc(b) : dateOf(b).localeCompare(dateOf(a))));
  }, [leads, f]);
  const cur = leads.find((l) => l.id === open);
  const why = (l: Lead) => (!l.analysis.reasonable_cause ? 'Makul sebep yok' : !l.phone ? 'Telefon bulunamadı' : '');
  const chips = (a: string[], empty: string) => (a.length ? <div className="adm-chips" style={{ marginBottom: 0 }}>{a.map((x) => <span key={x} className="adm-chip">{x}</span>)}</div> : <span className="adm-meta">{empty}</span>);
  const sel = (k: keyof typeof f, label: string, all: string, o: [string, string][]) => <select className="adm-input" aria-label={label} value={f[k]} onChange={set(k)}><option value="">{all}</option>{o.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>;
  const yesNo: [string, string][] = [['yes', 'Var'], ['no', 'Yok']];
  const btns = (l: Lead) => confirm === l.id
    ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>Silinsin mi?<button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={() => del(l.id)}>Evet</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(null)}>Vazgeç</button></span>
    : <span className="sl-btns">
      <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setOpen(l.id)}>Detay</button>
      <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!why(l)} title={why(l) || 'Arama kuyruğuna ekle'} onClick={() => toVa(l.id)}>Voice Agent kuyruğuna ekle</button>
      <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => analyze(l.url, l.id)}>{busy === l.id ? 'Analiz…' : 'Yeniden analiz'}</button>
      <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(l.id)}>Sil</button></span>;
  const gradeChip = (l: Lead) => <span className="adm-chip" data-state={`g${l.analysis.grade}`}>{l.analysis.grade}{info(l).score !== null ? ` · ${info(l).score}` : ''}</span>;
  const prioChip = (l: Lead) => (info(l).prio ? <span className="adm-chip" data-state={prioState(info(l).prio)}>{info(l).prio}</span> : <span className="adm-meta">-</span>);
  const stSel = (l: Lead) => <select className="adm-input" aria-label="Durum" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }} value={l.status} onChange={(e) => setSt(l.id, e.target.value as St)}>{(Object.keys(ST) as St[]).map((s) => <option key={s} value={s}>{ST[s]}</option>)}</select>;
  const tags = (l: Lead) => (l.tags ?? []).filter((t) => TAG[t]).map((t) => <span key={t} className="adm-chip" style={{ marginRight: 4 }}>{TAG[t]}</span>);
  const flags = (l: Lead) => `${info(l).booking ? 'Randevu' : ''}${info(l).booking && info(l).chat ? ' · ' : ''}${info(l).chat ? 'Sohbet' : ''}` || '-';

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
        <Progress on={!!busy} />
      </div>

      <div className="lq-card adm-card">
        <div className="adm-head"><h2>Potansiyel müşteriler ({shown.length}/{leads.length})</h2></div>
        <input className="adm-input" style={{ marginBottom: 8 }} aria-label="Alan adı ara" placeholder="Alan adı veya firma ara…" value={f.q} onChange={set('q')} />
        <button type="button" className="lq-btn-ghost adm-btn sm sl-ftoggle" aria-expanded={fOpen} onClick={() => setFOpen((x) => !x)}>{fOpen ? 'Filtreleri gizle' : 'Filtreler ve sıralama'}</button>
        <div className="sl-grid" data-open={fOpen ? 1 : 0}>
          <select className="adm-input" aria-label="Sırala" value={f.sort} onChange={set('sort')}><option value="date">Sırala: yeni tarih</option><option value="low">Puan: düşükten yükseğe</option><option value="high">Puan: yüksekten düşüğe</option><option value="prio">Öncelik</option></select>
          {sel('gr', 'Nota göre', 'Tüm notlar', ['A', 'B', 'C', 'D', 'E'].map((g) => [g, g]))}
          <input className="adm-input" aria-label="En düşük puan" inputMode="numeric" placeholder="Puan en az" value={f.min} onChange={set('min')} />
          <input className="adm-input" aria-label="En yüksek puan" inputMode="numeric" placeholder="Puan en çok" value={f.max} onChange={set('max')} />
          {sel('prio', 'Önceliğe göre', 'Tüm öncelikler', Object.keys(PRIO).map((p) => [p, p]))}
          {sel('sector', 'Sektöre göre', 'Tüm sektörler', opts.sector.map((x) => [x, x]))}
          {sel('cms', 'Altyapıya göre', 'Tüm altyapılar', opts.cms.map((x) => [x, x]))}
          {sel('book', 'Online randevu', 'Randevu: hepsi', yesNo)}
          {sel('chat', 'Canlı sohbet', 'Sohbet: hepsi', yesNo)}
          {sel('where', 'Ülke veya dile göre', 'Tüm ülkeler', opts.where.map((x) => [x, x]))}
          {sel('date', 'Tarihe göre', 'Tüm tarihler', [['7', 'Son 7 gün'], ['30', 'Son 30 gün'], ['90', 'Son 90 gün']])}
          {sel('st', 'Duruma göre', 'Tüm durumlar', (Object.keys(ST) as St[]).map((s) => [s, ST[s]]))}
          {sel('tag', 'Etikete göre', 'Tüm etiketler', Object.entries(TAG))}
        </div>
        {!shown.length ? <div className="adm-empty">Kayıt yok</div> : <>
          <div className="adm-table-wrap sl-table"><table className="adm-table"><thead><tr><th>Firma</th><th>Not</th><th>Öncelik</th><th>Sektör</th><th>Altyapı</th><th>Araçlar</th><th>Makul sebep</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>{shown.map((l) => (
            <tr key={l.id}>
              <td>{l.analysis.company || l.domain}<div className="adm-meta">{l.domain} · {fmtDate(dateOf(l))}</div>{tags(l)}</td>
              <td>{gradeChip(l)}</td><td>{prioChip(l)}</td><td>{l.analysis.sector || '-'}</td><td>{info(l).cms || '-'}</td><td>{flags(l)}</td>
              <td style={{ whiteSpace: 'normal', minWidth: 180, maxWidth: 260 }} title={l.analysis.reasonable_cause}>{l.analysis.reasonable_cause ? (l.analysis.reasonable_cause.length > 90 ? `${l.analysis.reasonable_cause.slice(0, 90)}…` : l.analysis.reasonable_cause) : '-'}</td>
              <td>{stSel(l)}</td><td>{btns(l)}</td>
            </tr>))}</tbody></table></div>
          <div className="sl-cards">{shown.map((l) => (
            <div className="sl-card" key={l.id}>
              <div className="sl-card-h"><div><b>{l.analysis.company || l.domain}</b><div className="adm-meta">{l.domain} · {fmtDate(dateOf(l))}</div></div>{gradeChip(l)}</div>
              <div className="sl-row">{prioChip(l)}{l.analysis.sector && <span className="adm-chip">{l.analysis.sector}</span>}{info(l).cms && <span className="adm-chip">{info(l).cms}</span>}{flags(l) !== '-' && <span className="adm-chip">{flags(l)}</span>}{tags(l)}</div>
              {l.analysis.reasonable_cause && <p className="adm-meta" style={{ margin: 0 }}>{l.analysis.reasonable_cause}</p>}
              {stSel(l)}{btns(l)}
            </div>))}</div></>}
      </div>

      <SiteChecksPanel />

      {cur && <>
        <div className="adm-drawer-bg" onClick={() => setOpen(null)} />
        <aside className="adm-drawer sl-drawer" role="dialog" aria-label="Analiz ayrıntısı">
          <div className="adm-head"><h2>{cur.analysis.company || cur.domain}</h2><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setOpen(null)}>Kapat</button></div>
          <a href={cur.url} target="_blank" rel="noopener noreferrer" className="adm-meta" style={{ overflowWrap: 'anywhere' }}>{cur.url}</a>
          <div className="sl-btns">
            <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!!busy} onClick={() => analyze(cur.url, cur.id)}>{busy === cur.id ? 'Analiz…' : 'Yeniden analiz et'}</button>
            <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!why(cur)} title={why(cur) || 'Arama kuyruğuna ekle'} onClick={() => toVa(cur.id)}>Voice Agent kuyruğuna ekle</button>
          </div>
          {busy === cur.id && <Progress on />}
          {cur.scan ? <Report l={cur} onCopy={copy} /> : <>
            <div><span className="adm-chip" data-state={`g${cur.analysis.grade}`}>Puan {cur.analysis.grade}</span> <span className="adm-meta">{cur.analysis.grade_reason}</span></div>
            <p className="adm-meta" style={{ margin: 0 }}>Eski analiz biçimi. Yeni ayrıntılı rapor için "Yeniden analiz et" düğmesini kullanın.</p>
            <p style={{ margin: 0 }}>{cur.analysis.summary || '-'}</p>
            <div><b>Var</b>{chips(cur.analysis.has, 'Belirtilmedi')}</div>
            <div><b>Eksik</b>{chips(cur.analysis.missing, 'Belirtilmedi')}</div>
            <div><b>İlk adım</b><p style={{ margin: '4px 0 0' }}>{cur.analysis.first_step || '-'}</p></div>
            <div><b>Açılış cümlesi</b><p style={{ margin: '4px 0 6px' }}>{cur.analysis.opener || '-'}</p>{cur.analysis.opener && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => copy(cur.analysis.opener)}>Kopyala</button>}</div>
          </>}
          <div><b>Makul sebep</b><p style={{ margin: '4px 0 0' }}>{cur.analysis.reasonable_cause || 'Makul sebep yok: aranamaz.'}</p></div>
          <div><b>Teknik sinyaller</b>
            <ul className="adm-meta" style={{ margin: '4px 0 0', paddingLeft: 18 }}>
              <li>https: {yn(cur.signals.https)} · mobil uyum (viewport): {yn(cur.signals.viewport)} · form: {yn(cur.signals.hasForm)} · WhatsApp: {yn(cur.signals.whatsapp)}</li>
              <li>Online randevu: {cur.signals.booking.join(', ') || 'yok'} · Canlı sohbet: {cur.signals.chat.join(', ') || 'yok'}</li>
              <li>Diller: {cur.signals.hreflang.join(', ') || 'belirtilmemiş'} · Sosyal: {cur.signals.socials.join(', ') || 'yok'}</li>
              <li>Başlık: {cur.signals.title || '-'}</li><li>Açıklama: {cur.signals.description || '-'}</li>
              <li>Telefon: {cur.phone || '-'} · E-posta: {cur.email || '-'}</li></ul></div>
          {(cur.history?.length ?? 0) > 1 && <div><b>Önceki analizler</b><ul className="adm-meta" style={{ margin: '4px 0 0', paddingLeft: 18 }}>{cur.history!.slice().reverse().map((h, i) => <li key={i}>{fmtDate(h.at)}: {h.grade} · {h.score}/100</li>)}</ul></div>}
          <div><b>Notlar</b>
            {cur.notes.length ? <ul className="adm-meta" style={{ margin: '4px 0 8px', paddingLeft: 18 }}>{cur.notes.map((x, i) => <li key={i}>{fmtDate(x.at)}: {x.text}</li>)}</ul> : <p className="adm-meta" style={{ margin: '4px 0 8px' }}>Not yok</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><input className="adm-input" style={{ flex: '1 1 160px' }} aria-label="Yeni not" maxLength={1000} value={note} onChange={(e) => setNoteText(e.target.value)} placeholder="Not ekle…" /><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!note.trim()} onClick={() => addNote(cur.id)}>Ekle</button></div></div>
        </aside>
      </>}
    </>
  );
}
