import { TOOLS_KICKER } from '../navLabels.js';
import type { Lang } from '../../translations';
import type { ToolId } from '../../data/affiliates';

// "Tools I use" overview + one page per partner tool (owner, 2026-11-18).
// DRAFT texts written by Claude from what is known about the tools; the owner corrects them before going live.
// Rules: honest (no invented reviews, no prices that change), singular voice, one language per page, every claim checkable.

export interface ToolsUi {
  kicker: string; title: string; sub: string;
  cardCta: string; overviewNote: string;
  back: string; why: string; forWhom: string; honest: string; start: string; faq: string;
  go: (name: string) => string; goSub: string;
  adTag: string; disclosure: string; finalTitle: (name: string) => string; finalSub: string;
  helpTitle: string; helpSub: string; helpCta: string;
}

export const TOOLS_UI: Record<Lang, ToolsUi> = {
  tr: {
    kicker: TOOLS_KICKER.tr,
    title: 'İşimde gerçekten kullandığım ve önerdiğim araçlar',
    sub: 'Burada yalnızca kendim kullandığım ve müşterilerime de önerdiğim araçlar var. Her birinin neden burada olduğunu, kimin işine yarayacağını ve zayıf yanlarını açıkça yazdım.',
    cardCta: 'Neden kullanıyorum',
    overviewNote: 'Bu sayfadaki bağlantılar referans bağlantısıdır (reklam). Bunlar üzerinden kaydolursanız size ek bir maliyet çıkmaz; ben küçük bir komisyon alabilirim. Bu, önerilerimi değiştirmez.',
    back: 'Tüm araçlar',
    why: 'Neden kullanıyorum',
    forWhom: 'Kimin işine yarar',
    honest: 'Dürüst olmak gerekirse',
    start: 'Nasıl başlarsınız',
    faq: 'Sık sorulanlar',
    go: (name) => `${name} sayfasına git`,
    goSub: 'Yeni sekmede açılır',
    adTag: 'Reklam · Referans bağlantısı',
    disclosure: 'Bu bir referans bağlantısıdır: size ek maliyet yoktur, ben küçük bir komisyon alabilirim.',
    finalTitle: (name) => `${name} ile başlamaya hazır mısınız?`,
    finalSub: 'Butona tıklayınca doğrudan resmi sayfaya gidersiniz. Kayıt ve ödeme tamamen orada yapılır.',
    helpTitle: 'Kurulumu bana bırakmak ister misiniz?',
    helpSub: 'Sitenizi, alan adınızı ve e-postanızı sizin için kurup hazır teslim edebilirim. Kısa bir mesaj yeterli, yazılı dönüş yaparım.',
    helpCta: 'Mesaj gönder',
  },
  en: {
    kicker: TOOLS_KICKER.en,
    title: 'Tools I actually use in my work and recommend',
    sub: 'Only tools I use myself and also recommend to my clients are listed here. For each one I explain why it is here, who it suits and where it falls short.',
    cardCta: 'Why I use it',
    overviewNote: 'The links on this page are referral links (advertising). If you sign up through them, it costs you nothing extra; I may receive a small commission. It does not change my recommendations.',
    back: 'All tools',
    why: 'Why I use it',
    forWhom: 'Who it suits',
    honest: 'To be honest',
    start: 'How to get started',
    faq: 'Frequently asked',
    go: (name) => `Go to ${name}`,
    goSub: 'Opens in a new tab',
    adTag: 'Advertising · Referral link',
    disclosure: 'This is a referral link: no extra cost for you, I may receive a small commission.',
    finalTitle: (name) => `Ready to start with ${name}?`,
    finalSub: 'The button takes you straight to the official page. Sign-up and payment happen entirely there.',
    helpTitle: 'Would you rather leave the setup to me?',
    helpSub: 'I can set up your website, domain and email for you and hand them over ready to use. A short message is enough; I reply in writing.',
    helpCta: 'Send a message',
  },
  de: {
    kicker: TOOLS_KICKER.de,
    title: 'Tools, die ich in meiner Arbeit wirklich nutze und empfehle',
    sub: 'Hier stehen nur Tools, die ich selbst nutze und auch meinen Kunden empfehle. Zu jedem erkläre ich, warum es hier steht, für wen es passt und wo seine Schwächen liegen.',
    cardCta: 'Warum ich es nutze',
    overviewNote: 'Die Links auf dieser Seite sind Empfehlungslinks (Werbung). Wenn Sie sich darüber anmelden, entstehen Ihnen keine Mehrkosten; ich erhalte ggf. eine kleine Provision. An meinen Empfehlungen ändert das nichts.',
    back: 'Alle Tools',
    why: 'Warum ich es nutze',
    forWhom: 'Für wen es passt',
    honest: 'Ehrlich gesagt',
    start: 'So starten Sie',
    faq: 'Häufige Fragen',
    go: (name) => `Zu ${name}`,
    goSub: 'Öffnet in neuem Tab',
    adTag: 'Anzeige · Empfehlungslink',
    disclosure: 'Dies ist ein Empfehlungslink: Für Sie entstehen keine Mehrkosten, ich erhalte ggf. eine kleine Provision.',
    finalTitle: (name) => `Bereit, mit ${name} zu starten?`,
    finalSub: 'Der Button führt Sie direkt zur offiziellen Seite. Anmeldung und Bezahlung laufen vollständig dort.',
    helpTitle: 'Möchten Sie die Einrichtung lieber mir überlassen?',
    helpSub: 'Ich kann Website, Domain und E-Mail für Sie einrichten und fertig übergeben. Eine kurze Nachricht genügt, ich antworte schriftlich.',
    helpCta: 'Nachricht senden',
  },
  el: {
    kicker: TOOLS_KICKER.el,
    title: 'Εργαλεία που χρησιμοποιώ πραγματικά στη δουλειά μου και προτείνω',
    sub: 'Εδώ υπάρχουν μόνο εργαλεία που χρησιμοποιώ ο ίδιος και προτείνω και στους πελάτες μου. Για το καθένα εξηγώ γιατί βρίσκεται εδώ, σε ποιον ταιριάζει και πού υστερεί.',
    cardCta: 'Γιατί το χρησιμοποιώ',
    overviewNote: 'Οι σύνδεσμοι αυτής της σελίδας είναι σύνδεσμοι παραπομπής (διαφήμιση). Αν εγγραφείτε μέσω αυτών, δεν έχετε επιπλέον κόστος· μπορεί να λάβω μια μικρή προμήθεια. Αυτό δεν αλλάζει τις προτάσεις μου.',
    back: 'Όλα τα εργαλεία',
    why: 'Γιατί το χρησιμοποιώ',
    forWhom: 'Σε ποιον ταιριάζει',
    honest: 'Για να είμαι ειλικρινής',
    start: 'Πώς να ξεκινήσετε',
    faq: 'Συχνές ερωτήσεις',
    go: (name) => `Μετάβαση στο ${name}`,
    goSub: 'Ανοίγει σε νέα καρτέλα',
    adTag: 'Διαφήμιση · Σύνδεσμος παραπομπής',
    disclosure: 'Αυτός είναι σύνδεσμος παραπομπής: χωρίς επιπλέον κόστος για εσάς, μπορεί να λάβω μια μικρή προμήθεια.',
    finalTitle: (name) => `Έτοιμοι να ξεκινήσετε με το ${name};`,
    finalSub: 'Το κουμπί σας οδηγεί απευθείας στην επίσημη σελίδα. Η εγγραφή και η πληρωμή γίνονται εξ ολοκλήρου εκεί.',
    helpTitle: 'Προτιμάτε να αφήσετε τη ρύθμιση σε μένα;',
    helpSub: 'Μπορώ να στήσω για εσάς ιστοσελίδα, domain και email και να σας τα παραδώσω έτοιμα. Αρκεί ένα σύντομο μήνυμα· απαντώ γραπτώς.',
    helpCta: 'Αποστολή μηνύματος',
  },
};

export interface ToolText {
  category: string;
  tagline: string;       // H1 on the tool page
  short: string;         // one line on the overview card + meta description
  intro: string;
  reasons: { t: string; d: string }[];
  forWhom: string[];
  cons: string[];
  steps: string[];
  faq: { q: string; a: string }[];
}

export const TOOL_TEXT: Record<ToolId, Record<Lang, ToolText>> = {
  hostinger: {
    tr: {
      category: 'Web hosting · Alan adı · E-posta',
      tagline: 'Küçük işletme siteleri için neden Hostinger kullanıyorum',
      short: 'Site, alan adı, SSL ve e-posta tek panelde; küçük başlayıp aynı yerde büyüyebilirsiniz.',
      intro: 'Müşterilerimin sitelerini yayına alırken en çok baktığım şey şu: kolay yönetilsin, uygun fiyatla başlasın ve proje büyüdüğünde taşınmak gerekmesin. Hostinger bu üçünü bir arada sunduğu için ilk tercihim.',
      reasons: [
        { t: 'Her şey tek panelde', d: 'Hosting, alan adı, SSL sertifikası ve kurumsal e-posta aynı yerden yönetiliyor. Projeyi teslim ettiğimde müşterim de paneli rahatça kullanabiliyor.' },
        { t: 'Uygun bir başlangıç', d: 'Küçük bir işletme sitesi için giriş maliyeti düşük. Önce ihtiyacınız kadarını alırsınız, gerekirse sonra yükseltirsiniz.' },
        { t: 'Avrupa\'da veri merkezi seçimi', d: 'Verilerini Avrupa Birliği içinde tutmak isteyen müşteriler için AB\'deki bir veri merkezini seçebiliyorum.' },
        { t: 'Büyüdükçe aynı yerde', d: 'Basit bir siteden sanal sunucuya (VPS) ve özel uygulamalara kadar aynı hesapta ilerlemek mümkün; taşınma derdi yok.' },
      ],
      forWhom: ['İlk kurumsal sitesini açacak küçük işletmeler', 'Portfolyo, blog veya tanıtım sitesi isteyenler', 'Alan adı ve kurumsal e-postayı tek yerden yönetmek isteyenler', 'İleride daha büyük bir uygulamaya geçmeyi planlayanlar'],
      cons: ['İlk dönemdeki indirimli fiyat, yenilemede daha yüksek olabiliyor. Sözleşme süresini buna göre seçin.', 'Destek çoğunlukla canlı sohbet üzerinden; telefonla birine ulaşmayı tercih edenler için ideal değil.', 'Sanal sunucu (VPS) biraz teknik bilgi ister. Emin değilseniz kurulumu bana bırakabilirsiniz.'],
      steps: ['Aşağıdaki butonla Hostinger sayfasına gidin ve size uygun paketi seçin. Çoğu küçük işletme sitesi için temel web hosting yeterli.', 'Alan adınızı seçin ya da elinizdeki alan adını bağlayın.', 'Sitenizi kendiniz kurun ya da bana yazın, sizin için kurayım.'],
      faq: [
        { q: 'Bu bağlantıdan almanın bana ek maliyeti var mı?', a: 'Hayır. Fiyat aynı kalır; ben yalnızca küçük bir komisyon alabilirim.' },
        { q: 'Hangi paketi seçmeliyim?', a: 'Tek bir işletme sitesi için genellikle en temel web hosting paketi yeterlidir. Mağaza veya özel uygulama planlıyorsanız önce bana yazın, ihtiyacınıza göre söyleyeyim.' },
        { q: 'Sitemi sen kurar mısın?', a: 'Evet. İletişim formundan kısa bir mesaj gönderin; neye ihtiyacınız olduğunu yazılı olarak değerlendiririm.' },
      ],
    },
    en: {
      category: 'Web hosting · Domain · Email',
      tagline: 'Why I use Hostinger for small business websites',
      short: 'Website, domain, SSL and email in one panel; start small and grow in the same place.',
      intro: 'When I put my clients\' websites live, I look for three things: easy to manage, an affordable start, and no need to move once the project grows. Hostinger offers all three together, which makes it my first choice.',
      reasons: [
        { t: 'Everything in one panel', d: 'Hosting, domain, SSL certificate and business email are managed in one place. After handover, my clients can use the panel comfortably themselves.' },
        { t: 'An affordable start', d: 'The entry cost for a small business website is low. You take what you need first and upgrade later if necessary.' },
        { t: 'Choice of a European data centre', d: 'For clients who want to keep their data inside the European Union, I can choose a data centre in the EU.' },
        { t: 'Grow in the same place', d: 'You can go from a simple website to a virtual server (VPS) and custom apps in the same account, with no migration hassle.' },
      ],
      forWhom: ['Small businesses launching their first company website', 'Anyone who wants a portfolio, blog or showcase site', 'Those who want domain and business email in one place', 'Projects planning to grow into a bigger app later'],
      cons: ['The discounted first-term price can be higher on renewal. Choose the contract length with that in mind.', 'Support is mostly via live chat; not ideal if you prefer to reach someone by phone.', 'A virtual server (VPS) needs some technical knowledge. If you are unsure, you can leave the setup to me.'],
      steps: ['Use the button below to go to Hostinger and pick a plan. Basic web hosting is enough for most small business websites.', 'Choose your domain or connect the one you already have.', 'Build your site yourself, or write to me and I will build it for you.'],
      faq: [
        { q: 'Does buying through this link cost me extra?', a: 'No. The price stays the same; I may only receive a small commission.' },
        { q: 'Which plan should I choose?', a: 'For a single business website, the most basic web hosting plan is usually enough. If you plan a shop or a custom app, write to me first and I will tell you what fits.' },
        { q: 'Can you build my website?', a: 'Yes. Send a short message through the contact form; I will assess what you need in writing.' },
      ],
    },
    de: {
      category: 'Webhosting · Domain · E-Mail',
      tagline: 'Warum ich Hostinger für Websites kleiner Unternehmen nutze',
      short: 'Website, Domain, SSL und E-Mail in einem Panel; klein starten und am selben Ort wachsen.',
      intro: 'Wenn ich Websites meiner Kunden online bringe, achte ich auf drei Dinge: einfach zu verwalten, ein günstiger Einstieg und kein Umzug, wenn das Projekt wächst. Hostinger bietet alle drei zusammen, deshalb ist es meine erste Wahl.',
      reasons: [
        { t: 'Alles in einem Panel', d: 'Hosting, Domain, SSL-Zertifikat und geschäftliche E-Mail werden an einem Ort verwaltet. Nach der Übergabe kommen auch meine Kunden gut mit dem Panel zurecht.' },
        { t: 'Ein günstiger Einstieg', d: 'Die Einstiegskosten für eine kleine Unternehmenswebsite sind niedrig. Sie nehmen zuerst nur, was Sie brauchen, und erweitern später bei Bedarf.' },
        { t: 'Rechenzentrum in Europa wählbar', d: 'Für Kunden, die ihre Daten in der Europäischen Union halten möchten, kann ich ein Rechenzentrum in der EU wählen.' },
        { t: 'Wachsen am selben Ort', d: 'Von der einfachen Website bis zum virtuellen Server (VPS) und eigenen Anwendungen geht alles im selben Konto, ohne Umzugsaufwand.' },
      ],
      forWhom: ['Kleine Unternehmen mit ihrer ersten Firmenwebsite', 'Alle, die ein Portfolio, einen Blog oder eine Präsentationsseite möchten', 'Wer Domain und geschäftliche E-Mail an einem Ort verwalten will', 'Projekte, die später zu einer größeren Anwendung wachsen sollen'],
      cons: ['Der vergünstigte Preis der ersten Laufzeit kann bei der Verlängerung höher sein. Wählen Sie die Vertragslaufzeit entsprechend.', 'Der Support läuft überwiegend per Live-Chat; nicht ideal, wenn Sie lieber telefonieren.', 'Ein virtueller Server (VPS) erfordert etwas technisches Wissen. Wenn Sie unsicher sind, überlassen Sie die Einrichtung gern mir.'],
      steps: ['Gehen Sie über den Button unten zu Hostinger und wählen Sie ein Paket. Für die meisten kleinen Unternehmenswebsites reicht einfaches Webhosting.', 'Wählen Sie Ihre Domain oder verbinden Sie Ihre vorhandene.', 'Bauen Sie Ihre Website selbst, oder schreiben Sie mir, dann baue ich sie für Sie.'],
      faq: [
        { q: 'Kostet mich der Kauf über diesen Link mehr?', a: 'Nein. Der Preis bleibt gleich; ich erhalte höchstens eine kleine Provision.' },
        { q: 'Welches Paket soll ich wählen?', a: 'Für eine einzelne Unternehmenswebsite reicht meist das einfachste Webhosting-Paket. Wenn Sie einen Shop oder eine eigene Anwendung planen, schreiben Sie mir vorher, dann sage ich Ihnen, was passt.' },
        { q: 'Bauen Sie meine Website?', a: 'Ja. Schicken Sie eine kurze Nachricht über das Kontaktformular; ich bewerte Ihren Bedarf schriftlich.' },
      ],
    },
    el: {
      category: 'Φιλοξενία ιστοσελίδων · Domain · Email',
      tagline: 'Γιατί χρησιμοποιώ το Hostinger για ιστοσελίδες μικρών επιχειρήσεων',
      short: 'Ιστοσελίδα, domain, SSL και email σε ένα πάνελ· ξεκινάτε μικρά και μεγαλώνετε στο ίδιο μέρος.',
      intro: 'Όταν βάζω online τις ιστοσελίδες των πελατών μου, κοιτάζω τρία πράγματα: εύκολη διαχείριση, οικονομική αρχή και καμία ανάγκη μετακόμισης όταν το έργο μεγαλώσει. Το Hostinger τα προσφέρει και τα τρία μαζί, γι\' αυτό είναι η πρώτη μου επιλογή.',
      reasons: [
        { t: 'Όλα σε ένα πάνελ', d: 'Φιλοξενία, domain, πιστοποιητικό SSL και επαγγελματικό email διαχειρίζονται από ένα σημείο. Μετά την παράδοση, οι πελάτες μου χρησιμοποιούν άνετα το πάνελ και μόνοι τους.' },
        { t: 'Οικονομική αρχή', d: 'Το κόστος εκκίνησης για μια μικρή επαγγελματική ιστοσελίδα είναι χαμηλό. Παίρνετε πρώτα όσα χρειάζεστε και αναβαθμίζετε αργότερα αν χρειαστεί.' },
        { t: 'Επιλογή κέντρου δεδομένων στην Ευρώπη', d: 'Για πελάτες που θέλουν τα δεδομένα τους εντός της Ευρωπαϊκής Ένωσης, μπορώ να επιλέξω κέντρο δεδομένων στην ΕΕ.' },
        { t: 'Μεγαλώνετε στο ίδιο μέρος', d: 'Από μια απλή ιστοσελίδα μέχρι εικονικό διακομιστή (VPS) και δικές σας εφαρμογές, όλα στον ίδιο λογαριασμό, χωρίς ταλαιπωρία μεταφοράς.' },
      ],
      forWhom: ['Μικρές επιχειρήσεις που ανοίγουν την πρώτη τους επαγγελματική ιστοσελίδα', 'Όσοι θέλουν portfolio, blog ή ιστοσελίδα παρουσίασης', 'Όσοι θέλουν domain και επαγγελματικό email σε ένα μέρος', 'Έργα που σκοπεύουν να εξελιχθούν σε μεγαλύτερη εφαρμογή'],
      cons: ['Η μειωμένη τιμή της πρώτης περιόδου μπορεί να είναι υψηλότερη στην ανανέωση. Επιλέξτε τη διάρκεια συμβολαίου ανάλογα.', 'Η υποστήριξη γίνεται κυρίως μέσω live chat· όχι ιδανικό αν προτιμάτε τηλέφωνο.', 'Ένας εικονικός διακομιστής (VPS) θέλει λίγες τεχνικές γνώσεις. Αν δεν είστε σίγουροι, αφήστε τη ρύθμιση σε μένα.'],
      steps: ['Πατήστε το κουμπί παρακάτω για να μεταβείτε στο Hostinger και διαλέξτε πακέτο. Για τις περισσότερες μικρές επαγγελματικές ιστοσελίδες αρκεί η βασική φιλοξενία.', 'Επιλέξτε το domain σας ή συνδέστε αυτό που ήδη έχετε.', 'Φτιάξτε την ιστοσελίδα μόνοι σας, ή γράψτε μου και θα τη φτιάξω εγώ για εσάς.'],
      faq: [
        { q: 'Μου κοστίζει κάτι επιπλέον η αγορά μέσω αυτού του συνδέσμου;', a: 'Όχι. Η τιμή μένει ίδια· εγώ μπορεί να λάβω μόνο μια μικρή προμήθεια.' },
        { q: 'Ποιο πακέτο να διαλέξω;', a: 'Για μία επαγγελματική ιστοσελίδα συνήθως αρκεί το πιο βασικό πακέτο φιλοξενίας. Αν σχεδιάζετε κατάστημα ή δική σας εφαρμογή, γράψτε μου πρώτα και θα σας πω τι ταιριάζει.' },
        { q: 'Μπορείτε να φτιάξετε την ιστοσελίδα μου;', a: 'Ναι. Στείλτε ένα σύντομο μήνυμα από τη φόρμα επικοινωνίας· θα αξιολογήσω γραπτώς τι χρειάζεστε.' },
      ],
    },
  },
  n26: {
    tr: {
      category: 'Mobil banka · Bireysel ve iş hesabı',
      tagline: 'Hem kişisel hem iş hesabı için neden N26 öneriyorum',
      short: 'Kişisel hesap da iş hesabı da tamamen uygulamadan; her harcama anında telefonunuzda.',
      intro: 'Tek başına çalışırken banka işlerine ayıracak vaktim yok. Şubeye gitmeden, her şeyi telefondan yönetebildiğim ve her ödemeyi anında gördüğüm bir hesap istedim. N26\'yı bu yüzden kullanıyorum ve hem günlük kişisel hesap hem de iş hesabı olarak öneriyorum.',
      reasons: [
        { t: 'Her şey uygulamada', d: 'Hesap açma, kimlik doğrulama, kart ve ödemeler tamamen uygulama üzerinden. Şubeye gitmek ya da kâğıt doldurmak gerekmiyor.' },
        { t: 'Anlık bildirim', d: 'Her ödeme ve gelen para anında telefona düşüyor. Hangi faturanın ödendiğini takip etmek çok kolaylaşıyor.' },
        { t: 'Para ayırmak için alt hesaplar', d: 'Vergi, giderler veya birikim için parayı ayrı alt hesaplara (Spaces) koyabiliyorum; ana bakiye karışmıyor.' },
        { t: 'Alman IBAN\'ı', d: 'DE ile başlayan bir IBAN ile Almanya\'daki müşteriler, kurumlar ve otomatik ödemeler sorunsuz çalışıyor.' },
      ],
      forWhom: ['Günlük işleri için modern bir kişisel hesap isteyenler', 'Serbest çalışanlar ve işletmeler: iş harcamalarını kişisel paradan ayırmak isteyenler', 'Banka işlerini telefondan halletmek isteyenler', 'Almanya\'ya yeni taşınıp hızlıca hesap açmak isteyenler', 'Gelir ve giderlerini anlık takip etmek isteyenler'],
      cons: ['Şubesi yok; yüz yüze görüşmeyi tercih edenler için uygun değil.', 'Nakit yatırma anlaşmalı mağazalar üzerinden ve ücretli olabilir; çok nakit çalışan işletmeler için ideal değil.', 'İş hesabını hangi işletme türünün açabileceği N26 koşullarına bağlı; açmadan önce N26 sayfasından kontrol edin. Destek çoğunlukla uygulama içi sohbet üzerinden.'],
      steps: ['Aşağıdaki butonla N26 sayfasına gidin ve kişisel ya da iş hesabını seçin.', 'Uygulamayı indirin ve kimliğinizi uygulama içinden doğrulayın.', 'Hesabınız açıldığında kartınızı uygulamaya ekleyip hemen kullanmaya başlayın.'],
      faq: [
        { q: 'Bu bağlantıdan açmanın bana ek maliyeti var mı?', a: 'Hayır. Koşullar aynıdır; ben yalnızca küçük bir komisyon alabilirim.' },
        { q: 'Kimler hesap açabilir?', a: 'N26\'nın hizmet verdiği ülkelerde (Almanya dahil) yaşayanlar. Güncel koşullar her zaman N26 sayfasında yazar.' },
        { q: 'Ücretsiz mi?', a: 'N26\'nın farklı hesap türleri ve kampanyaları var; koşullar zamanla değişebildiği için güncel bilgiye N26 sayfasından bakın.' },
      ],
    },
    en: {
      category: 'Mobile bank · Personal and business account',
      tagline: 'Why I recommend N26 for both personal and business banking',
      short: 'Personal and business accounts entirely in the app; every transaction instantly on your phone.',
      intro: 'Working on my own, I have no time to spare for banking. I wanted an account I can manage entirely from my phone, without visiting a branch, and where I see every payment instantly. That is why I use N26, and I recommend it both as an everyday personal account and as a business account.',
      reasons: [
        { t: 'Everything in the app', d: 'Account opening, identity check, card and payments all happen in the app. No branch visits, no paperwork.' },
        { t: 'Instant notifications', d: 'Every payment and every incoming transfer shows up on my phone right away. Tracking which invoice has been paid becomes much easier.' },
        { t: 'Sub-accounts to set money aside', d: 'I can put money for taxes, expenses or savings into separate sub-accounts (Spaces), so the main balance stays clear.' },
        { t: 'A German IBAN', d: 'With an IBAN starting with DE, clients, authorities and direct debits in Germany work without problems.' },
      ],
      forWhom: ['Anyone who wants a modern personal account for everyday life', 'Freelancers and businesses who want to keep business spending apart from personal money', 'Anyone who wants to handle banking from their phone', 'People who just moved to Germany and need an account quickly', 'Anyone who wants to follow income and expenses in real time'],
      cons: ['No branches; not suitable if you prefer face-to-face meetings.', 'Cash deposits go through partner shops and may cost a fee; not ideal for businesses that handle a lot of cash.', 'Which kinds of business can open the business account depends on N26\'s conditions; check the N26 page before opening. Support is mostly via in-app chat.'],
      steps: ['Use the button below to go to N26 and choose a personal or business account.', 'Download the app and verify your identity inside the app.', 'Once your account is open, add your card to the app and start using it right away.'],
      faq: [
        { q: 'Does opening through this link cost me extra?', a: 'No. The conditions stay the same; I may only receive a small commission.' },
        { q: 'Who can open an account?', a: 'People living in the countries N26 serves (including Germany). The current conditions are always on the N26 page.' },
        { q: 'Is it free?', a: 'N26 has different account types and promotions; as conditions can change over time, check the current details on the N26 page.' },
      ],
    },
    de: {
      category: 'Mobile Bank · Privat- und Geschäftskonto',
      tagline: 'Warum ich N26 als Privat- und als Geschäftskonto empfehle',
      short: 'Privat- und Geschäftskonto komplett in der App; jede Buchung sofort auf dem Handy.',
      intro: 'Als Einzelunternehmer habe ich keine Zeit für Bankwege. Ich wollte ein Konto, das ich komplett vom Handy aus verwalte, ohne Filialbesuch, und bei dem ich jede Zahlung sofort sehe. Deshalb nutze ich N26 und empfehle es sowohl als Privatkonto für den Alltag als auch als Geschäftskonto.',
      reasons: [
        { t: 'Alles in der App', d: 'Kontoeröffnung, Identitätsprüfung, Karte und Zahlungen laufen komplett über die App. Keine Filiale, kein Papierkram.' },
        { t: 'Sofortige Benachrichtigungen', d: 'Jede Zahlung und jeder Geldeingang erscheint sofort auf dem Handy. So sehe ich auf einen Blick, welche Rechnung bezahlt ist.' },
        { t: 'Unterkonten zum Zurücklegen', d: 'Geld für Steuern, Ausgaben oder Rücklagen lege ich in eigene Unterkonten (Spaces); der Hauptsaldo bleibt übersichtlich.' },
        { t: 'Deutsche IBAN', d: 'Mit einer IBAN, die mit DE beginnt, funktionieren Kunden, Behörden und Lastschriften in Deutschland problemlos.' },
      ],
      forWhom: ['Alle, die ein modernes Privatkonto für den Alltag möchten', 'Selbstständige und Unternehmen, die Geschäftsausgaben vom privaten Geld trennen möchten', 'Alle, die ihre Bankgeschäfte vom Handy erledigen möchten', 'Wer neu in Deutschland ist und schnell ein Konto braucht', 'Wer Einnahmen und Ausgaben in Echtzeit verfolgen möchte'],
      cons: ['Keine Filialen; nichts für Sie, wenn Sie persönliche Gespräche bevorzugen.', 'Bargeld einzahlen geht über Partnergeschäfte und kann Gebühren kosten; nicht ideal für Betriebe mit viel Bargeld.', 'Welche Unternehmensformen das Geschäftskonto eröffnen können, hängt von den N26-Bedingungen ab; prüfen Sie das vor der Eröffnung auf der N26-Seite. Der Support läuft überwiegend per Chat in der App.'],
      steps: ['Gehen Sie über den Button unten zu N26 und wählen Sie ein Privat- oder Geschäftskonto.', 'Laden Sie die App herunter und bestätigen Sie Ihre Identität direkt in der App.', 'Sobald Ihr Konto eröffnet ist, fügen Sie Ihre Karte der App hinzu und legen sofort los.'],
      faq: [
        { q: 'Kostet mich die Eröffnung über diesen Link mehr?', a: 'Nein. Die Konditionen bleiben gleich; ich erhalte höchstens eine kleine Provision.' },
        { q: 'Wer kann ein Konto eröffnen?', a: 'Wer in einem der Länder lebt, in denen N26 verfügbar ist (auch Deutschland). Die aktuellen Bedingungen stehen immer auf der N26-Seite.' },
        { q: 'Ist es kostenlos?', a: 'N26 hat verschiedene Kontomodelle und Aktionen; da sich Konditionen ändern können, finden Sie die aktuellen Angaben auf der N26-Seite.' },
      ],
    },
    el: {
      category: 'Ψηφιακή τράπεζα · Προσωπικός και επαγγελματικός λογαριασμός',
      tagline: 'Γιατί προτείνω το N26 για προσωπικό και για επαγγελματικό λογαριασμό',
      short: 'Προσωπικός και επαγγελματικός λογαριασμός εξ ολοκλήρου στην εφαρμογή· κάθε κίνηση αμέσως στο κινητό σας.',
      intro: 'Δουλεύοντας μόνος μου, δεν έχω χρόνο για τράπεζες. Ήθελα έναν λογαριασμό που διαχειρίζομαι εξ ολοκλήρου από το κινητό, χωρίς επίσκεψη σε κατάστημα, και όπου βλέπω κάθε πληρωμή αμέσως. Γι\' αυτό χρησιμοποιώ το N26 και το προτείνω τόσο ως προσωπικό λογαριασμό για την καθημερινότητα όσο και ως επαγγελματικό.',
      reasons: [
        { t: 'Όλα στην εφαρμογή', d: 'Άνοιγμα λογαριασμού, ταυτοποίηση, κάρτα και πληρωμές γίνονται εξ ολοκλήρου μέσα από την εφαρμογή. Χωρίς κατάστημα, χωρίς χαρτιά.' },
        { t: 'Άμεσες ειδοποιήσεις', d: 'Κάθε πληρωμή και κάθε εισερχόμενο ποσό εμφανίζεται αμέσως στο κινητό. Έτσι βλέπω εύκολα ποιο τιμολόγιο έχει πληρωθεί.' },
        { t: 'Υπολογαριασμοί για αποταμίευση', d: 'Βάζω χρήματα για φόρους, έξοδα ή αποταμίευση σε ξεχωριστούς υπολογαριασμούς (Spaces), ώστε το κύριο υπόλοιπο να μένει καθαρό.' },
        { t: 'Γερμανικό IBAN', d: 'Με IBAN που ξεκινά από DE, πελάτες, υπηρεσίες και πάγιες εντολές στη Γερμανία λειτουργούν χωρίς προβλήματα.' },
      ],
      forWhom: ['Όσοι θέλουν έναν σύγχρονο προσωπικό λογαριασμό για την καθημερινότητα', 'Ελεύθεροι επαγγελματίες και επιχειρήσεις που θέλουν να χωρίζουν τα επαγγελματικά έξοδα από τα προσωπικά', 'Όσοι θέλουν να κάνουν τις τραπεζικές τους δουλειές από το κινητό', 'Όσοι μόλις μετακόμισαν στη Γερμανία και χρειάζονται γρήγορα λογαριασμό', 'Όσοι θέλουν να παρακολουθούν έσοδα και έξοδα σε πραγματικό χρόνο'],
      cons: ['Δεν έχει καταστήματα· δεν ταιριάζει αν προτιμάτε τη συνάντηση από κοντά.', 'Οι καταθέσεις μετρητών γίνονται μέσω συνεργαζόμενων καταστημάτων και μπορεί να έχουν χρέωση· όχι ιδανικό για επιχειρήσεις με πολλά μετρητά.', 'Ποιες μορφές επιχείρησης μπορούν να ανοίξουν επαγγελματικό λογαριασμό εξαρτάται από τους όρους του N26· ελέγξτε τη σελίδα του N26 πριν το άνοιγμα. Η υποστήριξη γίνεται κυρίως μέσω chat στην εφαρμογή.'],
      steps: ['Πατήστε το κουμπί παρακάτω για να μεταβείτε στο N26 και διαλέξτε προσωπικό ή επαγγελματικό λογαριασμό.', 'Κατεβάστε την εφαρμογή και επιβεβαιώστε την ταυτότητά σας μέσα από αυτήν.', 'Μόλις ανοίξει ο λογαριασμός, προσθέστε την κάρτα σας στην εφαρμογή και ξεκινήστε αμέσως.'],
      faq: [
        { q: 'Μου κοστίζει κάτι επιπλέον το άνοιγμα μέσω αυτού του συνδέσμου;', a: 'Όχι. Οι όροι μένουν ίδιοι· εγώ μπορεί να λάβω μόνο μια μικρή προμήθεια.' },
        { q: 'Ποιος μπορεί να ανοίξει λογαριασμό;', a: 'Όσοι ζουν σε χώρες όπου είναι διαθέσιμο το N26 (μεταξύ αυτών και η Γερμανία). Οι τρέχοντες όροι αναγράφονται πάντα στη σελίδα του N26.' },
        { q: 'Είναι δωρεάν;', a: 'Το N26 έχει διάφορους τύπους λογαριασμών και προσφορές· επειδή οι όροι μπορεί να αλλάξουν, δείτε τα τρέχοντα στοιχεία στη σελίδα του N26.' },
      ],
    },
  },
  wise: {
    tr: {
      category: "Uluslararası para transferi · Çok dövizli hesap",
      tagline: "Yurt dışı ödemeler için neden Wise kullanıyorum",
      short: "Gerçek döviz kuru ve baştan gösterilen ücretle para gönderin; birçok para birimini tek hesapta tutun.",
      intro: "Farklı ülkelerdeki müşterilerle çalışınca para farklı para birimlerinde gidip geliyor. Bankaların gizli kur farkları yerine, ne ödediğimi baştan gördüğüm bir yol istedim. Wise bunun için kullandığım ve hem kişisel hem iş için önerdiğim hesap.",
      reasons: [
        { t: "Gerçek kur, açık ücret", d: "Transferde piyasa kuru kullanılıyor ve ücret göndermeden önce açıkça yazıyor. Karşı tarafa tam olarak ne kadar geçeceğini baştan görüyorum." },
        { t: "Birçok para birimi tek hesapta", d: "Euro, lira, dolar ve daha birçok para birimini aynı hesapta tutup ihtiyaç olduğunda çevirebiliyorum." },
        { t: "Yerel hesap bilgileri", d: "Farklı para birimleri için yerel hesap bilgileri alıp yurt dışındaki müşterilerden ödemeyi yerel bir hesaba gelir gibi alabiliyorum." },
        { t: "Yurt dışında kart", d: "Seyahatte kartla ödeme yaparken para doğrudan hesaptaki ilgili para biriminden ya da uygun kurla çevrilerek çekiliyor." },
      ],
      forWhom: ["Yurt dışına düzenli para gönderen ya da alanlar", "Farklı ülkelerden müşterisi olan serbest çalışanlar ve işletmeler", "Ailesine başka bir ülkeye para gönderenler", "Sık seyahat edenler"],
      cons: ["Klasik bir banka değil: kredi veya ek hesap (eksi bakiye) yok.", "Ücret, para birimine ve tutara göre değişiyor; her transferden önce gösterilen ücrete bakın.", "Ücretsiz ATM çekimi aylık bir sınıra kadar; sonrası ücretli. İş hesabı için ek ücretler olabilir, güncel koşullar Wise sayfasında."],
      steps: ["Aşağıdaki butonla Wise sayfasına gidin ve kişisel ya da iş hesabı açın.", "Kimliğinizi uygulama veya site üzerinden doğrulayın.", "İlk transferinizi yapın ya da hesabınıza para ekleyip kartı kullanmaya başlayın."],
      faq: [
        { q: "Bu bağlantıdan açmanın bana ek maliyeti var mı?", a: "Hayır. Koşullar aynıdır; ben yalnızca küçük bir ödül veya komisyon alabilirim." },
        { q: "Hangi ülkelerde kullanılabilir?", a: "Wise ile dünyanın birçok ülkesine ve onlarca para birimine para gönderebilirsiniz. Hesabı hangi ülkede yaşayanların açabileceği ve hangi para birimlerinin desteklendiği Wise sayfasında güncel olarak listeleniyor." },
        { q: "Param güvende mi?", a: "Wise bir banka değil, lisanslı bir ödeme kuruluşu. Paranın nasıl korunduğu Wise sayfasında açıkça anlatılıyor; açmadan önce okumanızı öneririm." },
      ],
    },
    en: {
      category: "International transfers · Multi-currency account",
      tagline: "Why I use Wise for payments abroad",
      short: "Send money at the real exchange rate with the fee shown upfront; hold many currencies in one account.",
      intro: "Working with clients in different countries means money moves in different currencies. Instead of hidden bank exchange margins, I wanted a way to see exactly what I pay upfront. Wise is the account I use for that, and I recommend it for both personal and business use.",
      reasons: [
        { t: "Real rate, clear fee", d: "Transfers use the mid-market rate and the fee is shown clearly before you send. I see exactly how much will arrive on the other side." },
        { t: "Many currencies in one account", d: "I can hold euros, lira, dollars and many more currencies in the same account and convert them when needed." },
        { t: "Local account details", d: "I get local account details for different currencies, so clients abroad can pay me as if they were paying into a local account." },
        { t: "A card for abroad", d: "When I pay by card while travelling, the money comes straight from the matching currency in the account or is converted at a fair rate." },
      ],
      forWhom: ["Anyone who regularly sends or receives money abroad", "Freelancers and businesses with clients in other countries", "People who send money to family in another country", "Frequent travellers"],
      cons: ["Not a classic bank: no loans and no overdraft.", "The fee depends on currency and amount; check the fee shown before each transfer.", "Free ATM withdrawals only up to a monthly limit, then fees apply. The business account may have extra fees; current conditions are on the Wise page."],
      steps: ["Use the button below to go to Wise and open a personal or business account.", "Verify your identity in the app or on the website.", "Make your first transfer, or add money to your account and start using the card."],
      faq: [
        { q: "Does opening through this link cost me extra?", a: "No. The conditions stay the same; I may only receive a small reward or commission." },
        { q: "In which countries can I use it?", a: "With Wise you can send money to many countries around the world and in dozens of currencies. Who can open an account in which country, and which currencies are supported, is listed up to date on the Wise page." },
        { q: "Is my money safe?", a: "Wise is not a bank but a licensed payment institution. How your money is protected is explained clearly on the Wise page; I suggest reading it before opening an account." },
      ],
    },
    de: {
      category: "Internationale Überweisungen · Mehrwährungskonto",
      tagline: "Warum ich Wise für Zahlungen ins Ausland nutze",
      short: "Geld zum echten Wechselkurs senden, die Gebühr sehen Sie vorab; viele Währungen in einem Konto halten.",
      intro: "Wer mit Kunden in verschiedenen Ländern arbeitet, bewegt Geld in verschiedenen Währungen. Statt versteckter Wechselkursaufschläge der Banken wollte ich vorher genau sehen, was ich zahle. Wise ist das Konto, das ich dafür nutze, und ich empfehle es privat wie geschäftlich.",
      reasons: [
        { t: "Echter Kurs, klare Gebühr", d: "Überweisungen laufen zum Mittelkurs, und die Gebühr steht klar da, bevor Sie senden. Ich sehe genau, wie viel auf der anderen Seite ankommt." },
        { t: "Viele Währungen in einem Konto", d: "Euro, Lira, Dollar und viele weitere Währungen halte ich im selben Konto und tausche sie bei Bedarf." },
        { t: "Lokale Kontodaten", d: "Für verschiedene Währungen bekomme ich lokale Kontodaten, sodass Kunden im Ausland wie auf ein inländisches Konto zahlen können." },
        { t: "Eine Karte fürs Ausland", d: "Wenn ich auf Reisen mit Karte zahle, wird direkt aus der passenden Währung im Konto abgebucht oder zu einem fairen Kurs umgerechnet." },
      ],
      forWhom: ["Alle, die regelmäßig Geld ins Ausland senden oder von dort erhalten", "Selbstständige und Unternehmen mit Kunden in anderen Ländern", "Wer Geld an Familie in einem anderen Land schickt", "Vielreisende"],
      cons: ["Keine klassische Bank: keine Kredite und kein Dispo.", "Die Gebühr hängt von Währung und Betrag ab; prüfen Sie vor jeder Überweisung die angezeigte Gebühr.", "Kostenlose Abhebungen am Automaten nur bis zu einem monatlichen Limit, danach fallen Gebühren an. Beim Geschäftskonto können zusätzliche Gebühren anfallen; aktuelle Konditionen auf der Wise-Seite."],
      steps: ["Gehen Sie über den Button unten zu Wise und eröffnen Sie ein Privat- oder Geschäftskonto.", "Bestätigen Sie Ihre Identität in der App oder auf der Website.", "Machen Sie Ihre erste Überweisung oder laden Sie Geld aufs Konto und nutzen Sie die Karte."],
      faq: [
        { q: "Kostet mich die Eröffnung über diesen Link mehr?", a: "Nein. Die Konditionen bleiben gleich; ich erhalte höchstens eine kleine Prämie oder Provision." },
        { q: "In welchen Ländern kann ich es nutzen?", a: "Mit Wise senden Sie Geld in viele Länder weltweit und in Dutzenden Währungen. Wer in welchem Land ein Konto eröffnen kann und welche Währungen unterstützt werden, steht aktuell auf der Wise-Seite." },
        { q: "Ist mein Geld sicher?", a: "Wise ist keine Bank, sondern ein lizenziertes Zahlungsinstitut. Wie Ihr Geld geschützt wird, erklärt Wise auf seiner Seite klar; lesen Sie das am besten vor der Eröffnung." },
      ],
    },
    el: {
      category: "Διεθνή εμβάσματα · Λογαριασμός πολλών νομισμάτων",
      tagline: "Γιατί χρησιμοποιώ το Wise για πληρωμές στο εξωτερικό",
      short: "Στείλτε χρήματα με την πραγματική ισοτιμία και την χρέωση φανερή από την αρχή· κρατήστε πολλά νομίσματα σε έναν λογαριασμό.",
      intro: "Όταν δουλεύεις με πελάτες σε διαφορετικές χώρες, τα χρήματα κινούνται σε διαφορετικά νομίσματα. Αντί για κρυφές προμήθειες συναλλάγματος των τραπεζών, ήθελα να βλέπω από την αρχή ακριβώς τι πληρώνω. Το Wise είναι ο λογαριασμός που χρησιμοποιώ γι' αυτό και το προτείνω τόσο για προσωπική όσο και για επαγγελματική χρήση.",
      reasons: [
        { t: "Πραγματική ισοτιμία, καθαρή χρέωση", d: "Τα εμβάσματα γίνονται με τη μέση ισοτιμία της αγοράς και η χρέωση φαίνεται καθαρά πριν στείλετε. Βλέπω ακριβώς πόσα θα φτάσουν στην άλλη πλευρά." },
        { t: "Πολλά νομίσματα σε έναν λογαριασμό", d: "Κρατώ ευρώ, λίρες, δολάρια και πολλά άλλα νομίσματα στον ίδιο λογαριασμό και τα μετατρέπω όταν χρειάζεται." },
        { t: "Τοπικά στοιχεία λογαριασμού", d: "Παίρνω τοπικά στοιχεία λογαριασμού για διάφορα νομίσματα, ώστε πελάτες στο εξωτερικό να με πληρώνουν σαν σε τοπικό λογαριασμό." },
        { t: "Κάρτα για το εξωτερικό", d: "Όταν πληρώνω με κάρτα σε ταξίδι, τα χρήματα χρεώνονται απευθείας από το αντίστοιχο νόμισμα του λογαριασμού ή μετατρέπονται με δίκαιη ισοτιμία." },
      ],
      forWhom: ["Όσοι στέλνουν ή λαμβάνουν τακτικά χρήματα από το εξωτερικό", "Ελεύθεροι επαγγελματίες και επιχειρήσεις με πελάτες σε άλλες χώρες", "Όσοι στέλνουν χρήματα στην οικογένειά τους σε άλλη χώρα", "Όσοι ταξιδεύουν συχνά"],
      cons: ["Δεν είναι κλασική τράπεζα: χωρίς δάνεια και χωρίς υπερανάληψη.", "Η χρέωση εξαρτάται από το νόμισμα και το ποσό· ελέγξτε τη χρέωση που εμφανίζεται πριν από κάθε έμβασμα.", "Δωρεάν αναλήψεις από ΑΤΜ μόνο μέχρι ένα μηνιαίο όριο, μετά υπάρχουν χρεώσεις. Ο επαγγελματικός λογαριασμός μπορεί να έχει επιπλέον χρεώσεις· οι τρέχοντες όροι βρίσκονται στη σελίδα του Wise."],
      steps: ["Πατήστε το κουμπί παρακάτω για να μεταβείτε στο Wise και ανοίξτε προσωπικό ή επαγγελματικό λογαριασμό.", "Επιβεβαιώστε την ταυτότητά σας στην εφαρμογή ή στον ιστότοπο.", "Κάντε το πρώτο σας έμβασμα ή προσθέστε χρήματα στον λογαριασμό και ξεκινήστε να χρησιμοποιείτε την κάρτα."],
      faq: [
        { q: "Μου κοστίζει κάτι επιπλέον το άνοιγμα μέσω αυτού του συνδέσμου;", a: "Όχι. Οι όροι μένουν ίδιοι· εγώ μπορεί να λάβω μόνο μια μικρή ανταμοιβή ή προμήθεια." },
        { q: "Σε ποιες χώρες μπορώ να το χρησιμοποιήσω;", a: "Με το Wise στέλνετε χρήματα σε πολλές χώρες του κόσμου και σε δεκάδες νομίσματα. Ποιοι μπορούν να ανοίξουν λογαριασμό σε ποια χώρα και ποια νομίσματα υποστηρίζονται αναγράφεται επίκαιρα στη σελίδα του Wise." },
        { q: "Είναι ασφαλή τα χρήματά μου;", a: "Το Wise δεν είναι τράπεζα αλλά αδειοδοτημένο ίδρυμα πληρωμών. Ο τρόπος προστασίας των χρημάτων εξηγείται καθαρά στη σελίδα του Wise· σας προτείνω να τον διαβάσετε πριν ανοίξετε λογαριασμό." },
      ],
    },
  },
};
