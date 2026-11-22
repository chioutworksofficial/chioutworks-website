# Proje Bağlamı Haritası

`context/` klasörünün ana haritasıdır. Bilgiyi tekrar etmez; nerede ne olduğunu gösterir.

## Okuma düzeni

### Her görevde oku
- `proje-ozeti.md`: Proje nedir, kapsamı ve mevcut durumu.
- `kurallar-ve-sinirlar.md`: Zorunlu kurallar ve yasaklar.

### Göreve göre oku
- `hedefler.md`: Önceliklendirme ve planlama.
- `kararlar.md`: Karar alırken veya çelişki ihtimalinde.
- `kaynaklar/README.md`: Kaynak eklerken.
- `kaynaklar/kaynak-indeksi.md`: Belirli bir PDF, belge veya bağlantı ararken.

## Harita

| Konum | İçerik | Ne zaman |
|---|---|---|
| `proje-ozeti.md` | Tanım, amaç, kapsam, durum | Her görevde |
| `hedefler.md` | Aktif hedefler, öncelik, ölçüt | Planlamada |
| `kurallar-ve-sinirlar.md` | Kalıcı kurallar, yasaklar, onay gerektirenler | Her görevde |
| `kararlar.md` | Karar günlüğü (tarih, gerekçe, durum) | Değişiklik öncesi |
| `HARITA.md` | **Ana harita:** her parçanın durumu, yeri, bağlantısı, zorunlu/olsa iyi | Her görevden önce ve sonra |
| `SON-DURUM.md` | Devir teslim notu ("resume p") | Oturum başında |
| `ozellikler/` | Büyük özelliklerin sahip gereksinimleri (ör. sözleşme, iptal, devir) | O özelliği yaparken |
| `CANLIYA-ALMA.md` | 8 fazlı yayın planı + canlıya alma sonrası kontrol listesi | Yayın hazırlığında |
| `kaynaklar/README.md` | Kaynak sistemi kuralları | Kaynak işlemlerinde |
| `kaynaklar/kaynak-indeksi.md` | Gerçek kaynakların envanteri | Kaynak ararken |
| `kaynaklar/baglantilar.md` | Çevrim içi kaynaklar | Dış bağlantı gerekirse |

Ajan çerçevesi (marka, hedef kitle, strateji, ajanlar) `../agents/` altındadır. Eski tasarım belgeleri `../_yedek/` altındadır ve güncel kabul edilmez.

## Kurallar
- Yeni bağlam dosyası eklenir, taşınır, yeniden adlandırılır veya silinirse bu harita aynı işlemde güncellenir.
- Kesinleşmemiş fikirler, reddedilen seçenekler ve doğrulanmamış varsayımlar buraya yazılmaz.
- Çelişki fark edilirse sessizce düzeltilmez; sahibine bildirilir.

- `rehberler/otomasyon-ajansi-teknik-rehber.md` — müşteri yeni bir otomasyon/YZ projesi istediğinde: ihtiyacı anlama, sorulacak sorular, araç seçimi, kurulum adımları, maliyet, teslim ve test; cevap formatı (2026-11-20).
- `rehberler/teklif-ve-sozlesme-sablonu.md` — teklif (4 satır, fiyat kuralı, 3 paket) ve 5 maddelik anlaşma iskeleti; teklif/sözleşme yapay zekâsı buna uyar (2026-11-23).
- `GUVENLIK.md` — güvenlik standardı; her yeni özellik ve entegrasyonda uygulanır (2026-11-19).
