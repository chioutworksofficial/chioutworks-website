import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useNote } from '../bulk';
import { msgOf } from './shared';
import type { ReadyRes, SelfStep } from './types';

export default function Readiness({ version, onChange }: { version: number; onChange: () => void }) {
  const [d, setD] = useState<ReadyRes | null>(null);
  const [steps, setSteps] = useState<SelfStep[] | null>(null);
  const [busy, setBusy] = useState('');
  const [open, setOpen] = useState(true);
  const note = useNote();
  const load = useCallback(() => api<ReadyRes>('/api/admin/voice-agent/readiness').then(setD).catch((x) => note.show({ ok: false, text: msgOf(x, 'Hazırlık durumu yüklenemedi.') })), []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load, version]);
  const test = async () => {
    setBusy('test');
    try { const r = await api<{ ok: boolean; message: string }>('/api/admin/voice-agent/test-connection', 'POST'); note.show({ ok: r.ok, text: r.message }); }
    catch (x) { note.show({ ok: false, text: msgOf(x, 'Önce Vapi private API key girip kaydedin.') }); }
    await load(); setBusy('');
  };
  const self = async () => {
    setBusy('self'); setSteps(null);
    try { const r = await api<{ ok: boolean; steps: SelfStep[] }>('/api/admin/voice-agent/selftest', 'POST'); setSteps(r.steps); note.show({ ok: r.ok, text: r.ok ? 'Uçtan uca deneme başarılı; geçici kayıtlar silindi.' : 'Denemede başarısız adım var.' }); }
    catch (x) { note.show({ ok: false, text: msgOf(x, 'Deneme çalıştırılamadı.') }); }
    onChange(); setBusy('');
  };
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); note.show({ ok: true, text: 'Kopyalandı' }); } catch { note.show({ ok: false, text: 'Kopyalanamadı, elle seçin.' }); } };
  return (
    <section className="lq-card adm-card vo-ready" aria-label="Hazırlık">
      <div className="adm-head"><h2>Hazırlık</h2>
        <span className="adm-chip" data-state={!d ? undefined : d.missing ? 'bad' : 'paid'}>{!d ? '…' : d.missing ? `${d.missing} eksik` : 'Hepsi tamam'}</span>
        <button type="button" className="lq-btn-ghost adm-btn sm" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Daralt' : 'Aç'}</button></div>
      <p className="adm-sub">Canlıya geçmek için gerekenler ve şu anki durumları. Alan adı, Vapi ve diğer anahtarlar tamamlanınca sistem ek kod olmadan çalışır.</p>
      {note.el}
      <div className="adm-actions" style={{ marginBottom: 12 }}>
        <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!!busy} onClick={self}>{busy === 'self' ? 'Çalışıyor…' : 'Uçtan uca deneme (simülasyon)'}</button>
        <button type="button" className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={test}>{busy === 'test' ? 'Test ediliyor…' : 'Vapi’yi test et'}</button>
      </div>
      {steps && <ol className="vo-steps" aria-label="Deneme adımları">{steps.map((s, k) => <li key={k} data-ok={s.ok ? '1' : '0'}><span className="adm-chip" data-state={s.ok ? 'paid' : 'bad'}>{s.ok ? 'Geçti' : 'Hata'}</span><span>{s.label}{s.detail ? <small> · {s.detail}</small> : null}</span></li>)}</ol>}
      {open && (!d ? <div className="adm-skel" style={{ height: 160 }} /> : <ul className="vo-chk">{d.items.map((i) => (
        <li key={i.id} data-st={i.status}>
          <span className="adm-chip" data-state={i.status === 'ok' ? 'paid' : i.status === 'missing' ? 'bad' : undefined}>{i.status === 'ok' ? 'OK' : i.status === 'missing' ? 'eksik' : 'bilgi'}</span>
          <div><b>{i.label}</b>
            <span className="adm-meta">{i.id === 'serverUrl' ? <code>{i.detail}</code> : i.detail}{i.id === 'serverUrl' && <> <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => copy(i.detail)}>Kopyala</button></>}</span>
            {i.status !== 'ok' && <span className="adm-meta vo-how">Nasıl yapılır: {i.how}</span>}</div>
        </li>))}</ul>)}
    </section>
  );
}
