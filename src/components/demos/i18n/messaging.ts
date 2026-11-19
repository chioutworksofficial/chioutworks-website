import type { Lang } from '../../../translations';

export const MESSAGING_UI = {
  en: {
    title: 'Demo mode: no message was sent',
    body: 'In the demo nothing leaves this page. In your live system this message would be sent automatically:',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram' },
    close: 'Got it',
  },
  de: {
    title: 'Demo-Modus: Es wurde keine Nachricht gesendet',
    body: 'In der Demo verlässt nichts diese Seite. In Ihrem echten System würde diese Nachricht automatisch versendet:',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram' },
    close: 'Verstanden',
  },
  tr: {
    title: 'Demo modu: mesaj gönderilmedi',
    body: 'Demoda hiçbir şey bu sayfanın dışına çıkmaz. Gerçek sisteminizde bu mesaj otomatik olarak gönderilir:',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram' },
    close: 'Anladım',
  },
  el: {
    title: 'Λειτουργία επίδειξης: δεν στάλθηκε μήνυμα',
    body: 'Στην επίδειξη τίποτα δεν φεύγει από αυτή τη σελίδα. Στο πραγματικό σας σύστημα αυτό το μήνυμα θα στελνόταν αυτόματα:',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram' },
    close: 'Κατάλαβα',
  },
} satisfies Record<Lang, unknown>;
