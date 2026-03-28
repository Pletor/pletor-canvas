#!/usr/bin/env bash
# Pletor Canvas — spuštění lokálního K8s clusteru (kind)
# Použití: ./scripts/kind-setup.sh
set -euo pipefail

CLUSTER_NAME="pletor"
CONTEXT="kind-${CLUSTER_NAME}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Pletor Canvas — Kind Cluster Setup ==="

# Zkontroluj závislosti
for cmd in kind kubectl docker; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "CHYBA: '$cmd' není nainstalován nebo není v PATH"
    exit 1
  fi
done

# Zkontroluj Docker
if ! docker info &> /dev/null; then
  echo "CHYBA: Docker neběží — spusť Docker Desktop"
  exit 1
fi

# Zjisti jestli cluster už existuje
if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
  echo "✓ Cluster '${CLUSTER_NAME}' už existuje"
else
  echo "→ Vytvářím cluster '${CLUSTER_NAME}'..."
  kind create cluster --config "${PROJECT_DIR}/infrastructure/local/kind-config.yaml"
  echo "✓ Cluster vytvořen"
fi

# Nastav kubectl kontext
kubectl config use-context "${CONTEXT}"

# Zkontroluj nody
echo "→ Čekám na Ready nody..."
kubectl wait --for=condition=Ready nodes --all --timeout=120s

# Zjisti jestli nginx-ingress je nainstalovaný
if ! kubectl get namespace ingress-nginx &> /dev/null; then
  echo "→ Instaluji nginx-ingress controller..."
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.3/deploy/static/provider/kind/deploy.yaml
  echo "→ Čekám na nginx-ingress (může trvat 2-3 min)..."
  kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=180s
  echo "✓ nginx-ingress připraven"
else
  echo "✓ nginx-ingress už je nainstalovaný"
fi

echo ""
echo "=== Cluster připraven! ==="
echo ""
echo "Stav clusteru:"
kubectl get nodes
echo ""
echo "Další kroky:"
echo "  1. Sestav Docker images:  docker build -t pletor-frontend:local ./frontend"
echo "                            docker build -t pletor-backend:local ./backend"
echo "  2. Nahraj do clusteru:    kind load docker-image pletor-frontend:local --name ${CLUSTER_NAME}"
echo "                            kind load docker-image pletor-backend:local --name ${CLUSTER_NAME}"
echo "  3. Vytvoř K8s secrets:    viz scripts/kind-secrets.sh"
echo "  4. Nasaď aplikaci:        kubectl apply -k k8s/overlays/local/"
echo "  5. Přistup na:            http://localhost:8080"
