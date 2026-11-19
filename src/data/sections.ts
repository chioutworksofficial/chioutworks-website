import type { Lang } from '../translations';

// ── ABOUT ─────────────────────────────────────────────────────────────────────
export const ABOUT: Record<Lang, {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  timeline: [string, string][];
  linkedinBtn: string;
}> = {
  en: {
    eyebrow: 'My Story',
    title: 'From working on ships to building an automation agency',
    paragraphs: [
      'I was born and raised in Echinos, a village in Xanthi, Greece. In addition to being native in Greek and Turkish, I am also fluent in a regional language shaped by the shared history of the Balkans — closely related to Bulgarian and Macedonian — allowing me to communicate across other Slavic languages.',
      'I completed my education at the 1st EPAL vocational high school in Computing in Greece. After graduation, I faced challenging times. At a young age I had to go to Germany to work on ships — about 1.5 years of demanding work to save money for my military service. After the army, I decided to move to Germany permanently.',
      'I arrived in Germany around 2015–2016. The first years were very tough, but I overcame every obstacle and adapted successfully. Technology has always been my passion. In 2023, I finally started my own small business — beginning with Dropshipping (Shopify), taking courses, and joining mentoring programs.',
      'After e-commerce, I realised my true calling was AI and Automation. Using modern AI tools and automation frameworks, I help companies transform tasks that used to take hours into mere minutes. The resilience I built through hard times is now the engine behind every project I deliver.',
    ],
    timeline: [
      ['🇬🇷 ➔ 🇩🇪', 'From Greece to Germany (2015/16)'],
      ['💼', 'Founded my own business (2023)'],
      ['⚙️', 'AI Automation & Workflows (Today)'],
      ['⚡', '3 jobs, 1 focus: Technology'],
    ],
    linkedinBtn: 'Connect on LinkedIn',
  },
  de: {
    eyebrow: 'Meine Geschichte',
    title: 'Von harter Arbeit auf See zur eigenen Automatisierungsagentur',
    paragraphs: [
      'Ich bin in Echinos, einem Dorf in Xanthi (Griechenland), geboren und aufgewachsen. Neben meinen Muttersprachen Griechisch und Türkisch beherrsche ich eine durch die gemeinsame Geschichte des Balkans geprägte Regionalsprache, die dem Bulgarischen und Mazedonischen nahesteht und mir die Kommunikation in weiteren slawischen Sprachen ermöglicht.',
      'Meinen Abschluss machte ich an der Berufsschule (1. EPAL) im Bereich Computertechnik in Griechenland. Danach durchlief ich schwierige Zeiten — ich musste in jungen Jahren nach Deutschland gehen, um auf Schiffen zu arbeiten. Etwa 1,5 Jahre in solch harter Arbeit, um das Geld für meinen Militärdienst zu verdienen. Nach dem Militärdienst beschloss ich, dauerhaft nach Deutschland zu ziehen.',
      'Ich bin im Zeitraum 2015–2016 nach Deutschland gezogen. Meine ersten Jahre hier waren sehr herausfordernd, aber ich habe alle Hürden überwunden und mich erfolgreich adaptiert. Technologie war schon immer meine große Leidenschaft. 2023 entschied ich mich schließlich, mein eigenes kleines Unternehmen zu gründen — zunächst mit Streckengeschäft (Shopify), vielen Kursen und Begleitprogrammen.',
      'Nach meinen Erfahrungen im Onlinehandel erkannte ich, dass meine wahre Leidenschaft der Künstlichen Intelligenz und Automatisierung gilt. Mit modernen KI-Werkzeugen helfe ich heute Unternehmen, zeitaufwändige Prozesse auf wenige Minuten zu reduzieren. Meine Lebenserfahrung nutze ich, um anderen Zeit und Mühe zu ersparen.',
    ],
    timeline: [
      ['🇬🇷 ➔ 🇩🇪', 'Von Griechenland nach Deutschland (2015/16)'],
      ['💼', 'Eigenes Unternehmen gegründet (2023)'],
      ['⚙️', 'KI-Automatisierung & Arbeitsabläufe (Heute)'],
      ['⚡', '3 Arbeitsstellen, 1 Fokus: Technologie'],
    ],
    linkedinBtn: 'Auf LinkedIn vernetzen',
  },
  tr: {
    eyebrow: 'Hikayem',
    title: 'Gemi işlerinden otomasyon ajansına',
    paragraphs: [
      "Yunanistan'ın İskeçe (Xanthi) kentine bağlı Şahin (Echinos) köyünde doğdum ve büyüdüm. Ana dillerim Yunanca ve Türkçe olmasının yanı sıra; Balkanlar'ın ortak tarihi süreciyle şekillenmiş, Bulgarca ve Makedonca'ya yakın duran bir bölgesel dil sayesinde diğer Slav dilleriyle de akıcı iletişim kurabiliyorum.",
      "Eğitimimi Yunanistan'da 1. EPAL meslek lisesinde Bilgisayarlık bölümünde tamamladım. Mezuniyetten sonra zorlu süreçler yaşadım. Genç yaşta Almanya'ya gemi işlerinde çalışmaya gitmek zorunda kaldım. Yaklaşık 1,5 sene ağır işlerde çalışarak askerlik paramı biriktirdim. Askerliğimi bitirdikten sonra ise Almanya'ya tamamen taşınma kararı aldım.",
      "2015–2016 yıllarında Almanya'ya taşındım. Buradaki ilk senelerim oldukça zorlu geçti ama tüm engellerin üstesinden gelip harika bir şekilde adapte oldum. Teknoloji her zaman içimde bir tutkuydu. 2023 yılında kendi küçük şirketimi kurmaya karar verdim — önce stoksuz satış (Shopify) ile başladım, birçok kurs aldım ve mentorlük programlarına katıldım.",
      'E-ticaretteki tecrübelerimden sonra asıl tutkumun ve yeteneğimin Yapay Zeka ve Otomasyon olduğunu fark ettim. Gelişmiş yapay zeka araçlarıyla, şirketlerin saatler harcadığı işleri dakikalara indirmeye odaklandım. Geçmişte yaşadığım tüm zorluklardan edindiğim deneyimle bugün işletmelere zaman ve verimlilik kazandırıyorum.',
    ],
    timeline: [
      ["🇬🇷 ➔ 🇩🇪", "Yunanistan'dan Almanya'ya (2015/16)"],
      ['💼', 'Kendi şirketimi kurdum (2023)'],
      ['⚙️', 'YZ Otomasyonu & İş Akışı Optimizasyonu (Bugün)'],
      ['⚡', '3 farklı iş, tek bir odak: Teknoloji'],
    ],
    linkedinBtn: "LinkedIn'de Bağlan",
  },
  el: {
    eyebrow: 'Η Ιστορία μου',
    title: 'Από δουλειές σε πλοία στην ίδρυση εταιρείας αυτοματισμού',
    paragraphs: [
      'Γεννήθηκα και μεγάλωσα στον Εχίνο Ξάνθης στην Ελλάδα. Εκτός από τα Ελληνικά και τα Τουρκικά που είναι οι μητρικές μου γλώσσες, μιλώ μια περιφερειακή γλώσσα που διαμορφώθηκε από την κοινή ιστορία των Βαλκανίων, συγγενική με τα Βουλγαρικά και τα Μακεδονικά, επιτρέποντάς μου να επικοινωνώ σε άλλες σλαβικές γλώσσες.',
      'Ολοκλήρωσα τις σπουδές μου στο τμήμα Υπολογιστών του 1ου ΕΠΑΛ στην Ελλάδα. Μετά την αποφοίτηση, πέρασα δύσκολες καταστάσεις. Αναγκάστηκα να πάω στη Γερμανία σε νεαρή ηλικία για να δουλέψω σε πλοία — περίπου 1,5 χρόνο σκληρής δουλειάς για να συγκεντρώσω χρήματα για τη στρατιωτική μου θητεία. Μετά τον στρατό, αποφάσισα να μετακομίσω μόνιμα στη Γερμανία.',
      'Μετακόμισα στη Γερμανία την περίοδο 2015–2016. Τα πρώτα χρόνια ήταν πολύ δύσκολα, αλλά κατάφερα να ξεπεράσω όλα τα εμπόδια. Η τεχνολογία ήταν πάντα το πάθος μου. Το 2023, αποφάσισα να ιδρύσω τη δική μου μικρή επιχείρηση — ξεκινώντας με πωλήσεις χωρίς απόθεμα (Shopify), παρακολουθώντας μαθήματα και συμμετέχοντας σε προγράμματα καθοδήγησης.',
      'Μετά το ηλεκτρονικό εμπόριο, συνειδητοποίησα ότι η πραγματική μου κλίση είναι η Τεχνητή Νοημοσύνη και ο Αυτοματισμός. Χρησιμοποιώντας προηγμένα εργαλεία ΤΝ, επικεντρώθηκα στο να μετατρέπω χρονοβόρες διαδικασίες σε λίγα λεπτά. Σήμερα χρησιμοποιώ την εμπειρία από τις δυσκολίες του παρελθόντος για να βοηθώ επιχειρήσεις να εξοικονομούν χρόνο.',
    ],
    timeline: [
      ['🇬🇷 ➔ 🇩🇪', 'Από Ελλάδα στη Γερμανία (2015/16)'],
      ['💼', 'Ίδρυση επιχείρησης (2023)'],
      ['⚙️', 'Αυτοματισμός ΤΝ & Ροές Εργασίας (Σήμερα)'],
      ['⚡', '3 δουλειές, 1 στόχος: Τεχνολογία'],
    ],
    linkedinBtn: 'Συνδεθείτε στο LinkedIn',
  },
};

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  logo: string;        // img src
  logoAlt: string;
  name: string;
  year: string;
  type: string;
  desc: string;
  stack: string[];
  url: string;
  ctaLabel: string;
  featured?: boolean;
}

export const PORTFOLIO_HEADER: Record<Lang, { eyebrow: string; title: string; desc: string }> = {
  en: { eyebrow: 'Portfolio', title: 'Selected work', desc: 'A few of the digital products and experiences I have shipped.' },
  de: { eyebrow: 'Portfolio', title: 'Ausgewählte Arbeiten', desc: 'Einige der digitalen Produkte und Erlebnisse, die ich umgesetzt habe.' },
  tr: { eyebrow: 'Portföy', title: 'Seçilmiş çalışmalar', desc: 'Şimdiye kadar tasarladığım ve yayına aldığım dijital projelerimden bazıları.' },
  el: { eyebrow: 'Έργα', title: 'Επιλεγμένα έργα', desc: 'Μερικά από τα ψηφιακά προϊόντα και εμπειρίες που έχω δημιουργήσει.' },
};

export const PROJECTS: Record<Lang, Project[]> = {
  en: [
    {
      id: 'workero',
      logo: '/workero-favicon.ico',
      logoAlt: 'Workruno',
      name: 'Workruno',
      year: '2025',
      type: 'SaaS / ATS Platform',
      desc: 'An AI-powered applicant tracking and recruitment management platform. Reads CVs with AI, generates tailored interview questions, tracks candidates on a Kanban board, and schedules interviews — helping startups and SMEs ditch spreadsheet hiring.',
      stack: ['React', 'Supabase', 'AI Integration', 'TypeScript'],
      url: 'https://workruno.com/',
      ctaLabel: 'Open app',
      featured: true,
    },
    {
      id: 'tmpr',
      logo: '/tmpr-logo.png',
      logoAlt: 'TMPR Service',
      name: 'TMPR Service',
      year: '2026',
      type: 'Website Design',
      desc: 'Professional corporate website for a cleaning company based in Düsseldorf. Modern, clean design focused on building trust and generating leads through clear service presentation and local SEO.',
      stack: ['Web Design', 'Vite', 'SEO', 'Düsseldorf'],
      url: 'https://tmpr-service.de/',
      ctaLabel: 'View website',
    },
  ],
  de: [
    {
      id: 'workero',
      logo: '/workero-favicon.ico',
      logoAlt: 'Workruno',
      name: 'Workruno',
      year: '2025',
      type: 'SaaS / ATS-Plattform',
      desc: 'Eine KI-gestützte Personalgewinnungs-Plattform. Liest Lebensläufe mit KI aus, generiert individuelle Interviewfragen, verfolgt Kandidaten auf einem Kanban-Tafel und plant Vorstellungsgespräche — ideal für Jungunternehmen und KMU.',
      stack: ['React', 'Supabase', 'KI-Integration', 'TypeScript'],
      url: 'https://workruno.com/',
      ctaLabel: 'App öffnen',
      featured: true,
    },
    {
      id: 'tmpr',
      logo: '/tmpr-logo.png',
      logoAlt: 'TMPR Service',
      name: 'TMPR Service',
      year: '2026',
      type: 'Website-Gestaltung',
      desc: 'Professionelle Unternehmenswebsite für eine Reinigungsfirma in Düsseldorf. Modernes, klares Gestaltung, die Vertrauen schafft und Interessenten durch klare Leistungspräsentation und lokales SEO generiert.',
      stack: ['Webgestaltung', 'Vite', 'SEO', 'Düsseldorf'],
      url: 'https://tmpr-service.de/',
      ctaLabel: 'Website ansehen',
    },
  ],
  tr: [
    {
      id: 'workero',
      logo: '/workero-favicon.ico',
      logoAlt: 'Workruno',
      name: 'Workruno',
      year: '2025',
      type: 'SaaS / ATS Platformu',
      desc: "YZ destekli işe alım yönetim platformu. CV'leri yapay zeka ile okur, özel mülakat soruları üretir, adayları Kanban panosunda takip eder ve mülakatları planlar — işe alımını elektronik tablodan kurtarmak isteyen girişim ve KOBİ'ler için.",
      stack: ['React', 'Supabase', 'YZ Entegrasyonu', 'TypeScript'],
      url: 'https://workruno.com/',
      ctaLabel: 'Uygulamayı aç',
      featured: true,
    },
    {
      id: 'tmpr',
      logo: '/tmpr-logo.png',
      logoAlt: 'TMPR Service',
      name: 'TMPR Service',
      year: '2026',
      type: 'Web Tasarım',
      desc: "Düsseldorf merkezli bir temizlik şirketi için geliştirilen profesyonel kurumsal web sitesi. Güven veren, modern ve sade tasarım — net hizmet sunumu ve yerel SEO ile müşteri dönüşümüne odaklanıyor.",
      stack: ['Web Tasarım', 'Vite', 'SEO', 'Düsseldorf'],
      url: 'https://tmpr-service.de/',
      ctaLabel: 'Web sitesini gör',
    },
  ],
  el: [
    {
      id: 'workero',
      logo: '/workero-favicon.ico',
      logoAlt: 'Workruno',
      name: 'Workruno',
      year: '2025',
      type: 'SaaS / ATS Πλατφόρμα',
      desc: 'Πλατφόρμα διαχείρισης προσλήψεων με ΤΝ. Διαβάζει βιογραφικά με ΤΝ, δημιουργεί εξατομικευμένες ερωτήσεις συνέντευξης, παρακολουθεί υποψηφίους σε πίνακα Kanban και προγραμματίζει συνεντεύξεις.',
      stack: ['React', 'Supabase', 'Ενσωμάτωση ΤΝ', 'TypeScript'],
      url: 'https://workruno.com/',
      ctaLabel: 'Άνοιγμα εφαρμογής',
      featured: true,
    },
    {
      id: 'tmpr',
      logo: '/tmpr-logo.png',
      logoAlt: 'TMPR Service',
      name: 'TMPR Service',
      year: '2026',
      type: 'Σχεδιασμός Ιστοσελίδων',
      desc: 'Επαγγελματική εταιρική ιστοσελίδα για εταιρεία καθαρισμού στο Ντύσελντορφ. Μοντέρνος, καθαρός σχεδιασμός για δημιουργία εμπιστοσύνης και προσέλκυση υποψήφιων πελατών μέσω σαφούς παρουσίασης υπηρεσιών.',
      stack: ['Σχεδιασμός Ιστοσελίδων', 'Vite', 'SEO', 'Ντύσελντορφ'],
      url: 'https://tmpr-service.de/',
      ctaLabel: 'Δείτε την ιστοσελίδα',
    },
  ],
};

// ── BLOG ──────────────────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  date: string;
  readMin: number;
  tag: string;
  title: string;
  excerpt: string;
  content?: string;
  sources?: { t: string; url: string }[];   // shown under the article (owner, 2026-11-19: real data, cited)
}

export const BLOG_HEADER: Record<Lang, { eyebrow: string; title: string; cta: string }> = {
  en: { eyebrow: 'Blog', title: 'Thoughts on automation & building', cta: 'Read article' },
  de: { eyebrow: 'Blog', title: 'Gedanken zu Automatisierung & Aufbau', cta: 'Artikel lesen' },
  tr: { eyebrow: 'Blog', title: 'Otomasyon ve kurulum üzerine düşünceler', cta: 'Makaleyi oku' },
  el: { eyebrow: 'Blog', title: 'Σκέψεις για αυτοματισμό και κατασκευή', cta: 'Διαβάστε άρθρο' },
};

export const BLOG_POSTS: Record<Lang, BlogPost[]> = {
  en: [
    {"id": "ai-jobs-reality", "date": "Nov 19, 2026", "readMin": 5, "tag": "AI", "title": "Which jobs will AI change? A realistic look", "excerpt": "Headlines talk about jobs disappearing. The data tells a more nuanced story: tasks change faster than whole professions, and new work appears alongside.", "content": "Every week a new headline claims that AI will take our jobs. The real picture is less dramatic and more useful.\n\n**What the large studies say**\n\nThe World Economic Forum’s **Future of Jobs Report 2025**, based on more than 1,000 employers in 55 economies, expects about **170 million new jobs** and about **92 million displaced jobs** by 2030: a net gain of roughly **78 million**. In total, around **22%** of today’s jobs will change significantly.\n\nThe IMF estimates that AI will affect almost **40% of jobs worldwide** and about **60% in advanced economies**. Affected does not mean lost: roughly half of these jobs could become more productive, the other half could face lower demand.\n\n**Which work is under pressure**\n\nRoutine office tasks shrink first: data entry, simple bookkeeping, scheduling, copying information from one system to another. Among the fastest-declining roles the WEF lists cashiers, administrative assistants and accounting or payroll clerks.\n\n**Which work grows**\n\nWork that needs judgement, trust and people: advice, care, skilled trades, sales, and everyone who can combine their expertise with digital tools.\n\n**What this means for a small business**\n\nThe question is not whether AI replaces your team, but which repetitive tasks it can take over so your people have more time for customers. The businesses that adapt early usually gain the most.\n\nIf you want to know which tasks in your business could be automated sensibly, send me a short request; you get a free written assessment.", "sources": [{"t": "World Economic Forum — Future of Jobs Report 2025 (press release, 8 Jan 2025)", "url": "https://www.weforum.org/press/2025/01/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed-to-prepare-workforces/"}, {"t": "IMF — “AI Will Transform the Global Economy. Let’s Make Sure It Benefits Humanity” (14 Jan 2024)", "url": "https://www.imf.org/en/Blogs/Articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity"}]},
    {"id": "digital-or-decline", "date": "Nov 19, 2026", "readMin": 4, "tag": "Digitalisation", "title": "Why businesses that do not go digital slowly fade away", "excerpt": "A business rarely closes overnight; its customers drift, quietly, to faster and easier competitors. Turning that around is easier than you think.", "content": "It is uncomfortable but true: businesses that do not go digital do not fail overnight, they fade day by day. Customers do not slam the door; they simply choose someone else next time.\n\n**How the fading starts**\n\nA customer searches for you online and does not find you. Even if they do, they have to call, and nobody answers. They send a message to book, and the reply comes the next day. Meanwhile a competitor takes the booking in two clicks on its website and sends the reminder automatically. Nobody tells you they are leaving; there are just fewer enquiries.\n\n**What competitors are speeding up**\n\nAccording to Eurostat, the share of EU enterprises using AI rose from **13.5%** in 2024 to **20%** a year later. Large companies use these tools almost four times as often as small ones. The gap widens every year; waiting really means choosing to fall behind.\n\n**What customers expect**\n\nBeing found on Google, a website that works on the phone, booking at night, fast and clear answers. These are no longer extras, they are the minimum.\n\n**The good news: no big transformation needed**\n\nYou do not have to change everything at once. Start with the one point that costs you the most time and customers: a good website if you have none, online booking if the phone never stops, automatic quotes if writing offers eats your evenings. One small step makes a difference within weeks.\n\nSend me a short request and you get a free written assessment of where to start.", "sources": [{"t": "Eurostat — Usage of AI technologies increasing in EU enterprises (23 Jan 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250123-3"}, {"t": "Eurostat — 20% of EU enterprises use AI technologies (11 Dec 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2"}]},
    {"id": "ai-benefits-risks", "date": "Nov 18, 2026", "readMin": 5, "tag": "AI", "title": "What AI really adds to a business, and where the risks are", "excerpt": "AI saves time and answers customers around the clock, but it also makes mistakes and touches data protection. An honest list of both sides.", "content": "AI is neither magic nor danger by default. Used well, it saves real time; used carelessly, it creates new problems.\n\n**What AI adds**\n\n**Time:** drafts, summaries, translations and answers to frequent questions are done in seconds.\n\n**Availability:** an assistant on your website answers at night and on weekends and passes real enquiries on to you.\n\n**Languages:** customers can be served in their own language without extra staff.\n\n**Consistency:** offers, reminders and follow-ups no longer depend on someone remembering them.\n\n**Where the risks are**\n\n**Wrong answers:** language models can sound confident and still be wrong. Important answers need clear limits and a human check.\n\n**Data protection:** customer data must only go to services with a proper legal basis; in the EU, the GDPR applies.\n\n**Dependence:** if a tool changes its prices or terms, your process should not stop. Good setups can switch providers.\n\n**Misuse:** fake voices, fake images and fraud attempts are becoming more convincing; staff should know the warning signs.\n\n**The rules are getting clearer**\n\nThe EU **AI Act** introduces transparency duties: people must be told when they are talking to an AI system. These obligations apply from **2 August 2026**.\n\n**My approach**\n\nI use AI where it clearly saves time, keep a human in the loop for decisions, and choose providers with a clear legal basis. If you want to see what that could look like for you, ask for a free written assessment.", "sources": [{"t": "EUR-Lex — Regulation (EU) 2024/1689 (AI Act)", "url": "https://eur-lex.europa.eu/eli/reg/2024/1689/oj"}]},
    {"id": "small-business-ai-today", "date": "Nov 17, 2026", "readMin": 4, "tag": "AI", "title": "How small businesses use AI today, and why the gap is an opportunity", "excerpt": "Large companies adopt AI almost four times as often as small ones. That gap is exactly where small businesses can win.", "content": "Many owners of small businesses think AI is only for large companies. The numbers show that this is exactly the opportunity.\n\n**The numbers**\n\nAccording to Eurostat, **13.5%** of EU enterprises with 10 or more employees used AI in 2024. Among large enterprises the share was about **41%**, among small ones about **11%**. One year later the overall share had already risen to **20%**.\n\n**What small businesses actually use it for**\n\nAnswering frequent customer questions on the website, sending appointment reminders, drafting offers and e-mails, summarising long messages, translating texts and sorting incoming requests.\n\n**How to start without risk**\n\nPick **one** process that costs you time every week. Measure how long it takes today. Automate only that step, check the results for a few weeks, then decide on the next one. No big project, no long contract.\n\n**Why the gap matters**\n\nWhen most competitors still work by hand, every hour you save goes straight into better service. Customers notice faster answers long before they notice the technology behind them.\n\nNot sure where to start? Send me a short description of your daily work and I will tell you in writing which step pays off first.", "sources": [{"t": "Eurostat — Usage of AI technologies increasing in EU enterprises (23 Jan 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250123-3"}, {"t": "Eurostat — 20% of EU enterprises use AI technologies (11 Dec 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2"}]},
    {
      id: 'automate-5-processes',
      date: 'Nov 4, 2026',
      readMin: 5,
      tag: 'Automation',
      title: '5 processes every small business should automate',
      excerpt: 'From invoice sending to lead follow-ups — here are the five workflows I see wasting the most time in small businesses, and how to fix each one in under a day.',
      content: `Most small business owners I talk to are drowning in repetitive tasks. They spend hours doing things a computer could handle in seconds. Here are the five most common time-drains — and how to automate each one.\n\n**1. Invoice sending and payment reminders**\nManually creating and sending invoices is one of the biggest hidden time costs. An automation platform can trigger automatic invoice generation the moment a project is marked complete in your CRM. Payment reminders? Fully automated. You focus on the work; the system handles the billing.\n\n**2. Lead follow-up sequences**\nMost leads go cold because nobody followed up. Set up an automated email sequence that fires 24 hours after a form submission, then again at day 3, day 7, and day 14. With tools like ActiveCampaign or even a simple automation workflow, this takes two hours to set up and runs forever.\n\n**3. Social media scheduling**\nPosting consistently is key for visibility, but nobody has time to log in daily. Use Buffer or a simple automation workflow connected to your content calendar. Write your posts in a spreadsheet once per week; the automation handles publishing.\n\n**4. Customer onboarding documents**\nEvery new client needs a welcome email, contract, questionnaire, and project brief. This can all be triggered automatically when a deal is marked "won" in your CRM — generating the documents, sending them for signature, and creating the project folder.\n\n**5. Reporting and KPI dashboards**\nBuilding weekly reports manually is a waste of analytical talent. Connect your data sources (Google Analytics, Stripe, your CRM) to a dashboard tool like Google Looker Studio or Notion. Set up automated email reports that land in your inbox every Monday morning.\n\n**The bottom line:** Each of these automations takes between one hour and one day to set up. Combined, they can save you 8–15 hours per week. That's time you can spend on strategy, clients, or simply not working. Start with whichever one hurts most right now.`,
    },
    {
      id: 'ai-actually-saves-time',
      date: 'Oct 21, 2026',
      readMin: 4,
      tag: 'AI',
      title: 'AI tools that actually save time (not just buzzwords)',
      excerpt: 'After testing dozens of AI tools across real client projects, these are the ones that deliver genuine time savings — and the ones that are just noise.',
      content: `The AI tool landscape is noisy. Everyone is selling the dream of "10x productivity" — but after testing dozens of tools across real client projects over the past two years, I can tell you which ones actually deliver.\n\n**The tools that genuinely work:**\n\n**A general-purpose AI assistant** — My daily driver. It's the best for nuanced writing, complex analysis, and code generation. When I need to explain something technical to a client, write a proposal, or debug a tricky API integration, this is where I start.\n\n**An AI coding tool in the editor** — If you write code, this is the biggest productivity jump available today. It's not just autocomplete — it understands your entire codebase and can write, refactor, and debug across multiple files at once. I've watched projects that would have taken two weeks get done in four days.\n\n**Automation: custom code first** — For most client automations I write small, focused code that runs on my own server or on a serverless platform like Modal. It runs around the clock and rarely needs babysitting. Visual tools like n8n are handy for some cases, but flows built that way tend to need constant checking when something stops. So the tool is chosen per project, not by habit.\n\n**An AI search tool that cites its sources** — For research. Much better than a classic search engine for getting a quick, accurate answer with sources. Saves 15-20 minutes per research task.\n\n**The tools that are mostly noise:**\n\nMost "AI writing assistants" generate generic, flat content that requires more editing than writing from scratch. AI image generation is impressive but rarely useful in real business contexts. Many "AI-powered" SaaS tools just have a thin AI layer bolted on and charge 3x the price.\n\n**My rule:** An AI tool earns its place if it saves me more than 30 minutes per week. Start with that filter and your list gets very short — but very useful.`,
    },
    {
      id: 'trustworthy-website',
      date: 'Oct 7, 2026',
      readMin: 6,
      tag: 'Web Development',
      title: 'Building a trustworthy business website: what actually matters',
      excerpt: 'Speed, clarity, and social proof are the three pillars. Here is what I focus on when building websites for local businesses and why most "design trends" are irrelevant.',
      content: `I've built websites for cleaning companies, law firms, consultants, and SaaS startups. After dozens of projects, I've learned that most "design trends" are completely irrelevant to whether a website converts visitors into customers. Here's what actually matters.\n\n**1. Speed — non-negotiable**\nGoogle's data is clear: 53% of mobile visitors leave if a page takes more than 3 seconds to load. Every second of delay costs conversions. This means optimized images, minimal JavaScript, proper caching, and hosting that doesn't cut corners. A slow site, no matter how beautiful, is a leaking bucket.\n\n**2. Clarity in the first 5 seconds**\nWhen someone lands on your website, they're asking three questions: "Is this for me? Do they solve my problem? Can I trust them?" Your homepage has roughly five seconds to answer all three. This means: a clear headline that names the problem you solve, a single call-to-action, and no jargon.\n\n**3. Social proof — specific beats general**\nTestimonials that say "Great service!" do almost nothing. Testimonials that say "I used to spend 6 hours per week on invoicing. After implementing Chioutworks' automation, it takes me 20 minutes." — those convert. Specificity creates believability. Get the numbers, the before/after, the concrete result.\n\n**4. Mobile-first, always**\nIn most industries, 60-70% of traffic is mobile. Design for the phone first. Every element, every button, every form field must work perfectly on a small screen with a thumb.\n\n**5. What doesn't matter (as much as people think):**\n- Animations and micro-interactions look nice but don't drive conversions\n- Trendy color schemes age badly\n- Stock photos are invisible — use real photos of your team or work\n- "Awards" sections nobody reads\n\n**The brief:** Fast, clear, credible. Build around those three things and you'll outperform 90% of competitor websites.`,
    },
    {
      id: 'ship-worker-to-tech',
      date: 'Sep 23, 2026',
      readMin: 7,
      tag: 'Personal',
      title: 'From ship work to tech entrepreneur: what the hard years taught me',
      excerpt: 'Growing up in a Greek village, working on ships at 18, and building a tech business in Germany at 33 — the lessons from each phase and how they connect.',
      content: `I grew up in Echinos — a small village in Xanthi, Greece. At 18, in the period before military service, I went through real hardship. Some businessmen from our village had connections to shipyard jobs in Germany, and out of necessity I took that path as the fastest option — I started working on ships. I arrived speaking almost no German, knowing almost no one. The work was physical and exhausting — long hours, difficult conditions, not what I had imagined for myself. I also met a number of educated, well-read people there — but unfortunately, many of them were still doing the same work years later. But I learned something essential: discomfort is information. Every hard situation was teaching me something about myself.\n\nAfter military service, I made the decision to move to Germany permanently. The first years were genuinely difficult. Building a life in a new country without a network, with limited language, and with no clear professional path — it requires a kind of stubbornness that either breaks you or builds something in you.\n\nTechnology had always pulled at me. In my free time I was reading about computers, experimenting with code, watching tutorials. In 2023, I formalized what had been a side obsession into a real business. I started with e-commerce — Shopify, dropshipping — because it was accessible. But I quickly realized that what I actually loved was the infrastructure behind the store: the automations, the integrations, the systems.\n\nThat pivot to automation and AI felt like coming home.\n\n**What the hard years taught me:**\n\nFirst: adaptability is a skill, not a personality trait. You build it by being forced to adapt, repeatedly. Every new country, language, and industry I've navigated has made me faster at learning the next one.\n\nSecond: the gap between knowing something and doing something is where most people get stuck. I've seen incredibly intelligent people who can't ship because they're waiting for perfect conditions. Perfect conditions don't come. You ship from where you are.\n\nThird: every "hard" background contains advantages that aren't immediately visible. Working on ships taught me discipline, tolerance for discomfort, and an ability to focus in chaotic environments. Those aren't soft skills — they're operational advantages.\n\nThe business I'm building now is small. But it's mine, and it's built on something real. I don't need to convince myself it's worth doing — I already know it is.`,
    },
  ],
  de: [
    {"id": "ai-jobs-reality", "date": "19. Nov. 2026", "readMin": 5, "tag": "KI", "title": "Welche Berufe verändert KI? Ein realistischer Blick", "excerpt": "Schlagzeilen sprechen vom Jobverlust. Die Daten zeigen ein differenzierteres Bild: Aufgaben ändern sich schneller als ganze Berufe, und neue Arbeit entsteht.", "content": "Jede Woche behauptet eine neue Schlagzeile, KI nehme uns die Arbeit weg. Das tatsächliche Bild ist weniger dramatisch und deutlich nützlicher.\n\n**Was große Studien sagen**\n\nDer **Future of Jobs Report 2025** des Weltwirtschaftsforums, basierend auf mehr als 1.000 Arbeitgebern in 55 Volkswirtschaften, erwartet bis 2030 rund **170 Millionen neue** und rund **92 Millionen wegfallende Arbeitsplätze**: netto etwa **78 Millionen** mehr. Insgesamt verändern sich rund **22 %** der heutigen Jobs deutlich.\n\nDer IWF schätzt, dass KI fast **40 % der Arbeitsplätze weltweit** und etwa **60 % in Industrieländern** betrifft. Betroffen heißt nicht verloren: Etwa die Hälfte dieser Jobs kann produktiver werden, bei der anderen Hälfte kann die Nachfrage sinken.\n\n**Welche Arbeit unter Druck steht**\n\nZuerst schrumpfen Routineaufgaben im Büro: Dateneingabe, einfache Buchhaltung, Terminplanung, das Übertragen von Daten zwischen Systemen. Unter den am schnellsten schrumpfenden Berufen nennt das WEF Kassierer, Verwaltungsassistenzen sowie Buchhaltungs- und Lohnbuchhaltungskräfte.\n\n**Welche Arbeit wächst**\n\nArbeit, die Urteilsvermögen, Vertrauen und Menschen braucht: Beratung, Pflege, Handwerk, Vertrieb und alle, die ihr Fachwissen mit digitalen Werkzeugen verbinden.\n\n**Was das für kleine Betriebe bedeutet**\n\nDie Frage ist nicht, ob KI Ihr Team ersetzt, sondern welche wiederkehrenden Aufgaben sie übernehmen kann, damit Ihr Team mehr Zeit für Kunden hat. Wer früh umstellt, gewinnt meist am meisten.\n\nSie möchten wissen, welche Aufgaben in Ihrem Betrieb sinnvoll automatisierbar sind? Senden Sie mir eine kurze Anfrage, Sie erhalten eine kostenlose schriftliche Einschätzung.", "sources": [{"t": "World Economic Forum — Future of Jobs Report 2025 (press release, 8 Jan 2025)", "url": "https://www.weforum.org/press/2025/01/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed-to-prepare-workforces/"}, {"t": "IMF — “AI Will Transform the Global Economy. Let’s Make Sure It Benefits Humanity” (14 Jan 2024)", "url": "https://www.imf.org/en/Blogs/Articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity"}]},
    {"id": "digital-or-decline", "date": "19. Nov. 2026", "readMin": 4, "tag": "Digitalisierung", "title": "Warum Betriebe, die nicht digital werden, langsam verschwinden", "excerpt": "Ein Betrieb schließt selten über Nacht; seine Kunden wandern still zu schnelleren und einfacheren Mitbewerbern ab. Das umzudrehen ist leichter, als Sie denken.", "content": "Es ist unbequem, aber wahr: Betriebe, die nicht digital werden, scheitern nicht über Nacht, sie schwinden Tag für Tag. Kunden knallen nicht die Tür zu; sie wählen beim nächsten Mal einfach jemand anderen.\n\n**Wie das Schwinden beginnt**\n\nEin Kunde sucht Sie online und findet Sie nicht. Selbst wenn, muss er anrufen, und niemand geht ran. Er schreibt wegen eines Termins, die Antwort kommt am nächsten Tag. Währenddessen bucht der Mitbewerber mit zwei Klicks auf seiner Website und schickt die Erinnerung automatisch. Niemand sagt Ihnen, dass er geht; es kommen einfach weniger Anfragen.\n\n**Was Mitbewerber beschleunigen**\n\nLaut Eurostat stieg der Anteil der EU-Unternehmen, die KI nutzen, von **13,5 %** im Jahr 2024 auf **20 %** ein Jahr später. Große Unternehmen nutzen diese Werkzeuge fast viermal so oft wie kleine. Der Abstand wächst jedes Jahr; Abwarten heißt in Wahrheit, zurückzufallen.\n\n**Was Kunden erwarten**\n\nBei Google gefunden werden, eine Website, die am Handy funktioniert, nachts einen Termin buchen, schnelle und klare Antworten. Das sind keine Extras mehr, sondern das Minimum.\n\n**Die gute Nachricht: keine große Umstellung nötig**\n\nSie müssen nicht alles auf einmal ändern. Beginnen Sie bei dem einen Punkt, der Sie am meisten Zeit und Kunden kostet: eine gute Website, wenn Sie keine haben, Online-Termine, wenn das Telefon nie still steht, automatische Angebote, wenn Angebote Ihre Abende fressen. Ein kleiner Schritt wirkt innerhalb von Wochen.\n\nSenden Sie mir eine kurze Anfrage und Sie erhalten eine kostenlose schriftliche Einschätzung, wo Sie anfangen sollten.", "sources": [{"t": "Eurostat — Usage of AI technologies increasing in EU enterprises (23 Jan 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250123-3"}, {"t": "Eurostat — 20% of EU enterprises use AI technologies (11 Dec 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2"}]},
    {"id": "ai-benefits-risks", "date": "18. Nov. 2026", "readMin": 5, "tag": "KI", "title": "Was KI einem Betrieb wirklich bringt und wo die Risiken liegen", "excerpt": "KI spart Zeit und antwortet Kunden rund um die Uhr, macht aber auch Fehler und berührt den Datenschutz. Eine ehrliche Liste beider Seiten.", "content": "KI ist weder Zauberei noch von sich aus gefährlich. Gut eingesetzt spart sie echte Zeit, achtlos eingesetzt schafft sie neue Probleme.\n\n**Was KI bringt**\n\n**Zeit:** Entwürfe, Zusammenfassungen, Übersetzungen und Antworten auf häufige Fragen sind in Sekunden fertig.\n\n**Erreichbarkeit:** Ein Assistent auf Ihrer Website antwortet nachts und am Wochenende und leitet echte Anfragen an Sie weiter.\n\n**Sprachen:** Kunden werden ohne zusätzliches Personal in ihrer Sprache betreut.\n\n**Verlässlichkeit:** Angebote, Erinnerungen und Nachfassungen hängen nicht mehr davon ab, dass jemand daran denkt.\n\n**Wo die Risiken liegen**\n\n**Falsche Antworten:** Sprachmodelle klingen überzeugt und können trotzdem irren. Wichtige Antworten brauchen klare Grenzen und eine menschliche Prüfung.\n\n**Datenschutz:** Kundendaten dürfen nur an Dienste mit sauberer Rechtsgrundlage gehen; in der EU gilt die DSGVO.\n\n**Abhängigkeit:** Ändert ein Werkzeug Preise oder Bedingungen, darf Ihr Ablauf nicht stehen bleiben. Gute Lösungen können den Anbieter wechseln.\n\n**Missbrauch:** Gefälschte Stimmen, Bilder und Betrugsversuche werden überzeugender; Mitarbeitende sollten die Warnzeichen kennen.\n\n**Die Regeln werden klarer**\n\nDie EU-**KI-Verordnung** bringt Transparenzpflichten: Menschen müssen erfahren, wenn sie mit einem KI-System sprechen. Diese Pflichten gelten ab dem **2. August 2026**.\n\n**Mein Ansatz**\n\nIch setze KI dort ein, wo sie klar Zeit spart, behalte bei Entscheidungen den Menschen im Ablauf und wähle Anbieter mit klarer Rechtsgrundlage. Wie das bei Ihnen aussehen könnte, zeigt eine kostenlose schriftliche Einschätzung.", "sources": [{"t": "EUR-Lex — Regulation (EU) 2024/1689 (AI Act)", "url": "https://eur-lex.europa.eu/eli/reg/2024/1689/oj"}]},
    {"id": "small-business-ai-today", "date": "17. Nov. 2026", "readMin": 4, "tag": "KI", "title": "Wie kleine Betriebe heute KI nutzen und warum der Abstand eine Chance ist", "excerpt": "Große Unternehmen nutzen KI fast viermal so oft wie kleine. Genau in diesem Abstand können kleine Betriebe gewinnen.", "content": "Viele Inhaber kleiner Betriebe glauben, KI sei nur etwas für Konzerne. Die Zahlen zeigen, dass genau darin die Chance liegt.\n\n**Die Zahlen**\n\nLaut Eurostat nutzten 2024 **13,5 %** der EU-Unternehmen mit 10 oder mehr Beschäftigten KI. Bei großen Unternehmen waren es rund **41 %**, bei kleinen rund **11 %**. Ein Jahr später lag der Gesamtanteil bereits bei **20 %**.\n\n**Wofür kleine Betriebe KI tatsächlich nutzen**\n\nHäufige Kundenfragen auf der Website beantworten, Terminerinnerungen senden, Angebote und E-Mails entwerfen, lange Nachrichten zusammenfassen, Texte übersetzen und eingehende Anfragen sortieren.\n\n**So starten Sie ohne Risiko**\n\nWählen Sie **einen** Ablauf, der Sie jede Woche Zeit kostet. Messen Sie, wie lange er heute dauert. Automatisieren Sie nur diesen Schritt, prüfen Sie die Ergebnisse einige Wochen lang und entscheiden Sie dann über den nächsten. Kein Großprojekt, kein langer Vertrag.\n\n**Warum der Abstand zählt**\n\nWenn die meisten Mitbewerber noch von Hand arbeiten, fließt jede gesparte Stunde direkt in besseren Service. Kunden bemerken schnellere Antworten lange bevor sie die Technik dahinter bemerken.\n\nUnsicher, wo Sie anfangen sollen? Beschreiben Sie mir kurz Ihren Arbeitsalltag, und ich sage Ihnen schriftlich, welcher Schritt sich zuerst lohnt.", "sources": [{"t": "Eurostat — Usage of AI technologies increasing in EU enterprises (23 Jan 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250123-3"}, {"t": "Eurostat — 20% of EU enterprises use AI technologies (11 Dec 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2"}]},
    {
      id: 'automate-5-processes',
      date: '4. Nov. 2026',
      readMin: 5,
      tag: 'Automatisierung',
      title: '5 Prozesse, die jedes Kleinunternehmen automatisieren sollte',
      excerpt: 'Von Rechnungsversand bis Nachfassaktionen bei Interessenten — die fünf Arbeitsabläufe, die in kleinen Unternehmen am meisten Zeit verschwenden, und wie man sie in weniger als einem Tag behebt.',
      content: `Die meisten Inhaber kleiner Unternehmen, mit denen ich spreche, ertrinken in sich wiederholenden Aufgaben. Sie verbringen Stunden mit Dingen, die ein Computer in Sekunden erledigen könnte. Hier sind die fünf häufigsten Zeitfresser — und wie man jeden davon automatisiert.\n\n**1. Rechnungsversand und Zahlungserinnerungen**\nRechnungen manuell zu erstellen und zu versenden ist einer der größten versteckten Zeitkosten. Eine Automatisierungsplattform kann automatisch eine Rechnung erstellen, sobald ein Projekt im CRM als abgeschlossen markiert wird. Zahlungserinnerungen? Vollständig automatisiert. Sie konzentrieren sich auf die Arbeit; das System übernimmt die Abrechnung.\n\n**2. Nachfass-Sequenzen für Interessenten**\nDie meisten Interessenten werden kalt, weil niemand nachgefasst hat. Richten Sie eine automatisierte E-Mail-Sequenz ein, die 24 Stunden nach einer Formularabgabe ausgelöst wird, dann erneut an Tag 3, Tag 7 und Tag 14. Mit Werkzeuge wie ActiveCampaign oder sogar einem einfachen Automatisierungs-Arbeitsablauf dauert die Einrichtung zwei Stunden und läuft danach für immer.\n\n**3. Social-Media-Planung**\nRegelmäßiges Posten ist wichtig für Sichtbarkeit, aber niemand hat Zeit, sich täglich einzuloggen. Nutzen Sie Buffer oder einen einfachen Automatisierungs-Arbeitsablauf, der mit Ihrem Redaktionskalender verbunden ist. Schreiben Sie Ihre Beiträge einmal pro Woche in eine Tabelle; die Automatisierung übernimmt die Veröffentlichung.\n\n**4. Einführungsunterlagen für neue Kunden**\nJeder neue Kunde braucht eine Willkommens-E-Mail, einen Vertrag, einen Fragebogen und ein Projektbriefing. All das kann automatisch ausgelöst werden, sobald ein Abschluss im CRM als "gewonnen" markiert wird — die Dokumente werden erstellt, zur Unterschrift versendet und der Projektordner angelegt.\n\n**5. Berichtswesen und KPI-Übersichten**\nWöchentliche Berichte manuell zu erstellen ist Verschwendung von analytischem Talent. Verbinden Sie Ihre Datenquellen (Google Analytics, Stripe, Ihr CRM) mit einem Auswertungswerkzeug wie Google Looker Studio oder Notion. Richten Sie automatisierte E-Mail-Berichte ein, die jeden Montagmorgen in Ihrem Postfach landen.\n\n**Fazit:** Jede dieser Automatisierungen dauert zwischen einer Stunde und einem Tag in der Einrichtung. Zusammen können sie Ihnen 8–15 Stunden pro Woche sparen. Zeit, die Sie in Strategie, Kunden oder einfach in Freizeit investieren können. Fangen Sie mit dem an, was gerade am meisten wehtut.`,
    },
    {
      id: 'ai-actually-saves-time',
      date: '21. Okt. 2026',
      readMin: 4,
      tag: 'KI',
      title: 'KI-Werkzeuge, die wirklich Zeit sparen (keine leeren Schlagworte)',
      excerpt: 'Nach dem Testen dutzender KI-Werkzeuge in realen Kundenprojekten — das sind diejenigen, die echte Zeitersparnisse liefern, und diejenigen, die nur Lärm sind.',
      content: `Die Landschaft der KI-Werkzeuge ist laut. Alle verkaufen den Traum von "zehnfache Produktivität" — aber nach dem Testen dutzender Werkzeuge in echten Kundenprojekten über die letzten zwei Jahre kann ich Ihnen sagen, welche wirklich liefern.\n\n**Die Werkzeuge, die wirklich funktionieren:**\n\n**Ein universeller KI-Assistent** — Mein tägliches Werkzeug. Am besten für nuancierte Texte, komplexe Analysen und Codeerstellung. Wenn ich einem Kunden etwas Technisches erklären, ein Angebot schreiben oder bei einer kniffligen API-Integration Fehler suchen muss, fange ich damit an.\n\n**Ein KI-Programmierwerkzeug im Editor** — Wenn Sie Code schreiben, ist das der größte Produktivitätssprung, der heute verfügbar ist. Nicht nur Autocomplete — es versteht Ihre gesamte Codebasis und kann über mehrere Dateien hinweg schreiben, umstrukturieren und Fehler beheben. Ich habe Projekte gesehen, die zwei Wochen gedauert hätten und in vier Tagen fertig wurden.\n\n**Automatisierung: zuerst eigener Code** — Für die meisten Automatisierungen schreibe ich kleinen, gezielten Code, der auf meinem eigenen Server oder auf einer Serverless-Plattform wie Modal läuft. Er arbeitet rund um die Uhr und braucht kaum Aufsicht. Visuelle Werkzeuge wie n8n sind in manchen Fällen praktisch, aber solche Abläufe müssen oft überprüft werden, wenn etwas hängt. Deshalb wähle ich das Werkzeug je nach Projekt, nicht aus Gewohnheit.\n\n**Eine KI-Suche, die ihre Quellen nennt** — Für Recherche. Deutlich besser als eine klassische Suchmaschine, um schnell eine genaue Antwort mit Quellen zu bekommen. Spart 15-20 Minuten pro Recherche-Aufgabe.\n\n**Die Werkzeuge, die meistens nur Lärm sind:**\n\nDie meisten "KI-Schreibassistenten" produzieren generische, flache Inhalte, die mehr Nachbearbeitung brauchen als das Schreiben von Grund auf. KI-Bildgenerierung ist beeindruckend, aber im echten Geschäftskontext selten nützlich. Viele "KI-gestützte" SaaS-Werkzeuge haben nur eine dünne KI-Schicht draufgesetzt und verlangen das Dreifache.\n\n**Meine Regel:** Ein KI-Werkzeug verdient seinen Platz, wenn es mir mehr als 30 Minuten pro Woche spart. Wenden Sie diesen Filter an, und Ihre Liste wird sehr kurz — aber sehr nützlich.`,
    },
    {
      id: 'trustworthy-website',
      date: '7. Okt. 2026',
      readMin: 6,
      tag: 'Webentwicklung',
      title: 'Eine vertrauenswürdige Unternehmenswebsite aufbauen: Was wirklich zählt',
      excerpt: 'Geschwindigkeit, Klarheit und soziale Beweise sind die drei Säulen. Was ich beim Aufbau von Websites für lokale Unternehmen fokussiere.',
      content: `Ich habe Websites für Reinigungsfirmen, Anwaltskanzleien, Berater und SaaS-Jungunternehmen gebaut. Nach Dutzenden Projekten habe ich gelernt, dass die meisten "Gestaltungstrends" völlig irrelevant dafür sind, ob eine Website Besucher in Kunden verwandelt. Hier ist, was wirklich zählt.\n\n**1. Geschwindigkeit — nicht verhandelbar**\nGoogles Daten sind eindeutig: 53% der mobilen Besucher verlassen eine Seite, wenn sie länger als 3 Sekunden zum Laden braucht. Jede Sekunde Verzögerung kostet Kunden. Das bedeutet: optimierte Bilder, minimales JavaScript, richtiges Caching und eine Serverinfrastruktur, die nicht spart. Eine langsame Seite ist, egal wie schön, ein löchriger Eimer.\n\n**2. Klarheit in den ersten 5 Sekunden**\nWenn jemand auf Ihrer Website landet, stellt er sich drei Fragen: "Ist das für mich? Lösen die mein Problem? Kann ich ihnen vertrauen?" Ihre Startseite hat etwa fünf Sekunden, um alle drei zu beantworten. Das heißt: eine klare Überschrift, die das Problem benennt, eine einzige Handlungsaufforderung, und kein Fachjargon.\n\n**3. Soziale Beweise — konkret schlägt allgemein**\nKundenstimmen wie "Toller Service!" bewirken fast nichts. Kundenstimmen wie "Ich habe früher 6 Stunden pro Woche für Rechnungen gebraucht. Nach der Automatisierung von Chioutworks dauert es 20 Minuten." — die überzeugen. Konkretheit schafft Glaubwürdigkeit. Holen Sie sich die Zahlen, das Vorher-Nachher, das konkrete Ergebnis.\n\n**4. Zuerst fürs Smartphone, immer**\nIn den meisten Branchen kommen 60-70% des Besucherverkehrs von mobilen Geräten. Gestalten Sie zuerst fürs Handy. Jedes Element, jeder Button, jedes Formularfeld muss auf einem kleinen Bildschirm mit dem Daumen perfekt funktionieren.\n\n**5. Was weniger wichtig ist, als die meisten denken:**\n- Animationen und Mikro-Interaktionen sehen nett aus, bringen aber keine Abschlüsse\n- Trendige Farbschemata altern schlecht\n- Archivfotos sind unsichtbar — nutzen Sie echte Fotos Ihres Teams oder Ihrer Arbeit\n- "Auszeichnungs"-Bereiche, die niemand liest\n\n**Das Fazit:** Schnell, klar, glaubwürdig. Bauen Sie um diese drei Dinge herum, und Sie schlagen 90% Ihrer Konkurrenz-Websites.`,
    },
    {
      id: 'ship-worker-to-tech',
      date: '23. Sep. 2026',
      readMin: 7,
      tag: 'Persönlich',
      title: 'Von der Schiffsarbeit zum Technologie-Unternehmer: Was die harten Jahre lehrten',
      excerpt: 'In einem griechischen Dorf aufgewachsen, mit 18 Jahren auf Schiffen gearbeitet, mit 33 ein Technologieunternehmen in Deutschland aufgebaut — die Lektionen aus jeder Phase.',
      content: `Ich bin in Echinos aufgewachsen — einem kleinen Dorf in Xanthi, Griechenland. Mit 18, in der Zeit vor dem Wehrdienst, erlebte ich echte Schwierigkeiten. Einige Geschäftsleute aus unserem Dorf hatten Verbindungen zu Werftarbeiten in Deutschland, und notgedrungen wählte ich diesen Weg als schnellste Option — ich begann mit Schiffsarbeit. Ich kam an, sprach fast kein Deutsch, kannte fast niemanden. Die Arbeit war körperlich und erschöpfend — lange Stunden, schwierige Bedingungen, nicht das, was ich mir für mich vorgestellt hatte. Dort traf ich auch etliche gebildete, belesene Menschen — aber leider machten viele von ihnen Jahre später noch immer dieselbe Arbeit. Aber ich lernte etwas Wesentliches: Unbehagen ist Information. Jede schwierige Situation brachte mir etwas über mich selbst bei.\n\nNach dem Wehrdienst entschied ich mich, dauerhaft nach Deutschland zu ziehen. Die ersten Jahre waren wirklich schwierig. Ein Leben in einem neuen Land aufzubauen, ohne Netzwerk, mit begrenzten Sprachkenntnissen und ohne klaren beruflichen Weg — das erfordert eine Art Sturheit, die einen entweder bricht oder etwas in einem aufbaut.\n\nTechnologie hat mich immer angezogen. In meiner Freizeit las ich über Computer, experimentierte mit Code, schaute Tutorials. 2023 machte ich aus dieser Nebenbeschäftigung ein echtes Unternehmen. Ich begann mit Onlinehandel — Shopify, Streckengeschäft — weil es zugänglich war. Aber ich merkte schnell, dass das, was ich eigentlich liebte, die Infrastruktur hinter dem Shop war: die Automatisierungen, die Integrationen, die Systeme.\n\nDieser Wechsel zu Automatisierung und KI fühlte sich an wie Heimkommen.\n\n**Was mich die harten Jahre gelehrt haben:**\n\nErstens: Anpassungsfähigkeit ist eine Fähigkeit, keine Persönlichkeitseigenschaft. Man baut sie auf, indem man wiederholt gezwungen wird, sich anzupassen. Jedes neue Land, jede neue Sprache, jede neue Branche, die ich durchquert habe, hat mich schneller gemacht, die nächste zu lernen.\n\nZweitens: Die Lücke zwischen etwas zu wissen und etwas zu tun ist der Punkt, an dem die meisten Menschen stecken bleiben. Ich habe unglaublich intelligente Menschen gesehen, die nicht liefern können, weil sie auf perfekte Bedingungen warten. Perfekte Bedingungen kommen nicht. Man liefert von dort aus, wo man ist.\n\nDrittens: Jeder "schwierige" Hintergrund enthält Vorteile, die nicht sofort sichtbar sind. Die Arbeit auf Schiffen lehrte mich Disziplin, Toleranz für Unbehagen und die Fähigkeit, in chaotischen Umgebungen fokussiert zu bleiben. Das sind keine weiche Fähigkeiten — das sind operative Vorteile.\n\nDas Unternehmen, das ich jetzt aufbaue, ist klein. Aber es ist meins, und es ist auf etwas Echtem aufgebaut. Ich muss mich nicht überzeugen, dass es sich lohnt — ich weiß es bereits.`,
    },
  ],
  tr: [
    {"id": "ai-jobs-reality", "date": "19 Kas 2026", "readMin": 5, "tag": "YZ", "title": "Yapay zekâ hangi meslekleri değiştirecek? Gerçekçi bir bakış", "excerpt": "Manşetler işlerin yok olacağından söz ediyor. Veriler daha dengeli bir tablo çiziyor: meslekten çok görevler değişiyor ve yeni işler de doğuyor.", "content": "Her hafta yapay zekânın işlerimizi elimizden alacağını söyleyen yeni bir manşet çıkıyor. Gerçek tablo daha az dramatik ve çok daha faydalı.\n\n**Büyük araştırmalar ne diyor?**\n\nDünya Ekonomik Forumu’nun 55 ekonomide 1.000’den fazla işverenle hazırladığı **Future of Jobs 2025** raporu, 2030’a kadar yaklaşık **170 milyon yeni iş** ve yaklaşık **92 milyon işin ortadan kalkmasını** öngörüyor: net **78 milyon** iş artışı. Bugünkü işlerin yaklaşık **%22’si** ciddi biçimde değişecek.\n\nIMF’ye göre yapay zekâ dünyadaki işlerin yaklaşık **%40’ını**, gelişmiş ekonomilerde ise **%60’ını** etkileyecek. Etkilenmek kaybolmak demek değil: bu işlerin yaklaşık yarısı daha verimli hâle gelebilir, diğer yarısında talep azalabilir.\n\n**Hangi işler baskı altında?**\n\nİlk küçülen işler rutin ofis görevleri: veri girişi, basit muhasebe, randevu ayarlama, bir sistemden diğerine bilgi kopyalama. WEF’in en hızlı azalan meslekler listesinde kasiyerler, idari asistanlar ve muhasebe ile bordro memurları var.\n\n**Hangi işler büyüyor?**\n\nMuhakeme, güven ve insan ilişkisi gerektiren işler: danışmanlık, bakım, zanaat, satış ve uzmanlığını dijital araçlarla birleştirebilen herkes.\n\n**Küçük işletme için anlamı ne?**\n\nAsıl soru yapay zekânın ekibinizin yerini alıp almayacağı değil; hangi tekrarlayan görevleri devralıp ekibinize müşterileri için zaman bırakabileceği. Erken uyum sağlayan işletmeler genelde en çok kazananlar oluyor.\n\nİşletmenizde hangi görevlerin mantıklı biçimde otomatikleşebileceğini merak ediyorsanız kısa bir talep gönderin; ücretsiz yazılı değerlendirme alırsınız.", "sources": [{"t": "World Economic Forum — Future of Jobs Report 2025 (press release, 8 Jan 2025)", "url": "https://www.weforum.org/press/2025/01/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed-to-prepare-workforces/"}, {"t": "IMF — “AI Will Transform the Global Economy. Let’s Make Sure It Benefits Humanity” (14 Jan 2024)", "url": "https://www.imf.org/en/Blogs/Articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity"}]},
    {"id": "digital-or-decline", "date": "19 Kas 2026", "readMin": 4, "tag": "Dijitalleşme", "title": "Dijitalleşmeyen işletmeler neden gün geçtikçe eriyor?", "excerpt": "Bir işletme bir gecede kapanmaz; müşterileri yavaş yavaş, fark edilmeden daha hızlı ve ulaşılabilir rakiplere kayar. Bunu tersine çevirmek düşündüğünüzden kolay.", "content": "Acı ama gerçek: dijitalleşmeyen işletmeler bir gecede batmaz, gün gün erir. Müşteriler kapıyı çarpıp gitmez; sadece bir sonraki sefer başka bir yeri seçer.\n\n**Erime nasıl başlar?**\n\nMüşteri sizi internette arar ve bulamaz. Bulsa bile telefonla aramak zorunda kalır, açılmaz. Randevu için mesaj atar, cevap ertesi gün gelir. Bu arada rakip, sitesinden iki tıkla randevu verir ve hatırlatmayı otomatik gönderir. Kimse size \"gidiyorum\" demez; sadece daha az talep gelir.\n\n**Rakipler neyi hızlandırıyor?**\n\nEurostat’a göre AB’de yapay zekâ kullanan işletmelerin oranı 2024’te **%13,5** iken bir yıl sonra **%20**’ye çıktı. Büyük işletmeler bu araçları küçüklere göre neredeyse dört kat daha sık kullanıyor. Yani fark her yıl biraz daha açılıyor; beklemek, aslında geride kalmayı seçmek demek.\n\n**Müşteri ne bekliyor?**\n\nGoogle’da bulunmak, telefonda düzgün açılan bir site, gece de randevu alabilmek, hızlı ve net yanıt. Bunlar artık lüks değil, asgari beklenti.\n\n**İyi haber: büyük bir dönüşüm gerekmiyor**\n\nHer şeyi bir anda değiştirmeniz gerekmez. Size en çok zaman ve müşteri kaybettiren tek bir noktadan başlayın: sitesi olmayan için iyi bir site, telefonla boğulan için online randevu, teklif yazmaktan bunalan için otomatik teklif. Küçük bir adım, haftalar içinde fark yaratır.\n\nNereden başlamanız gerektiğini merak ediyorsanız kısa bir talep gönderin; ücretsiz yazılı değerlendirmede önce hangi adımın kazandıracağını size söyleyeyim.", "sources": [{"t": "Eurostat — Usage of AI technologies increasing in EU enterprises (23 Jan 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250123-3"}, {"t": "Eurostat — 20% of EU enterprises use AI technologies (11 Dec 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2"}]},
    {"id": "ai-benefits-risks", "date": "18 Kas 2026", "readMin": 5, "tag": "YZ", "title": "Yapay zekâ işletmeye gerçekte ne katar, riskleri nerede?", "excerpt": "Yapay zekâ zaman kazandırır ve müşterilere gece gündüz yanıt verir; ama hata da yapar ve veri korumayı ilgilendirir. İki tarafın dürüst listesi.", "content": "Yapay zekâ ne sihir ne de kendiliğinden tehlike. Doğru kullanılınca gerçek zaman kazandırır; özensiz kullanılınca yeni sorunlar yaratır.\n\n**Neler katar?**\n\n**Zaman:** taslaklar, özetler, çeviriler ve sık sorulan soruların yanıtları saniyeler içinde hazır.\n\n**Ulaşılabilirlik:** sitenizdeki asistan gece ve hafta sonu da yanıt verir, gerçek talepleri size iletir.\n\n**Diller:** ek personel olmadan müşteriler kendi dillerinde karşılanır.\n\n**Düzen:** teklif, hatırlatma ve takipler artık birinin hatırlamasına bağlı kalmaz.\n\n**Riskler nerede?**\n\n**Yanlış yanıtlar:** dil modelleri kendinden emin konuşup yine de yanılabilir. Önemli yanıtlara net sınırlar ve insan kontrolü gerekir.\n\n**Veri koruma:** müşteri verisi yalnızca uygun yasal dayanağı olan hizmetlere gitmeli; AB’de GDPR geçerli.\n\n**Bağımlılık:** bir araç fiyatını ya da koşullarını değiştirirse işiniz durmamalı. İyi kurulmuş sistemler sağlayıcı değiştirebilir.\n\n**Kötüye kullanım:** sahte sesler, sahte görseller ve dolandırıcılık girişimleri giderek inandırıcı oluyor; çalışanlar uyarı işaretlerini bilmeli.\n\n**Kurallar netleşiyor**\n\nAB **Yapay Zekâ Yasası** şeffaflık yükümlülükleri getiriyor: insanlara bir yapay zekâ sistemiyle konuştukları söylenmeli. Bu yükümlülükler **2 Ağustos 2026**’dan itibaren geçerli.\n\n**Yaklaşımım**\n\nYapay zekâyı açıkça zaman kazandırdığı yerde kullanıyorum, kararlarda insanı devrede tutuyorum ve yasal dayanağı net sağlayıcılar seçiyorum. Sizin için nasıl görünebileceğini merak ediyorsanız ücretsiz yazılı değerlendirme isteyin.", "sources": [{"t": "EUR-Lex — Regulation (EU) 2024/1689 (AI Act)", "url": "https://eur-lex.europa.eu/eli/reg/2024/1689/oj"}]},
    {"id": "small-business-ai-today", "date": "17 Kas 2026", "readMin": 4, "tag": "YZ", "title": "Küçük işletmeler yapay zekâyı bugün nasıl kullanıyor ve aradaki fark neden bir fırsat?", "excerpt": "Büyük şirketler yapay zekâyı küçüklere göre neredeyse dört kat daha sık kullanıyor. Küçük işletmelerin kazanabileceği yer tam da bu fark.", "content": "Pek çok küçük işletme sahibi yapay zekânın yalnızca büyük şirketlere göre olduğunu düşünüyor. Rakamlar fırsatın tam burada olduğunu gösteriyor.\n\n**Rakamlar**\n\nEurostat’a göre 2024’te AB’de 10 ve daha fazla çalışanı olan işletmelerin **%13,5’i** yapay zekâ kullandı. Bu oran büyük işletmelerde yaklaşık **%41**, küçüklerde yaklaşık **%11**. Bir yıl sonra genel oran şimdiden **%20**’ye çıktı.\n\n**Küçük işletmeler gerçekte ne için kullanıyor?**\n\nSitedeki sık sorulan soruları yanıtlamak, randevu hatırlatması göndermek, teklif ve e-posta taslağı hazırlamak, uzun mesajları özetlemek, metin çevirmek ve gelen talepleri sınıflandırmak.\n\n**Risksiz nasıl başlanır?**\n\nHer hafta size zaman kaybettiren **tek bir** süreç seçin. Bugün ne kadar sürdüğünü ölçün. Yalnızca o adımı otomatikleştirin, birkaç hafta sonuçlara bakın, sonra bir sonrakine karar verin. Büyük proje yok, uzun sözleşme yok.\n\n**Fark neden önemli?**\n\nRakiplerin çoğu hâlâ elle çalışırken kazandığınız her saat doğrudan daha iyi hizmete dönüşür. Müşteriler arkadaki teknolojiden çok önce daha hızlı yanıtları fark eder.\n\nNereden başlayacağınızdan emin değil misiniz? Günlük işinizi kısaca anlatın, hangi adımın önce kazandıracağını size yazılı olarak söyleyeyim.", "sources": [{"t": "Eurostat — Usage of AI technologies increasing in EU enterprises (23 Jan 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250123-3"}, {"t": "Eurostat — 20% of EU enterprises use AI technologies (11 Dec 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2"}]},
    {
      id: 'automate-5-processes',
      date: '4 Kas 2026',
      readMin: 5,
      tag: 'Otomasyon',
      title: 'Her küçük işletmenin otomatize etmesi gereken 5 süreç',
      excerpt: 'Fatura göndermeden potansiyel müşteri takibine kadar — küçük işletmelerde en çok zaman boşa harcayan beş iş akışı ve her birini bir günden kısa sürede nasıl çözeceğiniz.',
      content: `Konuştuğum küçük işletme sahiplerinin çoğu tekrarlayan işler içinde boğuluyor. Bir bilgisayarın saniyeler içinde halledebileceği şeylere saatler harcıyorlar. İşte en çok zaman kaybettiren beş şey — ve her birini nasıl otomatize edeceğiniz.\n\n**1. Fatura gönderimi ve ödeme hatırlatmaları**\nFaturaları elle oluşturup göndermek en büyük gizli zaman maliyetlerinden biri. Bir otomasyon platformu, bir proje CRM'de tamamlandı olarak işaretlendiği anda otomatik fatura oluşturmayı tetikleyebilir. Ödeme hatırlatmaları mı? Tamamen otomatik. Siz işe odaklanırsınız; sistem faturalamayı halleder.\n\n**2. Potansiyel müşteri takip dizileri**\nÇoğu potansiyel müşteri, kimse takip etmediği için soğuyor. Form doldurulduktan 24 saat sonra, sonra 3. gün, 7. gün ve 14. günde tetiklenen otomatik bir e-posta dizisi kurun. ActiveCampaign gibi araçlarla ya da basit bir otomasyon iş akışıyla bunun kurulumu iki saat sürer ve sonsuza kadar çalışır.\n\n**3. Sosyal medya planlaması**\nDüzenli paylaşım görünürlük için kritik ama kimsenin her gün giriş yapacak vakti yok. Buffer'ı ya da içerik takviminize bağlı basit bir otomasyon iş akışını kullanın. Paylaşımlarınızı haftada bir kez bir tabloya yazın; otomasyon yayınlamayı halleder.\n\n**4. Müşteri karşılama belgeleri**\nHer yeni müşteri bir hoş geldin e-postası, sözleşme, anket ve proje bilgilendirme notuna ihtiyaç duyar. Bir anlaşma CRM'de "kazanıldı" olarak işaretlendiğinde bunların hepsi otomatik tetiklenebilir — belgeler oluşturulur, imzaya gönderilir ve proje klasörü açılır.\n\n**5. Raporlama ve KPI panoları**\nHaftalık raporları elle hazırlamak analitik yeteneğin israfı. Veri kaynaklarınızı (Google Analytics, Stripe, CRM'iniz) Google Looker Studio veya Notion gibi bir pano aracına bağlayın. Her pazartesi sabahı gelen kutunuza düşen otomatik e-posta raporları kurun.\n\n**Özetle:** Bu otomasyonların her birinin kurulumu bir saat ile bir gün arasında sürer. Birlikte, haftada 8-15 saat kazandırabilirler. Bu, stratejiye, müşterilere ya da sadece dinlenmeye ayırabileceğiniz zaman demek. En çok canınızı yakan şeyden başlayın.`,
    },
    {
      id: 'ai-actually-saves-time',
      date: '21 Eki 2026',
      readMin: 4,
      tag: 'YZ',
      title: 'Gerçekten zaman kazandıran YZ araçları (moda sözcükler değil)',
      excerpt: 'Gerçek müşteri projelerinde onlarca YZ aracı test ettikten sonra — gerçek zaman tasarrufu sağlayanlar ve sadece gürültü olanlar.',
      content: `YZ araçları dünyası gürültülü. Herkes "10 kat verimlilik" hayali satıyor — ama son iki yılda gerçek müşteri projelerinde onlarca aracı test ettikten sonra, hangilerinin gerçekten işe yaradığını söyleyebilirim.\n\n**Gerçekten işe yarayan araçlar:**\n\n**Genel amaçlı bir YZ asistanı** — Günlük kullandığım araç. İnce ayrıntılı yazım, karmaşık analiz ve kod üretimi için en iyisi. Bir müşteriye teknik bir şeyi açıklamam, teklif yazmam ya da zor bir API entegrasyonunda hata ayıklamam gerektiğinde işe onunla başlarım.\n\n**Kod editöründe çalışan bir YZ aracı** — Kod yazıyorsanız, bugün mevcut en büyük verimlilik sıçraması bu. Sadece otomatik tamamlama değil — tüm kod tabanınızı anlıyor ve birden fazla dosyada aynı anda yazabiliyor, yeniden düzenleyebiliyor, hata ayıklayabiliyor. İki hafta sürecek projelerin dört günde bittiğini gördüm.\n\n**Otomasyon: önce özel kod** — Müşteri otomasyonlarının çoğu için kendi sunucumda ya da Modal gibi sunucusuz bir platformda çalışan küçük, amaca yönelik kod yazıyorum. Günün her saati çalışıyor ve neredeyse hiç başında beklemek gerekmiyor. n8n gibi görsel araçlar bazı durumlarda pratik, ama bu şekilde kurulan akışlar bir şey durduğunda sürekli kontrol gerektiriyor. Bu yüzden aracı alışkanlıkla değil, projeye göre seçiyorum.\n\n**Kaynak gösteren bir YZ arama aracı** — Araştırma için. Hızlı, kaynaklı ve doğru bir cevap almak için klasik bir arama motorundan çok daha iyi. Her araştırma görevinde 15-20 dakika kazandırıyor.\n\n**Çoğunlukla gürültü olan araçlar:**\n\nÇoğu "YZ yazım asistanı" sıfırdan yazmaktan daha fazla düzeltme gerektiren, sıradan ve yavan içerik üretiyor. YZ görsel üretimi etkileyici ama gerçek iş bağlamlarında nadiren kullanışlı. Birçok "YZ destekli" SaaS aracı sadece üzerine ince bir YZ katmanı geçirip fiyatı 3 katına çıkarıyor.\n\n**Kuralım:** Bir YZ aracı, bana haftada 30 dakikadan fazla kazandırıyorsa yerini hak eder. Bu filtreyi uygulayın, listeniz çok kısalır — ama çok işe yarar hale gelir.`,
    },
    {
      id: 'trustworthy-website',
      date: '7 Eki 2026',
      readMin: 6,
      tag: 'Web Geliştirme',
      title: 'Güven veren bir işletme web sitesi oluşturmak: Gerçekten önemli olan nedir',
      excerpt: 'Hız, netlik ve sosyal kanıt — üç temel sütun. Yerel işletmeler için web sitesi yaparken nelere odaklandığım ve çoğu "tasarım akımı"nin neden alakasız olduğu.',
      content: `Temizlik şirketleri, hukuk büroları, danışmanlar ve SaaS girişimleri için web siteleri yaptım. Onlarca projeden sonra, çoğu "tasarım akımı"nin bir web sitesinin ziyaretçileri müşteriye dönüştürüp dönüştürmemesiyle tamamen alakasız olduğunu öğrendim. İşte gerçekten önemli olan şey.\n\n**1. Hız — pazarlık konusu değil**\nGoogle'ın verileri net: mobil ziyaretçilerin %53'ü bir sayfa 3 saniyeden fazla yüklenirse sayfayı terk ediyor. Her saniyelik gecikme dönüşüme mal oluyor. Bu; optimize edilmiş görseller, minimum JavaScript, doğru önbellekleme ve kısıtlama yapmayan bir barındırma hizmeti demek. Ne kadar güzel olursa olsun yavaş bir site, delik bir kova gibidir.\n\n**2. İlk 5 saniyede netlik**\nBiri sitenize geldiğinde üç soru sorar: "Bu benim için mi? Sorunumu çözüyorlar mı? Onlara güvenebilir miyim?" Ana sayfanızın bu üçüne cevap vermek için yaklaşık beş saniyesi var. Bu; çözdüğünüz sorunu adlandıran net bir başlık, tek bir eylem çağrısı ve teknik terim içermemek demek.\n\n**3. Sosyal kanıt — spesifik olan genel olandan daha iyidir**\n"Harika hizmet!" diyen referanslar neredeyse hiçbir işe yaramaz. "Faturalama için haftada 6 saat harcıyordum. Chioutworks'ün otomasyonunu uyguladıktan sonra 20 dakika sürüyor." diyen referanslar dönüştürür. Spesifiklik inandırıcılık yaratır. Rakamları, öncesi-sonrasını, somut sonucu alın.\n\n**4. Her zaman mobil öncelikli**\nÇoğu sektörde trafiğin %60-70'i mobilden geliyor. Önce telefon için tasarlayın. Her öğe, her buton, her form alanı küçük bir ekranda başparmakla mükemmel çalışmalı.\n\n**5. Sanılandan daha az önemli olanlar:**\n- Animasyonlar ve mikro etkileşimler hoş görünür ama dönüşüm getirmez\n- Moda renk düzenleri çabuk eskir\n- Stok fotoğraflar görünmez — ekibinizin veya işinizin gerçek fotoğraflarını kullanın\n- Kimsenin okumadığı "ödüller" bölümleri\n\n**Özet:** Hızlı, net, güvenilir. Bu üç şeyin etrafında inşa edin, rakiplerinizin %90'ını geride bırakırsınız.`,
    },
    {
      id: 'ship-worker-to-tech',
      date: '23 Eyl 2026',
      readMin: 7,
      tag: 'Kişisel',
      title: 'Gemi işçisinden teknoloji girişimcisine: Zorlu yılların öğrettikleri',
      excerpt: "Yunan bir köyde büyümek, 18 yaşında gemilerde çalışmak, 33 yaşında Almanya'da teknoloji şirketi kurmak — her aşamadan dersler.",
      content: `Yunanistan'ın Xanthi ilindeki küçük bir köy olan Echinos'ta büyüdüm. 18 yaşımda, askerlik öncesi dönemim ciddi zorluklarla geçti. Köyümüzden iş adamlarının Almanya'daki tersanelerde bağlantıları vardı; mecburen en hızlı seçenek olan bu yolu seçtim ve gemi işçiliğine başladım. Neredeyse hiç Almanca bilmeden, kimseyi tanımadan vardım. İş fiziksel ve yorucuydu — uzun saatler, zor koşullar, kendim için hayal ettiğim şey değildi. Orada okumuş, kendini yetiştirmiş birçok insanla da tanıştım; ama ne yazık ki çoğu yıllar sonra hâlâ aynı işlerde hayatını sürdürüyordu. Ama önemli bir şey öğrendim: rahatsızlık bir bilgi kaynağıdır. Her zor durum bana kendim hakkında bir şey öğretiyordu.\n\nAskerlik sonrası kalıcı olarak Almanya'ya taşınma kararı aldım. İlk yıllar gerçekten zordu. Ağınız olmadan, sınırlı dille ve net bir kariyer yolu olmadan yeni bir ülkede hayat kurmak — ya sizi kıran ya da içinizde bir şey inşa eden bir tür inatçılık gerektirir.\n\nTeknoloji beni hep çekmişti. Boş zamanlarımda bilgisayarlar hakkında okuyor, kodla deney yapıyor, eğitim videoları izliyordum. 2023'te yan uğraş olan bu şeyi gerçek bir işe dönüştürdüm. E-ticaretle başladım — Shopify, stoksuz satış — çünkü erişilebilirdi. Ama kısa sürede asıl sevdiğim şeyin mağazanın arkasındaki altyapı olduğunu fark ettim: otomasyonlar, entegrasyonlar, sistemler.\n\nOtomasyon ve YZ'ye bu geçiş, eve dönmek gibi hissettirdi.\n\n**Zorlu yılların bana öğrettikleri:**\n\nBirincisi: uyum sağlamak bir kişilik özelliği değil, bir beceridir. Tekrar tekrar uyum sağlamaya zorlanarak inşa edilir. Geçtiğim her yeni ülke, dil ve sektör, bir sonrakini daha hızlı öğrenmemi sağladı.\n\nİkincisi: bir şeyi bilmekle onu yapmak arasındaki boşluk, çoğu insanın takıldığı yerdir. İnanılmaz zeki insanlar gördüm, mükemmel koşulları bekledikleri için bir türlü ortaya bir şey koyamıyorlar. Mükemmel koşullar gelmez. Bulunduğunuz yerden yola çıkarsınız.\n\nÜçüncüsü: her "zor" geçmiş, hemen görünmeyen avantajlar barındırır. Gemilerde çalışmak bana disiplin, rahatsızlığa tolerans ve kaotik ortamlarda odaklanabilme becerisi öğretti. Bunlar yumuşak beceriler değil — operasyonel avantajlardır.\n\nŞu an kurduğum iş küçük. Ama benim ve gerçek bir şey üzerine inşa edildi. Değmeye değer olduğuna kendimi ikna etmeme gerek yok — zaten biliyorum.`,
    },
  ],
  el: [
    {"id": "ai-jobs-reality", "date": "19 Νοε 2026", "readMin": 5, "tag": "ΤΝ", "title": "Ποια επαγγέλματα θα αλλάξει η τεχνητή νοημοσύνη; Μια ρεαλιστική ματιά", "excerpt": "Οι τίτλοι μιλούν για χαμένες δουλειές. Τα δεδομένα δείχνουν πιο σύνθετη εικόνα: οι εργασίες αλλάζουν πιο γρήγορα από ολόκληρα επαγγέλματα και δημιουργούνται νέες θέσεις.", "content": "Κάθε εβδομάδα ένας νέος τίτλος ισχυρίζεται ότι η τεχνητή νοημοσύνη θα μας πάρει τις δουλειές. Η πραγματική εικόνα είναι λιγότερο δραματική και πολύ πιο χρήσιμη.\n\n**Τι λένε οι μεγάλες μελέτες**\n\nΗ έκθεση **Future of Jobs 2025** του Παγκόσμιου Οικονομικού Φόρουμ, με βάση περισσότερους από 1.000 εργοδότες σε 55 οικονομίες, προβλέπει έως το 2030 περίπου **170 εκατομμύρια νέες** και περίπου **92 εκατομμύρια θέσεις που θα χαθούν**: καθαρό κέρδος περίπου **78 εκατομμυρίων**. Συνολικά περίπου το **22%** των σημερινών θέσεων θα αλλάξει σημαντικά.\n\nΤο ΔΝΤ εκτιμά ότι η τεχνητή νοημοσύνη θα επηρεάσει σχεδόν το **40% των θέσεων εργασίας παγκοσμίως** και περίπου το **60% στις ανεπτυγμένες οικονομίες**. Επηρεάζεται δεν σημαίνει χάνεται: περίπου οι μισές από αυτές τις θέσεις μπορεί να γίνουν πιο παραγωγικές, ενώ στις άλλες μισές η ζήτηση μπορεί να μειωθεί.\n\n**Ποια εργασία πιέζεται**\n\nΠρώτα συρρικνώνονται οι επαναλαμβανόμενες εργασίες γραφείου: καταχώριση δεδομένων, απλή λογιστική, προγραμματισμός ραντεβού, αντιγραφή στοιχείων από σύστημα σε σύστημα. Ανάμεσα στα επαγγέλματα με την ταχύτερη μείωση το WEF αναφέρει ταμίες, διοικητικούς βοηθούς και υπαλλήλους λογιστηρίου και μισθοδοσίας.\n\n**Ποια εργασία αυξάνεται**\n\nΕργασία που χρειάζεται κρίση, εμπιστοσύνη και ανθρώπους: συμβουλευτική, φροντίδα, τεχνικά επαγγέλματα, πωλήσεις και όσοι συνδυάζουν την εμπειρία τους με ψηφιακά εργαλεία.\n\n**Τι σημαίνει για μια μικρή επιχείρηση**\n\nΤο ερώτημα δεν είναι αν η τεχνητή νοημοσύνη θα αντικαταστήσει την ομάδα σας, αλλά ποιες επαναλαμβανόμενες εργασίες μπορεί να αναλάβει ώστε να μένει περισσότερος χρόνος για τους πελάτες. Όσοι προσαρμόζονται νωρίς συνήθως κερδίζουν περισσότερο.\n\nΘέλετε να μάθετε ποιες εργασίες στην επιχείρησή σας μπορούν να αυτοματοποιηθούν λογικά; Στείλτε μου ένα σύντομο αίτημα και θα λάβετε δωρεάν γραπτή αξιολόγηση.", "sources": [{"t": "World Economic Forum — Future of Jobs Report 2025 (press release, 8 Jan 2025)", "url": "https://www.weforum.org/press/2025/01/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed-to-prepare-workforces/"}, {"t": "IMF — “AI Will Transform the Global Economy. Let’s Make Sure It Benefits Humanity” (14 Jan 2024)", "url": "https://www.imf.org/en/Blogs/Articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity"}]},
    {"id": "digital-or-decline", "date": "19 Νοε 2026", "readMin": 4, "tag": "Ψηφιοποίηση", "title": "Γιατί οι επιχειρήσεις που δεν ψηφιοποιούνται σβήνουν σιγά σιγά", "excerpt": "Μια επιχείρηση σπάνια κλείνει μέσα σε μια νύχτα· οι πελάτες της φεύγουν αθόρυβα προς πιο γρήγορους και πιο εύκολους ανταγωνιστές. Η ανατροπή είναι πιο εύκολη απ’ όσο νομίζετε.", "content": "Είναι άβολο αλλά αληθινό: οι επιχειρήσεις που δεν ψηφιοποιούνται δεν αποτυγχάνουν μέσα σε μια νύχτα, σβήνουν μέρα με τη μέρα. Οι πελάτες δεν χτυπούν την πόρτα φεύγοντας· απλώς την επόμενη φορά διαλέγουν κάποιον άλλο.\n\n**Πώς ξεκινά το σβήσιμο**\n\nΈνας πελάτης σας ψάχνει στο διαδίκτυο και δεν σας βρίσκει. Ακόμη κι αν σας βρει, πρέπει να τηλεφωνήσει και κανείς δεν απαντά. Στέλνει μήνυμα για ραντεβού και η απάντηση έρχεται την επόμενη μέρα. Στο μεταξύ ο ανταγωνιστής κλείνει το ραντεβού με δύο κλικ στην ιστοσελίδα του και στέλνει αυτόματα υπενθύμιση. Κανείς δεν σας λέει ότι φεύγει· απλώς έρχονται λιγότερα αιτήματα.\n\n**Τι επιταχύνουν οι ανταγωνιστές**\n\nΣύμφωνα με τη Eurostat, το ποσοστό των επιχειρήσεων της ΕΕ που χρησιμοποιούν τεχνητή νοημοσύνη αυξήθηκε από **13,5%** το 2024 σε **20%** έναν χρόνο αργότερα. Οι μεγάλες εταιρείες χρησιμοποιούν αυτά τα εργαλεία σχεδόν τέσσερις φορές συχνότερα από τις μικρές. Η απόσταση μεγαλώνει κάθε χρόνο· η αναμονή στην πραγματικότητα σημαίνει να μένετε πίσω.\n\n**Τι περιμένουν οι πελάτες**\n\nΝα σας βρίσκουν στο Google, μια ιστοσελίδα που λειτουργεί στο κινητό, ραντεβού και τη νύχτα, γρήγορες και σαφείς απαντήσεις. Δεν είναι πια πολυτέλεια, είναι το ελάχιστο.\n\n**Τα καλά νέα: δεν χρειάζεται μεγάλη αλλαγή**\n\nΔεν χρειάζεται να αλλάξετε τα πάντα μονομιάς. Ξεκινήστε από το ένα σημείο που σας κοστίζει περισσότερο χρόνο και πελάτες: μια καλή ιστοσελίδα αν δεν έχετε, ηλεκτρονικά ραντεβού αν το τηλέφωνο δεν σταματά, αυτόματες προσφορές αν οι προσφορές τρώνε τα βράδια σας. Ένα μικρό βήμα κάνει τη διαφορά μέσα σε λίγες εβδομάδες.\n\nΣτείλτε μου ένα σύντομο αίτημα και θα λάβετε δωρεάν γραπτή αξιολόγηση για το από πού να ξεκινήσετε.", "sources": [{"t": "Eurostat — Usage of AI technologies increasing in EU enterprises (23 Jan 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250123-3"}, {"t": "Eurostat — 20% of EU enterprises use AI technologies (11 Dec 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2"}]},
    {"id": "ai-benefits-risks", "date": "18 Νοε 2026", "readMin": 5, "tag": "ΤΝ", "title": "Τι προσφέρει πραγματικά η τεχνητή νοημοσύνη σε μια επιχείρηση και πού βρίσκονται οι κίνδυνοι", "excerpt": "Η τεχνητή νοημοσύνη εξοικονομεί χρόνο και απαντά στους πελάτες όλο το εικοσιτετράωρο, αλλά κάνει και λάθη και αγγίζει την προστασία δεδομένων. Μια ειλικρινής λίστα και για τις δύο πλευρές.", "content": "Η τεχνητή νοημοσύνη δεν είναι ούτε μαγεία ούτε από μόνη της κίνδυνος. Με σωστή χρήση εξοικονομεί πραγματικό χρόνο· με απρόσεκτη χρήση δημιουργεί νέα προβλήματα.\n\n**Τι προσφέρει**\n\n**Χρόνο:** προσχέδια, περιλήψεις, μεταφράσεις και απαντήσεις σε συχνές ερωτήσεις είναι έτοιμα σε δευτερόλεπτα.\n\n**Διαθεσιμότητα:** ένας βοηθός στην ιστοσελίδα σας απαντά τη νύχτα και τα Σαββατοκύριακα και σας προωθεί τα πραγματικά αιτήματα.\n\n**Γλώσσες:** οι πελάτες εξυπηρετούνται στη γλώσσα τους χωρίς επιπλέον προσωπικό.\n\n**Συνέπεια:** προσφορές, υπενθυμίσεις και επανακλήσεις δεν εξαρτώνται πια από το αν θα τις θυμηθεί κάποιος.\n\n**Πού βρίσκονται οι κίνδυνοι**\n\n**Λάθος απαντήσεις:** τα γλωσσικά μοντέλα ακούγονται σίγουρα και παρ’ όλα αυτά μπορεί να κάνουν λάθος. Οι σημαντικές απαντήσεις χρειάζονται σαφή όρια και ανθρώπινο έλεγχο.\n\n**Προστασία δεδομένων:** τα δεδομένα πελατών πρέπει να πηγαίνουν μόνο σε υπηρεσίες με σωστή νομική βάση· στην ΕΕ ισχύει ο ΓΚΠΔ.\n\n**Εξάρτηση:** αν ένα εργαλείο αλλάξει τιμές ή όρους, η διαδικασία σας δεν πρέπει να σταματήσει. Οι καλές λύσεις μπορούν να αλλάξουν πάροχο.\n\n**Κατάχρηση:** ψεύτικες φωνές, ψεύτικες εικόνες και απόπειρες απάτης γίνονται όλο και πιο πειστικές· το προσωπικό πρέπει να γνωρίζει τα προειδοποιητικά σημάδια.\n\n**Οι κανόνες γίνονται σαφέστεροι**\n\nΟ **Κανονισμός της ΕΕ για την τεχνητή νοημοσύνη** φέρνει υποχρεώσεις διαφάνειας: οι άνθρωποι πρέπει να ενημερώνονται όταν μιλούν με σύστημα τεχνητής νοημοσύνης. Οι υποχρεώσεις αυτές ισχύουν από τις **2 Αυγούστου 2026**.\n\n**Η προσέγγισή μου**\n\nΧρησιμοποιώ την τεχνητή νοημοσύνη εκεί όπου εξοικονομεί σαφώς χρόνο, κρατώ τον άνθρωπο στις αποφάσεις και επιλέγω παρόχους με σαφή νομική βάση. Για να δείτε πώς θα μπορούσε να γίνει αυτό σε εσάς, ζητήστε δωρεάν γραπτή αξιολόγηση.", "sources": [{"t": "EUR-Lex — Regulation (EU) 2024/1689 (AI Act)", "url": "https://eur-lex.europa.eu/eli/reg/2024/1689/oj"}]},
    {"id": "small-business-ai-today", "date": "17 Νοε 2026", "readMin": 4, "tag": "ΤΝ", "title": "Πώς χρησιμοποιούν σήμερα την τεχνητή νοημοσύνη οι μικρές επιχειρήσεις και γιατί η απόσταση είναι ευκαιρία", "excerpt": "Οι μεγάλες εταιρείες χρησιμοποιούν την τεχνητή νοημοσύνη σχεδόν τέσσερις φορές συχνότερα από τις μικρές. Ακριβώς σε αυτή την απόσταση μπορούν να κερδίσουν οι μικρές επιχειρήσεις.", "content": "Πολλοί ιδιοκτήτες μικρών επιχειρήσεων πιστεύουν ότι η τεχνητή νοημοσύνη είναι μόνο για τις μεγάλες εταιρείες. Οι αριθμοί δείχνουν ότι εκεί ακριβώς βρίσκεται η ευκαιρία.\n\n**Οι αριθμοί**\n\nΣύμφωνα με τη Eurostat, το 2024 το **13,5%** των επιχειρήσεων της ΕΕ με 10 ή περισσότερους εργαζόμενους χρησιμοποίησε τεχνητή νοημοσύνη. Στις μεγάλες επιχειρήσεις το ποσοστό ήταν περίπου **41%**, στις μικρές περίπου **11%**. Έναν χρόνο αργότερα το συνολικό ποσοστό είχε ήδη φτάσει το **20%**.\n\n**Για τι τη χρησιμοποιούν πραγματικά οι μικρές επιχειρήσεις**\n\nΓια απαντήσεις σε συχνές ερωτήσεις στην ιστοσελίδα, υπενθυμίσεις ραντεβού, προσχέδια προσφορών και email, περιλήψεις μεγάλων μηνυμάτων, μεταφράσεις και ταξινόμηση εισερχόμενων αιτημάτων.\n\n**Πώς να ξεκινήσετε χωρίς ρίσκο**\n\nΔιαλέξτε **μία** διαδικασία που σας κοστίζει χρόνο κάθε εβδομάδα. Μετρήστε πόσο διαρκεί σήμερα. Αυτοματοποιήστε μόνο αυτό το βήμα, ελέγξτε τα αποτελέσματα για μερικές εβδομάδες και μετά αποφασίστε για το επόμενο. Χωρίς μεγάλο έργο, χωρίς μακροχρόνιο συμβόλαιο.\n\n**Γιατί μετράει η απόσταση**\n\nΌταν οι περισσότεροι ανταγωνιστές δουλεύουν ακόμη με το χέρι, κάθε ώρα που κερδίζετε πηγαίνει κατευθείαν σε καλύτερη εξυπηρέτηση. Οι πελάτες προσέχουν τις γρηγορότερες απαντήσεις πολύ πριν προσέξουν την τεχνολογία πίσω τους.\n\nΔεν είστε σίγουροι από πού να ξεκινήσετε; Περιγράψτε μου σύντομα την καθημερινή σας δουλειά και θα σας πω γραπτώς ποιο βήμα αποδίδει πρώτο.", "sources": [{"t": "Eurostat — Usage of AI technologies increasing in EU enterprises (23 Jan 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250123-3"}, {"t": "Eurostat — 20% of EU enterprises use AI technologies (11 Dec 2025)", "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2"}]},
    {
      id: 'automate-5-processes',
      date: '4 Νοε 2026',
      readMin: 5,
      tag: 'Αυτοματισμός',
      title: '5 διαδικασίες που κάθε μικρή επιχείρηση πρέπει να αυτοματοποιήσει',
      excerpt: 'Από αποστολή τιμολογίων μέχρι παρακολούθηση υποψήφιων πελατών — οι πέντε ροές εργασίας που χάνουν τον περισσότερο χρόνο και πώς να τις διορθώσετε σε λιγότερο από μια μέρα.',
      content: `Οι περισσότεροι ιδιοκτήτες μικρών επιχειρήσεων με τους οποίους μιλάω πνίγονται σε επαναλαμβανόμενες εργασίες. Ξοδεύουν ώρες κάνοντας πράγματα που ένας υπολογιστής θα μπορούσε να κάνει σε δευτερόλεπτα. Ακολουθούν οι πέντε πιο συνηθισμένοι «καταναλωτές χρόνου» — και πώς να αυτοματοποιήσετε καθέναν.\n\n**1. Αποστολή τιμολογίων και υπενθυμίσεις πληρωμής**\nΗ χειροκίνητη δημιουργία και αποστολή τιμολογίων είναι ένα από τα μεγαλύτερα κρυφά κόστη χρόνου. Μια πλατφόρμα αυτοματισμού μπορεί να ενεργοποιήσει αυτόματη δημιουργία τιμολογίου μόλις ένα έργο σημειωθεί ως ολοκληρωμένο στο CRM σας. Υπενθυμίσεις πληρωμής; Πλήρως αυτοματοποιημένες. Εσείς επικεντρώνεστε στη δουλειά· το σύστημα αναλαμβάνει τη χρέωση.\n\n**2. Ακολουθίες παρακολούθησης υποψήφιων πελατών**\nΟι περισσότεροι υποψήφιοι πελάτες «κρυώνουν» επειδή κανείς δεν επανήλθε σε αυτούς. Δημιουργήστε μια αυτοματοποιημένη ακολουθία μηνυμάτων ηλεκτρονικού ταχυδρομείου που ενεργοποιείται 24 ώρες μετά την υποβολή μιας φόρμας, και ξανά την 3η, 7η και 14η ημέρα. Με εργαλεία όπως το ActiveCampaign ή ακόμα και μια απλή ροή αυτοματισμού, η ρύθμιση παίρνει δύο ώρες και λειτουργεί για πάντα.\n\n**3. Προγραμματισμός κοινωνικών δικτύων**\nΗ συνεπής δημοσίευση είναι κλειδί για την προβολή, αλλά κανείς δεν έχει χρόνο να συνδέεται καθημερινά. Χρησιμοποιήστε το Buffer ή μια απλή ροή αυτοματισμού συνδεδεμένη με το ημερολόγιο περιεχομένου σας. Γράψτε τις δημοσιεύσεις σας μία φορά την εβδομάδα σε ένα υπολογιστικό φύλλο· η αυτοματοποίηση αναλαμβάνει τη δημοσίευση.\n\n**4. Έγγραφα ένταξης πελατών**\nΚάθε νέος πελάτης χρειάζεται ένα μήνυμα καλωσορίσματος, σύμβαση, ερωτηματολόγιο και ενημερωτικό σημείωμα έργου. Όλα αυτά μπορούν να ενεργοποιηθούν αυτόματα όταν μια συμφωνία σημειωθεί ως «κερδισμένη» στο CRM — δημιουργώντας τα έγγραφα, στέλνοντάς τα για υπογραφή και δημιουργώντας τον φάκελο του έργου.\n\n**5. Αναφορές και πίνακες ελέγχου KPI**\nΗ χειροκίνητη δημιουργία εβδομαδιαίων αναφορών είναι σπατάλη αναλυτικού ταλέντου. Συνδέστε τις πηγές δεδομένων σας (Google Analytics, Stripe, το CRM σας) με ένα εργαλείο πινάκων ελέγχου όπως το Google Looker Studio ή το Notion. Ρυθμίστε αυτοματοποιημένες αναφορές μέσω ηλεκτρονικού ταχυδρομείου που φτάνουν στα εισερχόμενά σας κάθε Δευτέρα πρωί.\n\n**Το συμπέρασμα:** Κάθε μία από αυτές τις αυτοματοποιήσεις παίρνει από μία ώρα έως μία ημέρα για να ρυθμιστεί. Συνολικά, μπορούν να σας εξοικονομήσουν 8–15 ώρες την εβδομάδα. Χρόνος που μπορείτε να αφιερώσετε σε στρατηγική, πελάτες, ή απλώς να μην δουλεύετε. Ξεκινήστε από αυτό που σας πονάει περισσότερο αυτή τη στιγμή.`,
    },
    {
      id: 'ai-actually-saves-time',
      date: '21 Οκτ 2026',
      readMin: 4,
      tag: 'ΤΝ',
      title: 'Εργαλεία ΤΝ που πραγματικά εξοικονομούν χρόνο (όχι απλώς κενές λέξεις της μόδας)',
      excerpt: 'Μετά από δοκιμή δεκάδων εργαλείων ΤΝ σε πραγματικά έργα πελατών — αυτά που προσφέρουν πραγματική εξοικονόμηση χρόνου.',
      content: `Το τοπίο των εργαλείων ΤΝ είναι θορυβώδες. Όλοι πουλάνε το όνειρο της «δεκαπλάσιας παραγωγικότητας» — αλλά μετά από δοκιμή δεκάδων εργαλείων σε πραγματικά έργα πελατών τα τελευταία δύο χρόνια, μπορώ να σας πω ποια πραγματικά αποδίδουν.\n\n**Τα εργαλεία που πραγματικά δουλεύουν:**\n\n**Ένας γενικής χρήσης βοηθός ΤΝ** — Το καθημερινό μου εργαλείο. Το καλύτερο για λεπτομερή κείμενα, σύνθετη ανάλυση και δημιουργία κώδικα. Όταν χρειάζεται να εξηγήσω κάτι τεχνικό σε πελάτη, να γράψω πρόταση ή να διορθώσω μια δύσκολη ενσωμάτωση API, ξεκινάω από αυτόν.\n\n**Ένα εργαλείο ΤΝ προγραμματισμού μέσα στον επεξεργαστή κώδικα** — Αν γράφετε κώδικα, αυτό είναι το μεγαλύτερο άλμα παραγωγικότητας που υπάρχει σήμερα. Δεν είναι απλώς αυτόματη συμπλήρωση — καταλαβαίνει ολόκληρη τη βάση κώδικά σας και μπορεί να γράψει, να αναδιαμορφώσει και να διορθώσει σε πολλαπλά αρχεία ταυτόχρονα. Έχω δει έργα που θα έπαιρναν δύο εβδομάδες να ολοκληρώνονται σε τέσσερις μέρες.\n\n**Αυτοματοποίηση: πρώτα δικός μου κώδικας** — Για τις περισσότερες αυτοματοποιήσεις γράφω μικρό, στοχευμένο κώδικα που τρέχει στον δικό μου διακομιστή ή σε μια serverless πλατφόρμα όπως το Modal. Λειτουργεί όλο το εικοσιτετράωρο και σπάνια χρειάζεται επίβλεψη. Οπτικά εργαλεία όπως το n8n είναι χρήσιμα σε ορισμένες περιπτώσεις, αλλά τέτοιες ροές θέλουν συνεχή έλεγχο όταν κάτι σταματά. Γι' αυτό επιλέγω το εργαλείο ανάλογα με το έργο, όχι από συνήθεια.\n\n**Μια αναζήτηση ΤΝ που αναφέρει τις πηγές της** — Για έρευνα. Πολύ καλύτερη από μια κλασική μηχανή αναζήτησης για γρήγορη, ακριβή απάντηση με πηγές. Εξοικονομεί 15-20 λεπτά ανά εργασία έρευνας.\n\n**Τα εργαλεία που είναι κυρίως θόρυβος:**\n\nΟι περισσότεροι «βοηθοί γραφής ΤΝ» παράγουν γενικό, επίπεδο περιεχόμενο που χρειάζεται περισσότερη επεξεργασία από το να γράψετε από την αρχή. Η δημιουργία εικόνων ΤΝ είναι εντυπωσιακή αλλά σπάνια χρήσιμη σε πραγματικά επιχειρηματικά πλαίσια. Πολλά εργαλεία SaaS «με τεχνητή νοημοσύνη» απλώς έχουν ένα λεπτό στρώμα ΤΝ κολλημένο πάνω και χρεώνουν 3 φορές παραπάνω.\n\n**Ο κανόνας μου:** Ένα εργαλείο ΤΝ κερδίζει τη θέση του αν μου εξοικονομεί πάνω από 30 λεπτά την εβδομάδα. Ξεκινήστε με αυτό το φίλτρο και η λίστα σας γίνεται πολύ σύντομη — αλλά πολύ χρήσιμη.`,
    },
    {
      id: 'trustworthy-website',
      date: '7 Οκτ 2026',
      readMin: 6,
      tag: 'Ανάπτυξη Ιστού',
      title: 'Δημιουργία αξιόπιστης εταιρικής ιστοσελίδας: Τι πραγματικά μετράει',
      excerpt: 'Ταχύτητα, σαφήνεια και κοινωνική απόδειξη — οι τρεις πυλώνες. Τι εστιάζω κατά τη δημιουργία ιστοσελίδων για τοπικές επιχειρήσεις.',
      content: `Έχω φτιάξει ιστοσελίδες για εταιρείες καθαρισμού, δικηγορικά γραφεία, συμβούλους και νεοφυείς επιχειρήσεις SaaS. Μετά από δεκάδες έργα, έμαθα ότι οι περισσότερες «τάσεις σχεδιασμού» είναι εντελώς άσχετες με το αν μια ιστοσελίδα μετατρέπει επισκέπτες σε πελάτες. Ακολουθεί τι πραγματικά μετράει.\n\n**1. Ταχύτητα — δεν διαπραγματεύεται**\nΤα δεδομένα της Google είναι ξεκάθαρα: το 53% των επισκεπτών από κινητά φεύγει αν μια σελίδα αργεί πάνω από 3 δευτερόλεπτα να φορτώσει. Κάθε δευτερόλεπτο καθυστέρησης κοστίζει σε μετατροπές. Αυτό σημαίνει: βελτιστοποιημένες εικόνες, ελάχιστο JavaScript, σωστή προσωρινή αποθήκευση, και φιλοξενία που δεν κάνει εκπτώσεις. Μια αργή ιστοσελίδα, όσο όμορφη κι αν είναι, είναι ένας κουβάς με τρύπα.\n\n**2. Σαφήνεια στα πρώτα 5 δευτερόλεπτα**\nΌταν κάποιος φτάνει στην ιστοσελίδα σας, κάνει τρεις ερωτήσεις: «Είναι αυτό για μένα; Λύνουν το πρόβλημά μου; Μπορώ να τους εμπιστευτώ;» Η αρχική σας σελίδα έχει περίπου πέντε δευτερόλεπτα να απαντήσει και στις τρεις. Αυτό σημαίνει: έναν σαφή τίτλο που ονομάζει το πρόβλημα που λύνετε, μία μοναδική προτροπή για δράση, και καθόλου ορολογία.\n\n**3. Κοινωνική απόδειξη — το συγκεκριμένο νικά το γενικό**\nΜαρτυρίες που λένε «Άριστη εξυπηρέτηση!» δεν κάνουν σχεδόν τίποτα. Μαρτυρίες που λένε «Ξόδευα 6 ώρες την εβδομάδα σε τιμολόγια. Μετά την αυτοματοποίηση της Chioutworks, μου παίρνει 20 λεπτά.» — αυτές μετατρέπουν. Η συγκεκριμενοποίηση δημιουργεί αξιοπιστία. Πάρτε τους αριθμούς, το πριν/μετά, το συγκεκριμένο αποτέλεσμα.\n\n**4. Πρώτα για κινητά, πάντα**\nΣτους περισσότερους κλάδους, το 60-70% της κίνησης προέρχεται από κινητά. Σχεδιάστε πρώτα για το κινητό. Κάθε στοιχείο, κάθε κουμπί, κάθε πεδίο φόρμας πρέπει να λειτουργεί τέλεια σε μια μικρή οθόνη με τον αντίχειρα.\n\n**5. Τι δεν έχει τόση σημασία όσο νομίζουν οι περισσότεροι:**\n- Τα κινούμενα εφέ και οι μικροαλληλεπιδράσεις φαίνονται ωραία αλλά δεν φέρνουν μετατροπές\n- Τα μοντέρνα χρωματικά σχήματα γερνάνε άσχημα\n- Οι φωτογραφίες αρχείου είναι αόρατες — χρησιμοποιήστε πραγματικές φωτογραφίες της ομάδας ή της δουλειάς σας\n- Ενότητες «βραβείων» που κανείς δεν διαβάζει\n\n**Η ουσία:** Γρήγορο, σαφές, αξιόπιστο. Χτίστε γύρω από αυτά τα τρία και θα ξεπεράσετε το 90% του ανταγωνισμού.`,
    },
    {
      id: 'ship-worker-to-tech',
      date: '23 Σεπ 2026',
      readMin: 7,
      tag: 'Προσωπικό',
      title: 'Από δουλειά σε πλοία σε τεχνολόγο επιχειρηματία: Τι με δίδαξαν τα δύσκολα χρόνια',
      excerpt: 'Μεγάλωσα σε ελληνικό χωριό, εργάστηκα σε πλοία στα 18, έχτισα εταιρεία τεχνολογίας στη Γερμανία στα 33 — τα μαθήματα από κάθε φάση.',
      content: `Μεγάλωσα στο Έχινος — ένα μικρό χωριό στην Ξάνθη. Στα 18 μου, στην περίοδο πριν τη στρατιωτική θητεία, πέρασα πραγματικές δυσκολίες. Κάποιοι επιχειρηματίες από το χωριό μας είχαν διασυνδέσεις με δουλειές σε ναυπηγεία στη Γερμανία, και αναγκαστικά διάλεξα αυτόν τον δρόμο ως την πιο γρήγορη επιλογή — ξεκίνησα δουλειά σε πλοία. Έφτασα μιλώντας σχεδόν καθόλου γερμανικά, χωρίς να ξέρω σχεδόν κανέναν. Η δουλειά ήταν σωματική και εξαντλητική — μεγάλες ώρες, δύσκολες συνθήκες, όχι αυτό που είχα φανταστεί για τον εαυτό μου. Εκεί γνώρισα και αρκετούς μορφωμένους, καλλιεργημένους ανθρώπους — αλλά δυστυχώς, πολλοί από αυτούς έκαναν ακόμα την ίδια δουλειά χρόνια αργότερα. Αλλά έμαθα κάτι ουσιώδες: η δυσφορία είναι πληροφορία. Κάθε δύσκολη κατάσταση μου δίδασκε κάτι για τον εαυτό μου.\n\nΜετά τη στρατιωτική θητεία, πήρα την απόφαση να μετακομίσω μόνιμα στη Γερμανία. Τα πρώτα χρόνια ήταν πραγματικά δύσκολα. Το να χτίσεις μια ζωή σε μια νέα χώρα χωρίς δίκτυο, με περιορισμένη γλώσσα και χωρίς σαφή επαγγελματικό δρόμο — απαιτεί ένα είδος πείσματος που είτε σε σπάει είτε χτίζει κάτι μέσα σου.\n\nΗ τεχνολογία με τραβούσε πάντα. Στον ελεύθερο χρόνο μου διάβαζα για υπολογιστές, πειραματιζόμουν με κώδικα, έβλεπα εκπαιδευτικά βίντεο. Το 2023, μετέτρεψα αυτό που ήταν μια πάρεργη εμμονή σε πραγματική επιχείρηση. Ξεκίνησα με ηλεκτρονικό εμπόριο — Shopify, πωλήσεις χωρίς απόθεμα — γιατί ήταν προσβάσιμο. Αλλά γρήγορα συνειδητοποίησα ότι αυτό που πραγματικά αγαπούσα ήταν η υποδομή πίσω από το κατάστημα: οι αυτοματοποιήσεις, οι ενσωματώσεις, τα συστήματα.\n\nΑυτή η στροφή προς την αυτοματοποίηση και το ΤΝ ένιωθε σαν να γυρνάω σπίτι.\n\n**Τι με δίδαξαν τα δύσκολα χρόνια:**\n\nΠρώτον: η προσαρμοστικότητα είναι δεξιότητα, όχι χαρακτηριστικό προσωπικότητας. Την χτίζεις αναγκαζόμενος να προσαρμόζεσαι, ξανά και ξανά. Κάθε νέα χώρα, γλώσσα και κλάδος που έχω περάσει με έκανε πιο γρήγορο στο να μαθαίνω τον επόμενο.\n\nΔεύτερον: το κενό ανάμεσα στο να ξέρεις κάτι και στο να το κάνεις είναι εκεί που κολλάνε οι περισσότεροι. Έχω δει απίστευτα έξυπνους ανθρώπους που δεν μπορούν να παραδώσουν επειδή περιμένουν τέλειες συνθήκες. Οι τέλειες συνθήκες δεν έρχονται. Παραδίδεις από εκεί που βρίσκεσαι.\n\nΤρίτον: κάθε «δύσκολο» παρελθόν κρύβει πλεονεκτήματα που δεν είναι αμέσως ορατά. Η δουλειά στα πλοία μου δίδαξε πειθαρχία, ανοχή στη δυσφορία και ικανότητα συγκέντρωσης σε χαοτικά περιβάλλοντα. Αυτά δεν είναι μαλακές δεξιότητες — είναι επιχειρησιακά πλεονεκτήματα.\n\nΗ επιχείρηση που χτίζω τώρα είναι μικρή. Αλλά είναι δική μου, και είναι χτισμένη πάνω σε κάτι πραγματικό. Δεν χρειάζεται να πείσω τον εαυτό μου ότι αξίζει τον κόπο — ήδη το ξέρω.`,
    },
  ],
};

// ── LANGUAGES ─────────────────────────────────────────────────────────────────
export const LANG_HEADER: Record<Lang, { eyebrow: string; title: string }> = {
  en: { eyebrow: 'Languages', title: 'Speaking your language — literally' },
  de: { eyebrow: 'Sprachen', title: 'Ihre Sprache sprechen — wörtlich' },
  tr: { eyebrow: 'Diller', title: 'Sizin dilinizde konuşmak — gerçek anlamda' },
  el: { eyebrow: 'Γλώσσες', title: 'Μιλώ τη γλώσσα σας — κυριολεκτικά' },
};

export const LANGUAGES: Record<Lang, { name: string; level: string; pct: number }[]> = {
  en: [
    { name: 'Turkish', level: 'Native', pct: 100 },
    { name: 'Greek', level: 'Native', pct: 100 },
    { name: 'German', level: 'Intermediate', pct: 60 },
    { name: 'English', level: 'Intermediate', pct: 60 },
    { name: 'Bulgarian', level: 'Conversational', pct: 40 },
  ],
  de: [
    { name: 'Türkisch', level: 'Muttersprache', pct: 100 },
    { name: 'Griechisch', level: 'Muttersprache', pct: 100 },
    { name: 'Deutsch', level: 'Mittelstufe', pct: 60 },
    { name: 'Englisch', level: 'Mittelstufe', pct: 60 },
    { name: 'Bulgarisch', level: 'Konversation', pct: 40 },
  ],
  tr: [
    { name: 'Türkçe', level: 'Ana Dil', pct: 100 },
    { name: 'Yunanca', level: 'Ana Dil', pct: 100 },
    { name: 'Almanca', level: 'Orta Seviye', pct: 60 },
    { name: 'İngilizce', level: 'Orta Seviye', pct: 60 },
    { name: 'Bulgarca', level: 'Konuşma Seviyesi', pct: 40 },
  ],
  el: [
    { name: 'Τουρκικά', level: 'Μητρική', pct: 100 },
    { name: 'Ελληνικά', level: 'Μητρική', pct: 100 },
    { name: 'Γερμανικά', level: 'Μέσο Επίπεδο', pct: 60 },
    { name: 'Αγγλικά', level: 'Μέσο Επίπεδο', pct: 60 },
    { name: 'Βουλγαρικά', level: 'Συνομιλία', pct: 40 },
  ],
};

// ── CONTACT ───────────────────────────────────────────────────────────────────
export const CONTACT: Record<Lang, {
  eyebrow: string;
  title: string;
  sub: string;
  addressLabel: string;
  legalLabel: string;
  address: string;
  legal: string;
  cta: string;
  formTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  dateLabel: string;
  dateHint: string;
  timeLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  requiredError: string;
  noDateError: string;
  successTitle: string;
  successMessage: string;
}> = {
  en: {
    eyebrow: 'Contact',
    title: "Work with me.",
    sub: 'Open to projects, questions, and collaborations. Describe what you need and you get a free written assessment with a tailored list of solutions — no meeting required.',
    addressLabel: 'Address',
    legalLabel: 'Legal',
    address: 'Waldstraße 124E, 65451 Kelsterbach, Germany',
    legal: 'Small business under §19 of the German VAT Act (UStG) · no VAT charged',
    cta: 'Send your request',
    formTitle: 'Send your request',
    nameLabel: 'Full name',
    namePlaceholder: 'Jane Doe',
    emailLabel: 'Email',
    emailPlaceholder: 'jane@company.com',
    phoneLabel: 'Phone',
    phonePlaceholder: '+49 15xx xxx xxxx',
    addressPlaceholder: 'Street, city, country',
    dateLabel: 'Preferred date',
    dateHint: 'Greyed-out days are fully booked.',
    timeLabel: 'Preferred time',
    messageLabel: 'What do you need? (optional)',
    messagePlaceholder: 'Briefly describe your project or question…',
    submitLabel: 'Send request',
    requiredError: 'Please fill in all required fields.',
    noDateError: 'Please pick an available date.',
    successTitle: 'Request sent',
    successMessage: 'Thanks — I will review your request and send you a written assessment, as soon as possible.',
  },
  de: {
    eyebrow: 'Kontakt',
    title: 'Arbeiten Sie mit mir.',
    sub: 'Offen für Projekte, Fragen und Kooperationen. Beschreiben Sie Ihr Anliegen und Sie erhalten eine kostenlose schriftliche Einschätzung mit maßgeschneiderter Lösungsliste — ganz ohne Termin.',
    addressLabel: 'Adresse',
    legalLabel: 'Rechtliches',
    address: 'Waldstraße 124E, 65451 Kelsterbach, Deutschland',
    legal: 'Kleinunternehmer gem. §19 UStG · Umsatzsteuerbefreiung',
    cta: 'Anfrage senden',
    formTitle: 'Anfrage senden',
    nameLabel: 'Vollständiger Name',
    namePlaceholder: 'Max Mustermann',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'max@firma.de',
    phoneLabel: 'Telefon',
    phonePlaceholder: '+49 15xx xxx xxxx',
    addressPlaceholder: 'Straße, Stadt, Land',
    dateLabel: 'Wunschtermin',
    dateHint: 'Ausgegraute Tage sind bereits ausgebucht.',
    timeLabel: 'Wunschzeit',
    messageLabel: 'Worum geht es? (optional)',
    messagePlaceholder: 'Beschreiben Sie kurz Ihr Projekt oder Ihre Frage…',
    submitLabel: 'Anfrage senden',
    requiredError: 'Bitte füllen Sie alle Pflichtfelder aus.',
    noDateError: 'Bitte wählen Sie ein verfügbares Datum.',
    successTitle: 'Anfrage gesendet',
    successMessage: 'Danke — ich prüfe Ihre Anfrage und sende Ihnen eine schriftliche Einschätzung, so schnell wie möglich.',
  },
  tr: {
    eyebrow: 'İletişim',
    title: 'Benimle çalışın.',
    sub: 'Projeler, sorular ve iş birlikleri için açığım. İhtiyacınızı anlatın, size özel çözüm listesiyle ücretsiz yazılı değerlendirme göndereyim — toplantıya gerek yok.',
    addressLabel: 'Adres',
    legalLabel: 'Yasal',
    address: 'Waldstraße 124E, 65451 Kelsterbach, Almanya',
    legal: 'Alman KDV Kanunu §19 kapsamında küçük işletme · KDV muafiyeti',
    cta: 'Talebinizi gönderin',
    formTitle: 'Talebinizi gönderin',
    nameLabel: 'Ad Soyad',
    namePlaceholder: 'Ayşe Yılmaz',
    emailLabel: 'E-posta',
    emailPlaceholder: 'ayse@sirket.com',
    phoneLabel: 'Telefon',
    phonePlaceholder: '+49 15xx xxx xxxx',
    addressPlaceholder: 'Sokak, şehir, ülke',
    dateLabel: 'Tercih edilen tarih',
    dateHint: 'Soluk günler doludur.',
    timeLabel: 'Tercih edilen saat',
    messageLabel: 'Neye ihtiyacınız var? (opsiyonel)',
    messagePlaceholder: 'Projenizi veya sorunuzu kısaca yazın…',
    submitLabel: 'Talebi gönder',
    requiredError: 'Lütfen tüm zorunlu alanları doldurun.',
    noDateError: 'Lütfen müsait bir tarih seçin.',
    successTitle: 'Talebiniz alındı',
    successMessage: 'Teşekkürler — talebinizi inceleyip size yazılı değerlendirmeyi en kısa sürede göndereceğim.',
  },
  el: {
    eyebrow: 'Επικοινωνία',
    title: 'Συνεργαστείτε μαζί μου.',
    sub: 'Ανοιχτός σε έργα, ερωτήσεις και συνεργασίες. Περιγράψτε τι χρειάζεστε και θα λάβετε δωρεάν γραπτή αξιολόγηση με εξατομικευμένη λίστα λύσεων — χωρίς συνάντηση.',
    addressLabel: 'Διεύθυνση',
    legalLabel: 'Νομικά',
    address: 'Waldstraße 124E, 65451 Kelsterbach, Γερμανία',
    legal: 'Μικρή επιχείρηση βάσει §19 του γερμανικού νόμου ΦΠΑ · Απαλλαγή ΦΠΑ',
    cta: 'Στείλτε το αίτημά σας',
    formTitle: 'Στείλτε το αίτημά σας',
    nameLabel: 'Ονοματεπώνυμο',
    namePlaceholder: 'Μαρία Παπαδοπούλου',
    emailLabel: 'Ηλεκτρονικό ταχυδρομείο',
    emailPlaceholder: 'maria@etaireia.gr',
    phoneLabel: 'Τηλέφωνο',
    phonePlaceholder: '+49 15xx xxx xxxx',
    addressPlaceholder: 'Οδός, πόλη, χώρα',
    dateLabel: 'Προτιμώμενη ημερομηνία',
    dateHint: 'Οι γκριζαρισμένες ημέρες είναι πλήρεις.',
    timeLabel: 'Προτιμώμενη ώρα',
    messageLabel: 'Τι χρειάζεστε; (προαιρετικό)',
    messagePlaceholder: 'Περιγράψτε σύντομα το έργο ή την ερώτησή σας…',
    submitLabel: 'Αποστολή αιτήματος',
    requiredError: 'Συμπληρώστε όλα τα υποχρεωτικά πεδία.',
    noDateError: 'Επιλέξτε μια διαθέσιμη ημερομηνία.',
    successTitle: 'Το αίτημα εστάλη',
    successMessage: 'Ευχαριστώ — θα εξετάσω το αίτημά σας και θα σας στείλω γραπτή αξιολόγηση, το συντομότερο δυνατό.',
  },
};
