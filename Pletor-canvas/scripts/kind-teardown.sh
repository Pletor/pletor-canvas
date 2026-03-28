#!/usr/bin/env bash
# Pletor Canvas — smazání lokálního K8s clusteru
# Použití: ./scripts/kind-teardown.sh
set -euo pipefail

CLUSTER_NAME="pletor"

echo "=== Mazání clusteru '${CLUSTER_NAME}' ==="
read -r -p "Opravdu smazat cluster? Všechna data budou ztracena. [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Zrušeno."
  exit 0
fi

kind delete cluster --name "${CLUSTER_NAME}"
echo "✓ Cluster smazán"
