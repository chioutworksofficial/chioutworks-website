import type { Lang } from '../../translations';

// Booking package scene (owner, 2026-11-19): a realistic online booking flow with full and free slots, the owner's
// calendar and an automatic reminder. Demo names follow the visitor's language (TR Ayşe, DE Anna, EN Emma, EL Μαρία).
export interface BookingSceneText {
  title: string; service: string; days: string[]; dayLabel: string; full: string; fullTip: string; pick: string;
  confirm: string; booked: string; cal: string; newB: string; confirmed: string; arrived: string;
  reminderApp: string; reminder: (time: string) => string; yes: string; later: string; fill: string; today: string; now: string;
  customer: string; others: string[]; services: [string, string, string, string]; // beard, blow-dry, colour, haircut
}

export const BOOKING_SCENE: Record<Lang, BookingSceneText> = {
  tr: {
    title: 'Online randevu', service: 'Saç kesimi · 30 dk', days: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'], dayLabel: 'Cuma, 20 Kasım',
    full: 'Dolu', fullTip: 'Bu saat dolu, başka bir saat seçin', pick: 'Saat seçin', confirm: 'Randevuyu onayla', booked: 'Randevunuz alındı',
    cal: 'Takvim', newB: 'Yeni', confirmed: 'Onaylandı', arrived: 'Geldi ✓', reminderApp: 'Hatırlatma',
    reminder: (t) => `Yarın ${t} saç kesimi randevunuz var.`, yes: 'Onayla', later: 'Ertele', fill: 'saat dolu', today: 'bugün', now: 'şimdi',
    customer: 'Ayşe', others: ['Mehmet', 'Zeynep', 'Elif', 'Can'], services: ['Sakal', 'Fön', 'Boya', 'Saç kesimi'],
  },
  en: {
    title: 'Online booking', service: 'Haircut · 30 min', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], dayLabel: 'Friday, 20 November',
    full: 'Booked', fullTip: 'This time is taken, please pick another', pick: 'Pick a time', confirm: 'Confirm booking', booked: 'Your booking is confirmed',
    cal: 'Calendar', newB: 'New', confirmed: 'Confirmed', arrived: 'Arrived ✓', reminderApp: 'Reminder',
    reminder: (t) => `Your haircut is tomorrow at ${t}.`, yes: 'Confirm', later: 'Reschedule', fill: 'slots booked', today: 'today', now: 'now',
    customer: 'Emma', others: ['James', 'Olivia', 'Grace', 'Noah'], services: ['Beard trim', 'Blow-dry', 'Colour', 'Haircut'],
  },
  de: {
    title: 'Online-Termin', service: 'Haarschnitt · 30 Min.', days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], dayLabel: 'Freitag, 20. November',
    full: 'Belegt', fullTip: 'Diese Zeit ist belegt, bitte eine andere wählen', pick: 'Zeit wählen', confirm: 'Termin bestätigen', booked: 'Ihr Termin ist gebucht',
    cal: 'Kalender', newB: 'Neu', confirmed: 'Bestätigt', arrived: 'Erschienen ✓', reminderApp: 'Erinnerung',
    reminder: (t) => `Morgen um ${t} ist Ihr Termin zum Haarschnitt.`, yes: 'Bestätigen', later: 'Verschieben', fill: 'Zeiten belegt', today: 'heute', now: 'jetzt',
    customer: 'Anna', others: ['Thomas', 'Lena', 'Sophie', 'Jonas'], services: ['Bart', 'Föhnen', 'Färben', 'Haarschnitt'],
  },
  el: {
    title: 'Online ραντεβού', service: 'Κούρεμα · 30 λεπτά', days: ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'], dayLabel: 'Παρασκευή, 20 Νοεμβρίου',
    full: 'Κλεισμένο', fullTip: 'Η ώρα είναι κλεισμένη, διαλέξτε άλλη', pick: 'Επιλέξτε ώρα', confirm: 'Επιβεβαίωση ραντεβού', booked: 'Το ραντεβού σας κλείστηκε',
    cal: 'Ημερολόγιο', newB: 'Νέο', confirmed: 'Επιβεβαιώθηκε', arrived: 'Ήρθε ✓', reminderApp: 'Υπενθύμιση',
    reminder: (t) => `Αύριο στις ${t} έχετε ραντεβού για κούρεμα.`, yes: 'Επιβεβαίωση', later: 'Αλλαγή', fill: 'ώρες κλεισμένες', today: 'σήμερα', now: 'τώρα',
    customer: 'Μαρία', others: ['Γιώργος', 'Ελένη', 'Σοφία', 'Νίκος'], services: ['Γένια', 'Χτένισμα', 'Βαφή', 'Κούρεμα'],
  },
};
