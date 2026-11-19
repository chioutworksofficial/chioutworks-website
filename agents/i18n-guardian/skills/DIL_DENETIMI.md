# Beceri: DIL_DENETIMI

## Amaç
Dört dilin (tr, en, de, el) saf kalmasını ve dört dilde eksiksiz metin bulunmasını denetlemek.

## Girdiler
Denetlenecek dosyalar (salt okunur), `../../../context/`, `../../knowledge/`.

## Süreç
1. `src/translations.ts`, `src/site/i18n`, `src/data/legalTranslations.ts` içinde dört dilin anahtar eşitliğini karşılaştır.
2. Bir dilde başka dil kelimesi (ör. Türkçe metinde Almanca) ara; `server/languageGuard.ts` ve `src/lib/scriptGuard.ts` kurallarını okuyup bunlara dokunma.
3. "biz", kişi adı ve e-posta adresi geçen metinleri işaretle.
4. Raporu yaz.

## Çıktılar
`outputs/` altında tarihli rapor: bulgu, dosya yolu, önerilen düzeltme. Düzeltmeyi sahibin onayıyla ayrı iş olarak yapılır.

## Kalite çıtası
Her bulgu dosya yolu ve satırıyla gelir; tahmin değil kanıt.
