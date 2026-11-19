# Kurallar ve Sınırlar

## Zorunlu kurallar
- Dil saflığı: her sayfa, kart, asistan yanıtı tek dilde. Metin `src/translations.ts` ve `src/site/i18n` içinde dört dile birden eklenir.
- Renk ve yazı tipi yalnızca CSS değişkenleriyle; bileşenlerde sabit hex yazılmaz. Değişkenler `src/styles/theme.css` içindedir.
- Site metni tekil anlatımlıdır (tek kişi). "Biz" ve kişi adı kullanılmaz.
- Değişiklikten sonra `npx tsc --noEmit -p tsconfig.app.json` ve `-p tsconfig.node.json` geçmelidir.
- Kod değişince `graphify update .` çalıştırılır.

## Yapılmaması gerekenler
- Eski bileşenleri (`CinematicGate`, `VillaTour`, `ClubXInvestors` vb.) silmek.
- `.env*` ve `data/*.json` dosyalarını commit etmek veya içeriğini yazdırmak.
- Sitede veya belgelerde e-posta adresi yazmak.
- Sahte yorum, sahte sayı, toplantı veya SMS vaadi.
- `node_modules`, `public/kapigiris/` içine dokunmak; `obsidian/` kasasını sahibin isteği olmadan değiştirmek.
- `src/translations.ts` içindeki `as const` ifadesini kaldırmak.

## Bütçe ve kaynak sınırları
Ücretli servis yok. İleride yalnızca Gemini ücretli katman ve Stripe.

## Hukuki, güvenlik, gizlilik
- Gizlilik politikası ABD'li sağlayıcıları (ör. Google, Groq) adıyla belirtir; yeni sağlayıcı eklenirse politika aynı işlemde güncellenir.
- Asistan kullanımından önce açık onay alınır.
- Hukuki metinler bilgilendirme amaçlıdır; avukat incelemesi yerine geçmez. Impressum e-postası açık karardır.
- Sır, anahtar, parola belgelere yazılmaz.

## Sahibin onayı gerektirenler
Yayımlama, kalıcı silme, harici mesaj gönderme, ödeme veya ücretli servis açma, hukuki metin değişikliği.
