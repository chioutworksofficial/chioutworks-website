// Intake form: sector variants + static strings the original cleaning-company schema did not have.
// OWNER-REVIEW DRAFT: every sector text below (service lists, quote fields, pricing wording) is authored,
// not taken from the original schema. Cleaning ("cleaning") keeps the original schema untouched.
export type L = 'tr' | 'en' | 'de' | 'el';
export type L4 = Record<L, string>;
type T = [string, string, string, string]; // tr, en, de, el
export const l4 = (a: T): L4 => ({ tr: a[0], en: a[1], de: a[2], el: a[3] });

export const SECTOR_KEYS = ['cleaning', 'beauty', 'clinic', 'realestate', 'cafe', 'office', 'logistics', 'other'] as const;
export type SectorKey = (typeof SECTOR_KEYS)[number];
export const isSector = (s: unknown): s is SectorKey => (SECTOR_KEYS as readonly string[]).includes(s as string);

interface Opt { id: string; t: L4 }
interface Override {
  /** replace question text */
  text?: Record<string, L4>;
  /** replace the whole option list of a multi question */
  replace?: Record<string, Opt[]>;
  /** drop option ids / add options on a multi question */
  drop?: Record<string, string[]>;
  add?: Record<string, Opt[]>;
  /** turn a multi question into free text */
  toText?: string[];
}
const o = (id: string, a: T): Opt => ({ id, t: l4(a) });

export const SECTOR_LABEL: Record<SectorKey, L4> = {
  cleaning: l4(['Temizlik', 'Cleaning', 'Reinigung', 'Καθαριότητα']),
  beauty: l4(['Kuaför / Güzellik', 'Hair & beauty', 'Friseur / Beauty', 'Κομμωτήριο / Ομορφιά']),
  clinic: l4(['Klinik / Sağlık', 'Clinic / health', 'Praxis / Gesundheit', 'Ιατρείο / Υγεία']),
  realestate: l4(['Emlak', 'Real estate', 'Immobilien', 'Ακίνητα']),
  cafe: l4(['Kafe / Restoran', 'Café / restaurant', 'Café / Restaurant', 'Καφέ / Εστιατόριο']),
  office: l4(['Ofis / Ajans / Danışmanlık', 'Office / agency / consulting', 'Büro / Agentur / Beratung', 'Γραφείο / Εταιρεία / Συμβουλευτική']),
  logistics: l4(['Lojistik / Taşımacılık', 'Logistics / transport', 'Logistik / Transport', 'Μεταφορές / Logistics']),
  other: l4(['Diğer', 'Other', 'Sonstiges', 'Άλλο']),
};

const QF_GENERIC_DROP = ['size', 'frequency'];

export const SECTOR_OVERRIDE: Partial<Record<SectorKey, Override>> = {
  beauty: {
    replace: { service_list: [
      o('cut', ['Saç kesimi / şekillendirme', 'Haircut & styling', 'Haarschnitt / Styling', 'Κούρεμα / styling']),
      o('colour', ['Saç boyama / röfle', 'Colouring / highlights', 'Färben / Strähnen', 'Βαφή / ανταύγειες']),
      o('beard', ['Sakal / tıraş', 'Beard & shave', 'Bart / Rasur', 'Γένια / ξύρισμα']),
      o('nails', ['Manikür / pedikür', 'Manicure / pedicure', 'Maniküre / Pediküre', 'Μανικιούρ / πεντικιούρ']),
      o('skin', ['Cilt bakımı', 'Facial / skin care', 'Gesichtsbehandlung', 'Περιποίηση προσώπου']),
      o('makeup', ['Makyaj / gelin', 'Make-up / bridal', 'Make-up / Brautstyling', 'Μακιγιάζ / νυφικό']),
      o('waxing', ['Ağda / epilasyon', 'Waxing / hair removal', 'Waxing / Haarentfernung', 'Αποτρίχωση']),
      o('massage', ['Masaj', 'Massage', 'Massage', 'Μασάζ']),
    ] },
    drop: { quote_fields: QF_GENERIC_DROP },
    add: { quote_fields: [o('staff', ['Tercih edilen uzman', 'Preferred stylist', 'Wunsch-Mitarbeiter/in', 'Προτιμώμενος επαγγελματίας']), o('first_visit', ['İlk ziyaret mi?', 'First visit?', 'Erstbesuch?', 'Πρώτη επίσκεψη;'])] },
    text: {
      per_service_questions: l4(['Hizmete göre farklı sorular sormanız gerekiyor mu? (ör. saç uzunluğu, mevcut renk, süre)', 'Do you need to ask different questions per service? (e.g. hair length, current colour, duration)', 'Müssen je nach Behandlung unterschiedliche Fragen gestellt werden? (z. B. Haarlänge, aktuelle Farbe, Dauer)', 'Χρειάζεται να κάνετε διαφορετικές ερωτήσεις ανά υπηρεσία; (π.χ. μήκος μαλλιών, τρέχον χρώμα, διάρκεια)']),
      pricing_inputs: l4(['Fiyat ve süre belirlemek için hangi bilgilere ihtiyacınız var? (ör. saç uzunluğu, hizmet, uzman)', 'What information do you need to set a price and duration? (e.g. hair length, treatment, stylist)', 'Welche Informationen brauchen Sie für Preis und Dauer? (z. B. Haarlänge, Behandlung, Mitarbeiter/in)', 'Ποιες πληροφορίες χρειάζεστε για τιμή και διάρκεια; (π.χ. μήκος μαλλιών, υπηρεσία, επαγγελματίας)']),
      local_search: l4(['“Kuaför İstanbul” gibi aramalardan müşteri almak sizin için önemli mi?', 'Is it important to win customers through searches like "hair salon near me"?', 'Ist es wichtig, über Suchen wie „Friseur in meiner Nähe“ Kunden zu gewinnen?', 'Είναι σημαντικό να βρίσκετε πελάτες από αναζητήσεις όπως «κομμωτήριο κοντά μου»;']),
    },
  },
  clinic: {
    replace: { service_list: [
      o('consult', ['Muayene / danışma', 'Consultations / check-ups', 'Sprechstunde / Vorsorge', 'Εξετάσεις / συμβουλευτική']),
      o('dental', ['Diş tedavisi', 'Dental treatment', 'Zahnbehandlung', 'Οδοντιατρική']),
      o('physio', ['Fizyoterapi', 'Physiotherapy', 'Physiotherapie', 'Φυσικοθεραπεία']),
      o('aesthetic', ['Estetik uygulamalar', 'Aesthetic treatments', 'Ästhetische Behandlungen', 'Αισθητικές θεραπείες']),
      o('diagnostic', ['Tanı / laboratuvar', 'Diagnostics / lab', 'Diagnostik / Labor', 'Διαγνωστικά / εργαστήριο']),
      o('therapy', ['Psikoloji / terapi', 'Psychology / therapy', 'Psychologie / Therapie', 'Ψυχολογία / θεραπεία']),
      o('home', ['Evde ziyaret', 'Home visits', 'Hausbesuche', 'Κατ\' οίκον επισκέψεις']),
      o('tele', ['Çevrimiçi görüşme', 'Online consultations', 'Online-Sprechstunde', 'Διαδικτυακές συνεδρίες']),
    ] },
    drop: { quote_fields: QF_GENERIC_DROP },
    add: { quote_fields: [o('reason', ['Başvuru nedeni', 'Reason for the visit', 'Anliegen / Grund des Besuchs', 'Λόγος επίσκεψης']), o('insurance', ['Sigorta türü', 'Insurance type', 'Versicherungsart', 'Είδος ασφάλισης'])] },
    text: {
      per_service_questions: l4(['Tedaviye göre hastaya farklı sorular sorulması gerekiyor mu? (Hassas sağlık verisi web formunda istenmesin; yalnızca randevu için gerekli bilgi.)', 'Do patients need different questions per treatment? (Sensitive health data should not go into a web form — only what is needed for the appointment.)', 'Müssen je nach Behandlung unterschiedliche Fragen gestellt werden? (Sensible Gesundheitsdaten gehören nicht in ein Web-Formular, nur das für den Termin Nötige.)', 'Χρειάζονται διαφορετικές ερωτήσεις ανά θεραπεία; (Ευαίσθητα δεδομένα υγείας δεν ζητούνται σε φόρμα ιστοσελίδας, μόνο ό,τι χρειάζεται για το ραντεβού.)']),
      pricing_inputs: l4(['Randevu süresi ve ücret için hangi bilgilere ihtiyacınız var? (ör. işlem türü, sigorta)', 'What information do you need for appointment length and fee? (e.g. treatment type, insurance)', 'Welche Informationen brauchen Sie für Termindauer und Honorar? (z. B. Behandlungsart, Versicherung)', 'Ποιες πληροφορίες χρειάζεστε για διάρκεια και αμοιβή; (π.χ. είδος θεραπείας, ασφάλιση)']),
      local_search: l4(['“Diş hekimi Ankara” gibi aramalardan hasta almak sizin için önemli mi?', 'Is it important to win patients through searches like "dentist near me"?', 'Ist es wichtig, über Suchen wie „Zahnarzt in meiner Nähe“ Patienten zu gewinnen?', 'Είναι σημαντικό να βρίσκετε ασθενείς από αναζητήσεις όπως «οδοντίατρος κοντά μου»;']),
    },
  },
  realestate: {
    replace: { service_list: [
      o('sale', ['Satış', 'Sales', 'Verkauf', 'Πωλήσεις']),
      o('rent', ['Kiralama', 'Rentals', 'Vermietung', 'Ενοικιάσεις']),
      o('mgmt', ['Mülk yönetimi', 'Property management', 'Hausverwaltung', 'Διαχείριση ακινήτων']),
      o('valuation', ['Değerleme', 'Valuation', 'Bewertung', 'Εκτίμηση αξίας']),
      o('newbuild', ['Yeni proje / konut', 'New-build projects', 'Neubauprojekte', 'Νέα έργα']),
      o('commercial', ['Ticari gayrimenkul', 'Commercial property', 'Gewerbeimmobilien', 'Επαγγελματικά ακίνητα']),
      o('holiday', ['Tatil kiralama', 'Holiday rentals', 'Ferienvermietung', 'Διακοπές / βραχυχρόνια μίσθωση']),
      o('advice', ['Alıcı / yatırımcı danışmanlığı', 'Buyer / investor advice', 'Beratung für Käufer / Investoren', 'Συμβουλευτική αγοραστών / επενδυτών']),
    ] },
    drop: { quote_fields: [...QF_GENERIC_DROP, 'service_type'] },
    add: { quote_fields: [o('property_type', ['Mülk tipi', 'Property type', 'Objektart', 'Τύπος ακινήτου']), o('budget', ['Bütçe', 'Budget', 'Budget', 'Προϋπολογισμός']), o('location', ['Tercih edilen bölge', 'Preferred location', 'Gewünschte Lage', 'Προτιμώμενη περιοχή'])] },
    text: {
      services: l4(['Hangi gayrimenkul hizmetlerini sunuyorsunuz?', 'Which real-estate services do you offer?', 'Welche Immobilien-Leistungen bieten Sie an?', 'Ποιες υπηρεσίες ακινήτων προσφέρετε;']),
      per_service_questions: l4(['Satış, kiralama veya değerleme için müşteriye farklı sorular sorulmalı mı?', 'Should customers be asked different questions for sale, rental or valuation?', 'Sollen bei Verkauf, Vermietung oder Bewertung unterschiedliche Fragen gestellt werden?', 'Πρέπει να γίνονται διαφορετικές ερωτήσεις για πώληση, ενοικίαση ή εκτίμηση;']),
      pricing_inputs: l4(['Komisyon veya ücret belirlemek için hangi bilgilere ihtiyacınız var? (ör. mülk tipi, değer, konum)', 'What information do you need to set a commission or fee? (e.g. property type, value, location)', 'Welche Informationen brauchen Sie für Provision oder Honorar? (z. B. Objektart, Wert, Lage)', 'Ποιες πληροφορίες χρειάζεστε για προμήθεια ή αμοιβή; (π.χ. τύπος ακινήτου, αξία, περιοχή)']),
      local_search: l4(['“Satılık daire İzmir” gibi aramalardan müşteri almak sizin için önemli mi?', 'Is it important to win customers through searches like "flat for sale in Munich"?', 'Ist es wichtig, über Suchen wie „Wohnung kaufen München“ Kunden zu gewinnen?', 'Είναι σημαντικό να βρίσκετε πελάτες από αναζητήσεις όπως «διαμέρισμα προς πώληση Αθήνα»;']),
    },
  },
  cafe: {
    replace: { service_list: [
      o('dinein', ['Mekânda servis', 'Dine-in', 'Bewirtung vor Ort', 'Εστίαση στον χώρο']),
      o('takeaway', ['Paket servis (gel-al)', 'Takeaway', 'Take-away', 'Πακέτο (take-away)']),
      o('delivery', ['Eve teslimat', 'Delivery', 'Lieferdienst', 'Διανομή']),
      o('catering', ['Catering / etkinlik', 'Catering / events', 'Catering / Events', 'Catering / εκδηλώσεις']),
      o('breakfast', ['Kahvaltı / brunch', 'Breakfast / brunch', 'Frühstück / Brunch', 'Πρωινό / brunch']),
      o('bakery', ['Pastane / tatlı', 'Bakery / pastry', 'Bäckerei / Konditorei', 'Αρτοποιία / ζαχαροπλαστική']),
      o('bar', ['Bar / içecek', 'Bar / drinks', 'Bar / Getränke', 'Μπαρ / ποτά']),
      o('private', ['Özel gün / rezervasyon', 'Private events / bookings', 'Feiern / Reservierungen', 'Ιδιωτικές εκδηλώσεις / κρατήσεις']),
    ] },
    drop: { quote_fields: [...QF_GENERIC_DROP, 'address'] },
    add: { quote_fields: [o('guests', ['Kişi sayısı', 'Number of guests', 'Personenzahl', 'Αριθμός ατόμων']), o('occasion', ['Etkinlik türü', 'Occasion / event type', 'Anlass', 'Είδος εκδήλωσης']), o('allergies', ['Alerji / diyet', 'Allergies / diet', 'Allergien / Ernährung', 'Αλλεργίες / διατροφή'])] },
    text: {
      services: l4(['Neler sunuyorsunuz? (menü, servis türleri)', 'What do you offer? (menu, service types)', 'Was bieten Sie an? (Speisekarte, Serviceformen)', 'Τι προσφέρετε; (μενού, είδη εξυπηρέτησης)']),
      per_service_questions: l4(['Rezervasyon, paket servis veya etkinlik için farklı bilgiler istenmeli mi?', 'Should different details be asked for reservations, takeaway or events?', 'Sollen bei Reservierung, Take-away oder Events unterschiedliche Angaben abgefragt werden?', 'Πρέπει να ζητούνται διαφορετικά στοιχεία για κράτηση, take-away ή εκδηλώσεις;']),
      pricing_inputs: l4(['Etkinlik / catering fiyatı için hangi bilgilere ihtiyacınız var? (ör. kişi sayısı, menü, tarih)', 'What do you need to price an event or catering order? (e.g. guests, menu, date)', 'Was brauchen Sie für den Preis bei Events / Catering? (z. B. Personenzahl, Menü, Datum)', 'Τι χρειάζεστε για την τιμή σε εκδήλωση / catering; (π.χ. άτομα, μενού, ημερομηνία)']),
      local_search: l4(['“Kafe Kadıköy” gibi aramalardan müşteri almak sizin için önemli mi?', 'Is it important to win guests through searches like "café near me"?', 'Ist es wichtig, über Suchen wie „Café in meiner Nähe“ Gäste zu gewinnen?', 'Είναι σημαντικό να βρίσκετε πελάτες από αναζητήσεις όπως «καφέ κοντά μου»;']),
    },
  },
  office: {
    replace: { service_list: [
      o('consulting', ['Danışmanlık', 'Consulting', 'Beratung', 'Συμβουλευτική']),
      o('marketing', ['Pazarlama / reklam', 'Marketing / advertising', 'Marketing / Werbung', 'Μάρκετινγκ / διαφήμιση']),
      o('it', ['Yazılım / BT', 'Software / IT', 'Software / IT', 'Λογισμικό / IT']),
      o('accounting', ['Muhasebe / vergi', 'Accounting / tax', 'Buchhaltung / Steuern', 'Λογιστική / φορολογία']),
      o('legal', ['Hukuk', 'Legal', 'Recht', 'Νομικά']),
      o('creative', ['Tasarım / yaratıcı', 'Design / creative', 'Design / Kreatives', 'Σχεδιασμός / δημιουργικά']),
      o('training', ['Eğitim / koçluk', 'Training / coaching', 'Schulung / Coaching', 'Εκπαίδευση / coaching']),
      o('project', ['Proje yönetimi', 'Project management', 'Projektmanagement', 'Διαχείριση έργων']),
    ] },
    drop: { quote_fields: [...QF_GENERIC_DROP, 'address'] },
    add: { quote_fields: [o('company', ['Şirket adı', 'Company name', 'Firmenname', 'Επωνυμία εταιρείας']), o('budget', ['Bütçe aralığı', 'Budget range', 'Budgetrahmen', 'Εύρος προϋπολογισμού']), o('deadline', ['Hedef tarih', 'Deadline', 'Wunschtermin / Frist', 'Προθεσμία'])] },
    text: {
      per_service_questions: l4(['Hizmete göre müşteriye farklı sorular sorulmalı mı? (ör. proje kapsamı, süre, hedef)', 'Should customers be asked different questions per service? (e.g. scope, timeline, goal)', 'Sollen je nach Leistung unterschiedliche Fragen gestellt werden? (z. B. Umfang, Zeitrahmen, Ziel)', 'Πρέπει να γίνονται διαφορετικές ερωτήσεις ανά υπηρεσία; (π.χ. εύρος, χρονοδιάγραμμα, στόχος)']),
      pricing_inputs: l4(['Teklif için hangi bilgilere ihtiyacınız var? (ör. kapsam, süre, kişi sayısı)', 'What information do you need to price a proposal? (e.g. scope, duration, headcount)', 'Welche Informationen brauchen Sie für ein Angebot? (z. B. Umfang, Dauer, Personenzahl)', 'Ποιες πληροφορίες χρειάζεστε για μια προσφορά; (π.χ. εύρος, διάρκεια, αριθμός ατόμων)']),
      local_search: l4(['“Vergi danışmanı Berlin” gibi aramalardan müşteri almak sizin için önemli mi?', 'Is it important to win clients through searches like "tax advisor Berlin"?', 'Ist es wichtig, über Suchen wie „Steuerberater Berlin“ Kunden zu gewinnen?', 'Είναι σημαντικό να βρίσκετε πελάτες από αναζητήσεις όπως «λογιστής Αθήνα»;']),
    },
  },
  logistics: {
    replace: { service_list: [
      o('local', ['Şehir içi teslimat', 'Local deliveries', 'Lokale Lieferungen', 'Τοπικές παραδόσεις']),
      o('freight', ['Şehirlerarası yük', 'Long-distance freight', 'Fernverkehr / Stückgut', 'Μεταφορά φορτίου']),
      o('moving', ['Nakliyat / taşınma', 'Moving', 'Umzüge', 'Μετακομίσεις']),
      o('courier', ['Kurye / ekspres', 'Courier / express', 'Kurier / Express', 'Κούριερ / express']),
      o('storage', ['Depolama', 'Warehousing', 'Lagerung', 'Αποθήκευση']),
      o('intl', ['Uluslararası taşıma', 'International shipping', 'Internationaler Versand', 'Διεθνείς μεταφορές']),
      o('special', ['Özel taşıma (soğuk zincir, ağır)', 'Special transport (cold chain, heavy)', 'Spezialtransporte (Kühlkette, Schwerlast)', 'Ειδικές μεταφορές (ψυχρή αλυσίδα, βαρέα)']),
      o('transfer', ['Yolcu / transfer', 'Passenger transfers', 'Personentransport / Transfers', 'Μεταφορά επιβατών']),
    ] },
    drop: { quote_fields: ['size', 'service_type'] },
    add: { quote_fields: [o('route', ['Alış ve teslim adresi', 'Pickup & delivery address', 'Abhol- und Lieferadresse', 'Διεύθυνση παραλαβής και παράδοσης']), o('cargo', ['Yük türü / ağırlık / hacim', 'Type / weight / volume of goods', 'Art / Gewicht / Volumen der Ware', 'Είδος / βάρος / όγκος φορτίου'])] },
    text: {
      per_service_questions: l4(['Taşıma türüne göre farklı bilgiler gerekiyor mu? (ör. yük, mesafe, kat / asansör)', 'Do you need different details per transport type? (e.g. cargo, distance, floors / lift)', 'Brauchen Sie je nach Transportart andere Angaben? (z. B. Ladung, Strecke, Etage / Aufzug)', 'Χρειάζεστε διαφορετικά στοιχεία ανά είδος μεταφοράς; (π.χ. φορτίο, απόσταση, όροφος / ασανσέρ)']),
      pricing_inputs: l4(['Fiyat için hangi bilgilere ihtiyacınız var? (ör. mesafe, ağırlık / hacim, tarih, süre)', 'What information do you need for a price? (e.g. distance, weight / volume, date, duration)', 'Welche Informationen brauchen Sie für einen Preis? (z. B. Strecke, Gewicht / Volumen, Termin, Dauer)', 'Ποιες πληροφορίες χρειάζεστε για την τιμή; (π.χ. απόσταση, βάρος / όγκος, ημερομηνία, διάρκεια)']),
      local_search: l4(['“Evden eve nakliyat Bursa” gibi aramalardan müşteri almak sizin için önemli mi?', 'Is it important to win customers through searches like "removals Frankfurt"?', 'Ist es wichtig, über Suchen wie „Umzugsfirma Frankfurt“ Kunden zu gewinnen?', 'Είναι σημαντικό να βρίσκετε πελάτες από αναζητήσεις όπως «μετακομίσεις Αθήνα»;']),
    },
  },
  other: {
    toText: ['service_list'],
    drop: { quote_fields: QF_GENERIC_DROP },
    text: {
      service_list: l4(['Hangi hizmetleri / ürünleri somut olarak sunuyorsunuz?', 'Which services / products do you offer specifically?', 'Welche Leistungen / Produkte bieten Sie konkret an?', 'Ποιες υπηρεσίες / προϊόντα προσφέρετε συγκεκριμένα;']),
      per_service_questions: l4(['Hizmete göre müşteriye farklı sorular sorulmalı mı?', 'Should customers be asked different questions depending on the service?', 'Müssen je nach Leistung unterschiedliche Fragen an den Kunden gestellt werden?', 'Πρέπει να γίνονται διαφορετικές ερωτήσεις ανά υπηρεσία;']),
      pricing_inputs: l4(['Fiyat belirlemek için hangi bilgilere ihtiyacınız var?', 'What information do you need to set a price?', 'Welche Informationen benötigen Sie, um einen Preis festzulegen?', 'Ποιες πληροφορίες χρειάζεστε για να καθορίσετε τιμή;']),
      local_search: l4(['Mesleğiniz + şehrinizle yapılan aramalardan (ör. “… İstanbul”) müşteri almak sizin için önemli mi?', 'Is it important to win customers through local searches (your trade + your city)?', 'Ist es wichtig, über lokale Suchen (Ihr Gewerbe + Ihre Stadt) Kunden zu gewinnen?', 'Είναι σημαντικό να βρίσκετε πελάτες από τοπικές αναζητήσεις (το επάγγελμά σας + η πόλη σας);']),
    },
  },
};

// ── Static blocks (new in this version, not in the original schema) ──────────
export const YN_LABEL: Record<string, L4> = {
  yes: l4(['Evet', 'Yes', 'Ja', 'Ναι']),
  no: l4(['Hayır', 'No', 'Nein', 'Όχι']),
  unsure: l4(['Emin değilim', 'Not sure', 'Weiß nicht', 'Δεν είμαι σίγουρος/η']),
};

export interface StaticQ { id: string; type: 'text' | 'single' | 'multi' | 'yn'; t: L4; options?: Opt[]; detail?: boolean; required?: boolean }

export const START_Q: StaticQ[] = [
  { id: 'meta_company', type: 'text', required: true, t: l4(['İşletmenizin adı', 'Name of your business', 'Name Ihres Unternehmens', 'Επωνυμία της επιχείρησής σας']) },
  { id: 'meta_contact', type: 'text', required: true, t: l4(['Adınız soyadınız', 'Your name', 'Ihr Name', 'Το όνομά σας']) },
  { id: 'meta_email', type: 'text', required: true, t: l4(['E-posta adresiniz', 'Your e-mail address', 'Ihre E-Mail-Adresse', 'Η διεύθυνση e-mail σας']) },
  { id: 'meta_phone', type: 'text', t: l4(['Telefon (isteğe bağlı)', 'Phone (optional)', 'Telefon (optional)', 'Τηλέφωνο (προαιρετικό)']) },
  { id: 'meta_website', type: 'text', t: l4(['Web siteniz (varsa)', 'Your website (if any)', 'Ihre Website (falls vorhanden)', 'Η ιστοσελίδα σας (αν υπάρχει)']) },
  { id: 'biz_type', type: 'single', required: true, t: l4(['Ne iş yapıyorsunuz?', 'What kind of business do you run?', 'Welche Art von Unternehmen führen Sie?', 'Τι είδους επιχείρηση έχετε;']),
    options: SECTOR_KEYS.map((k) => ({ id: k, t: SECTOR_LABEL[k] })) },
  { id: 'wants', type: 'multi', required: true, t: l4(['Hangi konuda yardım istiyorsunuz?', 'What would you like help with?', 'Wobei möchten Sie Unterstützung?', 'Σε τι θέλετε βοήθεια;']),
    options: [
      o('website', ['Web sitesi', 'A website', 'Website', 'Ιστοσελίδα']),
      o('booking', ['Online randevu sistemi', 'An online booking system', 'Online-Terminbuchung', 'Σύστημα online ραντεβού']),
      o('qr', ['QR menü / dijital katalog', 'QR menu / digital catalogue', 'QR-Speisekarte / digitaler Katalog', 'Μενού QR / ψηφιακός κατάλογος']),
      o('automation', ['Otomasyon (tekrarlayan işleri otomatikleştirme)', 'Automation (repetitive tasks)', 'Automatisierung (wiederkehrende Aufgaben)', 'Αυτοματοποίηση (επαναλαμβανόμενες εργασίες)']),
      o('crm', ['Kendime özel müşteri yönetim sistemi (CRM)', 'My own customer management system (CRM)', 'Ein eigenes Kundenverwaltungssystem (CRM)', 'Δικό μου σύστημα διαχείρισης πελατών (CRM)']),
      o('invoices', ['Teklif ve fatura otomasyonu', 'Quote and invoice automation', 'Angebots- und Rechnungsautomatisierung', 'Αυτοματοποίηση προσφορών και τιμολογίων']),
      o('app', ['Kendime özel uygulama / giriş paneli (program gibi)', 'My own app / login panel (like a program)', 'Eigene App / Login-Bereich (wie ein Programm)', 'Δική μου εφαρμογή / πίνακας σύνδεσης (σαν πρόγραμμα)']),
      o('ai', ['Yapay zekâ asistanı', 'An AI assistant', 'KI-Assistent', 'Βοηθός τεχνητής νοημοσύνης']),
      o('all', ['Hepsi / emin değilim', 'All of it / not sure yet', 'Alles / noch unsicher', 'Όλα / δεν είμαι σίγουρος/η']),
    ] },
];

export const TECH_Q: StaticQ[] = [
  { id: 'tech_site', type: 'yn', detail: true, t: l4(['Şu an bir web siteniz veya alan adınız (domain) var mı? Varsa hangisi?', 'Do you already have a website or domain? If so, which?', 'Haben Sie bereits eine Website oder Domain? Wenn ja, welche?', 'Έχετε ήδη ιστοσελίδα ή domain; Αν ναι, ποιο;']) },
  { id: 'tech_hosting', type: 'text', t: l4(['Nerede barındırılıyor, kim yönetiyor? (ör. hosting firması, ajans, bilmiyorum)', 'Where is it hosted and who manages it? (e.g. provider, agency, no idea)', 'Wo wird sie gehostet und wer verwaltet sie? (z. B. Anbieter, Agentur, weiß ich nicht)', 'Πού φιλοξενείται και ποιος τη διαχειρίζεται; (π.χ. πάροχος, εταιρεία, δεν ξέρω)']) },
  { id: 'tech_platform', type: 'yn', t: l4(['Başlangıçta kendi alan adınız olmadan, Vercel / Netlify / Cloudflare gibi bir platformda basit bir sayfa sizin için uygun mu?', 'Would a simple page on a platform like Vercel, Netlify or Cloudflare (at first without your own domain) be fine for you?', 'Wäre zunächst eine einfache Seite auf einer Plattform wie Vercel, Netlify oder Cloudflare (ohne eigene Domain) für Sie in Ordnung?', 'Θα σας κάλυπτε αρχικά μια απλή σελίδα σε πλατφόρμα όπως Vercel, Netlify ή Cloudflare (χωρίς δικό σας domain);']) },
  { id: 'tech_tools', type: 'text', t: l4(['Hâlihazırda hangi araçları kullanıyorsunuz? (ör. takvim, muhasebe, CRM, WhatsApp, e-posta)', 'Which tools do you already use? (e.g. calendar, accounting, CRM, WhatsApp, e-mail)', 'Welche Tools nutzen Sie bereits? (z. B. Kalender, Buchhaltung, CRM, WhatsApp, E-Mail)', 'Ποια εργαλεία χρησιμοποιείτε ήδη; (π.χ. ημερολόγιο, λογιστική, CRM, WhatsApp, e-mail)']) },
];

export const WEB_Q: StaticQ[] = [
  { id: 'web_goal', type: 'single', required: true, t: l4(['Web sitesi en çok ne işe yarasın?', 'What should the website mainly do?', 'Wofür soll die Website vor allem da sein?', 'Σε τι να χρησιμεύει κυρίως η ιστοσελίδα;']),
    options: [
      o('enquiries', ['Daha çok talep getirsin', 'Bring more enquiries', 'Mehr Anfragen bringen', 'Να φέρνει περισσότερα αιτήματα']),
      o('booking', ['Online randevu alınsın', 'Take online bookings', 'Online-Termine ermöglichen', 'Να παίρνει ραντεβού online']),
      o('trust', ['Profesyonel görünüp güven versin', 'Look professional and build trust', 'Professionell wirken und Vertrauen schaffen', 'Να δείχνει επαγγελματική και να εμπνέει εμπιστοσύνη']),
      o('sell', ['Online satış yapılsın', 'Sell online', 'Online verkaufen', 'Να πουλά online']),
    ] },
  { id: 'web_audience', type: 'text', t: l4(['Siteyi kimler ziyaret edecek? Hedef müşterileriniz kimler?', 'Who will visit the site? Who are your target customers?', 'Wer soll die Website besuchen? Wer sind Ihre Zielkunden?', 'Ποιοι θα επισκέπτονται τον ιστότοπο; Ποιοι είναι οι πελάτες-στόχοι σας;']) },
  { id: 'web_parts', type: 'multi', t: l4(['Hangi bölümler olsun?', 'Which parts should it have?', 'Welche Bereiche soll sie haben?', 'Ποια τμήματα να έχει;']),
    options: [
      o('services', ['Hizmetler', 'Services', 'Leistungen', 'Υπηρεσίες']),
      o('about', ['Hakkımda / hakkımızda', 'About', 'Über mich / uns', 'Σχετικά με εμένα / εμάς']),
      o('gallery', ['Fotoğraf galerisi', 'Photo gallery', 'Fotogalerie', 'Συλλογή φωτογραφιών']),
      o('reviews', ['Müşteri yorumları', 'Customer reviews', 'Kundenbewertungen', 'Κριτικές πελατών']),
      o('contact', ['İletişim formu ve harita', 'Contact form and map', 'Kontaktformular und Karte', 'Φόρμα επικοινωνίας και χάρτης']),
      o('faq', ['Sık sorulan sorular', 'FAQ', 'Häufige Fragen', 'Συχνές ερωτήσεις']),
      o('blog', ['Blog / haberler', 'Blog / news', 'Blog / Neuigkeiten', 'Blog / νέα']),
      o('languages', ['Birden fazla dil', 'Several languages', 'Mehrere Sprachen', 'Περισσότερες γλώσσες']),
    ] },
  { id: 'web_features', type: 'multi', t: l4(['Hangi özellikler gerekli?', 'Which features do you need?', 'Welche Funktionen brauchen Sie?', 'Ποιες λειτουργίες χρειάζεστε;']),
    options: [
      o('booking', ['Online randevu', 'Online booking', 'Online-Terminbuchung', 'Online ραντεβού']),
      o('form', ['Talep / iletişim formu', 'Enquiry / contact form', 'Anfrage- / Kontaktformular', 'Φόρμα αιτήματος / επικοινωνίας']),
      o('whatsapp', ['WhatsApp düğmesi', 'WhatsApp button', 'WhatsApp-Button', 'Κουμπί WhatsApp']),
      o('map', ['Harita ve yol tarifi', 'Map and directions', 'Karte und Anfahrt', 'Χάρτης και οδηγίες']),
      o('shop', ['Online mağaza', 'Online shop', 'Online-Shop', 'Ηλεκτρονικό κατάστημα']),
      o('newsletter', ['Bülten kaydı', 'Newsletter sign-up', 'Newsletter-Anmeldung', 'Εγγραφή σε newsletter']),
      o('assistant', ['Yapay zekâ sohbet asistanı', 'AI chat assistant', 'KI-Chat-Assistent', 'Βοηθός συνομιλίας ΤΝ']),
    ] },
  { id: 'web_existing', type: 'yn', detail: true, t: l4(['Şu an bir web siteniz veya alan adınız var mı? Varsa hangisi?', 'Do you already have a website or domain? If so, which?', 'Haben Sie bereits eine Website oder Domain? Wenn ja, welche?', 'Έχετε ήδη ιστοσελίδα ή domain; Αν ναι, ποιο;']) },
  { id: 'web_content', type: 'single', t: l4(['Metinler ve fotoğraflar hazır mı?', 'Are texts and photos ready?', 'Sind Texte und Fotos vorhanden?', 'Είναι έτοιμα τα κείμενα και οι φωτογραφίες;']),
    options: [
      o('ready', ['Hazır', 'Ready', 'Vorhanden', 'Έτοιμα']),
      o('some', ['Kısmen', 'Partly', 'Teilweise', 'Εν μέρει']),
      o('help', ['Yardım istiyorum', 'I need help', 'Ich brauche Hilfe', 'Χρειάζομαι βοήθεια']),
    ] },
  { id: 'web_look', type: 'single', t: l4(['Site nasıl bir his versin?', 'What feeling should the site give?', 'Welchen Eindruck soll die Website vermitteln?', 'Ποια αίσθηση να δίνει ο ιστότοπος;']),
    options: [
      o('clean', ['Sade ve ferah', 'Clean and light', 'Klar und aufgeräumt', 'Καθαρή και άνετη']),
      o('warm', ['Sıcak ve samimi', 'Warm and friendly', 'Warm und persönlich', 'Ζεστή και φιλική']),
      o('premium', ['Şık ve premium', 'Elegant and premium', 'Edel und hochwertig', 'Κομψή και premium']),
      o('bold', ['Cesur ve dikkat çekici', 'Bold and eye-catching', 'Mutig und auffällig', 'Τολμηρή και εντυπωσιακή']),
    ] },
  { id: 'web_examples', type: 'text', t: l4(['Beğendiğiniz örnek siteler var mı? (isteğe bağlı)', 'Any websites you like? (optional)', 'Gibt es Websites, die Ihnen gefallen? (optional)', 'Υπάρχουν ιστοσελίδες που σας αρέσουν; (προαιρετικά)']) },
  { id: 'web_update', type: 'single', t: l4(['Siteyi sonradan kim güncelleyecek?', 'Who will update the site later?', 'Wer pflegt die Website später?', 'Ποιος θα ενημερώνει τον ιστότοπο αργότερα;']),
    options: [o('me', ['Kendim', 'I will', 'Ich selbst', 'Ο ίδιος / η ίδια']), o('you', ['Sizin yapmanızı isterim', 'I would like you to do it', 'Ich möchte, dass Sie es übernehmen', 'Θα ήθελα να το αναλάβετε εσείς']), o('unsure', ['Emin değilim', 'Not sure', 'Weiß nicht', 'Δεν είμαι σίγουρος/η'])] },
  { id: 'web_found', type: 'multi', t: l4(['Müşteriler sizi bugün nasıl buluyor?', 'How do customers find you today?', 'Wie finden Kunden Sie heute?', 'Πώς σας βρίσκουν σήμερα οι πελάτες;']),
    options: [
      o('referral', ['Tavsiye / ağızdan ağıza', 'Word of mouth', 'Empfehlungen', 'Από στόμα σε στόμα']),
      o('search', ['Google araması', 'Google search', 'Google-Suche', 'Αναζήτηση Google']),
      o('social', ['Sosyal medya', 'Social media', 'Social Media', 'Social media']),
      o('ads', ['Reklam', 'Advertising', 'Werbung', 'Διαφήμιση']),
      o('walkin', ['Mağaza / yoldan geçerken', 'Passing by / walk-ins', 'Laufkundschaft', 'Περαστικοί πελάτες']),
    ] },
];

export const NOTSURE_Q: StaticQ[] = [
  { id: 'ns_pain', type: 'text', required: true, t: l4(['İşinizde en çok zamanınızı ne alıyor?', 'What takes most of your time at work?', 'Was kostet Sie bei der Arbeit am meisten Zeit?', 'Τι σας παίρνει τον περισσότερο χρόνο στη δουλειά;']) },
  { id: 'ns_goal', type: 'single', t: l4(['En çok neyi değiştirmek istersiniz?', 'What would you most like to change?', 'Was möchten Sie am liebsten verändern?', 'Τι θα θέλατε να αλλάξετε περισσότερο;']),
    options: [
      o('more', ['Daha çok müşteri', 'More customers', 'Mehr Kunden', 'Περισσότεροι πελάτες']),
      o('time', ['Daha az el işi', 'Less manual work', 'Weniger Handarbeit', 'Λιγότερη χειρωνακτική δουλειά']),
      o('order', ['Daha düzenli takip', 'Better overview', 'Mehr Überblick', 'Καλύτερη εποπτεία']),
      o('image', ['Daha profesyonel görünüm', 'A more professional image', 'Ein professionelleres Auftreten', 'Πιο επαγγελματική εικόνα']),
    ] },
  { id: 'ns_tools', type: 'text', t: l4(['Şu an hangi araçları kullanıyorsunuz? (ör. takvim, Excel, mesajlaşma, muhasebe)', 'Which tools do you use today? (e.g. calendar, Excel, messaging, accounting)', 'Welche Tools nutzen Sie derzeit? (z. B. Kalender, Excel, Messenger, Buchhaltung)', 'Ποια εργαλεία χρησιμοποιείτε σήμερα; (π.χ. ημερολόγιο, Excel, μηνύματα, λογιστική)']) },
];

export const CRM_Q: StaticQ[] = [
  { id: 'crm_track', type: 'multi', required: true, t: l4(['Sistemde neleri takip etmek istiyorsunuz?', 'What do you want to keep track of in the system?', 'Was möchten Sie im System festhalten?', 'Τι θέλετε να παρακολουθείτε στο σύστημα;']),
    options: [
      o('contacts', ['Müşteriler ve iletişim bilgileri', 'Customers and contact details', 'Kunden und Kontaktdaten', 'Πελάτες και στοιχεία επικοινωνίας']),
      o('leads', ['Gelen talepler', 'Incoming enquiries', 'Eingehende Anfragen', 'Εισερχόμενα αιτήματα']),
      o('offers', ['Teklifler ve siparişler', 'Quotes and orders', 'Angebote und Aufträge', 'Προσφορές και παραγγελίες']),
      o('appointments', ['Randevular', 'Appointments', 'Termine', 'Ραντεβού']),
      o('tasks', ['Yapılacaklar ve hatırlatmalar', 'Tasks and reminders', 'Aufgaben und Erinnerungen', 'Εργασίες και υπενθυμίσεις']),
      o('invoices', ['Faturalar ve ödemeler', 'Invoices and payments', 'Rechnungen und Zahlungen', 'Τιμολόγια και πληρωμές']),
      o('files', ['Belgeler ve dosyalar', 'Documents and files', 'Dokumente und Dateien', 'Έγγραφα και αρχεία']),
      o('history', ['Notlar ve geçmiş görüşmeler', 'Notes and past conversations', 'Notizen und bisherige Gespräche', 'Σημειώσεις και προηγούμενες συζητήσεις']),
    ] },
  { id: 'crm_stages', type: 'text', t: l4(['Bir müşteri sizinle hangi aşamalardan geçiyor? (ör. ilk talep → teklif → sipariş → tamamlandı)', 'Which stages does a customer go through with you? (e.g. first enquiry → quote → order → done)', 'Welche Phasen durchläuft ein Kunde bei Ihnen? (z. B. Erstanfrage → Angebot → Auftrag → erledigt)', 'Από ποια στάδια περνά ένας πελάτης μαζί σας; (π.χ. πρώτο αίτημα → προσφορά → παραγγελία → ολοκληρώθηκε)']) },
  { id: 'crm_access', type: 'single', t: l4(['Sisteme kimler giriş yapacak?', 'Who will log in to the system?', 'Wer meldet sich im System an?', 'Ποιοι θα συνδέονται στο σύστημα;']),
    options: [o('me', ['Sadece ben', 'Only me', 'Nur ich', 'Μόνο εγώ']), o('team', ['Ben ve ekibim', 'Me and my team', 'Ich und mein Team', 'Εγώ και η ομάδα μου']), o('clients', ['Müşterilerim de giriş yapacak', 'My customers will log in too', 'Auch meine Kunden melden sich an', 'Θα συνδέονται και οι πελάτες μου'])] },
  { id: 'crm_roles', type: 'text', t: l4(['Birden fazla kişi girecekse kim neyi görebilsin veya değiştirebilsin? (isteğe bağlı)', 'If several people log in, who may see or change what? (optional)', 'Wenn sich mehrere Personen anmelden: Wer darf was sehen oder ändern? (optional)', 'Αν συνδέονται περισσότερα άτομα, ποιος μπορεί να βλέπει ή να αλλάζει τι; (προαιρετικά)']) },
  { id: 'crm_login', type: 'multi', t: l4(['Giriş ve güvenlik için neler istersiniz?', 'What do you want for login and security?', 'Was wünschen Sie sich für Login und Sicherheit?', 'Τι θέλετε για τη σύνδεση και την ασφάλεια;']),
    options: [
      o('password', ['E-posta ve şifreyle giriş', 'Login with e-mail and password', 'Login mit E-Mail und Passwort', 'Σύνδεση με e-mail και κωδικό']),
      o('twostep', ['İki adımlı giriş', 'Two-step login', 'Zwei-Faktor-Anmeldung', 'Σύνδεση δύο βημάτων']),
      o('private', ['Yalnızca şirketime özel, kapalı bir arayüz', 'A private interface for my company only', 'Eine nur für mein Unternehmen zugängliche Oberfläche', 'Ιδιωτική διεπαφή μόνο για την εταιρεία μου']),
      o('log', ['Kimin ne yaptığının kaydı', 'A record of who did what', 'Protokoll, wer was getan hat', 'Αρχείο ενεργειών ποιος έκανε τι']),
    ] },
  { id: 'crm_panels', type: 'multi', t: l4(['Hangi paneller ve rakamlar ana ekranda görünsün?', 'Which panels and key figures should the home screen show?', 'Welche Übersichten und Kennzahlen soll die Startseite zeigen?', 'Ποιοι πίνακες και δείκτες να εμφανίζονται στην αρχική οθόνη;']),
    options: [
      o('today', ['Bugünün işleri ve randevuları', 'Today’s tasks and appointments', 'Aufgaben und Termine von heute', 'Εργασίες και ραντεβού της ημέρας']),
      o('leads', ['Yeni talepler ve aşamalar', 'New enquiries and their stages', 'Neue Anfragen und ihre Phasen', 'Νέα αιτήματα και στάδια']),
      o('money', ['Açık teklifler ve ödenmemiş faturalar', 'Open quotes and unpaid invoices', 'Offene Angebote und unbezahlte Rechnungen', 'Ανοιχτές προσφορές και απλήρωτα τιμολόγια']),
      o('revenue', ['Aylık ciro ve müşteri sayısı', 'Monthly revenue and customer count', 'Monatsumsatz und Kundenzahl', 'Μηνιαίος τζίρος και αριθμός πελατών']),
      o('followup', ['Takip edilmesi gereken müşteriler', 'Customers to follow up', 'Kunden zum Nachfassen', 'Πελάτες για παρακολούθηση']),
    ] },
  { id: 'crm_connect', type: 'text', t: l4(['Sistem hangi araçlarla bağlantılı çalışmalı? (ör. e-posta, WhatsApp, takvim, muhasebe, web sitesi formu)', 'Which tools should the system work with? (e.g. e-mail, WhatsApp, calendar, accounting, website form)', 'Mit welchen Tools soll das System zusammenarbeiten? (z. B. E-Mail, WhatsApp, Kalender, Buchhaltung, Website-Formular)', 'Με ποια εργαλεία πρέπει να συνδέεται το σύστημα; (π.χ. e-mail, WhatsApp, ημερολόγιο, λογιστική, φόρμα ιστοσελίδας)']) },
  { id: 'crm_ai', type: 'multi', t: l4(['Yapay zekâ özellikleri ister misiniz?', 'Do you want AI features?', 'Möchten Sie KI-Funktionen?', 'Θέλετε λειτουργίες τεχνητής νοημοσύνης;']),
    options: [
      o('summary', ['Talep ve görüşme özetleri', 'Summaries of enquiries and conversations', 'Zusammenfassungen von Anfragen und Gesprächen', 'Περιλήψεις αιτημάτων και συζητήσεων']),
      o('drafts', ['Yanıt taslakları', 'Reply drafts', 'Antwortentwürfe', 'Πρόχειρες απαντήσεις']),
      o('classify', ['Talepleri otomatik sınıflandırma', 'Automatic sorting of enquiries', 'Anfragen automatisch einordnen', 'Αυτόματη ταξινόμηση αιτημάτων']),
      o('assistant', ['Verilerime soru sorabileceğim asistan', 'An assistant I can ask about my data', 'Ein Assistent, den ich zu meinen Daten befragen kann', 'Βοηθός στον οποίο μπορώ να κάνω ερωτήσεις για τα δεδομένα μου']),
      o('none', ['Şimdilik gerek yok', 'Not needed for now', 'Vorerst nicht nötig', 'Προς το παρόν δεν χρειάζεται']),
    ] },
  { id: 'crm_import', type: 'yn', detail: true, t: l4(['Aktarılması gereken mevcut verileriniz var mı? (ör. Excel listesi, eski program) Varsa nerede?', 'Do you have existing data to transfer? (e.g. Excel list, old software) If so, where?', 'Gibt es bestehende Daten, die übernommen werden sollen? (z. B. Excel-Liste, altes Programm) Wenn ja, wo?', 'Έχετε υπάρχοντα δεδομένα για μεταφορά; (π.χ. λίστα Excel, παλιό πρόγραμμα) Αν ναι, πού;']) },
  { id: 'crm_name', type: 'text', t: l4(['Sistemin adı ve görünümü için isteğiniz var mı? (isteğe bağlı)', 'Any wishes for the name and look of the system? (optional)', 'Haben Sie Wünsche zu Name und Aussehen des Systems? (optional)', 'Έχετε επιθυμίες για το όνομα και την εμφάνιση του συστήματος; (προαιρετικά)']) },
];

export const AUTO_Q: StaticQ[] = [
  { id: 'auto_goal', type: 'multi', required: true, t: l4(['Hangi işler kendiliğinden yürüsün?', 'Which tasks should run by themselves?', 'Welche Aufgaben sollen von selbst laufen?', 'Ποιες εργασίες να γίνονται μόνες τους;']),
    options: [
      o('leads', ['Yeni talepleri kaydetme ve bana bildirme', 'Saving new enquiries and notifying me', 'Neue Anfragen speichern und mich benachrichtigen', 'Καταγραφή νέων αιτημάτων και ειδοποίηση']),
      o('docs', ['Teklif veya fatura hazırlama', 'Preparing quotes or invoices', 'Angebote oder Rechnungen vorbereiten', 'Ετοιμασία προσφορών ή τιμολογίων']),
      o('reminders', ['Randevu ve ödeme hatırlatmaları', 'Appointment and payment reminders', 'Termin- und Zahlungserinnerungen', 'Υπενθυμίσεις ραντεβού και πληρωμών']),
      o('replies', ['Müşterilere otomatik e-posta / mesaj', 'Automatic e-mails / messages to customers', 'Automatische E-Mails / Nachrichten an Kunden', 'Αυτόματα e-mail / μηνύματα σε πελάτες']),
      o('sync', ['Programlar arasında veri aktarma (Excel, muhasebe, CRM…)', 'Moving data between programs (Excel, accounting, CRM…)', 'Daten zwischen Programmen übertragen (Excel, Buchhaltung, CRM…)', 'Μεταφορά δεδομένων μεταξύ προγραμμάτων (Excel, λογιστική, CRM…)']),
      o('reports', ['Düzenli rapor ve özetler', 'Regular reports and summaries', 'Regelmäßige Berichte und Zusammenfassungen', 'Τακτικές αναφορές και περιλήψεις']),
      o('reviews', ['Yorum ve sosyal medya takibi', 'Watching reviews and social media', 'Bewertungen und Social Media im Blick', 'Παρακολούθηση κριτικών και social media']),
    ] },
  { id: 'auto_repeat', type: 'text', t: l4(['Şu an en çok tekrar eden iş hangisi? Kısaca anlatın.', 'Which task do you repeat most today? Describe it briefly.', 'Welche Aufgabe wiederholt sich bei Ihnen am häufigsten? Bitte kurz beschreiben.', 'Ποια εργασία επαναλαμβάνεται συχνότερα σήμερα; Περιγράψτε σύντομα.']) },
  { id: 'auto_volume', type: 'single', t: l4(['Ayda yaklaşık kaç kez çalışacak?', 'Roughly how often per month will it run?', 'Wie oft pro Monat läuft es ungefähr?', 'Πόσες φορές τον μήνα περίπου;']),
    options: [o('low', ['50\'den az', 'Under 50', 'Unter 50', 'Κάτω από 50']), o('mid', ['50 – 500', '50 – 500', '50 – 500', '50 – 500']), o('high', ['500\'den fazla', 'Over 500', 'Über 500', 'Πάνω από 500']), o('unsure', ['Bilmiyorum', 'Not sure', 'Weiß nicht', 'Δεν ξέρω'])] },
  { id: 'auto_tools', type: 'text', t: l4(['Hangi programlarla bağlantılı çalışmalı? (ör. Gmail, Excel / Google Sheets, muhasebe programı, WhatsApp, takvim)', 'Which programs should it work with? (e.g. Gmail, Excel / Google Sheets, accounting software, WhatsApp, calendar)', 'Mit welchen Programmen soll es zusammenarbeiten? (z. B. Gmail, Excel / Google Sheets, Buchhaltung, WhatsApp, Kalender)', 'Με ποια προγράμματα να συνεργάζεται; (π.χ. Gmail, Excel / Google Sheets, λογιστικό πρόγραμμα, WhatsApp, ημερολόγιο)']) },
  { id: 'auto_data', type: 'multi', t: l4(['Bilgiler şu an nerede duruyor?', 'Where does your data live today?', 'Wo liegen Ihre Daten derzeit?', 'Πού βρίσκονται σήμερα τα δεδομένα σας;']),
    options: [
      o('excel', ['Excel / Google Sheets', 'Excel / Google Sheets', 'Excel / Google Sheets', 'Excel / Google Sheets']),
      o('mail', ['E-postalarda', 'In e-mails', 'In E-Mails', 'Σε e-mail']),
      o('paper', ['Kâğıt / defter', 'On paper', 'Auf Papier', 'Σε χαρτί']),
      o('software', ['Bir programda', 'In a software tool', 'In einer Software', 'Σε κάποιο πρόγραμμα']),
      o('chat', ['Mesajlaşma uygulamalarında', 'In messaging apps', 'In Messenger-Apps', 'Σε εφαρμογές μηνυμάτων']),
    ] },
  { id: 'auto_trigger', type: 'text', t: l4(['Bu işler genelde ne zaman başlıyor? (ör. form doldurulunca, yeni e-posta gelince, her sabah)', 'When do these tasks usually start? (e.g. when a form is sent, a new e-mail arrives, every morning)', 'Wann beginnen diese Aufgaben meist? (z. B. wenn ein Formular abgeschickt wird, eine E-Mail eingeht, jeden Morgen)', 'Πότε ξεκινούν συνήθως αυτές οι εργασίες; (π.χ. όταν σταλεί φόρμα, όταν έρθει e-mail, κάθε πρωί)']) },
  { id: 'auto_result', type: 'multi', t: l4(['İş bittiğinde ne olsun?', 'What should happen at the end?', 'Was soll am Ende passieren?', 'Τι να συμβαίνει στο τέλος;']),
    options: [
      o('notify', ['Bana bildirim gelsin', 'I get a notification', 'Ich werde benachrichtigt', 'Να λαμβάνω ειδοποίηση']),
      o('document', ['Belge hazırlansın (teklif, fatura, rapor)', 'A document is prepared (quote, invoice, report)', 'Ein Dokument wird erstellt (Angebot, Rechnung, Bericht)', 'Να δημιουργείται έγγραφο (προσφορά, τιμολόγιο, αναφορά)']),
      o('entry', ['Bir listeye / sisteme kayıt eklensin', 'An entry is added to a list or system', 'Ein Eintrag in einer Liste oder einem System', 'Να προστίθεται εγγραφή σε λίστα ή σύστημα']),
      o('message', ['Müşteriye mesaj gitsin', 'A message goes to the customer', 'Eine Nachricht geht an den Kunden', 'Να φεύγει μήνυμα στον πελάτη']),
    ] },
  { id: 'auto_control', type: 'single', t: l4(['Otomasyon bir şey göndermeden önce sizin onayınızı alsın mı?', 'Should the automation ask for your approval before sending anything?', 'Soll die Automatisierung vor dem Versand Ihre Freigabe einholen?', 'Να ζητά η αυτοματοποίηση την έγκρισή σας πριν στείλει κάτι;']),
    options: [o('always', ['Evet, her seferinde', 'Yes, every time', 'Ja, jedes Mal', 'Ναι, κάθε φορά']), o('important', ['Sadece önemli işlerde', 'Only for important things', 'Nur bei wichtigen Dingen', 'Μόνο για σημαντικά']), o('never', ['Hayır, tamamen otomatik', 'No, fully automatic', 'Nein, vollautomatisch', 'Όχι, πλήρως αυτόματα']), o('unsure', ['Emin değilim', 'Not sure', 'Weiß nicht', 'Δεν είμαι σίγουρος/η'])] },
  { id: 'auto_success', type: 'text', t: l4(['Başarıyı neyle ölçersiniz? (ör. haftada 5 saat tasarruf, daha az hata)', 'How will you measure success? (e.g. 5 hours saved per week, fewer mistakes)', 'Woran messen Sie den Erfolg? (z. B. 5 Stunden Zeitersparnis pro Woche, weniger Fehler)', 'Πώς θα μετρήσετε την επιτυχία; (π.χ. 5 ώρες εξοικονόμηση την εβδομάδα, λιγότερα λάθη)']) },
];

export const APP_Q: StaticQ[] = [
  { id: 'app_purpose', type: 'text', required: true, t: l4(['Uygulama / panel ne işe yarayacak? Kısaca anlatın.', 'What should the app / panel do? Describe it briefly.', 'Wofür soll die App / der Login-Bereich da sein? Kurz beschreiben.', 'Τι θα κάνει η εφαρμογή / ο πίνακας; Περιγράψτε σύντομα.']) },
  { id: 'app_manage', type: 'multi', t: l4(['Neleri yönetecek?', 'What should it manage?', 'Was soll damit verwaltet werden?', 'Τι θα διαχειρίζεται;']),
    options: [
      o('customers', ['Müşteriler', 'Customers', 'Kunden', 'Πελάτες']),
      o('leads', ['Gelen talepler', 'Enquiries', 'Anfragen', 'Αιτήματα']),
      o('offers', ['Teklifler', 'Quotes', 'Angebote', 'Προσφορές']),
      o('appointments', ['Randevular', 'Appointments', 'Termine', 'Ραντεβού']),
      o('tasks', ['Görevler', 'Tasks', 'Aufgaben', 'Εργασίες']),
      o('invoices', ['Faturalar', 'Invoices', 'Rechnungen', 'Τιμολόγια']),
      o('files', ['Belgeler ve dosyalar', 'Documents and files', 'Dokumente und Dateien', 'Έγγραφα και αρχεία']),
    ] },
  { id: 'app_users', type: 'single', t: l4(['Kim kullanacak?', 'Who will use it?', 'Wer nutzt es?', 'Ποιος θα το χρησιμοποιεί;']),
    options: [o('me', ['Sadece ben', 'Only me', 'Nur ich', 'Μόνο εγώ']), o('team', ['Ben ve ekibim', 'Me and my team', 'Ich und mein Team', 'Εγώ και η ομάδα μου']), o('clients', ['Müşterilerim de giriş yapacak', 'My customers will log in too', 'Auch meine Kunden melden sich an', 'Θα συνδέονται και οι πελάτες μου'])] },
  { id: 'app_login', type: 'multi', t: l4(['Giriş ve güvenlik için neler istersiniz?', 'What do you want for login and security?', 'Was wünschen Sie sich für Login und Sicherheit?', 'Τι θέλετε για τη σύνδεση και την ασφάλεια;']),
    options: [
      o('password', ['E-posta ve şifreyle giriş', 'Login with e-mail and password', 'Login mit E-Mail und Passwort', 'Σύνδεση με e-mail και κωδικό']),
      o('twostep', ['İki adımlı giriş', 'Two-step login', 'Zwei-Faktor-Anmeldung', 'Σύνδεση δύο βημάτων']),
      o('roles', ['Kişiye göre farklı yetkiler', 'Different permissions per person', 'Unterschiedliche Rechte je Person', 'Διαφορετικά δικαιώματα ανά άτομο']),
      o('private', ['Yalnızca şirketime özel, kapalı bir arayüz', 'A private interface for my company only', 'Eine nur für mein Unternehmen zugängliche Oberfläche', 'Ιδιωτική διεπαφή μόνο για την εταιρεία μου']),
    ] },
  { id: 'app_panels', type: 'text', t: l4(['Hangi paneller ve temel rakamlar görünsün? (ör. bugünün işleri, aylık ciro, açık talepler)', 'Which panels and key figures should it show? (e.g. today’s tasks, monthly revenue, open enquiries)', 'Welche Übersichten und Kennzahlen soll es zeigen? (z. B. Aufgaben von heute, Monatsumsatz, offene Anfragen)', 'Ποιοι πίνακες και βασικοί δείκτες να εμφανίζονται; (π.χ. εργασίες της ημέρας, μηνιαίος τζίρος, ανοιχτά αιτήματα)']) },
  { id: 'app_connect', type: 'text', t: l4(['Hangi araçlarla bağlantılı çalışmalı? (ör. e-posta, takvim, muhasebe, WhatsApp, web sitesi formları)', 'Which tools should it connect to? (e.g. e-mail, calendar, accounting, WhatsApp, website forms)', 'Mit welchen Tools soll es verbunden sein? (z. B. E-Mail, Kalender, Buchhaltung, WhatsApp, Website-Formulare)', 'Με ποια εργαλεία να συνδέεται; (π.χ. e-mail, ημερολόγιο, λογιστική, WhatsApp, φόρμες ιστοσελίδας)']) },
  { id: 'app_ai', type: 'multi', t: l4(['Yapay zekâ özellikleri ister misiniz?', 'Do you want AI features?', 'Möchten Sie KI-Funktionen?', 'Θέλετε λειτουργίες τεχνητής νοημοσύνης;']),
    options: [
      o('summary', ['Özetler', 'Summaries', 'Zusammenfassungen', 'Περιλήψεις']),
      o('drafts', ['Yanıt taslakları', 'Reply drafts', 'Antwortentwürfe', 'Πρόχειρες απαντήσεις']),
      o('classify', ['Otomatik sınıflandırma', 'Automatic classification', 'Automatische Einordnung', 'Αυτόματη ταξινόμηση']),
      o('assistant', ['Soru sorabileceğim asistan', 'An assistant I can ask questions', 'Ein Assistent für meine Fragen', 'Βοηθός για τις ερωτήσεις μου']),
      o('none', ['Şimdilik gerek yok', 'Not needed for now', 'Vorerst nicht nötig', 'Προς το παρόν δεν χρειάζεται']),
    ] },
  { id: 'app_import', type: 'yn', detail: true, t: l4(['Aktarılması gereken mevcut verileriniz var mı? (ör. Excel, eski program) Varsa nerede?', 'Do you have existing data to transfer? (e.g. Excel, old software) If so, where?', 'Gibt es bestehende Daten, die übernommen werden sollen? (z. B. Excel, altes Programm) Wenn ja, wo?', 'Έχετε υπάρχοντα δεδομένα για μεταφορά; (π.χ. Excel, παλιό πρόγραμμα) Αν ναι, πού;']) },
  { id: 'app_device', type: 'single', t: l4(['Nerede kullanılacak?', 'Where will it be used?', 'Wo wird es genutzt?', 'Πού θα χρησιμοποιείται;']),
    options: [o('phone', ['Çoğunlukla telefonda', 'Mostly on the phone', 'Meist am Handy', 'Κυρίως στο κινητό']), o('desktop', ['Çoğunlukla bilgisayarda', 'Mostly on the computer', 'Meist am Computer', 'Κυρίως στον υπολογιστή']), o('both', ['İkisinde de', 'Both', 'Beides', 'Και στα δύο'])] },
  { id: 'app_name', type: 'text', t: l4(['Adı, renkleri veya görünümü için isteğiniz var mı? Otomatikleşmemesi gereken bir şey var mı? (isteğe bağlı)', 'Any wishes for its name, colours or look? Is there anything that must never be automated? (optional)', 'Haben Sie Wünsche zu Name, Farben oder Aussehen? Gibt es etwas, das nie automatisiert werden darf? (optional)', 'Έχετε επιθυμίες για το όνομα, τα χρώματα ή την εμφάνιση; Υπάρχει κάτι που δεν πρέπει ποτέ να αυτοματοποιηθεί; (προαιρετικά)']) },
];

const LANG_OPTS: Opt[] = [
  o('tr', ['Türkçe', 'Turkish', 'Türkisch', 'Τουρκικά']),
  o('en', ['İngilizce', 'English', 'Englisch', 'Αγγλικά']),
  o('de', ['Almanca', 'German', 'Deutsch', 'Γερμανικά']),
  o('el', ['Yunanca', 'Greek', 'Griechisch', 'Ελληνικά']),
  o('other', ['Başka', 'Other', 'Andere', 'Άλλη']),
];

export const QR_Q: StaticQ[] = [
  { id: 'qr_kind', type: 'single', required: true, t: l4(['Ne için kullanılacak?', 'What is it for?', 'Wofür soll sie genutzt werden?', 'Για ποιον σκοπό θα χρησιμοποιηθεί;']),
    options: [o('menu', ['Restoran / kafe menüsü', 'Restaurant / café menu', 'Restaurant- / Café-Speisekarte', 'Μενού εστιατορίου / καφέ']), o('catalog', ['Ürün kataloğu', 'Product catalogue', 'Produktkatalog', 'Κατάλογος προϊόντων']), o('both', ['İkisi de', 'Both', 'Beides', 'Και τα δύο'])] },
  { id: 'qr_items', type: 'single', t: l4(['Yaklaşık kaç ürün veya yemek olacak?', 'Roughly how many items or dishes?', 'Wie viele Artikel oder Gerichte sind es ungefähr?', 'Περίπου πόσα προϊόντα ή πιάτα θα υπάρχουν;']),
    options: [o('s', ['30’dan az', 'Fewer than 30', 'Weniger als 30', 'Λιγότερα από 30']), o('m', ['30–100', '30–100', '30–100', '30–100']), o('l', ['100’den fazla', 'More than 100', 'Mehr als 100', 'Περισσότερα από 100'])] },
  { id: 'qr_langs', type: 'multi', t: l4(['Menü hangi dillerde olsun?', 'Which languages should it have?', 'In welchen Sprachen soll sie verfügbar sein?', 'Σε ποιες γλώσσες να είναι διαθέσιμο;']), options: LANG_OPTS },
  { id: 'qr_features', type: 'multi', t: l4(['Neler olsun?', 'What should it include?', 'Was soll enthalten sein?', 'Τι θέλετε να περιλαμβάνει;']),
    options: [
      o('photos', ['Ürün fotoğrafları', 'Item photos', 'Artikelfotos', 'Φωτογραφίες προϊόντων']),
      o('allergens', ['İçerik ve alerjen bilgisi', 'Ingredients and allergens', 'Zutaten und Allergene', 'Συστατικά και αλλεργιογόνα']),
      o('soldout', ['Biten ürünü tek dokunuşla gizleme', 'Hide sold-out items with one tap', 'Ausverkaufte Artikel mit einem Tipp ausblenden', 'Απόκρυψη εξαντλημένων προϊόντων με ένα άγγιγμα']),
      o('order', ['Masadan sipariş', 'Ordering from the table', 'Bestellung direkt vom Tisch', 'Παραγγελία από το τραπέζι']),
      o('print', ['Masalar için basılı QR kartları', 'Printed QR cards for tables', 'Gedruckte QR-Karten für die Tische', 'Εκτυπωμένες κάρτες QR για τα τραπέζια']),
    ] },
  { id: 'qr_update', type: 'single', t: l4(['Menüyü kim güncelleyecek?', 'Who will update it?', 'Wer wird die Speisekarte aktualisieren?', 'Ποιος θα ενημερώνει το μενού;']),
    options: [o('me', ['Kendim güncellemek isterim', 'I want to update it myself', 'Ich möchte sie selbst aktualisieren', 'Θέλω να το ενημερώνω ο ίδιος / η ίδια']), o('you', ['Sizin güncellemenizi isterim', 'I would like you to update it', 'Ich möchte, dass Sie sie aktualisieren', 'Θα ήθελα να το ενημερώνετε εσείς'])] },
];

export const BOOKING_Q: StaticQ[] = [
  { id: 'bk_services', type: 'text', required: true, t: l4(['Hangi hizmetler için randevu alınacak? Yaklaşık süreleriyle yazar mısınız?', 'Which services can be booked, and roughly how long does each take?', 'Für welche Leistungen sollen Termine gebucht werden können? Bitte nennen Sie die ungefähre Dauer.', 'Για ποιες υπηρεσίες θα κλείνονται ραντεβού; Γράψτε περίπου και τη διάρκεια της καθεμιάς.']) },
  { id: 'bk_staff', type: 'single', t: l4(['Randevuları kaç kişi karşılıyor?', 'How many people take appointments?', 'Wie viele Personen nehmen Termine wahr?', 'Πόσα άτομα εξυπηρετούν ραντεβού;']),
    options: [o('one', ['Sadece ben', 'Only me', 'Nur ich', 'Μόνο εγώ']), o('few', ['2–5 kişi', '2–5 people', '2–5 Personen', '2–5 άτομα']), o('many', ['6 veya daha fazla', '6 or more', '6 oder mehr', '6 ή περισσότερα'])] },
  { id: 'bk_hours', type: 'text', t: l4(['Çalışma saatleriniz nedir?', 'What are your opening hours?', 'Wie lauten Ihre Öffnungszeiten?', 'Ποιες είναι οι ώρες λειτουργίας σας;']) },
  { id: 'bk_now', type: 'single', t: l4(['Randevuları şu an nasıl alıyorsunuz?', 'How do you take bookings today?', 'Wie nehmen Sie Termine derzeit entgegen?', 'Πώς κλείνετε ραντεβού σήμερα;']),
    options: [
      o('phone', ['Telefonla', 'By phone', 'Telefonisch', 'Τηλεφωνικά']),
      o('msg', ['Mesajla', 'By message', 'Per Nachricht', 'Με μήνυμα']),
      o('paper', ['Defter / kâğıt', 'Paper diary', 'Terminbuch auf Papier', 'Σε τετράδιο / χαρτί']),
      o('app', ['Bir uygulamayla', 'With an app', 'Mit einer App', 'Με εφαρμογή']),
      o('none', ['Henüz randevu almıyorum', 'I do not take bookings yet', 'Ich nehme noch keine Termine entgegen', 'Δεν κλείνω ακόμη ραντεβού']),
    ] },
  { id: 'bk_features', type: 'multi', t: l4(['Neler önemli?', 'What matters to you?', 'Was ist Ihnen wichtig?', 'Τι είναι σημαντικό για εσάς;']),
    options: [
      o('reminders', ['Otomatik e-posta hatırlatmaları', 'Automatic e-mail reminders', 'Automatische E-Mail-Erinnerungen', 'Αυτόματες υπενθυμίσεις μέσω e-mail']),
      o('cancel', ['Müşterinin online iptal / erteleme yapabilmesi', 'Customers can cancel or reschedule online', 'Kunden können online stornieren oder verschieben', 'Οι πελάτες μπορούν να ακυρώνουν ή να αλλάζουν ραντεβού online']),
      o('deposit', ['Ön ödeme / kapora', 'Deposit or prepayment', 'Anzahlung oder Vorauszahlung', 'Προκαταβολή']),
      o('calendar', ['Mevcut takvimimle uyum', 'Sync with my existing calendar', 'Abgleich mit meinem bestehenden Kalender', 'Συγχρονισμός με το υπάρχον ημερολόγιό μου']),
      o('branches', ['Birden fazla şube', 'More than one location', 'Mehr als ein Standort', 'Περισσότερα από ένα καταστήματα']),
    ] },
];

export const INV_Q: StaticQ[] = [
  { id: 'inv_volume', type: 'single', required: true, t: l4(['Ayda yaklaşık kaç teklif veya fatura hazırlıyorsunuz?', 'Roughly how many quotes or invoices per month?', 'Wie viele Angebote oder Rechnungen erstellen Sie ungefähr pro Monat?', 'Περίπου πόσες προσφορές ή τιμολόγια εκδίδετε τον μήνα;']),
    options: [o('s', ['20’den az', 'Fewer than 20', 'Weniger als 20', 'Λιγότερα από 20']), o('m', ['20–100', '20–100', '20–100', '20–100']), o('l', ['100’den fazla', 'More than 100', 'Mehr als 100', 'Περισσότερα από 100'])] },
  { id: 'inv_now', type: 'single', t: l4(['Şu an nasıl hazırlıyorsunuz?', 'How do you prepare them today?', 'Wie erstellen Sie diese derzeit?', 'Πώς τα ετοιμάζετε σήμερα;']),
    options: [
      o('office', ['Word / Excel ile', 'With Word / Excel', 'Mit Word / Excel', 'Με Word / Excel']),
      o('software', ['Bir muhasebe programıyla', 'With accounting software', 'Mit einer Buchhaltungssoftware', 'Με λογιστικό πρόγραμμα']),
      o('hand', ['Elle', 'By hand', 'Von Hand', 'Με το χέρι']),
      o('accountant', ['Muhasebecim hazırlıyor', 'My accountant does it', 'Mein Steuerberater erstellt sie', 'Τα ετοιμάζει ο λογιστής μου']),
    ] },
  { id: 'inv_features', type: 'multi', t: l4(['Neler otomatik olsun?', 'What should be automatic?', 'Was soll automatisch ablaufen?', 'Τι θέλετε να γίνεται αυτόματα;']),
    options: [
      o('offer', ['Onaylanan tekliften fatura', 'Invoice from an accepted quote', 'Rechnung aus einem angenommenen Angebot', 'Τιμολόγιο από αποδεκτή προσφορά']),
      o('recurring', ['Tekrarlayan faturalar', 'Recurring invoices', 'Wiederkehrende Rechnungen', 'Επαναλαμβανόμενα τιμολόγια']),
      o('reminders', ['Ödeme hatırlatmaları', 'Payment reminders', 'Zahlungserinnerungen', 'Υπενθυμίσεις πληρωμής']),
      o('einvoice', ['E-fatura uyumu', 'E-invoicing compliance', 'Konformität mit der E-Rechnung', 'Συμμόρφωση με το ηλεκτρονικό τιμολόγιο']),
      o('export', ['Muhasebeciye aktarım', 'Export for my accountant', 'Export für meinen Steuerberater', 'Εξαγωγή για τον λογιστή μου']),
    ] },
  { id: 'inv_tools', type: 'text', t: l4(['Hangi muhasebe programıyla veya muhasebeciyle çalışıyorsunuz?', 'Which accounting software or accountant do you work with?', 'Mit welcher Buchhaltungssoftware oder welchem Steuerberater arbeiten Sie?', 'Με ποιο λογιστικό πρόγραμμα ή λογιστή συνεργάζεστε;']) },
];

export const AI_Q: StaticQ[] = [
  { id: 'ai_where', type: 'multi', required: true, t: l4(['Asistan nerede yanıt versin?', 'Where should the assistant answer?', 'Wo soll der Assistent antworten?', 'Πού θα απαντά ο βοηθός;']),
    options: [
      o('site', ['Web sitemde yazılı sohbet', 'Text chat on my website', 'Text-Chat auf meiner Website', 'Γραπτή συνομιλία στον ιστότοπό μου']),
      o('voice', ['Web sitemde sesli asistan', 'Voice assistant on my website', 'Sprachassistent auf meiner Website', 'Φωνητικός βοηθός στον ιστότοπό μου']),
      o('internal', ['Ekibim için iç asistan', 'Internal assistant for my team', 'Interner Assistent für mein Team', 'Εσωτερικός βοηθός για την ομάδα μου']),
    ] },
  { id: 'ai_topics', type: 'text', t: l4(['En çok hangi soruları yanıtlamalı?', 'Which questions should it answer most?', 'Welche Fragen soll er am häufigsten beantworten?', 'Ποιες ερωτήσεις θα πρέπει να απαντά συχνότερα;']) },
  { id: 'ai_langs', type: 'multi', t: l4(['Hangi dillerde konuşmalı?', 'Which languages should it speak?', 'Welche Sprachen soll er sprechen?', 'Σε ποιες γλώσσες θα μιλά;']), options: LANG_OPTS },
  { id: 'ai_handoff', type: 'single', t: l4(['Gelen talepler size nasıl ulaşsın?', 'How should enquiries reach you?', 'Wie sollen Anfragen bei Ihnen ankommen?', 'Πώς θέλετε να σας φτάνουν τα αιτήματα;']),
    options: [
      o('mail', ['E-posta özeti', 'E-mail summary', 'Zusammenfassung per E-Mail', 'Περίληψη μέσω e-mail']),
      o('crm', ['Müşteri sistemime kayıt', 'Saved to my customer system', 'Eintrag in meinem Kundensystem', 'Καταχώριση στο σύστημα πελατών μου']),
      o('both', ['İkisi de', 'Both', 'Beides', 'Και τα δύο']),
    ] },
];

export const FINAL_Q: StaticQ[] = [
  { id: 'fin_time', type: 'single', required: true, t: l4(['Ne zaman başlamak istersiniz?', 'When would you like to start?', 'Wann möchten Sie starten?', 'Πότε θα θέλατε να ξεκινήσετε;']),
    options: [o('asap', ['Olabildiğince erken', 'As soon as possible', 'So bald wie möglich', 'Όσο το δυνατόν νωρίτερα']), o('soon', ['1–3 ay içinde', 'Within 1–3 months', 'Innerhalb von 1–3 Monaten', 'Εντός 1–3 μηνών']), o('flex', ['Esneğim', 'I am flexible', 'Ich bin flexibel', 'Είμαι ευέλικτος/η'])] },
  { id: 'fin_note', type: 'text', t: l4(['Eklemek istediğiniz bir şey var mı? (isteğe bağlı)', 'Anything you would like to add? (optional)', 'Möchten Sie noch etwas ergänzen? (optional)', 'Θέλετε να προσθέσετε κάτι; (προαιρετικά)']) },
];

export const SECTION_STATIC: Record<'start' | 'tech' | 'crm' | 'auto' | 'app' | 'qr' | 'booking' | 'invoices' | 'ai' | 'final' | 'website' | 'automation' | 'notsure', L4> = {
  website: l4(['Web sitesi', 'Website', 'Website', 'Ιστοσελίδα']),
  automation: l4(['Otomasyon', 'Automation', 'Automatisierung', 'Αυτοματοποίηση']),
  notsure: l4(['İhtiyacınız', 'Your needs', 'Ihr Bedarf', 'Η ανάγκη σας']),
  auto: l4(['Otomasyon ayrıntıları', 'Automation details', 'Details zur Automatisierung', 'Λεπτομέρειες αυτοματοποίησης']),
  app: l4(['Size özel uygulama / panel', 'Your own app / panel', 'Ihre eigene App / Ihr Login-Bereich', 'Η δική σας εφαρμογή / πίνακας']),
  crm: l4(['Müşteri yönetim sisteminiz (CRM)', 'Your customer management system (CRM)', 'Ihr Kundenverwaltungssystem (CRM)', 'Το σύστημα διαχείρισης πελατών σας (CRM)']),
  start: l4(['Kısa tanışma', 'Getting to know you', 'Kurz kennenlernen', 'Σύντομη γνωριμία']),
  qr: l4(['QR menü', 'QR menu', 'QR-Speisekarte', 'Μενού QR']),
  booking: l4(['Online randevu', 'Online booking', 'Online-Termine', 'Online ραντεβού']),
  invoices: l4(['Teklif ve fatura', 'Quotes and invoices', 'Angebote und Rechnungen', 'Προσφορές και τιμολόγια']),
  ai: l4(['Yapay zekâ asistanı', 'AI assistant', 'KI-Assistent', 'Βοηθός τεχνητής νοημοσύνης']),
  final: l4(['Son adım', 'Last step', 'Letzter Schritt', 'Τελευταίο βήμα']),
  tech: l4(['Teknik altyapı', 'Technical basics', 'Technische Grundlagen', 'Τεχνική υποδομή']),
};

// Consent: replaces the schema text, which said "not shared with third parties" (not true: AI + e-mail providers).
export type Market = 'DE' | 'TR' | 'GR' | 'other';
export const MARKETS: Market[] = ['DE', 'TR', 'GR', 'other'];
export const CONSENT: Record<'gdpr' | 'kvkk', L4> = {
  gdpr: l4([
    'Bilgilerimin yalnızca teklif hazırlanması amacıyla işlenmesini kabul ediyorum (GDPR / DSGVO). Satılmaz, reklam için kullanılmaz.',
    'I agree that my details are processed solely to prepare an offer (GDPR). They are not sold or used for advertising.',
    'Ich bin einverstanden, dass meine Angaben ausschließlich zur Erstellung eines Angebots verarbeitet werden (DSGVO). Sie werden nicht verkauft und nicht für Werbung genutzt.',
    'Συμφωνώ να γίνει επεξεργασία των στοιχείων μου αποκλειστικά για τη σύνταξη προσφοράς (ΓΚΠΔ / GDPR). Δεν πωλούνται ούτε χρησιμοποιούνται για διαφήμιση.',
  ]),
  kvkk: l4([
    'Bilgilerimin yalnızca teklif hazırlanması amacıyla işlenmesini 6698 sayılı KVKK kapsamında kabul ediyorum. Satılmaz, reklam için kullanılmaz.',
    'I agree that my details are processed solely to prepare an offer under Turkish data protection law (KVKK, Law No. 6698). They are not sold or used for advertising.',
    'Ich bin einverstanden, dass meine Angaben ausschließlich zur Erstellung eines Angebots nach dem türkischen Datenschutzgesetz (KVKK, Nr. 6698) verarbeitet werden. Sie werden nicht verkauft und nicht für Werbung genutzt.',
    'Συμφωνώ να γίνει επεξεργασία των στοιχείων μου αποκλειστικά για τη σύνταξη προσφοράς σύμφωνα με τον τουρκικό νόμο προστασίας δεδομένων (KVKK, αρ. 6698). Δεν πωλούνται ούτε χρησιμοποιούνται για διαφήμιση.',
  ]),
};
export const CONSENT_AI: L4 = l4([
  'Teklifi hazırlamak için yanıtlarım, ABD\'deki bir yapay zekâ hizmet sağlayıcısı tarafından analiz edilebilir.',
  'To prepare the offer, my answers may be analysed by an AI service provider in the USA.',
  'Zur Erstellung des Angebots dürfen meine Antworten von einem KI-Dienstleister in den USA analysiert werden.',
  'Για τη σύνταξη της προσφοράς, οι απαντήσεις μου μπορεί να αναλυθούν από πάροχο υπηρεσιών τεχνητής νοημοσύνης στις ΗΠΑ.',
]);

// ── Definition shape served by GET /api/intake/:token (shared with the client page) ──
export interface QDef { id: string; no?: number; type: 'text' | 'single' | 'multi' | 'yn'; t: L4; opts?: { id: string; t: L4 }[]; other?: boolean; detail?: boolean; required?: boolean; help?: L4; costNote?: L4; mustRead?: boolean }
export interface SecDef { id: string; title: L4; qs: QDef[]; intro?: L4; flow?: L4[] }
export interface Definition { sections: SecDef[]; consent: L4; market: Market; sector: SectorKey; wants: string[] }
