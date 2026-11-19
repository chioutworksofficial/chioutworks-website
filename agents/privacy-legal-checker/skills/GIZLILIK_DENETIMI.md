# Beceri: GIZLILIK_DENETIMI

## Amaç
Gizlilik, onay ve hukuki metinlerin gerçek veri akışlarıyla uyumunu denetlemek (avukat incelemesinin yerine geçmez).

## Girdiler
Denetlenecek dosyalar (salt okunur), `../../../context/`, `../../knowledge/`.

## Süreç
1. `server/` ve `src/` içinde harici çağrıları listele (Google/Gemini, Groq, Resend vb.).
2. `src/pages/PrivacyPolicy.tsx`, `TermsOfService.tsx`, `src/data/legalTranslations.ts` ile karşılaştır; ABD'li sağlayıcıların adı anılmalı.
3. `src/site/AssistantConsent.tsx` ve `src/lib/assistantConsent.ts` onay akışını incele.
4. Veri dosyası, `.env*` ve e-posta adresinin repoda veya sitede olmadığını doğrula.
5. Açık karar: Impressum e-postası. Raporda 'sahip kararı bekliyor' olarak not et.

## Çıktılar
`outputs/` altında tarihli rapor: bulgu, dosya yolu, önerilen düzeltme. Düzeltmeyi sahibin onayıyla ayrı iş olarak yapılır.

## Kalite çıtası
Her bulgu dosya yolu ve satırıyla gelir; tahmin değil kanıt.
