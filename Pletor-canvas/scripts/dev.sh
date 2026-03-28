#!/usr/bin/env bash
# Pletor Canvas — spuštění lokálního dev prostředí
set -euo pipefail

echo "=== Pletor Canvas — Dev Start ==="

# Zkontroluj .env
if [ ! -f .env ] && [ ! -f backend/.env ]; then
  echo "VAROVÁNÍ: .env nenalezen — spusť nejdřív ./scripts/setup.sh"
fi

# Spuštění Docker Compose
docker compose up --build "$@"
