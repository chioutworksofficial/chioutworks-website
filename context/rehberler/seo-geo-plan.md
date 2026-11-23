# SEO / GEO planı (2026-11-23, sahibin dosyasından: "SEO ve GEO Sistemi - Mantığı")

Durum: plan. Sahip onaylamadan uygulanmaz.

## Dosyanın özü
Google'da ve yapay zekâ asistanlarında görünmek için aynı temel gerekir: doğru bilgi, net yapı, tutarlı kimlik, düzenli yayın.
Döngü: ne aranıyor → kaynaktan yazı → her iddiayı kaynakla denetle → geçen yayınlanır, geçemeyen insana → ölç → sıradaki konu.
Otomatikleştirilmeyecekler: hesap/şifre, DNS, ödeme, sosyal medya ve e-posta gönderimi (taslak hazırlanır, gönderen sahip).

## Sitede zaten olanlar
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`
- `index.html` içinde kuruluş bilgisi (JSON-LD), canonical, OG etiketleri
- 4 dilde sayfalar, önceden çizilmiş (prerender) sayfalar, SSS ve blog

## Plan
**A. Alan adı gelince (domain'e bağlı, sahip adımı içerir)**
1. Tek adres: `www`'li mi `www`'siz mi; öbürü kalıcı yönlendirme; canonical ve site haritası o adresle.
2. Search Console + Bing Webmaster doğrulaması (sahip giriş yapar, şirket hesabıyla), site haritası gönderimi.
3. IndexNow: yeni/değişen sayfayı bildiren küçük betik (anahtar dosyası `public/` içinde).

**B. Şimdi yapılabilir (kod)**
4. Yapılandırılmış veri kontrolü: blog yazılarına `Article`, SSS sayfasına `FAQPage`, hizmet/paket sayfalarına `Service`; her dilde.
5. Tek cümlelik kimlik metni (4 dil) ve her yerde aynı: ana sayfa, `llms.txt`, JSON-LD, sosyal profiller.
6. `llms.txt` güncelleme: önemli sayfalar, paketler, dil sürümleri.
7. Kısa / konu dışı eski sayfaların listesi: güçlendir ya da dizinden çıkar.

**C. Ölçüm (haftalık, okuma amaçlı)**
8. 20 hedef arama (alıcı aramaları: ör. "Termin-Buchung für Friseur", "küçük işletme otomasyon") ve 10 yapay zekâ sorusu listesi; ilk ölçüm elle.
9. Haftalık kısa rapor: sıra/gösterim (Search Console gelince), yapay zekâ cevabında anılma, kaynak gösterilen siteler.

**D. İçerik (ilk ay)**
10. En önemli 3 hizmet sayfasını güçlendirme.
11. Alıcı aramalarına 8–10 yazı; dosyadaki yazı düzeni (ilk 100 kelimede cevap, şablon, sık hatalar, SSS, 5 maddelik özet), yapay zekâ yardımı açıkça belirtilir.
12. Kalite kapısı: abartı/garanti/sahte aciliyet yok, her sayı kaynakta; yazan model kendini denetlemez, ayrı denetçi alıntı gösterir. Geçemeyen yazı sahibe kalır.

## Sahipten beklenen kararlar
- Alan adı ve `www` tercihi
- Hedef ülke/dil önceliği (DE önce mi?)
- Yazıların kaynağı: kendi videoların/deneyimin mi, araştırma mı, ikisi mi
