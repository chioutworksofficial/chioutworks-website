# Kurallar (İsimlendirme ve Yapı)

## Klasör ve dosya adları
- Ajan klasörleri küçük harf, tire ile: `i18n-guardian`. Şablon klasörü `_sablon`.
- Hiçbir ad boşluk içermez.
- Ajan tanımı `AGENT.md`; beceriler `skills/BECERI_ADI.md`.
- Çıktı: `YYYY-MM-DD_ajan_aciklama.md`. Günlük: `YYYY-MM-DD_HHMM.md`.

## Her ajan klasöründe
| Dosya | Amaç |
|---|---|
| `AGENT.md` | Misyon, hedefler, ölçütler, beceriler, kısıtlar |
| `HEARTBEAT.md` | Takvim ve döngü adımları |
| `MEMORY.md` | Ajana özel öğrenimler (paylaşılan bellek günlüktür) |
| `RULES.md` | Sınırlar ve devir kuralları |
| `skills/` | Her beceri ayrı dosya |

## Dört direk kontrolü
- [ ] Hedefler ölçülebilir mi?
- [ ] Her beceri bir hedefe hizmet ediyor mu?
- [ ] Kalp atışı tanımlı mı?
- [ ] Ajan günlüğü okuyup yazmayı biliyor mu?
- [ ] `AGENT_REGISTRY.md` içinde kayıtlı mı?

## Knowledge ve Journal
- `knowledge/` statik başvuru, `journal/` yaşayan bellek. Ajanlar ikisini okur, yalnızca günlüğe yazar.
