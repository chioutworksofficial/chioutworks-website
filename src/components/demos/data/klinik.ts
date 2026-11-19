import type { Lang } from '../../../translations';
import { KLINIK } from '../sampleData';

// Market-specific sample data for the clinic demo (amounts in market currency).

export interface SeedPatient {
  id: string; name: string; age: number; phone: string; ins: 0 | 1; complaint: string; notes: string;
  allergies: string; meds: string; lastDays: number; history: { d: number; r: string }[];
}
type Extra = Pick<SeedPatient, 'phone' | 'ins' | 'allergies' | 'meds' | 'lastDays' | 'history'>;
type Full = Omit<SeedPatient, 'id'>;

const EXTRA: Record<Lang, Extra[]> = {
  tr: [
    { phone: '+90 532 411 20 18', ins: 0, allergies: 'Yok', meds: 'Amlodipin 5 mg', lastDays: 13, history: [{ d: 13, r: 'Tansiyon kontrolü' }, { d: 90, r: 'Kan tahlili' }] },
    { phone: '+90 533 782 41 06', ins: 1, allergies: 'Penisilin', meds: 'Triptan (gerektiğinde)', lastDays: 9, history: [{ d: 9, r: 'Migren' }, { d: 60, r: 'Baş ağrısı' }] },
    { phone: '+90 505 340 77 92', ins: 0, allergies: 'Yok', meds: 'Metformin 1000 mg', lastDays: 26, history: [{ d: 26, r: 'Diyabet takibi' }, { d: 115, r: 'HbA1c kontrolü' }] },
    { phone: '+90 544 918 63 30', ins: 0, allergies: 'Fındık', meds: 'Yok', lastDays: 2, history: [{ d: 2, r: 'Ateş, öksürük' }, { d: 200, r: 'Aşı takibi' }] },
  ],
  de: [
    { phone: '+49 151 2345 6789', ins: 0, allergies: 'Keine bekannt', meds: 'Ramipril 5 mg', lastDays: 13, history: [{ d: 13, r: 'Blutdruckkontrolle' }, { d: 90, r: 'Blutabnahme' }] },
    { phone: '+49 160 9876 5432', ins: 1, allergies: 'Penicillin', meds: 'Triptan (bei Bedarf)', lastDays: 9, history: [{ d: 9, r: 'Migräne' }, { d: 60, r: 'Kopfschmerzen' }] },
    { phone: '+49 171 5550 2841', ins: 0, allergies: 'Keine bekannt', meds: 'Metformin 1000 mg', lastDays: 26, history: [{ d: 26, r: 'Diabetes-Kontrolle' }, { d: 115, r: 'HbA1c-Kontrolle' }] },
    { phone: '+49 152 3344 7781', ins: 0, allergies: 'Haselnuss', meds: 'Keine', lastDays: 2, history: [{ d: 2, r: 'Fieber, Husten' }, { d: 200, r: 'Impfung' }] },
  ],
  el: [
    { phone: '+30 694 123 4567', ins: 0, allergies: 'Καμία γνωστή', meds: 'Αμλοδιπίνη 5 mg', lastDays: 13, history: [{ d: 13, r: 'Έλεγχος πίεσης' }, { d: 90, r: 'Εξετάσεις αίματος' }] },
    { phone: '+30 697 220 9183', ins: 1, allergies: 'Πενικιλίνη', meds: 'Τριπτάνη (εφόσον χρειαστεί)', lastDays: 9, history: [{ d: 9, r: 'Ημικρανία' }, { d: 60, r: 'Κεφαλαλγία' }] },
    { phone: '+30 693 518 4420', ins: 0, allergies: 'Καμία γνωστή', meds: 'Μετφορμίνη 1000 mg', lastDays: 26, history: [{ d: 26, r: 'Παρακολούθηση διαβήτη' }, { d: 115, r: 'Έλεγχος HbA1c' }] },
    { phone: '+30 698 774 3095', ins: 0, allergies: 'Φυστίκια', meds: 'Καμία', lastDays: 2, history: [{ d: 2, r: 'Πυρετός, βήχας' }, { d: 200, r: 'Εμβολιασμός' }] },
  ],
  en: [
    { phone: '+44 7700 900123', ins: 0, allergies: 'None known', meds: 'Ramipril 5 mg', lastDays: 13, history: [{ d: 13, r: 'Blood pressure check' }, { d: 90, r: 'Blood tests' }] },
    { phone: '+44 7700 900456', ins: 1, allergies: 'Penicillin', meds: 'Triptan (as needed)', lastDays: 9, history: [{ d: 9, r: 'Migraine' }, { d: 60, r: 'Headaches' }] },
    { phone: '+44 7700 900789', ins: 0, allergies: 'None known', meds: 'Metformin 1000 mg', lastDays: 26, history: [{ d: 26, r: 'Diabetes follow-up' }, { d: 115, r: 'HbA1c review' }] },
    { phone: '+44 7700 900234', ins: 0, allergies: 'Hazelnut', meds: 'None', lastDays: 2, history: [{ d: 2, r: 'Fever, cough' }, { d: 200, r: 'Vaccination' }] },
  ],
};

const MORE: Record<Lang, Full[]> = {
  tr: [
    { name: 'Fatma Çelik', age: 41, phone: '+90 535 620 18 44', ins: 0, complaint: 'Boyun ağrısı', notes: 'Fizyoterapi önerildi.', allergies: 'Yok', meds: 'Ibuprofen (gerektiğinde)', lastDays: 5, history: [{ d: 5, r: 'Boyun ağrısı' }, { d: 150, r: 'Genel kontrol' }] },
    { name: 'Mustafa Şahin', age: 29, phone: '+90 542 305 91 17', ins: 1, complaint: 'Mide yanması', notes: 'Mide koruyucu tedavi başlandı.', allergies: 'Yok', meds: 'Pantoprazol 40 mg', lastDays: 20, history: [{ d: 20, r: 'Mide yanması' }] },
    { name: 'Elif Yıldız', age: 36, phone: '+90 536 477 03 85', ins: 0, complaint: 'Tiroit kontrolü', notes: 'TSH normal aralıkta.', allergies: 'Polen', meds: 'Levotiroksin 75 mcg', lastDays: 33, history: [{ d: 33, r: 'Tiroit kontrolü' }, { d: 210, r: 'Kan tahlili' }] },
    { name: 'Ali Öztürk', age: 72, phone: '+90 507 880 12 66', ins: 0, complaint: 'Kalp kontrolü', notes: 'EKG normal. 3 ay sonra kontrol.', allergies: 'Aspirin', meds: 'Metoprolol 50 mg', lastDays: 17, history: [{ d: 17, r: 'Kalp kontrolü' }, { d: 120, r: 'EKG' }] },
    { name: 'Emine Polat', age: 24, phone: '+90 538 129 54 70', ins: 1, complaint: 'Cilt döküntüsü', notes: 'Alerji testi planlandı.', allergies: 'Lateks', meds: 'Setirizin 10 mg', lastDays: 7, history: [{ d: 7, r: 'Cilt döküntüsü' }] },
    { name: 'Burak Aydın', age: 47, phone: '+90 543 662 08 39', ins: 0, complaint: 'Bel ağrısı', notes: 'İstirahat ve egzersiz önerildi.', allergies: 'Yok', meds: 'Yok', lastDays: 44, history: [{ d: 44, r: 'Bel ağrısı' }, { d: 260, r: 'Grip aşısı' }] },
  ],
  de: [
    { name: 'Petra Fischer', age: 41, phone: '+49 157 3012 4488', ins: 0, complaint: 'Nackenschmerzen', notes: 'Physiotherapie empfohlen.', allergies: 'Keine bekannt', meds: 'Ibuprofen (bei Bedarf)', lastDays: 5, history: [{ d: 5, r: 'Nackenschmerzen' }, { d: 150, r: 'Check-up' }] },
    { name: 'Jonas Weber', age: 29, phone: '+49 162 7788 1190', ins: 1, complaint: 'Sodbrennen', notes: 'Protonenpumpenhemmer begonnen.', allergies: 'Keine bekannt', meds: 'Pantoprazol 40 mg', lastDays: 20, history: [{ d: 20, r: 'Sodbrennen' }] },
    { name: 'Sabine Koch', age: 36, phone: '+49 176 4021 9935', ins: 0, complaint: 'Schilddrüsenkontrolle', notes: 'TSH im Normbereich.', allergies: 'Pollen', meds: 'L-Thyroxin 75 µg', lastDays: 33, history: [{ d: 33, r: 'Schilddrüsenkontrolle' }, { d: 210, r: 'Blutabnahme' }] },
    { name: 'Werner Richter', age: 72, phone: '+49 151 6633 2207', ins: 0, complaint: 'Herzkontrolle', notes: 'EKG unauffällig. Kontrolle in 3 Monaten.', allergies: 'Acetylsalicylsäure', meds: 'Metoprolol 50 mg', lastDays: 17, history: [{ d: 17, r: 'Herzkontrolle' }, { d: 120, r: 'EKG' }] },
    { name: 'Lea Neumann', age: 24, phone: '+49 160 5544 7712', ins: 1, complaint: 'Hautausschlag', notes: 'Allergietest geplant.', allergies: 'Latex', meds: 'Cetirizin 10 mg', lastDays: 7, history: [{ d: 7, r: 'Hautausschlag' }] },
    { name: 'Tobias Krüger', age: 47, phone: '+49 172 9081 3346', ins: 0, complaint: 'Rückenschmerzen', notes: 'Bewegung und Wärme empfohlen.', allergies: 'Keine bekannt', meds: 'Keine', lastDays: 44, history: [{ d: 44, r: 'Rückenschmerzen' }, { d: 260, r: 'Grippeimpfung' }] },
  ],
  el: [
    { name: 'Κατερίνα Δημητρίου', age: 41, phone: '+30 695 330 1288', ins: 0, complaint: 'Πόνος στον αυχένα', notes: 'Συστήθηκε φυσικοθεραπεία.', allergies: 'Καμία γνωστή', meds: 'Ιβουπροφαίνη (εφόσον χρειαστεί)', lastDays: 5, history: [{ d: 5, r: 'Πόνος στον αυχένα' }, { d: 150, r: 'Γενικός έλεγχος' }] },
    { name: 'Νίκος Βασιλείου', age: 29, phone: '+30 699 408 7721', ins: 1, complaint: 'Καούρα', notes: 'Ξεκίνησε αναστολέας αντλίας πρωτονίων.', allergies: 'Καμία γνωστή', meds: 'Παντοπραζόλη 40 mg', lastDays: 20, history: [{ d: 20, r: 'Καούρα' }] },
    { name: 'Σοφία Κωνσταντίνου', age: 36, phone: '+30 693 215 6604', ins: 0, complaint: 'Έλεγχος θυρεοειδούς', notes: 'TSH εντός φυσιολογικών ορίων.', allergies: 'Γύρη', meds: 'Λεβοθυροξίνη 75 mcg', lastDays: 33, history: [{ d: 33, r: 'Έλεγχος θυρεοειδούς' }, { d: 210, r: 'Εξετάσεις αίματος' }] },
    { name: 'Αντώνης Μαυρίδης', age: 72, phone: '+30 697 842 1150', ins: 0, complaint: 'Καρδιολογικός έλεγχος', notes: 'Καρδιογράφημα φυσιολογικό. Επανέλεγχος σε 3 μήνες.', allergies: 'Ασπιρίνη', meds: 'Μετοπρολόλη 50 mg', lastDays: 17, history: [{ d: 17, r: 'Καρδιολογικός έλεγχος' }, { d: 120, r: 'Καρδιογράφημα' }] },
    { name: 'Αγγελική Λαμπράκη', age: 24, phone: '+30 694 770 3382', ins: 1, complaint: 'Εξάνθημα', notes: 'Προγραμματίστηκε αλλεργιολογικός έλεγχος.', allergies: 'Λάτεξ', meds: 'Σετιριζίνη 10 mg', lastDays: 7, history: [{ d: 7, r: 'Εξάνθημα' }] },
    { name: 'Παναγιώτης Ρήγας', age: 47, phone: '+30 698 125 9047', ins: 0, complaint: 'Οσφυαλγία', notes: 'Συστάθηκε ξεκούραση και άσκηση.', allergies: 'Καμία γνωστή', meds: 'Καμία', lastDays: 44, history: [{ d: 44, r: 'Οσφυαλγία' }, { d: 260, r: 'Αντιγριπικό εμβόλιο' }] },
  ],
  en: [
    { name: 'Emma Roberts', age: 41, phone: '+44 7700 900312', ins: 0, complaint: 'Neck pain', notes: 'Physiotherapy recommended.', allergies: 'None known', meds: 'Ibuprofen (as needed)', lastDays: 5, history: [{ d: 5, r: 'Neck pain' }, { d: 150, r: 'General check-up' }] },
    { name: 'James Walker', age: 29, phone: '+44 7700 900518', ins: 1, complaint: 'Heartburn', notes: 'Started on a proton pump inhibitor.', allergies: 'None known', meds: 'Pantoprazole 40 mg', lastDays: 20, history: [{ d: 20, r: 'Heartburn' }] },
    { name: 'Hannah Wright', age: 36, phone: '+44 7700 900647', ins: 0, complaint: 'Thyroid check', notes: 'TSH within normal range.', allergies: 'Pollen', meds: 'Levothyroxine 75 mcg', lastDays: 33, history: [{ d: 33, r: 'Thyroid check' }, { d: 210, r: 'Blood tests' }] },
    { name: 'Robert Hall', age: 72, phone: '+44 7700 900871', ins: 0, complaint: 'Heart review', notes: 'ECG normal. Review in 3 months.', allergies: 'Aspirin', meds: 'Metoprolol 50 mg', lastDays: 17, history: [{ d: 17, r: 'Heart review' }, { d: 120, r: 'ECG' }] },
    { name: 'Chloe Bennett', age: 24, phone: '+44 7700 900095', ins: 1, complaint: 'Skin rash', notes: 'Allergy test planned.', allergies: 'Latex', meds: 'Cetirizine 10 mg', lastDays: 7, history: [{ d: 7, r: 'Skin rash' }] },
    { name: 'Daniel Foster', age: 47, phone: '+44 7700 900764', ins: 0, complaint: 'Lower back pain', notes: 'Rest and gentle exercise advised.', allergies: 'None known', meds: 'None', lastDays: 44, history: [{ d: 44, r: 'Lower back pain' }, { d: 260, r: 'Flu jab' }] },
  ],
};

export const klinikPatients = (lang: Lang): SeedPatient[] => [
  ...KLINIK[lang].map((p, i) => ({ id: p.id, name: p.name, age: p.age, complaint: p.complaint, notes: p.notes, ...EXTRA[lang][i] })),
  ...MORE[lang].map((p, i) => ({ id: `p${i + 5}`, ...p })),
];

export interface KlinikMarket {
  brand: { name: string; tagline: string; initials: string };
  user: { name: string; role: string };
  doctors: string[];
  notifications: { text: string; time: string }[];
  invPrefix: string;
  // invoices: patient id, days ago, amount, status 0 open / 1 paid / 2 overdue
  invoices: { p: string; d: number; amt: number; st: 0 | 1 | 2 }[];
  // appointments: doctor, weekday 0-4, slot 0-17, patient id, reminder sent?
  appts: { doc: 0 | 1; day: number; slot: number; p: string; sent: boolean }[];
  perDay: number[]; noShow: number; wait: number;
  reasons: { label: string; value: number }[];
}

const INV: KlinikMarket['invoices'] = [
  { p: 'p2', d: 3, amt: 1, st: 0 }, { p: 'p5', d: 5, amt: 1.4, st: 1 }, { p: 'p7', d: 8, amt: 0.8, st: 1 },
  { p: 'p3', d: 19, amt: 1.1, st: 2 }, { p: 'p9', d: 7, amt: 1.6, st: 0 }, { p: 'p4', d: 2, amt: 0.9, st: 1 },
  { p: 'p10', d: 24, amt: 1.2, st: 2 }, { p: 'p1', d: 13, amt: 1.3, st: 1 },
];
const inv = (base: number) => INV.map((i) => ({ ...i, amt: Math.round(base * i.amt) }));

const APPTS: KlinikMarket['appts'] = [
  { doc: 0, day: 0, slot: 1, p: 'p1', sent: true }, { doc: 0, day: 0, slot: 4, p: 'p6', sent: true },
  { doc: 0, day: 1, slot: 2, p: 'p3', sent: true }, { doc: 0, day: 2, slot: 6, p: 'p8', sent: false },
  { doc: 0, day: 3, slot: 3, p: 'p2', sent: false }, { doc: 1, day: 0, slot: 0, p: 'p4', sent: true },
  { doc: 1, day: 1, slot: 5, p: 'p7', sent: true }, { doc: 1, day: 2, slot: 2, p: 'p10', sent: false },
  { doc: 1, day: 4, slot: 7, p: 'p9', sent: false },
];

export const KLINIK_MARKET: Record<Lang, KlinikMarket> = {
  tr: {
    brand: { name: 'Kadıköy Aile Sağlığı Merkezi', tagline: 'Aile hekimliği', initials: 'KA' },
    user: { name: 'Dr. Selin Aydın', role: 'Aile hekimi' },
    doctors: ['Dr. Aydın', 'Dr. Koç'],
    notifications: [
      { text: 'Ayşe Demir 15:30 randevusunu onayladı', time: '12 dk önce' },
      { text: 'Hasan Kaya için e-posta hatırlatması gönderildi', time: '1 sa önce' },
      { text: 'Fatura F-0004 vadesi geçti', time: '3 sa önce' },
      { text: 'Yeni hasta kaydı: Emine Polat', time: 'Dün' },
    ],
    invPrefix: 'F', invoices: inv(1200), appts: APPTS,
    perDay: [18, 22, 19, 24, 21, 9, 20], noShow: 6, wait: 14,
    reasons: [{ label: 'Tansiyon kontrolü', value: 34 }, { label: 'Diyabet takibi', value: 26 }, { label: 'Ateş, öksürük', value: 22 }, { label: 'Migren', value: 14 }, { label: 'Bel ağrısı', value: 9 }],
  },
  de: {
    brand: { name: 'Praxis Dr. Schulz · Offenbach', tagline: 'Allgemeinmedizin', initials: 'PS' },
    user: { name: 'Dr. Anke Schulz', role: 'Fachärztin für Allgemeinmedizin' },
    doctors: ['Dr. Schulz', 'Dr. Neumann'],
    notifications: [
      { text: 'Anna Schmidt hat den Termin um 15:30 bestätigt', time: 'vor 12 Min.' },
      { text: 'E-Mail-Erinnerung an Helga Wagner gesendet', time: 'vor 1 Std.' },
      { text: 'Rechnung RE-0004 ist überfällig', time: 'vor 3 Std.' },
      { text: 'Neuer Patient angelegt: Lea Neumann', time: 'Gestern' },
    ],
    invPrefix: 'RE', invoices: inv(95), appts: APPTS,
    perDay: [26, 31, 28, 33, 24, 11, 29], noShow: 5, wait: 18,
    reasons: [{ label: 'Blutdruckkontrolle', value: 36 }, { label: 'Diabetes-Kontrolle', value: 25 }, { label: 'Fieber, Husten', value: 21 }, { label: 'Rückenschmerzen', value: 15 }, { label: 'Impfung', value: 11 }],
  },
  el: {
    brand: { name: 'Ιατρείο Δρ. Παπαδάκη · Κηφισιά', tagline: 'Παθολογία', initials: 'ΠΑ' },
    user: { name: 'Δρ. Ελένη Παπαδάκη', role: 'Παθολόγος' },
    doctors: ['Δρ. Παπαδάκη', 'Δρ. Νικολαΐδης'],
    notifications: [
      { text: 'Η Μαρία Νικολάου επιβεβαίωσε το ραντεβού των 15:30', time: 'πριν 12 λεπτά' },
      { text: 'Στάλθηκε υπενθύμιση email στον Δημήτρη Αλεξίου', time: 'πριν 1 ώρα' },
      { text: 'Το τιμολόγιο ΤΠΥ-0004 είναι εκπρόθεσμο', time: 'πριν 3 ώρες' },
      { text: 'Νέος ασθενής: Αγγελική Λαμπράκη', time: 'Χθες' },
    ],
    invPrefix: 'ΤΠΥ', invoices: inv(55), appts: APPTS,
    perDay: [14, 17, 15, 19, 16, 6, 16], noShow: 8, wait: 16,
    reasons: [{ label: 'Έλεγχος πίεσης', value: 32 }, { label: 'Παρακολούθηση διαβήτη', value: 24 }, { label: 'Πυρετός, βήχας', value: 20 }, { label: 'Ημικρανία', value: 13 }, { label: 'Οσφυαλγία', value: 8 }],
  },
  en: {
    brand: { name: 'Riverside Medical Practice · Leeds', tagline: 'General practice', initials: 'RM' },
    user: { name: 'Dr Helen Hughes', role: 'GP Partner' },
    doctors: ['Dr Hughes', 'Dr Patel'],
    notifications: [
      { text: 'Sarah Mitchell confirmed her 3:30 pm appointment', time: '12 min ago' },
      { text: 'E-mail reminder sent to Margaret Evans', time: '1 h ago' },
      { text: 'Invoice INV-0004 is overdue', time: '3 h ago' },
      { text: 'New patient registered: Chloe Bennett', time: 'Yesterday' },
    ],
    invPrefix: 'INV', invoices: inv(80), appts: APPTS,
    perDay: [24, 29, 26, 31, 27, 10, 27], noShow: 7, wait: 15,
    reasons: [{ label: 'Blood pressure check', value: 33 }, { label: 'Diabetes follow-up', value: 24 }, { label: 'Fever, cough', value: 21 }, { label: 'Migraine', value: 14 }, { label: 'Lower back pain', value: 10 }],
  },
};
