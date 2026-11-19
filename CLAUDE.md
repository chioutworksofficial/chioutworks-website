# Chioutworks Resmi Web Sitesi: Claude Talimatları

Bu dosya Claude Code için ana talimattır. Ayrıntılı proje belleği `context/`, bakım ajanları `agents/` altındadır.

## Proje
Tek kişilik bir teknoloji işletmesinin (Almanya, 2023) hizmet sitesi: iş otomasyonu, web uygulamaları, YZ entegrasyonu, dijital strateji. Hedef kitle: Almanya, Türkiye ve Yunanistan'daki KOBİ'ler. Dil: tr, en, de, el. Amaç: yazılı talep (form, intake portalı, asistan).

## Yığın
React 19 + TypeScript, Vite 6, Tailwind CSS v4, react-router. API: Express (`server/`). Gemini Live (sesli asistan), Groq (yazılı sohbet ve analiz), Resend (e-posta, alan adı bekliyor). Veri: JSON (`data/`, git dışı).

## Klasörler
```
src/            arayüz (components/, site/, pages/, lib/, data/, hooks/, styles/)
  translations.ts, site/i18n   tüm metinler (tr/en/de/el)
  styles/theme.css             tasarım değişkenleri
server/         Express API (index, geminiLive, intake, analyze, abuse, guard'lar)
data/           çalışma verisi (git dışı, içeriğini yazdırma)
scripts/        yardımcı betikler
public/         statik dosyalar (kapigiris/ ve assets-ai/ dokunulmaz)
context/        proje belleği: özet, hedefler, kararlar, kurallar, kaynaklar
agents/         bakım ajanları ve çerçevesi
_yedek/         arşiv (kalıcı silme yok)
graphify-out/   bilgi grafiği
tanitim/        reklam ve tanıtım videoları çalışma alanı (Remotion, ElevenLabs, Blender, CapCut)
obsidian/       Obsidian kasası "Chioutworks Official" (proje notları; Claude yalnızca sahibin isteğiyle günceller)
```

## Komutlar
```
npm run dev        Vite :3000 + API :3001 birlikte
npm run build      tsc -b && vite build
npm run shots      demo ekran görüntüleri (dev sunucu açık olmalı)
npm run ai-assets  yerel YZ model dosyalarını public/assets-ai içine indirir
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.node.json
```
`npm run build` bu makinede bazen donar; düşük riskli işte iki `tsc` yeterlidir.

## Tasarım sistemi
Lacivert tema (`[data-site-theme='liquid']` içinde, `src/styles/theme.css`). Yüzeyler: `--c-void`, `--c-abyss`, `--c-deep-sea`, `--c-cobalt` (yalnızca vurgu kartları). Vurgu: `--c-signal`, `--c-pulse`, `--c-lilac`. Yazı: Figtree (`--font-display`), Inter (`--font-body`), IBM Plex Mono (`--font-mono`). Köşe: `--r-card`, `--r-input`, `--r-pill`. Demolar kendi sektör temasını korur. Mor/pembe tonlar yasak. Ayrıntı: `agents/knowledge/BRAND.md`.

## Dil kuralları
- Her sayfa, kart ve asistan yanıtı tek dilde; diller asla karışmaz.
- Yeni metin `src/translations.ts` veya `src/site/i18n` içinde dört dile birden eklenir.
- Anlatım tekildir (sahip tek başına çalışır): "biz" ve kişi adı kullanılmaz.
- `translations.ts` içindeki `as const` kaldırılmaz.

## Gizlilik ve hukuk
- Sitede, belgelerde ve kodda e-posta adresi yazılmaz; iletişim forma yönlendirilir.
- `.env*` ve `data/*.json` commit edilmez, içeriği yazdırılmaz.
- Yapay zekâ ve diğer sağlayıcılar gizlilik politikasında adıyla değil, tür + konum + aktarım güvencesiyle anılır (sahibin kararı, 2026-11-19; GDPR m. 13 "alıcı kategorileri"). Adlar yalnızca GDPR m. 15 başvurusunda yazılı verilir. Yeni sağlayıcıda yazılı güvencenin (DPF / AB standart sözleşme maddeleri) o sağlayıcı için doğru olduğu kontrol edilir.
- Toplantı, SMS ve sahte yorum vaadi yok. Hukuki metinler avukat incelemesinin yerini tutmaz.

## Yap
- **Güvenlik varsayılan:** her yeni özellik ve entegrasyon (Supabase, Vercel, Stripe, Resend, giriş, yeni yapay zekâ sağlayıcısı vb.) `context/GUVENLIK.md` standardına göre yapılır ve ilgili kontrol listesi geçilir; sahibin ayrıca istemesi gerekmez. Geçilemeyen madde sahibe bildirilir.
- Renk ve yazı tipi için yalnızca CSS değişkeni kullan; bileşende sabit hex yazma.
- Değişiklikten sonra iki `tsc` komutunu çalıştır, ardından `graphify update .`.
- Çelişkili veya eski bilgi görürsen sessizce seçme, sahibe bildir.
- Kalıcı karar çıkarsa `context/kararlar.md` dosyasına ekle ("hafızayı güncelle" için `proje-hafizasi` becerisi).

## Yapma
- Eski bileşenleri (`CinematicGate`, `VillaTour`, `ClubXInvestors` vb.) silme.
- `node_modules`, `public/kapigiris/` içine dokunma. `obsidian/` yalnızca sahibin isteğiyle güncellenir.
- Sahibin açık isteği olmadan yayımlama, kalıcı silme, harici mesaj, ücretli servis açma.
- Tarayıcıda canlı testi sahibin yerine yapma; sahip kendi bakar.
- Sır, anahtar, parola yazma.

## Yönlendirme
- **Ana harita: `context/HARITA.md`.** Her görevden önce oku: istenen şey zaten yapılmışsa bozma, sahibe "yapıldı, şurada" de; kısmen yapılmışsa eksiği söyle. Her görevden sonra güncelle. Oturum sonunda ve sahip sorduğunda yapıldı/yapılacak tablosunu ver.
- Her görevde `context/README.md` haritasını oku (özet ve kurallar zorunlu).
- Bakım ajanları: `agents/AGENT_REGISTRY.md`.
- Eski tasarım belgeleri: `_yedek/` (güncel değil).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
