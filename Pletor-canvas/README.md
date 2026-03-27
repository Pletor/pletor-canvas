# Pletor Canvas

Vizuální orchestrační IDE pro projektové řízení. Nekonečný canvas s uzly, hranami a AI generováním kódu.

## Architektura

```
frontend/    — React 18 + Vite + React Flow + Zustand
backend/     — Python 3.12 + FastAPI + SQLAlchemy 2.0 + Anthropic SDK
k8s/         — Kubernetes manifesty (Kustomize base + overlays)
```

## Spuštění (lokální vývoj)

### Backend

```bash
cd backend
cp .env.example .env          # nastav API klíče
pip install -e ".[dev]"
python -m alembic upgrade head
uvicorn app.main:app --reload --port 8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose (celý stack)

```bash
cp backend/.env.example backend/.env   # nastav API klíče
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1/health
- API docs: http://localhost:8080/docs

## Testy

```bash
cd backend
pytest                    # 39 testů
ruff check app/           # linting
```

## Env proměnné

| Proměnná | Popis | Default |
|----------|-------|---------|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite+aiosqlite:///./dev.db` |
| `PORT` | Port backendu | `8080` |
| `CORS_ORIGIN` | Povolený origin pro CORS | `http://localhost:3000` |
| `ANTHROPIC_API_KEY` | Claude API klíč pro AI agenta | — |
| `WORKFLOWY_API_KEY` | WorkFlowy API klíč | — |

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):
1. **Lint + types** — ruff (backend), tsc (frontend)
2. **Testy** — pytest
3. **Docker build** — push do GHCR (jen main)
4. **Deploy staging** — automaticky
5. **Deploy production** — manuální schválení
