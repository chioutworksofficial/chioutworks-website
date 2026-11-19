import type { Lang } from '../../../translations';

// Market-specific sample data for the logistics website demo.

export interface Service { id: string; title: string; desc: string; includes: string[]; customers: string; capacity: string }
export interface Location { city: string; address: string; person: string; role: string; phone: string; email: string; hours: string; note: string }
export interface Job { id: string; title: string; place: string; type: string; licence: boolean; desc: string }
export interface News { title: string; body: string; daysAgo: number }
export interface SeedRequest { kind: 'quote' | 'job'; name: string; org: string; summary: string; daysAgo: number; status: 0 | 1 | 2 }

export interface LojistikData {
  domain: string; brand: string; short: string; initials: string; tagline: string; locale: string;
  user: { name: string; role: string };
  numbers: { vehicles: number; sqm: number; daily: number; years: number };
  clients: string[]; services: Service[]; locations: Location[]; jobs: Job[]; news: News[];
  licences: string[]; goods: string[]; seed: SeedRequest[]; phonePh: string; postPh: string; prefix: string;
}

export const LOJISTIK_DATA: Record<Lang, LojistikData> = {
  en: {
    domain: 'www.example-logistics.co.uk', brand: 'Example Logistics Ltd · Leeds', short: 'Example Logistics', initials: 'EL',
    tagline: 'Freight, storage and delivery across the UK', locale: 'en-GB',
    user: { name: 'Daniel Hartley', role: 'Transport manager' },
    numbers: { vehicles: 148, sqm: 62000, daily: 1850, years: 24 },
    clients: ['Northfield Foods', 'Pennine Build', 'Aire Valley Retail', 'Brookside Pharma', 'Mersey Auto Parts', 'Hallam Furniture'],
    services: [
      { id: 'road', title: 'Road freight', desc: 'Full loads, part loads and pallet networks across the UK and Ireland.', includes: ['Full and part loads', 'Pallet network with next-day delivery', 'Live tracking and proof of delivery', 'Tail-lift and curtain-sider vehicles'], customers: 'Manufacturers, wholesalers, building suppliers', capacity: '148 vehicles, 26 t HGVs and 7.5 t rigids' },
      { id: 'warehouse', title: 'Warehousing', desc: 'Secure, ambient and temperature-controlled storage with real-time stock visibility.', includes: ['Pallet and shelf storage', 'Temperature-controlled zone (2–8 °C)', 'Goods in, put-away and stock counts', 'Customer portal with live stock levels'], customers: 'Retailers, food producers, importers', capacity: '62,000 m² across three sites, 41,000 pallet places' },
      { id: 'contract', title: 'Contract logistics', desc: 'Dedicated teams, vehicles and processes built around your supply chain.', includes: ['Pick, pack and returns handling', 'Dedicated fleet in your livery', 'Kitting and light assembly', 'Monthly performance reviews'], customers: 'Retail chains, online sellers, automotive suppliers', capacity: '210 trained staff, WMS-integrated shifts' },
      { id: 'express', title: 'Express and same-day', desc: 'Urgent deliveries collected within 90 minutes, day or night.', includes: ['Collection within 90 minutes', 'Dedicated vehicle, no groupage', 'Out-of-hours and weekend service', 'Direct driver phone line'], customers: 'Manufacturers, hospitals, event organisers', capacity: '24 express vans, 24/7 dispatch desk' },
      { id: 'customs', title: 'Customs clearance', desc: 'Import and export declarations handled by our in-house customs team.', includes: ['Import and export declarations', 'Commodity codes and duty advice', 'Transit and bonded movements', 'Support with post-Brexit paperwork'], customers: 'Importers, exporters, e-commerce sellers', capacity: '8 customs specialists, direct links to major ports' },
    ],
    locations: [
      { city: 'Leeds', address: 'Aire Park Distribution Centre, Gelderd Road, Leeds LS12 6LT', person: 'Sarah Whitfield', role: 'Site manager', phone: '+44 113 496 0142', email: 'leeds@example-logistics.co.uk', hours: 'Mon–Fri 06:00–22:00, Sat 07:00–15:00', note: 'Head office, cross-dock and ambient storage' },
      { city: 'Doncaster', address: 'iPort Logistics Park, Rossington Road, Doncaster DN11 0FQ', person: 'Mark Ellison', role: 'Operations manager', phone: '+44 1302 555 0187', email: 'doncaster@example-logistics.co.uk', hours: 'Mon–Fri 05:00–23:00, Sat 06:00–18:00', note: 'Temperature-controlled warehouse and rail terminal access' },
      { city: 'Manchester', address: 'Trafford Park Freight Hub, Barton Dock Road, Manchester M17 1SN', person: 'Priya Nair', role: 'Customer services lead', phone: '+44 161 496 0233', email: 'manchester@example-logistics.co.uk', hours: 'Mon–Fri 07:00–20:00, Sat 08:00–14:00', note: 'Pallet network hub and express desk' },
    ],
    jobs: [
      { id: 'j1', title: 'HGV Class 1 (C+E) driver', place: 'Leeds', type: 'Full-time', licence: true, desc: 'Regional and national routes, home most nights. Digital tachograph card and CPC required.' },
      { id: 'j2', title: 'Warehouse operative', place: 'Doncaster', type: 'Shifts', licence: false, desc: 'Picking, loading and forklift duties. FLT licence is a plus, training provided.' },
      { id: 'j3', title: 'Transport planner / dispatcher', place: 'Manchester', type: 'Full-time', licence: false, desc: 'Plan daily routes, brief drivers and keep customers informed.' },
      { id: 'j4', title: 'Customer service administrator', place: 'Leeds', type: 'Full-time', licence: false, desc: 'Quotes, bookings and invoicing queries. Office hours, hybrid after probation.' },
    ],
    news: [
      { title: 'New temperature-controlled bay opens in Doncaster', body: 'Another 6,000 pallet places for chilled food and pharma, with 24/7 temperature logging.', daysAgo: 9 },
      { title: 'Fifteen electric vans join our Manchester express fleet', body: 'Same-day deliveries inside the M60 now run fully electric, with live emissions reporting per job.', daysAgo: 31 },
    ],
    licences: ['Category B (car)', 'Category C (rigid HGV)', 'Category C+E (artic HGV)', 'No driving licence'],
    goods: ['Pallets (general cargo)', 'Food and drink', 'Building materials', 'Machinery and parts', 'Furniture', 'Pharmaceuticals', 'Other'],
    phonePh: '+44 7700 900123', postPh: 'LS12 6LT', prefix: 'LQ',
    seed: [
      { kind: 'quote', name: 'Helen Barker', org: 'Northfield Foods', summary: '12 pallets, 7,400 kg, Leeds LS12 to Glasgow G1, food and drink', daysAgo: 1, status: 0 },
      { kind: 'job', name: 'Tom Ashworth', org: 'HGV Class 1 (C+E) driver', summary: 'Licence: Category C+E, CV: tom-ashworth-cv.pdf', daysAgo: 2, status: 1 },
      { kind: 'quote', name: 'Imran Hussain', org: 'Hallam Furniture', summary: '6 pallets, 2,100 kg, Sheffield S9 to Bristol BS3, furniture', daysAgo: 4, status: 2 },
    ],
  },
  de: {
    domain: 'www.muster-logistik.de', brand: 'Muster Logistik GmbH · Essen', short: 'Muster Logistik', initials: 'ML',
    tagline: 'Transport, Lagerung und Zustellung im Ruhrgebiet und darüber hinaus', locale: 'de-DE',
    user: { name: 'Jürgen Kowalski', role: 'Disposition und Leitung' },
    numbers: { vehicles: 126, sqm: 54000, daily: 1620, years: 31 },
    clients: ['Ruhrstahl Handel', 'Emscher Lebensmittel', 'Rheinbau Systeme', 'Haus & Garten Nord', 'Pharma Westfalen', 'Autoteile Niederrhein'],
    services: [
      { id: 'road', title: 'Stückgut und Komplettladungen', desc: 'Komplett- und Teilladungen sowie Palettenverkehr in Deutschland und Europa.', includes: ['Komplett- und Teilladungen', 'Palettensystem mit Zustellung am nächsten Werktag', 'Sendungsverfolgung und digitaler Ablieferbeleg', 'Fahrzeuge mit Hebebühne und Planenaufbau'], customers: 'Hersteller, Großhändler, Baustoffhandel', capacity: '126 Fahrzeuge, 40-t-Sattelzüge und 7,5-t-Lkw' },
      { id: 'warehouse', title: 'Lagerlogistik', desc: 'Sichere Lagerung bei Normaltemperatur oder gekühlt, mit Bestandsübersicht in Echtzeit.', includes: ['Palettenlager und Fachbodenlager', 'Kühlbereich (2–8 °C)', 'Wareneingang, Einlagerung und Inventur', 'Kundenportal mit aktuellen Beständen'], customers: 'Händler, Lebensmittelhersteller, Importeure', capacity: '54.000 m² an drei Standorten, 36.000 Palettenplätze' },
      { id: 'contract', title: 'Kontraktlogistik', desc: 'Eigene Teams, Fahrzeuge und Abläufe, genau auf Ihre Lieferkette abgestimmt.', includes: ['Kommissionieren, Verpacken und Retouren', 'Dedizierter Fuhrpark im Kundendesign', 'Konfektionierung und einfache Montage', 'Monatliche Leistungsberichte'], customers: 'Handelsketten, Onlinehändler, Automobilzulieferer', capacity: '180 geschulte Mitarbeitende, Schichten mit Lagerverwaltungssystem' },
      { id: 'express', title: 'Express und Same-Day', desc: 'Eilsendungen werden innerhalb von 90 Minuten abgeholt, Tag und Nacht.', includes: ['Abholung innerhalb von 90 Minuten', 'Exklusivfahrt ohne Beiladung', 'Service außerhalb der Geschäftszeiten und am Wochenende', 'Direkte Telefonnummer zum Fahrer'], customers: 'Industrie, Kliniken, Veranstalter', capacity: '22 Expresstransporter, Disposition rund um die Uhr' },
      { id: 'customs', title: 'Zollabwicklung', desc: 'Ein- und Ausfuhranmeldungen durch unser eigenes Zollteam.', includes: ['Ein- und Ausfuhranmeldungen', 'Zolltarifnummern und Beratung zu Abgaben', 'Versand- und Zolllagerverfahren', 'Unterstützung bei Ursprungsnachweisen'], customers: 'Importeure, Exporteure, Onlinehändler', capacity: '7 Zollspezialisten, direkte Anbindung an die Häfen Duisburg und Rotterdam' },
    ],
    locations: [
      { city: 'Essen', address: 'Logistikpark Essen-Nord, Am Zehnthof 18, 45307 Essen', person: 'Sabine Vogel', role: 'Standortleiterin', phone: '+49 201 5550 142', email: 'essen@muster-logistik.de', hours: 'Mo–Fr 06:00–22:00, Sa 07:00–14:00', note: 'Hauptsitz, Umschlaghalle und Trockenlager' },
      { city: 'Duisburg', address: 'Hafenstraße 112, 47137 Duisburg-Ruhrort', person: 'Thomas Brandt', role: 'Betriebsleiter', phone: '+49 203 5550 187', email: 'duisburg@muster-logistik.de', hours: 'Mo–Fr 05:00–23:00, Sa 06:00–18:00', note: 'Kühllager mit Anschluss an Hafen und Bahnterminal' },
      { city: 'Dortmund', address: 'Gewerbepark Westfalenhütte, Rheinische Straße 240, 44147 Dortmund', person: 'Aylin Demir', role: 'Leiterin Kundenservice', phone: '+49 231 5550 233', email: 'dortmund@muster-logistik.de', hours: 'Mo–Fr 07:00–20:00, Sa 08:00–13:00', note: 'Palettenhub und Express-Disposition' },
    ],
    jobs: [
      { id: 'j1', title: 'Berufskraftfahrer (m/w/d) Klasse CE', place: 'Essen', type: 'Vollzeit', licence: true, desc: 'Nah- und Fernverkehr, meist jeden Abend zu Hause. Führerschein CE, Fahrerkarte und Code 95 erforderlich.' },
      { id: 'j2', title: 'Lagermitarbeiter (m/w/d)', place: 'Duisburg', type: 'Schicht', licence: false, desc: 'Kommissionieren, Verladen und Staplerfahren. Staplerschein von Vorteil, Einarbeitung inklusive.' },
      { id: 'j3', title: 'Disponent (m/w/d)', place: 'Dortmund', type: 'Vollzeit', licence: false, desc: 'Touren planen, Fahrer einweisen und Kunden zuverlässig informieren.' },
      { id: 'j4', title: 'Sachbearbeiter Kundenservice (m/w/d)', place: 'Essen', type: 'Vollzeit', licence: false, desc: 'Angebote, Buchungen und Rechnungsfragen. Bürozeiten, nach der Probezeit teilweise mobil.' },
    ],
    news: [
      { title: 'Neue Kühlhalle in Duisburg eröffnet', body: 'Weitere 6.000 Palettenplätze für Frischware und Pharma, mit lückenloser Temperaturaufzeichnung.', daysAgo: 8 },
      { title: 'Zwölf Elektrotransporter verstärken die Express-Flotte', body: 'Same-Day-Zustellungen im Stadtgebiet Dortmund fahren jetzt vollelektrisch, mit CO₂-Nachweis pro Auftrag.', daysAgo: 29 },
    ],
    licences: ['Klasse B (Pkw)', 'Klasse C (Lkw)', 'Klasse CE (Sattelzug)', 'Kein Führerschein'],
    goods: ['Paletten (Stückgut)', 'Lebensmittel und Getränke', 'Baustoffe', 'Maschinen und Teile', 'Möbel', 'Pharmazeutika', 'Sonstiges'],
    phonePh: '+49 170 1234567', postPh: '45307', prefix: 'AN',
    seed: [
      { kind: 'quote', name: 'Petra Lindner', org: 'Emscher Lebensmittel', summary: '12 Paletten, 7.400 kg, 45307 Essen nach 20095 Hamburg, Lebensmittel und Getränke', daysAgo: 1, status: 0 },
      { kind: 'job', name: 'Marcin Zielinski', org: 'Berufskraftfahrer (m/w/d) Klasse CE', summary: 'Führerschein: Klasse CE, Lebenslauf: zielinski-lebenslauf.pdf', daysAgo: 2, status: 1 },
      { kind: 'quote', name: 'Stefan Wolter', org: 'Haus & Garten Nord', summary: '6 Paletten, 2.100 kg, 44147 Dortmund nach 80331 München, Möbel', daysAgo: 4, status: 2 },
    ],
  },
  tr: {
    domain: 'www.ornek-lojistik.com.tr', brand: 'Örnek Lojistik · Gebze', short: 'Örnek Lojistik', initials: 'ÖL',
    tagline: 'Marmara\'dan Ege\'ye karayolu, depolama ve dağıtım', locale: 'tr-TR',
    user: { name: 'Hakan Yıldırım', role: 'Operasyon müdürü' },
    numbers: { vehicles: 164, sqm: 71000, daily: 2300, years: 19 },
    clients: ['Marmara Gıda', 'Anadolu Yapı Market', 'Ege Tekstil', 'Boğaziçi Ecza', 'Kocaeli Oto Yedek', 'Trakya Mobilya'],
    services: [
      { id: 'road', title: 'Karayolu taşımacılığı', desc: 'Komple ve parsiyel yükler, palet ağı ile Türkiye genelinde taşıma.', includes: ['Komple ve parsiyel yük', 'Ertesi gün teslimat palet ağı', 'Canlı araç takibi ve dijital teslim belgesi', 'Kapalı kasa ve tenteli araçlar'], customers: 'Üreticiler, toptancılar, yapı malzemesi firmaları', capacity: '164 araç, 24 tonluk tırlar ve 8 tonluk kamyonlar' },
      { id: 'warehouse', title: 'Depolama', desc: 'Normal ve soğuk zincir depolama; stok durumu anlık olarak izlenir.', includes: ['Palet ve raf depolama', 'Soğuk oda (2–8 °C)', 'Mal kabul, yerleştirme ve sayım', 'Anlık stok görünen müşteri paneli'], customers: 'Perakendeciler, gıda üreticileri, ithalatçılar', capacity: 'Üç tesiste 71.000 m², 48.000 palet yeri' },
      { id: 'contract', title: 'Sözleşmeli lojistik', desc: 'Tedarik zincirinize özel ekip, araç ve süreçler.', includes: ['Toplama, paketleme ve iade yönetimi', 'Markanıza özel araç filosu', 'Set hazırlama ve basit montaj', 'Aylık performans raporu'], customers: 'Zincir mağazalar, e-ticaret satıcıları, otomotiv yan sanayi', capacity: '240 eğitimli personel, depo yönetim sistemi entegrasyonlu vardiyalar' },
      { id: 'express', title: 'Acil ve aynı gün teslimat', desc: 'Acil sevkiyatlar 90 dakika içinde alınır, gece gündüz.', includes: ['90 dakika içinde yükleme', 'Size özel araç, ek yük almadan', 'Mesai dışı ve hafta sonu hizmeti', 'Şoförle doğrudan telefon hattı'], customers: 'Fabrikalar, hastaneler, etkinlik organizatörleri', capacity: '30 acil teslimat aracı, 7/24 sevkiyat masası' },
      { id: 'customs', title: 'Gümrük işlemleri', desc: 'İthalat ve ihracat beyannameleri kendi gümrük ekibimizle hazırlanır.', includes: ['İthalat ve ihracat beyannameleri', 'GTİP tespiti ve vergi danışmanlığı', 'Transit ve antrepo işlemleri', 'Menşe ve ATR belgesi desteği'], customers: 'İthalatçılar, ihracatçılar, e-ticaret satıcıları', capacity: '9 gümrük uzmanı, Ambarlı ve Kocaeli limanlarına doğrudan erişim' },
    ],
    locations: [
      { city: 'Gebze', address: 'Gebze Organize Sanayi Bölgesi, 800. Sokak No: 14, Gebze / Kocaeli', person: 'Selin Aksoy', role: 'Tesis müdürü', phone: '+90 262 555 01 42', email: 'gebze@ornek-lojistik.com.tr', hours: 'Pzt–Cum 06:00–22:00, Cmt 07:00–15:00', note: 'Genel merkez, aktarma merkezi ve kuru depo' },
      { city: 'Hadımköy', address: 'Hadımköy Lojistik Üssü, Mahmutbey Yolu No: 62, Arnavutköy / İstanbul', person: 'Murat Kaya', role: 'Operasyon yöneticisi', phone: '+90 212 555 01 87', email: 'hadimkoy@ornek-lojistik.com.tr', hours: 'Pzt–Cum 05:00–23:00, Cmt 06:00–18:00', note: 'Soğuk zincir deposu ve Avrupa yakası dağıtımı' },
      { city: 'Kemalpaşa', address: 'Kemalpaşa Organize Sanayi Bölgesi, 2. Cadde No: 31, Kemalpaşa / İzmir', person: 'Deniz Çelik', role: 'Müşteri hizmetleri sorumlusu', phone: '+90 232 555 02 33', email: 'kemalpasa@ornek-lojistik.com.tr', hours: 'Pzt–Cum 07:00–20:00, Cmt 08:00–14:00', note: 'Ege palet ağı merkezi ve acil teslimat masası' },
    ],
    jobs: [
      { id: 'j1', title: 'CE sınıfı tır şoförü', place: 'Gebze', type: 'Tam zamanlı', licence: true, desc: 'Yurt içi hatlar, düzenli sefer programı. CE ehliyeti, SRC ve psikoteknik belgesi gerekir.' },
      { id: 'j2', title: 'Depo elemanı', place: 'Hadımköy', type: 'Vardiyalı', licence: false, desc: 'Toplama, yükleme ve forklift kullanımı. Forklift belgesi artı, eğitim verilir.' },
      { id: 'j3', title: 'Sevkiyat planlama uzmanı', place: 'Kemalpaşa', type: 'Tam zamanlı', licence: false, desc: 'Günlük rotaları planlama, şoförleri yönlendirme ve müşterileri bilgilendirme.' },
      { id: 'j4', title: 'Müşteri hizmetleri ofis elemanı', place: 'Gebze', type: 'Tam zamanlı', licence: false, desc: 'Teklif, rezervasyon ve fatura soruları. Ofis mesaisi.' },
    ],
    news: [
      { title: 'Hadımköy\'de yeni soğuk hava deposu hizmete girdi', body: 'Taze gıda ve ilaç için 7.000 palet yeri daha; 7/24 sıcaklık kaydı ile.', daysAgo: 7 },
      { title: 'Elektrikli teslimat araçlarımız Kemalpaşa\'da yola çıktı', body: 'İzmir içi aynı gün teslimatlar artık tam elektrikli, iş başına karbon raporu ile.', daysAgo: 26 },
    ],
    licences: ['B sınıfı (otomobil)', 'C sınıfı (kamyon)', 'CE sınıfı (tır)', 'Ehliyetim yok'],
    goods: ['Palet (genel kargo)', 'Gıda ve içecek', 'Yapı malzemesi', 'Makine ve yedek parça', 'Mobilya', 'İlaç ve sağlık ürünleri', 'Diğer'],
    phonePh: '+90 532 123 45 67', postPh: '41400', prefix: 'TK',
    seed: [
      { kind: 'quote', name: 'Elif Demirtaş', org: 'Marmara Gıda', summary: '12 palet, 7.400 kg, Gebze 41400 → Ankara 06500, gıda ve içecek', daysAgo: 1, status: 0 },
      { kind: 'job', name: 'Burak Şahin', org: 'CE sınıfı tır şoförü', summary: 'Ehliyet: CE sınıfı, özgeçmiş: burak-sahin-cv.pdf', daysAgo: 2, status: 1 },
      { kind: 'quote', name: 'Gökhan Aydın', org: 'Trakya Mobilya', summary: '6 palet, 2.100 kg, Hadımköy 34555 → Bursa 16000, mobilya', daysAgo: 4, status: 2 },
    ],
  },
  el: {
    domain: 'www.paradeigma-metafores.gr', brand: 'Παράδειγμα Μεταφορική · Θεσσαλονίκη', short: 'Παράδειγμα Μεταφορική', initials: 'ΠΜ',
    tagline: 'Μεταφορές, αποθήκευση και διανομή σε όλη την Ελλάδα', locale: 'el-GR',
    user: { name: 'Νίκος Παπαδόπουλος', role: 'Διευθυντής επιχειρησιακών δραστηριοτήτων' },
    numbers: { vehicles: 96, sqm: 38000, daily: 1100, years: 22 },
    clients: ['Μακεδονικά Τρόφιμα', 'Αιγαίο Οικοδομικά', 'Θερμαϊκός Λιανική', 'Φαρμακευτική Βορείου Ελλάδος', 'Πελοπόννησος Ανταλλακτικά', 'Όλυμπος Έπιπλα'],
    services: [
      { id: 'road', title: 'Οδικές μεταφορές', desc: 'Πλήρη και μερικά φορτία, καθώς και δίκτυο παλετών σε όλη την Ελλάδα και τα Βαλκάνια.', includes: ['Πλήρη και μερικά φορτία', 'Δίκτυο παλετών με παράδοση την επόμενη εργάσιμη', 'Παρακολούθηση φορτίου και ψηφιακό αποδεικτικό παράδοσης', 'Οχήματα με υδραυλική ράμπα και μουσαμά'], customers: 'Παραγωγοί, χονδρέμποροι, εμπόριο οικοδομικών υλικών', capacity: '96 οχήματα, νταλίκες 40 τόνων και φορτηγά 7,5 τόνων' },
      { id: 'warehouse', title: 'Αποθήκευση', desc: 'Ασφαλής αποθήκευση σε κανονική θερμοκρασία ή με ψύξη, με άμεση εικόνα αποθεμάτων.', includes: ['Αποθήκευση σε παλέτες και ράφια', 'Ψυχόμενος χώρος (2–8 °C)', 'Παραλαβή, τοποθέτηση και απογραφή', 'Πύλη πελατών με ζωντανά αποθέματα'], customers: 'Έμποροι, παραγωγοί τροφίμων, εισαγωγείς', capacity: '38.000 τ.μ. σε τρεις εγκαταστάσεις, 26.000 θέσεις παλετών' },
      { id: 'contract', title: 'Συμβατική εφοδιαστική', desc: 'Αποκλειστικές ομάδες, οχήματα και διαδικασίες προσαρμοσμένες στην αλυσίδα εφοδιασμού σας.', includes: ['Συλλογή, συσκευασία και διαχείριση επιστροφών', 'Αποκλειστικός στόλος με τη δική σας ταυτότητα', 'Διαμόρφωση πακέτων και απλή συναρμολόγηση', 'Μηνιαίες αναφορές απόδοσης'], customers: 'Αλυσίδες καταστημάτων, ηλεκτρονικά καταστήματα, προμηθευτές αυτοκινήτου', capacity: '130 εκπαιδευμένοι εργαζόμενοι, βάρδιες με σύστημα διαχείρισης αποθήκης' },
      { id: 'express', title: 'Επείγουσες και ίδιας ημέρας', desc: 'Επείγουσες αποστολές παραλαμβάνονται μέσα σε 90 λεπτά, μέρα και νύχτα.', includes: ['Παραλαβή μέσα σε 90 λεπτά', 'Αποκλειστικό όχημα χωρίς φορτία άλλων', 'Εξυπηρέτηση εκτός ωραρίου και Σαββατοκύριακα', 'Απευθείας τηλέφωνο με τον οδηγό'], customers: 'Βιομηχανίες, νοσοκομεία, διοργανωτές εκδηλώσεων', capacity: '16 οχήματα express, γραφείο δρομολόγησης όλο το 24ωρο' },
      { id: 'customs', title: 'Τελωνειακές διαδικασίες', desc: 'Δηλώσεις εισαγωγής και εξαγωγής από τη δική μας τελωνειακή ομάδα.', includes: ['Δηλώσεις εισαγωγής και εξαγωγής', 'Δασμολογική κατάταξη και συμβουλές για δασμούς', 'Διαμετακόμιση και τελωνειακή αποταμίευση', 'Υποστήριξη σε πιστοποιητικά προέλευσης'], customers: 'Εισαγωγείς, εξαγωγείς, ηλεκτρονικά καταστήματα', capacity: '6 τελωνειακοί ειδικοί, άμεση πρόσβαση στα λιμάνια Θεσσαλονίκης και Πειραιά' },
    ],
    locations: [
      { city: 'Θεσσαλονίκη', address: 'ΒΙΠΕ Σίνδου, Οδός Γ΄ 12, Σίνδος 570 22', person: 'Μαρία Γεωργίου', role: 'Διευθύντρια εγκατάστασης', phone: '+30 231 055 0142', email: 'thessaloniki@paradeigma-metafores.gr', hours: 'Δευ–Παρ 06:00–22:00, Σαβ 07:00–15:00', note: 'Έδρα, κέντρο διαλογής και στεγνή αποθήκη' },
      { city: 'Ασπρόπυργος', address: 'Βιομηχανική Περιοχή Ασπροπύργου, Λεωφ. Δημοκρατίας 84, Ασπρόπυργος 193 00', person: 'Δημήτρης Αναγνώστου', role: 'Υπεύθυνος λειτουργίας', phone: '+30 210 055 0187', email: 'aspropyrgos@paradeigma-metafores.gr', hours: 'Δευ–Παρ 05:00–23:00, Σαβ 06:00–18:00', note: 'Ψυχόμενη αποθήκη και διανομή Αττικής' },
      { city: 'Πάτρα', address: 'ΒΙΠΕ Πατρών, Οδός Β΄ 21, Πάτρα 250 08', person: 'Ελένη Καρρά', role: 'Υπεύθυνη εξυπηρέτησης πελατών', phone: '+30 261 055 0233', email: 'patras@paradeigma-metafores.gr', hours: 'Δευ–Παρ 07:00–20:00, Σαβ 08:00–14:00', note: 'Κόμβος Πελοποννήσου και γραφείο επειγουσών αποστολών' },
    ],
    jobs: [
      { id: 'j1', title: 'Οδηγός νταλίκας (δίπλωμα Ε΄ κατηγορίας)', place: 'Θεσσαλονίκη', type: 'Πλήρης απασχόληση', licence: true, desc: 'Εθνικά και διεθνή δρομολόγια. Απαιτούνται δίπλωμα ΓΕ (C+E), ψηφιακή κάρτα ταχογράφου και ΠΕΙ.' },
      { id: 'j2', title: 'Εργάτης αποθήκης', place: 'Ασπρόπυργος', type: 'Βάρδιες', licence: false, desc: 'Συλλογή, φόρτωση και χρήση κλαρκ. Το δίπλωμα χειριστή κλαρκ είναι προσόν, παρέχεται εκπαίδευση.' },
      { id: 'j3', title: 'Υπεύθυνος δρομολόγησης', place: 'Πάτρα', type: 'Πλήρης απασχόληση', licence: false, desc: 'Σχεδιασμός ημερήσιων δρομολογίων, ενημέρωση οδηγών και πελατών.' },
      { id: 'j4', title: 'Διοικητικός υπάλληλος εξυπηρέτησης πελατών', place: 'Θεσσαλονίκη', type: 'Πλήρης απασχόληση', licence: false, desc: 'Προσφορές, κρατήσεις και ερωτήματα τιμολόγησης. Ωράριο γραφείου.' },
    ],
    news: [
      { title: 'Νέα ψυχόμενη αποθήκη στον Ασπρόπυργο', body: 'Επιπλέον 5.000 θέσεις παλετών για νωπά τρόφιμα και φάρμακα, με καταγραφή θερμοκρασίας όλο το 24ωρο.', daysAgo: 10 },
      { title: 'Δέκα ηλεκτρικά οχήματα στον στόλο διανομής Θεσσαλονίκης', body: 'Οι παραδόσεις ίδιας ημέρας στο λεκανοπέδιο γίνονται πλέον με ηλεκτρικά οχήματα, με αναφορά εκπομπών ανά αποστολή.', daysAgo: 33 },
    ],
    licences: ['Κατηγορία Β (επιβατικό)', 'Κατηγορία C (φορτηγό)', 'Κατηγορία C+E (νταλίκα)', 'Δεν έχω δίπλωμα'],
    goods: ['Παλέτες (γενικό φορτίο)', 'Τρόφιμα και ποτά', 'Οικοδομικά υλικά', 'Μηχανήματα και ανταλλακτικά', 'Έπιπλα', 'Φαρμακευτικά', 'Άλλο'],
    phonePh: '+30 694 123 4567', postPh: '570 22', prefix: 'ΠΡ',
    seed: [
      { kind: 'quote', name: 'Ελένη Παπαγεωργίου', org: 'Μακεδονικά Τρόφιμα', summary: '12 παλέτες, 7.400 kg, Σίνδος 570 22 → Αθήνα 104 31, τρόφιμα και ποτά', daysAgo: 1, status: 0 },
      { kind: 'job', name: 'Γιώργος Μαυρίδης', org: 'Οδηγός νταλίκας (δίπλωμα Ε΄ κατηγορίας)', summary: 'Δίπλωμα: κατηγορία C+E, βιογραφικό: mavridis-viografiko.pdf', daysAgo: 2, status: 1 },
      { kind: 'quote', name: 'Κώστας Δημητρίου', org: 'Όλυμπος Έπιπλα', summary: '6 παλέτες, 2.100 kg, Πάτρα 250 08 → Ηράκλειο 713 04, έπιπλα', daysAgo: 4, status: 2 },
    ],
  },
};
