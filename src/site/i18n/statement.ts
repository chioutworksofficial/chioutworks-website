import type { Lang } from '../../translations';

// Words wrapped in *asterisks* are rendered as italic emphasis.
export const STATEMENT_UI = {
  en: {
    text: 'I build systems that actually work – for businesses that value *exceptional* digital *experiences.*',
    caption: 'What you gain',
    items: ['24/7 online booking', 'Telegram notifications', 'AI assistant', 'Multilingual interface', 'GDPR-ready', 'Automatic reminders', 'Fewer no-shows', 'Visibility on Google', 'Mobile-friendly design', 'QR menu'],
  },
  de: {
    text: 'Ich baue Systeme, die wirklich funktionieren – für Unternehmen, die *außergewöhnliche* digitale *Erlebnisse* schätzen.',
    caption: 'Ihr Gewinn',
    items: ['Online-Buchung rund um die Uhr', 'Telegram-Benachrichtigungen', 'KI-Assistent', 'Mehrsprachige Oberfläche', 'DSGVO-konform', 'Automatische Erinnerungen', 'Weniger Terminausfälle', 'Sichtbarkeit bei Google', 'Mobilfreundliches Design', 'QR-Speisekarte'],
  },
  tr: {
    text: '*Olağanüstü* dijital *deneyimlere* değer veren işletmeler için gerçekten işleyen sistemler kuruyorum.',
    caption: 'Kazandıklarınız',
    items: ['7/24 çevrim içi randevu', 'Telegram bildirimleri', 'Yapay zekâ asistanı', 'Çok dilli arayüz', 'KVKK uyumlu', 'Otomatik hatırlatmalar', 'Daha az gelmeyen müşteri', "Google'da görünürlük", 'Mobil uyumlu tasarım', 'QR menü'],
  },
  el: {
    text: 'Χτίζω συστήματα που πραγματικά λειτουργούν – για επιχειρήσεις που εκτιμούν *εξαιρετικές* ψηφιακές *εμπειρίες.*',
    caption: 'Τι κερδίζετε',
    items: ['Ηλεκτρονική κράτηση 24/7', 'Ειδοποιήσεις Telegram', 'Βοηθός τεχνητής νοημοσύνης', 'Πολύγλωσση διεπαφή', 'Συμμόρφωση με τον ΓΚΠΔ', 'Αυτόματες υπενθυμίσεις', 'Λιγότερες ακυρώσεις', 'Ορατότητα στο Google', 'Σχεδίαση για κινητά', 'Μενού με QR'],
  },
} satisfies Record<Lang, { text: string; caption: string; items: string[] }>;
