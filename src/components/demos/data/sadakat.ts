import type { Lang } from '../../../translations';

export interface SeedCustomer { name: string; phone: string; stamps: number; visits: number; daysAgo: number; bday?: boolean }
export interface SeedReward { stamps: number; name: string }
export interface SeedCampaign { name: string; type: number; channel: 0 | 1; audience: number; sent: number; opened: number; redeemed: number; status: 'sent' | 'scheduled'; inDays: number }

export const SADAKAT_DATA: Record<Lang, {
  brand: { name: string; tagline: string; initials: string; poster: string };
  user: { name: string; role: string };
  notifications: { text: string; time: string }[];
  customers: SeedCustomer[];
  rewards: SeedReward[];
  week: number[];
  rewardsMonth: number;
  campaigns: SeedCampaign[];
}> = {
  tr: {
    brand: { name: 'Kahve Durağı · Moda', tagline: 'Sadakat kartı', initials: 'KD', poster: 'Kahve Durağı' },
    user: { name: 'Zeynep Aydın', role: 'İşletme sahibi' },
    notifications: [
      { text: 'Selin, ücretsiz kahve ödülünü kullandı', time: '12 dk önce' },
      { text: '“Çifte damga günü” kampanyası 41 kişiye ulaştı', time: '2 sa önce' },
      { text: 'Yeni müşteri kartı: Burak Şahin', time: 'Dün' },
    ],
    customers: [
      { name: 'Deniz Yılmaz', phone: '+90 532 111 22 33', stamps: 7, visits: 23, daysAgo: 1 },
      { name: 'Ece Korkmaz', phone: '+90 541 234 56 78', stamps: 9, visits: 31, daysAgo: 0, bday: true },
      { name: 'Can Özdemir', phone: '+90 505 987 65 43', stamps: 3, visits: 8, daysAgo: 6 },
      { name: 'Selin Demir', phone: '+90 555 444 33 22', stamps: 10, visits: 40, daysAgo: 2 },
      { name: 'Burak Şahin', phone: '+90 533 765 12 09', stamps: 1, visits: 1, daysAgo: 1 },
      { name: 'Merve Çelik', phone: '+90 542 678 90 11', stamps: 5, visits: 14, daysAgo: 12 },
      { name: 'Emre Arslan', phone: '+90 506 321 45 67', stamps: 2, visits: 5, daysAgo: 38 },
      { name: 'Aylin Koç', phone: '+90 530 876 54 32', stamps: 6, visits: 19, daysAgo: 4, bday: true },
      { name: 'Mert Aksoy', phone: '+90 551 234 11 88', stamps: 4, visits: 11, daysAgo: 45 },
      { name: 'Buse Polat', phone: '+90 544 909 80 70', stamps: 8, visits: 26, daysAgo: 3 },
    ],
    rewards: [
      { stamps: 10, name: 'Ücretsiz Türk kahvesi' },
      { stamps: 6, name: 'Yanında lokum ikramı' },
      { stamps: 15, name: 'Ücretsiz tatlı' },
    ],
    week: [38, 42, 35, 47, 61, 78, 54],
    rewardsMonth: 17,
    campaigns: [
      { name: 'Çifte damga günü', type: 0, channel: 0, audience: 10, sent: 10, opened: 8, redeemed: 5, status: 'sent', inDays: -9 },
      { name: 'Seni özledik', type: 2, channel: 1, audience: 2, sent: 2, opened: 1, redeemed: 1, status: 'sent', inDays: -20 },
      { name: 'Sonbahar latte’si', type: 3, channel: 0, audience: 10, sent: 0, opened: 0, redeemed: 0, status: 'scheduled', inDays: 3 },
    ],
  },
  de: {
    brand: { name: 'Café Sonnenschein · Wiesbaden', tagline: 'Treuekarte', initials: 'CS', poster: 'Café Sonnenschein' },
    user: { name: 'Katharina Weber', role: 'Inhaberin' },
    notifications: [
      { text: 'Tim hat seinen Gratis-Cappuccino eingelöst', time: 'vor 12 Min.' },
      { text: 'Aktion „Doppelte Stempel“ erreichte 41 Gäste', time: 'vor 2 Std.' },
      { text: 'Neue Kundenkarte: Jonas Richter', time: 'Gestern' },
    ],
    customers: [
      { name: 'Sophie Becker', phone: '+49 151 2345 6789', stamps: 7, visits: 23, daysAgo: 1 },
      { name: 'Max Hoffmann', phone: '+49 160 9876 5432', stamps: 9, visits: 31, daysAgo: 0, bday: true },
      { name: 'Lea Schneider', phone: '+49 176 1122 3344', stamps: 3, visits: 8, daysAgo: 6 },
      { name: 'Tim Koch', phone: '+49 170 5566 7788', stamps: 10, visits: 40, daysAgo: 2 },
      { name: 'Jonas Richter', phone: '+49 157 3344 5566', stamps: 1, visits: 1, daysAgo: 1 },
      { name: 'Mia Wagner', phone: '+49 162 7788 9900', stamps: 5, visits: 14, daysAgo: 12 },
      { name: 'Paul Neumann', phone: '+49 171 4455 6677', stamps: 2, visits: 5, daysAgo: 38 },
      { name: 'Hannah Fischer', phone: '+49 152 8899 0011', stamps: 6, visits: 19, daysAgo: 4, bday: true },
      { name: 'Felix Schäfer', phone: '+49 173 2200 1133', stamps: 4, visits: 11, daysAgo: 45 },
      { name: 'Laura Bauer', phone: '+49 159 6677 8899', stamps: 8, visits: 26, daysAgo: 3 },
    ],
    rewards: [
      { stamps: 10, name: 'Gratis Cappuccino' },
      { stamps: 6, name: 'Keks zum Kaffee' },
      { stamps: 15, name: 'Gratis Stück Kuchen' },
    ],
    week: [44, 51, 39, 56, 72, 90, 63],
    rewardsMonth: 19,
    campaigns: [
      { name: 'Doppelte Stempel', type: 0, channel: 0, audience: 10, sent: 10, opened: 8, redeemed: 5, status: 'sent', inDays: -9 },
      { name: 'Wir vermissen Sie', type: 2, channel: 1, audience: 2, sent: 2, opened: 1, redeemed: 1, status: 'sent', inDays: -20 },
      { name: 'Herbst-Latte', type: 3, channel: 0, audience: 10, sent: 0, opened: 0, redeemed: 0, status: 'scheduled', inDays: 3 },
    ],
  },
  el: {
    brand: { name: 'Καφέ Αιγαίο · Θεσσαλονίκη', tagline: 'Κάρτα επιβράβευσης', initials: 'ΚΑ', poster: 'Καφέ Αιγαίο' },
    user: { name: 'Ελένη Παπαδοπούλου', role: 'Ιδιοκτήτρια' },
    notifications: [
      { text: 'Η Χριστίνα εξαργύρωσε τον δωρεάν freddo espresso', time: 'πριν από 12 λεπτά' },
      { text: 'Η καμπάνια «Διπλές σφραγίδες» έφτασε σε 41 πελάτες', time: 'πριν από 2 ώρες' },
      { text: 'Νέα κάρτα πελάτη: Γιάννης Οικονόμου', time: 'Χθες' },
    ],
    customers: [
      { name: 'Κώστας Δημητρίου', phone: '+30 694 123 4567', stamps: 7, visits: 23, daysAgo: 1 },
      { name: 'Άννα Γεωργίου', phone: '+30 697 765 4321', stamps: 9, visits: 31, daysAgo: 0, bday: true },
      { name: 'Νίκος Ιωάννου', phone: '+30 693 222 3344', stamps: 3, visits: 8, daysAgo: 6 },
      { name: 'Χριστίνα Αθανασίου', phone: '+30 698 555 6677', stamps: 10, visits: 40, daysAgo: 2 },
      { name: 'Γιάννης Οικονόμου', phone: '+30 690 311 2200', stamps: 1, visits: 1, daysAgo: 1 },
      { name: 'Μαρία Κωνσταντίνου', phone: '+30 695 889 1020', stamps: 5, visits: 14, daysAgo: 12 },
      { name: 'Δημήτρης Βασιλείου', phone: '+30 699 404 5566', stamps: 2, visits: 5, daysAgo: 38 },
      { name: 'Σοφία Νικολάου', phone: '+30 691 770 8899', stamps: 6, visits: 19, daysAgo: 4, bday: true },
      { name: 'Πέτρος Μαυρίδης', phone: '+30 692 150 3344', stamps: 4, visits: 11, daysAgo: 45 },
      { name: 'Ελένη Καραγιάννη', phone: '+30 697 606 7788', stamps: 8, visits: 26, daysAgo: 3 },
    ],
    rewards: [
      { stamps: 10, name: 'Δωρεάν freddo espresso' },
      { stamps: 6, name: 'Κουλουράκι δώρο στον καφέ' },
      { stamps: 15, name: 'Δωρεάν γλυκό του κουταλιού' },
    ],
    week: [36, 40, 33, 45, 58, 74, 52],
    rewardsMonth: 15,
    campaigns: [
      { name: 'Διπλές σφραγίδες', type: 0, channel: 0, audience: 10, sent: 10, opened: 8, redeemed: 5, status: 'sent', inDays: -9 },
      { name: 'Μας έλειψες', type: 2, channel: 1, audience: 2, sent: 2, opened: 1, redeemed: 1, status: 'sent', inDays: -20 },
      { name: 'Φθινοπωρινό latte', type: 3, channel: 0, audience: 10, sent: 0, opened: 0, redeemed: 0, status: 'scheduled', inDays: 3 },
    ],
  },
  en: {
    brand: { name: 'The Corner Café · Leeds', tagline: 'Loyalty card', initials: 'CC', poster: 'The Corner Café' },
    user: { name: 'Hannah Clarke', role: 'Owner' },
    notifications: [
      { text: 'Ella redeemed her free flat white', time: '12 min ago' },
      { text: '“Double stamp day” reached 41 customers', time: '2 hours ago' },
      { text: 'New loyalty card: Jack Turner', time: 'Yesterday' },
    ],
    customers: [
      { name: 'Oliver Bennett', phone: '+44 7700 900123', stamps: 7, visits: 23, daysAgo: 1 },
      { name: 'Grace Taylor', phone: '+44 7700 900456', stamps: 9, visits: 31, daysAgo: 0, bday: true },
      { name: 'Noah Walker', phone: '+44 7700 900789', stamps: 3, visits: 8, daysAgo: 6 },
      { name: 'Ella Hughes', phone: '+44 7700 900321', stamps: 10, visits: 40, daysAgo: 2 },
      { name: 'Jack Turner', phone: '+44 7700 900654', stamps: 1, visits: 1, daysAgo: 1 },
      { name: 'Amelia Wood', phone: '+44 7700 900987', stamps: 5, visits: 14, daysAgo: 12 },
      { name: 'Harry Evans', phone: '+44 7700 900246', stamps: 2, visits: 5, daysAgo: 38 },
      { name: 'Isla Roberts', phone: '+44 7700 900135', stamps: 6, visits: 19, daysAgo: 4, bday: true },
      { name: 'George Hall', phone: '+44 7700 900864', stamps: 4, visits: 11, daysAgo: 45 },
      { name: 'Poppy Green', phone: '+44 7700 900579', stamps: 8, visits: 26, daysAgo: 3 },
    ],
    rewards: [
      { stamps: 10, name: 'Free flat white' },
      { stamps: 6, name: 'Free biscuit with any coffee' },
      { stamps: 15, name: 'Free slice of cake' },
    ],
    week: [40, 46, 37, 52, 66, 84, 58],
    rewardsMonth: 18,
    campaigns: [
      { name: 'Double stamp day', type: 0, channel: 0, audience: 10, sent: 10, opened: 8, redeemed: 5, status: 'sent', inDays: -9 },
      { name: 'We miss you', type: 2, channel: 1, audience: 2, sent: 2, opened: 1, redeemed: 1, status: 'sent', inDays: -20 },
      { name: 'Autumn latte', type: 3, channel: 0, audience: 10, sent: 0, opened: 0, redeemed: 0, status: 'scheduled', inDays: 3 },
    ],
  },
};
