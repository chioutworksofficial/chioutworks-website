# Proje Kararları

| Tarih | Karar | Gerekçe | Durum | Etkilediği alan |
|---|---|---|---|---|
| 2026-11-12 | Lacivert palet ve lia tarzı ana sayfa/blog/SSS | Daha güvenilir, sade görünüm; eski krem/lime tema bırakıldı | aktif | `src/styles/theme.css`, `src/site/` |
| 2026-11-12 | Dört dil saf kalır (tr/en/de/el), asla karışmaz | Güven ve kalite; her sayfa ve asistan yanıtı seçili dilde | aktif | `src/site/i18n`, asistan, guard'lar |
| 2026-11-12 | Sahip tek başına çalışır: site metni tekil, asistan tekil; "Chousein" adı ve "biz" kullanılmaz | Dürüstlük, tek kişilik işletme gerçeği | aktif | Tüm metinler, asistan |
| 2026-11-12 | Toplantı, SMS ve sahte yorum yok | Yazılı talep odaklı süreç, dürüstlük | aktif | İçerik, huni |
| 2026-11-12 | Sitede e-posta adresi gösterilmez | Spam ve talebin forma yönlendirilmesi | aktif | Tüm sayfalar, dokümanlar |
| 2026-11-12 | Gemini Live tek anahtar + kuyruk + Groq yedeği | Maliyet kontrolü, kesintisiz hizmet | aktif | `server/geminiLive.ts` |
| 2026-11-12 | Onay ve gizlilik şeffaflığı: ABD'li sağlayıcılar gizlilik politikasında adıyla anılır | Hukuki dürüstlük | aktif | `src/pages/PrivacyPolicy.tsx`, `legalTranslations.ts` |
| 2026-11-12 | Ücretli servis yok; yalnızca ileride Gemini ücretli katman ve Stripe | Bütçe sınırı | aktif | Altyapı |
| 2026-11-12 | Intake portalı 1. faz bitti; 2. faz ve Stripe taksit sonra | Önce çekirdek | aktif | `server/intake.ts`, `src/data/intake*` |
| 2026-11-12 | Mobil geçiş en son yapılır | Masaüstü akış önce oturmalı | aktif | Tüm arayüz |
| 2026-11-12 | `public/assets-ai` silindi; `npm run ai-assets` ile geri yüklenir | Boyut; yerelde barındırılan model dosyaları | aktif | `public/`, `scripts/` |
| 2026-11-13 | Proje belleği `context/`, ajanlar `agents/`, eski belgeler `_yedek/` | Düzen; kalıcı silme yok | aktif | Kök klasör |
| 2026-11-13 | Proje Obsidian kasası `obsidian/Chioutworks Official/` açıldı (LinkedIn kasası düzeninde renkli klasörler); Workruno ve LinkedIn kasalarına dokunulmaz | Sahibin isteği | aktif | `obsidian/` |
| 2026-11-13 | Müşteri süreci ayrı linklerle: analiz formu → (admin'e özel YZ planlama) → teklif linki → proje linki; ödeme Stripe'a kadar elle işaretlenir | Sahip fiyatı, cevapları analiz edip kendisi planlamak istiyor | aktif | `server/offers.ts`, `src/site/pages/OfferPage.tsx`, `src/components/admin/OffersView.tsx` |
| 2026-11-13 | Otomasyon varsayılanı özel kod (Hostinger VPS'te kendi açık kaynak modeli 24 saat ya da Modal); Make/Zapier/n8n varsayılan değil, n8n yalnızca müşteri görsel araç isterse | Sahibin tercihi, maliyet ve kontrol | aktif | `server/analyze.ts`, `server/offers.ts` |
| 2026-11-13 | Tanıtım/reklam çalışma alanı `tanitim/` (Remotion, ElevenLabs, Blender, CapCut) | Siteyi tanıtan videolar | aktif | `tanitim/` |
| 2026-11-13 | Varsayılan dil ülkeye göre (cihazın saat dilimi, dış servis yok): DE/AT/CH/LI/LU→de, GR/CY→el, TR/AZ/KKTC→tr, diğerleri tarayıcı dili ya da en; dil yalnızca ziyaretçi kendisi değiştirince hatırlanır | Sahibin isteği; gizlilik kuralı (konum servisi yok) | aktif | `src/lib/routes.ts`, `src/hooks/useLang.ts` |
| 2026-11-13 | Impressum: adres Waldstraße 124E, Kleinunternehmer §19 UStG + USt-IdNr., §14 GewO, DDG/MStV; e-posta yalnızca Impressum'da, `.env` IMPRESSUM_EMAIL'den sunucuyla gelir (kodda e-posta yok); altbilgide doğrudan Impressum linki | §5 DDG zorunluluğu; sahibin onayı | aktif | `src/pages/Docs.tsx`, `server/index.ts` |
| 2026-11-13 | Tekliflerde KDV yok (§19 UStG notu); analiz formunda yasal metinleri kimin hazırlayacağı sorulur (kendi/avukat, YZ şablonu = avukat incelemesi değil, hukukçu ücreti teklife); AI Act şeffaflığı analiz/teklif/kaynaklara eklendi | Sahibin isteği | aktif | `src/data/intakeHelp.ts`, `server/offers.ts`, `server/analyze.ts` |
| 2026-11-13 | Yayın: Vercel (fonksiyon bölgesi Frankfurt) + Supabase (Frankfurt, eu-central-1); alan adı Hostinger'dan. Yayından önce `data/*.json` verileri Supabase'e taşınmalı (Vercel'de kalıcı disk yok). Metinlerde dürüst ifade: "ABD'li sağlayıcılar, sunucu ve veritabanı Frankfurt'ta" | Sahibin tercihi | aktif | `server/`, gizlilik politikası, Impressum |
| 2026-11-14 | Form sonrası site ön izlemesi: YZ yalnızca içerik (JSON) yazar, kod yazmaz; görünüm kendi şablonumuzla; "bağlayıcı değil, birlikte belirlenecek" notu | Güvenlik, tutarlı kalite, doğru beklenti, AI Act | aktif | `server/preview.ts`, `src/site/IntakePreview.tsx` |
| 2026-11-14 | Yasal metinler için tercih eRecht24: kendi site Basic, müşteriler artınca Ajans/Business (100 proje, ihtarname koruması), affiliate %25; mağazalarda IT-Recht Kanzlei, TR müşterilerde KVKK için yerel avukat, GR müşterilerde İngilizce metnin kontrollü Yunanca çevirisi + "esas alınan dil" notu (lisans izni kontrol edilir) | Ajans modeline uygun, maliyet, güncellik | aktif | yasal metinler, teklifler |
| 2026-11-14 | Aylık bakım: 6 ay asgari süre, sonra aylık iptal (dönem sonunda, ~30 gün bildirim); iptal Stripe müşteri portalından, admin'e bildirim; tutundurma: temel bakım planı veya 1–3 ay ara | Sahibin kararı | aktif | sözleşme, Stripe |
| 2026-11-14 | Altyapı hesapları varsayılan müşterinin adına (iptalde site çalışır); müşteri isterse sahibin hesabında: aylık ücret altyapıyı kapsar + devir maddesi (30 gün, kod/veritabanı/alan adı) + veri işleme sözleşmesi (AVV), sonra silme | Risk ve GDPR | aktif (2026-11-14: sahip yükün kendisinde olmasını istemiyor) | sözleşme taslağı |
| 2026-11-14 | Devir maddesi: ücretsiz temel devir = müşterinin hesaplarına erişimin teslimi/hesap devri + kod + otomatik hazırlanan devir belgesi; kod anlatma, başka sunucuya taşıma, veri aktarma, toplantı = saat ücretiyle. Veriler müşterinin hesabında, müşterinin sorumluluğunda | Sahibin isteği: devirde zahmet olmasın | aktif | sözleşme taslağı, proje teslimi |
| 2026-11-14 | Sözleşme dili müşterinin ülkesine göre tek dil (DE/TR/GR/diğer EN); iptal sonrası ay sonuna kadar kullanım, sonra erişim kapanır (sahibin çalıştırdığı parçalar); 30 günlük karar linki (devir/yeniden açma 65–75 €/saat, ya da tam silme; cevapsızsa silme); Telegram yönetici botu ileride | Sahibin talimatı | değiştirildi (2026-11-17: dil artık teklifin dili) | `context/ozellikler/sozlesme-iptal-devir.md` |
| 2026-11-14 | Sözleşme e-imzası: basit elektronik imza (adın yazılması + işletme onayı + kabul kutusu), imzalı düz metnin SHA-256 kontrol değeri, IP'nin yalnızca özeti, tarayıcı bilgisi ve zaman kaydı; sözleşme sayfası tamamen sözleşmenin dilinde (teklifin geri kalanı teklif dilinde kalabilir) | Sahibin talimatı ("sözleşme + e-imza") | aktif (metin avukat kontrolü bekliyor) | `server/contract.ts`, `src/site/ContractStep.tsx` |
| 2026-11-14 | Form sonrası demo tıklanabilir ve isteğe göre: web sitesi, CRM, otomasyon sekmeleri; hangi özelliklerin görüneceği cevaplardan gelir (yapay zekâ tahmin etmez); en üstte "yalnızca demo, gerçek proje birlikte adım adım çok daha modern olacak" uyarısı. Formda CRM ayrı seçenek | Sahibin talimatı | aktif | `src/site/IntakePreview.tsx`, `server/preview.ts` |
| 2026-11-15 | Mobil: telefon görünümü masaüstüyle aynı yapı ve animasyonlar, ekrana göre ölçekli; telefona özel değişiklikler yalnızca telefon ekranı kurallarında (masaüstüne dokunulmaz); telefonda yerel kaydırma ve bulanıklıksız efekt (performans, lialive gibi) | Sahibin talimatı | aktif | `src/styles/theme.css` (telefon blokları) |
| 2026-11-15 | Stripe şimdilik yalnızca altyapı; anahtar girilince test modunda başlar | Sahibin talimatı | aktif | `server/billing.ts` |
| 2026-11-15 | Hiçbir sayfada bölümler arasında görünür çizgi/kesik olmaz: dekoratif ışık/halka katmanları `deco-fade` ile kenarlarda solar; yeni bölüm eklerken aynı kural | Sahibin talimatı | aktif | `src/styles/theme.css` (.deco-fade) |
| 2026-11-15 | Açık mod: yalnızca tanıtım sitesi; renkler `html[data-mode='light']` altında temel renk değişkenlerinin açık karşılıkları (mor/pembe yok); ürün kartları `.cw-keep-dark` ile koyu; admin/demo/form/teklif `data-mode-lock` ile koyu; tercih `cw-mode` (localStorage), boyamadan önce `public/theme-init.js` ile uygulanır (CSP değişmedi); yeni bileşen yazarken renk her zaman değişkenden | Sahibin talimatı | aktif | `src/styles/theme.css`, `src/site/ModeToggle.tsx` |
| 2026-11-17 | Faturalar Stripe Invoicing ile kesilir (sıra numaralı, kesildikten sonra değiştirilemez, düzeltme yalnızca iptal/düzeltme faturası); ayrı fatura sistemi yok; Stripe'ta Chioutworks markası/logosu; sözleşmede 4 dilde yazılı. GoBD arşivleme ve E-Rechnung muafiyeti vergi danışmanına teyit ettirilecek | Sahibin talimatı | aktif | `server/contract.ts` |
| 2026-11-17 | Canlı proje sayfası ilk ödemeyle otomatik açılır; Stripe yokken yalnızca geliştirmede TEST ödemesi (yayında kapalı: `testPayOn()`) | Sahibin talimatı | aktif | `server/projects.ts`, `server/billing.ts` |
| 2026-11-17 | Müşteriye giden her şey (teklif, sözleşme, ödeme, fatura, proje sayfası, e-postalar) TEK dilde: teklifin dili. Ülke yalnızca öneri; admin'de ülke + dil bandı, uyuşmazlıkta uyarı; sahip Türkçe yazıp "Müşterinin diline çevir" kullanır; metinler müşteri dilinde değilse link etkinleşmez (`langMismatch`). Sözleşme imzalanınca ödeme otomatik açılır; ödeme sonrası fatura (Stripe; testte "TEST" faturası) ve proje linki otomatik | Sahibin talimatı | aktif | `server/offers.ts`, `server/contract.ts`, `OffersView.tsx` |
| 2026-11-17 | Fiyat planları: 1) Basit web sitesi (otomasyon/panel yok, genelde ≤5 sayfa) kurulum ≤1.000 € (panelsiz 600–800 €), aylık sabit 45–60 €, canlı proje sayfası YOK; 2) Web sitesi + admin paneli / CRM / giriş alanı: 1.000 € üstü, canlı proje sayfası var; 3) Otomasyon: cevaplara göre, canlı proje sayfası var. Sadece otomasyon / sadece CRM / sadece uygulama da sunulur | Sahibin talimatı | aktif | `server/offers.ts` (PLAN_SYSTEM, `portalOn`) |
| 2026-11-17 | Proje sayfasında müşteri dilini kendi seçer; sahip Türkçe yazar, müşteri kendi dilinde görür (otomatik çeviri). Silme yalnızca sahipte; müşteri yalnızca mesaj ve logo/fotoğraf (5 MB, tek tek) ekler | Sahibin talimatı | aktif | `server/projects.ts` |
| 2026-11-17 | Canlı proje sayfası 18 dilde; ilk açılışta ülkeye göre otomatik, müşteri değiştirebilir ve seçim proje bitene kadar kalır. Yeni dış servis yok (ülke barındırma başlığından, çeviri mevcut Groq ile) | Sahibin talimatı | aktif | `server/projects.ts` |
| 2026-11-17 | Referans izni sözleşmeden önce sorulur; yalnızca "evet"te sözleşmeye madde girer. Gösterilen: işletme adı, logo, ekran görüntüleri, kısa açıklama, link. Asla: iletişim bilgisi, fiyat, müşteri verisi. Gönüllü, fiyatı etkilemez, yazılı geri alınır (14 gün içinde kaldırma). Müşterinin e-postası bu izinle pazarlamaya kullanılmaz | Sahibin talimatı + KVKK/DSGVO | aktif | `server/contract.ts`, `src/site/ContractStep.tsx` |

## Kullanım kuralları
- Yeni kararı tarih ve kısa gerekçeyle ekle.
- Değişen kararı silme; durumunu `değiştirildi` yap, yenisini ayrı satır olarak ekle.

## 2026-11-18: Ortak (affiliate) sayfaları
- Yapı: genel "Kullandığım araçlar" sayfası + her ortak için ayrı detay sayfası (demolar gibi); halkadaki logo detay sayfasına gider.
- Referans linki sayfada görünmez: buton kendi sitemizdeki yönlendirme adresine gider, sunucu ortağa yönlendirir.
- Almanya kuralı gereği her ortak sayfasında ve butonun yanında "Anzeige / Referans linki" notu.
- Renk istisnası: ortak kapsülleri markanın gerçek renkleriyle (Hostinger mor dahil). Mor/pembe yasağı sitenin geri kalanında aynen geçerli.
- Metinler: Claude dürüst taslak yazar (4 dil), sahip düzeltir; sahte yorum ve abartı yok.
- Tıklama sayımı: çerezsiz, ortağa ve güne göre, admin'de. Reklam pikselleri (Meta/GA4) ileride yalnızca onayla, ortak tıklaması dönüşüm olayı olarak.

## 2026-11-19: Yapay zekâ asistanı onay ekranı
- Onay ekranında sağlayıcı adı yok (Google/Groq yalnızca gizlilik politikası 8. bölümde, proje kuralı gereği orada adıyla). Kişi adı yok.
- Sesli: zorunlu = "yapay zekâ ile konuştuğumu biliyorum" (AI Act m. 50) + işleme ve AB dışına aktarım onayı; isteğe bağlı = hat koparsa Groq ile yazılı yedek. İşaretsizse görüşme biter, Groq'a hiçbir şey gitmez (özet kartında da Groq yedeği kapalı: `groqOk`).
- Yazılı sohbet ayrı onay ister (Groq ana sağlayıcı).
- Google: kendi sayfasında AB–ABD Veri Gizliliği Çerçevesi'ne katıldığını belirtiyor → GDPR m. 45; korkutucu "ABD'de koruma düşük" cümlesi kaldırıldı. Groq için DPF doğrulanamadı → açık rıza (m. 49(1)(a)). KVKK için açık rıza (m. 9).
- Onay sürümü `assistant-2026-11d` (istemci + sunucu). Avukat kontrolü önerilir.

## 2026-11-19: Sohbet ve sağlayıcı adları
- Yazılı sohbet Google'a (Gemini, DPF) geçer, onay kutucuğu kalkar; giriş kutusunun üstünde tek satır bilgi notu. Google yanıt veremezse Groq'a gönderilmez, form önerilir.
- Sohbet aynı sekmede her zaman kalır (gerekli), "konfor" onayı varsa 7 gün (localStorage); "Sohbeti sil" düğmesi.
- Gizlilik politikasında sağlayıcı adları yok: tür + konum + güvence. Adlar yalnızca GDPR m. 15 başvurusunda. CLAUDE.md kuralı güncellendi.
- Yazılı sohbette mikrofon simgesi yok; "Sesli devam etmek ister misiniz?" bağlantısı sesli pencereyi açar.
- Not: Gemini API'nin AB kullanıcılarına hizmet için ücretli katman gerektirdiği hatırlanıyor (doğrulanmadı) — sahip faturalandırmayı kontrol edecek.

## 2026-11-19: Paket süreleri
- "Teslim" yerine "Tipik süre"; gerçekçi aralıklar (tek kişilik işletme, iş yoğunluğu payı): CRM 6–12, kurumsal site 3–6, online randevu 4–8, yapay zekâ asistanı 4–8, teklif/fatura otomasyonu 3–6, QR menü 1–3 hafta. Kartların altında not: kesin takvim ücretsiz değerlendirmede, kapsam ve iş yoğunluğuna göre.
- 2026-11-19 · Veri deposu Supabase (proje Chioutworks, Frankfurt, ayrı "Chiout Works" hesabı). Yalnızca sunucu gizli anahtarla erişir; tarayıcıdan doğrudan erişim yok, Supabase Auth yok. Kayıtlar JSON olarak saklanır (davranış JSON dosyalarıyla birebir aynı), geçiş adım adım ve JSON yedeğiyle.
- 2026-11-19 · Yayın akışı: değişiklik → GitHub (`chioutworksofficial/chioutworks-website`) → Vercel otomatik çeker (Chioutworks'ün ayrı Vercel hesabı, ekip `chioutworks`). Vercel'e doğrudan yayın yok; Vercel API anahtarı tutulmaz. Her iş sonunda Obsidian'a kayıt (`npm run obsidian`).

- 2026-11-20 · Supabase ücretsiz planda kalınacak (sahibin kararı); otomatik geri yüklenebilir yedek yok, yerel yedek betiği önerildi (cevap bekleniyor).

- 2026-11-20 · Admin paneli giriş şifresi (ADMIN_TOKEN) alan adı bağlandıktan sonra yenilenecek: `sh scripts/new-admin-token.sh` (sahip: "daha değil"). Kurucu adı arama motoru bilgisinden (index.html JSON-LD) kaldırılıyor (sahip onayı); ad yalnızca Impressum'da.
- 2026-11-20 · Mobil hız ve his işi sahibin isteğiyle pazartesi 2026-11-23'e ertelendi. Kurucu adı index.html'den (meta açıklama, author, JSON-LD Person, LinkedIn kişisel bağlantı, yedek metin) kaldırıldı; ad yalnızca Impressum'da.
- 2026-11-23 · Kod/sistem sahipliği: aylık hizmet sürerken sahipte (lisans); müşteri aylığı bırakırsa ya da tek seferlik işte teslimde sistem ve kod ek ücretsiz müşteriye devredilir, sonrası müşteride; ek işler saat başı 65–75 €. Veriler her zaman müşterinin. Ayrıntı: `context/rehberler/teklif-ve-sozlesme-sablonu.md` bölüm 6.
- 2026-11-23 · Sözleşme dili müşterinin ülkesine göre (DE Almanca, GR İngilizce geçerli + Yunanca çeviri, TR Türkçe, diğerleri İngilizce); 2026-11-17'deki "sözleşme teklif dilinde" kuralının yerini aldı.
- 2026-11-24 · Otonom satış motoru (n8n + Apify + Perplexity + RetellAI + WhatsApp Business) yalnızca **altyapı olarak hazır tutulacak, çalıştırılmayacak**. Öncelik: bitmeyen işleri tamamlamak. Alan adı bağlansa bile Voice Agent ve otomasyon kapalı kalır; sesli asistan (site) normal devam eder. İlk birkaç müşteri mevcut sistemle (5 giriş kapısı, yazılı huni) bulunacak; canlıya alma kararını sahip ileride verecek. Tasarım hedefi: Modül A (Apify ile işletme bulma + filtre: sitesi olmayan > "süs" site > Leads/aranmasın'da olanlar elenir), Modül B (tek dilli 1 cümlelik "makul sebep" → Admin Voice Agent kuyruğu), Modül C (kapasite kontrolü, tek arama, açılışta YZ olduğunu söyler, toplantı/fiyat yok, WhatsApp ile kendi dilinde link, sonuç Sıcak/Kararsız/Aranmasın API'ye yazılır).
