import type { Lang } from '../../../translations';

export interface SeedCustomer {
  name: string; phone: string; visits: number; lastDays: number; spent: number; fav: number; note: string;
}

interface Market {
  brand: { name: string; tagline: string; initials: string };
  user: { name: string; role: string };
  notifications: { text: string; time: string }[];
  /** Duration (min) for the 4 base services from sampleData, then 2 extra services */
  durations: number[];
  extraServices: { name: string; min: number; price: number }[];
  customers: SeedCustomer[];
  /** Revenue Mon–Sun (market currency) */
  weekRevenue: number[];
  /** Past-period service counts, one per service index (6) */
  serviceCounts: number[];
  /** Past-period appointments and no-shows */
  noShow: { total: number; missed: number };
  newCustomers: number;
  returning: number;
  bookUrl: string;
}

export const KUAFOR_DATA: Record<Lang, Market> = {
  tr: {
    brand: { name: 'Salon Elif', tagline: 'Kadıköy · İstanbul', initials: 'SE' },
    user: { name: 'Elif Yıldız', role: 'Salon sahibi' },
    notifications: [
      { text: 'Zeynep A. çevrim içi randevu aldı: Boya', time: '12 dk önce' },
      { text: 'Burak D. yarınki randevusunu onayladı', time: '1 saat önce' },
      { text: 'Hatırlatma mesajları 18 müşteriye gönderildi', time: 'Dün' },
    ],
    durations: [45, 30, 120, 40],
    extraServices: [{ name: 'Keratin bakımı', min: 90, price: 1800 }, { name: 'Çocuk saç kesimi', min: 30, price: 300 }],
    customers: [
      { name: 'Ayşe Kaya', phone: '+90 532 410 22 18', visits: 14, lastDays: 6, spent: 6200, fav: 0, note: 'Kahkül kısa kalsın.' },
      { name: 'Emre Tunç', phone: '+90 533 771 05 64', visits: 22, lastDays: 3, spent: 7150, fav: 1, note: '' },
      { name: 'Zeynep Aksoy', phone: '+90 542 318 90 27', visits: 9, lastDays: 41, spent: 11800, fav: 2, note: 'Amonyaksız boya tercih ediyor.' },
      { name: 'Burak Demir', phone: '+90 505 624 13 70', visits: 17, lastDays: 12, spent: 5400, fav: 0, note: 'Hafta sonu sabahları gelir.' },
      { name: 'Merve Sönmez', phone: '+90 555 902 47 31', visits: 11, lastDays: 19, spent: 4350, fav: 3, note: '' },
      { name: 'Can Özkan', phone: '+90 537 245 86 09', visits: 6, lastDays: 27, spent: 2300, fav: 1, note: '' },
      { name: 'Selin Arslan', phone: '+90 544 160 33 52', visits: 8, lastDays: 33, spent: 9900, fav: 4, note: 'Hassas saç derisi.' },
      { name: 'Deniz Koç', phone: '+90 531 887 41 96', visits: 4, lastDays: 58, spent: 1700, fav: 0, note: '' },
      { name: 'Gizem Polat', phone: '+90 506 539 72 14', visits: 12, lastDays: 9, spent: 5600, fav: 3, note: 'Düğün için deneme yapıldı.' },
      { name: 'Oğuz Çelik', phone: '+90 538 413 60 88', visits: 3, lastDays: 74, spent: 1150, fav: 5, note: 'Oğlu Kerem de geliyor.' },
    ],
    weekRevenue: [4200, 3600, 4900, 5200, 6800, 9400, 3100],
    serviceCounts: [86, 41, 23, 52, 11, 17],
    noShow: { total: 214, missed: 12 },
    newCustomers: 18, returning: 61,
    bookUrl: 'https://chioutworks.com/demo/demokuafor?book=1',
  },
  de: {
    brand: { name: 'Salon Lena', tagline: 'Frankfurt am Main', initials: 'SL' },
    user: { name: 'Lena Hoffmann', role: 'Inhaberin' },
    notifications: [
      { text: 'Marie S. hat online einen Termin gebucht: Färben', time: 'vor 12 Min.' },
      { text: 'Felix B. hat den Termin für morgen bestätigt', time: 'vor 1 Std.' },
      { text: 'Erinnerungen an 18 Kundinnen und Kunden gesendet', time: 'Gestern' },
    ],
    durations: [45, 30, 120, 40],
    extraServices: [{ name: 'Haarkur', min: 30, price: 28 }, { name: 'Kinderhaarschnitt', min: 30, price: 22 }],
    customers: [
      { name: 'Anna Keller', phone: '+49 151 2345 6781', visits: 14, lastDays: 6, spent: 520, fav: 0, note: 'Pony immer kurz.' },
      { name: 'Lukas Meier', phone: '+49 160 9087 3312', visits: 22, lastDays: 3, spent: 610, fav: 1, note: '' },
      { name: 'Marie Schulz', phone: '+49 172 4410 5586', visits: 9, lastDays: 41, spent: 780, fav: 2, note: 'Verträgt keine Ammoniakfarben.' },
      { name: 'Felix Becker', phone: '+49 157 3321 0498', visits: 17, lastDays: 12, spent: 490, fav: 0, note: 'Kommt samstags früh.' },
      { name: 'Laura Weber', phone: '+49 176 8812 7043', visits: 11, lastDays: 19, spent: 395, fav: 3, note: '' },
      { name: 'Jan Wagner', phone: '+49 152 6670 1925', visits: 6, lastDays: 27, spent: 190, fav: 1, note: '' },
      { name: 'Sophia Richter', phone: '+49 171 5503 8864', visits: 8, lastDays: 33, spent: 640, fav: 4, note: 'Empfindliche Kopfhaut.' },
      { name: 'Tim Neumann', phone: '+49 162 7741 2059', visits: 4, lastDays: 58, spent: 140, fav: 0, note: '' },
      { name: 'Hannah Vogel', phone: '+49 159 2208 6317', visits: 12, lastDays: 9, spent: 455, fav: 3, note: 'Probefrisur für die Hochzeit.' },
      { name: 'Paul Schröder', phone: '+49 175 3394 7720', visits: 3, lastDays: 74, spent: 95, fav: 5, note: 'Sohn Ben kommt auch.' },
    ],
    weekRevenue: [380, 320, 410, 450, 590, 820, 0],
    serviceCounts: [86, 41, 23, 52, 11, 17],
    noShow: { total: 214, missed: 9 },
    newCustomers: 15, returning: 64,
    bookUrl: 'https://chioutworks.com/demo/demokuafor?book=1',
  },
  el: {
    brand: { name: 'Κομμωτήριο Μαρία', tagline: 'Θεσσαλονίκη', initials: 'ΚΜ' },
    user: { name: 'Μαρία Παπαδοπούλου', role: 'Ιδιοκτήτρια' },
    notifications: [
      { text: 'Η Σοφία Μ. έκλεισε ραντεβού ηλεκτρονικά: Βαφή', time: 'πριν 12 λεπτά' },
      { text: 'Ο Γιάννης Κ. επιβεβαίωσε το αυριανό ραντεβού', time: 'πριν 1 ώρα' },
      { text: 'Στάλθηκαν υπενθυμίσεις σε 18 πελάτες', time: 'Χθες' },
    ],
    durations: [40, 25, 110, 35],
    extraServices: [{ name: 'Θεραπεία μαλλιών', min: 45, price: 25 }, { name: 'Παιδικό κούρεμα', min: 25, price: 10 }],
    customers: [
      { name: 'Κατερίνα Παπαδάκη', phone: '+30 694 123 4567', visits: 14, lastDays: 6, spent: 330, fav: 0, note: 'Φράντζα πάντα κοντή.' },
      { name: 'Νίκος Δημητρίου', phone: '+30 697 445 8210', visits: 22, lastDays: 3, spent: 340, fav: 1, note: '' },
      { name: 'Σοφία Μαυρίδου', phone: '+30 693 902 1175', visits: 9, lastDays: 41, spent: 420, fav: 2, note: 'Προτιμά βαφή χωρίς αμμωνία.' },
      { name: 'Γιάννης Κωστόπουλος', phone: '+30 698 310 6642', visits: 17, lastDays: 12, spent: 280, fav: 0, note: 'Έρχεται Σάββατο πρωί.' },
      { name: 'Δήμητρα Λαζάρου', phone: '+30 690 778 3059', visits: 11, lastDays: 19, spent: 235, fav: 3, note: '' },
      { name: 'Πέτρος Ιωάννου', phone: '+30 695 214 9908', visits: 6, lastDays: 27, spent: 105, fav: 1, note: '' },
      { name: 'Ελένη Χατζή', phone: '+30 699 560 4731', visits: 8, lastDays: 33, spent: 365, fav: 4, note: 'Ευαίσθητο τριχωτό.' },
      { name: 'Αντώνης Βλάχος', phone: '+30 694 887 2013', visits: 4, lastDays: 58, spent: 80, fav: 0, note: '' },
      { name: 'Χριστίνα Γεωργίου', phone: '+30 697 639 5526', visits: 12, lastDays: 9, spent: 270, fav: 3, note: 'Δοκιμαστικό χτένισμα για γάμο.' },
      { name: 'Θάνος Αναστασίου', phone: '+30 693 405 1887', visits: 3, lastDays: 74, spent: 60, fav: 5, note: 'Έρχεται και ο γιος του.' },
    ],
    weekRevenue: [190, 160, 230, 250, 340, 470, 0],
    serviceCounts: [86, 41, 23, 52, 11, 17],
    noShow: { total: 214, missed: 11 },
    newCustomers: 17, returning: 58,
    bookUrl: 'https://chioutworks.com/demo/demokuafor?book=1',
  },
  en: {
    brand: { name: 'Studio Emma', tagline: 'Manchester', initials: 'SE' },
    user: { name: 'Emma Clarke', role: 'Owner' },
    notifications: [
      { text: 'Olivia B. booked online: Colour', time: '12 min ago' },
      { text: 'Jack T. confirmed tomorrow’s appointment', time: '1 hour ago' },
      { text: 'Reminders sent to 18 clients', time: 'Yesterday' },
    ],
    durations: [45, 30, 120, 40],
    extraServices: [{ name: 'Deep conditioning', min: 30, price: 28 }, { name: 'Children’s cut', min: 30, price: 18 }],
    customers: [
      { name: 'Amelia Hughes', phone: '+44 7700 900141', visits: 14, lastDays: 6, spent: 440, fav: 0, note: 'Fringe always short.' },
      { name: 'Oliver Bennett', phone: '+44 7700 900252', visits: 22, lastDays: 3, spent: 460, fav: 1, note: '' },
      { name: 'Charlotte Evans', phone: '+44 7700 900363', visits: 9, lastDays: 41, spent: 640, fav: 2, note: 'Sensitive to ammonia dyes.' },
      { name: 'Harry Walker', phone: '+44 7700 900474', visits: 17, lastDays: 12, spent: 380, fav: 0, note: 'Saturday mornings only.' },
      { name: 'Isla Thompson', phone: '+44 7700 900585', visits: 11, lastDays: 19, spent: 305, fav: 3, note: '' },
      { name: 'George Patel', phone: '+44 7700 900696', visits: 6, lastDays: 27, spent: 150, fav: 1, note: '' },
      { name: 'Poppy Robinson', phone: '+44 7700 900707', visits: 8, lastDays: 33, spent: 560, fav: 4, note: 'Sensitive scalp.' },
      { name: 'Noah Wright', phone: '+44 7700 900818', visits: 4, lastDays: 58, spent: 110, fav: 0, note: '' },
      { name: 'Grace Taylor', phone: '+44 7700 900929', visits: 12, lastDays: 9, spent: 390, fav: 3, note: 'Wedding trial done.' },
      { name: 'Daniel Shaw', phone: '+44 7700 900030', visits: 3, lastDays: 74, spent: 72, fav: 5, note: 'Brings his son Leo too.' },
    ],
    weekRevenue: [340, 290, 380, 410, 540, 760, 0],
    serviceCounts: [86, 41, 23, 52, 11, 17],
    noShow: { total: 214, missed: 10 },
    newCustomers: 16, returning: 62,
    bookUrl: 'https://chioutworks.com/demo/demokuafor?book=1',
  },
};
