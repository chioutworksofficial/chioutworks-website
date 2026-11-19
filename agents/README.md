# Chioutworks Ajan Çerçevesi

Markdown ile çalışan, yerel öncelikli ajan sistemi. Ajanlar bu sitenin bakımını yapar: dil denetimi, içerik, görsel kalite, gizlilik ve sürüm. Kod ve veritabanı gerekmez.

```
Sahip --> Orkestratör --> Ajanlar --> Çıktılar
                            |
                            v
                  Günlük (paylaşılan bellek)
```

## Düzen

| Yol | Amaç |
|---|---|
| `CLAUDE.md` | Claude Code'un bu çerçeve için okuduğu özet |
| `CONVENTIONS.md` | İsimlendirme ve yapı kuralları |
| `AGENT_REGISTRY.md` | Ajan listesi ve durumları |
| `NEW_AGENT_BOOTSTRAP.md` | Yeni ajan oluşturma adımları |
| `AGENT_CREATION_CHECKLIST.md` | Yeni ajan kontrol listesi |
| `orchestrator/` | Kimlik ve öncelikler |
| `knowledge/` | Statik bilgi: marka, hedef kitle, strateji |
| `templates/` | Görev, günlük, haftalık gözden geçirme biçimleri |
| `journal/entries/` | Yaşayan ortak bellek |
| `outputs/` | Tarihli ortak çıktılar |
| `_sablon/` | Yeni ajan için kopyalanacak şablon |
| `<ajan-adi>/` | Gerçek ajanlar (kayıt: `AGENT_REGISTRY.md`) |

## Dört direk
1. Ölçülebilir hedefler. 2. Hedefe hizmet eden beceriler. 3. Kalp atışı (zamanlanmış döngü). 4. Günlük (paylaşılan bellek).

## Kullanım
Claude Code'a: "`agents/i18n-guardian` ajanını çalıştır" veya "yeni ajan oluştur: ..." demek yeterlidir. Ajanlar yayımlamaz, silmez ve sahibin onayı olmadan uygulama kodunu değiştirmez.

---

## English (short)
A markdown-only agent framework for maintaining this website. Five agents (i18n-guardian, content-writer, qa-visual, privacy-legal-checker, release-manager) are registered in `AGENT_REGISTRY.md`. Copy `_sablon/` to create a new one. Agents read `knowledge/` and `journal/`, write only to their own `outputs/` and the journal, and never publish or edit app code without the owner's approval.
