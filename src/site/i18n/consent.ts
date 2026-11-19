import type { Lang } from '../../translations';

interface Cat { name: string; desc: string }
export interface ConsentUi {
  title: string; body: string; acceptAll: string; necessaryOnly: string; settings: string; save: string; close: string;
  always: string; necessary: Cat; functional: Cat; statistics: Cat; noMarketing: string; privacy: string; footerLink: string;
}

export const CONSENT_UI: Record<Lang, ConsentUi> = {
  tr: {
    title: 'Gizliliğiniz', body: 'Bu site reklam veya takip çerezi kullanmaz. Gerekli olanlar her zaman açıktır; isteğe bağlı olanları siz seçersiniz. Seçiminizi istediğiniz zaman değiştirebilirsiniz.',
    acceptAll: 'Hepsini kabul et', necessaryOnly: 'Sadece gerekli', settings: 'Ayarlar', save: 'Seçimi kaydet', close: 'Kapat', always: 'Her zaman açık',
    necessary: { name: 'Gerekli', desc: 'Dil seçiminiz, formlar, hesaplayıcı, asistanın güvenliği ve bu tercihiniz. Site bunlar olmadan çalışmaz.' },
    functional: { name: 'Konfor', desc: 'Açılış animasyonu aynı ziyarette yalnızca bir kez gösterilir.' },
    statistics: { name: 'İstatistik', desc: 'Hangi sayfaların ziyaret edildiğini sayan basit istatistik. Veriler yalnızca bu tarayıcıda kalır, hiçbir yere gönderilmez.' },
    noMarketing: 'Pazarlama veya reklam çerezi yoktur.', privacy: 'Gizlilik politikası', footerLink: 'Çerez ayarları',
  },
  en: {
    title: 'Your privacy', body: 'This site uses no advertising or tracking cookies. Necessary functions are always on; you choose the optional ones. You can change your choice at any time.',
    acceptAll: 'Accept all', necessaryOnly: 'Necessary only', settings: 'Settings', save: 'Save choice', close: 'Close', always: 'Always on',
    necessary: { name: 'Necessary', desc: 'Your language choice, forms, the calculator, assistant security and this preference. The site does not work without them.' },
    functional: { name: 'Comfort', desc: 'The intro animation is shown only once per visit.' },
    statistics: { name: 'Statistics', desc: 'Simple statistics on which pages are visited. The data stays in this browser only and is never sent anywhere.' },
    noMarketing: 'No marketing or advertising cookies.', privacy: 'Privacy policy', footerLink: 'Cookie settings',
  },
  de: {
    title: 'Ihre Privatsphäre', body: 'Diese Website verwendet keine Werbe- oder Tracking-Cookies. Notwendige Funktionen sind immer aktiv; die optionalen wählen Sie selbst. Sie können Ihre Auswahl jederzeit ändern.',
    acceptAll: 'Alle akzeptieren', necessaryOnly: 'Nur notwendige', settings: 'Einstellungen', save: 'Auswahl speichern', close: 'Schließen', always: 'Immer aktiv',
    necessary: { name: 'Notwendig', desc: 'Ihre Sprachwahl, Formulare, der Rechner, die Sicherheit des Assistenten und diese Einstellung. Ohne sie funktioniert die Website nicht.' },
    functional: { name: 'Komfort', desc: 'Die Startanimation wird pro Besuch nur einmal gezeigt.' },
    statistics: { name: 'Statistik', desc: 'Einfache Statistik, welche Seiten besucht werden. Die Daten bleiben nur in diesem Browser und werden nirgendwohin übertragen.' },
    noMarketing: 'Keine Marketing- oder Werbe-Cookies.', privacy: 'Datenschutzerklärung', footerLink: 'Cookie-Einstellungen',
  },
  el: {
    title: 'Το απόρρητό σας', body: 'Η σελίδα δεν χρησιμοποιεί cookies διαφήμισης ή παρακολούθησης. Οι απαραίτητες λειτουργίες είναι πάντα ενεργές· τις προαιρετικές τις επιλέγετε εσείς. Μπορείτε να αλλάξετε την επιλογή σας οποιαδήποτε στιγμή.',
    acceptAll: 'Αποδοχή όλων', necessaryOnly: 'Μόνο τα απαραίτητα', settings: 'Ρυθμίσεις', save: 'Αποθήκευση επιλογής', close: 'Κλείσιμο', always: 'Πάντα ενεργά',
    necessary: { name: 'Απαραίτητα', desc: 'Η επιλογή γλώσσας, οι φόρμες, ο υπολογιστής, η ασφάλεια του βοηθού και αυτή η προτίμηση. Η σελίδα δεν λειτουργεί χωρίς αυτά.' },
    functional: { name: 'Άνεση', desc: 'Η εισαγωγική κίνηση εμφανίζεται μόνο μία φορά ανά επίσκεψη.' },
    statistics: { name: 'Στατιστικά', desc: 'Απλά στατιστικά για το ποιες σελίδες επισκέπτονται. Τα δεδομένα μένουν μόνο σε αυτόν τον browser και δεν αποστέλλονται πουθενά.' },
    noMarketing: 'Δεν υπάρχουν cookies μάρκετινγκ ή διαφήμισης.', privacy: 'Πολιτική απορρήτου', footerLink: 'Ρυθμίσεις cookies',
  },
};
