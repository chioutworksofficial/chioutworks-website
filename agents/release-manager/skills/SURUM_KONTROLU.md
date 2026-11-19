# Beceri: SURUM_KONTROLU

## Amaç
Yayın öncesi kontrol listesini yürütmek: tip denetimi, derleme, dil, gizlilik, gizli bilgi taraması.

## Girdiler
Denetlenecek dosyalar (salt okunur), `../../../context/`, `../../knowledge/`.

## Süreç
1. `npx tsc --noEmit -p tsconfig.app.json` ve `-p tsconfig.node.json`.
2. `npm run build` (yerelde donarsa tsc yeterli sayılır; sahibe belirt).
3. `.gitignore` kapsamını doğrula: `.env*`, `data/*.json`, `public/assets-ai/`.
4. Repoda e-posta adresi ve anahtar kalıbı tara.
5. i18n-guardian, qa-visual, privacy-legal-checker raporlarının güncel olduğunu kontrol et.
6. `graphify update .` çalıştır. Raporu yaz.

## Çıktılar
`outputs/` altında tarihli rapor: bulgu, dosya yolu, önerilen düzeltme. Düzeltmeyi sahibin onayıyla ayrı iş olarak yapılır.

## Kalite çıtası
Her bulgu dosya yolu ve satırıyla gelir; tahmin değil kanıt.
