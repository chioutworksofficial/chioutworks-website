---
tür: "proje"
durum: "aktif"
proje: "chioutworks"
tarih: "2026-11-13"
tags: ["proje", "teknik"]
---

# Yığın ve komutlar

## Yığın
- React 19 + TypeScript, Vite 6, Tailwind CSS v4, react-router
- API: Express (`server/`)
- Gemini Live (sesli asistan), Groq (yazılı sohbet, analiz), Resend (e-posta, alan adı bekliyor)
- Veri: JSON (`data/`, git dışı)

## Komutlar
```
npm run dev        Vite :3000 + API :3001
npm run build      tsc -b && vite build   (bu makinede bazen donar)
npm run shots      demo ekran görüntüleri (dev sunucu açık olmalı)
npm run ai-assets  yerel YZ model dosyalarını indirir
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.node.json
bash scripts/set-key.sh ANAHTAR_ADI   (değer ekranda görünmez)
~/.local/bin/graphify update .
```

## .env (değerler gizli)
Dolu: yönetici şifresi, Gemini, Groq, Resend anahtarları. Alan adı bekleyen: gönderen ve bildirim e-posta ayarları.

## Notlarım

(Bu başlığın altına elle yazdıklarınız korunur.)
