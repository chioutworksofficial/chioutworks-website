import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Lang } from '../../translations';
import Logo from '../Logo';

// Client's live project page (opens after the first payment): progress step by step, current state of the website,
// messages, files/images both ways (max 25 MB: images, PDF, ZIP) and change requests. One language per page.
type StageKey = 'planning' | 'design' | 'build' | 'test' | 'launch';
interface Stage { key: StageKey; status: 'todo' | 'doing' | 'done'; note: string; at: string | null; items?: { id: string; text: string; done: boolean }[] }
interface PFile { id: string; name: string; size: number; type: string; from: 'client' | 'owner'; at: string; preview: boolean }
interface Msg { id: string; from: 'client' | 'owner'; text: string; at: string; fileId?: string }
interface Req { id: string; text: string; at: string; done: boolean }
interface Data { view: string; langs: { code: string; name: string; rtl: boolean }[]; lang: Lang; company: string; contact: string; title: string; createdAt: string; stages: Stage[]; previewUrl: string; messages: Msg[]; files: PFile[]; requests: Req[] }

const TX: Record<Lang, {
  kicker: string; hello: (n: string) => string; intro: string; stages: Record<StageKey, string>; status: { todo: string; doing: string; done: string };
  now: string; preview: string; open: string; shots: string; noPreview: string; messages: string; you: string; me: string; ph: string; send: string;
  attach: string; uploading: string; tooLarge: string; badType: string; uploadErr: string; files: string; noFiles: string;
  reqTitle: string; reqIntro: string; reqPh: string; reqSend: string; reqOpen: string; reqDone: string; notFound: string; loading: string; fileHint: string; panelEmpty: string; tooSoon: string; limit: string; langLabel: string;
}> = {
  tr: {
    kicker: 'Proje sayfanız', hello: (n) => `Merhaba ${n}`, intro: 'Projenizin her adımını burada görebilir, mesaj yazabilir, dosya ve görsel ekleyebilir, değişiklik isteyebilirsiniz.',
    stages: { planning: 'Planlama', design: 'Tasarım', build: 'Geliştirme', test: 'Test', launch: 'Yayın' }, status: { todo: 'Sırada', doing: 'Devam ediyor', done: 'Tamamlandı' },
    now: 'Şu an', preview: 'Sitenizin şu anki hali', open: 'Test sitesini aç', shots: 'Son ekran görüntüleri', noPreview: 'Test sitesi hazır olduğunda burada görünecek.',
    messages: 'Mesajlar', you: 'Siz', me: 'Chioutworks', ph: 'Mesajınızı yazın…', send: 'Gönder', attach: 'Logo / fotoğraf ekle', uploading: 'Yükleniyor…',
    tooLarge: 'Görsel 5 MB\'tan büyük. Daha küçük bir görsel seçin.', badType: 'Buraya yalnızca logo veya fotoğraf (JPG, PNG, WEBP, GIF, HEIC) eklenebilir. Büyük dosyalar için bir link yazabilirsiniz.', uploadErr: 'Dosya yüklenemedi. Lütfen tekrar deneyin.',
    files: 'Dosyalar', noFiles: 'Henüz dosya yok.', reqTitle: 'Değişiklik isteği', reqIntro: 'Bir şeyin farklı olmasını isterseniz kısaca yazın; listeye eklenir ve tamamlandığında işaretlenir.',
    reqPh: 'Örn. Ana sayfadaki başlık daha kısa olsun', reqSend: 'İsteği gönder', reqOpen: 'Açık', reqDone: 'Yapıldı', notFound: 'Bu proje bağlantısı geçerli değil.', loading: 'Yükleniyor…',
    fileHint: 'Yalnızca logo veya fotoğraf · en fazla 5 MB · tek tek ekleyin. Büyük dosyalar için link paylaşın.', tooSoon: 'Lütfen bir sonraki görseli eklemeden önce bir dakika bekleyin.', limit: 'Görsel sınırına ulaşıldı. Diğerleri için bir link paylaşın.', langLabel: 'Dil', panelEmpty: 'Bu adımın maddeleri burada görünecek.',
  },
  en: {
    kicker: 'Your project page', hello: (n) => `Hello ${n}`, intro: 'Follow every step of your project here, write messages, add files and images and request changes.',
    stages: { planning: 'Planning', design: 'Design', build: 'Development', test: 'Testing', launch: 'Launch' }, status: { todo: 'Up next', doing: 'In progress', done: 'Done' },
    now: 'Now', preview: 'Your website right now', open: 'Open the test site', shots: 'Latest screenshots', noPreview: 'The test site will appear here once it is ready.',
    messages: 'Messages', you: 'You', me: 'Chioutworks', ph: 'Write your message…', send: 'Send', attach: 'Add logo / photo', uploading: 'Uploading…',
    tooLarge: 'The image is larger than 5 MB. Please pick a smaller one.', badType: 'Only a logo or photo (JPG, PNG, WEBP, GIF, HEIC) can be added here. For large files, please share a link.', uploadErr: 'The file could not be uploaded. Please try again.',
    files: 'Files', noFiles: 'No files yet.', reqTitle: 'Change request', reqIntro: 'If you would like something to be different, describe it briefly; it is added to the list and ticked off when done.',
    reqPh: 'e.g. Make the headline on the home page shorter', reqSend: 'Send request', reqOpen: 'Open', reqDone: 'Done', notFound: 'This project link is not valid.', loading: 'Loading…',
    fileHint: 'Logo or photo only · max. 5 MB · one at a time. Share a link for large files.', tooSoon: 'Please wait a minute before adding the next image.', limit: 'Image limit reached. Please share a link for the rest.', langLabel: 'Language', panelEmpty: 'The points of this step will appear here.',
  },
  de: {
    kicker: 'Ihre Projektseite', hello: (n) => `Hallo ${n}`, intro: 'Hier verfolgen Sie jeden Schritt Ihres Projekts, schreiben Nachrichten, fügen Dateien und Bilder hinzu und wünschen Änderungen.',
    stages: { planning: 'Planung', design: 'Design', build: 'Entwicklung', test: 'Test', launch: 'Livegang' }, status: { todo: 'Als Nächstes', doing: 'In Arbeit', done: 'Erledigt' },
    now: 'Aktuell', preview: 'Ihre Website im aktuellen Stand', open: 'Testseite öffnen', shots: 'Aktuelle Screenshots', noPreview: 'Sobald die Testseite bereit ist, erscheint sie hier.',
    messages: 'Nachrichten', you: 'Sie', me: 'Chioutworks', ph: 'Ihre Nachricht…', send: 'Senden', attach: 'Logo / Foto hinzufügen', uploading: 'Wird hochgeladen…',
    tooLarge: 'Das Bild ist größer als 5 MB. Bitte ein kleineres wählen.', badType: 'Hier kann nur ein Logo oder Foto (JPG, PNG, WEBP, GIF, HEIC) hinzugefügt werden. Für große Dateien bitte einen Link teilen.', uploadErr: 'Die Datei konnte nicht hochgeladen werden. Bitte erneut versuchen.',
    files: 'Dateien', noFiles: 'Noch keine Dateien.', reqTitle: 'Änderungswunsch', reqIntro: 'Wenn etwas anders sein soll, beschreiben Sie es kurz; es kommt auf die Liste und wird abgehakt, sobald es erledigt ist.',
    reqPh: 'z. B. Die Überschrift auf der Startseite kürzer', reqSend: 'Wunsch senden', reqOpen: 'Offen', reqDone: 'Erledigt', notFound: 'Dieser Projektlink ist nicht gültig.', loading: 'Wird geladen…',
    fileHint: 'Nur Logo oder Foto · max. 5 MB · einzeln hinzufügen. Für große Dateien einen Link teilen.', tooSoon: 'Bitte eine Minute warten, bevor Sie das nächste Bild hinzufügen.', limit: 'Bildlimit erreicht. Für weitere bitte einen Link teilen.', langLabel: 'Sprache', panelEmpty: 'Die Punkte dieses Schritts erscheinen hier.',
  },
  el: {
    kicker: 'Η σελίδα του έργου σας', hello: (n) => `Γεια σας ${n}`, intro: 'Εδώ παρακολουθείτε κάθε βήμα του έργου σας, γράφετε μηνύματα, προσθέτετε αρχεία και εικόνες και ζητάτε αλλαγές.',
    stages: { planning: 'Προγραμματισμός', design: 'Σχεδίαση', build: 'Ανάπτυξη', test: 'Δοκιμή', launch: 'Δημοσίευση' }, status: { todo: 'Ακολουθεί', doing: 'Σε εξέλιξη', done: 'Ολοκληρώθηκε' },
    now: 'Τώρα', preview: 'Η ιστοσελίδα σας αυτή τη στιγμή', open: 'Άνοιγμα δοκιμαστικής σελίδας', shots: 'Πρόσφατα στιγμιότυπα', noPreview: 'Η δοκιμαστική σελίδα θα εμφανιστεί εδώ μόλις είναι έτοιμη.',
    messages: 'Μηνύματα', you: 'Εσείς', me: 'Chioutworks', ph: 'Γράψτε το μήνυμά σας…', send: 'Αποστολή', attach: 'Προσθήκη λογότυπου / φωτογραφίας', uploading: 'Μεταφόρτωση…',
    tooLarge: 'Η εικόνα είναι μεγαλύτερη από 5 MB. Επιλέξτε μικρότερη.', badType: 'Εδώ μπορεί να προστεθεί μόνο λογότυπο ή φωτογραφία (JPG, PNG, WEBP, GIF, HEIC). Για μεγάλα αρχεία, μοιραστείτε έναν σύνδεσμο.', uploadErr: 'Το αρχείο δεν μεταφορτώθηκε. Δοκιμάστε ξανά.',
    files: 'Αρχεία', noFiles: 'Δεν υπάρχουν ακόμη αρχεία.', reqTitle: 'Αίτημα αλλαγής', reqIntro: 'Αν θέλετε κάτι διαφορετικό, γράψτε το σύντομα· μπαίνει στη λίστα και σημειώνεται όταν ολοκληρωθεί.',
    reqPh: 'π.χ. Ο τίτλος στην αρχική σελίδα πιο σύντομος', reqSend: 'Αποστολή αιτήματος', reqOpen: 'Ανοιχτό', reqDone: 'Έγινε', notFound: 'Αυτός ο σύνδεσμος έργου δεν είναι έγκυρος.', loading: 'Φόρτωση…',
    fileHint: 'Μόνο λογότυπο ή φωτογραφία · έως 5 MB · μία κάθε φορά. Για μεγάλα αρχεία, μοιραστείτε σύνδεσμο.', tooSoon: 'Περιμένετε ένα λεπτό πριν προσθέσετε την επόμενη εικόνα.', limit: 'Συμπληρώθηκε το όριο εικόνων. Για τις υπόλοιπες μοιραστείτε σύνδεσμο.', langLabel: 'Γλώσσα', panelEmpty: 'Τα σημεία αυτού του βήματος θα εμφανίζονται εδώ.',
  },
};

const MAX = 5 * 1024 * 1024;   // client: logo / photo only (owner, 2026-11-17)
type TX1 = (typeof TX)['en'];
const SITE_LANGS = ['tr', 'en', 'de', 'el'];
/** Interface texts as a flat list (for languages without hand-written texts: translated once from English on the server). */
const flat = (t: TX1): Record<string, string> => {
  const o: Record<string, string> = {};
  for (const [k, v] of Object.entries(t)) {
    if (typeof v === 'function') o[k] = (v as (n: string) => string)('{name}');
    else if (typeof v === 'object') for (const [k2, v2] of Object.entries(v as Record<string, string>)) o[`${k}.${k2}`] = v2;
    else o[k] = v as string;
  }
  return o;
};
const unflat = (f: Record<string, string>): TX1 => {
  const o: Record<string, unknown> = { stages: {}, status: {} };
  for (const [k, v] of Object.entries(f)) {
    if (k === 'hello') o.hello = (n: string) => v.replace('{name}', n);
    else if (k.includes('.')) { const [a, b] = k.split('.'); (o[a] as Record<string, string>)[b] = v; }
    else o[k] = v;
  }
  return o as TX1;
};

/** Window next to each step: note + decisions / to-dos. New points are added at the bottom and the window scrolls,
 *  always showing the newest (like a chat); on phones the window sits under the step title. */
function StagePanel({ stage, empty }: { stage: Stage; empty: string }) {
  const box = useRef<HTMLDivElement>(null);
  const items = stage.items ?? [];
  useEffect(() => { const el = box.current; if (el) el.scrollTop = el.scrollHeight; }, [items.length]);
  const has = !!stage.note || items.length > 0;
  return (
    <div ref={box} className="pj-panel" data-lenis-prevent tabIndex={has ? 0 : -1}
      style={{ maxHeight: 190, overflowY: 'auto', padding: '10px 12px', borderRadius: 12, background: 'var(--c-deep-sea)', border: `1px solid ${stage.status === 'doing' ? 'color-mix(in srgb, var(--c-signal) 55%, transparent)' : 'var(--c-inkline)'}` }}>
      {!has && <p style={{ margin: 0, fontSize: 13, color: 'var(--c-ash)' }}>{empty}</p>}
      {stage.note && <p style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.55, color: 'var(--c-mist)' }}>{stage.note}</p>}
      {items.length > 0 && <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
        {items.map((it) => (
          <li key={it.id} className="pj-item" style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5 }}>
            <span aria-hidden="true" style={{ color: it.done ? 'var(--c-signal)' : 'var(--c-ash)', flex: 'none' }}>{it.done ? '✓' : '•'}</span>
            <span style={{ color: it.done ? 'var(--c-mist)' : 'var(--c-quartz)' }}>{it.text}</span>
          </li>))}
      </ul>}
    </div>
  );
}
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function ProjectPage() {
  const { lang: urlLang, slug: token = '' } = useParams();
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);
  const [msg, setMsg] = useState(''); const [req, setReq] = useState('');
  const [busy, setBusy] = useState<string | null>(null); const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const view = data?.view ?? (SITE_LANGS.includes(urlLang ?? '') ? urlLang! : 'en');
  const lang = (SITE_LANGS.includes(view) ? view : 'en') as Lang;          // hand-written texts used for this page
  const [extra, setExtra] = useState<{ lang: string; t: TX1 } | null>(null);
  const t = SITE_LANGS.includes(view) ? TX[lang] : extra?.lang === view ? extra.t : TX.en;
  const rtl = !!data?.langs.find((l) => l.code === view)?.rtl;
  const base = `/api/project/${encodeURIComponent(token)}`;

  const load = useCallback(() => {
    const bl = typeof navigator !== 'undefined' ? encodeURIComponent(navigator.language || '') : '';
    fetch(`${base}?bl=${bl}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((j: Data) => { setData(j); setErr(false); }).catch(() => setErr(true));
  }, [base]);
  useEffect(() => {
    load();
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'; document.head.appendChild(m);
    const id = window.setInterval(load, 20000);   // new messages from the owner show up without reloading
    return () => { window.clearInterval(id); m.remove(); };
  }, [load]);
  useEffect(() => { if (data) { document.title = `${t.kicker} · ${data.company || 'Chioutworks'}`; document.documentElement.lang = view; } }, [data, view, t.kicker]);
  // Other languages: buttons and labels are translated once on the server (cached for all projects)
  useEffect(() => {
    if (SITE_LANGS.includes(view) || extra?.lang === view) return;
    let off = false;
    fetch(base + '/ui', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: view, texts: flat(TX.en) }) })
      .then((r) => r.json()).then((j: { texts?: Record<string, string> }) => { if (!off && j.texts) setExtra({ lang: view, t: unflat({ ...flat(TX.en), ...j.texts }) }); }).catch(() => {});
    return () => { off = true; };
  }, [view, base, extra?.lang]);

  const post = async (path: string, body: object, key: string) => {
    setBusy(key); setNote('');
    try { const r = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(); load(); return true; }
    catch { setNote(t.uploadErr); return false; } finally { setBusy(null); }
  };
  const changeLang = async (l: string) => {
    if (l === view) return;
    setBusy('lang');
    try {
      const r = await fetch(base + '/lang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: l }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.path) window.history.replaceState(null, '', j.path);
      load();
    } finally { setBusy(null); }
  };
  const upload = async (f: File) => {
    if (f.size > MAX) { setNote(t.tooLarge); return; }
    if (!f.type.startsWith('image/') && !/\.heic$/i.test(f.name)) { setNote(t.badType); return; }
    setBusy('file'); setNote('');
    try {
      const r = await fetch(`${base}/files?name=${encodeURIComponent(f.name)}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: f });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setNote(j.error === 'images_only' || j.error === 'type_not_allowed' ? t.badType : j.error === 'too_large' ? t.tooLarge : j.error === 'too_soon' ? t.tooSoon : j.error === 'limit' ? t.limit : t.uploadErr); return; }
      load();
    } catch { setNote(t.uploadErr); } finally { setBusy(null); if (fileRef.current) fileRef.current.value = ''; }
  };

  const card: React.CSSProperties = { padding: 'clamp(18px, 4vw, 28px)', marginBottom: 18 };
  const h2: React.CSSProperties = { margin: '0 0 14px', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--c-quartz)' };
  const input: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 'var(--r-input)', border: '1px solid var(--c-hairline)', background: 'var(--c-abyss)', color: 'var(--c-quartz)', fontFamily: 'inherit', fontSize: 16, boxSizing: 'border-box' };

  if (err) return <main data-site-theme="liquid" data-mode-lock="" style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--c-void)', color: 'var(--c-mist)' }}>{TX[lang].notFound}</main>;
  if (!data) return <main data-site-theme="liquid" data-mode-lock="" style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: 'var(--c-void)', color: 'var(--c-ash)' }}>{TX[lang].loading}</main>;

  const fileUrl = (id: string) => `${base}/files/${id}`;
  const shots = data.files.filter((f) => f.preview && f.type.startsWith('image/'));
  const current = data.stages.find((s) => s.status === 'doing');

  return (
    <main data-site-theme="liquid" data-mode-lock="" lang={view} dir={rtl ? 'rtl' : 'ltr'} style={{ minHeight: '100svh', background: 'var(--glow-hero), var(--c-void)', color: 'var(--c-mist)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px clamp(16px, 4vw, 36px)', borderBottom: '1px solid var(--c-inkline)' }}>
        <Logo size={26} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="pj-kicker" style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-ash)' }}>{t.kicker}</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span className="sr-only">{t.langLabel}</span>
            <span aria-hidden="true">🌐</span>
            <select value={view} disabled={busy === 'lang'} onChange={(e) => void changeLang(e.target.value)} aria-label={t.langLabel}
              style={{ padding: '6px 10px', borderRadius: 'var(--r-input)', border: '1px solid var(--c-hairline)', background: 'var(--c-abyss)', color: 'var(--c-quartz)', fontFamily: 'inherit', fontSize: 14 }}>
              {data.langs.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </label>
        </div>
      </header>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(20px, 5vw, 48px) clamp(16px, 4vw, 24px) 80px' }}>
        <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 5vw, 40px)', color: 'var(--c-quartz)', lineHeight: 1.15 }}>{t.hello(data.contact.split(' ')[0] || '')}</h1>
        <p style={{ margin: '0 0 6px', fontSize: 15, color: 'var(--c-quartz)' }}>{data.company}{data.title ? ` · ${data.title}` : ''}</p>
        <p style={{ margin: '0 0 28px', maxWidth: 640, lineHeight: 1.6 }}>{t.intro}</p>

        {/* progress */}
        <section className="lq-card" style={card} aria-label={t.stages.planning}>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 0 }}>
            {data.stages.map((s, i) => (
              <li key={s.key} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 12, paddingBottom: i < data.stages.length - 1 ? 16 : 0, position: 'relative' }}>
                {i < data.stages.length - 1 && <span aria-hidden="true" style={{ position: 'absolute', insetInlineStart: 13, top: 28, bottom: 0, width: 2, background: s.status === 'done' ? 'var(--c-signal)' : 'var(--c-hairline)' }} />}
                <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 9999, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
                  background: s.status === 'done' ? 'var(--c-signal)' : s.status === 'doing' ? 'color-mix(in srgb, var(--c-signal) 20%, transparent)' : 'transparent',
                  border: `2px solid ${s.status === 'todo' ? 'var(--c-hairline)' : 'var(--c-signal)'}`, color: s.status === 'done' ? 'var(--c-on-accent)' : 'var(--c-quartz)' }}>{s.status === 'done' ? '✓' : i + 1}</span>
                <div className="pj-stage">
                  <div>
                    <strong style={{ display: 'block', color: 'var(--c-quartz)', fontSize: 16 }}>{t.stages[s.key]}</strong>
                    <span style={{ fontSize: 12, color: s.status === 'doing' ? 'var(--c-lilac)' : 'var(--c-ash)' }}>{s === current ? `● ${t.now}` : t.status[s.status]}</span>
                  </div>
                  <StagePanel stage={s} empty={t.panelEmpty} />
                </div>
              </li>))}
          </ol>
        </section>

        {/* current state of the website */}
        <section className="lq-card" style={card}>
          <h2 style={h2}>{t.preview}</h2>
          {data.previewUrl ? <a className="lq-btn-ghost" href={data.previewUrl} target="_blank" rel="noopener noreferrer">{t.open} ↗</a> : <p style={{ margin: 0 }}>{t.noPreview}</p>}
          {shots.length > 0 && <>
            <p style={{ margin: '18px 0 10px', fontSize: 13, color: 'var(--c-ash)' }}>{t.shots}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: 12 }}>
              {shots.map((f) => <a key={f.id} href={fileUrl(f.id)} target="_blank" rel="noreferrer"><img src={fileUrl(f.id)} alt={f.name} loading="lazy" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--c-hairline)', display: 'block' }} /></a>)}
            </div></>}
        </section>

        {/* messages */}
        <section className="lq-card" style={card}>
          <h2 style={h2}>{t.messages}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 460, overflowY: 'auto', marginBottom: 14 }} data-lenis-prevent>
            {data.messages.map((m) => {
              const f = m.fileId ? data.files.find((x) => x.id === m.fileId) : null;
              const mine = m.from === 'client';
              return (
                <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '10px 14px', borderRadius: 14, background: mine ? 'color-mix(in srgb, var(--c-signal) 22%, var(--c-abyss))' : 'var(--c-deep-sea)', border: '1px solid var(--c-hairline)' }}>
                  <div style={{ fontSize: 11, color: 'var(--c-ash)', marginBottom: 4 }}>{mine ? t.you : t.me} · {new Date(m.at).toLocaleString(lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  {m.text && <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--c-quartz)', lineHeight: 1.5 }}>{m.text}</div>}
                  {f && (f.type.startsWith('image/')
                    ? <a href={fileUrl(f.id)} target="_blank" rel="noreferrer"><img src={fileUrl(f.id)} alt={f.name} loading="lazy" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, display: 'block' }} /></a>
                    : <a href={fileUrl(f.id)} style={{ color: 'var(--c-lilac)', fontSize: 14 }}>📎 {f.name} ({kb(f.size)})</a>)}
                </div>);
            })}
          </div>
          <form onSubmit={async (e) => { e.preventDefault(); if (msg.trim() && await post('/messages', { text: msg.trim() }, 'msg')) setMsg(''); }} style={{ display: 'grid', gap: 10 }}>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t.ph} rows={3} style={{ ...input, resize: 'vertical' }} aria-label={t.ph} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <button type="submit" className="lq-btn-ghost" disabled={!msg.trim() || !!busy}>{busy === 'msg' ? '…' : t.send}</button>
              <label className="lq-btn-ghost" style={{ cursor: 'pointer' }}>
                {busy === 'file' ? t.uploading : `📎 ${t.attach}`}
                <input ref={fileRef} type="file" accept="image/*,.heic" hidden disabled={!!busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
              </label>
              <span style={{ fontSize: 12, color: 'var(--c-ash)' }}>{t.fileHint}</span>
            </div>
            {note && <p role="alert" style={{ margin: 0, fontSize: 14, color: 'var(--c-lilac)' }}>{note}</p>}
          </form>
        </section>

        {/* change requests */}
        <section className="lq-card" style={card}>
          <h2 style={h2}>{t.reqTitle}</h2>
          <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.6 }}>{t.reqIntro}</p>
          <form onSubmit={async (e) => { e.preventDefault(); if (req.trim() && await post('/requests', { text: req.trim() }, 'req')) setReq(''); }} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <textarea value={req} onChange={(e) => setReq(e.target.value)} placeholder={t.reqPh} rows={2} style={{ ...input, flex: '1 1 260px', resize: 'vertical' }} aria-label={t.reqTitle} />
            <button type="submit" className="lq-btn-ghost" disabled={!req.trim() || !!busy}>{t.reqSend}</button>
          </form>
          {data.requests.length > 0 && <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'grid', gap: 8 }}>
            {[...data.requests].reverse().map((r) => (
              <li key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--c-deep-sea)', border: '1px solid var(--c-inkline)' }}>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 9999, whiteSpace: 'nowrap', background: r.done ? 'color-mix(in srgb, var(--c-signal) 25%, transparent)' : 'transparent', border: '1px solid var(--c-hairline)', color: 'var(--c-quartz)' }}>{r.done ? `✓ ${t.reqDone}` : t.reqOpen}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, textDecoration: r.done ? 'line-through' : 'none', opacity: r.done ? 0.75 : 1 }}>{r.text}</span>
              </li>))}
          </ul>}
        </section>

        {/* files */}
        <section className="lq-card" style={card}>
          <h2 style={h2}>{t.files}</h2>
          {data.files.length === 0 ? <p style={{ margin: 0 }}>{t.noFiles}</p> : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
              {[...data.files].reverse().map((f) => <li key={f.id} style={{ fontSize: 14 }}><a href={fileUrl(f.id)} style={{ color: 'var(--c-lilac)' }} target={f.type.startsWith('image/') ? '_blank' : undefined} rel="noreferrer">{f.name}</a> <span style={{ color: 'var(--c-ash)' }}>· {kb(f.size)} · {f.from === 'client' ? t.you : t.me}</span></li>)}
            </ul>)}
        </section>
      </div>
    </main>
  );
}
