# Chioutworks web sitesi: çalışma mantığı (baştan sona)

Güncelleme: 2026-11-24. Kaynak: context/HARITA.md, README.md, SON-DURUM.md ve bu oturumdaki işler.
"Yapılıyor" yazan maddeler henüz yayında değildir.

---

## 1. Tek cümleyle

Ziyaretçi siteye gelir, beş kapıdan birinden (form, sesli asistan, yazılı sohbet, ücretsiz site kontrolü, bülten) ihtiyacını bırakır.
Sistem bunu admin paneline aday (lead) olarak düşürür, yapay zekâ ile analiz eder.
Sahip yazılı çözüm listesi ve linkli teklif gönderir.
Müşteri teklifi linkten onaylar, sözleşmeyi imzalar, öder, proje sayfasından süreci takip eder.
Toplantı yoktur, her şey yazılı ve linklerle ilerler.

---

## 2. Vitrin: ziyaretçinin gördüğü site

**Diller:** Türkçe, İngilizce, Almanca, Yunanca. Her sayfa tek dilde, diller karışmaz. Ülkeye göre dil önerilir.

**Ana sayfa akışı (yukarıdan aşağıya):**
1. Giriş bölümü ve menü (logo tıklanınca en üste döner, açık/koyu mod düğmesi).
2. **Çözüm kartları:** 12 kart. Sayfa aşağı kaydırıldıkça bölüm sabitlenir, kartlar tek tek öne gelir. Her harekette bir kart (yapılıyor: hızlı kaydırmada kart atlamama). Fareyle üstüne gelinen kart büyür. Arkada devre/çip animasyonu.
3. Yazı bölümü ve dönen sektör çarkı.
4. **Ücretsiz web sitesi kontrolü bandı** (yapılıyor: çarkın hemen arkasına taşındı, tarama animasyonlu).
5. Ortaklar halkası, tasarruf hesaplayıcısı.
6. **Bülten bandı** (yapılıyor: iki sütun, görünür çip animasyonu).
7. Sayfa sonu: logo, sayfalar, yasal linkler, dil seçimi.

**Diğer sayfalar:** 6 paket sayfası (CRM, web sitesi, randevu, asistan, fatura, QR), canlı demolar, "tarzımı seç", araçlar ve ortak sayfaları, blog, SSS, kaynaklar, ücretsiz site kontrolü sayfası, yasal sayfalar (gizlilik, koşullar, Impressum, çerez ayarları).

---

## 3. Beş giriş kapısı

| Kapı | Ne yapar | İletişim bilgisi |
|---|---|---|
| **Talep formu / analiz formu** | Ürüne göre kısa ya da uzun soru akışı | E-posta zorunlu, telefon isteğe bağlı |
| **Sesli asistan** (ana sayfa) | Konuşarak ihtiyacı anlar, en fazla 3 dk | Değer verdikten sonra bir kez ister (yapılıyor) |
| **Yazılı sohbet** | Yazışarak ihtiyacı anlar | Aynı mantık (yapılıyor) |
| **Ücretsiz site kontrolü** | Siteyi 6 alanda puanlar, en önemli 5 düzeltmeyi e-postayla yollar | E-posta, çift onaylı |
| **Bülten** | Ayda bir kısa fikir e-postası | E-posta, çift onaylı |

Yapılıyor: sesli asistan ve sohbette kişi bilgi bırakınca asistan
"Görüşme bitince konuştuklarımızla doldurulmuş bir talep formu açılacak" der.
Görüşme bitince form önceden dolu açılır, kişi kontrol edip gönderir.

---

## 4. Talepten projeye: adım adım

```
[Ziyaretçi] -> kapılardan biri
     |
     v
1. Talep kaydı  -> Admin: Leads + Talepler (+ takvim, kimliği belliyse)
     |
     v
2. Yapay zekâ analizi -> ihtiyaç özeti, gereksinimler dosyası
     |
     v
3. Yazılı çözüm listesi -> e-postayla
     |
     v
4. Teklif linki (kişiye özel) -> müşteri açar, kabul eder
     |
     v
5. Sözleşme + e-imza (4 dil, imza kaydı)
     |
     v
6. Ödeme (Stripe bağlanınca otomatik; şu an pasif)
     |
     v
7. Proje sayfası -> adımlar, mesajlar, dosya yükleme
```

---

## 5. Aday (lead) yönetimi ve etiketler (yapılıyor)

- **Leads bölümü:** Bütün kapılardan gelen kişiler tek listede. Ad, işletme adı, e-posta, telefon, web sitesi, adres, sosyal medya, kaynak rozetleri. Aynı kişi birden çok yerden geldiyse tek kayıtta birleşir. Arama, filtre, CSV.
- **Etiketler:**
  - **Sıcak:** net ihtiyaç + form gönderdi ya da zaman/bütçe söyledi -> takvime "1 iş günü içinde yazılı cevap".
  - **Kararsız:** bilgi bıraktı ama formu göndermedi -> 3 gün sonra tek hatırlatma e-postası.
  - **Anonim:** bilgi yok -> takvime girmez, yalnızca konu özeti kalır.
- **İletişim tercihi:** E-posta / Telefon / WhatsApp. Yalnızca Telefon seçen aranabilir. "Aranmasın" işareti olan hiç aranmaz.
- **Takvim:** Yalnızca kimliği belli adaylar gün gün düşer. Bülten ve site kontrolü takvimi doldurmaz.

---

## 6. Otomatik e-postalar

| E-posta | Ne zaman | Not |
|---|---|---|
| Çift onay (bülten, site kontrolü) | Kayıt anında | Onaylanmazsa veri 7 gün sonra silinir |
| Site kontrolü raporu | Onaydan sonra | 6 alan puanı + 5 düzeltme |
| Görüşmenizin özeti | Sesli asistan/sohbet sonrası bilgi bırakınca | Özet, 2-3 çözüm yönü, dolu form linki (yapılıyor) |
| Tek hatırlatma | Kararsız adaya 3 gün sonra | Asla ikinci kez gitmez (yapılıyor) |
| Aylık fikir (bülten) | Her ayın ilk günleri | Her abone kendi dilinde, günde en fazla 80 |

Her bülten e-postasında tek tıkla çıkış linki var; çıkanın adresi silinir.
**Hiçbiri şu an gitmiyor:** alan adı e-posta hizmetinde doğrulanınca başlar.

---

## 7. Admin paneli

- **Gelenler:** Müşteri adayları (Leads), Talepler, Sesli görüşmeler, Analiz formları, Bülten.
- **İşler:** Teklifler, Sözleşmeler, Projeler, Takvim, Randevular, Satış (site analizi + makul sebep), Pazarlama (6 araç), Voice Agent.
- **Site:** Ziyaret analizi (ülke haritası), tasarruf hesaplayıcısı, Hatalar ve e-posta (Sentry adresi).
- Giriş: tek şifre, çerezli oturum.

**Voice Agent (ileride telefonla arama):** Şu an simülasyon modunda. Ayarlar, kuyruk, kayıtlar ve n8n/Retell için güvenli API hazır.
Arama senaryosu 4 dilde (yapılıyor): yapay zekâ olduğunu baştan söyler, insan gibi doğal konuşur, fiyat/vaat/toplantı yok, zor durumlar için hazır cevaplar.

---

## 8. Arka plan (teknik)

- **Ön yüz:** React 19 + TypeScript, Vite, Tailwind. Animasyonlar GSAP.
- **Sunucu:** Express API (server/), Vercel'de Frankfurt bölgesinde çalışır.
- **Veri:** Supabase (Frankfurt) + yerelde data/ JSON dosyaları (git dışı).
- **Zamanlanmış işler:** Vercel'de günde bir kez çalışan görevler (günlük bakım, bülten).
- **Yayın:** Bilgisayar -> GitHub -> Vercel otomatik yayın. Doğrudan Vercel'e yayın yok. Commit öncesi anahtar kontrolü var.
- **Güvenlik:** Anahtarlar yalnızca .env ve Vercel'de. Hız sınırları, bot tuzağı (honeypot), form jetonu, şifreli ayarlar. Ayrıntı: context/GUVENLIK.md.

**Kullanılan hizmetler (tür olarak):**

| Tür | Durum |
|---|---|
| Sesli yapay zekâ (ana sayfa asistanı) | Canlı |
| Yazılı yapay zekâ (sohbet, analiz, bülten metni) | Canlı |
| E-posta gönderimi | Anahtar var, alan adı bekleniyor |
| Barındırma (Vercel) + kod deposu (GitHub) | Canlı |
| Veritabanı (Supabase, Frankfurt) | Canlı |
| Hata izleme | Admin içinde var; Sentry bağlantısı bekliyor |
| Ödeme (Stripe) | Bekliyor |
| Telefon yapay zekâsı (Voice Agent) | Simülasyon |
| Ziyaret sayımı | Çerezsiz, kendi sistemimiz |

---

## 9. Bekleyenler

1. **Alan adı** -> e-posta doğrulaması, gönderen adresi, site adresi ayarı (PUBLIC_ORIGIN), Search Console.
2. **Stripe** -> ödeme, gizlilik metnine ekleme.
3. **Avukat kontrolü** -> sözleşme, koşullar, gizlilik politikası, Impressum e-postası.
4. **Voice Agent canlıya geçiş** -> Retell numarası (video hatırlatması SON-DURUM'da), gizlilik ve yapay zekâ bildirimi.
5. **Mobil hız** -> Lighthouse 80 hedefi (şu an ~62-66).
6. **Sentry** bağlantısı, admin için iki adımlı giriş, güvenlik başlıkları testi.

---

## 10. Düz metin özet (kopyala-yapıştır)

```
CHIOUTWORKS - CALISMA MANTIGI

ZIYARETCI
  -> Talep formu        (e-posta zorunlu)
  -> Sesli asistan      (bilgi istege bagli, deger verdikten sonra)
  -> Yazili sohbet      (ayni mantik)
  -> Site kontrolu      (cift onayli e-posta, rapor)
  -> Bulten             (cift onayli, ayda bir fikir)

SISTEM
  -> Admin: Leads (tek liste, kaynak rozetleri, isletme adi)
  -> Etiket: sicak / kararsiz / anonim
  -> Takvim: yalnizca kimligi belli adaylar
  -> Yapay zeka analizi

SAHIP
  -> Yazili cozum listesi (e-posta)
  -> Kisiye ozel teklif linki

MUSTERI
  -> Teklifi kabul -> Sozlesme + e-imza -> Odeme -> Proje sayfasi

KURALLAR
  - Toplanti yok, her sey yazili ve linkle.
  - Yalnizca "Telefon" secen aranir, bir kez; "aranmasin" asla aranmaz.
  - Asistan yapay zeka oldugunu her zaman soyler.
  - Diller asla karismaz (tr/en/de/el).
  - E-postalar alan adi dogrulaninca baslar.
```
