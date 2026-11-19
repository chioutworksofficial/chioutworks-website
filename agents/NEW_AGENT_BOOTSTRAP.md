# Yeni Ajan Rehberi

1. Kopyala: `cp -r agents/_sablon agents/[ajan-adi]` (küçük harf, tire).
2. `AGENT.md`: tek cümle misyon, 2-4 ölçülebilir hedef, hedef dışı işler.
3. Beceriler: her hedef için `skills/` altına bir dosya (`_BECERI_SABLONU.md` kopyala). Hedefe hizmet etmeyen beceriyi sil.
4. `HEARTBEAT.md`: takvim, döngü, karar ağacı, haftalık gözden geçirme. Basit başla.
5. Veri akışı: `data/imports/` (sahibin bıraktığı veri), `outputs/`, `scripts/`.
6. `RULES.md`: yapabilir, yapamaz, devir kuralları.
7. `AGENT_REGISTRY.md` içine satır ekle.
8. İlk çalıştırma: bağlamı okuyor, çıktı üretiyor, günlüğe yazıyor mu? `MEMORY.md` boş kalmalı.
9. `AGENT_CREATION_CHECKLIST.md` ile doğrula.

## Sık hatalar
| Hata | Çözüm |
|---|---|
| Çok hedef | En fazla 4; fazlası ikinci ajandır |
| Hedefsiz beceri | Sil veya hedef ekle |
| Çok sık kalp atışı | Haftalıkla başla |
| Varsayımla dolu bellek | Boş bırak, veriden öğren |
| Haftalık gözden geçirme yok | Ajan öğrenemez; en önemli adım |
| `knowledge/` içine yazma | Asla; sahibe öner |
