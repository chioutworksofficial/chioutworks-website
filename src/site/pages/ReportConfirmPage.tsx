import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LogoMark } from '../Logo';
import { isLang } from '../../lib/routes';
import { guardFields, prefetchFormToken } from '../../lib/formGuard';
import type { Lang } from '../../translations';

// Public answer page for the report e-mail ("Shall I call you?"). Link: /:lang/rapor/onay?t=<signed one-time token>. Server: server/reportMail.ts.
// A click on the e-mail button only opens this page; the answer is recorded by an explicit button here (mail scanners cannot answer for the person).
const T: Record<Lang, { tab: string; h: string; ask: string; yes: string; no: string; phone: string; when: string; whens: [string, string][]; consent: string; send: string; sendNo: string; thanks: string; thanksSub: string; bad: string; used: string; expired: string; err: string; errPhone: string; errConsent: string; wait: string; back: string }> = {
  tr: { tab: 'Rapor yanıtı', h: 'Sizi arayayım mı?', ask: 'Web sitesi raporu hakkında kısaca telefonda konuşabilirim; yazılı yanıt da yeterliyse onu seçin.', yes: 'Evet, arayın', no: 'Hayır, e-posta yeterli', phone: 'Telefon numarası', when: 'Uygun zaman', whens: [['any', 'Fark etmez'], ['morning', 'Sabah'], ['afternoon', 'Öğleden sonra'], ['evening', 'Akşam']], consent: 'Bu telefon numarasından, web sitesi raporu hakkında aranmayı kabul ediyorum. Onayımı istediğim zaman geri alabilirim.', send: 'Gönder', sendNo: 'Evet, yalnızca e-posta yeterli', thanks: 'Teşekkürler.', thanksSub: 'Teklif bağlantısı size e-postayla gönderilecek.', bad: 'Bu bağlantı geçersiz.', used: 'Bu bağlantı ile zaten yanıt verildi.', expired: 'Bu bağlantının süresi doldu.', err: 'Gönderilemedi, lütfen biraz sonra tekrar deneyin.', errPhone: 'Lütfen geçerli bir telefon numarası yazın.', errConsent: 'Aranmak için onay kutusunu işaretleyin.', wait: 'Gönderiliyor…', back: 'Siteye dön' },
  en: { tab: 'Report reply', h: 'Shall I call you?', ask: 'I can talk through the website report with you briefly by phone; if a written answer is enough, choose that.', yes: 'Yes, please call', no: 'No, e-mail is enough', phone: 'Phone number', when: 'Best time', whens: [['any', 'Any time'], ['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']], consent: 'I agree to be called at this number about the website report. I can withdraw my consent at any time.', send: 'Send', sendNo: 'Yes, e-mail only is fine', thanks: 'Thank you.', thanksSub: 'The link to your offer will be sent to you by e-mail.', bad: 'This link is not valid.', used: 'This link has already been used to reply.', expired: 'This link has expired.', err: 'Could not send, please try again shortly.', errPhone: 'Please enter a valid phone number.', errConsent: 'Please tick the box to be called.', wait: 'Sending…', back: 'Back to the site' },
  de: { tab: 'Antwort zum Bericht', h: 'Soll ich Sie anrufen?', ask: 'Ich kann den Website-Bericht kurz telefonisch mit Ihnen besprechen; genügt Ihnen eine schriftliche Antwort, wählen Sie das.', yes: 'Ja, bitte anrufen', no: 'Nein, E-Mail genügt', phone: 'Telefonnummer', when: 'Bevorzugte Zeit', whens: [['any', 'Egal'], ['morning', 'Vormittags'], ['afternoon', 'Nachmittags'], ['evening', 'Abends']], consent: 'Ich bin einverstanden, unter dieser Nummer zum Website-Bericht angerufen zu werden. Ich kann meine Einwilligung jederzeit widerrufen.', send: 'Senden', sendNo: 'Ja, nur per E-Mail genügt', thanks: 'Vielen Dank.', thanksSub: 'Den Link zu Ihrem Angebot erhalten Sie per E-Mail.', bad: 'Dieser Link ist ungültig.', used: 'Mit diesem Link wurde bereits geantwortet.', expired: 'Dieser Link ist abgelaufen.', err: 'Senden nicht möglich, bitte gleich noch einmal versuchen.', errPhone: 'Bitte geben Sie eine gültige Telefonnummer ein.', errConsent: 'Bitte setzen Sie den Haken, um angerufen zu werden.', wait: 'Wird gesendet…', back: 'Zurück zur Website' },
  el: { tab: 'Απάντηση στην αναφορά', h: 'Να σας καλέσω;', ask: 'Μπορώ να συζητήσω σύντομα την αναφορά τηλεφωνικά· αν σας αρκεί γραπτή απάντηση, επιλέξτε αυτήν.', yes: 'Ναι, καλέστε με', no: 'Όχι, αρκεί το e-mail', phone: 'Αριθμός τηλεφώνου', when: 'Προτιμώμενη ώρα', whens: [['any', 'Οποιαδήποτε'], ['morning', 'Πρωί'], ['afternoon', 'Απόγευμα'], ['evening', 'Βράδυ']], consent: 'Συμφωνώ να με καλέσετε σε αυτόν τον αριθμό για την αναφορά της ιστοσελίδας. Μπορώ να ανακαλέσω τη συγκατάθεσή μου οποτεδήποτε.', send: 'Αποστολή', sendNo: 'Ναι, αρκεί μόνο το e-mail', thanks: 'Ευχαριστώ.', thanksSub: 'Ο σύνδεσμος της προσφοράς θα σας σταλεί με e-mail.', bad: 'Αυτός ο σύνδεσμος δεν είναι έγκυρος.', used: 'Με αυτόν τον σύνδεσμο έχει ήδη δοθεί απάντηση.', expired: 'Αυτός ο σύνδεσμος έχει λήξει.', err: 'Δεν στάλθηκε, δοκιμάστε ξανά σε λίγο.', errPhone: 'Γράψτε έναν έγκυρο αριθμό τηλεφώνου.', errConsent: 'Επιλέξτε το πλαίσιο για να σας καλέσουν.', wait: 'Αποστολή…', back: 'Επιστροφή στον ιστότοπο' },
};
type State = 'loading' | 'open' | 'used' | 'expired' | 'invalid' | 'done';

export default function ReportConfirmPage() {
  const { lang: urlLang } = useParams(); const [q] = useSearchParams();
  const lang: Lang = isLang(urlLang) ? urlLang : 'en'; const u = T[lang];
  const t = q.get('t') ?? ''; const pre = q.get('a') === 'no' ? 'no' : 'yes';
  const [state, setState] = useState<State>('loading'); const [mode, setMode] = useState<'yes' | 'no'>(pre);
  const [phone, setPhone] = useState(''); const [when, setWhen] = useState('any'); const [ok, setOk] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = u.tab; document.documentElement.lang = lang; const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'; document.head.appendChild(m); return () => { m.remove(); }; }, [u.tab, lang]);
  useEffect(() => {
    prefetchFormToken();
    fetch(`/api/report/answer?t=${encodeURIComponent(t)}`, { cache: 'no-store' }).then((r) => r.json()).then((j) => setState((['open', 'used', 'expired'].includes(j.state) ? j.state : 'invalid') as State)).catch(() => setState('invalid'));
  }, [t]);

  const submit = async (answer: 'yes' | 'no') => {
    setErr('');
    if (answer === 'yes') { if (phone.replace(/\D/g, '').length < 7) return setErr(u.errPhone); if (!ok) return setErr(u.errConsent); }
    setBusy(true);
    try {
      const r = await fetch('/api/report/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t, answer, phone: answer === 'yes' ? phone : undefined, when, consent: answer === 'yes' ? ok : undefined, ...(await guardFields()) }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) setState('done'); else if (j.error === 'used') setState('used'); else if (j.error === 'expired') setState('expired'); else if (j.error === 'phone') setErr(u.errPhone); else if (j.error === 'consent') setErr(u.errConsent); else setErr(u.err);
    } catch { setErr(u.err); }
    setBusy(false);
  };

  const card = { border: '1px solid var(--c-hairline)', borderRadius: 'var(--r-card)', background: 'var(--c-abyss)', padding: 24 } as const;
  const input = { width: '100%', padding: '12px 14px', borderRadius: 'var(--r-input)', border: '1px solid var(--c-hairline)', background: 'var(--c-void)', color: 'var(--c-quartz)', font: 'inherit' } as const;
  const msg = state === 'invalid' ? u.bad : state === 'used' ? u.used : state === 'expired' ? u.expired : '';
  return (
    <div data-site-theme="liquid" data-mode-lock="" lang={lang} style={{ minHeight: '100dvh', background: 'var(--c-void)', color: 'var(--c-mist)' }}>
      <header style={{ borderBottom: '1px solid var(--c-edge)', background: 'var(--c-abyss)' }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3"><LogoMark size={26} /><span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.14em', fontSize: 13, color: 'var(--c-quartz)' }}>CHIOUT<span style={{ color: 'var(--c-lilac)' }}>WORKS</span></span></div>
      </header>
      <main className="max-w-xl mx-auto px-5 py-10">
        {state === 'loading' && <div style={{ minHeight: 160 }} aria-busy="true" />}
        {msg && <div style={card} role="status"><p style={{ margin: 0 }}>{msg}</p></div>}
        {state === 'done' && <div style={card} role="status"><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--c-quartz)', margin: '0 0 8px' }}>{u.thanks}</h1><p style={{ margin: 0, lineHeight: 1.6 }}>{u.thanksSub}</p></div>}
        {state === 'open' && <div style={card}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--c-quartz)', margin: '0 0 8px', lineHeight: 1.2 }}>{u.h}</h1>
          <p style={{ margin: '0 0 18px', lineHeight: 1.6 }}>{u.ask}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {(['yes', 'no'] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => { setMode(m); setErr(''); }} className="lq-btn-ghost" style={{ borderColor: mode === m ? 'var(--c-signal)' : undefined, color: mode === m ? 'var(--c-quartz)' : undefined }}>{m === 'yes' ? u.yes : u.no}</button>)}
          </div>
          {mode === 'yes' ? (
            <form onSubmit={(e) => { e.preventDefault(); void submit('yes'); }} style={{ display: 'grid', gap: 12 }} noValidate>
              <input type="text" name="website" data-hp="" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>{u.phone}<input style={input} type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
              <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>{u.when}<select style={input} value={when} onChange={(e) => setWhen(e.target.value)}>{u.whens.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5 }}><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} style={{ marginTop: 4 }} />{u.consent}</label>
              {err && <p role="alert" style={{ margin: 0, color: 'var(--c-signal)' }}>{err}</p>}
              <div><button type="submit" className="lq-btn-ghost" disabled={busy}>{busy ? u.wait : u.send}</button></div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <input type="text" name="website" data-hp="" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              {err && <p role="alert" style={{ margin: 0, color: 'var(--c-signal)' }}>{err}</p>}
              <div><button type="button" className="lq-btn-ghost" disabled={busy} onClick={() => void submit('no')}>{busy ? u.wait : u.sendNo}</button></div>
            </div>)}
        </div>}
      </main>
    </div>
  );
}
