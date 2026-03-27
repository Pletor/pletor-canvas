from sqlalchemy.ext.asyncio import AsyncSession

from app.middlewares.error_handler import NotFoundError
from app.models.canvas import Canvas, CanvasEdge, CanvasNode
from app.repositories import canvas_repository as repo
from app.schemas.canvas import (
    BatchSaveRequest,
    CreateCanvasRequest,
    CreateEdgeRequest,
    CreateNodeRequest,
    UpdateCanvasRequest,
    UpdateEdgeRequest,
    UpdateNodeRequest,
)


# === Canvas ===


async def get_all_canvases(db: AsyncSession) -> list[dict[str, object]]:
    return await repo.find_all_canvases(db)


async def get_canvas_by_id(db: AsyncSession, canvas_id: str) -> Canvas:
    canvas = await repo.find_canvas_by_id(db, canvas_id)
    if not canvas:
        raise NotFoundError("Canvas")
    return canvas


async def create_canvas(db: AsyncSession, data: CreateCanvasRequest) -> Canvas:
    return await repo.create_canvas(db, name=data.name, description=data.description)


async def update_canvas(db: AsyncSession, canvas_id: str, data: UpdateCanvasRequest) -> Canvas:
    canvas = await _ensure_canvas_exists(db, canvas_id)
    return await repo.update_canvas(db, canvas, **data.model_dump(exclude_none=True))


async def delete_canvas(db: AsyncSession, canvas_id: str) -> None:
    canvas = await _ensure_canvas_exists(db, canvas_id)
    await repo.delete_canvas(db, canvas)


# === Nodes ===


async def get_nodes_by_canvas_id(db: AsyncSession, canvas_id: str) -> list[CanvasNode]:
    await _ensure_canvas_exists(db, canvas_id)
    return await repo.find_nodes_by_canvas_id(db, canvas_id)


async def create_node(db: AsyncSession, canvas_id: str, data: CreateNodeRequest) -> CanvasNode:
    await _ensure_canvas_exists(db, canvas_id)
    return await repo.create_node(
        db,
        canvas_id,
        node_type=data.node_type,
        label=data.label,
        description=data.description,
        status=data.status,
        position_x=data.position_x,
        position_y=data.position_y,
    )


async def update_node(db: AsyncSession, node_id: str, data: UpdateNodeRequest) -> CanvasNode:
    node = await repo.find_node_by_id(db, node_id)
    if not node:
        raise NotFoundError("Uzel")
    updates = data.model_dump(exclude_none=True)
    return await repo.update_node(db, node, **updates)


async def delete_node(db: AsyncSession, node_id: str) -> None:
    node = await repo.find_node_by_id(db, node_id)
    if not node:
        raise NotFoundError("Uzel")
    await repo.delete_node(db, node)


# === Edges ===


async def get_edges_by_canvas_id(db: AsyncSession, canvas_id: str) -> list[CanvasEdge]:
    await _ensure_canvas_exists(db, canvas_id)
    return await repo.find_edges_by_canvas_id(db, canvas_id)


async def create_edge(db: AsyncSession, canvas_id: str, data: CreateEdgeRequest) -> CanvasEdge:
    await _ensure_canvas_exists(db, canvas_id)
    return await repo.create_edge(
        db,
        canvas_id,
        edge_type=data.edge_type,
        source_id=data.source_id,
        target_id=data.target_id,
        label=data.label,
        animated=data.animated,
    )


async def update_edge(db: AsyncSession, edge_id: str, data: UpdateEdgeRequest) -> CanvasEdge:
    edge = await repo.find_edge_by_id(db, edge_id)
    if not edge:
        raise NotFoundError("Hrana")
    updates = data.model_dump(exclude_none=True)
    return await repo.update_edge(db, edge, **updates)


async def delete_edge(db: AsyncSession, edge_id: str) -> None:
    edge = await repo.find_edge_by_id(db, edge_id)
    if not edge:
        raise NotFoundError("Hrana")
    await repo.delete_edge(db, edge)


# === Batch ===


async def batch_save(db: AsyncSession, canvas_id: str, data: BatchSaveRequest) -> tuple[list[CanvasNode], list[CanvasEdge]]:
    await _ensure_canvas_exists(db, canvas_id)
    nodes_data = [
        {
            **({"id": n.id} if n.id else {}),
            "node_type": n.node_type,
            "label": n.label,
            "description": n.description,
            "status": n.status,
            "position_x": n.position_x,
            "position_y": n.position_y,
        }
        for n in data.nodes
    ]
    edges_data = [
        {
            **({"id": e.id} if e.id else {}),
            "edge_type": e.edge_type,
            "source_id": e.source_id,
            "target_id": e.target_id,
            "label": e.label,
            "animated": e.animated,
        }
        for e in data.edges
    ]
    return await repo.batch_create_nodes_and_edges(db, canvas_id, nodes_data, edges_data)


# === Helpers ===


async def _ensure_canvas_exists(db: AsyncSession, canvas_id: str) -> Canvas:
    canvas = await repo.find_canvas_by_id(db, canvas_id)
    if not canvas:
        raise NotFoundError("Canvas")
    return canvas
