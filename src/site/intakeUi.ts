import type { Lang } from '../translations';

// UI strings of the private client intake page (/:lang/analiz/:token). Site copy is singular ("ich / ben").
export interface IntakeUi {
  hello: (name: string) => string; intro: string; time: string; step: string; of: string;
  next: string; back: string; toReview: string; edit: string; optional: string; required: string;
  other: string; otherPh: string; detailPh: string; unsureText: string; unsureHint: string; one: string; many: string; textPh: string;
  saving: string; saved: string; saveErr: string; second: string; secondOff: string; pickLang: string;
  helpBtn: string; costLabel: string; readLabel: string; translateQ: string; autoTrans: string; moreLangs: string; deviceLang: string; translating: string; transErr: string;
  reviewTitle: string; reviewSub: string; empty: string; consentTitle: string; submit: string; submitting: string;
  needFields: string; needConsent: string; badEmail: string; submitErr: string;
  doneTitle: string; doneBody: string; editAgain: string; editNote: string; invalidTitle: string; invalidBody: string; loading: string;
  skip: string; skipped: string; suggest: string; urlPh: string; badUrl: string; stepAria: string;
  privacy: string; privacyLink: string; brand: string; tabTitle: string;
}

export const INTAKE_UI: Record<Lang, IntakeUi> = {
  tr: {
    hello: (n) => (n ? `Merhaba ${n},` : 'Merhaba,'),
    intro: 'Size uygun bir teklif hazırlayabilmem için birkaç kısa soru soruyorum. Bilmediğiniz soruları atlayabilir veya "emin değilim" diyebilirsiniz. Cevaplarınız otomatik kaydedilir; istediğiniz an bırakıp aynı bağlantıdan devam edebilirsiniz.',
    time: 'Yaklaşık 10–15 dakika',
    step: 'Adım', of: '/', next: 'Devam', back: 'Geri', toReview: 'Özete geç', edit: 'Düzenle', optional: 'İsteğe bağlı', required: 'Zorunlu',
    other: 'Diğer', otherPh: 'Kendi cevabınızı yazın', detailPh: 'Ayrıntı (isteğe bağlı)', unsureText: 'Emin değilim / bilmiyorum', unsureHint: 'Emin değilseniz sorun değil.',
    one: 'Birini seçin', many: 'Birden fazla seçebilirsiniz', textPh: 'Birkaç kelime yeterli',
    saving: 'Kaydediliyor…', saved: 'Kaydedildi', saveErr: 'Kaydedilemedi, bağlantınızı kontrol edin', second: 'İkinci dili göster', secondOff: 'Kapalı', pickLang: 'İkinci dil',
    helpBtn: 'Bu ne demek?', costLabel: 'okumanız önemli: fiyatı etkiler', readLabel: 'okumanız önemli', translateQ: 'Çeviriyi göster', autoTrans: 'otomatik çeviri', moreLangs: 'Diğer diller', deviceLang: 'Cihazınızın dili', translating: 'Çevriliyor…', transErr: 'Çeviri şu an yüklenemedi.',
    reviewTitle: 'Son bir bakış', reviewSub: 'Cevaplarınızı kontrol edin. İstediğiniz bölümü düzenleyebilirsiniz.', empty: 'Boş bırakıldı',
    consentTitle: 'Onay', submit: 'Gönder', submitting: 'Gönderiliyor…',
    needFields: 'Lütfen zorunlu alanları doldurun.', needConsent: 'Göndermek için onay kutusunu işaretleyin.', badEmail: 'Geçerli bir e-posta adresi yazın.', submitErr: 'Gönderilemedi, tekrar deneyin.',
    doneTitle: 'Teşekkürler!', doneBody: 'Analiziniz alındı; inceleyip teklif ve fiyatlandırmayı size yazılı olarak ileteceğim.', editAgain: 'Cevaplarımı düzenle', editNote: 'Bir şeyi değiştirmek isterseniz aynı bağlantıdan cevaplarınızı düzenleyebilirsiniz; değişiklikler otomatik kaydedilir ve bana iletilir.',
    invalidTitle: 'Bu bağlantı geçerli değil', invalidBody: 'Bağlantının süresi dolmuş veya iptal edilmiş olabilir. Lütfen bana yazın, yeni bir bağlantı göndereyim.', loading: 'Yükleniyor…',
    skip: 'Bu sayfayı geç', skipped: 'Atlandı', suggest: 'Öneri:', urlPh: 'https://', badUrl: 'Geçerli bir adres yazın (https://…).', stepAria: 'İlerleme',
    privacy: 'Cevaplarınız yalnızca teklifinizi hazırlamak için kullanılır ve silinmesini isteyene kadar saklanır.', privacyLink: 'Gizlilik politikası', brand: 'İhtiyaç analizi', tabTitle: 'İhtiyaç analizi · Chioutworks',
  },
  en: {
    hello: (n) => (n ? `Hello ${n},` : 'Hello,'),
    intro: 'I ask a few short questions so I can prepare an offer that fits you. Skip anything you do not know or answer "not sure". Your answers are saved automatically, so you can stop at any time and continue from the same link.',
    time: 'About 10–15 minutes',
    step: 'Step', of: 'of', next: 'Continue', back: 'Back', toReview: 'Go to summary', edit: 'Edit', optional: 'Optional', required: 'Required',
    other: 'Other', otherPh: 'Write your own answer', detailPh: 'Details (optional)', unsureText: 'Not sure / do not know', unsureHint: 'Not sure? That is fine.',
    one: 'Choose one', many: 'You can choose several', textPh: 'A few words are enough',
    saving: 'Saving…', saved: 'Saved', saveErr: 'Could not save, check your connection', second: 'Show a second language', secondOff: 'Off', pickLang: 'Second language',
    helpBtn: 'What does this mean?', costLabel: 'please read: affects the price', readLabel: 'please read', translateQ: 'Show translation', autoTrans: 'automatic translation', moreLangs: 'Other languages', deviceLang: 'Your device language', translating: 'Translating…', transErr: 'The translation could not be loaded right now.',
    reviewTitle: 'One last look', reviewSub: 'Check your answers. You can edit any section.', empty: 'Left blank',
    consentTitle: 'Consent', submit: 'Submit', submitting: 'Submitting…',
    needFields: 'Please fill in the required fields.', needConsent: 'Tick the consent box to submit.', badEmail: 'Enter a valid e-mail address.', submitErr: 'Could not submit, please try again.',
    doneTitle: 'Thank you!', doneBody: 'Your analysis has been received. I will review it and send you the offer and pricing in writing.', editAgain: 'Edit my answers', editNote: 'If you want to change something, you can edit your answers from this same link; changes are saved automatically and reach me.',
    invalidTitle: 'This link is not valid', invalidBody: 'The link may have expired or been cancelled. Please write to me and I will send you a new one.', loading: 'Loading…',
    skip: 'Skip this page', skipped: 'Skipped', suggest: 'Ideas:', urlPh: 'https://', badUrl: 'Enter a valid address (https://…).', stepAria: 'Progress',
    privacy: 'Your answers are used only to prepare your offer and are kept until you ask me to delete them.', privacyLink: 'Privacy policy', brand: 'Project brief', tabTitle: 'Project brief · Chioutworks',
  },
  de: {
    hello: (n) => (n ? `Guten Tag ${n},` : 'Guten Tag,'),
    intro: 'Ich stelle Ihnen ein paar kurze Fragen, damit ich ein passendes Angebot vorbereiten kann. Was Sie nicht wissen, können Sie überspringen oder mit „nicht sicher“ beantworten. Ihre Antworten werden automatisch gespeichert, Sie können jederzeit aufhören und über denselben Link weitermachen.',
    time: 'Ca. 10–15 Minuten',
    step: 'Schritt', of: 'von', next: 'Weiter', back: 'Zurück', toReview: 'Zur Übersicht', edit: 'Bearbeiten', optional: 'Optional', required: 'Pflicht',
    other: 'Sonstiges', otherPh: 'Eigene Antwort eintragen', detailPh: 'Details (optional)', unsureText: 'Nicht sicher / weiß ich nicht', unsureHint: 'Nicht sicher? Kein Problem.',
    one: 'Eine Antwort wählen', many: 'Mehrfachauswahl möglich', textPh: 'Ein paar Worte genügen',
    saving: 'Speichert…', saved: 'Gespeichert', saveErr: 'Speichern fehlgeschlagen, bitte Verbindung prüfen', second: 'Zweite Sprache anzeigen', secondOff: 'Aus', pickLang: 'Zweite Sprache',
    helpBtn: 'Was bedeutet das?', costLabel: 'bitte lesen: beeinflusst den Preis', readLabel: 'bitte lesen', translateQ: 'Übersetzung anzeigen', autoTrans: 'automatische Übersetzung', moreLangs: 'Weitere Sprachen', deviceLang: 'Sprache Ihres Geräts', translating: 'Wird übersetzt…', transErr: 'Die Übersetzung konnte gerade nicht geladen werden.',
    reviewTitle: 'Ein letzter Blick', reviewSub: 'Prüfen Sie Ihre Antworten. Jeden Abschnitt können Sie noch bearbeiten.', empty: 'Leer gelassen',
    consentTitle: 'Einwilligung', submit: 'Absenden', submitting: 'Wird gesendet…',
    needFields: 'Bitte füllen Sie die Pflichtfelder aus.', needConsent: 'Zum Absenden bitte die Einwilligung ankreuzen.', badEmail: 'Bitte eine gültige E-Mail-Adresse eingeben.', submitErr: 'Senden fehlgeschlagen, bitte erneut versuchen.',
    doneTitle: 'Vielen Dank!', doneBody: 'Ihre Analyse ist eingegangen. Ich prüfe sie und sende Ihnen Angebot und Preise schriftlich zu.', editAgain: 'Antworten bearbeiten', editNote: 'Wenn Sie etwas ändern möchten, können Sie Ihre Antworten über denselben Link bearbeiten; Änderungen werden automatisch gespeichert und erreichen mich.',
    invalidTitle: 'Dieser Link ist ungültig', invalidBody: 'Der Link ist möglicherweise abgelaufen oder wurde zurückgezogen. Schreiben Sie mir bitte, dann sende ich Ihnen einen neuen.', loading: 'Lädt…',
    skip: 'Diese Seite überspringen', skipped: 'Übersprungen', suggest: 'Vorschläge:', urlPh: 'https://', badUrl: 'Bitte eine gültige Adresse eingeben (https://…).', stepAria: 'Fortschritt',
    privacy: 'Ihre Angaben werden nur zur Vorbereitung Ihres Angebots verwendet und bis zu Ihrem Löschwunsch gespeichert.', privacyLink: 'Datenschutzerklärung', brand: 'Bedarfsanalyse', tabTitle: 'Bedarfsanalyse · Chioutworks',
  },
  el: {
    hello: (n) => (n ? `Γεια σας ${n},` : 'Γεια σας,'),
    intro: 'Θα σας κάνω μερικές σύντομες ερωτήσεις ώστε να ετοιμάσω μια προσφορά που σας ταιριάζει. Όσα δεν γνωρίζετε μπορείτε να τα παραλείψετε ή να απαντήσετε «δεν είμαι σίγουρος/η». Οι απαντήσεις σας αποθηκεύονται αυτόματα και μπορείτε να σταματήσετε όποτε θέλετε και να συνεχίσετε από τον ίδιο σύνδεσμο.',
    time: 'Περίπου 10–15 λεπτά',
    step: 'Βήμα', of: 'από', next: 'Συνέχεια', back: 'Πίσω', toReview: 'Στη σύνοψη', edit: 'Επεξεργασία', optional: 'Προαιρετικό', required: 'Υποχρεωτικό',
    other: 'Άλλο', otherPh: 'Γράψτε τη δική σας απάντηση', detailPh: 'Λεπτομέρειες (προαιρετικό)', unsureText: 'Δεν είμαι σίγουρος/η / δεν ξέρω', unsureHint: 'Δεν είστε σίγουρος/η; Κανένα πρόβλημα.',
    one: 'Επιλέξτε μία απάντηση', many: 'Μπορείτε να επιλέξετε περισσότερες', textPh: 'Λίγες λέξεις αρκούν',
    saving: 'Αποθήκευση…', saved: 'Αποθηκεύτηκε', saveErr: 'Αποτυχία αποθήκευσης, ελέγξτε τη σύνδεση', second: 'Εμφάνιση δεύτερης γλώσσας', secondOff: 'Ανενεργό', pickLang: 'Δεύτερη γλώσσα',
    helpBtn: 'Τι σημαίνει αυτό;', costLabel: 'διαβάστε: επηρεάζει την τιμή', readLabel: 'διαβάστε', translateQ: 'Εμφάνιση μετάφρασης', autoTrans: 'αυτόματη μετάφραση', moreLangs: 'Άλλες γλώσσες', deviceLang: 'Η γλώσσα της συσκευής σας', translating: 'Μετάφραση…', transErr: 'Η μετάφραση δεν φορτώθηκε αυτή τη στιγμή.',
    reviewTitle: 'Μια τελευταία ματιά', reviewSub: 'Ελέγξτε τις απαντήσεις σας. Μπορείτε να επεξεργαστείτε κάθε ενότητα.', empty: 'Αφέθηκε κενό',
    consentTitle: 'Συγκατάθεση', submit: 'Αποστολή', submitting: 'Αποστολή…',
    needFields: 'Συμπληρώστε τα υποχρεωτικά πεδία.', needConsent: 'Για την αποστολή τσεκάρετε το πλαίσιο συγκατάθεσης.', badEmail: 'Γράψτε μια έγκυρη διεύθυνση e-mail.', submitErr: 'Η αποστολή απέτυχε, δοκιμάστε ξανά.',
    doneTitle: 'Ευχαριστώ!', doneBody: 'Η ανάλυσή σας ελήφθη. Θα την εξετάσω και θα σας στείλω γραπτώς την προσφορά και την τιμολόγηση.', editAgain: 'Επεξεργασία απαντήσεων', editNote: 'Αν θέλετε να αλλάξετε κάτι, μπορείτε να επεξεργαστείτε τις απαντήσεις σας από τον ίδιο σύνδεσμο· οι αλλαγές αποθηκεύονται αυτόματα και μου αποστέλλονται.',
    invalidTitle: 'Ο σύνδεσμος δεν είναι έγκυρος', invalidBody: 'Ο σύνδεσμος μπορεί να έχει λήξει ή να έχει ακυρωθεί. Γράψτε μου και θα σας στείλω νέο.', loading: 'Φόρτωση…',
    skip: 'Παράλειψη σελίδας', skipped: 'Παραλείφθηκε', suggest: 'Προτάσεις:', urlPh: 'https://', badUrl: 'Γράψτε μια έγκυρη διεύθυνση (https://…).', stepAria: 'Πρόοδος',
    privacy: 'Οι απαντήσεις σας χρησιμοποιούνται μόνο για την προετοιμασία της προσφοράς και διατηρούνται μέχρι να ζητήσετε διαγραφή.', privacyLink: 'Πολιτική απορρήτου', brand: 'Ανάλυση αναγκών', tabTitle: 'Ανάλυση αναγκών · Chioutworks',
  },
};
