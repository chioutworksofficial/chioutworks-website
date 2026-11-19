import type { Lang } from '../../../translations';

export type Deal = 'buy' | 'rent';
export type PType = 'apartment' | 'house' | 'land' | 'commercial';
export interface Listing {
  id: string; deal: Deal; type: PType; rooms: number; area: number; price: number; loc: string;
  badge: '' | 'new' | 'reserved'; year: number; energy: string; title: string; desc: string;
}
export type ReqKind = 'enquiry' | 'valuation' | 'search';
export type ReqStatus = 'new' | 'contacted' | 'done';
export interface SeedReq { kind: ReqKind; name: string; email: string; phone: string; minAgo: number; status: ReqStatus; detail: string[] }

const L = (id: string, deal: Deal, type: PType, rooms: number, area: number, price: number, loc: string,
  badge: '' | 'new' | 'reserved', year: number, energy: string, title: string, desc: string): Listing =>
  ({ id, deal, type, rooms, area, price, loc, badge, year, energy, title, desc });

export const EMLAK_DATA: Record<Lang, {
  domain: string; name: string; tagline: string; initials: string; slugs: Record<'home' | 'list' | 'val' | 'search' | 'inbox', string>;
  phone: string; mail: string; address: string; hours: string; years: number; sold: number; rating: string;
  locs: string[]; listings: Listing[]; seeds: SeedReq[]; contactName: string;
}> = {
  tr: {
    domain: 'www.ornek-emlak.com.tr', name: 'Örnek Emlak', tagline: 'Nilüfer, Bursa', initials: 'ÖE',
    slugs: { home: 'anasayfa', list: 'ilanlar', val: 'degerleme', search: 'arama-talebi', inbox: 'talepler' },
    phone: '+90 224 555 01 12', mail: 'info@ornek-emlak.com.tr', address: 'Özlüce Mah. Atatürk Cad. No: 48, Nilüfer / Bursa', hours: 'Hafta içi 09:00–18:30 · Cumartesi 10:00–16:00',
    years: 14, sold: 640, rating: '4,9', contactName: 'Selin Aydın',
    locs: ['Özlüce', 'Görükle', 'Fethiye', 'Beşevler', 'Ata Evler', 'Odunluk'],
    listings: [
      L('t1', 'buy', 'apartment', 4, 145, 7900000, 'Özlüce', 'new', 2022, 'B', 'Özlüce’de site içinde 3+1 daire', 'Kapalı otoparklı, güvenlikli sitede güney cepheli 3+1. Mutfak ve banyo yeni, çocuk parkı ve spor salonu site içinde. Okullara yürüme mesafesi.'),
      L('t2', 'buy', 'house', 6, 260, 14500000, 'Görükle', '', 2019, 'B', 'Görükle’de bahçeli müstakil villa', 'Üç katlı, 400 m² bahçeli, ısı yalıtımlı villa. Yerden ısıtma, ayrı garaj ve manzaralı teras.'),
      L('t3', 'buy', 'apartment', 3, 105, 5350000, 'Beşevler', 'reserved', 2015, 'C', 'Beşevler’de metroya yakın 2+1', 'Merkezi konumda, bakımlı 2+1. Doğal gaz kombi, çelik kapı ve ferah balkon.'),
      L('t4', 'buy', 'land', 0, 850, 3900000, 'Odunluk', 'new', 0, '–', 'Odunluk’ta imarlı konut arsası', 'Tapusu temiz, yola cepheli, konut imarlı arsa. Elektrik ve su hattı parsel önünde.'),
      L('t5', 'buy', 'commercial', 0, 120, 9800000, 'Fethiye', '', 2018, 'C', 'Fethiye’de ana cadde üzeri dükkan', 'Yoğun yaya trafiği olan cadde üzerinde köşe dükkan. Asma katlı, vitrinli, kiracılı.'),
      L('t6', 'rent', 'apartment', 3, 95, 24000, 'Ata Evler', '', 2012, 'C', 'Ata Evler’de eşyalı 2+1 kiralık', 'Eşyalı, bakımlı 2+1. Aidat kiraya dahil değil, depozito iki kira bedelidir.'),
      L('t7', 'rent', 'apartment', 4, 135, 36000, 'Özlüce', 'new', 2021, 'B', 'Özlüce’de sitede 3+1 kiralık', 'Havuzlu ve güvenlikli sitede yeni teslim 3+1. Aile için uygun, evcil hayvana izin var.'),
      L('t8', 'rent', 'commercial', 0, 75, 28000, 'Görükle', '', 2016, 'D', 'Görükle’de kafe için ruhsatlı dükkan', 'Üniversiteye yakın, ruhsatlı, tadilat yapılmış dükkan. Teras izni mevcut.'),
      L('t9', 'rent', 'house', 5, 180, 55000, 'Fethiye', '', 2020, 'B', 'Fethiye’de kiralık ikiz villa', 'Bahçeli ve iki otoparklı ikiz villa. Isıtma doğal gaz, yıllık sözleşme.'),
    ],
    seeds: [
      { kind: 'enquiry', name: 'Murat Kaya', email: 'murat.kaya@example.com', phone: '+90 532 555 01 34', minAgo: 25, status: 'new', detail: ['İlan: Özlüce’de site içinde 3+1 daire', 'Mesaj: Hafta sonu görmek istiyoruz, uygun musunuz?'] },
      { kind: 'valuation', name: 'Zeynep Arslan', email: 'zeynep.arslan@example.com', phone: '+90 533 555 02 71', minAgo: 190, status: 'new', detail: ['Tür: Daire', 'Adres: Beşevler, Nilüfer', 'Alan: 110 m² · 3 oda · Yapım yılı: 2010', 'Durum: İyi'] },
      { kind: 'search', name: 'Kemal Şahin', email: 'kemal.sahin@example.com', phone: '+90 535 555 09 18', minAgo: 1500, status: 'contacted', detail: ['Satılık · Konut · Daire', 'Alan: en az 120 m² · 3 oda', 'Konum: Görükle, Özlüce · Bütçe: 8.000.000'] },
    ],
  },
  de: {
    domain: 'www.musterhaus-immobilien.de', name: 'Musterhaus Immobilien', tagline: 'Bad Homburg', initials: 'MI',
    slugs: { home: 'start', list: 'angebote', val: 'wertermittlung', search: 'suchauftrag', inbox: 'anfragen' },
    phone: '+49 6172 555 012', mail: 'info@musterhaus-immobilien.de', address: 'Kirchstraße 14, 61348 Bad Homburg', hours: 'Mo–Fr 9:00–18:00 · Sa nach Vereinbarung',
    years: 18, sold: 520, rating: '4,9', contactName: 'Anna Berger',
    locs: ['Bad Homburg', 'Oberursel', 'Friedrichsdorf', 'Kronberg im Taunus', 'Königstein im Taunus', 'Usingen'],
    listings: [
      L('d1', 'buy', 'apartment', 3, 92, 289000, 'Bad Homburg', 'new', 2021, 'B (68 kWh/(m²·a))', 'Helle 3-Zimmer-Wohnung mit Balkon', 'Moderne Eigentumswohnung im zweiten Obergeschoss, Fußbodenheizung, Einbauküche und Tiefgaragenstellplatz. Bahnhof in zehn Minuten zu Fuß.'),
      L('d2', 'buy', 'house', 6, 168, 549000, 'Oberursel', '', 2008, 'C (96 kWh/(m²·a))', 'Einfamilienhaus mit Garten und Garage', 'Gepflegtes Haus in ruhiger Sackgasse, 620 m² Grundstück, Wärmepumpe, Terrasse nach Süden und ausgebauter Keller.'),
      L('d3', 'buy', 'apartment', 2, 61, 189000, 'Königstein im Taunus', 'reserved', 1998, 'D (121 kWh/(m²·a))', 'Kompakte Kapitalanlage nahe der Lahn', 'Vermietete 2-Zimmer-Wohnung, Mieteinnahmen 6.480 € pro Jahr, Hausgeld 240 € monatlich.'),
      L('d4', 'buy', 'land', 0, 710, 135000, 'Usingen', 'new', 0, '–', 'Baugrundstück in Ortsrandlage', 'Voll erschlossenes, ebenes Grundstück, Bebauung nach § 34 BauGB möglich. Bodengutachten liegt vor.'),
      L('d5', 'buy', 'commercial', 0, 140, 395000, 'Bad Homburg', '', 2005, 'C (104 kWh/(m²·a))', 'Ladenfläche in der Fußgängerzone', 'Lauflage mit großer Schaufensterfront, Lager im Untergeschoss, langfristig vermietet.'),
      L('d6', 'rent', 'apartment', 2, 58, 720, 'Friedrichsdorf', '', 2012, 'C (88 kWh/(m²·a))', '2-Zimmer-Wohnung mit Einbauküche', 'Kaltmiete zuzüglich 140 € Nebenkosten, Kaution drei Monatsmieten, ab sofort frei.'),
      L('d7', 'rent', 'apartment', 4, 112, 1180, 'Bad Homburg', 'new', 2020, 'A (42 kWh/(m²·a))', 'Neubauwohnung mit Dachterrasse', 'Barrierearm mit Aufzug, Fußbodenheizung, Wallbox-Vorbereitung und Kellerabteil.'),
      L('d8', 'rent', 'commercial', 0, 85, 1250, 'Kronberg im Taunus', '', 2010, 'D (134 kWh/(m²·a))', 'Büro- oder Praxisräume im Erdgeschoss', 'Ebenerdig, barrierefrei, drei Räume plus Teeküche, Stellplätze vor dem Haus.'),
      L('d9', 'rent', 'house', 5, 140, 1650, 'Oberursel', '', 2015, 'B (64 kWh/(m²·a))', 'Doppelhaushälfte mit Garten', 'Familienfreundliche Doppelhaushälfte, Einbauküche, Carport, Haustiere nach Absprache.'),
    ],
    seeds: [
      { kind: 'enquiry', name: 'Thomas Weber', email: 'thomas.weber@example.com', phone: '+49 151 5550 1234', minAgo: 25, status: 'new', detail: ['Objekt: Helle 3-Zimmer-Wohnung mit Balkon', 'Nachricht: Wäre ein Besichtigungstermin am Samstag möglich?'] },
      { kind: 'valuation', name: 'Sabine Hoffmann', email: 'sabine.hoffmann@example.com', phone: '+49 160 5550 7788', minAgo: 190, status: 'new', detail: ['Objektart: Haus', 'Adresse: Oberursel, Gartenstraße', 'Fläche: 150 m² · 5 Zimmer · Baujahr: 1996', 'Zustand: Gut'] },
      { kind: 'search', name: 'Markus Schneider', email: 'markus.schneider@example.com', phone: '+49 170 5550 4321', minAgo: 1500, status: 'contacted', detail: ['Kaufen · Wohnen · Haus', 'Fläche: ab 130 m² · 5 Zimmer', 'Lage: Bad Homburg, Oberursel · Budget: 550.000'] },
    ],
  },
  el: {
    domain: 'www.paradeigma-akinita.gr', name: 'Παράδειγμα Ακίνητα', tagline: 'Καλαμαριά, Θεσσαλονίκη', initials: 'ΠΑ',
    slugs: { home: 'arxiki', list: 'aggelies', val: 'ektimisi', search: 'anazitisi', inbox: 'aitimata' },
    phone: '+30 2310 555 012', mail: 'info@paradeigma-akinita.gr', address: 'Αριστοτέλους 42, Καλαμαριά, Θεσσαλονίκη', hours: 'Δευ–Παρ 9:00–20:00 · Σάβ 10:00–14:00',
    years: 16, sold: 480, rating: '4,9', contactName: 'Ελένη Παπαδοπούλου',
    locs: ['Καλαμαριά', 'Πυλαία', 'Τούμπα', 'Θέρμη', 'Νέα Κρήνη', 'Περαία'],
    listings: [
      L('g1', 'buy', 'apartment', 3, 98, 215000, 'Καλαμαριά', 'new', 2020, 'Β', 'Διαμέρισμα 3 υπνοδωματίων κοντά στη θάλασσα', 'Φωτεινό διαμέρισμα 4ου ορόφου με θέα, ηλιακό θερμοσίφωνα, αποθήκη και θέση στάθμευσης. Σε απόσταση πέντε λεπτών από την παραλία.'),
      L('g2', 'buy', 'house', 6, 190, 420000, 'Πυλαία', '', 2012, 'Β+', 'Μονοκατοικία με κήπο στην Πυλαία', 'Διώροφη μονοκατοικία με κήπο 300 τ.μ., ενδοδαπέδια θέρμανση, τζάκι και γκαράζ δύο θέσεων.'),
      L('g3', 'buy', 'apartment', 2, 62, 118000, 'Τούμπα', 'reserved', 1995, 'Δ', 'Ανακαινισμένο διαμέρισμα 2 δωματίων', 'Ανακαινισμένο το 2022, με νέα κουζίνα, μπάνιο και κουφώματα. Ιδανικό για επένδυση.'),
      L('g4', 'buy', 'land', 0, 620, 98000, 'Θέρμη', 'new', 0, '–', 'Οικόπεδο εντός σχεδίου στη Θέρμη', 'Άρτιο και οικοδομήσιμο οικόπεδο, με πρόσωπο σε δρόμο και άδεια τεχνικών δικτύων.'),
      L('g5', 'buy', 'commercial', 0, 110, 260000, 'Νέα Κρήνη', '', 2008, 'Γ', 'Κατάστημα σε κεντρικό δρόμο', 'Γωνιακό κατάστημα με μεγάλη βιτρίνα, πατάρι και μισθωτή με μακροχρόνιο συμβόλαιο.'),
      L('g6', 'rent', 'apartment', 2, 60, 520, 'Καλαμαριά', '', 2010, 'Γ', 'Επιπλωμένο διαμέρισμα 2 δωματίων', 'Επιπλωμένο με αυτόνομη θέρμανση και κλιματιστικά. Τα κοινόχρηστα δεν περιλαμβάνονται.'),
      L('g7', 'rent', 'apartment', 3, 95, 780, 'Πυλαία', 'new', 2021, 'Α', 'Νεόδμητο διαμέρισμα με ταράτσα', 'Νεόδμητο με ανελκυστήρα, ηλιακό και ιδιωτική ταράτσα. Επιτρέπονται κατοικίδια.'),
      L('g8', 'rent', 'commercial', 0, 70, 900, 'Περαία', '', 2014, 'Γ', 'Κατάστημα για καφέ-σνακ', 'Με άδεια λειτουργίας και χώρο για τραπέζια έξω, σε πολυσύχναστο πεζόδρομο.'),
      L('g9', 'rent', 'house', 5, 150, 1350, 'Θέρμη', '', 2018, 'Β', 'Μεζονέτα με κήπο προς ενοικίαση', 'Μεζονέτα με αυλή, δύο χώρους στάθμευσης και αυτόνομη θέρμανση φυσικού αερίου.'),
    ],
    seeds: [
      { kind: 'enquiry', name: 'Νίκος Γεωργίου', email: 'nikos.georgiou@example.com', phone: '+30 697 555 0123', minAgo: 25, status: 'new', detail: ['Ακίνητο: Διαμέρισμα 3 υπνοδωματίων κοντά στη θάλασσα', 'Μήνυμα: Θα θέλαμε να το δούμε το Σάββατο.'] },
      { kind: 'valuation', name: 'Μαρία Δημητρίου', email: 'maria.dimitriou@example.com', phone: '+30 694 555 0456', minAgo: 190, status: 'new', detail: ['Τύπος: Διαμέρισμα', 'Διεύθυνση: Τούμπα, Θεσσαλονίκη', 'Εμβαδόν: 85 τ.μ. · 3 δωμάτια · Έτος κατασκευής: 2004', 'Κατάσταση: Καλή'] },
      { kind: 'search', name: 'Γιάννης Παπαδάκης', email: 'giannis.papadakis@example.com', phone: '+30 698 555 0789', minAgo: 1500, status: 'contacted', detail: ['Αγορά · Κατοικία · Μονοκατοικία', 'Εμβαδόν: από 150 τ.μ. · 5 δωμάτια', 'Περιοχή: Πυλαία, Θέρμη · Προϋπολογισμός: 450.000'] },
    ],
  },
  en: {
    domain: 'www.example-homes.co.uk', name: 'Example Homes', tagline: 'Harrogate', initials: 'EH',
    slugs: { home: 'home', list: 'listings', val: 'valuation', search: 'search-request', inbox: 'requests' },
    phone: '+44 1423 555 012', mail: 'hello@example-homes.co.uk', address: '12 Station Parade, Harrogate HG1 1TE', hours: 'Mon–Fri 9am–5:30pm · Sat 9am–1pm',
    years: 15, sold: 710, rating: '4.9', contactName: 'Charlotte Hughes',
    locs: ['Harrogate', 'Knaresborough', 'Starbeck', 'Killinghall', 'Pannal', 'Ripon'],
    listings: [
      L('e1', 'buy', 'apartment', 2, 74, 235000, 'Harrogate', 'new', 2019, 'C (74)', 'Two-bedroom flat near the Stray', 'Bright second-floor flat with a private balcony, allocated parking and a long lease. Five minutes from the town centre and station.'),
      L('e2', 'buy', 'house', 4, 148, 645000, 'Pannal', '', 2005, 'B (84)', 'Detached four-bedroom family home', 'Well-kept detached house on a quiet lane, with a landscaped garden, double garage and a south-facing patio.'),
      L('e3', 'buy', 'house', 3, 96, 349950, 'Knaresborough', 'reserved', 1932, 'D (61)', 'Period three-bedroom semi with character', 'Original features, a new boiler and a generous rear garden, moments from the viaduct and riverside walks.'),
      L('e4', 'buy', 'land', 0, 1200, 275000, 'Killinghall', 'new', 0, '–', 'Building plot with planning permission', 'Level plot with outline planning for one dwelling. Services at the road; ground survey available.'),
      L('e5', 'buy', 'commercial', 0, 110, 425000, 'Harrogate', '', 2002, 'C (70)', 'Ground-floor retail unit on a prime street', 'Corner unit with a wide shop frontage, rear storage and a tenant in place on a five-year lease.'),
      L('e6', 'rent', 'apartment', 2, 68, 1050, 'Starbeck', '', 2014, 'C (72)', 'Furnished two-bedroom flat, pcm', 'Furnished flat with off-street parking. Deposit of five weeks, bills not included.'),
      L('e7', 'rent', 'house', 3, 105, 1450, 'Harrogate', 'new', 2018, 'B (83)', 'Modern three-bedroom townhouse, pcm', 'Open-plan kitchen diner, small garden and a driveway. Pets considered, available from next month.'),
      L('e8', 'rent', 'commercial', 0, 65, 1400, 'Ripon', '', 2010, 'D (88)', 'Café or studio unit near the market square', 'Ground-floor unit with a kitchen installed, shopfront and an outdoor seating licence.'),
      L('e9', 'rent', 'house', 4, 130, 1895, 'Killinghall', '', 2012, 'B (81)', 'Four-bedroom detached house, pcm', 'Detached family home with a driveway, enclosed garden and a utility room. Long let preferred.'),
    ],
    seeds: [
      { kind: 'enquiry', name: 'James Whitaker', email: 'james.whitaker@example.com', phone: '+44 7700 900123', minAgo: 25, status: 'new', detail: ['Property: Two-bedroom flat near the Stray', 'Message: Could we arrange a viewing this Saturday?'] },
      { kind: 'valuation', name: 'Emily Clarke', email: 'emily.clarke@example.com', phone: '+44 7700 900456', minAgo: 190, status: 'new', detail: ['Type: House', 'Address: Starbeck, Harrogate', 'Size: 105 m² · 3 rooms · Built: 1998', 'Condition: Good'] },
      { kind: 'search', name: 'Oliver Bennett', email: 'oliver.bennett@example.com', phone: '+44 7700 900789', minAgo: 1500, status: 'contacted', detail: ['Buy · Residential · House', 'Size: from 120 m² · 4 rooms', 'Area: Pannal, Killinghall · Budget: 650,000'] },
    ],
  },
};
