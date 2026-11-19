// Client intake: friendlier page order, plain-language "What does this mean?" help and short section intros.
// No question is removed; questions are only moved. Texts in 4 languages (tr, en, de, el), singular voice, no jargon.
import { l4, type L4, type QDef } from './intakeSectors.js';

/** New page 2: easy, motivating questions first ("your dream"), taken from later sections. */
export const DREAM_IDS = ['success_definition', 'repetitive_tasks', 'growth_12m', 'new_customers_month', 'target_customer_type', 'website_goals'];
export const DREAM_TITLE: L4 = l4(['Hayaliniz', 'Your vision', 'Ihre Vision', 'Το όραμά σας']);

/** Page order after "start" and "dream": the technical and budget pages come last. */
export const SECTION_ORDER = ['start', 'website', 'booking', 'qr', 'crm', 'invoices', 'automation', 'app', 'ai', 'notsure', 'final'];

/** Short encouraging text at the top of a page. */
export const SECTION_INTRO: Record<string, L4> = {
  app: l4([
    'Web sitesi değil, sadece size ait bir program düşünün: giriş yapılan, kendi kayıtlarınızın ve işlerinizin olduğu bir panel. Telefonda ve bilgisayarda çalışır.',
    'Not a website but a program that is only yours: a panel you log in to, with your own records and tasks. It works on phone and computer.',
    'Keine Website, sondern ein Programm nur für Sie: ein Bereich mit Login, Ihren eigenen Daten und Aufgaben. Läuft am Handy und am Computer.',
    'Όχι ιστοσελίδα αλλά ένα πρόγραμμα μόνο για εσάς: ένας χώρος με σύνδεση, με τα δικά σας δεδομένα και εργασίες. Λειτουργεί σε κινητό και υπολογιστή.',
  ]),
  autodetail: l4([
    'Birkaç kısa soru daha: böylece otomasyonu tam ihtiyacınıza göre ve doğru fiyatla planlayabilirim.',
    'A few more short questions, so I can plan the automation exactly for your needs and at the right price.',
    'Noch ein paar kurze Fragen, damit ich die Automatisierung genau nach Ihrem Bedarf und zum passenden Preis planen kann.',
    'Λίγες ακόμη σύντομες ερωτήσεις, για να σχεδιάσω την αυτοματοποίηση ακριβώς για τις ανάγκες σας και στη σωστή τιμή.',
  ]),
  crm: l4([
    'CRM, müşterilerinizi, taleplerinizi ve işlerinizi tek yerde tuttuğunuz kendi programınızdır. Hazır bir programa uymak zorunda kalmazsınız; sistem sizin çalışma şeklinize göre yapılır.',
    'A CRM is your own program that keeps your customers, enquiries and jobs in one place. You don’t have to adapt to off-the-shelf software; the system is built around the way you work.',
    'Ein CRM ist Ihr eigenes Programm, das Kunden, Anfragen und Aufträge an einem Ort bündelt. Sie müssen sich keiner fertigen Software anpassen; das System richtet sich nach Ihrer Arbeitsweise.',
    'Το CRM είναι το δικό σας πρόγραμμα που κρατά πελάτες, αιτήματα και εργασίες σε ένα σημείο. Δεν χρειάζεται να προσαρμοστείτε σε έτοιμο λογισμικό· το σύστημα φτιάχνεται γύρω από τον τρόπο που δουλεύετε.',
  ]),
  dream: l4([
    'Önce hayalinizle başlayalım. Doğru ya da yanlış cevap yok; aklınıza ne geliyorsa birkaç kelimeyle yazın.',
    'Let’s start with your vision. There are no right or wrong answers; just write whatever comes to mind in a few words.',
    'Beginnen wir mit Ihrer Vision. Es gibt keine richtigen oder falschen Antworten; schreiben Sie einfach in ein paar Worten, was Ihnen einfällt.',
    'Ας ξεκινήσουμε από το όραμά σας. Δεν υπάρχουν σωστές ή λάθος απαντήσεις· γράψτε με λίγα λόγια ό,τι σας έρχεται στο μυαλό.',
  ]),
  automation: l4([
    'Otomasyon kısaca şudur: “Bu olunca, şu kendiliğinden olsun.” Siz o işi artık elle yapmazsınız. Aşağıdaki örneğe bakın, sonra size uyanları işaretleyin.',
    'Automation in short: “When this happens, that happens by itself.” You no longer do that task by hand. See the example below, then tick what fits you.',
    'Automatisierung kurz erklärt: „Wenn das passiert, passiert das andere von selbst.“ Sie erledigen diese Aufgabe nicht mehr von Hand. Sehen Sie sich das Beispiel an und kreuzen Sie an, was passt.',
    'Αυτοματοποίηση με δυο λόγια: «Όταν γίνει αυτό, να γίνεται εκείνο από μόνο του.» Δεν κάνετε πια αυτή τη δουλειά με το χέρι. Δείτε το παράδειγμα και επιλέξτε ό,τι σας ταιριάζει.',
  ]),
  tech: l4([
    'Bu bölüm biraz teknik. Bilmediğiniz yerde “Emin değilim” deyin ya da boş bırakın; bunlar benim işim, ben hallederim.',
    'This part is a bit technical. Where you don’t know, choose “Not sure” or leave it empty; this is my job, I’ll take care of it.',
    'Dieser Teil ist etwas technisch. Wo Sie es nicht wissen, wählen Sie „Nicht sicher“ oder lassen Sie es leer; das ist meine Aufgabe, ich kümmere mich darum.',
    'Αυτό το μέρος είναι λίγο τεχνικό. Όπου δεν γνωρίζετε, επιλέξτε «Δεν είμαι σίγουρος/η» ή αφήστε το κενό· αυτή είναι η δουλειά μου, θα το φροντίσω.',
  ]),
  project: l4([
    'Bütçe soruları, teklifi size uygun hâle getirmek için. Kesin rakam gerekmez; kabaca bir aralık yeterli. Bütçe küçükse önce en önemli kısmı yapıp gerisini sonraya bırakabiliriz.',
    'The budget questions help me shape an offer that fits you. No exact figure needed; a rough range is enough. If the budget is small, we can start with the most important part and add the rest later.',
    'Die Budgetfragen helfen mir, ein passendes Angebot zu erstellen. Eine genaue Zahl ist nicht nötig; ein grober Rahmen genügt. Bei kleinem Budget beginnen wir mit dem Wichtigsten und ergänzen den Rest später.',
    'Οι ερωτήσεις για τον προϋπολογισμό με βοηθούν να φτιάξω μια προσφορά που σας ταιριάζει. Δεν χρειάζεται ακριβές ποσό· αρκεί ένα εύρος. Αν ο προϋπολογισμός είναι μικρός, ξεκινάμε από το πιο σημαντικό και τα υπόλοιπα έρχονται αργότερα.',
  ]),
};

/** Simple "when → then" picture for the automation page. */
export const AUTOMATION_FLOW: L4[] = [
  l4(['Müşteri formu gönderir', 'A customer sends the form', 'Ein Kunde sendet das Formular', 'Ένας πελάτης στέλνει τη φόρμα']),
  l4(['Size anında bildirim gelir', 'You get a notification at once', 'Sie werden sofort benachrichtigt', 'Λαμβάνετε αμέσως ειδοποίηση']),
  l4(['Müşteriye otomatik “mesajınız ulaştı” gider', 'The customer automatically gets “we received your message”', 'Der Kunde erhält automatisch „Nachricht erhalten“', 'Ο πελάτης λαμβάνει αυτόματα «λάβαμε το μήνυμά σας»']),
  l4(['Bilgiler müşteri listenize eklenir', 'The details are added to your customer list', 'Die Daten landen in Ihrer Kundenliste', 'Τα στοιχεία μπαίνουν στη λίστα πελατών σας']),
];

/** "What does this mean?" per question (shown on demand, never required reading). */
export const QUESTION_HELP: Record<string, L4> = {
  crm_stages: l4([
    'Bu aşamalar sistemde sütunlar olur. Müşteriyi bir sütundan diğerine taşıyarak kimin nerede olduğunu her an görürsünüz.',
    'These stages become columns in the system. By moving a customer from one column to the next, you always see where everyone stands.',
    'Diese Phasen werden im System zu Spalten. Sie verschieben einen Kunden von Spalte zu Spalte und sehen jederzeit, wo wer steht.',
    'Αυτά τα στάδια γίνονται στήλες στο σύστημα. Μετακινώντας έναν πελάτη από στήλη σε στήλη, βλέπετε πάντα πού βρίσκεται ο καθένας.',
  ]),
  web_goal: l4([
    'En önemli amacı seçin; tasarım ve içerik buna göre şekillenir. Emin değilseniz en çok işinize yarayacak olanı seçin.',
    'Pick the most important aim; design and content follow from it. If unsure, choose what would help your business most.',
    'Wählen Sie das wichtigste Ziel; Gestaltung und Inhalt richten sich danach. Wenn Sie unsicher sind, nehmen Sie das, was Ihrem Geschäft am meisten nützt.',
    'Επιλέξτε τον σημαντικότερο στόχο· ο σχεδιασμός και το περιεχόμενο προσαρμόζονται σε αυτόν. Αν δεν είστε σίγουροι, διαλέξτε ό,τι βοηθά περισσότερο την επιχείρησή σας.',
  ]),
  web_parts: l4([
    'Bölümler sitenizin menüsü olur, örneğin Hizmetler, Hakkımda, İletişim. Küçük başlamak ve sonra eklemek mümkündür.',
    'Parts become the menu of your site, e.g. Services, About, Contact. You can start small and add more later.',
    'Bereiche werden zum Menü Ihrer Website, z. B. Leistungen, Über mich, Kontakt. Sie können klein anfangen und später erweitern.',
    'Τα τμήματα γίνονται το μενού του ιστότοπού σας, π.χ. Υπηρεσίες, Σχετικά, Επικοινωνία. Μπορείτε να ξεκινήσετε μικρά και να προσθέσετε αργότερα.',
  ]),
  web_features: l4([
    'Özellikler ziyaretçinin sitede yapabildikleridir, örneğin randevu almak, form göndermek ya da WhatsApp’tan yazmak. Ne kadar çoğu seçilirse o kadar kapsam büyür.',
    'Features are what visitors can do on the site, e.g. book, send a form or write on WhatsApp. The more you pick, the larger the scope.',
    'Funktionen sind das, was Besucher auf der Website tun können, z. B. buchen, ein Formular senden oder per WhatsApp schreiben. Je mehr Sie wählen, desto größer der Umfang.',
    'Οι λειτουργίες είναι όσα μπορεί να κάνει ο επισκέπτης, π.χ. να κλείσει ραντεβού, να στείλει φόρμα ή να γράψει στο WhatsApp. Όσα περισσότερα επιλέξετε, τόσο μεγαλύτερο το εύρος.',
  ]),
  web_content: l4([
    'Metin ve fotoğraflar sitenin en çok zaman alan kısmıdır. Hazır değilse sorun değil; eksik olanı ben tamamlarım.',
    'Texts and photos are what takes the most time. If they are not ready, no problem; I will complete what is missing.',
    'Texte und Fotos kosten erfahrungsgemäß am meisten Zeit. Wenn sie nicht fertig sind, ist das kein Problem; ich ergänze, was fehlt.',
    'Τα κείμενα και οι φωτογραφίες είναι αυτά που παίρνουν τον περισσότερο χρόνο. Αν δεν είναι έτοιμα, κανένα πρόβλημα· θα συμπληρώσω ό,τι λείπει.',
  ]),
  web_look: l4([
    'Burada kesin bir tasarım istenmiyor; yalnızca genel his. Renk ve düzen buna göre seçilir.',
    'No exact design is asked for here, only the general feeling. Colours and layout are chosen to match.',
    'Hier wird kein genaues Design verlangt, nur der Gesamteindruck. Farben und Aufbau richten sich danach.',
    'Δεν ζητείται ακριβές σχέδιο, μόνο η γενική αίσθηση. Τα χρώματα και η διάταξη επιλέγονται ανάλογα.',
  ]),
  web_examples: l4([
    'Beğendiğiniz sitelerin adresini yazın; neyi sevdiğinizi (renk, düzen, sadelik) belirtmeniz yeter. Kopyalamak için değil, zevkinizi anlamak içindir.',
    'Write the addresses of sites you like and say what you like about them (colour, layout, simplicity). It is not for copying, only to understand your taste.',
    'Schreiben Sie die Adressen von Seiten, die Ihnen gefallen, und was daran (Farbe, Aufbau, Schlichtheit). Es geht nicht ums Kopieren, sondern darum, Ihren Geschmack zu verstehen.',
    'Γράψτε τις διευθύνσεις ιστότοπων που σας αρέσουν και τι σας αρέσει (χρώμα, διάταξη, απλότητα). Δεν είναι για αντιγραφή, αλλά για να καταλάβω το γούστο σας.',
  ]),
  web_update: l4([
    'Yazıları, fiyatları ve fotoğrafları değiştirmek isteyip istemediğinizi belirtir. Kendiniz yapacaksanız kolay bir yönetim ekranı kurulur.',
    'This tells whether you want to change texts, prices and photos yourself. If you do, an easy editing area is set up.',
    'Das zeigt, ob Sie Texte, Preise und Fotos selbst ändern möchten. Wenn ja, wird ein einfacher Bearbeitungsbereich eingerichtet.',
    'Δείχνει αν θέλετε να αλλάζετε μόνοι σας κείμενα, τιμές και φωτογραφίες. Αν ναι, στήνεται μια εύκολη περιοχή επεξεργασίας.',
  ]),
  tech_site: l4([
    'Alan adı (domain), sitenizin internetteki adresidir, örneğin firmaniz.com. Bir kez alınır, her yıl küçük bir ücretle yenilenir. Yoksa sorun değil, birlikte seçebiliriz.',
    'A domain is your website’s address on the internet, e.g. yourcompany.com. You register it once and renew it yearly for a small fee. If you don’t have one, no problem, we can pick one together.',
    'Eine Domain ist die Adresse Ihrer Website im Internet, z. B. ihrefirma.de. Sie wird einmal registriert und jährlich gegen eine kleine Gebühr verlängert. Falls Sie keine haben: kein Problem, wir wählen gemeinsam eine aus.',
    'Το domain είναι η διεύθυνση της ιστοσελίδας σας στο διαδίκτυο, π.χ. etaireiasas.gr. Καταχωρείται μία φορά και ανανεώνεται κάθε χρόνο με μικρό κόστος. Αν δεν έχετε, κανένα πρόβλημα, το επιλέγουμε μαζί.',
  ]),
  tech_hosting: l4([
    'Hosting, sitenizin dosyalarının durduğu bilgisayardır (sunucu). Kimin yönettiğini bilmiyorsanız “bilmiyorum” yazmanız yeterli.',
    'Hosting is the computer (server) where your website’s files live. If you don’t know who manages it, just write “I don’t know”.',
    'Hosting ist der Computer (Server), auf dem die Dateien Ihrer Website liegen. Wenn Sie nicht wissen, wer ihn verwaltet, schreiben Sie einfach „weiß ich nicht“.',
    'Hosting είναι ο υπολογιστής (διακομιστής) όπου βρίσκονται τα αρχεία της ιστοσελίδας σας. Αν δεν ξέρετε ποιος τον διαχειρίζεται, γράψτε απλώς «δεν ξέρω».',
  ]),
  tech_platform: l4([
    'Vercel, Netlify ve Cloudflare siteleri hızlı ve güvenli yayınlayan hizmetlerdir. Alan adınız hazır olmasa da siteniz önce geçici bir adreste (ör. firmaniz.vercel.app) açılabilir. Bu şirketler ABD merkezlidir; siteyi Avrupa’daki sunuculardan çalıştırmak mümkündür ve verilerin nerede durduğunu size açıkça yazarım.',
    'Vercel, Netlify and Cloudflare are services that publish websites quickly and securely. Even without your own domain, the site can first go live at a temporary address (e.g. yourcompany.vercel.app). These companies are based in the USA; the site can run from servers in Europe, and I will tell you clearly where data is stored.',
    'Vercel, Netlify und Cloudflare sind Dienste, die Websites schnell und sicher veröffentlichen. Auch ohne eigene Domain kann die Website zunächst unter einer vorläufigen Adresse (z. B. ihrefirma.vercel.app) online gehen. Diese Unternehmen haben ihren Sitz in den USA; die Website kann von Servern in Europa aus laufen, und ich sage Ihnen klar, wo Daten gespeichert werden.',
    'Τα Vercel, Netlify και Cloudflare είναι υπηρεσίες που δημοσιεύουν ιστοσελίδες γρήγορα και με ασφάλεια. Ακόμη και χωρίς δικό σας domain, η σελίδα μπορεί πρώτα να λειτουργήσει σε προσωρινή διεύθυνση (π.χ. etaireiasas.vercel.app). Οι εταιρείες αυτές έχουν έδρα στις ΗΠΑ· η σελίδα μπορεί να τρέχει από διακομιστές στην Ευρώπη και θα σας πω ξεκάθαρα πού αποθηκεύονται τα δεδομένα.',
  ]),
  tech_tools: l4([
    'Örneğin Google Takvim, bir muhasebe programı, WhatsApp Business, Excel listeleri. Aklınıza gelenleri yazmanız yeterli.',
    'For example Google Calendar, an accounting program, WhatsApp Business, Excel lists. Just write whatever comes to mind.',
    'Zum Beispiel Google Kalender, ein Buchhaltungsprogramm, WhatsApp Business, Excel-Listen. Schreiben Sie einfach, was Ihnen einfällt.',
    'Για παράδειγμα Google Calendar, ένα λογιστικό πρόγραμμα, WhatsApp Business, λίστες Excel. Γράψτε απλώς ό,τι σας έρχεται στο μυαλό.',
  ]),
  crm_current: l4([
    'CRM, müşterilerinizi, konuşmaları ve teklifleri tek yerde tutan bir müşteri listesi programıdır. Bir Excel tablosu ya da defter de bir tür CRM sayılır.',
    'A CRM is a customer-list program that keeps your customers, conversations and quotes in one place. An Excel sheet or a notebook counts as a simple CRM too.',
    'Ein CRM ist ein Kundenlisten-Programm, das Kunden, Gespräche und Angebote an einem Ort festhält. Auch eine Excel-Tabelle oder ein Notizbuch zählt als einfaches CRM.',
    'Το CRM είναι ένα πρόγραμμα λίστας πελατών που κρατά πελάτες, συνομιλίες και προσφορές σε ένα σημείο. Ακόμη και ένα φύλλο Excel ή ένα τετράδιο μετράει ως απλό CRM.',
  ]),
  google_business: l4([
    'Google’da ya da Haritalar’da işletmenizi aradığınızda çıkan kartvizittir: adres, çalışma saatleri, yorumlar. Ücretsizdir.',
    'It is the business card that shows up when someone searches for your business on Google or Maps: address, opening hours, reviews. It is free.',
    'Das ist die Visitenkarte, die erscheint, wenn jemand Ihr Unternehmen bei Google oder Maps sucht: Adresse, Öffnungszeiten, Bewertungen. Sie ist kostenlos.',
    'Είναι η «κάρτα» που εμφανίζεται όταν κάποιος αναζητά την επιχείρησή σας στο Google ή στους Χάρτες: διεύθυνση, ωράριο, κριτικές. Είναι δωρεάν.',
  ]),
  form_flow: l4([
    'Örneğin: form gelince size bildirim gelsin, müşteriye otomatik “mesajınız ulaştı” yazılsın, bilgiler müşteri listenize eklensin.',
    'For example: you get a notification, the customer automatically receives “message received”, and the details are added to your customer list.',
    'Zum Beispiel: Sie werden benachrichtigt, der Kunde erhält automatisch „Nachricht erhalten“, und die Daten landen in Ihrer Kundenliste.',
    'Για παράδειγμα: λαμβάνετε ειδοποίηση, ο πελάτης παίρνει αυτόματα «λάβαμε το μήνυμά σας» και τα στοιχεία μπαίνουν στη λίστα πελατών σας.',
  ]),
  auto_crm: l4([
    'Yeni bir müşteri yazdığında bilgileri elle kopyalamazsınız; müşteri listenize kendiliğinden eklenir.',
    'When a new customer writes to you, you don’t copy the details by hand; they are added to your customer list automatically.',
    'Wenn ein neuer Kunde schreibt, kopieren Sie die Daten nicht von Hand; sie werden automatisch in Ihre Kundenliste übernommen.',
    'Όταν σας γράφει νέος πελάτης, δεν αντιγράφετε τα στοιχεία με το χέρι· προστίθενται αυτόματα στη λίστα πελατών σας.',
  ]),
  messenger_notify: l4([
    'Örneğin randevudan bir gün önce müşteriye kendiliğinden giden bir WhatsApp hatırlatması.',
    'For example, a WhatsApp reminder that goes to the customer automatically one day before the appointment.',
    'Zum Beispiel eine WhatsApp-Erinnerung, die automatisch einen Tag vor dem Termin an den Kunden geht.',
    'Για παράδειγμα, μια υπενθύμιση στο WhatsApp που πηγαίνει αυτόματα στον πελάτη μία μέρα πριν από το ραντεβού.',
  ]),
  auto_quotes: l4([
    'Müşterinin formda verdiği bilgilere göre bir teklif taslağı kendiliğinden hazırlanır; siz yalnızca kontrol edip gönderirsiniz.',
    'Based on what the customer entered in the form, a draft quote is prepared automatically; you only check it and send it.',
    'Aus den Angaben im Formular entsteht automatisch ein Angebotsentwurf; Sie prüfen ihn nur noch und senden ihn ab.',
    'Με βάση όσα έγραψε ο πελάτης στη φόρμα, ετοιμάζεται αυτόματα ένα προσχέδιο προσφοράς· εσείς απλώς το ελέγχετε και το στέλνετε.',
  ]),
  invoicing: l4([
    'Örneğin iş bitince faturanın muhasebe programınızda kendiliğinden oluşması.',
    'For example, the invoice being created in your accounting program automatically when a job is done.',
    'Zum Beispiel, dass die Rechnung nach Abschluss eines Auftrags automatisch in Ihrem Buchhaltungsprogramm entsteht.',
    'Για παράδειγμα, το τιμολόγιο να δημιουργείται αυτόματα στο λογιστικό σας πρόγραμμα όταν τελειώνει μια δουλειά.',
  ]),
  local_search: l4([
    'İnsanlar Google’da “hizmet + şehir” diye arattığında sizi bulmaları (yerel arama).',
    'People finding you when they search Google for “service + city” (local search).',
    'Dass man Sie findet, wenn jemand bei Google „Leistung + Stadt“ sucht (lokale Suche).',
    'Να σας βρίσκουν όταν αναζητούν στο Google «υπηρεσία + πόλη» (τοπική αναζήτηση).',
  ]),
  business_email: l4([
    'Gmail yerine kendi alan adınızla bir e-posta adresi; müşterilere daha fazla güven verir.',
    'An e-mail address with your own domain instead of Gmail; it builds more trust with customers.',
    'Eine E-Mail-Adresse mit Ihrer eigenen Domain statt Gmail; das schafft mehr Vertrauen bei Kunden.',
    'Μια διεύθυνση e-mail με το δικό σας domain αντί για Gmail· εμπνέει περισσότερη εμπιστοσύνη στους πελάτες.',
  ]),
  tech_access: l4([
    'Lütfen şifre veya giriş bilgisi yazmayın. Sadece kimin yönettiğini ve bilgilerin sizde olup olmadığını belirtin; gerekirse güvenli bir yolla ayrıca hallederiz.',
    'Please do not write passwords or login details here. Just say who manages it and whether you have the details; if needed, we’ll handle access separately in a safe way.',
    'Bitte schreiben Sie hier keine Passwörter oder Zugangsdaten. Nennen Sie nur, wer es verwaltet und ob Ihnen die Daten vorliegen; bei Bedarf regeln wir den Zugang separat und sicher.',
    'Παρακαλώ μη γράφετε εδώ κωδικούς ή στοιχεία σύνδεσης. Πείτε μόνο ποιος το διαχειρίζεται και αν έχετε τα στοιχεία· αν χρειαστεί, το κανονίζουμε χωριστά με ασφάλεια.',
  ]),
  budget_onetime: l4([
    'Kabaca bir rakam ya da aralık yeterli. Dürüst bir rakam, size gerçekten uyan bir teklif hazırlamamı sağlar.',
    'A rough figure or range is enough. An honest number lets me prepare an offer that really fits you.',
    'Eine grobe Zahl oder Spanne genügt. Eine ehrliche Angabe hilft mir, ein wirklich passendes Angebot zu erstellen.',
    'Αρκεί ένα ενδεικτικό ποσό ή εύρος. Ένας ειλικρινής αριθμός με βοηθά να ετοιμάσω μια προσφορά που πραγματικά σας ταιριάζει.',
  ]),
  budget_monthly: l4([
    'Aylık ücret genelde sunucu, yedekleme, güvenlik güncellemeleri ve küçük değişiklikleri kapsar.',
    'A monthly fee usually covers the server, backups, security updates and small changes.',
    'Eine monatliche Gebühr deckt meist Server, Backups, Sicherheitsupdates und kleine Änderungen ab.',
    'Η μηνιαία χρέωση συνήθως καλύπτει διακομιστή, αντίγραφα ασφαλείας, ενημερώσεις ασφαλείας και μικρές αλλαγές.',
  ]),
};

QUESTION_HELP.web_existing = QUESTION_HELP.tech_site;

/** Who provides the legal texts (Impressum, privacy policy / KVKK, terms)? Added to the budget page. */
export const LEGAL_Q: QDef = {
  id: 'legal_texts', type: 'single', mustRead: true,
  // Shown highlighted inside the starred help: lawyer cost depends on the lawyer; small coordination share (~10 %)
  costNote: l4([
    'Hukukçuya yazdırma seçeneğinde ücreti avukat belirler ve avukata göre değişir. Örneğin avukat yalnızca Impressum için 30 € isterse, toplam yaklaşık 33 € olur. Gizlilik politikası ve kullanım koşulları gibi metinler daha kapsamlıdır; avukata göre genellikle birkaç yüz euro tutabilir. Bunun için ayrıca bir hizmet ücreti almıyorum: avukatla yazışma ve metinleri sitenize yerleştirme için avukat ücretine yalnızca küçük bir koordinasyon payı (yaklaşık %10) eklenir.',
    'If a lawyer writes the texts, the lawyer sets the fee and it varies from lawyer to lawyer. For example, if the lawyer charges €30 for the imprint only, the total is about €33. Texts such as the privacy policy and terms of use are more extensive and can often cost a few hundred euros, depending on the lawyer. I charge no separate service fee for this: only a small coordination share (about 10%) is added to the lawyer’s fee for handling the correspondence and placing the texts on your site.',
    'Bei der Erstellung durch eine Anwaltskanzlei legt die Kanzlei das Honorar fest, und es ist von Kanzlei zu Kanzlei verschieden. Verlangt die Kanzlei zum Beispiel nur für das Impressum 30 €, ergibt das insgesamt etwa 33 €. Texte wie Datenschutzerklärung und AGB sind umfangreicher und können je nach Kanzlei oft einige hundert Euro kosten. Ich berechne dafür keine eigene Servicegebühr: Auf das Anwaltshonorar kommt lediglich ein kleiner Koordinationsanteil (etwa 10 %) für die Abstimmung mit der Kanzlei und das Einbinden der Texte in Ihre Website.',
    'Αν τα κείμενα τα γράψει δικηγόρος, την αμοιβή την ορίζει ο δικηγόρος και διαφέρει από δικηγόρο σε δικηγόρο. Για παράδειγμα, αν ο δικηγόρος χρεώσει 30 € μόνο για τα στοιχεία εκδότη, το σύνολο είναι περίπου 33 €. Κείμενα όπως η πολιτική απορρήτου και οι όροι χρήσης είναι πιο εκτενή και συχνά μπορεί να κοστίσουν μερικές εκατοντάδες ευρώ, ανάλογα με τον δικηγόρο. Δεν χρεώνω ξεχωριστή αμοιβή υπηρεσίας: στην αμοιβή του δικηγόρου προστίθεται μόνο ένα μικρό ποσοστό συντονισμού (περίπου 10%) για την επικοινωνία και την τοποθέτηση των κειμένων στη σελίδα σας.',
  ]),
  t: l4([
    'Yasal metinleri (Impressum, gizlilik politikası / KVKK aydınlatma metni, kullanım koşulları) kim hazırlasın?',
    'Who should prepare the legal texts (imprint, privacy policy, terms of use)?',
    'Wer soll die Rechtstexte (Impressum, Datenschutzerklärung, AGB / Nutzungsbedingungen) erstellen?',
    'Ποιος να ετοιμάσει τα νομικά κείμενα (στοιχεία εκδότη, πολιτική απορρήτου, όροι χρήσης);',
  ]),
  opts: [
    { id: 'own', t: l4(['Ben veya avukatım hazırlayıp vereceğim', 'I or my lawyer will provide them', 'Ich oder meine Anwaltskanzlei liefern sie', 'Εγώ ή ο δικηγόρος μου θα τα δώσουμε']) },
    { id: 'template', t: l4(['Siz hazırlayın: yapay zekâ destekli, sade ve yasalara uygun şablon (avukat incelemesinin yerini tutmaz)', 'You prepare them: a simple, AI-assisted template in line with the law (not a substitute for a lawyer’s review)', 'Sie erstellen sie: einfache, KI-gestützte Vorlage nach geltendem Recht (ersetzt keine anwaltliche Prüfung)', 'Ετοιμάστε τα εσείς: απλό πρότυπο με τη βοήθεια ΤΝ, σύμφωνο με τον νόμο (δεν αντικαθιστά τον έλεγχο από δικηγόρο)']) },
    { id: 'package_setup', t: l4(['Avukatların hazırlayıp güncel tuttuğu online paket: siz kurun', 'Online package written and kept up to date by lawyers: you set it up', 'Online-Paket, von Anwälten erstellt und aktuell gehalten: Sie richten es ein', 'Online πακέτο από δικηγόρους, πάντα ενημερωμένο: ρυθμίστε το εσείς']) },
    { id: 'package_link', t: l4(['Online paketi kendim alacağım: bana linkini gönderin', 'I will get the online package myself: send me the link', 'Ich buche das Online-Paket selbst: senden Sie mir den Link', 'Θα πάρω μόνος/η μου το online πακέτο: στείλτε μου τον σύνδεσμο']) },
    { id: 'lawyer', t: l4(['Bir hukukçuya yazdırılsın, ücreti teklife eklensin', 'Have a lawyer write them and add the cost to the offer', 'Von einer Anwaltskanzlei erstellen lassen, Kosten ins Angebot aufnehmen', 'Να τα γράψει δικηγόρος και το κόστος να μπει στην προσφορά']) },
    { id: 'unsure', t: l4(['Emin değilim', 'Not sure', 'Nicht sicher', 'Δεν είμαι σίγουρος/η']) },
  ],
  help: l4([
    'Her web sitesinin kim tarafından işletildiğini ve verilerin nasıl kullanıldığını açıklayan metinler gerekir. Almanya’da Impressum ve Datenschutzerklärung, Türkiye’de KVKK aydınlatma metni zorunludur. Sitede yapay zekâ asistanı varsa AB Yapay Zekâ Yasası (AI Act) gereği ziyaretçiye bir yapay zekâyla konuştuğu açıkça söylenmelidir; bunu her durumda sitede ben kurarım. Şablon seçerseniz metinlerin avukat incelemesi olmadığı size yazılı olarak bildirilir. Avukatların hazırlayıp yasa değişince güncel tuttuğu online paketler de var (aylık abonelik); isterseniz kurulumu ben yaparım ya da size linkini gönderirim.',
    'Every website needs texts that say who runs it and how data is used. In Germany an imprint (Impressum) and a privacy policy are mandatory; in Turkey a KVKK notice. If the site has an AI assistant, the EU AI Act requires telling visitors clearly that they are talking to an AI; I build that into the site in any case. If you choose the template, I will tell you in writing that the texts are not a lawyer’s review. There are also online packages written by lawyers and kept up to date when the law changes (monthly subscription); I can set it up for you or send you the link.',
    'Jede Website braucht Texte dazu, wer sie betreibt und wie Daten verwendet werden. In Deutschland sind Impressum und Datenschutzerklärung Pflicht. Hat die Website einen KI-Assistenten, verlangt die EU-KI-Verordnung (AI Act), dass Besucher klar erfahren, dass sie mit einer KI sprechen; das baue ich in jedem Fall ein. Wählen Sie die Vorlage, teile ich Ihnen schriftlich mit, dass die Texte keine anwaltliche Prüfung sind. Es gibt außerdem Online-Pakete, die von Anwälten erstellt und bei Gesetzesänderungen aktualisiert werden (Monatsabo); ich richte es für Sie ein oder sende Ihnen den Link.',
    'Κάθε ιστοσελίδα χρειάζεται κείμενα που λένε ποιος τη λειτουργεί και πώς χρησιμοποιούνται τα δεδομένα (π.χ. πολιτική απορρήτου κατά τον GDPR). Αν η σελίδα έχει βοηθό ΤΝ, ο ευρωπαϊκός Κανονισμός για την ΤΝ (AI Act) απαιτεί να ενημερώνονται σαφώς οι επισκέπτες ότι μιλούν με ΤΝ· αυτό το ενσωματώνω σε κάθε περίπτωση. Αν επιλέξετε το πρότυπο, θα σας ενημερώσω γραπτώς ότι τα κείμενα δεν αποτελούν έλεγχο από δικηγόρο. Υπάρχουν επίσης online πακέτα από δικηγόρους, που ενημερώνονται όταν αλλάζει ο νόμος (μηνιαία συνδρομή)· μπορώ να το ρυθμίσω εγώ ή να σας στείλω τον σύνδεσμο.',
  ]),
};

/** Replaces the old yes/no "WhatsApp notifications?" question: which channel, with Telegram recommended. No SMS (not offered). */
export const MESSENGER_Q: QDef = {
  id: 'messenger_notify', type: 'single', detail: true,
  t: l4([
    'Size ve müşterilerinize otomatik bildirimler (yeni talep, randevu hatırlatması vb.) hangi kanaldan gitsin?',
    'Which channel should automatic notifications (new request, appointment reminder, etc.) use for you and your customers?',
    'Über welchen Kanal sollen automatische Benachrichtigungen (neue Anfrage, Terminerinnerung usw.) an Sie und Ihre Kunden gehen?',
    'Από ποιο κανάλι να πηγαίνουν οι αυτόματες ειδοποιήσεις (νέο αίτημα, υπενθύμιση ραντεβού κ.λπ.) σε εσάς και στους πελάτες σας;',
  ]),
  opts: [
    { id: 'telegram', t: l4(['Telegram (önerilen: hızlı kurulum, ücretsiz)', 'Telegram (recommended: quick setup, free)', 'Telegram (empfohlen: schnell eingerichtet, kostenlos)', 'Telegram (προτείνεται: γρήγορη ρύθμιση, δωρεάν)']) },
    { id: 'whatsapp', t: l4(['WhatsApp (kurulumu daha uzun, ek maliyetli)', 'WhatsApp (longer setup, extra cost)', 'WhatsApp (aufwendigere Einrichtung, Zusatzkosten)', 'WhatsApp (πιο χρονοβόρα ρύθμιση, επιπλέον κόστος)']) },
    { id: 'email', t: l4(['E-posta yeterli', 'E-mail is enough', 'E-Mail reicht', 'Αρκεί το e-mail']) },
    { id: 'none', t: l4(['Bildirim istemiyorum', 'No notifications needed', 'Keine Benachrichtigungen nötig', 'Δεν χρειάζομαι ειδοποιήσεις']) },
    { id: 'unsure', t: l4(['Emin değilim', 'Not sure', 'Nicht sicher', 'Δεν είμαι σίγουρος/η']) },
  ],
  help: l4([
    'Telegram’da bildirimler için ücretsiz bir “bot” birkaç dakikada kurulur; size ve isteyen müşterilere anında mesaj gider, sizin bir şeyle uğraşmanız gerekmez. WhatsApp da mümkün, ama resmî yol olan Meta Business hesabı ve doğrulama gerektirir, mesaj başına ücret alınır ve kurulum daha uzun sürer. Resmî olmayan çözümler daha ucuzdur ama numaranın engellenme riski vardır. Kararsızsanız Telegram ile başlamak en kolayıdır.',
    'On Telegram, a free notification “bot” is set up in minutes; you and customers who want it get messages instantly, with no effort on your side. WhatsApp is possible too, but the official way needs a Meta Business account and verification, charges per message and takes longer to set up. Unofficial solutions are cheaper but risk the number being blocked. If unsure, starting with Telegram is easiest.',
    'Bei Telegram ist ein kostenloser Benachrichtigungs-„Bot“ in wenigen Minuten eingerichtet; Sie und Kunden, die es wünschen, erhalten sofort Nachrichten, ohne Aufwand für Sie. WhatsApp ist ebenfalls möglich, der offizielle Weg braucht aber ein Meta-Business-Konto mit Verifizierung, kostet pro Nachricht und dauert länger. Inoffizielle Lösungen sind günstiger, bergen aber das Risiko, dass die Nummer gesperrt wird. Im Zweifel ist Telegram der einfachste Start.',
    'Στο Telegram ένα δωρεάν «bot» ειδοποιήσεων στήνεται σε λίγα λεπτά· εσείς και όσοι πελάτες το θέλουν λαμβάνετε αμέσως μηνύματα, χωρίς κόπο για εσάς. Το WhatsApp είναι επίσης εφικτό, αλλά ο επίσημος τρόπος χρειάζεται λογαριασμό Meta Business και επαλήθευση, χρεώνει ανά μήνυμα και θέλει περισσότερο χρόνο. Οι ανεπίσημες λύσεις είναι φθηνότερες αλλά υπάρχει κίνδυνος αποκλεισμού του αριθμού. Αν δεν είστε σίγουροι, το Telegram είναι η πιο εύκολη αρχή.',
  ]),
};

/** Big add-on systems: plain explanation + an honest note that they raise the price noticeably. */
export const COST_NOTE: L4 = l4([
  'Bu, kendi başına ayrı bir sistemdir ve fiyatı belirgin şekilde etkiler: örneğin web sitesi ve otomasyon için çıkan toplam fiyatı yaklaşık %50–70 artırabilir; kapsama göre daha az ya da daha fazla. Gerçekten ihtiyacınız yoksa “hayır” veya “emin değilim” demeniz bütçenizi korur.',
  'This is a separate system of its own and affects the price noticeably: for example, it can raise the total for website and automation by roughly 50–70%, less or more depending on the scope. If you don’t really need it, answering “no” or “not sure” protects your budget.',
  'Das ist ein eigenständiges System und wirkt sich spürbar auf den Preis aus: Es kann den Gesamtpreis für Website und Automatisierung zum Beispiel um etwa 50–70 % erhöhen, je nach Umfang weniger oder mehr. Wenn Sie es nicht wirklich brauchen, schützt „Nein“ oder „Nicht sicher“ Ihr Budget.',
  'Πρόκειται για ξεχωριστό σύστημα που επηρεάζει αισθητά την τιμή: για παράδειγμα, μπορεί να αυξήσει το συνολικό κόστος ιστοσελίδας και αυτοματοποίησης κατά περίπου 50–70%, λιγότερο ή περισσότερο ανάλογα με το εύρος. Αν δεν το χρειάζεστε πραγματικά, η απάντηση «όχι» ή «δεν είμαι σίγουρος/η» προστατεύει τον προϋπολογισμό σας.',
]);
export const EXTRA_SYSTEM: Record<string, L4> = {
  staff_scheduling: l4([
    'Çalışanların görevlerini, vardiyalarını ve iş randevularını gösteren, kendi giriş ekranı olan ayrı bir ekip planlama sistemidir (bir tür CRM).',
    'A separate team-planning system with its own login that shows staff tasks, shifts and job appointments (a kind of CRM).',
    'Ein eigenes Team-Planungssystem mit eigenem Login, das Aufgaben, Schichten und Einsatztermine der Mitarbeitenden zeigt (eine Art CRM).',
    'Ξεχωριστό σύστημα προγραμματισμού ομάδας με δική του σύνδεση, που δείχνει εργασίες, βάρδιες και ραντεβού του προσωπικού (ένα είδος CRM).',
  ]),
  customer_accounts: l4([
    'Müşterilerin giriş yapıp geçmiş siparişlerini veya randevularını gördüğü üye alanı; şifre sıfırlama, güvenlik ve veri koruma gerektirir.',
    'A members area where customers log in to see past orders or appointments; it needs password reset, security and data protection.',
    'Ein Kundenbereich mit Login, in dem Kunden frühere Bestellungen oder Termine sehen; erfordert Passwort-Reset, Sicherheit und Datenschutz.',
    'Περιοχή μελών όπου οι πελάτες συνδέονται για να δουν παλαιότερες παραγγελίες ή ραντεβού· απαιτεί επαναφορά κωδικού, ασφάλεια και προστασία δεδομένων.',
  ]),
  online_payment: l4([
    'Sitede kartla ödeme (ör. Stripe). Ödeme sağlayıcısının kurulumu, faturalama ve yasal metinler gerekir; sağlayıcı işlem başına ücret alır.',
    'Card payment on the site (e.g. Stripe). It needs payment-provider setup, invoicing and legal texts; the provider charges a fee per transaction.',
    'Kartenzahlung auf der Website (z. B. Stripe). Erfordert Einrichtung des Zahlungsanbieters, Rechnungsstellung und Rechtstexte; der Anbieter berechnet eine Gebühr pro Zahlung.',
    'Πληρωμή με κάρτα στη σελίδα (π.χ. Stripe). Χρειάζεται ρύθμιση παρόχου πληρωμών, τιμολόγηση και νομικά κείμενα· ο πάροχος χρεώνει τέλος ανά συναλλαγή.',
  ]),
  online_booking: l4([
    'Müşterilerin boş saatleri görüp kendilerinin randevu aldığı takvim; çalışan, hizmet süresi, iptal ve hatırlatma ayarlarını içerir.',
    'A calendar where customers see free slots and book themselves; it includes staff, service durations, cancellations and reminders.',
    'Ein Kalender, in dem Kunden freie Zeiten sehen und selbst buchen; mit Mitarbeitenden, Leistungsdauer, Stornierungen und Erinnerungen.',
    'Ημερολόγιο όπου οι πελάτες βλέπουν ελεύθερες ώρες και κλείνουν μόνοι τους ραντεβού· περιλαμβάνει προσωπικό, διάρκεια υπηρεσιών, ακυρώσεις και υπενθυμίσεις.',
  ]),
};
EXTRA_SYSTEM.booking_system = EXTRA_SYSTEM.online_booking;
/** Existing help texts that also get the cost note. */
export const COST_IDS = new Set(['staff_scheduling', 'customer_accounts', 'online_payment', 'online_booking', 'booking_system', 'auto_quotes']);
