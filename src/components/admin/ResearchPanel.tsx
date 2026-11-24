import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, fmtDate } from './api';
import { useNote } from './bulk';

type RL = 'tr' | 'en' | 'de' | 'el';
const RLS: RL[] = ['tr', 'en', 'de', 'el'];
const CAT: Record<string, string> = { cms: 'Site altyapısı', shop: 'Mağaza', booking: 'Randevu', chat: 'Sohbet', analytics: 'Analitik', tagmanager: 'Etiket yöneticisi', ads: 'Reklam', crm: 'CRM / e-posta', payment: 'Ödeme', hosting: 'Barındırma / CDN', consent: 'Çerez onayı', framework: 'Yazılım çatısı' };
const PKG: Record<string, string> = { automation: 'Otomasyon', webapps: 'Web uygulaması', ai: 'YZ entegrasyonu', strategy: 'Dijital strateji' };
const PART: Record<string, string> = { pages: 'okunan sayfalar', tech: 'teknoloji izleri', pixels: 'reklam pikselleri', socials: 'sosyal bağlantılar', langs: 'site dilleri', spend: 'aylık araç gideri aralıkları', profile: 'YZ ile çıkarılan profil, zayıf yönler, fırsatlar, sorular', metaads: 'Meta reklam kitaplığı', rendered: 'tarayıcıyla görüntüleme', llm: 'içerik analizi' };
interface Finding { title: string; detail: string; src: string[] }
interface Opp { pkg: string; title: string; why: string; offer: string; impact: string; src: string[] }
export interface Research {
  id: string; createdAt: string; leadId: string; url: string; domain: string; company: string; lang: RL; crawler: string; estCostUsd: number;
  pages: { url: string; title: string; words: number }[]; tech: { name: string; cat: string; evidence: string }[];
  spend: { lo: number; hi: number; items: { name: string; lo: number; hi: number }[]; unpriced: string[] };
  ads: { pixels: string[]; meta: { status: string; note: string; items: { page: string; title: string; url: string; date: string | null }[] } }; socials: string[]; siteLangs: string[]; hiringUrls: string[];
  profile: { sells: string; customers: string; pricing: string[]; team: string[]; locations: string[]; languages: string[]; hiring: string; news: string };
  weaknesses: Finding[]; opportunities: Opp[]; openers: string[]; questions: string[]; risks: string[]; measured: string[]; estimated: string[]; unmeasured: string[];
}
interface Status { on: boolean; budget: { limit: number; spent: number; remaining: number; source: string }; estimates: { render: number; research: { low: number; high: number } } }
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? d : d);
const usd = (n: number) => `$${n.toFixed(2)}`;
const part = (a: string[]) => (a.length ? a.map((k) => PART[k] ?? k).join(', ') : '-');
const Src = ({ urls, pages }: { urls: string[]; pages: Research['pages'] }) => (
  <span className="adm-meta"> Kanıt: {urls.map((u, i) => <a key={u} href={u} target="_blank" rel="noopener noreferrer">{`P${pages.findIndex((p) => p.url === u) + 1 || i + 1}`}{i < urls.length - 1 ? ', ' : ''}</a>)}</span>
);
const Row = ({ k, v }: { k: string; v: string | string[] }) => { const s = Array.isArray(v) ? v.join('; ') : v; return s ? <li><b>{k}:</b> {s}</li> : null; };

export function ResearchReport({ r }: { r: Research }) {
  const cats = [...new Set(r.tech.map((t) => t.cat))]; const p = r.profile;
  return (
    <div className="sl-rs">
      <div className="sl-row"><span className="adm-chip">{r.lang.toUpperCase()}</span><span className="adm-chip">{r.crawler === 'cheerio' ? 'Hızlı tarama' : 'Tarayıcıyla tarama'}</span><span className="adm-chip">{r.pages.length} sayfa</span><span className="adm-chip">Tahmini maliyet {usd(r.estCostUsd)}</span><span className="adm-meta">{fmtDate(r.createdAt)}</span></div>
      <div className="sl-sec"><h3>Ne yapıyor, kime satıyor</h3>
        <ul className="sl-list"><Row k="Sunduğu" v={p.sells} /><Row k="Hedef müşteri" v={p.customers} /><Row k="Fiyat sinyalleri" v={p.pricing} /><Row k="Ekip sinyalleri" v={p.team} /><Row k="Konumlar" v={p.locations} /><Row k="Diller" v={[...new Set([...p.languages, ...r.siteLangs])]} /><Row k="İşe alım" v={p.hiring} /><Row k="Blog ve haber" v={p.news} /><Row k="Sosyal" v={r.socials} /></ul></div>
      <div className="sl-sec"><h3>Kullandığı teknoloji <span className="adm-chip" data-state="gA">ölçüldü</span></h3>
        {r.tech.length ? <ul className="sl-list">{cats.map((c) => <li key={c}><b>{CAT[c] ?? c}:</b> {r.tech.filter((t) => t.cat === c).map((t) => t.name).join(', ')}</li>)}</ul> : <span className="adm-meta">Teknoloji izi bulunamadı.</span>}</div>
      <div className="sl-sec"><h3>Tahmini aylık araç gideri <span className="adm-chip" data-state="gC">tahmini</span></h3>
        {r.spend.items.length ? <><p style={{ margin: 0 }}><b>≈ {r.spend.lo}-{r.spend.hi} €</b> / ay</p><ul className="sl-list">{r.spend.items.map((i) => <li key={i.name}>{i.name}: ≈ {i.lo}-{i.hi} €</li>)}</ul></> : <span className="adm-meta">Fiyatı bilinen ücretli araç tespit edilmedi.</span>}
        {r.spend.unpriced.length > 0 && <span className="adm-meta">Fiyat aralığı tanımlı değil: {r.spend.unpriced.join(', ')}.</span>}
        <span className="adm-meta">Herkese açık liste fiyatlarından kabaca aralık; gerçek plan, indirim ve kullanım bilinmiyor. Gerçek değil, tahmindir.</span></div>
      <div className="sl-sec"><h3>Reklam etkinliği</h3>
        <p style={{ margin: 0 }}>{r.ads.pixels.length ? <>Reklam pikselleri <span className="adm-chip" data-state="gA">ölçüldü</span>: {r.ads.pixels.join(', ')}</> : 'Sitede reklam pikseli bulunamadı.'}</p>
        {r.ads.meta.status === 'unmeasured' ? <span className="adm-meta">Meta reklam kitaplığı: {r.ads.meta.note}</span> : <><span className="adm-meta">{r.ads.meta.note}</span>{r.ads.meta.items.length > 0 && <ul className="sl-list">{r.ads.meta.items.map((i) => <li key={i.url}><a href={i.url} target="_blank" rel="noopener noreferrer">{i.page}: {i.title}</a>{i.date ? ` (${i.date.slice(0, 10)})` : ''}</li>)}</ul>}</>}</div>
      <div className="sl-sec"><h3>Zayıf yönler ({r.weaknesses.length})</h3>
        {r.weaknesses.length ? <div className="sl-opps">{r.weaknesses.map((w, i) => <div className="sl-opp" key={i}><h4>{w.title}</h4><p>{w.detail}</p><Src urls={w.src} pages={r.pages} /></div>)}</div> : <span className="adm-meta">Kanıtlı zayıf yön çıkarılamadı.</span>}</div>
      <div className="sl-sec"><h3>Fırsatlar ve Chioutworks paketleri ({r.opportunities.length})</h3>
        {r.opportunities.length ? <div className="sl-opps">{r.opportunities.map((o, i) => <div className="sl-opp" key={i}><h4>{o.title}</h4><p>{o.why}</p>
          <div className="sl-row"><span className="adm-chip">{PKG[o.pkg] ?? o.pkg}</span>{o.offer && <span className="adm-chip">{o.offer}</span>}<span className="adm-chip" data-state={o.impact === 'yüksek' ? 'gA' : o.impact === 'orta' ? 'gC' : 'new'}>Etki: {o.impact}</span></div><Src urls={o.src} pages={r.pages} /></div>)}</div> : <span className="adm-meta">-</span>}</div>
      {([['Konuşma açılışları', r.openers], ['Toplantıda sorulacak sorular', r.questions], ['Riskler', r.risks]] as const).map(([t, a]) => a.length > 0 && <div className="sl-sec" key={t}><h3>{t}</h3><ul className="sl-list">{a.map((x, i) => <li key={i}>{x}</li>)}</ul></div>)}
      <details className="sl-details"><summary>Kaynak sayfalar ({r.pages.length})</summary><ul className="sl-list">{r.pages.map((pg, i) => <li key={pg.url}>P{i + 1} <a href={pg.url} target="_blank" rel="noopener noreferrer" style={{ overflowWrap: 'anywhere' }}>{pg.url}</a></li>)}</ul></details>
      <p className="adm-meta" style={{ margin: 0 }}><b>Ölçülen:</b> {part(r.measured)}. <b>Tahmin:</b> {part(r.estimated)}. <b>Ölçülemedi:</b> {part(r.unmeasured)}.</p>
    </div>
  );
}

/** Owner-triggered Apify actions for one lead: browser re-scan (JS sites) and deep company research. Always shows the cost and asks before spending. */
export default function ResearchPanel({ leadId, url, needsRender, onRescanned }: { leadId: string; url: string; needsRender: boolean; onRescanned: () => void }) {
  const [st, setSt] = useState<Status | null>(null);
  const [items, setItems] = useState<Research[]>([]);
  const [ask, setAsk] = useState<'' | 'render' | 'research'>('');
  const [lang, setLang] = useState<RL>('tr');
  const [busy, setBusy] = useState('');
  const [shown, setShown] = useState<string | null>(null);
  const n = useNote();
  const load = useCallback(async () => {
    const [s, r] = await Promise.all([api<Status>('/api/admin/sales/apify/status'), api<{ items: Research[] }>(`/api/admin/sales/research?leadId=${encodeURIComponent(leadId)}`)]);
    setSt(s); setItems(r.items); setShown((x) => x ?? r.items[0]?.id ?? null);
  }, [leadId]);
  useEffect(() => { setShown(null); setAsk(''); load().catch(() => n.show({ ok: false, text: 'Apify durumu okunamadı.' })); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [leadId]);

  const go = async (kind: 'render' | 'research') => {
    setAsk(''); setBusy(kind);
    try {
      if (kind === 'render') { await api('/api/admin/sales/analyze', 'POST', { url, render: true }); onRescanned(); n.show({ ok: true, text: 'Tarayıcıyla yeniden tarandı, puan güncellendi.' }); }
      else { const r = await api<{ report: Research }>(`/api/admin/sales/leads/${leadId}/research`, 'POST', { lang, confirm: true }); setShown(r.report.id); n.show({ ok: true, text: 'Araştırma tamamlandı.' }); }
      await load();
    } catch (x) { n.show({ ok: false, text: msgOf(x, 'İşlem başarısız.') }); await load().catch(() => undefined); }
    setBusy('');
  };
  const del = async (id: string) => { try { await api(`/api/admin/sales/research/${id}`, 'DELETE'); setShown(null); await load(); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Silinemedi.') }); } };
  const cur = items.find((x) => x.id === shown);
  const est = st?.estimates; const rem = st?.budget.remaining ?? 0;
  const cost = ask === 'render' ? `≈ ${usd(est?.render ?? 0)}` : `≈ ${usd(est?.research.low ?? 0)}-${usd(est?.research.high ?? 0)}`;
  const need = ask === 'render' ? est?.render ?? 0 : est?.research.low ?? 0;

  return (
    <div className="sl-rep sl-rsp">
      <div className="sl-row"><b>Apify ile araştırma</b>
        {st && (st.on ? <span className="adm-meta">Bu ay {usd(st.budget.spent)} / {usd(st.budget.limit)} kullanıldı, kalan {usd(st.budget.remaining)} ({st.budget.source === 'apify' ? 'Apify kullanımı' : 'yerel kayıt'})</span> : <span className="adm-chip" data-state="gE">Apify anahtarı yok</span>)}</div>
      {n.el}
      {ask ? <div className="sl-confirm" role="alertdialog" aria-label="Maliyet onayı">
        <span>Tahmini maliyet {cost}. Kalan aylık bütçe {usd(rem)}.{need > rem ? ' Bütçe yetmiyor.' : ''} {ask === 'research' ? 'Sonuç kısa süre içinde gelir (yaklaşık 30-90 sn).' : 'Site tarayıcıyla açılıp 3 sayfa okunur.'}</span>
        <span className="sl-btns"><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={need > rem} onClick={() => go(ask)}>Onayla ve başlat</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setAsk('')}>Vazgeç</button></span></div>
        : <div className="sl-btns">
          {needsRender && <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!st?.on || !!busy} onClick={() => setAsk('render')}>{busy === 'render' ? 'Taranıyor…' : `JS ile tam tara (Apify ≈ ${usd(est?.render ?? 0.03)})`}</button>}
          <select className="adm-input" aria-label="Araştırma dili" value={lang} onChange={(e) => setLang(e.target.value as RL)} style={{ width: 'auto' }}>{RLS.map((x) => <option key={x} value={x}>{x.toUpperCase()}</option>)}</select>
          <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!st?.on || !!busy} onClick={() => setAsk('research')}>{busy === 'research' ? 'Araştırılıyor…' : `Derin araştırma (Apify ≈ ${usd(est?.research.low ?? 0.03)}-${usd(est?.research.high ?? 0.08)})`}</button></div>}
      {needsRender && !ask && <span className="adm-meta">Bu site JavaScript ile oluşuyor; bazı kontroller "Ölçülemedi" kaldı. Tarayıcıyla tarama bunları ölçer.</span>}
      {busy && <span className="adm-meta" role="status">Çalışıyor, sayfadan ayrılmayın…</span>}
      {items.length > 0 && <div className="sl-row"><select className="adm-input" aria-label="Kayıtlı araştırma" value={shown ?? ''} onChange={(e) => setShown(e.target.value)} style={{ width: 'auto', maxWidth: '100%' }}>{items.map((x) => <option key={x.id} value={x.id}>{fmtDate(x.createdAt)} · {x.lang.toUpperCase()}</option>)}</select>
        {cur && <><a className="lq-btn-ghost adm-btn sm adm-pri" href={`/api/admin/sales/research/${cur.id}/report.pdf`} download>PDF indir ({cur.lang.toUpperCase()})</a><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => del(cur.id)}>Sil</button></>}</div>}
      {cur && <ResearchReport r={cur} />}
    </div>
  );
}
