import { useEffect, useMemo, useState } from 'react';
import type { Tab } from '../../pages/Admin';
import { BulkBar, Check, SelectHeader, bulkApi, useNote, useSelection } from './bulk';
import type { VoiceSession } from './api';
import { StartOffer } from './OffersView';
import ManualAdd from './ManualAdd';
import IntakeCreate from './IntakeCreate';
import AnalysisPanel from './AnalysisPanel';
import { api, fmtDate, fmtDay, TAGS, tagsOf, type Req } from './api';
import { copyText } from '../../lib/uid';

interface Props {
  reqs: Req[] | null; setReqs: (r: Req[]) => void; openId: string | null; setOpenId: (id: string | null) => void;
  go: (t: Tab, id?: string) => void; setSessions?: (fn: (s: VoiceSession[] | null) => VoiceSession[] | null) => void;
}

const csvCell = (v: unknown) => { const t = String(v ?? '').replace(/\r?\n/g, ' '); return `"${(/^[=+\-@\t]/.test(t) ? `'${t}` : t).replace(/"/g, '""')}"`; };
function roiLine(c?: Req['roiCalc']) { if (!c) return ''; const r = c.results; return `${c.sectorLabel}; ${c.staff} kişi; hafta ${r.weekH.toFixed(1)} sa; ay ${r.monthH.toFixed(1)} sa; yıl ${r.yearH.toFixed(0)} sa; ay ${Math.round(r.moneyMonth)} ${c.currency}; yıl ${Math.round(r.moneyYear)} ${c.currency}`; }
function exportCsv(rows: Req[]) {
  const head = ['Tarih', 'Tür', 'Ad', 'E-posta', 'Telefon', 'İşletme', 'Adres', 'Mesaj', 'Dil', 'Sayfa', 'Demo', 'Modüller', 'Başlangıç', 'Arama saati', 'Cevap tercihi', 'Konu', 'Okundu', 'Tasarruf hesabı'];
  const body = rows.map((r) => [r.createdAt, r.kind ?? 'quote', r.name, r.email, r.phone, r.business, r.address, r.message, r.lang, r.page, r.demo, r.modules?.join(', '), r.preferredStart, r.callTime, r.replyPreference, r.topic, r.read ? 'evet' : 'hayır', roiLine(r.roiCalc)].map(csvCell).join(','));
  const url = URL.createObjectURL(new Blob(['\uFEFF' + [head.map(csvCell).join(','), ...body].join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `talepler-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
}

function Field({ label, value, copy }: { label: string; value?: string; copy?: boolean }) {
  const [ok, setOk] = useState(false);
  if (!value) return null;
  return (
    <div className="adm-field">
      <span className="adm-label">{label}</span>
      <div>
        <span>{value}</span>
        {copy && <button className="lq-btn-ghost adm-btn sm" onClick={() => { void copyText(value).then((k) => { if (k) { setOk(true); setTimeout(() => setOk(false), 1500); } }); }}>{ok ? 'Kopyalandı' : 'Kopyala'}</button>}
      </div>
    </div>
  );
}

function RoiTable({ c }: { c: NonNullable<Req['roiCalc']> }) {
  const loc = ({ tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' } as Record<string, string>)[c.lang] ?? 'en-GB';
  const n = (v: number) => new Intl.NumberFormat(loc, { maximumFractionDigits: v < 100 ? 1 : 0 }).format(v);
  const m = (v: number) => new Intl.NumberFormat(loc, { style: 'currency', currency: c.currency, maximumFractionDigits: 0 }).format(v);
  const r = c.results;
  return (
    <div className="adm-field">
      <span className="adm-label">Tasarruf hesabı · {c.sectorLabel} · {c.staff} kişi · {m(c.cost)}/sa · dil {c.lang.toUpperCase()}</span>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead><tr style={{ textAlign: 'left', color: 'var(--c-ash)' }}><th>Görev</th><th>dk</th><th>Hafta</th><th>%</th></tr></thead>
        <tbody>{c.tasks.map((t, i) => <tr key={i}><td>{t.name || '-'}</td><td>{n(t.min)}</td><td>{n(t.perWeek)}</td><td>{n(t.auto)}</td></tr>)}</tbody>
      </table>
      <span>Hafta {n(r.weekH)} sa · Ay {n(r.monthH)} sa · Yıl {n(r.yearH)} sa · {n(r.days)} iş günü</span>
      <span>Ay {m(r.moneyMonth)} · Yıl {m(r.moneyYear)}</span>
    </div>
  );
}

/** Top of a request: what the client wants, in one look (owner, 2026-11-17). */
function WantBox({ r, style }: { r: Req; style: string }) {
  const need = r.analysis?.data?.summary || r.topic || r.message?.split('\n')[0] || (r.modules?.length ? r.modules.join(', ') : '') || (r.kind === 'demo-request' ? `Demo: ${r.demo}` : '');
  const rows: [string, string | undefined][] = [
    ['Ne istiyor', need ? need.slice(0, 220) : undefined],
    ['Tarz', style || undefined],
    ['İşletme / yer', [r.business, r.address].filter(Boolean).join(' · ') || undefined],
    ['Dil', r.lang?.toUpperCase()],
  ];
  if (!rows.some(([, v]) => v)) return null;
  return (
    <div style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid var(--adm-src-form)', background: 'color-mix(in srgb, var(--adm-src-form) 10%, transparent)', display: 'grid', gap: 6 }}>
      <strong style={{ fontSize: 13 }}>Müşteri ne istiyor</strong>
      {rows.filter(([, v]) => v).map(([k, v]) => <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8, fontSize: 14 }}><span className="adm-meta">{k}</span><span>{v}</span></div>)}
      {!style && <span className="adm-meta">Tarz seçimi yok (müşteri "Tarzımı seç" sayfasını doldurmadı).</span>}
    </div>
  );
}

export default function RequestsView({ reqs, setReqs, openId, setOpenId, go, setSessions }: Props) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'new' | 'read'>('all');
  const [tag, setTag] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (reqs ?? []).filter((r) => {
      if (status === 'new' && r.read) return false;
      if (status === 'read' && !r.read) return false;
      if (tag && tagsOf(r)[0]?.key !== tag) return false;
      return !s || [r.name, r.email, r.phone, r.business, r.message].some((v) => v?.toLowerCase().includes(s));
    });
  }, [reqs, q, status, tag]);

  const sel = useSelection(list.map((r) => r.id));
  const note = useNote();
  const bulk = async (action: 'read' | 'unread' | 'delete') => {
    const ids = sel.sel; const prev = reqs ?? []; const set = new Set(ids);
    setReqs(action === 'delete' ? prev.filter((x) => !set.has(x.id)) : prev.map((x) => set.has(x.id) ? { ...x, read: action === 'read' } : x));
    if (action === 'delete') setSessions?.((ss) => ss && ss.map((v) => v.contactId && set.has(v.contactId) ? { ...v, contactId: undefined, contactSubmitted: false } : v));
    sel.clear();
    try {
      const n = await bulkApi('/api/admin/quote-requests/bulk', ids, action);
      note.show({ ok: true, text: action === 'delete' ? `${n} kayıt silindi` : `${n} kayıt ${action === 'read' ? 'okundu' : 'okunmadı'} yapıldı` });
    } catch { setReqs(prev); note.show({ ok: false, text: 'Toplu işlem yapılamadı, tekrar deneyin.' }); }
  };

  const open = (reqs ?? []).find((r) => r.id === openId) ?? null;
  const [styles, setStyles] = useState<{ ref: string; requestId: string | null; summary: string }[]>([]);
  useEffect(() => { api<{ styles: { ref: string; requestId: string | null; summary: string }[] }>('/api/admin/styles').then((j) => setStyles(j.styles)).catch(() => {}); }, [openId]);
  const styleOf = (r: Req) => styles.find((s) => s.requestId === r.id || (r.voiceSessionId && s.ref === `voice:${r.voiceSessionId}`))?.summary ?? '';
  const close = () => { setOpenId(null); setConfirm(false); setMsg(null); };
  const mark = async (r: Req, read: boolean) => {
    setMsg(null);
    try { await api(`/api/admin/quote-requests/${r.id}`, 'PATCH', { read }); setReqs((reqs ?? []).map((x) => x.id === r.id ? { ...x, read } : x)); }
    catch { setMsg('İşlem yapılamadı, tekrar deneyin.'); }
  };
  const remove = async (r: Req) => {
    try { await api(`/api/admin/quote-requests/${r.id}`, 'DELETE'); setReqs((reqs ?? []).filter((x) => x.id !== r.id)); close(); }
    catch { setMsg('Silinemedi, tekrar deneyin.'); }
  };

  return (
    <>
      <h1 className="adm-h1">Talepler</h1>
      <p className="adm-sub">{reqs ? `${reqs.length} talep` : 'Yükleniyor…'}</p>
      <ManualAdd onAdded={(r) => { setReqs([r, ...(reqs ?? [])]); setOpenId(r.id); setConfirm(false); setMsg(null); }} />
      <input className="adm-input" style={{ marginBottom: 12 }} type="search" placeholder="Ad, e-posta, telefon veya mesajda ara" aria-label="Ara" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="adm-chips" role="group" aria-label="Durum">
        {([['all', 'Tümü'], ['new', 'Yeni'], ['read', 'Okundu']] as const).map(([k, l]) => (
          <button key={k} className="adm-chip" aria-pressed={status === k} onClick={() => setStatus(k)}>{l}</button>))}
      </div>
      <div className="adm-chips" role="group" aria-label="Nereden geldi">
        {TAGS.map((t) => <button key={t.key} className="adm-chip" data-src={t.key} aria-pressed={tag === t.key} onClick={() => setTag(tag === t.key ? null : t.key)}>{t.label}</button>)}
      </div>
      {note.el}
      <SelectHeader s={sel} total={list.length} />
      {reqs === null ? <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /><div className="adm-skel" /></div>
        : list.length === 0 ? <div className="adm-empty">{reqs.length === 0 ? 'Henüz talep yok' : 'Aramanıza uyan talep yok'}</div>
        : <div className="adm-list">{list.map((r) => (
          <div key={r.id} className={`adm-row${sel.has(r.id) ? ' sel' : ''}`} aria-current={r.id === openId} data-src={tagsOf(r)[0]?.key}>
            <Check checked={sel.has(r.id)} label={`Seç: ${r.name || r.email || 'İsimsiz'}`} onToggle={(sh) => sel.toggle(r.id, sh)} />
            <button className="adm-rowmain" onClick={() => { setOpenId(r.id); setConfirm(false); setMsg(null); }}>
            <span className={`adm-dot${r.read ? ' off' : ''}`} aria-label={r.read ? 'Okundu' : 'Yeni'} />
            <span style={{ minWidth: 0, flex: '1 1 180px' }}>
              <span className="adm-name" style={{ fontWeight: r.read ? 500 : 700 }}>{r.name || r.email || 'İsimsiz'}</span><br />
              <span className="adm-meta">{fmtDate(r.createdAt)}</span>
            </span>
            <span className="adm-chip tag" data-src={tagsOf(r)[0]?.key}>{tagsOf(r)[0]?.label}</span>
            {r.preferredStart && <span className="adm-meta">Başlangıç: {fmtDay(r.preferredStart)}</span>}
            {r.kind === 'contact' && <span className="adm-meta">{r.replyPreference === 'phone' ? 'Telefon' : 'Yazılı cevap'}</span>}
            </button>
          </div>))}</div>}
      <BulkBar count={sel.sel.length} onDelete={() => bulk('delete')}>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => bulk('read')}>Okundu yap</button>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => bulk('unread')}>Okunmadı yap</button>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => exportCsv((reqs ?? []).filter((r) => sel.has(r.id)))}>Dışa aktar (CSV)</button>
      </BulkBar>

      {open && <>
        <div className="adm-drawer-bg" onClick={close} />
        <aside className="adm-drawer" role="dialog" aria-label="Talep detayı">
          <div className="adm-head" style={{ marginBottom: 0 }}>
            <h2 className="adm-h1" style={{ fontSize: 22, margin: 0 }}>{open.name || 'İsimsiz'}</h2>
            <button className="lq-btn-ghost adm-btn sm" onClick={close}>Kapat</button>
          </div>
          <div className="adm-chips" style={{ margin: 0 }}>{tagsOf(open).map((t) => <span key={t.label} className="adm-chip tag" data-src={t.key}>{t.label}</span>)}</div>
          {msg && <div className="adm-banner" role="alert" style={{ margin: 0 }}>{msg}</div>}
          <WantBox r={open} style={styleOf(open)} />
          <Field label="Tarih" value={fmtDate(open.createdAt)} />
          <Field label="E-posta" value={open.email} copy />
          <Field label="Telefon" value={open.phone} copy />
          <Field label="İşletme" value={open.business} />
          <Field label="Şehir / bölge" value={open.city} />
          <Field label="Adres" value={open.address} />
          <Field label="Mevcut web sitesi" value={open.existingSite} />
          <Field label="İletişim zamanı" value={open.contactWhen && ({ morning: 'Sabah', afternoon: 'Öğleden sonra', evening: 'Akşam', any: 'Fark etmez' } as Record<string, string>)[open.contactWhen]} />
          <Field label="Başlama isteği" value={open.startWhen && ({ asap: 'En kısa sürede', '1m': '1 ay içinde', '3m': '3 ay içinde', explore: 'Sadece bakıyor' } as Record<string, string>)[open.startWhen]} />
          <Field label="Bütçe" value={open.budget && ({ b1: '1.000 € altı', b2: '1.000 – 3.000 €', b3: '3.000 – 10.000 €', b4: '10.000 € üzeri', unsure: 'Emin değil' } as Record<string, string>)[open.budget]} />
          <Field label="Ek notlar" value={open.notes} />
          <Field label="Örnek siteler" value={open.examples && (open.examples.none ? 'Örnek yok' : [...open.examples.urls, open.examples.note && `Neyini beğendi: ${open.examples.note}`].filter(Boolean).join('\n'))} />
          <Field label="Başlangıç tarihi" value={open.preferredStart && fmtDay(open.preferredStart)} />
          <Field label="Arama saati" value={open.callTime} />
          <Field label="Cevap tercihi" value={open.kind === 'contact' ? (open.replyPreference === 'phone' ? 'Gerekirse telefon' : 'Yazılı cevap') : undefined} />
          <Field label="Mesaj" value={open.message} />
          {open.roiCalc && <RoiTable c={open.roiCalc} />}
          <Field label="Modüller" value={open.modules?.join(', ')} />
          <Field label="Demo" value={open.kind === 'demo-request' ? open.demo : undefined} />
          <Field label="Dil" value={open.lang?.toUpperCase()} />
          <IntakeCreate key={open.id} req={open} onOpenList={() => go('intakes')} />
          <AnalysisPanel key={`a-${open.id}`} type="request" id={open.id} title={open.business || open.name || 'Talep'} analysis={open.analysis}
            onDone={(a) => setReqs((reqs ?? []).map((x) => x.id === open.id ? { ...x, analysis: a } : x))} />
          <div className="adm-actions">
            {open.voiceSessionId && <button className="lq-btn-ghost adm-btn" onClick={() => go('voice', open.voiceSessionId)}>Sesli görüşme</button>}
            <StartOffer requestId={open.id} onOpen={(id) => go('offers', id)} />
            <button className="lq-btn-ghost adm-btn" onClick={() => mark(open, !open.read)}>{open.read ? 'Yeni olarak işaretle' : 'Okundu olarak işaretle'}</button>
            {!confirm
              ? <button className="lq-btn-ghost adm-btn" onClick={() => setConfirm(true)}>Sil</button>
              : <>
                  <span className="adm-meta">Bu talep kalıcı olarak silinecek.</span>
                  <button className="lq-btn-ghost adm-btn" onClick={() => remove(open)}>Evet, sil</button>
                  <button className="lq-btn-ghost adm-btn" onClick={() => setConfirm(false)}>Vazgeç</button>
                </>}
          </div>
        </aside>
      </>}
    </>
  );
}
