import type { Lang } from '../translations';

// Plain-language explanations of technical names that may appear in an offer. The offer page shows only the
// terms that actually occur in that offer's texts. Data-location statements must stay accurate and modest.
type L4 = Record<Lang, string>;
export interface GlossaryTerm { re: RegExp; name: string; t: L4 }

export const OFFER_GLOSSARY: GlossaryTerm[] = [
  { re: /\bvercel\b/i, name: 'Vercel', t: {
    tr: 'Sitenizi internette yayınlayan hizmet. ABD’li bir şirket; sunucu tarafı Frankfurt’ta çalıştırılır.',
    en: 'The service that publishes your website on the internet. A US company; the server side runs in Frankfurt.',
    de: 'Der Dienst, der Ihre Website im Internet veröffentlicht. Ein US-Unternehmen; die Serverseite läuft in Frankfurt.',
    el: 'Η υπηρεσία που δημοσιεύει την ιστοσελίδα σας στο διαδίκτυο. Εταιρεία των ΗΠΑ· το τμήμα διακομιστή τρέχει στη Φρανκφούρτη.' } },
  { re: /\bsupabase\b/i, name: 'Supabase', t: {
    tr: 'Form ve müşteri kayıtları gibi verilerin saklandığı veritabanı. ABD’li bir şirket; veriler Frankfurt’ta durur.',
    en: 'The database where data such as form entries and customer records is stored. A US company; the data is kept in Frankfurt.',
    de: 'Die Datenbank, in der Daten wie Formulareingaben und Kundendaten gespeichert werden. Ein US-Unternehmen; die Daten liegen in Frankfurt.',
    el: 'Η βάση δεδομένων όπου αποθηκεύονται στοιχεία όπως φόρμες και αρχεία πελατών. Εταιρεία των ΗΠΑ· τα δεδομένα βρίσκονται στη Φρανκφούρτη.' } },
  { re: /\b(hostinger|vps)\b/i, name: 'Hostinger VPS', t: {
    tr: 'Size ayrılmış kendi sunucunuz: AB şirketi Hostinger’in Frankfurt veya Düsseldorf’taki bilgisayarı. Her şey Almanya’da kalır.',
    en: 'Your own dedicated server: a computer of the EU company Hostinger in Frankfurt or Düsseldorf. Everything stays in Germany.',
    de: 'Ihr eigener Server: ein Rechner des EU-Unternehmens Hostinger in Frankfurt oder Düsseldorf. Alles bleibt in Deutschland.',
    el: 'Ο δικός σας διακομιστής: υπολογιστής της ευρωπαϊκής εταιρείας Hostinger στη Φρανκφούρτη ή στο Ντίσελντορφ. Όλα μένουν στη Γερμανία.' } },
  { re: /\bstripe\b/i, name: 'Stripe', t: {
    tr: 'Online ödeme altyapısı (kart, Apple Pay vb.). Kart bilgileri sitenizde değil, Stripe’ta güvenle işlenir.',
    en: 'Online payment system (cards, Apple Pay, etc.). Card details are processed securely by Stripe, not on your site.',
    de: 'Online-Zahlungssystem (Karte, Apple Pay usw.). Kartendaten werden sicher bei Stripe verarbeitet, nicht auf Ihrer Website.',
    el: 'Σύστημα online πληρωμών (κάρτες, Apple Pay κ.λπ.). Τα στοιχεία κάρτας επεξεργάζονται με ασφάλεια από τη Stripe, όχι στη σελίδα σας.' } },
  { re: /\bhetzner\b/i, name: 'Hetzner', t: {
    tr: 'Alman sunucu sağlayıcısı (Alman şirketi); sunucular Almanya’dadır.',
    en: 'German server provider (German company); servers are located in Germany.',
    de: 'Deutscher Serveranbieter (deutsches Unternehmen); die Server stehen in Deutschland.',
    el: 'Γερμανικός πάροχος διακομιστών (γερμανική εταιρεία)· οι διακομιστές βρίσκονται στη Γερμανία.' } },
  { re: /\bionos\b/i, name: 'IONOS', t: {
    tr: 'Alman barındırma ve sunucu sağlayıcısı (Alman şirketi); sunucular Almanya’dadır.',
    en: 'German hosting and server provider (German company); servers are located in Germany.',
    de: 'Deutscher Hosting- und Serveranbieter (deutsches Unternehmen); die Server stehen in Deutschland.',
    el: 'Γερμανικός πάροχος φιλοξενίας και διακομιστών (γερμανική εταιρεία)· οι διακομιστές βρίσκονται στη Γερμανία.' } },
  { re: /\bnetlify\b/i, name: 'Netlify', t: {
    tr: 'Siteleri internette yayınlayan hizmet. ABD’li bir şirket.',
    en: 'A service that publishes websites on the internet. A US company.',
    de: 'Ein Dienst, der Websites im Internet veröffentlicht. Ein US-Unternehmen.',
    el: 'Υπηρεσία που δημοσιεύει ιστοσελίδες στο διαδίκτυο. Εταιρεία των ΗΠΑ.' } },
  { re: /\bcloudflare\b/i, name: 'Cloudflare', t: {
    tr: 'Siteyi hızlandıran ve saldırılara karşı koruyan hizmet. ABD’li bir şirket.',
    en: 'A service that speeds up the site and protects it against attacks. A US company.',
    de: 'Ein Dienst, der die Website beschleunigt und vor Angriffen schützt. Ein US-Unternehmen.',
    el: 'Υπηρεσία που επιταχύνει τη σελίδα και την προστατεύει από επιθέσεις. Εταιρεία των ΗΠΑ.' } },
  { re: /\bpaypal\b/i, name: 'PayPal', t: {
    tr: 'Online ödeme hizmeti. Avrupa’daki hizmetleri Lüksemburg’daki PayPal (Europe) üzerinden verilir.',
    en: 'Online payment service. In Europe it is provided by PayPal (Europe) in Luxembourg.',
    de: 'Online-Zahlungsdienst. In Europa wird er von PayPal (Europe) mit Sitz in Luxemburg erbracht.',
    el: 'Υπηρεσία online πληρωμών. Στην Ευρώπη παρέχεται από την PayPal (Europe) με έδρα το Λουξεμβούργο.' } },
  { re: /\bresend\b/i, name: 'Resend', t: {
    tr: 'Otomatik e-postaları (onay, hatırlatma) gönderen hizmet.',
    en: 'The service that sends automatic e-mails (confirmations, reminders).',
    de: 'Der Dienst, der automatische E-Mails versendet (Bestätigungen, Erinnerungen).',
    el: 'Η υπηρεσία που στέλνει αυτόματα e-mail (επιβεβαιώσεις, υπενθυμίσεις).' } },
  { re: /\bn8n\b/i, name: 'n8n', t: {
    tr: 'Otomasyon akışlarını görsel olarak kurmaya yarayan araç.',
    en: 'A tool for building automation flows visually.',
    de: 'Ein Werkzeug, um Automatisierungsabläufe visuell aufzubauen.',
    el: 'Εργαλείο για οπτική δημιουργία ροών αυτοματοποίησης.' } },
  { re: /\bmodal\b/i, name: 'Modal', t: {
    tr: 'Otomasyon ve yapay zekâ işlerini yalnızca gerektiğinde çalıştıran, kullandıkça ödenen sunucu hizmeti.',
    en: 'A server service that runs automation and AI jobs only when needed, paid per use.',
    de: 'Ein Serverdienst, der Automatisierungs- und KI-Aufgaben nur bei Bedarf ausführt, abgerechnet nach Nutzung.',
    el: 'Υπηρεσία διακομιστή που τρέχει εργασίες αυτοματοποίησης και ΤΝ μόνο όταν χρειάζεται, με χρέωση ανά χρήση.' } },
  { re: /\bapi\b/i, name: 'API', t: {
    tr: 'İki programın birbirine otomatik bilgi göndermesini sağlayan bağlantı.',
    en: 'A connection that lets two programs exchange information automatically.',
    de: 'Eine Schnittstelle, über die zwei Programme automatisch Daten austauschen.',
    el: 'Σύνδεση που επιτρέπει σε δύο προγράμματα να ανταλλάσσουν αυτόματα πληροφορίες.' } },
  { re: /\bwebhooks?\b/i, name: 'Webhook', t: {
    tr: 'Bir şey olduğunda başka bir programa anında haber veren otomatik bildirim.',
    en: 'An automatic notice that tells another program the moment something happens.',
    de: 'Eine automatische Meldung, die ein anderes Programm sofort informiert, wenn etwas passiert.',
    el: 'Αυτόματη ειδοποίηση που ενημερώνει αμέσως ένα άλλο πρόγραμμα όταν συμβεί κάτι.' } },
  { re: /\bcrm\b/i, name: 'CRM', t: {
    tr: 'Müşterilerinizi, konuşmaları ve teklifleri tek yerde tutan müşteri listesi programı.',
    en: 'A customer-list program that keeps customers, conversations and quotes in one place.',
    de: 'Ein Kundenlisten-Programm, das Kunden, Gespräche und Angebote an einem Ort festhält.',
    el: 'Πρόγραμμα λίστας πελατών που κρατά πελάτες, συνομιλίες και προσφορές σε ένα σημείο.' } },
  { re: /\b(domain|alan adı)\b/i, name: 'Domain', t: {
    tr: 'Sitenizin internetteki adresi, örneğin firmaniz.com. Her yıl küçük bir ücretle yenilenir.',
    en: 'Your website’s address on the internet, e.g. yourcompany.com. Renewed yearly for a small fee.',
    de: 'Die Adresse Ihrer Website im Internet, z. B. ihrefirma.de. Wird jährlich gegen eine kleine Gebühr verlängert.',
    el: 'Η διεύθυνση της ιστοσελίδας σας στο διαδίκτυο, π.χ. etaireiasas.gr. Ανανεώνεται κάθε χρόνο με μικρό κόστος.' } },
  { re: /\bhosting\b|barındırma|φιλοξενία/i, name: 'Hosting', t: {
    tr: 'Sitenizin dosyalarının ve verilerinin durduğu sunucu.',
    en: 'The server where your website’s files and data live.',
    de: 'Der Server, auf dem die Dateien und Daten Ihrer Website liegen.',
    el: 'Ο διακομιστής όπου βρίσκονται τα αρχεία και τα δεδομένα της σελίδας σας.' } },
  { re: /\b(next\.?js|react)\b/i, name: 'React / Next.js', t: {
    tr: 'Hızlı ve modern web siteleri ile uygulamalar kurmak için kullanılan yazılım temeli.',
    en: 'The software foundation used to build fast, modern websites and apps.',
    de: 'Die Software-Grundlage für schnelle, moderne Websites und Anwendungen.',
    el: 'Η βάση λογισμικού για γρήγορες, σύγχρονες ιστοσελίδες και εφαρμογές.' } },
  { re: /\b(groq|gemini|openai|llm)\b/i, name: 'KI / AI', t: {
    tr: 'Sohbet veya sesli asistanın arkasındaki yapay zekâ modeli sağlayıcısı. Ziyaretçilere yapay zekâyla konuştukları açıkça söylenir (AB AI Act).',
    en: 'The AI model provider behind a chat or voice assistant. Visitors are told clearly that they are talking to an AI (EU AI Act).',
    de: 'Der Anbieter des KI-Modells hinter einem Chat- oder Sprachassistenten. Besucher erfahren klar, dass sie mit einer KI sprechen (EU-KI-Verordnung).',
    el: 'Ο πάροχος του μοντέλου ΤΝ πίσω από έναν βοηθό συνομιλίας ή φωνής. Οι επισκέπτες ενημερώνονται σαφώς ότι μιλούν με ΤΝ (Κανονισμός ΕΕ για την ΤΝ).' } },
];

/** Terms that occur in the given texts, in glossary order. */
export const termsIn = (texts: string[]): GlossaryTerm[] => {
  const all = texts.join('\n');
  return OFFER_GLOSSARY.filter((g) => g.re.test(all));
};
