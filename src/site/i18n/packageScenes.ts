import type { Lang } from '../../translations';

// Texts for the CRM, website, invoices and QR package scenes (owner, 2026-11-19). Names, places, number formats and
// words follow the visitor's language; companies, phone numbers and prices are fictional sample data.
export interface SceneTexts {
  crm: { board: string; cols: [string, string, string]; others: [string, string][]; who: string; job: string; ask: string; newLead: string;
    detail: [string, string][]; reminder: string; remTime: string; won: string; stat: string };
  web: { query: string; search: string; results: [string, string][]; site: string; load: string; hero: string; cta: string;
    services: [string, string][]; where: string; formTitle: string; name: string; msg: string; send: string; sent: string; inbox: string; who: string };
  inv: { pick: string; customer: string; service: string; offer: string; invoice: string; lines: [string, string][]; total: string; totalVal: string; tax: string;
    sent: string; paid: string; mailTo: string; payments: string; open: string; paidLbl: string; date: string };
  qr: { table: string; scan: string; cafe: string; tabs: [string, string, string]; items: [string, string, string?][]; soldOut: string; fresh: string;
    cart: string; order: string; ordered: string; bar: string; ticket: string };
}

export const PKG_SCENES: Record<Lang, SceneTexts> = {
  tr: {
    crm: { board: 'Müşteriler', cols: ['Yeni', 'Teklif', 'Kazanıldı'], others: [['Elif D.', 'Mutfak'], ['Can T.', 'Banyo'], ['Seda K.', 'Boya']], who: 'Mehmet Yıldız', job: 'Tadilat', ask: '“Teklif alabilir miyim?”', newLead: 'Yeni talep',
      detail: [['Telefon', '0532 000 12 34'], ['Kaynak', 'Web formu'], ['Not', 'Salon ve koridor, 40 m²']], reminder: 'Mehmet’e teklif gönder', remTime: 'Bugün 10:00', won: 'Kazanıldı', stat: 'Bu ay kazanılan: 4' },
    web: { query: 'kuaför kadıköy', search: 'Ara', results: [['Salon Lale · Kuaför', 'Kadıköy · Online randevu · 4,8 ★'], ['Başka bir salon', 'Kadıköy · Hizmetler'], ['Haritada kuaförler', '12 sonuç']], site: 'Salon Lale',
      load: '0,9 sn', hero: 'Kadıköy’de saç ve bakım', cta: 'Randevu al', services: [['Kesim', '350 ₺'], ['Fön', '250 ₺'], ['Boya', '900 ₺’den']], where: 'Moda Cad. 12 · Kadıköy',
      formTitle: 'Bize yazın', name: 'Ayşe', msg: 'Randevu almak istiyorum', send: 'Gönder', sent: 'Mesajınız iletildi ✓', inbox: 'Yeni mesaj', who: 'Ayşe' },
    inv: { pick: 'Yeni belge', customer: 'Kaya Ltd', service: 'Bakım hizmeti', offer: 'Teklif #024', invoice: 'Fatura #2026-024', lines: [['Bakım hizmeti', '1.000 €'], ['Malzeme', '250 €']], total: 'Toplam', totalVal: '1.250 €', tax: 'KDV dahil',
      sent: 'GÖNDERİLDİ', paid: 'ÖDENDİ', mailTo: 'muhasebe@kaya-ornek.com adresine gönderildi', payments: 'Ödemeler', open: 'Açık', paidLbl: 'Ödendi', date: '19.11.2026' },
    qr: { table: 'Masa 5', scan: 'Kodu okutun', cafe: 'Kafe Moda', tabs: ['Kahvaltı', 'Tatlılar', 'İçecekler'], items: [['Latte', '85 ₺'], ['Cheesecake', '140 ₺', 'fresh'], ['Brownie', '120 ₺', 'out']], soldOut: 'Bugün bitti', fresh: 'Yeni fiyat',
      cart: 'Sepet', order: 'Siparişi ver', ordered: 'Siparişiniz alındı ✓', bar: 'Bar ekranı', ticket: '2 × Latte' },
  },
  en: {
    crm: { board: 'Customers', cols: ['New', 'Quote', 'Won'], others: [['Lucy B.', 'Kitchen'], ['Tom H.', 'Bathroom'], ['Sara P.', 'Painting']], who: 'James Wilson', job: 'Renovation', ask: '“Could I get a quote?”', newLead: 'New lead',
      detail: [['Phone', '07700 900456'], ['Source', 'Website form'], ['Note', 'Living room and hall, 40 m²']], reminder: 'Send James the quote', remTime: 'Today 10:00', won: 'Won', stat: 'Won this month: 4' },
    web: { query: 'hairdresser camden', search: 'Search', results: [['Salon Lily · Hairdresser', 'Camden · Online booking · 4.8 ★'], ['Another salon', 'Camden · Services'], ['Hairdressers on the map', '12 results']], site: 'Salon Lily',
      load: '0.9 s', hero: 'Hair and care in Camden', cta: 'Book now', services: [['Cut', '£35'], ['Blow-dry', '£25'], ['Colour', 'from £80']], where: '12 High St · Camden',
      formTitle: 'Write to us', name: 'Emma', msg: 'I would like to book an appointment', send: 'Send', sent: 'Message sent ✓', inbox: 'New message', who: 'Emma' },
    inv: { pick: 'New document', customer: 'Hughes Ltd', service: 'Maintenance service', offer: 'Quote #024', invoice: 'Invoice #2026-024', lines: [['Maintenance service', '€1,000'], ['Materials', '€250']], total: 'Total', totalVal: '€1,250', tax: 'incl. VAT',
      sent: 'SENT', paid: 'PAID', mailTo: 'Sent to accounts@hughes-example.com', payments: 'Payments', open: 'Open', paidLbl: 'Paid', date: '19/11/2026' },
    qr: { table: 'Table 5', scan: 'Scan the code', cafe: 'Café Lily', tabs: ['Breakfast', 'Desserts', 'Drinks'], items: [['Latte', '£3.80'], ['Cheesecake', '£5.50', 'fresh'], ['Brownie', '£4.20', 'out']], soldOut: 'Sold out today', fresh: 'New price',
      cart: 'Cart', order: 'Place order', ordered: 'Order received ✓', bar: 'Bar screen', ticket: '2 × Latte' },
  },
  de: {
    crm: { board: 'Kunden', cols: ['Neu', 'Angebot', 'Gewonnen'], others: [['Lena B.', 'Küche'], ['Jonas H.', 'Bad'], ['Sophie K.', 'Malerarbeiten']], who: 'Thomas Weber', job: 'Renovierung', ask: '„Kann ich ein Angebot bekommen?“', newLead: 'Neue Anfrage',
      detail: [['Telefon', '0151 2345 1234'], ['Quelle', 'Website-Formular'], ['Notiz', 'Wohnzimmer und Flur, 40 m²']], reminder: 'Thomas das Angebot senden', remTime: 'Heute 10:00', won: 'Gewonnen', stat: 'Diesen Monat gewonnen: 4' },
    web: { query: 'friseur sachsenhausen', search: 'Suchen', results: [['Salon Lilie · Friseur', 'Sachsenhausen · Online-Termin · 4,8 ★'], ['Ein anderer Salon', 'Sachsenhausen · Leistungen'], ['Friseure auf der Karte', '12 Ergebnisse']], site: 'Salon Lilie',
      load: '0,9 s', hero: 'Haare und Pflege in Sachsenhausen', cta: 'Termin buchen', services: [['Schnitt', '35 €'], ['Föhnen', '25 €'], ['Färben', 'ab 80 €']], where: 'Schweizer Str. 12 · Frankfurt',
      formTitle: 'Schreiben Sie uns', name: 'Anna', msg: 'Ich möchte einen Termin vereinbaren', send: 'Senden', sent: 'Nachricht gesendet ✓', inbox: 'Neue Nachricht', who: 'Anna' },
    inv: { pick: 'Neues Dokument', customer: 'Becker GmbH', service: 'Wartung', offer: 'Angebot #024', invoice: 'Rechnung #2026-024', lines: [['Wartung', '1.000 €'], ['Material', '250 €']], total: 'Gesamt', totalVal: '1.250 €', tax: 'inkl. MwSt.',
      sent: 'GESENDET', paid: 'BEZAHLT', mailTo: 'An buchhaltung@becker-beispiel.de gesendet', payments: 'Zahlungen', open: 'Offen', paidLbl: 'Bezahlt', date: '19.11.2026' },
    qr: { table: 'Tisch 5', scan: 'Code scannen', cafe: 'Café Lilie', tabs: ['Frühstück', 'Kuchen', 'Getränke'], items: [['Latte', '3,80 €'], ['Käsekuchen', '4,90 €', 'fresh'], ['Brownie', '3,90 €', 'out']], soldOut: 'Heute ausverkauft', fresh: 'Neuer Preis',
      cart: 'Warenkorb', order: 'Bestellen', ordered: 'Bestellung erhalten ✓', bar: 'Bar-Bildschirm', ticket: '2 × Latte' },
  },
  el: {
    crm: { board: 'Πελάτες', cols: ['Νέο', 'Προσφορά', 'Κερδήθηκε'], others: [['Ελένη Δ.', 'Κουζίνα'], ['Νίκος Τ.', 'Μπάνιο'], ['Σοφία Κ.', 'Βάψιμο']], who: 'Γιώργος Παπαδάκης', job: 'Ανακαίνιση', ask: '«Μπορώ να πάρω προσφορά;»', newLead: 'Νέο αίτημα',
      detail: [['Τηλέφωνο', '691 234 0012'], ['Πηγή', 'Φόρμα ιστοσελίδας'], ['Σημείωση', 'Σαλόνι και διάδρομος, 40 m²']], reminder: 'Αποστολή προσφοράς στον Γιώργο', remTime: 'Σήμερα 10:00', won: 'Κερδήθηκε', stat: 'Κερδήθηκαν αυτόν τον μήνα: 4' },
    web: { query: 'κομμωτήριο κηφισιά', search: 'Αναζήτηση', results: [['Salon Κρίνος · Κομμωτήριο', 'Κηφισιά · Online ραντεβού · 4,8 ★'], ['Άλλο κομμωτήριο', 'Κηφισιά · Υπηρεσίες'], ['Κομμωτήρια στον χάρτη', '12 αποτελέσματα']], site: 'Salon Κρίνος',
      load: '0,9 δευτ.', hero: 'Μαλλιά και περιποίηση στην Κηφισιά', cta: 'Κλείστε ραντεβού', services: [['Κούρεμα', '20 €'], ['Χτένισμα', '15 €'], ['Βαφή', 'από 45 €']], where: 'Κασσαβέτη 12 · Κηφισιά',
      formTitle: 'Γράψτε μας', name: 'Μαρία', msg: 'Θα ήθελα να κλείσω ραντεβού', send: 'Αποστολή', sent: 'Το μήνυμα στάλθηκε ✓', inbox: 'Νέο μήνυμα', who: 'Μαρία' },
    inv: { pick: 'Νέο έγγραφο', customer: 'Παπαδάκης Α.Ε.', service: 'Υπηρεσία συντήρησης', offer: 'Προσφορά #024', invoice: 'Τιμολόγιο #2026-024', lines: [['Υπηρεσία συντήρησης', '1.000 €'], ['Υλικά', '250 €']], total: 'Σύνολο', totalVal: '1.250 €', tax: 'με ΦΠΑ',
      sent: 'ΣΤΑΛΘΗΚΕ', paid: 'ΕΞΟΦΛΗΘΗΚΕ', mailTo: 'Στάλθηκε στο logistirio@papadakis-paradeigma.gr', payments: 'Πληρωμές', open: 'Ανοιχτό', paidLbl: 'Εξοφλήθηκε', date: '19/11/2026' },
    qr: { table: 'Τραπέζι 5', scan: 'Σκανάρετε τον κωδικό', cafe: 'Καφέ Κρίνος', tabs: ['Πρωινό', 'Γλυκά', 'Ροφήματα'], items: [['Latte', '3,50 €'], ['Cheesecake', '4,80 €', 'fresh'], ['Brownie', '3,80 €', 'out']], soldOut: 'Εξαντλήθηκε σήμερα', fresh: 'Νέα τιμή',
      cart: 'Καλάθι', order: 'Παραγγελία', ordered: 'Η παραγγελία ελήφθη ✓', bar: 'Οθόνη μπαρ', ticket: '2 × Latte' },
  },
};
