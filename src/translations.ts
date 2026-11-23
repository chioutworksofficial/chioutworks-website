import { DEMO_ITEMS } from './translationsDemoItems.js';
import { NAV, FOOTER_LEGAL } from './site/navLabels.js';
export type Lang = 'tr' | 'en' | 'de' | 'el';

export const T = {
  en: {
    nav: NAV.en,
    navCta: 'Get in Touch',
    hero: {
      tag: 'Tech Entrepreneur · Automation & AI · Kelsterbach, Germany',
      h1a: 'Chioutworks helps your business',
      h1b: 'run faster and smarter.',
      sub: 'I transform time-consuming processes into automated, scalable systems. Web development, AI integration, and digital strategy — all built for growth.',
      btn1: 'Work with Me',
      btn2: 'View Portfolio',
      typeWords: ['Automation', 'AI Integration', 'Web Development', 'Digital Strategy'],
      linkedin: 'LinkedIn Profile',
    },
    stats: [
      ['11+', 'Years in Germany'],
      ['2023', 'Business Founded'],
      ['5+', 'Languages Spoken'],
      ['6', 'Core Services'],
    ] as [string, string][],
    platform: {
      eyebrow: 'What makes me different',
      title: 'A smarter way to grow your business',
      desc: 'Chioutworks is your technical partner for automation, modern digital products, and AI-powered growth — delivered with precision and care.',
      cards: [
        { title: 'Smart Automation', desc: 'Automate repetitive workflows and reclaim your time for what matters most.' },
        { title: 'Close Collaboration', desc: 'I work directly with you — understanding your business before writing a single line of code.' },
        { title: 'Future-proof Tech', desc: 'Every solution integrates with your tools and scales as your business grows.' },
        { title: 'Web Design', desc: 'Clean, fast, and conversion-focused websites — from landing pages to full web apps, built to impress.' },
      ],
    },
    guide: {
      eyebrow: 'A complete service guide',
      title: 'From idea to execution — step by step',
      chapters: [
        { num: '01', title: 'How To Automate', desc: 'Map your processes, identify bottlenecks, and deploy automated solutions that save hours every day.', tag: 'Automation' },
        { num: '02', title: 'How To Build', desc: 'Design and develop fast, modern web applications and digital products your customers will love.', tag: 'Development' },
        { num: '03', title: 'How To Integrate AI', desc: 'Add AI-powered features to your business — chatbots, content tools, smart assistants, and more.', tag: 'AI & Integration' },
        { num: '04', title: 'How To Scale', desc: 'Leverage data and digital strategy to grow your reach, convert more leads, and build lasting systems.', tag: 'Growth Strategy' },
      ],
    },
    features: [
      {
        eyebrow: 'Automation',
        title: 'Turn hours into minutes',
        desc: 'Map your existing workflows, identify the time-drains, and deploy automated solutions. From CRM automation to document processing — I build systems that work while you sleep.',
        items: ['CRM & sales automation', 'Document processing', 'Scheduled reporting', 'Multi-platform sync'],
      },
      {
        eyebrow: 'Web Development',
        title: 'Modern digital products, built fast',
        desc: 'Clean, performant web applications built with the latest tech stack. From landing pages to full SaaS products — delivered on time and built to last.',
        items: ['React & Next.js apps', 'API development', 'E-commerce stores', 'Custom dashboards'],
      },
      {
        eyebrow: 'AI Integration',
        title: 'AI that works for your business',
        desc: 'Integrate powerful AI capabilities into your existing workflows. Customer support bots, content generation, data analysis — practical AI that delivers real ROI.',
        items: ['AI chatbots & assistants', 'Content automation', 'Smart data extraction', 'LLM integrations'],
      },
      {
        eyebrow: 'Digital Strategy',
        title: 'Grow with data-driven decisions',
        desc: 'Analytics dashboards, growth tracking, and strategic consulting. Understand your customers, measure what works, and double down on your wins.',
        items: ['KPI dashboards', 'SEO & content strategy', 'Growth experiments', 'Competitor analysis'],
      },
    ],
    usecases: {
      eyebrow: 'Industries & Use Cases',
      title: 'Built for businesses of all kinds',
      tags: ['E-commerce', 'Restaurants', 'Real Estate', 'Healthcare', 'Legal Firms', 'SaaS Startups', 'Consulting', 'Marketing Agencies', 'Logistics', 'Education', 'Finance', 'Retail', 'HR & Recruiting', 'Creative Studios'],
    },
    ui: {
      footerCta: 'Ready to start your next project?',
      footerBook: 'Book an appointment',
      footerBlurb: 'Automation, AI integration & modern web development — for businesses that want to grow smarter.',
      footerServicesTitle: 'Services',
      footerServices: ['Automation', 'Web Development', 'AI Integration', 'Digital Strategy'],
      footerCompany: 'Company',
      footerLocation: 'Location',
      footerCountry: 'Germany 🇩🇪',
      footerAvailable: 'Available for work',
      startProject: 'Start a project',
      systemRunning: 'System running',
      active: 'Active',
      systemName: 'Chioutworks System',
      live: 'Live',
      viewPortfolio: 'View portfolio',
      blogHint: 'Click any article to read in full',
      blogLocation: 'Kelsterbach, Germany',
      workWithMe: 'Work with me',
      close: 'Close',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
    },
    demos: {
      "builder": {
        "title": "Build this system for your business",
        "sub": "Pick the modules you need and get a tailored quote. No obligation.",
        "whatsIncluded": "What this system does",
        "modulesTitle": "Modules",
        "recommended": "Recommended",
        "included": "Included",
        "runningCost": "Running cost",
        "costTypes": {
          "none": "No extra running cost",
          "usage": "Pay per use",
          "message": "Per message (provider fee)",
          "transaction": "Fee per transaction",
          "monthly": "Small monthly fee"
        },
        "summaryTitle": "Your package",
        "selectedCount": "{n} modules selected",
        "costNote": "Setup is quoted once, after a free call. Running costs depend on usage and are paid to the providers (e.g. Meta, payments, AI). You get a clear estimate with your quote.",
        "email": "Email",
        "name": "Name",
        "business": "Business name",
        "message": "Anything specific? (optional)",
        "send": "Request my quote",
        "sending": "Sending…",
        "sent": "Thank you! Your request has been received. You’ll hear back within 24 hours.",
        "modules": {
          "core": {
            "name": "Core system",
            "desc": "Admin panel, customer records, mobile-friendly, with your logo and colours."
          },
          "qr": {
            "name": "QR code",
            "desc": "Printable QR for your window, counter or flyer: opens your booking or customer page instantly."
          },
          "whatsapp": {
            "name": "WhatsApp notifications",
            "desc": "Automatic confirmations and reminders via the WhatsApp Business API."
          },
          "telegram": {
            "name": "Telegram bot",
            "desc": "Instant alerts to you and your team for new bookings and leads."
          },
          "ai": {
            "name": "AI assistant",
            "desc": "Answers questions and takes bookings 24/7 by chat or voice, in your customers’ language."
          },
          "payments": {
            "name": "Online payments",
            "desc": "Deposits and card payments via Stripe, PayPal or Apple Pay."
          },
          "calendar": {
            "name": "Calendar sync",
            "desc": "Two-way sync with Google or Outlook calendar."
          },
          "reviews": {
            "name": "Google reviews",
            "desc": "Automatically asks happy customers for a Google review."
          },
          "hosting": {
            "name": "Domain & hosting",
            "desc": "Your own domain, SSL, daily backups and updates."
          }
        }
      },
      features: DEMO_ITEMS.en.features,
      "share": {
        "title": "Share & connect",
        "qr": "Scan to open this demo on your phone",
        "whatsapp": "WhatsApp",
        "telegram": "Telegram",
        "copy": "Copy link",
        "copied": "Link copied",
        "text": "{name}: live demo by Chioutworks"
      },
      "extras": {
        "remind": "WhatsApp reminder",
        "remindText": "Hi {name}, a quick reminder of your {service} appointment today at {time}. See you soon!",
        "cardQr": "Card QR",
        "cardQrHint": "Customer scans this to see their stamp card.",
        "aiReply": "AI reply suggestion",
        "aiLabel": "AI draft (example)",
        "aiReplyText": "Hi {name}, thank you for your message! I’d be happy to prepare an offer for you. When would a short 10-minute call suit you this week?",
        "openWhatsapp": "Open in WhatsApp"
      },
      "tag": "Ready-to-use app demos",
      "title": "See it working before you decide.",
      "sub": "Ready-made industry apps I can tailor to your business. Six of them run live: try them right in your browser with a 24-hour access code.",
      "liveTitle": "Live demos",
      "liveBadge": "Live demo",
      "previewTitle": "More apps",
      "previewSub": "Preview the screens. Each one can be built for your business.",
      "previewBadge": "Preview",
      "openLive": "Open live demo",
      "viewShots": "Screens",
      "custom": "Can be customised for each person and business; new features can be added.",
      "accessActive": "Access active · {time} left",
      "close": "Close",
      "prev": "Previous",
      "next": "Next",
      items: DEMO_ITEMS.en.items,
      "modal": {
        "title": "Get your demo access code",
        "sub": "Enter your email and I’ll send you a 6-digit code. It’s valid for 24 hours and unlocks all live demos.",
        "email": "Email",
        "name": "Name",
        "phone": "Phone",
        "optional": "optional",
        "submit": "Send my code",
        "sending": "Sending…",
        "codeTitle": "Enter your code",
        "codeSub": "I sent a 6-digit code to {email}.",
        "simNote": "Demo mode: email sending is simulated. Your code:",
        "codeLabel": "6-digit code",
        "verify": "Unlock demo",
        "verifying": "Checking…",
        "changeEmail": "Use a different email",
        "validUntil": "Valid until {date}",
        "privacy": "I only use your email to send the code and follow up about the demo.",
        "errors": {
          "invalid_email": "Please enter a valid email address.",
          "invalid_code": "This code is not valid.",
          "expired": "This code has expired. Request a new one.",
          "rate_limited": "Too many attempts. Please wait a few minutes.",
          "server": "Something went wrong. Please try again."
        }
      },
      "app": {
        "back": "Back to all demos",
        "remaining": "{time} left",
        "demoNote": "This is a demo. Data is sample data and resets when you reload.",
        "ctaTitle": "Want this for your business?",
        "ctaSub": "Your name, colours, services and workflow, plus any features you need.",
        "ctaBtn": "Talk to me",
        "notFound": "This demo does not exist.",
        "home": "Go to homepage",
        "lockedTitle": "This demo is locked",
        "lockedSub": "Get a free 24-hour access code to open it.",
        "unlock": "Get access code",
        "add": "Add",
        "save": "Save",
        "cancel": "Cancel",
        "search": "Search…",
        "total": "Total",
        "saved": "Saved",
        "kuafor": {
          "title": "Salon dashboard",
          "today": "Today’s appointments",
          "revenue": "Expected revenue",
          "free": "Free slots",
          "newAppt": "New appointment",
          "customer": "Customer",
          "service": "Service",
          "stylist": "Stylist",
          "time": "Time",
          "services": [
            "Haircut",
            "Beard trim",
            "Colour",
            "Blow-dry"
          ],
          "slotTaken": "This slot is already booked.",
          "emailSent": "Appointment saved, e-mail reminder scheduled.",
          "booked": "booked"
        },
        "klinik": {
          "title": "Clinic panel",
          "patients": "Patients",
          "queue": "Today’s queue",
          "newPatient": "New patient",
          "name": "Full name",
          "age": "Age",
          "complaint": "Reason for visit",
          "lastVisit": "Last visit",
          "notes": "Visit notes",
          "statuses": [
            "Waiting",
            "In treatment",
            "Done"
          ],
          "select": "Select a patient to see details.",
          "addToQueue": "Add to today’s queue",
          "inQueue": "In queue"
        },
        "temizlik": {
          "title": "Bookings & pricing",
          "calc": "Instant price",
          "area": "Area (m²)",
          "rooms": "Rooms",
          "type": "Cleaning type",
          "types": [
            "Standard",
            "Deep clean",
            "Move-out"
          ],
          "extras": "Extras",
          "extraList": [
            "Windows",
            "Fridge",
            "Oven"
          ],
          "price": "Estimated price",
          "book": "Create booking",
          "date": "Date",
          "bookings": "Bookings",
          "team": "Team",
          "teams": [
            "Team A",
            "Team B",
            "Team C"
          ],
          "customer": "Customer"
        },
        "sadakat": {
          "title": "Loyalty cards",
          "customers": "Customers",
          "stamp": "+1 stamp",
          "reward": "Free coffee",
          "redeem": "Redeem reward",
          "rewardReady": "Reward ready!",
          "newCustomer": "New customer",
          "phone": "Phone",
          "name": "Name",
          "stampsGiven": "Stamps today",
          "rewardsRedeemed": "Rewards redeemed",
          "activeCards": "Active cards",
          "redeemed": "Reward redeemed, card reset."
        },
        "crm": {
          "title": "Sales pipeline",
          "stages": [
            "New",
            "Contacted",
            "Offer sent",
            "Won"
          ],
          "newLead": "New lead",
          "company": "Name / company",
          "value": "Deal value",
          "source": "Source",
          "sources": [
            "Instagram",
            "WhatsApp",
            "Website"
          ],
          "pipeline": "Open pipeline",
          "won": "Won",
          "conversion": "Conversion",
          "moveNext": "Next stage",
          "movePrev": "Back"
        }
      }
    },
    ctaSection: {
      title: 'Ready to transform your business?',
      sub: "Tell me what you need — I'll send you a tailored list of solutions in writing, free of charge.",
      btn: 'Get in Touch',
    },
    footer: {
      colLinks: [
        { label: 'Services', href: '#services' },
        { label: 'About', href: '#about' },
        { label: 'Portfolio', href: '#portfolio' },
        { label: 'Contact', href: '#contact' },
      ],
      legal: FOOTER_LEGAL.en,
      copy: '© 2026 Chioutworks · Chousein Chiout',
      soc2: 'Available for work · SOC 2 compliant infrastructure',
    },
  },
  de: {
    nav: NAV.de,
    navCta: 'Kontakt aufnehmen',
    hero: {
      tag: 'Technologie-Unternehmer · Automatisierung & KI · Kelsterbach, Deutschland',
      h1a: 'Chioutworks hilft Ihrem Unternehmen,',
      h1b: 'schneller und klüger zu werden.',
      sub: 'Ich verwandle zeitaufwändige Prozesse in automatisierte, skalierbare Systeme. Webentwicklung, KI-Integration und digitale Strategie — alles für Ihr Wachstum.',
      btn1: 'Zusammenarbeiten',
      btn2: 'Portfolio ansehen',
      typeWords: ['Automatisierung', 'KI-Integration', 'Webentwicklung', 'Digitalstrategie'],
      linkedin: 'LinkedIn Profil',
    },
    stats: [
      ['11+', 'Jahre in Deutschland'],
      ['2023', 'Unternehmen gegr.'],
      ['5+', 'Sprachen'],
      ['6', 'Kernleistungen'],
    ] as [string, string][],
    platform: {
      eyebrow: 'Was mich auszeichnet',
      title: 'Ein besserer Weg, Ihr Unternehmen zu führen',
      desc: 'Chioutworks ist Ihr technischer Partner für Automatisierung, moderne Webprodukte und KI-gestützte Wachstumsstrategien — präzise und mit Sorgfalt umgesetzt.',
      cards: [
        { title: 'Intelligente Automatisierung', desc: 'Ersetzen Sie wiederkehrende Aufgaben durch intelligente Arbeitsabläufe, die rund um die Uhr laufen.' },
        { title: 'Enge Zusammenarbeit', desc: 'Ich arbeite direkt mit Ihnen — ich verstehe Ihr Unternehmen, bevor ich eine Zeile Code schreibe.' },
        { title: 'Zukunftssichere Technik', desc: 'Jede Lösung integriert sich in Ihre bestehenden Werkzeuge und wächst mit Ihrem Unternehmen.' },
        { title: 'Webgestaltung', desc: 'Saubere, schnelle und verkaufsstarke Websites — von Zielseiten bis zu vollständigen Web-Anwendungen.' },
      ],
    },
    guide: {
      eyebrow: 'Ein vollständiger Leitfaden',
      title: 'Von der Idee zur Umsetzung — Schritt für Schritt',
      chapters: [
        { num: '01', title: 'Wie man automatisiert', desc: 'Prozesse analysieren, Engpässe identifizieren und automatisierte Lösungen einsetzen, die täglich Stunden sparen.', tag: 'Automatisierung' },
        { num: '02', title: 'Wie man baut', desc: 'Schnelle, moderne Webanwendungen und digitale Produkte entwickeln, die Ihre Kunden lieben werden.', tag: 'Entwicklung' },
        { num: '03', title: 'KI integrieren', desc: 'KI-gestützte Funktionen in Ihr Unternehmen integrieren — KI-Assistenten, Werkzeuge für Inhalte, intelligente Helfer.', tag: 'KI & Integration' },
        { num: '04', title: 'Wie man skaliert', desc: 'Daten und digitale Strategie nutzen, um Reichweite zu erhöhen und Interessenten in Kunden zu verwandeln.', tag: 'Wachstumsstrategie' },
      ],
    },
    features: [
      {
        eyebrow: 'Automatisierung',
        title: 'Stunden in Minuten verwandeln',
        desc: 'Arbeitsabläufe analysieren, Zeitfresser identifizieren und automatisierte Lösungen einsetzen. Von CRM-Automatisierung bis Dokumentenverarbeitung — Systeme, die für Sie arbeiten.',
        items: ['CRM & Vertriebsautomatisierung', 'Dokumentenverarbeitung', 'Automatisierte Berichte', 'Plattformübergreifender Abgleich'],
      },
      {
        eyebrow: 'Webentwicklung',
        title: 'Moderne digitale Produkte, schnell gebaut',
        desc: 'Saubere, performante Webanwendungen mit dem neuesten Technologien. Von Zielseiten bis zu vollständigen SaaS-Produkten — pünktlich geliefert.',
        items: ['React & Next.js Anwendungen', 'API-Entwicklung', 'Onlineshops', 'Individuelle Kennzahlen-Übersichten'],
      },
      {
        eyebrow: 'KI-Integration',
        title: 'KI, die für Ihr Unternehmen arbeitet',
        desc: 'Leistungsstarke KI-Funktionen in bestehende Arbeitsabläufe integrieren. Kundensupport-Assistenten, Inhaltserstellung, Datenanalyse — praxisnahe KI mit echtem ROI.',
        items: ['KI-Assistenten & digitale Helfer', 'Automatisierte Inhaltserstellung', 'Intelligente Datenextraktion', 'LLM-Integrationen'],
      },
      {
        eyebrow: 'Digitalstrategie',
        title: 'Mit datengestützten Entscheidungen wachsen',
        desc: 'Auswertungs-Übersichten, Wachstumsverfolgung und strategische Beratung. Kunden verstehen, messen was funktioniert und auf Erfolge setzen.',
        items: ['KPI-Übersichten', 'SEO & Inhaltsstrategie', 'Wachstumsexperimente', 'Wettbewerbsanalyse'],
      },
    ],
    usecases: {
      eyebrow: 'Branchen & Anwendungsfälle',
      title: 'Für Unternehmen jeder Art gebaut',
      tags: ['Onlinehandel', 'Gastronomie', 'Immobilien', 'Gesundheitswesen', 'Kanzleien', 'SaaS-Jungunternehmen', 'Beratung', 'Marketingagenturen', 'Logistik', 'Bildung', 'Finanzen', 'Einzelhandel', 'HR & Personalgewinnung', 'Kreativstudios'],
    },
    ui: {
      footerCta: 'Bereit für Ihr nächstes Projekt?',
      footerBook: 'Termin buchen',
      footerBlurb: 'Automatisierung, KI-Integration & moderne Webentwicklung — für Unternehmen, die klüger wachsen wollen.',
      footerServicesTitle: 'Leistungen',
      footerServices: ['Automatisierung', 'Webentwicklung', 'KI-Integration', 'Digitalstrategie'],
      footerCompany: 'Unternehmen',
      footerLocation: 'Standort',
      footerCountry: 'Deutschland 🇩🇪',
      footerAvailable: 'Verfügbar für Projekte',
      startProject: 'Projekt starten',
      systemRunning: 'System läuft',
      active: 'Aktiv',
      systemName: 'Chioutworks-System',
      live: 'Online',
      viewPortfolio: 'Portfolio ansehen',
      blogHint: 'Artikel anklicken, um ihn vollständig zu lesen',
      blogLocation: 'Kelsterbach, Deutschland',
      workWithMe: 'Zusammenarbeiten',
      close: 'Schließen',
      prevMonth: 'Vorheriger Monat',
      nextMonth: 'Nächster Monat',
    },
    demos: {
      "builder": {
        "title": "Dieses System für Ihr Unternehmen",
        "sub": "Wählen Sie die Module, die Sie brauchen, und erhalten Sie ein individuelles Angebot. Unverbindlich.",
        "whatsIncluded": "Was dieses System kann",
        "modulesTitle": "Module",
        "recommended": "Empfohlen",
        "included": "Inklusive",
        "runningCost": "Laufende Kosten",
        "costTypes": {
          "none": "Keine zusätzlichen laufenden Kosten",
          "usage": "Nach Nutzung",
          "message": "Pro Nachricht (Anbietergebühr)",
          "transaction": "Gebühr pro Transaktion",
          "monthly": "Kleine Monatsgebühr"
        },
        "summaryTitle": "Ihr Paket",
        "selectedCount": "{n} Module ausgewählt",
        "costNote": "Die Einrichtung wird nach einem kostenlosen Gespräch einmalig angeboten. Laufende Kosten hängen von der Nutzung ab und gehen an die Anbieter (z. B. Meta, Zahlungen, KI). Mit dem Angebot erhalten Sie eine klare Schätzung.",
        "email": "E-Mail",
        "name": "Name",
        "business": "Firmenname",
        "message": "Besondere Wünsche? (optional)",
        "send": "Angebot anfordern",
        "sending": "Wird gesendet…",
        "sent": "Vielen Dank! Ihre Anfrage ist eingegangen. Sie erhalten innerhalb von 24 Stunden eine Antwort.",
        "modules": {
          "core": {
            "name": "Basissystem",
            "desc": "Verwaltungsbereich, Kundendaten, mobilfreundlich, mit Ihrem Logo und Ihren Farben."
          },
          "qr": {
            "name": "QR-Code",
            "desc": "Druckbarer QR-Code für Schaufenster, Theke oder Flyer: öffnet sofort Ihre Buchungs- oder Kundenseite."
          },
          "whatsapp": {
            "name": "WhatsApp-Benachrichtigungen",
            "desc": "Automatische Bestätigungen und Erinnerungen über die WhatsApp Business API."
          },
          "telegram": {
            "name": "Telegram-Bot",
            "desc": "Sofortige Meldungen an Sie und Ihr Team bei neuen Buchungen und Interessenten."
          },
          "ai": {
            "name": "KI-Assistent",
            "desc": "Beantwortet Fragen und nimmt rund um die Uhr Buchungen an, per Chat oder Sprache, in der Sprache Ihrer Kunden."
          },
          "payments": {
            "name": "Online-Zahlungen",
            "desc": "Anzahlungen und Kartenzahlungen über Stripe, PayPal oder Apple Pay."
          },
          "calendar": {
            "name": "Kalenderabgleich",
            "desc": "Zwei-Wege-Synchronisation mit Google- oder Outlook-Kalender."
          },
          "reviews": {
            "name": "Google-Bewertungen",
            "desc": "Bittet zufriedene Kunden automatisch um eine Google-Bewertung."
          },
          "hosting": {
            "name": "Domain & Betrieb",
            "desc": "Eigene Domain, SSL, tägliche Datensicherung und Aktualisierungen."
          }
        }
      },
      features: DEMO_ITEMS.de.features,
      "share": {
        "title": "Teilen & verbinden",
        "qr": "Scannen, um diese Demo auf dem Handy zu öffnen",
        "whatsapp": "WhatsApp",
        "telegram": "Telegram",
        "copy": "Link kopieren",
        "copied": "Link kopiert",
        "text": "{name}: Demo von Chioutworks"
      },
      "extras": {
        "remind": "WhatsApp-Erinnerung",
        "remindText": "Hallo {name}, kurze Erinnerung an Ihren Termin ({service}) heute um {time} Uhr. Bis gleich!",
        "cardQr": "Karten-QR",
        "cardQrHint": "Der Kunde scannt diesen Code und sieht seine Stempelkarte.",
        "aiReply": "KI-Antwortvorschlag",
        "aiLabel": "KI-Entwurf (Beispiel)",
        "aiReplyText": "Hallo {name}, vielen Dank für Ihre Nachricht! Gerne erstelle ich Ihnen ein Angebot. Wann passt Ihnen diese Woche ein kurzes 10-Minuten-Gespräch?",
        "openWhatsapp": "In WhatsApp öffnen"
      },
      "tag": "Fertige App-Demos",
      "title": "Erst testen, dann entscheiden.",
      "sub": "Fertige Branchenlösungen, die ich für Ihr Unternehmen anpasse. Sechs davon laufen live: direkt im Browser testen – mit einem 24-Stunden-Zugangscode.",
      "liveTitle": "Live-Demos",
      "liveBadge": "Live-Demo",
      "previewTitle": "Weitere Apps",
      "previewSub": "Sehen Sie sich die Ansichten an. Jede App kann für Ihr Unternehmen gebaut werden.",
      "previewBadge": "Vorschau",
      "openLive": "Live-Demo öffnen",
      "viewShots": "Ansichten",
      "custom": "Individuell für jede Person und jedes Unternehmen anpassbar, neue Funktionen können ergänzt werden.",
      "accessActive": "Zugang aktiv · noch {time}",
      "close": "Schließen",
      "prev": "Zurück",
      "next": "Weiter",
      items: DEMO_ITEMS.de.items,
      "modal": {
        "title": "Ihren Demo-Zugangscode erhalten",
        "sub": "Geben Sie Ihre E-Mail ein und ich sende Ihnen einen 6-stelligen Code. Er ist 24 Stunden gültig und öffnet alle Live-Demos.",
        "email": "E-Mail",
        "name": "Name",
        "phone": "Telefon",
        "optional": "optional",
        "submit": "Code senden",
        "sending": "Wird gesendet…",
        "codeTitle": "Code eingeben",
        "codeSub": "Ich habe einen 6-stelligen Code an {email} gesendet.",
        "simNote": "Demo-Modus: Der E-Mail-Versand wird simuliert. Ihr Code:",
        "codeLabel": "6-stelliger Code",
        "verify": "Demo öffnen",
        "verifying": "Wird geprüft…",
        "changeEmail": "Andere E-Mail verwenden",
        "validUntil": "Gültig bis {date}",
        "privacy": "Ich verwende Ihre E-Mail nur, um den Code zu senden und mich zur Demo zu melden.",
        "errors": {
          "invalid_email": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
          "invalid_code": "Dieser Code ist ungültig.",
          "expired": "Dieser Code ist abgelaufen. Fordern Sie einen neuen an.",
          "rate_limited": "Zu viele Versuche. Bitte warten Sie einige Minuten.",
          "server": "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."
        }
      },
      "app": {
        "back": "Zurück zu allen Demos",
        "remaining": "noch {time}",
        "demoNote": "Dies ist eine Demo. Die Daten sind Beispieldaten und werden beim Neuladen zurückgesetzt.",
        "ctaTitle": "Möchten Sie das für Ihr Unternehmen?",
        "ctaSub": "Ihr Name, Ihre Farben, Leistungen und Abläufe – plus alle Funktionen, die Sie brauchen.",
        "ctaBtn": "Sprechen Sie mich an",
        "notFound": "Diese Demo existiert nicht.",
        "home": "Zur Startseite",
        "lockedTitle": "Diese Demo ist gesperrt",
        "lockedSub": "Holen Sie sich einen kostenlosen 24-Stunden-Zugangscode.",
        "unlock": "Zugangscode anfordern",
        "add": "Hinzufügen",
        "save": "Speichern",
        "cancel": "Abbrechen",
        "search": "Suchen…",
        "total": "Gesamt",
        "saved": "Gespeichert",
        "kuafor": {
          "title": "Salon-Übersicht",
          "today": "Termine heute",
          "revenue": "Erwarteter Umsatz",
          "free": "Freie Termine",
          "newAppt": "Neuer Termin",
          "customer": "Kunde",
          "service": "Leistung",
          "stylist": "Friseur",
          "time": "Uhrzeit",
          "services": [
            "Haarschnitt",
            "Bart",
            "Färben",
            "Föhnen"
          ],
          "slotTaken": "Dieser Termin ist bereits belegt.",
          "emailSent": "Termin gespeichert, E-Mail-Erinnerung geplant.",
          "booked": "belegt"
        },
        "klinik": {
          "title": "Praxisübersicht",
          "patients": "Patienten",
          "queue": "Warteschlange heute",
          "newPatient": "Neuer Patient",
          "name": "Vollständiger Name",
          "age": "Alter",
          "complaint": "Besuchsgrund",
          "lastVisit": "Letzter Besuch",
          "notes": "Behandlungsnotizen",
          "statuses": [
            "Wartet",
            "In Behandlung",
            "Fertig"
          ],
          "select": "Wählen Sie einen Patienten, um Details zu sehen.",
          "addToQueue": "Zur heutigen Warteschlange",
          "inQueue": "In der Warteschlange"
        },
        "temizlik": {
          "title": "Buchungen & Preise",
          "calc": "Sofortpreis",
          "area": "Fläche (m²)",
          "rooms": "Zimmer",
          "type": "Reinigungsart",
          "types": [
            "Standard",
            "Grundreinigung",
            "Umzugsreinigung"
          ],
          "extras": "Extras",
          "extraList": [
            "Fenster",
            "Kühlschrank",
            "Backofen"
          ],
          "price": "Geschätzter Preis",
          "book": "Buchung anlegen",
          "date": "Datum",
          "bookings": "Buchungen",
          "team": "Team",
          "teams": [
            "Team A",
            "Team B",
            "Team C"
          ],
          "customer": "Kunde"
        },
        "sadakat": {
          "title": "Treuekarten",
          "customers": "Kunden",
          "stamp": "+1 Stempel",
          "reward": "Gratis-Kaffee",
          "redeem": "Prämie einlösen",
          "rewardReady": "Prämie bereit!",
          "newCustomer": "Neuer Kunde",
          "phone": "Telefon",
          "name": "Name",
          "stampsGiven": "Stempel heute",
          "rewardsRedeemed": "Eingelöste Prämien",
          "activeCards": "Aktive Karten",
          "redeemed": "Prämie eingelöst, Karte zurückgesetzt."
        },
        "crm": {
          "title": "Vertriebsübersicht",
          "stages": [
            "Neu",
            "Kontaktiert",
            "Angebot gesendet",
            "Gewonnen"
          ],
          "newLead": "Neuer Interessent",
          "company": "Name / Firma",
          "value": "Auftragswert",
          "source": "Quelle",
          "sources": [
            "Instagram",
            "WhatsApp",
            "Webseite"
          ],
          "pipeline": "Offene Aufträge",
          "won": "Gewonnen",
          "conversion": "Abschlussquote",
          "moveNext": "Nächste Phase",
          "movePrev": "Zurück"
        }
      }
    },
    ctaSection: {
      title: 'Bereit, Ihr Unternehmen zu transformieren?',
      sub: 'Beschreiben Sie Ihr Anliegen – Sie erhalten kostenlos eine maßgeschneiderte, schriftliche Lösungsliste.',
      btn: 'Kontakt aufnehmen',
    },
    footer: {
      colLinks: [
        { label: 'Leistungen', href: '#services' },
        { label: 'Über mich', href: '#about' },
        { label: 'Portfolio', href: '#portfolio' },
        { label: 'Kontakt', href: '#contact' },
      ],
      legal: FOOTER_LEGAL.de,
      copy: '© 2026 Chioutworks · Chousein Chiout',
      soc2: 'Verfügbar für Projekte · SOC 2 konforme Infrastruktur',
    },
  },
  tr: {
    nav: NAV.tr,
    navCta: 'İletişime Geç',
    hero: {
      tag: 'Teknoloji Girişimcisi · Otomasyon & YZ · Kelsterbach, Almanya',
      h1a: 'Chioutworks işletmenizin',
      h1b: 'daha hızlı ve akıllı büyümesine yardımcı olur.',
      sub: 'Zaman alan süreçleri otomatize edilmiş, ölçeklenebilir sistemlere dönüştürüyorum. Web geliştirme, YZ entegrasyonu ve dijital strateji — büyümeniz için.',
      btn1: 'Benimle Çalışın',
      btn2: 'Portföyü Gör',
      typeWords: ['Otomasyon', 'YZ Entegrasyonu', 'Web Geliştirme', 'Dijital Strateji'],
      linkedin: 'LinkedIn Profili',
    },
    stats: [
      ['11+', 'Yıldır Almanya\'da'],
      ['2023', 'Şirket Kuruluşu'],
      ['5+', 'Konuşulan Dil'],
      ['6', 'Temel Hizmet'],
    ] as [string, string][],
    platform: {
      eyebrow: 'Beni farklı kılan nedir',
      title: 'İşletmenizi büyütmenin daha akıllı yolu',
      desc: 'Chioutworks, otomasyon, modern dijital ürünler ve YZ destekli büyüme için teknik ortağınız — hassasiyet ve özenle teslim edilir.',
      cards: [
        { title: 'Akıllı Otomasyon', desc: 'Tekrarlayan görevleri 7/24 çalışan akıllı iş akışlarıyla değiştirin ve önemli şeylere odaklanın.' },
        { title: 'Yakın İşbirliği', desc: 'Tek bir satır kod yazmadan önce işletmenizi anlayarak doğrudan sizinle çalışıyorum.' },
        { title: 'Geleceğe Hazır Teknoloji', desc: 'Her çözüm mevcut araçlarınızla entegre olur ve işletmenizle birlikte büyür.' },
        { title: 'Web Sayfası Tasarımı', desc: 'Temiz, hızlı ve dönüşüm odaklı web siteleri — açılış sayfasından tam web uygulamasına, etkileyici şekilde inşa edilir.' },
      ],
    },
    guide: {
      eyebrow: 'Kapsamlı bir hizmet rehberi',
      title: 'Fikirden uygulamaya — adım adım',
      chapters: [
        { num: '01', title: 'Nasıl Otomatize Edilir', desc: 'Süreçleri haritalayın, darboğazları belirleyin ve günlük saatler tasarruf eden çözümler devreye alın.', tag: 'Otomasyon' },
        { num: '02', title: 'Nasıl İnşa Edilir', desc: 'Müşterilerinizin seveceği hızlı, modern web uygulamaları ve dijital ürünler tasarlayın.', tag: 'Geliştirme' },
        { num: '03', title: 'YZ Nasıl Entegre Edilir', desc: 'İşletmenize YZ destekli özellikler ekleyin — sohbet robotları, içerik araçları, akıllı asistanlar.', tag: 'YZ & Entegrasyon' },
        { num: '04', title: 'Nasıl Ölçeklenilir', desc: 'Erişiminizi artırmak ve daha fazla müşteri kazanmak için veri ve dijital stratejiyi kullanın.', tag: 'Büyüme Stratejisi' },
      ],
    },
    features: [
      {
        eyebrow: 'Otomasyon',
        title: 'Saatleri dakikalara dönüştürün',
        desc: 'Mevcut iş akışlarını haritalayın, zaman kaynaklarını belirleyin ve otomatik çözümler devreye alın. CRM otomasyonundan belge işlemeye kadar.',
        items: ['CRM & satış otomasyonu', 'Belge işleme', 'Zamanlanmış raporlama', 'Çoklu platform eşitleme'],
      },
      {
        eyebrow: 'Web Geliştirme',
        title: 'Modern dijital ürünler, hızlı inşa edildi',
        desc: 'Son teknoloji altyapısıyla temiz, performanslı web uygulamaları. Açılış sayfasından tam SaaS ürünlerine kadar — zamanında teslim edildi.',
        items: ['React & Next.js uygulamaları', 'API geliştirme', 'E-ticaret mağazaları', 'Özel yönetim panelleri'],
      },
      {
        eyebrow: 'YZ Entegrasyonu',
        title: 'İşletmeniz için çalışan YZ',
        desc: 'Güçlü YZ yeteneklerini mevcut iş akışlarınıza entegre edin. Müşteri destek robotları, içerik üretimi, veri analizi — gerçek ROI sağlayan pratik YZ.',
        items: ['YZ sohbet robotları & asistanlar', 'İçerik otomasyonu', 'Akıllı veri çıkarımı', 'LLM entegrasyonları'],
      },
      {
        eyebrow: 'Dijital Strateji',
        title: 'Veri odaklı kararlarla büyüyün',
        desc: 'Analitik gösterge panelleri, büyüme takibi ve stratejik danışmanlık. Müşterilerinizi anlayın, neyin işe yaradığını ölçün ve kazançlarınızı katlayın.',
        items: ['KPI gösterge panelleri', 'SEO & içerik stratejisi', 'Büyüme deneyleri', 'Rekabet analizi'],
      },
    ],
    usecases: {
      eyebrow: 'Sektörler & Kullanım Alanları',
      title: 'Her türlü işletme için inşa edildi',
      tags: ['E-ticaret', 'Restoranlar', 'Gayrimenkul', 'Sağlık', 'Hukuk Büroları', 'SaaS Girişimler', 'Danışmanlık', 'Pazarlama Ajansları', 'Lojistik', 'Eğitim', 'Finans', 'Perakende', 'İK & İşe Alım', 'Yaratıcı Stüdyolar'],
    },
    ui: {
      footerCta: 'Bir sonraki projenize başlamaya hazır mısınız?',
      footerBook: 'Randevu al',
      footerBlurb: 'Otomasyon, YZ entegrasyonu ve modern web geliştirme — daha akıllı büyümek isteyen işletmeler için.',
      footerServicesTitle: 'Hizmetler',
      footerServices: ['Otomasyon', 'Web Geliştirme', 'YZ Entegrasyonu', 'Dijital Strateji'],
      footerCompany: 'Kurumsal',
      footerLocation: 'Konum',
      footerCountry: 'Almanya 🇩🇪',
      footerAvailable: 'Çalışmaya hazır',
      startProject: 'Proje başlat',
      systemRunning: 'Sistem çalışıyor',
      active: 'Aktif',
      systemName: 'Chioutworks Sistemi',
      live: 'Yayında',
      viewPortfolio: 'Portföyü gör',
      blogHint: 'Makalenin tamamını okumak için tıklayın',
      blogLocation: 'Kelsterbach, Almanya',
      workWithMe: 'Benimle çalışın',
      close: 'Kapat',
      prevMonth: 'Önceki ay',
      nextMonth: 'Sonraki ay',
    },
    demos: {
      "builder": {
        "title": "Bu sistemi işletmenize göre kurayım",
        "sub": "İhtiyacınız olan modülleri seçin, size özel teklif alın. Hiçbir yükümlülük yok.",
        "whatsIncluded": "Bu sistem neler yapar",
        "modulesTitle": "Modüller",
        "recommended": "Önerilen",
        "included": "Dahil",
        "runningCost": "İşletme maliyeti",
        "costTypes": {
          "none": "Ek işletme maliyeti yok",
          "usage": "Kullanıma göre",
          "message": "Mesaj başı (sağlayıcı ücreti)",
          "transaction": "İşlem başı komisyon",
          "monthly": "Küçük aylık ücret"
        },
        "summaryTitle": "Paketiniz",
        "selectedCount": "{n} modül seçildi",
        "costNote": "Kurulum ücreti, ücretsiz bir görüşmeden sonra tek seferlik olarak tekliflendirilir. İşletme maliyetleri kullanıma göre değişir ve sağlayıcılara ödenir (ör. Meta, ödeme, yapay zekâ). Teklifle birlikte net bir tahmin alırsınız.",
        "email": "E-posta",
        "name": "Ad",
        "business": "İşletme adı",
        "message": "Özel bir isteğiniz var mı? (opsiyonel)",
        "send": "Teklifimi iste",
        "sending": "Gönderiliyor…",
        "sent": "Teşekkürler! Talebiniz alındı. 24 saat içinde dönüş yapılacak.",
        "modules": {
          "core": {
            "name": "Temel sistem",
            "desc": "Yönetim paneli, müşteri kayıtları, mobil uyumlu; logonuz ve renklerinizle."
          },
          "qr": {
            "name": "QR kod",
            "desc": "Vitrin, tezgâh veya broşür için basılabilir QR: randevu ya da müşteri sayfanızı anında açar."
          },
          "whatsapp": {
            "name": "WhatsApp bildirimleri",
            "desc": "WhatsApp Business API ile otomatik onay ve hatırlatma mesajları."
          },
          "telegram": {
            "name": "Telegram botu",
            "desc": "Yeni randevu ve müşteri adaylarında size ve ekibinize anında bildirim."
          },
          "ai": {
            "name": "Yapay zekâ asistanı",
            "desc": "Soruları yanıtlar, 7/24 sohbet veya sesle randevu alır; müşterinizin dilinde."
          },
          "payments": {
            "name": "Çevrim içi ödeme",
            "desc": "iyzico, PayTR veya Stripe ile kapora ve kartla ödeme."
          },
          "calendar": {
            "name": "Takvim eşitleme",
            "desc": "Google veya Outlook takvimiyle çift yönlü senkronizasyon."
          },
          "reviews": {
            "name": "Google yorumları",
            "desc": "Memnun müşterilerden otomatik olarak Google yorumu ister."
          },
          "hosting": {
            "name": "Alan adı & barındırma",
            "desc": "Kendi alan adınız, SSL, günlük yedek ve güncellemeler."
          }
        }
      },
      features: DEMO_ITEMS.tr.features,
      "share": {
        "title": "Paylaş & bağlan",
        "qr": "Bu demoyu telefonunuzda açmak için okutun",
        "whatsapp": "WhatsApp",
        "telegram": "Telegram",
        "copy": "Bağlantıyı kopyala",
        "copied": "Bağlantı kopyalandı",
        "text": "{name}: Chioutworks canlı demo"
      },
      "extras": {
        "remind": "WhatsApp hatırlatma",
        "remindText": "Merhaba {name}, bugün saat {time}’deki {service} randevunuzu hatırlatmak isteriz. Görüşmek üzere!",
        "cardQr": "Kart QR",
        "cardQrHint": "Müşteri bu kodu okutarak damga kartını görür.",
        "aiReply": "Yapay zekâ yanıt önerisi",
        "aiLabel": "Yapay zekâ taslağı (örnek)",
        "aiReplyText": "Merhaba {name}, mesajınız için teşekkürler! Size özel bir teklif hazırlamaktan memnuniyet duyarım. Bu hafta 10 dakikalık kısa bir görüşme için hangi gün uygun olur?",
        "openWhatsapp": "WhatsApp’ta aç"
      },
      "tag": "Hazır uygulama demoları",
      "title": "Karar vermeden önce çalışırken görün.",
      "sub": "İşletmenize göre uyarlayabileceğim hazır sektörel uygulamalar. Altısı canlı çalışıyor: 24 saat geçerli erişim koduyla doğrudan tarayıcınızda deneyin.",
      "liveTitle": "Canlı demolar",
      "liveBadge": "Canlı demo",
      "previewTitle": "Diğer uygulamalar",
      "previewSub": "Ekranlara göz atın. Her biri işletmenize özel kurulabilir.",
      "previewBadge": "Önizleme",
      "openLive": "Canlı demoyu aç",
      "viewShots": "Ekranlar",
      "custom": "Kişiye ve işletmeye göre özel olarak düzenlenebilir, yeni özellikler eklenebilir.",
      "accessActive": "Erişim aktif · {time} kaldı",
      "close": "Kapat",
      "prev": "Önceki",
      "next": "Sonraki",
      items: DEMO_ITEMS.tr.items,
      "modal": {
        "title": "Demo erişim kodunuzu alın",
        "sub": "E-postanızı girin, size 6 haneli bir kod göndereyim. Kod 24 saat geçerlidir ve tüm canlı demoları açar.",
        "email": "E-posta",
        "name": "Ad",
        "phone": "Telefon",
        "optional": "opsiyonel",
        "submit": "Kodumu gönder",
        "sending": "Gönderiliyor…",
        "codeTitle": "Kodunuzu girin",
        "codeSub": "{email} adresine 6 haneli bir kod gönderdim.",
        "simNote": "Demo modu: e-posta gönderimi simüle ediliyor. Kodunuz:",
        "codeLabel": "6 haneli kod",
        "verify": "Demoyu aç",
        "verifying": "Kontrol ediliyor…",
        "changeEmail": "Farklı bir e-posta kullan",
        "validUntil": "{date} tarihine kadar geçerli",
        "privacy": "E-postanızı yalnızca kodu göndermek ve demo hakkında dönüş yapmak için kullanırım.",
        "errors": {
          "invalid_email": "Lütfen geçerli bir e-posta adresi girin.",
          "invalid_code": "Bu kod geçerli değil.",
          "expired": "Bu kodun süresi doldu. Yeni bir kod isteyin.",
          "rate_limited": "Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.",
          "server": "Bir sorun oluştu. Lütfen tekrar deneyin."
        }
      },
      "app": {
        "back": "Tüm demolara dön",
        "remaining": "{time} kaldı",
        "demoNote": "Bu bir demodur. Veriler örnektir ve sayfa yenilenince sıfırlanır.",
        "ctaTitle": "İşletmeniz için bunu ister misiniz?",
        "ctaSub": "Adınız, renkleriniz, hizmetleriniz ve iş akışınız; ihtiyacınız olan her özellikle.",
        "ctaBtn": "Benimle konuşun",
        "notFound": "Bu demo bulunamadı.",
        "home": "Ana sayfaya git",
        "lockedTitle": "Bu demo kilitli",
        "lockedSub": "Açmak için ücretsiz 24 saatlik erişim kodu alın.",
        "unlock": "Erişim kodu al",
        "add": "Ekle",
        "save": "Kaydet",
        "cancel": "İptal",
        "search": "Ara…",
        "total": "Toplam",
        "saved": "Kaydedildi",
        "kuafor": {
          "title": "Salon paneli",
          "today": "Bugünkü randevular",
          "revenue": "Beklenen ciro",
          "free": "Boş saatler",
          "newAppt": "Yeni randevu",
          "customer": "Müşteri",
          "service": "Hizmet",
          "stylist": "Kuaför",
          "time": "Saat",
          "services": [
            "Saç kesimi",
            "Sakal tıraşı",
            "Boya",
            "Fön"
          ],
          "slotTaken": "Bu saat zaten dolu.",
          "emailSent": "Randevu kaydedildi, e-posta hatırlatma planlandı.",
          "booked": "dolu"
        },
        "klinik": {
          "title": "Klinik paneli",
          "patients": "Hastalar",
          "queue": "Günün sırası",
          "newPatient": "Yeni hasta",
          "name": "Ad soyad",
          "age": "Yaş",
          "complaint": "Geliş nedeni",
          "lastVisit": "Son muayene",
          "notes": "Muayene notları",
          "statuses": [
            "Bekliyor",
            "Muayenede",
            "Tamamlandı"
          ],
          "select": "Detayları görmek için bir hasta seçin.",
          "addToQueue": "Bugünkü sıraya ekle",
          "inQueue": "Sırada"
        },
        "temizlik": {
          "title": "Rezervasyon & fiyat",
          "calc": "Anlık fiyat",
          "area": "Alan (m²)",
          "rooms": "Oda sayısı",
          "type": "Temizlik türü",
          "types": [
            "Standart",
            "Detaylı temizlik",
            "Taşınma temizliği"
          ],
          "extras": "Ekstralar",
          "extraList": [
            "Cam",
            "Buzdolabı",
            "Fırın"
          ],
          "price": "Tahmini fiyat",
          "book": "Rezervasyon oluştur",
          "date": "Tarih",
          "bookings": "Rezervasyonlar",
          "team": "Ekip",
          "teams": [
            "Ekip A",
            "Ekip B",
            "Ekip C"
          ],
          "customer": "Müşteri"
        },
        "sadakat": {
          "title": "Sadakat kartları",
          "customers": "Müşteriler",
          "stamp": "+1 damga",
          "reward": "Ücretsiz kahve",
          "redeem": "Ödülü kullan",
          "rewardReady": "Ödül hazır!",
          "newCustomer": "Yeni müşteri",
          "phone": "Telefon",
          "name": "Ad",
          "stampsGiven": "Bugünkü damgalar",
          "rewardsRedeemed": "Kullanılan ödüller",
          "activeCards": "Aktif kartlar",
          "redeemed": "Ödül kullanıldı, kart sıfırlandı."
        },
        "crm": {
          "title": "Satış hattı",
          "stages": [
            "Yeni",
            "İletişime geçildi",
            "Teklif gönderildi",
            "Kazanıldı"
          ],
          "newLead": "Yeni aday",
          "company": "Ad / firma",
          "value": "Fırsat değeri",
          "source": "Kaynak",
          "sources": [
            "Instagram",
            "WhatsApp",
            "İnternet sitesi"
          ],
          "pipeline": "Açık fırsatlar",
          "won": "Kazanılan",
          "conversion": "Dönüşüm",
          "moveNext": "Sonraki aşama",
          "movePrev": "Geri"
        }
      }
    },
    ctaSection: {
      title: 'İşletmenizi dönüştürmeye hazır mısınız?',
      sub: 'İhtiyacınızı yazın; size özel çözüm listesini ücretsiz ve yazılı olarak hazırlayayım.',
      btn: 'İletişime Geç',
    },
    footer: {
      colLinks: [
        { label: 'Hizmetler', href: '#services' },
        { label: 'Hakkımda', href: '#about' },
        { label: 'Portföy', href: '#portfolio' },
        { label: 'İletişim', href: '#contact' },
      ],
      legal: FOOTER_LEGAL.tr,
      copy: '© 2026 Chioutworks · Chousein Chiout',
      soc2: 'Çalışmaya hazır · SOC 2 uyumlu altyapı',
    },
  },
  el: {
    nav: NAV.el,
    navCta: 'Επικοινωνήστε',
    hero: {
      tag: 'Τεχνολόγος Επιχειρηματίας · ΤΝ & Αυτοματισμός · Kelsterbach, Γερμανία',
      h1a: 'Η Chioutworks βοηθά την επιχείρησή σας',
      h1b: 'να αναπτυχθεί πιο έξυπνα.',
      sub: 'Μετατρέπω χρονοβόρες διαδικασίες σε αυτοματοποιημένα, κλιμακούμενα συστήματα. Ανάπτυξη ιστοσελίδων, ενσωμάτωση ΤΝ και ψηφιακή στρατηγική — για την ανάπτυξή σας.',
      btn1: 'Συνεργαστείτε μαζί μου',
      btn2: 'Δείτε τα Έργα',
      typeWords: ['Αυτοματισμός', 'Ενσωμάτωση ΤΝ', 'Ανάπτυξη Ιστοσελίδων', 'Ψηφιακή Στρατηγική'],
      linkedin: 'Προφίλ LinkedIn',
    },
    stats: [
      ['11+', 'Χρόνια στη Γερμανία'],
      ['2023', 'Ίδρυση επιχείρησης'],
      ['5+', 'Γλώσσες'],
      ['6', 'Βασικές Υπηρεσίες'],
    ] as [string, string][],
    platform: {
      eyebrow: 'Τι με κάνει διαφορετικό',
      title: 'Ένας πιο έξυπνος τρόπος για να αναπτύξετε την επιχείρησή σας',
      desc: 'Η Chioutworks είναι ο τεχνικός σας εταίρος για αυτοματισμό, σύγχρονα ψηφιακά προϊόντα και στρατηγικές ανάπτυξης με ΤΝ.',
      cards: [
        { title: 'Έξυπνος Αυτοματισμός', desc: 'Αντικαταστήστε επαναλαμβανόμενες εργασίες με έξυπνες ροές εργασίας που λειτουργούν 24/7.' },
        { title: 'Στενή Συνεργασία', desc: 'Εργάζομαι απευθείας μαζί σας — κατανοώ την επιχείρησή σας πριν γράψω έναν κώδικα.' },
        { title: 'Επεκτάσιμη Τεχνολογία', desc: 'Κάθε λύση ενσωματώνεται με τα υπάρχοντα εργαλεία σας και κλιμακώνεται με την ανάπτυξή σας.' },
        { title: 'Σχεδιασμός Ιστοσελίδων', desc: 'Καθαρές, γρήγορες ιστοσελίδες με εστίαση στη μετατροπή — από σελίδες προορισμού έως πλήρεις διαδικτυακές εφαρμογές.' },
      ],
    },
    guide: {
      eyebrow: 'Ένας πλήρης οδηγός υπηρεσιών',
      title: 'Από την ιδέα στην εκτέλεση — βήμα βήμα',
      chapters: [
        { num: '01', title: 'Πώς να Αυτοματοποιήσετε', desc: 'Χαρτογραφήστε διαδικασίες, εντοπίστε εμπόδια και αναπτύξτε αυτοματοποιημένες λύσεις που εξοικονομούν ώρες καθημερινά.', tag: 'Αυτοματισμός' },
        { num: '02', title: 'Πώς να Κατασκευάσετε', desc: 'Σχεδιάστε και αναπτύξτε γρήγορες, σύγχρονες διαδικτυακές εφαρμογές που θα αγαπήσουν οι πελάτες σας.', tag: 'Ανάπτυξη' },
        { num: '03', title: 'Πώς να Ενσωματώσετε ΤΝ', desc: 'Προσθέστε δυνατότητες ΤΝ στην επιχείρησή σας — ψηφιακοί βοηθοί συνομιλίας, εργαλεία περιεχομένου, έξυπνοι βοηθοί.', tag: 'ΤΝ & Ενσωμάτωση' },
        { num: '04', title: 'Πώς να Κλιμακώσετε', desc: 'Χρησιμοποιήστε δεδομένα και ψηφιακή στρατηγική για να αυξήσετε την εμβέλειά σας και να μετατρέψετε περισσότερους υποψήφιους πελάτες σε πελάτες.', tag: 'Στρατηγική Ανάπτυξης' },
      ],
    },
    features: [
      {
        eyebrow: 'Αυτοματισμός',
        title: 'Μετατρέψτε ώρες σε λεπτά',
        desc: 'Χαρτογραφήστε υπάρχουσες ροές εργασίας, εντοπίστε τις απώλειες χρόνου και αναπτύξτε αυτοματοποιημένες λύσεις.',
        items: ['CRM & αυτοματισμός πωλήσεων', 'Επεξεργασία εγγράφων', 'Αυτοματοποιημένες αναφορές', 'Συγχρονισμός πλατφορμών'],
      },
      {
        eyebrow: 'Ανάπτυξη Ιστοσελίδων',
        title: 'Σύγχρονα ψηφιακά προϊόντα, γρήγορα',
        desc: 'Καθαρές, υψηλής απόδοσης διαδικτυακές εφαρμογές με τις πιο σύγχρονες τεχνολογίες. Από σελίδες προορισμού έως πλήρη SaaS προϊόντα.',
        items: ['React & Next.js εφαρμογές', 'Ανάπτυξη API', 'Ηλεκτρονικά καταστήματα', 'Προσαρμοσμένοι πίνακες ελέγχου'],
      },
      {
        eyebrow: 'Ενσωμάτωση ΤΝ',
        title: 'ΤΝ που εργάζεται για την επιχείρησή σας',
        desc: 'Ενσωματώστε ισχυρές δυνατότητες ΤΝ στις υπάρχουσες ροές εργασίας σας. Ψηφιακοί βοηθοί υποστήριξης, δημιουργία περιεχομένου, ανάλυση δεδομένων.',
        items: ['Βοηθοί ΤΝ & συνομιλίας', 'Αυτοματισμός περιεχομένου', 'Έξυπνη εξαγωγή δεδομένων', 'Ενσωματώσεις LLM'],
      },
      {
        eyebrow: 'Ψηφιακή Στρατηγική',
        title: 'Αναπτυχθείτε με αποφάσεις βασισμένες σε δεδομένα',
        desc: 'Πίνακες ελέγχου αναλυτικών στοιχείων, παρακολούθηση ανάπτυξης και στρατηγική συμβουλευτική. Κατανοήστε τους πελάτες σας και διπλασιάστε τις επιτυχίες σας.',
        items: ['Πίνακες ελέγχου KPI', 'SEO & στρατηγική περιεχομένου', 'Πειράματα ανάπτυξης', 'Ανάλυση ανταγωνισμού'],
      },
    ],
    usecases: {
      eyebrow: 'Κλάδοι & Περιπτώσεις Χρήσης',
      title: 'Κατασκευασμένο για επιχειρήσεις κάθε είδους',
      tags: ['Ηλεκτρονικό Εμπόριο', 'Εστιατόρια', 'Ακίνητα', 'Υγεία', 'Νομικά Γραφεία', 'SaaS Νεοφυείς Επιχειρήσεις', 'Συμβουλευτική', 'Εταιρείες Μάρκετινγκ', 'Εφοδιαστική', 'Εκπαίδευση', 'Χρηματοοικονομικά', 'Λιανικό', 'HR & Στελέχωση', 'Δημιουργικά Στούντιο'],
    },
    ui: {
      footerCta: 'Έτοιμοι να ξεκινήσετε το επόμενο έργο σας;',
      footerBook: 'Κλείστε ραντεβού',
      footerBlurb: 'Αυτοματισμός, ενσωμάτωση ΤΝ και σύγχρονη ανάπτυξη ιστοσελίδων — για επιχειρήσεις που θέλουν να αναπτυχθούν πιο έξυπνα.',
      footerServicesTitle: 'Υπηρεσίες',
      footerServices: ['Αυτοματισμός', 'Ανάπτυξη Ιστοσελίδων', 'Ενσωμάτωση ΤΝ', 'Ψηφιακή Στρατηγική'],
      footerCompany: 'Εταιρεία',
      footerLocation: 'Τοποθεσία',
      footerCountry: 'Γερμανία 🇩🇪',
      footerAvailable: 'Διαθέσιμος για εργασία',
      startProject: 'Ξεκινήστε ένα έργο',
      systemRunning: 'Το σύστημα λειτουργεί',
      active: 'Ενεργό',
      systemName: 'Σύστημα Chioutworks',
      live: 'Σε λειτουργία',
      viewPortfolio: 'Δείτε τα Έργα',
      blogHint: 'Πατήστε σε οποιοδήποτε άρθρο για να το διαβάσετε ολόκληρο',
      blogLocation: 'Kelsterbach, Γερμανία',
      workWithMe: 'Συνεργαστείτε μαζί μου',
      close: 'Κλείσιμο',
      prevMonth: 'Προηγούμενος μήνας',
      nextMonth: 'Επόμενος μήνας',
    },
    demos: {
      "builder": {
        "title": "Φτιάξτε αυτό το σύστημα για την επιχείρησή σας",
        "sub": "Επιλέξτε τις λειτουργίες που χρειάζεστε και λάβετε προσαρμοσμένη προσφορά. Χωρίς δέσμευση.",
        "whatsIncluded": "Τι κάνει αυτό το σύστημα",
        "modulesTitle": "Λειτουργίες",
        "recommended": "Προτεινόμενο",
        "included": "Περιλαμβάνεται",
        "runningCost": "Λειτουργικό κόστος",
        "costTypes": {
          "none": "Χωρίς επιπλέον λειτουργικό κόστος",
          "usage": "Ανάλογα με τη χρήση",
          "message": "Ανά μήνυμα (χρέωση παρόχου)",
          "transaction": "Χρέωση ανά συναλλαγή",
          "monthly": "Μικρή μηνιαία χρέωση"
        },
        "summaryTitle": "Το πακέτο σας",
        "selectedCount": "{n} λειτουργίες επιλέχθηκαν",
        "costNote": "Η εγκατάσταση τιμολογείται εφάπαξ μετά από δωρεάν συζήτηση. Το λειτουργικό κόστος εξαρτάται από τη χρήση και πληρώνεται στους παρόχους (π.χ. Meta, πληρωμές, τεχνητή νοημοσύνη). Με την προσφορά λαμβάνετε σαφή εκτίμηση.",
        "email": "Email",
        "name": "Όνομα",
        "business": "Όνομα επιχείρησης",
        "message": "Κάτι συγκεκριμένο; (προαιρετικό)",
        "send": "Ζητήστε προσφορά",
        "sending": "Αποστολή…",
        "sent": "Ευχαριστώ! Το αίτημά σας ελήφθη. Θα λάβετε απάντηση εντός 24 ωρών.",
        "modules": {
          "core": {
            "name": "Βασικό σύστημα",
            "desc": "Πίνακας διαχείρισης, αρχείο πελατών, φιλικό σε κινητά, με το λογότυπο και τα χρώματά σας."
          },
          "qr": {
            "name": "Κωδικός QR",
            "desc": "QR για βιτρίνα, ταμείο ή φυλλάδιο: ανοίγει αμέσως τη σελίδα κρατήσεων ή πελάτη."
          },
          "whatsapp": {
            "name": "Ειδοποιήσεις WhatsApp",
            "desc": "Αυτόματες επιβεβαιώσεις και υπενθυμίσεις μέσω WhatsApp Business API."
          },
          "telegram": {
            "name": "Ρομπότ Telegram",
            "desc": "Άμεσες ειδοποιήσεις σε εσάς και την ομάδα σας για νέες κρατήσεις και πελάτες."
          },
          "ai": {
            "name": "Βοηθός Τεχνητής Νοημοσύνης",
            "desc": "Απαντά σε ερωτήσεις και κλείνει ραντεβού 24/7 με γραπτή συνομιλία ή φωνή, στη γλώσσα των πελατών σας."
          },
          "payments": {
            "name": "Ηλεκτρονικές πληρωμές",
            "desc": "Προκαταβολές και πληρωμές με κάρτα μέσω Viva Wallet, Stripe ή IRIS."
          },
          "calendar": {
            "name": "Συγχρονισμός ημερολογίου",
            "desc": "Αμφίδρομος συγχρονισμός με Google ή Outlook."
          },
          "reviews": {
            "name": "Κριτικές Google",
            "desc": "Ζητά αυτόματα κριτική Google από ικανοποιημένους πελάτες."
          },
          "hosting": {
            "name": "Όνομα τομέα & φιλοξενία",
            "desc": "Δικό σας όνομα τομέα, SSL, καθημερινά αντίγραφα ασφαλείας και ενημερώσεις."
          }
        }
      },
      features: DEMO_ITEMS.el.features,
      "share": {
        "title": "Κοινοποίηση & σύνδεση",
        "qr": "Σαρώστε για να ανοίξετε την επίδειξη στο κινητό",
        "whatsapp": "WhatsApp",
        "telegram": "Telegram",
        "copy": "Αντιγραφή συνδέσμου",
        "copied": "Ο σύνδεσμος αντιγράφηκε",
        "text": "{name}: ζωντανή επίδειξη από το Chioutworks"
      },
      "extras": {
        "remind": "Υπενθύμιση WhatsApp",
        "remindText": "Γεια σας {name}, μια υπενθύμιση για το ραντεβού σας ({service}) σήμερα στις {time}. Τα λέμε σύντομα!",
        "cardQr": "QR κάρτας",
        "cardQrHint": "Ο πελάτης σαρώνει τον κωδικό και βλέπει την κάρτα σφραγίδων του.",
        "aiReply": "Πρόταση απάντησης ΤΝ",
        "aiLabel": "Προσχέδιο ΤΝ (παράδειγμα)",
        "aiReplyText": "Γεια σας {name}, ευχαριστώ για το μήνυμά σας! Θα χαρώ να σας ετοιμάσω μια προσφορά. Πότε σας βολεύει μια σύντομη κλήση 10 λεπτών αυτή την εβδομάδα;",
        "openWhatsapp": "Άνοιγμα στο WhatsApp"
      },
      "tag": "Έτοιμες επιδείξεις εφαρμογών",
      "title": "Δείτε το να λειτουργεί πριν αποφασίσετε.",
      "sub": "Έτοιμες κλαδικές εφαρμογές που προσαρμόζω στην επιχείρησή σας. Οι έξι λειτουργούν ζωντανά: δοκιμάστε τες στο πρόγραμμα περιήγησής σας με κωδικό πρόσβασης 24 ωρών.",
      "liveTitle": "Ζωντανές επιδείξεις",
      "liveBadge": "Ζωντανή επίδειξη",
      "previewTitle": "Περισσότερες εφαρμογές",
      "previewSub": "Δείτε τις οθόνες. Κάθε μία μπορεί να φτιαχτεί για την επιχείρησή σας.",
      "previewBadge": "Προεπισκόπηση",
      "openLive": "Άνοιγμα ζωντανής επίδειξης",
      "viewShots": "Οθόνες",
      "custom": "Μπορεί να προσαρμοστεί ειδικά για κάθε άτομο και επιχείρηση· μπορούν να προστεθούν νέες λειτουργίες.",
      "accessActive": "Ενεργή πρόσβαση · απομένουν {time}",
      "close": "Κλείσιμο",
      "prev": "Προηγούμενο",
      "next": "Επόμενο",
      items: DEMO_ITEMS.el.items,
      "modal": {
        "title": "Πάρτε τον κωδικό πρόσβασης επίδειξης",
        "sub": "Εισάγετε το email σας και θα σας στείλω έναν 6ψήφιο κωδικό. Ισχύει για 24 ώρες και ανοίγει όλες τις ζωντανές επιδείξεις.",
        "email": "Email",
        "name": "Όνομα",
        "phone": "Τηλέφωνο",
        "optional": "προαιρετικό",
        "submit": "Στείλτε μου τον κωδικό",
        "sending": "Αποστολή…",
        "codeTitle": "Εισάγετε τον κωδικό",
        "codeSub": "Έστειλα έναν 6ψήφιο κωδικό στο {email}.",
        "simNote": "Λειτουργία επίδειξης: η αποστολή email προσομοιώνεται. Ο κωδικός σας:",
        "codeLabel": "6ψήφιος κωδικός",
        "verify": "Άνοιγμα επίδειξης",
        "verifying": "Έλεγχος…",
        "changeEmail": "Χρήση άλλου email",
        "validUntil": "Ισχύει έως {date}",
        "privacy": "Χρησιμοποιώ το email σας μόνο για την αποστολή του κωδικού και για επικοινωνία σχετικά με την επίδειξη.",
        "errors": {
          "invalid_email": "Εισάγετε ένα έγκυρο email.",
          "invalid_code": "Ο κωδικός δεν είναι έγκυρος.",
          "expired": "Ο κωδικός έχει λήξει. Ζητήστε νέο.",
          "rate_limited": "Πάρα πολλές προσπάθειες. Περιμένετε λίγα λεπτά.",
          "server": "Κάτι πήγε στραβά. Δοκιμάστε ξανά."
        }
      },
      "app": {
        "back": "Πίσω σε όλες τις επιδείξεις",
        "remaining": "απομένουν {time}",
        "demoNote": "Αυτή είναι επίδειξη. Τα δεδομένα είναι ενδεικτικά και επαναφέρονται με την ανανέωση της σελίδας.",
        "ctaTitle": "Το θέλετε για την επιχείρησή σας;",
        "ctaSub": "Το όνομά σας, τα χρώματα, οι υπηρεσίες και η ροή εργασίας σας, μαζί με όποια λειτουργία χρειάζεστε.",
        "ctaBtn": "Μιλήστε μαζί μου",
        "notFound": "Αυτή η επίδειξη δεν υπάρχει.",
        "home": "Αρχική σελίδα",
        "lockedTitle": "Αυτή η επίδειξη είναι κλειδωμένη",
        "lockedSub": "Πάρτε δωρεάν κωδικό πρόσβασης 24 ωρών για να το ανοίξετε.",
        "unlock": "Λήψη κωδικού",
        "add": "Προσθήκη",
        "save": "Αποθήκευση",
        "cancel": "Ακύρωση",
        "search": "Αναζήτηση…",
        "total": "Σύνολο",
        "saved": "Αποθηκεύτηκε",
        "kuafor": {
          "title": "Πίνακας κομμωτηρίου",
          "today": "Σημερινά ραντεβού",
          "revenue": "Αναμενόμενος τζίρος",
          "free": "Ελεύθερες ώρες",
          "newAppt": "Νέο ραντεβού",
          "customer": "Πελάτης",
          "service": "Υπηρεσία",
          "stylist": "Κομμωτής",
          "time": "Ώρα",
          "services": [
            "Κούρεμα",
            "Γένια",
            "Βαφή",
            "Χτένισμα"
          ],
          "slotTaken": "Αυτή η ώρα είναι ήδη κλεισμένη.",
          "emailSent": "Το ραντεβού αποθηκεύτηκε, προγραμματίστηκε υπενθύμιση email.",
          "booked": "κλεισμένο"
        },
        "klinik": {
          "title": "Πίνακας ιατρείου",
          "patients": "Ασθενείς",
          "queue": "Σημερινή σειρά",
          "newPatient": "Νέος ασθενής",
          "name": "Ονοματεπώνυμο",
          "age": "Ηλικία",
          "complaint": "Λόγος επίσκεψης",
          "lastVisit": "Τελευταία επίσκεψη",
          "notes": "Σημειώσεις επίσκεψης",
          "statuses": [
            "Αναμονή",
            "Σε εξέταση",
            "Ολοκληρώθηκε"
          ],
          "select": "Επιλέξτε ασθενή για λεπτομέρειες.",
          "addToQueue": "Προσθήκη στη σημερινή σειρά",
          "inQueue": "Στη σειρά"
        },
        "temizlik": {
          "title": "Κρατήσεις & τιμές",
          "calc": "Άμεση τιμή",
          "area": "Εμβαδόν (m²)",
          "rooms": "Δωμάτια",
          "type": "Τύπος καθαρισμού",
          "types": [
            "Κανονικός",
            "Γενικός",
            "Μετακόμισης"
          ],
          "extras": "Επιπλέον",
          "extraList": [
            "Τζάμια",
            "Ψυγείο",
            "Φούρνος"
          ],
          "price": "Εκτιμώμενη τιμή",
          "book": "Δημιουργία κράτησης",
          "date": "Ημερομηνία",
          "bookings": "Κρατήσεις",
          "team": "Συνεργείο",
          "teams": [
            "Συνεργείο Α",
            "Συνεργείο Β",
            "Συνεργείο Γ"
          ],
          "customer": "Πελάτης"
        },
        "sadakat": {
          "title": "Κάρτες επιβράβευσης",
          "customers": "Πελάτες",
          "stamp": "+1 σφραγίδα",
          "reward": "Δωρεάν καφές",
          "redeem": "Εξαργύρωση δώρου",
          "rewardReady": "Το δώρο είναι έτοιμο!",
          "newCustomer": "Νέος πελάτης",
          "phone": "Τηλέφωνο",
          "name": "Όνομα",
          "stampsGiven": "Σφραγίδες σήμερα",
          "rewardsRedeemed": "Εξαργυρωμένα δώρα",
          "activeCards": "Ενεργές κάρτες",
          "redeemed": "Το δώρο εξαργυρώθηκε, η κάρτα μηδενίστηκε."
        },
        "crm": {
          "title": "Ροή πωλήσεων",
          "stages": [
            "Νέο",
            "Επικοινωνία",
            "Στάλθηκε προσφορά",
            "Κερδήθηκε"
          ],
          "newLead": "Νέος υποψήφιος",
          "company": "Όνομα / εταιρεία",
          "value": "Αξία ευκαιρίας",
          "source": "Πηγή",
          "sources": [
            "Instagram",
            "WhatsApp",
            "Ιστότοπος"
          ],
          "pipeline": "Ανοιχτές ευκαιρίες",
          "won": "Κερδήθηκαν",
          "conversion": "Μετατροπή",
          "moveNext": "Επόμενο στάδιο",
          "movePrev": "Πίσω"
        }
      }
    },
    ctaSection: {
      title: 'Έτοιμοι να μετασχηματίσετε την επιχείρησή σας;',
      sub: 'Περιγράψτε τι χρειάζεστε — θα σας στείλω δωρεάν, γραπτά, μια εξατομικευμένη λίστα λύσεων.',
      btn: 'Επικοινωνήστε',
    },
    footer: {
      colLinks: [
        { label: 'Υπηρεσίες', href: '#services' },
        { label: 'Σχετικά', href: '#about' },
        { label: 'Έργα', href: '#portfolio' },
        { label: 'Επικοινωνία', href: '#contact' },
      ],
      legal: FOOTER_LEGAL.el,
      copy: '© 2026 Chioutworks · Chousein Chiout',
      soc2: 'Διαθέσιμος για εργασία · Υποδομή συμβατή με SOC 2',
    },
  },
} as const;
