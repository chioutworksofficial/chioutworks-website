import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Lang } from '../translations';

// Clickable demo shown after the intake (and in the admin). The AI only writes content; these templates render it.
// Everything is local state: nothing is saved or sent anywhere while the visitor clicks around.
type View = 'website' | 'crm' | 'automation';
export interface PreviewFeatures { booking: boolean; quote: boolean; payment: boolean; accounts: boolean; assistant: boolean; notify: 'telegram' | 'whatsapp' | 'email' | null; languages: string[] }
export interface PreviewData {
  brand: string; tagline: string; heroTitle: string; heroText: string; cta: string;
  services: { title: string; text: string }[]; about: string; highlights: string[]; contactLine: string;
  theme: 'ocean' | 'forest' | 'sand' | 'graphite' | 'sunset'; domain: string;
  views?: View[]; features?: PreviewFeatures;
  steps?: { title: string; text: string }[]; faq?: { q: string; a: string }[]; quoteFields?: string[];
  assistant?: { q: string; a: string }[];
  crm?: { stages: string[]; fields: string[]; records: { name: string; note: string; stage: number }[] };
  flows?: { name: string; trigger: string; steps: string[]; result: string }[];
}
interface Pub { data: PreviewData; at: string; left: number }

interface Tx {
  title: string; bannerTitle: string; banner: string; tryHint: string; making: string; again: (n: number) => string; ai: string; err: string;
  tabs: Record<View, string>; strip: string;
  nav: { home: string; services: string; booking: string; quote: string; contact: string; login: string };
  seeServices: string; how: string; faq: string; services: string; about: string; contact: string;
  pickService: string; pickDay: string; pickTime: string; yourName: string; confirm: string; booked: string; bookedText: (s: string, when: string) => string;
  payNow: string; paid: string; next: string; back: string; bookNow: string; askQuote: string;
  quoteTitle: string; quoteSend: string; quoteDone: string; quoteDoneText: string;
  name: string; message: string; send: string; contactDone: string;
  loginTitle: string; email: string; password: string; login: string; welcome: (n: string) => string; myBookings: string; none: string; logout: string;
  asOpen: string; asTitle: string; asPh: string; asDemoOnly: string;
  langToast: string; notifyTitle: string; notifyBooking: (n: string, s: string, w: string) => string; notifyQuote: (n: string) => string; notifyContact: (n: string) => string;
  demoNote: string; channel: Record<'telegram' | 'whatsapp' | 'email', string>;
  crmSearch: string; crmAdd: string; crmSample: string; crmName: string; crmNote: string; crmSave: string; crmCancel: string; crmMove: string; crmBack: string;
  crmNotes: string; crmAddNote: string; crmFields: string; crmClose: string; crmTotal: (n: number) => string; crmEmpty: string;
  autoRun: string; autoAgain: string; autoTrigger: string; autoWaiting: string; autoRunning: string; autoDone: string; autoResult: string; autoHint: string;
}

const TX: Record<Lang, Tx> = {
  tr: {
    title: 'Projenizin tıklanabilir demosu', bannerTitle: 'Bu yalnızca bir demo',
    banner: 'Bu taslak, cevaplarınızdan yapay zekâyla birkaç saniyede oluşturuldu ve sadece fikir vermesi için var. Gerçek projeniz böyle görünmeyecek: tasarımı, metinleri ve görselleri adım adım birlikte, çok daha güzel ve modern bir hale getireceğiz.',
    tryHint: 'Menüye, butonlara ve formlara tıklayıp deneyebilirsiniz. Hiçbir şey kaydedilmez veya gönderilmez.',
    making: 'Cevaplarınızdan demonuz hazırlanıyor…', again: (n) => `Başka bir öneri göster (kalan ${n})`, ai: 'Yapay zekâ ile oluşturuldu',
    err: 'Demo şu an hazırlanamadı. Cevaplarınız yine de bana ulaştı.',
    tabs: { website: 'Web sitesi', crm: 'Müşteri yönetimi (CRM)', automation: 'Otomasyon' }, strip: 'Demo · tıklayıp deneyin',
    nav: { home: 'Ana sayfa', services: 'Hizmetler', booking: 'Randevu', quote: 'Teklif al', contact: 'İletişim', login: 'Giriş' },
    seeServices: 'Hizmetleri gör', how: 'Nasıl çalışır?', faq: 'Sık sorulan sorular', services: 'Hizmetler', about: 'Hakkımızda', contact: 'İletişim',
    pickService: 'Hizmet seçin', pickDay: 'Gün seçin', pickTime: 'Saat seçin', yourName: 'Adınız', confirm: 'Randevuyu onayla', booked: 'Randevunuz alındı',
    bookedText: (s, w) => `${s} · ${w}. Onay e-postası gönderildi (demo).`, payNow: 'Şimdi öde', paid: 'Ödeme alındı (demo)', next: 'İleri', back: 'Geri',
    bookNow: 'Randevu al', askQuote: 'Teklif iste',
    quoteTitle: 'Teklif isteyin', quoteSend: 'Talebi gönder', quoteDone: 'Talebiniz alındı', quoteDoneText: 'En kısa sürede size dönüş yapılacak (demo).',
    name: 'Adınız', message: 'Mesajınız', send: 'Gönder', contactDone: 'Mesajınız alındı (demo).',
    loginTitle: 'Müşteri hesabı', email: 'E-posta', password: 'Şifre', login: 'Giriş yap', welcome: (n) => `Hoş geldiniz, ${n}`, myBookings: 'Randevularım', none: 'Henüz randevu yok', logout: 'Çıkış',
    asOpen: 'Sorunuz mu var?', asTitle: 'Asistan', asPh: 'Bir soru yazın…', asDemoOnly: 'Bu demoda yalnızca yukarıdaki örnek sorular cevaplanıyor.',
    langToast: 'Demo: dil seçenekleri gerçek sitede eklenir.', notifyTitle: 'Size gelen bildirim (demo)',
    notifyBooking: (n, s, w) => `Yeni randevu: ${n} · ${s} · ${w}`, notifyQuote: (n) => `Yeni teklif talebi: ${n}`, notifyContact: (n) => `Yeni mesaj: ${n}`,
    demoNote: 'Demo: gerçek sitede bu adımda kayıt oluşur.', channel: { telegram: 'Telegram', whatsapp: 'WhatsApp', email: 'E-posta' },
    crmSearch: 'Ara…', crmAdd: '+ Yeni müşteri', crmSample: 'Örnek veriler (tamamen uydurma)', crmName: 'Müşteri adı', crmNote: 'Not', crmSave: 'Kaydet', crmCancel: 'Vazgeç',
    crmMove: 'Sonraki aşamaya taşı →', crmBack: '← Önceki aşama', crmNotes: 'Notlar', crmAddNote: 'Not ekle', crmFields: 'Bilgiler', crmClose: 'Kapat', crmTotal: (n) => `${n} müşteri`, crmEmpty: 'Boş',
    autoRun: 'Deneme çalıştır', autoAgain: 'Tekrar çalıştır', autoTrigger: 'Başlangıç', autoWaiting: 'Bekliyor', autoRunning: 'Çalışıyor…', autoDone: 'Tamam', autoResult: 'Sonuç',
    autoHint: 'Bir akış seçin ve deneme çalıştırın: adımlar sizin hiçbir şey yapmanıza gerek kalmadan sırayla gerçekleşir.',
  },
  en: {
    title: 'Clickable demo of your project', bannerTitle: 'This is only a demo',
    banner: 'This draft was generated by AI from your answers in a few seconds and is only meant to give you an idea. Your real project will not look like this: step by step, together, we will turn the design, texts and images into something far more beautiful and modern.',
    tryHint: 'Click the menu, buttons and forms to try it out. Nothing is saved or sent.',
    making: 'Preparing your demo from your answers…', again: (n) => `Show another suggestion (${n} left)`, ai: 'Generated with AI',
    err: 'The demo could not be prepared right now. Your answers have still reached me.',
    tabs: { website: 'Website', crm: 'Customer management (CRM)', automation: 'Automation' }, strip: 'Demo · click to try',
    nav: { home: 'Home', services: 'Services', booking: 'Book', quote: 'Get a quote', contact: 'Contact', login: 'Log in' },
    seeServices: 'See services', how: 'How it works', faq: 'Frequently asked questions', services: 'Services', about: 'About us', contact: 'Contact',
    pickService: 'Choose a service', pickDay: 'Choose a day', pickTime: 'Choose a time', yourName: 'Your name', confirm: 'Confirm booking', booked: 'Your booking is confirmed',
    bookedText: (s, w) => `${s} · ${w}. A confirmation e-mail was sent (demo).`, payNow: 'Pay now', paid: 'Payment received (demo)', next: 'Next', back: 'Back',
    bookNow: 'Book now', askQuote: 'Request a quote',
    quoteTitle: 'Request a quote', quoteSend: 'Send request', quoteDone: 'Your request has been received', quoteDoneText: 'You will get a reply as soon as possible (demo).',
    name: 'Your name', message: 'Your message', send: 'Send', contactDone: 'Your message has been received (demo).',
    loginTitle: 'Customer account', email: 'E-mail', password: 'Password', login: 'Log in', welcome: (n) => `Welcome, ${n}`, myBookings: 'My bookings', none: 'No bookings yet', logout: 'Log out',
    asOpen: 'Any questions?', asTitle: 'Assistant', asPh: 'Type a question…', asDemoOnly: 'In this demo only the example questions above are answered.',
    langToast: 'Demo: language versions are added on the real site.', notifyTitle: 'Notification you receive (demo)',
    notifyBooking: (n, s, w) => `New booking: ${n} · ${s} · ${w}`, notifyQuote: (n) => `New quote request: ${n}`, notifyContact: (n) => `New message: ${n}`,
    demoNote: 'Demo: on the real site a record is created at this step.', channel: { telegram: 'Telegram', whatsapp: 'WhatsApp', email: 'E-mail' },
    crmSearch: 'Search…', crmAdd: '+ New customer', crmSample: 'Sample data (entirely fictional)', crmName: 'Customer name', crmNote: 'Note', crmSave: 'Save', crmCancel: 'Cancel',
    crmMove: 'Move to next stage →', crmBack: '← Previous stage', crmNotes: 'Notes', crmAddNote: 'Add note', crmFields: 'Details', crmClose: 'Close', crmTotal: (n) => `${n} customers`, crmEmpty: 'Empty',
    autoRun: 'Run a test', autoAgain: 'Run again', autoTrigger: 'Starts when', autoWaiting: 'Waiting', autoRunning: 'Running…', autoDone: 'Done', autoResult: 'Result',
    autoHint: 'Pick a flow and run a test: the steps happen one after another without you doing anything.',
  },
  de: {
    title: 'Klickbare Demo Ihres Projekts', bannerTitle: 'Das ist nur eine Demo',
    banner: 'Dieser Entwurf wurde in wenigen Sekunden per KI aus Ihren Antworten erstellt und soll nur einen Eindruck vermitteln. Ihr echtes Projekt wird nicht so aussehen: Schritt für Schritt machen wir gemeinsam aus Design, Texten und Bildern etwas deutlich Schöneres und Moderneres.',
    tryHint: 'Klicken Sie Menü, Buttons und Formulare an und probieren Sie es aus. Nichts wird gespeichert oder versendet.',
    making: 'Ihre Demo wird aus Ihren Antworten erstellt…', again: (n) => `Weiteren Vorschlag zeigen (noch ${n})`, ai: 'Mit KI erstellt',
    err: 'Die Demo konnte gerade nicht erstellt werden. Ihre Antworten sind trotzdem bei mir angekommen.',
    tabs: { website: 'Website', crm: 'Kundenverwaltung (CRM)', automation: 'Automatisierung' }, strip: 'Demo · zum Ausprobieren',
    nav: { home: 'Start', services: 'Leistungen', booking: 'Termin', quote: 'Angebot', contact: 'Kontakt', login: 'Anmelden' },
    seeServices: 'Leistungen ansehen', how: 'So läuft es ab', faq: 'Häufige Fragen', services: 'Leistungen', about: 'Über uns', contact: 'Kontakt',
    pickService: 'Leistung wählen', pickDay: 'Tag wählen', pickTime: 'Uhrzeit wählen', yourName: 'Ihr Name', confirm: 'Termin bestätigen', booked: 'Ihr Termin ist gebucht',
    bookedText: (s, w) => `${s} · ${w}. Eine Bestätigung wurde per E-Mail gesendet (Demo).`, payNow: 'Jetzt bezahlen', paid: 'Zahlung erhalten (Demo)', next: 'Weiter', back: 'Zurück',
    bookNow: 'Termin buchen', askQuote: 'Angebot anfragen',
    quoteTitle: 'Angebot anfragen', quoteSend: 'Anfrage senden', quoteDone: 'Ihre Anfrage ist eingegangen', quoteDoneText: 'Sie erhalten schnellstmöglich eine Antwort (Demo).',
    name: 'Ihr Name', message: 'Ihre Nachricht', send: 'Senden', contactDone: 'Ihre Nachricht ist eingegangen (Demo).',
    loginTitle: 'Kundenkonto', email: 'E-Mail', password: 'Passwort', login: 'Anmelden', welcome: (n) => `Willkommen, ${n}`, myBookings: 'Meine Termine', none: 'Noch keine Termine', logout: 'Abmelden',
    asOpen: 'Fragen?', asTitle: 'Assistent', asPh: 'Frage eingeben…', asDemoOnly: 'In dieser Demo werden nur die Beispielfragen oben beantwortet.',
    langToast: 'Demo: Sprachversionen kommen auf der echten Website.', notifyTitle: 'Benachrichtigung an Sie (Demo)',
    notifyBooking: (n, s, w) => `Neuer Termin: ${n} · ${s} · ${w}`, notifyQuote: (n) => `Neue Angebotsanfrage: ${n}`, notifyContact: (n) => `Neue Nachricht: ${n}`,
    demoNote: 'Demo: Auf der echten Website wird hier ein Eintrag angelegt.', channel: { telegram: 'Telegram', whatsapp: 'WhatsApp', email: 'E-Mail' },
    crmSearch: 'Suchen…', crmAdd: '+ Neuer Kunde', crmSample: 'Beispieldaten (frei erfunden)', crmName: 'Kundenname', crmNote: 'Notiz', crmSave: 'Speichern', crmCancel: 'Abbrechen',
    crmMove: 'In nächste Phase →', crmBack: '← Vorherige Phase', crmNotes: 'Notizen', crmAddNote: 'Notiz hinzufügen', crmFields: 'Angaben', crmClose: 'Schließen', crmTotal: (n) => `${n} Kunden`, crmEmpty: 'Leer',
    autoRun: 'Testlauf starten', autoAgain: 'Erneut starten', autoTrigger: 'Startet, wenn', autoWaiting: 'Wartet', autoRunning: 'Läuft…', autoDone: 'Erledigt', autoResult: 'Ergebnis',
    autoHint: 'Wählen Sie einen Ablauf und starten Sie einen Testlauf: Die Schritte laufen nacheinander ab, ohne dass Sie etwas tun.',
  },
  el: {
    title: 'Διαδραστικό demo του έργου σας', bannerTitle: 'Αυτό είναι μόνο ένα demo',
    banner: 'Αυτό το προσχέδιο δημιουργήθηκε με ΤΝ από τις απαντήσεις σας σε λίγα δευτερόλεπτα και υπάρχει μόνο για να πάρετε μια ιδέα. Το πραγματικό σας έργο δεν θα μοιάζει έτσι: βήμα βήμα, μαζί, θα κάνουμε τον σχεδιασμό, τα κείμενα και τις εικόνες κάτι πολύ πιο όμορφο και σύγχρονο.',
    tryHint: 'Πατήστε στο μενού, στα κουμπιά και στις φόρμες για να το δοκιμάσετε. Τίποτα δεν αποθηκεύεται ούτε αποστέλλεται.',
    making: 'Ετοιμάζεται το demo σας από τις απαντήσεις σας…', again: (n) => `Δείτε άλλη πρόταση (απομένουν ${n})`, ai: 'Δημιουργήθηκε με ΤΝ',
    err: 'Το demo δεν ετοιμάστηκε αυτή τη στιγμή. Οι απαντήσεις σας έφτασαν κανονικά σε μένα.',
    tabs: { website: 'Ιστοσελίδα', crm: 'Διαχείριση πελατών (CRM)', automation: 'Αυτοματοποίηση' }, strip: 'Demo · δοκιμάστε το',
    nav: { home: 'Αρχική', services: 'Υπηρεσίες', booking: 'Ραντεβού', quote: 'Προσφορά', contact: 'Επικοινωνία', login: 'Σύνδεση' },
    seeServices: 'Δείτε τις υπηρεσίες', how: 'Πώς λειτουργεί', faq: 'Συχνές ερωτήσεις', services: 'Υπηρεσίες', about: 'Σχετικά με εμάς', contact: 'Επικοινωνία',
    pickService: 'Επιλέξτε υπηρεσία', pickDay: 'Επιλέξτε ημέρα', pickTime: 'Επιλέξτε ώρα', yourName: 'Το όνομά σας', confirm: 'Επιβεβαίωση ραντεβού', booked: 'Το ραντεβού σας κλείστηκε',
    bookedText: (s, w) => `${s} · ${w}. Στάλθηκε e-mail επιβεβαίωσης (demo).`, payNow: 'Πληρωμή τώρα', paid: 'Η πληρωμή ελήφθη (demo)', next: 'Επόμενο', back: 'Πίσω',
    bookNow: 'Κλείστε ραντεβού', askQuote: 'Ζητήστε προσφορά',
    quoteTitle: 'Ζητήστε προσφορά', quoteSend: 'Αποστολή αιτήματος', quoteDone: 'Το αίτημά σας ελήφθη', quoteDoneText: 'Θα λάβετε απάντηση το συντομότερο (demo).',
    name: 'Το όνομά σας', message: 'Το μήνυμά σας', send: 'Αποστολή', contactDone: 'Το μήνυμά σας ελήφθη (demo).',
    loginTitle: 'Λογαριασμός πελάτη', email: 'E-mail', password: 'Κωδικός', login: 'Σύνδεση', welcome: (n) => `Καλώς ήρθατε, ${n}`, myBookings: 'Τα ραντεβού μου', none: 'Δεν υπάρχουν ακόμη ραντεβού', logout: 'Αποσύνδεση',
    asOpen: 'Έχετε ερωτήσεις;', asTitle: 'Βοηθός', asPh: 'Γράψτε μια ερώτηση…', asDemoOnly: 'Σε αυτό το demo απαντώνται μόνο οι παραπάνω ενδεικτικές ερωτήσεις.',
    langToast: 'Demo: οι γλωσσικές εκδόσεις προστίθενται στην πραγματική ιστοσελίδα.', notifyTitle: 'Ειδοποίηση που λαμβάνετε (demo)',
    notifyBooking: (n, s, w) => `Νέο ραντεβού: ${n} · ${s} · ${w}`, notifyQuote: (n) => `Νέο αίτημα προσφοράς: ${n}`, notifyContact: (n) => `Νέο μήνυμα: ${n}`,
    demoNote: 'Demo: στην πραγματική ιστοσελίδα εδώ δημιουργείται εγγραφή.', channel: { telegram: 'Telegram', whatsapp: 'WhatsApp', email: 'E-mail' },
    crmSearch: 'Αναζήτηση…', crmAdd: '+ Νέος πελάτης', crmSample: 'Ενδεικτικά δεδομένα (εντελώς φανταστικά)', crmName: 'Όνομα πελάτη', crmNote: 'Σημείωση', crmSave: 'Αποθήκευση', crmCancel: 'Άκυρο',
    crmMove: 'Στο επόμενο στάδιο →', crmBack: '← Προηγούμενο στάδιο', crmNotes: 'Σημειώσεις', crmAddNote: 'Προσθήκη σημείωσης', crmFields: 'Στοιχεία', crmClose: 'Κλείσιμο', crmTotal: (n) => `${n} πελάτες`, crmEmpty: 'Κενό',
    autoRun: 'Δοκιμαστική εκτέλεση', autoAgain: 'Ξανά', autoTrigger: 'Ξεκινά όταν', autoWaiting: 'Σε αναμονή', autoRunning: 'Εκτελείται…', autoDone: 'Έγινε', autoResult: 'Αποτέλεσμα',
    autoHint: 'Επιλέξτε μια ροή και κάντε δοκιμαστική εκτέλεση: τα βήματα γίνονται το ένα μετά το άλλο χωρίς να κάνετε τίποτα.',
  },
};

const v = (n: string) => `var(--pv-${n})`;
const mix = (n: string, pct: number, with_ = 'transparent') => `color-mix(in srgb, var(--pv-${n}) ${pct}%, ${with_})`;
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Small inline icon set (stroke icons, currentColor)
const ICONS = [
  'M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z', 'M4 12h16M12 4v16', 'M5 13l4 4L19 7', 'M3 7h18v12H3zM3 7l9 6 9-6',
  'M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z', 'M4 19V9l8-5 8 5v10H4z',
];
const Icon = ({ i, size = 18 }: { i: number; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[i % ICONS.length]} /></svg>
);

const btn = (primary = true): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 999, border: primary ? 'none' : `1px solid ${v('line')}`,
  background: primary ? v('accent') : v('surface'), color: primary ? v('accent-ink') : v('ink'), fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
});
const chip = (on: boolean): CSSProperties => ({
  padding: '8px 14px', borderRadius: 999, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
  border: `1px solid ${on ? v('accent') : v('line')}`, background: on ? mix('accent', 14, 'transparent') : v('surface'), color: v('ink'), fontWeight: on ? 600 : 400,
});
const field: CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${v('line')}`, background: v('bg'), color: v('ink'), fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' };
const h2s: CSSProperties = { margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 26px)', color: v('ink') };

type Toast = { id: number; kind: 'notify' | 'info'; head?: string; text: string };

function useToasts() {
  const [list, setList] = useState<Toast[]>([]);
  const push = (t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l.slice(-2), { ...t, id }]);
    window.setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 5200);
  };
  return { list, push };
}
const Toasts = ({ list }: { list: Toast[] }) => (
  <div aria-live="polite" style={{ position: 'absolute', right: 12, top: 12, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 5, maxWidth: 'min(320px, calc(100% - 24px))', pointerEvents: 'none' }}>
    {list.map((t) => (
      <div key={t.id} className="pvd-fade" style={{ padding: '10px 14px', borderRadius: 14, background: v('surface'), color: v('ink'), border: `1px solid ${v('line')}`, boxShadow: `0 18px 40px -20px ${mix('ink', 60)}`, fontSize: 13, lineHeight: 1.45 }}>
        {t.head && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: v('accent'), marginBottom: 2 }}>{t.head}</div>}
        {t.text}
      </div>))}
  </div>
);

// ─── Website demo ───────────────────────────────────────────────────────────
type Page = 'home' | 'services' | 'booking' | 'quote' | 'contact' | 'account';

function WebsiteDemo({ d, t, lang, toast }: { d: PreviewData; t: Tx; lang: Lang; toast: (x: Omit<Toast, 'id'>) => void }) {
  const f: PreviewFeatures = d.features ?? { booking: false, quote: false, payment: false, accounts: false, assistant: false, notify: null, languages: [] };
  const [page, setPage] = useState<Page>('home');
  const [bookings, setBookings] = useState<{ s: string; when: string }[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [lng, setLng] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const go = (p: Page) => { setPage(p); scroller.current?.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }); };
  const notify = (text: string) => { if (f.notify) toast({ kind: 'notify', head: `${t.channel[f.notify]} · ${t.notifyTitle}`, text }); };
  const primary: Page = f.booking ? 'booking' : f.quote ? 'quote' : 'contact';
  const nav: [Page, string][] = [['home', t.nav.home], ['services', t.nav.services], ...(f.booking ? [['booking', t.nav.booking] as [Page, string]] : []),
    ...(f.quote ? [['quote', t.nav.quote] as [Page, string]] : []), ['contact', t.nav.contact]];

  return (
    <div style={{ position: 'relative' }}>
      <div ref={scroller} style={{ height: 'min(680px, 78vh)', overflowY: 'auto', background: v('bg'), color: v('ink'), fontFamily: 'var(--font-body)' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 3, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', background: mix('bg', 88), backdropFilter: 'blur(10px)', borderBottom: `1px solid ${v('line')}`, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => go('home')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: v('ink'), fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>
            <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 9, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${v('accent')}, ${mix('accent', 55, 'var(--pv-ink)')})`, color: v('accent-ink'), fontSize: 14 }}>{d.brand.slice(0, 1)}</span>
            {d.brand}
          </button>
          <nav className="pvd-nav" style={{ display: 'flex', gap: 4, marginLeft: 'auto', overflowX: 'auto', maxWidth: '100%' }}>
            {nav.map(([p, label]) => (
              <button key={p} type="button" className="pvd-btn" onClick={() => go(p)} aria-current={page === p ? 'page' : undefined}
                style={{ padding: '7px 12px', borderRadius: 999, border: 'none', background: page === p ? mix('accent', 14) : 'transparent', color: page === p ? v('accent') : v('muted'), fontSize: 13, fontWeight: page === p ? 600 : 500, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{label}</button>))}
            {f.accounts && <button type="button" className="pvd-btn" onClick={() => go('account')} style={{ ...btn(false), padding: '7px 12px', fontSize: 13 }}>{user ? user : t.nav.login}</button>}
            {f.languages.length > 1 && (
              <button type="button" className="pvd-btn" onClick={() => { setLng((x) => (x + 1) % f.languages.length); toast({ kind: 'info', text: t.langToast }); }}
                style={{ ...btn(false), padding: '7px 12px', fontSize: 12 }} aria-label={f.languages.join(', ')}>🌐 {f.languages[lng]}</button>)}
          </nav>
        </header>

        <div key={page} className="pvd-fade">
          {page === 'home' && <>
            <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(36px, 6vw, 72px) 22px', background: `radial-gradient(120% 90% at 100% 0%, ${mix('accent', 22)} 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, ${mix('accent', 12)} 0%, transparent 60%), ${v('hero')}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28, alignItems: 'center', maxWidth: 980, margin: '0 auto' }}>
                <div>
                  {d.tagline && <p style={{ display: 'inline-block', margin: '0 0 14px', padding: '5px 12px', borderRadius: 999, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: v('accent'), background: mix('accent', 12), fontWeight: 700 }}>{d.tagline}</p>}
                  <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 46px)', lineHeight: 1.06, letterSpacing: '-0.02em', color: v('ink') }}>{d.heroTitle}</h3>
                  <p style={{ margin: '0 0 24px', maxWidth: 520, fontSize: 16, lineHeight: 1.65, color: v('muted') }}>{d.heroText}</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button type="button" className="pvd-btn" style={btn()} onClick={() => go(primary)}>{d.cta} →</button>
                    <button type="button" className="pvd-btn" style={btn(false)} onClick={() => go('services')}>{t.seeServices}</button>
                  </div>
                </div>
                <div aria-hidden="true" style={{ position: 'relative', minHeight: 230 }}>
                  <div style={{ position: 'absolute', inset: '8% 4% 0 10%', borderRadius: 24, background: `linear-gradient(160deg, ${mix('accent', 30)}, ${mix('accent', 6)})`, transform: 'rotate(-4deg)' }} />
                  <div style={{ position: 'relative', margin: '0 0 0 auto', maxWidth: 320, padding: 18, borderRadius: 20, background: v('surface'), border: `1px solid ${v('line')}`, boxShadow: `0 30px 60px -30px ${mix('ink', 55)}` }}>
                    {d.services.slice(0, 3).map((s, i) => (
                      <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? `1px solid ${v('line')}` : 'none' }}>
                        <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', background: mix('accent', 14), color: v('accent'), flexShrink: 0 }}><Icon i={i} /></span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</span>
                      </div>))}
                    {d.highlights[0] && <div style={{ position: 'absolute', left: -14, bottom: -16, padding: '8px 12px', borderRadius: 12, background: v('accent'), color: v('accent-ink'), fontSize: 12, fontWeight: 700, boxShadow: `0 14px 30px -14px ${mix('accent', 80)}` }}>✓ {d.highlights[0]}</div>}
                  </div>
                </div>
              </div>
              {d.highlights.length > 1 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 38 }}>{d.highlights.map((h) => <span key={h} style={{ fontSize: 13, padding: '6px 12px', borderRadius: 999, background: v('surface'), border: `1px solid ${v('line')}` }}>✓ {h}</span>)}</div>}
            </section>
            <ServicesGrid d={d} t={t} f={f} go={go} />
            {!!d.steps?.length && (
              <section style={{ padding: '44px 22px', background: v('surface'), borderTop: `1px solid ${v('line')}`, borderBottom: `1px solid ${v('line')}` }}>
                <div style={{ maxWidth: 980, margin: '0 auto' }}>
                  <h4 style={h2s}>{t.how}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
                    {d.steps.map((s, i) => (
                      <div key={s.title}>
                        <div style={{ width: 36, height: 36, borderRadius: 999, display: 'grid', placeItems: 'center', background: v('accent'), color: v('accent-ink'), fontWeight: 700, marginBottom: 10 }}>{i + 1}</div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: 14, lineHeight: 1.55, color: v('muted') }}>{s.text}</div>
                      </div>))}
                  </div>
                </div>
              </section>)}
            {d.about && (
              <section style={{ padding: '44px 22px' }}>
                <div style={{ maxWidth: 760, margin: '0 auto' }}>
                  <h4 style={h2s}>{t.about}</h4>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: v('muted') }}>{d.about}</p>
                </div>
              </section>)}
            {!!d.faq?.length && <Faq items={d.faq} title={t.faq} />}
            <section style={{ padding: '0 22px 44px' }}>
              <div style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(24px, 4vw, 40px)', borderRadius: 24, background: `linear-gradient(135deg, ${v('accent')}, ${mix('accent', 65, 'var(--pv-ink)')})`, color: v('accent-ink'), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.6vw, 24px)', fontWeight: 700, maxWidth: 560 }}>{d.contactLine}</span>
                <button type="button" className="pvd-btn" onClick={() => go(primary)} style={{ ...btn(false), background: v('accent-ink'), color: v('accent'), border: 'none' }}>{d.cta} →</button>
              </div>
            </section>
          </>}
          {page === 'services' && <ServicesGrid d={d} t={t} f={f} go={go} full />}
          {page === 'booking' && <Booking d={d} t={t} lang={lang} payment={f.payment} onBooked={(name, s, when) => { setBookings((b) => [...b, { s, when }]); notify(t.notifyBooking(name, s, when)); }} />}
          {page === 'quote' && <SimpleForm title={t.quoteTitle} fields={d.quoteFields?.length ? d.quoteFields : [t.message]} t={t} submit={t.quoteSend} doneTitle={t.quoteDone} doneText={t.quoteDoneText} onDone={(n) => notify(t.notifyQuote(n))} />}
          {page === 'contact' && <SimpleForm title={t.contact} intro={d.contactLine} fields={[t.message]} t={t} submit={t.send} doneTitle={t.contactDone} doneText="" onDone={(n) => notify(t.notifyContact(n))} />}
          {page === 'account' && <Account t={t} user={user} setUser={setUser} bookings={bookings} />}
        </div>

        <footer style={{ padding: '22px', borderTop: `1px solid ${v('line')}`, background: v('surface'), display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 13, color: v('muted') }}>
          <strong style={{ color: v('ink') }}>{d.brand}</strong>
          <span>{d.domain}</span>
        </footer>
      </div>
      {f.assistant && <Assistant d={d} t={t} />}
    </div>
  );
}

function ServicesGrid({ d, t, f, go, full }: { d: PreviewData; t: Tx; f: PreviewFeatures; go: (p: Page) => void; full?: boolean }) {
  return (
    <section style={{ padding: '44px 22px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <h4 style={h2s}>{t.services}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {d.services.map((s, i) => (
            <div key={s.title} className="pvd-card" style={{ padding: 18, borderRadius: 16, background: v('surface'), border: `1px solid ${v('line')}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: mix('accent', 14), color: v('accent') }}><Icon i={i} size={20} /></span>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: v('muted'), flex: 1 }}>{s.text}</div>
              {full && (f.booking || f.quote) && <button type="button" className="pvd-btn" style={{ ...btn(false), alignSelf: 'flex-start', padding: '8px 14px', fontSize: 13 }} onClick={() => go(f.booking ? 'booking' : 'quote')}>{f.booking ? t.bookNow : t.askQuote} →</button>}
            </div>))}
        </div>
      </div>
    </section>
  );
}

function Faq({ items, title }: { items: { q: string; a: string }[]; title: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section style={{ padding: '0 22px 44px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h4 style={h2s}>{title}</h4>
        {items.map((f, i) => (
          <div key={f.q} style={{ borderBottom: `1px solid ${v('line')}` }}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 0', background: 'none', border: 'none', color: v('ink'), fontSize: 15, fontWeight: 600, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              {f.q}<span aria-hidden="true" style={{ color: v('accent') }}>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="pvd-fade" style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.65, color: v('muted') }}>{f.a}</p>}
          </div>))}
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ padding: '40px 22px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(18px, 3vw, 28px)', borderRadius: 20, background: v('surface'), border: `1px solid ${v('line')}`, boxShadow: `0 24px 50px -32px ${mix('ink', 50)}` }}>
        <h4 style={h2s}>{title}</h4>
        {children}
      </div>
    </section>
  );
}
const Done = ({ title, text }: { title: string; text: string }) => (
  <div className="pvd-fade" role="status" style={{ textAlign: 'center', padding: '10px 0' }}>
    <div aria-hidden="true" style={{ width: 54, height: 54, margin: '0 auto 12px', borderRadius: 999, display: 'grid', placeItems: 'center', background: v('accent'), color: v('accent-ink') }}><Icon i={2} size={26} /></div>
    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{title}</div>
    {text && <div style={{ fontSize: 14, color: v('muted'), lineHeight: 1.6 }}>{text}</div>}
  </div>
);

function Booking({ d, t, lang, payment, onBooked }: { d: PreviewData; t: Tx; lang: Lang; payment: boolean; onBooked: (name: string, s: string, when: string) => void }) {
  const days = useMemo(() => {
    const out: Date[] = []; const x = new Date();
    while (out.length < 6) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0) out.push(new Date(x)); }
    return out;
  }, []);
  const fmt = (dt: Date) => new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'short' }).format(dt);
  const times = ['09:00', '10:30', '12:00', '14:30', '16:00'];
  const [step, setStep] = useState(0);
  const [s, setS] = useState<number | null>(null); const [day, setDay] = useState<number | null>(null); const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState(''); const [paid, setPaid] = useState(false);
  const when = day !== null && time ? `${fmt(days[day])}, ${time}` : '';
  const svc = s !== null ? d.services[s]?.title ?? '' : '';
  return (
    <Panel title={t.nav.booking}>
      <div aria-hidden="true" style={{ display: 'flex', gap: 6, marginBottom: 18 }}>{[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? v('accent') : v('line') }} />)}</div>
      {step === 0 && <>
        <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{t.pickService}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{d.services.map((x, i) => <button key={x.title} type="button" style={chip(s === i)} onClick={() => setS(i)}>{x.title}</button>)}</div>
        <button type="button" className="pvd-btn" style={{ ...btn(), marginTop: 18, opacity: s === null ? 0.5 : 1 }} disabled={s === null} onClick={() => setStep(1)}>{t.next} →</button>
      </>}
      {step === 1 && <>
        <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{t.pickDay}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{days.map((dt, i) => <button key={i} type="button" style={chip(day === i)} onClick={() => setDay(i)}>{fmt(dt)}</button>)}</div>
        <p style={{ margin: '16px 0 10px', fontWeight: 600 }}>{t.pickTime}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{times.map((x) => <button key={x} type="button" style={chip(time === x)} onClick={() => setTime(x)}>{x}</button>)}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button type="button" className="pvd-btn" style={btn(false)} onClick={() => setStep(0)}>← {t.back}</button>
          <button type="button" className="pvd-btn" style={{ ...btn(), opacity: when ? 1 : 0.5 }} disabled={!when} onClick={() => setStep(2)}>{t.next} →</button>
        </div>
      </>}
      {step === 2 && <>
        <p style={{ margin: '0 0 6px', fontSize: 14, color: v('muted') }}>{svc} · {when}</p>
        <label style={{ fontSize: 13, fontWeight: 600 }}>{t.yourName}<input style={{ ...field, marginTop: 6 }} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button type="button" className="pvd-btn" style={btn(false)} onClick={() => setStep(1)}>← {t.back}</button>
          <button type="button" className="pvd-btn" style={{ ...btn(), opacity: name.trim() ? 1 : 0.5 }} disabled={!name.trim()} onClick={() => { setStep(3); onBooked(name.trim(), svc, when); }}>{t.confirm}</button>
        </div>
      </>}
      {step === 3 && <>
        <Done title={t.booked} text={t.bookedText(svc, when)} />
        {payment && <div style={{ textAlign: 'center', marginTop: 14 }}>{paid ? <span style={{ fontWeight: 600, color: v('accent') }}>✓ {t.paid}</span>
          : <button type="button" className="pvd-btn" style={btn()} onClick={() => setPaid(true)}>💳 {t.payNow}</button>}</div>}
        <p style={{ margin: '14px 0 0', fontSize: 12, textAlign: 'center', color: v('muted') }}>{t.demoNote}</p>
      </>}
    </Panel>
  );
}

function SimpleForm({ title, intro, fields, t, submit, doneTitle, doneText, onDone }: { title: string; intro?: string; fields: string[]; t: Tx; submit: string; doneTitle: string; doneText: string; onDone: (name: string) => void }) {
  const [name, setName] = useState(''); const [done, setDone] = useState(false);
  return (
    <Panel title={title}>
      {done ? <Done title={doneTitle} text={doneText} /> : <>
        {intro && <p style={{ margin: '0 0 14px', fontSize: 14, color: v('muted'), lineHeight: 1.6 }}>{intro}</p>}
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>{t.name}<input style={{ ...field, marginTop: 6 }} value={name} onChange={(e) => setName(e.target.value)} /></label>
          {fields.map((x, i) => <label key={x} style={{ fontSize: 13, fontWeight: 600 }}>{x}{i === fields.length - 1 && fields.length === 1 ? <textarea style={{ ...field, marginTop: 6, minHeight: 90 }} /> : <input style={{ ...field, marginTop: 6 }} />}</label>)}
        </div>
        <button type="button" className="pvd-btn" style={{ ...btn(), marginTop: 18, opacity: name.trim() ? 1 : 0.5 }} disabled={!name.trim()} onClick={() => { setDone(true); onDone(name.trim()); }}>{submit}</button>
      </>}
    </Panel>
  );
}

function Account({ t, user, setUser, bookings }: { t: Tx; user: string | null; setUser: (u: string | null) => void; bookings: { s: string; when: string }[] }) {
  const [mail, setMail] = useState('');
  if (!user) return (
    <Panel title={t.loginTitle}>
      <div style={{ display: 'grid', gap: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>{t.email}<input style={{ ...field, marginTop: 6 }} value={mail} onChange={(e) => setMail(e.target.value)} /></label>
        <label style={{ fontSize: 13, fontWeight: 600 }}>{t.password}<input type="password" style={{ ...field, marginTop: 6 }} /></label>
      </div>
      <button type="button" className="pvd-btn" style={{ ...btn(), marginTop: 18 }} onClick={() => setUser((mail.split('@')[0] || 'Demo').slice(0, 20))}>{t.login}</button>
    </Panel>
  );
  return (
    <Panel title={t.welcome(user)}>
      <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{t.myBookings}</p>
      {bookings.length === 0 ? <p style={{ margin: 0, color: v('muted'), fontSize: 14 }}>{t.none}</p>
        : bookings.map((b, i) => <div key={i} style={{ padding: '10px 12px', borderRadius: 12, background: v('bg'), border: `1px solid ${v('line')}`, marginBottom: 8, fontSize: 14 }}>📅 {b.s} · {b.when}</div>)}
      <button type="button" className="pvd-btn" style={{ ...btn(false), marginTop: 14 }} onClick={() => setUser(null)}>{t.logout}</button>
    </Panel>
  );
}

function Assistant({ d, t }: { d: PreviewData; t: Tx }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([]);
  const [q, setQ] = useState('');
  const ask = (text: string, answer?: string) => setMsgs((m) => [...m, { me: true, text }, { me: false, text: answer ?? t.asDemoOnly }]);
  return (
    <div style={{ position: 'absolute', right: 14, bottom: 14, zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      {open && (
        <div className="pvd-fade" style={{ width: 'min(320px, calc(100vw - 60px))', maxHeight: 400, display: 'flex', flexDirection: 'column', borderRadius: 18, background: v('surface'), border: `1px solid ${v('line')}`, boxShadow: `0 30px 60px -28px ${mix('ink', 60)}`, overflow: 'hidden', color: v('ink') }}>
          <div style={{ padding: '12px 14px', background: v('accent'), color: v('accent-ink'), fontWeight: 700, fontSize: 14 }}>{t.asTitle} · {d.brand}</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, lineHeight: 1.5 }}>
            {(d.assistant ?? []).map((x) => <button key={x.q} type="button" style={{ ...chip(false), textAlign: 'left', borderRadius: 12 }} onClick={() => ask(x.q, x.a)}>{x.q}</button>)}
            {msgs.map((m, i) => <div key={i} className="pvd-fade" style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '8px 11px', borderRadius: 12, background: m.me ? v('accent') : v('bg'), color: m.me ? v('accent-ink') : v('ink'), border: m.me ? 'none' : `1px solid ${v('line')}` }}>{m.text}</div>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { ask(q.trim()); setQ(''); } }} style={{ display: 'flex', gap: 6, padding: 10, borderTop: `1px solid ${v('line')}` }}>
            <input style={{ ...field, padding: '8px 10px', fontSize: 13 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.asPh} aria-label={t.asPh} />
            <button type="submit" className="pvd-btn" style={{ ...btn(), padding: '8px 12px' }} aria-label={t.send}>→</button>
          </form>
        </div>)}
      <button type="button" className="pvd-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ ...btn(), boxShadow: `0 14px 30px -12px ${mix('accent', 80)}` }}>💬 {open ? '×' : t.asOpen}</button>
    </div>
  );
}

// ─── CRM demo ───────────────────────────────────────────────────────────────
function CrmDemo({ d, t }: { d: PreviewData; t: Tx }) {
  const crm = d.crm!;
  const [recs, setRecs] = useState(() => crm.records.map((r, i) => ({ id: i, name: r.name, stage: r.stage, notes: r.note ? [r.note] : [] })));
  const [q, setQ] = useState(''); const [open, setOpen] = useState<number | null>(null); const [adding, setAdding] = useState(false);
  const [nName, setNName] = useState(''); const [nNote, setNNote] = useState(''); const [note, setNote] = useState('');
  const shown = recs.filter((r) => !q.trim() || r.name.toLowerCase().includes(q.trim().toLowerCase()));
  const cur = recs.find((r) => r.id === open);
  const move = (id: number, by: number) => setRecs((l) => l.map((r) => (r.id === id ? { ...r, stage: Math.min(crm.stages.length - 1, Math.max(0, r.stage + by)) } : r)));
  return (
    <div style={{ position: 'relative', height: 'min(680px, 78vh)', display: 'flex', flexDirection: 'column', background: v('bg'), color: v('ink'), fontFamily: 'var(--font-body)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${v('line')}`, background: v('surface'), flexWrap: 'wrap' }}>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{d.brand} · CRM</strong>
        <span style={{ fontSize: 12, color: v('muted') }}>{t.crmTotal(recs.length)}</span>
        <input style={{ ...field, width: 180, marginLeft: 'auto', padding: '8px 12px' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.crmSearch} aria-label={t.crmSearch} />
        <button type="button" className="pvd-btn" style={{ ...btn(), padding: '8px 14px', fontSize: 13 }} onClick={() => setAdding(true)}>{t.crmAdd}</button>
      </div>
      <div style={{ padding: '8px 16px', fontSize: 12, color: v('muted'), background: mix('accent', 8) }}>ⓘ {t.crmSample}</div>
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: 12, padding: 16 }}>
        {crm.stages.map((st, si) => {
          const col = shown.filter((r) => r.stage === si);
          return (
            <div key={st} style={{ minWidth: 210, flex: '1 0 210px', display: 'flex', flexDirection: 'column', borderRadius: 16, background: v('surface'), border: `1px solid ${v('line')}`, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontSize: 13, fontWeight: 700, borderBottom: `3px solid ${mix('accent', 30 + si * 12, 'var(--pv-line)')}` }}>
                {st}<span style={{ color: v('muted'), fontWeight: 500 }}>{col.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.length === 0 && <span style={{ fontSize: 12, color: v('muted'), textAlign: 'center', padding: 10 }}>{t.crmEmpty}</span>}
                {col.map((r) => (
                  <button key={r.id} type="button" className="pvd-card pvd-fade" onClick={() => setOpen(r.id)}
                    style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 12, background: v('bg'), border: `1px solid ${v('line')}`, color: v('ink'), cursor: 'pointer', fontFamily: 'inherit' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                    {r.notes[r.notes.length - 1] && <div style={{ fontSize: 12, color: v('muted'), marginTop: 3, lineHeight: 1.4 }}>{r.notes[r.notes.length - 1]}</div>}
                  </button>))}
              </div>
            </div>);
        })}
      </div>

      {(cur || adding) && (
        <div style={{ position: 'absolute', inset: 0, background: mix('ink', 35), display: 'flex', justifyContent: 'flex-end', zIndex: 4 }} onClick={() => { setOpen(null); setAdding(false); }}>
          <div className="pvd-fade" onClick={(e) => e.stopPropagation()} style={{ width: 'min(360px, 100%)', height: '100%', overflowY: 'auto', background: v('surface'), padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {adding ? <>
              <strong style={{ fontSize: 16 }}>{t.crmAdd.replace('+ ', '')}</strong>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.crmName}<input style={{ ...field, marginTop: 6 }} value={nName} onChange={(e) => setNName(e.target.value)} autoFocus /></label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.crmNote}<input style={{ ...field, marginTop: 6 }} value={nNote} onChange={(e) => setNNote(e.target.value)} /></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="pvd-btn" style={{ ...btn(), opacity: nName.trim() ? 1 : 0.5 }} disabled={!nName.trim()} onClick={() => { setRecs((l) => [...l, { id: Date.now(), name: nName.trim(), stage: 0, notes: nNote.trim() ? [nNote.trim()] : [] }]); setNName(''); setNNote(''); setAdding(false); }}>{t.crmSave}</button>
                <button type="button" className="pvd-btn" style={btn(false)} onClick={() => setAdding(false)}>{t.crmCancel}</button>
              </div>
            </> : cur && <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ fontSize: 17 }}>{cur.name}</strong>
                <button type="button" onClick={() => setOpen(null)} aria-label={t.crmClose} style={{ background: 'none', border: 'none', color: v('muted'), fontSize: 20, cursor: 'pointer' }}>×</button>
              </div>
              <span style={{ alignSelf: 'flex-start', fontSize: 12, padding: '4px 10px', borderRadius: 999, background: mix('accent', 14), color: v('accent'), fontWeight: 700 }}>{crm.stages[cur.stage]}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {cur.stage > 0 && <button type="button" className="pvd-btn" style={{ ...btn(false), padding: '8px 12px', fontSize: 13 }} onClick={() => move(cur.id, -1)}>{t.crmBack}</button>}
                {cur.stage < crm.stages.length - 1 && <button type="button" className="pvd-btn" style={{ ...btn(), padding: '8px 12px', fontSize: 13 }} onClick={() => move(cur.id, 1)}>{t.crmMove}</button>}
              </div>
              {crm.fields.length > 0 && <>
                <strong style={{ fontSize: 13, marginTop: 6 }}>{t.crmFields}</strong>
                {crm.fields.map((fl) => <div key={fl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: `1px solid ${v('line')}` }}><span style={{ color: v('muted') }}>{fl}</span><span>—</span></div>)}
              </>}
              <strong style={{ fontSize: 13, marginTop: 6 }}>{t.crmNotes}</strong>
              {cur.notes.map((n, i) => <div key={i} style={{ fontSize: 13, padding: '8px 10px', borderRadius: 10, background: v('bg'), border: `1px solid ${v('line')}` }}>{n}</div>)}
              <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) { setRecs((l) => l.map((r) => (r.id === cur.id ? { ...r, notes: [...r.notes, note.trim()] } : r))); setNote(''); } }} style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...field, padding: '8px 10px' }} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.crmAddNote} aria-label={t.crmAddNote} />
                <button type="submit" className="pvd-btn" style={{ ...btn(), padding: '8px 12px' }}>+</button>
              </form>
            </>}
          </div>
        </div>)}
    </div>
  );
}

// ─── Automation demo ────────────────────────────────────────────────────────
function AutomationDemo({ d, t }: { d: PreviewData; t: Tx }) {
  const flows = d.flows ?? [];
  const [sel, setSel] = useState(0);
  const [done, setDone] = useState(-1);   // index of the last finished step; -1 = not started
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);
  const flow = flows[sel];
  const clear = () => { timers.current.forEach((x) => window.clearTimeout(x)); timers.current = []; };
  useEffect(() => clear, []);
  const run = () => {
    clear(); setDone(-1); setRunning(true);
    const n = flow.steps.length; const gap = reducedMotion() ? 0 : 900;
    for (let i = 0; i <= n; i++) timers.current.push(window.setTimeout(() => { setDone(i - 1); if (i === n) setRunning(false); }, gap * (i + 1)));
    if (!gap) { setDone(n - 1); setRunning(false); }
  };
  const pick = (i: number) => { clear(); setSel(i); setDone(-1); setRunning(false); };
  const state = (i: number) => (i <= done ? 'done' : running && i === done + 1 ? 'run' : 'wait');
  const finished = done >= flow.steps.length - 1 && !running;
  return (
    <div style={{ height: 'min(680px, 78vh)', overflowY: 'auto', background: v('bg'), color: v('ink'), fontFamily: 'var(--font-body)', padding: 20, boxSizing: 'border-box' }}>
      <p style={{ margin: '0 auto 16px', maxWidth: 720, fontSize: 14, color: v('muted'), lineHeight: 1.6 }}>{t.autoHint}</p>
      {flows.length > 1 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>{flows.map((fl, i) => <button key={fl.name} type="button" style={chip(sel === i)} onClick={() => pick(i)}>{fl.name}</button>)}</div>}
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ padding: 16, borderRadius: 16, background: `linear-gradient(135deg, ${v('accent')}, ${mix('accent', 65, 'var(--pv-ink)')})`, color: v('accent-ink') }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>⚡ {t.autoTrigger}</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{flow.trigger}</div>
        </div>
        {flow.steps.map((s, i) => {
          const st = state(i);
          return (
            <div key={i}>
              <div aria-hidden="true" style={{ width: 2, height: 18, margin: '0 auto', background: st === 'wait' ? v('line') : v('accent') }} />
              <div className={st === 'run' ? 'pvd-pulse' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: v('surface'), border: `1px solid ${st === 'wait' ? v('line') : v('accent')}`, transition: 'border-color .3s' }}>
                <span style={{ width: 30, height: 30, borderRadius: 999, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, background: st === 'done' ? v('accent') : mix('accent', 12), color: st === 'done' ? v('accent-ink') : v('accent') }}>{st === 'done' ? '✓' : i + 1}</span>
                <span style={{ flex: 1, fontSize: 14 }}>{s}</span>
                <span style={{ fontSize: 11, color: st === 'wait' ? v('muted') : v('accent'), fontWeight: 600, whiteSpace: 'nowrap' }}>{st === 'done' ? t.autoDone : st === 'run' ? t.autoRunning : t.autoWaiting}</span>
              </div>
            </div>);
        })}
        {finished && done >= 0 && (
          <div className="pvd-fade" role="status" style={{ marginTop: 18, padding: 16, borderRadius: 16, background: mix('accent', 12), border: `1px solid ${v('accent')}` }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: v('accent'), fontWeight: 700 }}>✓ {t.autoResult}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{flow.result}</div>
          </div>)}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button type="button" className="pvd-btn" style={{ ...btn(), opacity: running ? 0.6 : 1 }} disabled={running} onClick={run}>▶ {done >= 0 && !running ? t.autoAgain : t.autoRun}</button>
        </div>
      </div>
    </div>
  );
}

/** The demo itself (also used in the admin). Older previews without views/features show the website only. */
export function PreviewFrame({ d, lang }: { d: PreviewData; lang: Lang }) {
  const t = TX[lang];
  const views = (d.views?.length ? d.views : ['website']).filter((x) => (x === 'crm' ? !!d.crm : x === 'automation' ? !!d.flows?.length : true)) as View[];
  const [view, setView] = useState<View>(views[0] ?? 'website');
  const { list, push } = useToasts();
  return (
    <div className={`pv-${d.theme}`} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--c-hairline)', boxShadow: '0 30px 70px -34px color-mix(in srgb, var(--c-signal) 60%, transparent)', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--c-abyss)', borderBottom: '1px solid var(--c-hairline)' }}>
        {[0, 1, 2].map((i) => <span key={i} aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 9, background: 'var(--c-hairline)' }} />)}
        <span style={{ marginLeft: 8, flex: 1, minWidth: 0, fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'var(--c-void)', color: 'var(--c-ash)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{view === 'website' ? d.domain : `app.${d.domain}`}</span>
        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, border: '1px solid var(--c-signal)', color: 'var(--c-signal)', whiteSpace: 'nowrap' }}>{t.strip}</span>
      </div>
      {views.length > 1 && (
        <div role="tablist" style={{ display: 'flex', gap: 4, padding: 6, background: 'var(--c-deep-sea)', borderBottom: '1px solid var(--c-hairline)', overflowX: 'auto' }}>
          {views.map((x) => (
            <button key={x} type="button" role="tab" aria-selected={view === x} onClick={() => setView(x)}
              style={{ padding: '8px 14px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: view === x ? 'var(--c-signal)' : 'transparent', color: view === x ? 'var(--c-void)' : 'var(--c-mist)' }}>{t.tabs[x]}</button>))}
        </div>)}
      <div style={{ position: 'relative' }}>
        {view === 'website' && <WebsiteDemo d={d} t={t} lang={lang} toast={push} />}
        {view === 'crm' && d.crm && <CrmDemo d={d} t={t} />}
        {view === 'automation' && !!d.flows?.length && <AutomationDemo d={d} t={t} />}
        <Toasts list={list} />
      </div>
    </div>
  );
}

/** Thank-you screen block: loads or generates the demo (once; up to 3 alternatives), with a clear "only a demo" banner. */
export default function IntakePreview({ token, lang }: { token: string; lang: Lang }) {
  const t = TX[lang];
  const [p, setP] = useState<Pub | null>(null);
  const [state, setState] = useState<'loading' | 'making' | 'ok' | 'error'>('loading');
  const make = (again = false) => {
    setState('making');
    fetch(`/api/intake/${encodeURIComponent(token)}/preview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ again }) })
      .then(async (r) => { const j = await r.json().catch(() => ({})); if (j.preview) { setP(j.preview); setState('ok'); } else setState(p ? 'ok' : 'error'); })
      .catch(() => setState(p ? 'ok' : 'error'));
  };
  useEffect(() => {
    fetch(`/api/intake/${encodeURIComponent(token)}/preview`).then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j?.preview) { setP(j.preview); setState('ok'); } else make(); })
      .catch(() => make());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section aria-label={t.title} style={{ marginTop: 28, textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--c-quartz)' }}>{t.title}</h2>
        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, border: '1px solid var(--c-lilac)', color: 'var(--c-lilac)' }}>{t.ai}</span>
      </div>
      <div role="note" className="lq-card" style={{ padding: '16px 18px', marginBottom: 16, borderColor: 'var(--c-signal)', background: 'color-mix(in srgb, var(--c-signal) 8%, var(--c-abyss))' }}>
        <strong style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--c-quartz)', marginBottom: 6 }}>⚠ {t.bannerTitle}</strong>
        <p style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.65, color: 'var(--c-mist)' }}>{t.banner}</p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--c-ash)' }}>{t.tryHint}</p>
      </div>
      {state === 'making' || state === 'loading' ? (
        <div className="lq-card" style={{ padding: 22 }}>
          <p role="status" style={{ margin: '0 0 14px', color: 'var(--c-mist)' }}>{t.making}</p>
          {[80, 55, 90, 40].map((w, i) => <div key={i} className="cw-pv-skel" style={{ height: 12, width: `${w}%`, borderRadius: 6, background: 'var(--c-hairline)', marginBottom: 10 }} />)}
        </div>
      ) : state === 'error' || !p ? (
        <p className="lq-card" style={{ padding: 18, margin: 0, color: 'var(--c-mist)' }}>{t.err}</p>
      ) : (
        <>
          <PreviewFrame key={p.at} d={p.data} lang={lang} />
          {p.left > 0 && <button type="button" className="lq-btn-ghost" style={{ marginTop: 14 }} onClick={() => make(true)}>{t.again(p.left)}</button>}
        </>
      )}
    </section>
  );
}
