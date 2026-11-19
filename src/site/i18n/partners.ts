import type { Lang } from '../../translations';

export const PARTNERS_UI = {
  tr: { kicker: 'Kullandığım ve önerdiğim araçlar', label: 'Önerilen araçlar', note: 'Bazı bağlantılar affiliate (reklam) bağlantısıdır: bunlar üzerinden satın alırsanız size ek bir ücret olmadan komisyon alabilirim.', newTab: 'yeni sekmede açılır', more: 'neden kullandığımı oku' },
  en: { kicker: 'Tools I use and recommend', label: 'Recommended tools', note: 'Some links are affiliate (advertising) links: if you buy through them, I may earn a commission at no extra cost to you.', newTab: 'opens in a new tab', more: 'read why I use it' },
  de: { kicker: 'Tools, die ich nutze und empfehle', label: 'Empfohlene Tools', note: 'Einige Links sind Affiliate-Links (Werbung): Wenn Sie darüber kaufen, erhalte ich ggf. eine Provision – für Sie ohne Mehrkosten.', newTab: 'öffnet in neuem Tab', more: 'lesen, warum ich es nutze' },
  el: { kicker: 'Εργαλεία που χρησιμοποιώ και προτείνω', label: 'Προτεινόμενα εργαλεία', note: 'Ορισμένοι σύνδεσμοι είναι σύνδεσμοι affiliate (διαφήμιση): αν αγοράσετε μέσω αυτών, μπορεί να λάβω προμήθεια χωρίς επιπλέον κόστος για εσάς.', newTab: 'ανοίγει σε νέα καρτέλα', more: 'διαβάστε γιατί το χρησιμοποιώ' },
} satisfies Record<Lang, { kicker: string; label: string; note: string; newTab: string; more: string }>;
