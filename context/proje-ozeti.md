# Proje Özeti

## Adı
Chioutworks Resmi Web Sitesi (klasör adı: "Chioutworks Official Website").

## Kısa tanım
Tek kişilik bir teknoloji işletmesinin (Almanya merkezli, 2023'te kuruldu) hizmet ve marka sitesi. İş otomasyonu, özel web uygulamaları, YZ entegrasyonu (sesli ve yazılı asistanlar) ve dijital strateji sunar. Hedef kitle KOBİ'lerdir. Site dört dilde yayınlanır: Türkçe, İngilizce, Almanca, Yunanca.

## Ana amaç
Ziyaretçiyi yazılı bir talebe dönüştürmek: ücretsiz yazılı değerlendirme, canlı demolar, müşteri alım (intake) portalı ve sesli/yazılı asistan üzerinden.

## Kapsama dahil
- React sitesi: ana sayfa, hizmetler, blog, SSS, hukuki sayfalar, demo vitrini (5 canlı demo, 24 saatlik erişim kodu).
- Express API (`server/`): Gemini Live sesli asistan, Groq yazılı sohbet ve analiz, talep/intake kaydı, yönetim paneli.
- Müşteri intake portalı, 1. faz tamam.
- JSON veri deposu (`data/`, git dışı).

## Kapsam dışı
- Toplantı, SMS, sahte referans/yorum: yok.
- Sitede e-posta adresi yok.
- Canlı sunucu (üretim host'u) henüz yok; Resend, Supabase ve alan adı bekliyor.
- Claude Animasyon Sistemi ve Workruno ayrı projelerdir, karıştırılmaz.

## Mevcut durum (2026-11-13)
Lacivert tema (lia tarzı ana sayfa, blog, SSS) uygulandı. Menü sırası, iletişim formunun sunucuya bağlanması yapıldı. Mobil geçiş en sona bırakıldı. Açık kararlar: referans yeri, Impressum e-postası.

## Önemli konumlar
`src/` (arayüz), `server/` (API), `data/` (çalışma verisi, git dışı), `scripts/`, `public/`, `context/`, `agents/`, `_yedek/`, `obsidian/Chioutworks Official/` (proje Obsidian kasası, sahibin isteğiyle güncellenir).
