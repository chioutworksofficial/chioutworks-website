import { useEffect, useState } from 'react';
import { api, fmtDate } from '../api';
import { msgOf } from './shared';
import { fmtDur, usd, type Analytics, type Bucket } from './types';

const RANGES = [7, 30, 90] as const;
const LANG: Record<string, string> = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', el: 'Yunanca', other: 'Belirsiz' };
const WD = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const dm = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

interface Col { key: string; label: string; show: boolean; total: number; part?: number; tip: string }
function Cols({ items, max, rate }: { items: Col[]; max: number; rate?: boolean }) {
  return (
    <div className="vo-cols" data-dense={items.length > 20 ? '1' : undefined} role="img" aria-label="Sütun grafik">
      {items.map((c) => (
        <div key={c.key} className="vo-col" title={c.tip}>
          <div className="vo-colbar" data-rate={rate ? '1' : undefined} data-zero={c.total === 0 ? '1' : undefined} style={{ height: `${Math.max(c.total ? 4 : 0, (c.total / max) * 100)}%` }}>
            {c.part ? <b style={{ height: `${Math.min(100, (c.part / c.total) * 100)}%` }} /> : null}
          </div>
          <span>{c.show ? c.label : ''}</span>
        </div>
      ))}
    </div>
  );
}
const bucketCols = (b: Bucket[], idx: number[], label: (i: number) => string): Col[] => idx.map((i) => ({ key: String(i), label: label(i), show: true, total: b[i].rate ?? 0, tip: `${label(i)}: ${b[i].n ? `%${b[i].rate} olumlu (${b[i].pos}/${b[i].n} görüşme)` : 'veri yok'}` }));
const best = (b: Bucket[], idx: number[], label: (i: number) => string) => idx.filter((i) => b[i].n > 0).sort((x, y) => (b[y].rate ?? 0) - (b[x].rate ?? 0) || b[y].n - b[x].n).slice(0, 3).map((i) => `${label(i)} (%${b[i].rate}, ${b[i].n} görüşme)`);

export default function AnalyticsTab({ version }: { version: number }) {
  const [days, setDays] = useState<number>(30);
  const [d, setD] = useState<Analytics | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { setErr(''); api<Analytics>(`/api/admin/voice-agent/analytics?days=${days}`).then(setD).catch((x) => setErr(msgOf(x, 'Analiz yüklenemedi.'))); }, [days, version]);
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);
  const wdays = [1, 2, 3, 4, 5, 6, 0];
  const f = d?.funnel;
  const posRate = f && f.reached ? pct(f.positive, f.reached) : null;
  const maxDay = d ? Math.max(1, ...d.perDay.map((x) => x.calls)) : 1;
  const langs = d ? Object.entries(d.byLang).sort((a, b) => b[1].calls - a[1].calls) : [];
  return (
    <div className="lq-card adm-card">
      <div className="adm-head"><h2>Analiz</h2>
        <div className="adm-chips" style={{ marginBottom: 0 }} role="group" aria-label="Zaman aralığı">{RANGES.map((r) => <button key={r} type="button" className="adm-chip" aria-pressed={days === r} onClick={() => setDays(r)}>Son {r} gün</button>)}</div></div>
      <p className="adm-sub">Yalnızca gerçek aramalar sayılır; simülasyon kayıtları dahil edilmez. Saatler Europe/Berlin saatidir.</p>
      {err && <div className="adm-banner" role="alert">{err}</div>}
      {!d && !err && <div className="adm-skel" style={{ height: 260 }} />}
      {d && d.total === 0 && <div className="adm-empty vo-emptyx">
        <b>Henüz analiz edilecek gerçek arama yok.</b>
        <span>Canlı mod açılıp Vapi'den ilk "end-of-call-report" bildirimi geldiğinde burada şunlar dolar: günlük arama sayısı, arandı → ulaşıldı → olumlu → randevu hunisi, ortalama süre, en iyi saat ve gün, dil dağılımı, toplam ve arama başına maliyet, kötüye kullanım şüphesi sayısı.</span>
        {d.allTime > 0 && <span className="adm-meta">Bu aralıkta kayıt yok; toplam {d.allTime} gerçek arama var, daha geniş bir aralık deneyin.</span>}
      </div>}
      {d && d.total > 0 && f && <div className="vo-stack">
        <div className="vo-kpis" role="list">
          {([['Arama', String(d.total)], ['Ortalama süre', fmtDur(d.avgDurationSec)], ['Olumlu oran', posRate === null ? '-' : `%${posRate}`], ['Toplam maliyet', d.cost.counted ? usd(d.cost.totalUsd) : '-'], ['Arama başına', d.cost.counted ? usd(d.cost.avgUsd) : '-'], ['Kötüye kullanım şüphesi', String(d.abuse)]] as const).map(([k, v]) => (
            <div key={k} className="vo-tile" role="listitem"><span className="adm-label">{k}</span><b {...(k === 'Kötüye kullanım şüphesi' && d.abuse ? { 'data-state': 'bad' } : {})}>{v}</b></div>))}
        </div>
        <section className="vo-chart"><h3>Günlük aramalar</h3>
          <Cols max={maxDay} items={d.perDay.map((x, i) => ({ key: x.date, label: dm(x.date), show: i === 0 || i === d.perDay.length - 1 || i % Math.ceil(d.perDay.length / 6) === 0, total: x.calls, part: x.positive, tip: `${dm(x.date)}: ${x.calls} arama, ${x.positive} olumlu` }))} />
          <p className="adm-meta vo-legend"><i className="vo-sw" /> Arama <i className="vo-sw p" /> Olumlu (randevu veya ilgili)</p></section>
        <section className="vo-chart"><h3>Sonuç hunisi</h3>
          <div className="vo-funnel">{([['Arandı', f.dialed, f.dialed], ['Ulaşıldı', f.reached, f.dialed], ['Olumlu', f.positive, f.reached], ['Randevu', f.booked, f.positive]] as const).map(([k, v, base]) => (
            <div key={k} className="vo-frow"><span>{k}</span><div className="adm-bar"><i style={{ width: `${f.dialed ? Math.max(v ? 2 : 0, pct(v, f.dialed)) : 0}%` }} /></div><b>{v}</b><span className="adm-meta">{k === 'Arandı' ? 'giden' : `%${pct(v, base)} önceki adımdan`}</span></div>))}</div>
          <p className="adm-meta">Olumlu = randevu alındı veya 30 saniyeyi aşan ilgili görüşme. Gelen aramalar huniye girmez ({d.inbound} gelen).</p></section>
        <div className="vo-two">
          <section className="vo-chart"><h3>Saate göre olumlu oran</h3>
            <Cols rate max={100} items={bucketCols(d.byHour, hours, (i) => String(i).padStart(2, '0'))} />
            <p className="adm-meta">{best(d.byHour, hours, (i) => `${String(i).padStart(2, '0')}:00`).join(' · ') || 'Henüz yeterli ulaşılan görüşme yok.'}</p></section>
          <section className="vo-chart"><h3>Güne göre olumlu oran</h3>
            <Cols rate max={100} items={bucketCols(d.byWeekday, wdays, (i) => WD[i])} />
            <p className="adm-meta">{best(d.byWeekday, wdays, (i) => WD[i]).join(' · ') || 'Henüz yeterli ulaşılan görüşme yok.'}</p></section>
        </div>
        <div className="vo-two">
          <section className="vo-chart"><h3>Dile göre dağılım</h3>
            <div className="vo-funnel">{langs.map(([l, v]) => (
              <div key={l} className="vo-frow"><span>{LANG[l] ?? l}</span><div className="adm-bar"><i style={{ width: `${pct(v.calls, d.total)}%` }} /></div><b>{v.calls}</b><span className="adm-meta">{v.positive} olumlu</span></div>))}</div></section>
          <section className="vo-chart"><h3>Maliyet</h3>
            {d.cost.counted === 0 ? <p className="adm-meta">Maliyet verisi yok. Vapi'nin end-of-call-report bildirimindeki <code>cost</code> alanı (USD) geldikçe saklanır.</p> : <>
              <p className="vo-costline"><b>{usd(d.cost.totalUsd)}</b> toplam · <b>{usd(d.cost.avgUsd)}</b> arama başına <span className="adm-meta">({d.cost.counted} aramada maliyet var{d.cost.missing ? `, ${d.cost.missing} aramada yok` : ''})</span></p>
              <ul className="vo-links">{d.cost.top.map((c) => <li key={c.id}>{fmtDate(c.createdAt)} · {c.person || 'Bilinmeyen'} · {usd(c.costUsd)}</li>)}</ul></>}
            <p className="adm-meta">İlgisiz diyen: {d.notInterested}. Kötüye kullanım şüphesi: {d.abuse}.</p></section>
        </div>
      </div>}
    </div>
  );
}
