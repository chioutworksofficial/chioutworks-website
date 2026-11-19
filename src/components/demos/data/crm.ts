import type { Lang } from '../../../translations';

/** channel: 0 Instagram, 1 WhatsApp, 2 website · stage: -1 no deal, 0..3 pipeline stage · last: days since last contact */
export interface SeedContact { name: string; company: string; phone: string; channel: number; tags: number[]; value: number; stage: number; last: number }
/** msgs: [from ('c' customer | 'b' business), text, minutes ago] · contact: index into contacts (otherwise a new, unknown person) */
export interface SeedConv { name: string; contact?: number; channel: number; unread: boolean; msgs: [('c' | 'b'), string, number][] }
/** due: days from today (negative = overdue) */
export interface SeedTask { text: string; contact: number; due: number }

export interface CrmMarket {
  brand: { name: string; tagline: string; initials: string };
  user: { name: string; role: string };
  notifications: { text: string; time: string }[];
  responseMin: number;
  contacts: SeedContact[];
  conversations: SeedConv[];
  tasks: SeedTask[];
}

export const CRM_DATA: Record<Lang, CrmMarket> = {
  tr: {
    brand: { name: 'Yıldız Mobilya', tagline: 'Bursa', initials: 'YM' },
    user: { name: 'Orhan Yıldız', role: 'Sahibi' },
    responseMin: 14,
    notifications: [
      { text: 'Instagram’dan yeni mesaj: Ayşe Kaya', time: '3 dk önce' },
      { text: 'Elif Şahin teklifi onayladı', time: '2 saat önce' },
      { text: 'Bugün 2 takip görevi var', time: 'Bu sabah' },
    ],
    contacts: [
      { name: 'Ayşe Kaya', company: '', phone: '+90 532 555 01 21', channel: 0, tags: [3], value: 68000, stage: 2, last: 0 },
      { name: 'Mehmet Yıldırım', company: 'Uludağ Konak Otel', phone: '+90 533 555 02 34', channel: 1, tags: [2], value: 240000, stage: 1, last: 2 },
      { name: 'Zeynep Arslan', company: '', phone: '+90 535 555 03 47', channel: 0, tags: [0], value: 42000, stage: 0, last: 0 },
      { name: 'Burak Çelik', company: 'Çelik Mimarlık', phone: '+90 536 555 04 58', channel: 2, tags: [2, 3], value: 180000, stage: 2, last: 3 },
      { name: 'Elif Şahin', company: '', phone: '+90 537 555 05 69', channel: 0, tags: [1], value: 54000, stage: 3, last: 6 },
      { name: 'Hakan Öztürk', company: '', phone: '+90 538 555 06 70', channel: 1, tags: [0], value: 31000, stage: 0, last: 1 },
      { name: 'Selin Aydın', company: 'Nilüfer Kafe', phone: '+90 539 555 07 81', channel: 2, tags: [2], value: 120000, stage: 1, last: 4 },
      { name: 'Murat Koç', company: '', phone: '+90 542 555 08 92', channel: 1, tags: [1], value: 76000, stage: 3, last: 9 },
      { name: 'Derya Polat', company: '', phone: '+90 543 555 09 03', channel: 0, tags: [], value: 0, stage: -1, last: 14 },
      { name: 'Can Erdem', company: '', phone: '+90 544 555 10 14', channel: 2, tags: [1], value: 0, stage: -1, last: 21 },
    ],
    conversations: [
      { name: 'Ayşe Kaya', contact: 0, channel: 0, unread: true, msgs: [['c', 'Merhaba, paylaştığınız köşe koltuk takımı çok hoşuma gitti.', 190], ['b', 'Merhaba Ayşe Hanım, teşekkür ederiz! Kumaş seçeneklerimiz var, isterseniz örnek gönderelim.', 170], ['c', 'Fiyatı ne kadar? Kargo dahil mi?', 3]] },
      { name: 'Zeynep Arslan', contact: 2, channel: 0, unread: true, msgs: [['c', 'Yemek masası takımınız stokta var mı? Cevizi görmüştüm.', 22]] },
      { name: 'Mehmet Yıldırım', contact: 1, channel: 1, unread: false, msgs: [['c', '24 oda için yatak başlığı ve komodin ihtiyacımız var.', 2900], ['b', 'Memnuniyetle, ölçüleri ve adedi paylaşırsanız toplu fiyat çıkaralım.', 2880], ['c', 'Ölçüleri akşam gönderirim, teşekkürler.', 2870]] },
      { name: 'Hakan Öztürk', contact: 5, channel: 1, unread: true, msgs: [['b', 'Hakan Bey, sipariş edeceğiniz gardırop için renk seçtiniz mi?', 600], ['c', 'Teslimat ne zaman olur? Taşınmama 2 hafta var.', 45]] },
      { name: 'Murat Koç', contact: 7, channel: 1, unread: false, msgs: [['c', 'Aldığım sehpanın bir ayağı kırık geldi, çok üzgünüm. Ne yapabiliriz?', 1500], ['b', 'Çok özür dileriz Murat Bey, fotoğraf gönderirseniz yeni ayağı hemen gönderelim.', 1400]] },
      { name: 'Burak Çelik', contact: 3, channel: 2, unread: false, msgs: [['c', 'Web sitenizden teklif formunu doldurdum, ofis mobilyaları için dönüş bekliyorum.', 4300], ['b', 'Teklifinizi hazırladık, e-postanıza gönderdik.', 4200]] },
      { name: 'Gamze Tunç', channel: 0, unread: true, msgs: [['c', 'Selam, çocuk odası takımı için ürünleriniz var mı? Fiyat aralığı nedir?', 75]] },
      { name: 'Serkan Bal', channel: 2, unread: false, msgs: [['c', 'Showroom pazar günü açık mı? Gelip koltukları görmek istiyorum.', 1100], ['b', 'Pazar 11.00–17.00 arası açığız, bekleriz!', 1060]] },
    ],
    tasks: [
      { text: 'Köşe koltuk teklifini güncelle', contact: 0, due: -1 },
      { text: 'Otel projesi için ölçüleri iste', contact: 1, due: 0 },
      { text: 'Gardırop teslim tarihini bildir', contact: 5, due: 0 },
      { text: 'Ofis mobilyası teklifini ara', contact: 3, due: 1 },
      { text: 'Kafe sandalye numunesi gönder', contact: 6, due: 2 },
      { text: 'Memnuniyet mesajı at', contact: 4, due: 3 },
    ],
  },
  de: {
    brand: { name: 'Müller Haustechnik', tagline: 'Darmstadt', initials: 'MH' },
    user: { name: 'Thomas Müller', role: 'Inhaber' },
    responseMin: 18,
    notifications: [
      { text: 'Neue Anfrage über die Webseite: Familie Schneider', time: 'vor 5 Min.' },
      { text: 'Angebot für Hotel Rheinblick angenommen', time: 'vor 2 Std.' },
      { text: 'Heute sind 2 Rückrufe fällig', time: 'Heute früh' },
    ],
    contacts: [
      { name: 'Anja Schneider', company: '', phone: '+49 151 2345 6701', channel: 2, tags: [3], value: 9800, stage: 2, last: 0 },
      { name: 'Klaus Wagner', company: 'Hotel Rheinblick', phone: '+49 160 2345 6702', channel: 1, tags: [2], value: 24500, stage: 3, last: 5 },
      { name: 'Julia Becker', company: '', phone: '+49 171 2345 6703', channel: 0, tags: [0], value: 3200, stage: 0, last: 0 },
      { name: 'Stefan Hoffmann', company: 'Hoffmann Immobilien', phone: '+49 152 2345 6704', channel: 2, tags: [2, 3], value: 18700, stage: 1, last: 2 },
      { name: 'Petra Fischer', company: '', phone: '+49 157 2345 6705', channel: 1, tags: [1], value: 1450, stage: 3, last: 8 },
      { name: 'Markus Weber', company: '', phone: '+49 162 2345 6706', channel: 1, tags: [0], value: 4900, stage: 0, last: 1 },
      { name: 'Sabine Keller', company: 'Praxis Dr. Keller', phone: '+49 170 2345 6707', channel: 2, tags: [2], value: 7600, stage: 1, last: 4 },
      { name: 'Frank Schulz', company: '', phone: '+49 176 2345 6708', channel: 1, tags: [1], value: 2100, stage: 2, last: 3 },
      { name: 'Monika Braun', company: '', phone: '+49 151 2345 6709', channel: 0, tags: [], value: 0, stage: -1, last: 16 },
      { name: 'Jens Krüger', company: '', phone: '+49 160 2345 6710', channel: 2, tags: [1], value: 0, stage: -1, last: 30 },
    ],
    conversations: [
      { name: 'Anja Schneider', contact: 0, channel: 2, unread: true, msgs: [['c', 'Guten Tag, wir möchten unsere alte Gasheizung gegen eine Wärmepumpe tauschen.', 240], ['b', 'Guten Tag Frau Schneider, gern. Ein Vor-Ort-Termin dauert ca. 45 Minuten.', 200], ['c', 'Was würde der Austausch ungefähr kosten?', 5]] },
      { name: 'Julia Becker', contact: 2, channel: 0, unread: true, msgs: [['c', 'Hallo, haben Sie diese Woche noch einen Termin für einen Badumbau-Besichtigung frei?', 28]] },
      { name: 'Stefan Hoffmann', contact: 3, channel: 1, unread: false, msgs: [['c', 'Wir brauchen ein Angebot für 6 Wohneinheiten, Sanitär komplett.', 3000], ['b', 'Sehr gern, schicken Sie mir bitte die Grundrisse.', 2950], ['c', 'Grundrisse kommen morgen per E-Mail.', 2900]] },
      { name: 'Markus Weber', contact: 5, channel: 1, unread: true, msgs: [['b', 'Herr Weber, hier ist Ihr Angebot für den Heizungstausch.', 800], ['c', 'Danke! Wann könnten Sie mit der Montage beginnen? Verfügbarkeit im Herbst?', 50]] },
      { name: 'Petra Fischer', contact: 4, channel: 1, unread: false, msgs: [['c', 'Der Wasserhahn in der Küche tropft nach der Reparatur schon wieder. Das ist ärgerlich.', 1700], ['b', 'Das tut mir leid, Frau Fischer. Unser Monteur kommt morgen kostenlos vorbei.', 1650]] },
      { name: 'Sabine Keller', contact: 6, channel: 2, unread: false, msgs: [['c', 'Wir möchten für unsere Praxis die Warmwasseranlage erneuern.', 4500], ['b', 'Vielen Dank, ich erstelle Ihnen ein Angebot bis Freitag.', 4400]] },
      { name: 'Dirk Neumann', channel: 0, unread: true, msgs: [['c', 'Hi, was kostet eine Rohrreinigung bei Ihnen? Brauche das bald.', 95]] },
      { name: 'Birgit Hahn', channel: 2, unread: false, msgs: [['c', 'Bieten Sie Wartungsverträge für Heizungen an?', 1300], ['b', 'Ja, ab 149 € im Jahr inkl. MwSt. Ich sende Ihnen die Details.', 1250]] },
    ],
    tasks: [
      { text: 'Angebot Wärmepumpe nachfassen', contact: 0, due: -1 },
      { text: 'Rückruf wegen Badumbau-Termin', contact: 2, due: 0 },
      { text: 'Montagetermin im Herbst bestätigen', contact: 5, due: 0 },
      { text: 'Grundrisse prüfen, Sanitär-Angebot erstellen', contact: 3, due: 1 },
      { text: 'Angebot Warmwasseranlage senden', contact: 6, due: 2 },
      { text: 'Zufriedenheit nach Reparatur erfragen', contact: 4, due: 3 },
    ],
  },
  el: {
    brand: { name: 'Έπιπλα Παπαδόπουλος', tagline: 'Λάρισα', initials: 'ΕΠ' },
    user: { name: 'Νίκος Παπαδόπουλος', role: 'Ιδιοκτήτης' },
    responseMin: 16,
    notifications: [
      { text: 'Νέο μήνυμα στο Instagram: Μαρία Κωνσταντίνου', time: 'πριν από 4 λεπτά' },
      { text: 'Η Ελένη Γεωργίου αποδέχθηκε την προσφορά', time: 'πριν από 2 ώρες' },
      { text: 'Έχετε 2 εργασίες παρακολούθησης για σήμερα', time: 'Σήμερα το πρωί' },
    ],
    contacts: [
      { name: 'Μαρία Κωνσταντίνου', company: '', phone: '+30 690 555 0121', channel: 0, tags: [3], value: 2800, stage: 2, last: 0 },
      { name: 'Γιάννης Αθανασίου', company: 'Ξενοδοχείο Πηνειός', phone: '+30 694 555 0134', channel: 1, tags: [2], value: 9400, stage: 1, last: 2 },
      { name: 'Κατερίνα Δημητρίου', company: '', phone: '+30 697 555 0147', channel: 0, tags: [0], value: 1500, stage: 0, last: 0 },
      { name: 'Στέλιος Παππάς', company: 'Παππάς Αρχιτέκτονες', phone: '+30 698 555 0158', channel: 2, tags: [2, 3], value: 6900, stage: 2, last: 3 },
      { name: 'Ελένη Γεωργίου', company: '', phone: '+30 693 555 0169', channel: 0, tags: [1], value: 2100, stage: 3, last: 6 },
      { name: 'Χρήστος Λάμπρου', company: '', phone: '+30 695 555 0170', channel: 1, tags: [0], value: 1200, stage: 0, last: 1 },
      { name: 'Σοφία Νικολάου', company: 'Καφέ Θεσσαλία', phone: '+30 699 555 0181', channel: 2, tags: [2], value: 4600, stage: 1, last: 4 },
      { name: 'Δημήτρης Βλάχος', company: '', phone: '+30 691 555 0192', channel: 1, tags: [1], value: 2900, stage: 3, last: 9 },
      { name: 'Αναστασία Μαυρίδου', company: '', phone: '+30 692 555 0103', channel: 0, tags: [], value: 0, stage: -1, last: 14 },
      { name: 'Παναγιώτης Σαρρής', company: '', phone: '+30 697 555 0114', channel: 2, tags: [1], value: 0, stage: -1, last: 21 },
    ],
    conversations: [
      { name: 'Μαρία Κωνσταντίνου', contact: 0, channel: 0, unread: true, msgs: [['c', 'Καλησπέρα, μου άρεσε πολύ ο γωνιακός καναπές που ανεβάσατε.', 200], ['b', 'Καλησπέρα κυρία Μαρία, ευχαριστούμε! Έχουμε πολλά υφάσματα, να σας στείλουμε δείγματα;', 180], ['c', 'Πόσο κοστίζει; Περιλαμβάνεται η μεταφορά;', 4]] },
      { name: 'Κατερίνα Δημητρίου', contact: 2, channel: 0, unread: true, msgs: [['c', 'Το τραπεζάρι με τις καρέκλες το έχετε διαθέσιμο σε καρυδιά;', 25]] },
      { name: 'Γιάννης Αθανασίου', contact: 1, channel: 1, unread: false, msgs: [['c', 'Χρειαζόμαστε κεφαλάρια και κομοδίνα για 20 δωμάτια.', 2800], ['b', 'Με χαρά, στείλτε μας διαστάσεις και ποσότητα για προσφορά.', 2780], ['c', 'Θα τα στείλω το βράδυ, ευχαριστώ.', 2770]] },
      { name: 'Χρήστος Λάμπρου', contact: 5, channel: 1, unread: true, msgs: [['b', 'Κύριε Χρήστο, επιλέξατε χρώμα για τη ντουλάπα;', 650], ['c', 'Πότε θα γίνει η παράδοση; Μετακομίζω σε δύο εβδομάδες.', 40]] },
      { name: 'Δημήτρης Βλάχος', contact: 7, channel: 1, unread: false, msgs: [['c', 'Το τραπεζάκι που πήρα ήρθε με σπασμένο πόδι. Έχω πρόβλημα με την παραγγελία.', 1600], ['b', 'Ζητούμε συγγνώμη, στείλτε μια φωτογραφία και θα στείλουμε αμέσως νέο πόδι.', 1500]] },
      { name: 'Στέλιος Παππάς', contact: 3, channel: 2, unread: false, msgs: [['c', 'Συμπλήρωσα τη φόρμα προσφοράς για έπιπλα γραφείου, περιμένω απάντηση.', 4200], ['b', 'Η προσφορά είναι έτοιμη και στάλθηκε στο email σας.', 4100]] },
      { name: 'Βασιλική Τσιάμη', channel: 0, unread: true, msgs: [['c', 'Γεια σας, έχετε παιδικά δωμάτια; Ποια είναι η τιμή;', 80]] },
      { name: 'Θοδωρής Ρήγας', channel: 2, unread: false, msgs: [['c', 'Είναι ανοιχτό το εκθεσιακό σας Σάββατο; Θέλω να δω τους καναπέδες.', 1200], ['b', 'Ναι, Σάββατο 10:00–15:00. Σας περιμένουμε!', 1150]] },
    ],
    tasks: [
      { text: 'Ενημέρωση προσφοράς για γωνιακό καναπέ', contact: 0, due: -1 },
      { text: 'Αίτημα διαστάσεων για το ξενοδοχείο', contact: 1, due: 0 },
      { text: 'Ενημέρωση για την ημερομηνία παράδοσης ντουλάπας', contact: 5, due: 0 },
      { text: 'Τηλεφώνημα για την προσφορά γραφείου', contact: 3, due: 1 },
      { text: 'Αποστολή δείγματος καρέκλας για το καφέ', contact: 6, due: 2 },
      { text: 'Μήνυμα ικανοποίησης μετά την παράδοση', contact: 4, due: 3 },
    ],
  },
  en: {
    brand: { name: 'Harper Interiors', tagline: 'Bristol', initials: 'HI' },
    user: { name: 'Claire Harper', role: 'Owner' },
    responseMin: 12,
    notifications: [
      { text: 'New Instagram message from Amy Foster', time: '4 min ago' },
      { text: 'Emma Clarke accepted your quote', time: '2 hours ago' },
      { text: '2 follow-up tasks are due today', time: 'This morning' },
    ],
    contacts: [
      { name: 'Amy Foster', company: '', phone: '+44 7700 900121', channel: 0, tags: [3], value: 2400, stage: 2, last: 0 },
      { name: 'James Whitfield', company: 'The Clifton Arms', phone: '+44 7700 900134', channel: 1, tags: [2], value: 8800, stage: 1, last: 2 },
      { name: 'Priya Shah', company: '', phone: '+44 7700 900147', channel: 0, tags: [0], value: 1300, stage: 0, last: 0 },
      { name: 'Oliver Grant', company: 'Grant & Co Architects', phone: '+44 7700 900158', channel: 2, tags: [2, 3], value: 6200, stage: 2, last: 3 },
      { name: 'Emma Clarke', company: '', phone: '+44 7700 900169', channel: 0, tags: [1], value: 1900, stage: 3, last: 6 },
      { name: 'Tom Bailey', company: '', phone: '+44 7700 900170', channel: 1, tags: [0], value: 1100, stage: 0, last: 1 },
      { name: 'Hannah Reid', company: 'The Rope Walk Café', phone: '+44 7700 900181', channel: 2, tags: [2], value: 4200, stage: 1, last: 4 },
      { name: 'Daniel Moore', company: '', phone: '+44 7700 900192', channel: 1, tags: [1], value: 2600, stage: 3, last: 9 },
      { name: 'Sophie Turner', company: '', phone: '+44 7700 900103', channel: 0, tags: [], value: 0, stage: -1, last: 14 },
      { name: 'Ben Hughes', company: '', phone: '+44 7700 900114', channel: 2, tags: [1], value: 0, stage: -1, last: 21 },
    ],
    conversations: [
      { name: 'Amy Foster', contact: 0, channel: 0, unread: true, msgs: [['c', 'Hi! I love the corner sofa you posted last week.', 210], ['b', 'Hi Amy, thank you! We have lots of fabric options, shall we post you some swatches?', 190], ['c', 'Yes please! How much is it, and is delivery included?', 4]] },
      { name: 'Priya Shah', contact: 2, channel: 0, unread: true, msgs: [['c', 'Is the walnut dining table still in stock? Saw it on your stories.', 26]] },
      { name: 'James Whitfield', contact: 1, channel: 1, unread: false, msgs: [['c', 'We need headboards and bedside tables for 20 rooms.', 2900], ['b', 'Happy to help, send over the sizes and quantities and we will price it up.', 2880], ['c', 'Will do tonight, thanks.', 2870]] },
      { name: 'Tom Bailey', contact: 5, channel: 1, unread: true, msgs: [['b', 'Hi Tom, have you chosen a colour for the wardrobe?', 700], ['c', 'Yes, oak. When will it be delivered? I move in two weeks.', 38]] },
      { name: 'Daniel Moore', contact: 7, channel: 1, unread: false, msgs: [['c', 'The coffee table arrived with a broken leg. I am really disappointed, what can we do?', 1700], ['b', 'So sorry Daniel. Send a photo and we will dispatch a replacement leg straight away.', 1600]] },
      { name: 'Oliver Grant', contact: 3, channel: 2, unread: false, msgs: [['c', 'I filled in your quote form for office furniture and am waiting to hear back.', 4300], ['b', 'Your quote is ready, we have emailed it to you.', 4200]] },
      { name: 'Lucy Marsh', channel: 0, unread: true, msgs: [['c', 'Hello, do you do children’s bedroom sets? What are the prices like?', 85]] },
      { name: 'Rob Ellis', channel: 2, unread: false, msgs: [['c', 'Is the showroom open on Sunday? Would like to see the sofas.', 1250], ['b', 'Yes, 11am to 4pm on Sundays. See you then!', 1200]] },
    ],
    tasks: [
      { text: 'Update corner sofa quote', contact: 0, due: -1 },
      { text: 'Request room sizes for the hotel order', contact: 1, due: 0 },
      { text: 'Confirm wardrobe delivery date', contact: 5, due: 0 },
      { text: 'Call about the office furniture quote', contact: 3, due: 1 },
      { text: 'Send chair sample to the café', contact: 6, due: 2 },
      { text: 'Send a satisfaction message after delivery', contact: 4, due: 3 },
    ],
  },
};
