import type { Lang } from '../../translations';

// AI assistant package scene (owner, 2026-11-19): a late-evening chat on a salon's website, the assistant looks up the
// business's own info, collects the need, and the owner finds a tidy summary in the inbox next morning.
// Names, phone formats and words follow the visitor's language. Phone numbers are fictional.
export interface AssistantSceneText {
  site: string; online: string; typing: string; time: string; placeholder: string;
  chat: { from: 'v' | 'a'; t: string }[];      // v1 a1 v2 a2 v3 a3
  kbTitle: string; kb: string[];                // row 0 = opening hours (highlighted)
  inbox: string; from: string; subject: string; fields: [string, string][]; newMail: string; ago: string;
}

export const ASSISTANT_SCENE: Record<Lang, AssistantSceneText> = {
  tr: {
    site: 'Kuaför Salonu · Asistan', online: 'çevrimiçi', typing: 'yazıyor…', time: '23:14', placeholder: 'Mesaj yazın…',
    chat: [
      { from: 'v', t: 'Merhaba, cumartesi açık mısınız?' },
      { from: 'a', t: 'Merhaba! Evet, cumartesi 09:00–16:00 arası açığız. Randevu için yardımcı olayım mı?' },
      { from: 'v', t: 'Evet, saç boyası için. Öğleden sonra olur mu?' },
      { from: 'a', t: 'Tabii. Size dönüş yapılabilmesi için adınızı ve telefonunuzu yazar mısınız?' },
      { from: 'v', t: 'Ayşe Yılmaz, 0555 123 45 67' },
      { from: 'a', t: 'Teşekkürler Ayşe Hanım, talebinizi salona ilettim. Sabah size dönüş yapılacak.' },
    ],
    kbTitle: 'Salonun bilgileri', kb: ['Çalışma saatleri · Pzt–Cum 09–19, Cmt 09–16', 'Hizmetler · Kesim, fön, boya, bakım', 'Randevu · En az bir gün önceden'],
    inbox: 'Gelen kutusu', from: 'Web sitesi asistanı', subject: 'Yeni talep: Ayşe Yılmaz · Cumartesi saç boyası', newMail: 'Yeni', ago: 'dün 23:16',
    fields: [['Ad', 'Ayşe Yılmaz'], ['Telefon', '0555 123 45 67'], ['İstek', 'Saç boyası, cumartesi öğleden sonra'], ['Saat', '23:16 · mesai dışı']],
  },
  en: {
    site: 'Hair Salon · Assistant', online: 'online', typing: 'typing…', time: '11:14 pm', placeholder: 'Type a message…',
    chat: [
      { from: 'v', t: 'Hi, are you open on Saturday?' },
      { from: 'a', t: 'Hi! Yes, on Saturday we are open from 9 am to 4 pm. Shall I help you with a booking?' },
      { from: 'v', t: 'Yes, for hair colouring. Would the afternoon work?' },
      { from: 'a', t: 'Of course. Could you type your name and phone number so the salon can get back to you?' },
      { from: 'v', t: 'Emma Clarke, 07700 900123' },
      { from: 'a', t: 'Thank you, Emma. I have passed your request to the salon; they will get back to you in the morning.' },
    ],
    kbTitle: "The salon's info", kb: ['Opening hours · Mon–Fri 9–7, Sat 9–4', 'Services · Cut, blow-dry, colour, care', 'Bookings · At least one day ahead'],
    inbox: 'Inbox', from: 'Website assistant', subject: 'New enquiry: Emma Clarke · Saturday colouring', newMail: 'New', ago: 'yesterday 11:16 pm',
    fields: [['Name', 'Emma Clarke'], ['Phone', '07700 900123'], ['Request', 'Hair colouring, Saturday afternoon'], ['Time', '11:16 pm · after hours']],
  },
  de: {
    site: 'Friseursalon · Assistent', online: 'online', typing: 'schreibt…', time: '23:14', placeholder: 'Nachricht schreiben…',
    chat: [
      { from: 'v', t: 'Hallo, haben Sie am Samstag geöffnet?' },
      { from: 'a', t: 'Hallo! Ja, samstags haben wir von 9 bis 16 Uhr geöffnet. Darf ich Ihnen bei einem Termin helfen?' },
      { from: 'v', t: 'Ja, zum Färben. Geht es am Nachmittag?' },
      { from: 'a', t: 'Gern. Schreiben Sie mir bitte Ihren Namen und Ihre Telefonnummer, damit sich der Salon bei Ihnen meldet?' },
      { from: 'v', t: 'Anna Schmidt, 0151 2345 6789' },
      { from: 'a', t: 'Danke, Frau Schmidt. Ich habe Ihre Anfrage an den Salon weitergegeben; Sie bekommen morgen früh eine Antwort.' },
    ],
    kbTitle: 'Infos des Salons', kb: ['Öffnungszeiten · Mo–Fr 9–19, Sa 9–16', 'Leistungen · Schnitt, Föhnen, Färben, Pflege', 'Termine · Mindestens einen Tag vorher'],
    inbox: 'Posteingang', from: 'Website-Assistent', subject: 'Neue Anfrage: Anna Schmidt · Färben am Samstag', newMail: 'Neu', ago: 'gestern 23:16',
    fields: [['Name', 'Anna Schmidt'], ['Telefon', '0151 2345 6789'], ['Wunsch', 'Färben, Samstagnachmittag'], ['Uhrzeit', '23:16 · außerhalb der Öffnungszeiten']],
  },
  el: {
    site: 'Κομμωτήριο · Βοηθός', online: 'σε σύνδεση', typing: 'γράφει…', time: '23:14', placeholder: 'Γράψτε μήνυμα…',
    chat: [
      { from: 'v', t: 'Γεια σας, είστε ανοιχτά το Σάββατο;' },
      { from: 'a', t: 'Γεια σας! Ναι, το Σάββατο είμαστε ανοιχτά 09:00–16:00. Να σας βοηθήσω με ένα ραντεβού;' },
      { from: 'v', t: 'Ναι, για βαφή. Γίνεται το απόγευμα;' },
      { from: 'a', t: 'Βεβαίως. Μου γράφετε το όνομα και το τηλέφωνό σας, ώστε να επικοινωνήσει μαζί σας το κομμωτήριο;' },
      { from: 'v', t: 'Μαρία Παπαδοπούλου, 691 234 5678' },
      { from: 'a', t: 'Ευχαριστώ, κυρία Παπαδοπούλου. Το αίτημά σας στάλθηκε στο κομμωτήριο· θα σας απαντήσουν το πρωί.' },
    ],
    kbTitle: 'Πληροφορίες κομμωτηρίου', kb: ['Ωράριο · Δευ–Παρ 09–19, Σάβ 09–16', 'Υπηρεσίες · Κούρεμα, χτένισμα, βαφή, περιποίηση', 'Ραντεβού · Τουλάχιστον μία μέρα πριν'],
    inbox: 'Εισερχόμενα', from: 'Βοηθός ιστοσελίδας', subject: 'Νέο αίτημα: Μαρία Παπαδοπούλου · Βαφή το Σάββατο', newMail: 'Νέο', ago: 'χθες 23:16',
    fields: [['Όνομα', 'Μαρία Παπαδοπούλου'], ['Τηλέφωνο', '691 234 5678'], ['Αίτημα', 'Βαφή, Σάββατο απόγευμα'], ['Ώρα', '23:16 · εκτός ωραρίου']],
  },
};
