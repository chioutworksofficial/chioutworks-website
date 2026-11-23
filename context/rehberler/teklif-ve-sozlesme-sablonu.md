# Teklif ve anlaşma şablonu (sahip, 2026-11-23)

Sahibin verdiği iki çalışma notu; yapay zekâ teklif ve sözleşme taslağı hazırlarken bu kurallara uyar. Mevcut sistem: `server/offers.ts` (teklif), `server/contract.ts` (sözleşme, 4 dil). Ödeme linki: projenin kendi ödeme altyapısı (Stripe hazırlığı), başka sağlayıcı değil.

## 1. Teklif: aynı gün, tek sayfa, dört satır
- Müşteri görüşmede en sıcaktır; teklif aynı gün gider. Fiyat yazıldıktan sonra ek açıklama yok.
- Akış: görüşme notları → tek sayfalık teklif + yazılı anlaşma aynı gün → "tamam" gelince ödeme linki.
- Model: kurulum + aylık.
- 4 satır, sırasıyla:
  1. **Durum**: müşterinin derdi, kendi rakamıyla.
  2. **Çözüm**: tek cümle.
  3. **Fiyat**: kurulum ve aylık ayrı satır.
  4. **Sonraki adım**: başlangıç tarihi, kaç iş gününde canlı, ödeme %50 başta %50 teslimde, ödeme linki.
- Müşterinin rakamı notlarda yoksa sahibe sorulur, uydurulmaz.
- Fiyat kuralı: aylık ücret müşterinin aylık kaybının altında ve sahibin aylık maliyetinin en az 5 katı; kurulum aylığın 3–5 katı. Maliyet kalemleri ayrı tabloda yalnızca sahibe gösterilir, teklife konmaz.
- 3 paket: aynı sistemin az / orta / çok hâli, tek tabloda, ortadaki önerilen.
- Dahil olmayanlar: en az 3 madde.
- Geçerlilik 14 gün. Abartı yok; her cümle kontrol edilebilir.
- Çıktı: teklif metni + tek sayfalık sade PDF.

## 2. Anlaşma: ilk ödemeden önce, beş madde + destek sözü
Kapsamı yazılmayan iş sınırsız iş olur. Bu bir iskelettir, hukuki metin değildir; sade dil.
1. İş tanımı: tek cümle.
2. Yapmayacaklarım: üç madde.
3. Revizyon: [sayı] tur.
4. Ödeme: kurulum [tutar], yarısı başta; sonra ayda [tutar]; ödeme linki.
5. Süre ve çıkış: [ay], [kaç gün önceden haber].
- Destek sözü: kanal (form/e-posta; site kuralı: toplantı, SMS vaadi yok), çalışma saati, ilk cevap süresi, kapsam dışı iki madde.
- Hesaplar ve veriler müşterinin adına.
- En altta: "Avukata doğrulatılacak taslaktır." (Sahip: gerekirse yaptırılacak.)

## 3. Risk → bugün yazılacak kural (sahibin verdiği tablo, 2026-11-23)
Anlaşma ve teklif hazırlanırken bu sekiz risk mutlaka kapatılır:

| Risk | Yazılı kural |
|---|---|
| Sınırsız iş | Kapsam beş madde |
| Sonsuz revizyon | İki tur, sonrası ücretli |
| Kod kimin | Abonelik sürerken sahipte (müşteri lisansla kullanır); abonelik bitince ya da tek seferlik işte teslimde müşteriye devredilir (bkz. bölüm 6) |
| Veri kimin | Müşterinin; sahip yalnızca işler (veri işleyen) |
| Tanıdığa ayrıcalık | Herkese aynı kural |
| Sözlü anlaşma | Tek sayfa, yazılı |
| Ödeme tarihi yok | Tarih + gecikme kuralı |
| Çıkış yok | 30 gün önceden yazılı bildirim |

## 4. "Yazılmayan kapsam sınırsız kapsamdır" (sahibin verdiği görsel, 2026-11-23)

| Böyle değil | Böyle |
|---|---|
| Sözlü: "hallederiz" | Beş madde tek sayfada |
| Kapsam yok, revizyon sonsuz | Kapsam dışı beş şey yazılı |
| Ödeme "iş bitince" | Yarısı başta, tarihli |
| Kod ve veri kimin, belirsiz | Kod sahipte (müşteriye lisanslı), veri müşteride; yazılı |

Not: anlaşmada "dahil olmayanlar" en az 5 madde (teklifte en az 3).

## 5. Sözleşme dili ve imza şekli ülkeye göre (sahibin kararı, 2026-11-23)
| Müşterinin ülkesi | Sözleşme dili | İmza / kabul |
|---|---|---|
| Almanya | Almanca | Müşteri seçer: dijital kabul ya da basılı kopyanın posta ile gönderilmesi |
| Yunanistan | **İngilizce geçerli metin** + Yunanca kopya; Yunanca kopyanın üstünde "Bu yalnızca sözleşmenin çevirisidir; geçerli metin İngilizcedir" yazar | Yazılı ad soyad imza olarak kabul edilir (dijital) |
| Türkiye | Türkçe | Dijital |
| İngiltere, ABD | İngilizce | Online / dijital kabul |
| Diğer ülkeler | İngilizce | Online / dijital kabul |
Not: tüketici (bireysel müşteri) sözleşmelerinde bazı ülkeler yerel dilde metin isteyebilir; şüphede avukata sorulur (sahip: gerekirse yapılacak).

## 6. Kod ve sistem sahipliği (sahibin kararı, 2026-11-23)
- **Kurulum + aylık hizmet:** aylık hizmet sürdükçe kod ve sistem sahipte kalır; barındırma, güncelleme, güvenlik ve küçük destek sahipte; müşteri lisansla kullanır.
- **Müşteri aylık hizmeti bırakırsa:** kurulum zaten ödendiği için sistem ve kod **ek ücretsiz** müşteriye devredilir. Devirden sonra barındırma, alan adı, güncelleme, güvenlik, yedekleme ve sorunlar tamamen müşterinin sorumluluğundadır. Sonradan istenen her iş saat başı 65–75 €.
- **Yalnızca tek seferlik iş (aylık yok):** teslimde sistem ve kod müşteriye devredilir; sonrası müşteride; ek iş saat başı 65–75 €.
- **Her durumda:** veriler müşterinindir; sahip yalnızca işler. Sahibin birçok projede kullandığı genel şablon ve araçlar sahibinde kalır (müşteri kendi projesini alır) — sahip itiraz etmedi, sözleşmede bu şekilde yazılır.
- Not: önceki plandaki "iptalde devir 65–75 €/saat" kuralı bununla değişti; devir ücretsiz, saat ücreti yalnızca ek işler için.
