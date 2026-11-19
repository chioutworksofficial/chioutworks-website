# Canlıya Alma Planı ve Kontrol Listesi

> Sahibin metninin tamamı ve madde madde güncel durum: `context/ozellikler/yayin-8-faz-plani.md` (2026-11-17).
> Sahibin verdiği 8 fazlı "Production'a hazırlık" planı bu projeye uyarlanmıştır (Next.js değil: **Vite + React SPA + Express API**).
> Hedef yayın düzeni (karar 2026-11-13): **Vercel (Frankfurt) + Supabase (Frankfurt) + Resend**, alan adı Hostinger.
> Dış servislerde (Vercel, Supabase, Hostinger, GitHub, Resend) **hiçbir işlem sahibin onayı olmadan yapılmaz**; yayın en sonda, adım adım.
>
> Durum işaretleri: ✅ yapıldı · 🟡 kısmen / kontrol edilecek · ⬜ yapılacak (yerelde) · 🚀 yayın sırasında/sonrasında

## Faz 1: Kod tabanı, GitHub ve sır yönetimi
- ✅ `.gitignore` sıkılaştırıldı (2026-11-13): tüm `.env.*` (örnek hariç), sertifika/anahtar dosyaları, `.vercel/`, `settings.local.json`, tüm `data/`, log ve geçici dosyalar, Obsidian pencere durumu, tanıtım medya çıktıları. Proje henüz git deposu değil.
- ✅ Anahtarlar yalnızca sunucuda; `VITE_` değişkeni yok, istemci yalnızca `import.meta.env.DEV` okuyor. Üretim derlemesi tarandı (189 dosya): `.env` değerleri ve gsk_/AIza/re_/sk- desenleri **bulunmadı**. `.env.example` boş değerli.
- ✅ `npm audit fix` (büyük sürüm atlamadan): 13 açık (10 yüksek) → 0. Sürümler `package-lock.json` ile sabit; yayında `npm ci`. Not: npm bazı paketlerin kurulum betiklerini çalıştırmadı (esbuild, puppeteer, onnxruntime-node, protobufjs); derleme yine de çalışıyor. Gerekirse `npm install-scripts approve <paket>`.
- ⚠️ Faz 6 için not: derlemede 500 kB'den büyük paket parçaları var (kod bölme gerekecek).
- 🚀 GitHub deposu (özel), ilk commit öncesi sır taraması (git geçmişi temiz başlayacak).
- 🚀 Vercel ortam değişkenleri: Production / Preview / Development ayrımı; `.env.local` ile eşleşme.

## Faz 2: Veritabanı (Supabase) ve kimlik doğrulama güvenliği
- ⬜ `data/*.json` → Supabase taşıması: talepler, sesli görüşmeler, analiz formları, teklifler, çeviri önbelleği, onay kayıtları, takvim (Vercel'de kalıcı disk yok).
- ⬜ Tüm tablolarda RLS açık; istemci doğrudan tabloya erişmez (yalnızca sunucu, service role sunucuda).
- 🟡 Admin girişi: tek şifre + HttpOnly/Secure/SameSite=Strict çerez + giriş deneme sınırı var; yayında Secure zorunlu.
- 🚀 Supabase: Frankfurt bölgesi, günlük yedek (plan izin verirse PITR), indeksler (createdAt, token, status).
- ⬜ Proje linki aşamasında dosya yükleme gelecek: boyut sınırı 25 MB, MIME kısıtı (görsel/PDF/ZIP), özel bucket.

## Faz 3: API, sunucu ve ağ güvenliği (OWASP)
- ✅ Hız sınırları: iletişim, demo, asistan, analiz formu, teklif mesajları, çeviri, onay kaydı (express-rate-limit).
- 🟡 Vercel'de sunucusuz çalışınca bellek içi hız sınırı örnekler arasında paylaşılmaz → Upstash Redis veya Supabase tabanlı sınır değerlendirilecek.
- 🟡 Bot koruması: iletişim formunda honeypot var; Cloudflare Turnstile değerlendirilecek (gizlilik politikasına eklenmesi gerekir).
- 🟡 Girdi doğrulama: sunucuda elle temizleme/uzunluk sınırları var; şema doğrulaması (Zod) ile sıkılaştırma değerlendirilecek.
- ✅ CSRF: admin çerezi SameSite=Strict + `/api/admin` değiştiren isteklerde Origin kontrolü (yabancı kaynak 403, test edildi). İzinli kaynaklar `PUBLIC_ORIGIN` ortam değişkeninden (yayında ayarlanacak).
- ⬜ Bekleme sırası / live-heartbeat uçları sertleştirilecek (yalnızca oturum kimliği kontrol ediliyor).
- 🚀 Stripe/PayPal gelirse webhook imza doğrulaması.
- 🚀 Resend: alan adı doğrulama, SPF, DKIM, DMARC kayıtları (Hostinger DNS).

## Faz 4: HTTP güvenlik başlıkları
- ✅ `vercel.json` hazır: CSP (satır içi önyükleyici betiği için sha256 özeti, Gemini Live websocket, wasm), HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy (mikrofon yalnızca kendi site), COOP. API'de de temel başlıklar + `x-powered-by` kapalı. 🚀 Yayında test edilecek: index.html'deki satır içi betik değişirse CSP özeti yeniden hesaplanmalı.
- ⬜ CORS: API yalnızca kendi alan adından.
- 🚀 securityheaders.com ile A+ kontrolü.

## Faz 5: Teknik SEO ve GEO (yapay zekâ arama motorları)
- 🟡 Sayfa başına başlık/açıklama (`usePageMeta`, `pageMeta.ts`) var; canonical ve hreflang (4 dil) kontrol edilecek.
- ⬜ `sitemap.xml` (4 dil, hreflang), `robots.txt`, `llms.txt`, `llms-full.txt` (bir kısmı 2026-11-11'de başlatıldı, kontrol edilecek).
- 🟡 JSON-LD: index.html'de var; Organization/LocalBusiness, WebSite, FAQPage, BreadcrumbList, Article (blog) tamamlanacak.
- ⚠️ SPA olduğu için arama motorları ilk HTML'de içerik görmez → ön render (prerender) değerlendirilecek.
- 🚀 Google Search Console + Bing Webmaster: alan adı doğrulama, site haritası gönderimi.

## Faz 6: Performans ve erişilebilirlik
- ⬜ Lighthouse/PageSpeed ölçümü (yerelde `npm run build && npm run preview`), görseller WebP/AVIF, büyük paketlerin bölünmesi.
- ✅ Özel 404 sayfası (4 dil, noindex). Sunucu hata sayfası: yayında Vercel tarafı.
- 🟡 Erişilebilirlik: aria etiketleri, klavye, kontrast, `prefers-reduced-motion` büyük ölçüde var; tam tur yapılacak.
- ⬜ Mobil uyumluluk turu (en son).

## Faz 7: Yasal uyumluluk
- ✅ Çerez onayı (2026-11-13): banner + ayarlar, zorunlu her zaman açık, istatistik/konfor onaysız çalışmaz, anonim onay kaydı sunucuda, altbilgide "Çerez ayarları", gizlilik politikasında 3a bölümü.
- ✅ Impressum (§5 DDG, §18 MStV, §14 GewO, §19 UStG + USt-IdNr.), altbilgide doğrudan link.
- 🟡 `IMPRESSUM_EMAIL` sahibin girmesi gerekiyor (yayından önce şart).
- 🟡 Gizlilik politikası: Vercel + Supabase (Frankfurt) eklendi; yayın sonrası gerçekten kullanılan sağlayıcılarla son kez karşılaştırılacak (Resend, Groq, Gemini).
- ⬜ Bülten açılınca: sitede işaretsiz onay kutusu, Resend ile onay e-postası (`sendConfirm`), gizlilik politikasına bülten bölümü, her kampanya e-postasında `unsubscribeHeaders()` + abonelikten çıkma linki, gönderimden önce `canSend()` (altyapı: `server/newsletter.ts`).
- ✅ AI Act: asistan onay ekranı "insan değil, YZ" + "cevaplar YZ üretimi, hata içerebilir (Madde 50)", açıkken "YZ asistanı" etiketi; gizlilik politikası 7. bölümde YZ şeffaflığı + otomatik karar yok (GDPR 22).
- ⚠️ Hukuki metinler avukat incelemesinin yerini tutmaz.

## Faz 8: İzleme, loglama ve canlıya alma testleri
- ⬜ Hata izleme (ör. Sentry, AB bölgesi) — eklenirse gizlilik politikasına yazılır; loglarda PII maskeleme (e-posta, IP, telefon).
- ✅ Kendi çerezsiz istatistiğimiz (`server/analytics.ts`): IP saklanmaz, günlük değişen anahtar, bot ayıklama; admin "Ziyaret analizi" gerçek veri. Gizlilik politikası 3a. 🚀 Yayında Supabase'e taşınacak (şu an `data/analytics/*.jsonl`).
- ⬜ Google Analytics / Ads / Meta eklenirse: çerez banner'ına "Pazarlama" kategorisi + Consent Mode v2, onaysız yüklenmez; gizlilik politikasına sağlayıcılar.
- ⬜ Eski yerel (tarayıcıda) istatistik ve "İstatistik" çerez kategorisi artık gereksiz; kaldırılabilir (sahibe soruldu).
- 🚀 Son kontrol listesi (aşağıda).

## Canlıya aldıktan sonra yapılacak/bakılacaklar
1. Vercel'de fonksiyon bölgesi `fra1`, Supabase projesi Frankfurt.
2. Alan adı DNS (Hostinger) → Vercel; HTTPS sertifikası; `www` → kök yönlendirme.
3. Resend alan adı doğrulama; `DEMO_EMAIL_FROM`, `QUOTE_NOTIFY_EMAIL`, kurumsal `IMPRESSUM_EMAIL`.
4. Canonical / OG adresleri gerçek alan adıyla (index.html'de chioutworks.com).
5. Admin şifresi yeniden üretilsin; Secure çerez yayında açık mı kontrol.
6. Çerez banner'ı yeni bir tarayıcıda: ilk ziyarette görünüyor mu, "Sadece gerekli" sonrası istatistik kaydı yok mu, onay kaydı Supabase'e düşüyor mu.
7. Sesli asistan (Gemini Live) ve yazılı sohbet canlıda; mikrofon izni (Permissions-Policy) çalışıyor mu.
8. Formlar uçtan uca: iletişim → admin, analiz formu → YZ analizi, teklif linki → kabul/mesaj.
9. securityheaders.com, PageSpeed, Search Console, site haritası gönderimi.
10. Gizlilik politikası ve Impressum'daki hosting bilgisi gerçek durumla aynı mı.
11. Yedekleme: Supabase günlük yedek açık; ilk yedekten geri dönüş denemesi.


## Yayından sonra: SEO ve GEO (sahibin kararı, 2026-11-15)
1. Ön render (her sayfa, her dilde hazır HTML) — yapay zekâ botları için en önemli adım
2. Paylaşım görseli: 1200×630, 300 KB altı (şu an 3,4 MB)
3. Paylaşım başlığı/açıklaması sayfa başına ve kendi dilinde
4. Site haritası derlemede otomatik üretilsin, blog yazıları da girsin; alan adı kesinleşince adresler güncellensin
5. Hizmetler, SSS ve blog için ek yapısal veri
6. Karar bekliyor: ana sayfa açıklamasındaki kişi adı (site metni kuralı: ad yok)

## Güncel durum özeti (2026-11-20)
- Yapıldı: GitHub deposu (şu an herkese açık, anahtar kontrolü + push koruması), Vercel ortam değişkenleri (gizli), Supabase Frankfurt + RLS (dışarıya kapalı), özel dosya kutusu (25 MB, tür kontrolü), Vercel fonksiyonları fra1, günlük bakım görevi, kötüye kullanım sınırları Supabase'te (örnekler arası ortak), sitemap/robots/llms, loglarda kişisel veri yok.
- Kısmen: hız sınırının bir kısmı hâlâ bellek içi; Turnstile yok; Zod yok; Supabase yedek ayarı (ücretsiz planda sınırlı) kontrol edilmedi.
- Yapılmadı: alan adı + DNS, Resend alan adı doğrulama, CORS sıkılaştırma, securityheaders/PageSpeed testi, kod bölme, ön render, hata izleme, Search Console, eski tarayıcı istatistiğinin kaldırılması (karar), Impressum e-postası, avukat kontrolü.
