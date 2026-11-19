import type { Lang } from '../../translations';

export const INDUSTRIES_UI = {
  en: { kicker: 'Built for every industry', sub: 'Platform built for you', prev: 'Prev', next: 'Next', label: 'Industries' },
  de: { kicker: 'Für jede Branche gebaut', sub: 'Plattform für Ihr Unternehmen', prev: 'Zurück', next: 'Weiter', label: 'Branchen' },
  tr: { kicker: 'Her sektöre özel', sub: 'İşinize özel platform', prev: 'Önceki', next: 'Sonraki', label: 'Sektörler' },
  el: { kicker: 'Φτιαγμένο για κάθε κλάδο', sub: 'Πλατφόρμα για την επιχείρησή σας', prev: 'Πίσω', next: 'Επόμενο', label: 'Κλάδοι' },
} satisfies Record<Lang, { kicker: string; sub: string; prev: string; next: string; label: string }>;
