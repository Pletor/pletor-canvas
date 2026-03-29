# K8s Secrets

Secrets se NIKDY necommitují do gitu. Vytvoř je ručně:

```bash
# Backend secrets
kubectl create secret generic backend-secrets \
  --namespace pletor \
  --from-literal=DATABASE_URL="postgresql+asyncpg://pletor:PASSWORD@postgres:5432/pletor" \
  --from-literal=ANTHROPIC_API_KEY="sk-ant..." \
  --from-literal=WORKFLOWY_API_KEY="..."

# Postgres secrets
kubectl create secret generic postgres-secrets \
  --namespace pletor \
  --from-literal=username="pletor" \
  --from-literal=password="SILNE_HESLO"
```
