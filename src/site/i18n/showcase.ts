import type { Lang } from '../../translations';

// Question shown BEFORE the contract is prepared (owner, 2026-11-17): may the finished project be shown as a reference?
// Honest both ways: the upside first and generously, the downside short and clear. Voluntary, price is the same either way.
export const SHOWCASE_UI: Record<Lang, {
  title: string; intro: string; prosTitle: string; pros: string[]; consTitle: string; cons: string[];
  yes: string; no: string; note: string; chosenYes: string; chosenNo: string; change: string; err: string;
}> = {
  tr: {
    title: 'Projenizi referans olarak gösterebilir miyim?',
    intro: 'Sözleşme hazırlanmadan önce kısa bir seçim. Karar tamamen sizin: fiyat ve hizmet iki durumda da aynı.',
    prosTitle: 'Gösterilmesine izin verirseniz',
    pros: [
      'Siteniz Chioutworks referanslarında işletmenizin adı ve sitenize bağlantıyla yer alır. Merak eden ziyaretçiler doğrudan sitenize gelir: ek görünürlük, yeni müşteri ve iş fırsatı.',
      'Sitenize bir bağlantı daha kazanırsınız; arama motorlarında görünürlüğe küçük ama gerçek bir katkıdır.',
      'Projeniz tanıtımlarda (sosyal medya, sunumlar) iyi bir örnek olarak, her seferinde işletmenizin adıyla anılır.',
      'İstediğiniz zaman geri alabilirsiniz; proje sayfanızdan tek bir mesaj yeterli.',
    ],
    consTitle: 'Bilmeniz gerekenler',
    cons: [
      'İşletmenizin adı, logonuz ve sitenizin ekran görüntüleri herkese açık olur; rakipleriniz de görebilir.',
      'Siteniz daha çok görüneceği için başka firmalardan teklif veya reklam e-postaları gelebilir (genelde sitenizdeki iletişim adresine).',
      'E-posta adresiniz, telefonunuz, fiyatlar ve müşteri verileriniz asla gösterilmez; Chioutworks bilgilerinizi kimseye vermez ve bu izin yüzünden size reklam göndermez.',
    ],
    yes: 'Evet, gösterebilirsiniz', no: 'Hayır, gösterilmesin',
    note: 'Seçiminiz sözleşmeye işlenir. İmzadan önce buradan değiştirebilir, sonra da istediğiniz zaman yazılı olarak geri alabilirsiniz.',
    chosenYes: 'Seçiminiz: projeniz referans olarak gösterilebilir. Sözleşmede bununla ilgili bir madde var.',
    chosenNo: 'Seçiminiz: projeniz referans olarak gösterilmeyecek.',
    change: 'Seçimi değiştir', err: 'Seçim kaydedilemedi. Lütfen tekrar deneyin.',
  },
  en: {
    title: 'May I show your project as a reference?',
    intro: 'One short choice before the contract is prepared. It is entirely up to you: the price and the service are the same either way.',
    prosTitle: 'If you allow it',
    pros: [
      'Your website appears among the Chioutworks references with your business name and a link to your site. Curious visitors come straight to you: extra visibility and new customers and business.',
      'You gain one more link to your website, a small but real help for how visible you are in search engines.',
      'Your project can be shown in promotion (social media, presentations) as a good example, always with your business name.',
      'You can withdraw it at any time; one message on your project page is enough.',
    ],
    consTitle: 'Good to know',
    cons: [
      'Your business name, logo and screenshots of your website become public; competitors can see them too.',
      'Because your site is seen more, other companies may send you offers or advertising e-mails (usually to the contact address on your website).',
      'Your e-mail address, phone number, prices and customer data are never shown; Chioutworks does not pass your details to anyone and does not send you advertising because of this permission.',
    ],
    yes: 'Yes, you may show it', no: 'No, please don’t',
    note: 'Your choice is written into the contract. You can change it here before signing, and withdraw it in writing at any time later.',
    chosenYes: 'Your choice: your project may be shown as a reference. The contract contains a clause about it.',
    chosenNo: 'Your choice: your project will not be shown as a reference.',
    change: 'Change choice', err: 'Your choice could not be saved. Please try again.',
  },
  de: {
    title: 'Darf ich Ihr Projekt als Referenz zeigen?',
    intro: 'Eine kurze Entscheidung, bevor der Vertrag erstellt wird. Sie liegt ganz bei Ihnen: Preis und Leistung sind in beiden Fällen gleich.',
    prosTitle: 'Wenn Sie zustimmen',
    pros: [
      'Ihre Website erscheint in den Chioutworks-Referenzen mit Ihrem Firmennamen und einem Link zu Ihrer Seite. Neugierige Besucher kommen direkt zu Ihnen: zusätzliche Sichtbarkeit, neue Kunden und Aufträge.',
      'Sie erhalten einen weiteren Link auf Ihre Website, ein kleiner, aber echter Beitrag zu Ihrer Sichtbarkeit in Suchmaschinen.',
      'Ihr Projekt kann in Werbung (soziale Medien, Präsentationen) als gutes Beispiel gezeigt werden, stets mit Ihrem Firmennamen.',
      'Sie können die Zustimmung jederzeit widerrufen; eine Nachricht auf Ihrer Projektseite genügt.',
    ],
    consTitle: 'Gut zu wissen',
    cons: [
      'Firmenname, Logo und Bildschirmfotos Ihrer Website werden öffentlich sichtbar, auch für Mitbewerber.',
      'Da Ihre Seite häufiger gesehen wird, können andere Firmen Ihnen Angebote oder Werbe-E-Mails schicken (meist an die Kontaktadresse auf Ihrer Website).',
      'Ihre E-Mail-Adresse, Telefonnummer, Preise und Kundendaten werden nie gezeigt; Chioutworks gibt Ihre Daten an niemanden weiter und schickt Ihnen wegen dieser Zustimmung keine Werbung.',
    ],
    yes: 'Ja, Sie dürfen es zeigen', no: 'Nein, bitte nicht',
    note: 'Ihre Entscheidung wird in den Vertrag übernommen. Vor der Unterschrift können Sie sie hier ändern, danach jederzeit in Textform widerrufen.',
    chosenYes: 'Ihre Entscheidung: Ihr Projekt darf als Referenz gezeigt werden. Der Vertrag enthält dazu eine Klausel.',
    chosenNo: 'Ihre Entscheidung: Ihr Projekt wird nicht als Referenz gezeigt.',
    change: 'Entscheidung ändern', err: 'Die Entscheidung konnte nicht gespeichert werden. Bitte erneut versuchen.',
  },
  el: {
    title: 'Μπορώ να παρουσιάσω το έργο σας ως αναφορά;',
    intro: 'Μια σύντομη επιλογή πριν ετοιμαστεί η σύμβαση. Η απόφαση είναι εντελώς δική σας: η τιμή και η υπηρεσία είναι ίδιες σε κάθε περίπτωση.',
    prosTitle: 'Αν το επιτρέψετε',
    pros: [
      'Η ιστοσελίδα σας εμφανίζεται στις αναφορές της Chioutworks με την επωνυμία σας και σύνδεσμο προς τη σελίδα σας. Οι περίεργοι επισκέπτες έρχονται κατευθείαν σε εσάς: περισσότερη προβολή, νέοι πελάτες και δουλειές.',
      'Κερδίζετε έναν ακόμη σύνδεσμο προς την ιστοσελίδα σας, μια μικρή αλλά πραγματική βοήθεια για την ορατότητά σας στις μηχανές αναζήτησης.',
      'Το έργο σας μπορεί να προβάλλεται (μέσα κοινωνικής δικτύωσης, παρουσιάσεις) ως καλό παράδειγμα, πάντα με την επωνυμία σας.',
      'Μπορείτε να το ανακαλέσετε όποτε θέλετε· αρκεί ένα μήνυμα στη σελίδα του έργου σας.',
    ],
    consTitle: 'Καλό να γνωρίζετε',
    cons: [
      'Η επωνυμία, το λογότυπο και στιγμιότυπα της ιστοσελίδας σας γίνονται δημόσια· τα βλέπουν και οι ανταγωνιστές.',
      'Επειδή η σελίδα σας θα φαίνεται περισσότερο, άλλες εταιρείες μπορεί να σας στέλνουν προσφορές ή διαφημιστικά e-mail (συνήθως στη διεύθυνση επικοινωνίας της ιστοσελίδας σας).',
      'Το e-mail, το τηλέφωνο, οι τιμές και τα δεδομένα των πελατών σας δεν εμφανίζονται ποτέ· η Chioutworks δεν δίνει τα στοιχεία σας σε κανέναν και δεν σας στέλνει διαφημίσεις λόγω αυτής της άδειας.',
    ],
    yes: 'Ναι, μπορείτε', no: 'Όχι, προτιμώ να μην εμφανίζεται',
    note: 'Η επιλογή σας περνά στη σύμβαση. Πριν την υπογραφή μπορείτε να την αλλάξετε εδώ και αργότερα να την ανακαλέσετε γραπτώς όποτε θέλετε.',
    chosenYes: 'Η επιλογή σας: το έργο σας μπορεί να παρουσιάζεται ως αναφορά. Η σύμβαση περιέχει σχετικό όρο.',
    chosenNo: 'Η επιλογή σας: το έργο σας δεν θα παρουσιάζεται ως αναφορά.',
    change: 'Αλλαγή επιλογής', err: 'Η επιλογή δεν αποθηκεύτηκε. Δοκιμάστε ξανά.',
  },
};
