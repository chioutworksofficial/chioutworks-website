---
tür: "yol-haritası"
durum: "güncel"
proje: "chioutworks"
tarih: "2026-11-17"
tags: ["yol-haritası", "yayın", "güvenlik"]
---

<!-- otomatik:başla -->
> Kaynak: `context/ozellikler/yayin-8-faz-plani.md` (projede değiştirin; burası otomatik güncellenir)

# Yayına hazırlık: 8 fazlı plan (sahibin metni + durum)

> Kaydedildi: 2026-11-17, sahibin isteğiyle. **Henüz uygulanmadı; sırası gelince faz faz uygulanacak.**
> Uyarlanmış çalışma planı: `context/CANLIYA-ALMA.md` (aynı 8 faz, bu projeye göre).
> Not: Metin Next.js için yazılmış. Bu proje **Vite + React (tek sayfa uygulama) + Express API**; maddeler buna göre uyarlanır
> (ör. `next.config.js` → `vercel.json` + `server/index.ts`, `next/image` → kendi görsel optimizasyonu, Server Actions → Express API).

## Durum tablosu (2026-11-17)
İşaretler: ✅ yapıldı · 🟡 kısmen / yayında kontrol · ❌ yapılmadı

| Faz | Madde | Durum | Not |
|---|---|---|---|
| 1 | `.gitignore` sıkılaştırma (`.env*`, loglar, geçici dosyalar) | ✅ | `.dockerignore` yok (Docker kullanılmıyor) |
| 1 | Anahtarlar yalnızca sunucuda | ✅ | Tüm anahtarlar Express sunucusunda; tarayıcıya giden kodda gizli değişken yok |
| 1 | Git geçmişinde sızıntı kontrolü, Vercel ortam değişkenleri ayrımı | ❌ | Yayın (GitHub/Vercel) adımında |
| 1 | `npm audit`, kritik paketleri sabitleme | 🟡 | Açıklar 13 → 0; sürüm sabitleme yayından önce |
| 2 | Supabase RLS (tüm tablolar) | ❌ | Veriler hâlâ JSON dosyalarında; Supabase'e taşıma yayından önce şart |
| 2 | Auth ve oturum güvenliği | 🟡 | Admin: tek şifre, HttpOnly + SameSite=Strict çerez (yayında Secure), deneme sınırı. Müşteri hesabı yok |
| 2 | Storage: boyut, MIME, erişim kuralları | 🟡 | Form yüklemelerinde 25 MB ve dosya türü sınırı var (yerel); Supabase Storage'a taşınırken kurallar yazılacak |
| 2 | İndeksler ve otomatik yedek | ❌ | Supabase'e taşımayla birlikte |
| 3 | Hız sınırı ve bot koruması | 🟡 | Hız sınırları var (sunucu belleğinde); Turnstile ve kalıcı (Upstash vb.) sınır yok |
| 3 | Girdi doğrulama ve temizleme | 🟡 | Sunucuda elle temizleme ve sınırlar var; Zod şeması yok |
| 3 | CSRF / SSRF | ✅ | Admin'e başka siteden işlem engeli; dış adreslere kullanıcı girdisiyle istek yok |
| 3 | Webhook imza doğrulama, Resend DNS (SPF/DKIM/DMARC) | 🟡 | Stripe webhook imza doğrulaması hazır; Resend alan adı ve DNS kayıtları yok |
| 4 | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy | 🟡 | `vercel.json` içinde hazır; yayında securityheaders.com ile test |
| 4 | Sıkı CORS | ✅ | İzinli kaynak listesi (`server/index.ts`) |
| 5 | Sayfa başına başlık/açıklama/canonical/hreflang | ✅ | 4 dil |
| 5 | Sayfa başına paylaşım (OpenGraph/Twitter) bilgisi ve görseli | ❌ | Yayından sonra (sahibin kararı) |
| 5 | Dinamik sitemap, robots.txt, llms.txt, llms-full.txt | 🟡 | robots.txt ve llms.txt var; sitemap elle (89 adres); llms-full.txt yok |
| 5 | Zengin Schema.org (Organization, WebSite, FAQPage, BreadcrumbList, Article…) | 🟡 | Ana sayfada temel yapısal veri var; diğerleri yayından sonra |
| 5 | Semantik HTML, kırık link önleme | 🟡 | main/section/nav kullanılıyor; tam denetim yapılmadı |
| 5 | (Bu projeye özel) Ön render | ❌ | Yapay zekâ aramaları için en önemli adım; yayından sonra |
| 6 | Görsel/font optimizasyonu, kod bölme, gereksiz JS | 🟡 | Fontlar yerel; büyük paket parçaları var (kod bölme yapılmadı); paylaşım görseli 3,4 MB |
| 6 | Özel 404 ve 500 sayfaları | 🟡 | 404 var; 500 sayfası yok |
| 6 | Erişilebilirlik (WCAG) | 🟡 | aria etiketleri, 44 px dokunma alanları, hareket azaltma desteği; tam denetim yapılmadı |
| 7 | Çerez onayı (onaysız takip yok), gizlilik politikası, kullanım koşulları | ✅ | Metinler avukat kontrollü değil (eRecht24 planlı) |
| 8 | Hata izleme (Sentry vb.), analitik, loglarda kişisel veri maskeleme | 🟡 | Çerezsiz kendi ziyaretçi analizi var; hata izleme yok; log maskeleme denetlenmedi |
| 8 | Yayın öncesi kontrol listesi | ✅ | `context/CANLIYA-ALMA.md` |

---

## Sahibin metni (olduğu gibi)

Sen 15+ yıl deneyimli kıdemli bir Baş Yazılım Mimarı (Principal Architect), Siber Güvenlik Uzmanı ve Teknik SEO/GEO Stratejistisin. Geliştirmekte olduğum web projesini (GitHub, Supabase, Vercel, Resend ve diğer harici API'leri kullanan modern bir mimari) 0'dan %100 kusursuz, hatasız ve kurumsal standartlarda yayına (Production) hazır hale getirmek istiyorum.

Bana sadece bildiğim veya söylediğim şeyleri yapma. Profesyonel bir yazılım ajansının projeyi teslim etmeden önce uyguladığı, benim aklıma bile gelmeyecek tüm gizli güvenlik, performans, yasal uyumluluk ve arama motoru optimizasyonu (SEO + GEO) katmanlarını eksiksiz olarak projeme uygula.

PROJE BİLGİLERİM:
- Kullandığım Framework/Dil: [Örn: Next.js 14/15 App Router, TypeScript, Tailwind CSS]
- Veritabanı & Auth: Supabase
- Hosting & Deployment: Vercel
- E-posta Servisi: Resend
- Diğer API'ler / Ödeme Sistemleri: [Örn: Stripe, OpenAI, Iyzico vb. - Varsa yaz, yoksa "Yok" yaz]
- Projenin Amacı ve Hedef Kitlesi: [Kısaca projenin ne yaptığını yaz]

Lütfen aşağıdaki 8 fazın tamamını sırasıyla, hiçbir adımı atlamadan projeme uygula:

### FAZ 1: KOD TABANI, GİTHUB VE SIR (SECRET) YÖNETİMİ
1. `.gitignore` ve `.dockerignore` (varsa) dosyalarını sıkılaştır; `.env*`, log dosyaları ve geçici dosyaların repoya sızmasını %100 engelle.
2. Tüm API anahtarlarını (`SERVICE_ROLE_KEY`, `RESEND_API_KEY`, ödeme anahtarları vb.) sunucu tarafına (Server Actions / API Routes) izole et. İstemci tarafına (Client Bundle) sızabilecek en ufak bir hassas değişken kalmamasını sağla.
3. Git geçmişinde sızıntı olup olmadığını kontrol et ve Vercel Environment Variables (Production, Preview, Development) ayrımını kurgula.
4. `package.json` içindeki bağımlılıkların güvenlik açıklarını (`npm audit`) denetle ve kritik paketleri sabitle.

### FAZ 2: VERİTABANI (SUPABASE) VE AUTH GÜVENLİĞİ
1. **Row Level Security (RLS):** İstisnasız TÜM tablolarda RLS'yi aktif et. Hiçbir tablonun herkese açık (`public`) kalmamasını sağla; kullanıcı bazlı katı SQL politikaları (SELECT, INSERT, UPDATE, DELETE) yaz.
2. **Auth & Session Güvenliği:** Brute-force saldırılarına karşı giriş deneme sınırları, güçlü şifre politikaları, güvenli Cookie ayarları (`HttpOnly`, `Secure`, `SameSite=Strict`) ve e-posta doğrulama akışlarını sıkılaştır.
3. **Storage (Dosya Yükleme) Güvenliği:** Supabase Storage kullanılıyorsa dosya boyutu limitleri, MIME-type kısıtlamaları (zararlı dosya yüklemeyi önleme) ve bucket erişim politikalarını kur.
4. **Veritabanı Yedekleme & İndeksleme:** Sorgu performansını uçuracak veritabanı indekslerini (Indexes) belirle ve otomatik yedekleme (PITR/Daily Backup) stratejisini kur.

### FAZ 3: API, SUNUCU VE AĞ GÜVENLİĞİ (OWASP TOP 10 STANDARTLARI)
1. **Rate Limiting & Bot Koruması:** Tüm API uç noktalarına, giriş formlarına ve Resend e-posta tetikleyicilerine (Upstash Redis veya benzeri ile) IP/Kullanıcı bazlı hız sınırlaması (Rate Limit) ve Cloudflare Turnstile / reCAPTCHA bot koruması ekle.
2. **Input Validation & Sanitization:** Kullanıcıdan gelen her türlü veriyi sunucu tarafında (Zod vb. ile) şema doğrulamasından geçir. SQL Injection, XSS ve NoSQL Injection açıklarını tamamen kapat.
3. **CSRF & SSRF Koruması:** Cross-Site Request Forgery ve Server-Side Request Forgery saldırılarına karşı token ve URL doğrulama mekanizmaları kur.
4. **Webhook & E-posta Güvenliği:** Harici API/ödeme webhook'ları için imza doğrulaması (Signature Verification) ekle. Resend için domain DNS kayıtlarını (SPF, DKIM, DMARC) yapılandır ve e-posta spam/kötüye kullanım kilitleri koy.

### FAZ 4: HTTP GÜVENLİK BAŞLIKLARI VE VERCEL OPTİMİZASYONU
`next.config.js` (veya middleware) içerisine en üst düzey (SecurityHeaders.com A+ skoru verecek) başlıkları ekle:
1. Sıkı bir **Content-Security-Policy (CSP)** (Nonce veya katı domain izinleriyle).
2. **Strict-Transport-Security (HSTS)**, **X-Frame-Options (DENY)**, **X-Content-Type-Options (nosniff)**, **Referrer-Policy** ve **Permissions-Policy** (kamera, mikrofon, konum izinlerini kapatma).
3. Sıkı **CORS** ayarları ile API'ye dış kaynaklardan izinsiz erişimi engelle.

### FAZ 5: GOOGLE (TEKNİK SEO) VE YAPAY ZEKA ARAMA MOTORLARI (GEO)
Sitemin Google'da ilk sayfada çıkması ve ChatGPT, Perplexity, Claude, Google AI Overviews gibi yapay zeka motorlarının sitemi birincil kaynak olarak önermesi için:
1. **Dinamik Metadata Sistemi:** Her sayfa için benzersiz `<title>`, `<meta description>`, canonical URL, OpenGraph görselleri (`opengraph-image`) ve Twitter Card yapılarını kodla.
2. **Arama Motoru & AI Bot Dosyaları:** Dinamik `sitemap.xml`, bot yönlendirmeli `robots.txt` ve yapay zeka modellerinin sitemi kusursuz anlaması için kök dizine standartlara uygun **`llms.txt`** ve **`llms-full.txt`** dosyalarını oluştur.
3. **Zengin Schema.org (JSON-LD):** Sayfa türlerine göre iç içe geçmiş (nested) yapısal verileri (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`, `BreadcrumbList`, `Article`) kodla.
4. **Semantik HTML & İçerik Mimarisi:** Doğru H1-H6 hiyerarşisi, semantik etiketler (`<main>`, `<article>`, `<section>`, `<nav>`) ve kırık link (404) önleme yapılarını kur.

### FAZ 6: CORE WEB VITALS, PERFORMANS VE ERİŞİLEBİLİRLİK (A11Y)
1. Google PageSpeed Insights'ta **95-100 puan** almak için; görsel optimizasyonu (`next/image`, WebP/AVIF, lazy loading), font optimizasyonu (`next/font`), kod bölme (Code Splitting) ve gereksiz JS yükünü temizleme işlemlerini yap.
2. Özel tasarlanmış profesyonel **404 (Sayfa Bulunamadı)** ve **500 (Sunucu Hatası)** sayfaları oluştur.
3. Temel Erişilebilirlik (WCAG) standartlarını (`aria-label`, klavye navigasyonu, renk kontrastı, ekran okuyucu uyumu) uygula.

### FAZ 7: YASAL UYUMLULUK VE KULLANICI GÜVENİ (KVKK / GDPR)
1. KVKK ve GDPR uyumlu Çerez Politikası (Cookie Consent Banner - kullanıcı onay vermeden analitik/takip çerezlerini çalıştırmayan yapı), Gizlilik Politikası ve Kullanım Koşulları şablonlarını ve sayfalarını projeye entegre et.

### FAZ 8: İZLEME (MONITORING), LOGLAMA VE CANLIYA ALMA TESTLERİ
1. Canlı ortamda oluşan hataları anlık yakalamak için Sentry (veya benzeri bir hata izleme aracı) ve Vercel Analytics entegrasyonunu kur. Hassas kullanıcı verilerinin (PII - şifre, e-posta, IP) loglara yazılmasını maskele.
2. Yayına almadan önce uygulamam gereken son güvenlik, hız ve SEO test kontrol listesini (Checklist) çıkar.

---

### ÇALIŞMA KURALIN:
Bana genel geçer tavsiyeler veya teorik özetler verme. Doğrudan projeme entegre edeceğim eksiksiz, hatasız ve üretim kalitesinde kodları yaz. 
Süreci **Faz 1'den başlayarak** adım adım yönet. Her fazda benden hangi dosyaları (örneğin `package.json`, `next.config.js`, veritabanı şeması vb.) görmen gerektiğini iste, ben dosyaları paylaştıkça o fazın kodlarını kusursuzca üret, benden onay al ve bir sonraki faza geç. Şimdi sadece benden ilk adımda hangi dosyaları istediğini söyleyerek başla.

Son otomatik güncelleme: 2026-11-17 (scripts/obsidian-sync.mjs)
<!-- otomatik:bitir -->
## Notlarım

(Bu başlığın altına elle yazdıklarınız korunur.)
