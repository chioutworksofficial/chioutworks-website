// Service contract shown after an offer is accepted. One language only, chosen by the client's COUNTRY:
// DE (and German-speaking) → de, TR/AZ → tr, GR/CY → el, others → en. Draft wording: must be reviewed by a lawyer
// before real use (shown to the owner in the admin, not to the client). Rules: context/ozellikler/sozlesme-iptal-devir.md
type L = 'de' | 'tr' | 'el' | 'en';

/** Provider data (already public in the Impressum). */
export const PROVIDER = {
  name: 'Chioutworks', owner: 'Chousein Chiout', street: 'Waldstraße 124E', city: '65451 Kelsterbach', country: { de: 'Deutschland', tr: 'Almanya', el: 'Γερμανία', en: 'Germany' } as Record<L, string>,
  vatId: 'DE368407083',
};

/** Language that usually fits a client's country (only a SUGGESTION shown to the owner). */
export const marketLang = (market: string | undefined): L | null => {
  const m = String(market ?? '').toUpperCase();
  if (m === 'DE' || m === 'AT' || m === 'CH' || m === 'LI' || m === 'LU') return 'de';
  if (m === 'TR' || m === 'AZ') return 'tr';
  if (m === 'GR' || m === 'CY') return 'el';
  if (m && m !== 'OTHER') return 'en';
  return null;
};
/** Owner's rule (2026-11-23, replaces the 2026-11-17 "offer language" rule): the BINDING contract language follows the client's COUNTRY:
 *  DE/AT/CH/LI/LU → de, TR/AZ → tr, GR/CY → en (binding) + Greek copy, everything else → en. Without a country the offer's language is used. */
export const contractLangFor = (market: string | undefined, offerLang: string): L => {
  const m = String(market ?? '').toUpperCase();
  if (!m || m === 'OTHER') return (['de', 'tr', 'el', 'en'] as const).includes(offerLang as L) ? (offerLang as L) : 'en';
  const l = marketLang(m);
  return l === 'el' || !l ? 'en' : l;
};
/** GR/CY: a Greek copy (marked "translation only") goes with the English binding text. */
export const copyLangFor = (market: string | undefined): L | null => (marketLang(market) === 'el' ? 'el' : null);
/** DE: client chooses digital acceptance or a printed copy by post; GR/CY: typed full name counts as signature; others: online acceptance. */
export type SignMode = 'choice' | 'typed_name' | 'digital';
export const signModeFor = (market: string | undefined): SignMode => (marketLang(market) === 'de' ? 'choice' : marketLang(market) === 'el' ? 'typed_name' : 'digital');

export interface ContractInput {
  lang: L; currency: string; items: { title: string; detail: string; amount: number }[]; total: number;
  depositPct: number; installments: number; monthly: number; monthlyIncludes: string;
  client: { company: string; address: string; signer: string; role: string };
  date: string;   // contract date (ISO)
  showcase?: boolean;   // client allowed the project as a reference (chosen before the contract is shown); clause only when true
  market?: string; summary?: string;   // summary = one-sentence job description (only passed when it is in the contract language)
  liveDays?: number;   // working days until live (default 20)
  extraOut?: string[];   // offer-specific exclusions (already in the contract language)
  oneTime?: boolean;   // no monthly fee: code handed over on delivery
}
export interface ContractDoc { lang: L; title: string; parties: string[]; sections: { title: string; body: string[] }[]; footer: string; draft: string; signMode?: SignMode; signNote?: string; copy?: ContractDoc; copyNotice?: string }

const LOCALE: Record<L, string> = { de: 'de-DE', tr: 'tr-TR', el: 'el-GR', en: 'en-GB' };
const money = (l: L, n: number, c: string) => new Intl.NumberFormat(LOCALE[l], { style: 'currency', currency: c || 'EUR' }).format(n);
const day = (l: L, iso: string | Date) => new Intl.DateTimeFormat(LOCALE[l], { dateStyle: 'long' }).format(new Date(iso));
const addDays = (iso: string, n: number) => new Date(new Date(iso).getTime() + n * 86400e3);
const DRAFT: Record<L, string> = { de: 'Entwurf: von einem Anwalt zu prüfen.', tr: 'Avukata doğrulatılacak taslaktır.', el: 'Προσχέδιο προς έλεγχο από δικηγόρο.', en: 'Draft to be verified by a lawyer.' };
const SIGN: Record<SignMode, Record<L, string>> = {
  choice: { de: 'Annahme nach Wahl des Auftraggebers: digital (Name eingeben und bestätigen) oder als gedruckte Kopie per Post.', tr: '', el: '', en: '' },
  typed_name: { de: '', tr: '', el: 'Το πληκτρολογημένο ονοματεπώνυμο θεωρείται υπογραφή.', en: 'The typed full name counts as the signature.' },
  digital: { de: 'Digitale Annahme online.', tr: 'Dijital kabul (çevrimiçi).', el: 'Ηλεκτρονική αποδοχή.', en: 'Online acceptance.' },
};
const COPY_NOTICE: Record<'el' | 'en', string> = { el: 'Αυτό είναι μόνο η μετάφραση της σύμβασης· το αγγλικό κείμενο είναι το δεσμευτικό.', en: 'A Greek copy follows. It is only a translation; the English text is binding.' };

export function buildContract(c: ContractInput): ContractDoc {
  const mode = signModeFor(c.market);
  const doc = buildOne(c, c.lang, mode);
  const cl = c.lang === 'en' ? copyLangFor(c.market) : null;
  if (!cl) return doc;
  return { ...doc, signNote: [doc.signNote, COPY_NOTICE.en].filter(Boolean).join(' '), copy: { ...buildOne(c, cl, mode), signNote: '' }, copyNotice: COPY_NOTICE.el };
}

function buildOne(c: ContractInput, l: L, mode: SignMode): ContractDoc {
  const m = (n: number) => money(l, n, c.currency);
  const p = PROVIDER;
  const dep = Math.round(c.total * c.depositPct) / 100;
  const rest = Math.max(0, c.total - dep);
  const one = !!c.oneTime || c.monthly <= 0;
  const live = new Date(addDays(c.date, Math.ceil(((c.liveDays ?? 20) * 7) / 5)));
  const firstMonthly = new Date(live.getFullYear(), live.getMonth() + 1, 1, 12);
  const dDep = day(l, c.date), dLive = day(l, live), dMon = day(l, firstMonthly);
  const items = c.items.map((it) => `• ${it.title}${it.detail ? ` (${it.detail})` : ''}: ${m(it.amount)}`);
  const providerLine = `${p.name}, ${l === 'de' ? 'Inhaber' : l === 'tr' ? 'İşletme sahibi' : l === 'el' ? 'Ιδιοκτήτης' : 'Owner'} ${p.owner}, ${p.street}, ${p.city}, ${p.country[l]}`;
  const clientLine = [c.client.company, c.client.address].filter(Boolean).join(', ');
  const restN = c.installments > 1;

  const T = {
    de: {
      title: 'Vereinbarung über Einrichtung und Betreuung', parties: [`Auftragnehmer: ${providerLine}`, `Auftraggeber: ${clientLine}, vertreten durch ${c.client.signer}${c.client.role ? ` (${c.client.role})` : ''}`],
      s: [
        ['Arbeitsumfang', [c.summary || 'Der Auftragnehmer setzt die Leistung um, die im angenommenen Angebot beschrieben ist.', ...items]],
        ['Was nicht dazugehört', ['Nicht enthalten sind:', '• Funktionen, Seiten oder Anbindungen, die im Angebot nicht genannt sind', '• Erstellen von Inhalten (Texte, Fotos, Übersetzungen, Logos), sofern nicht im Angebot', '• Werbung, SEO-Kampagnen und Betreuung von Social Media', '• Rechtsberatung oder rechtliche Prüfung von Texten', '• Gebühren Dritter (Domain, kostenpflichtige Schnittstellen), sofern nicht im Angebot genannt', '• Besprechungen, Telefonate oder Besuche vor Ort', '• Rechnungs-, Angebots- und Buchhaltungsfunktionen werden als Anbindung an die vom Auftraggeber genutzte Buchhaltungssoftware oder an einen zertifizierten Rechnungsdienst eingerichtet. Die Einhaltung von Steuer-, Buchhaltungs- und Archivierungsvorschriften (in Deutschland u. a. GoBD und E-Rechnungspflicht) liegt beim Auftraggeber und seinem Steuerberater; eine Freigabe durch den Steuerberater vor der Einrichtung wird empfohlen.', 'Was nicht schriftlich im Angebot steht, gehört nicht zum Auftrag.']],
        ['Änderungen (Revision)', ['Zwei Korrekturrunden sind im Preis enthalten. Jede weitere Änderung wird mit 65–75 € pro Stunde berechnet, nach vorheriger Mitteilung des Aufwands.']],
        ['Zahlung', [
          `Einrichtung: ${m(c.total)}. ${c.depositPct >= 100 ? `Fällig in voller Höhe am ${dDep}.` : `${c.depositPct} % (${m(dep)}) sind am ${dDep} fällig, der Rest (${m(rest)}) bei Übergabe${restN ? ` (in ${c.installments} Raten)` : ''}, voraussichtlich am ${dLive}.`}`,
          one ? 'Eine monatliche Gebühr ist nicht vereinbart.' : `Monatlich: ${m(c.monthly)}, im Voraus, erstmals fällig am ${dMon}, danach jeweils am 1. eines Monats.${c.monthlyIncludes ? ` Enthalten: ${c.monthlyIncludes}.` : ''}`,
          'Der Zahlungslink kommt aus dem eigenen Zahlungssystem des Auftragnehmers. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.',
          'Bei Zahlungsverzug von mehr als 7 Tagen darf der Auftragnehmer die Arbeit bzw. die monatlichen Leistungen bis zur Zahlung ruhen lassen; es gelten die gesetzlichen Verzugszinsen.']],
        ['Laufzeit und Ausstieg', one
          ? ['Die Vereinbarung endet mit der Übergabe und vollständigen Zahlung. Vor der Übergabe kann jede Seite mit 30 Tagen Frist in Textform kündigen; bis dahin erbrachte Arbeit wird bezahlt.']
          : ['Die monatliche Betreuung hat eine Mindestlaufzeit von 6 Monaten ab der ersten monatlichen Zahlung und läuft danach monatlich weiter.', 'Jede Seite kann mit 30 Tagen Frist in Textform (Kontaktformular genügt) zum Monatsende kündigen. Bis dahin erbrachte Arbeit wird bezahlt.']],
        ...(one ? [] : [['Support-Zusage', ['Kanal: das Kontaktformular auf der Website (keine Besprechungen, Telefonate oder SMS).', 'Zeiten: Montag bis Freitag, 9–17 Uhr (MEZ). Erste Antwort: innerhalb von 2 Arbeitstagen.', 'Nicht im Support enthalten: neue Funktionen oder Änderungen des Umfangs (nach Stunden berechnet) sowie Probleme durch eigene Änderungen des Auftraggebers oder durch Dienste Dritter.']]]),
        ['Eigentum, Code und Daten', [
          one ? 'Bei Übergabe gehen System und Code ohne Aufpreis auf den Auftraggeber über; danach ist der Auftraggeber verantwortlich.'
            : 'Solange die monatliche Betreuung läuft, bleiben Code und System beim Auftragnehmer; der Auftraggeber nutzt sie per Lizenz. Hosting, Updates, Sicherheit und kleiner Support übernimmt der Auftragnehmer.',
          ...(one ? [] : ['Endet die monatliche Betreuung, werden System und Code ohne Aufpreis an den Auftraggeber übergeben (die Einrichtung ist bereits bezahlt). Danach sind Hosting, Domain, Updates, Sicherheit, Backups und Probleme allein Sache des Auftraggebers.']),
          'Später gewünschte Zusatzarbeit: 65–75 € pro Stunde.',
          'Die Daten gehören immer dem Auftraggeber; der Auftragnehmer verarbeitet sie nur in dessen Auftrag (Auftragsverarbeitungsvertrag nach Art. 28 DSGVO folgt). Allgemeine Vorlagen und Werkzeuge, die der Auftragnehmer in mehreren Projekten nutzt, bleiben bei ihm; der Auftraggeber erhält sein eigenes Projekt. Diese Regeln gelten für alle Kunden gleich.']],
        ['Allgemeines', ['Der Auftraggeber schließt als Unternehmer (§ 14 BGB). Haftung unbeschränkt bei Vorsatz, grober Fahrlässigkeit und Verletzung von Leben, Körper, Gesundheit; sonst auf den Betrag begrenzt, den der Auftraggeber in den letzten 12 Monaten gezahlt hat, soweit zwingendes Recht nicht entgegensteht. KI-Funktionen können Fehler enthalten und sind vom Auftraggeber zu prüfen.', 'Es gilt deutsches Recht; Gerichtsstand, soweit zulässig, Frankfurt am Main. Änderungen bedürfen der Textform.']],
      ], footer: `Ort, Datum: Kelsterbach, ${day(l, c.date)}`,
    },
    tr: {
      title: 'Kurulum ve bakım anlaşması', parties: [`Hizmet veren: ${providerLine}`, `Müşteri: ${clientLine}, temsilen ${c.client.signer}${c.client.role ? ` (${c.client.role})` : ''}`],
      s: [
        ['İş tanımı', [c.summary || 'Hizmet veren, kabul edilen teklifte yazan işi yapar.', ...items]],
        ['Yapmayacaklarım', ['Dahil değildir:', '• Teklifte adı geçmeyen özellik, sayfa veya bağlantılar', '• İçerik üretimi (metin, fotoğraf, çeviri, logo); teklifte yoksa', '• Reklam, SEO kampanyası ve sosyal medya yönetimi', '• Hukuki danışmanlık veya metinlerin hukuki incelemesi', '• Üçüncü tarafların ücretleri (alan adı, ücretli bağlantılar); teklifte yazmıyorsa', '• Toplantı, telefon görüşmesi veya yerinde ziyaret', '• Fatura, teklif ve muhasebeyle ilgili özellikler, müşterinin kullandığı muhasebe yazılımına veya sertifikalı bir fatura hizmetine bağlantı olarak kurulur. Vergi, muhasebe ve yasal arşivleme kurallarına uygunluk (Almanya’da GoBD ve e-fatura yükümlülükleri dahil) müşterinin ve vergi danışmanının sorumluluğundadır; kurulumdan önce müşterinin vergi danışmanına onaylatması önerilir.', 'Teklifte yazılı olmayan iş kapsam dışıdır.']],
        ['Revizyon', ['Fiyata iki düzeltme turu dahildir. Sonraki her değişiklik, emeği önceden bildirilerek saat başı 65–75 € üzerinden ücretlendirilir.']],
        ['Ödeme', [
          `Kurulum: ${m(c.total)}. ${c.depositPct >= 100 ? `Tamamı ${dDep} tarihinde ödenir.` : `%${c.depositPct} (${m(dep)}) ${dDep} tarihinde, kalan (${m(rest)}) teslimde${restN ? ` (${c.installments} taksit)` : ''}, tahminen ${dLive}.`}`,
          one ? 'Aylık ücret kararlaştırılmamıştır.' : `Aylık: ${m(c.monthly)}, peşin; ilk ödeme ${dMon}, sonra her ayın 1’i.${c.monthlyIncludes ? ` Kapsam: ${c.monthlyIncludes}.` : ''}`,
          'Ödeme bağlantısı hizmet verenin kendi ödeme sisteminden gelir. Alman KDV Kanunu §19 gereği KDV hesaplanmaz.',
          'Ödeme 7 günden fazla gecikirse hizmet veren, ödeme yapılana kadar işi veya aylık hizmetleri durdurabilir; yasal gecikme faizi uygulanır.']],
        ['Süre ve çıkış', one
          ? ['Anlaşma, teslim ve ödemenin tamamlanmasıyla sona erer. Teslimden önce her iki taraf 30 gün önceden yazılı (metin) bildirimle çıkabilir; o ana kadar yapılan iş ödenir.']
          : ['Aylık bakımın asgari süresi, ilk aylık ödemeden itibaren 6 aydır; sonrasında ay ay devam eder.', 'Her iki taraf 30 gün önceden yazılı (metin) bildirimle, ay sonu itibarıyla çıkabilir (iletişim formu yeterlidir). O ana kadar yapılan iş ödenir.']],
        ...(one ? [] : [['Destek sözü', ['Kanal: sitedeki iletişim formu (toplantı, telefon veya SMS yok).', 'Saatler: Pazartesi–Cuma, 09:00–17:00 (Orta Avrupa saati). İlk cevap: en geç 2 iş günü içinde.', 'Destek kapsamında olmayanlar: yeni özellikler veya kapsam değişikliği (saat başı ücretli) ve müşterinin kendi değişikliklerinden ya da üçüncü taraf hizmetlerden doğan sorunlar.']]]),
        ['Sahiplik, kod ve veri', [
          one ? 'Teslimde sistem ve kod ek ücret alınmadan müşteriye devredilir; sonrası müşterinin sorumluluğundadır.'
            : 'Aylık bakım sürdükçe kod ve sistem hizmet verende kalır; müşteri lisansla kullanır. Barındırma, güncelleme, güvenlik ve küçük destek hizmet verendedir.',
          ...(one ? [] : ['Aylık bakım sona ererse sistem ve kod ek ücret alınmadan müşteriye devredilir (kurulum zaten ödenmiştir). Sonrasında barındırma, alan adı, güncelleme, güvenlik, yedekleme ve sorunlar tamamen müşterinin sorumluluğundadır.']),
          'Sonradan istenen ek işler saat başı 65–75 €.',
          'Veriler her zaman müşterinindir; hizmet veren yalnızca onun adına işler (GDPR m. 28 veri işleme sözleşmesi ayrıca yapılır). Hizmet verenin birçok projede kullandığı genel şablon ve araçlar onda kalır; müşteri kendi projesini alır. Bu kurallar herkes için aynıdır.']],
        ['Genel hükümler', ['Müşteri bu anlaşmayı girişimci olarak yapar (Alman Medeni Kanunu §14). Sorumluluk kasıt, ağır ihmal ve hayat, beden, sağlık zararlarında sınırsızdır; diğer durumlarda, emredici hukuk aksini gerektirmedikçe, müşterinin son 12 ayda ödediği tutarla sınırlıdır. Yapay zekâ özellikleri hata içerebilir; sonuçları müşteri kontrol eder.', 'Alman hukuku geçerlidir; yetkili mahkeme, mümkün olduğu ölçüde, Frankfurt am Main’dir. Değişiklikler yazılı (metin) yapılır.']],
      ], footer: `Yer, tarih: Kelsterbach, ${day(l, c.date)}`,
    },
    el: {
      title: 'Συμφωνία εγκατάστασης και υποστήριξης', parties: [`Πάροχος: ${providerLine}`, `Πελάτης: ${clientLine}, εκπροσωπούμενος από ${c.client.signer}${c.client.role ? ` (${c.client.role})` : ''}`],
      s: [
        ['Αντικείμενο εργασίας', [c.summary || 'Ο πάροχος υλοποιεί την εργασία που περιγράφεται στην αποδεκτή προσφορά.', ...items]],
        ['Τι δεν περιλαμβάνεται', ['Δεν περιλαμβάνονται:', '• λειτουργίες, σελίδες ή συνδέσεις που δεν αναφέρονται στην προσφορά', '• δημιουργία περιεχομένου (κείμενα, φωτογραφίες, μεταφράσεις, λογότυπα), εκτός αν αναφέρεται στην προσφορά', '• διαφήμιση, καμπάνιες SEO και διαχείριση social media', '• νομική συμβουλή ή νομικός έλεγχος κειμένων', '• χρεώσεις τρίτων (domain, επί πληρωμή συνδέσεις), εκτός αν αναφέρονται στην προσφορά', '• συναντήσεις, τηλεφωνήματα ή επισκέψεις επιτόπου', '• Οι λειτουργίες τιμολόγησης, προσφορών και λογιστικής εγκαθίστανται ως σύνδεση με το λογιστικό λογισμικό που χρησιμοποιεί ο πελάτης ή με πιστοποιημένη υπηρεσία τιμολόγησης. Η συμμόρφωση με τους φορολογικούς, λογιστικούς και αρχειοθέτησης κανόνες (στη Γερμανία μεταξύ άλλων GoBD και υποχρεώσεις ηλεκτρονικού τιμολογίου) αποτελεί ευθύνη του πελάτη και του φοροτεχνικού του· συνιστάται έγκριση από τον φοροτεχνικό πριν την εγκατάσταση.', 'Ό,τι δεν αναγράφεται στην προσφορά δεν ανήκει στην ανάθεση.']],
        ['Αναθεωρήσεις', ['Δύο γύροι διορθώσεων περιλαμβάνονται στην τιμή. Κάθε επιπλέον αλλαγή χρεώνεται 65–75 € την ώρα, αφού ανακοινωθεί πρώτα ο χρόνος.']],
        ['Πληρωμή', [
          `Εγκατάσταση: ${m(c.total)}. ${c.depositPct >= 100 ? `Καταβάλλεται ολόκληρη στις ${dDep}.` : `${c.depositPct}% (${m(dep)}) στις ${dDep}, το υπόλοιπο (${m(rest)}) κατά την παράδοση${restN ? ` (σε ${c.installments} δόσεις)` : ''}, εκτιμώμενα στις ${dLive}.`}`,
          one ? 'Δεν έχει συμφωνηθεί μηνιαία χρέωση.' : `Μηνιαία: ${m(c.monthly)}, προκαταβολικά, πρώτη πληρωμή στις ${dMon}, έπειτα την 1η κάθε μήνα.${c.monthlyIncludes ? ` Περιλαμβάνει: ${c.monthlyIncludes}.` : ''}`,
          'Ο σύνδεσμος πληρωμής προέρχεται από το δικό σύστημα πληρωμών του παρόχου. Σύμφωνα με την §19 του γερμανικού νόμου ΦΠΑ δεν χρεώνεται ΦΠΑ.',
          'Σε καθυστέρηση πληρωμής άνω των 7 ημερών ο πάροχος μπορεί να παγώσει την εργασία ή τις μηνιαίες υπηρεσίες μέχρι την πληρωμή· ισχύουν οι νόμιμοι τόκοι υπερημερίας.']],
        ['Διάρκεια και έξοδος', one
          ? ['Η συμφωνία λήγει με την παράδοση και την πλήρη πληρωμή. Πριν από την παράδοση κάθε πλευρά μπορεί να λύσει τη συμφωνία με γραπτή προειδοποίηση 30 ημερών· η εργασία που έγινε μέχρι τότε πληρώνεται.']
          : ['Η μηνιαία υποστήριξη έχει ελάχιστη διάρκεια 6 μηνών από την πρώτη μηνιαία πληρωμή και συνεχίζεται έπειτα μήνα με μήνα.', 'Κάθε πλευρά μπορεί να αποχωρήσει με γραπτή προειδοποίηση 30 ημερών (αρκεί η φόρμα επικοινωνίας), στο τέλος του μήνα. Η εργασία που έγινε μέχρι τότε πληρώνεται.']],
        ...(one ? [] : [['Υπόσχεση υποστήριξης', ['Κανάλι: η φόρμα επικοινωνίας της ιστοσελίδας (όχι συναντήσεις, τηλεφωνήματα ή SMS).', 'Ώρες: Δευτέρα–Παρασκευή, 09:00–17:00 (ώρα Κεντρικής Ευρώπης). Πρώτη απάντηση: εντός 2 εργάσιμων ημερών.', 'Εκτός υποστήριξης: νέες λειτουργίες ή αλλαγή του αντικειμένου (χρεώνονται ανά ώρα) και προβλήματα από δικές του αλλαγές του πελάτη ή από υπηρεσίες τρίτων.']]]),
        ['Κυριότητα, κώδικας και δεδομένα', [
          one ? 'Κατά την παράδοση το σύστημα και ο κώδικας περνούν στον πελάτη χωρίς επιπλέον χρέωση· έπειτα την ευθύνη έχει ο πελάτης.'
            : 'Όσο διαρκεί η μηνιαία υποστήριξη, ο κώδικας και το σύστημα παραμένουν στον πάροχο· ο πελάτης τα χρησιμοποιεί με άδεια χρήσης. Φιλοξενία, ενημερώσεις, ασφάλεια και μικρή υποστήριξη αναλαμβάνει ο πάροχος.',
          ...(one ? [] : ['Αν λήξει η μηνιαία υποστήριξη, το σύστημα και ο κώδικας παραδίδονται στον πελάτη χωρίς επιπλέον χρέωση (η εγκατάσταση έχει ήδη πληρωθεί). Έπειτα φιλοξενία, domain, ενημερώσεις, ασφάλεια, αντίγραφα ασφαλείας και προβλήματα είναι αποκλειστικά ευθύνη του πελάτη.']),
          'Πρόσθετη εργασία που ζητείται αργότερα: 65–75 € την ώρα.',
          'Τα δεδομένα ανήκουν πάντα στον πελάτη· ο πάροχος τα επεξεργάζεται μόνο για λογαριασμό του (σύμβαση επεξεργασίας κατά το άρθρο 28 GDPR ακολουθεί). Γενικά πρότυπα και εργαλεία που ο πάροχος χρησιμοποιεί σε πολλά έργα παραμένουν δικά του· ο πελάτης παίρνει το δικό του έργο. Οι κανόνες αυτοί ισχύουν το ίδιο για όλους.']],
        ['Γενικά', ['Ο πελάτης συμβάλλεται ως επιχείρηση (§14 γερμανικού Αστικού Κώδικα). Η ευθύνη είναι απεριόριστη για δόλο, βαριά αμέλεια και βλάβη ζωής, σώματος ή υγείας· κατά τα λοιπά περιορίζεται στο ποσό που κατέβαλε ο πελάτης τους τελευταίους 12 μήνες, εκτός αν επιβάλλει άλλως το αναγκαστικό δίκαιο. Οι λειτουργίες ΤΝ μπορεί να περιέχουν λάθη· ο πελάτης ελέγχει τα αποτελέσματα.', 'Εφαρμόζεται το γερμανικό δίκαιο· αρμόδια δικαστήρια, στο μέτρο που επιτρέπεται, της Φρανκφούρτης. Οι τροποποιήσεις γίνονται γραπτώς.']],
      ], footer: `Τόπος, ημερομηνία: Kelsterbach, ${day(l, c.date)}`,
    },
    en: {
      title: 'Agreement for setup and support', parties: [`Provider: ${providerLine}`, `Client: ${clientLine}, represented by ${c.client.signer}${c.client.role ? ` (${c.client.role})` : ''}`],
      s: [
        ['Scope of work', [c.summary || 'The provider carries out the work described in the accepted offer.', ...items]],
        ['What is not included', ['Not included:', '• features, pages or integrations not named in the offer', '• creating content (texts, photos, translations, logos) unless the offer says so', '• advertising, SEO campaigns and social media management', '• legal advice or legal review of texts', '• third-party fees (domain, paid interfaces) unless the offer names them', '• meetings, calls or on-site visits', '• invoicing, quote and bookkeeping features are set up as a connection to the accounting software the client uses or to a certified invoicing service. Compliance with tax, accounting and archiving rules (in Germany including GoBD and e-invoicing obligations) is the responsibility of the client and the client’s tax adviser; approval by the tax adviser before setup is recommended.', 'Work that is not written in the offer is not part of the job.']],
        ['Revisions', ['Two rounds of corrections are included in the price. Every further change is charged at €65–75 per hour, with the effort announced first.']],
        ['Payment', [
          `Setup: ${m(c.total)}. ${c.depositPct >= 100 ? `Due in full on ${dDep}.` : `${c.depositPct}% (${m(dep)}) is due on ${dDep}, the rest (${m(rest)}) on delivery${restN ? ` (in ${c.installments} instalments)` : ''}, expected on ${dLive}.`}`,
          one ? 'No monthly fee has been agreed.' : `Monthly: ${m(c.monthly)}, in advance, first due on ${dMon}, then on the 1st of each month.${c.monthlyIncludes ? ` Included: ${c.monthlyIncludes}.` : ''}`,
          'The payment link comes from the provider’s own payment system. No VAT is charged under §19 UStG (German small-business scheme).',
          'If a payment is more than 7 days late, the provider may pause the work or the monthly services until it is paid; statutory default interest applies.']],
        ['Term and exit', one
          ? ['The agreement ends on delivery and full payment. Before delivery either side may end it with 30 days’ written notice (text form); work done up to then is paid.']
          : ['Monthly support has a minimum term of 6 months from the first monthly payment and then continues month to month.', 'Either side may end it with 30 days’ written notice (text form; the contact form is enough) to the end of a month. Work done up to then is paid.']],
        ...(one ? [] : [['Support promise', ['Channel: the contact form on the website (no meetings, calls or SMS).', 'Hours: Monday to Friday, 09:00–17:00 (Central European Time). First reply: within 2 working days.', 'Not part of support: new features or changes of scope (charged hourly) and problems caused by the client’s own changes or by third-party services.']]]),
        ['Ownership, code and data', [
          one ? 'On delivery the system and code are handed over to the client at no extra charge; afterwards the client is responsible.'
            : 'While the monthly service runs, the code and system stay with the provider; the client uses them under a licence. Hosting, updates, security and small support are the provider’s job.',
          ...(one ? [] : ['When the monthly service ends, the system and code are handed over to the client at no extra charge (the setup is already paid). After that, hosting, domain, updates, security, backups and problems are solely the client’s responsibility.']),
          'Extra work requested later: €65–75 per hour.',
          'The data always belongs to the client; the provider only processes it on the client’s behalf (a data processing agreement under Art. 28 GDPR follows). General templates and tools the provider uses across many projects stay with the provider; the client receives its own project. These rules are the same for every client.']],
        ['General', ['The client contracts as a business (§14 German Civil Code). Liability is unlimited for intent, gross negligence and injury to life, body or health; otherwise it is limited to the amount the client paid in the last 12 months, unless mandatory law requires otherwise. AI features may contain errors; the client checks the results.', 'German law applies; place of jurisdiction, where permitted, is Frankfurt am Main. Changes are made in text form.']],
      ], footer: `Place, date: Kelsterbach, ${day(l, c.date)}`,
    },
  }[l];

  const SHOW: Record<L, [string, string[]]> = {
    de: ['Referenz- und Werbenutzung', [
      'Der Auftraggeber erlaubt dem Auftragnehmer, das fertige Projekt als Referenz zu zeigen: auf der Website von Chioutworks und in eigener Werbung (z. B. soziale Medien, Präsentationen) dürfen Firmenname, Logo, Bildschirmfotos der Website, eine kurze Projektbeschreibung und ein Link zur Website gezeigt werden.',
      'Personenbezogene Daten, Kontaktdaten, Preise und interne Daten des Auftraggebers (z. B. CRM-Einträge) werden weder gezeigt noch weitergegeben.',
      'Die Erlaubnis ist freiwillig, hat keinen Einfluss auf die Vergütung und kann jederzeit in Textform (über die Projektseite oder das Kontaktformular) widerrufen werden; die Referenz wird dann innerhalb von 14 Tagen aus den eigenen Kanälen des Auftragnehmers entfernt. Für bereits veröffentlichte Inhalte außerhalb seiner Kontrolle (z. B. geteilte Beiträge) ist eine Entfernung nur eingeschränkt möglich.']],
    tr: ['Referans ve tanıtım kullanımı', [
      'Müşteri, tamamlanan projenin Chioutworks tarafından referans olarak gösterilmesine izin verir: Chioutworks web sitesinde ve kendi tanıtımlarında (ör. sosyal medya, sunumlar) işletme adı, logo, sitenin ekran görüntüleri, kısa bir proje açıklaması ve siteye bağlantı gösterilebilir.',
      'Kişisel veriler, iletişim bilgileri, fiyatlar ve müşteriye ait iç veriler (ör. CRM kayıtları) gösterilmez ve kimseyle paylaşılmaz.',
      'Bu izin gönüllüdür, ücreti etkilemez ve her zaman yazılı olarak (proje sayfası veya iletişim formu üzerinden) geri alınabilir; bu durumda referans 14 gün içinde Chioutworks\'ün kendi kanallarından kaldırılır. Daha önce yayımlanmış ve Chioutworks\'ün kontrolü dışındaki içerikler (ör. başkalarının paylaştığı gönderiler) için kaldırma imkânı sınırlıdır.']],
    el: ['Χρήση ως αναφορά και για προβολή', [
      'Ο εντολέας επιτρέπει στον πάροχο να παρουσιάζει το ολοκληρωμένο έργο ως αναφορά: στην ιστοσελίδα της Chioutworks και στη δική της προβολή (π.χ. μέσα κοινωνικής δικτύωσης, παρουσιάσεις) μπορούν να εμφανίζονται η επωνυμία, το λογότυπο, στιγμιότυπα της ιστοσελίδας, σύντομη περιγραφή του έργου και σύνδεσμος προς την ιστοσελίδα.',
      'Προσωπικά δεδομένα, στοιχεία επικοινωνίας, τιμές και εσωτερικά δεδομένα του εντολέα (π.χ. εγγραφές CRM) δεν εμφανίζονται και δεν κοινοποιούνται.',
      'Η άδεια είναι εθελοντική, δεν επηρεάζει την αμοιβή και μπορεί να ανακληθεί ανά πάσα στιγμή γραπτώς (μέσω της σελίδας έργου ή της φόρμας επικοινωνίας)· τότε η αναφορά αφαιρείται εντός 14 ημερών από τα δικά κανάλια του παρόχου. Για περιεχόμενο που έχει ήδη δημοσιευτεί εκτός του ελέγχου του (π.χ. κοινοποιημένες αναρτήσεις) η αφαίρεση είναι περιορισμένη.']],
    en: ['Use as a reference and in promotion', [
      'The client allows the provider to show the finished project as a reference: on the Chioutworks website and in its own promotion (e.g. social media, presentations) the company name, logo, screenshots of the website, a short project description and a link to the website may be shown.',
      'Personal data, contact details, prices and the client’s internal data (e.g. CRM records) are never shown or shared.',
      'This permission is voluntary, does not affect the fees and can be withdrawn at any time in text form (via the project page or the contact form); the reference is then removed from the provider’s own channels within 14 days. For content already published outside the provider’s control (e.g. shared posts), removal is only possible to a limited extent.']],
  };
  const secs = T.s.map(([title, body]) => ({ title: title as string, body: body as string[] }));
  if (c.extraOut?.length) secs[1].body.splice(secs[1].body.length - 1, 0, ...c.extraOut.map((x) => `• ${x}`));
  // Owner (2026-11-17): the reference clause is only part of the contract when the client agreed to it beforehand
  if (c.showcase) secs.splice(secs.length - 1, 0, { title: SHOW[l][0], body: SHOW[l][1] });
  const numbered = secs.map((x, i) => ({ ...x, title: `${i + 1}. ${x.title.replace(/^\d+\.\s*/, '')}` }));
  return { lang: l, title: T.title, parties: T.parties, sections: numbered, footer: T.footer, draft: DRAFT[l], signMode: mode, signNote: SIGN[mode][l] };
}

/** Plain text used for the integrity hash (what exactly was signed). */
export const contractPlain = (d: ContractDoc): string => [d.title, ...d.parties, ...d.sections.flatMap((s) => [s.title, ...s.body]), d.footer, d.draft, d.signNote ?? '', ...(d.copy ? [d.copyNotice ?? '', contractPlain(d.copy)] : [])].join('\n');
