# Acil durum: anahtar sızarsa (2026-11-19)

Değerler hiçbir zaman bu dosyaya yazılmaz. Yalnızca ad ve nerede yenileneceği.

| Ayar (.env) | Nerede yenilenir | Sonra |
|---|---|---|
| SUPABASE_SECRET_KEY | Supabase → Chioutworks → Project Settings → API Keys → eskisini sil, yenisini oluştur | .env + Vercel ayarı |
| GROQ_API_KEY | Sağlayıcının konsolu → API Keys → iptal et, yenisini oluştur | .env + Vercel |
| GEMINI_API_KEY | Sağlayıcının konsolu → API keys → sil, yenisini oluştur | .env + Vercel |
| RESEND_API_KEY | E-posta servisi → API Keys → iptal et, yenisini oluştur | .env + Vercel |
| ADMIN_TOKEN | Kendin belirlersin (uzun, rastgele) | .env + Vercel; tüm panel oturumları kapanır |
| ABUSE_SALT | Yeni rastgele değer | .env + Vercel; eski kilit kayıtları eşleşmez |
| CRON_SECRET (eklenince) | Yeni rastgele değer | .env + Vercel |
| GitHub oturumu | github.com → Settings → Applications / Sessions → oturumları kapat; `gh auth logout` + `gh auth login` | |
| Supabase hesap anahtarı (sbp_) | supabase.com/dashboard/account/tokens → Revoke | Projede hiç tutulmaz |

Sıra: 1) sızan anahtarı iptal et, 2) yenisini .env'e yaz, 3) Vercel → Project → Settings → Environment Variables'ta güncelle (Sensitive), 4) Vercel'de yeniden yayınla, 5) harcama/kayıt panellerinde olağandışı kullanım var mı bak.
Koruma katmanları: `.githooks/pre-commit` (scripts/check-secrets.mjs) commit'te anahtar/env/data engeller; GitHub secret scanning + push protection açık.
