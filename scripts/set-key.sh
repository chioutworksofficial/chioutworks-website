#!/bin/bash
# Bir anahtarı .env dosyasına güvenle yazar. Yazdığın değer ekranda görünmez.
# Kullanım: bash scripts/set-key.sh GROQ_API_KEY
set -e
cd "$(dirname "$0")/.."
KEY="$1"
if [ -z "$KEY" ]; then echo "Kullanım: bash scripts/set-key.sh ANAHTAR_ADI  (ör. GROQ_API_KEY)"; exit 1; fi
printf "%s değerini yapıştır ve Enter'a bas (ekranda görünmez): " "$KEY"
read -rs VAL; echo
VAL="$(printf %s "$VAL" | tr -d '[:space:]')"
if [ -z "$VAL" ]; then echo "Boş değer, hiçbir şey değişmedi."; exit 1; fi
touch .env; chmod 600 .env
python3 - "$KEY" "$VAL" <<'PY'
import sys, re, pathlib
k, v = sys.argv[1], sys.argv[2]
p = pathlib.Path('.env'); s = p.read_text(encoding='utf-8') if p.exists() else ''
line = f'{k}={v}'
if re.search(rf'^{re.escape(k)}=.*$', s, flags=re.M):
    s = re.sub(rf'^{re.escape(k)}=.*$', lambda m: line, s, count=1, flags=re.M)
else:
    s = s.rstrip('\n') + '\n' + line + '\n'
p.write_text(s, encoding='utf-8')
PY
unset VAL
echo "$KEY kaydedildi (değer gösterilmedi)."
