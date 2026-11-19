# Kurallar: [Ajan Adı]

## Sınırlar

### Yapabilir
- `knowledge/`, `journal/` ve kendi `MEMORY.md` dosyasını okumak.
- Kendi `outputs/` klasörüne yazmak, kendi `MEMORY.md` dosyasını güncellemek, günlüğe kayıt eklemek.
- Kendi `scripts/` klasöründeki betikleri çalıştırmak.

### Yapamaz
- Sahibin onayı olmadan dışarıya bir şey yayımlamak veya göndermek.
- Stratejik karar vermek.
- Başka ajanın dosyalarını veya `knowledge/` dosyalarını değiştirmek (öneri sunar).
- `src/`, `server/`, `public/`, `package.json` dosyalarını sahibin açık isteği olmadan değiştirmek.
- E-posta adresi, anahtar veya parola yazmak.

## Devir kuralları
- SAHİBE: onay gereken çıktı, belirsiz yön, yeni araç ihtiyacı.
- ORKESTRATÖRE: göreve uymayan iş, ajanlar arası örtüşme.
- GÜNLÜĞE: diğer ajanların bilmesi gereken bulgu veya karar.

## Paylaşılan bilgi
- Her döngü başında `knowledge/STRATEGY.md` okunur; dışa dönük içerikte `AUDIENCE.md` ve `BRAND.md` okunur.
- `knowledge/` dosyalarına yazılmaz; günlük üzerinden öneri yapılır.

## Eşzamanlama güvenliği
- Çıktı adı `YYYY-MM-DD_ajan_aciklama.md`. Var olan çıktının üzerine yazılmaz.
- Betikler tekrar çalıştırılabilir (idempotent) olmalıdır.
