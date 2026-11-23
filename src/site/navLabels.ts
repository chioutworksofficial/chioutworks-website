// Small labels the entry bundle (nav, footer) needs on first paint. Kept apart so the big text files
// (translations, resources, tools) stay out of the entry chunk; those files read these values back, so each text lives once.
export const NAV = {
  en: ['Services', 'About me', 'Portfolio', 'Live demos', 'Contact'],
  de: ['Leistungen', 'Über mich', 'Portfolio', 'Live-Demos', 'Kontakt'],
  tr: ['Hizmetler', 'Hakkımda', 'Portföy', 'Canlı demolar', 'İletişim'],
  el: ['Υπηρεσίες', 'Σχετικά με εμένα', 'Έργα', 'Ζωντανές επιδείξεις', 'Επικοινωνία'],
} as const;

export const FOOTER_LEGAL = {
  en: ['Privacy Policy', 'Terms of Service', 'Docs', 'Imprint'],
  de: ['Datenschutz', 'AGB', 'Dokumentation', 'Impressum'],
  tr: ['Gizlilik Politikası', 'Kullanım Koşulları', 'Belgeler', 'Künye (Impressum)'],
  el: ['Πολιτική Απορρήτου', 'Όροι Χρήσης', 'Τεκμηρίωση', 'Στοιχεία εκδότη'],
} as const;

export const RESOURCES_NAV = { tr: 'Kaynaklar', en: 'Resources', de: 'Ressourcen', el: 'Πόροι' } as const;

export const TOOLS_KICKER = { tr: 'Kullandığım araçlar', en: 'Tools I use', de: 'Tools, die ich nutze', el: 'Εργαλεία που χρησιμοποιώ' } as const;
