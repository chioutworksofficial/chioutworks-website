import type { Lang } from '../../../translations.js';

// Names, card descriptions and "what this system does" bullets for the demos added
// after the first batch. The first batch lives in translations.ts → T[lang].demos.items/features.
type Entry = { name: string; desc: string; features: string[] };
type Slug = 'demoemlak' | 'demokafe' | 'demokariyer' | 'demolojistik';

export const CATALOG_UI: Record<Lang, Record<Slug, Entry>> = {
  en: {
    demoemlak: {
      name: 'Real Estate Agency',
      desc: 'Listings, free valuation, search requests and forms that land straight in your inbox.',
      features: ['Property pages with photos, key facts and an enquiry form', 'Free valuation request in a few steps', 'Search requests: buy/rent, type, size, rooms, area and budget', 'Every enquiry lands in your own inbox, with no third-party form service'],
    },
    demokafe: {
      name: 'Café & Bakery',
      desc: 'Table booking, pre-orders for cakes and pastries, a searchable menu and event info.',
      features: ['Table booking with time slots and party size', 'Pre-order cakes and pastries for pick-up', 'Searchable menu with categories and allergens', 'Events and private parties with an enquiry form'],
    },
    demokariyer: {
      name: 'Multi-branch Careers Page',
      desc: 'Filterable job ads, branch pages and quick applications without a cover letter.',
      features: ['Job ads filterable by branch, area and contract type', 'A page per branch with address, map link and opening hours', 'Apply in two minutes, no cover letter needed', 'Job data Google can read (better visibility in Google for Jobs)'],
    },
    demolojistik: {
      name: 'Logistics Company Website',
      desc: 'Services, locations, careers with CV upload and a quote request form.',
      features: ['Clear service pages for each business area', 'Locations with contact person and opening hours', 'Careers with CV upload', 'Quote request form that goes straight to your team'],
    },
  },
  de: {
    demoemlak: {
      name: 'Immobilienmakler',
      desc: 'Objektseiten, kostenlose Wertermittlung, Suchaufträge und Formulare direkt in Ihr Postfach.',
      features: ['Objektseiten mit Bildern, Eckdaten und Anfrageformular', 'Kostenlose Wertermittlung in wenigen Schritten', 'Suchaufträge: Kauf/Miete, Objektart, Fläche, Zimmer, Lage und Budget', 'Jede Anfrage landet in Ihrem eigenen Postfach – ohne fremden Formulardienst'],
    },
    demokafe: {
      name: 'Café & Konditorei',
      desc: 'Tischreservierung, Vorbestellung von Torten und Gebäck, durchsuchbare Speisekarte und Veranstaltungen.',
      features: ['Tischreservierung mit Zeitfenstern und Personenzahl', 'Torten und Gebäck zur Abholung vorbestellen', 'Durchsuchbare Speisekarte mit Kategorien und Allergenen', 'Veranstaltungen und Feiern mit Anfrageformular'],
    },
    demokariyer: {
      name: 'Karriereseite für Filialbetriebe',
      desc: 'Filterbare Stellenanzeigen, Filialseiten und Bewerbung ohne Anschreiben.',
      features: ['Stellenanzeigen nach Filiale, Bereich und Anstellungsart filtern', 'Eine Seite pro Filiale mit Adresse, Kartenlink und Öffnungszeiten', 'Bewerbung in zwei Minuten, ohne Anschreiben', 'Stellendaten, die Google lesen kann (bessere Sichtbarkeit in der Google-Jobsuche)'],
    },
    demolojistik: {
      name: 'Website für Logistikunternehmen',
      desc: 'Leistungen, Standorte, Karriere mit Lebenslauf als Datei und Angebotsanfrage.',
      features: ['Übersichtliche Leistungsseiten für jeden Geschäftsbereich', 'Standorte mit Ansprechpartner und Öffnungszeiten', 'Karriere mit Lebenslauf als Datei', 'Angebotsanfrage, die direkt bei Ihrem Team ankommt'],
    },
  },
  tr: {
    demoemlak: {
      name: 'Emlak Ofisi',
      desc: 'İlanlar, ücretsiz değerleme, arama talebi ve doğrudan gelen kutunuza düşen formlar.',
      features: ['Fotoğraflı, temel bilgili ve talep formlu ilan sayfaları', 'Birkaç adımda ücretsiz değerleme talebi', 'Arama talebi: satılık/kiralık, tür, metrekare, oda, semt ve bütçe', 'Her talep, harici form hizmeti olmadan doğrudan kendi e-postanıza gelir'],
    },
    demokafe: {
      name: 'Kafe & Pastane',
      desc: 'Masa rezervasyonu, pasta ve tatlı ön siparişi, aramalı menü ve etkinlik bilgisi.',
      features: ['Saat aralıklı ve kişi sayılı masa rezervasyonu', 'Gel-al için pasta, baklava ve tatlı ön siparişi', 'Kategorili ve alerjen bilgili, aramalı menü', 'Etkinlik ve özel kutlamalar için talep formu'],
    },
    demokariyer: {
      name: 'Çok Şubeli Kariyer Sayfası',
      desc: 'Filtreli iş ilanları, şube sayfaları ve ön yazısız hızlı başvuru.',
      features: ['Şubeye, alana ve çalışma şekline göre filtrelenen ilanlar', 'Her şube için adres, harita bağlantısı ve çalışma saatleri', 'Ön yazı gerektirmeyen iki dakikalık başvuru', 'Google’ın okuyabildiği ilan verisi (Google iş aramasında daha görünür)'],
    },
    demolojistik: {
      name: 'Lojistik Firması Sitesi',
      desc: 'Hizmetler, lokasyonlar, dosya yüklemeli kariyer başvurusu ve teklif formu.',
      features: ['Her iş alanı için anlaşılır hizmet sayfaları', 'Yetkili kişi ve çalışma saatleriyle lokasyonlar', 'Özgeçmiş yüklemeli kariyer başvurusu', 'Doğrudan ekibinize ulaşan teklif talep formu'],
    },
  },
  el: {
    demoemlak: {
      name: 'Μεσιτικό Γραφείο',
      desc: 'Αγγελίες ακινήτων, δωρεάν εκτίμηση, αιτήματα αναζήτησης και φόρμες απευθείας στο ταχυδρομείο σας.',
      features: ['Σελίδες ακινήτων με φωτογραφίες, βασικά στοιχεία και φόρμα ενδιαφέροντος', 'Δωρεάν εκτίμηση σε λίγα βήματα', 'Αιτήματα αναζήτησης: αγορά/ενοικίαση, τύπος, εμβαδόν, δωμάτια, περιοχή και προϋπολογισμός', 'Κάθε αίτημα φτάνει στο δικό σας ταχυδρομείο, χωρίς εξωτερική υπηρεσία φορμών'],
    },
    demokafe: {
      name: 'Καφέ & Ζαχαροπλαστείο',
      desc: 'Κράτηση τραπεζιού, προπαραγγελία γλυκών, μενού με αναζήτηση και πληροφορίες εκδηλώσεων.',
      features: ['Κράτηση τραπεζιού με χρονικά διαστήματα και αριθμό ατόμων', 'Προπαραγγελία τούρτας και γλυκών για παραλαβή', 'Μενού με αναζήτηση, κατηγορίες και αλλεργιογόνα', 'Εκδηλώσεις και ιδιωτικά πάρτι με φόρμα αιτήματος'],
    },
    demokariyer: {
      name: 'Σελίδα Καριέρας για Πολλά Καταστήματα',
      desc: 'Αγγελίες εργασίας με φίλτρα, σελίδες καταστημάτων και γρήγορη αίτηση χωρίς συνοδευτική επιστολή.',
      features: ['Αγγελίες με φίλτρα ανά κατάστημα, τομέα και τύπο απασχόλησης', 'Σελίδα για κάθε κατάστημα με διεύθυνση, χάρτη και ωράριο', 'Αίτηση σε δύο λεπτά, χωρίς συνοδευτική επιστολή', 'Στοιχεία αγγελιών που διαβάζει η Google (καλύτερη προβολή στην αναζήτηση εργασίας)'],
    },
    demolojistik: {
      name: 'Ιστοσελίδα Εταιρείας Μεταφορών',
      desc: 'Υπηρεσίες, τοποθεσίες, αιτήσεις εργασίας με επισύναψη βιογραφικού και φόρμα προσφοράς.',
      features: ['Σαφείς σελίδες υπηρεσιών για κάθε τομέα', 'Τοποθεσίες με υπεύθυνο επικοινωνίας και ωράριο', 'Αιτήσεις εργασίας με επισύναψη βιογραφικού', 'Φόρμα αιτήματος προσφοράς που φτάνει απευθείας στην ομάδα σας'],
    },
  },
};
