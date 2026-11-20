import type { Lang } from '../../translations';

// Request wizard after the voice call / chat (owner, 2026-11-20): 1 details → 2 style → 3 examples → send. Singular voice, no promises of meetings, calls or SMS.
export interface WizUi {
  steps: [string, string, string]; stepsShort: [string, string]; req: string; first: string; last: string; business: string; city: string; email: string; phone: string; need: string;
  site: string; contactWhen: string; startWhen: string; budget: string; notes: string; choose: string;
  cw: [string, string][]; sw: [string, string][]; bg: [string, string][];
  title1: string; hint: string; toStyle: string; toNext: string; back: string; send: string; sending: string; skipStyle: string;
  fixFields: string; badEmail: string; badPhone: string; badUrl: string; err: string;
  styleTitle: string; styleIntro: string; stylePick: string; pickMin: string; like: string; liked: string; own: string; ownHint: string; dark: string; light: string; palette: string; fonts: string; preview: string;
  exTitle: string; exIntro: string; exPh: string; exNote: string; exNone: string; readyTitle: string; readyText: string;
  doneTitle: string; doneBody: string; close: string; saved: string; roles: Record<'accent' | 'bg' | 'surface' | 'text' | 'muted', string>;
}
export const WIZ_UI: Record<Lang, WizUi> = {
  tr: {
    steps: ['1 Bilgiler', '2 Tarz', '3 Örnekler'], stepsShort: ['1 Bilgiler', '2 Gönder'], req: 'zorunlu', first: 'Ad', last: 'Soyad', business: 'İşletme adı', city: 'Şehir / bölge', email: 'E-posta', phone: 'Telefon', need: 'Neye ihtiyacınız var?',
    site: 'Mevcut web siteniz (varsa)', contactWhen: 'Tercih ettiğiniz iletişim zamanı', startWhen: 'Ne zaman başlamak istiyorsunuz?', budget: 'Yaklaşık bütçe aralığı', notes: 'Ek notlar', choose: 'Seçin',
    cw: [['morning', 'Sabah'], ['afternoon', 'Öğleden sonra'], ['evening', 'Akşam'], ['any', 'Fark etmez']], sw: [['asap', 'En kısa sürede'], ['1m', '1 ay içinde'], ['3m', '3 ay içinde'], ['explore', 'Sadece bakıyorum']],
    bg: [['b1', '1.000 € altı'], ['b2', '1.000 – 3.000 €'], ['b3', '3.000 – 10.000 €'], ['b4', '10.000 € üzeri'], ['unsure', 'Emin değilim']],
    title1: 'Talep bilgileriniz', hint: 'Bilgileri düzeltebilirsiniz. Son adımda “Gönder”e basana kadar hiçbir şey gönderilmez.', toStyle: 'Renk paleti ve tarz seçimine geç', toNext: 'Devam et', back: 'Geri', send: 'Gönder', sending: 'Gönderiliyor…', skipStyle: 'Tarz seçmeden devam et',
    fixFields: 'Lütfen * ile işaretli alanları doldurun.', badEmail: 'Geçerli bir e-posta adresi yazın.', badPhone: 'Telefon numarası en az 7 rakam olmalı.', badUrl: 'Geçerli bir site adresi yazın (http veya https).', err: 'Gönderilemedi. Lütfen tekrar deneyin veya iletişim formunu kullanın.',
    styleTitle: 'Renk paleti ve tarz', styleIntro: 'Beğendiğiniz görünümleri ♥ ile işaretleyin, sonra renk ve yazı tipini ayarlayın.', stylePick: 'Hangi görünüm size yakın?', pickMin: 'Devam etmek için en az bir örneği beğenin ya da “Tarz seçmeden devam et” deyin.', like: 'Beğendim', liked: 'Beğenildi',
    own: 'Kendi renklerim', ownHint: 'Ana rengi seçin, diğerlerini isterseniz değiştirin.', dark: 'Koyu', light: 'Açık', palette: 'Renk paleti', fonts: 'Yazı tipi', preview: 'Önizleme',
    exTitle: 'Örnekler', exIntro: 'Beğendiğiniz ya da bildiğiniz bir web sitesi veya örnek var mı?', exPh: 'https://ornek-site.com', exNote: 'Neyini beğendiniz?', exNone: 'Örnek yok',
    readyTitle: 'Gönderime hazır', readyText: 'Bilgileriniz tamam. Göndermek için “Gönder”e basın.',
    doneTitle: 'Talebiniz alındı', doneBody: 'Bilgileriniz ve seçimleriniz kaydedildi. Talebinizi inceleyip size yazılı olarak dönüş yapacağım.', close: 'Kapat', saved: 'Taslak kaydedildi.',
    roles: { accent: 'Vurgu', bg: 'Zemin', surface: 'Yüzey', text: 'Yazı', muted: 'İkincil yazı' },
  },
  en: {
    steps: ['1 Details', '2 Style', '3 Examples'], stepsShort: ['1 Details', '2 Send'], req: 'required', first: 'First name', last: 'Last name', business: 'Business name', city: 'City / region', email: 'E-mail', phone: 'Phone', need: 'What do you need?',
    site: 'Your current website (if any)', contactWhen: 'Preferred contact time', startWhen: 'When would you like to start?', budget: 'Rough budget range', notes: 'Additional notes', choose: 'Select',
    cw: [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['any', 'No preference']], sw: [['asap', 'As soon as possible'], ['1m', 'Within 1 month'], ['3m', 'Within 3 months'], ['explore', 'Just exploring']],
    bg: [['b1', 'Under €1,000'], ['b2', '€1,000 – 3,000'], ['b3', '€3,000 – 10,000'], ['b4', 'Over €10,000'], ['unsure', 'Not sure']],
    title1: 'Your request details', hint: 'You can correct the details. Nothing is sent until you press “Send” in the last step.', toStyle: 'Continue to colour palette & style', toNext: 'Continue', back: 'Back', send: 'Send', sending: 'Sending…', skipStyle: 'Continue without choosing a style',
    fixFields: 'Please fill in the fields marked with *.', badEmail: 'Please enter a valid e-mail address.', badPhone: 'The phone number needs at least 7 digits.', badUrl: 'Please enter a valid website address (http or https).', err: 'It could not be sent. Please try again or use the contact form.',
    styleTitle: 'Colour palette & style', styleIntro: 'Mark the looks you like with ♥, then adjust colours and fonts.', stylePick: 'Which look is closest to you?', pickMin: 'Like at least one example to continue, or choose “Continue without choosing a style”.', like: 'I like it', liked: 'Liked',
    own: 'My own colours', ownHint: 'Pick the main colour, change the others if you wish.', dark: 'Dark', light: 'Light', palette: 'Colour palette', fonts: 'Fonts', preview: 'Preview',
    exTitle: 'Examples', exIntro: 'Is there a website or example you like or know?', exPh: 'https://example.com', exNote: 'What did you like about it?', exNone: 'No examples',
    readyTitle: 'Ready to send', readyText: 'Your details are complete. Press “Send” to submit.',
    doneTitle: 'Your request has been received', doneBody: 'Your details and choices are saved. I will review your request and reply to you in writing.', close: 'Close', saved: 'Draft saved.',
    roles: { accent: 'Accent', bg: 'Background', surface: 'Surface', text: 'Text', muted: 'Secondary text' },
  },
  de: {
    steps: ['1 Angaben', '2 Stil', '3 Beispiele'], stepsShort: ['1 Angaben', '2 Senden'], req: 'Pflicht', first: 'Vorname', last: 'Nachname', business: 'Firmenname', city: 'Stadt / Region', email: 'E-Mail', phone: 'Telefon', need: 'Was benötigen Sie?',
    site: 'Ihre bestehende Website (falls vorhanden)', contactWhen: 'Bevorzugte Kontaktzeit', startWhen: 'Wann möchten Sie starten?', budget: 'Ungefährer Budgetrahmen', notes: 'Weitere Hinweise', choose: 'Auswählen',
    cw: [['morning', 'Vormittags'], ['afternoon', 'Nachmittags'], ['evening', 'Abends'], ['any', 'Egal']], sw: [['asap', 'So bald wie möglich'], ['1m', 'Innerhalb von 1 Monat'], ['3m', 'Innerhalb von 3 Monaten'], ['explore', 'Ich informiere mich nur']],
    bg: [['b1', 'Unter 1.000 €'], ['b2', '1.000 – 3.000 €'], ['b3', '3.000 – 10.000 €'], ['b4', 'Über 10.000 €'], ['unsure', 'Weiß ich noch nicht']],
    title1: 'Ihre Anfragedaten', hint: 'Sie können die Angaben korrigieren. Es wird nichts gesendet, bis Sie im letzten Schritt auf „Senden“ drücken.', toStyle: 'Weiter zu Farbpalette & Stil', toNext: 'Weiter', back: 'Zurück', send: 'Senden', sending: 'Wird gesendet…', skipStyle: 'Ohne Stilauswahl fortfahren',
    fixFields: 'Bitte füllen Sie die mit * markierten Felder aus.', badEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', badPhone: 'Die Telefonnummer braucht mindestens 7 Ziffern.', badUrl: 'Bitte geben Sie eine gültige Website-Adresse ein (http oder https).', err: 'Es konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder nutzen Sie das Kontaktformular.',
    styleTitle: 'Farbpalette & Stil', styleIntro: 'Markieren Sie Looks, die Ihnen gefallen, mit ♥ und passen Sie dann Farben und Schriften an.', stylePick: 'Welcher Look passt zu Ihnen?', pickMin: 'Wählen Sie mindestens ein Beispiel oder „Ohne Stilauswahl fortfahren“.', like: 'Gefällt mir', liked: 'Gefällt',
    own: 'Eigene Farben', ownHint: 'Wählen Sie die Hauptfarbe, die übrigen können Sie ändern.', dark: 'Dunkel', light: 'Hell', palette: 'Farbpalette', fonts: 'Schriften', preview: 'Vorschau',
    exTitle: 'Beispiele', exIntro: 'Gibt es eine Website oder ein Beispiel, das Ihnen gefällt oder das Sie kennen?', exPh: 'https://beispiel.de', exNote: 'Was gefällt Ihnen daran?', exNone: 'Keine Beispiele',
    readyTitle: 'Bereit zum Senden', readyText: 'Ihre Angaben sind vollständig. Drücken Sie auf „Senden“.',
    doneTitle: 'Ihre Anfrage ist eingegangen', doneBody: 'Ihre Angaben und Auswahl sind gespeichert. Ich prüfe Ihre Anfrage und antworte Ihnen schriftlich.', close: 'Schließen', saved: 'Entwurf gespeichert.',
    roles: { accent: 'Akzent', bg: 'Hintergrund', surface: 'Fläche', text: 'Text', muted: 'Zweittext' },
  },
  el: {
    steps: ['1 Στοιχεία', '2 Στυλ', '3 Παραδείγματα'], stepsShort: ['1 Στοιχεία', '2 Αποστολή'], req: 'υποχρεωτικό', first: 'Όνομα', last: 'Επώνυμο', business: 'Επωνυμία επιχείρησης', city: 'Πόλη / περιοχή', email: 'E-mail', phone: 'Τηλέφωνο', need: 'Τι χρειάζεστε;',
    site: 'Η υπάρχουσα ιστοσελίδα σας (αν υπάρχει)', contactWhen: 'Προτιμώμενη ώρα επικοινωνίας', startWhen: 'Πότε θέλετε να ξεκινήσετε;', budget: 'Κατά προσέγγιση προϋπολογισμός', notes: 'Πρόσθετες σημειώσεις', choose: 'Επιλέξτε',
    cw: [['morning', 'Πρωί'], ['afternoon', 'Απόγευμα'], ['evening', 'Βράδυ'], ['any', 'Αδιάφορο']], sw: [['asap', 'Το συντομότερο'], ['1m', 'Μέσα σε 1 μήνα'], ['3m', 'Μέσα σε 3 μήνες'], ['explore', 'Απλώς ενημερώνομαι']],
    bg: [['b1', 'Κάτω από 1.000 €'], ['b2', '1.000 – 3.000 €'], ['b3', '3.000 – 10.000 €'], ['b4', 'Πάνω από 10.000 €'], ['unsure', 'Δεν είμαι σίγουρος/η']],
    title1: 'Τα στοιχεία του αιτήματός σας', hint: 'Μπορείτε να διορθώσετε τα στοιχεία. Τίποτα δεν στέλνεται μέχρι να πατήσετε «Αποστολή» στο τελευταίο βήμα.', toStyle: 'Συνέχεια στην παλέτα χρωμάτων & στυλ', toNext: 'Συνέχεια', back: 'Πίσω', send: 'Αποστολή', sending: 'Αποστολή…', skipStyle: 'Συνέχεια χωρίς επιλογή στυλ',
    fixFields: 'Συμπληρώστε τα πεδία που σημειώνονται με *.', badEmail: 'Εισαγάγετε έγκυρη διεύθυνση e-mail.', badPhone: 'Το τηλέφωνο πρέπει να έχει τουλάχιστον 7 ψηφία.', badUrl: 'Εισαγάγετε έγκυρη διεύθυνση ιστοσελίδας (http ή https).', err: 'Δεν στάλθηκε. Δοκιμάστε ξανά ή χρησιμοποιήστε τη φόρμα επικοινωνίας.',
    styleTitle: 'Παλέτα χρωμάτων & στυλ', styleIntro: 'Σημειώστε με ♥ ό,τι σας αρέσει και μετά προσαρμόστε χρώματα και γραμματοσειρές.', stylePick: 'Ποιο στυλ σας ταιριάζει;', pickMin: 'Επιλέξτε τουλάχιστον ένα παράδειγμα ή «Συνέχεια χωρίς επιλογή στυλ».', like: 'Μου αρέσει', liked: 'Αρέσει',
    own: 'Δικά μου χρώματα', ownHint: 'Επιλέξτε το βασικό χρώμα και αλλάξτε τα υπόλοιπα αν θέλετε.', dark: 'Σκούρο', light: 'Ανοιχτό', palette: 'Παλέτα χρωμάτων', fonts: 'Γραμματοσειρές', preview: 'Προεπισκόπηση',
    exTitle: 'Παραδείγματα', exIntro: 'Υπάρχει κάποια ιστοσελίδα ή παράδειγμα που σας αρέσει ή γνωρίζετε;', exPh: 'https://example.com', exNote: 'Τι σας άρεσε σε αυτό;', exNone: 'Δεν έχω παραδείγματα',
    readyTitle: 'Έτοιμο για αποστολή', readyText: 'Τα στοιχεία σας είναι πλήρη. Πατήστε «Αποστολή».',
    doneTitle: 'Το αίτημά σας ελήφθη', doneBody: 'Τα στοιχεία και οι επιλογές σας αποθηκεύτηκαν. Θα εξετάσω το αίτημά σας και θα σας απαντήσω γραπτώς.', close: 'Κλείσιμο', saved: 'Το προσχέδιο αποθηκεύτηκε.',
    roles: { accent: 'Έμφαση', bg: 'Φόντο', surface: 'Επιφάνεια', text: 'Κείμενο', muted: 'Δευτερεύον κείμενο' },
  },
};
