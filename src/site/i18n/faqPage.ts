import type { Lang } from '../../translations';

export const FAQ_PAGE_UI: Record<Lang, { nav: string; word: string; intro: string; explore: string; still: string; write: string; all: string }> = {
  en: { nav: 'FAQ', word: 'FAQ', intro: 'What you want to know about the services, process and delivery, from the first request to handover.', explore: 'Explore', still: 'Still have questions?', write: 'Write to me', all: 'All questions' },
  de: { nav: 'FAQ', word: 'FAQ', intro: 'Was Sie über die Leistungen, den Ablauf und die Lieferung wissen möchten, von der ersten Anfrage bis zur Übergabe.', explore: 'Entdecken', still: 'Noch Fragen?', write: 'Schreiben Sie mir', all: 'Alle Fragen' },
  tr: { nav: 'SSS', word: 'SSS', intro: 'Hizmetler, süreç ve teslimat hakkında merak ettikleriniz — başlangıçtan teslimata kadar.', explore: 'Keşfet', still: 'Hâlâ sorunuz mu var?', write: 'Bana yazın', all: 'Tüm sorular' },
  el: { nav: 'Ερωτήσεις', word: 'ΣΕ', intro: 'Όσα θέλετε να μάθετε για τις υπηρεσίες, τη διαδικασία και την παράδοση, από το πρώτο αίτημα έως την παράδοση.', explore: 'Εξερευνήστε', still: 'Έχετε ακόμη απορίες;', write: 'Γράψτε μου', all: 'Όλες οι ερωτήσεις' },
};
