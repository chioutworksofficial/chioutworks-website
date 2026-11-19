import { useState } from 'react';
import { BulkBar, Check, SelectHeader, bulkApi, useNote, useSelection } from './bulk';
import type { Req } from './api';
import AnalysisPanel from './AnalysisPanel';
import { api, fmtDate, type VoiceSession } from './api';

/** How long the conversation lasted: first to last message (the voice assistant caps a call at a few minutes). */
const duration = (turns: { at: number }[]) => {
  if (turns.length < 2) return null;
  const sec = Math.max(0, Math.round((turns[turns.length - 1].at - turns[0].at) / 1000));
  return sec < 60 ? `${sec} sn` : `${Math.floor(sec / 60)} dk ${sec % 60} sn`;
};

const LANG: Record<string, string> = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', el: 'Yunanca' };
const TITLE: Record<string, Record<string, string>> = { m: { tr: 'Bay', de: 'Herr', en: 'Mr', el: 'κύριος' }, f: { tr: 'Bayan', de: 'Frau', en: 'Ms', el: 'κυρία' } };
const who = (s: VoiceSession) => {
  if (s.contact?.name) return s.contact.name;
  const n = [s.firstName, s.lastName].filter(Boolean).join(' ');
  if (!n) return 'Anonim ziyaretçi';
  const t = s.salutation ? TITLE[s.salutation][s.lang] : '';
  return t ? `${t} ${n}` : n;
};
interface Props { sessions: VoiceSession[] | null; setSessions: (s: VoiceSession[]) => void; openId: string | null; setOpenId: (id: string | null) => void; go?: (t: 'requests', id?: string) => void; setReqs?: (fn: (r: Req[] | null) => Req[] | null) => void }

export default function VoiceView({ sessions, setSessions, openId, setOpenId, go, setReqs }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const sel = useSelection((sessions ?? []).map((s) => s.id));
  const note = useNote();
  const bulkDelete = async () => {
    const ids = sel.sel; const prev = sessions ?? []; const set = new Set(ids);
    setSessions(prev.filter((x) => !set.has(x.id)));
    setReqs?.((rr) => rr && rr.map((q) => q.voiceSessionId && set.has(q.voiceSessionId) ? { ...q, voiceSessionId: undefined } : q));
    if (openId && set.has(openId)) setOpenId(null);
    sel.clear();
    try { const n = await bulkApi('/api/admin/voice-sessions/bulk', ids, 'delete'); note.show({ ok: true, text: `${n} kayıt silindi` }); }
    catch { setSessions(prev); note.show({ ok: false, text: 'Toplu silme yapılamadı, tekrar deneyin.' }); }
  };
  const open = (sessions ?? []).find((s) => s.id === openId) ?? null;
  const remove = async (s: VoiceSession) => {
    try { await api(`/api/admin/voice-sessions/${s.id}`, 'DELETE'); setSessions((sessions ?? []).filter((x) => x.id !== s.id)); setOpenId(null); setConfirm(false); }
    catch { setMsg('Silinemedi, tekrar deneyin.'); }
  };
  return (
    <>
      <h1 className="adm-h1">Sesli görüşmeler ve yazılı sohbetler</h1>
      <p className="adm-sub">{sessions ? `${sessions.length} görüşme` : 'Yükleniyor…'}</p>
      {note.el}
      {sessions === null ? <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>
        : sessions.length === 0 ? <div className="adm-empty">Henüz sesli görüşme yok</div>
        : <div className="adm-split" data-open={open ? 'true' : 'false'}>
          <div>
          <SelectHeader s={sel} total={sessions.length} />
          <div className="adm-list">{sessions.map((s) => (
            <div key={s.id} className={`adm-row${sel.has(s.id) ? ' sel' : ''}`} aria-current={s.id === openId}>
              <Check checked={sel.has(s.id)} label={`Seç: ${who(s)}`} onToggle={(sh) => sel.toggle(s.id, sh)} />
              <button className="adm-rowmain" onClick={() => { setOpenId(s.id); setConfirm(false); setMsg(null); }}>
              <span style={{ minWidth: 0, flex: '1 1 150px' }}>
                <span className="adm-name">{who(s)}</span><br />
                <span className="adm-meta">{fmtDate(s.createdAt)} · {LANG[s.lang] ?? s.lang} · {s.turns.length} mesaj{duration(s.turns) ? ` · ${s.kind === 'text' ? 'süre' : 'konuşma'} ${duration(s.turns)}` : ''}</span>
                {' '}<span className="adm-chip" data-src={s.kind === 'text' ? 'chat' : 'voice'}>{s.kind === 'text' ? 'Yazılı sohbet' : 'Sesli görüşme'}{duration(s.turns) ? ` · ${duration(s.turns)}` : ''}</span>
              </span>
              {s.contactSubmitted && <span className="adm-chip tag">Talebe dönüştü</span>}
              </button>
            </div>))}</div>
          <BulkBar count={sel.sel.length} onDelete={bulkDelete} />
          </div>
          <div className="adm-detail lq-card adm-card">
            {!open ? <div className="adm-empty" style={{ border: 'none' }}>Dökümü görmek için bir görüşme seçin</div> : <>
              <div className="adm-head">
                <button className="lq-btn-ghost adm-btn sm" onClick={() => setOpenId(null)}>Geri</button>
                <div className="adm-actions">
                  {!confirm ? <button className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(true)}>Sil</button> : <>
                    <button className="lq-btn-ghost adm-btn sm" onClick={() => remove(open)}>Evet, sil</button>
                    <button className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(false)}>Vazgeç</button></>}
                </div>
              </div>
              {msg && <div className="adm-banner" role="alert">{msg}</div>}
              <p className="adm-name" style={{ marginBottom: 6 }}>{who(open)}</p>
              {open.contactSubmitted && open.contactId && go && <button className="lq-btn-ghost adm-btn sm" style={{ marginBottom: 12 }} onClick={() => go('requests', open.contactId)}>Talebe dönüştü: talebi aç</button>}
              {open.contact && <p className="adm-meta" style={{ marginBottom: 12 }}>{[open.contact.name, open.contact.email, open.contact.phone].filter(Boolean).join(' · ')}</p>}
              {duration(open.turns) && <p className="adm-meta" style={{ margin: '0 0 12px' }}><span className="adm-chip" data-src={open.kind === 'text' ? 'chat' : 'voice'}>{open.kind === 'text' ? 'Sohbet süresi' : 'Konuşma süresi'}: {duration(open.turns)}</span></p>}
              {open.turns.length > 0 && <div style={{ marginBottom: 16 }}><AnalysisPanel key={open.id} type="session" id={open.id} title={who(open)} analysis={open.analysis}
                onDone={(a) => setSessions((sessions ?? []).map((x) => x.id === open.id ? { ...x, analysis: a } : x))} /></div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {open.turns.length === 0 && <div className="adm-empty">Döküm silinmiş veya boş</div>}
                {open.turns.map((t, i) => (
                  <div key={i} className={`adm-bubble ${t.role === 'user' ? 'u' : 'a'}`}>
                    <small>{t.role === 'user' ? 'Ziyaretçi' : 'Asistan'} · {new Date(t.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</small>{t.text}
                  </div>))}
              </div>
            </>}
          </div>
        </div>}
    </>
  );
}
