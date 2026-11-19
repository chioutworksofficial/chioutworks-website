import type { Lang } from '../../../translations';

// Extra package-builder copy: "most popular" (quick to deliver) vs "advanced setup"
// (needs third-party approval, longer setup, higher price).
export const BUILDER_UI = {
  en: {
    whyTelegramTitle: 'Why do we recommend Telegram?',
    whyTelegram: 'WhatsApp is where your private chats live: business messages get mixed with family and friends, and doing it properly needs an extra number and a WhatsApp Business account. Telegram becomes a channel used only for your business, so your focus stays on work. Setup and daily use are simple, with no extra number, Meta approval or template review needed. It is usually live within a day.',
    popular: 'Most popular',
    advanced: 'Advanced setup',
    advancedSummary: 'Advanced modules need extra setup time and are priced higher.',
    notes: {
      whatsapp: 'Requires Meta Business verification, a dedicated number and pre-approved message templates. Setup takes longer and costs more. For a fast start we recommend Telegram, which works within a day.',
      payments: 'Requires a merchant account approved by the payment provider (identity and business documents). Approval can take several days; extra setup fee.',
    },
  },
  de: {
    whyTelegramTitle: 'Warum empfehlen wir Telegram?',
    whyTelegram: 'WhatsApp ist der Ort Ihrer privaten Chats: Geschäftliches vermischt sich mit Familie und Freunden, und eine saubere Lösung braucht eine zusätzliche Nummer und ein WhatsApp-Business-Konto. Telegram wird zu einem Kanal nur für Ihr Unternehmen – so bleibt der Fokus bei der Arbeit. Einrichtung und Bedienung sind einfach: keine zusätzliche Nummer, keine Meta-Freigabe, keine Vorlagenprüfung. In der Regel innerhalb eines Tages startklar.',
    popular: 'Am beliebtesten',
    advanced: 'Erweiterte Einrichtung',
    advancedSummary: 'Erweiterte Module benötigen zusätzliche Einrichtungszeit und kosten mehr.',
    notes: {
      whatsapp: 'Erfordert eine Meta-Unternehmensverifizierung, eine eigene Rufnummer und vorab genehmigte Nachrichtenvorlagen. Die Einrichtung dauert länger und kostet mehr. Für einen schnellen Start empfehlen wir Telegram – innerhalb eines Tages startklar.',
      payments: 'Erfordert ein vom Zahlungsanbieter geprüftes Händlerkonto (Ausweis- und Firmenunterlagen). Die Freigabe kann einige Tage dauern; zusätzliche Einrichtungsgebühr.',
    },
  },
  tr: {
    whyTelegramTitle: 'Neden Telegram öneriyoruz?',
    whyTelegram: 'WhatsApp özel sohbetlerinizin olduğu yerdir: iş mesajları aile ve arkadaş mesajlarına karışır, düzgün bir kurulum için ayrı numara ve WhatsApp Business hesabı gerekir. Telegram ise yalnızca işletmeniz için kullandığınız bir kanal olur; aklınız işte kalır, odağınız dağılmaz. Kurulumu ve kullanımı kolaydır: ek numara, Meta onayı veya şablon onayı gerekmez. Genellikle bir gün içinde çalışır hâle gelir.',
    popular: 'En çok tercih edilen',
    advanced: 'Gelişmiş kurulum',
    advancedSummary: 'Gelişmiş modüller ek kurulum süresi gerektirir ve ücreti daha yüksektir.',
    notes: {
      whatsapp: 'Meta işletme doğrulaması, ayrı bir telefon numarası ve önceden onaylanmış mesaj şablonları gerektirir. Kurulumu daha uzun sürer ve ücreti daha yüksektir. Hızlı başlangıç için bir gün içinde çalışan Telegram’ı öneriyoruz.',
      payments: 'Ödeme sağlayıcısının onayladığı bir üye işyeri hesabı gerektirir (kimlik ve şirket belgeleri). Onay birkaç gün sürebilir; ek kurulum ücreti vardır.',
    },
  },
  el: {
    whyTelegramTitle: 'Γιατί προτείνουμε το Telegram;',
    whyTelegram: 'Το WhatsApp είναι ο χώρος των προσωπικών σας συνομιλιών: τα επαγγελματικά μηνύματα ανακατεύονται με οικογένεια και φίλους, και μια σωστή λύση απαιτεί επιπλέον αριθμό και λογαριασμό WhatsApp Business. Το Telegram γίνεται ένα κανάλι μόνο για την επιχείρησή σας, ώστε η προσοχή σας να μένει στη δουλειά. Η εγκατάσταση και η χρήση είναι απλές: χωρίς επιπλέον αριθμό, έγκριση από τη Meta ή έλεγχο προτύπων. Συνήθως λειτουργεί μέσα σε μία ημέρα.',
    popular: 'Οι πιο δημοφιλείς',
    advanced: 'Προχωρημένη εγκατάσταση',
    advancedSummary: 'Οι προχωρημένες λειτουργίες χρειάζονται επιπλέον χρόνο εγκατάστασης και κοστίζουν περισσότερο.',
    notes: {
      whatsapp: 'Απαιτεί επαλήθευση επιχείρησης από τη Meta, ξεχωριστό αριθμό τηλεφώνου και εγκεκριμένα πρότυπα μηνυμάτων. Η εγκατάσταση διαρκεί περισσότερο και κοστίζει περισσότερο. Για γρήγορο ξεκίνημα προτείνουμε το Telegram, που λειτουργεί μέσα σε μία ημέρα.',
      payments: 'Απαιτεί λογαριασμό εμπόρου εγκεκριμένο από τον πάροχο πληρωμών (έγγραφα ταυτότητας και επιχείρησης). Η έγκριση μπορεί να διαρκέσει μερικές ημέρες· επιπλέον χρέωση εγκατάστασης.',
    },
  },
} satisfies Record<Lang, unknown>;
