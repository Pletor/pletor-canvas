"""Integrační testy pro WorkFlowy API endpointy — mocknuté HTTP odpovědi."""

import pytest
from httpx import AsyncClient

from app.services import workflowy_sync_service as wf_service


async def test_workflowy_status_not_configured(client: AsyncClient):
    wf_service._client = None
    resp = await client.get("/api/v1/workflowy/status")
    assert resp.status_code == 200
    assert resp.json()["configured"] is False


async def test_workflowy_configure(client: AsyncClient):
    resp = await client.post("/api/v1/workflowy/configure", json={"apiKey": "test-key-123"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
    assert wf_service.is_workflowy_configured() is True
    # Vyčisti stav
    wf_service._client = None


async def test_workflowy_tree_not_configured(client: AsyncClient):
    wf_service._client = None
    resp = await client.get("/api/v1/workflowy/tree")
    assert resp.status_code == 400
