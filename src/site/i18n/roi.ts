import type { Lang } from '../../translations';
import type { SectorKey } from '../../lib/roiModel';

export const ROI_UI = {
  en: {
    title: 'Calculate your savings', desc: 'Pick your sector, adjust the tasks and see what automation could realistically give back to your team.',
    sector: 'Sector', tasks: 'Repetitive tasks', taskName: 'Task', taskMin: 'Minutes each', taskPerWeek: 'Times per week', taskAuto: 'Automatable', addTask: '+ Add task', customSector: 'Type your industry', removeTask: 'Remove task', maxTasks: 'Maximum 30 tasks.',
    staff: 'People doing these tasks', cost: 'Hourly cost per person', gauge: 'Estimated yearly savings',
    hWeek: 'Hours saved per week', hMonth: 'Hours saved per month', hYear: 'Hours saved per year', mMonth: 'Saved per month', mYear: 'Saved per year', days: 'Working days per year (8 h)',
    assumptionsTitle: 'Assumptions', assumptions: ['Per task: minutes × times per week ÷ 60 × automatable share × people = hours saved per week.', 'Per month = per week × 52 ÷ 12; per year = per week × 52.', 'Money = hours saved × hourly cost. One working day = 8 hours.', 'This is an estimate based on your inputs, not a guarantee. Real results depend on your processes.'],
    send: 'Send this calculation for a written assessment', demo: 'Open the related demo', download: 'Download report (PDF)',
    privacy: 'Nothing is sent unless you submit the contact form or enter your e-mail for the report. The PDF is created in your browser.',
    repName: 'Your name (optional)', repCompany: 'Company (optional)', repNote: 'Name and company appear only on the report and are not sent anywhere.', repEmail: 'E-mail (optional)', repEmailNote: 'If you enter your e-mail, I keep it with your calculation so I can reply to you in writing. No newsletter, no advertising.',
    rTitle: 'Savings estimate', rDate: 'Date', rFor: 'Prepared for', rInputs: 'Inputs', rResults: 'Results', rAssump: 'Assumptions', rStaff: 'People', rCost: 'Hourly cost', rCta: 'Want a written assessment of these numbers? Free and without obligation:', rEst: 'Estimate, no guarantee.',
  },
  de: {
    title: 'Berechnen Sie Ihre Ersparnis', desc: 'Wählen Sie Ihre Branche, passen Sie die Aufgaben an und sehen Sie, was Automatisierung Ihrem Team realistisch zurückgeben kann.',
    sector: 'Branche', tasks: 'Wiederkehrende Aufgaben', taskName: 'Aufgabe', taskMin: 'Minuten je Vorgang', taskPerWeek: 'Mal pro Woche', taskAuto: 'Automatisierbar', addTask: '+ Aufgabe hinzufügen', customSector: 'Ihre Branche eingeben', removeTask: 'Aufgabe entfernen', maxTasks: 'Höchstens 30 Aufgaben.',
    staff: 'Personen, die diese Aufgaben erledigen', cost: 'Stundenkosten pro Person', gauge: 'Geschätzte Jahresersparnis',
    hWeek: 'Gesparte Stunden pro Woche', hMonth: 'Gesparte Stunden pro Monat', hYear: 'Gesparte Stunden pro Jahr', mMonth: 'Ersparnis pro Monat', mYear: 'Ersparnis pro Jahr', days: 'Arbeitstage pro Jahr (8 Std.)',
    assumptionsTitle: 'Annahmen', assumptions: ['Pro Aufgabe: Minuten × Mal pro Woche ÷ 60 × automatisierbarer Anteil × Personen = gesparte Stunden pro Woche.', 'Pro Monat = pro Woche × 52 ÷ 12; pro Jahr = pro Woche × 52.', 'Geld = gesparte Stunden × Stundenkosten. Ein Arbeitstag = 8 Stunden.', 'Dies ist eine Schätzung auf Basis Ihrer Angaben, keine Garantie. Die tatsächlichen Ergebnisse hängen von Ihren Abläufen ab.'],
    send: 'Diese Berechnung für eine schriftliche Einschätzung senden', demo: 'Passende Demo öffnen', download: 'Bericht herunterladen (PDF)',
    privacy: 'Es wird nichts gesendet, außer Sie schicken das Kontaktformular ab oder geben beim Bericht Ihre E-Mail an. Das PDF entsteht in Ihrem Browser.',
    repName: 'Ihr Name (optional)', repCompany: 'Unternehmen (optional)', repNote: 'Name und Unternehmen erscheinen nur im Bericht und werden nirgendwohin gesendet.', repEmail: 'E-Mail (optional)', repEmailNote: 'Wenn Sie Ihre E-Mail angeben, speichere ich sie mit Ihrer Berechnung, um Ihnen schriftlich antworten zu können. Kein Newsletter, keine Werbung.',
    rTitle: 'Ersparnis-Schätzung', rDate: 'Datum', rFor: 'Erstellt für', rInputs: 'Angaben', rResults: 'Ergebnisse', rAssump: 'Annahmen', rStaff: 'Personen', rCost: 'Stundenkosten', rCta: 'Möchten Sie eine schriftliche Einschätzung dieser Zahlen? Kostenlos und unverbindlich:', rEst: 'Schätzung, keine Garantie.',
  },
  tr: {
    title: 'Tasarrufunuzu hesaplayın', desc: 'Sektörünüzü seçin, görevleri düzenleyin ve otomasyonun ekibinize gerçekçi olarak ne kazandırabileceğini görün.',
    sector: 'Sektör', tasks: 'Tekrarlayan görevler', taskName: 'Görev', taskMin: 'Süre (dk)', taskPerWeek: 'Haftada kaç kez', taskAuto: 'Otomatikleşebilir', addTask: '+ Görev ekle', customSector: 'Sektörünüzü yazın', removeTask: 'Görevi sil', maxTasks: 'En fazla 30 görev.',
    staff: 'Bu işleri yapan kişi sayısı', cost: 'Kişi başı saatlik maliyet', gauge: 'Tahmini yıllık tasarruf',
    hWeek: 'Haftalık kazanılan saat', hMonth: 'Aylık kazanılan saat', hYear: 'Yıllık kazanılan saat', mMonth: 'Aylık tasarruf', mYear: 'Yıllık tasarruf', days: 'Yılda iş günü (8 sa)',
    assumptionsTitle: 'Varsayımlar', assumptions: ['Görev başına: dakika × haftada kaç kez ÷ 60 × otomatikleşebilir pay × kişi sayısı = haftalık kazanılan saat.', 'Aylık = haftalık × 52 ÷ 12; yıllık = haftalık × 52.', 'Para = kazanılan saat × saatlik maliyet. Bir iş günü = 8 saat.', 'Bu, girdilerinize dayanan bir tahmindir, garanti değildir. Gerçek sonuçlar süreçlerinize bağlıdır.'],
    send: 'Bu hesabı yazılı değerlendirme için gönder', demo: 'İlgili demoyu aç', download: 'Raporu indir (PDF)',
    privacy: 'İletişim formunu göndermezseniz veya rapor için e-postanızı yazmazsanız hiçbir şey gönderilmez. PDF tarayıcınızda oluşturulur.',
    repName: 'Adınız (isteğe bağlı)', repCompany: 'Şirket (isteğe bağlı)', repNote: 'Ad ve firma yalnızca raporda görünür, hiçbir yere gönderilmez.', repEmail: 'E-posta (isteğe bağlı)', repEmailNote: 'E-postanızı yazarsanız, size yazılı olarak dönebilmem için hesaplamanızla birlikte saklarım. Bülten yok, reklam yok.',
    rTitle: 'Tasarruf tahmini', rDate: 'Tarih', rFor: 'Hazırlanan', rInputs: 'Girdiler', rResults: 'Sonuçlar', rAssump: 'Varsayımlar', rStaff: 'Kişi sayısı', rCost: 'Saatlik maliyet', rCta: 'Bu rakamların yazılı değerlendirmesini ister misiniz? Ücretsiz ve taahhütsüz:', rEst: 'Tahmindir, garanti değildir.',
  },
  el: {
    title: 'Υπολογίστε την εξοικονόμησή σας', desc: 'Διαλέξτε τον κλάδο σας, προσαρμόστε τις εργασίες και δείτε τι μπορεί ρεαλιστικά να επιστρέψει ο αυτοματισμός στην ομάδα σας.',
    sector: 'Κλάδος', tasks: 'Επαναλαμβανόμενες εργασίες', taskName: 'Εργασία', taskMin: 'Λεπτά ανά φορά', taskPerWeek: 'Φορές την εβδομάδα', taskAuto: 'Αυτοματοποιήσιμο', addTask: '+ Προσθήκη εργασίας', customSector: 'Γράψτε τον κλάδο σας', removeTask: 'Διαγραφή εργασίας', maxTasks: 'Έως 30 εργασίες.',
    staff: 'Άτομα που κάνουν αυτές τις εργασίες', cost: 'Ωριαίο κόστος ανά άτομο', gauge: 'Εκτιμώμενη ετήσια εξοικονόμηση',
    hWeek: 'Ώρες που εξοικονομούνται την εβδομάδα', hMonth: 'Ώρες που εξοικονομούνται τον μήνα', hYear: 'Ώρες που εξοικονομούνται τον χρόνο', mMonth: 'Εξοικονόμηση τον μήνα', mYear: 'Εξοικονόμηση τον χρόνο', days: 'Εργάσιμες ημέρες τον χρόνο (8 ώρ.)',
    assumptionsTitle: 'Παραδοχές', assumptions: ['Ανά εργασία: λεπτά × φορές την εβδομάδα ÷ 60 × αυτοματοποιήσιμο ποσοστό × άτομα = ώρες που εξοικονομούνται την εβδομάδα.', 'Ανά μήνα = ανά εβδομάδα × 52 ÷ 12· ανά έτος = ανά εβδομάδα × 52.', 'Χρήμα = ώρες που εξοικονομούνται × ωριαίο κόστος. Μία εργάσιμη ημέρα = 8 ώρες.', 'Πρόκειται για εκτίμηση βάσει των στοιχείων σας, όχι εγγύηση. Τα πραγματικά αποτελέσματα εξαρτώνται από τις διαδικασίες σας.'],
    send: 'Αποστολή αυτού του υπολογισμού για γραπτή αξιολόγηση', demo: 'Άνοιγμα της σχετικής επίδειξης', download: 'Λήψη αναφοράς (PDF)',
    privacy: 'Τίποτα δεν στέλνεται, εκτός αν υποβάλετε τη φόρμα επικοινωνίας ή γράψετε το e-mail σας για την αναφορά. Το PDF δημιουργείται στον περιηγητή σας.',
    repName: 'Το όνομά σας (προαιρετικό)', repCompany: 'Επιχείρηση (προαιρετικό)', repNote: 'Το όνομα και η εταιρεία εμφανίζονται μόνο στην αναφορά και δεν στέλνονται πουθενά.', repEmail: 'E-mail (προαιρετικά)', repEmailNote: 'Αν γράψετε το e-mail σας, το κρατώ μαζί με τον υπολογισμό σας για να σας απαντήσω γραπτώς. Χωρίς newsletter, χωρίς διαφήμιση.',
    rTitle: 'Εκτίμηση εξοικονόμησης', rDate: 'Ημερομηνία', rFor: 'Εκπονήθηκε για', rInputs: 'Στοιχεία', rResults: 'Αποτελέσματα', rAssump: 'Παραδοχές', rStaff: 'Άτομα', rCost: 'Ωριαίο κόστος', rCta: 'Θέλετε γραπτή αξιολόγηση αυτών των αριθμών; Δωρεάν και χωρίς δέσμευση:', rEst: 'Εκτίμηση, όχι εγγύηση.',
  },
} satisfies Record<Lang, unknown>;

type SectorText = { label: string; nudge: string; tasks: string[] };
export const ROI_SECTORS: Record<Lang, Record<SectorKey, SectorText>> = {
  tr: {
    salon: { label: 'Kuaför / Salon', nudge: 'Kuaför salonlarında en büyük kazanç genelde randevu ve hatırlatmalarda olur.', tasks: ['Randevu hatırlatma mesajları', 'Telefon ve mesajla randevu alma', 'İptal ve bekleme listesi yönetimi', 'Yorum isteme mesajları'] },
    clinic: { label: 'Klinik / Muayenehane', nudge: 'Kliniklerde zaman çoğunlukla randevu hatırlatmalarında ve hasta formlarında kaybolur.', tasks: ['Randevu hatırlatmaları', 'Hasta kabul formları', 'Kontrol ve takip mesajları', 'Fatura ve belge hazırlama'] },
    cleaning: { label: 'Temizlik', nudge: 'Temizlik işletmelerinde teklif hazırlama ve ekip planlaması en çok zaman alır.', tasks: ['Teklif hazırlama', 'Ekip ve vardiya planlama', 'Müşteri onay mesajları', 'Faturalandırma'] },
    realestate: { label: 'Emlak', nudge: 'Emlakta hızlı ilk yanıt ve görüntüleme planlaması genelde en büyük farkı yaratır.', tasks: ['Gelen taleplere yanıt', 'Gösterim randevusu planlama', 'İlanı farklı portallara girme', 'Potansiyel müşteri takibi'] },
    cafe: { label: 'Kafe', nudge: 'Kafelerde rezervasyon ve stok siparişleri genelde en kolay otomatikleşen işlerdir.', tasks: ['Rezervasyon alma', 'Vardiya planlama', 'Stok siparişleri', 'Sosyal medya ve yorum yanıtları'] },
    agency: { label: 'Ajans / Ofis', nudge: 'Ajans ve ofislerde raporlama ile ödeme hatırlatmaları genelde en çok zaman geri kazandırır.', tasks: ['Müşteri raporlama', 'Fatura ve ödeme hatırlatma', 'Toplantı planlama ve notlar', 'Müşteri kabul süreci'] },
    other: { label: 'Diğer', nudge: 'Her sektörde sistemler arası elle veri aktarımı, otomasyonun ilk durağıdır.', tasks: ['Sistemler arası veri girişi', 'Sık sorulan sorulara yanıt', 'Düzenli raporlar'] },
  },
  en: {
    salon: { label: 'Salon / Barber', nudge: 'In salons, the biggest gain usually comes from bookings and reminders.', tasks: ['Appointment reminder messages', 'Booking by phone and message', 'Cancellations and waiting list', 'Review request messages'] },
    clinic: { label: 'Clinic / Practice', nudge: 'In practices, time mostly disappears in appointment reminders and patient forms.', tasks: ['Appointment reminders', 'Patient intake forms', 'Recall and follow-up messages', 'Invoices and documents'] },
    cleaning: { label: 'Cleaning', nudge: 'In cleaning businesses, quotes and crew scheduling take the most time.', tasks: ['Preparing quotes', 'Crew and shift scheduling', 'Customer confirmation messages', 'Invoicing'] },
    realestate: { label: 'Real estate', nudge: 'In real estate, a fast first reply and viewing scheduling usually make the biggest difference.', tasks: ['Replying to enquiries', 'Scheduling viewings', 'Entering listings on several portals', 'Following up leads'] },
    cafe: { label: 'Cafe', nudge: 'In cafes, reservations and stock orders are usually the easiest to automate.', tasks: ['Taking reservations', 'Shift planning', 'Stock orders', 'Social media and review replies'] },
    agency: { label: 'Agency / Office', nudge: 'In agencies and offices, reporting and payment reminders usually win back the most time.', tasks: ['Client reporting', 'Invoices and payment reminders', 'Meeting scheduling and notes', 'Client onboarding'] },
    other: { label: 'Other', nudge: 'In every sector, copying data between systems by hand is the first stop for automation.', tasks: ['Entering data between systems', 'Answering common questions', 'Regular reports'] },
  },
  de: {
    salon: { label: 'Friseur / Salon', nudge: 'In Friseursalons liegt der größte Gewinn meist bei Terminen und Erinnerungen.', tasks: ['Terminerinnerungen', 'Terminvergabe per Telefon und Nachricht', 'Absagen und Warteliste', 'Bewertungsanfragen'] },
    clinic: { label: 'Praxis / Klinik', nudge: 'In Praxen geht die Zeit meist bei Terminerinnerungen und Patientenformularen verloren.', tasks: ['Terminerinnerungen', 'Patientenaufnahmebögen', 'Recall- und Nachsorgenachrichten', 'Rechnungen und Unterlagen'] },
    cleaning: { label: 'Reinigung', nudge: 'In Reinigungsbetrieben kosten Angebote und Einsatzplanung am meisten Zeit.', tasks: ['Angebote erstellen', 'Team- und Schichtplanung', 'Bestätigungen an Kunden', 'Rechnungsstellung'] },
    realestate: { label: 'Immobilien', nudge: 'In der Immobilienbranche machen eine schnelle Erstantwort und die Besichtigungsplanung meist den größten Unterschied.', tasks: ['Anfragen beantworten', 'Besichtigungen planen', 'Inserate in mehreren Portalen eintragen', 'Interessenten nachfassen'] },
    cafe: { label: 'Café', nudge: 'In Cafés lassen sich Reservierungen und Warenbestellungen meist am leichtesten automatisieren.', tasks: ['Reservierungen annehmen', 'Schichtplanung', 'Warenbestellungen', 'Social Media und Bewertungsantworten'] },
    agency: { label: 'Agentur / Büro', nudge: 'In Agenturen und Büros bringen Berichte und Zahlungserinnerungen meist die meiste Zeit zurück.', tasks: ['Kundenberichte', 'Rechnungen und Zahlungserinnerungen', 'Terminplanung und Protokolle', 'Kunden-Onboarding'] },
    other: { label: 'Sonstige', nudge: 'In jeder Branche ist das manuelle Übertragen von Daten zwischen Systemen die erste Station der Automatisierung.', tasks: ['Daten zwischen Systemen eintragen', 'Häufige Fragen beantworten', 'Regelmäßige Berichte'] },
  },
  el: {
    salon: { label: 'Κομμωτήριο / Σαλόνι', nudge: 'Στα κομμωτήρια το μεγαλύτερο όφελος προέρχεται συνήθως από τα ραντεβού και τις υπενθυμίσεις.', tasks: ['Υπενθυμίσεις ραντεβού', 'Κλείσιμο ραντεβού με τηλέφωνο και μήνυμα', 'Ακυρώσεις και λίστα αναμονής', 'Μηνύματα αίτησης αξιολόγησης'] },
    clinic: { label: 'Ιατρείο / Κλινική', nudge: 'Στα ιατρεία ο χρόνος χάνεται κυρίως σε υπενθυμίσεις ραντεβού και φόρμες ασθενών.', tasks: ['Υπενθυμίσεις ραντεβού', 'Φόρμες εισαγωγής ασθενών', 'Μηνύματα επανάκλησης και παρακολούθησης', 'Τιμολόγια και έγγραφα'] },
    cleaning: { label: 'Καθαριότητα', nudge: 'Στις επιχειρήσεις καθαριότητας οι προσφορές και ο προγραμματισμός συνεργείων παίρνουν τον περισσότερο χρόνο.', tasks: ['Σύνταξη προσφορών', 'Προγραμματισμός συνεργείων και βαρδιών', 'Μηνύματα επιβεβαίωσης σε πελάτες', 'Τιμολόγηση'] },
    realestate: { label: 'Ακίνητα', nudge: 'Στα ακίνητα η γρήγορη πρώτη απάντηση και ο προγραμματισμός επισκέψεων κάνουν συνήθως τη μεγαλύτερη διαφορά.', tasks: ['Απάντηση σε ερωτήματα', 'Προγραμματισμός επισκέψεων', 'Καταχώριση αγγελιών σε πολλές πλατφόρμες', 'Παρακολούθηση ενδιαφερομένων'] },
    cafe: { label: 'Καφέ', nudge: 'Στα καφέ οι κρατήσεις και οι παραγγελίες προμηθειών είναι συνήθως τα πιο εύκολα να αυτοματοποιηθούν.', tasks: ['Λήψη κρατήσεων', 'Προγραμματισμός βαρδιών', 'Παραγγελίες προμηθειών', 'Κοινωνικά δίκτυα και απαντήσεις σε αξιολογήσεις'] },
    agency: { label: 'Γραφείο / Εταιρεία', nudge: 'Σε γραφεία και εταιρείες οι αναφορές και οι υπενθυμίσεις πληρωμής επιστρέφουν συνήθως τον περισσότερο χρόνο.', tasks: ['Αναφορές προς πελάτες', 'Τιμολόγια και υπενθυμίσεις πληρωμής', 'Προγραμματισμός συναντήσεων και σημειώσεις', 'Υποδοχή νέων πελατών'] },
    other: { label: 'Άλλο', nudge: 'Σε κάθε κλάδο η χειροκίνητη μεταφορά δεδομένων μεταξύ συστημάτων είναι η πρώτη στάση του αυτοματισμού.', tasks: ['Καταχώριση δεδομένων μεταξύ συστημάτων', 'Απάντηση σε συχνές ερωτήσεις', 'Τακτικές αναφορές'] },
  },
};
