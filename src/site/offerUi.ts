import type { Lang } from '../translations';

// UI strings of the private offer page (/:lang/<offer-slug>/:token). Site copy is singular ("ich / ben").
export interface OfferUi {
  tabTitle: string; brand: string; hello: (name: string) => string; loading: string; invalidTitle: string; invalidBody: string;
  items: string; total: string; payment: string; deposit: string; installment: (n: number, total: number) => string; monthly: string; perMonth: string;
  monthlyIncludes: string; validUntil: string; expired: string; acceptTitle: string; acceptName: string; acceptConfirm: string; accept: string;
  accepting: string; acceptErr: string; acceptedTitle: string; acceptedBody: string; paidBody: string; questions: string; questionsIntro: string;
  glossary: string; msgPh: string; send: string;
  cTitle: string; cIntro: string; cCompany: string; cAddress: string; cSigner: string; cRole: string; cBusiness: string; cAgree: string; cSign: string; cSigning: string; cErr: string; cSignedTitle: string; cSignedBody: string; cDownload: string; cOpen: string; payBtn: string; payNow: (a: string) => string; payMonthly: (a: string) => string; payDone: string; payRest: string; payPortal: string; payErr: string; payTestTitle: string; payTestNote: string; payTestBtn: string; payTestDone: string; projectReady: string; projectGo: string; invoice: string; invoiceTest: string; sending: string; sendErr: string; you: string; me: string; noMessages: string; vatNote: string;
  qSit: string; qSol: string; qPrice: string; qNext: string; qSetup: string; qMonthly: string; qRec: string; qNone: string; qPkg: string; qPrint: string;
  cPostOpt: string; cDigitalOpt: string; cDelivery: string;
}

export const OFFER_UI: Record<Lang, OfferUi> = {
  tr: {
    qSit: 'Durum', qSol: 'Çözüm', qPrice: 'Fiyat', qNext: 'Sonraki adım', qSetup: 'Kurulum (tek sefer)', qMonthly: 'Aylık', qRec: 'Önerilen', qNone: 'Dahil olmayanlar', qPkg: 'Paket', qPrint: 'Tek sayfa olarak yazdır / PDF', cDelivery: 'Kabul şekli', cDigitalOpt: 'Dijital kabul', cPostOpt: 'Basılı kopya posta ile gönderilsin',
    tabTitle: 'Teklif · Chioutworks', brand: 'Teklif', hello: (n) => (n ? `Merhaba ${n},` : 'Merhaba,'), loading: 'Yükleniyor…',
    invalidTitle: 'Bu bağlantı geçerli değil', invalidBody: 'Teklif iptal edilmiş veya bağlantı hatalı olabilir. Lütfen bana yazın.',
    items: 'Kapsam ve fiyat', total: 'Kurulum toplamı', payment: 'Ödeme planı', deposit: 'Peşinat (başlangıçta)',
    installment: (n, t) => `${n}. taksit / ${t}`, monthly: 'Aylık ücret', perMonth: '/ ay', monthlyIncludes: 'Aylık ücrete dahil',
    validUntil: 'Teklifin geçerlilik tarihi', expired: 'Bu teklifin süresi doldu. Güncel bir teklif için aşağıdan bana yazabilirsiniz.',
    acceptTitle: 'Teklifi kabul et', acceptName: 'Adınız ve soyadınız', acceptConfirm: 'Teklifi ve ödeme planını okudum, kabul ediyorum.',
    accept: 'Kabul ediyorum', accepting: 'Gönderiliyor…', acceptErr: 'Gönderilemedi. Adınızı yazıp onay kutusunu işaretleyin.',
    acceptedTitle: 'Teklif kabul edildi', acceptedBody: 'Teşekkürler! Peşinat için ödeme bilgilerini size yazılı olarak ileteceğim. Ödeme ulaşınca projeye başlıyorum.',
    paidBody: 'Ödemeniz ulaştı. Proje takip bağlantınızı ayrıca göndereceğim.',
    questions: 'Sorular ve mesajlar', questionsIntro: 'Teklifle ilgili sorularınızı buraya yazabilirsiniz; cevabımı bu sayfada görürsünüz.',
    glossary: 'Bu teklifte geçen terimler',
    cTitle: 'Sözleşme', cIntro: 'Teklifi kabul ettiniz. Son adım: sözleşmeyi okuyup elektronik olarak imzalayın. İmzadan sonra ödeme adımı gelir.', cCompany: 'Firma adı', cAddress: 'Firma adresi', cSigner: 'Ad soyad (imzalayan)', cRole: 'Görevi (isteğe bağlı)', cBusiness: 'Bu sözleşmeyi işletmem adına (girişimci olarak) yapıyorum.', cAgree: 'Sözleşmeyi okudum ve kabul ediyorum. Adımı yazmam elektronik imzam yerine geçer.', cSign: 'Sözleşmeyi imzala', cSigning: 'İmzalanıyor…', cErr: 'Lütfen tüm zorunlu alanları doldurun ve iki onay kutusunu işaretleyin.', cSignedTitle: 'Sözleşme imzalandı', cSignedBody: 'Teşekkürler! İmzalı sözleşmenizi aşağıdan indirebilirsiniz. Ödeme bağlantısı size ayrıca iletilecek.', cDownload: 'Sözleşmeyi aç / PDF olarak kaydet', cOpen: 'Sözleşmeyi göster', payBtn: 'Güvenli ödemeye geç', payNow: (a) => `Şimdi: ${a} (kurulum ücreti).`, payMonthly: (a) => `Aylık ${a}, 2 ay sonra otomatik başlar.`, payDone: 'Ödemeniz alındı. Teşekkürler!', payRest: 'Kalan tutarı öde', payPortal: 'Ödeme yöntemi ve faturalar', payErr: 'Ödeme sayfası şu an açılamadı. Lütfen biraz sonra tekrar deneyin.', payTestTitle: 'Test ödemesi', payTestNote: 'Bu bir deneme ödemesidir: gerçek para alınmaz, kart bilgisi istenmez. Gerçek ödeme Stripe bağlandığında burada açılacak.', payTestBtn: 'Ödemeyi tamamla (test)', payTestDone: 'Test ödemesi kaydedildi.', projectReady: 'Proje sayfanız hazır. Projenizi adım adım buradan takip edebilir, mesaj yazabilir ve dosya ekleyebilirsiniz.', projectGo: 'Proje sayfanıza gidin', invoice: 'Fatura', invoiceTest: 'Test faturası (geçerli değil)',
    msgPh: 'Mesajınızı yazın', send: 'Gönder', sending: 'Gönderiliyor…', sendErr: 'Gönderilemedi, tekrar deneyin.', you: 'Siz', me: 'Chioutworks',
    noMessages: 'Henüz mesaj yok.', vatNote: 'Küçük işletme düzenlemesi (Alman KDV Kanunu §19) gereği KDV hesaplanmaz.',
  },
  en: {
    qSit: 'Situation', qSol: 'Solution', qPrice: 'Price', qNext: 'Next step', qSetup: 'Setup (one-time)', qMonthly: 'Monthly', qRec: 'Recommended', qNone: 'Not included', qPkg: 'Package', qPrint: 'Print as one page / PDF', cDelivery: 'Way of acceptance', cDigitalOpt: 'Digital acceptance', cPostOpt: 'Send a printed copy by post',
    tabTitle: 'Offer · Chioutworks', brand: 'Offer', hello: (n) => (n ? `Hello ${n},` : 'Hello,'), loading: 'Loading…',
    invalidTitle: 'This link is not valid', invalidBody: 'The offer may have been withdrawn or the link is wrong. Please write to me.',
    items: 'Scope and price', total: 'Setup total', payment: 'Payment plan', deposit: 'Deposit (at the start)',
    installment: (n, t) => `Instalment ${n} of ${t}`, monthly: 'Monthly fee', perMonth: '/ month', monthlyIncludes: 'Included in the monthly fee',
    validUntil: 'Offer valid until', expired: 'This offer has expired. You can write to me below for an updated offer.',
    acceptTitle: 'Accept the offer', acceptName: 'Your full name', acceptConfirm: 'I have read the offer and payment plan and accept them.',
    accept: 'I accept', accepting: 'Sending…', acceptErr: 'Could not send. Enter your name and tick the box.',
    acceptedTitle: 'Offer accepted', acceptedBody: 'Thank you! I will send you the payment details for the deposit in writing. Work starts once the payment arrives.',
    paidBody: 'Your payment has arrived. I will send you the project tracking link separately.',
    questions: 'Questions and messages', questionsIntro: 'Write any questions about the offer here; you will see my reply on this page.',
    glossary: 'Terms used in this offer',
    cTitle: 'Agreement', cIntro: 'You have accepted the offer. Last step: read the agreement and sign it electronically. The payment step follows after signing.', cCompany: 'Company name', cAddress: 'Company address', cSigner: 'Full name (signatory)', cRole: 'Position (optional)', cBusiness: 'I am entering into this agreement on behalf of my business (as an entrepreneur).', cAgree: 'I have read and accept the agreement. Typing my name serves as my electronic signature.', cSign: 'Sign the agreement', cSigning: 'Signing…', cErr: 'Please fill in all required fields and tick both boxes.', cSignedTitle: 'Agreement signed', cSignedBody: 'Thank you! You can download your signed agreement below. The payment link will be sent to you separately.', cDownload: 'Open agreement / save as PDF', cOpen: 'Show agreement', payBtn: 'Continue to secure payment', payNow: (a) => `Now: ${a} (setup fee).`, payMonthly: (a) => `Monthly ${a}, starting automatically after 2 months.`, payDone: 'Your payment has been received. Thank you!', payRest: 'Pay the remaining amount', payPortal: 'Payment method and invoices', payErr: 'The payment page could not be opened right now. Please try again shortly.', payTestTitle: 'Test payment', payTestNote: 'This is a test payment: no money is taken and no card details are needed. The real payment will open here once Stripe is connected.', payTestBtn: 'Complete payment (test)', payTestDone: 'Test payment recorded.', projectReady: 'Your project page is ready. Follow your project step by step, write messages and add files there.', projectGo: 'Go to your project page', invoice: 'Invoice', invoiceTest: 'Test invoice (not valid)',
    msgPh: 'Write your message', send: 'Send', sending: 'Sending…', sendErr: 'Could not send, please try again.', you: 'You', me: 'Chioutworks',
    noMessages: 'No messages yet.', vatNote: 'No VAT is charged under the small-business scheme (§19 German VAT Act).',
  },
  de: {
    qSit: 'Situation', qSol: 'Lösung', qPrice: 'Preis', qNext: 'Nächster Schritt', qSetup: 'Einrichtung (einmalig)', qMonthly: 'Monatlich', qRec: 'Empfohlen', qNone: 'Nicht enthalten', qPkg: 'Paket', qPrint: 'Als eine Seite drucken / PDF', cDelivery: 'Art der Annahme', cDigitalOpt: 'Digitale Annahme', cPostOpt: 'Gedruckte Kopie per Post senden',
    tabTitle: 'Angebot · Chioutworks', brand: 'Angebot', hello: (n) => (n ? `Guten Tag ${n},` : 'Guten Tag,'), loading: 'Wird geladen…',
    invalidTitle: 'Dieser Link ist nicht gültig', invalidBody: 'Das Angebot wurde eventuell zurückgezogen oder der Link ist fehlerhaft. Bitte schreiben Sie mir.',
    items: 'Umfang und Preis', total: 'Einrichtung gesamt', payment: 'Zahlungsplan', deposit: 'Anzahlung (zu Beginn)',
    installment: (n, t) => `Rate ${n} von ${t}`, monthly: 'Monatliche Gebühr', perMonth: '/ Monat', monthlyIncludes: 'In der monatlichen Gebühr enthalten',
    validUntil: 'Angebot gültig bis', expired: 'Dieses Angebot ist abgelaufen. Für ein aktuelles Angebot können Sie mir unten schreiben.',
    acceptTitle: 'Angebot annehmen', acceptName: 'Ihr vollständiger Name', acceptConfirm: 'Ich habe das Angebot und den Zahlungsplan gelesen und nehme sie an.',
    accept: 'Ich nehme an', accepting: 'Wird gesendet…', acceptErr: 'Senden fehlgeschlagen. Bitte Namen eingeben und das Kästchen ankreuzen.',
    acceptedTitle: 'Angebot angenommen', acceptedBody: 'Vielen Dank! Die Zahlungsdaten für die Anzahlung sende ich Ihnen schriftlich. Sobald die Zahlung eingeht, beginne ich mit dem Projekt.',
    paidBody: 'Ihre Zahlung ist eingegangen. Den Link zur Projektverfolgung sende ich Ihnen separat.',
    questions: 'Fragen und Nachrichten', questionsIntro: 'Fragen zum Angebot können Sie hier schreiben; meine Antwort sehen Sie auf dieser Seite.',
    glossary: 'Begriffe in diesem Angebot',
    cTitle: 'Vertrag', cIntro: 'Sie haben das Angebot angenommen. Letzter Schritt: Vertrag lesen und elektronisch unterzeichnen. Danach folgt die Zahlung.', cCompany: 'Firmenname', cAddress: 'Firmenanschrift', cSigner: 'Vor- und Nachname (unterzeichnende Person)', cRole: 'Funktion (optional)', cBusiness: 'Ich schließe diesen Vertrag für mein Unternehmen (als Unternehmer).', cAgree: 'Ich habe den Vertrag gelesen und stimme zu. Die Eingabe meines Namens gilt als meine elektronische Unterschrift.', cSign: 'Vertrag unterzeichnen', cSigning: 'Wird unterzeichnet…', cErr: 'Bitte alle Pflichtfelder ausfüllen und beide Kästchen ankreuzen.', cSignedTitle: 'Vertrag unterzeichnet', cSignedBody: 'Vielen Dank! Ihren unterzeichneten Vertrag können Sie unten herunterladen. Den Zahlungslink erhalten Sie separat.', cDownload: 'Vertrag öffnen / als PDF speichern', cOpen: 'Vertrag anzeigen', payBtn: 'Weiter zur sicheren Zahlung', payNow: (a) => `Jetzt: ${a} (Einrichtungsgebühr).`, payMonthly: (a) => `Monatlich ${a}, startet automatisch nach 2 Monaten.`, payDone: 'Ihre Zahlung ist eingegangen. Vielen Dank!', payRest: 'Restbetrag bezahlen', payPortal: 'Zahlungsmethode und Rechnungen', payErr: 'Die Zahlungsseite konnte gerade nicht geöffnet werden. Bitte versuchen Sie es gleich noch einmal.', payTestTitle: 'Testzahlung', payTestNote: 'Dies ist eine Testzahlung: Es wird kein Geld abgebucht und keine Kartendaten werden benötigt. Die echte Zahlung erscheint hier, sobald Stripe verbunden ist.', payTestBtn: 'Zahlung abschließen (Test)', payTestDone: 'Testzahlung erfasst.', projectReady: 'Ihre Projektseite ist bereit. Dort verfolgen Sie Ihr Projekt Schritt für Schritt, schreiben Nachrichten und fügen Dateien hinzu.', projectGo: 'Zur Projektseite', invoice: 'Rechnung', invoiceTest: 'Testrechnung (nicht gültig)',
    msgPh: 'Ihre Nachricht', send: 'Senden', sending: 'Wird gesendet…', sendErr: 'Senden fehlgeschlagen, bitte erneut versuchen.', you: 'Sie', me: 'Chioutworks',
    noMessages: 'Noch keine Nachrichten.', vatNote: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).',
  },
  el: {
    qSit: 'Κατάσταση', qSol: 'Λύση', qPrice: 'Τιμή', qNext: 'Επόμενο βήμα', qSetup: 'Εγκατάσταση (εφάπαξ)', qMonthly: 'Μηνιαία', qRec: 'Προτεινόμενο', qNone: 'Δεν περιλαμβάνονται', qPkg: 'Πακέτο', qPrint: 'Εκτύπωση σε μία σελίδα / PDF', cDelivery: 'Τρόπος αποδοχής', cDigitalOpt: 'Ηλεκτρονική αποδοχή', cPostOpt: 'Αποστολή έντυπου αντιγράφου ταχυδρομικώς',
    tabTitle: 'Προσφορά · Chioutworks', brand: 'Προσφορά', hello: (n) => (n ? `Γεια σας ${n},` : 'Γεια σας,'), loading: 'Φόρτωση…',
    invalidTitle: 'Ο σύνδεσμος δεν είναι έγκυρος', invalidBody: 'Η προσφορά μπορεί να έχει ακυρωθεί ή ο σύνδεσμος να είναι λάθος. Γράψτε μου.',
    items: 'Εύρος και τιμή', total: 'Σύνολο εγκατάστασης', payment: 'Πρόγραμμα πληρωμής', deposit: 'Προκαταβολή (στην αρχή)',
    installment: (n, t) => `Δόση ${n} από ${t}`, monthly: 'Μηνιαία χρέωση', perMonth: '/ μήνα', monthlyIncludes: 'Περιλαμβάνεται στη μηνιαία χρέωση',
    validUntil: 'Η προσφορά ισχύει έως', expired: 'Η προσφορά έχει λήξει. Για ενημερωμένη προσφορά γράψτε μου παρακάτω.',
    acceptTitle: 'Αποδοχή προσφοράς', acceptName: 'Ονοματεπώνυμο', acceptConfirm: 'Διάβασα την προσφορά και το πρόγραμμα πληρωμής και τα αποδέχομαι.',
    accept: 'Αποδέχομαι', accepting: 'Αποστολή…', acceptErr: 'Η αποστολή απέτυχε. Γράψτε το όνομά σας και επιλέξτε το πλαίσιο.',
    acceptedTitle: 'Η προσφορά έγινε αποδεκτή', acceptedBody: 'Ευχαριστώ! Θα σας στείλω γραπτώς τα στοιχεία πληρωμής για την προκαταβολή. Η εργασία ξεκινά μόλις φτάσει η πληρωμή.',
    paidBody: 'Η πληρωμή σας ελήφθη. Θα σας στείλω ξεχωριστά τον σύνδεσμο παρακολούθησης του έργου.',
    questions: 'Ερωτήσεις και μηνύματα', questionsIntro: 'Γράψτε εδώ ερωτήσεις για την προσφορά· την απάντησή μου θα τη δείτε σε αυτή τη σελίδα.',
    glossary: 'Όροι που εμφανίζονται στην προσφορά',
    cTitle: 'Σύμβαση', cIntro: 'Αποδεχτήκατε την προσφορά. Τελευταίο βήμα: διαβάστε τη σύμβαση και υπογράψτε ηλεκτρονικά. Μετά την υπογραφή ακολουθεί η πληρωμή.', cCompany: 'Επωνυμία εταιρείας', cAddress: 'Διεύθυνση εταιρείας', cSigner: 'Ονοματεπώνυμο (υπογράφων)', cRole: 'Θέση (προαιρετικά)', cBusiness: 'Συνάπτω τη σύμβαση για λογαριασμό της επιχείρησής μου (ως επιχειρηματίας).', cAgree: 'Διάβασα και αποδέχομαι τη σύμβαση. Η πληκτρολόγηση του ονόματός μου ισχύει ως ηλεκτρονική υπογραφή.', cSign: 'Υπογραφή σύμβασης', cSigning: 'Υπογραφή…', cErr: 'Συμπληρώστε όλα τα υποχρεωτικά πεδία και επιλέξτε και τα δύο πλαίσια.', cSignedTitle: 'Η σύμβαση υπογράφηκε', cSignedBody: 'Ευχαριστώ! Μπορείτε να κατεβάσετε την υπογεγραμμένη σύμβαση παρακάτω. Τον σύνδεσμο πληρωμής θα τον λάβετε ξεχωριστά.', cDownload: 'Άνοιγμα σύμβασης / αποθήκευση ως PDF', cOpen: 'Εμφάνιση σύμβασης', payBtn: 'Συνέχεια σε ασφαλή πληρωμή', payNow: (a) => `Τώρα: ${a} (τέλος εγκατάστασης).`, payMonthly: (a) => `Μηνιαία ${a}, ξεκινά αυτόματα μετά από 2 μήνες.`, payDone: 'Η πληρωμή σας ελήφθη. Ευχαριστώ!', payRest: 'Πληρωμή υπολοίπου', payPortal: 'Τρόπος πληρωμής και τιμολόγια', payErr: 'Η σελίδα πληρωμής δεν άνοιξε αυτή τη στιγμή. Δοκιμάστε ξανά σε λίγο.', payTestTitle: 'Δοκιμαστική πληρωμή', payTestNote: 'Αυτή είναι δοκιμαστική πληρωμή: δεν χρεώνεται κανένα ποσό και δεν χρειάζονται στοιχεία κάρτας. Η πραγματική πληρωμή θα εμφανιστεί εδώ μόλις συνδεθεί το Stripe.', payTestBtn: 'Ολοκλήρωση πληρωμής (δοκιμή)', payTestDone: 'Η δοκιμαστική πληρωμή καταγράφηκε.', projectReady: 'Η σελίδα του έργου σας είναι έτοιμη. Εκεί παρακολουθείτε το έργο βήμα βήμα, γράφετε μηνύματα και προσθέτετε αρχεία.', projectGo: 'Μετάβαση στη σελίδα του έργου', invoice: 'Τιμολόγιο', invoiceTest: 'Δοκιμαστικό τιμολόγιο (μη έγκυρο)',
    msgPh: 'Γράψτε το μήνυμά σας', send: 'Αποστολή', sending: 'Αποστολή…', sendErr: 'Η αποστολή απέτυχε, δοκιμάστε ξανά.', you: 'Εσείς', me: 'Chioutworks',
    noMessages: 'Δεν υπάρχουν μηνύματα ακόμη.', vatNote: 'Δεν χρεώνεται ΦΠΑ βάσει του καθεστώτος μικρών επιχειρήσεων (§19 γερμανικού νόμου ΦΠΑ).',
  },
};
