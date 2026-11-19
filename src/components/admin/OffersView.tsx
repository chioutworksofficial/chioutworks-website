import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError, fmtDate } from './api';
import { LANG_NAME, LOCAL_LINK_NOTE, isLocalOrigin } from './IntakeCreate';
const COUNTRY: Record<string, string> = { DE: '🇩🇪 Almanya', AT: '🇦🇹 Avusturya', CH: '🇨🇭 İsviçre', TR: '🇹🇷 Türkiye', AZ: '🇦🇿 Azerbaycan', GR: '🇬🇷 Yunanistan', CY: '🇨🇾 Kıbrıs', other: 'Diğer ülke' };
import { copyText } from '../../lib/uid';

type Lang = 'tr' | 'en' | 'de' | 'el';
interface Item { title: string; detail: string; amount: number }
interface PlanOption { name: string; scope: string[]; setup: number; monthly: number; effortDays: number; why: string }
interface Plan {
  summary: string; clientBudget: string | null; budgetFit: 'fits' | 'tight' | 'over' | 'unknown'; budgetReason: string;
  options: PlanOption[]; recommended: string; savings: string[]; delighters: string[]; risks: string[]; askClient: string[];
  suggestedItems: Item[]; suggestedPayment: { depositPct: number; installments: number; monthly: number; monthlyIncludes: string };
}
export interface OfferBrief {
  id: string; intakeId: string | null; requestId: string | null; lang: Lang; currency: string; company: string; contact: string; title: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined'; total: number; monthly: number; createdAt: string; sentAt: string | null; viewedAt: string | null;
  acceptedAt: string | null; paidAt: string | null; cancelledAt: string | null; unreadOwner: number; hasPlan: boolean; expired: boolean; path: string; contractAt?: string | null;
}
interface OfferFull extends OfferBrief {
  ownerNotes: string; plan: { at: string; model: string; data: Plan } | null; planChat: { role: 'owner' | 'ai'; text: string; at: string }[];
  message: string; items: Item[]; depositPct: number; installments: number; monthlyIncludes: string; validUntil: string;
  messages: { id: string; from: 'client' | 'owner'; text: string; at: string }[]; acceptedName: string | null;
  contract: { signedAt: string; signer: string; role: string; company: string; hash: string; lang: Lang } | null; contractLang: Lang;
  project?: string | null; market?: string | null; marketLang?: Lang | null; portal?: boolean | null; portalAuto?: boolean; showcase?: { allow: boolean; at: string } | null;
  billing: { on: boolean; test?: boolean; payRequestedAt?: string | null; testPaid?: boolean; invoices?: never; due: number; rest: number; customer?: boolean; subStatus?: string | null; firstPaidAt?: string | null; restUrl?: string | null; restPaidAt?: string | null; paymentFailedAt?: string | null; lastInvoiceAt?: string | null };
}

const FIT: Record<Plan['budgetFit'], string> = { fits: 'Bütçe yetiyor', tight: 'Bütçe sınırda', over: 'Bütçe yetmiyor', unknown: 'Bütçe belirsiz' };
/** Colour key for the admin: paid = green, problem (cancelled/expired/payment failed) = red */
export const offerState = (o: OfferBrief & { billing?: { paymentFailedAt?: string | null } }) => o.cancelledAt || o.expired || o.billing?.paymentFailedAt ? 'bad' : o.paidAt ? 'paid' : o.status === 'accepted' ? (o.contractAt ? 'signed' : 'accepted') : o.status === 'draft' ? 'draft' : o.viewedAt ? 'viewed' : 'sent';
export const offerStatus = (o: OfferBrief) => o.cancelledAt ? 'İptal edildi' : o.paidAt ? 'Ödendi' : o.status === 'accepted' ? (o.contractAt ? 'Sözleşme imzalandı' : 'Kabul edildi, sözleşme bekleniyor')
  : o.status === 'draft' ? 'Taslak' : o.expired ? 'Süresi doldu' : o.viewedAt ? 'Görüldü' : 'Gönderildi';
const money = (n: number, c: string) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: c || 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
const errText = (x: unknown, d: string) => (x instanceof ApiError && x.data?.message ? String(x.data.message) : d);

const List = ({ title, items }: { title: string; items: string[] }) => items.length ? (
  <div className="adm-field"><span className="adm-label">{title}</span>
    <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: 'var(--c-quartz)' }}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
) : null;

/** "Teklif hazırla": creates (or reopens the existing) offer for an intake or a request and jumps to it. */
export function StartOffer({ intakeId, requestId, onOpen }: { intakeId?: string; requestId?: string; onOpen: (id: string) => void }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const go = async () => {
    setBusy(true); setErr(null);
    try { const r = await api<{ offer: OfferBrief }>('/api/admin/offers', 'POST', intakeId ? { intakeId } : { requestId }); onOpen(r.offer.id); }
    catch (x) { setErr(errText(x, 'Teklif oluşturulamadı.')); setBusy(false); }
  };
  return <>{<button className="lq-btn-ghost adm-btn sm" onClick={go} disabled={busy}>{busy ? 'Açılıyor…' : 'Teklif hazırla'}</button>}{err && <span className="adm-meta" role="alert">{err}</span>}</>;
}

interface Props { openId: string | null; setOpenId: (id: string | null) => void; onUnread?: (n: number) => void }

/** "Teklifler": admin-only planning (AI suggestions + questions), the priced offer the client sees, and the message thread. */
export default function OffersView({ openId, setOpenId, onUnread }: Props) {
  const [list, setList] = useState<OfferBrief[] | null>(null);
  const [o, setO] = useState<OfferFull | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState(''); const [reply, setReply] = useState(''); const [confirmDel, setConfirmDel] = useState(false);

  const load = useCallback(() => {
    api<{ offers: OfferBrief[] }>('/api/admin/offers').then((r) => { setList(r.offers); onUnread?.(r.offers.reduce((s, x) => s + x.unreadOwner, 0)); })
      .catch(() => { setList([]); setMsg({ ok: false, text: 'Liste yüklenemedi.' }); });
  }, [onUnread]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    setO(null); setMsg(null); setConfirmDel(false);
    if (!openId) return;
    api<{ offer: OfferFull }>(`/api/admin/offers/${openId}`).then((r) => { setO(r.offer); load(); }).catch(() => setMsg({ ok: false, text: 'Teklif açılamadı.' }));
  }, [openId, load]);

  const total = useMemo(() => (o?.items ?? []).reduce((s, it) => s + (Number(it.amount) || 0), 0), [o?.items]);
  const set = <K extends keyof OfferFull>(k: K, v: OfferFull[K]) => setO((x) => (x ? { ...x, [k]: v } : x));
  const setItem = (i: number, patch: Partial<Item>) => set('items', (o?.items ?? []).map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const call = async (key: string, path: string, method: string, body?: unknown, okText?: string) => {
    setBusy(key); setMsg(null);
    try { const r = await api<{ offer: OfferFull }>(path, method, body); setO(r.offer); load(); if (okText) setMsg({ ok: true, text: okText }); return true; }
    catch (x) { setMsg({ ok: false, text: errText(x, 'İşlem yapılamadı, tekrar deneyin.') }); return false; }
    finally { setBusy(null); }
  };
  const draft = () => o && ({ ownerNotes: o.ownerNotes, title: o.title, message: o.message, items: o.items, depositPct: o.depositPct, installments: o.installments,
    monthly: o.monthly, monthlyIncludes: o.monthlyIncludes, validUntil: o.validUntil, currency: o.currency, lang: o.lang, portal: o.portal ?? null });
  const save = (action?: string, okText = 'Kaydedildi') => o && call(action ?? 'save', `/api/admin/offers/${o.id}`, 'PATCH', { ...draft(), ...(action ? { action } : {}) }, okText);
  const applyPlan = () => {
    const p = o?.plan?.data; if (!o || !p) return;
    setO({ ...o, items: p.suggestedItems.length ? p.suggestedItems : o.items, depositPct: p.suggestedPayment.depositPct, installments: p.suggestedPayment.installments,
      monthly: p.suggestedPayment.monthly, monthlyIncludes: p.suggestedPayment.monthlyIncludes });
    setMsg({ ok: true, text: 'Öneri teklife aktarıldı. Kontrol edip "Kaydet" deyin.' });
  };
  const link = o ? `${location.origin}${o.path}` : '';
  type Tr = { title: string; message: string; monthlyIncludes: string; items: { title: string; detail: string }[]; clientMessages: { id: string; text: string }[] };
  const [trView, setTrView] = useState<Tr | null>(null);
  const translate = async (target: 'client' | 'tr') => {
    if (!o) return; setBusy(`tr-${target}`); setMsg(null);
    try {
      const r = await api<Tr>(`/api/admin/offers/${o.id}/translate`, 'POST', { target, fields: { title: o.title, message: o.message, monthlyIncludes: o.monthlyIncludes, items: o.items } });
      if (target === 'tr') setTrView(r);
      else { setO({ ...o, title: r.title || o.title, message: r.message, monthlyIncludes: r.monthlyIncludes, items: o.items.map((it, i) => ({ ...it, title: r.items[i]?.title || it.title, detail: r.items[i]?.detail ?? it.detail })) }); setMsg({ ok: true, text: `${LANG_NAME[o.lang]} çeviri alanlara yazıldı. Kontrol edip "Kaydet" de.` }); }
    } catch (x) { setMsg({ ok: false, text: errText(x, 'Çeviri yapılamadı.') }); } finally { setBusy(null); }
  };
  const editable = o && (o.status === 'draft' || o.status === 'sent') && !o.cancelledAt;
  const p = o?.plan?.data;

  return (
    <>
      <h1 className="adm-h1">Teklifler</h1>
      <p className="adm-sub">Teklif, bir analiz formundan veya talepten "Teklif hazırla" ile oluşturulur. Planlama bölümünü yalnızca sen görürsün.</p>
      {list === null ? <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>
        : list.length === 0 ? <div className="adm-empty">Henüz teklif yok</div>
        : <div className="adm-list">{list.map((x) => (
          <div key={x.id} className="adm-row" data-state={offerState(x)} aria-current={x.id === openId}>
            <button className="adm-rowmain" onClick={() => setOpenId(x.id)}>
              <span className={`adm-dot${x.unreadOwner ? '' : ' off'}`} aria-label={x.unreadOwner ? 'Yeni mesaj veya kabul' : 'Okundu'} />
              <span style={{ minWidth: 0, flex: '1 1 200px' }}>
                <span className="adm-name" style={{ fontWeight: x.unreadOwner ? 700 : 500 }}>{x.company || x.contact || 'İsimsiz'}</span><br />
                <span className="adm-meta">Oluşturuldu {fmtDate(x.createdAt)}{x.sentAt ? ` · gönderildi ${fmtDate(x.sentAt)}` : ''}{x.acceptedAt ? ` · kabul ${fmtDate(x.acceptedAt)}` : ''}{x.contractAt ? ` · imza ${fmtDate(x.contractAt)}` : ''}</span>
              </span>
              <span className="adm-chip tag" data-state={offerState(x)}>{offerStatus(x)}</span>
              {x.total > 0 && <span className="adm-chip">{money(x.total, x.currency)}{x.monthly ? ` + ${money(x.monthly, x.currency)}/ay` : ''}</span>}
              {x.unreadOwner > 0 && <span className="adm-badge">{x.unreadOwner}</span>}
            </button>
          </div>))}</div>}

      {openId && <>
        <div className="adm-drawer-bg" onClick={() => setOpenId(null)} />
        <aside className="adm-drawer" role="dialog" aria-label="Teklif" style={{ width: 'min(760px, 100%)' }}>
          <div className="adm-head" style={{ marginBottom: 0 }}>
            <h2 className="adm-h1" style={{ fontSize: 22, margin: 0 }}>{o?.company || o?.contact || 'Teklif'}</h2>
            <button className="lq-btn-ghost adm-btn sm" onClick={() => setOpenId(null)}>Kapat</button>
          </div>
          {msg && <div className="adm-banner" role={msg.ok ? 'status' : 'alert'} style={{ margin: 0, borderColor: msg.ok ? 'var(--c-signal)' : undefined }}>{msg.text}</div>}
          {!o ? <div className="adm-skel" /> : <>
            <div className="adm-chips" style={{ margin: 0 }}>
              <span className="adm-chip tag" data-state={offerState(o)}>{offerStatus(o)}</span>
              <span className="adm-chip">{LANG_NAME[o.lang] ?? o.lang} · {o.currency}</span>
              {o.acceptedName && <span className="adm-chip">Kabul eden: {o.acceptedName}</span>}
            </div>

            {/* ── 1. Planning (owner only) ── */}
            <div className="lq-card adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="adm-head" style={{ margin: 0 }}><h2>1. Planlama (müşteri görmez)</h2>{o.plan && <span className="adm-meta">{fmtDate(o.plan.at)} · {o.plan.model}</span>}</div>
              <label className="adm-label" htmlFor="of-notes">Kendi notların (maliyetler, saat ücreti, sınırlar, müşteri hakkında bildiklerin)</label>
              <textarea id="of-notes" className="adm-input" style={{ minHeight: 80 }} value={o.ownerNotes} onChange={(e) => set('ownerNotes', e.target.value)}
                placeholder="Örn: Aylık barındırma ~5 €, ilk sürüm 2 haftada biter, bakım saati 40 €" />
              <div className="adm-actions">
                <button className="lq-btn-ghost adm-btn" disabled={!!busy} onClick={() => call('plan', `/api/admin/offers/${o.id}/plan`, 'POST', { ownerNotes: o.ownerNotes })}>
                  {busy === 'plan' ? 'Planlanıyor…' : o.plan ? 'Planı yeniden oluştur' : 'Yapay zekâ ile planla'}</button>
                {p && editable && <button className="lq-btn-ghost adm-btn" onClick={applyPlan}>Önerilen kalemleri teklife aktar</button>}
              </div>
              {p && <>
                <div className="adm-field"><span className="adm-label">Özet</span><div>{p.summary}</div></div>
                <div className="adm-field"><span className="adm-label">Bütçe</span>
                  <div style={{ flexDirection: 'column', alignItems: 'flex-start' }}><b>{FIT[p.budgetFit]}</b>{p.clientBudget && <span>Müşterinin bütçesi: {p.clientBudget}</span>}<span>{p.budgetReason}</span></div></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {p.options.map((op) => (
                    <div key={op.name} className="lq-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <b style={{ color: 'var(--c-quartz)' }}>{op.name}</b>
                      <span className="adm-meta">Kurulum {money(op.setup, o.currency)} · {money(op.monthly, o.currency)}/ay · ~{op.effortDays} gün</span>
                      <ul style={{ margin: 0, paddingLeft: 16, listStyle: 'disc', fontSize: 13 }}>{op.scope.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      <span style={{ fontSize: 13, color: 'var(--c-ash)' }}>{op.why}</span>
                    </div>))}
                </div>
                {p.recommended && <div className="adm-field"><span className="adm-label">Öneri</span><div>{p.recommended}</div></div>}
                <List title="Tasarruf yolları" items={p.savings} />
                <List title="Müşteriyi memnun edecek küçük şeyler" items={p.delighters} />
                <List title="Riskler" items={p.risks} />
                <List title="Teklif öncesi müşteriye sorulacaklar" items={p.askClient} />
                <span className="adm-label">Plana soru sor</span>
                {o.planChat.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.role === 'owner' ? 'flex-end' : 'flex-start', maxWidth: '90%', padding: '8px 12px', borderRadius: 'var(--r-card)', background: m.role === 'owner' ? 'var(--c-cobalt)' : 'var(--c-deep-sea)', whiteSpace: 'pre-wrap', fontSize: 14 }}>{m.text}</div>))}
                <div className="adm-actions" style={{ flexWrap: 'nowrap' }}>
                  <input className="adm-input" placeholder='Örn: "Ayda 30 € ile en basit hâli nasıl olur?"' value={q} onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && q.trim() && !busy) { void call('chat', `/api/admin/offers/${o.id}/plan-chat`, 'POST', { text: q.trim() }).then((ok) => ok && setQ('')); } }} />
                  <button className="lq-btn-ghost adm-btn" disabled={!q.trim() || !!busy} onClick={() => call('chat', `/api/admin/offers/${o.id}/plan-chat`, 'POST', { text: q.trim() }).then((ok) => ok && setQ(''))}>{busy === 'chat' ? '…' : 'Sor'}</button>
                </div>
              </>}
            </div>

            {/* ── 2. The offer the client sees ── */}
            <div className="lq-card adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="adm-head" style={{ margin: 0 }}><h2>2. Teklif (müşterinin göreceği)</h2></div>
              {/* only the owner sees this: where the client is and which language EVERYTHING will be sent in */}
              <div style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${o.marketLang && o.marketLang !== o.lang ? 'var(--adm-bad)' : 'var(--adm-ok)'}`, background: 'color-mix(in srgb, var(--c-deep-sea) 70%, transparent)', fontSize: 14 }}>
                <strong>Müşteri: {COUNTRY[o.market ?? ''] ?? (o.market || 'ülke bilinmiyor')}</strong> · Teklif, sözleşme, ödeme, fatura ve proje sayfası <strong>{LANG_NAME[o.lang]}</strong> gidecek.
                {' '}<span>· Referans izni: <strong>{o.showcase == null ? 'henüz seçmedi' : o.showcase.allow ? '✓ verdi (sözleşmede madde var, portföyde gösterebilirsin)' : '✗ vermedi (gösterme)'}</strong></span>
                {o.marketLang && o.marketLang !== o.lang && <div style={{ color: 'var(--adm-bad)', marginTop: 4 }}>⚠ Bu ülke için genelde {LANG_NAME[o.marketLang]} kullanılır. Müşteri {LANG_NAME[o.lang]} biliyorsa sorun yok; değilse dili {LANG_NAME[o.marketLang]} yapıp "Müşterinin diline çevir"e bas.</div>}
              </div>
              <p className="adm-meta" style={{ margin: 0 }}>İstersen Türkçe yaz, sonra "Müşterinin diline çevir" ile {LANG_NAME[o.lang]} yap. Link, metinler müşterinin dilinde değilse etkinleşmez.</p>
              <label className="adm-actions" style={{ gap: 8, fontSize: 14 }}>
                <span>Canlı proje sayfası:</span>
                <select className="adm-input" style={{ width: 'auto' }} disabled={!editable} value={o.portal === true ? 'on' : o.portal === false ? 'off' : 'auto'}
                  onChange={(e) => setO({ ...o, portal: e.target.value === 'on' ? true : e.target.value === 'off' ? false : null })}>
                  <option value="auto">Otomatik ({o.portalAuto ? 'açık: kurulum 1.000 € üstü' : 'kapalı: basit web sitesi planı'})</option>
                  <option value="on">Açık (panel / CRM / otomasyon projesi)</option>
                  <option value="off">Kapalı</option>
                </select>
              </label>
              <div className="adm-actions">
                {o.lang !== 'tr' && editable && <button className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => translate('client')}>{busy === 'tr-client' ? 'Çevriliyor…' : `Müşterinin diline çevir (${LANG_NAME[o.lang]})`}</button>}
                {o.lang !== 'tr' && <button className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => translate('tr')}>{busy === 'tr-tr' ? 'Çevriliyor…' : 'Türkçesini göster'}</button>}
              </div>
              {trView && <div style={{ padding: 12, borderRadius: 10, border: '1px dashed var(--c-hairline)', fontSize: 14 }}>
                <div className="adm-meta" style={{ marginBottom: 6 }}>Sadece senin için Türkçe çeviri (kaydedilmez, müşteri görmez) <button className="adm-chip" onClick={() => setTrView(null)}>Kapat</button></div>
                {trView.title && <div><strong>{trView.title}</strong></div>}
                {trView.message && <p style={{ whiteSpace: 'pre-wrap', margin: '6px 0' }}>{trView.message}</p>}
                <ul style={{ margin: '6px 0', paddingLeft: 18 }}>{trView.items.map((it, i) => <li key={i}>{it.title}{it.detail ? ` — ${it.detail}` : ''}</li>)}</ul>
                {trView.monthlyIncludes && <div className="adm-meta">Aylık: {trView.monthlyIncludes}</div>}
                {trView.clientMessages.length > 0 && <><div className="adm-meta" style={{ marginTop: 8 }}>Müşterinin mesajları (Türkçe):</div>{trView.clientMessages.map((m) => <p key={m.id} style={{ margin: '4px 0' }}>„{m.text}"</p>)}</>}
              </div>}
              <div className="adm-actions">
                <select className="adm-input" style={{ width: 'auto' }} aria-label="Dil" value={o.lang} disabled={!editable} onChange={(e) => set('lang', e.target.value as Lang)}>
                  {(['tr', 'en', 'de', 'el'] as Lang[]).map((l) => <option key={l} value={l}>{LANG_NAME[l]}</option>)}</select>
                <select className="adm-input" style={{ width: 'auto' }} aria-label="Para birimi" value={o.currency} disabled={!editable} onChange={(e) => set('currency', e.target.value)}>
                  {['EUR', 'TRY', 'USD'].map((c) => <option key={c}>{c}</option>)}</select>
              </div>
              <input className="adm-input" placeholder="Başlık (örn: Web sitesi ve randevu otomasyonu)" value={o.title} disabled={!editable} onChange={(e) => set('title', e.target.value)} />
              <textarea className="adm-input" style={{ minHeight: 90 }} placeholder="Müşteriye kısa mesajın" value={o.message} disabled={!editable} onChange={(e) => set('message', e.target.value)} />
              <span className="adm-label">Kalemler</span>
              {o.items.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 6, alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input className="adm-input" placeholder="Kalem" value={it.title} disabled={!editable} onChange={(e) => setItem(i, { title: e.target.value })} />
                    <input className="adm-input" placeholder="Açıklama (isteğe bağlı)" value={it.detail} disabled={!editable} onChange={(e) => setItem(i, { detail: e.target.value })} />
                  </div>
                  <input className="adm-input" type="number" min={0} step="1" aria-label="Tutar" value={it.amount} disabled={!editable} onChange={(e) => setItem(i, { amount: Number(e.target.value) })} />
                  {editable && <button className="lq-btn-ghost adm-btn sm" onClick={() => set('items', o.items.filter((_, j) => j !== i))} aria-label="Kalemi sil">Sil</button>}
                </div>))}
              {editable && <button className="lq-btn-ghost adm-btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => set('items', [...o.items, { title: '', detail: '', amount: 0 }])}>+ Kalem ekle</button>}
              <div className="adm-field"><span className="adm-label">Kurulum toplamı</span><div><b>{money(total, o.currency)}</b></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                <label className="adm-label">Peşinat %<input className="adm-input" type="number" min={0} max={100} value={o.depositPct} disabled={!editable} onChange={(e) => set('depositPct', Number(e.target.value))} /></label>
                <label className="adm-label">Kalan taksit sayısı<input className="adm-input" type="number" min={1} max={12} value={o.installments} disabled={!editable} onChange={(e) => set('installments', Number(e.target.value))} /></label>
                <label className="adm-label">Aylık ücret<input className="adm-input" type="number" min={0} value={o.monthly} disabled={!editable} onChange={(e) => set('monthly', Number(e.target.value))} /></label>
                <label className="adm-label">Geçerlilik<input className="adm-input" type="date" value={o.validUntil} disabled={!editable} onChange={(e) => set('validUntil', e.target.value)} /></label>
              </div>
              <input className="adm-input" placeholder="Aylık ücrete dahil olanlar (örn: barındırma, yedekleme, ayda 2 saat değişiklik)" value={o.monthlyIncludes} disabled={!editable} onChange={(e) => set('monthlyIncludes', e.target.value)} />
              <p className="adm-meta" style={{ margin: 0 }}>Peşinat {money(Math.round(total * o.depositPct) / 100, o.currency)} · kalan {o.installments} taksit × {money(Math.round(((total - Math.round(total * o.depositPct) / 100) / Math.max(1, o.installments)) * 100) / 100, o.currency)}</p>
              <div className="adm-actions">
                {editable && <button className="lq-btn-ghost adm-btn" disabled={!!busy} onClick={() => save()}>{busy === 'save' ? 'Kaydediliyor…' : 'Kaydet'}</button>}
                {o.status === 'draft' && !o.cancelledAt && <button className="lq-btn-ghost adm-btn" disabled={!!busy} onClick={() => save('send', 'Teklif linki etkin. Linki müşteriye gönderebilirsin.')}>Kaydet ve linki etkinleştir</button>}
              </div>
              {o.status !== 'draft' && !o.cancelledAt && (
                <div className="adm-field"><span className="adm-label">Müşteri linki</span>
                  <div className="adm-actions" style={{ flexWrap: 'nowrap' }}>
                    <input className="adm-input" readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Teklif linki" />
                    <button className="lq-btn-ghost adm-btn sm" onClick={() => { void copyText(link).then((ok) => setMsg(ok ? { ok: true, text: 'Link kopyalandı' } : { ok: false, text: 'Kopyalanamadı; linki elle seçip kopyala.' })); }}>Kopyala</button>
                    <a className="lq-btn-ghost adm-btn sm" href={o.path} target="_blank" rel="noreferrer">Aç</a>
                  </div>
                  <span className="adm-meta">Gönderildikten sonra yaptığın değişiklikler ("Kaydet") müşterinin sayfasında hemen görünür.</span>
                  {isLocalOrigin() && <span className="adm-meta" style={{ color: 'var(--c-lilac)' }}>⚠ {LOCAL_LINK_NOTE}</span>}
                </div>)}
            </div>

            {/* ── 3. Messages with the client ── */}
            <div className="lq-card adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="adm-head" style={{ margin: 0 }}><h2>3. Müşteriyle mesajlar</h2></div>
              {o.status === 'draft' && <p className="adm-meta" style={{ margin: 0 }}>Müşteri mesajları link etkinleşince görür.</p>}
              {o.messages.length === 0 ? <p className="adm-meta" style={{ margin: 0 }}>Henüz mesaj yok.</p> : o.messages.map((m) => (
                <div key={m.id} style={{ alignSelf: m.from === 'owner' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '8px 12px', borderRadius: 'var(--r-card)', background: m.from === 'owner' ? 'var(--c-cobalt)' : 'var(--c-deep-sea)', border: '1px solid var(--c-hairline)' }}>
                  <span className="adm-meta" style={{ display: 'block' }}>{m.from === 'owner' ? 'Sen' : 'Müşteri'} · {fmtDate(m.at)}</span>
                  <span style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--c-quartz)' }}>{m.text}</span>
                </div>))}
              <textarea className="adm-input" style={{ minHeight: 70 }} placeholder="Müşterinin dilinde cevap yaz" value={reply} onChange={(e) => setReply(e.target.value)} />
              <button className="lq-btn-ghost adm-btn" style={{ alignSelf: 'flex-start' }} disabled={!reply.trim() || !!busy}
                onClick={() => call('reply', `/api/admin/offers/${o.id}/messages`, 'POST', { text: reply.trim() }, 'Mesaj gönderildi').then((ok) => ok && setReply(''))}>{busy === 'reply' ? 'Gönderiliyor…' : 'Gönder'}</button>
            </div>

            {o.status === 'accepted' && (
              <div className="lq-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <strong>Sözleşme ({LANG_NAME[o.contract?.lang ?? o.contractLang] ?? o.contractLang})</strong>
                {o.contract ? (<>
                  <span className="adm-meta">İmzalayan: {o.contract.signer}{o.contract.role ? `, ${o.contract.role}` : ''} · {o.contract.company} · {fmtDate(o.contract.signedAt)}</span>
                  <span className="adm-meta" style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>Kontrol değeri: {o.contract.hash}</span>
                  <a className="lq-btn-ghost adm-btn sm" style={{ alignSelf: 'flex-start' }} href={`/api/admin/offers/${o.id}/contract`} target="_blank" rel="noreferrer">İmzalı sözleşmeyi aç / PDF kaydet</a>
                </>) : <span className="adm-meta">Müşteri teklifi kabul etti; sözleşmeyi henüz imzalamadı. Teklif linkinde imza adımını görüyor.</span>}
                <span className="adm-meta">Not: Sözleşme metni bir taslaktır; yayından önce avukat kontrolü gerekir.</span>
                <strong style={{ marginTop: 8 }}>Online ödeme (Stripe)</strong>
                {o.contract && !o.paidAt && !o.billing?.firstPaidAt && (o.billing?.payRequestedAt
                  ? <span className="adm-meta">Ödeme linki gönderildi {fmtDate(o.billing.payRequestedAt)}: müşteri teklif sayfasında "Güvenli ödemeye geç" butonunu görüyor.</span>
                  : <button className="lq-btn-ghost adm-btn" style={{ alignSelf: 'flex-start' }} disabled={!!busy} onClick={() => save('payreq', 'Ödeme linki etkin: müşteri teklif sayfasında ödeme butonunu görüyor.')}>Ödeme linki gönder</button>)}
                {!o.contract && <span className="adm-meta">Ödeme linki, müşteri sözleşmeyi imzaladıktan sonra gönderilebilir.</span>}
                {o.billing?.test && <span className="adm-meta" style={{ color: 'var(--adm-warn)' }}>🧪 Stripe bağlı değil: müşteri TEST ödemesi görür (gerçek para alınmaz). Yalnızca geliştirme ortamında; yayında asla.</span>}
                {o.billing?.testPaid && <span className="adm-chip" data-state="paid" style={{ alignSelf: 'flex-start' }}>Test ödemesi yapıldı (gerçek para değil)</span>}
                {o.project && <a className="lq-btn-ghost adm-btn sm" style={{ alignSelf: 'flex-start' }} href={o.project} target="_blank" rel="noreferrer">Müşterinin proje sayfası ↗</a>}
                {!o.billing?.on ? <span className="adm-meta">Stripe henüz kurulu değil (anahtar girilmedi). İstersen ödemeyi elle "Ödeme alındı" ile de işaretleyebilirsin; proje sayfası o anda açılır.</span> : <>
                  <span className="adm-meta">İlk ödeme: {o.billing.firstPaidAt ? `alındı ${fmtDate(o.billing.firstPaidAt)}` : `bekleniyor (${o.billing.due} ${o.currency})`}{o.monthly > 0 ? ` · aylık ${o.monthly} ${o.currency}, 2 ay sonra otomatik` : ''}</span>
                  {o.billing.subStatus && <span className="adm-meta">Abonelik durumu: {o.billing.subStatus}{o.billing.lastInvoiceAt ? ` · son fatura ödendi ${fmtDate(o.billing.lastInvoiceAt)}` : ''}</span>}
                  {o.billing.paymentFailedAt && <span className="adm-meta" style={{ color: 'var(--c-lilac)' }}>⚠ Ödeme başarısız oldu ({fmtDate(o.billing.paymentFailedAt)}). Stripe müşteriye otomatik hatırlatma gönderir.</span>}
                  {o.billing.rest > 0 && (o.billing.restPaidAt ? <span className="adm-meta">Kalan tutar ödendi {fmtDate(o.billing.restPaidAt)}</span>
                    : o.billing.firstPaidAt && <button className="lq-btn-ghost adm-btn sm" style={{ alignSelf: 'flex-start' }} disabled={!!busy}
                      onClick={() => call('rest', `/api/admin/offers/${o.id}/rest-link`, 'POST', {}, 'Kalan tutar için ödeme linki oluşturuldu; müşteri teklif sayfasında görüyor.')}>{o.billing.restUrl ? 'Kalan tutar linkini yenile' : `Kalan ${o.billing.rest} ${o.currency} için ödeme linki oluştur`}</button>)}
                </>}
              </div>)}

            <div className="adm-actions">
              {o.status === 'accepted' && !o.paidAt && <button className="lq-btn-ghost adm-btn" disabled={!!busy} onClick={() => save('paid', 'Ödeme alındı olarak işaretlendi.')}>Ödeme alındı</button>}
              {o.paidAt && <button className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => save('unpaid', 'Ödeme işareti kaldırıldı.')}>Ödeme işaretini kaldır</button>}
              {!o.cancelledAt ? <button className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => save('cancel', 'Teklif iptal edildi; link artık açılmaz.')}>Teklifi iptal et</button>
                : <button className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => save('reopen', 'Teklif yeniden açıldı.')}>Yeniden aç</button>}
              {!confirmDel ? <button className="lq-btn-ghost adm-btn sm" onClick={() => setConfirmDel(true)}>Sil</button>
                : <><button className="lq-btn-ghost adm-btn sm" onClick={async () => { try { await api(`/api/admin/offers/${o.id}`, 'DELETE'); setOpenId(null); load(); } catch { setMsg({ ok: false, text: 'Silinemedi.' }); } }}>Evet, sil</button>
                  <button className="lq-btn-ghost adm-btn sm" onClick={() => setConfirmDel(false)}>Vazgeç</button></>}
            </div>
          </>}
        </aside>
      </>}
    </>
  );
}
