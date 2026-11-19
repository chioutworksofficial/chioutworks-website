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
/** Owner's rule (2026-11-17): EVERYTHING the client gets (offer, contract, payment, invoice, project page) is in ONE language:
 *  the offer's language, which the owner sets in the admin. The country is only used to suggest it. */
export const contractLangFor = (market: string | undefined, offerLang: string): L =>
  (['de', 'tr', 'el', 'en'] as const).includes(offerLang as L) ? (offerLang as L) : marketLang(market) ?? 'en';

export interface ContractInput {
  lang: L; currency: string; items: { title: string; detail: string; amount: number }[]; total: number;
  depositPct: number; installments: number; monthly: number; monthlyIncludes: string;
  client: { company: string; address: string; signer: string; role: string };
  date: string;   // contract date (ISO)
  showcase?: boolean;   // client allowed the project as a reference (chosen before the contract is shown); clause only when true
}
export interface ContractDoc { lang: L; title: string; parties: string[]; sections: { title: string; body: string[] }[]; footer: string }

const LOCALE: Record<L, string> = { de: 'de-DE', tr: 'tr-TR', el: 'el-GR', en: 'en-GB' };
const money = (l: L, n: number, c: string) => new Intl.NumberFormat(LOCALE[l], { style: 'currency', currency: c || 'EUR' }).format(n);
const day = (l: L, iso: string) => new Intl.DateTimeFormat(LOCALE[l], { dateStyle: 'long' }).format(new Date(iso));

export function buildContract(c: ContractInput): ContractDoc {
  const l = c.lang; const m = (n: number) => money(l, n, c.currency);
  const p = PROVIDER;
  const dep = Math.round(c.total * c.depositPct) / 100;
  const rest = Math.max(0, c.total - dep);
  const items = c.items.map((it) => `• ${it.title}${it.detail ? ` (${it.detail})` : ''}: ${m(it.amount)}`);
  const providerLine = `${p.name}, ${l === 'de' ? 'Inhaber' : l === 'tr' ? 'İşletme sahibi' : l === 'el' ? 'Ιδιοκτήτης' : 'Owner'} ${p.owner}, ${p.street}, ${p.city}, ${p.country[l]}`;
  const clientLine = [c.client.company, c.client.address].filter(Boolean).join(', ');

  const T = {
    de: {
      title: 'Dienstleistungsvertrag (Website, Automatisierung, Betreuung)',
      parties: [`Auftragnehmer: ${providerLine}`, `Auftraggeber: ${clientLine}, vertreten durch ${c.client.signer}${c.client.role ? ` (${c.client.role})` : ''}`],
      s: [
        ['1. Vertragsgegenstand', ['Der Auftragnehmer erstellt für den Auftraggeber die folgenden Leistungen gemäß dem angenommenen Angebot:', ...items]],
        ['2. Vergütung und Zahlung', [
          `Einmalige Einrichtung gesamt: ${m(c.total)}. ${c.depositPct >= 100 ? 'Fällig vollständig bei Vertragsschluss.' : `Anzahlung ${c.depositPct} % (${m(dep)}) bei Vertragsschluss, Rest (${m(rest)}) in ${c.installments} Rate(n).`}`,
          c.monthly > 0 ? `Monatliche Betreuung: ${m(c.monthly)} pro Monat, erstmals fällig ab dem dritten Monat nach Vertragsschluss, danach monatlich im Voraus per hinterlegter Zahlungsmethode.${c.monthlyIncludes ? ` Enthalten: ${c.monthlyIncludes}.` : ''}` : 'Eine monatliche Betreuung ist nicht vereinbart.',
          'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung). Rechnungen werden elektronisch übermittelt.',
          'Rechnungen werden bei jeder Zahlung automatisch über den Zahlungsdienstleister Stripe erstellt, fortlaufend nummeriert und nach Ausstellung nicht mehr verändert. Korrekturen erfolgen ausschließlich durch Stornierung bzw. Gutschrift; die ursprüngliche Rechnung bleibt erhalten.']],
        ['3. Laufzeit der monatlichen Betreuung und Kündigung', [
          'Die monatliche Betreuung hat eine Mindestlaufzeit von 6 Monaten. Danach kann sie jeweils zum Monatsende gekündigt werden; die Kündigung ist über den Kundenbereich der Website möglich.',
          'Nach einer Kündigung bleiben alle Leistungen bis zum Ende des laufenden Monats nutzbar. Ab dem Folgemonat werden die vom Auftragnehmer betriebenen Leistungen (z. B. Automatisierungen, KI-Funktionen, Kundenportal, Wartung und Support) eingestellt.']],
        ['4. Konten, Zugänge und Rechte', [
          'Die für das Projekt nötigen Konten (z. B. Hosting, Datenbank, E-Mail-Versand, Domain) werden grundsätzlich auf den Namen des Auftraggebers angelegt und vom Auftragnehmer eingerichtet und verwaltet. Laufende Kosten dieser Dienste trägt der Auftraggeber, sofern nicht im Angebot anders vereinbart.',
          'Nach vollständiger Zahlung der einmaligen Vergütung erhält der Auftraggeber die Rechte an der für ihn erstellten Website (Code und Inhalte). Allgemeine Bausteine und Werkzeuge des Auftragnehmers bleiben dessen Eigentum.']],
        ['5. Mitwirkung, Abnahme und Korrekturen', [
          'Der Auftraggeber stellt Inhalte (Texte, Logos, Bilder) und Zugänge rechtzeitig bereit. Verzögerungen durch fehlende Mitwirkung verlängern die Fristen entsprechend.',
          'Im Preis sind zwei Korrekturrunden enthalten. Weitere Änderungen werden nach Aufwand abgerechnet.']],
        ['6. Rücktritt vor Fertigstellung', [
          'Tritt der Auftraggeber nach Vertragsschluss und begonnener Arbeit zurück, werden die bis dahin erbrachten Leistungen vergütet, mindestens jedoch 10 % der einmaligen Vergütung. Bereits gezahlte Beträge darüber hinaus werden erstattet.']],
        ['7. Übergabe und Löschung nach Vertragsende', [
          'Nach einer Kündigung erhält der Auftraggeber per E-Mail und im Kundenbereich einen 30 Tage gültigen Link. Dort entscheidet er, ob Website und Daten übergeben bzw. erneut aktiviert werden sollen oder ob alles gelöscht werden soll.',
          'Übergabe, Umzug oder Reaktivierung werden mit 65–75 € pro Stunde abgerechnet; der Aufwand liegt in der Regel bei 1–3 Arbeitstagen. Während der Übergabe bleiben Website und E-Mails erreichbar. Eine Garantie, dass Automatisierungen bei einem anderen Entwickler unverändert funktionieren, besteht nicht.',
          'Geht innerhalb von 30 Tagen keine Rückmeldung ein, werden Website und Daten rechtskonform gelöscht. Rechnungen und Vertragsunterlagen werden während der gesetzlichen Aufbewahrungsfristen aufbewahrt.']],
        ['8. Unternehmereigenschaft', ['Der Auftraggeber bestätigt, diesen Vertrag als Unternehmer im Sinne von § 14 BGB in Ausübung seiner gewerblichen oder selbständigen beruflichen Tätigkeit zu schließen.']],
        ['9. Haftung', ['Der Auftragnehmer haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Im Übrigen ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. KI-gestützte Funktionen können Fehler enthalten; ihre Ergebnisse sind vom Auftraggeber zu prüfen.']],
        ['10. Datenschutz', ['Soweit der Auftragnehmer personenbezogene Daten im Auftrag verarbeitet, schließen die Parteien einen Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.']],
        ['11. Schlussbestimmungen', ['Es gilt deutsches Recht. Gerichtsstand ist, soweit zulässig, Frankfurt am Main. Änderungen bedürfen der Textform. Sollte eine Bestimmung unwirksam sein, bleibt der Vertrag im Übrigen wirksam.']],
      ],
      footer: `Ort, Datum: Kelsterbach, ${day(l, c.date)}`,
    },
    tr: {
      title: 'Hizmet Sözleşmesi (Web Sitesi, Otomasyon, Bakım)',
      parties: [`Hizmet veren: ${providerLine}`, `Müşteri: ${clientLine}, temsilen ${c.client.signer}${c.client.role ? ` (${c.client.role})` : ''}`],
      s: [
        ['1. Sözleşmenin konusu', ['Hizmet veren, kabul edilen teklife göre müşteri için aşağıdaki hizmetleri sunar:', ...items]],
        ['2. Ücret ve ödeme', [
          `Tek seferlik kurulum toplamı: ${m(c.total)}. ${c.depositPct >= 100 ? 'Tamamı sözleşme imzalanınca ödenir.' : `Sözleşme imzalanınca %${c.depositPct} peşinat (${m(dep)}), kalan (${m(rest)}) ${c.installments} taksitte.`}`,
          c.monthly > 0 ? `Aylık bakım: ayda ${m(c.monthly)}; ilk kez sözleşmeden sonraki üçüncü aydan itibaren, sonra her ay peşin olarak kayıtlı ödeme yöntemiyle tahsil edilir.${c.monthlyIncludes ? ` Kapsam: ${c.monthlyIncludes}.` : ''}` : 'Aylık bakım kararlaştırılmamıştır.',
          'Alman KDV Kanunu §19 (küçük işletme düzenlemesi) gereği KDV hesaplanmaz. Faturalar elektronik olarak gönderilir.',
          'Faturalar her ödemede ödeme hizmeti sağlayıcısı Stripe üzerinden otomatik olarak oluşturulur, sıra numarası alır ve kesildikten sonra değiştirilmez. Düzeltmeler yalnızca iptal veya düzeltme faturası (alacak dekontu) ile yapılır; asıl fatura kayıtlarda kalır.']],
        ['3. Aylık bakımın süresi ve feshi', [
          'Aylık bakımın asgari süresi 6 aydır. Sonrasında her ay sonu itibarıyla feshedilebilir; fesih sitedeki müşteri bölümünden yapılabilir.',
          'Fesihten sonra tüm hizmetler içinde bulunulan ayın sonuna kadar kullanılabilir. Sonraki aydan itibaren hizmet verenin çalıştırdığı hizmetler (ör. otomasyonlar, yapay zekâ özellikleri, müşteri portalı, bakım ve destek) sona erer.']],
        ['4. Hesaplar, erişimler ve haklar', [
          'Proje için gereken hesaplar (ör. barındırma, veritabanı, e-posta gönderimi, alan adı) kural olarak müşterinin adına açılır; hizmet veren kurar ve yönetir. Bu hizmetlerin süregelen maliyetleri, teklifte aksi kararlaştırılmadıkça müşteriye aittir.',
          'Tek seferlik ücretin tamamı ödendikten sonra müşteri, kendisi için hazırlanan web sitesinin (kod ve içerik) haklarına sahip olur. Hizmet verenin genel yapı taşları ve araçları kendisinde kalır.']],
        ['5. Katkı, teslim ve düzeltmeler', [
          'Müşteri içerikleri (metin, logo, görsel) ve erişimleri zamanında sağlar. Eksik katkıdan doğan gecikmeler süreleri aynı ölçüde uzatır.',
          'Fiyata iki düzeltme turu dahildir. Ek değişiklikler harcanan emeğe göre ücretlendirilir.']],
        ['6. Tamamlanmadan önce vazgeçme', ['Müşteri sözleşmeden sonra ve iş başladıktan sonra vazgeçerse, o ana kadar yapılan iş ücretlendirilir; ancak bu tutar tek seferlik ücretin en az %10’udur. Bunun üzerinde ödenmiş tutarlar iade edilir.']],
        ['7. Sözleşme bitiminden sonra devir ve silme', [
          'Fesihten sonra müşteriye e-postayla ve müşteri bölümünde 30 gün geçerli bir link iletilir. Müşteri orada sitenin ve verilerin devredilmesini / yeniden etkinleştirilmesini mi, yoksa her şeyin silinmesini mi istediğini seçer.',
          'Devir, taşıma veya yeniden etkinleştirme saat başı 65–75 € olarak ücretlendirilir; iş genellikle 1–3 iş günü sürer. Devir sırasında site ve e-postalar erişilebilir kalır. Otomasyonların başka bir geliştiricide aynı şekilde çalışacağının garantisi yoktur.',
          '30 gün içinde cevap gelmezse site ve veriler hukuka uygun şekilde silinir. Fatura ve sözleşme belgeleri yasal saklama süreleri boyunca saklanır.']],
        ['8. Girişimci sıfatı', ['Müşteri, bu sözleşmeyi Alman Medeni Kanunu §14 anlamında girişimci olarak, ticari veya serbest mesleki faaliyeti kapsamında yaptığını onaylar.']],
        ['9. Sorumluluk', ['Hizmet veren kasıt ve ağır ihmalde, ayrıca hayat, beden veya sağlığın zarar görmesinde sınırsız sorumludur. Diğer durumlarda sorumluluk, sözleşmeye özgü öngörülebilir zararla sınırlıdır. Yapay zekâ destekli özellikler hata içerebilir; sonuçları müşteri tarafından kontrol edilmelidir.']],
        ['10. Veri koruma', ['Hizmet veren müşteri adına kişisel veri işlerse, taraflar GDPR Madde 28’e göre bir veri işleme sözleşmesi yapar.']],
        ['11. Son hükümler', ['Alman hukuku geçerlidir. Yasal olarak mümkün olduğu ölçüde yetkili mahkeme Frankfurt am Main’dir. Değişiklikler yazılı (metin) şekilde yapılır. Bir hükmün geçersiz olması sözleşmenin geri kalanını etkilemez.']],
      ],
      footer: `Yer, tarih: Kelsterbach, ${day(l, c.date)}`,
    },
    el: {
      title: 'Σύμβαση Παροχής Υπηρεσιών (Ιστοσελίδα, Αυτοματοποίηση, Υποστήριξη)',
      parties: [`Πάροχος: ${providerLine}`, `Πελάτης: ${clientLine}, εκπροσωπούμενος από ${c.client.signer}${c.client.role ? ` (${c.client.role})` : ''}`],
      s: [
        ['1. Αντικείμενο', ['Ο πάροχος παρέχει στον πελάτη τις ακόλουθες υπηρεσίες σύμφωνα με την αποδεκτή προσφορά:', ...items]],
        ['2. Αμοιβή και πληρωμή', [
          `Εφάπαξ εγκατάσταση συνολικά: ${m(c.total)}. ${c.depositPct >= 100 ? 'Καταβάλλεται ολόκληρη με την υπογραφή.' : `Προκαταβολή ${c.depositPct}% (${m(dep)}) με την υπογραφή, το υπόλοιπο (${m(rest)}) σε ${c.installments} δόση/-εις.`}`,
          c.monthly > 0 ? `Μηνιαία υποστήριξη: ${m(c.monthly)} τον μήνα, για πρώτη φορά από τον τρίτο μήνα μετά την υπογραφή, έπειτα μηνιαίως προκαταβολικά μέσω της καταχωρισμένης μεθόδου πληρωμής.${c.monthlyIncludes ? ` Περιλαμβάνει: ${c.monthlyIncludes}.` : ''}` : 'Δεν έχει συμφωνηθεί μηνιαία υποστήριξη.',
          'Σύμφωνα με την §19 του γερμανικού νόμου ΦΠΑ (καθεστώς μικρών επιχειρήσεων) δεν χρεώνεται ΦΠΑ. Τα τιμολόγια αποστέλλονται ηλεκτρονικά.',
          'Τα τιμολόγια εκδίδονται αυτόματα σε κάθε πληρωμή μέσω του παρόχου πληρωμών Stripe, φέρουν αύξουσα αρίθμηση και δεν τροποποιούνται μετά την έκδοσή τους. Διορθώσεις γίνονται αποκλειστικά με ακύρωση ή πιστωτικό σημείωμα· το αρχικό τιμολόγιο διατηρείται.']],
        ['3. Διάρκεια και καταγγελία της μηνιαίας υποστήριξης', [
          'Η μηνιαία υποστήριξη έχει ελάχιστη διάρκεια 6 μηνών. Στη συνέχεια μπορεί να καταγγελθεί στο τέλος κάθε μήνα, μέσω της περιοχής πελάτη της ιστοσελίδας.',
          'Μετά την καταγγελία όλες οι υπηρεσίες παραμένουν διαθέσιμες έως το τέλος του τρέχοντος μήνα. Από τον επόμενο μήνα διακόπτονται οι υπηρεσίες που λειτουργεί ο πάροχος (π.χ. αυτοματοποιήσεις, λειτουργίες ΤΝ, πύλη πελάτη, συντήρηση και υποστήριξη).']],
        ['4. Λογαριασμοί, πρόσβαση και δικαιώματα', [
          'Οι λογαριασμοί που χρειάζεται το έργο (π.χ. φιλοξενία, βάση δεδομένων, αποστολή e-mail, domain) ανοίγουν κατά κανόνα στο όνομα του πελάτη· τους ρυθμίζει και τους διαχειρίζεται ο πάροχος. Το τρέχον κόστος αυτών των υπηρεσιών βαρύνει τον πελάτη, εκτός αν η προσφορά ορίζει διαφορετικά.',
          'Μετά την πλήρη εξόφληση της εφάπαξ αμοιβής ο πελάτης αποκτά τα δικαιώματα στην ιστοσελίδα που δημιουργήθηκε για αυτόν (κώδικας και περιεχόμενο). Τα γενικά δομικά στοιχεία και εργαλεία του παρόχου παραμένουν δικά του.']],
        ['5. Συνεργασία, παράδοση και διορθώσεις', [
          'Ο πελάτης παρέχει έγκαιρα περιεχόμενο (κείμενα, λογότυπα, εικόνες) και προσβάσεις. Καθυστερήσεις λόγω έλλειψης συνεργασίας παρατείνουν ανάλογα τις προθεσμίες.',
          'Η τιμή περιλαμβάνει δύο γύρους διορθώσεων. Επιπλέον αλλαγές χρεώνονται ανάλογα με τον χρόνο εργασίας.']],
        ['6. Υπαναχώρηση πριν από την ολοκλήρωση', ['Αν ο πελάτης υπαναχωρήσει μετά την υπογραφή και την έναρξη της εργασίας, αμείβεται η εργασία που έχει γίνει έως τότε, τουλάχιστον όμως το 10% της εφάπαξ αμοιβής. Ποσά που έχουν καταβληθεί πέραν αυτού επιστρέφονται.']],
        ['7. Παράδοση και διαγραφή μετά τη λήξη', [
          'Μετά την καταγγελία ο πελάτης λαμβάνει με e-mail και στην περιοχή πελάτη έναν σύνδεσμο που ισχύει 30 ημέρες. Εκεί επιλέγει αν η ιστοσελίδα και τα δεδομένα θα παραδοθούν / θα επανενεργοποιηθούν ή αν θα διαγραφούν όλα.',
          'Η παράδοση, μεταφορά ή επανενεργοποίηση χρεώνεται 65–75 € την ώρα· η εργασία διαρκεί συνήθως 1–3 εργάσιμες ημέρες. Κατά την παράδοση η ιστοσελίδα και τα e-mail παραμένουν διαθέσιμα. Δεν υπάρχει εγγύηση ότι οι αυτοματοποιήσεις θα λειτουργούν αμετάβλητες σε άλλον προγραμματιστή.',
          'Αν δεν υπάρξει απάντηση εντός 30 ημερών, η ιστοσελίδα και τα δεδομένα διαγράφονται νόμιμα. Τα τιμολόγια και τα έγγραφα της σύμβασης διατηρούνται για τις νόμιμες προθεσμίες φύλαξης.']],
        ['8. Ιδιότητα επιχείρησης', ['Ο πελάτης βεβαιώνει ότι συνάπτει τη σύμβαση ως επιχείρηση κατά την έννοια της §14 του γερμανικού Αστικού Κώδικα, στο πλαίσιο της επαγγελματικής του δραστηριότητας.']],
        ['9. Ευθύνη', ['Ο πάροχος ευθύνεται απεριόριστα για δόλο και βαριά αμέλεια, καθώς και για βλάβη ζωής, σώματος ή υγείας. Κατά τα λοιπά η ευθύνη περιορίζεται στην τυπική, προβλέψιμη ζημία της σύμβασης. Οι λειτουργίες με ΤΝ μπορεί να περιέχουν λάθη· τα αποτελέσματά τους πρέπει να ελέγχονται από τον πελάτη.']],
        ['10. Προστασία δεδομένων', ['Εφόσον ο πάροχος επεξεργάζεται προσωπικά δεδομένα για λογαριασμό του πελάτη, τα μέρη συνάπτουν σύμβαση επεξεργασίας κατά το άρθρο 28 GDPR.']],
        ['11. Τελικές διατάξεις', ['Εφαρμόζεται το γερμανικό δίκαιο. Αρμόδια δικαστήρια, στο μέτρο που επιτρέπεται, είναι της Φρανκφούρτης. Τροποποιήσεις γίνονται γραπτώς (σε μορφή κειμένου). Η ακυρότητα μιας διάταξης δεν θίγει την υπόλοιπη σύμβαση.']],
      ],
      footer: `Τόπος, ημερομηνία: Kelsterbach, ${day(l, c.date)}`,
    },
    en: {
      title: 'Service Agreement (Website, Automation, Support)',
      parties: [`Provider: ${providerLine}`, `Client: ${clientLine}, represented by ${c.client.signer}${c.client.role ? ` (${c.client.role})` : ''}`],
      s: [
        ['1. Subject matter', ['The provider delivers the following services to the client according to the accepted offer:', ...items]],
        ['2. Fees and payment', [
          `One-time setup in total: ${m(c.total)}. ${c.depositPct >= 100 ? 'Due in full when the agreement is signed.' : `Deposit ${c.depositPct}% (${m(dep)}) when the agreement is signed, the rest (${m(rest)}) in ${c.installments} instalment(s).`}`,
          c.monthly > 0 ? `Monthly support: ${m(c.monthly)} per month, first due from the third month after signing, then monthly in advance via the stored payment method.${c.monthlyIncludes ? ` Included: ${c.monthlyIncludes}.` : ''}` : 'No monthly support has been agreed.',
          'No VAT is charged under the German small-business scheme (§19 UStG). Invoices are sent electronically.',
          'Invoices are created automatically with every payment through the payment provider Stripe, numbered sequentially and not altered after issue. Corrections are made only by cancellation or credit note; the original invoice is kept.']],
        ['3. Term and cancellation of monthly support', [
          'Monthly support has a minimum term of 6 months. After that it can be cancelled at the end of any month, via the client area of the website.',
          'After cancellation all services remain usable until the end of the current month. From the following month, the services operated by the provider (e.g. automations, AI features, client portal, maintenance and support) end.']],
        ['4. Accounts, access and rights', [
          'The accounts the project needs (e.g. hosting, database, e-mail sending, domain) are in principle opened in the client’s name and set up and managed by the provider. Ongoing costs of these services are borne by the client unless the offer states otherwise.',
          'Once the one-time fee has been paid in full, the client obtains the rights to the website created for it (code and content). The provider’s general building blocks and tools remain the provider’s property.']],
        ['5. Cooperation, delivery and corrections', [
          'The client provides content (texts, logos, images) and access in good time. Delays caused by missing cooperation extend deadlines accordingly.',
          'Two rounds of corrections are included in the price. Further changes are charged by effort.']],
        ['6. Withdrawal before completion', ['If the client withdraws after signing and after work has started, the work done up to that point is paid, but at least 10% of the one-time fee. Amounts paid beyond that are refunded.']],
        ['7. Handover and deletion after the end of the agreement', [
          'After cancellation the client receives, by e-mail and in the client area, a link valid for 30 days. There the client chooses whether the website and data are to be handed over / reactivated or whether everything is to be deleted.',
          'Handover, migration or reactivation are charged at €65–75 per hour; the work usually takes 1–3 working days. The website and e-mails remain available during the handover. There is no guarantee that automations will work unchanged with another developer.',
          'If no reply is received within 30 days, the website and data are deleted lawfully. Invoices and contract documents are kept for the statutory retention periods.']],
        ['8. Business customer', ['The client confirms that it enters into this agreement as a business (entrepreneur within the meaning of §14 of the German Civil Code) in the course of its commercial or professional activity.']],
        ['9. Liability', ['The provider is liable without limitation for intent and gross negligence and for injury to life, body or health. Otherwise liability is limited to the typical, foreseeable damage of the agreement. AI-supported features may contain errors; their results must be checked by the client.']],
        ['10. Data protection', ['Where the provider processes personal data on the client’s behalf, the parties conclude a data processing agreement under Art. 28 GDPR.']],
        ['11. Final provisions', ['German law applies. Place of jurisdiction, where permitted, is Frankfurt am Main. Changes require text form. If a provision is invalid, the rest of the agreement remains valid.']],
      ],
      footer: `Place, date: Kelsterbach, ${day(l, c.date)}`,
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
  // Owner (2026-11-17): the reference clause is only part of the contract when the client agreed to it beforehand
  if (c.showcase) secs.splice(secs.length - 1, 0, { title: SHOW[l][0], body: SHOW[l][1] });
  const numbered = secs.map((x, i) => ({ ...x, title: `${i + 1}. ${x.title.replace(/^\d+\.\s*/, '')}` }));
  return { lang: l, title: T.title, parties: T.parties, sections: numbered, footer: T.footer };
}

/** Plain text used for the integrity hash (what exactly was signed). */
export const contractPlain = (d: ContractDoc) => [d.title, ...d.parties, ...d.sections.flatMap((s) => [s.title, ...s.body]), d.footer].join('\n');
