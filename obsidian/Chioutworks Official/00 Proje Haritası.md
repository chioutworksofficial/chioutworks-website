---
tür: "harita"
durum: "güncel"
proje: "chioutworks"
tarih: "2026-11-19"
tags: ["harita", "durum"]
---

<!-- otomatik:başla -->
> Kaynak: `context/HARITA.md` (projede değiştirin; burası otomatik güncellenir)

# Proje Haritası (Chioutworks Resmi Web Sitesi)

> **Ana harita.** Her görevden ÖNCE okunur, SONRA güncellenir. Yapılmış bir şey bozulmaz; istenen şey zaten varsa
> sahibe "yapıldı, şurada" denir; kısmen varsa eksiği söylenir. Oturum sonunda ve sahip sorduğunda bu tablo verilir.
> Yazım kuralı: kısaltma yok; her satır ya **tamamen bitti** ya **bitti ama yayında kontrol edilecek / küçük eksik** ya da **yapılmadı** grubundadır.
> Son güncelleme: 2026-11-18

## A. Tamamen bitti — öyle kalabilir (dokunmaya gerek yok)
| Parça | Nerede |
|---|---|
| Lacivert tasarım, ana sayfa, blog, SSS | `src/styles/theme.css`, `src/site/` |
| 4 dil, karışmasız, tekil anlatım (tarama temiz) | `src/translations.ts`, `src/site/i18n/` |
| Ülkeye göre dil (Almanya → Almanca vb.); ülke artık daha önce seçilen dilden önce gelir (2026-11-18, sahibin kuralı) | `src/lib/routes.ts` |
| Kaydırma ağırlığı, dikişsiz bölüm geçişleri | `src/lib/smoothScroll.ts`, `theme.css` |
| Paket sayfaları (2026-11-19): `/tr/paketler/<crm|website|booking|assistant|invoices|qr>` 4 dil, kaydırınca kutudan kutuya kablo çizilen, bağlanınca yanan, sonda ışık halkası + kıvılcımlı sonuç kartı (`PackagePage.tsx`, metinler `i18n/packages.ts`); ana sayfa kartları buraya gidiyor; sayfa değişince Lenis de sıfırlanıyor (en alttan açılma hatası) | `src/site/pages/PackagePage.tsx` |
| Tasarruf hesaplayıcısı (kompakt, kendi sektörü, imza, isteğe bağlı e-posta) | `src/site/RoiCalculator.tsx` |
| Özel 404 sayfası; altbilgide yalnızca "© yıl Chioutworks" (konum ve telif cümlesi sahibin isteğiyle kaldırıldı, 2026-11-17) | `src/site/pages/NotFound.tsx`, `SiteFooter.tsx` |
| Yazılı sohbet asistanı (2026-11-19 yenilendi: Sohbet/SSS/İletişim sekmeleri, dönen 3D parçacık küresi `ChatOrb.tsx`, karşılama + 4 hızlı soru, model karşılaması yok, açılış/gönderme/cevap sesleri `chatSounds.ts` + sessiz düğmesi, tek butonlu onay, sohbet hafızası, Groq + sessiz Google yedeği, sağlayıcı gizliliği) | `src/components/AIAssistant.tsx` |
| Yapay zekâ yasası (AI Act) bildirimi (asistan + gizlilik politikası) | `src/site/i18n/voice.ts`, `legalTranslations.ts` |
| İletişim formu, kaynak etiketleri, elle kişi ekleme | `server/index.ts`, admin |
| Analiz formu (12 sayfa; seçenekler: web sitesi, otomasyon, kendine özel CRM, yapay zekâ asistanı; sadece otomasyon veya sadece CRM seçen web sitesi sorularını görmez; CRM seçene ayrı CRM sayfası; "Hayaliniz", açıklamalar, yasal metin sorusu, Telegram sorusu, büyük ek sistemlerde yıldızlı fiyat uyarısı, ilerleme motivasyonu (sayfa sonu şeridi, "Projeniz şekilleniyor" kartı, kilometre taşları, yenilemede kaldığı sayfaya dönüş), her dile çeviri, teslimden sonra düzenleme) | `server/intake.ts`, `src/data/intakeHelp.ts`, `IntakePage.tsx` |
| Yapay zekâ analizi | `server/analyze.ts` |
| Teklif sistemi (planlama, link, mesaj, kabul, ödeme alındı, terim sözlüğü, KDV notu) | `server/offers.ts`, `OffersView.tsx`, `OfferPage.tsx` |
| Admin paneli (giriş, talepler, formlar, teklifler, görüşmeler, takvim) | `src/components/admin/` |
| Gerçek ziyaretçi analizi (çerezsiz, bot ayıklamalı) | `server/analytics.ts`, `AnalyticsView.tsx` |
| Çerez onayı (banner, ayarlar, anonim kanıt) | `CookieConsent.tsx`, `src/lib/consent.ts` |
| Gizlilik politikası (Vercel+Supabase Frankfurt, çerezler, hesaplayıcı e-postası, yapay zekâ) | `src/data/legalTranslations.ts` |
| Barındırma açıklaması, "proje bazlı fiyat" | Docs |
| Güvenlik 1. aşama: gizli anahtarlar, `.gitignore`, paket açıkları (13 → 0) | `.gitignore`, `package-lock.json` |
| Admin'e başka siteden işlem yaptırma koruması (CSRF), hız sınırları | `server/index.ts` |
| Telefondan yerel siteyi açma (aynı Wi-Fi: `http://<bilgisayar-ip>:3000`, sadece geliştirmede) | `vite.config.ts`, `server/index.ts` |
| Obsidian otomatik aktarım, tanıtım klasörü, kod haritası | `scripts/obsidian-sync.mjs`, `tanitim/` |

## B. Bitti ama bir şey bekliyor (küçük eksik / yayında kontrol)
| Parça | Ne eksik / ne yapılacak | Kim |
|---|---|---|
| Açık mod (lialive yapısı, kendi lacivert paletimiz; üst çubukta güneş/ay düğmesi; seçim tarayıcıda hatırlanır, koyu varsayılan; özellik kartları koyu kalır; admin, canlı demolar, analiz formu ve teklif sayfaları koyu kalır; gizlilik politikasında belirtildi) | Telefonunda ve bilgisayarında açıp bakman | Sen |
| Canlı proje sayfası (ilk ödemeden sonra otomatik açılır; 5 adımlı ilerleme, test sitesi linki + ekran görüntüleri, iki yönlü mesaj, görsel/PDF/ZIP yükleme (25 MB, türü içeriğe bakarak kontrol), değişiklik istekleri; admin "Projeler" sekmesi; 4 dil) + teklifte "Ödeme linki gönder" ve Stripe yokken TEST ödemesi (yalnızca geliştirme ortamında) | Supabase'e taşınırken dosyalar Supabase Storage'a (Vercel 4,5 MB sınırı yüzünden doğrudan yükleme); e-posta bildirimleri alan adı doğrulanınca | Ben |
| Admin renkleri (talep kaynağına göre renk: form, sesli asistan, sohbet, hesaplayıcı…; teklifte ödendi yeşil, sorun kırmızı) + görüşme süresi | Senin bakman | Sen |
| Sesli asistan | Gerçek mikrofonla 4 dilde test | Sen |
| Mobil uyum (280 pikselden yatay telefona kadar; yana taşma yok; telefonda kaydırma telefonun kendi akıcı kaydırması (lialive gibi); masaüstündeki kaydırma animasyonları telefonda da açık ama bulanıklıksız; "Chioutworks ile" şeridi telefonda sağdan sola akıyor; çark ve kartlar ekrana göre ölçekli; 44 piksel dokunma alanları; iPhone'da form alanı yakınlaştırması yok; ölçüm aracı `node scripts/mobile-check.mjs`) | Gerçek telefonlarda (iPhone + Android) bakış; takılan yer varsa söylemen | Sen |
| Stripe ödeme altyapısı (kurulum ücreti/ön ödeme tek sefer + 2 ay sonra otomatik aylık abonelik, kalan tutar linki, müşteri ödeme sayfası, Stripe bildirimleri, admin'de durum; paket yok, doğrudan bağlantı) | Stripe hesabı + test anahtarı (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_URL`); aktif etmeden önce gizlilik politikasına Stripe eklenecek; faturada §19 notu Stripe panelinden | Sen + ben |
| Form sonrası tıklanabilir demo (cevaplara göre web sitesi, CRM ve/veya otomasyon sekmeleri; çalışan menü, randevu, teklif formu, ödeme, müşteri hesabı, asistan, Telegram/WhatsApp bildirim örneği; CRM'de aşama değiştirme, müşteri ve not ekleme; otomasyonda adım adım deneme; en üstte "bu yalnızca bir demo" uyarısı; admin'de de görünür) | Tarayıcıda deneyip beğenip beğenmediğini söylemen | Sen |
| Proje sayfası 18 dil, ülkeden otomatik dil, sahibin yazdıkları müşterinin diline çevrilir, sadece sahip siler | Ülke tespiti yalnızca yayında çalışır; yayında kontrol | Ben, yayında |
| Sözleşme öncesi referans/tanıtım izni (evet ise sözleşmeye madde) | Avukat kontrolü (sözleşmeyle birlikte) | Sen |
| "Tarzımı seç" sayfası (8 tarz kartı + örnek site; formdan ve sesli görüşmeden link) | Deneme: beğenmezsen kaldırılır; sesliden gelen tarz teklif planlayıcıya henüz bağlı değil | Sen bak |
| Canlı favicon: sitedeki CW işareti, açık/koyu moda göre anında renk değiştirir (koyu: lacivert zemin + beyaz/açık mavi; açık: açık zemin + lacivert/mavi); renkler tema değişkenlerinden; admin, demolar, formlar hep koyu (2026-11-18) | Tarayıcı sekmesinde bakman. Ana ekrana eklenen simge (apple-touch-icon) eski haliyle duruyor | Sen |
| Ortak sayfaları (2026-11-18/19): genel sayfa `/tr/araclar` + her ortak için ayrı sayfa (Hostinger, N26, Wise), 4 dil; marka renkli kapsüller; 3D sahne, eğilen kartlar, kaydırınca beliren bölümler; referans linki tarayıcıya hiç gitmez (`server/affiliates.ts`, `/api/go/<id>`), çerezsiz tıklama sayımı admin "Ziyaret analizi" altında; "Reklam" notu; gizlilik 3a paragrafı; site haritası 105 adres | Metinler taslak: sahip kontrol edecek (Hostinger AB veri merkezi, N26 Spaces ve iş hesabı kimlere, Wise yerel hesap); yayında Hostinger yönlendirmesi kontrol | Sen |
| Hostinger ve N26 referans linkleri + resmi logolar (tek renk; N26 2026-11-18 eklendi, logo n26.com üst kısmından) | Renkli (mor) logo istenirse kural esnetilmeli | Senin kararın |
| Yapay zekâ onay ekranı yenilendi (2026-11-19): sağlayıcı adı yok, "kabul ederseniz / etmezseniz", zorunlu/isteğe bağlı rozetli kutucuklar, sesli ve yazılı için ayrı onay, Groq yedeği isteğe bağlı, "Ayrıntılar" linki gizlilikte doğru bölüme kayıyor; gizlilik 8. bölüm 4 dilde güncellendi | Avukat kontrolü; gerçek mikrofonla deneme | Sen |
| Sesli asistan: tek ses, yavaş konuşma, isim+şehir toplama, kötüye kullanım sınırı (saatte 3, günde 5) | Gerçek mikrofonla test | Sen |
| Impressum | E-posta adresi girilecek (yayından önce şart) | Sen |
| Partner/affiliate logo yörüngesi | Linkler ve orijinal logolar | Sen |
| Güvenlik başlıkları (`vercel.json`) | Yayında test edilecek (securityheaders.com) | Ben, yayında |
| Bülten altyapısı | Hazır, sitede kapalı; açmak istersen kutucuk + onay e-postası eklenir | İstersen |
| Eski tarayıcı içi istatistik | Artık gereksiz; kaldırılsın mı? | Senin kararın |
| SEO / yapay zekâ aramalarında görünürlük (GEO) | Temel hazır (başlık/açıklama 4 dil, hreflang, canonical, robots.txt, sitemap.xml 89 adres, llms.txt, yapısal veri, gizli sayfalara noindex). **Yayından sonra yapılacak (sahibin kararı, 2026-11-15):** 1) ön render (hazır HTML, GEO için en önemlisi), 2) paylaşım görseli 3,4 MB → 1200×630 / 300 KB altı, 3) paylaşım bilgileri sayfa başına ve kendi dilinde, 4) site haritası otomatik + blog yazıları, 5) hizmet/SSS/blog için ek yapısal veri. Açık karar: ana sayfa açıklamasındaki kişi adı kalsın mı (kural: site metninde ad yok) | Ben, yayından sonra |
| Sözleşme + e-imza (teklif kabulünden sonra; dil müşterinin ülkesine göre tek dil; firma, adres, imzalayan, işletme onayı; imzalı metnin kontrol değeri ve kanıt kaydı; müşteri ve admin yazdırıp PDF kaydedebilir; admin'de durum) | Sözleşme metni avukat kontrolünden geçmeli; imzalı sözleşme e-postası (müşteriye + sana) kodda hazır, alan adı Resend'de doğrulanınca çalışır | Avukat / ben |
| Güvenlik standardı + ilk denetim (2026-11-19): `context/GUVENLIK.md`, CLAUDE.md kuralı (her yeni entegrasyonda otomatik); 5 açık kapatıldı (admin başlık şifresi, trust proxy, özel linklerde no-referrer, sesli kayıt numaralandırma, blog HTML kaçışı); asistan sağlayıcı adını söylemiyor (talimat + filtre) | Açık: link süreleri, admin 2. faktör, Turnstile, bağımsız sızma testi (yayından önce) | Ben + sen |
| Hız sınırı ve bot koruması | Var; bekleme sırası sertleştirme ve Turnstile bot koruması eklenecek | Ben |

## C. Yapılmadı
| Parça | Yayından önce şart mı? | Not |
|---|---|---|
| Verileri Supabase'e taşıma (erişim kuralları, yedek) | **Evet, şart** | Taşınmazsa yayında veriler kaybolur |
| Hız ve erişilebilirlik (büyük paketleri bölme vb.) | Hayır, ama önemli | |
| Hata izleme, son test listesi | Hayır, ama önemli | Yayına yakın |
| Kendi sitenin yasal metinlerini eRecht24 ile güncelleme (gizlilik, Impressum, AGB; 4 dil, çeviriler kontrollü) | Hayır, ama önemli | Kendi yazdığımız metinler avukat kontrollü değil; eRecht24 alınınca |
| Kullanım koşulları (AGB) gözden geçirme | Hayır, ama önemli | Avukat incelemesinin yerini tutmaz |
| Proje tesliminde otomatik devir belgesi (servisler, hesaplar, yapı) | Hayır | Devir maddesiyle bağlantılı |
| Abonelik iptali (siteye entegre, açıklamalı; 6 ay asgari; ay sonuna kadar kullanılabilir, sonra erişim kapanır) + 30 günlük karar linki (devir/yeniden açma 65–75 €/saat + tahmini süre, ya da her şeyin hukuka uygun silinmesi; cevap yoksa silme), admin'de takip | Hayır | Ayrıntı: `context/ozellikler/sozlesme-iptal-devir.md` |
| Admin: müşteri zaman çizelgesi + tüm linklerin takibi (ne için, gönderim/bitiş, durum, tek tıkla yenile) | Hayır, ama önemli | Geri dönen müşteride karışıklık olmasın |
| Saatlik iş akışı (yapılacaklar + tahmini saat → ödeme linki → sayaç → fark → fatura) | Hayır | 65–75 €/saat |
| Telegram yönetici botu (admin olayları Telegram'a) | Hayır | Sonra; kişisel veri az, admin linkli |
| Alan adını Resend'de doğrulama (e-postaların müşterilere gidebilmesi için şart) | **Evet, şart** | Resend anahtarı çalışıyor ama hesapta alan adı yok |
| **8 fazlı yayına hazırlık planı** (sahibin metni, 2026-11-17 kaydedildi; uygulanmadı). Durum: 26 maddenin 7'si yapıldı, 14'ü kısmen, 5'i yapılmadı | Kısmen evet (Supabase, Resend DNS, güvenlik başlıkları testi şart) | Ayrıntı ve madde madde durum: `context/ozellikler/yayin-8-faz-plani.md` |
| Yayın (Vercel + Supabase + Resend, alan adı) | — | Senin onayınla, en sonda |

## Senden beklenenler
1. Impressum e-postası → `bash scripts/set-key.sh IMPRESSUM_EMAIL`
2. Affiliate linkleri ve logolar
3. Sesli asistan ve analiz formu testi
4. Eski istatistik kaldırılsın mı?
5. Hizmet listesindeki "React & Next.js / API" etiketleri sadeleşsin mi?
6. Hesaplayıcıda TR saatlik maliyet ₺250 uygun mu; sektör soruları; portföy görselleri
7. eRecht24 hesabı (Basic) + affiliate kaydı (formdaki "online avukat paketi" seçenekleri eklendi)
8. Sözleşme taslağını bir avukata kontrol ettirmek (`server/contract.ts`, 4 dil)

## Uyum kontrolü (her büyük değişiklikten sonra)
- İki `tsc` komutu hatasız · dil karışma taraması · yeni metin 4 dilde, tekil, e-posta adresi yok
- Yeni sağlayıcı/veri → gizlilik politikası aynı işlemde · yeni cihaz depolaması → çerez kategorisi
- `graphify update .` ve Obsidian aktarımı
- Ayrıntılı yayın planı: `context/CANLIYA-ALMA.md`

- 2026-11-19 · Blog okuma kalemi (BlogArticle.tsx) · Randevu sahnesi (BookingScene.tsx + i18n/bookingScene.ts) · Chat kilidi 15 dk/tarayıcı, yalnızca hakaret (server/abuse.ts) · Tekrar önleyici + doğal fiyat cevabı (server/index.ts) · Mobil mikrofon izin sırası (VoiceIntake.tsx). Yapılacak: diğer 5 paket sahnesi.
- 2026-11-19 (devam) · Kademeli sohbet koruması + yönetim kilit açma + gizlilik 8a · Hız sınırı ve günlük bütçe sigortası · Sesli asistan: gizlilik kuralı, 3 adımlı uyarı, dikkatli dinleme, yankı süzme, https test (dev:https, :3443) · Tarz sayfası: gerçekçi önizleme, 12 palet + 5 renkli kendi paleti, 11 yazı tipi çifti (kendi sunucumuzda), çıkış uyarısı · 6 paket sahnesi + kaydırma ipucu · Form: ürüne göre kısa akış (12–19 soru), uzun soru bankası kaldırıldı, form sonu önizleme kaldırıldı · Asistanlar ürüne göre soru sorar · Blog: araç adları temizlendi. Yapılacak: sohbet dil pürüzleri, mobil menü arka planı (isteğe bağlı).

Son otomatik güncelleme: 2026-11-19 (scripts/obsidian-sync.mjs)
<!-- otomatik:bitir -->
## Notlarım

(Bu başlığın altına elle yazdıklarınız korunur.)
