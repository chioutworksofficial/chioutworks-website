// Admin "Trend Radar": manual 30-day market scan. Kaynak fikir: last30days (MIT, Copyright 2026 Matt Van Horn).
import { useCallback, useEffect, useRef, useState } from 'react';
import './trend.css';
import { api, ApiError, fmtDate } from './api';
import { useNote } from './bulk';
import { SECTOR_KEYS, SECTOR_LABEL } from '../../data/intakeSectors';

type Key = 'reddit' | 'hn' | 'polymarket' | 'github' | 'youtube' | 'x' | 'tiktok' | 'instagram' | 'metaads';
type Mode = 'idea' | 'prep' | 'product'; type Lang = 'tr' | 'en' | 'de' | 'el';
interface Item { source: Key; title: string; url: string; date: string | null; text?: string; author?: string; eng: Record<string, number>; score: number }
interface Ref { text: string; refs: number[] }
interface Synth { summary: string; sentiment: 'positive' | 'mixed' | 'negative' | 'unclear'; themes: { title: string; detail: string; refs: number[] }[]; praise: Ref[]; complaints: Ref[]; rising: Ref[]; ideas: { hook: string; format: 'reel' | 'short' | 'post'; refs: number[] }[]; actions: string[] }
interface Rising { daily: number[]; recent7: number; prior23: number; ratio: number; flag: boolean; terms: { term: string; recent: number; prior: number; flag: boolean }[] }
interface Stat { key: Key; label: string; count: number; ms: number; cached: boolean; error?: 'nokey' | 'timeout' | 'http' | 'blocked' | 'bad' }
interface Result { id: string; at: string; q: string; mode: Mode; lang: Lang; sources: Stat[]; total: number; items: Item[]; rising: Rising; synthesis: Synth | null; llm: { ok: boolean; error?: string } }
interface SrcInfo { key: Key; label: string; configured: boolean; envKey: string | null }
interface Hist { id: string; savedAt: string; q: string; mode: Mode; lang: Lang; total: number; summary: string | null }
type Panel = 'scan' | 'sell' | 'meta';

const MODES: { key: Mode; label: string; desc: string; ph: string }[] = [
  { key: 'idea', label: 'İçerik fikri', desc: 'Yükselen konular ve 5 içerik fikri.', ph: 'Örn. online randevu sistemi' },
  { key: 'prep', label: 'Görüşme öncesi', desc: 'Firma veya marka adı: ne konuşuluyor, ton, dikkat çeken başlıklar.', ph: 'Firma veya marka adı' },
  { key: 'product', label: 'Ürün ve rakip', desc: 'Övgü ve şikâyet kümeleri; Meta anahtarı varsa rakip reklamları.', ph: 'Ürün veya kategori, örn. n8n automation' },
];
const ICON: Record<Key, string> = { reddit: 'RD', hn: 'HN', polymarket: 'PM', github: 'GH', youtube: 'YT', x: 'X', tiktok: 'TT', instagram: 'IG', metaads: 'AD' };
// Quick-start chips: sectors come from the intake sector list (no sector is the default); services are the site's packages.
const SECTORS = SECTOR_KEYS.filter((k) => k !== 'other').map((k) => SECTOR_LABEL[k].tr.split(' / ')[0]);
const SERVICES = ['CRM', 'web sitesi', 'online randevu', 'yapay zekâ asistanı', 'teklif ve fatura otomasyonu', 'QR menü'];
const SOON: Partial<Record<Key, string>> = {};
const ERR: Record<string, string> = { nokey: 'Anahtar yok', timeout: 'Zaman aşımı', http: 'Erişilemedi', blocked: 'Engelli', bad: 'Geçersiz yanıt' };
const ENGL: Record<string, string> = { score: 'puan', comments: 'yorum', points: 'puan', volume: 'hacim $', liquidity: 'likidite $', stars: 'yıldız', forks: 'fork', views: 'izlenme', likes: 'beğeni', reposts: 'yeniden paylaşım', replies: 'yanıt', quotes: 'alıntı', shares: 'paylaşım', variants: 'reklam sayısı' };
const FMT = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${Math.round(n / 1e3)}K` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(Math.round(n)));
const FORMAT: Record<string, string> = { reel: 'Reel', short: 'Short', post: 'Gönderi' };
const SENT: Record<string, string> = { positive: 'Olumlu', mixed: 'Karışık', negative: 'Olumsuz', unclear: 'Belirsiz' };
const LLM_ERR: Record<string, string> = { llm_not_configured: 'Yapay zekâ anahtarı tanımlı değil.', no_items: 'Sonuç bulunamadı.', llm_invalid_json: 'Yapay zekâ geçerli bir özet üretemedi.', llm_failed: 'Yapay zekâ yanıt vermedi.' };
const msgOf = (x: unknown, d: string) => (x instanceof ApiError ? x.data?.message ?? (x.status === 401 ? 'Oturum süresi doldu, yeniden giriş yapın.' : x.status === 429 ? 'Çok fazla istek, bir dakika bekleyin.' : d) : d);

function toMd(r: Result): string {
  const s = r.synthesis; const L: string[] = [`# Trend Radar: ${r.q}`, `${MODES.find((m) => m.key === r.mode)?.label} · ${fmtDate(r.at)} · son 30 gün · ${r.total} sonuç`, ''];
  const refs = (a: number[]) => (a.length ? ` ${a.map((i) => `[${i + 1}]`).join('')}` : '');
  if (s) {
    L.push('## Özet', s.summary, '');
    if (s.themes.length) L.push('## Ana temalar', ...s.themes.map((t) => `- **${t.title}**: ${t.detail}${refs(t.refs)}`), '');
    if (s.praise.length) L.push('## Övgüler', ...s.praise.map((t) => `- ${t.text}${refs(t.refs)}`), '');
    if (s.complaints.length) L.push('## Şikâyetler', ...s.complaints.map((t) => `- ${t.text}${refs(t.refs)}`), '');
    if (s.rising.length) L.push('## Yükselen sinyaller', ...s.rising.map((t) => `- ${t.text}${refs(t.refs)}`), '');
    if (s.ideas.length) L.push('## İçerik fikirleri', ...s.ideas.map((t, i) => `${i + 1}. (${FORMAT[t.format]}) ${t.hook}${refs(t.refs)}`), '');
    if (s.actions.length) L.push('## Önerilen adımlar', ...s.actions.map((a) => `- ${a}`), '');
  }
  L.push('## Kaynaklar', ...r.items.slice(0, 40).map((it, i) => `${i + 1}. [${it.title.replace(/[[\]]/g, '')}](${it.url}) · ${ICON[it.source]} · ${it.date?.slice(0, 10) ?? '-'} · skor ${it.score}`), '', '_Kaynak fikir: last30days (MIT)_');
  return L.join('\n');
}

export default function TrendRadarView() {
  const [panel, setPanel] = useState<Panel>('scan');
  const [q, setQ] = useState(''); const [mode, setMode] = useState<Mode>('idea'); const [lang, setLang] = useState<Lang>('tr');
  const [srcs, setSrcs] = useState<SrcInfo[]>([]); const [on, setOn] = useState<Set<Key>>(new Set());
  const [running, setRunning] = useState(false); const [prog, setProg] = useState<Record<string, Stat | 'run'>>({}); const [stage, setStage] = useState('');
  const [res, setRes] = useState<Result | null>(null); const [saved, setSaved] = useState(false);
  const [fSrc, setFSrc] = useState<Key | ''>(''); const [fMin, setFMin] = useState(0); const [fDays, setFDays] = useState(30);
  const [hist, setHist] = useState<Hist[]>([]); const [synthBusy, setSynthBusy] = useState(false);
  const n = useNote(); const top = useRef<HTMLDivElement>(null);

  const loadHist = useCallback(async () => { setHist((await api<{ reports: Hist[] }>('/api/admin/trend/reports')).reports); }, []);
  useEffect(() => {
    api<{ sources: SrcInfo[] }>('/api/admin/trend/status').then((r) => { setSrcs(r.sources); setOn(new Set(r.sources.filter((s) => s.configured).map((s) => s.key))); }).catch((x) => n.show({ ok: false, text: msgOf(x, 'Durum yüklenemedi.') }));
    loadHist().catch(() => {});
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const toggle = (s: SrcInfo) => { if (!s.configured) return; setOn((p) => { const x = new Set(p); if (x.has(s.key)) x.delete(s.key); else x.add(s.key); return x; }); };
  const ready = q.trim().length >= 2 && on.size > 0 && !running;

  const scan = async () => {
    if (!ready) return;
    setRunning(true); setRes(null); setSaved(false); setStage(''); setFSrc(''); setFMin(0); setFDays(30);
    setProg(Object.fromEntries([...on].map((k) => [k, 'run' as const])));
    try {
      const r = await fetch('/api/admin/trend/scan', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q.trim(), mode, lang, sources: [...on] }) });
      if (!r.ok || !r.body) throw new ApiError(r.status, await r.json().catch(() => ({})));
      const rd = r.body.getReader(); const dec = new TextDecoder(); let buf = '';
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop() ?? '';
        for (const ln of lines) {
          if (!ln.trim()) continue; const e = JSON.parse(ln) as { t: string; stat?: Stat; name?: string; result?: Result; message?: string };
          if (e.t === 'src' && e.stat) setProg((p) => ({ ...p, [e.stat!.key]: e.stat! }));
          else if (e.t === 'stage') setStage(e.name === 'llm' ? 'Özet hazırlanıyor…' : 'Sıralanıyor…');
          else if (e.t === 'result' && e.result) { setRes(e.result); setTimeout(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }
          else if (e.t === 'error') n.show({ ok: false, text: e.message ?? 'Tarama tamamlanamadı.' });
        }
      }
    } catch (x) { n.show({ ok: false, text: msgOf(x, 'Tarama başlatılamadı.') }); }
    setRunning(false); setStage('');
  };

  const changeLang = async (l: Lang) => {
    if (!res) return; setSynthBusy(true);
    try { const r = await api<{ lang: Lang; synthesis: Synth | null; llm: Result['llm'] }>('/api/admin/trend/synth', 'POST', { id: res.id, lang: l }); setRes({ ...res, lang: r.lang, synthesis: r.synthesis, llm: r.llm }); setSaved(false); }
    catch (x) { n.show({ ok: false, text: msgOf(x, 'Dil değiştirilemedi.') }); }
    setSynthBusy(false);
  };
  const save = async () => { if (!res) return; try { await api('/api/admin/trend/reports', 'POST', { id: res.id }); setSaved(true); await loadHist(); n.show({ ok: true, text: 'Rapor kaydedildi.' }); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Kaydedilemedi.') }); } };
  const open = async (id: string) => { try { const r = await api<{ report: Result }>(`/api/admin/trend/reports/${id}`); setRes(r.report); setSaved(true); setQ(r.report.q); setMode(r.report.mode); setLang(r.report.lang); setPanel('scan'); setTimeout(() => top.current?.scrollIntoView({ behavior: 'smooth' }), 50); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Açılamadı.') }); } };
  const del = async (id: string) => { try { await api(`/api/admin/trend/reports/${id}`, 'DELETE'); await loadHist(); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Silinemedi.') }); } };
  const copy = async () => { if (!res) return; try { await navigator.clipboard.writeText(toMd(res)); n.show({ ok: true, text: 'Markdown kopyalandı.' }); } catch { n.show({ ok: false, text: 'Kopyalanamadı, elle seçin.' }); } };

  const items = (res?.items ?? []).map((it, i) => ({ it, i })).filter(({ it }) => (!fSrc || it.source === fSrc) && it.score >= fMin && (fDays >= 30 || !it.date || Date.now() - new Date(it.date).getTime() <= fDays * 86_400_000));
  const refs = (a: number[]) => a.map((i) => res?.items[i] && <a key={i} className="tr-ref" href={res.items[i].url} target="_blank" rel="noopener noreferrer" title={res.items[i].title}>[{i + 1}]</a>);
  const mx = Math.max(1, ...(res?.rising.daily ?? [0]));
  const s = res?.synthesis;

  const scanPanel = (
    <>
      <div className="lq-card adm-card tr-search tr-noprint">
        <div className="adm-chips" style={{ marginBottom: 10 }}>{MODES.map((m) => <button key={m.key} type="button" className="adm-chip" aria-pressed={mode === m.key} onClick={() => setMode(m.key)}>{m.label}</button>)}</div>
        <div className="tr-searchrow">
          <input className="adm-input" value={q} maxLength={120} placeholder={MODES.find((m) => m.key === mode)!.ph} aria-label="Arama" onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void scan(); }} />
          <button type="button" className="lq-btn-ghost adm-btn adm-pri" disabled={!ready} onClick={scan}>{running ? 'Taranıyor…' : 'Tara'}</button>
        </div>
        <div className="tr-opts" style={{ marginTop: 10 }}>
          <span className="tr-lbl">Hızlı başlangıç</span>
          {SECTORS.map((x) => <button key={x} type="button" className="adm-chip" onClick={() => setQ(x)}>{x}</button>)}
          {SERVICES.map((x) => <button key={x} type="button" className="adm-chip tag" onClick={() => setQ((p) => (p.trim() ? `${p.trim()} ${x}` : x).slice(0, 120))}>{x}</button>)}
        </div>
        <p className="tr-hint" style={{ margin: '8px 0 0' }}>{MODES.find((m) => m.key === mode)!.desc} Son 30 gün. Yalnızca siz başlatınca çalışır.</p>
        <div className="tr-opts">
          <span className="tr-lbl">Kaynaklar</span>
          {srcs.map((s) => <button key={s.key} type="button" className="adm-chip tr-chip" aria-pressed={on.has(s.key)} data-off={s.configured ? undefined : '1'} disabled={!s.configured} title={s.configured ? '' : `Anahtar ekle: ${s.envKey}`} onClick={() => toggle(s)}>{s.label}{!s.configured && <span className="tr-chip-n">Anahtar ekle</span>}{SOON[s.key] && <span className="tr-chip-n">{SOON[s.key]}</span>}</button>)}
        </div>
        <div className="tr-opts" style={{ marginTop: 8 }}>
          <span className="tr-lbl">Rapor dili</span>
          {(['tr', 'en', 'de', 'el'] as Lang[]).map((l) => <button key={l} type="button" className="adm-chip" aria-pressed={lang === l} onClick={() => { setLang(l); if (res && !running) void changeLang(l); }}>{l.toUpperCase()}</button>)}
        </div>
      </div>
      {n.el}
      {(running || Object.keys(prog).length > 0) && !res && (
        <div className="tr-prog" aria-live="polite">{Object.entries(prog).map(([k, v]) => {
          const label = srcs.find((x) => x.key === k)?.label ?? k; const st = v === 'run' ? 'run' : v.error ? (v.error === 'nokey' ? 'off' : 'err') : 'ok';
          return <div key={k} className="tr-pg" data-s={st}><i className="tr-dot" />{label}<b>{v === 'run' ? '…' : v.error ? ERR[v.error] : `${v.count}`}</b></div>;
        })}{stage && <div className="tr-pg" data-s="run"><i className="tr-dot" />{stage}</div>}</div>)}

      <div ref={top} />
      {res && (
        <div className="tr-print">
          <div className="adm-head tr-noprint" style={{ flexWrap: 'wrap' }}>
            <h2>{res.q}</h2>
            <div className="adm-actions">
              <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={saved} onClick={save}>{saved ? 'Kaydedildi' : 'Raporu kaydet'}</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={copy}>Markdown kopyala</button>
              <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => window.print()}>PDF / Yazdır</button>
            </div>
          </div>
          <p className="tr-hint" style={{ margin: '0 0 12px' }}>{MODES.find((m) => m.key === res.mode)?.label} · {fmtDate(res.at)} · son 30 gün · {res.total} sonuç · {res.sources.filter((x) => !x.error).map((x) => `${x.label} ${x.count}`).join(' · ')}</p>
          {res.sources.some((x) => x.error && x.error !== 'nokey') && <div className="adm-banner tr-noprint">Bazı kaynaklara ulaşılamadı: {res.sources.filter((x) => x.error && x.error !== 'nokey').map((x) => `${x.label} (${ERR[x.error!]})`).join(', ')}. Sonuçlar eldeki verilere dayanır.</div>}
          {!res.llm.ok && <div className="adm-banner">Yapay zekâ özeti yok: {LLM_ERR[res.llm.error ?? ''] ?? 'üretilemedi.'} Aşağıda ham sıralı liste var.</div>}
          <div className="tr-grid">
            <div className="tr-col">
              {s && <div className="lq-card adm-card" style={{ opacity: synthBusy ? .6 : 1 }}>
                <div className="adm-head" style={{ marginBottom: 0 }}><h2>Özet</h2><span className="tr-tag" data-k={s.sentiment}>{SENT[s.sentiment]}</span></div>
                <p className="tr-summary">{s.summary}</p>
                {s.themes.length > 0 && <><h3 className="tr-h3">Ana temalar</h3><ul className="tr-list">{s.themes.map((t, i) => <li key={i}><b>{t.title}</b>: {t.detail}{refs(t.refs)}</li>)}</ul></>}
                {s.praise.length > 0 && <><h3 className="tr-h3">Övgüler</h3><ul className="tr-list good">{s.praise.map((t, i) => <li key={i}>{t.text}{refs(t.refs)}</li>)}</ul></>}
                {s.complaints.length > 0 && <><h3 className="tr-h3">Şikâyetler</h3><ul className="tr-list bad">{s.complaints.map((t, i) => <li key={i}>{t.text}{refs(t.refs)}</li>)}</ul></>}
                {s.rising.length > 0 && <><h3 className="tr-h3">Yükselen sinyaller</h3><ul className="tr-list">{s.rising.map((t, i) => <li key={i}>{t.text}{refs(t.refs)}</li>)}</ul></>}
                {s.actions.length > 0 && <><h3 className="tr-h3">Önerilen adımlar</h3><ul className="tr-list">{s.actions.map((a, i) => <li key={i}>{a}</li>)}</ul></>}
              </div>}
              {s && s.ideas.length > 0 && <div className="lq-card adm-card"><h2>İçerik fikirleri</h2><div className="tr-ideas" style={{ marginTop: 12 }}>{s.ideas.map((d, i) => <div key={i} className="tr-idea"><span className="adm-chip tag" style={{ width: 'fit-content' }}>{FORMAT[d.format]}</span>{d.hook}<span>{refs(d.refs)}</span></div>)}</div></div>}
            </div>
            <div className="tr-col">
              <div className="lq-card adm-card">
                <div className="adm-head" style={{ marginBottom: 0 }}><h2>Yükseliş</h2><span className="tr-tag" data-k={res.rising.flag ? 'up' : 'flat'}>{res.rising.flag ? 'Yükselişte' : 'Sabit / düşük'}</span></div>
                <p className="tr-hint" style={{ margin: '8px 0 0' }}>Son 7 gün: {res.rising.recent7} içerik, önceki 23 gün: {res.rising.prior23} içerik (günlük hız oranı {res.rising.ratio}x). Bulunan örneğe dayanır.</p>
                <div className="tr-bars" role="img" aria-label="Son 30 günde günlük içerik sayısı">{res.rising.daily.map((v, i) => <i key={i} data-r={i >= 23 ? '1' : undefined} style={{ height: `${Math.max(2, (v / mx) * 100)}%` }} title={`${v}`} />)}</div>
                <div className="tr-axis"><span>30 gün önce</span><span>Son 7 gün</span><span>Bugün</span></div>
                {res.rising.terms.length > 0 && <div className="tr-terms">{res.rising.terms.map((t) => <span key={t.term} className="tr-tag" data-k={t.flag ? 'up' : 'flat'} title={`Son 7 gün ${t.recent}, önceki ${t.prior}`}>{t.term}{t.flag ? ' ↑' : ''}</span>)}</div>}
              </div>
              <div className="lq-card adm-card"><h2>Kaynaklar</h2><div className="tr-hist" style={{ marginTop: 12 }}>{res.sources.map((x) => <div key={x.key} className="tr-hrow"><span><span className="tr-src">{ICON[x.key]}</span> {x.label}</span><span>{x.error ? ERR[x.error] : `${x.count}${x.cached ? ' · önbellek' : ''}`}</span></div>)}</div></div>
            </div>
          </div>
          <div className="lq-card adm-card">
            <div className="adm-head"><h2>Sıralı sonuçlar</h2><span className="tr-hint">{items.length} / {res.items.length}</span></div>
            <div className="tr-filters tr-noprint">
              <select className="adm-input tr-sel" aria-label="Kaynak" value={fSrc} onChange={(e) => setFSrc(e.target.value as Key | '')}><option value="">Tüm kaynaklar</option>{[...new Set(res.items.map((i) => i.source))].map((k) => <option key={k} value={k}>{srcs.find((x) => x.key === k)?.label ?? k}</option>)}</select>
              <select className="adm-input tr-sel" aria-label="En düşük skor" value={fMin} onChange={(e) => setFMin(Number(e.target.value))}>{[0, 30, 50, 70].map((v) => <option key={v} value={v}>{v ? `Skor ≥ ${v}` : 'Tüm skorlar'}</option>)}</select>
              <select className="adm-input tr-sel" aria-label="Tarih" value={fDays} onChange={(e) => setFDays(Number(e.target.value))}><option value={30}>Son 30 gün</option><option value={14}>Son 14 gün</option><option value={7}>Son 7 gün</option></select>
            </div>
            {!items.length ? <div className="adm-empty">Bu filtreyle sonuç yok</div> : <div className="tr-items">{items.map(({ it, i }) => (
              <div key={it.url} className="tr-item"><span className="tr-score" aria-label={`Skor ${it.score}`}>{it.score}</span>
                <div className="tr-itext"><a href={it.url} target="_blank" rel="noopener noreferrer">{i + 1}. {it.title}</a>
                  <div className="tr-imeta"><span className="tr-src">{ICON[it.source]}</span>{it.author && <span>{it.author}</span>}{it.date && <span>{it.date.slice(0, 10)}</span>}
                    {Object.entries(it.eng).filter(([k, v]) => v > 0 && k !== 'ratio').map(([k, v]) => <span key={k}>{FMT(v)} {ENGL[k] ?? k}</span>)}</div></div></div>))}</div>}
          </div>
        </div>
      )}
      {!res && !running && <div className="adm-empty">Bir konu, firma veya ürün yazıp Tara'ya basın. Sonuçlar burada görünür.</div>}

      <div className="lq-card adm-card tr-noprint" style={{ marginTop: 16 }}>
        <div className="adm-head"><h2>Kayıtlı raporlar</h2></div>
        {!hist.length ? <div className="adm-empty">Henüz kayıtlı rapor yok</div> : <div className="tr-hist">{hist.map((h) => (
          <div key={h.id} className="tr-hrow"><span><b className="adm-name">{h.q}</b> · {MODES.find((m) => m.key === h.mode)?.label} · {h.lang.toUpperCase()} · {fmtDate(h.savedAt)}</span>
            <span className="adm-actions"><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => open(h.id)}>Aç</button><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => del(h.id)}>Sil</button></span></div>))}</div>}
      </div>
    </>
  );

  return (
    <>
      <h1 className="adm-h1 tr-noprint">Trend Radar</h1>
      <p className="adm-sub tr-noprint">Son 30 günde internette ne konuşuluyor: içerik fikri, görüşme hazırlığı, ürün ve rakip. Elle çalışır; özetler yapay zekâ taslağıdır, kaynaklara bakarak doğrulayın.</p>
      <div className="tr-seg tr-noprint">{([['scan', 'Tarama'], ['sell', 'Hizmet olarak sat'], ['meta', 'Meta reklam hesabı']] as [Panel, string][]).map(([k, l]) => <button key={k} type="button" className="adm-chip" aria-pressed={panel === k} onClick={() => setPanel(k)}>{l}</button>)}</div>
      {panel === 'scan' && scanPanel}
      {panel === 'sell' && <SellPanel />}
      {panel === 'meta' && <MetaPanel />}
      <p className="tr-foot">Kaynak fikir: last30days (MIT)</p>
    </>
  );
}

interface Price { name: string; price: string; note: string }
function SellPanel() {
  const [prices, setPrices] = useState<Price[]>([]); const n = useNote();
  useEffect(() => { api<{ service: { prices: Price[] } }>('/api/admin/trend/service').then((r) => setPrices(r.service.prices)).catch((x) => n.show({ ok: false, text: msgOf(x, 'Yüklenemedi.') })); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const set = (i: number, k: keyof Price, v: string) => setPrices((p) => p.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const save = async () => { try { await api('/api/admin/trend/service', 'PUT', { prices }); n.show({ ok: true, text: 'Kaydedildi.' }); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Kaydedilemedi.') }); } };
  return (
    <div className="tr-sec">
      <p className="adm-note">Yalnızca sizin için iç not; sitede görünmez.</p>
      {n.el}
      <div className="tr-two">
        <div className="lq-card adm-card"><h2>30 günlük pazar ve marka raporu</h2>
          <h3 className="tr-h3">Neleri içerir</h3>
          <ul className="tr-list"><li>Müşterinin sektörü veya markası için son 30 günün konuşmaları (forum, haber, açık kaynak, ilan sinyalleri).</li><li>Ana temalar, övgüler ve şikâyetler, kaynak bağlantılarıyla.</li><li>Yükselen konular ve 5 içerik fikri (reel, short, gönderi).</li><li>Varsa rakip reklamlarının ne vurguladığı.</li><li>Önerilen sonraki adımlar. Rapor müşterinin dilinde (TR, EN, DE veya EL) hazırlanır.</li></ul>
          <h3 className="tr-h3">Teslim</h3>
          <ul className="tr-list"><li>PDF rapor (Tarama sayfasındaki "PDF / Yazdır").</li><li>15 dakikalık okunabilir yazılı özet (e-posta ya da mesaj). Toplantı yok.</li><li>Sayılar ve alıntılar yalnızca kaynaklarda görünenlerdir; gelir, satış veya sıralama vaadi verilmez.</li></ul></div>
        <div className="lq-card adm-card"><h2>Örnek rapor yapısı</h2>
          <ol className="tr-list" style={{ listStyle: 'decimal', paddingLeft: 18, marginTop: 12 }}>{['Özet (3-5 cümle) ve genel ton', 'Ana temalar (kaynak numaralarıyla)', 'Övgüler ve şikâyetler', 'Yükselen sinyaller (7 gün ve önceki 23 gün)', 'Rakip reklamları (Meta anahtarı varsa)', '5 içerik fikri: kanca + biçim', 'Önerilen adımlar', 'Kaynak listesi (skor, tarih, bağlantı)'].map((x) => <li key={x} style={{ paddingLeft: 0 }}>{x}</li>)}</ol></div>
      </div>
      <div className="lq-card adm-card"><div className="adm-head"><h2>Fiyat seçenekleri</h2><button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={save}>Kaydet</button></div>
        <p className="tr-hint" style={{ margin: '0 0 10px' }}>Yer tutucular; kendi fiyatınızı yazın. Burada kayıtlı kalır.</p>
        <div className="tr-sec">{prices.map((p, i) => <div key={i} className="tr-price"><input className="adm-input" aria-label="Paket adı" maxLength={60} value={p.name} onChange={(e) => set(i, 'name', e.target.value)} /><input className="adm-input" aria-label="Fiyat" maxLength={60} value={p.price} onChange={(e) => set(i, 'price', e.target.value)} /><input className="adm-input" aria-label="Kapsam notu" maxLength={200} value={p.note} onChange={(e) => set(i, 'note', e.target.value)} /></div>)}</div></div>
    </div>
  );
}

function MetaPanel() {
  const [v, setV] = useState<{ accountId: string; hasToken: boolean; last4: string; connected: boolean } | null>(null);
  const [acc, setAcc] = useState(''); const [tok, setTok] = useState(''); const n = useNote();
  useEffect(() => { api<NonNullable<typeof v>>('/api/admin/trend/meta').then((r) => { setV(r); setAcc(r.accountId); }).catch((x) => n.show({ ok: false, text: msgOf(x, 'Yüklenemedi.') })); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const save = async () => {
    try { const r = await api<NonNullable<typeof v>>('/api/admin/trend/meta', 'PUT', { ...(acc.trim() ? { accountId: acc.trim() } : {}), ...(tok.trim() ? { token: tok.trim() } : {}) }); setV(r); setTok(''); n.show({ ok: true, text: 'Kaydedildi. Anahtar şifreli saklanır.' }); }
    catch (x) { n.show({ ok: false, text: msgOf(x, 'Kaydedilemedi.') }); }
  };
  const clear = async () => { try { const r = await api<NonNullable<typeof v>>('/api/admin/trend/meta', 'DELETE'); setV(r); setAcc(''); setTok(''); } catch (x) { n.show({ ok: false, text: msgOf(x, 'Silinemedi.') }); } };
  return (
    <div className="tr-sec">
      {n.el}
      <div className="lq-card adm-card"><div className="adm-head"><h2>Meta reklam hesabı</h2><span className="tr-tag" data-k="flat">Bağlı değil</span></div>
        <p className="adm-note">Yer ayrıldı: Meta Marketing API sonradan bağlanacak. Şu an anahtarla hiçbir istek yapılmaz; kayıt yalnızca hazırlıktır.</p>
        <div className="tr-sec">
          <label className="adm-label">Reklam hesabı kimliği (rakamlar)<input className="adm-input" inputMode="numeric" maxLength={24} value={acc} onChange={(e) => setAcc(e.target.value)} /></label>
          <label className="adm-label">Erişim anahtarı {v?.hasToken && <span className="tr-hint">(kayıtlı, sonu …{v.last4})</span>}<input className="adm-input" type="password" autoComplete="off" maxLength={600} placeholder={v?.hasToken ? 'Değiştirmek için yeni anahtar yazın' : ''} value={tok} onChange={(e) => setTok(e.target.value)} /></label>
          <div className="adm-actions"><button type="button" className="lq-btn-ghost adm-btn adm-pri" disabled={!acc.trim() && !tok.trim()} onClick={save}>Kaydet</button>{(v?.hasToken || v?.accountId) && <button type="button" className="lq-btn-ghost adm-btn" onClick={clear}>Kaydı sil</button>}</div>
        </div></div>
      <div className="lq-card adm-card tr-soon"><h2>Bağlanınca görünecekler</h2>
        <ul className="tr-list" style={{ marginTop: 12 }}><li>Kampanyalar ve durumları (aktif, duraklatılmış).</li><li>Harcama: günlük ve toplam.</li><li>Sonuçlar: gösterim, tıklama, form talebi ve talep başına maliyet.</li><li>Trend Radar bulgularıyla yan yana: hangi konuya reklam verilmeli.</li></ul></div>
    </div>
  );
}
