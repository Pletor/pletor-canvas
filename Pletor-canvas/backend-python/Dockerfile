# Stage 1: Builder — instalace závislostí
FROM python:3.12-slim AS builder

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir --prefix=/install .

# Stage 2: Runtime
FROM python:3.12-slim

RUN groupadd --gid 1001 appuser && \
    useradd --uid 1001 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /app

COPY --from=builder /install /usr/local
COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app

RUN mkdir -p /app/data && chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/api/v1/health')" || exit 1

CMD ["sh", "-c", "python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8080"]
