# Agent Workspace (Chioutworks)

Bakım ajanları için markdown çerçevesi. Proje kuralları kök `CLAUDE.md` ve `context/` içindedir; çelişkide onlar geçerlidir.

## Ajanlar
Kayıt ve durum: `AGENT_REGISTRY.md`. Yeni ajan: `_sablon/` kopyalanır, `NEW_AGENT_BOOTSTRAP.md` izlenir.

## Dizinler
- `knowledge/`: statik bilgi (marka, hedef kitle, strateji). Ajanlar değiştirmez, öneri sunar.
- `journal/entries/`: ortak bellek. Ajanlar buraya yazar.
- `templates/`: görev, günlük, haftalık biçimleri.
- `orchestrator/`: kimlik ve öncelikler.

## Kurallar
- Her ajan klasörü: `AGENT.md`, `HEARTBEAT.md`, `MEMORY.md`, `RULES.md`, `skills/`.
- Çıktı adı: `YYYY-MM-DD_ajan_aciklama.md`. Günlük: `YYYY-MM-DD_HHMM.md`.
- Uygulama kodunu (`src/`, `server/`, `public/`) yalnızca sahibin açık isteğiyle değiştir.
- E-posta adresi, anahtar, parola yazma.
