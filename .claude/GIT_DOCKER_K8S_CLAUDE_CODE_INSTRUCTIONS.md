# ============================================================
# INSTRUKCE PRO CLAUDE CODE: Git + Docker + Kubernetes
# Projekt Pletor — vlastní cloud infrastruktura
# ============================================================
# Umísti do: .claude/instructions.md v projektu Pletor
# (přidej za existující instrukce)
# ============================================================


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. GIT — Feature Branch Workflow
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Branching strategie: GitHub Flow (2026 standard)

Tento projekt používá **GitHub Flow** — jednoduchou strategii
vhodnou pro kontinuální delivery. Žádný Gitflow, žádná develop
větev. Main je VŽDY deployable.

### Větve:

```
main                              ← produkce, VŽDY funkční
  ├── feature/canvas-node-types   ← nová feature
  ├── feature/workflowy-sync      ← nová feature
  ├── fix/api-pagination-offset   ← oprava bugu
  ├── refactor/payment-provider   ← refactoring
  └── chore/update-dependencies   ← údržba
```

### ZLATÉ PRAVIDLO: Každá práce = nová větev

NIKDY necommituj přímo do main. Ani jeden řádek.
Každá změna — feature, fix, refactor, docs — má vlastní větev.

### Životní cyklus větve:

```bash
# 1. VYTVOŘ větev z aktuálního main
git checkout main
git pull origin main
git checkout -b feature/subscription-plan-selector

# 2. PRACUJ — malé, logické commity
git add src/features/subscriptions/SubscriptionPlanSelector.tsx
git commit -m "feat(subscriptions): add plan selector component"

git add src/features/subscriptions/hooks/useSubscriptionPlan.ts
git commit -m "feat(subscriptions): add useSubscriptionPlan hook"

git add src/features/subscriptions/__tests__/
git commit -m "test(subscriptions): add plan selector integration tests"

# 3. PUSH na remote
git push -u origin feature/subscription-plan-selector

# 4. PULL REQUEST — vytvoř PR do main
#    PR musí obsahovat:
#    - Popis co a proč
#    - Screenshot (pokud UI změna)
#    - Checklist: testy projdou, lint projde, build projde

# 5. REVIEW — Claude Code nebo kolega zkontroluje
#    Kontroluje: architektura, pojmenování, testy, security

# 6. MERGE — squash merge do main
git checkout main
git pull origin main
git merge --squash feature/subscription-plan-selector
git commit -m "feat(subscriptions): add subscription plan selector (#42)"
git push origin main

# 7. SMAŽ větev
git branch -d feature/subscription-plan-selector
git push origin --delete feature/subscription-plan-selector
```

### Pojmenování větví:

```
feature/[popis-kebab-case]     ← nová funkce
fix/[popis-kebab-case]         ← oprava
refactor/[popis-kebab-case]    ← refactoring (nemění chování)
chore/[popis-kebab-case]       ← údržba (deps, config, CI)
docs/[popis-kebab-case]        ← dokumentace
test/[popis-kebab-case]        ← přidání testů
perf/[popis-kebab-case]        ← optimalizace výkonu

Příklady:
  feature/canvas-drag-drop-nodes
  feature/workflowy-api-integration
  feature/stripe-webhook-handler
  fix/canvas-node-overlap-on-resize
  refactor/extract-payment-provider-interface
  chore/upgrade-react-19
```

### Conventional Commits (povinné):

```
Formát: typ(scope): popis

typ:
  feat     — nová funkce viditelná uživatelem
  fix      — oprava bugu
  refactor — změna kódu bez změny chování
  test     — přidání nebo oprava testů
  docs     — dokumentace
  chore    — údržba (deps, config, CI/CD)
  style    — formátování (ne CSS, ale kód style)
  perf     — optimalizace výkonu
  ci       — CI/CD pipeline změny

scope:
  Název feature složky nebo oblasti:
  (canvas), (workflowy), (subscriptions), (auth), (api), (docker), (k8s)

Příklady:
  feat(canvas): add drag-and-drop node creation
  fix(workflowy): resolve sync race condition on rapid edits
  refactor(subscriptions): extract StripePaymentProvider interface
  test(api): add integration tests for subscription endpoints
  chore(docker): upgrade nginx base image to 1.27
  ci(k8s): add staging deployment step to pipeline
  perf(canvas): implement virtualized rendering for 200+ nodes

ZAKÁZANÉ commit messages:
  ❌ "update"
  ❌ "fix stuff"
  ❌ "wip"
  ❌ "asdf"
  ❌ "final fix"
  ❌ "changes"
```

### Git příkazy — denní workflow:

```bash
# Ráno — synchronizace
git checkout main
git pull origin main
git checkout feature/my-feature
git rebase main                    # udržuj větev aktuální

# Průběh práce
git status                         # co se změnilo?
git diff                           # jaké přesně změny?
git add -p                         # stage po částech (ne git add .)
git commit -m "feat(scope): popis"

# Před PR
git log --oneline -10              # zkontroluj historii
git rebase -i HEAD~3               # squash WIP commity

# Po merge
git checkout main
git pull origin main
git branch -d feature/my-feature

# Záchranné operace
git stash                          # odlož rozpracované změny
git stash pop                      # vrať odložené změny
git reset HEAD~1                   # vrať poslední commit (zachovej změny)
git log --oneline --graph --all    # vizuální historie
```

### Pravidla pro Claude Code:

```
PŘED každou prací:
  1. git checkout main && git pull
  2. git checkout -b [typ]/[popis]

PŘI práci:
  3. Malé commity — jeden commit = jedna logická změna
  4. git add -p (ne git add . na všechno najednou)
  5. Conventional commit message

PO dokončení:
  6. git push -u origin [branch]
  7. Vytvoř PR popis
  8. Zkontroluj: testy, lint, build

NIKDY:
  - git push origin main (přímo do main)
  - git push --force (na sdílenou větev)
  - git add . && git commit -m "update" (líné commity)
  - Commit bez spuštění testů
```


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. DOCKER — Kontejnerizace projektu
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Projekt Pletor — Docker struktura:

```
Pletor/
  frontend/
    Dockerfile              ← multi-stage: build → nginx
    nginx.conf              ← SPA routing + API proxy + cache
    .dockerignore
  backend/
    Dockerfile              ← multi-stage: build → node
    .dockerignore
  docker-compose.yml        ← lokální dev prostředí
  docker-compose.prod.yml   ← produkční override
  .env.example              ← vzorové env variables
```

## Frontend Dockerfile:

```dockerfile
# ============================
# Stage 1: Build
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Nejdřív package.json → lepší Docker cache
COPY package.json package-lock.json ./
RUN npm ci --silent

# Pak zdrojový kód
COPY . .
RUN npm run build

# ============================
# Stage 2: Production (Nginx)
# ============================
FROM nginx:1.27-alpine AS production

# Zkopíruj buildnuté soubory
COPY --from=builder /app/dist /usr/share/nginx/html

# Zkopíruj Nginx konfiguraci
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security: non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

## Frontend nginx.conf:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # ──── SPA Routing ────
    # Všechny cesty → index.html (React Router / Vue Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ──── API Proxy ────
    # Frontend volá /api/* → Nginx přepošle na backend službu
    location /api/ {
        proxy_pass http://backend:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket podpora (pro real-time canvas updates)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouty
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ──── Statické soubory — agresivní cache ────
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ──── Security Headers ────
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # ──── Gzip Compression ────
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json
               application/javascript application/xml+rss
               application/atom+xml image/svg+xml;
}
```

## Backend Dockerfile:

```dockerfile
# ============================
# Stage 1: Build
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .
RUN npm run build
# Výstup: /app/dist/

# Odstraň devDependencies
RUN npm prune --production

# ============================
# Stage 2: Production
# ============================
FROM node:20-alpine AS production

WORKDIR /app

# Jen to, co potřebujeme v produkci
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Security: non-root user
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/server.js"]
```

## docker-compose.yml (lokální dev):

```yaml
version: "3.9"

services:
  # ──── Frontend ────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # ──── Backend ────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://pletor:pletor_secret@db:5432/pletor
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-jwt-secret-change-in-production
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
      - WORKFLOWY_API_KEY=${WORKFLOWY_API_KEY:-}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  # ──── PostgreSQL ────
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: pletor
      POSTGRES_PASSWORD: pletor_secret
      POSTGRES_DB: pletor
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pletor -d pletor"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ──── Redis ────
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

## .dockerignore (oba — frontend i backend):

```
node_modules
dist
build
.git
.env
.env.local
*.md
coverage
.vscode
.idea
```

## Jeden příkaz — celý projekt:

```bash
# Spuštění celého projektu
docker compose up --build

# Spuštění na pozadí
docker compose up --build -d

# Zastavení
docker compose down

# Reset (smaže data DB)
docker compose down -v && docker compose up --build
```


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. KUBERNETES — Produkční deployment
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## K8s struktura v projektu:

```
Pletor/
  k8s/
    base/                          ← sdílená konfigurace
      namespace.yaml
      frontend/
        deployment.yaml
        service.yaml
      backend/
        deployment.yaml
        service.yaml
      database/
        statefulset.yaml
        service.yaml
        pvc.yaml
      redis/
        deployment.yaml
        service.yaml
      ingress.yaml
      configmap.yaml
    overlays/
      staging/
        kustomization.yaml         ← staging specifické overrides
        configmap-patch.yaml
      production/
        kustomization.yaml         ← produkční overrides
        configmap-patch.yaml
        hpa.yaml                   ← autoscaling
    secrets/
      .gitkeep                     ← secrets NIKDY v gitu
      README.md                    ← jak vytvořit secrets
```

## Namespace:

```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: pletor
  labels:
    app: pletor
```

## Frontend Deployment:

```yaml
# k8s/base/frontend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: pletor
  labels:
    app: pletor
    component: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: pletor
      component: frontend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # max 1 navíc během update
      maxUnavailable: 0     # vždy min replicas dostupných
  template:
    metadata:
      labels:
        app: pletor
        component: frontend
    spec:
      containers:
        - name: frontend
          image: ghcr.io/tvuj-username/pletor-frontend:latest
          ports:
            - containerPort: 80
              protocol: TCP
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 30
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "200m"
```

## Backend Deployment:

```yaml
# k8s/base/backend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: pletor
  labels:
    app: pletor
    component: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: pletor
      component: backend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: pletor
        component: backend
    spec:
      containers:
        - name: backend
          image: ghcr.io/tvuj-username/pletor-backend:latest
          ports:
            - containerPort: 3001
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: backend-secrets
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 10
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /api/v1/health
              port: 3001
            initialDelaySeconds: 20
            periodSeconds: 30
            failureThreshold: 3
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

## Database StatefulSet:

```yaml
# k8s/base/database/statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: pletor
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: pletor
      component: postgres
  template:
    metadata:
      labels:
        app: pletor
        component: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-secrets
                  key: username
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secrets
                  key: password
            - name: POSTGRES_DB
              value: pletor
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
          readinessProbe:
            exec:
              command: ["pg_isready", "-U", "pletor"]
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "1Gi"
              cpu: "500m"
  volumeClaimTemplates:
    - metadata:
        name: postgres-data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

## Ingress (s TLS):

```yaml
# k8s/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pletor-ingress
  namespace: pletor
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/rate-limit-rps: "100"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.pletor.com
      secretName: pletor-tls
  rules:
    - host: app.pletor.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 3001
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

## Kustomization (staging):

```yaml
# k8s/overlays/staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: pletor-staging

resources:
  - ../../base

patches:
  - path: configmap-patch.yaml

# Staging: 1 replika, menší resources
replicas:
  - name: frontend
    count: 1
  - name: backend
    count: 1

images:
  - name: ghcr.io/tvuj-username/pletor-frontend
    newTag: staging
  - name: ghcr.io/tvuj-username/pletor-backend
    newTag: staging
```

## CI/CD — GitHub Actions → K8s:

```yaml
# .github/workflows/deploy.yml
name: Build, Test & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/${{ github.repository_owner }}/pletor

jobs:
  # ──── Lint + Type Check ────
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci --workspace=frontend --workspace=backend
      - run: npm run lint --workspace=frontend --workspace=backend
      - run: npm run type-check --workspace=frontend --workspace=backend

  # ──── Testy ────
  test:
    runs-on: ubuntu-latest
    needs: quality
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

  # ──── Build + Push Docker images ────
  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ env.IMAGE_PREFIX }}-frontend:${{ github.sha }}
            ${{ env.IMAGE_PREFIX }}-frontend:latest

      - name: Build & push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ env.IMAGE_PREFIX }}-backend:${{ github.sha }}
            ${{ env.IMAGE_PREFIX }}-backend:latest

  # ──── Deploy to Staging ────
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Set up kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubeconfig
        run: echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > ~/.kube/config

      - name: Deploy to staging
        run: |
          cd k8s/overlays/staging
          kustomize edit set image \
            ${{ env.IMAGE_PREFIX }}-frontend:${{ github.sha }} \
            ${{ env.IMAGE_PREFIX }}-backend:${{ github.sha }}
          kustomize build . | kubectl apply -f -
          kubectl rollout status deployment/frontend -n pletor-staging --timeout=120s
          kubectl rollout status deployment/backend -n pletor-staging --timeout=120s

  # ──── Deploy to Production (manuální schválení) ────
  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production    # vyžaduje manuální approval v GitHub
    steps:
      - uses: actions/checkout@v4

      - name: Set up kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubeconfig
        run: echo "${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > ~/.kube/config

      - name: Deploy to production
        run: |
          cd k8s/overlays/production
          kustomize edit set image \
            ${{ env.IMAGE_PREFIX }}-frontend:${{ github.sha }} \
            ${{ env.IMAGE_PREFIX }}-backend:${{ github.sha }}
          kustomize build . | kubectl apply -f -
          kubectl rollout status deployment/frontend -n pletor --timeout=180s
          kubectl rollout status deployment/backend -n pletor --timeout=180s
```


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. SKRIPTY — Jeden příkaz
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## scripts/setup.sh — první spuštění:

```bash
#!/bin/bash
set -euo pipefail

echo "=== Pletor Setup ==="

# Zkontroluj dependencies
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "Docker Compose is required"; exit 1; }

# Vytvoř .env z example
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it with your values"
fi

# Build a spusť
docker compose up --build -d

# Počkej na DB
echo "Waiting for database..."
sleep 5

# Spusť migrace
docker compose exec backend npx prisma migrate deploy

# Seed data
docker compose exec backend npx prisma db seed

echo ""
echo "=== Pletor is running ==="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo "API docs: http://localhost:3001/api/v1/health"
echo ""
```

## scripts/dev.sh — denní spuštění:

```bash
#!/bin/bash
set -euo pipefail
docker compose up --build
```

## scripts/test.sh — spuštění testů:

```bash
#!/bin/bash
set -euo pipefail

echo "=== Running tests ==="

# Lint
echo "→ Lint..."
npm run lint --workspace=frontend --workspace=backend

# Type check
echo "→ Type check..."
npm run type-check --workspace=frontend --workspace=backend

# Testy
echo "→ Tests..."
npm test

echo "=== All tests passed ==="
```

## scripts/deploy.sh — manuální deploy:

```bash
#!/bin/bash
set -euo pipefail

ENV=${1:-staging}
TAG=${2:-latest}

echo "=== Deploying to $ENV (tag: $TAG) ==="

cd k8s/overlays/$ENV
kustomize edit set image \
  ghcr.io/tvuj-username/pletor-frontend:$TAG \
  ghcr.io/tvuj-username/pletor-backend:$TAG

kustomize build . | kubectl apply -f -

echo "Waiting for rollout..."
kubectl rollout status deployment/frontend -n pletor-$ENV --timeout=120s
kubectl rollout status deployment/backend -n pletor-$ENV --timeout=120s

echo "=== Deploy complete ==="
```


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRAVIDLA PRO CLAUDE CODE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Při každé práci na Pletor projektu:

1. **Git first:** Než cokoli udělám, vytvořím větev.
2. **Docker always:** Každá změna musí fungovat v docker-compose.
3. **Test before commit:** Spustím testy před commitem.
4. **K8s aware:** Změny musí být kompatibilní s K8s deployment.

## Konkrétní workflow:

```bash
# Začátek práce na nové feature
git checkout main && git pull
git checkout -b feature/nova-feature

# Práce...
# (malé commity s conventional messages)

# Před push
npm run lint && npm run type-check && npm test
docker compose up --build  # ověř, že Docker build projde

# Push a PR
git push -u origin feature/nova-feature
# → vytvoř PR v GitHub

# Po merge
git checkout main && git pull
git branch -d feature/nova-feature
```

## NIKDY:
- Necommituj přímo do main
- Nepushuj bez testů
- Nepřidávej .env do gitu (je v .gitignore)
- Neměň K8s manifesty bez konzultace
- Nepřidávej secrets do K8s YAML souborů
- Nepoužívej `latest` tag v produkčních K8s manifestech
  (vždy konkrétní SHA nebo semver tag)
