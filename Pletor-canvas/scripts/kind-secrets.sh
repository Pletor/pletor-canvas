#!/usr/bin/env bash
# Pletor Canvas — vytvoření K8s secrets pro lokální cluster
# Použití: ANTHROPIC_API_KEY=sk-ant-... ./scripts/kind-secrets.sh
set -euo pipefail

CONTEXT="kind-pletor"
NAMESPACE="pletor"

echo "=== Vytváření K8s secrets ==="

# Vytvoř namespace pokud neexistuje
kubectl create namespace "${NAMESPACE}" --context "${CONTEXT}" 2>/dev/null || true

# Backend secrets
kubectl create secret generic backend-secrets \
  --namespace="${NAMESPACE}" \
  --context="${CONTEXT}" \
  --from-literal=DATABASE_URL="postgresql+asyncpg://pletor:pletor@postgres:5432/pletor" \
  --from-literal=ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" \
  --dry-run=client -o yaml | kubectl apply -f -

# Postgres secrets
kubectl create secret generic postgres-secrets \
  --namespace="${NAMESPACE}" \
  --context="${CONTEXT}" \
  --from-literal=username="pletor" \
  --from-literal=password="pletor" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✓ Secrets vytvořeny"
kubectl get secrets -n "${NAMESPACE}" --context "${CONTEXT}"
