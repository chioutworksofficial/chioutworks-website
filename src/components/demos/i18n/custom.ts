import type { Lang } from '../../../translations.js';

// "Custom software & design" card at the end of the showcase (slug: demoozel).
export const CUSTOM_UI = {
  en: {
    name: 'Custom software & design',
    desc: 'Your business is not in the list? Tell us your idea and we will design and build it from scratch, exactly for your workflow.',
    features: ['Web apps and admin panels tailored to your processes', 'Mobile-friendly design in your brand colours', 'Automations that remove repetitive work', 'AI integration: assistants, document and email automation'],
    tag: 'Custom',
    cta: 'Tell us your idea',
  },
  de: {
    name: 'Individuelle Software & Gestaltung',
    desc: 'Ihre Branche ist nicht dabei? Schildern Sie uns Ihre Idee – wir gestalten und entwickeln sie von Grund auf, passend zu Ihren Abläufen.',
    features: ['Webanwendungen und Verwaltungsbereiche nach Ihren Prozessen', 'Mobilfreundliche Gestaltung in Ihren Markenfarben', 'Automatisierungen, die wiederkehrende Arbeit abnehmen', 'KI-Integration: Assistenten, Dokumenten- und E-Mail-Automatisierung'],
    tag: 'Individuell',
    cta: 'Idee schildern',
  },
  tr: {
    name: 'Özel yazılım & tasarım',
    desc: 'İşiniz listede yok mu? Fikrinizi anlatın; iş akışınıza tam uyacak şekilde sıfırdan tasarlayıp geliştirelim.',
    features: ['Süreçlerinize göre web uygulamaları ve yönetim panelleri', 'Marka renklerinizle mobil uyumlu tasarım', 'Tekrarlayan işleri ortadan kaldıran otomasyonlar', 'Yapay zekâ entegrasyonu: asistanlar, belge ve e-posta otomasyonu'],
    tag: 'Size özel',
    cta: 'Fikrinizi anlatın',
  },
  el: {
    name: 'Λογισμικό & σχεδιασμός κατά παραγγελία',
    desc: 'Ο κλάδος σας δεν είναι στη λίστα; Περιγράψτε μας την ιδέα σας και θα τη σχεδιάσουμε και θα την αναπτύξουμε από την αρχή, ακριβώς για τη δική σας ροή εργασίας.',
    features: ['Εφαρμογές ιστού και πίνακες διαχείρισης για τις διαδικασίες σας', 'Σχεδιασμός φιλικός σε κινητά, στα χρώματα της επωνυμίας σας', 'Αυτοματισμοί που αφαιρούν την επαναλαμβανόμενη εργασία', 'Ενσωμάτωση τεχνητής νοημοσύνης: βοηθοί, αυτοματισμός εγγράφων και ηλ. ταχυδρομείου'],
    tag: 'Κατά παραγγελία',
    cta: 'Περιγράψτε την ιδέα σας',
  },
} satisfies Record<Lang, { name: string; desc: string; features: string[]; tag: string; cta: string }>;
