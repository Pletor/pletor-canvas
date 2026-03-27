"""Integrační testy pro Agent API — mocknuté Anthropic SDK."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.canvas import Canvas, CanvasNode


async def _seed_canvas_with_node(db: AsyncSession) -> tuple[str, str]:
    """Vytvoří canvas + uzel a vrátí (canvas_id, node_id)."""
    canvas = Canvas(name="Agent test canvas")
    db.add(canvas)
    await db.commit()
    await db.refresh(canvas)

    node = CanvasNode(
        canvas_id=canvas.id,
        node_type="service",
        label="TestService",
        position_x=0,
        position_y=0,
    )
    db.add(node)
    await db.commit()
    await db.refresh(node)

    return canvas.id, node.id


async def test_get_agent_context(client: AsyncClient, db: AsyncSession):
    _, node_id = await _seed_canvas_with_node(db)

    resp = await client.get(f"/api/v1/agents/{node_id}/context")
    assert resp.status_code == 200
    data = resp.json()
    assert data["node"]["label"] == "TestService"
    assert data["node"]["nodeType"] == "service"
    assert "workflowy" in data
    assert "dependencies" in data


async def test_get_agent_context_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/agents/nonexistent/context")
    assert resp.status_code == 404


async def test_execute_agent(client: AsyncClient, db: AsyncSession):
    _, node_id = await _seed_canvas_with_node(db)

    mock_response = MagicMock()
    mock_response.content = [MagicMock(type="text", text="const result = 42;")]
    mock_response.usage = MagicMock(input_tokens=100, output_tokens=50)

    with patch("app.services.agent_execution_service._get_client") as mock_client:
        mock_client.return_value.messages.create = AsyncMock(return_value=mock_response)

        resp = await client.post(f"/api/v1/agents/{node_id}/execute", json={})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "completed"
        assert data["output"] == "const result = 42;"
        assert data["tokensIn"] == 100
        assert data["tokensOut"] == 50


async def test_execute_agent_stream(client: AsyncClient, db: AsyncSession):
    _, node_id = await _seed_canvas_with_node(db)

    mock_final = MagicMock()
    mock_final.usage = MagicMock(input_tokens=200, output_tokens=100)

    async def mock_text_stream():
        yield "const "
        yield "x = 1;"

    mock_stream_ctx = AsyncMock()
    mock_stream_ctx.__aenter__ = AsyncMock(return_value=mock_stream_ctx)
    mock_stream_ctx.__aexit__ = AsyncMock(return_value=False)
    mock_stream_ctx.text_stream = mock_text_stream()
    mock_stream_ctx.get_final_message = AsyncMock(return_value=mock_final)

    with patch("app.services.agent_execution_service._get_client") as mock_client:
        mock_client.return_value.messages.stream = MagicMock(return_value=mock_stream_ctx)

        resp = await client.post(f"/api/v1/agents/{node_id}/stream", json={})
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("text/event-stream")

        lines = [line for line in resp.text.strip().split("\n") if line.startswith("data: ")]
        events = [json.loads(line.removeprefix("data: ")) for line in lines]

        types = [e["type"] for e in events]
        assert "start" in types
        assert "delta" in types
        assert "done" in types


async def test_list_executions_empty(client: AsyncClient, db: AsyncSession):
    _, node_id = await _seed_canvas_with_node(db)

    resp = await client.get(f"/api/v1/agents/{node_id}/executions")
    assert resp.status_code == 200
    assert resp.json() == []


async def test_get_execution_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/agents/executions/nonexistent")
    assert resp.status_code == 404
