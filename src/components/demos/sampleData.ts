import type { Lang } from '../../translations';

// Market-specific sample data for the live demos. Names, companies, phone
// formats and price levels are chosen per market, not just translated:
// tr → Türkiye (TRY), de → Germany (EUR), el → Greece (EUR), en → UK/international (EUR).

export const KUAFOR: Record<Lang, {
  stylists: string[];
  prices: number[]; // per service index (haircut, beard, colour, blow-dry)
  appts: { customer: string; service: number; stylist: number; time: string }[];
}> = {
  tr: {
    stylists: ['Elif', 'Mert', 'Selin'],
    prices: [400, 250, 1200, 350],
    appts: [
      { customer: 'Ayşe K.', service: 0, stylist: 0, time: '09:00' },
      { customer: 'Emre T.', service: 1, stylist: 1, time: '10:00' },
      { customer: 'Zeynep A.', service: 2, stylist: 2, time: '11:00' },
      { customer: 'Burak D.', service: 0, stylist: 1, time: '13:00' },
      { customer: 'Merve S.', service: 3, stylist: 0, time: '15:00' },
    ],
  },
  de: {
    stylists: ['Lena', 'Jonas', 'Sophie'],
    prices: [35, 20, 70, 25],
    appts: [
      { customer: 'Anna K.', service: 0, stylist: 0, time: '09:00' },
      { customer: 'Lukas M.', service: 1, stylist: 1, time: '10:00' },
      { customer: 'Marie S.', service: 2, stylist: 2, time: '11:00' },
      { customer: 'Felix B.', service: 0, stylist: 1, time: '13:00' },
      { customer: 'Laura W.', service: 3, stylist: 0, time: '15:00' },
    ],
  },
  el: {
    stylists: ['Μαρία', 'Γιώργος', 'Ελένη'],
    prices: [15, 10, 45, 15],
    appts: [
      { customer: 'Κατερίνα Π.', service: 0, stylist: 0, time: '09:00' },
      { customer: 'Νίκος Δ.', service: 1, stylist: 1, time: '10:00' },
      { customer: 'Σοφία Μ.', service: 2, stylist: 2, time: '11:00' },
      { customer: 'Γιάννης Κ.', service: 0, stylist: 1, time: '13:00' },
      { customer: 'Δήμητρα Λ.', service: 3, stylist: 0, time: '15:00' },
    ],
  },
  en: {
    stylists: ['Emma', 'Jack', 'Olivia'],
    prices: [30, 18, 75, 25],
    appts: [
      { customer: 'Sophie T.', service: 0, stylist: 0, time: '09:00' },
      { customer: 'James W.', service: 1, stylist: 1, time: '10:00' },
      { customer: 'Charlotte B.', service: 2, stylist: 2, time: '11:00' },
      { customer: 'Harry M.', service: 0, stylist: 1, time: '13:00' },
      { customer: 'Amelia R.', service: 3, stylist: 0, time: '15:00' },
    ],
  },
};

type Patient = { id: string; name: string; age: number; complaint: string; lastVisit: string; notes: string };

export const KLINIK: Record<Lang, Patient[]> = {
  tr: [
    { id: 'p1', name: 'Mehmet Yılmaz', age: 54, complaint: 'Tansiyon kontrolü', lastVisit: '2026-10-28', notes: 'Tansiyon 135/85. İlaca devam.' },
    { id: 'p2', name: 'Ayşe Demir', age: 32, complaint: 'Migren', lastVisit: '2026-11-02', notes: 'Triptan reçete edildi. 4 hafta sonra kontrol.' },
    { id: 'p3', name: 'Hasan Kaya', age: 67, complaint: 'Diyabet takibi', lastVisit: '2026-10-15', notes: 'HbA1c %6,9. Diyet önerisi verildi.' },
    { id: 'p4', name: 'Zeynep Arslan', age: 8, complaint: 'Ateş, öksürük', lastVisit: '2026-11-09', notes: 'Viral enfeksiyon. İstirahat ve bol sıvı.' },
  ],
  de: [
    { id: 'p1', name: 'Klaus Becker', age: 54, complaint: 'Blutdruckkontrolle', lastVisit: '2026-10-28', notes: 'RR 135/85. Medikation fortsetzen.' },
    { id: 'p2', name: 'Anna Schmidt', age: 32, complaint: 'Migräne', lastVisit: '2026-11-02', notes: 'Triptan verordnet. Kontrolle in 4 Wochen.' },
    { id: 'p3', name: 'Helga Wagner', age: 67, complaint: 'Diabetes-Kontrolle', lastVisit: '2026-10-15', notes: 'HbA1c 6,9 %. Ernährungsberatung durchgeführt.' },
    { id: 'p4', name: 'Mia Hoffmann', age: 8, complaint: 'Fieber, Husten', lastVisit: '2026-11-09', notes: 'Virusinfekt. Ruhe und viel trinken.' },
  ],
  el: [
    { id: 'p1', name: 'Γιώργος Παπαδόπουλος', age: 54, complaint: 'Έλεγχος πίεσης', lastVisit: '2026-10-28', notes: 'Πίεση 135/85. Συνέχεια αγωγής.' },
    { id: 'p2', name: 'Μαρία Νικολάου', age: 32, complaint: 'Ημικρανία', lastVisit: '2026-11-02', notes: 'Χορηγήθηκε τριπτάνη. Επανέλεγχος σε 4 εβδομάδες.' },
    { id: 'p3', name: 'Δημήτρης Αλεξίου', age: 67, complaint: 'Παρακολούθηση διαβήτη', lastVisit: '2026-10-15', notes: 'HbA1c 6,9%. Δόθηκαν διατροφικές οδηγίες.' },
    { id: 'p4', name: 'Ελένη Γεωργίου', age: 8, complaint: 'Πυρετός, βήχας', lastVisit: '2026-11-09', notes: 'Ιογενής λοίμωξη. Ξεκούραση και υγρά.' },
  ],
  en: [
    { id: 'p1', name: 'David Clarke', age: 54, complaint: 'Blood pressure check', lastVisit: '2026-10-28', notes: 'BP 135/85. Continue medication.' },
    { id: 'p2', name: 'Sarah Mitchell', age: 32, complaint: 'Migraine', lastVisit: '2026-11-02', notes: 'Triptan prescribed. Review in 4 weeks.' },
    { id: 'p3', name: 'Margaret Evans', age: 67, complaint: 'Diabetes follow-up', lastVisit: '2026-10-15', notes: 'HbA1c 6.9%. Diet advice given.' },
    { id: 'p4', name: 'Lily Turner', age: 8, complaint: 'Fever, cough', lastVisit: '2026-11-09', notes: 'Viral infection. Rest and fluids.' },
  ],
};

export const TEMIZLIK: Record<Lang, {
  rate: number[]; // per m² by cleaning type
  perRoom: number;
  extras: number[];
  round: number;
  bookings: { customer: string; dayOffset: number; price: number; type: number; team: number }[];
}> = {
  tr: {
    rate: [25, 40, 48], perRoom: 100, extras: [300, 250, 350], round: 50,
    bookings: [
      { customer: 'Yılmaz ailesi', dayOffset: 1, price: 2500, type: 0, team: 0 },
      { customer: 'Kaya Mimarlık Ofisi', dayOffset: 1, price: 6000, type: 1, team: 1 },
      { customer: 'Aksoy Apartmanı', dayOffset: 3, price: 4500, type: 2, team: 2 },
    ],
  },
  de: {
    rate: [1.6, 2.6, 3.1], perRoom: 8, extras: [25, 20, 30], round: 5,
    bookings: [
      { customer: 'Familie Weber', dayOffset: 1, price: 180, type: 0, team: 0 },
      { customer: 'Kanzlei Becker', dayOffset: 1, price: 420, type: 1, team: 1 },
      { customer: 'Praxis Dr. Schulz', dayOffset: 3, price: 310, type: 2, team: 2 },
    ],
  },
  el: {
    rate: [1.2, 2.0, 2.4], perRoom: 5, extras: [15, 12, 18], round: 5,
    bookings: [
      { customer: 'Οικογένεια Παπαδάκη', dayOffset: 1, price: 120, type: 0, team: 0 },
      { customer: 'Λογιστικό Γραφείο Αντωνίου', dayOffset: 1, price: 300, type: 1, team: 1 },
      { customer: 'Πολυκατοικία Κηφισιάς', dayOffset: 3, price: 220, type: 2, team: 2 },
    ],
  },
  en: {
    rate: [1.8, 2.8, 3.3], perRoom: 8, extras: [25, 20, 30], round: 5,
    bookings: [
      { customer: 'The Smith family', dayOffset: 1, price: 190, type: 0, team: 0 },
      { customer: 'Harper & Co. Office', dayOffset: 1, price: 440, type: 1, team: 1 },
      { customer: 'Riverside Apartments', dayOffset: 3, price: 320, type: 2, team: 2 },
    ],
  },
};

export const SADAKAT: Record<Lang, { name: string; phone: string; stamps: number }[]> = {
  tr: [
    { name: 'Deniz', phone: '+90 532 111 22 33', stamps: 7 },
    { name: 'Ece', phone: '+90 541 234 56 78', stamps: 9 },
    { name: 'Can', phone: '+90 505 987 65 43', stamps: 3 },
    { name: 'Selin', phone: '+90 555 444 33 22', stamps: 10 },
  ],
  de: [
    { name: 'Sophie', phone: '+49 151 2345 6789', stamps: 7 },
    { name: 'Max', phone: '+49 160 9876 5432', stamps: 9 },
    { name: 'Lea', phone: '+49 176 1122 3344', stamps: 3 },
    { name: 'Tim', phone: '+49 170 5566 7788', stamps: 10 },
  ],
  el: [
    { name: 'Κώστας', phone: '+30 694 123 4567', stamps: 7 },
    { name: 'Άννα', phone: '+30 697 765 4321', stamps: 9 },
    { name: 'Νίκος', phone: '+30 693 222 3344', stamps: 3 },
    { name: 'Χριστίνα', phone: '+30 698 555 6677', stamps: 10 },
  ],
  en: [
    { name: 'Oliver', phone: '+44 7700 900123', stamps: 7 },
    { name: 'Grace', phone: '+44 7700 900456', stamps: 9 },
    { name: 'Noah', phone: '+44 7700 900789', stamps: 3 },
    { name: 'Ella', phone: '+44 7700 900321', stamps: 10 },
  ],
};

export const CRM: Record<Lang, { name: string; value: number; source: number; stage: number }[]> = {
  tr: [
    { name: 'Kahve Durağı', value: 45000, source: 0, stage: 0 },
    { name: 'Yıldız Mobilya', value: 180000, source: 2, stage: 1 },
    { name: 'Butik Ela', value: 30000, source: 1, stage: 1 },
    { name: 'Kaya Otomotiv', value: 250000, source: 2, stage: 2 },
    { name: 'Fırıncı Hasan Usta', value: 60000, source: 0, stage: 3 },
  ],
  de: [
    { name: 'Café Sonnenschein', value: 1200, source: 0, stage: 0 },
    { name: 'Müller Haustechnik GmbH', value: 4800, source: 2, stage: 1 },
    { name: 'Studio Lena', value: 950, source: 1, stage: 1 },
    { name: 'Autohaus Becker', value: 6500, source: 2, stage: 2 },
    { name: 'Bäckerei Schmidt', value: 1800, source: 0, stage: 3 },
  ],
  el: [
    { name: 'Καφέ Αιγαίο', value: 900, source: 0, stage: 0 },
    { name: 'Έπιπλα Παπαδόπουλος', value: 3500, source: 2, stage: 1 },
    { name: 'Studio Ελένη', value: 700, source: 1, stage: 1 },
    { name: 'Αυτοκίνητα Κωνσταντίνου', value: 5200, source: 2, stage: 2 },
    { name: 'Φούρνος Γεωργίου', value: 1400, source: 0, stage: 3 },
  ],
  en: [
    { name: 'Corner Café', value: 1100, source: 0, stage: 0 },
    { name: 'Harper Plumbing Ltd', value: 4500, source: 2, stage: 1 },
    { name: 'Studio Bloom', value: 900, source: 1, stage: 1 },
    { name: 'Wright Motors', value: 6200, source: 2, stage: 2 },
    { name: 'Riverside Bakery', value: 1700, source: 0, stage: 3 },
  ],
};
