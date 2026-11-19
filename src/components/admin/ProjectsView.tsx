import { useCallback, useEffect, useRef, useState } from 'react';
import { api, fmtDate } from './api';

// Admin side of the live project page: stages, test-site link, screenshots/files, messages and change requests.
type StageKey = 'planning' | 'design' | 'build' | 'test' | 'launch';
interface Item { id: string; text: string; done: boolean }
interface Stage { key: StageKey; status: 'todo' | 'doing' | 'done'; note: string; at: string | null; items?: Item[] }
interface PFile { id: string; name: string; size: number; type: string; from: 'client' | 'owner'; at: string; preview: boolean }
interface Msg { id: string; from: 'client' | 'owner'; text: string; at: string; fileId?: string; textTr?: string }
interface Req { id: string; text: string; at: string; done: boolean; textTr?: string }
interface Brief { id: string; company: string; contact: string; title: string; createdAt: string; unreadOwner: number; stage: StageKey; openRequests: number; path: string }
interface Full { id: string; company: string; contact: string; title: string; stages: Stage[]; previewUrl: string; messages: Msg[]; files: PFile[]; requests: Req[]; path: string; viewName?: string; viewBy?: 'auto' | 'client' | null }

const STAGE: Record<StageKey, string> = { planning: 'Planlama', design: 'Tasarım', build: 'Geliştirme', test: 'Test', launch: 'Yayın' };
const STATUS = { todo: 'Sırada', doing: 'Devam ediyor', done: 'Tamamlandı' } as const;
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** One step in the admin: note + list of decisions / to-dos (shown to the client in a window next to the step). */
function StageEditor({ projectId, stage, busy, onSave }: { projectId: string; stage: Stage; busy: boolean; onSave: (body: { note?: string; items?: Item[] }, ok: string) => void }) {
  const [note, setNote] = useState(stage.note);
  const [items, setItems] = useState<Item[]>(stage.items ?? []);
  const [text, setText] = useState('');
  const [tr, setTr] = useState(false);
  const newId = () => Math.random().toString(36).slice(2, 10);
  const save = (next: Item[], ok: string) => { setItems(next); onSave({ items: next }, ok); };
  const add = () => { const lines = text.split('\n').map((x) => x.trim()).filter(Boolean); if (!lines.length) return; save([...items, ...lines.map((l) => ({ id: newId(), text: l, done: false }))], `${lines.length} madde eklendi`); setText(''); };
  const translate = async () => {
    setTr(true);
    try {
      const r = await api<{ texts: string[] }>(`/api/admin/projects/${projectId}/translate`, 'POST', { texts: [note, ...items.map((i) => i.text)] });
      const [n, ...rest] = r.texts; const next = items.map((it, i) => ({ ...it, text: rest[i] || it.text }));
      setNote(n ?? note); setItems(next); onSave({ note: n ?? note, items: next }, 'Müşterinin diline çevrildi ve kaydedildi');
    } catch { /* message shown by parent on save errors */ } finally { setTr(false); }
  };
  return (
    <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
      <textarea className="adm-input" style={{ minHeight: 40 }} value={note} placeholder="Kısa not (isteğe bağlı)" onChange={(e) => setNote(e.target.value)}
        onBlur={() => { if (note !== stage.note) onSave({ note }, 'Not kaydedildi'); }} />
      {items.length > 0 && <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 }}>
        {items.map((it) => (
          <li key={it.id} className="adm-actions" style={{ flexWrap: 'nowrap', gap: 8 }}>
            <input type="checkbox" checked={it.done} aria-label="Yapıldı" onChange={() => save(items.map((x) => x.id === it.id ? { ...x, done: !x.done } : x), it.done ? 'Açık olarak işaretlendi' : 'Yapıldı olarak işaretlendi')} />
            <span style={{ flex: 1, fontSize: 14, textDecoration: it.done ? 'line-through' : 'none', opacity: it.done ? 0.7 : 1 }}>{it.text}</span>
            <button className="adm-chip" aria-label="Sil" onClick={() => save(items.filter((x) => x.id !== it.id), 'Madde silindi')}>✕</button>
          </li>))}
      </ul>}
      <div className="adm-actions" style={{ flexWrap: 'nowrap' }}>
        <textarea className="adm-input" style={{ minHeight: 40 }} value={text} placeholder="Madde ekle (ör. Kararlaştırılan sayfalar: Ana sayfa, Hizmetler, İletişim). Birden çok satır = birden çok madde"
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add(); }} />
        <button className="lq-btn-ghost adm-btn sm" disabled={busy || !text.trim()} onClick={add}>Ekle</button>
      </div>
      {(note || items.length > 0) && <button className="lq-btn-ghost adm-btn sm" style={{ justifySelf: 'start' }} disabled={busy || tr} onClick={translate}>{tr ? 'Çevriliyor…' : 'Bu adımı müşterinin diline çevir'}</button>}
    </div>
  );
}

export default function ProjectsView({ onUnread }: { onUnread?: (n: number) => void }) {
  const [list, setList] = useState<Brief[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [p, setP] = useState<Full | null>(null);
  const [reply, setReply] = useState(''); const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState<string | null>(null); const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null); const asShot = useRef(false);
  const [sec, setSec] = useState<'steps' | 'messages' | 'files' | 'requests'>('steps');
  const [trBusy, setTrBusy] = useState(false);
  const translateReply = async () => {
    if (!p || !reply.trim()) return; setTrBusy(true);
    try { const r = await api<{ texts: string[] }>(`/api/admin/projects/${p.id}/translate`, 'POST', { texts: [reply] }); if (r.texts[0]) setReply(r.texts[0]); }
    catch { setMsg({ ok: false, text: 'Çeviri yapılamadı.' }); } finally { setTrBusy(false); }
  };

  const loadList = useCallback(() => {
    api<{ projects: Brief[] }>('/api/admin/projects').then((r) => { setList(r.projects); onUnread?.(r.projects.reduce((s, x) => s + x.unreadOwner, 0)); }).catch(() => setList([]));
  }, [onUnread]);
  const loadOne = useCallback((id: string) => {
    api<{ project: Full }>(`/api/admin/projects/${id}`).then((r) => { setP(r.project); setPreview(r.project.previewUrl); loadList(); }).catch(() => setP(null));
  }, [loadList]);
  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { if (openId) loadOne(openId); else setP(null); }, [openId, loadOne]);

  const del = async (kind: 'messages' | 'files' | 'requests', id: string, what: string) => {
    if (!p || !window.confirm(`${what} kalıcı olarak silinsin mi? Müşteri de artık göremez.`)) return;
    try { await api(`/api/admin/projects/${p.id}/${kind}/${id}`, 'DELETE'); setMsg({ ok: true, text: `${what} silindi` }); loadOne(p.id); }
    catch { setMsg({ ok: false, text: 'Silinemedi.' }); }
  };
  const patch = async (body: object, ok: string) => {
    if (!p) return; setBusy('patch'); setMsg(null);
    try { await api(`/api/admin/projects/${p.id}`, 'PATCH', body); setMsg({ ok: true, text: ok }); loadOne(p.id); }
    catch { setMsg({ ok: false, text: 'Kaydedilemedi, tekrar dene.' }); } finally { setBusy(null); }
  };
  const send = async () => {
    if (!p || !reply.trim()) return; setBusy('reply');
    try { await api(`/api/admin/projects/${p.id}/messages`, 'POST', { text: reply.trim() }); setReply(''); loadOne(p.id); }
    catch { setMsg({ ok: false, text: 'Mesaj gönderilemedi.' }); } finally { setBusy(null); }
  };
  const upload = async (f: File) => {
    if (!p) return;
    if (f.size > 25 * 1024 * 1024) { setMsg({ ok: false, text: 'Dosya 25 MB\'tan büyük.' }); return; }
    setBusy('file');
    try {
      const r = await fetch(`/api/admin/projects/${p.id}/files?name=${encodeURIComponent(f.name)}${asShot.current ? '&preview=1' : ''}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/octet-stream' }, body: f });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) setMsg({ ok: false, text: j.error === 'type_not_allowed' ? 'Yalnızca görsel, PDF ve ZIP yüklenebilir.' : 'Dosya yüklenemedi.' });
      else { setMsg({ ok: true, text: asShot.current ? 'Ekran görüntüsü eklendi; müşteri "sitenizin şu anki hali" bölümünde görüyor.' : 'Dosya eklendi.' }); loadOne(p.id); }
    } finally { setBusy(null); asShot.current = false; if (fileRef.current) fileRef.current.value = ''; }
  };
  const fileUrl = (id: string) => p ? `/api/admin/projects/${p.id}/files/${id}` : '#';

  return (
    <div>
      <h1 className="adm-h1">Projeler</h1>
      <p className="adm-sub">Bir teklifin ilk ödemesi gelince proje sayfası otomatik açılır. Müşteri ilerlemeyi, mesajları, dosyaları ve test sitesini buradan güncellediğin şekilde görür.</p>
      {list === null ? <div className="adm-list"><div className="adm-skel" /></div>
        : list.length === 0 ? <div className="adm-empty">Henüz proje yok. Bir teklifte ödeme alındığında burada görünür.</div>
        : <div className="adm-split" data-open={p ? 'true' : 'false'}>
          <div className="adm-list">{list.map((x) => (
            <div key={x.id} className="adm-row" data-state={x.stage === 'launch' ? 'paid' : 'signed'} aria-current={x.id === openId}>
              <button className="adm-rowmain" onClick={() => setOpenId(x.id)}>
                <span className={`adm-dot${x.unreadOwner ? '' : ' off'}`} aria-label={x.unreadOwner ? 'Yeni mesaj, dosya veya istek' : 'Okundu'} />
                <span style={{ minWidth: 0, flex: '1 1 200px' }}>
                  <span className="adm-name" style={{ fontWeight: x.unreadOwner ? 700 : 500 }}>{x.company || x.contact || 'İsimsiz'}</span><br />
                  <span className="adm-meta">Başladı {fmtDate(x.createdAt)}{x.title ? ` · ${x.title}` : ''}</span>
                </span>
                <span className="adm-chip tag">{STAGE[x.stage]}</span>
                {x.openRequests > 0 && <span className="adm-chip" data-state="bad">{x.openRequests} açık istek</span>}
                {x.unreadOwner > 0 && <span className="adm-badge">{x.unreadOwner}</span>}
              </button>
            </div>))}
          </div>
          {p && (
            <div className="adm-detail">
              <div className="adm-actions" style={{ justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 18, color: 'var(--c-quartz)' }}>{p.company || p.contact}</strong>
                <span className="adm-actions">
                  <a className="lq-btn-ghost adm-btn sm" href={p.path} target="_blank" rel="noreferrer">Müşterinin gördüğü sayfa ↗</a>
                  {p.viewName && <span className="adm-meta">🌐 Müşteri sayfayı <b>{p.viewName}</b> okuyor ({p.viewBy === 'client' ? 'kendisi seçti' : p.viewBy === 'auto' ? 'ülkesine/tarayıcısına göre otomatik' : 'henüz açmadı'}). Sen Türkçe yaz, otomatik çevrilir.</span>}
                  <button className="lq-btn-ghost adm-btn sm" onClick={() => setOpenId(null)}>Kapat</button>
                </span>
              </div>
              {msg && <p className="adm-meta" role="status" style={{ color: msg.ok ? 'var(--adm-ok)' : 'var(--adm-bad)' }}>{msg.text}</p>}
              <div className="adm-chips" role="tablist" style={{ marginTop: 12 }}>
                {([['steps', 'Adımlar ve planlama'], ['messages', `Mesajlar${p.messages.length ? ` (${p.messages.length})` : ''}`], ['files', `Dosyalar ve test sitesi${p.files.length ? ` (${p.files.length})` : ''}`], ['requests', `Değişiklik istekleri${p.requests.filter((r) => !r.done).length ? ` (${p.requests.filter((r) => !r.done).length} açık)` : ''}`]] as const).map(([k, l]) => (
                  <button key={k} role="tab" className="adm-chip" aria-pressed={sec === k} onClick={() => setSec(k)}>{l}</button>))}
              </div>

              {sec === 'steps' && <>
              <p className="adm-meta" style={{ margin: '4px 0 8px' }}>Buraya yazdığın not ve maddeler, müşterinin proje sayfasında <b>her adımın yanındaki pencerede</b> görünür (mesaj olarak gitmez). Türkçe yazabilirsin: müşteri kendi seçtiği dilde otomatik çevrilmiş halini görür.</p>
              {p.stages.map((s) => (
                <div key={s.key} className="adm-field" style={{ borderLeft: `3px solid ${s.status === 'done' ? 'var(--adm-ok)' : s.status === 'doing' ? 'var(--adm-src-form)' : 'var(--c-hairline)'}`, paddingLeft: 10 }}>
                  <div className="adm-actions">
                    <strong style={{ minWidth: 100 }}>{STAGE[s.key]}</strong>
                    {(['todo', 'doing', 'done'] as const).map((st) => (
                      <button key={st} className="adm-chip" aria-pressed={s.status === st} disabled={!!busy} onClick={() => patch({ stage: { key: s.key, status: st } }, `${STAGE[s.key]}: ${STATUS[st]}`)}>{STATUS[st]}</button>))}
                  </div>
                  <StageEditor key={`${p.id}-${s.key}-${(s.items ?? []).length}-${s.note.length}`} projectId={p.id} stage={s} busy={!!busy} onSave={(body, ok) => patch({ stage: { key: s.key, ...body } }, ok)} />
                </div>))}
              </>}

              {sec === 'files' && <>
              <p className="adm-meta" style={{ margin: '4px 0 8px' }}>Test sitesi linki ve "Görünüme ekle" dediğin ekran görüntüleri müşterinin sayfasında <b>"Sitenizin şu anki hali"</b> bölümünde görünür.</p>
              <div className="adm-actions" style={{ flexWrap: 'nowrap' }}>
                <input className="adm-input" value={preview} onChange={(e) => setPreview(e.target.value)} placeholder="https://… (ör. Vercel test adresi)" />
                <button className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => patch({ previewUrl: preview.trim() }, 'Test sitesi linki kaydedildi')}>Kaydet</button>
              </div>
              <div className="adm-actions" style={{ marginTop: 8 }}>
                <button className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => { asShot.current = true; fileRef.current?.click(); }}>Ekran görüntüsü ekle</button>
                <button className="lq-btn-ghost adm-btn sm" disabled={!!busy} onClick={() => { asShot.current = false; fileRef.current?.click(); }}>📎 Dosya ekle</button>
                <input ref={fileRef} type="file" hidden accept="image/*,.heic,.pdf,.zip" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
                <span className="adm-meta">{busy === 'file' ? 'Yükleniyor…' : 'En fazla 25 MB · görsel, PDF, ZIP'}</span>
              </div>
              {p.files.length > 0 && <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gap: 6 }}>
                {[...p.files].reverse().map((f) => (
                  <li key={f.id} className="adm-actions" style={{ fontSize: 13 }}>
                    <a href={fileUrl(f.id)} target="_blank" rel="noreferrer" style={{ color: 'var(--c-lilac)' }}>{f.name}</a>
                    <span className="adm-meta">{kb(f.size)} · {f.from === 'client' ? 'müşteri' : 'sen'} · {fmtDate(f.at)}</span>
                    {f.type.startsWith('image/') && <button className="adm-chip" aria-pressed={f.preview} onClick={() => patch({ preview: { id: f.id, on: !f.preview } }, f.preview ? 'Görünümden kaldırıldı' : 'Müşterinin "şu anki hali" bölümüne eklendi')}>{f.preview ? '✓ Görünümde' : 'Görünüme ekle'}</button>}
                    <button className="adm-chip" data-state="bad" aria-label={`${f.name} sil`} onClick={() => del('files', f.id, 'Dosya')}>🗑 Sil</button>
                  </li>))}
              </ul>}
              </>}

              {sec === 'requests' && <>
              <p className="adm-meta" style={{ margin: '4px 0 8px' }}>Müşterinin istediği değişiklikler. "Yapıldı" işaretlediğinde müşteri de görür.</p>
              {p.requests.length === 0 ? <p className="adm-meta">Henüz istek yok.</p> : p.requests.map((r) => (
                <div key={r.id} className="adm-actions" style={{ padding: '6px 0' }}>
                  <button className="adm-chip" data-state={r.done ? 'paid' : 'bad'} onClick={() => patch({ requestDone: { id: r.id, done: !r.done } }, r.done ? 'Tekrar açıldı' : 'Yapıldı olarak işaretlendi')}>{r.done ? '✓ Yapıldı' : 'Açık'}</button>
                  <span style={{ fontSize: 14, textDecoration: r.done ? 'line-through' : 'none' }}>{r.text}{r.textTr && r.textTr !== r.text && <span className="adm-meta" style={{ display: 'block' }}>Türkçesi: {r.textTr}</span>}</span>
                  <span className="adm-meta">{fmtDate(r.at)}</span>
                  <button className="adm-chip" data-state="bad" aria-label="İsteği sil" onClick={() => del('requests', r.id, 'İstek')}>🗑</button>
                </div>))}
              </>}

              {sec === 'messages' && <>
              <p className="adm-meta" style={{ margin: '4px 0 8px' }}>Müşteriyle yazışma. Buraya yazdığın her şey <b>mesaj olarak</b> gider. Türkçe yazabilirsin; müşteri kendi dilinde görür, müşterinin yazdıklarının Türkçesi de altında çıkar. Planlama için "Adımlar ve planlama" sekmesini kullan.</p>
              <div style={{ display: 'grid', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
                {p.messages.length === 0 && <p className="adm-meta">Henüz mesaj yok.</p>}
                {p.messages.map((m) => {
                  const f = m.fileId ? p.files.find((x) => x.id === m.fileId) : null;
                  return (
                    <div key={m.id} data-src={m.from === 'owner' ? 'form' : 'voice'} style={{ justifySelf: m.from === 'owner' ? 'end' : 'start', maxWidth: '85%', padding: '8px 12px', borderRadius: 12, background: 'color-mix(in srgb, var(--c) 14%, var(--c-deep-sea))', border: '1px solid color-mix(in srgb, var(--c) 55%, transparent)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'color-mix(in srgb, var(--c) 85%, white)', marginBottom: 2 }}>{m.from === 'owner' ? 'Sen (Chioutworks)' : `Müşteri: ${p.contact || p.company || 'İsimsiz'}`} <span className="adm-meta" style={{ fontWeight: 400 }}>· {fmtDate(m.at)}</span></div>
                      {m.text && <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{m.text}</div>}
                      {m.textTr && m.textTr !== m.text && <div className="adm-meta" style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>Türkçesi: {m.textTr}</div>}
                      {f && <a href={fileUrl(f.id)} target="_blank" rel="noreferrer" style={{ color: 'var(--c-lilac)', fontSize: 13 }}>📎 {f.name}</a>}
                      <button className="adm-chip" data-state="bad" style={{ marginTop: 4 }} aria-label="Mesajı sil" onClick={() => del('messages', m.id, f ? 'Mesaj ve dosyası' : 'Mesaj')}>🗑 Sil</button>
                    </div>);
                })}
              </div>
              <textarea className="adm-input" style={{ minHeight: 70, marginTop: 10 }} placeholder="Mesajını yaz (Türkçe yazabilirsin, müşteri kendi dilinde görür)" value={reply} onChange={(e) => setReply(e.target.value)} />
              <div className="adm-actions" style={{ marginTop: 8 }}>
                <button className="lq-btn-ghost adm-btn sm" disabled={!reply.trim() || trBusy} onClick={translateReply}>{trBusy ? 'Çevriliyor…' : 'Müşterinin diline çevir'}</button>
                <button className="lq-btn-ghost adm-btn" disabled={!reply.trim() || !!busy} onClick={send}>{busy === 'reply' ? 'Gönderiliyor…' : 'Mesaj olarak gönder'}</button>
              </div>
              </>}
            </div>)}
        </div>}
    </div>
  );
}
