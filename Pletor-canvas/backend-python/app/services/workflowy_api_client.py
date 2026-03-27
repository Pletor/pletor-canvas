import time
from dataclasses import dataclass, field
from typing import Any

import httpx

from app.middlewares.error_handler import AppError

WORKFLOWY_API = "https://workflowy.com/api/v1"


@dataclass
class WorkFlowyNode:
    id: str
    name: str
    note: str | None
    priority: int
    created_at: int
    modified_at: int
    completed_at: int | None = None
    data: dict[str, Any] | None = None


@dataclass
class WorkFlowyExportNode(WorkFlowyNode):
    parent_id: str | None = None


@dataclass
class WorkFlowyTreeNode(WorkFlowyNode):
    children: list["WorkFlowyTreeNode"] = field(default_factory=list)


class WorkFlowyApiClient:
    def __init__(self, api_key: str) -> None:
        self._api_key = api_key
        self._cache: dict[str, Any] | None = None
        self._cache_timestamp: float = 0
        self._cache_ttl = 60.0  # 60 sekund

    async def _request(self, method: str, path: str, body: dict[str, Any] | None = None) -> Any:
        headers = {"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"}

        async with httpx.AsyncClient() as client:
            response = await client.request(method, f"{WORKFLOWY_API}{path}", headers=headers, json=body)

        if response.status_code == 401 or response.status_code == 403:
            raise AppError(401, "WORKFLOWY_AUTH_FAILED", "WorkFlowy API klíč je neplatný")
        if response.status_code == 429:
            raise AppError(429, "WORKFLOWY_RATE_LIMIT", "WorkFlowy API rate limit — zkus to za minutu nebo použij cache")
        if not response.is_success:
            raise AppError(502, "WORKFLOWY_ERROR", f"WorkFlowy API chyba: {response.status_code}")

        return response.json()

    async def get_tree(self, force_refresh: bool = False) -> list[WorkFlowyTreeNode]:
        """Načte celý strom — zkusí export, při rate limitu fallback na rekurzivní /nodes."""
        try:
            flat = await self.get_all_nodes_flat(force_refresh)
            return build_tree(flat)
        except AppError as err:
            if err.code == "WORKFLOWY_RATE_LIMIT":
                return await self._get_tree_recursive("None")
            raise

    async def get_all_nodes_flat(self, force_refresh: bool = False) -> list[WorkFlowyExportNode]:
        """Načte ploché pole všech uzlů přes /nodes-export (rate limit: 1/min, proto cache)."""
        if not force_refresh and self._cache and (time.time() - self._cache_timestamp) < self._cache_ttl:
            return self._cache["nodes"]

        response = await self._request("GET", "/nodes-export")
        nodes = [_parse_export_node(n) for n in response["nodes"]]
        self._cache = {"nodes": nodes}
        self._cache_timestamp = time.time()
        return nodes

    async def _get_tree_recursive(self, parent_id: str, depth: int = 0) -> list[WorkFlowyTreeNode]:
        """Rekurzivní načítání stromu přes /nodes (bez rate limitu, ale pomalejší)."""
        if depth > 5:
            return []

        children = await self.get_children(parent_id)
        result: list[WorkFlowyTreeNode] = []

        for child in children:
            grandchildren = await self._get_tree_recursive(child.id, depth + 1)
            result.append(WorkFlowyTreeNode(
                id=child.id, name=child.name, note=child.note, priority=child.priority,
                created_at=child.created_at, modified_at=child.modified_at,
                completed_at=child.completed_at, data=child.data, children=grandchildren,
            ))

        return sorted(result, key=lambda n: n.priority)

    async def get_node(self, node_id: str) -> WorkFlowyNode:
        """Načte konkrétní uzel."""
        response = await self._request("GET", f"/nodes/{node_id}")
        return _parse_node(response["node"])

    async def get_children(self, parent_id: str) -> list[WorkFlowyNode]:
        """Načte děti uzlu."""
        response = await self._request("GET", f"/nodes?parent_id={parent_id}")
        return [_parse_node(n) for n in response["nodes"]]

    def invalidate_cache(self) -> None:
        self._cache = None


def _parse_node(data: dict[str, Any]) -> WorkFlowyNode:
    return WorkFlowyNode(
        id=data["id"], name=data["name"], note=data.get("note"),
        priority=data.get("priority", 0), created_at=data.get("createdAt", 0),
        modified_at=data.get("modifiedAt", 0), completed_at=data.get("completedAt"),
        data=data.get("data"),
    )


def _parse_export_node(data: dict[str, Any]) -> WorkFlowyExportNode:
    return WorkFlowyExportNode(
        id=data["id"], name=data["name"], note=data.get("note"),
        priority=data.get("priority", 0), created_at=data.get("createdAt", 0),
        modified_at=data.get("modifiedAt", 0), completed_at=data.get("completedAt"),
        data=data.get("data"), parent_id=data.get("parent_id"),
    )


def build_tree(nodes: list[WorkFlowyExportNode]) -> list[WorkFlowyTreeNode]:
    """Rekonstruuje strom z plochého pole."""
    node_map: dict[str, WorkFlowyTreeNode] = {}
    roots: list[WorkFlowyTreeNode] = []

    for node in nodes:
        node_map[node.id] = WorkFlowyTreeNode(
            id=node.id, name=node.name, note=node.note, priority=node.priority,
            created_at=node.created_at, modified_at=node.modified_at,
            completed_at=node.completed_at, data=node.data, children=[],
        )

    for node in nodes:
        tree_node = node_map[node.id]
        if node.parent_id and node.parent_id in node_map:
            node_map[node.parent_id].children.append(tree_node)
        else:
            roots.append(tree_node)

    for tree_node in node_map.values():
        tree_node.children.sort(key=lambda n: n.priority)

    return sorted(roots, key=lambda n: n.priority)
