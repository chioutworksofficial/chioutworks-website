// Branded site-analysis PDF (pdf-lib + bundled Noto Sans, OFL: Latin, Latin-ext, Greek). Built from a saved deep scan (server/siteScan.ts).
// Texts: fixed tr/en/de/el table keyed by opportunity id (no machine translation, no invented facts). No prices, no guarantees.
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'node:fs';
import type { Scan, Opp } from './siteScan.js';

export type RL = 'tr' | 'en' | 'de' | 'el';
export const RLANGS: RL[] = ['tr', 'en', 'de', 'el'];
export const rlOf = (v: unknown, d: RL = 'en'): RL => (RLANGS.includes(v as RL) ? (v as RL) : d);
/** Lead language from the scan facts (site language), falling back to the country, else English. */
export function leadLang(scan?: Pick<Scan, 'facts'>, country = ''): RL {
  const l = (scan?.facts.lang ?? '').slice(0, 2).toLowerCase();
  if (RLANGS.includes(l as RL)) return l as RL;
  if (/alman|germany|deutsch|österreich|avusturya|isviçre/i.test(country)) return 'de';
  if (/türk|turk/i.test(country)) return 'tr';
  if (/yunan|greece|ελλ/i.test(country)) return 'el';
  return 'en';
}

type Q = [string, string, string, string];
const OPP: Record<string, { p: Q; c: Q; f: Q }> = {
  booking: {
    p: ['Online randevu ve rezervasyon yok.', 'No online booking or reservation.', 'Keine Online-Terminbuchung oder Reservierung.', 'Δεν υπάρχει online κράτηση ραντεβού.'],
    c: ['Ziyaretçi telefon açmak zorunda kalır; mesai dışında gelen talepler kaybolur.', 'Visitors have to phone you; enquiries outside opening hours are lost.', 'Besucher müssen anrufen; Anfragen außerhalb der Öffnungszeiten gehen verloren.', 'Ο επισκέπτης πρέπει να τηλεφωνήσει· τα αιτήματα εκτός ωραρίου χάνονται.'],
    f: ['Randevuyu site üzerinden alıp takvime ve hatırlatma mesajına bağlayın.', 'Take bookings on the site and connect them to a calendar and automatic reminders.', 'Termine direkt auf der Website annehmen und mit Kalender und automatischer Erinnerung verbinden.', 'Δέχεστε ραντεβού μέσα από τον ιστότοπο και τα συνδέετε με ημερολόγιο και αυτόματη υπενθύμιση.'],
  },
  chat: {
    p: ['Ziyaretçi sorularını yanıtlayan bir asistan yok.', 'No assistant answers visitor questions.', 'Kein Assistent, der Fragen von Besuchern beantwortet.', 'Δεν υπάρχει βοηθός που να απαντά στις ερωτήσεις των επισκεπτών.'],
    c: ['Gece ve hafta sonu gelen sorular yanıtsız kalır; ziyaretçi başka bir firmaya yönelir.', 'Questions that arrive at night or on weekends stay unanswered and the visitor turns to another business.', 'Fragen nachts und am Wochenende bleiben unbeantwortet, der Besucher wendet sich an einen anderen Anbieter.', 'Οι ερωτήσεις τη νύχτα και το Σαββατοκύριακο μένουν αναπάντητες και ο επισκέπτης στρέφεται αλλού.'],
    f: ['Soruları gün boyu yanıtlayıp talebi forma çeviren yazılı veya sesli bir asistan ekleyin.', 'Add a written or voice assistant that answers around the clock and turns the question into a request.', 'Einen schriftlichen oder sprachbasierten Assistenten ergänzen, der rund um die Uhr antwortet und die Frage in eine Anfrage verwandelt.', 'Προσθέστε έναν γραπτό ή φωνητικό βοηθό που απαντά όλο το 24ωρο και μετατρέπει την ερώτηση σε αίτημα.'],
  },
  contact: {
    p: ['İletişim yolu ve talep formu net değil.', 'The way to contact you is unclear.', 'Kontaktweg und Anfrageformular sind nicht klar erkennbar.', 'Ο τρόπος επικοινωνίας δεν είναι σαφής.'],
    c: ['Ulaşmak zor olunca ilgilenen ziyaretçi vazgeçer; talep hiç size gelmez.', 'When reaching you is hard, interested visitors give up and the enquiry never arrives.', 'Wenn der Kontakt schwerfällt, geben interessierte Besucher auf und die Anfrage kommt nie an.', 'Όταν η επικοινωνία είναι δύσκολη, ο ενδιαφερόμενος εγκαταλείπει και το αίτημα δεν φτάνει ποτέ.'],
    f: ['Görünür telefon, e-posta veya WhatsApp ve kısa bir talep formu ekleyin.', 'Show a visible phone number, e-mail or WhatsApp and add a short enquiry form.', 'Sichtbare Telefonnummer, E-Mail oder WhatsApp und ein kurzes Anfrageformular ergänzen.', 'Προσθέστε ορατό τηλέφωνο, e-mail ή WhatsApp και μια σύντομη φόρμα αιτήματος.'],
  },
  form: {
    p: ['Talep formu fazla uzun.', 'The enquiry form is too long.', 'Das Anfrageformular ist zu lang.', 'Η φόρμα αιτήματος είναι υπερβολικά μεγάλη.'],
    c: ['Uzun formlar yarıda bırakılır; her ek alan talep sayısını düşürür.', 'Long forms are abandoned half way; every extra field lowers the number of enquiries.', 'Lange Formulare werden abgebrochen; jedes zusätzliche Feld senkt die Zahl der Anfragen.', 'Οι μεγάλες φόρμες εγκαταλείπονται στη μέση· κάθε επιπλέον πεδίο μειώνει τα αιτήματα.'],
    f: ['Formu en gerekli 3-5 alana indirin.', 'Cut the form down to the 3 to 5 fields that matter.', 'Das Formular auf die 3 bis 5 wichtigsten Felder kürzen.', 'Περιορίστε τη φόρμα στα 3 έως 5 πιο απαραίτητα πεδία.'],
  },
  speed: {
    p: ['Site yavaş veya teknik olarak ağır.', 'The site is slow or technically heavy.', 'Die Website ist langsam oder technisch schwer.', 'Ο ιστότοπος είναι αργός ή τεχνικά βαρύς.'],
    c: ['Yavaş açılan sayfayı ziyaretçilerin bir kısmı beklemeden kapatır; arama motorları da daha düşük sıralayabilir.', 'Some visitors close a slowly loading page before it appears, and search engines may rank it lower.', 'Ein Teil der Besucher schließt eine langsam ladende Seite, bevor sie erscheint; Suchmaschinen können sie niedriger einstufen.', 'Μέρος των επισκεπτών κλείνει μια σελίδα που φορτώνει αργά και οι μηχανές αναζήτησης μπορεί να την κατατάξουν χαμηλότερα.'],
    f: ['Görselleri ve betikleri hafifletin; gerekirse siteyi yenileyin.', 'Lighten images and scripts; rebuild the site if needed.', 'Bilder und Skripte verschlanken; wenn nötig die Website erneuern.', 'Ελαφρύνετε εικόνες και scripts· αν χρειαστεί, ανανεώστε τον ιστότοπο.'],
  },
  seo: {
    p: ['Arama motoru temelleri eksik (başlık, açıklama, ana başlık, sitemap).', 'Search engine basics are missing (title, description, main heading, sitemap).', 'Suchmaschinen-Grundlagen fehlen (Titel, Beschreibung, Hauptüberschrift, Sitemap).', 'Λείπουν τα βασικά για τις μηχανές αναζήτησης (τίτλος, περιγραφή, κύριος τίτλος, sitemap).'],
    c: ['Sizi arayan yeni müşteriler Google’da sizi bulamayabilir veya zayıf bir özet görür.', 'New customers searching for you may not find you on Google, or see a weak summary.', 'Neue Kunden, die nach Ihnen suchen, finden Sie bei Google womöglich nicht oder sehen eine schwache Zusammenfassung.', 'Νέοι πελάτες που σας αναζητούν μπορεί να μη σας βρουν στο Google ή να δουν αδύναμη περίληψη.'],
    f: ['Başlık, açıklama, ana başlık, yapılandırılmış veri ve sitemap düzenini düzeltin.', 'Fix the title, description, main heading, structured data and sitemap.', 'Titel, Beschreibung, Hauptüberschrift, strukturierte Daten und Sitemap korrigieren.', 'Διορθώστε τίτλο, περιγραφή, κύριο τίτλο, δομημένα δεδομένα και sitemap.'],
  },
  impressum: {
    p: ['Yasal künye (Impressum) bulunamadı.', 'No legal notice (Impressum) found.', 'Kein Impressum gefunden.', 'Δεν βρέθηκε νομική σημείωση (Impressum).'],
    c: ['Almanya’da gereklidir; eksikliği hukuki risk ve güven kaybı yaratır.', 'It is required in Germany; its absence creates legal risk and costs trust.', 'In Deutschland ist es Pflicht; ein fehlendes Impressum bedeutet rechtliches Risiko und Vertrauensverlust.', 'Στη Γερμανία είναι υποχρεωτική· η απουσία της σημαίνει νομικό ρίσκο και απώλεια εμπιστοσύνης.'],
    f: ['Impressum sayfası ve alt bilgi bağlantısı ekleyin (metin için hukuki danışmanlık alın).', 'Add an Impressum page and a footer link (get legal advice for the text).', 'Impressum-Seite und Footer-Link ergänzen (Text rechtlich prüfen lassen).', 'Προσθέστε σελίδα Impressum και σύνδεσμο στο υποσέλιδο (ζητήστε νομική συμβουλή για το κείμενο).'],
  },
  privacy: {
    p: ['Gizlilik sayfası veya çerez onayı eksik.', 'Privacy page or cookie consent is missing.', 'Datenschutzseite oder Cookie-Einwilligung fehlt.', 'Λείπει η σελίδα απορρήτου ή η συγκατάθεση cookies.'],
    c: ['Ziyaretçi güveni düşer ve veri koruma kuralları açısından risk doğar.', 'Visitor trust drops and there is a data-protection risk.', 'Das Vertrauen der Besucher sinkt und es besteht ein Datenschutzrisiko.', 'Η εμπιστοσύνη των επισκεπτών μειώνεται και υπάρχει κίνδυνος για την προστασία δεδομένων.'],
    f: ['Gizlilik politikası bağlantısı ve izleyiciler için onay aracı ekleyin (metin için hukuki danışmanlık alın).', 'Add a privacy policy link and a consent tool for trackers (get legal advice for the text).', 'Link zur Datenschutzerklärung und ein Einwilligungstool für Tracker ergänzen (Text rechtlich prüfen lassen).', 'Προσθέστε σύνδεσμο πολιτικής απορρήτου και εργαλείο συγκατάθεσης για trackers (ζητήστε νομική συμβουλή για το κείμενο).'],
  },
  reviews: {
    p: ['Gerçek müşteri yorumu veya referans görünmüyor.', 'No real customer reviews or references are visible.', 'Keine echten Kundenbewertungen oder Referenzen sichtbar.', 'Δεν φαίνονται πραγματικές κριτικές ή αναφορές πελατών.'],
    c: ['Yeni müşteri karar verirken başkalarının deneyimini arar; bulamazsa tereddüt eder.', 'New customers look for other people’s experience before deciding; if they find none they hesitate.', 'Neue Kunden suchen vor der Entscheidung nach Erfahrungen anderer; finden sie keine, zögern sie.', 'Οι νέοι πελάτες ψάχνουν τη γνώμη άλλων πριν αποφασίσουν· αν δεν βρουν, διστάζουν.'],
    f: ['İzinli, gerçek yorumları veya Google yorumlarını sitede gösterin.', 'Show permitted, real reviews or your Google reviews on the site.', 'Erlaubte, echte Bewertungen oder Ihre Google-Bewertungen auf der Website zeigen.', 'Εμφανίστε πραγματικές κριτικές με άδεια ή τις κριτικές σας στο Google.'],
  },
  newsletter: {
    p: ['E-posta toplama ve otomatik takip yok.', 'No e-mail capture or automatic follow-up.', 'Keine E-Mail-Erfassung und kein automatisches Nachfassen.', 'Δεν υπάρχει συλλογή e-mail ούτε αυτόματη επαφή.'],
    c: ['İlk ziyarette karar vermeyen kişi bir daha gelmeyebilir; iletişim kopar.', 'A visitor who does not decide on the first visit may never come back; the contact is lost.', 'Wer sich beim ersten Besuch nicht entscheidet, kommt eventuell nie wieder; der Kontakt geht verloren.', 'Όποιος δεν αποφασίζει στην πρώτη επίσκεψη μπορεί να μην ξαναέρθει· η επαφή χάνεται.'],
    f: ['İzinli e-posta toplama ve ilk ziyaretten sonra otomatik takip e-postaları kurun.', 'Set up permission-based e-mail capture and automatic follow-ups after the first visit.', 'Einwilligungsbasierte E-Mail-Erfassung und automatische Folge-Mails nach dem ersten Besuch einrichten.', 'Στήστε συλλογή e-mail με συγκατάθεση και αυτόματα e-mail παρακολούθησης μετά την πρώτη επίσκεψη.'],
  },
  analytics: {
    p: ['Ziyaretçi ölçümü yok.', 'No visitor measurement.', 'Keine Besuchermessung.', 'Δεν υπάρχει μέτρηση επισκεπτών.'],
    c: ['Hangi sayfanın talep getirdiğini bilmeden yatırım körlemesine yapılır.', 'Without knowing which page brings enquiries, you invest blindly.', 'Ohne zu wissen, welche Seite Anfragen bringt, investieren Sie blind.', 'Χωρίς να ξέρετε ποια σελίδα φέρνει αιτήματα, επενδύετε στα τυφλά.'],
    f: ['İzinli, sade bir ziyaretçi ölçümü kurun.', 'Set up simple, consent-based visitor measurement.', 'Eine einfache, einwilligungsbasierte Besuchermessung einrichten.', 'Στήστε απλή μέτρηση επισκεπτών με συγκατάθεση.'],
  },
  refresh: {
    p: ['Site eski görünüyor.', 'The site looks dated.', 'Die Website wirkt veraltet.', 'Ο ιστότοπος φαίνεται παλιός.'],
    c: ['Eski görünen site güveni düşürür; telefonda kullanımı zorlaşır.', 'A dated site lowers trust and is harder to use on a phone.', 'Eine veraltet wirkende Seite senkt das Vertrauen und ist am Smartphone schwerer zu bedienen.', 'Ένας ξεπερασμένος ιστότοπος μειώνει την εμπιστοσύνη και είναι δυσκολότερος στο κινητό.'],
    f: ['Mevcut içeriği koruyarak güncel, mobil öncelikli yeni bir site hazırlayın.', 'Build a current, mobile-first site that keeps your existing content.', 'Eine aktuelle, mobil-zuerst gestaltete Website aufbauen und bestehende Inhalte übernehmen.', 'Φτιάξτε σύγχρονο ιστότοπο με προτεραιότητα στο κινητό, κρατώντας το υπάρχον περιεχόμενο.'],
  },
  clarity: {
    p: ['Ana sayfada kime ne sunulduğu net değil.', 'It is not clear who the home page is for and what is offered.', 'Auf der Startseite ist nicht klar, für wen und was angeboten wird.', 'Στην αρχική δεν είναι σαφές σε ποιον απευθύνεστε και τι προσφέρετε.'],
    c: ['Ziyaretçi birkaç saniyede ne sunulduğunu anlamazsa sayfayı kapatır.', 'If visitors do not understand the offer within a few seconds they leave.', 'Verstehen Besucher das Angebot nicht in wenigen Sekunden, verlassen sie die Seite.', 'Αν ο επισκέπτης δεν καταλάβει την πρόταση σε λίγα δευτερόλεπτα, φεύγει.'],
    f: ['İlk ekranda kime ne sunduğunuzu tek cümleyle ve net bir adımla gösterin.', 'Show on the first screen who you serve and what you offer, in one sentence and with one clear next step.', 'Auf dem ersten Bildschirm in einem Satz und mit einem klaren nächsten Schritt zeigen, für wen Sie da sind und was Sie anbieten.', 'Δείξτε στην πρώτη οθόνη σε ποιον απευθύνεστε και τι προσφέρετε, με μία πρόταση και ένα σαφές επόμενο βήμα.'],
  },
};
const IDX: Record<RL, number> = { tr: 0, en: 1, de: 2, el: 3 };
export interface Problem { id: string; problem: string; cost: string; fix: string; impact: string; effort: string }
const IMP: Record<string, Q> = { 'yüksek': ['yüksek', 'high', 'hoch', 'υψηλός'], 'orta': ['orta', 'medium', 'mittel', 'μέτριος'], 'düşük': ['düşük', 'low', 'niedrig', 'χαμηλός'] };
const EFF: Record<string, Q> = { 'yüksek': ['yüksek', 'high', 'hoch', 'υψηλή'], 'orta': ['orta', 'medium', 'mittel', 'μέτρια'], 'düşük': ['düşük', 'low', 'niedrig', 'χαμηλή'] };
/** Prioritised problems/fixes in the chosen language (scan.opportunities is already sorted by impact then effort). */
export function problemsOf(scan: Pick<Scan, 'opportunities'>, lang: RL, max = 5): Problem[] {
  const i = IDX[lang];
  return scan.opportunities.filter((o: Opp) => OPP[o.id]).slice(0, max).map((o) => ({
    id: o.id, problem: OPP[o.id].p[i], cost: OPP[o.id].c[i], fix: OPP[o.id].f[i], impact: IMP[o.impact]?.[i] ?? o.impact, effort: EFF[o.effort]?.[i] ?? o.effort,
  }));
}

interface UI {
  title: string; for_: string; date: string; grade: string; score: string; cats: Record<string, string>; catsTitle: string; problems: string; cost: string; fixes: string; impact: string; effort: string;
  none: string; unmeasured: string; unmeasuredText: (n: number) => string; next: string; nextText: string; contact: string; how: string; page: string; locale: string; summary: (s: number, g: string, n: number) => string;
}
const UIS: Record<RL, UI> = {
  tr: { title: 'Web Sitesi Analiz Raporu', for_: 'Hazırlanan site', date: 'Tarih', grade: 'Not', score: 'Genel puan', catsTitle: 'Puan dağılımı', problems: 'En önemli sorunlar ve müşteriye maliyeti', cost: 'Müşteriye maliyeti', fixes: 'Öncelikli düzeltmeler', impact: 'etki', effort: 'efor', none: 'Öne çıkan bir sorun bulunmadı. Site genel olarak düzenli görünüyor.', unmeasured: 'Ölçülemedi', unmeasuredText: (n) => `${n} kontrol bu analizde ölçülemedi (örneğin JavaScript ile yüklenen içerik veya erişilemeyen sayfa). Bunlar hakkında yorum yapmıyorum ve puana katılmadılar.`, next: 'Sonraki adım', nextText: 'Bu listeden hangi maddelerin sizin için öncelikli olduğunu birlikte netleştirebiliriz diye düşünüyorum; ben yazılı olarak değerlendirir ve ücretsiz, bağlayıcı olmayan bir çözüm listesi hazırlarım. Konuşmak yerine yazmayı tercih ederseniz bu da yeterlidir.', contact: 'İletişim formu', how: 'Yalnızca herkese açık sayfalarınız otomatik olarak okundu. Puanlar ölçülen kontrollere dayanır; bir tahmindir, garanti değildir.', page: 'Sayfa', locale: 'tr-TR', summary: (s, g, n) => `Genel puan ${s}/100 (not ${g}). ${n ? `${n} somut iyileştirme alanı bulundu.` : 'Belirgin bir eksik bulunmadı.'}`, cats: { tech: 'Teknik ve hız', seo: 'SEO', conv: 'Dönüşüm ve iletişim', trust: 'Güven ve yasal', auto: 'Otomasyon', content: 'İçerik ve netlik' } },
  en: { title: 'Website Analysis Report', for_: 'Website', date: 'Date', grade: 'Grade', score: 'Overall score', catsTitle: 'Score breakdown', problems: 'Top problems and what they cost you', cost: 'Cost to your customers', fixes: 'Prioritised fixes', impact: 'impact', effort: 'effort', none: 'No standout problem was found. The site looks tidy overall.', unmeasured: 'Could not be measured', unmeasuredText: (n) => `${n} checks could not be measured in this analysis (for example content loaded by JavaScript or pages that could not be reached). I make no statement about them and they are not part of the score.`, next: 'Next step', nextText: 'I would be glad to go through which of these points matter most for you. I assess it in writing and prepare a free, non-binding list of solutions. If you prefer writing to talking, that is perfectly fine.', contact: 'Contact form', how: 'Only your public pages were read automatically. Scores are based on measured checks; this is an estimate, not a guarantee.', page: 'Page', locale: 'en-GB', summary: (s, g, n) => `Overall score ${s}/100 (grade ${g}). ${n ? `${n} concrete areas for improvement were found.` : 'No clear gaps were found.'}`, cats: { tech: 'Technical and speed', seo: 'SEO', conv: 'Conversion and contact', trust: 'Trust and legal', auto: 'Automation', content: 'Content and clarity' } },
  de: { title: 'Website-Analysebericht', for_: 'Website', date: 'Datum', grade: 'Note', score: 'Gesamtpunktzahl', catsTitle: 'Punkteverteilung', problems: 'Wichtigste Probleme und was sie Sie kosten', cost: 'Kosten für Ihre Kunden', fixes: 'Priorisierte Verbesserungen', impact: 'Wirkung', effort: 'Aufwand', none: 'Es wurde kein auffälliges Problem gefunden. Die Website wirkt insgesamt ordentlich.', unmeasured: 'Nicht messbar', unmeasuredText: (n) => `${n} Prüfungen konnten in dieser Analyse nicht gemessen werden (zum Beispiel per JavaScript geladene Inhalte oder nicht erreichbare Seiten). Dazu mache ich keine Aussage; sie fließen nicht in die Punktzahl ein.`, next: 'Nächster Schritt', nextText: 'Gern gehe ich mit Ihnen durch, welche dieser Punkte für Sie am wichtigsten sind. Ich bewerte das schriftlich und erstelle eine kostenlose, unverbindliche Lösungsliste. Wenn Sie lieber schreiben als telefonieren, ist das völlig in Ordnung.', contact: 'Kontaktformular', how: 'Es wurden automatisch nur Ihre öffentlichen Seiten gelesen. Die Punkte beruhen auf gemessenen Prüfungen; es ist eine Einschätzung, keine Garantie.', page: 'Seite', locale: 'de-DE', summary: (s, g, n) => `Gesamtpunktzahl ${s}/100 (Note ${g}). ${n ? `${n} konkrete Verbesserungsfelder gefunden.` : 'Keine deutlichen Lücken gefunden.'}`, cats: { tech: 'Technik und Geschwindigkeit', seo: 'SEO', conv: 'Konversion und Kontakt', trust: 'Vertrauen und Recht', auto: 'Automatisierung', content: 'Inhalt und Klarheit' } },
  el: { title: 'Αναφορά ανάλυσης ιστοσελίδας', for_: 'Ιστοσελίδα', date: 'Ημερομηνία', grade: 'Βαθμός', score: 'Συνολική βαθμολογία', catsTitle: 'Κατανομή βαθμολογίας', problems: 'Κύρια προβλήματα και τι κοστίζουν', cost: 'Κόστος για τους πελάτες σας', fixes: 'Διορθώσεις με προτεραιότητα', impact: 'επίδραση', effort: 'προσπάθεια', none: 'Δεν βρέθηκε κάποιο ιδιαίτερο πρόβλημα. Ο ιστότοπος φαίνεται γενικά τακτοποιημένος.', unmeasured: 'Δεν μετρήθηκε', unmeasuredText: (n) => `${n} έλεγχοι δεν μπόρεσαν να μετρηθούν σε αυτή την ανάλυση (για παράδειγμα περιεχόμενο που φορτώνεται με JavaScript ή σελίδες που δεν ήταν προσβάσιμες). Δεν κάνω καμία δήλωση γι’ αυτούς και δεν μπαίνουν στη βαθμολογία.`, next: 'Επόμενο βήμα', nextText: 'Θα χαρώ να δούμε μαζί ποια από αυτά τα σημεία είναι πιο σημαντικά για εσάς. Το αξιολογώ γραπτά και ετοιμάζω μια δωρεάν, μη δεσμευτική λίστα λύσεων. Αν προτιμάτε να γράφετε αντί να μιλάτε, είναι απολύτως εντάξει.', contact: 'Φόρμα επικοινωνίας', how: 'Διαβάστηκαν αυτόματα μόνο οι δημόσιες σελίδες σας. Οι βαθμοί βασίζονται σε μετρημένους ελέγχους· είναι εκτίμηση, όχι εγγύηση.', page: 'Σελίδα', locale: 'el-GR', summary: (s, g, n) => `Συνολική βαθμολογία ${s}/100 (βαθμός ${g}). ${n ? `Βρέθηκαν ${n} συγκεκριμένα σημεία βελτίωσης.` : 'Δεν βρέθηκαν σαφή κενά.'}`, cats: { tech: 'Τεχνικά και ταχύτητα', seo: 'SEO', conv: 'Μετατροπή και επικοινωνία', trust: 'Εμπιστοσύνη και νομικά', auto: 'Αυτοματοποίηση', content: 'Περιεχόμενο και σαφήνεια' } },
};
export const REPORT_UI = UIS;

// ── drawing ──
const NAVY = rgb(0.043, 0.165, 0.357), INK = rgb(0.08, 0.13, 0.24), MUTE = rgb(0.35, 0.42, 0.52), LINE = rgb(0.84, 0.88, 0.94), BLUE = rgb(0.184, 0.435, 0.929), BG = rgb(0.94, 0.96, 0.99);
const GOOD = rgb(0.13, 0.6, 0.35), MID = rgb(0.85, 0.6, 0.1), BAD = rgb(0.8, 0.25, 0.2);
const fontBytes = (n: string) => fs.readFileSync(new URL(`./fonts/NotoSans-${n}.ttf`, import.meta.url));
const lvl = (n: number | null) => (n === null ? MUTE : n >= 80 ? GOOD : n >= 55 ? MID : BAD);
const W = 595.28, H = 841.89, M = 48;

function wrap(font: PDFFont, text: string, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const w of para.split(/\s+/).filter(Boolean)) {
      let word = w;
      while (font.widthOfTextAtSize(word, size) > width) {   // unbroken long token (URL): hard break
        let k = word.length; while (k > 1 && font.widthOfTextAtSize(word.slice(0, k), size) > width) k--;
        if (line) { out.push(line); line = ''; }
        out.push(word.slice(0, k)); word = word.slice(k);
      }
      const t = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(t, size) <= width) line = t; else { out.push(line); line = word; }
    }
    out.push(line);
  }
  return out;
}

export interface ReportInput { domain: string; url: string; company?: string; scan: Scan }
export async function buildReportPdf(inp: ReportInput, lang: RL, o: { contactUrl?: string; now?: Date } = {}): Promise<Uint8Array> {
  const u = UIS[lang]; const sc = inp.scan; const now = o.now ?? new Date();
  const doc = await PDFDocument.create(); doc.registerFontkit(fontkit);
  const reg = await doc.embedFont(fontBytes('Regular'), { subset: true }); const bold = await doc.embedFont(fontBytes('Bold'), { subset: true });
  doc.setTitle(`${u.title}: ${inp.domain}`); doc.setAuthor('Chioutworks'); doc.setProducer('Chioutworks'); doc.setCreator('Chioutworks'); doc.setLanguage(lang); doc.setCreationDate(now);
  const pages: PDFPage[] = []; let page!: PDFPage; let y = 0;
  const fresh = () => { page = doc.addPage([W, H]); pages.push(page); y = H - M; if (pages.length > 1) { page.drawText('Chioutworks', { x: M, y: H - 30, size: 9, font: bold, color: NAVY }); page.drawText(inp.domain, { x: W - M - reg.widthOfTextAtSize(inp.domain, 9), y: H - 30, size: 9, font: reg, color: MUTE }); page.drawLine({ start: { x: M, y: H - 36 }, end: { x: W - M, y: H - 36 }, thickness: 0.6, color: LINE }); y = H - 62; } };
  const need = (h: number) => { if (y - h < M + 24) fresh(); };
  const text = (t: string, size: number, o2: { font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; width?: number; gap?: number; lh?: number } = {}) => {
    const f = o2.font ?? reg; const x = o2.x ?? M; const lh = size * (o2.lh ?? 1.45);
    for (const l of wrap(f, t, size, o2.width ?? W - M - x)) { need(lh); y -= lh; page.drawText(l, { x, y: y + size * 0.3, size, font: f, color: o2.color ?? INK }); }
    y -= o2.gap ?? 0;
  };
  const h2 = (t: string) => { need(60); y -= 14; text(t, 14, { font: bold, color: NAVY, gap: 6 }); };

  // cover
  fresh();
  page.drawRectangle({ x: 0, y: H - 250, width: W, height: 250, color: NAVY });
  page.drawText('Chioutworks', { x: M, y: H - 70, size: 20, font: bold, color: rgb(1, 1, 1) });
  page.drawText(u.title, { x: M, y: H - 130, size: 26, font: bold, color: rgb(1, 1, 1) });
  const dom = wrap(bold, inp.domain, 18, W - 2 * M)[0]; page.drawText(dom, { x: M, y: H - 168, size: 18, font: bold, color: rgb(0.75, 0.85, 1) });
  if (inp.company) page.drawText(wrap(reg, inp.company, 12, W - 2 * M)[0], { x: M, y: H - 192, size: 12, font: reg, color: rgb(0.85, 0.9, 1) });
  page.drawText(`${u.date}: ${new Intl.DateTimeFormat(u.locale, { dateStyle: 'long', timeZone: 'Europe/Berlin' }).format(now)}`, { x: M, y: H - 226, size: 11, font: reg, color: rgb(0.85, 0.9, 1) });
  y = H - 290;
  page.drawRectangle({ x: M, y: y - 96, width: W - 2 * M, height: 96, color: BG, borderColor: LINE, borderWidth: 0.8 });
  page.drawText(sc.grade, { x: M + 28, y: y - 68, size: 56, font: bold, color: lvl(sc.score) });
  page.drawText(`${u.score}`, { x: M + 120, y: y - 34, size: 11, font: reg, color: MUTE });
  page.drawText(`${sc.score}/100`, { x: M + 120, y: y - 66, size: 30, font: bold, color: INK });
  page.drawText(`${u.grade} ${sc.grade}`, { x: W - M - 18 - bold.widthOfTextAtSize(`${u.grade} ${sc.grade}`, 12), y: y - 30, size: 12, font: bold, color: lvl(sc.score) });
  y -= 110;
  const probs = problemsOf(sc, lang, 5);
  text(u.summary(sc.score, sc.grade, probs.length), 12, { gap: 8 });

  // categories
  h2(u.catsTitle);
  for (const c of sc.categories) {
    need(24); y -= 22; const lab = u.cats[c.key] ?? c.label;
    page.drawText(lab, { x: M, y: y + 4, size: 10.5, font: reg, color: INK });
    const bx = M + 190, bw = W - M - bx - 44;
    page.drawRectangle({ x: bx, y: y + 3, width: bw, height: 9, color: LINE });
    if (c.score !== null) page.drawRectangle({ x: bx, y: y + 3, width: Math.max(2, (bw * c.score) / 100), height: 9, color: lvl(c.score) });
    const v = c.score === null ? '-' : String(c.score); page.drawText(v, { x: W - M - bold.widthOfTextAtSize(v, 10.5), y: y + 3, size: 10.5, font: bold, color: INK });
  }
  y -= 6;

  // problems
  h2(u.problems);
  if (!probs.length) text(u.none, 11, { color: MUTE });
  probs.forEach((p, i) => {
    need(58); y -= 4;
    page.drawCircle({ x: M + 10, y: y - 9, size: 10, color: NAVY }); page.drawText(String(i + 1), { x: M + 10 - bold.widthOfTextAtSize(String(i + 1), 10) / 2, y: y - 12.5, size: 10, font: bold, color: rgb(1, 1, 1) });
    text(p.problem, 11.5, { font: bold, x: M + 30, gap: 1 });
    text(`${u.cost}: ${p.cost}`, 10.5, { x: M + 30, color: MUTE, gap: 8 });
  });

  // fixes
  h2(u.fixes);
  probs.slice(0, 5).forEach((p, i) => { need(46); text(`${i + 1}. ${p.fix}`, 11, { gap: 1 }); text(`${u.impact}: ${p.impact} · ${u.effort}: ${p.effort}`, 9.5, { color: MUTE, x: M + 14, gap: 7 }); });

  // not measured
  if (sc.unmeasured.length) { h2(u.unmeasured); text(u.unmeasuredText(sc.unmeasured.length), 10.5, { color: MUTE }); }

  // next step
  need(150); y -= 10;
  const boxTop = y; const lines = wrap(reg, u.nextText, 11, W - 2 * M - 32).length + (o.contactUrl ? 2 : 0);
  const bh = 44 + lines * 16; need(bh + 10);
  page.drawRectangle({ x: M, y: y - bh, width: W - 2 * M, height: bh, color: BG, borderColor: BLUE, borderWidth: 1 });
  y -= 10; text(u.next, 13, { font: bold, color: NAVY, x: M + 16, gap: 4 }); text(u.nextText, 11, { x: M + 16, width: W - 2 * M - 32, gap: 4 });
  if (o.contactUrl) text(`${u.contact}: ${o.contactUrl}`, 10.5, { x: M + 16, width: W - 2 * M - 32, color: BLUE });
  y = Math.min(y, boxTop - bh) - 14; text(u.how, 9, { color: MUTE });

  const n = pages.length;
  pages.forEach((p, i) => { const t = `${u.page} ${i + 1}/${n}`; p.drawText(t, { x: W - M - reg.widthOfTextAtSize(t, 8.5), y: 26, size: 8.5, font: reg, color: MUTE }); p.drawText('Chioutworks', { x: M, y: 26, size: 8.5, font: reg, color: MUTE }); });
  return doc.save();
}
