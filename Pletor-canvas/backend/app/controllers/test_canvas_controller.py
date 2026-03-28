"""Integrační testy pro Canvas CRUD API."""

import pytest
from httpx import AsyncClient


# === Canvas CRUD ===


async def test_create_canvas(client: AsyncClient):
    resp = await client.post("/api/v1/canvas", json={"name": "Test Canvas"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Canvas"
    assert "id" in data
    assert "createdAt" in data


async def test_list_canvases(client: AsyncClient):
    await client.post("/api/v1/canvas", json={"name": "Canvas 1"})
    await client.post("/api/v1/canvas", json={"name": "Canvas 2"})

    resp = await client.get("/api/v1/canvas")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2


async def test_get_canvas_detail(client: AsyncClient):
    create_resp = await client.post("/api/v1/canvas", json={"name": "Detail test"})
    canvas_id = create_resp.json()["id"]

    resp = await client.get(f"/api/v1/canvas/{canvas_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Detail test"
    assert "nodes" in data
    assert "edges" in data


async def test_get_canvas_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/canvas/nonexistent")
    assert resp.status_code == 404
    assert resp.json()["error"] == "NOT_FOUND"


async def test_update_canvas(client: AsyncClient):
    create_resp = await client.post("/api/v1/canvas", json={"name": "Old name"})
    canvas_id = create_resp.json()["id"]

    resp = await client.patch(f"/api/v1/canvas/{canvas_id}", json={"name": "New name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New name"


async def test_delete_canvas(client: AsyncClient):
    create_resp = await client.post("/api/v1/canvas", json={"name": "To delete"})
    canvas_id = create_resp.json()["id"]

    resp = await client.delete(f"/api/v1/canvas/{canvas_id}")
    assert resp.status_code == 204

    resp = await client.get(f"/api/v1/canvas/{canvas_id}")
    assert resp.status_code == 404


# === Node CRUD ===


async def test_create_node(client: AsyncClient):
    canvas = (await client.post("/api/v1/canvas", json={"name": "Node test"})).json()

    resp = await client.post(f"/api/v1/canvas/{canvas['id']}/nodes", json={
        "nodeType": "service",
        "label": "AuthService",
        "positionX": 100.0,
        "positionY": 200.0,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["label"] == "AuthService"
    assert data["nodeType"] == "service"
    assert data["positionX"] == 100.0
    assert data["canvasId"] == canvas["id"]


async def test_create_node_validation_error(client: AsyncClient):
    canvas = (await client.post("/api/v1/canvas", json={"name": "Validation test"})).json()

    resp = await client.post(f"/api/v1/canvas/{canvas['id']}/nodes", json={
        "nodeType": "invalid_type",
        "label": "Test",
        "positionX": 0,
        "positionY": 0,
    })
    assert resp.status_code == 422


async def test_update_node(client: AsyncClient):
    canvas = (await client.post("/api/v1/canvas", json={"name": "Update node"})).json()
    node = (await client.post(f"/api/v1/canvas/{canvas['id']}/nodes", json={
        "nodeType": "file", "label": "Old", "positionX": 0, "positionY": 0,
    })).json()

    resp = await client.patch(f"/api/v1/nodes/{node['id']}", json={"label": "New"})
    assert resp.status_code == 200
    assert resp.json()["label"] == "New"


async def test_delete_node(client: AsyncClient):
    canvas = (await client.post("/api/v1/canvas", json={"name": "Del node"})).json()
    node = (await client.post(f"/api/v1/canvas/{canvas['id']}/nodes", json={
        "nodeType": "file", "label": "ToDelete", "positionX": 0, "positionY": 0,
    })).json()

    resp = await client.delete(f"/api/v1/nodes/{node['id']}")
    assert resp.status_code == 204


# === Edge CRUD ===


async def test_create_edge(client: AsyncClient):
    canvas = (await client.post("/api/v1/canvas", json={"name": "Edge test"})).json()
    cid = canvas["id"]

    n1 = (await client.post(f"/api/v1/canvas/{cid}/nodes", json={
        "nodeType": "service", "label": "A", "positionX": 0, "positionY": 0,
    })).json()
    n2 = (await client.post(f"/api/v1/canvas/{cid}/nodes", json={
        "nodeType": "service", "label": "B", "positionX": 100, "positionY": 0,
    })).json()

    resp = await client.post(f"/api/v1/canvas/{cid}/edges", json={
        "edgeType": "apiCall",
        "sourceId": n1["id"],
        "targetId": n2["id"],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["edgeType"] == "apiCall"
    assert data["sourceId"] == n1["id"]
    assert data["targetId"] == n2["id"]


# === Batch Save ===


async def test_batch_save(client: AsyncClient):
    canvas = (await client.post("/api/v1/canvas", json={"name": "Batch test"})).json()
    cid = canvas["id"]

    resp = await client.put(f"/api/v1/canvas/{cid}/batch", json={
        "nodes": [
            {"id": "node-1", "nodeType": "service", "label": "Svc1", "positionX": 0, "positionY": 0},
            {"id": "node-2", "nodeType": "api", "label": "Api1", "positionX": 100, "positionY": 0},
        ],
        "edges": [
            {"id": "edge-1", "edgeType": "apiCall", "sourceId": "node-1", "targetId": "node-2"},
        ],
    })
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["nodes"]) == 2
    assert len(data["edges"]) == 1


async def test_batch_save_replaces_all(client: AsyncClient):
    """Batch save smaže staré uzly a vytvoří nové."""
    canvas = (await client.post("/api/v1/canvas", json={"name": "Replace test"})).json()
    cid = canvas["id"]

    await client.put(f"/api/v1/canvas/{cid}/batch", json={
        "nodes": [
            {"id": "a", "nodeType": "file", "label": "A", "positionX": 0, "positionY": 0},
            {"id": "b", "nodeType": "file", "label": "B", "positionX": 1, "positionY": 1},
            {"id": "c", "nodeType": "file", "label": "C", "positionX": 2, "positionY": 2},
        ],
        "edges": [],
    })

    await client.put(f"/api/v1/canvas/{cid}/batch", json={
        "nodes": [
            {"id": "d", "nodeType": "file", "label": "D", "positionX": 0, "positionY": 0},
        ],
        "edges": [],
    })

    nodes_resp = await client.get(f"/api/v1/canvas/{cid}/nodes")
    assert len(nodes_resp.json()) == 1
    assert nodes_resp.json()[0]["label"] == "D"


# === camelCase JSON ===


async def test_response_uses_camel_case(client: AsyncClient):
    """Ověří, že odpovědi používají camelCase klíče pro frontend."""
    canvas = (await client.post("/api/v1/canvas", json={"name": "Camel test"})).json()
    node = (await client.post(f"/api/v1/canvas/{canvas['id']}/nodes", json={
        "nodeType": "component", "label": "CamelTest", "positionX": 50, "positionY": 75,
    })).json()

    assert "nodeType" in node
    assert "positionX" in node
    assert "positionY" in node
    assert "canvasId" in node
    assert "createdAt" in node
    assert "node_type" not in node
    assert "position_x" not in node
    assert "canvas_id" not in node
