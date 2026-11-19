import type { Lang } from '../../../translations';

export interface SeedCustomer { name: string; district: string; address: string; phone: string; ctype: number; freq: number; base: number }
/** c = customer index, d = day offset from today, done jobs are the ones in the past */
export interface SeedJob { c: number; d: number; time: string; type: number; team: number; price: number }
/** job = index into jobs (net comes from the job); otherwise historic invoice with own net */
export interface SeedInvoice { c: number; d: number; paid: boolean; job?: number; net?: number }

export interface TemizlikMarket {
  brand: { name: string; tagline: string; initials: string };
  user: { name: string; role: string };
  members: string[][];
  vat: number;
  prefix: string;
  cap: number; // weekly capacity per team in hours
  customers: SeedCustomer[];
  jobs: SeedJob[];
  invoices: SeedInvoice[];
  months: number[]; // revenue of the 5 previous months + base for current month
  typeBase: number[];
  notifications: { text: string; time: string }[];
}

export const TEMIZLIK_DATA: Record<Lang, TemizlikMarket> = {
  tr: {
    brand: { name: 'Pırıl Temizlik', tagline: 'Ataşehir, İstanbul', initials: 'PT' },
    user: { name: 'Gülsüm Aydın', role: 'İşletme sahibi' },
    members: [['Hatice K.', 'Meral Y.'], ['Songül A.', 'Dilek T.', 'Burcu E.'], ['Nuray S.', 'Fatma Ç.']],
    vat: 0.2, prefix: 'FTR', cap: 24,
    customers: [
      { name: 'Yılmaz Ailesi', district: 'Ataşehir', address: 'Barbaros Mah. Halk Cd. 14/6', phone: '+90 532 418 27 63', ctype: 0, freq: 1, base: 21500 },
      { name: 'Kaya Mimarlık Ofisi', district: 'Kadıköy', address: 'Caferağa Mah. Moda Cd. 52 Kat 3', phone: '+90 216 336 41 18', ctype: 1, freq: 1, base: 48200 },
      { name: 'Aksoy Apartmanı', district: 'Ataşehir', address: 'Küçükbakkalköy Mah. Kayışdağı Cd. 8', phone: '+90 533 702 15 94', ctype: 2, freq: 3, base: 31800 },
      { name: 'Demir Ailesi', district: 'Beşiktaş', address: 'Etiler Mah. Nispetiye Cd. 91/12', phone: '+90 542 365 80 21', ctype: 0, freq: 0, base: 4500 },
      { name: 'Arslan Hukuk Bürosu', district: 'Şişli', address: 'Mecidiyeköy Mah. Büyükdere Cd. 120 Kat 7', phone: '+90 212 274 63 05', ctype: 1, freq: 2, base: 36400 },
      { name: 'Çelik Sitesi Yönetimi', district: 'Maltepe', address: 'Cevizli Mah. Tugay Yolu Cd. 33', phone: '+90 505 918 44 70', ctype: 2, freq: 3, base: 27900 },
      { name: 'Elif Şahin', district: 'Üsküdar', address: 'Acıbadem Mah. Çeçen Sk. 7/4', phone: '+90 555 247 36 82', ctype: 0, freq: 2, base: 12600 },
      { name: 'Öztürk Diş Kliniği', district: 'Kadıköy', address: 'Fenerbahçe Mah. Bağdat Cd. 301', phone: '+90 216 414 90 27', ctype: 1, freq: 1, base: 52300 },
    ],
    jobs: [
      { c: 3, d: -20, time: '09:00', type: 1, team: 0, price: 3600 },
      { c: 1, d: -12, time: '18:00', type: 0, team: 1, price: 5200 },
      { c: 7, d: -4, time: '19:00', type: 0, team: 1, price: 4800 },
      { c: 6, d: -2, time: '10:00', type: 1, team: 0, price: 3400 },
      { c: 0, d: 0, time: '09:30', type: 0, team: 0, price: 2500 },
      { c: 4, d: 0, time: '18:30', type: 0, team: 1, price: 4400 },
      { c: 2, d: 1, time: '10:00', type: 2, team: 2, price: 6800 },
      { c: 5, d: 2, time: '11:00', type: 1, team: 2, price: 5900 },
      { c: 1, d: 2, time: '18:00', type: 0, team: 1, price: 5200 },
      { c: 6, d: 3, time: '14:00', type: 0, team: 0, price: 2300 },
      { c: 7, d: 4, time: '19:00', type: 0, team: 1, price: 4800 },
      { c: 0, d: 6, time: '09:30', type: 0, team: 0, price: 2500 },
    ],
    invoices: [
      { c: 3, d: -20, paid: false, job: 0 }, { c: 1, d: -12, paid: true, job: 1 }, { c: 7, d: -4, paid: false, job: 2 },
      { c: 4, d: -32, paid: true, net: 4400 }, { c: 5, d: -27, paid: true, net: 5900 },
    ],
    months: [41200, 46800, 44300, 52900, 49500, 18600],
    typeBase: [64, 21, 9],
    notifications: [
      { text: 'Kaya Mimarlık Ofisi haftalık temizliği onayladı', time: '12 dk önce' },
      { text: 'Fatura gecikti: Demir Ailesi', time: '2 sa önce' },
      { text: 'Yeni rezervasyon: Çelik Sitesi Yönetimi', time: 'Dün' },
      { text: 'B Ekibi bugünkü işi tamamladı', time: 'Dün' },
    ],
  },
  de: {
    brand: { name: 'Glanzwerk Reinigung', tagline: 'Frankfurt am Main', initials: 'GR' },
    user: { name: 'Petra Hoffmann', role: 'Inhaberin' },
    members: [['Anja M.', 'Sabine K.'], ['Ewa N.', 'Marta L.', 'Jana R.'], ['Olga P.', 'Silke B.']],
    vat: 0.19, prefix: 'RE', cap: 24,
    customers: [
      { name: 'Familie Weber', district: 'Bornheim', address: 'Berger Straße 112', phone: '+49 151 2348 7761', ctype: 0, freq: 1, base: 1840 },
      { name: 'Kanzlei Becker & Partner', district: 'Westend', address: 'Feuerbachstraße 26', phone: '+49 69 7410 2285', ctype: 1, freq: 1, base: 4260 },
      { name: 'Hausverwaltung Schneider', district: 'Sachsenhausen', address: 'Schweizer Straße 41', phone: '+49 160 9154 3302', ctype: 2, freq: 3, base: 3120 },
      { name: 'Familie Yildiz', district: 'Offenbach', address: 'Kaiserstraße 77', phone: '+49 176 3318 6045', ctype: 0, freq: 0, base: 330 },
      { name: 'Praxis Dr. Schulz', district: 'Nordend', address: 'Eschersheimer Landstraße 59', phone: '+49 69 5597 8130', ctype: 1, freq: 1, base: 5380 },
      { name: 'WEG Mainblick', district: 'Höchst', address: 'Bolongarostraße 14', phone: '+49 170 4426 9917', ctype: 2, freq: 3, base: 2740 },
      { name: 'Lena Krüger', district: 'Bockenheim', address: 'Leipziger Straße 33', phone: '+49 157 8830 2146', ctype: 0, freq: 2, base: 1260 },
      { name: 'Steuerbüro Vogel', district: 'Wiesbaden', address: 'Wilhelmstraße 18', phone: '+49 611 3374 05', ctype: 1, freq: 2, base: 2980 },
    ],
    jobs: [
      { c: 3, d: -20, time: '09:00', type: 1, team: 0, price: 260 },
      { c: 1, d: -12, time: '18:00', type: 0, team: 1, price: 380 },
      { c: 4, d: -4, time: '19:00', type: 0, team: 1, price: 340 },
      { c: 6, d: -2, time: '10:00', type: 1, team: 0, price: 240 },
      { c: 0, d: 0, time: '09:30', type: 0, team: 0, price: 180 },
      { c: 7, d: 0, time: '18:30', type: 0, team: 1, price: 290 },
      { c: 2, d: 1, time: '10:00', type: 2, team: 2, price: 520 },
      { c: 5, d: 2, time: '11:00', type: 1, team: 2, price: 410 },
      { c: 1, d: 2, time: '18:00', type: 0, team: 1, price: 380 },
      { c: 6, d: 3, time: '14:00', type: 0, team: 0, price: 160 },
      { c: 4, d: 4, time: '19:00', type: 0, team: 1, price: 340 },
      { c: 0, d: 6, time: '09:30', type: 0, team: 0, price: 180 },
    ],
    invoices: [
      { c: 3, d: -20, paid: false, job: 0 }, { c: 1, d: -12, paid: true, job: 1 }, { c: 4, d: -4, paid: false, job: 2 },
      { c: 2, d: -33, paid: true, net: 520 }, { c: 5, d: -26, paid: true, net: 410 },
    ],
    months: [3180, 3620, 3410, 4090, 3870, 1450],
    typeBase: [58, 19, 8],
    notifications: [
      { text: 'Kanzlei Becker & Partner hat den Wochenturnus bestätigt', time: 'vor 12 Min.' },
      { text: 'Rechnung überfällig: Familie Yildiz', time: 'vor 2 Std.' },
      { text: 'Neue Buchung: WEG Mainblick', time: 'Gestern' },
      { text: 'Team B hat den Auftrag in Westend abgeschlossen', time: 'Gestern' },
    ],
  },
  el: {
    brand: { name: 'Λάμψη Καθαρισμοί', tagline: 'Γλυφάδα, Αθήνα', initials: 'ΛΚ' },
    user: { name: 'Ελένη Παπαδοπούλου', role: 'Ιδιοκτήτρια' },
    members: [['Μαρία Κ.', 'Σοφία Λ.'], ['Ελίνα Ν.', 'Όλγα Μ.', 'Ντίνα Π.'], ['Βάσω Τ.', 'Κατερίνα Σ.']],
    vat: 0.24, prefix: 'ΤΙΜ', cap: 24,
    customers: [
      { name: 'Οικογένεια Παπαδάκη', district: 'Γλυφάδα', address: 'Λεωφ. Αγγελάκη 38', phone: '+30 694 218 4573', ctype: 0, freq: 1, base: 1380 },
      { name: 'Λογιστικό Γραφείο Αντωνίου', district: 'Βούλα', address: 'Πλ. Κρυστάλλη 4, 2ος όροφος', phone: '+30 210 895 2216', ctype: 1, freq: 1, base: 3240 },
      { name: 'Πολυκατοικία Κηφισιάς', district: 'Κηφισιά', address: 'Κεφαλληνίας 22', phone: '+30 697 330 5128', ctype: 2, freq: 3, base: 2260 },
      { name: 'Οικογένεια Ιωάννου', district: 'Ηλιούπολη', address: 'Ηρώων Πολυτεχνείου 61', phone: '+30 693 774 2095', ctype: 0, freq: 0, base: 260 },
      { name: 'Οδοντιατρείο Καραγιάννη', district: 'Βάρκιζα', address: 'Λεωφ. Βάρκιζας 140', phone: '+30 210 965 7731', ctype: 1, freq: 1, base: 4120 },
      { name: 'Διαχείριση Πολυκατοικιών Νίκου', district: 'Άλιμος', address: 'Λεωφ. Αλίμου 77', phone: '+30 698 410 6683', ctype: 2, freq: 3, base: 2090 },
      { name: 'Ιωάννα Δημητρίου', district: 'Γλυφάδα', address: 'Μεταξά 15', phone: '+30 690 552 1847', ctype: 0, freq: 2, base: 980 },
      { name: 'Δικηγορικό Γραφείο Στεφανίδη', district: 'Κηφισιά', address: 'Κολοκοτρώνη 31', phone: '+30 210 801 4469', ctype: 1, freq: 2, base: 2350 },
    ],
    jobs: [
      { c: 3, d: -20, time: '09:00', type: 1, team: 0, price: 190 },
      { c: 1, d: -12, time: '18:00', type: 0, team: 1, price: 280 },
      { c: 4, d: -4, time: '19:00', type: 0, team: 1, price: 250 },
      { c: 6, d: -2, time: '10:00', type: 1, team: 0, price: 170 },
      { c: 0, d: 0, time: '09:30', type: 0, team: 0, price: 120 },
      { c: 7, d: 0, time: '18:30', type: 0, team: 1, price: 210 },
      { c: 2, d: 1, time: '10:00', type: 2, team: 2, price: 380 },
      { c: 5, d: 2, time: '11:00', type: 1, team: 2, price: 300 },
      { c: 1, d: 2, time: '18:00', type: 0, team: 1, price: 280 },
      { c: 6, d: 3, time: '14:00', type: 0, team: 0, price: 110 },
      { c: 4, d: 4, time: '19:00', type: 0, team: 1, price: 250 },
      { c: 0, d: 6, time: '09:30', type: 0, team: 0, price: 120 },
    ],
    invoices: [
      { c: 3, d: -20, paid: false, job: 0 }, { c: 1, d: -12, paid: true, job: 1 }, { c: 4, d: -4, paid: false, job: 2 },
      { c: 2, d: -34, paid: true, net: 380 }, { c: 5, d: -25, paid: true, net: 300 },
    ],
    months: [2420, 2760, 2610, 3140, 2950, 1080],
    typeBase: [52, 17, 7],
    notifications: [
      { text: 'Το Λογιστικό Γραφείο Αντωνίου επιβεβαίωσε την εβδομαδιαία υπηρεσία', time: 'πριν 12 λεπτά' },
      { text: 'Εκπρόθεσμο τιμολόγιο: Οικογένεια Ιωάννου', time: 'πριν 2 ώρες' },
      { text: 'Νέα κράτηση: Διαχείριση Πολυκατοικιών Νίκου', time: 'Χθες' },
      { text: 'Η Ομάδα Β ολοκλήρωσε την εργασία στη Βούλα', time: 'Χθες' },
    ],
  },
  en: {
    brand: { name: 'Sparkle & Co. Cleaning', tagline: 'Clapham, London', initials: 'SC' },
    user: { name: 'Claire Bennett', role: 'Owner' },
    members: [['Hannah P.', 'Joanna W.'], ['Maria S.', 'Aisha K.', 'Lucy D.'], ['Agnieszka B.', 'Grace T.']],
    vat: 0.2, prefix: 'INV', cap: 24,
    customers: [
      { name: 'The Smith family', district: 'Clapham', address: '14 Elms Road', phone: '+44 7700 900231', ctype: 0, freq: 1, base: 1960 },
      { name: 'Harper & Co. Solicitors', district: 'Battersea', address: '27 Lavender Hill', phone: '+44 7700 900452', ctype: 1, freq: 1, base: 4480 },
      { name: 'Riverside Apartments', district: 'Wandsworth', address: 'Riverside Court, Armoury Way', phone: '+44 7700 900673', ctype: 2, freq: 3, base: 3290 },
      { name: 'The Patel family', district: 'Balham', address: '8 Ravenstone Street', phone: '+44 7700 900104', ctype: 0, freq: 0, base: 340 },
      { name: 'Oakfield Dental Practice', district: 'Streatham', address: '112 Streatham High Road', phone: '+44 7700 900815', ctype: 1, freq: 1, base: 5560 },
      { name: 'Kingsley Property Management', district: 'Putney', address: '3 Upper Richmond Road', phone: '+44 7700 900926', ctype: 2, freq: 3, base: 2880 },
      { name: 'Olivia Hughes', district: 'Brixton', address: '41 Acre Lane', phone: '+44 7700 900347', ctype: 0, freq: 2, base: 1320 },
      { name: 'Marsh & Lane Accountants', district: 'Clapham', address: '6 The Pavement', phone: '+44 7700 900568', ctype: 1, freq: 2, base: 3070 },
    ],
    jobs: [
      { c: 3, d: -20, time: '09:00', type: 1, team: 0, price: 270 },
      { c: 1, d: -12, time: '18:00', type: 0, team: 1, price: 400 },
      { c: 4, d: -4, time: '19:00', type: 0, team: 1, price: 360 },
      { c: 6, d: -2, time: '10:00', type: 1, team: 0, price: 250 },
      { c: 0, d: 0, time: '09:30', type: 0, team: 0, price: 190 },
      { c: 7, d: 0, time: '18:30', type: 0, team: 1, price: 300 },
      { c: 2, d: 1, time: '10:00', type: 2, team: 2, price: 540 },
      { c: 5, d: 2, time: '11:00', type: 1, team: 2, price: 430 },
      { c: 1, d: 2, time: '18:00', type: 0, team: 1, price: 400 },
      { c: 6, d: 3, time: '14:00', type: 0, team: 0, price: 170 },
      { c: 4, d: 4, time: '19:00', type: 0, team: 1, price: 360 },
      { c: 0, d: 6, time: '09:30', type: 0, team: 0, price: 190 },
    ],
    invoices: [
      { c: 3, d: -20, paid: false, job: 0 }, { c: 1, d: -12, paid: true, job: 1 }, { c: 4, d: -4, paid: false, job: 2 },
      { c: 2, d: -31, paid: true, net: 540 }, { c: 5, d: -28, paid: true, net: 430 },
    ],
    months: [3340, 3790, 3560, 4270, 4010, 1520],
    typeBase: [61, 20, 8],
    notifications: [
      { text: 'Harper & Co. Solicitors confirmed their weekly clean', time: '12 min ago' },
      { text: 'Invoice overdue: The Patel family', time: '2 h ago' },
      { text: 'New booking: Kingsley Property Management', time: 'Yesterday' },
      { text: 'Team B completed the job in Streatham', time: 'Yesterday' },
    ],
  },
};
