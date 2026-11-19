import type { Lang } from '../../translations';

// "Choose your style" page (owner, 2026-11-17): style cards + optional example sites. Sent after the intake form and after a voice call.
export const STYLE_SLUG: Record<Lang, string> = { tr: 'tarz', en: 'style', de: 'stil', el: 'styl' };

export const STYLE_UI: Record<Lang, {
  kicker: string; title: string; intro: string; like: string; liked: string; notMe: string; notMeOn: string; min: string;
  refTitle: string; refIntro: string; refPh: string; what: string; whatOpts: Record<'colors' | 'layout' | 'photos' | 'all', string>;
  addRef: string; notePh: string; skip: string; next: string; back: string; send: string; sending: string;
  doneTitle: string; doneBody: string; already: string; notFound: string; err: string; badUrl: string; count: (n: number) => string;
  ctaTitle: string; ctaBody: string; ctaBtn: string;
}> = {
  tr: {
    kicker: 'Tarzınızı seçin', title: 'Hangi görünüm size daha yakın?', intro: 'Beğendiğiniz örneklere ♥ verin. Kararsızsanız sorun değil: içgüdünüze güvenin, 2 dakika sürer.',
    like: 'Beğendim', liked: 'Beğenildi', notMe: 'Bana göre değil', notMeOn: 'İşaretlendi', min: 'Devam etmek için en az bir örneği beğenin.',
    refTitle: 'Beğendiğiniz bir site var mı?', refIntro: 'İsteğe bağlı. Bir veya iki site yazarsanız ne istediğiniz çok daha net anlaşılır.',
    refPh: 'https://ornek-site.com', what: 'Neyini beğendiniz?', whatOpts: { colors: 'Renkleri', layout: 'Düzeni', photos: 'Fotoğrafları', all: 'Hepsi' },
    addRef: '+ Bir site daha', notePh: 'Eklemek istediğiniz bir şey var mı? (isteğe bağlı)', skip: 'Atla', next: 'Devam', back: 'Geri', send: 'Gönder', sending: 'Gönderiliyor…',
    doneTitle: 'Teşekkürler!', doneBody: 'Seçiminiz talebinize eklendi. Teklifiniz bu tarza göre hazırlanır.', already: 'Bu seçim daha önce gönderildi. İsterseniz değiştirip tekrar gönderebilirsiniz.',
    notFound: 'Bu bağlantı geçerli değil veya süresi doldu.', err: 'Gönderilemedi. Lütfen tekrar deneyin.', badUrl: 'Lütfen geçerli bir site adresi yazın.',
    count: (n) => `${n} örnek beğenildi`,
    ctaTitle: 'Nasıl bir görünüm istediğinizden emin değil misiniz?', ctaBody: 'Örneklerden beğendiklerinizi seçin; teklifiniz tam size göre hazırlanır. 2 dakika sürer.', ctaBtn: 'Tarzımı seç →',
  },
  en: {
    kicker: 'Choose your style', title: 'Which look feels closest to you?', intro: 'Give a ♥ to the examples you like. Unsure? No problem: trust your gut, it takes 2 minutes.',
    like: 'I like it', liked: 'Liked', notMe: 'Not for me', notMeOn: 'Marked', min: 'Like at least one example to continue.',
    refTitle: 'Is there a website you like?', refIntro: 'Optional. One or two sites make it much clearer what you want.',
    refPh: 'https://example.com', what: 'What do you like about it?', whatOpts: { colors: 'Colours', layout: 'Layout', photos: 'Photos', all: 'All of it' },
    addRef: '+ Another site', notePh: 'Anything you would like to add? (optional)', skip: 'Skip', next: 'Continue', back: 'Back', send: 'Send', sending: 'Sending…',
    doneTitle: 'Thank you!', doneBody: 'Your choice has been added to your request. Your offer is prepared in this style.', already: 'This choice was sent before. You can change it and send it again.',
    notFound: 'This link is not valid or has expired.', err: 'Could not be sent. Please try again.', badUrl: 'Please enter a valid website address.',
    count: (n) => `${n} example${n === 1 ? '' : 's'} liked`,
    ctaTitle: 'Not sure what look you want?', ctaBody: 'Pick the examples you like and your offer is prepared exactly for you. It takes 2 minutes.', ctaBtn: 'Choose my style →',
  },
  de: {
    kicker: 'Ihren Stil wählen', title: 'Welcher Look passt am besten zu Ihnen?', intro: 'Geben Sie den Beispielen, die Ihnen gefallen, ein ♥. Unsicher? Kein Problem: Vertrauen Sie Ihrem Bauchgefühl, es dauert 2 Minuten.',
    like: 'Gefällt mir', liked: 'Gefällt', notMe: 'Nicht meins', notMeOn: 'Markiert', min: 'Bitte mindestens ein Beispiel auswählen, um fortzufahren.',
    refTitle: 'Gibt es eine Website, die Ihnen gefällt?', refIntro: 'Optional. Ein oder zwei Seiten machen viel klarer, was Sie sich wünschen.',
    refPh: 'https://beispiel.de', what: 'Was gefällt Ihnen daran?', whatOpts: { colors: 'Farben', layout: 'Aufbau', photos: 'Fotos', all: 'Alles' },
    addRef: '+ Weitere Seite', notePh: 'Möchten Sie noch etwas ergänzen? (optional)', skip: 'Überspringen', next: 'Weiter', back: 'Zurück', send: 'Senden', sending: 'Wird gesendet…',
    doneTitle: 'Vielen Dank!', doneBody: 'Ihre Auswahl wurde Ihrer Anfrage hinzugefügt. Ihr Angebot wird in diesem Stil vorbereitet.', already: 'Diese Auswahl wurde bereits gesendet. Sie können sie ändern und erneut senden.',
    notFound: 'Dieser Link ist ungültig oder abgelaufen.', err: 'Senden fehlgeschlagen. Bitte erneut versuchen.', badUrl: 'Bitte eine gültige Website-Adresse eingeben.',
    count: (n) => `${n} Beispiel${n === 1 ? '' : 'e'} ausgewählt`,
    ctaTitle: 'Noch unsicher, welcher Look es sein soll?', ctaBody: 'Wählen Sie die Beispiele, die Ihnen gefallen, und Ihr Angebot wird genau darauf abgestimmt. Dauert 2 Minuten.', ctaBtn: 'Meinen Stil wählen →',
  },
  el: {
    kicker: 'Επιλέξτε το στυλ σας', title: 'Ποια εμφάνιση σας ταιριάζει περισσότερο;', intro: 'Βάλτε ♥ στα παραδείγματα που σας αρέσουν. Δεν είστε σίγουροι; Κανένα πρόβλημα: εμπιστευτείτε το ένστικτό σας, διαρκεί 2 λεπτά.',
    like: 'Μου αρέσει', liked: 'Αρέσει', notMe: 'Όχι για μένα', notMeOn: 'Σημειώθηκε', min: 'Επιλέξτε τουλάχιστον ένα παράδειγμα για να συνεχίσετε.',
    refTitle: 'Υπάρχει κάποια ιστοσελίδα που σας αρέσει;', refIntro: 'Προαιρετικό. Μία ή δύο σελίδες κάνουν πολύ πιο σαφές τι θέλετε.',
    refPh: 'https://paradeigma.gr', what: 'Τι σας αρέσει σε αυτήν;', whatOpts: { colors: 'Τα χρώματα', layout: 'Η διάταξη', photos: 'Οι φωτογραφίες', all: 'Όλα' },
    addRef: '+ Άλλη μία σελίδα', notePh: 'Θέλετε να προσθέσετε κάτι; (προαιρετικό)', skip: 'Παράλειψη', next: 'Συνέχεια', back: 'Πίσω', send: 'Αποστολή', sending: 'Αποστολή…',
    doneTitle: 'Ευχαριστούμε!', doneBody: 'Η επιλογή σας προστέθηκε στο αίτημά σας. Η προσφορά σας ετοιμάζεται σε αυτό το στυλ.', already: 'Αυτή η επιλογή έχει ήδη σταλεί. Μπορείτε να την αλλάξετε και να τη στείλετε ξανά.',
    notFound: 'Ο σύνδεσμος δεν είναι έγκυρος ή έχει λήξει.', err: 'Η αποστολή απέτυχε. Δοκιμάστε ξανά.', badUrl: 'Γράψτε μια έγκυρη διεύθυνση ιστοσελίδας.',
    count: (n) => `${n} ${n === 1 ? 'παράδειγμα' : 'παραδείγματα'}`,
    ctaTitle: 'Δεν είστε σίγουροι για την εμφάνιση;', ctaBody: 'Επιλέξτε τα παραδείγματα που σας αρέσουν και η προσφορά σας ετοιμάζεται ακριβώς για εσάς. Διαρκεί 2 λεπτά.', ctaBtn: 'Επιλογή στυλ →',
  },
};

// Step 2 of the style page (owner, 2026-11-19): palette + font pair with a live, realistic preview.
export interface StyleTuneText {
  title: string; intro: string; basedOn: string; palette: string; own: string; ownHint: string; light: string; dark: string;
  fonts: string; head: string; body: string; preview: string; next: string; back: string; chosen: string;
  roles: { accent: string; bg: string; surface: string; text: string; muted: string }; regen: string;
  // sample site texts in the preview
  biz: string; nav: [string, string, string]; hero: string; sub: string; cta: string; cards: [string, string, string]; cardText: string; foot: string;
}
export const STYLE_TUNE: Record<Lang, StyleTuneText> = {
  tr: {
    roles: { accent: 'Ana renk', bg: 'Zemin', surface: 'Kutular', text: 'Yazı', muted: 'İkincil yazı' }, regen: 'Ana renge göre yeniden oluştur',
    title: 'Renkleri ve yazı tipini seçin', intro: 'Beğendiğiniz görünümü kendinize göre ayarlayın. Bir palet seçin ya da kendi ana renginizi belirleyin; ön izleme anında değişir.',
    basedOn: 'Temel alınan görünüm', palette: 'Renk paleti', own: 'Kendi rengim', ownHint: 'Ana renginizi seçin, uyumlu palet otomatik oluşur.', light: 'Açık zemin', dark: 'Koyu zemin',
    fonts: 'Yazı tipi', head: 'Başlık', body: 'Metin', preview: 'Ön izleme', next: 'Devam', back: 'Geri', chosen: 'Seçildi',
    biz: 'Örnek İşletme', nav: ['Hizmetler', 'Hakkımızda', 'İletişim'], hero: 'İşinizi kolaylaştıran çözümler', sub: 'Size özel, sade ve hızlı. İlk adımı bugün atın.', cta: 'Teklif iste',
    cards: ['Hızlı kurulum', 'Kolay yönetim', 'Güvenilir destek'], cardText: 'Kısa açıklama metni burada yer alır.', foot: '© Örnek İşletme',
  },
  en: {
    roles: { accent: 'Main colour', bg: 'Background', surface: 'Boxes', text: 'Text', muted: 'Secondary text' }, regen: 'Rebuild from main colour',
    title: 'Choose colours and fonts', intro: 'Fine-tune the look you liked. Pick a palette or set your own main colour; the preview updates right away.',
    basedOn: 'Based on the look', palette: 'Colour palette', own: 'My own colour', ownHint: 'Pick your main colour and a matching palette is created.', light: 'Light background', dark: 'Dark background',
    fonts: 'Font', head: 'Headings', body: 'Text', preview: 'Preview', next: 'Continue', back: 'Back', chosen: 'Selected',
    biz: 'Sample Business', nav: ['Services', 'About', 'Contact'], hero: 'Solutions that make your work easier', sub: 'Tailored, simple and fast. Take the first step today.', cta: 'Get a quote',
    cards: ['Quick setup', 'Easy to manage', 'Reliable support'], cardText: 'A short description goes here.', foot: '© Sample Business',
  },
  de: {
    roles: { accent: 'Hauptfarbe', bg: 'Hintergrund', surface: 'Boxen', text: 'Text', muted: 'Nebentext' }, regen: 'Aus der Hauptfarbe neu erstellen',
    title: 'Farben und Schrift wählen', intro: 'Passen Sie den gewählten Look an. Wählen Sie eine Farbpalette oder Ihre eigene Hauptfarbe; die Vorschau ändert sich sofort.',
    basedOn: 'Grundlage', palette: 'Farbpalette', own: 'Eigene Farbe', ownHint: 'Wählen Sie Ihre Hauptfarbe, eine passende Palette entsteht automatisch.', light: 'Heller Hintergrund', dark: 'Dunkler Hintergrund',
    fonts: 'Schrift', head: 'Überschrift', body: 'Text', preview: 'Vorschau', next: 'Weiter', back: 'Zurück', chosen: 'Gewählt',
    biz: 'Musterbetrieb', nav: ['Leistungen', 'Über uns', 'Kontakt'], hero: 'Lösungen, die Ihre Arbeit leichter machen', sub: 'Maßgeschneidert, schlicht und schnell. Starten Sie noch heute.', cta: 'Angebot anfragen',
    cards: ['Schnell eingerichtet', 'Einfach zu verwalten', 'Verlässlicher Support'], cardText: 'Hier steht ein kurzer Beschreibungstext.', foot: '© Musterbetrieb',
  },
  el: {
    roles: { accent: 'Κύριο χρώμα', bg: 'Φόντο', surface: 'Πλαίσια', text: 'Κείμενο', muted: 'Δευτερεύον κείμενο' }, regen: 'Νέα δημιουργία από το κύριο χρώμα',
    title: 'Επιλέξτε χρώματα και γραμματοσειρά', intro: 'Προσαρμόστε την εμφάνιση που σας άρεσε. Διαλέξτε παλέτα ή το δικό σας κύριο χρώμα· η προεπισκόπηση αλλάζει αμέσως.',
    basedOn: 'Βασική εμφάνιση', palette: 'Παλέτα χρωμάτων', own: 'Δικό μου χρώμα', ownHint: 'Διαλέξτε το κύριο χρώμα σας και δημιουργείται ταιριαστή παλέτα.', light: 'Ανοιχτό φόντο', dark: 'Σκούρο φόντο',
    fonts: 'Γραμματοσειρά', head: 'Τίτλοι', body: 'Κείμενο', preview: 'Προεπισκόπηση', next: 'Συνέχεια', back: 'Πίσω', chosen: 'Επιλέχθηκε',
    biz: 'Δείγμα Επιχείρησης', nav: ['Υπηρεσίες', 'Σχετικά', 'Επικοινωνία'], hero: 'Λύσεις που κάνουν τη δουλειά σας πιο εύκολη', sub: 'Προσαρμοσμένες, απλές και γρήγορες. Κάντε το πρώτο βήμα σήμερα.', cta: 'Ζητήστε προσφορά',
    cards: ['Γρήγορη εγκατάσταση', 'Εύκολη διαχείριση', 'Αξιόπιστη υποστήριξη'], cardText: 'Εδώ μπαίνει ένα σύντομο κείμενο.', foot: '© Δείγμα Επιχείρησης',
  },
};

// Leave guard on the style page (owner, 2026-11-19): honest loss framing, no shaming labels.
export const STYLE_LEAVE: Record<Lang, { title: string; body: string; stay: string; leave: string }> = {
  tr: { title: 'Sitenizin görünümü neredeyse hazır', body: 'Yaptığınız seçimler henüz gönderilmedi. Şimdi çıkarsanız seçimleriniz kaybolur ve teklifiniz sizin zevkinize göre değil, genel bir taslakla hazırlanır. Bitirmek yalnızca bir dakika sürer.', stay: 'Seçimimi tamamla', leave: 'Çık, seçimlerim silinsin' },
  en: { title: "Your website's look is almost ready", body: 'Your choices have not been sent yet. If you leave now, they will be lost and your offer will be based on a general draft instead of your taste. Finishing takes just a minute.', stay: 'Finish my choice', leave: 'Leave and discard my choices' },
  de: { title: 'Der Look Ihrer Website ist fast fertig', body: 'Ihre Auswahl wurde noch nicht gesendet. Wenn Sie jetzt gehen, geht sie verloren und Ihr Angebot basiert auf einem allgemeinen Entwurf statt auf Ihrem Geschmack. Abschließen dauert nur eine Minute.', stay: 'Auswahl abschließen', leave: 'Verlassen und Auswahl verwerfen' },
  el: { title: 'Η εμφάνιση της ιστοσελίδας σας είναι σχεδόν έτοιμη', body: 'Οι επιλογές σας δεν έχουν σταλεί ακόμη. Αν φύγετε τώρα, θα χαθούν και η προσφορά σας θα βασιστεί σε ένα γενικό προσχέδιο αντί για το δικό σας γούστο. Η ολοκλήρωση διαρκεί μόλις ένα λεπτό.', stay: 'Ολοκλήρωση επιλογής', leave: 'Έξοδος και διαγραφή επιλογών' },
};
