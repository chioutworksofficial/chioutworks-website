import type { Lang } from '../../../translations';
import type { IconName } from '../AppShell';

export type Area = 'production' | 'sales' | 'driver' | 'office' | 'apprentice';
export type Contract = 'full' | 'part' | 'mini';
export type Status = 'new' | 'invited' | 'hired' | 'declined';

export interface Branch { name: string; address: string; phone: string; hours: [string, string, string] }
export interface Job { id: string; title: string; area: Area; contract: Contract; branch: number; startIn: number; pay: number; unit: 'h' | 'm' }
export interface SeedApp { id: string; name: string; phone: string; email: string; branch: number; job: string; startIn: number; note: string; cv: string; status: Status; ago: string }
export interface Benefit { icon: IconName; title: string; text: string }

export interface KariyerData {
  locale: string; domain: string; email: string; slugs: [string, string, string, string, string];
  brand: { name: string; tagline: string; initials: string }; employees: number; founded: number;
  branches: Branch[]; benefits: Benefit[]; jobs: Job[]; apps: SeedApp[];
}

const j = (id: string, title: string, area: Area, contract: Contract, branch: number, startIn: number, pay: number, unit: 'h' | 'm'): Job => ({ id, title, area, contract, branch, startIn, pay, unit });

export const KARIYER_DATA: Record<Lang, KariyerData> = {
  tr: {
    locale: 'tr-TR', domain: 'www.ornek-firin.com.tr', email: 'kariyer@ornek-firin.com.tr',
    slugs: ['ana-sayfa', 'ilanlar', 'subeler', 'basvuru', 'basvurular'],
    brand: { name: 'Örnek Fırın', tagline: '4 şube, İzmir', initials: 'ÖF' }, employees: 86, founded: 1998,
    branches: [
      { name: 'Alsancak', address: 'Kıbrıs Şehitleri Cd. 112, Alsancak, Konak', phone: '+90 232 555 01 10', hours: ['06:30 – 22:00', '06:30 – 23:00', '07:00 – 22:00'] },
      { name: 'Karşıyaka', address: 'Cemal Gürsel Cd. 48, Karşıyaka', phone: '+90 232 555 01 20', hours: ['06:30 – 22:00', '06:30 – 22:30', '07:00 – 21:30'] },
      { name: 'Bornova', address: 'Kazımdirik Cd. 23, Bornova', phone: '+90 232 555 01 30', hours: ['06:00 – 21:30', '06:00 – 22:00', '07:00 – 21:00'] },
      { name: 'Buca', address: 'Adatepe Mh. 1203. Sk. 7, Buca', phone: '+90 232 555 01 40', hours: ['05:30 – 21:00', '05:30 – 21:00', '06:30 – 20:00'] },
    ],
    benefits: [
      { icon: 'card', title: 'Yemek kartı', text: 'Her ay yüklenen yemek kartı, vardiyada ücretsiz öğün.' },
      { icon: 'globe', title: 'Servis', text: 'Sabah vardiyası için ücretsiz personel servisi.' },
      { icon: 'money', title: 'Aylık prim', text: 'Şube hedefi tutunca herkese satış ve performans primi.' },
      { icon: 'gift', title: 'Personel indirimi', text: 'Tüm ürünlerde %30 indirim, ayda iki ücretsiz ekmek paketi.' },
      { icon: 'star', title: 'Bayram ikramiyesi', text: 'Ramazan ve Kurban bayramlarında ek ödeme.' },
      { icon: 'users', title: 'Usta çırak eğitimi', text: 'Fırıncılık sertifikası için işbaşı eğitimi.' },
    ],
    jobs: [
      j('t1', 'Fırın ustası', 'production', 'full', 3, 14, 46000, 'm'),
      j('t2', 'Hamur ustası yardımcısı', 'production', 'full', 2, 7, 36000, 'm'),
      j('t3', 'Pastane üretim elemanı', 'production', 'part', 0, 10, 195, 'h'),
      j('t4', 'Satış danışmanı', 'sales', 'full', 0, 5, 34000, 'm'),
      j('t5', 'Tezgâh görevlisi', 'sales', 'part', 1, 3, 185, 'h'),
      j('t6', 'Hafta sonu satış elemanı', 'sales', 'mini', 2, 7, 180, 'h'),
      j('t7', 'Dağıtım şoförü', 'driver', 'full', 3, 21, 40000, 'm'),
      j('t8', 'Muhasebe ve ofis elemanı', 'office', 'full', 1, 30, 44000, 'm'),
      j('t9', 'Fırıncı çırağı', 'apprentice', 'full', 3, 60, 24000, 'm'),
      j('t10', 'Satış çırağı', 'apprentice', 'full', 0, 60, 23000, 'm'),
    ],
    apps: [
      { id: 'a1', name: 'Zeynep Aydın', phone: '+90 532 555 01 71', email: 'zeynep.aydin@example.com', branch: 0, job: 't4', startIn: 7, note: 'Önceki işyerimde 3 yıl kasada çalıştım.', cv: 'zeynep-aydin-cv.pdf', status: 'new', ago: '2 saat önce' },
      { id: 'a2', name: 'Mehmet Kaya', phone: '+90 533 555 02 42', email: 'mehmet.kaya@example.com', branch: 3, job: 't1', startIn: 14, note: '', cv: '', status: 'invited', ago: 'Dün' },
      { id: 'a3', name: 'Elif Demirci', phone: '+90 535 555 03 13', email: 'elif.demirci@example.com', branch: 2, job: 't6', startIn: 5, note: 'Üniversite öğrencisiyim, hafta sonları müsaitim.', cv: '', status: 'new', ago: '5 saat önce' },
      { id: 'a4', name: 'Can Öztürk', phone: '+90 536 555 04 84', email: 'can.ozturk@example.com', branch: 3, job: 't7', startIn: 21, note: 'B ve C sınıfı ehliyetim var.', cv: 'can-ozturk.pdf', status: 'hired', ago: '3 gün önce' },
    ],
  },
  de: {
    locale: 'de-DE', domain: 'www.backstube-kornfeld.de', email: 'karriere@backstube-kornfeld.de',
    slugs: ['start', 'stellen', 'filialen', 'bewerben', 'bewerbungen'],
    brand: { name: 'Backstube Kornfeld', tagline: '4 Filialen, Regensburg', initials: 'BM' }, employees: 74, founded: 1987,
    branches: [
      { name: 'Altstadt', address: 'Obere Bachgasse 12, 93047 Regensburg', phone: '+49 941 555 0110', hours: ['06:00 – 18:30', '06:00 – 14:00', '07:00 – 11:00'] },
      { name: 'Kumpfmühl', address: 'Kumpfmühler Straße 41, 93051 Regensburg', phone: '+49 941 555 0120', hours: ['05:45 – 18:30', '05:45 – 13:00', 'geschlossen'] },
      { name: 'Burgweinting', address: 'Donaustaufer Straße 7, 93055 Regensburg', phone: '+49 941 555 0130', hours: ['05:30 – 19:00', '05:30 – 14:00', '07:00 – 11:00'] },
      { name: 'Westenviertel', address: 'Prüfeninger Straße 58, 93049 Regensburg', phone: '+49 941 555 0140', hours: ['06:00 – 18:00', '06:00 – 13:00', 'geschlossen'] },
    ],
    benefits: [
      { icon: 'calendar', title: '30 Urlaubstage', text: 'Sechs Wochen Urlaub bei Vollzeit, dazu freie Tage an Heiligabend und Silvester.' },
      { icon: 'gift', title: 'Mitarbeiterrabatt', text: '30 % auf das gesamte Sortiment und jede Woche ein Brotlaib gratis.' },
      { icon: 'globe', title: 'Deutschlandticket-Zuschuss', text: 'Wir übernehmen 25 € monatlich für das Deutschlandticket.' },
      { icon: 'money', title: 'Tarifnahe Bezahlung', text: 'Zuschläge für Früh-, Sonn- und Feiertagsarbeit, pünktlich zum Monatsende.' },
      { icon: 'star', title: 'Weihnachts- und Urlaubsgeld', text: 'Jährliche Sonderzahlungen ab dem zweiten Beschäftigungsjahr.' },
      { icon: 'users', title: 'Weiterbildung zum Meister', text: 'Wir fördern Meisterkurse und übernehmen einen Teil der Gebühren.' },
    ],
    jobs: [
      j('d1', 'Bäckergeselle (m/w/d) Frühschicht', 'production', 'full', 2, 14, 15.2, 'h'),
      j('d2', 'Konditor (m/w/d)', 'production', 'full', 0, 30, 16, 'h'),
      j('d3', 'Backstubenhelfer (m/w/d)', 'production', 'part', 1, 7, 14, 'h'),
      j('d4', 'Verkäufer (m/w/d) Bäckerei', 'sales', 'full', 0, 5, 14.3, 'h'),
      j('d5', 'Verkaufsaushilfe (m/w/d)', 'sales', 'part', 3, 3, 13.8, 'h'),
      j('d6', 'Minijob Verkauf am Wochenende', 'sales', 'mini', 1, 7, 13.9, 'h'),
      j('d7', 'Auslieferungsfahrer (m/w/d)', 'driver', 'full', 2, 21, 2700, 'm'),
      j('d8', 'Büro- und Buchhaltungskraft (m/w/d)', 'office', 'part', 3, 45, 3100, 'm'),
      j('d9', 'Ausbildung Bäcker (m/w/d)', 'apprentice', 'full', 2, 120, 1050, 'm'),
      j('d10', 'Ausbildung Fachverkäufer/in im Lebensmittelhandwerk', 'apprentice', 'full', 0, 120, 1000, 'm'),
    ],
    apps: [
      { id: 'a1', name: 'Lena Hofmann', phone: '+49 151 5550 1171', email: 'lena.hofmann@example.de', branch: 0, job: 'd4', startIn: 10, note: 'Ich habe zwei Jahre in einer Konditorei verkauft.', cv: 'lebenslauf-hofmann.pdf', status: 'new', ago: 'vor 2 Std.' },
      { id: 'a2', name: 'Jonas Weber', phone: '+49 160 5550 2242', email: 'jonas.weber@example.de', branch: 2, job: 'd1', startIn: 30, note: '', cv: '', status: 'invited', ago: 'gestern' },
      { id: 'a3', name: 'Mira Schneider', phone: '+49 171 5550 3313', email: 'mira.schneider@example.de', branch: 1, job: 'd6', startIn: 7, note: 'Ich studiere und kann samstags und sonntags.', cv: '', status: 'new', ago: 'vor 5 Std.' },
      { id: 'a4', name: 'Emre Yıldız', phone: '+49 176 5550 4484', email: 'emre.yildiz@example.de', branch: 2, job: 'd7', startIn: 21, note: 'Führerschein Klasse B und C1.', cv: 'cv-yildiz.pdf', status: 'declined', ago: 'vor 3 Tagen' },
    ],
  },
  el: {
    locale: 'el-GR', domain: 'www.paradeigma-fournos.gr', email: 'karriera@paradeigma-fournos.gr',
    slugs: ['arxiki', 'theseis', 'katastimata', 'aitisi', 'aitiseis'],
    brand: { name: 'Φούρνος Παράδειγμα', tagline: '4 καταστήματα, Πάτρα', initials: 'ΦΠ' }, employees: 58, founded: 1994,
    branches: [
      { name: 'Κέντρο', address: 'Αγίου Νικολάου 42, Πάτρα 262 21', phone: '+30 2610 555 110', hours: ['06:30 – 21:00', '06:30 – 21:00', '08:00 – 15:00'] },
      { name: 'Ψηλά Αλώνια', address: 'Μαιζώνος 86, Πάτρα 262 23', phone: '+30 2610 555 120', hours: ['06:30 – 21:00', '06:30 – 20:00', '08:00 – 14:00'] },
      { name: 'Ρίο', address: 'Λεωφ. Ρίου-Αντιρρίου 15, Ρίο', phone: '+30 2610 555 130', hours: ['06:00 – 21:30', '06:00 – 21:30', '07:00 – 15:00'] },
      { name: 'Καστελλόκαμπος', address: 'Κορίνθου 214, Πάτρα 263 31', phone: '+30 2610 555 140', hours: ['06:00 – 20:30', '06:00 – 20:00', 'Κλειστά'] },
    ],
    benefits: [
      { icon: 'star', title: 'Δώρα εορτών', text: 'Δώρο Χριστουγέννων, Πάσχα και επίδομα αδείας όπως προβλέπει ο νόμος.' },
      { icon: 'check', title: 'Πλήρης ασφάλιση στον ΕΦΚΑ', text: 'Δήλωση ενσήμων για όλες τις ώρες που εργάζεστε, χωρίς αδήλωτη εργασία.' },
      { icon: 'gift', title: 'Έκπτωση προσωπικού', text: '30 % σε όλα τα προϊόντα και ψωμί δωρεάν κάθε εβδομάδα.' },
      { icon: 'clock', title: 'Σταθερό ωράριο', text: 'Το πρόγραμμα βγαίνει δύο εβδομάδες νωρίτερα.' },
      { icon: 'money', title: 'Μπόνους στόχου', text: 'Μηνιαίο μπόνους όταν το κατάστημα πιάνει τον στόχο.' },
      { icon: 'users', title: 'Εκπαίδευση', text: 'Μαθαίνετε την τέχνη του αρτοποιού δίπλα σε έμπειρους τεχνίτες.' },
    ],
    jobs: [
      j('g1', 'Αρτοποιός', 'production', 'full', 2, 14, 1150, 'm'),
      j('g2', 'Ζαχαροπλάστης', 'production', 'full', 0, 30, 1250, 'm'),
      j('g3', 'Βοηθός παραγωγής', 'production', 'part', 1, 7, 6.2, 'h'),
      j('g4', 'Πωλητής/τρια αρτοποιείου', 'sales', 'full', 0, 5, 950, 'm'),
      j('g5', 'Υπάλληλος πάγκου', 'sales', 'part', 3, 3, 5.8, 'h'),
      j('g6', 'Πωλητής/τρια Σαββατοκύριακου', 'sales', 'mini', 1, 7, 6, 'h'),
      j('g7', 'Οδηγός διανομής', 'driver', 'full', 3, 21, 1100, 'm'),
      j('g8', 'Υπάλληλος γραφείου και λογιστηρίου', 'office', 'full', 2, 30, 1200, 'm'),
      j('g9', 'Μαθητεία αρτοποιίας', 'apprentice', 'full', 3, 60, 700, 'm'),
      j('g10', 'Μαθητεία πωλητή τροφίμων', 'apprentice', 'full', 0, 60, 680, 'm'),
    ],
    apps: [
      { id: 'a1', name: 'Μαρία Παπαδοπούλου', phone: '+30 691 555 1171', email: 'maria.papadopoulou@example.gr', branch: 0, job: 'g4', startIn: 7, note: 'Έχω τριετή εμπειρία σε ταμείο και πωλήσεις.', cv: 'maria-biografiko.pdf', status: 'new', ago: 'πριν από 2 ώρες' },
      { id: 'a2', name: 'Νίκος Γεωργίου', phone: '+30 694 555 2242', email: 'nikos.georgiou@example.gr', branch: 2, job: 'g1', startIn: 14, note: '', cv: '', status: 'invited', ago: 'χθες' },
      { id: 'a3', name: 'Ελένη Αντωνίου', phone: '+30 697 555 3313', email: 'eleni.antoniou@example.gr', branch: 1, job: 'g6', startIn: 5, note: 'Είμαι φοιτήτρια και μπορώ Σαββατοκύριακα.', cv: '', status: 'new', ago: 'πριν από 5 ώρες' },
      { id: 'a4', name: 'Δημήτρης Κωστόπουλος', phone: '+30 698 555 4484', email: 'dimitris.kostopoulos@example.gr', branch: 3, job: 'g7', startIn: 21, note: 'Δίπλωμα Β και Γ κατηγορίας.', cv: 'dimitris-cv.pdf', status: 'hired', ago: 'πριν από 3 ημέρες' },
    ],
  },
  en: {
    locale: 'en-GB', domain: 'www.example-bakery.co.uk', email: 'careers@example-bakery.co.uk',
    slugs: ['home', 'jobs', 'branches', 'apply', 'applicants'],
    brand: { name: 'Example Bakery', tagline: '4 branches, Bristol', initials: 'EB' }, employees: 92, founded: 2003,
    branches: [
      { name: 'Clifton', address: '14 Princess Victoria Street, Clifton, BS8 4BP', phone: '+44 117 496 0110', hours: ['07:00 – 18:00', '07:00 – 18:00', '08:00 – 16:00'] },
      { name: 'Bedminster', address: '63 North Street, Bedminster, BS3 1ES', phone: '+44 117 496 0120', hours: ['06:30 – 17:30', '06:30 – 17:30', '08:00 – 15:00'] },
      { name: 'Stokes Croft', address: '9 Jamaica Street, Stokes Croft, BS2 8JP', phone: '+44 117 496 0130', hours: ['07:00 – 18:30', '07:00 – 18:30', '08:00 – 16:00'] },
      { name: 'Henleaze', address: '22 Henleaze Road, Henleaze, BS9 4JT', phone: '+44 117 496 0140', hours: ['06:30 – 17:00', '07:00 – 17:00', 'Closed'] },
    ],
    benefits: [
      { icon: 'money', title: 'Workplace pension', text: 'We pay in 5 % on top of your salary, from your first month.' },
      { icon: 'gift', title: 'Staff discount', text: '30 % off everything in store and a free loaf every week.' },
      { icon: 'clock', title: 'Paid breaks', text: 'Paid 30-minute break on every shift over six hours.' },
      { icon: 'calendar', title: '28 days’ holiday', text: 'Including bank holidays, rising by one day each year of service.' },
      { icon: 'star', title: 'Quarterly bonus', text: 'Every branch that hits its target shares a quarterly bonus.' },
      { icon: 'users', title: 'Paid training', text: 'Bakery and barista training on the job, with recognised qualifications.' },
    ],
    jobs: [
      j('e1', 'Baker (early shift)', 'production', 'full', 1, 14, 13.8, 'h'),
      j('e2', 'Pastry chef', 'production', 'full', 0, 30, 14.5, 'h'),
      j('e3', 'Bakery production assistant', 'production', 'part', 3, 7, 12.8, 'h'),
      j('e4', 'Sales assistant', 'sales', 'full', 0, 5, 12.9, 'h'),
      j('e5', 'Counter assistant', 'sales', 'part', 2, 3, 12.7, 'h'),
      j('e6', 'Weekend sales assistant', 'sales', 'mini', 3, 7, 12.7, 'h'),
      j('e7', 'Delivery driver', 'driver', 'full', 1, 21, 14.5, 'h'),
      j('e8', 'Office and accounts administrator', 'office', 'full', 2, 30, 2450, 'm'),
      j('e9', 'Baking apprenticeship', 'apprentice', 'full', 1, 60, 7.55, 'h'),
      j('e10', 'Retail apprenticeship', 'apprentice', 'full', 0, 60, 7.55, 'h'),
    ],
    apps: [
      { id: 'a1', name: 'Olivia Bennett', phone: '+44 7700 900171', email: 'olivia.bennett@example.com', branch: 0, job: 'e4', startIn: 10, note: 'I have two years of café and till experience.', cv: 'olivia-bennett-cv.pdf', status: 'new', ago: '2 hours ago' },
      { id: 'a2', name: 'Daniel Hughes', phone: '+44 7700 900242', email: 'daniel.hughes@example.com', branch: 1, job: 'e1', startIn: 21, note: '', cv: '', status: 'invited', ago: 'Yesterday' },
      { id: 'a3', name: 'Amira Khan', phone: '+44 7700 900313', email: 'amira.khan@example.com', branch: 3, job: 'e6', startIn: 7, note: 'I am a student and free every weekend.', cv: '', status: 'new', ago: '5 hours ago' },
      { id: 'a4', name: 'Tom Richards', phone: '+44 7700 900484', email: 'tom.richards@example.com', branch: 1, job: 'e7', startIn: 14, note: 'Full UK driving licence, clean record.', cv: 'tom-richards.pdf', status: 'hired', ago: '3 days ago' },
    ],
  },
};
