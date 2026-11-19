! # Chioutworks Resmi Web Sitesi

Tek kişilik bir teknoloji işletmesinin hizmet sitesi: iş otomasyonu, web uygulamaları, YZ entegrasyonu ve dijital strateji. Türkçe, İngilizce, Almanca ve Yunanca yayınlanır. Hedef: yazılı talep (form, müşteri intake portalı, sesli ve yazılı asistan).

## Çalıştırma

```
npm install
cp .env.example .env     # anahtarları doldur (git'e eklenmez)
npm run dev              # Vite :3000 + API :3001
npm run build            # üretim derlemesi
npm run shots            # demo ekran görüntüleri
npm run ai-assets        # yerel YZ model dosyalarını indirir
```

Tip denetimi: `npx tsc --noEmit -p tsconfig.app.json` ve `-p tsconfig.node.json`.

## Yapı

| Klasör                | İçerik                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| `src/`                | React arayüzü, metinler (`translations.ts`, `site/i18n`), tema (`styles/theme.css`) |
| `server/`             | Express API: Gemini Live, Groq, intake, yönetim                                     |
| `data/`               | Çalışma verisi (git dışı)                                                           |
| `scripts/`, `public/` | Yardımcı betikler, statik dosyalar                                                  |
| `context/`            | Proje belleği: özet, hedefler, kararlar, kurallar, kaynaklar                        |
| `agents/`             | Bakım ajanları (dil, içerik, görsel, gizlilik, sürüm)                               |
| `_yedek/`             | Arşiv; hiçbir şey kalıcı silinmedi                                                  |

Kurallar için `CLAUDE.md`, harita için `context/README.md`.

---

## English

Website of a one-person tech business (automation, web apps, AI integration, digital strategy) in Turkish, English, German and Greek. Run `npm install`, copy `.env.example` to `.env`, then `npm run dev` (Vite on :3000, API on :3001). Stack: React 19, TypeScript, Vite 6, Tailwind v4, Express, Gemini Live, Groq. Rules are in `CLAUDE.md`, project memory in `context/`, maintenance agents in `agents/`, archived docs in `_yedek/`.
