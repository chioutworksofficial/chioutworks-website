import type { Lang } from '../../translations';

export const SERVICES_UI = {
  en: {
    intro: 'Four steps that take your business from a first idea to a system that runs, sells and grows on its own.',
    bullets: [
      ['Process mapping and bottleneck analysis', 'Workflows between your tools, connected', 'Reports and reminders on autopilot'],
      ['Fast, modern websites and web apps', 'Clean design focused on conversion', 'Hosting, domain and maintenance handled'],
      ['Chatbots that answer in your customers’ language', 'Content and document tools', 'Smart assistants wired into your data'],
      ['Clear metrics and dashboards', 'Funnels that turn visitors into leads', 'Lasting systems instead of one-off fixes'],
    ],
    mock: { trigger: 'Trigger', action: 'Action', done: 'Done', you: 'Hello, how can I help?', bot: 'Your appointment is booked.', visitors: 'Visitors', leads: 'Leads' },
    ctaTitle: 'Free written assessment',
    ctaSub: 'Tell me what you need and you get a tailored list of solutions — no meeting required.',
    ctaBtn: 'Send your request',
  },
  de: {
    intro: 'Vier Schritte, die Ihr Unternehmen von der ersten Idee zu einem System bringen, das von selbst läuft, verkauft und wächst.',
    bullets: [
      ['Prozessanalyse und Engpass-Erkennung', 'Abläufe zwischen Ihren Tools verbunden', 'Berichte und Erinnerungen im Autopilot'],
      ['Schnelle, moderne Websites und Web-Apps', 'Klares Design mit Fokus auf Conversion', 'Hosting, Domain und Wartung inklusive'],
      ['Chatbots, die in der Sprache Ihrer Kunden antworten', 'Werkzeuge für Inhalte und Dokumente', 'Intelligente Assistenten mit Zugriff auf Ihre Daten'],
      ['Klare Kennzahlen und Dashboards', 'Funnels, die Besucher zu Anfragen machen', 'Dauerhafte Systeme statt Einzellösungen'],
    ],
    mock: { trigger: 'Auslöser', action: 'Aktion', done: 'Fertig', you: 'Hallo, wie kann ich helfen?', bot: 'Ihr Termin ist gebucht.', visitors: 'Besucher', leads: 'Anfragen' },
    ctaTitle: 'Kostenlose schriftliche Einschätzung',
    ctaSub: 'Beschreiben Sie Ihr Anliegen und Sie erhalten eine maßgeschneiderte Lösungsliste — ganz ohne Termin.',
    ctaBtn: 'Anfrage senden',
  },
  tr: {
    intro: 'İşletmenizi ilk fikirden, kendi kendine çalışan, satış yapan ve büyüyen bir sisteme taşıyan dört adım.',
    bullets: [
      ['Süreç haritalama ve darboğaz analizi', 'Araçlarınız arasında bağlanmış iş akışları', 'Otomatik raporlar ve hatırlatmalar'],
      ['Hızlı, modern web siteleri ve uygulamaları', 'Dönüşüme odaklı sade tasarım', 'Barındırma, alan adı ve bakım dahil'],
      ['Müşterinizin dilinde yanıtlayan sohbet botları', 'İçerik ve belge araçları', 'Verilerinize bağlı akıllı asistanlar'],
      ['Net ölçümler ve paneller', 'Ziyaretçiyi talebe çeviren akışlar', 'Tek seferlik çözüm yerine kalıcı sistemler'],
    ],
    mock: { trigger: 'Tetikleyici', action: 'Eylem', done: 'Tamam', you: 'Merhaba, nasıl yardımcı olabilirim?', bot: 'Randevunuz oluşturuldu.', visitors: 'Ziyaretçi', leads: 'Talep' },
    ctaTitle: 'Ücretsiz yazılı değerlendirme',
    ctaSub: 'İhtiyacınızı anlatın, size özel çözüm listesini hazırlayıp göndereyim — toplantıya gerek yok.',
    ctaBtn: 'Talebinizi gönderin',
  },
  el: {
    intro: 'Τέσσερα βήματα που μεταφέρουν την επιχείρησή σας από την πρώτη ιδέα σε ένα σύστημα που λειτουργεί, πουλά και αναπτύσσεται μόνο του.',
    bullets: [
      ['Χαρτογράφηση διαδικασιών και εντοπισμός σημείων καθυστέρησης', 'Συνδεδεμένες ροές εργασίας ανάμεσα στα εργαλεία σας', 'Αυτόματες αναφορές και υπενθυμίσεις'],
      ['Γρήγορες, σύγχρονες ιστοσελίδες και εφαρμογές ιστού', 'Καθαρός σχεδιασμός με στόχο τη μετατροπή', 'Φιλοξενία, όνομα τομέα και συντήρηση περιλαμβάνονται'],
      ['Βοηθοί συνομιλίας που απαντούν στη γλώσσα των πελατών σας', 'Εργαλεία για περιεχόμενο και έγγραφα', 'Έξυπνοι βοηθοί συνδεδεμένοι με τα δεδομένα σας'],
      ['Σαφείς μετρήσεις και πίνακες ελέγχου', 'Ροές που μετατρέπουν επισκέπτες σε αιτήματα', 'Διαρκή συστήματα αντί για μεμονωμένες λύσεις'],
    ],
    mock: { trigger: 'Έναυσμα', action: 'Ενέργεια', done: 'Έτοιμο', you: 'Γεια σας, πώς μπορώ να βοηθήσω;', bot: 'Το ραντεβού σας κλείστηκε.', visitors: 'Επισκέπτες', leads: 'Αιτήματα' },
    ctaTitle: 'Δωρεάν γραπτή αξιολόγηση',
    ctaSub: 'Περιγράψτε τι χρειάζεστε και θα λάβετε μια εξατομικευμένη λίστα λύσεων — χωρίς συνάντηση.',
    ctaBtn: 'Στείλτε το αίτημά σας',
  },
} satisfies Record<Lang, unknown>;
