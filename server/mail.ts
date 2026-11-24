// Outgoing mail for opt-in flows (free website check, newsletter confirmation, calculator confirmation).
// Resend, only when RESEND_API_KEY + DEMO_EMAIL_FROM are set. Until the sending domain is verified, Resend refuses
// every recipient except the account owner: callers treat `false` as "keep pending, never crash". No personal data in logs.
import type { Request } from 'express';

export type L = 'tr' | 'en' | 'de' | 'el';
export const langOf = (v: unknown): L => (['tr', 'en', 'de', 'el'].includes(String(v)) ? (String(v) as L) : 'en');
export const mailOn = () => Boolean(process.env.RESEND_API_KEY && process.env.DEMO_EMAIL_FROM);
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const originOf = (req: Request) => (process.env.PUBLIC_ORIGIN ?? '').split(',')[0].trim().replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;

export async function sendMail(o: { to: string; subject: string; html: string; text: string; headers?: Record<string, string>; attachments?: { filename: string; content: string }[] }): Promise<boolean> {
  if (!mailOn()) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.DEMO_EMAIL_FROM, to: [o.to], subject: o.subject, html: o.html, text: o.text, ...(o.headers ? { headers: o.headers } : {}), ...(o.attachments ? { attachments: o.attachments } : {}) }),
    });
    if (!r.ok) console.error('[mail] Resend refused', r.status);
    return r.ok;
  } catch { console.error('[mail] Resend request failed'); return false; }
}

/** Plain, readable shell (mail clients ignore CSS variables, so fixed colours here). */
export const shell = (lang: L, title: string, body: string, foot: string) => `<!doctype html><html lang="${lang}"><body style="margin:0;background:#eef2f8;font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif;color:#14213d"><div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:12px;padding:28px"><h1 style="margin:0 0 12px;font-size:22px;color:#0b2a5b">${esc(title)}</h1>${body}</div><p style="font-size:12px;color:#5a6a85;margin:14px 4px 0">${foot}</p></div></body></html>`;
export const button = (href: string, label: string) => `<p style="margin:22px 0"><a href="${esc(href)}" style="display:inline-block;background:#2f6fed;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">${esc(label)}</a></p>`;

export const MAIL = {
  en: {
    confirmSubject: 'Please confirm: your free website check', confirmTitle: 'Confirm your free website check',
    confirmIntro: 'You asked for a free check of your website. Please confirm with one click; I then analyse the site and send you the report.', confirmBtn: 'Confirm and get my report',
    confirmNote: 'The link is valid for 48 hours. If you did not ask for this, simply ignore this e-mail: nothing happens without your click.',
    roiSubject: 'Please confirm your e-mail address', roiTitle: 'Confirm your e-mail address', roiIntro: 'You left your e-mail address with the savings calculator. Please confirm it with one click so I may reply to your calculation in writing.', roiBtn: 'Confirm e-mail address',
    nlSubject: 'Please confirm your subscription', nlTitle: 'Confirm your subscription', nlIntro: 'You asked for one short digital tip about once a month. Please confirm with one click.', nlBtn: 'Confirm subscription', nlNote: 'If you did not ask for this, simply ignore this e-mail.',
    reportSubject: (d: string) => `Your free website check: ${d}`, reportTitle: (d: string) => `Website check: ${d}`, reportIntro: 'Here are the scores in six areas and the five most important fixes for your website.',
    scoresTitle: 'Scores (0 to 10)', fixesTitle: 'The 5 most important fixes', ctaText: 'If you want help with these fixes, send me a short request. Free, written, no call.', ctaBtn: 'Send a request',
    disclaimer: 'Automated analysis of your public pages. It is an estimate, not a guarantee.', unsub: 'Unsubscribe and delete my data', footer: 'You receive this e-mail because you asked for the free website check.',
  },
  de: {
    confirmSubject: 'Bitte bestätigen: Ihr kostenloser Website-Check', confirmTitle: 'Bestätigen Sie Ihren kostenlosen Website-Check',
    confirmIntro: 'Sie haben einen kostenlosen Check Ihrer Website angefordert. Bitte bestätigen Sie mit einem Klick; danach analysiere ich die Seite und sende Ihnen den Bericht.', confirmBtn: 'Bestätigen und Bericht erhalten',
    confirmNote: 'Der Link ist 48 Stunden gültig. Wenn Sie das nicht angefordert haben, ignorieren Sie diese E-Mail einfach: Ohne Ihren Klick passiert nichts.',
    roiSubject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse', roiTitle: 'E-Mail-Adresse bestätigen', roiIntro: 'Sie haben beim Ersparnis-Rechner Ihre E-Mail-Adresse hinterlassen. Bitte bestätigen Sie sie mit einem Klick, damit ich Ihnen zu Ihrer Berechnung schriftlich antworten darf.', roiBtn: 'E-Mail-Adresse bestätigen',
    nlSubject: 'Bitte bestätigen Sie Ihre Anmeldung', nlTitle: 'Anmeldung bestätigen', nlIntro: 'Sie möchten etwa einmal im Monat einen kurzen Digitalisierungs-Tipp erhalten. Bitte bestätigen Sie mit einem Klick.', nlBtn: 'Anmeldung bestätigen', nlNote: 'Wenn Sie das nicht angefordert haben, ignorieren Sie diese E-Mail einfach.',
    reportSubject: (d: string) => `Ihr kostenloser Website-Check: ${d}`, reportTitle: (d: string) => `Website-Check: ${d}`, reportIntro: 'Hier sind die Bewertungen in sechs Bereichen und die fünf wichtigsten Verbesserungen für Ihre Website.',
    scoresTitle: 'Bewertung (0 bis 10)', fixesTitle: 'Die 5 wichtigsten Verbesserungen', ctaText: 'Wenn Sie Hilfe bei diesen Punkten möchten, senden Sie mir eine kurze Anfrage. Kostenlos, schriftlich, ohne Anruf.', ctaBtn: 'Anfrage senden',
    disclaimer: 'Automatisierte Analyse Ihrer öffentlichen Seiten. Es ist eine Einschätzung, keine Garantie.', unsub: 'Abmelden und meine Daten löschen', footer: 'Sie erhalten diese E-Mail, weil Sie den kostenlosen Website-Check angefordert haben.',
  },
  tr: {
    confirmSubject: 'Lütfen onaylayın: ücretsiz web sitesi kontrolünüz', confirmTitle: 'Ücretsiz web sitesi kontrolünüzü onaylayın',
    confirmIntro: 'Web siteniz için ücretsiz kontrol istediniz. Lütfen tek tıkla onaylayın; ardından siteyi inceler ve raporu size gönderirim.', confirmBtn: 'Onayla ve raporumu al',
    confirmNote: 'Bağlantı 48 saat geçerlidir. Bunu siz istemediyseniz bu e-postayı yok sayın: tıklamadan hiçbir şey olmaz.',
    roiSubject: 'Lütfen e-posta adresinizi onaylayın', roiTitle: 'E-posta adresinizi onaylayın', roiIntro: 'Tasarruf hesaplayıcıda e-posta adresinizi bıraktınız. Hesaplamanıza yazılı yanıt verebilmem için lütfen tek tıkla onaylayın.', roiBtn: 'E-posta adresini onayla',
    nlSubject: 'Lütfen aboneliğinizi onaylayın', nlTitle: 'Aboneliği onaylayın', nlIntro: 'Ayda yaklaşık bir kez kısa bir dijitalleşme ipucu almak istediniz. Lütfen tek tıkla onaylayın.', nlBtn: 'Aboneliği onayla', nlNote: 'Bunu siz istemediyseniz bu e-postayı yok sayın.',
    reportSubject: (d: string) => `Ücretsiz web sitesi kontrolünüz: ${d}`, reportTitle: (d: string) => `Web sitesi kontrolü: ${d}`, reportIntro: 'Siteniz için altı alandaki puanlar ve en önemli beş düzeltme aşağıda.',
    scoresTitle: 'Puanlar (0 ile 10 arası)', fixesTitle: 'En önemli 5 düzeltme', ctaText: 'Bu düzeltmelerde yardım isterseniz bana kısa bir talep gönderin. Ücretsiz, yazılı, telefon görüşmesi yok.', ctaBtn: 'Talep gönder',
    disclaimer: 'Herkese açık sayfalarınızın otomatik analizidir. Bir tahmindir, garanti değildir.', unsub: 'Abonelikten çık ve verilerimi sil', footer: 'Bu e-postayı, ücretsiz web sitesi kontrolü istediğiniz için alıyorsunuz.',
  },
  el: {
    confirmSubject: 'Παρακαλώ επιβεβαιώστε: ο δωρεάν έλεγχος της ιστοσελίδας σας', confirmTitle: 'Επιβεβαιώστε τον δωρεάν έλεγχο ιστοσελίδας',
    confirmIntro: 'Ζητήσατε δωρεάν έλεγχο της ιστοσελίδας σας. Επιβεβαιώστε με ένα κλικ· στη συνέχεια αναλύω τη σελίδα και σας στέλνω την αναφορά.', confirmBtn: 'Επιβεβαίωση και λήψη αναφοράς',
    confirmNote: 'Ο σύνδεσμος ισχύει 48 ώρες. Αν δεν το ζητήσατε εσείς, αγνοήστε αυτό το e-mail: χωρίς το κλικ σας δεν γίνεται τίποτα.',
    roiSubject: 'Παρακαλώ επιβεβαιώστε το e-mail σας', roiTitle: 'Επιβεβαιώστε το e-mail σας', roiIntro: 'Αφήσατε το e-mail σας στον υπολογιστή εξοικονόμησης. Επιβεβαιώστε το με ένα κλικ, ώστε να μπορώ να απαντήσω γραπτώς στον υπολογισμό σας.', roiBtn: 'Επιβεβαίωση e-mail',
    nlSubject: 'Παρακαλώ επιβεβαιώστε την εγγραφή σας', nlTitle: 'Επιβεβαιώστε την εγγραφή', nlIntro: 'Ζητήσατε μία σύντομη συμβουλή ψηφιοποίησης περίπου μία φορά τον μήνα. Επιβεβαιώστε με ένα κλικ.', nlBtn: 'Επιβεβαίωση εγγραφής', nlNote: 'Αν δεν το ζητήσατε εσείς, αγνοήστε αυτό το e-mail.',
    reportSubject: (d: string) => `Ο δωρεάν έλεγχος της ιστοσελίδας σας: ${d}`, reportTitle: (d: string) => `Έλεγχος ιστοσελίδας: ${d}`, reportIntro: 'Ακολουθούν οι βαθμολογίες σε έξι τομείς και οι πέντε σημαντικότερες βελτιώσεις για την ιστοσελίδα σας.',
    scoresTitle: 'Βαθμολογία (0 έως 10)', fixesTitle: 'Οι 5 σημαντικότερες βελτιώσεις', ctaText: 'Αν θέλετε βοήθεια με αυτά, στείλτε μου ένα σύντομο αίτημα. Δωρεάν, γραπτώς, χωρίς τηλεφώνημα.', ctaBtn: 'Αποστολή αιτήματος',
    disclaimer: 'Αυτοματοποιημένη ανάλυση των δημόσιων σελίδων σας. Είναι εκτίμηση, όχι εγγύηση.', unsub: 'Διαγραφή και διαγραφή των δεδομένων μου', footer: 'Λαμβάνετε αυτό το e-mail επειδή ζητήσατε τον δωρεάν έλεγχο ιστοσελίδας.',
  },
} as const;

export type ConfirmKind = 'site' | 'roi' | 'nl';
/** Double opt-in confirmation mail (site check, calculator, newsletter). */
export function confirmMail(kind: ConfirmKind, to: string, lang: L, confirmUrl: string, unsubUrl: string) {
  const m = MAIL[lang];
  const [subject, title, intro, btn, note] = kind === 'site' ? [m.confirmSubject, m.confirmTitle, m.confirmIntro, m.confirmBtn, m.confirmNote]
    : kind === 'roi' ? [m.roiSubject, m.roiTitle, m.roiIntro, m.roiBtn, m.confirmNote]
    : [m.nlSubject, m.nlTitle, m.nlIntro, m.nlBtn, m.nlNote];
  return sendMail({
    to, subject, headers: { 'List-Unsubscribe': `<${unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    html: shell(lang, title, `<p>${esc(intro)}</p>${button(confirmUrl, btn)}<p style="font-size:13px;color:#5a6a85">${esc(note)}</p>`, `<a href="${esc(unsubUrl)}" style="color:#5a6a85">${esc(m.unsub)}</a>`),
    text: `${intro}\n\n${confirmUrl}\n\n${note}\n\n${m.unsub}: ${unsubUrl}`,
  });
}
