# Chioutworks — Claude Code Görev ve Bağlam Aktarımı (Handoff)

Bu dosya, önceki geliştirme oturumunun durumunu ve yapılması istenen yeni görevi Claude Code'a aktarmak için hazırlanmıştır.

---

## 1. Mevcut Proje Durumu ve Yapılanlar

1. **AI Voice Assistant (Faz 2)** sisteme başarıyla entegre edildi:
   - `server/index.ts`: Express + Groq proxy (port 3001). IP başına 15 req/dk rate limit, prompt injection koruması.
   - `src/components/AIAssistant.tsx`: Sağ alt yüzen widget (Web Speech API mic, SpeechSynthesis TTS, 4 dil desteği: TR, EN, DE, EL).
   - `assistant-knowledge.md`: Asistan bilgi tabanı eklendi.
   - Randevu sistemi (`src/lib/appointments.ts`) ile entegre çalışır.
   - Dev çalıştırma: `npm run dev` (Vite port 3000 + Express port 3001 paralel çalışır).

---

## 2. Kullanıcının İstediği Yeni Görev (Demo Uygulamalar ve Erişim Kodu Sistemi)

### Hedef Dizin:
`/Users/chouseinchiout/Desktop/chioutworks` altındaki hazır indirilen uygulamalar (`doa1` veya ilgili klasörler).

### Görev Detayları:

1. **Uygulama Seçimi ve Hazırlığı:**
   - İndirilen hazır uygulamalar arasından **en iyi 10 tanesini** seç.
   - Bu uygulamaların sadece **ekran görüntülerini (resimlerini) ve ikonlarını** kullanarak vitrinde nasıl gözüktüklerini göster.
   - Renklerini ve isimlerini Chioutworks stiline uygun şekilde uyarla/değiştir.
   - Örnek isim/konsept: `demokuafor` (Kuaför/Berber Randevu & Yönetim Sistemi) gibi her sektöre özel demo isimleri ver.
   - Her uygulamanın altına açıklama ekle: **"Kişiye ve işletmeye göre özel olarak düzenlenebilir, yeni özellikler eklenebilir."**

2. **Web Üzerinde 5 Tane Aktif Demo Kurulumu:**
   - En yaygın ve en çok kullanılan **5 tanesini** web üzerinde doğrudan incelenebilir demo olarak kurgula/kur.
   - Hepsinin isimleri standart formatta olacak (örn: `demokuafor`, `demorestoran`, `democrm`, vb.).
   - Diğer kalan 5 tanesini (veya fazlasını) liste ve önizleme kartları olarak sergile.

3. **Demoyu Görme İçin 24 Saat Geçerli Erişim Kodu Sistemi (Lead Generation):**
   - Ziyaretçi demoyu canlı görmek / açmak istediğinde karşısına bir modal çıkacak.
   - Kullanıcıdan **E-posta** (ve opsiyonel Ad / Telefon) istenecek.
   - **Otomatik kod üretici**: Sistem 6 haneli benzersiz bir erişim kodu üretecek.
   - Bu kod **yalnızca 24 saat geçerli** olacak (son kullanma tarihi kontrolü).
   - E-posta simülasyonu / e-posta gönderim entegrasyonu ve kod doğrulama formu ile demo kilidi açılacak.

4. **Tasarım & Çeviri Uyumu:**
   - Chioutworks tasarım diline uygun: `#f5f5f2` arka plan, lime yeşili (`#bbf451`) vurgular, kartlı yapı, responsive.
   - Tüm yeni metinler `src/translations.ts` içine 4 dilde (TR, EN, DE, EL) eklenecek.

