import { useEffect, useState } from 'react';
import { api, ApiError, fmtDate } from './api';
import { useNote } from './bulk';

// "Lead listesi URL'i (Apollo → LeadMash)": kurallar sahibin apollo-url-uretici dosyasından; URL'yi sunucudaki sabit kod üretir (server/apolloUrl.ts), YZ yalnızca alanları doldurur.
interface Fields { kind: 'people' | 'companies'; titles: string[]; notTitles: string[]; seniorities: string[]; country: string; city: string; employeeRanges: string[]; keywords: string[]; keywordFields: string[]; techs: string[]; emailStatus: string[]; excludeCatchAll: boolean }
interface Out { fields: Fields; url?: string; card?: string; needCountry?: boolean; problem?: string; b2c?: boolean; warning?: string; hint?: string; warnings?: string[] }
interface Item { id: string; createdAt: string; idea: string; fields: Fields; url: string }
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? d : d);
const SEN = ['owner', 'founder', 'c_suite', 'partner', 'vp', 'head', 'director', 'manager', 'senior', 'entry', 'intern'];
const RANGES = ['1,10', '11,20', '21,50', '51,100', '101,200', '201,500', '501,1000', '1001,2000', '2001,5000', '5001,10000', '10001,1000000'];
const TECH = ['shopify', 'wordpress_org', 'hubspot', 'stripe'];
const TITLES_EN = ['Owner', 'Founder', 'Managing Director', 'General Manager', 'Operations Manager', 'Marketing Manager', 'Practice Manager', 'Head of Marketing', 'CTO', 'Account Director'];
const TITLES_TR = ['Kurucu', 'Kurucu Ortak', 'Şirket Sahibi', 'İşletme Sahibi', 'Genel Müdür', 'Satış Müdürü', 'Pazarlama Müdürü', 'Operasyon Müdürü', 'Yönetim Kurulu Başkanı'];
const KW_EN = ['dental clinic', 'software', 'ecommerce', 'logistics', 'real estate agency', 'digital marketing agency', 'moving company', 'gym', 'saas', 'restaurant'];
const KW_TR = ['Yazılım', 'Bilişim', 'Danışmanlık', 'Lojistik', 'Dış Ticaret', 'İnşaat', 'Mühendislik', 'Otomasyon', 'Reklam Ajansı', 'Turizm'];
const COUNTRIES = ['Germany', 'Netherlands', 'United Kingdom', 'United States', 'Turkey', 'Greece', 'Austria', 'Switzerland', 'France', 'Spain', 'Italy'];
/** Kendi hizmet paketlerimiz (CRM, web sitesi, randevu, asistan, fatura, QR) × sektörler. */
const PRESETS: [string, string][] = [
  ['Randevu sistemi → klinikler (DE)', 'Klinikler için online randevu sistemi ve otomatik hatırlatma, Almanya'],
  ['CRM → ajanslar (UK)', 'Dijital ajanslar için müşteri takip (CRM) sistemi, İngiltere'],
  ['Web sitesi → lojistik (DE)', 'Nakliye ve lojistik firmaları için kurumsal web sitesi, Almanya'],
  ['YZ asistanı → emlak ofisleri (NL)', 'Emlak ofisleri için web sitesinde yapay zekâ asistanı, Hollanda'],
  ['Teklif ve fatura → danışmanlık (DE)', 'Danışmanlık ve ofis firmaları için teklif ve fatura otomasyonu, Almanya'],
  ['QR menü → restoranlar (GR)', 'Restoran ve kafe zincirleri için QR menü ve sipariş, Yunanistan'],
  ['Randevu sistemi → klinikler (GR)', 'Klinikler için online randevu sistemi, Yunanistan'],
  ['YZ asistanı → yazılım şirketleri (TR)', 'Yazılım şirketleri için müşteri destek asistanı, Türkiye'],
];
const EMPTY: Fields = { kind: 'people', titles: [], notTitles: [], seniorities: ['owner', 'founder'], country: '', city: '', employeeRanges: ['1,10', '11,20'], keywords: [], keywordFields: ['tags', 'name'], techs: [], emailStatus: ['verified'], excludeCatchAll: true };
const split = (s: string) => s.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
const isTr = (c: string) => /^(turkey|t[uü]rkiye|turkiye)$/i.test(c.trim());

export default function ApolloPanel() {
  const n = useNote();
  const [idea, setIdea] = useState(''); const [f, setF] = useState<Fields>(EMPTY);
  const [titlesTxt, setTitlesTxt] = useState(''); const [kwTxt, setKwTxt] = useState('');
  const [out, setOut] = useState<Out | null>(null); const [busy, setBusy] = useState(false); const [ask, setAsk] = useState('');
  const [hist, setHist] = useState<Item[]>([]); const [open, setOpen] = useState(false);
  const tr = isTr(f.country);
  const loadHist = () => api<{ items: Item[] }>('/api/admin/sales/apollo-urls').then((r) => setHist(r.items)).catch(() => undefined);
  useEffect(() => { loadHist(); }, []);

  const fill = (x: Fields) => { setF(x); setTitlesTxt(x.titles.join(', ')); setKwTxt(x.keywords.join(', ')); };
  const toggle = (k: 'seniorities' | 'employeeRanges' | 'techs', v: string) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }));
  const addTo = (txt: string, set: (s: string) => void, v: string) => { const a = split(txt); if (!a.includes(v)) set([...a, v].join(', ')); };
  const fields = (): Fields => ({ ...f, titles: split(titlesTxt), keywords: split(kwTxt) });
  const run = async (body: object) => {
    setBusy(true); setOut(null);
    try {
      const r = await api<Out>('/api/admin/sales/apollo-url', 'POST', body);
      setOut(r); if (r.fields) fill(r.fields); setAsk(r.needCountry ? 'Germany' : '');
    } catch (x) { n.show({ ok: false, text: msgOf(x, 'URL üretilemedi.') }); }
    setBusy(false);
  };
  const fromIdea = () => idea.trim() && run({ idea: idea.trim() });
  const fromForm = () => run({ fields: fields() });
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); n.show({ ok: true, text: 'Kopyalandı.' }); } catch { n.show({ ok: false, text: 'Kopyalanamadı, elle seçin.' }); } };
  const save = async () => { if (!out?.url) return; try { await api('/api/admin/sales/apollo-urls', 'POST', { idea, fields: out.fields }); await loadHist(); n.show({ ok: true, text: 'Geçmişe kaydedildi.' }); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Kaydedilemedi.') }); } };
  const del = async (id: string) => { try { await api(`/api/admin/sales/apollo-urls/${id}`, 'DELETE'); await loadHist(); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Silinemedi.') }); } };
  const chip = (label: string, on: boolean, click: () => void) => <button key={label} type="button" className="adm-chip" aria-pressed={on} onClick={click}>{label}</button>;
  const sug = (a: string[], txt: string, set: (s: string) => void) => <div className="adm-chips ap-sug">{a.map((v) => chip(v, split(txt).includes(v), () => addTo(txt, set, v)))}</div>;

  return (
    <div className="lq-card adm-card ap" style={{ marginTop: 16 }}>
      <div className="adm-head"><h2>Lead listesi URL'i (Apollo → LeadMash)</h2></div>
      {n.el}
      <p className="adm-meta ap-note">Araştırma ve analiz içindir. Almanya/AB'de bu listelere onaysız reklam e-postası gönderilemez (UWG §7, GDPR). Türkiye'de tacir istisnası + İYS kuralları geçerlidir. Soğuk e-posta yok.</p>

      <label className="adm-label" htmlFor="ap-idea">Fikrini tek cümleyle yaz (ülkeyi ekle)</label>
      <div className="ap-row">
        <input id="ap-idea" className="adm-input" maxLength={500} placeholder="Diş klinikleri için randevu hatırlatma, Hollanda" value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') fromIdea(); }} />
        <button type="button" className="lq-btn-ghost adm-btn adm-pri" disabled={busy || !idea.trim()} onClick={fromIdea}>{busy ? 'Üretiliyor…' : 'Fikirden üret'}</button>
      </div>
      <div className="adm-chips ap-sug" aria-label="Hazır şablonlar">{PRESETS.map(([l, i]) => <button key={l} type="button" className="adm-chip" onClick={() => setIdea(i)}>{l}</button>)}</div>

      {out?.b2c && <div className="ap-warn" role="alert"><b>B2C uyarısı.</b> {out.warning}{out.hint && <> <span className="adm-meta">Öneri: {out.hint}</span></>}</div>}
      {out?.needCountry && <div className="ap-warn" role="alert">
        <b>Ülke belirtilmedi: hangi ülke?</b> Tahmin edilmez.
        <div className="ap-row"><select className="adm-input" aria-label="Ülke" value={ask} onChange={(e) => setAsk(e.target.value)}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
          <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={busy} onClick={() => run({ idea: idea.trim(), country: ask })}>Devam</button></div></div>}
      {out && !out.needCountry && out.problem && <div className="ap-warn" role="alert">{out.problem}</div>}
      {out?.warnings?.map((w) => <div className="ap-warn" key={w}>{w}</div>)}

      <button type="button" className="lq-btn-ghost adm-btn sm ap-toggle" aria-expanded={open} onClick={() => setOpen((x) => !x)}>{open ? 'Alanları gizle' : 'Alanları elle düzenle'}</button>
      <div className="ap-grid" data-open={open ? 1 : 0}>
        <div className="ap-f"><span className="adm-label">Arama türü</span><div className="adm-chips">{chip('Kişi araması', f.kind === 'people', () => setF({ ...f, kind: 'people' }))}{chip('Şirket araması', f.kind === 'companies', () => setF({ ...f, kind: 'companies' }))}</div></div>
        <div className="ap-f"><label className="adm-label" htmlFor="ap-country">Ülke</label>
          <select id="ap-country" className="adm-input" value={COUNTRIES.includes(f.country) ? f.country : f.country ? '_' : ''} onChange={(e) => setF({ ...f, country: e.target.value === '_' ? f.country : e.target.value })}><option value="">Seç…</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}{f.country && !COUNTRIES.includes(f.country) && <option value="_">{f.country}</option>}</select>
          <input className="adm-input" aria-label="Şehir (İngilizce yazım, isteğe bağlı)" placeholder={tr ? 'Şehir: Istanbul (Türkçe karaktersiz)' : 'Şehir (isteğe bağlı)'} value={f.city} maxLength={40} onChange={(e) => setF({ ...f, city: e.target.value })} />
          {tr && <span className="adm-meta">Türkiye kuralı: konum Turkey + Türkiye, catch-all yok, likely_to_engage eklenir, 1-10 çalışan çıkarılır.</span>}</div>
        {f.kind === 'people' && <div className="ap-f"><label className="adm-label" htmlFor="ap-titles">Kim ödeyecek? Unvanlar (3-6, virgülle)</label>
          <textarea id="ap-titles" className="adm-input" rows={2} value={titlesTxt} onChange={(e) => setTitlesTxt(e.target.value)} />
          {sug(tr ? [...TITLES_TR, ...TITLES_EN] : TITLES_EN, titlesTxt, setTitlesTxt)}</div>}
        {f.kind === 'people' && <div className="ap-f"><span className="adm-label">Kıdem</span><div className="adm-chips">{SEN.map((s) => chip(s, f.seniorities.includes(s), () => toggle('seniorities', s)))}</div></div>}
        <div className="ap-f"><span className="adm-label">Çalışan sayısı</span><div className="adm-chips">{RANGES.map((r) => chip(r.replace(',', '-'), f.employeeRanges.includes(r), () => toggle('employeeRanges', r)))}</div>
          {tr && <span className="adm-meta">Türkiye: 11-20 ve üstünden başla.</span>}</div>
        <div className="ap-f"><label className="adm-label" htmlFor="ap-kw">Sektör kelimeleri ({tr ? 'İngilizce etiket + Türkçe şirket adı kelimesi' : 'İngilizce, 2-4'})</label>
          <textarea id="ap-kw" className="adm-input" rows={2} value={kwTxt} onChange={(e) => setKwTxt(e.target.value)} />
          {sug(tr ? [...KW_EN, ...KW_TR] : KW_EN, kwTxt, setKwTxt)}</div>
        <div className="ap-f"><span className="adm-label">Teknoloji sinyali (isteğe bağlı)</span><div className="adm-chips">{TECH.map((t) => chip(t, f.techs.includes(t), () => toggle('techs', t)))}</div></div>
        {f.kind === 'people' && <div className="ap-f"><span className="adm-label">E-posta durumu</span><div className="adm-chips">{chip('verified (her zaman)', true, () => undefined)}{chip('likely_to_engage', f.emailStatus.includes('likely_to_engage') || tr, () => setF({ ...f, emailStatus: f.emailStatus.includes('likely_to_engage') ? ['verified'] : ['verified', 'likely_to_engage'] }))}</div>
          {!tr && <label className="ap-check"><input type="checkbox" checked={f.excludeCatchAll} onChange={(e) => setF({ ...f, excludeCatchAll: e.target.checked })} /> Catch-all adresleri ele</label>}</div>}
        <div className="ap-f"><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={busy} onClick={fromForm}>Alanlardan URL üret</button></div>
      </div>

      {out?.url && <div className="ap-out">
        <pre className="ap-card">{out.card}</pre>
        <div className="sl-btns">
          <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={() => copy(out.url!)}>Kopyala</button>
          <a className="lq-btn-ghost adm-btn sm" href={out.url} target="_blank" rel="noopener noreferrer">Apollo'da aç</a>
          <a className="lq-btn-ghost adm-btn sm" href="https://www.leadmash.io/" target="_blank" rel="noopener noreferrer">LeadMash'i aç</a>
          <button type="button" className="lq-btn-ghost adm-btn sm" onClick={save}>Geçmişe kaydet</button>
        </div>
      </div>}

      {hist.length > 0 && <details className="sl-details" style={{ marginTop: 12 }}><summary>Geçmiş ({hist.length})</summary>
        <div className="ap-hist">{hist.map((h) => (
          <div className="ap-h" key={h.id}><div><b>{h.idea || `${h.fields.keywords.slice(0, 2).join(', ')} · ${h.fields.country}`}</b><div className="adm-meta">{fmtDate(h.createdAt)} · {h.fields.kind === 'people' ? 'kişi' : 'şirket'} · {h.fields.country}</div></div>
            <div className="sl-btns"><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => copy(h.url)}>Kopyala</button><a className="lq-btn-ghost adm-btn sm" href={h.url} target="_blank" rel="noopener noreferrer">Apollo'da aç</a><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => del(h.id)}>Sil</button></div></div>))}</div></details>}
    </div>
  );
}
