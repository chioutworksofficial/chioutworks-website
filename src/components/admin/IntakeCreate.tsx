import { useState } from 'react';
import { api, type IntakeBrief, type Req } from './api';
import { copyText } from '../../lib/uid';

export const SECTORS: [string, string][] = [['cleaning', 'Temizlik'], ['beauty', 'Kuaför / Güzellik'], ['clinic', 'Klinik / Sağlık'], ['realestate', 'Emlak'], ['cafe', 'Kafe / Restoran'], ['office', 'Ofis / Ajans / Danışmanlık'], ['logistics', 'Lojistik / Taşımacılık'], ['other', 'Diğer']];
export const LANG_NAME: Record<string, string> = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', el: 'Yunanca' };
const MARKETS: [string, string][] = [['DE', 'Almanya (DSGVO)'], ['TR', 'Türkiye (KVKK)'], ['GR', 'Yunanistan (GDPR)'], ['other', 'Diğer (GDPR, İngilizce)']];
const SECTOR_RE: [string, RegExp][] = [
  ['cleaning', /temizlik|reinigung|cleaning|καθαρ/i], ['beauty', /kuaf|friseur|hair|beauty|güzellik|salon|κομμω/i], ['clinic', /klinik|praxis|arzt|clinic|doctor|diş|zahn|ιατρ|sağlık|gesundheit/i],
  ['realestate', /emlak|immobil|real estate|ακιν/i], ['cafe', /kafe|cafe|café|restor|εστιατ|lokanta/i], ['office', /ofis|büro|agentur|agency|danış|beratung|consult|muhasebe|steuer/i],
  ['logistics', /lojistik|nakliy|logistik|transport|umzug|μεταφορ/i],
];

const guessSector = (r: Req) => { const t = [r.business, r.message, r.roiCalc?.sectorLabel].join(' '); return SECTOR_RE.find(([, re]) => re.test(t))?.[0] ?? 'other'; };
const guessMarket = (r: Req) => /deutschland|germany|almanya|kelsterbach|\b\d{5}\b/i.test(r.address ?? '') ? 'DE' : ({ de: 'DE', tr: 'TR', el: 'GR' } as Record<string, string>)[r.lang ?? ''] ?? 'other';

export const fullUrl = (b: IntakeBrief) => `${location.origin}${b.path}`;
/** True while the admin runs on this computer / home network: such links cannot be opened by anyone outside (site not live yet). */
export const isLocalOrigin = () => /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(location.hostname);
export const LOCAL_LINK_NOTE = 'Dikkat: Bu link şu an bu bilgisayarın/ev ağının adresiyle oluşuyor; müşterinin cihazında AÇILMAZ. Site yayına girince link otomatik olarak gerçek alan adıyla oluşur. Şimdilik yalnızca kendin test edebilirsin.';

/** Copy link + send by e-mail (Resend). Never throws: shows the manual-send hint when sending isn't possible. */
export function IntakeLink({ b, defaultEmail }: { b: IntakeBrief; defaultEmail?: string }) {
  const [copied, setCopied] = useState(false);
  const [to, setTo] = useState(defaultEmail ?? '');
  const [mail, setMail] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const copy = () => { void copyText(fullUrl(b)).then((ok) => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } }); };
  const send = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ ok: boolean }>(`/api/admin/intakes/${b.id}/email`, 'POST', { to, origin: location.origin });
      setMsg(r.ok ? { ok: true, text: 'E-posta gönderildi.' } : { ok: false, text: 'Alan adı doğrulanana kadar linki kopyalayıp kendiniz gönderin.' });
    } catch { setMsg({ ok: false, text: 'Alan adı doğrulanana kadar linki kopyalayıp kendiniz gönderin.' }); }
    setBusy(false);
  };
  return (
    <div className="adm-stack" style={{ gap: 10 }}>
      <input className="adm-input" readOnly value={fullUrl(b)} aria-label="Özel bağlantı" onFocus={(e) => e.currentTarget.select()} />
      {isLocalOrigin() && <span className="adm-meta" style={{ color: 'var(--c-lilac)' }}>⚠ {LOCAL_LINK_NOTE}</span>}
      <div className="adm-actions">
        <button className="lq-btn-ghost adm-btn sm" onClick={copy}>{copied ? 'Kopyalandı' : 'Kopyala'}</button>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => setMail(!mail)}>E-posta ile gönder</button>
        <a className="lq-btn-ghost adm-btn sm" href={b.path} target="_blank" rel="noreferrer">Önizle</a>
      </div>
      {mail && <div className="adm-actions">
        <input className="adm-input" style={{ flex: 1, minWidth: 180 }} type="email" placeholder="alici@ornek.com" aria-label="Alıcı e-posta" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="lq-btn-ghost adm-btn sm" onClick={send} disabled={busy || !to}>{busy ? 'Gönderiliyor…' : 'Gönder'}</button>
      </div>}
      {msg && <div className="adm-banner" role="alert" style={{ margin: 0 }}>{msg.text}</div>}
    </div>
  );
}

/** "Analiz formu oluştur" inside the request drawer. */
export default function IntakeCreate({ req, onOpenList }: { req: Req; onOpenList: () => void }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(req.lang && LANG_NAME[req.lang] ? req.lang : 'tr');
  const [market, setMarket] = useState(guessMarket(req));
  const [second, setSecond] = useState('');
  const [sector, setSector] = useState(guessSector(req));
  const [made, setMade] = useState<IntakeBrief | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const create = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await api<{ intake: IntakeBrief }>('/api/admin/intakes', 'POST', {
        requestId: req.id, lang, market, secondLang: second || null, sector,
        prefill: { company: req.business, contact: req.name, email: req.email, phone: req.phone },
      });
      setMade(r.intake);
    } catch { setErr('Form oluşturulamadı, tekrar deneyin.'); }
    setBusy(false);
  };
  if (!open) return <button className="lq-btn-ghost adm-btn" onClick={() => setOpen(true)}>Analiz formu oluştur</button>;
  const sel = (label: string, v: string, set: (x: string) => void, opts: [string, string][]) => (
    <label className="adm-stack" style={{ gap: 4 }}><span className="adm-label">{label}</span>
      <select className="adm-input" value={v} onChange={(e) => set(e.target.value)}>{opts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
  );
  return (
    <div className="lq-card adm-card adm-stack" style={{ gap: 12 }}>
      <div className="adm-head" style={{ margin: 0 }}><h2>Analiz formu</h2><button className="lq-btn-ghost adm-btn sm" onClick={() => setOpen(false)}>Kapat</button></div>
      {!made ? <>
        {sel('Form dili', lang, setLang, Object.entries(LANG_NAME))}
        {sel('Pazar (yasal metin)', market, setMarket, MARKETS)}
        {sel('İkinci dil (isteğe bağlı gösterim)', second, setSecond, [['', 'Yok'], ...Object.entries(LANG_NAME).filter(([k]) => k !== lang)])}
        {sel('Sektör tahmini (değiştirilebilir)', sector, setSector, SECTORS)}
        {err && <div className="adm-banner" role="alert" style={{ margin: 0 }}>{err}</div>}
        <button className="lq-btn-ghost adm-btn" onClick={create} disabled={busy}>{busy ? 'Oluşturuluyor…' : 'Özel bağlantı oluştur'}</button>
      </> : <>
        <p className="adm-note" style={{ margin: 0 }}>Bağlantı oluşturuldu (30 gün geçerli). Müşteriye iletin:</p>
        <IntakeLink b={made} defaultEmail={req.email} />
        <button className="lq-btn-ghost adm-btn sm" onClick={onOpenList}>Analiz formlarına git</button>
      </>}
    </div>
  );
}
