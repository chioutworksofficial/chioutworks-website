# Beceri: GORSEL_DENETIM

## Amaç
Sitenin görsel tutarlılığını (palet, yazı tipi, boşluk, taşma) dört dilde ve ekran görüntüleriyle denetlemek.

## Girdiler
Denetlenecek dosyalar (salt okunur), `../../../context/`, `../../knowledge/`.

## Süreç
1. `src/components` ve `src/site` içinde sabit hex ve eski palet (krem/lime) kalıntısı ara (`grep`).
2. `npm run shots` ile ekran görüntüsü alınacaksa sahibe haber ver (dev sunucu gerekir).
3. Çıktıları BRAND.md ile karşılaştır: Figtree/Inter/IBM Plex Mono, lacivert yüzeyler, mor/pembe yok.
4. Raporu yaz.

## Çıktılar
`outputs/` altında tarihli rapor: bulgu, dosya yolu, önerilen düzeltme. Düzeltmeyi sahibin onayıyla ayrı iş olarak yapılır.

## Kalite çıtası
Her bulgu dosya yolu ve satırıyla gelir; tahmin değil kanıt.
