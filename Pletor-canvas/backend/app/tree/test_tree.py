"""Integrační testy pro Tree Node API."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.canvas.canvas_model import Canvas, generate_cuid


@pytest.fixture
async def canvas(db: AsyncSession) -> Canvas:
    """Vytvoří testovací canvas."""
    canvas = Canvas(id=generate_cuid(), name="Test Canvas")
    db.add(canvas)
    await db.commit()
    await db.refresh(canvas)
    return canvas


# === Vytvoření uzlu ===


async def test_create_root_node(client: AsyncClient, canvas: Canvas):
    resp = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Root 1"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["content"] == "Root 1"
    assert data["parentId"] is None
    assert data["nodeType"] == "bullet"
    assert data["stage"] == "note"
    assert data["lexicalOrder"] is not None


async def test_create_child_node(client: AsyncClient, canvas: Canvas):
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Root"})
    root_id = r1.json()["id"]

    r2 = await client.post(
        f"/api/v1/tree/{canvas.id}/nodes",
        json={"content": "Child", "parentId": root_id},
    )
    assert r2.status_code == 201
    assert r2.json()["parentId"] == root_id


async def test_create_node_with_position(client: AsyncClient, canvas: Canvas):
    """Vložení uzlu mezi dva existující sourozence."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "A"})
    r2 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "C"})
    id_a = r1.json()["id"]
    id_c = r2.json()["id"]

    r3 = await client.post(
        f"/api/v1/tree/{canvas.id}/nodes",
        json={"content": "B", "position": {"afterId": id_a, "beforeId": id_c}},
    )
    assert r3.status_code == 201
    order_a = r1.json()["lexicalOrder"]
    order_b = r3.json()["lexicalOrder"]
    order_c = r2.json()["lexicalOrder"]
    assert order_a < order_b < order_c


# === Fetch stromu ===


async def test_get_tree(client: AsyncClient, canvas: Canvas):
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Root"})
    root_id = r1.json()["id"]
    await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Child 1", "parentId": root_id})
    await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Child 2", "parentId": root_id})

    resp = await client.get(f"/api/v1/tree/{canvas.id}")
    assert resp.status_code == 200
    tree = resp.json()
    assert len(tree) == 1
    assert tree[0]["content"] == "Root"
    assert len(tree[0]["children"]) == 2


async def test_get_subtree_zoom(client: AsyncClient, canvas: Canvas):
    """Zoom do uzlu — vrátí podstrom."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Root"})
    root_id = r1.json()["id"]
    r2 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Child", "parentId": root_id})
    child_id = r2.json()["id"]
    await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Grandchild", "parentId": child_id})

    resp = await client.get(f"/api/v1/tree/{canvas.id}/node/{child_id}")
    assert resp.status_code == 200
    subtree = resp.json()
    assert len(subtree) == 1
    assert subtree[0]["content"] == "Child"
    assert len(subtree[0]["children"]) == 1
    assert subtree[0]["children"][0]["content"] == "Grandchild"


# === Update ===


async def test_update_node(client: AsyncClient, canvas: Canvas):
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Original"})
    node_id = r1.json()["id"]

    resp = await client.patch(f"/api/v1/tree/nodes/{node_id}", json={"content": "Updated", "stage": "draft"})
    assert resp.status_code == 200
    assert resp.json()["content"] == "Updated"
    assert resp.json()["stage"] == "draft"


# === Delete ===


async def test_delete_node_with_children(client: AsyncClient, canvas: Canvas):
    """Smazání uzlu smaže i potomky."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Parent"})
    parent_id = r1.json()["id"]
    await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Child", "parentId": parent_id})

    resp = await client.delete(f"/api/v1/tree/nodes/{parent_id}")
    assert resp.status_code == 204

    tree_resp = await client.get(f"/api/v1/tree/{canvas.id}")
    assert tree_resp.json() == []


# === Move ===


async def test_move_node(client: AsyncClient, canvas: Canvas):
    """Přesun uzlu do jiného rodiče."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Parent A"})
    r2 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Parent B"})
    r3 = await client.post(
        f"/api/v1/tree/{canvas.id}/nodes",
        json={"content": "Child", "parentId": r1.json()["id"]},
    )
    child_id = r3.json()["id"]
    parent_b_id = r2.json()["id"]

    resp = await client.post(
        f"/api/v1/tree/nodes/{child_id}/move",
        json={"targetParentId": parent_b_id},
    )
    assert resp.status_code == 200
    assert resp.json()["parentId"] == parent_b_id


async def test_move_node_circular_rejected(client: AsyncClient, canvas: Canvas):
    """Nelze přesunout uzel do svého potomka."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Parent"})
    parent_id = r1.json()["id"]
    r2 = await client.post(
        f"/api/v1/tree/{canvas.id}/nodes",
        json={"content": "Child", "parentId": parent_id},
    )
    child_id = r2.json()["id"]

    resp = await client.post(
        f"/api/v1/tree/nodes/{parent_id}/move",
        json={"targetParentId": child_id},
    )
    assert resp.status_code == 400
    assert resp.json()["error"] == "CIRCULAR_MOVE"


# === Indent / Outdent ===


async def test_indent_node(client: AsyncClient, canvas: Canvas):
    """Indent — uzel se stane dítětem předchozího sourozence."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Sibling 1"})
    r2 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Sibling 2"})
    sibling1_id = r1.json()["id"]
    sibling2_id = r2.json()["id"]

    resp = await client.post(f"/api/v1/tree/nodes/{sibling2_id}/indent")
    assert resp.status_code == 200
    assert resp.json()["parentId"] == sibling1_id


async def test_indent_first_sibling_rejected(client: AsyncClient, canvas: Canvas):
    """Nelze odsadit první sourozence — nemá předchozího."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Only child"})
    node_id = r1.json()["id"]

    resp = await client.post(f"/api/v1/tree/nodes/{node_id}/indent")
    assert resp.status_code == 400
    assert resp.json()["error"] == "CANNOT_INDENT"


async def test_outdent_node(client: AsyncClient, canvas: Canvas):
    """Outdent — uzel se přesune na úroveň rodiče."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Parent"})
    parent_id = r1.json()["id"]
    r2 = await client.post(
        f"/api/v1/tree/{canvas.id}/nodes",
        json={"content": "Child", "parentId": parent_id},
    )
    child_id = r2.json()["id"]

    resp = await client.post(f"/api/v1/tree/nodes/{child_id}/outdent")
    assert resp.status_code == 200
    assert resp.json()["parentId"] is None


async def test_outdent_root_rejected(client: AsyncClient, canvas: Canvas):
    """Nelze odsadit root uzel."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Root"})
    node_id = r1.json()["id"]

    resp = await client.post(f"/api/v1/tree/nodes/{node_id}/outdent")
    assert resp.status_code == 400
    assert resp.json()["error"] == "CANNOT_OUTDENT"


# === Reorder ===


async def test_reorder_node(client: AsyncClient, canvas: Canvas):
    """Přeřazení uzlu mezi sourozenci."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "A"})
    r2 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "B"})
    r3 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "C"})
    id_a = r1.json()["id"]
    id_c = r3.json()["id"]

    resp = await client.post(
        f"/api/v1/tree/nodes/{id_c}/reorder",
        json={"afterId": id_a, "beforeId": r2.json()["id"]},
    )
    assert resp.status_code == 200
    new_order = resp.json()["lexicalOrder"]
    assert r1.json()["lexicalOrder"] < new_order < r2.json()["lexicalOrder"]


# === Toggle complete / collapse ===


async def test_toggle_complete(client: AsyncClient, canvas: Canvas):
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Todo", "nodeType": "todo"})
    node_id = r1.json()["id"]
    assert r1.json()["isCompleted"] is False

    resp = await client.post(f"/api/v1/tree/nodes/{node_id}/toggle-complete")
    assert resp.json()["isCompleted"] is True

    resp2 = await client.post(f"/api/v1/tree/nodes/{node_id}/toggle-complete")
    assert resp2.json()["isCompleted"] is False


async def test_toggle_collapse(client: AsyncClient, canvas: Canvas):
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Node"})
    node_id = r1.json()["id"]

    resp = await client.post(f"/api/v1/tree/nodes/{node_id}/toggle-collapse")
    assert resp.json()["isCollapsed"] is True


# === Duplicate ===


async def test_duplicate_subtree(client: AsyncClient, canvas: Canvas):
    """Duplikace uzlu + potomků."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Parent"})
    parent_id = r1.json()["id"]
    await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Child 1", "parentId": parent_id})
    await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Child 2", "parentId": parent_id})

    resp = await client.post(f"/api/v1/tree/nodes/{parent_id}/duplicate")
    assert resp.status_code == 201
    assert resp.json()["content"] == "Parent"
    assert resp.json()["id"] != parent_id

    tree_resp = await client.get(f"/api/v1/tree/{canvas.id}")
    tree = tree_resp.json()
    assert len(tree) == 2


# === Mirror ===


async def test_create_mirror(client: AsyncClient, canvas: Canvas):
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Source"})
    source_id = r1.json()["id"]

    resp = await client.post(
        f"/api/v1/tree/{canvas.id}/mirror",
        json={"sourceId": source_id},
    )
    assert resp.status_code == 201
    assert resp.json()["isMirrorOf"] == source_id
    assert resp.json()["content"] == "Source"
    assert resp.json()["id"] != source_id


# === 404 ===


async def test_update_nonexistent_node(client: AsyncClient):
    resp = await client.patch("/api/v1/tree/nodes/nonexistent", json={"content": "X"})
    assert resp.status_code == 404


async def test_delete_nonexistent_node(client: AsyncClient):
    resp = await client.delete("/api/v1/tree/nodes/nonexistent")
    assert resp.status_code == 404


# === Fractional indexing — žádný sourozenec se neaktualizuje ===


async def test_insert_between_no_sibling_update(client: AsyncClient, canvas: Canvas):
    """Vložení mezi dva sourozence nezmění jejich lexical_order."""
    r1 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "First"})
    r2 = await client.post(f"/api/v1/tree/{canvas.id}/nodes", json={"content": "Last"})

    order_first = r1.json()["lexicalOrder"]
    order_last = r2.json()["lexicalOrder"]

    await client.post(
        f"/api/v1/tree/{canvas.id}/nodes",
        json={"content": "Middle", "position": {"afterId": r1.json()["id"], "beforeId": r2.json()["id"]}},
    )

    tree = (await client.get(f"/api/v1/tree/{canvas.id}")).json()
    orders = {node["content"]: node["lexicalOrder"] for node in tree}
    assert orders["First"] == order_first
    assert orders["Last"] == order_last
    assert orders["First"] < orders["Middle"] < orders["Last"]
