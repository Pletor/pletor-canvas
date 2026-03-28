#!/usr/bin/env bash
# Pletor Canvas — jednorázový setup pro nového vývojáře
set -euo pipefail

echo "=== Pletor Canvas Setup ==="

# Zkontroluj požadované nástroje
for cmd in docker node npm python3; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "CHYBA: $cmd není nainstalován"
    exit 1
  fi
done

# Vytvoř .env soubory pokud neexistují
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✓ Vytvořen backend/.env z .env.example — vyplň API klíče"
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ Vytvořen .env z .env.example"
fi

# Instalace frontend závislostí
echo "→ Instalace frontend závislostí..."
cd frontend && npm ci && cd ..

# Instalace backend závislostí (Python)
echo "→ Instalace backend závislostí..."
cd backend && pip install -e ".[dev]" -q && cd ..

echo ""
echo "=== Setup dokončen! ==="
echo ""
echo "Spuštění:"
echo "  ./scripts/dev.sh    ← lokální dev (Docker Compose)"
echo "  cd frontend && npm run dev  ← pouze frontend (Vite)"
