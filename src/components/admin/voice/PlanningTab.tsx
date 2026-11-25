import { useEffect, useState } from 'react';
import { api } from '../api';
import { useNote } from '../bulk';
import { msgOf } from './shared';
import type { CC, PlanningCfg, PlanningRes } from './types';

const DAYS = [[1, 'Pzt'], [2, 'Sal'], [3, 'Çar'], [4, 'Per'], [5, 'Cum'], [6, 'Cmt'], [0, 'Paz']] as const;
const CCS: CC[] = ['DE', 'TR', 'GR'];
const dmy = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;

export default function PlanningTab({ onSaved }: { onSaved: () => void }) {
  const [res, setRes] = useState<PlanningRes | null>(null);
  const [f, setF] = useState<PlanningCfg | null>(null);
  const [slot, setSlot] = useState('');
  const [busy, setBusy] = useState(false);
  const note = useNote();
  const load = () => api<PlanningRes>('/api/admin/voice-agent/planning').then((r) => { setRes(r); setF(r.planning); }).catch((x) => note.show({ ok: false, text: msgOf(x, 'Kurallar yüklenemedi.') }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);
  if (!res || !f) return <div className="lq-card adm-card">{note.el}<div className="adm-skel" style={{ height: 240 }} /></div>;
  const dirty = JSON.stringify(f) !== JSON.stringify(res.planning);
  const setH = (c: CC, p: Partial<PlanningCfg['hours'][CC]>) => setF({ ...f, hours: { ...f.hours, [c]: { ...f.hours[c], ...p } } });
  const toggle = (c: CC, d: number) => { const cur = f.hours[c].days; setH(c, { days: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d] }); };
  const num = (k: 'dailyMax' | 'minGapMin' | 'maxAttempts') => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: Number(e.target.value) });
  const addSlot = () => { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(slot) && !f.callbackSlots.includes(slot) && f.callbackSlots.length < 8) { setF({ ...f, callbackSlots: [...f.callbackSlots, slot].sort() }); setSlot(''); } };
  const save = async () => {
    setBusy(true);
    try { await api('/api/admin/voice-agent/planning', 'PUT', f); await load(); onSaved(); note.show({ ok: true, text: 'Kurallar kaydedildi. Bir sonraki aramadan itibaren geçerli.' }); }
    catch (x) { note.show({ ok: false, text: msgOf(x, 'Kaydedilemedi: saat, gün ve sayıları kontrol edin.') }); }
    setBusy(false);
  };
  return (
    <div className="lq-card adm-card">
      <div className="adm-head"><h2>Planlama</h2><span className="adm-chip" data-state={res.today.calls >= res.today.max ? 'bad' : 'paid'}>Bugün {res.today.calls} / {res.today.max} arama</span></div>
      <p className="adm-sub">Bu kurallar her aramadan önce sunucuda denetlenir (simülasyon dahil). Kural dışı bir arama başlamaz; satırda nedeni yazar.</p>
      {note.el}
      <div className="vo-stack">
        <section className="vo-plan">
          <h3>Mesai saatleri (arananın yerel saati)</h3>
          <div className="vo-countries">{CCS.map((c) => (
            <div key={c} className="vo-ccard">
              <div className="vo-qtop"><b>{res.countries[c]}</b><span className="adm-meta">şu an {res.now[c].time}</span></div>
              <div className="adm-chips" style={{ marginBottom: 0 }} role="group" aria-label={`${res.countries[c]} günleri`}>{DAYS.map(([d, l]) => <button key={d} type="button" className="adm-chip" aria-pressed={f.hours[c].days.includes(d)} onClick={() => toggle(c, d)}>{l}</button>)}</div>
              <div className="vo-two2">
                <label className="adm-label">Başlangıç<input className="adm-input" type="time" value={f.hours[c].start} onChange={(e) => setH(c, { start: e.target.value })} /></label>
                <label className="adm-label">Bitiş<input className="adm-input" type="time" value={f.hours[c].end} onChange={(e) => setH(c, { end: e.target.value })} /></label>
              </div>
            </div>))}</div>
          <label className="vo-rec"><input type="checkbox" className="adm-check" checked={f.holidays} onChange={(e) => setF({ ...f, holidays: e.target.checked })} /><span>Resmî tatillerde arama yapılmasın (Almanya ulusal, Türkiye, Yunanistan; 2026-2027)</span></label>
        </section>
        <section className="vo-plan">
          <h3>Sınırlar</h3>
          <div className="vo-limits">
            <label className="adm-label">Günlük en fazla arama<input className="adm-input" type="number" min={1} max={500} value={f.dailyMax} onChange={num('dailyMax')} /></label>
            <label className="adm-label">Aramalar arası en az (dk)<input className="adm-input" type="number" min={0} max={240} value={f.minGapMin} onChange={num('minGapMin')} /></label>
            <label className="adm-label">Kişi başına deneme<input className="adm-input" type="number" min={1} max={3} value={f.maxAttempts} onChange={num('maxAttempts')} /></label>
          </div>
          <p className="adm-meta">Sahip kuralı: kişi başına en fazla 1 deneme; cevap verilmezse tekrar aranmaz, yazılı devam edilir. Yalnızca gerçek aramalar sayılır, simülasyon kayıtları hakkı tüketmez.</p>
        </section>
        <section className="vo-plan">
          <h3>Geri arama slotları</h3>
          <p className="adm-meta">Kural dışı saatte reddedilen bir aramada "sonraki uygun zaman" bu saatlerden seçilir (kişinin yerel saati).</p>
          <div className="adm-chips" style={{ marginBottom: 0 }}>{f.callbackSlots.map((s) => <span key={s} className="adm-chip tag vo-slot">{s}<button type="button" className="vo-x" aria-label={`${s} slotunu sil`} onClick={() => setF({ ...f, callbackSlots: f.callbackSlots.filter((x) => x !== s) })}>×</button></span>)}{!f.callbackSlots.length && <span className="adm-meta">Slot yok: mesai başlangıcı kullanılır.</span>}</div>
          <div className="vo-addrow"><input className="adm-input" type="time" aria-label="Yeni slot" value={slot} onChange={(e) => setSlot(e.target.value)} /><button type="button" className="lq-btn-ghost adm-btn sm" onClick={addSlot} disabled={!slot || f.callbackSlots.length >= 8}>Slot ekle</button></div>
        </section>
        <div className="adm-actions"><button type="button" className="lq-btn-ghost adm-btn adm-pri" onClick={save} disabled={busy || !dirty}>{busy ? 'Kaydediliyor…' : 'Kuralları kaydet'}</button>
          <button type="button" className="lq-btn-ghost adm-btn" onClick={() => setF(res.defaults)} disabled={busy}>Varsayılana getir</button></div>
        <details className="vo-holidays"><summary>Yaklaşan resmî tatiller</summary>
          <div className="vo-countries">{CCS.map((c) => <div key={c} className="vo-ccard"><b>{res.countries[c]}</b><ul className="vo-links">{res.holidays[c].map((h) => <li key={h.date}>{dmy(h.date)} · {h.name}</li>)}</ul></div>)}</div>
          <p className="adm-meta">Statik liste (2026-2027). Dini bayram tarihleri (Türkiye) tahminidir; Diyanet takvimiyle doğrulayın. Yıl sonunda liste güncellenmelidir.</p></details>
      </div>
    </div>
  );
}
