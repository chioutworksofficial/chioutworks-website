// Admin "Hesaplar ve API": every external account in one place. Key values are never shown (only the last 4 characters come from the server).
import { useCallback, useEffect, useState } from 'react';
import './providers.css';
import { api } from './api';
import { useNote } from './bulk';

type Cat = 'ai' | 'voice' | 'data' | 'mail' | 'infra' | 'pay' | 'ads';
type Usage = { kind: 'bar'; label: string; used: number; limit: number; pct: number; unit: string; resets: string | null } | { kind: 'bal'; label: string; value: number; unit: string; extra: string | null } | { kind: 'text'; label: string } | { kind: 'error'; reason: string };
interface Bal { source: 'live' | 'manual' | 'none'; value: number | null; unit: string; total: number | null; pct: number | null; note: string | null; updatedAt: string | null; reason: string | null }
interface Manual { plan: string; fee: number | null; currency: 'EUR' | 'USD'; cycle: 'monthly' | 'yearly' | 'usage'; renewal: string; prepaid: number | null; cap: number | null; notes: string; updatedAt?: string }
interface P { id: string; name: string; category: Cat; configured: boolean; keyless: boolean; hint: string | null; where: string; billingUrl: string; usage: Usage | null; liveBalance: boolean; balance: Bal; manual: Manual }
interface Data { providers: P[]; fal: { monthUsd: number; totalUsd: number; count: number } | null; at: string }

const CATS: { key: Cat; label: string }[] = [
  { key: 'ai', label: 'Yapay zekâ' }, { key: 'voice', label: 'Ses ve telefon' }, { key: 'data', label: 'Veri ve tarama' }, { key: 'mail', label: 'E-posta' },
  { key: 'infra', label: 'Altyapı' }, { key: 'pay', label: 'Ödeme' }, { key: 'ads', label: 'Reklam' },
];
const CYCLE = { monthly: 'Aylık', yearly: 'Yıllık', usage: 'Kullanıma göre' } as const;
const money = (n: number, c: string) => `${n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${c === 'USD' ? '$' : '€'}`;
const fmtD = (iso: string) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`; };
const daysTo = (ymd: string) => Math.ceil((new Date(`${ymd}T00:00:00`).getTime() - Date.now()) / 86_400_000);
const tone = (b: Bal) => (b.pct === null ? 'none' : b.pct > 50 ? 'ok' : b.pct >= 20 ? 'warn' : 'bad');
const amt = (b: Bal) => `${(b.value ?? 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${b.unit === 'USD' ? '$' : b.unit === 'EUR' ? '€' : b.unit}`;
const status = (p: P): { k: 'ok' | 'off' | 'err'; t: string } =>
  !p.configured ? { k: 'off', t: 'Anahtar yok' } : p.usage?.kind === 'error' ? { k: 'err', t: 'Okunamadı' } : { k: 'ok', t: p.keyless ? 'Anahtarsız' : 'Bağlı' };

function Card({ p, fal, onSaved, onRefreshed }: { p: P; fal: Data['fal']; onSaved: (id: string, m: Manual, b: Bal) => void; onRefreshed: (p: P) => void }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [spin, setSpin] = useState(false);
  const note = useNote();
  const m = p.manual, st = status(p), u = p.usage, b = p.balance;
  const open = () => { setF({ plan: m.plan, fee: m.fee?.toString() ?? '', currency: m.currency, cycle: m.cycle, renewal: m.renewal, prepaid: m.prepaid?.toString() ?? '', cap: m.cap?.toString() ?? '', notes: m.notes }); setEdit(true); };
  const n = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')));
  const save = async () => {
    const body = { plan: f.plan, fee: n(f.fee), currency: f.currency, cycle: f.cycle, renewal: f.renewal, prepaid: n(f.prepaid), cap: n(f.cap), notes: f.notes };
    if ([body.fee, body.prepaid, body.cap].some((x) => x !== null && !Number.isFinite(x))) { note.show({ ok: false, text: 'Tutarlar sayı olmalı.' }); return; }
    setBusy(true);
    try { const r = await api<{ manual: Manual; balance: Bal }>(`/api/admin/providers/${p.id}`, 'PUT', body); onSaved(p.id, r.manual, r.balance); setEdit(false); }
    catch { note.show({ ok: false, text: 'Kaydedilemedi.' }); }
    setBusy(false);
  };
  const refresh = async () => {
    setSpin(true);
    try { const r = await api<{ provider: P }>(`/api/admin/providers/${p.id}/refresh`, 'POST', {}); onRefreshed(r.provider); }
    catch { note.show({ ok: false, text: 'Yenilenemedi (çok sık denediniz mi?).' }); }
    setSpin(false);
  };
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((o) => ({ ...o, [k]: e.target.value }));
  const dl = m.renewal ? daysTo(m.renewal) : null;
  const falNote = p.id === 'fal' && fal;
  return (
    <article className="adm-card pv-card" data-s={st.k}>
      <header className="pv-head"><h3>{p.name}</h3><span className="pv-badge" data-s={st.k}>{st.t}</span></header>
      <p className="pv-where"><span>Nerede kullanılıyor</span>{p.where}</p>
      <p className="pv-key"><span>Anahtar</span><code>{p.hint ?? (p.keyless ? 'gerekmez' : '—')}</code></p>
      <div className="pv-bal" data-t={tone(b)} data-src={b.source}>
        <span className="pv-k">Bakiye / Kredi{b.source === 'live' ? ' · canlı' : b.source === 'manual' ? ' · elle' : ''}</span>
        {b.value !== null ? <>
          <b className="pv-big">{amt(b)}</b>
          {b.pct !== null && <div className="pv-bar" role="progressbar" aria-valuenow={b.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${p.name} kalan`}><i data-w={tone(b) === 'warn' ? 'warn' : tone(b) === 'bad' ? 'bad' : 'ok'} style={{ width: `${b.pct}%` }} /></div>}
          <small>{b.pct !== null && b.total !== null ? `%${b.pct} kaldı (${b.total.toLocaleString('tr-TR')} ${b.unit === 'USD' ? '$' : b.unit === 'EUR' ? '€' : b.unit} üzerinden)` : b.source === 'live' ? 'Yüzde için bütçe sınırı girin.' : ''}{b.note ? `${b.pct !== null || b.source === 'live' ? ' · ' : ''}${b.note}` : ''}{b.source === 'manual' && b.updatedAt ? ` · son güncelleme ${fmtD(b.updatedAt)}` : ''}</small>
        </> : <small>{p.configured || p.keyless ? (p.liveBalance ? 'Bakiye okunamadı.' : 'Canlı bakiye uç noktası yok.') : 'Anahtar yok.'}{' '}<a href={p.billingUrl} target="_blank" rel="noopener noreferrer">Panelden bakın</a></small>}
        {b.reason && <small className="pv-why">Canlı okunamadı: {b.reason}</small>}
        {b.value === null && !edit && <button className="lq-btn-ghost adm-btn sm" onClick={open}>Bakiyeyi elle gir</button>}
      </div>
      {u?.kind === 'text' && <p className="pv-txt">{u.label}</p>}
      {falNote && <p className="pv-txt">Yerel kayıttan tahmin: bu ay ~${falNote.monthUsd} (toplam ~${falNote.totalUsd}, {falNote.count} üretim)</p>}
      {p.id === 'fal' && !fal && <p className="pv-txt">Tahmin yalnızca yerelde okunur; yayında elle girin.</p>}
      {!edit && <dl className="pv-man">
        {m.plan && <><dt>Paket</dt><dd>{m.plan}</dd></>}
        {m.fee !== null && <><dt>Ücret</dt><dd>{money(m.fee, m.currency)} · {CYCLE[m.cycle]}</dd></>}
        {m.renewal && <><dt>Yenileme</dt><dd>{fmtD(m.renewal)}{dl !== null && dl >= 0 && dl <= 7 ? ` (${dl} gün)` : ''}</dd></>}
        {m.cap !== null && <><dt>Bütçe / toplam</dt><dd>{money(m.cap, m.currency)}</dd></>}
        {m.notes && <><dt>Not</dt><dd>{m.notes}</dd></>}
      </dl>}
      {edit && <div className="pv-form">
        <label>Paket adı<input className="adm-input" value={f.plan} onChange={set('plan')} maxLength={80} /></label>
        <div className="pv-row2"><label>Ücret<input className="adm-input" inputMode="decimal" value={f.fee} onChange={set('fee')} /></label>
          <label>Para birimi<select className="adm-input" value={f.currency} onChange={set('currency')}><option>EUR</option><option>USD</option></select></label></div>
        <div className="pv-row2"><label>Dönem<select className="adm-input" value={f.cycle} onChange={set('cycle')}>{(Object.keys(CYCLE) as (keyof typeof CYCLE)[]).map((k) => <option key={k} value={k}>{CYCLE[k]}</option>)}</select></label>
          <label>Yenileme tarihi<input className="adm-input" type="date" value={f.renewal} onChange={set('renewal')} /></label></div>
        <div className="pv-row2"><label>Bakiye (elle)<input className="adm-input" inputMode="decimal" value={f.prepaid} onChange={set('prepaid')} /></label>
          <label>Bütçe / toplam<input className="adm-input" inputMode="decimal" value={f.cap} onChange={set('cap')} /></label></div>
        <label>Not<textarea className="adm-input" rows={2} value={f.notes} onChange={set('notes')} maxLength={500} /></label>
        {note.el}
      </div>}
      <footer className="pv-foot">
        {edit ? <><button className="lq-btn-ghost adm-btn sm adm-pri" disabled={busy} onClick={save}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</button><button className="lq-btn-ghost adm-btn sm" onClick={() => setEdit(false)}>Vazgeç</button></>
          : <><button className="lq-btn-ghost adm-btn sm" onClick={open}>Ücret bilgisini düzenle</button>{p.liveBalance && p.configured && <button className="lq-btn-ghost adm-btn sm" disabled={spin} onClick={refresh}>{spin ? 'Yenileniyor…' : 'Yenile'}</button>}</>}
        <a href={p.billingUrl} target="_blank" rel="noopener noreferrer">Faturalama sayfası</a>
      </footer>
      {!edit && note.el}
    </article>
  );
}

export default function ProvidersView() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState(false);
  const load = useCallback(() => { setErr(false); api<Data>('/api/admin/providers').then(setD).catch(() => setErr(true)); }, []);
  useEffect(() => { load(); }, [load]);
  const saved = (id: string, m: Manual, balance: Bal) => setD((o) => o && { ...o, providers: o.providers.map((p) => (p.id === id ? { ...p, manual: m, balance } : p)) });
  const refreshed = (np: P) => setD((o) => o && { ...o, providers: o.providers.map((p) => (p.id === np.id ? np : p)) });

  if (err) return <div className="adm-banner" role="alert">Hesap bilgileri okunamadı. <button className="lq-btn-ghost adm-btn sm" onClick={load}>Tekrar dene</button></div>;
  if (!d) return <div className="adm-skel" aria-busy="true" />;

  const fixed: Record<string, number> = {};
  for (const p of d.providers) { const { fee, cycle, currency } = p.manual; if (fee && cycle !== 'usage') fixed[currency] = (fixed[currency] ?? 0) + (cycle === 'yearly' ? fee / 12 : fee); }
  const fixedTx = Object.keys(fixed).length ? Object.entries(fixed).map(([c, v]) => money(v, c)).join(' + ') : '—';
  const keyed = d.providers.filter((p) => !p.keyless);
  const withBal = d.providers.filter((p) => p.balance.value !== null);
  const warns: string[] = [];
  for (const p of d.providers) {
    const bl = p.balance; if (bl.value !== null && bl.pct !== null && bl.pct < 20) warns.push(`${p.name} bakiye azaldı (%${bl.pct} kaldı)`);
    if (p.manual.renewal) { const dl = daysTo(p.manual.renewal); if (dl >= 0 && dl <= 7) warns.push(`${p.name} yenileme ${dl} gün içinde`); }
  }
  return (
    <div className="pv">
      <section className="pv-sum" aria-label="Özet">
        <div className="adm-card"><span className="pv-k">Aylık sabit ücret</span><b>{fixedTx}</b><small>Yıllıklar 12'ye bölünür; kullanıma göre olanlar dahil değil.</small></div>
        <div className="adm-card"><span className="pv-k">Tanımlı anahtar</span><b>{keyed.filter((p) => p.configured).length} / {keyed.length}</b><small>Anahtarsız hizmetler sayılmaz.</small></div>
        <div className="adm-card" data-w={warns.length ? 'warn' : 'ok'}><span className="pv-k">Uyarılar</span>{warns.length ? <ul>{warns.map((w) => <li key={w}>{w}</li>)}</ul> : <b>Uyarı yok</b>}</div>
      </section>
      <section className="adm-card pv-strip" aria-label="Bakiyeler"><span className="pv-k">Bakiyeler</span>
        {withBal.length ? <ul>{withBal.map((p) => <li key={p.id} data-t={tone(p.balance)}><span>{p.name}</span><b>{amt(p.balance)}</b><em>{p.balance.source === 'live' ? 'canlı' : 'elle'}</em>{p.balance.pct !== null && <i style={{ width: `${p.balance.pct}%` }} />}</li>)}</ul> : <small>Henüz bakiye yok: kartlardan "Bakiyeyi elle gir" ile ekleyin.</small>}
      </section>
      <p className="pv-note">Anahtar değerleri burada gösterilmez; .env ve Vercel'de saklanır.</p>
      {CATS.map((c) => { const list = d.providers.filter((p) => p.category === c.key); return list.length > 0 && (
        <section key={c.key} className="pv-cat"><h2 className="pv-cath">{c.label}</h2>
          <div className="pv-grid">{list.map((p) => <Card key={p.id} p={p} fal={d.fal} onSaved={saved} onRefreshed={refreshed} />)}</div></section>); })}
    </div>
  );
}
