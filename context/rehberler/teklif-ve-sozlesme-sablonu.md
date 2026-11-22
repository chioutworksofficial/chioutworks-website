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
