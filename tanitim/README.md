# Tanıtım: reklam ve video çalışma alanı

Chioutworks sitesini tanıtan reklam, kısa video ve görseller burada hazırlanır. Sitenin kodu değildir; Vite bu klasörü izlemez.

## Klasörler
| Klasör | İçerik |
|---|---|
| `senaryolar/` | Video metinleri ve sahne planları (her dil ayrı dosya: `*.tr.md`, `*.de.md`, `*.el.md`, `*.en.md`) |
| `ses/` | ElevenLabs seslendirmeleri ve müzik (dil başına ayrı dosya) |
| `gorseller/` | Kapak, küçük resim, ekran görüntüleri (demo görüntüleri: `npm run shots`) |
| `videolar/` | Bitmiş çıktılar (MP4; dikey 9:16, kare 1:1, yatay 16:9) |
| `kaynak-dosyalar/` | Blender, CapCut, Keynote proje dosyaları |

## Bu bilgisayarda bulunan araçlar (2026-11-13 taraması)
- **Remotion** (kodla video): `~/Desktop/programlama projeleri/Claude Animasyon Sistemi` projesinde kurulu (`remotion`, `@remotion/three`). O proje ayrıdır; tanıtım videoları için burada ayrı bir Remotion projesi açılır, o projeye dokunulmaz.
- **Blender** (3D): `/Applications/Blender.app`, komut satırında `blender`.
- **CapCut** (kurgu, altyazı): `/Applications/CapCut.app`.
- **Keynote** (hızlı sunum/animasyon), **GarageBand** (ses düzenleme).
- **ffmpeg** (dönüştürme, kırpma, birleştirme): `/opt/homebrew/bin/ffmpeg`.
- **ElevenLabs** (seslendirme, müzik, görsel/video üretimi): Claude Code'a bağlı MCP üzerinden. Kredi harcar; her üretimden önce sahibin onayı.
- **Claude Design** (tasarım/prototip sayfaları): Claude'un Artifact "Design" türüyle afiş, sosyal medya görseli taslağı.
- Ayrıca: `TmprService` ve bu site `gsap` + `three` kullanıyor (site içi animasyonlar videoya kaydedilebilir).

## Kurallar (site kurallarıyla aynı)
- Diller asla karışmaz: her video tek dilde (tr, de, el, en ayrı).
- Anlatım tekil ("ben"); "biz" ve kişi adı yok.
- Lacivert marka renkleri (`agents/knowledge/BRAND.md`); mor ve pembe yok.
- E-posta adresi, sahte yorum, sahte sayı, toplantı veya SMS vaadi yok.
- Ücretli üretim (ElevenLabs kredisi vb.) ve yayımlama yalnızca sahibin açık onayıyla.

## İlk adımlar (öneri)
1. 30 sn dikey tanıtım: sorun → çözüm (asistan, otomasyon, demo) → "ücretsiz yazılı değerlendirme".
2. Her dil için ElevenLabs seslendirme (Almanca öncelikli).
3. Site ekran kayıtları + Remotion ile metin/logo animasyonu.
4. CapCut'ta altyazı ve son kurgu.
