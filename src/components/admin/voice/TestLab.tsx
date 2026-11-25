import { useEffect, useRef, useState } from 'react';
import { api, ApiError, fmtDate } from '../api';
import { useNote } from '../bulk';
import { msgOf } from './shared';
import type { Lang, SimRule, SimRun, SimTurn } from './types';

const LANGS: [Lang, string][] = [['de', 'Almanca'], ['tr', 'Türkçe'], ['en', 'İngilizce'], ['el', 'Yunanca']];
const PERSONAS: [string, string][] = [['lazy', 'Tembel'], ['busy', 'Meşgul'], ['skeptical', 'Şüpheci'], ['expert', 'Uzman'], ['angry', 'Kızgın'], ['confused', 'Şaşkın / yaşlı'], ['injection', 'Prompt enjeksiyonu saldırganı'], ['bot', '"Bot musun?"'], ['otherai', 'Hatta başka bir YZ'], ['notinterested', 'İlgilenmiyor']];
const RULE_SHORT: Record<string, string> = { disclosure: 'YZ bildirimi', noPrice: 'Fiyat/söz yok', language: 'Dil', stopOnNo: 'Hayırda durur', noLeak: 'Sızıntı yok', close: 'Kapanış' };
const MARK = { pass: 'Geçti', fail: 'Kaldı', na: 'Uygulanmadı' } as const;
const STATE = { pass: 'paid', fail: 'bad', na: 'to_call' } as const;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** POST that waits and retries when the provider is at its per-minute limit (server answers 429 + retryAfter). */
async function post<T>(path: string, body: unknown, stop?: { current: boolean }): Promise<T> {
  for (let i = 0; ; i++) {
    try { return await api<T>(path, 'POST', body); }
    catch (x) {
      const d = x instanceof ApiError ? (x.data as { error?: string; retryAfter?: number } | undefined) : undefined;
      if (!(x instanceof ApiError && x.status === 429 && d?.error === 'rate_limited') || i >= 8 || stop?.current) throw x;
      await wait((d?.retryAfter ?? 20) * 1000);
    }
  }
}

function Transcript({ turns }: { turns: SimTurn[] }) {
  return <div className="vo-chat">{turns.map((t, i) => <p key={i} data-who={t.who === 'ai' ? 'ai' : 'user'}><span className="adm-label">{t.who === 'ai' ? 'Asistan' : 'Arayan'}</span>{t.text}</p>)}</div>;
}
function Rubric({ rules, pass }: { rules: SimRule[]; pass?: boolean }) {
  return (
    <div className="vo-rubric">
      {pass !== undefined && <p><span className="adm-chip" data-state={pass ? 'paid' : 'bad'}>{pass ? 'Tüm kurallar geçti' : 'En az bir kural kaldı'}</span></p>}
      <ul>{rules.map((r) => <li key={r.id}><span className="adm-chip" data-state={STATE[r.status]}>{MARK[r.status]}</span><div><b>{r.label}</b><span className="adm-meta">{r.detail}</span></div></li>)}</ul>
    </div>
  );
}

export default function TestLab({ onChange }: { onChange: () => void }) {
  const [lang, setLang] = useState<Lang>('de');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [persona, setPersona] = useState('skeptical');
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState('');
  const [cur, setCur] = useState<{ turns: SimTurn[]; rules: SimRule[]; pass: boolean; label: string } | null>(null);
  const [line, setLine] = useState('');
  const [runs, setRuns] = useState<SimRun[]>([]);
  const [batch, setBatch] = useState<{ done: SimRun[]; total: number; running: boolean; err: string } | null>(null);
  const stop = useRef(false);
  const note = useNote();
  const loadRuns = () => api<{ runs: SimRun[] }>('/api/admin/voice-agent/sim/runs').then((r) => setRuns(r.runs)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRuns(); }, []);

  /** Client-driven automatic run: one short request per turn (live transcript), then one save request that also computes the rubric. */
  const autoRun = async (who: { persona?: string; custom?: string }, batchId?: string, live?: (t: SimTurn[]) => void): Promise<SimRun> => {
    let turns: SimTurn[] = [];
    for (let i = 0; i < 8; i++) {
      const r = await post<{ turns: SimTurn[]; ended: boolean }>('/api/admin/voice-agent/sim/auto-step', { lang, ...who, turns, max: 6 }, stop); turns = r.turns; live?.(turns);
      if (r.ended || stop.current) break;
    }
    return (await post<{ run: SimRun }>('/api/admin/voice-agent/sim/save', { lang, turns, persona: who.persona ?? 'custom', ...(batchId ? { batchId } : {}) })).run;
  };
  const runOne = async () => {
    setBusy('run'); setCur(null); stop.current = false;
    try {
      const r = await autoRun(persona === 'custom' ? { custom: custom.trim() } : { persona }, undefined, (t) => setCur({ turns: t, rules: [], pass: false, label: 'çalışıyor…' }));
      setCur({ turns: r.turns, rules: r.rules, pass: r.pass, label: r.label }); await loadRuns(); onChange();
    } catch (x) { note.show({ ok: false, text: msgOf(x, 'Test çalıştırılamadı.') }); }
    setBusy('');
  };
  const step = async (turns: SimTurn[], l?: string) => {
    setBusy('step');
    try {
      const r = await api<{ turns: SimTurn[]; rules: SimRule[]; pass: boolean }>('/api/admin/voice-agent/sim/step', 'POST', { lang, turns, ...(l ? { line: l } : {}) });
      setCur({ turns: r.turns, rules: r.rules, pass: r.pass, label: 'Elle yazılan' }); setLine('');
    } catch (x) { note.show({ ok: false, text: msgOf(x, 'Yanıt alınamadı.') }); }
    setBusy('');
  };
  const saveManual = async () => {
    if (!cur) return;
    try { await api('/api/admin/voice-agent/sim/save', 'POST', { lang, turns: cur.turns }); await loadRuns(); onChange(); note.show({ ok: true, text: 'Test kaydedildi.' }); }
    catch (x) { note.show({ ok: false, text: msgOf(x, 'Kaydedilemedi.') }); }
  };
  const redTeam = async () => {
    stop.current = false; const id = `rt_${Date.now().toString(36)}`; setBatch({ done: [], total: PERSONAS.length, running: true, err: '' }); setCur(null);
    const done: SimRun[] = [];
    for (const [p] of PERSONAS) {
      if (stop.current) break;
      try { const r = await autoRun({ persona: p }, id); done.push(r); setBatch({ done: [...done], total: PERSONAS.length, running: true, err: '' }); }
      catch (x) { setBatch({ done: [...done], total: PERSONAS.length, running: false, err: msgOf(x, 'Bir test çalışmadı; toplu test durduruldu.') }); await loadRuns(); onChange(); return; }
      await wait(1500);   // sequential and spaced: stays under the rate limit and the provider's per-minute budget
    }
    setBatch({ done, total: PERSONAS.length, running: false, err: stop.current ? 'Durduruldu.' : '' }); await loadRuns(); onChange();
  };
  const del = async (id: string) => { try { await api(`/api/admin/voice-agent/sim/runs/${id}`, 'DELETE'); await loadRuns(); onChange(); } catch (x) { note.show({ ok: false, text: msgOf(x, 'Silinemedi.') }); } };
  const ruleIds = Object.keys(RULE_SHORT);
  const failTotals = batch ? ruleIds.map((id) => batch.done.filter((r) => r.rules.find((x) => x.id === id)?.status === 'fail').length) : [];

  return (
    <div className="vo-stack">
      <div className="lq-card adm-card">
        <div className="adm-head"><h2>Test laboratuvarı</h2><span className="adm-chip tag">Telefon yok · Vapi maliyeti yok</span></div>
        <p className="adm-sub">Asistanın kayıtlı sistem talimatı bir arayan tipiyle metin olarak sınanır; gerçek arama yapılmaz. Sonuçta otomatik kural denetimi çıkar. Günlük test sayısı maliyet koruması için sınırlıdır.</p>
        {note.el}
        <div className="vo-testbar">
          <div className="adm-chips" style={{ marginBottom: 0 }} role="group" aria-label="Dil">{LANGS.map(([k, l]) => <button key={k} type="button" className="adm-chip" aria-pressed={lang === k} onClick={() => { setLang(k); setCur(null); }}>{l}</button>)}</div>
          <div className="adm-chips" style={{ marginBottom: 0 }} role="group" aria-label="Mod">
            <button type="button" className="adm-chip" aria-pressed={mode === 'auto'} onClick={() => { setMode('auto'); setCur(null); }}>Otomatik (YZ iki tarafı oynar)</button>
            <button type="button" className="adm-chip" aria-pressed={mode === 'manual'} onClick={() => { setMode('manual'); setCur(null); }}>Arayanı ben yazarım</button></div>
        </div>
        {mode === 'auto' ? <div className="vo-stack">
          <div><span className="adm-label">Arayan tipi</span>
            <div className="adm-chips" style={{ marginBottom: 0 }} role="group" aria-label="Arayan tipi">{PERSONAS.map(([k, l]) => <button key={k} type="button" className="adm-chip" aria-pressed={persona === k} onClick={() => setPersona(k)}>{l}</button>)}
              <button type="button" className="adm-chip" aria-pressed={persona === 'custom'} onClick={() => setPersona('custom')}>Kendi tarifim</button></div></div>
          {persona === 'custom' && <label className="adm-label">Arayan nasıl davransın? (İngilizce veya Türkçe, en fazla 300 karakter)<input className="adm-input" maxLength={300} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Örn. Sürekli sözünü kesen, fiyat soran bir esnaf" /></label>}
          <div className="adm-actions">{busy === 'run' && <button type="button" className="lq-btn-ghost adm-btn" onClick={() => { stop.current = true; }}>Durdur</button>}<button type="button" className="lq-btn-ghost adm-btn adm-pri" onClick={runOne} disabled={!!busy || batch?.running || (persona === 'custom' && custom.trim().length < 5)}>{busy === 'run' ? 'Çalışıyor…' : 'Testi çalıştır'}</button></div>
        </div> : <div className="vo-stack">
          {!cur ? <div className="adm-actions"><button type="button" className="lq-btn-ghost adm-btn adm-pri" onClick={() => step([])} disabled={!!busy}>{busy ? 'Bağlanıyor…' : 'Aramayı başlat (asistan açılış cümlesini söyler)'}</button></div> : <form className="vo-addrow" onSubmit={(e) => { e.preventDefault(); if (line.trim()) step(cur.turns, line.trim()); }}>
            <input className="adm-input" aria-label="Arayan olarak yazın" placeholder="Arayan olarak bir cümle yazın…" maxLength={400} value={line} onChange={(e) => setLine(e.target.value)} disabled={!!busy} />
            <button type="submit" className="lq-btn-ghost adm-btn sm adm-pri" disabled={!!busy || !line.trim()}>{busy ? '…' : 'Gönder'}</button>
            <button type="button" className="lq-btn-ghost adm-btn sm" onClick={saveManual} disabled={!!busy || cur.turns.length < 2}>Kaydet</button>
            <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setCur(null)} disabled={!!busy}>Yeni görüşme</button></form>}
        </div>}
        {busy === 'run' && !cur && <div className="adm-skel" style={{ height: 120, marginTop: 12 }} />}
        {cur && <div className="vo-result">
          <section className="vo-sec"><h3>Transkript{cur.label ? ` · ${cur.label}` : ''}</h3><Transcript turns={cur.turns} /></section>
          {cur.rules.length > 0 && <section className="vo-sec"><h3>Otomatik kural denetimi</h3><Rubric rules={cur.rules} pass={cur.pass} /></section>}
        </div>}
      </div>

      <div className="lq-card adm-card">
        <div className="adm-head"><h2>Kırmızı takım testi</h2>
          {batch?.running ? <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => { stop.current = true; }}>Durdur</button> : <button type="button" className="lq-btn-ghost adm-btn sm adm-pri" onClick={redTeam} disabled={!!busy}>Kırmızı takım testi çalıştır</button>}</div>
        <p className="adm-sub">10 arayan tipinin hepsi seçili dilde ({LANGS.find(([k]) => k === lang)?.[1]}) sırayla çalışır. Sağlayıcının dakika başına belirteç sınırı nedeniyle ücretsiz katmanda uzun sürebilir (dakikalar); istediğiniz an durdurabilirsiniz.</p>
        {batch && <>
          <div className="adm-bar" role="progressbar" aria-valuenow={batch.done.length} aria-valuemax={batch.total}><i style={{ width: `${(batch.done.length / batch.total) * 100}%` }} /></div>
          <p className="adm-meta">{batch.done.length} / {batch.total} tamamlandı{batch.running ? ' · çalışıyor…' : ''}{batch.err ? ` · ${batch.err}` : ''}</p>
          {batch.done.length > 0 && <div className="adm-table-wrap"><table className="adm-table vo-matrix"><thead><tr><th>Arayan tipi</th>{ruleIds.map((id) => <th key={id}>{RULE_SHORT[id]}</th>)}<th /></tr></thead>
            <tbody>{batch.done.map((r) => <tr key={r.id}><td>{r.label}</td>{ruleIds.map((id) => { const x = r.rules.find((q) => q.id === id); return <td key={id}><span className="vo-mark" data-s={x?.status ?? 'na'} title={x?.detail}>{x?.status === 'pass' ? '✓' : x?.status === 'fail' ? '✗' : '–'}</span></td>; })}<td><button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => setCur({ turns: r.turns, rules: r.rules, pass: r.pass, label: r.label })}>Aç</button></td></tr>)}</tbody>
            <tfoot><tr><td>Kalan sayısı</td>{failTotals.map((n, i) => <td key={ruleIds[i]}><span className="vo-mark" data-s={n ? 'fail' : 'pass'}>{n}</span></td>)}<td /></tr></tfoot></table></div>}
          {!batch.running && batch.done.length === batch.total && <p><span className="adm-chip" data-state={failTotals.every((n) => n === 0) ? 'paid' : 'bad'}>{failTotals.every((n) => n === 0) ? 'Tüm tipler tüm kuralları geçti' : `${batch.done.filter((r) => !r.pass).length} tipte en az bir kural kaldı`}</span></p>}
        </>}
      </div>

      <div className="lq-card adm-card">
        <div className="adm-head"><h2>Kayıtlı testler</h2><span className="adm-meta">{runs.length} kayıt (son 60 saklanır)</span></div>
        {!runs.length ? <div className="adm-empty">Henüz kayıtlı test yok</div> : <ul className="vo-runs">{runs.slice(0, 30).map((r) => (
          <li key={r.id}><button type="button" className="vo-run" onClick={() => setCur({ turns: r.turns, rules: r.rules, pass: r.pass, label: r.label })}>
            <span className="adm-chip" data-state={r.pass ? 'paid' : 'bad'}>{r.pass ? 'Geçti' : 'Kaldı'}</span><b>{r.label}</b><span className="adm-meta">{r.lang.toUpperCase()} · {fmtDate(r.at)}{r.rules.some((x) => x.status === 'fail') ? ` · ${r.rules.filter((x) => x.status === 'fail').map((x) => RULE_SHORT[x.id]).join(', ')}` : ''}</span></button>
            <button type="button" className="lq-btn-ghost adm-btn sm" onClick={() => del(r.id)} aria-label="Testi sil">Sil</button></li>))}</ul>}
      </div>
    </div>
  );
}
