import { useEffect, useRef, useState } from 'react';
import { api, fmtDate } from '../api';
import { download, fmtDur, fmtSlot, OUTCOME, RECORDING_URL, type CallDetail } from './types';

/** "AI: …" / "User: …" lines become chat bubbles; anything else stays plain text. */
const turns = (t: string) => t.split(/\r?\n/).filter(Boolean).map((l) => { const m = /^(AI|Assistant|Bot|User|Customer|Caller)\s*:\s*(.*)$/i.exec(l); return { who: m ? (/^(ai|assistant|bot)$/i.test(m[1]) ? 'ai' : 'user') : '', text: m ? m[2] : l }; });

export default function CallDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [d, setD] = useState<CallDetail | null>(null);
  const [err, setErr] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { api<CallDetail>(`/api/admin/voice-agent/calls/${encodeURIComponent(id)}`).then(setD).catch(() => setErr(true)); }, [id]);
  useEffect(() => { closeRef.current?.focus(); const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  const c = d?.call;
  return (
    <>
      <div className="adm-drawer-bg" onClick={onClose} />
      <aside className="adm-drawer vo-drawer" role="dialog" aria-modal="true" aria-label="Arama detayı">
        <div className="adm-head"><h2>{c ? c.person || 'Bilinmeyen arayan' : 'Arama detayı'}</h2><button ref={closeRef} type="button" className="lq-btn-ghost adm-btn sm" onClick={onClose}>Kapat</button></div>
        {err && <div className="adm-banner" role="alert">Detay yüklenemedi.</div>}
        {!d && !err && <div className="adm-skel" style={{ height: 200 }} />}
        {d && c && <>
          <div className="vo-dmeta">
            <span className="adm-chip" data-state={c.outcome}>{OUTCOME[c.outcome]}</span>
            <span className="adm-meta">{fmtDate(c.createdAt)} · {c.direction === 'in' ? 'Gelen' : 'Giden'} · {fmtDur(c.durationSec)}{c.simulated ? ' · simülasyon' : ''}</span>
            {c.business && <span className="adm-meta">{c.business}</span>}
          </div>
          <section className="vo-sec"><h3>Özet</h3><p>{c.summary || 'Özet yok.'}</p></section>
          <section className="vo-sec"><h3>Sonuç</h3><p>{OUTCOME[c.outcome]}{c.endedReason ? ` (${c.endedReason})` : ''}</p></section>
          <section className="vo-sec"><h3>Bağlantılı kayıtlar</h3>
            {!d.customer && !d.appointments.length ? <p className="adm-meta">Bağlı kişi veya takvim kaydı yok.</p> : <ul className="vo-links">
              {d.customer && <li>Kişi: {d.customer.name} · {d.customer.phoneMasked}{d.customer.sourceLeadId ? ' · satış adayından' : d.customer.sourceRequestId ? ' · talepten' : ''}{d.customer.doNotCall ? ' · aranmasın' : ''}</li>}
              {d.appointments.map((a) => <li key={a.id}>Randevu: {fmtSlot(a.start)}{a.notes ? ` · ${a.notes}` : ''}</li>)}</ul>}</section>
          <section className="vo-sec"><h3>Ses kaydı</h3>
            {d.recording ? <>
              {d.recording.proxy ? <><audio controls preload="none" src={RECORDING_URL(c.id)} /><a className="lq-btn-ghost adm-btn sm" href={RECORDING_URL(c.id)} download>İndir</a></>
                : <a className="lq-btn-ghost adm-btn sm" href={d.recording.url} target="_blank" rel="noopener noreferrer">Kaydı aç (harici bağlantı)</a>}</> : <p className="adm-meta">Bu arama için ses kaydı yok.</p>}
            <p className="adm-meta">Kayıt varsayılan olarak kapalıdır; yalnızca arayanın açık rızasıyla alınabilir (§201 StGB).</p></section>
          <section className="vo-sec"><div className="adm-head" style={{ marginBottom: 0 }}><h3>Transkript</h3>
            {c.transcript && <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => download(`transkript-${c.id}.txt`, c.transcript, 'text/plain')}>Transkripti indir (.txt)</button>}</div>
            {!c.transcript ? <p className="adm-meta">Transkript yok.</p> : <div className="vo-chat">{turns(c.transcript).map((t, i) => <p key={i} data-who={t.who || undefined}>{t.who && <span className="adm-label">{t.who === 'ai' ? 'Asistan' : 'Arayan'}</span>}{t.text}</p>)}</div>}</section>
        </>}
      </aside>
    </>
  );
}
