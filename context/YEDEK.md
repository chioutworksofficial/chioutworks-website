# Yedekleme ve geri yükleme

## Ne var
- **Gece yedeği (otomatik):** `/api/cron/daily` içinde tüm uygulama tabloları tek JSON'a alınır, gzip + AES-256-GCM ile şifrelenir, **özel** `backups` bucket'ına `backups/YYYY-MM-DD.json.gz.enc` olarak yüklenir. En yeni 7 dosya tutulur. Günlüğe yalnızca sayılar yazılır.
- **Anahtar:** HKDF-SHA256 (`ABUSE_SALT` + `SUPABASE_SECRET_KEY`, info `chioutworks-backup-v1`). Yeni sır yok. **Bu iki değerden biri değişirse eski yedekler okunamaz**; eski değerleri güvenli yerde sakla.
- **Yerel yedek:** `npm run backup` -> `backups/chioutworks-YYYY-MM-DD-SSDD.json.gz` (düz gzip, mod 600, git dışı). `npm run backup -- --decrypt-latest` en yeni gece yedeğini indirip aynı klasöre çözer (`nightly-*.json.gz`).
- **Kontrol:** `npm run restore-check` en yeni yerel yedeği doğrular; satır sayılarını canlıyla karşılaştırır; yalnızca `kv` için gerçek (idempotent upsert) geri yükleme yapar, diğerleri kuru çalıştırmadır (sütun uyumu).
- **Yönetici listesi:** `GET /api/admin/backups` (yönetici girişi gerekir): dosya adı + boyut.
- Tablo listesi: `server/backup.ts` içindeki `BACKUP_TABLES` (`rate_hits` hariç). Yeni tablo eklenince oraya ekle.
- Kapsam dışı: Storage dosyaları (`project-files`). Bunlar ayrıca yedeklenmez.

## Tam geri yükleme (adım adım)
1. Yedeği hazırla: yerel `.json.gz` yoksa `npm run backup -- --decrypt-latest`.
2. Önce `npm run restore-check` çalıştır; şema uyumu `ok` olmalı.
3. Her tablo için `dbUpsert(tablo, satırlar)` ile geri yükle (birincil anahtara göre birleştirir; `kv` için `on_conflict=key`). Büyük tabloları (`analytics_events`) 500-1000 satırlık parçalarla gönder.
4. Sıra: `kv`, `daily_salts`, `styles`, `projects`, `intakes`, `offers`, `consents`, `demo_access`, `voice_sessions`, `affiliate_clicks`, `analytics_events`, `abuse_*`, `admin_sessions`, `app_errors`. Tablolar arasında zorunlu yabancı anahtar yoksa sıra kritik değildir; varsa üst tablo önce.
5. Her tablodan sonra satır sayısını yedekle karşılaştır.

## Dikkat
- Upsert silmez: yedekten sonra eklenen satırlar kalır, silinmiş satırlar geri gelir. Tam sıfırlama gerekirse önce sahibe sor, sonra tabloyu filtreli sil.
- `admin_sessions` ve `abuse_*` geri yüklenirse süresi dolmuş oturumlar/yasaklar da döner; gerekirse geri yüklemeden çıkar.
- Yedek dosyaları kişisel veri içerir: paylaşma, commit etme, yazdırma.
- Gece yedeği başarısız olursa `app_errors` içinde `cron/backup-failed` görünür.

## Yönetici parolası (yayın günü)
`sh scripts/new-admin-token.sh`: rastgele `ADMIN_TOKEN` üretir, `.env` içine yazar (mod 600), Vercel production + preview'a gizli değişken olarak gönderir, değeri yazdırmaz. Değeri bir kez `.env` dosyasını açıp oku, parola yöneticine kaydet; sonra yeniden yayınla.
