import type { Lang } from '../../../translations';

export const QR_UI = {
  en: { stamp: 'SAMPLE', note: 'Sample QR code — for display only, it does not work.' },
  de: { stamp: 'MUSTER', note: 'Muster-QR-Code – nur zur Ansicht, nicht funktionsfähig.' },
  tr: { stamp: 'ÖRNEK', note: 'Örnek QR kod — yalnızca gösterim amaçlıdır, çalışmaz.' },
  el: { stamp: 'ΔΕΙΓΜΑ', note: 'Δείγμα κωδικού QR — μόνο για επίδειξη, δεν λειτουργεί.' },
} satisfies Record<Lang, { stamp: string; note: string }>;
