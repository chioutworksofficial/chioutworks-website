# Sözleşme, İptal ve Devir: Sahibin Gereksinimleri (2026-11-14)

> Kaynak: sahibin talimatları (bu oturum). Uygulama henüz yapılmadı; sırası `context/HARITA.md` içinde.
> Hukuki metinler avukat kontrolünden geçmeden kullanılmaz.

## 1. Sözleşme dili (karışık dil YOK)
- Dil **müşterinin ülkesine** göre ve **tek dil**: Almanya (ve Almanca konuşulan ülkeler) → yalnızca **Almanca**; Türkiye (ve Azerbaycan) → yalnızca **Türkçe**; Yunanistan / Kıbrıs → yalnızca **Yunanca**; diğer ülkeler → yalnızca **İngilizce**.
- Altında başka dilde tercüme olmaz. (Ülke: analiz formundaki pazar/market alanı.)

## 2. Sözleşme ve ödeme akışı
1. Teklif kabul → 2. Sözleşme sayfası (sahibin imzası hazır) → müşteri adını yazar / imzalar + onay → 3. PDF + kanıt kaydı (tarih, saat, belge özeti), admin paneline düşer, müşteri indirir, alan adı gelince e-postayla gider → 4. Stripe: kurulum ücreti tek sefer → 5. 2 ay sonra aylık abonelik otomatik → 6. Stripe otomatik fatura (§19 UStG notu).
- "Bu siparişi işletmem adına veriyorum (§14 BGB)" onayı; tüketiciyse yasal cayma bilgisi.
- İş başladıktan sonra iptal: yapılan iş, en az %10 (örnek: 1.500 € → 150 €).

## 3. Abonelik iptali (siteye entegre)
- **6 ay asgari süre**, sonra her ay iptal edilebilir.
- Müşteri, portalından/sitedeki bölümden **kendisi iptal eder** (Stripe müşteri portalı veya kendi butonumuz), açıklamalı.
- İptal anında gösterilecek ve e-postayla gidecek bildirim (müşterinin dilinde):
  > "İptaliniz alındı. **Ay sonuna kadar her şey kullanılabilir durumda kalır.** Sonraki aydan itibaren erişim tamamen kapanacaktır" — kapsam: web sitesi (sahibin barındırdığı modelde) ve varsa otomasyonlar, sözleşmede ne alındıysa.
- **Model farkı (çelişki notu):** hesaplar müşterinin adına ise site müşteride çalışmaya devam eder; kapanan = sahibin çalıştırdığı parçalar (sahibin sunucusundaki otomasyonlar, sahibin anahtarlı YZ, portal, bakım/destek). Hesaplar sahipteyse site + otomasyonlar kapanır.

## 4. İptal sonrası 30 günlük karar linki
- İptal edildiği gün **otomatik bir link** oluşur (müşterinin bulunduğu bölümde görünür + e-postayla gider), **30 gün geçerli** (iptal tarihinden itibaren).
- Linkte müşteri seçer:
  - **"Devretmek / yeniden etkinleştirmek istiyorum"**: veriler ve site başka birine devredilecek veya tekrar açılacaksa **saat ücreti 65–75 €**, **tahmini süre** gösterilir (varsayılan metin: kapsama göre genellikle 1–3 iş günü; sahip netleştirecek).
    Not metni: otomasyonların başka bir geliştiricinin sisteminde **aynı şekilde çalışacağının garantisi yoktur**; her geliştirici kendi araçlarını kullanır.
  - **"Hiçbir şey istemiyorum, her şey silinsin"**: tüm veriler **hukuka uygun şekilde tamamen silinir**, hiçbir veri kalmaz.
- **30 gün içinde cevap gelmezse**: her şey hukuka uygun şekilde silinir (bu baştan sözleşmede ve bildirimde yazar).
- Tüm iptaller, linkler, seçimler ve kalan gün **admin panelinde görünür**; sahip not ekleyebilir; sahibe bildirim.

## 5. Sonra yapılacak: Telegram yönetici botu
- Sahibin Telegram'ı admin paneline bağlanır; admin'deki önemli olaylar (yeni talep, form teslimi, teklif kabul, ödeme, iptal, 30 gün linki seçimleri, mesajlar) **aynı liste olarak Telegram'a** düşer.
- Kısıt: Telegram mesajlarında gereksiz kişisel veri olmaz (özet + admin linki).

## 6. Devir: yapılacaklar ve süre (2026-11-14 eki)
- İşler: müşteri için yeni e-posta + hesaplar (Supabase, Vercel, Resend, GitHub) ~1 sa; Vercel/Supabase proje devri (veri içinde) 1–2 sa; Resend alan adı doğrulama (DNS) ~30 dk; alan adı sahibin hesabındaysa transfer ~30 dk; test + devir belgesi + teslim e-postası 1–2 sa. **Toplam çalışma ~4–7 saat.**
- Müşteriye yazılacak: "Devir sırasında siteniz ve e-postalarınız kesintisiz çalışır. Çalışma süresi genellikle 1–3 iş günüdür." (Alan adı başka sağlayıcıya taşınırsa arka planda birkaç gün sürebilir; hizmet etkilenmez.)
- Saat ücreti 65–75 €. Akış: yapılacaklar listesi + tahmini saat → ödeme linki (tahmini saatler önceden) → sayaç → gerçek saate göre fark ödeme/iade → otomatik fatura. Her şey müşterinin dilinde.

## 7. VPS üzerindeki otomasyonlar
- Baştan kural: her müşterinin otomasyonları **ayrı konteyner (Docker) + ayrı veritabanı**; müşteriler karışmaz.
- Devirde: konteyner + veri müşterinin kendi VPS'ine (Hetzner/Hostinger vb. ~5–10 €/ay) birebir taşınır (~2–4 sa). Müşteriye: "Otomasyonların 7/24 çalışması için kendi VPS sağlayıcınıza ihtiyacınız olacak; kurulumu dahil teslim ediyorum."

## 8. Şifre teslimi (güvenlik)
- Şifreler e-postanın içine düz yazılmaz. Süresi dolan güvenli paylaşım linki (ör. Bitwarden Send) ile gider; teslim e-postası yalnızca nerede olduklarını söyler.
- Müşteriden ilk girişte şifreleri değiştirmesi ve iki adımlı doğrulamayı açması istenir.
- Teslim e-postası tonu: "Bundan sonrası için başarılar; herhangi bir konuda yardım gerekirse buradayım."

## 9. Silme ve yasal saklama
- "Her şey silinsin" / 30 gün cevapsız: site ve tüm veriler silinir; **fatura ve sözleşme kayıtları yasal saklama süresi (6–10 yıl, AO §147 / HGB §257) boyunca tutulur.** Bildirim metnine bu cümle eklenir.

## 10. Admin: müşteri zaman çizelgesi ve link takibi
- Her müşteri için tek ekranda: gönderilen tüm linkler (analiz formu, teklif, sözleşme, ödeme, iptal kararı, devir, saatlik iş ödemesi), **ne için**, ne zaman gönderildi, ne zaman sona eriyor, durumu (açıldı / tamamlandı / süresi doldu), notlar.
- Süresi dolmuş link tek tıkla yenilenebilir; müşteri 1–2 ay sonra dönse de geçmiş görünür.
- Tüm müşteri yüzleri ve e-postalar her dilde (müşterinin dilinde) kusursuz.

## 11. Alan adı ve kesintisiz devir (2026-11-14 eki)
- Kural: alan adı **baştan müşterinin adına ve hesabında** alınır → devirde transfer gerekmez.
- Sahibin hesabında alınmışsa: şirket değiştirmek yerine aynı sağlayıcı içinde hesaptan hesaba aktarım (Hostinger'da desteklendiği kontrol edilecek).
- Registrar transferi (5–7 gün) yalnızca müşteri başka sağlayıcıya geçmek isterse; transfer sırasında DNS değişmez, site ve e-posta kesintisiz çalışır.
- Resend/Vercel geçişi: yeni hesap kayıtları eskilerin yanına eklenir, doğrulanınca anahtar değiştirilir, sonra eskiler silinir → kesinti yok.
- Müşteri metni: "Devir sırasında siteniz ve e-postalarınız kesintisiz çalışır. Çalışma süresi genellikle 1–3 iş günüdür."

## 12. Sahibin hesabında/kartında olan müşteride devir planı (2026-11-14, sahibin akışı)
| Aşama | Ne yapılır | Örnek süre (70 €/sa) |
|---|---|---|
| 1. gün | Müşteri adına hesaplar açılır (e-posta, Vercel, Supabase, Resend, GitHub), projeler aynı gün devredilir, alan adı aktarımı başlatılır (Hostinger → müşterinin Hostinger hesabı) | ~2 sa |
| Bekleme | Alan adı aktarımı (en fazla ~1 hafta); site ve e-posta kesintisiz | ücret yok |
| Aktarım bitince | Alan adı yeni hesaplara bağlanır, Resend doğrulanır, test | 2–4 sa |
| Ertesi gün | Kalan kurulumlar, devir belgesi, güvenli şifre teslimi, teslim e-postası | 2–4 sa |
| Toplam | | ~6–10 sa (müşteriye aralık verilir) |
- Bekleme süresindeki altyapı maliyeti (sahibin kartından): tahmine gün bazında küçük kalem veya son aylık ücrete dahil.
- Her çalışma oturumu (saat + ne yapıldı) müşteri zaman çizelgesine ve admin'e otomatik yazılır; son faturada liste görünür.
- Ödeme: tahmini saatler başta ödeme linkiyle; sonunda gerçek saate göre fark/iade; otomatik fatura, müşterinin dilinde.
