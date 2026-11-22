// Client intake: friendlier page order, plain-language "What does this mean?" help and short section intros.
// No question is removed; questions are only moved. Texts in 4 languages (tr, en, de, el), singular voice, no jargon.
import { l4, type L4, type QDef } from './intakeSectors.js';

/** New page 2: easy, motivating questions first ("your dream"), taken from later sections. */
export const DREAM_IDS = ['success_definition', 'repetitive_tasks', 'growth_12m', 'new_customers_month', 'target_customer_type', 'website_goals'];
export const DREAM_TITLE: L4 = l4(['Hayaliniz', 'Your vision', 'Ihre Vision', 'Το όραμά σας']);

/** Page order after "start" and "dream": the technical and budget pages come last. */
export const SECTION_ORDER = ['start', 'dream', 'company', 'current', 'website', 'process', 'crm', 'app', 'automation', 'autodetail', 'design', 'marketing', 'tech', 'booking', 'qr', 'invoices', 'ai', 'style', 'examples', 'project', 'additional', 'final'];

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
  id: 'messenger_notify', type: 'multi', detail: true,
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

// ── Fewer pages: related pages are merged (no question dropped). from → into ──
export const MERGE_INTO: Record<string, { into: string; title: L4; front?: boolean }> = {
  current: { into: 'company', title: l4(['İşletmeniz ve bugünkü durum', 'Your business today', 'Ihr Unternehmen heute', 'Η επιχείρησή σας σήμερα']) },
  marketing: { into: 'design', title: l4(['Tasarım ve bulunabilirlik', 'Design and visibility', 'Gestaltung und Auffindbarkeit', 'Σχεδιασμός και ορατότητα']) },
  autodetail: { into: 'automation', title: l4(['Otomasyon', 'Automation', 'Automatisierung', 'Αυτοματοποίηση']) },
  tech: { into: 'project', front: true, title: l4(['Teknik altyapı, bütçe ve takvim', 'Technology, budget & timeline', 'Technik, Budget & Zeitplan', 'Τεχνολογία, προϋπολογισμός & χρονοδιάγραμμα']) },
};

// ── Per page: who it is for (+ skip hint when optional) and what the answers become ──
type T4 = [string, string, string, string];
const P = (forWho: T4, outcome: T4) => ({ forWho: l4(forWho), outcome: l4(outcome) });
export const SECTION_META: Record<string, { forWho: L4; outcome: L4 }> = {
  start: P(
    ['Bu sayfa herkes içindir: sizi, işinizi ve ne istediğinizi tanımam için gerekli.', 'This page is for everyone: it tells me who you are, what you do and what you need.', 'Diese Seite ist für alle: Sie sagt mir, wer Sie sind, was Sie tun und was Sie brauchen.', 'Αυτή η σελίδα είναι για όλους: μου λέει ποιοι είστε, τι κάνετε και τι χρειάζεστε.'],
    ['Cevaplarınızla hangi sayfaların açılacağı ve teklifin hangi bütçe aralığına göre hazırlanacağı belirlenir.', 'With your answers, the following pages and the budget range the offer is prepared for are set.', 'Mit Ihren Antworten werden die folgenden Seiten und der Budgetrahmen für das Angebot festgelegt.', 'Με τις απαντήσεις σας ορίζονται οι επόμενες σελίδες και το εύρος προϋπολογισμού της προσφοράς.']),
  dream: P(
    ['Bu sayfa hedeflerinizi anlatmanız içindir; birkaç kelime yeterli, bilmediğinizi geçebilirsiniz.', 'This page is for describing your goals; a few words are enough, and you can skip what you don’t know.', 'Diese Seite ist für Ihre Ziele; ein paar Worte genügen, und was Sie nicht wissen, können Sie überspringen.', 'Αυτή η σελίδα είναι για τους στόχους σας· αρκούν λίγα λόγια και μπορείτε να παραλείψετε ό,τι δεν ξέρετε.'],
    ['Bu cevaplarla çözümün önceliği ve teklifin odağı sizin hedeflerinize göre belirlenir.', 'With these answers, the priority of the solution and the focus of the offer follow your goals.', 'Mit diesen Antworten richten sich Schwerpunkt der Lösung und des Angebots nach Ihren Zielen.', 'Με αυτές τις απαντήσεις η προτεραιότητα της λύσης και το επίκεντρο της προσφοράς ακολουθούν τους στόχους σας.']),
  company: P(
    ['Bu sayfa işletmenizi ve bugünkü durumunuzu anlatmanız içindir; bilmediğiniz yerleri boş bırakabilir ya da sayfayı geçebilirsiniz.', 'This page is for describing your business and how things work today; leave blank what you don’t know, or skip the page.', 'Diese Seite ist für Ihr Unternehmen und den heutigen Stand; lassen Sie Unbekanntes leer oder überspringen Sie die Seite.', 'Αυτή η σελίδα είναι για την επιχείρησή σας και την τωρινή κατάσταση· αφήστε κενό ό,τι δεν ξέρετε ή παραλείψτε τη σελίδα.'],
    ['Bu sayfadaki cevaplarla sitenizde hizmetler, hakkında ve iletişim bölümleri ile mevcut araçlarınızla uyum buna göre planlanır.', 'With the answers on this page, the services, about and contact parts of your site and the fit with your current tools are planned.', 'Mit den Antworten dieser Seite werden Leistungen, Über-uns- und Kontaktbereiche Ihrer Website sowie die Einbindung Ihrer heutigen Tools geplant.', 'Με τις απαντήσεις αυτής της σελίδας σχεδιάζονται οι ενότητες υπηρεσιών, σχετικά και επικοινωνίας του ιστότοπου και η συνεργασία με τα τωρινά σας εργαλεία.']),
  website: P(
    ['Bu sayfa yalnızca yeni bir web sitesi istiyorsanız içindir. İstemiyorsanız bu sayfayı geçebilirsiniz.', 'This page is only for if you want a new website. If you don’t, you can skip this page.', 'Diese Seite ist nur für den Fall, dass Sie eine neue Website möchten. Wenn nicht, können Sie sie überspringen.', 'Αυτή η σελίδα αφορά μόνο όσους θέλουν νέα ιστοσελίδα. Αν δεν θέλετε, μπορείτε να την παραλείψετε.'],
    ['Bu sayfadaki cevaplarla sitenizde randevu, teklif formu, sayfalar ve diller buna göre kurulur.', 'With the answers on this page, the booking, quote form, pages and languages of your site are set up accordingly.', 'Mit den Antworten dieser Seite werden Termine, Angebotsformular, Seiten und Sprachen Ihrer Website entsprechend aufgebaut.', 'Με τις απαντήσεις αυτής της σελίδας στήνονται αντίστοιχα τα ραντεβού, η φόρμα προσφοράς, οι σελίδες και οι γλώσσες του ιστότοπου.']),
  process: P(
    ['Bu sayfa hizmetlerinizi ve talep-teklif sürecinizi anlatmanız içindir; teklif vermiyorsanız geçebilirsiniz.', 'This page is for describing your services and how you handle enquiries and quotes; skip it if you don’t send quotes.', 'Diese Seite ist für Ihre Leistungen und den Ablauf von Anfragen und Angeboten; überspringen Sie sie, wenn Sie keine Angebote erstellen.', 'Αυτή η σελίδα είναι για τις υπηρεσίες σας και τη διαδικασία αιτημάτων και προσφορών· παραλείψτε την αν δεν στέλνετε προσφορές.'],
    ['Bu cevaplarla sitedeki hizmet bölümleri, talep formu ve teklif akışı işinize göre kurulur.', 'With these answers, the service sections, request form and quote flow are built around your business.', 'Mit diesen Antworten werden Leistungsbereiche, Anfrageformular und Angebotsablauf auf Ihr Geschäft zugeschnitten.', 'Με αυτές τις απαντήσεις οι ενότητες υπηρεσιών, η φόρμα αιτήματος και η ροή προσφορών προσαρμόζονται στην επιχείρησή σας.']),
  crm: P(
    ['Bu sayfa yalnızca müşterilerinizi tek yerde tutan kendi sisteminizi istiyorsanız içindir. İstemiyorsanız bu sayfayı geçebilirsiniz.', 'This page is only for if you want your own system that keeps your customers in one place. If you don’t, you can skip this page.', 'Diese Seite ist nur für den Fall, dass Sie ein eigenes System möchten, das Ihre Kunden an einem Ort bündelt. Wenn nicht, können Sie sie überspringen.', 'Αυτή η σελίδα αφορά μόνο όσους θέλουν δικό τους σύστημα που κρατά τους πελάτες σε ένα σημείο. Αν δεν θέλετε, μπορείτε να την παραλείψετε.'],
    ['Bu cevaplarla müşteri sisteminin aşamaları, alanları ve giriş kuralları buna göre planlanır.', 'With these answers, the stages, fields and login rules of the customer system are planned accordingly.', 'Mit diesen Antworten werden Phasen, Felder und Login-Regeln des Kundensystems entsprechend geplant.', 'Με αυτές τις απαντήσεις σχεδιάζονται αντίστοιχα τα στάδια, τα πεδία και οι κανόνες σύνδεσης του συστήματος πελατών.']),
  app: P(
    ['Bu sayfa yalnızca size özel bir uygulama veya panel istiyorsanız içindir. İstemiyorsanız bu sayfayı geçebilirsiniz.', 'This page is only for if you want your own app or panel. If you don’t, you can skip this page.', 'Diese Seite ist nur für den Fall, dass Sie eine eigene App oder einen eigenen Login-Bereich möchten. Wenn nicht, können Sie sie überspringen.', 'Αυτή η σελίδα αφορά μόνο όσους θέλουν δική τους εφαρμογή ή πίνακα. Αν δεν θέλετε, μπορείτε να την παραλείψετε.'],
    ['Bu cevaplarla uygulamanın ekranları, kullanıcıları ve bağlantıları buna göre planlanır.', 'With these answers, the screens, users and connections of the app are planned accordingly.', 'Mit diesen Antworten werden Bildschirme, Nutzer und Verbindungen der App entsprechend geplant.', 'Με αυτές τις απαντήσεις σχεδιάζονται αντίστοιχα οι οθόνες, οι χρήστες και οι συνδέσεις της εφαρμογής.']),
  automation: P(
    ['Bu sayfa yalnızca elle yaptığınız işlerin kendiliğinden yürümesini istiyorsanız içindir. İstemiyorsanız bu sayfayı geçebilirsiniz.', 'This page is only for if you want tasks you do by hand to run by themselves. If you don’t, you can skip this page.', 'Diese Seite ist nur für den Fall, dass Aufgaben, die Sie von Hand erledigen, von selbst laufen sollen. Wenn nicht, können Sie sie überspringen.', 'Αυτή η σελίδα αφορά μόνο όσους θέλουν οι εργασίες που κάνουν με το χέρι να γίνονται μόνες τους. Αν δεν θέλετε, μπορείτε να την παραλείψετε.'],
    ['Bu cevaplarla hangi işin hangi durumda kendiliğinden başlayacağı planlanır.', 'With these answers, it is planned which task starts by itself and when.', 'Mit diesen Antworten wird geplant, welche Aufgabe wann von selbst startet.', 'Με αυτές τις απαντήσεις σχεδιάζεται ποια εργασία ξεκινά μόνη της και πότε.']),
  autodetail: P(
    ['Bu sayfa otomasyon istiyorsanız ayrıntıları netleştirmek içindir; bilmediğiniz soruyu geçebilirsiniz.', 'This page is for clarifying the details if you want automation; you can skip any question you don’t know.', 'Diese Seite klärt die Details, falls Sie Automatisierung möchten; Fragen, die Sie nicht kennen, können Sie überspringen.', 'Αυτή η σελίδα ξεκαθαρίζει τις λεπτομέρειες αν θέλετε αυτοματοποίηση· μπορείτε να παραλείψετε ό,τι δεν ξέρετε.'],
    ['Bu cevaplarla otomasyonun akışı, bağlanacak programlar ve onay kuralları belirlenir.', 'With these answers, the flow of the automation, the programs to connect and the approval rules are defined.', 'Mit diesen Antworten werden Ablauf der Automatisierung, anzubindende Programme und Freigaberegeln festgelegt.', 'Με αυτές τις απαντήσεις ορίζονται η ροή της αυτοματοποίησης, τα προγράμματα σύνδεσης και οι κανόνες έγκρισης.']),
  design: P(
    ['Bu sayfa sitenizin görünümü, içeriği ve Google’da ya da reklamla bulunması içindir; zevkinizi anlatmanız yeter, istemediğiniz ya da hazır olmayan kısmı geçebilirsiniz.', 'This page is about the look and content of your site and being found on Google or through ads; describing your taste is enough, and you can skip what you don’t want or isn’t ready.', 'Diese Seite betrifft Aussehen, Inhalte und Auffindbarkeit Ihrer Website bei Google oder über Werbung; es genügt, Ihren Geschmack zu beschreiben, und Unerwünschtes oder Unfertiges können Sie überspringen.', 'Αυτή η σελίδα αφορά την εμφάνιση, το περιεχόμενο και την ορατότητα του ιστότοπου στο Google ή μέσω διαφημίσεων· αρκεί να περιγράψετε το γούστο σας και μπορείτε να παραλείψετε ό,τι δεν θέλετε ή δεν είναι έτοιμο.'],
    ['Bu sayfadaki cevaplarla sitenizin renkleri, tarzı ve metin-fotoğraf düzeni buna göre seçilir.', 'With the answers on this page, the colours, style and text-and-photo layout of your site are chosen to match.', 'Mit den Antworten dieser Seite werden Farben, Stil und Text-Foto-Aufbau Ihrer Website passend gewählt.', 'Με τις απαντήσεις αυτής της σελίδας επιλέγονται ανάλογα τα χρώματα, το στυλ και η διάταξη κειμένων και φωτογραφιών.']),
  marketing: P(
    ['Bu sayfa yalnızca Google’da ya da reklamla bulunmak istiyorsanız içindir. İstemiyorsanız bu sayfayı geçebilirsiniz.', 'This page is only for if you want to be found on Google or through ads. If you don’t, you can skip this page.', 'Diese Seite ist nur für den Fall, dass Sie bei Google oder über Werbung gefunden werden möchten. Wenn nicht, können Sie sie überspringen.', 'Αυτή η σελίδα αφορά μόνο όσους θέλουν να βρίσκονται στο Google ή μέσω διαφημίσεων. Αν δεν θέλετε, μπορείτε να την παραλείψετε.'],
    ['Bu cevaplarla sitenin arama ve bölge ayarları ile reklam bağlantıları buna göre hazırlanır.', 'With these answers, the search and region settings of the site and the ad connections are prepared accordingly.', 'Mit diesen Antworten werden Such- und Regionseinstellungen der Website sowie Werbeanbindungen entsprechend vorbereitet.', 'Με αυτές τις απαντήσεις προετοιμάζονται αντίστοιχα οι ρυθμίσεις αναζήτησης και περιοχής του ιστότοπου και οι συνδέσεις διαφημίσεων.']),
  project: P(
    ['Bu sayfa teknik durumunuz, bütçeniz ve zamanlamanız içindir; bilmediğiniz yerde “Emin değilim” deyin ya da geçin.', 'This page is about your technical situation, budget and timing; where you don’t know, choose “Not sure” or skip.', 'Diese Seite betrifft Ihre technische Lage, Budget und Zeitplan; wo Sie es nicht wissen, wählen Sie „Weiß ich noch nicht“ oder überspringen Sie.', 'Αυτή η σελίδα αφορά την τεχνική σας κατάσταση, τον προϋπολογισμό και το χρονοδιάγραμμα· όπου δεν ξέρετε, επιλέξτε «Δεν είμαι σίγουρος/η» ή παραλείψτε.'],
    ['Bu cevaplarla teklifin kapsamı ve aşamaları bütçenize ve takviminize göre ayarlanır.', 'With these answers, the scope and phases of the offer are shaped around your budget and timing.', 'Mit diesen Antworten werden Umfang und Etappen des Angebots auf Budget und Zeitplan abgestimmt.', 'Με αυτές τις απαντήσεις το εύρος και τα στάδια της προσφοράς προσαρμόζονται στον προϋπολογισμό και το χρονοδιάγραμμά σας.']),
  additional: P(
    ['Bu sayfa eklemek istediğiniz her şey ve göndermek istediğiniz dosyalar içindir; boş bırakabilirsiniz.', 'This page is for anything you want to add and any files you want to send; you can leave it empty.', 'Diese Seite ist für alles, was Sie ergänzen möchten, und Dateien, die Sie senden wollen; Sie können sie leer lassen.', 'Αυτή η σελίδα είναι για ό,τι θέλετε να προσθέσετε και τα αρχεία που θέλετε να στείλετε· μπορείτε να την αφήσετε κενή.'],
    ['Bu cevaplar teklif hazırlanırken eksik kalan her şeyi tamamlar.', 'These answers fill in anything still missing when the offer is prepared.', 'Diese Antworten ergänzen alles, was bei der Erstellung des Angebots noch fehlt.', 'Αυτές οι απαντήσεις συμπληρώνουν ό,τι λείπει όταν ετοιμάζεται η προσφορά.']),
  booking: P(
    ['Bu sayfa seçtiğiniz online randevu sistemi içindir; randevuları şu an nasıl yürüttüğünüzü anlatmanız yeterli.', 'This page is for the online booking system you chose; it is enough to describe how you handle bookings today.', 'Diese Seite ist für das gewählte Online-Terminsystem; es genügt zu beschreiben, wie Sie Termine heute handhaben.', 'Αυτή η σελίδα είναι για το σύστημα online ραντεβού που επιλέξατε· αρκεί να περιγράψετε πώς χειρίζεστε σήμερα τα ραντεβού.'],
    ['Bu cevaplarla randevu sayfasındaki hizmetler, çalışma saatleri ve hatırlatmalar buna göre kurulur.', 'With these answers, the services, opening hours and reminders of the booking page are set up accordingly.', 'Mit diesen Antworten werden Leistungen, Öffnungszeiten und Erinnerungen der Buchungsseite entsprechend eingerichtet.', 'Με αυτές τις απαντήσεις στήνονται αντίστοιχα οι υπηρεσίες, το ωράριο και οι υπενθυμίσεις της σελίδας ραντεβού.']),
  qr: P(
    ['Bu sayfa seçtiğiniz QR menü veya dijital katalog içindir; ürünlerinizi ve dillerinizi anlatmanız yeterli.', 'This page is for the QR menu or digital catalogue you chose; it is enough to describe your items and languages.', 'Diese Seite ist für die gewählte QR-Speisekarte oder den digitalen Katalog; es genügt, Artikel und Sprachen zu beschreiben.', 'Αυτή η σελίδα είναι για το μενού QR ή τον ψηφιακό κατάλογο που επιλέξατε· αρκεί να περιγράψετε τα προϊόντα και τις γλώσσες σας.'],
    ['Bu cevaplarla menünün bölümleri, dilleri ve güncelleme düzeni buna göre kurulur.', 'With these answers, the sections, languages and update routine of the menu are set up accordingly.', 'Mit diesen Antworten werden Bereiche, Sprachen und Aktualisierungsablauf der Speisekarte entsprechend eingerichtet.', 'Με αυτές τις απαντήσεις στήνονται αντίστοιχα οι ενότητες, οι γλώσσες και ο τρόπος ενημέρωσης του μενού.']),
  invoices: P(
    ['Bu sayfa seçtiğiniz teklif ve fatura sistemi içindir; şu an nasıl hazırladığınızı anlatmanız yeterli.', 'This page is for the quote and invoice system you chose; it is enough to describe how you prepare them today.', 'Diese Seite ist für das gewählte Angebots- und Rechnungssystem; es genügt zu beschreiben, wie Sie diese heute erstellen.', 'Αυτή η σελίδα είναι για το σύστημα προσφορών και τιμολογίων που επιλέξατε· αρκεί να περιγράψετε πώς τα ετοιμάζετε σήμερα.'],
    ['Bu cevaplarla teklif ve fatura akışı, otomatik adımlar ve muhasebe bağlantısı buna göre planlanır.', 'With these answers, the quote and invoice flow, automatic steps and accounting link are planned accordingly.', 'Mit diesen Antworten werden Angebots- und Rechnungsablauf, automatische Schritte und Buchhaltungsanbindung entsprechend geplant.', 'Με αυτές τις απαντήσεις σχεδιάζονται αντίστοιχα η ροή προσφορών και τιμολογίων, τα αυτόματα βήματα και η σύνδεση με τη λογιστική.']),
  ai: P(
    ['Bu sayfa seçtiğiniz yapay zekâ asistanı içindir; müşterilerinizin en çok ne sorduğunu anlatmanız yeterli.', 'This page is for the AI assistant you chose; it is enough to describe what your customers ask most.', 'Diese Seite ist für den gewählten KI-Assistenten; es genügt zu beschreiben, was Ihre Kunden am häufigsten fragen.', 'Αυτή η σελίδα είναι για τον βοηθό ΤΝ που επιλέξατε· αρκεί να περιγράψετε τι ρωτούν συχνότερα οι πελάτες σας.'],
    ['Bu cevaplarla asistanın konuşacağı konular, dilleri ve taleplerin size ulaşma şekli buna göre planlanır.', 'With these answers, the topics and languages of the assistant and how enquiries reach you are planned accordingly.', 'Mit diesen Antworten werden Themen und Sprachen des Assistenten sowie der Weg der Anfragen zu Ihnen entsprechend geplant.', 'Με αυτές τις απαντήσεις σχεδιάζονται αντίστοιχα τα θέματα και οι γλώσσες του βοηθού και ο τρόπος που τα αιτήματα φτάνουν σε εσάς.']),
  final: P(
    ['Bu son sayfa herkes içindir: ne zaman başlamak istediğinizi ve eklemek istediklerinizi yazmanız için.', 'This last page is for everyone: it is for telling me when you would like to start and anything you want to add.', 'Diese letzte Seite ist für alle: Sie nennen den gewünschten Start und alles, was Sie ergänzen möchten.', 'Αυτή η τελευταία σελίδα είναι για όλους: για να πείτε πότε θέλετε να ξεκινήσετε και ό,τι θέλετε να προσθέσετε.'],
    ['Bu cevaplarla teklif sizin başlangıç isteğinize göre hazırlanır.', 'With these answers, the offer is prepared around your wish for when to start.', 'Mit diesen Antworten wird das Angebot auf Ihren Startwunsch abgestimmt.', 'Με αυτές τις απαντήσεις η προσφορά ετοιμάζεται με βάση την επιθυμία σας για την έναρξη.']),
};

// ── Style + example sites now live inside the form (visual flows only). Style choice is stored as answer `style_choice` (JSON). ──
export const STYLE_TITLE: L4 = l4(['Tarz ve renkler', 'Style and colours', 'Stil und Farben', 'Στυλ και χρώματα']);
export const EXAMPLES_TITLE: L4 = l4(['Beğendiğiniz siteler', 'Sites you like', 'Websites, die Ihnen gefallen', 'Ιστότοποι που σας αρέσουν']);
SECTION_META.style = P(
  ['Bu sayfa sitenizin ya da ürününüzün görünümü içindir; kartları ve renkleri seçmeniz yeter, istemiyorsanız geçebilirsiniz.', 'This page is about the look of your site or product; just pick cards and colours, or skip it if you prefer.', 'Diese Seite betrifft das Aussehen Ihrer Website oder Ihres Produkts; wählen Sie einfach Karten und Farben oder überspringen Sie sie.', 'Αυτή η σελίδα αφορά την εμφάνιση του ιστότοπου ή του προϊόντος σας· επιλέξτε απλώς κάρτες και χρώματα ή παραλείψτε την.'],
  ['Bu seçimlerle renkler, yazı tipi ve genel tarz buna göre belirlenir.', 'With these choices, the colours, font and overall style are set accordingly.', 'Mit diesen Auswahlen werden Farben, Schrift und Gesamtstil entsprechend festgelegt.', 'Με αυτές τις επιλογές ορίζονται αντίστοιχα τα χρώματα, η γραμματοσειρά και το γενικό στυλ.']);
SECTION_META.examples = P(
  ['Bu sayfa beğendiğiniz web sitelerinin adreslerini yazmanız içindir; en çok üç adres yeter, yoksa geçebilirsiniz.', 'This page is for the addresses of websites you like; up to three are enough, or skip it if you have none.', 'Diese Seite ist für die Adressen von Websites, die Ihnen gefallen; bis zu drei genügen, oder überspringen Sie sie.', 'Αυτή η σελίδα είναι για τις διευθύνσεις ιστότοπων που σας αρέσουν· αρκούν έως τρεις ή παραλείψτε την.'],
  ['Bu adreslerle zevkiniz anlaşılır; kopyalamak için değil, tasarımı sizin beğeninize yaklaştırmak için kullanılır.', 'These addresses show your taste; they are not for copying, only to bring the design closer to what you like.', 'Diese Adressen zeigen Ihren Geschmack; sie dienen nicht zum Kopieren, sondern um das Design Ihrem Geschmack anzunähern.', 'Αυτές οι διευθύνσεις δείχνουν το γούστο σας· δεν είναι για αντιγραφή, αλλά για να πλησιάσει ο σχεδιασμός αυτό που σας αρέσει.']);

const U = (a: string, b: string, c: string, d: string): QDef['t'] => l4([a, b, c, d]);
export const EXAMPLES_Q: QDef[] = [
  { id: 'example_url_1', type: 'text', format: 'url', t: U('Beğendiğiniz bir sitenin adresi (1)', 'Address of a site you like (1)', 'Adresse einer Website, die Ihnen gefällt (1)', 'Διεύθυνση ενός ιστότοπου που σας αρέσει (1)') },
  { id: 'example_url_2', type: 'text', format: 'url', t: U('Beğendiğiniz bir sitenin adresi (2, isteğe bağlı)', 'Address of a site you like (2, optional)', 'Adresse einer Website, die Ihnen gefällt (2, optional)', 'Διεύθυνση ενός ιστότοπου που σας αρέσει (2, προαιρετικά)') },
  { id: 'example_url_3', type: 'text', format: 'url', t: U('Beğendiğiniz bir sitenin adresi (3, isteğe bağlı)', 'Address of a site you like (3, optional)', 'Adresse einer Website, die Ihnen gefällt (3, optional)', 'Διεύθυνση ενός ιστότοπου που σας αρέσει (3, προαιρετικά)') },
  { id: 'example_likes', type: 'text', t: U('Bu sitelerde neyi beğeniyorsunuz?', 'What do you like about these sites?', 'Was gefällt Ihnen an diesen Websites?', 'Τι σας αρέσει σε αυτούς τους ιστότοπους;') },
];

// ── Clickable example answers for free-text questions (visitor's own possible answers; no promises, prices or durations) ──
const S = (...r: [string, string, string, string][]) => r.map((x) => l4(x));
export const SUGGESTIONS: Record<string, L4[]> = {
  example_likes: S(['Sade ve temiz görünüyor', 'It looks simple and clean', 'Es wirkt schlicht und sauber', 'Φαίνεται απλό και καθαρό'], ['Renkleri ve fotoğrafları', 'The colours and photos', 'Die Farben und Fotos', 'Τα χρώματα και οι φωτογραφίες'], ['Kolay gezilebiliyor', 'It is easy to navigate', 'Es ist leicht zu bedienen', 'Περιηγείται εύκολα']),
  success_definition: S(['Daha çok müşteri bana ulaşsın', 'More customers get in touch with me', 'Mehr Kunden melden sich bei mir', 'Να επικοινωνούν μαζί μου περισσότεροι πελάτες'], ['Elle yaptığım işler azalsın', 'I do less by hand', 'Ich muss weniger von Hand erledigen', 'Να κάνω λιγότερα με το χέρι'], ['İşletmem daha profesyonel görünsün', 'My business looks more professional', 'Mein Unternehmen wirkt professioneller', 'Η επιχείρησή μου να φαίνεται πιο επαγγελματική']),
  repetitive_tasks: S(['Gelen mesajlara tek tek cevap yazmak', 'Answering incoming messages one by one', 'Eingehende Nachrichten einzeln beantworten', 'Απάντηση σε μηνύματα ένα προς ένα'], ['Müşteri bilgilerini listeye geçirmek', 'Copying customer details into a list', 'Kundendaten in eine Liste übertragen', 'Αντιγραφή στοιχείων πελατών σε λίστα'], ['Teklif ve fatura hazırlamak', 'Preparing quotes and invoices', 'Angebote und Rechnungen erstellen', 'Προετοιμασία προσφορών και τιμολογίων']),
  growth_12m: S(['Yeni müşteri kazanmak', 'Winning new customers', 'Neue Kunden gewinnen', 'Απόκτηση νέων πελατών'], ['Hizmetlerimi genişletmek', 'Expanding my services', 'Meine Leistungen erweitern', 'Επέκταση των υπηρεσιών μου'], ['Şimdiki düzeni korumak, işi kolaylaştırmak', 'Keeping things as they are but easier', 'Es so lassen, aber einfacher machen', 'Να μείνουν όπως είναι αλλά πιο εύκολα']),
  new_customers_month: S(['Şimdikinden biraz daha fazla', 'A few more than now', 'Ein paar mehr als jetzt', 'Λίγοι περισσότεροι από τώρα'], ['Düzenli ve istikrarlı bir akış', 'A steady, regular flow', 'Ein stetiger, regelmäßiger Zufluss', 'Σταθερή, τακτική ροή'], ['Henüz bir rakamım yok', 'I have no figure yet', 'Ich habe noch keine Zahl', 'Δεν έχω ακόμα αριθμό']),
  services: S(['Müşterilere yerinde hizmet', 'On-site service for customers', 'Leistungen vor Ort beim Kunden', 'Υπηρεσίες στον χώρο του πελάτη'], ['Danışmanlık ve bilgilendirme', 'Consulting and advice', 'Beratung und Information', 'Συμβουλευτική και ενημέρωση'], ['Ürün satışı', 'Selling products', 'Verkauf von Produkten', 'Πώληση προϊόντων']),
  service_area: S(['Yaşadığım şehir ve çevresi', 'My home city and the surrounding area', 'Meine Stadt und die Umgebung', 'Η πόλη μου και τα περίχωρα'], ['Tüm ülke', 'The whole country', 'Das ganze Land', 'Ολόκληρη η χώρα'], ['Çevrimiçi, her yerden', 'Online, from anywhere', 'Online, von überall', 'Διαδικτυακά, από παντού']),
  founded: S(['Yeni kurdum', 'I have just started', 'Ich habe gerade erst gegründet', 'Μόλις ξεκίνησα'], ['Birkaç yıldır çalışıyorum', 'I have been running it for a few years', 'Ich führe es seit einigen Jahren', 'Λειτουργώ εδώ και μερικά χρόνια'], ['Uzun yıllardır var', 'It has existed for many years', 'Es besteht seit vielen Jahren', 'Υπάρχει εδώ και πολλά χρόνια']),
  employees: S(['Tek başıma çalışıyorum', 'I work alone', 'Ich arbeite allein', 'Εργάζομαι μόνος/η'], ['Küçük bir ekibiz', 'A small team', 'Ein kleines Team', 'Μια μικρή ομάδα'], ['Ekibim ve dış destek birlikte', 'My team plus outside help', 'Mein Team plus externe Hilfe', 'Η ομάδα μου και εξωτερική βοήθεια']),
  website_current: S(['Şu an web sitem yok', 'I have no website at the moment', 'Ich habe derzeit keine Website', 'Προς το παρόν δεν έχω ιστοσελίδα'], ['Eski bir sitem var, yenilemek istiyorum', 'I have an old site I want to renew', 'Ich habe eine alte Seite, die ich erneuern möchte', 'Έχω ένα παλιό site που θέλω να ανανεώσω'], ['Sadece sosyal medya hesabım var', 'I only have a social media account', 'Ich habe nur ein Social-Media-Konto', 'Έχω μόνο λογαριασμό στα social media']),
  website_satisfaction: S(['Eski ve mobilde kötü görünüyor', 'It looks old and poor on mobile', 'Sie wirkt veraltet und schlecht am Handy', 'Φαίνεται παλιό και χάλια στο κινητό'], ['Güncellemesi zor', 'It is hard to update', 'Sie ist schwer zu aktualisieren', 'Είναι δύσκολο να ενημερωθεί'], ['Memnunum, küçük değişiklikler yeter', 'I am happy, small changes are enough', 'Ich bin zufrieden, kleine Änderungen genügen', 'Είμαι ικανοποιημένος/η, αρκούν μικρές αλλαγές']),
  main_channel: S(['Telefon', 'Phone', 'Telefon', 'Τηλέφωνο'], ['WhatsApp', 'WhatsApp', 'WhatsApp', 'WhatsApp'], ['Tavsiye ve ağızdan ağıza', 'Recommendations and word of mouth', 'Empfehlungen und Mundpropaganda', 'Συστάσεις και από στόμα σε στόμα']),
  social_media: S(['Instagram', 'Instagram', 'Instagram', 'Instagram'], ['Facebook', 'Facebook', 'Facebook', 'Facebook'], ['Henüz kullanmıyorum', 'I do not use any yet', 'Ich nutze noch keine', 'Δεν χρησιμοποιώ ακόμα']),
  crm_current: S(['Excel tablosu kullanıyorum', 'I use an Excel sheet', 'Ich nutze eine Excel-Tabelle', 'Χρησιμοποιώ φύλλο Excel'], ['Defter ve telefon rehberi', 'A notebook and my phone contacts', 'Ein Notizbuch und mein Telefonbuch', 'Τετράδιο και επαφές τηλεφώνου'], ['Hiçbir sistemim yok', 'I have no system', 'Ich habe kein System', 'Δεν έχω κανένα σύστημα']),
  per_service_questions: S(['Evet, hizmete göre farklı sorular lazım', 'Yes, I need different questions per service', 'Ja, je Leistung brauche ich andere Fragen', 'Ναι, χρειάζομαι διαφορετικές ερωτήσεις ανά υπηρεσία'], ['Hayır, herkese aynı sorular yeter', 'No, the same questions for everyone are enough', 'Nein, für alle genügen die gleichen Fragen', 'Όχι, αρκούν οι ίδιες ερωτήσεις για όλους']),
  pricing_inputs: S(['Hizmet türü ve büyüklük', 'Type of service and size', 'Art der Leistung und Größe', 'Είδος υπηρεσίας και μέγεθος'], ['Konum ve tarih', 'Location and date', 'Ort und Termin', 'Τοποθεσία και ημερομηνία'], ['Her işe göre ayrıca bakıyorum', 'I look at each job separately', 'Ich schaue mir jeden Auftrag einzeln an', 'Εξετάζω κάθε δουλειά ξεχωριστά']),
  current_quote_process: S(['Telefonla arayıp bilgi alıyorum', 'I call and collect the details', 'Ich rufe an und erfrage die Details', 'Τηλεφωνώ και παίρνω τα στοιχεία'], ['Mesajla yazışıp teklif gönderiyorum', 'I message back and forth and send a quote', 'Ich schreibe hin und her und sende ein Angebot', 'Ανταλλάσσω μηνύματα και στέλνω προσφορά'], ['Yerinde görüp teklif veriyorum', 'I look on site and then quote', 'Ich sehe es vor Ort an und erstelle dann ein Angebot', 'Το βλέπω επιτόπου και δίνω προσφορά']),
  quote_time: S(['Kısa sürüyor ama sık oluyor', 'It is quick but happens often', 'Es geht schnell, kommt aber oft vor', 'Είναι γρήγορο αλλά συμβαίνει συχνά'], ['Çoğu zaman uzun sürüyor', 'It often takes a long time', 'Es dauert oft lange', 'Συχνά παίρνει πολύ χρόνο'], ['Her işe göre değişiyor', 'It depends on the job', 'Das hängt vom Auftrag ab', 'Εξαρτάται από τη δουλειά']),
  quotes_per_month: S(['Çok değil, birkaç tane', 'Not many, just a few', 'Nicht viele, nur einige', 'Όχι πολλά, μερικά'], ['Düzenli olarak sürekli geliyor', 'They come in regularly', 'Sie kommen regelmäßig', 'Έρχονται τακτικά'], ['Mevsime göre değişiyor', 'It varies with the season', 'Das schwankt je nach Saison', 'Αλλάζει ανάλογα με την εποχή']),
  follow_up_current: S(['Evet, ben arayıp soruyorum', 'Yes, I call to ask', 'Ja, ich rufe an und frage nach', 'Ναι, τηλεφωνώ και ρωτώ'], ['Çoğu zaman unutuyorum', 'I often forget', 'Ich vergesse es oft', 'Συχνά το ξεχνώ'], ['Hayır, müşteri dönmesini bekliyorum', 'No, I wait for the customer to come back', 'Nein, ich warte auf die Rückmeldung des Kunden', 'Όχι, περιμένω να επανέλθει ο πελάτης']),
  form_flow: S(['Bana hemen bildirim gelsin', 'I get notified straight away', 'Ich werde sofort benachrichtigt', 'Να λαμβάνω αμέσως ειδοποίηση'], ['Müşteriye otomatik onay mesajı gitsin', 'The customer gets an automatic confirmation', 'Der Kunde erhält automatisch eine Bestätigung', 'Ο πελάτης να παίρνει αυτόματη επιβεβαίωση'], ['Bilgiler listeme eklensin', 'The details are added to my list', 'Die Daten landen in meiner Liste', 'Τα στοιχεία να προστίθενται στη λίστα μου']),
  brand_colors: S(['Lacivert ve beyaz', 'Navy blue and white', 'Marineblau und Weiß', 'Navy και λευκό'], ['Sıcak, canlı tonlar', 'Warm, lively tones', 'Warme, lebendige Töne', 'Ζεστοί, ζωντανοί τόνοι'], ['Sade, açık renkler', 'Simple, light colours', 'Schlichte, helle Farben', 'Απλά, ανοιχτά χρώματα']),
  liked_websites: S(['Henüz aklımda bir site yok', 'No site in mind yet', 'Noch keine Website im Kopf', 'Δεν έχω κάποιο site στο μυαλό μου'], ['Sade ve hızlı açılan siteleri seviyorum', 'I like simple, fast sites', 'Mir gefallen schlichte, schnelle Seiten', 'Μου αρέσουν τα απλά, γρήγορα sites']),
  competitors: S(['Henüz bilmiyorum', 'I do not know yet', 'Das weiß ich noch nicht', 'Δεν ξέρω ακόμα'], ['Aynı şehirdeki benzer işletmeler', 'Similar businesses in my city', 'Ähnliche Unternehmen in meiner Stadt', 'Παρόμοιες επιχειρήσεις στην πόλη μου'], ['Büyük çevrimiçi platformlar', 'Large online platforms', 'Große Online-Plattformen', 'Μεγάλες διαδικτυακές πλατφόρμες']),
  usp: S(['Güvenilirlik ve dürüstlük', 'Reliability and honesty', 'Zuverlässigkeit und Ehrlichkeit', 'Αξιοπιστία και ειλικρίνεια'], ['Kişisel ve ilgili hizmet', 'Personal, attentive service', 'Persönlicher, aufmerksamer Service', 'Προσωπική, προσεκτική εξυπηρέτηση'], ['Deneyim ve kalite', 'Experience and quality', 'Erfahrung und Qualität', 'Εμπειρία και ποιότητα']),
  target_regions: S(['Kendi şehrim', 'My own city', 'Meine eigene Stadt', 'Η δική μου πόλη'], ['Şehrim ve çevresi', 'My city and the surrounding area', 'Meine Stadt und Umgebung', 'Η πόλη μου και τα περίχωρα'], ['Birden fazla şehir', 'Several cities', 'Mehrere Städte', 'Πολλές πόλεις']),
  ad_budget: S(['Şimdilik reklam düşünmüyorum', 'I am not planning ads for now', 'Ich plane vorerst keine Werbung', 'Προς το παρόν δεν σκέφτομαι διαφήμιση'], ['Henüz karar vermedim', 'I have not decided yet', 'Ich habe mich noch nicht entschieden', 'Δεν έχω αποφασίσει ακόμα']),
  tech_hosting: S(['Bilmiyorum', 'I do not know', 'Weiß ich nicht', 'Δεν ξέρω'], ['Eski web ajansım yönetiyor', 'My former web agency manages it', 'Meine frühere Agentur verwaltet sie', 'Τη διαχειρίζεται η προηγούμενη εταιρεία μου'], ['Bir hosting firmasında, ben yönetiyorum', 'With a hosting company, I manage it', 'Bei einem Hoster, ich verwalte sie selbst', 'Σε εταιρεία hosting, τη διαχειρίζομαι εγώ']),
  tech_tools: S(['Google Takvim ve Gmail', 'Google Calendar and Gmail', 'Google Kalender und Gmail', 'Google Calendar και Gmail'], ['Excel ve WhatsApp', 'Excel and WhatsApp', 'Excel und WhatsApp', 'Excel και WhatsApp'], ['Bir muhasebe programı', 'An accounting program', 'Ein Buchhaltungsprogramm', 'Ένα λογιστικό πρόγραμμα']),
  tech_access: S(['Kendim yönetiyorum, bilgiler bende', 'I manage it myself and have the details', 'Ich verwalte es selbst und habe die Daten', 'Το διαχειρίζομαι εγώ και έχω τα στοιχεία'], ['Başkası yönetiyor, onunla konuşmam gerek', 'Someone else manages it, I need to ask them', 'Jemand anderes verwaltet es, ich muss nachfragen', 'Το διαχειρίζεται κάποιος άλλος, πρέπει να τον ρωτήσω'], ['Henüz bir şey yok', 'There is nothing yet', 'Es gibt noch nichts', 'Δεν υπάρχει ακόμα τίποτα']),
  budget_onetime: S(['Henüz bilmiyorum, teklife göre karar veririm', 'I do not know yet, I will decide based on the offer', 'Das weiß ich noch nicht, ich entscheide nach dem Angebot', 'Δεν ξέρω ακόμα, θα αποφασίσω με βάση την προσφορά'], ['Önce küçük başlamak istiyorum', 'I would like to start small', 'Ich möchte klein anfangen', 'Θέλω να ξεκινήσω μικρά']),
  budget_monthly: S(['Henüz bilmiyorum', 'I do not know yet', 'Das weiß ich noch nicht', 'Δεν ξέρω ακόμα'], ['Mümkün olduğunca düşük olsun', 'As low as possible', 'So niedrig wie möglich', 'Όσο το δυνατόν χαμηλότερο'], ['Gerekirse destek almak isterim', 'I would like support if needed', 'Ich möchte bei Bedarf Unterstützung', 'Θα ήθελα υποστήριξη αν χρειαστεί']),
  go_live: S(['Belirli bir tarihim yok', 'I have no fixed date', 'Ich habe keinen festen Termin', 'Δεν έχω συγκεκριμένη ημερομηνία'], ['Bir etkinlik ya da sezon öncesi', 'Before an event or season', 'Vor einer Veranstaltung oder Saison', 'Πριν από μια εκδήλωση ή εποχή'], ['Acelem yok, doğru olsun yeter', 'No rush, I just want it done right', 'Keine Eile, Hauptsache richtig', 'Δεν βιάζομαι, να γίνει σωστά']),
  decision_maker: S(['Ben tek başıma karar veririm', 'I decide alone', 'Ich entscheide allein', 'Αποφασίζω μόνος/η'], ['Ortağımla birlikte', 'Together with my partner', 'Gemeinsam mit meinem Partner', 'Μαζί με τον συνεργάτη μου'], ['Ekibimle birlikte', 'Together with my team', 'Gemeinsam mit meinem Team', 'Μαζί με την ομάδα μου']),
  best_time: S(['Sabahları', 'In the mornings', 'Vormittags', 'Τα πρωινά'], ['Öğleden sonra', 'In the afternoons', 'Nachmittags', 'Τα απογεύματα'], ['Hafta içi akşamları', 'Weekday evenings', 'Werktags abends', 'Τα καθημερινά βράδια']),
  additional_notes: S(['Şimdilik eklemek istediğim bir şey yok', 'Nothing to add for now', 'Im Moment nichts hinzuzufügen', 'Προς το παρόν δεν έχω κάτι να προσθέσω'], ['Önce size sormak istediğim sorular var', 'I have some questions I would like to ask first', 'Ich habe vorab einige Fragen', 'Έχω κάποιες ερωτήσεις να κάνω πρώτα']),
  attachments: S(['Logo', 'Logo', 'Logo', 'Λογότυπο'], ['Fotoğraflar', 'Photos', 'Fotos', 'Φωτογραφίες'], ['Fiyat listesi veya menü', 'Price list or menu', 'Preisliste oder Speisekarte', 'Τιμοκατάλογος ή μενού']),
  heard_about: S(['Google araması', 'A Google search', 'Eine Google-Suche', 'Αναζήτηση στο Google'], ['Tavsiye üzerine', 'A recommendation', 'Eine Empfehlung', 'Σύσταση'], ['Sosyal medya', 'Social media', 'Social Media', 'Social media']),
  auto_repeat: S(['Gelen taleplere aynı cevabı yazmak', 'Writing the same reply to incoming requests', 'Auf Anfragen immer dieselbe Antwort schreiben', 'Η ίδια απάντηση σε κάθε αίτημα'], ['Bilgileri bir yerden başka yere kopyalamak', 'Copying details from one place to another', 'Daten von einem Ort an einen anderen kopieren', 'Αντιγραφή στοιχείων από το ένα μέρος στο άλλο'], ['Randevu ve hatırlatma mesajları', 'Appointment and reminder messages', 'Termin- und Erinnerungsnachrichten', 'Μηνύματα ραντεβού και υπενθυμίσεων']),
  auto_tools: S(['Gmail ve Google Takvim', 'Gmail and Google Calendar', 'Gmail und Google Kalender', 'Gmail και Google Calendar'], ['Excel veya Google Sheets', 'Excel or Google Sheets', 'Excel oder Google Sheets', 'Excel ή Google Sheets'], ['WhatsApp ve bir muhasebe programı', 'WhatsApp and an accounting program', 'WhatsApp und ein Buchhaltungsprogramm', 'WhatsApp και ένα λογιστικό πρόγραμμα']),
  auto_trigger: S(['Web sitemden form geldiğinde', 'When a form arrives from my website', 'Wenn ein Formular von meiner Website eingeht', 'Όταν έρχεται φόρμα από τον ιστότοπό μου'], ['Yeni bir e-posta geldiğinde', 'When a new e-mail arrives', 'Wenn eine neue E-Mail eingeht', 'Όταν έρχεται νέο e-mail'], ['Her sabah belli bir saatte', 'Every morning at a set time', 'Jeden Morgen zu einer festen Zeit', 'Κάθε πρωί σε συγκεκριμένη ώρα']),
  auto_success: S(['Daha az zaman harcamak', 'Spending less time', 'Weniger Zeit aufwenden', 'Λιγότερος χρόνος'], ['Daha az hata', 'Fewer mistakes', 'Weniger Fehler', 'Λιγότερα λάθη'], ['Müşterilere daha hızlı dönmek', 'Replying to customers faster', 'Kunden schneller antworten', 'Ταχύτερη απάντηση στους πελάτες']),
  fin_note: S(['Şimdilik eklemek istediğim bir şey yok', 'Nothing to add for now', 'Im Moment nichts hinzuzufügen', 'Προς το παρόν δεν έχω κάτι να προσθέσω'], ['Sorularım var, geri dönüşünüzü bekliyorum', 'I have questions and look forward to your reply', 'Ich habe Fragen und erwarte Ihre Antwort', 'Έχω ερωτήσεις και περιμένω την απάντησή σας']),
  crm_stages: S(['Yeni talep → teklif → onay → tamamlandı', 'New enquiry → quote → accepted → done', 'Neue Anfrage → Angebot → Zusage → erledigt', 'Νέο αίτημα → προσφορά → αποδοχή → ολοκληρώθηκε'], ['İlk görüşme → ziyaret → sipariş → teslim', 'First contact → visit → order → delivery', 'Erstkontakt → Besuch → Auftrag → Lieferung', 'Πρώτη επαφή → επίσκεψη → παραγγελία → παράδοση']),
  crm_roles: S(['Herkes her şeyi görebilsin', 'Everyone can see everything', 'Alle dürfen alles sehen', 'Όλοι να βλέπουν τα πάντα'], ['Ekip yalnızca kendi işlerini görsün', 'The team sees only their own jobs', 'Das Team sieht nur die eigenen Aufträge', 'Η ομάδα να βλέπει μόνο τις δικές της δουλειές'], ['Yalnızca ben değiştirebileyim', 'Only I can change things', 'Nur ich darf etwas ändern', 'Μόνο εγώ να αλλάζω πράγματα']),
  crm_connect: S(['E-posta ve takvim', 'E-mail and calendar', 'E-Mail und Kalender', 'E-mail και ημερολόγιο'], ['WhatsApp', 'WhatsApp', 'WhatsApp', 'WhatsApp'], ['Web sitemdeki form', 'The form on my website', 'Das Formular auf meiner Website', 'Η φόρμα στον ιστότοπό μου']),
  crm_name: S(['Henüz düşünmedim', 'I have not thought about it yet', 'Darüber habe ich noch nicht nachgedacht', 'Δεν το έχω σκεφτεί ακόμα'], ['İşletmemin adı ve renkleriyle olsun', 'With my business name and colours', 'Mit dem Namen und den Farben meines Unternehmens', 'Με το όνομα και τα χρώματα της επιχείρησής μου']),
  app_purpose: S(['İşlerimi ve müşterilerimi takip etmek', 'Keeping track of my jobs and customers', 'Meine Aufträge und Kunden im Blick behalten', 'Παρακολούθηση δουλειών και πελατών'], ['Ekibimin görevlerini planlamak', 'Planning my team’s tasks', 'Die Aufgaben meines Teams planen', 'Προγραμματισμός εργασιών της ομάδας μου'], ['Müşterilerimin giriş yapıp bilgi görmesi', 'Letting my customers log in and see their information', 'Meine Kunden sich anmelden und ihre Daten sehen lassen', 'Να συνδέονται οι πελάτες μου και να βλέπουν τα στοιχεία τους']),
  app_panels: S(['Bugünün işleri', 'Today’s tasks', 'Die Aufgaben von heute', 'Οι δουλειές της ημέρας'], ['Açık talepler', 'Open enquiries', 'Offene Anfragen', 'Ανοιχτά αιτήματα'], ['Aylık özet rakamlar', 'Monthly summary figures', 'Monatliche Kennzahlen', 'Μηνιαίοι συνοπτικοί δείκτες']),
  app_connect: S(['E-posta ve takvim', 'E-mail and calendar', 'E-Mail und Kalender', 'E-mail και ημερολόγιο'], ['Muhasebe programı', 'Accounting software', 'Buchhaltungssoftware', 'Λογιστικό πρόγραμμα'], ['Web sitemdeki formlar', 'The forms on my website', 'Die Formulare auf meiner Website', 'Οι φόρμες του ιστότοπού μου']),
  app_name: S(['Henüz düşünmedim', 'I have not thought about it yet', 'Darüber habe ich noch nicht nachgedacht', 'Δεν το έχω σκεφτεί ακόμα'], ['Sade ve kolay anlaşılır olsun', 'Simple and easy to understand', 'Schlicht und leicht verständlich', 'Απλό και εύκολο στην κατανόηση'], ['İşletmemin adı ve renkleri', 'My business name and colours', 'Name und Farben meines Unternehmens', 'Το όνομα και τα χρώματα της επιχείρησής μου']),
  bk_services: S(['Danışma görüşmesi', 'Consultation', 'Beratungsgespräch', 'Συνεδρία συμβουλευτικής'], ['Standart bakım / hizmet', 'Standard treatment / service', 'Standardbehandlung / -leistung', 'Τυπική θεραπεία / υπηρεσία'], ['Uzun ve kısa seçenekler', 'Longer and shorter options', 'Längere und kürzere Optionen', 'Μεγαλύτερες και μικρότερες επιλογές']),
  bk_hours: S(['Hafta içi gündüz saatleri', 'Weekdays during the day', 'Werktags tagsüber', 'Καθημερινές, ώρες ημέρας'], ['Hafta sonu da açığım', 'I am open at weekends too', 'Ich habe auch am Wochenende geöffnet', 'Είμαι ανοιχτός/ή και τα Σαββατοκύριακα'], ['Randevuya göre değişiyor', 'It varies by appointment', 'Das variiert je nach Termin', 'Αλλάζει ανάλογα με το ραντεβού']),
  service_list: S(['Müşterilere yerinde hizmet', 'On-site service for customers', 'Leistungen vor Ort beim Kunden', 'Υπηρεσίες στον χώρο του πελάτη'], ['Danışmanlık', 'Consulting', 'Beratung', 'Συμβουλευτική'], ['Ürün satışı', 'Selling products', 'Verkauf von Produkten', 'Πώληση προϊόντων']),
  inv_tools: S(['Henüz bir programım yok', 'I have no program yet', 'Ich habe noch kein Programm', 'Δεν έχω ακόμα πρόγραμμα'], ['Muhasebecim kendi programıyla yapıyor', 'My accountant uses their own program', 'Mein Steuerberater nutzt sein eigenes Programm', 'Ο λογιστής μου χρησιμοποιεί δικό του πρόγραμμα'], ['Excel ile yürütüyorum', 'I handle it in Excel', 'Ich mache es in Excel', 'Τα κάνω σε Excel']),
  ai_topics: S(['Hizmetler ve çalışma saatleri', 'Services and opening hours', 'Leistungen und Öffnungszeiten', 'Υπηρεσίες και ωράριο'], ['Randevu ve fiyat bilgisi isteyenler', 'People asking about appointments and prices', 'Anfragen zu Terminen und Preisen', 'Ερωτήσεις για ραντεβού και τιμές'], ['Adres ve ulaşım', 'Address and directions', 'Adresse und Anfahrt', 'Διεύθυνση και πρόσβαση']),
};
