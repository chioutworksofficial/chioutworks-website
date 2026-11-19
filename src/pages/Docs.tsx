import { useEffect as useHashEffect, useState as useHashState } from 'react';
import { useEffect, useState } from 'react';
import LegalLayout from './LegalLayout';
import { useLang } from '../hooks/useLang';
import { DOCS_META } from '../data/legalTranslations';

const SECTIONS_EN = [
  { id: 'overview',   label: 'Overview' },
  { id: 'automation', label: 'Automation' },
  { id: 'web',        label: 'Web Development' },
  { id: 'ai',         label: 'AI Integration' },
  { id: 'strategy',   label: 'Digital Strategy' },
  { id: 'process',    label: 'How I work' },
  { id: 'faq',        label: 'FAQ' },
  { id: 'hosting',    label: 'Hosting & data location' },
  { id: 'imprint',    label: 'Imprint' },
];
const SECTIONS_DE = [
  { id: 'overview',   label: 'Übersicht' },
  { id: 'automation', label: 'Automatisierung' },
  { id: 'web',        label: 'Webentwicklung' },
  { id: 'ai',         label: 'KI-Integration' },
  { id: 'strategy',   label: 'Digitalstrategie' },
  { id: 'process',    label: 'Wie ich arbeite' },
  { id: 'faq',        label: 'FAQ' },
  { id: 'hosting',    label: 'Hosting & Datenstandort' },
  { id: 'imprint',    label: 'Impressum' },
];
const SECTIONS_TR = [
  { id: 'overview',   label: 'Genel Bakış' },
  { id: 'automation', label: 'Otomasyon' },
  { id: 'web',        label: 'Web Geliştirme' },
  { id: 'ai',         label: 'YZ Entegrasyonu' },
  { id: 'strategy',   label: 'Dijital Strateji' },
  { id: 'process',    label: 'Nasıl çalışıyorum' },
  { id: 'faq',        label: 'SSS' },
  { id: 'hosting',    label: 'Barındırma ve veri konumu' },
  { id: 'imprint',    label: 'Künye' },
];
const SECTIONS_EL = [
  { id: 'overview',   label: 'Επισκόπηση' },
  { id: 'automation', label: 'Αυτοματισμός' },
  { id: 'web',        label: 'Ανάπτυξη Ιστού' },
  { id: 'ai',         label: 'Ενσωμάτωση ΤΝ' },
  { id: 'strategy',   label: 'Ψηφιακή Στρατηγική' },
  { id: 'process',    label: 'Πώς εργάζομαι' },
  { id: 'faq',        label: 'Συχνές ερωτήσεις' },
  { id: 'hosting',    label: 'Φιλοξενία και τοποθεσία δεδομένων' },
  { id: 'imprint',    label: 'Στοιχεία εκδότη' },
];

const SIDEBAR_MAP = { en: SECTIONS_EN, de: SECTIONS_DE, tr: SECTIONS_TR, el: SECTIONS_EL } as const;

export default function Docs() {
  // Footer "Impressum" link opens /…/docs#imprint: jump to that section once it is rendered
  useHashEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 120);
    return () => window.clearTimeout(t);
  }, []);
  const [lang] = useLang();
  const meta = DOCS_META[lang];
  const sidebar = SIDEBAR_MAP[lang];
  const [active, setActive] = useState('overview');
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const io = new IntersectionObserver(es => {
      const v = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (v) setActive(v.target.id);
    }, { rootMargin: '-90px 0px -60% 0px' });
    sidebar.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [sidebar]);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <LegalLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 64 }}>
        {/* Sidebar */}
        <nav style={{ width: 220, flexShrink: 0, position: 'sticky', top: 100, alignSelf: 'flex-start', padding: '48px 0' }} className="max-md:hidden">
          <p style={{ fontFamily: 'var(--lq-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)', margin: '0 0 18px' }}>
            {lang === 'tr' ? 'İçindekiler' : lang === 'de' ? 'Inhalt' : lang === 'el' ? 'Περιεχόμενα' : 'Contents'}
          </p>
          {sidebar.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{
              display: 'block', width: '100%', textAlign: 'left', position: 'relative',
              fontFamily: 'var(--lq-font)', fontSize: 14, fontWeight: 500,
              padding: '8px 0 8px 16px', border: 'none', cursor: 'pointer', background: 'transparent',
              color: active === s.id ? 'var(--lq-white)' : 'var(--lq-silver)',
              transition: 'color 0.12s',
            }}>
              <span aria-hidden style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, borderRadius: 2, background: active === s.id ? 'var(--lq-gradient)' : 'var(--lq-line)' }} />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{ flex: 1, padding: 'clamp(56px, 9vh, 96px) 0 120px', minWidth: 0, maxWidth: 760 }}>
          <p style={{ fontFamily: 'var(--lq-mono)', fontSize: 11, color: 'var(--lq-silver)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 24px' }}>
            docs
          </p>
          <h1 style={{ fontWeight: 500, fontSize: 'clamp(44px, 5vw, 61px)', lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: '0 0 24px' }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lq-silver)', margin: '0 0 72px' }}>{meta.subtitle}</p>

          <DocSection id="overview" lang={lang}>
            {{
              en: <><P>Chioutworks is a one-person digital consultancy based in Kelsterbach, Germany. Founded in 2023, focusing on automation, AI integration and web development for SMBs across Germany, Turkey, Greece and international markets.</P><P>All services are delivered personally by Chousein Chiout — from modern web technologies and automation platforms to AI language models.</P><InfoBox>{`Chioutworks uses the German small-business scheme (§19 UStG) — no VAT on invoices. The written assessment is always free.`}</InfoBox></>,
              de: <><P>Chioutworks ist eine Einzelperson-Digitalberatung in Kelsterbach, Deutschland. Gegründet 2023, mit Fokus auf Automatisierung, KI-Integration und Webentwicklung für KMU in Deutschland, der Türkei, Griechenland und international.</P><P>Alle Leistungen erbringt Chousein Chiout persönlich — von modernen Webtechnologien über Automatisierungsplattformen bis zu KI-Sprachmodellen.</P><InfoBox>{`Chioutworks ist Kleinunternehmer gem. §19 UStG — keine MwSt. auf Rechnungen. Die schriftliche Einschätzung ist immer kostenlos.`}</InfoBox></>,
              tr: <><P>Chioutworks, Almanya'nın Kelsterbach şehrinde kurulu tek kişilik bir dijital danışmanlık şirketidir. 2023'te kurulan şirket, Almanya, Türkiye, Yunanistan ve uluslararası pazarlarda KOBİ'lere otomasyon, YZ entegrasyonu ve web geliştirme hizmetleri sunmaktadır.</P><P>Tüm hizmetler bizzat Chousein Chiout tarafından sunulur — modern web teknolojilerinden otomasyon platformlarına ve yapay zekâ dil modellerine kadar.</P><InfoBox>{`Chioutworks, Alman KDV Kanunu'nun 19. maddesi kapsamında küçük işletmedir — faturalara KDV uygulanmaz. Yazılı değerlendirme her zaman ücretsizdir.`}</InfoBox></>,
              el: <><P>Η Chioutworks είναι μονοπρόσωπη ψηφιακή συμβουλευτική στο Kelsterbach, Γερμανία. Ιδρύθηκε το 2023 με εστίαση στον αυτοματισμό, ενσωμάτωση AI και ανάπτυξη ιστοσελίδων για ΜΜΕ.</P><P>Όλες οι υπηρεσίες παρέχονται προσωπικά από τον Chousein Chiout — από σύγχρονες τεχνολογίες ιστού και πλατφόρμες αυτοματισμού έως γλωσσικά μοντέλα τεχνητής νοημοσύνης.</P><InfoBox>{`Η Chioutworks υπάγεται στο γερμανικό καθεστώς μικρών επιχειρήσεων (§19 UStG) — δεν επιβάλλεται ΦΠΑ. Η γραπτή αξιολόγηση είναι πάντα δωρεάν.`}</InfoBox></>,
            }[lang]}
          </DocSection>

          <DocSection id="automation" lang={lang}>
            {{
              en: <><P>Replace repetitive manual tasks with systems that run 24/7. Common use cases:</P><ul><Li>CRM automation — auto-create deals, send follow-up emails, update records</Li><Li>Invoice & document generation triggered on deal close or form submission</Li><Li>Lead routing — qualify, assign, notify automatically</Li><Li>Scheduled reporting dashboards from multiple data sources</Li><Li>Multi-platform sync (Notion, Airtable, Google Sheets, CRMs)</Li></ul><P>Built on automation platforms and custom scripts.</P></>,
              de: <><P>Ersetzen Sie manuelle Aufgaben durch Systeme, die rund um die Uhr laufen. Häufige Anwendungsfälle:</P><ul><Li>CRM-Automatisierung — Deals automatisch anlegen, Follow-up-E-Mails, Datensätze aktualisieren</Li><Li>Rechnungs- und Dokumentengenerierung beim Vertragsabschluss</Li><Li>Weiterleitung von Interessenten — qualifizieren, zuweisen, benachrichtigen</Li><Li>Automatisierte Berichts-Dashboards aus mehreren Quellen</Li><Li>Multi-Plattform-Sync (Notion, Airtable, Google Sheets)</Li></ul><P>Umgesetzt mit Automatisierungsplattformen und individuellen Skripten.</P></>,
              tr: <><P>Manuel tekrarlayan görevleri 7/24 çalışan sistemlerle değiştirin:</P><ul><Li>CRM otomasyonu — anlaşma oluşturma, takip e-postaları, kayıt güncelleme</Li><Li>Anlaşma kapanışında otomatik fatura/belge oluşturma</Li><Li>Potansiyel müşteri yönlendirme — otomatik kalifikasyon ve atama</Li><Li>Birden fazla kaynaktan zamanlanmış raporlama</Li><Li>Çoklu platform senkronizasyonu</Li></ul><P>Otomasyon platformları ve özel betiklerle hayata geçirilir.</P></>,
              el: <><P>Αντικαταστήστε επαναλαμβανόμενες χειροκίνητες εργασίες με συστήματα 24/7:</P><ul><Li>Αυτοματισμός CRM — δημιουργία συμφωνιών, μηνύματα παρακολούθησης, ενημέρωση εγγραφών</Li><Li>Αυτόματη δημιουργία τιμολογίων και εγγράφων</Li><Li>Δρομολόγηση υποψήφιων πελατών — αυτόματη αξιολόγηση και ανάθεση</Li><Li>Αυτοματοποιημένες αναφορές από πολλαπλές πηγές</Li></ul><P>Υλοποιείται με πλατφόρμες αυτοματισμού και προσαρμοσμένα σενάρια.</P></>,
            }[lang]}
          </DocSection>

          <DocSection id="web" lang={lang}>
            {{
              en: <><P>Clean, fast, conversion-focused websites and web apps. Everything mobile-first and performance-optimised.</P><ul><Li>Landing pages and corporate websites (modern web frameworks)</Li><Li>SaaS dashboards and internal tools</Li><Li>E-commerce stores (Shopify, custom)</Li><Li>API integrations and backend logic (Node.js, PostgreSQL)</Li></ul><P>Modern cloud hosting — zero-downtime deployments, global CDN — with managed databases.</P></>,
              de: <><P>Saubere, schnelle, conversionstarke Websites und Web-Apps. Alles mobile-first und performance-optimiert.</P><ul><Li>Zielseiten und Unternehmenswebsites (moderne Web-Frameworks)</Li><Li>SaaS-Dashboards und interne Tools</Li><Li>E-Commerce-Shops (Shopify, individuell)</Li><Li>API-Integrationen und Backend-Logik (Node.js)</Li></ul><P>Modernes Cloud-Hosting und verwaltete Datenbanken.</P></>,
              tr: <><P>Temiz, hızlı ve dönüşüm odaklı web siteleri ve uygulamalar. Her şey mobil öncelikli ve performans optimize edilmiş.</P><ul><Li>Açılış sayfaları ve kurumsal web siteleri (modern web çatıları)</Li><Li>SaaS panolar ve dahili araçlar</Li><Li>E-ticaret mağazaları (Shopify, özel)</Li><Li>API entegrasyonları ve backend (Node.js)</Li></ul><P>Modern bulut barındırma ve yönetilen veritabanları.</P></>,
              el: <><P>Καθαρές, γρήγορες ιστοσελίδες και εφαρμογές με εστίαση στη μετατροπή.</P><ul><Li>Σελίδες προορισμού και εταιρικές ιστοσελίδες (σύγχρονες τεχνολογίες ιστού)</Li><Li>Πίνακες ελέγχου SaaS και εσωτερικά εργαλεία</Li><Li>Ηλεκτρονικό εμπόριο (Shopify, εξατομικευμένο)</Li><Li>Ενσωματώσεις API και λογική διακομιστή (Node.js)</Li></ul><P>Σύγχρονη φιλοξενία στο υπολογιστικό νέφος και διαχειριζόμενες βάσεις δεδομένων.</P></>,
            }[lang]}
          </DocSection>

          <DocSection id="ai" lang={lang}>
            {{
              en: <><P>Practical AI — not buzzwords:</P><ul><Li>Customer support chatbots (RAG-based, trained on your docs)</Li><Li>Content generation pipelines (blog posts, product descriptions)</Li><Li>CV/document parsing with structured data extraction</Li><Li>Internal AI assistants connected to your CRM or knowledge base</Li><Li>Prompt engineering and LLM API integration</Li></ul><InfoBox>All AI features are built GDPR-compliant with clear opt-out and data minimisation.</InfoBox></>,
              de: <><P>Praktische KI — keine Worthülsen:</P><ul><Li>Kundensupport-Chatbots (RAG-basiert, auf Ihren Dokumenten trainiert)</Li><Li>Content-Generierungs-Pipelines (Blogartikel, Produktbeschreibungen)</Li><Li>CV-/Dokumenten-Parsing mit strukturierter Datenextraktion</Li><Li>Interne KI-Assistenten für CRM oder Wissensbasis</Li><Li>Prompt-Engineering und LLM-API-Integration</Li></ul><InfoBox>Alle KI-Funktionen werden DSGVO-konform entwickelt.</InfoBox></>,
              tr: <><P>Pratik YZ — moda sözcükler değil:</P><ul><Li>Müşteri destek chatbotları (RAG tabanlı, belgelerinizle eğitilmiş)</Li><Li>İçerik üretim hatları (blog yazıları, ürün açıklamaları)</Li><Li>CV/belge ayrıştırma ve yapılandırılmış veri çıkarımı</Li><Li>CRM'inize bağlı dahili YZ asistanları</Li><Li>İstem mühendisliği ve LLM API entegrasyonu</Li></ul><InfoBox>Tüm YZ özellikleri GDPR uyumlu inşa edilmektedir.</InfoBox></>,
              el: <><P>Πρακτική ΤΝ — χωρίς φούσκες:</P><ul><Li>Βοηθοί συνομιλίας υποστήριξης πελατών (βασισμένοι σε RAG)</Li><Li>Αυτοματοποιημένη δημιουργία περιεχομένου</Li><Li>Ανάλυση CV και εγγράφων με εξαγωγή δεδομένων</Li><Li>Εσωτερικοί AI βοηθοί συνδεδεμένοι με CRM</Li><Li>Ενσωμάτωση LLM API</Li></ul><InfoBox>Όλες οι λειτουργίες AI κατασκευάζονται σύμφωνα με GDPR.</InfoBox></>,
            }[lang]}
          </DocSection>

          <DocSection id="strategy" lang={lang}>
            {{
              en: <><ul><Li>KPI dashboards and analytics setup (Google Looker Studio, custom)</Li><Li>Tech stack recommendations and vendor selection</Li><Li>SEO foundation (technical SEO, Core Web Vitals)</Li><Li>Growth experiment design and analysis</Li><Li>Competitor and market analysis</Li></ul></>,
              de: <><ul><Li>KPI-Dashboards und Analytics-Aufbau (Google Looker Studio)</Li><Li>Tech-Stack-Empfehlungen und Anbieterauswahl</Li><Li>SEO-Grundlagen (technisches SEO, Core Web Vitals)</Li><Li>Wachstumsexperiment-Design und -Analyse</Li><Li>Wettbewerbs- und Marktanalyse</Li></ul></>,
              tr: <><ul><Li>KPI panoları ve analitik kurulumu</Li><Li>Teknoloji yığını tavsiyeleri ve tedarikçi seçimi</Li><Li>SEO temeli (teknik SEO, Core Web Vitals)</Li><Li>Büyüme deneyi tasarımı ve analizi</Li><Li>Rakip ve pazar analizi</Li></ul></>,
              el: <><ul><Li>Πίνακες ελέγχου KPI και ρύθμιση αναλυτικών</Li><Li>Συστάσεις τεχνολογικής υποδομής και επιλογή παρόχου</Li><Li>SEO θεμέλιο (τεχνικό SEO, Core Web Vitals)</Li><Li>Σχεδιασμός και ανάλυση πειραμάτων ανάπτυξης</Li><Li>Ανάλυση ανταγωνισμού και αγοράς</Li></ul></>,
            }[lang]}
          </DocSection>

          <DocSection id="process" lang={lang}>
            {{
              en: <>
                <Step n="01" title="Send your request">Describe what you need via the contact form, voice or chat. You get a free written assessment with a tailored list of solutions. No meeting, no commitment.</Step>
                <Step n="02" title="Written plan & quote">Every project is assessed individually; the price follows the scope and effort and is stated clearly in the written offer. No hidden costs.</Step>
                <Step n="03" title="Execution">Work in focused sprints with regular updates. Full visibility.</Step>
                <Step n="04" title="Delivery & Handover">Full handover with documentation. You own everything — code, credentials, accounts.</Step>
              </>,
              de: <>
                <Step n="01" title="Anfrage senden">Beschreiben Sie Ihr Anliegen per Kontaktformular, Sprache oder Chat. Sie erhalten eine kostenlose schriftliche Einschätzung mit maßgeschneiderter Lösungsliste. Ohne Termin, ohne Verpflichtung.</Step>
                <Step n="02" title="Schriftlicher Plan & Angebot">Jedes Projekt wird einzeln bewertet; der Preis richtet sich nach Umfang und Aufwand und steht klar im schriftlichen Angebot. Keine versteckten Kosten.</Step>
                <Step n="03" title="Umsetzung">Arbeit in fokussierten Zyklen mit regelmäßigen Updates.</Step>
                <Step n="04" title="Lieferung & Übergabe">Vollständige Übergabe mit Dokumentation. Sie besitzen alles.</Step>
              </>,
              tr: <>
                <Step n="01" title="Talebinizi gönderin">İhtiyacınızı iletişim formu, ses veya sohbet ile anlatın. Size özel çözüm listesiyle ücretsiz yazılı değerlendirme gönderilir. Toplantı yok, taahhüt yok.</Step>
                <Step n="02" title="Yazılı plan ve teklif">Her proje ayrı değerlendirilir; ücret kapsama ve iş yüküne göre belirlenir ve yazılı teklifte açıkça yazar. Gizli maliyet yok.</Step>
                <Step n="03" title="Uygulama">Düzenli güncellemelerle odaklı kısa döngülerle çalışma.</Step>
                <Step n="04" title="Teslimat ve Devir">Belgelerle tam devir. Her şey size ait — kod, kimlik bilgileri, hesaplar.</Step>
              </>,
              el: <>
                <Step n="01" title="Στείλτε το αίτημά σας">Περιγράψτε τι χρειάζεστε μέσω φόρμας, φωνής ή συνομιλίας. Λαμβάνετε δωρεάν γραπτή αξιολόγηση με εξατομικευμένη λίστα λύσεων. Χωρίς συνάντηση, χωρίς δέσμευση.</Step>
                <Step n="02" title="Γραπτό σχέδιο & προσφορά">Κάθε έργο αξιολογείται ξεχωριστά· η τιμή καθορίζεται από το εύρος και τον φόρτο εργασίας και αναγράφεται ξεκάθαρα στη γραπτή προσφορά. Χωρίς κρυφές χρεώσεις.</Step>
                <Step n="03" title="Υλοποίηση">Εργασία σε σύντομους κύκλους με τακτικές ενημερώσεις.</Step>
                <Step n="04" title="Παράδοση">Πλήρης παράδοση με τεκμηρίωση. Όλα ανήκουν σε εσάς.</Step>
              </>,
            }[lang]}
          </DocSection>

          <DocSection id="faq" lang={lang}>
            {{
              en: <FAQ items={[
                ['Do you work with clients outside Germany?', 'Yes. Communication is in writing, by e-mail and the contact form. Clients in Turkey, Greece and the UK are welcome. Invoicing in EUR.'],
                ['What languages do you work in?', 'Turkish (native), Greek (native), German (intermediate), English (intermediate).'],
                ['Is the written assessment free?', 'Yes — always, no strings attached. A short call is only arranged later if it is truly necessary.'],
                ['Do you charge VAT?', 'No. Chioutworks uses the German small-business scheme (§19 UStG), so no VAT is charged.'],
                ['What if I am not satisfied?', 'All projects include a revision phase. If delivery does not match scope, I fix it at no extra cost.'],
              ]} />,
              de: <FAQ items={[
                ['Arbeiten Sie auch mit Kunden außerhalb Deutschlands?', 'Ja. Kommunikation schriftlich per E-Mail und Kontaktformular. Kunden aus der Türkei, Griechenland und UK willkommen.'],
                ['In welchen Sprachen arbeiten Sie?', 'Türkisch (Muttersprache), Griechisch (Muttersprache), Deutsch (Mittelstufe), Englisch (Mittelstufe).'],
                ['Ist die schriftliche Einschätzung wirklich kostenlos?', 'Ja — immer, ohne Verpflichtung. Ein kurzes Telefonat wird nur später vereinbart, wenn es wirklich nötig ist.'],
                ['Stellen Sie Mehrwertsteuer in Rechnung?', 'Nein. Chioutworks ist Kleinunternehmer gem. §19 UStG.'],
                ['Was passiert, wenn ich nicht zufrieden bin?', 'Alle Projekte beinhalten eine Revisionsphase.'],
              ]} />,
              tr: <FAQ items={[
                ['Almanya dışındaki müşterilerle çalışıyor musunuz?', 'Evet. İletişim yazılı olarak, e-posta ve iletişim formu üzerinden yürür. Türkiye, Yunanistan ve diğer ülkelerden müşteriler hoş karşılanır.'],
                ['Hangi dillerde çalışıyorsunuz?', 'Türkçe (ana dil), Yunanca (ana dil), Almanca (orta), İngilizce (orta).'],
                ['Yazılı değerlendirme gerçekten ücretsiz mi?', 'Evet — her zaman, hiçbir taahhüt olmaksızın. Kısa bir telefon görüşmesi ancak gerçekten gerekirse sonradan ayarlanır.'],
                ['KDV alıyor musunuz?', 'Hayır. Chioutworks, Alman KDV Kanunu\'nun 19. maddesi kapsamında küçük işletmedir; faturalara KDV eklenmez.'],
                ['Memnun kalmazsam ne olur?', 'Tüm projeler bir revizyon aşaması içerir.'],
              ]} />,
              el: <FAQ items={[
                ['Εργάζεστε με πελάτες εκτός Γερμανίας?', 'Ναι. Η επικοινωνία γίνεται γραπτά, μέσω email και της φόρμας επικοινωνίας. Πελάτες από Ελλάδα, Τουρκία και αλλού.'],
                ['Σε ποιες γλώσσες εργάζεστε?', 'Τουρκικά (μητρική), Ελληνικά (μητρική), Γερμανικά (μέσο), Αγγλικά (μέσο).'],
                ['Είναι δωρεάν η γραπτή αξιολόγηση;', 'Ναι — πάντα, χωρίς δέσμευση. Ένα σύντομο τηλεφώνημα κανονίζεται αργότερα μόνο αν είναι πραγματικά απαραίτητο.'],
                ['Χρεώνετε ΦΠΑ?', 'Όχι. Η Chioutworks υπάγεται στο γερμανικό καθεστώς μικρών επιχειρήσεων (§19 UStG).'],
                ['Τι γίνεται αν δεν είμαι ικανοποιημένος?', 'Όλα τα έργα περιλαμβάνουν φάση αναθεώρησης.'],
              ]} />,
            }[lang]}
          </DocSection>

          <DocSection id="hosting" lang={lang}>
            {{
              en: <><P><strong>This website:</strong> runs on Vercel (US company; server functions in Frankfurt, EU), the database is Supabase (US company; database in Frankfurt, EU), the domain is registered with Hostinger. Details are in the privacy policy.</P><P><strong>Client projects:</strong> the providers are chosen per project, depending on what you need and what you prefer: for example US providers with servers set to Frankfurt (such as Vercel, Supabase or Modal), or servers in Germany / the EU (such as Hetzner, IONOS or Hostinger). These are only examples; I also work with many other similar tools and services. If you want everything in Germany with an EU company, I set it up that way.</P><InfoBox>Your offer lists every external provider used in your project, the country of the company and where your data is stored. Contracts for data processing (GDPR) are in place with each of them.</InfoBox></>,
              de: <><P><strong>Diese Website:</strong> läuft auf Vercel (US-Unternehmen; Serverfunktionen in Frankfurt, EU), die Datenbank ist Supabase (US-Unternehmen; Datenbank in Frankfurt, EU), die Domain ist bei Hostinger registriert. Details stehen in der Datenschutzerklärung.</P><P><strong>Kundenprojekte:</strong> Die Anbieter werden je nach Projekt, Bedarf und Ihren Wünschen gewählt: z. B. US-Anbieter mit Serverstandort Frankfurt (etwa Vercel, Supabase oder Modal) oder Server in Deutschland / der EU (etwa Hetzner, IONOS oder Hostinger). Das sind nur Beispiele; ich arbeite auch mit vielen weiteren vergleichbaren Tools und Diensten. Wenn Sie alles in Deutschland bei einem EU-Unternehmen wünschen, richte ich es so ein.</P><InfoBox>Ihr Angebot nennt jeden externen Anbieter in Ihrem Projekt, das Land des Unternehmens und wo Ihre Daten gespeichert werden. Mit jedem besteht ein Auftragsverarbeitungsvertrag (DSGVO).</InfoBox></>,
              tr: <><P><strong>Bu site:</strong> Vercel üzerinde çalışır (ABD'li şirket; sunucu fonksiyonları Frankfurt'ta, AB), veritabanı Supabase'tedir (ABD'li şirket; veritabanı Frankfurt'ta, AB), alan adı Hostinger'a kayıtlıdır. Ayrıntılar gizlilik politikasında.</P><P><strong>Müşteri projeleri:</strong> Sağlayıcılar projeye, ihtiyaca ve tercihinize göre seçilir: örneğin sunucusu Frankfurt'a ayarlı ABD'li sağlayıcılar (Vercel, Supabase, Modal gibi) ya da Almanya / AB'de sunucular (Hetzner, IONOS, Hostinger gibi). Bunlar yalnızca örnek; bunlar gibi daha birçok araç ve hizmetle de çalışıyorum. Her şeyin Almanya'da ve bir AB şirketinde olmasını isterseniz öyle kurarım.</P><InfoBox>Teklifinizde projede kullanılan her dış sağlayıcı, şirketin ülkesi ve verilerinizin nerede durduğu yazar. Her biriyle veri işleme sözleşmesi (DSGVO) yapılır.</InfoBox></>,
              el: <><P><strong>Αυτή η ιστοσελίδα:</strong> λειτουργεί στη Vercel (εταιρεία των ΗΠΑ· λειτουργίες διακομιστή στη Φρανκφούρτη, ΕΕ), η βάση δεδομένων είναι στη Supabase (εταιρεία των ΗΠΑ· βάση στη Φρανκφούρτη, ΕΕ), το domain είναι καταχωρημένο στη Hostinger. Λεπτομέρειες στην πολιτική απορρήτου.</P><P><strong>Έργα πελατών:</strong> οι πάροχοι επιλέγονται ανά έργο, ανάλογα με τις ανάγκες και τις προτιμήσεις σας: π.χ. πάροχοι των ΗΠΑ με διακομιστές στη Φρανκφούρτη (όπως Vercel, Supabase ή Modal) ή διακομιστές στη Γερμανία / την ΕΕ (όπως Hetzner, IONOS ή Hostinger). Αυτά είναι μόνο παραδείγματα· συνεργάζομαι και με πολλά άλλα παρόμοια εργαλεία και υπηρεσίες. Αν θέλετε τα πάντα στη Γερμανία με εταιρεία της ΕΕ, το στήνω έτσι.</P><InfoBox>Η προσφορά σας αναφέρει κάθε εξωτερικό πάροχο του έργου, τη χώρα της εταιρείας και πού αποθηκεύονται τα δεδομένα σας. Με τον καθένα υπάρχει σύμβαση επεξεργασίας δεδομένων (GDPR).</InfoBox></>,
            }[lang]}
          </DocSection>

          <DocSection id="imprint" lang={lang}>
            {{
              en: <><InfoBox>Required by German law — Digitale-Dienste-Gesetz (DDG) §5.</InfoBox><P><strong>Angaben gemäß §5 DDG:</strong><br/>Chousein Chiout<br/>Waldstraße 124E<br/>65451 Kelsterbach<br/>Deutschland</P><P><strong>Trade registration:</strong> Registered under §14 GewO (German Trade Regulation Act).</P><P><strong>Kontakt:</strong><br/><ImprintEmail label="E-mail" /><a href="/en/contact" style={{ color: 'var(--lq-g2)' }}>Go to the contact form →</a></P><P><strong>VAT:</strong> Small-business scheme under §19 UStG — no VAT charged.<br/>VAT ID (USt-IdNr.): DE368407083</P><P><strong>Hosting:</strong> Vercel Inc., 340 Pine Street Suite 900, San Francisco, CA 94104, USA (functions region: Frankfurt, EU where possible) — vercel.com/legal/privacy-policy</P></>,
              de: <><InfoBox>Pflichtangaben gemäß §5 DDG und §18 Abs. 2 MStV.</InfoBox><P><strong>Angaben gem. §5 DDG:</strong><br/>Chousein Chiout<br/>Waldstraße 124E<br/>65451 Kelsterbach<br/>Deutschland</P><P><strong>Gewerbeanmeldung:</strong> angemeldet gemäß §14 GewO.</P><P><strong>Kontakt:</strong><br/><ImprintEmail label="E-Mail" /><a href="/de/kontakt" style={{ color: 'var(--lq-g2)' }}>Zum Kontaktformular →</a></P><P><strong>Umsatzsteuer:</strong> Kleinunternehmer gem. §19 UStG — es wird keine Umsatzsteuer berechnet.<br/>USt-IdNr.: DE368407083</P><P><strong>Verantwortlich gem. §18 Abs. 2 MStV:</strong> Chousein Chiout, Waldstraße 124E, 65451 Kelsterbach.</P><P><strong>Hosting:</strong> Vercel Inc., 340 Pine Street Suite 900, San Francisco, CA 94104, USA (Funktionsregion: Frankfurt, EU, wo möglich).</P></>,
              tr: <><InfoBox>Alman hukuku kapsamında zorunlu bilgiler — DDG §5.</InfoBox><P><strong>§5 DDG uyarınca bilgiler:</strong><br/>Chousein Chiout<br/>Waldstraße 124E<br/>65451 Kelsterbach<br/>Almanya</P><P><strong>Ticari kayıt:</strong> Almanya’da GewO §14 uyarınca kayıtlı işletme.</P><P><strong>İletişim:</strong><br/><ImprintEmail label="E-posta" /><a href="/tr/iletisim" style={{ color: 'var(--lq-g2)' }}>İletişim formuna git →</a></P><P><strong>KDV:</strong> Alman KDV Kanunu §19 kapsamında küçük işletme — KDV uygulanmaz.<br/>KDV kimlik numarası (USt-IdNr.): DE368407083</P><P><strong>Barındırma:</strong> Vercel Inc., San Francisco, CA, ABD (fonksiyon bölgesi: mümkün olduğunda Frankfurt, AB).</P></>,
              el: <><InfoBox>Υποχρεωτικές πληροφορίες κατά γερμανικό νόμο — §5 DDG.</InfoBox><P><strong>Στοιχεία §5 DDG:</strong><br/>Chousein Chiout<br/>Waldstraße 124E<br/>65451 Kelsterbach<br/>Γερμανία</P><P><strong>Εγγραφή επιχείρησης:</strong> Καταχωρημένη επιχείρηση κατά §14 GewO (Γερμανία).</P><P><strong>Επικοινωνία:</strong><br/><ImprintEmail label="E-mail" /><a href="/el/epikoinonia" style={{ color: 'var(--lq-g2)' }}>Μετάβαση στη φόρμα επικοινωνίας →</a></P><P><strong>ΦΠΑ:</strong> Καθεστώς μικρής επιχείρησης (§19 UStG) — δεν επιβάλλεται ΦΠΑ.<br/>Αριθμός ΦΠΑ (USt-IdNr.): DE368407083</P><P><strong>Φιλοξενία:</strong> Vercel Inc., San Francisco, CA, ΗΠΑ (περιοχή λειτουργιών: Φρανκφούρτη, ΕΕ, όπου είναι δυνατόν).</P></>,
            }[lang]}
          </DocSection>
        </div>
      </div>
    </LegalLayout>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────
import type { Lang } from '../translations';

function DocSection({ id, lang, children }: { id: string; lang: Lang; children: React.ReactNode }) {
  const TITLES: Record<string, Record<Lang, string>> = {
    overview:   { en: 'Overview', de: 'Übersicht', tr: 'Genel Bakış', el: 'Επισκόπηση' },
    automation: { en: 'Automation', de: 'Automatisierung', tr: 'Otomasyon', el: 'Αυτοματισμός' },
    web:        { en: 'Web Development', de: 'Webentwicklung', tr: 'Web Geliştirme', el: 'Ανάπτυξη Ιστού' },
    ai:         { en: 'AI Integration', de: 'KI-Integration', tr: 'YZ Entegrasyonu', el: 'Ενσωμάτωση ΤΝ' },
    strategy:   { en: 'Digital Strategy', de: 'Digitalstrategie', tr: 'Dijital Strateji', el: 'Ψηφιακή Στρατηγική' },
    process:    { en: 'How I work', de: 'Wie ich arbeite', tr: 'Nasıl çalışıyorum', el: 'Πώς εργάζομαι' },
    faq:        { en: 'FAQ', de: 'FAQ', tr: 'SSS', el: 'Συχνές ερωτήσεις' },
    hosting:    { en: 'Hosting & data location', de: 'Hosting & Datenstandort', tr: 'Barındırma ve veri konumu', el: 'Φιλοξενία και τοποθεσία δεδομένων' },
    imprint:    { en: 'Imprint (Impressum)', de: 'Impressum', tr: 'Künye (Impressum)', el: 'Στοιχεία εκδότη (Impressum)' },
  };
  return (
    <section id={id} style={{ marginBottom: 72, scrollMarginTop: 96 }}>
      <h2 style={{ fontWeight: 500, fontSize: 'clamp(20px, 2.2vw, 24px)', lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: '0 0 20px', paddingBottom: 16, borderBottom: '1px solid var(--lq-line)' }}>
        {TITLES[id]?.[lang] ?? id}
      </h2>
      <div style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lq-silver)' }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 14px' }}>{children}</p>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: 8 }}>{children}</li>;
}
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--lq-kelp)', border: '1px solid var(--lq-line)', borderRadius: 16, padding: '16px 20px', fontSize: 15, lineHeight: 1.55, color: 'var(--lq-mist)', margin: '20px 0' }}>
      {children}
    </div>
  );
}
function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      <span style={{ fontFamily: 'var(--lq-mono)', fontSize: 12, color: 'var(--lq-silver)', width: 28, paddingTop: 3, flexShrink: 0 }}>{n}</span>
      <div>
        <p style={{ fontWeight: 500, fontSize: 18, color: 'var(--lq-white)', margin: '0 0 4px' }}>{title}</p>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lq-silver)', margin: 0 }}>{children}</p>
      </div>
    </div>
  );
}
function FAQ({ items }: { items: [string, string][] }) {
  return (
    <>
      {items.map(([q, a], i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <p style={{ fontWeight: 500, fontSize: 18, color: 'var(--lq-white)', margin: '0 0 6px' }}>{q}</p>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lq-silver)', margin: 0 }}>{a}</p>
        </div>
      ))}
    </>
  );
}

/** Impressum e-mail (mandatory under §5 DDG): read from the server (IMPRESSUM_EMAIL in .env), so it is not in the code or the page source. */
function ImprintEmail({ label }: { label: string }) {
  const [mail, setMail] = useHashState<string | null>(null);
  useHashEffect(() => { fetch('/api/imprint-contact').then((r) => (r.ok ? r.json() : null)).then((j) => setMail(j?.email ?? null)).catch(() => {}); }, []);
  if (!mail) return null;
  return <>{label}: <a href={`mailto:${mail}`} style={{ color: 'var(--lq-g2)' }}>{mail}</a><br/></>;
}
