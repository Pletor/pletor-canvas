from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.canvas.canvas_model import Canvas, CanvasEdge, CanvasNode


# === Canvas ===


async def find_all_canvases(db: AsyncSession) -> list[dict[str, object]]:
    stmt = select(Canvas).order_by(Canvas.updated_at.desc())
    result = await db.execute(stmt)
    canvases = result.scalars().all()

    response = []
    for canvas in canvases:
        node_count = await db.scalar(select(func.count()).where(CanvasNode.canvas_id == canvas.id))
        edge_count = await db.scalar(select(func.count()).where(CanvasEdge.canvas_id == canvas.id))
        response.append({
            "id": canvas.id,
            "name": canvas.name,
            "description": canvas.description,
            "created_at": canvas.created_at,
            "updated_at": canvas.updated_at,
            "count": {"nodes": node_count or 0, "edges": edge_count or 0},
        })
    return response


async def find_canvas_by_id(db: AsyncSession, canvas_id: str) -> Canvas | None:
    stmt = select(Canvas).where(Canvas.id == canvas_id).options(selectinload(Canvas.nodes), selectinload(Canvas.edges))
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_canvas(db: AsyncSession, name: str, description: str | None = None) -> Canvas:
    canvas = Canvas(name=name, description=description)
    db.add(canvas)
    await db.commit()
    await db.refresh(canvas)
    return canvas


async def update_canvas(db: AsyncSession, canvas: Canvas, **kwargs: object) -> Canvas:
    for key, value in kwargs.items():
        if value is not None:
            setattr(canvas, key, value)
    await db.commit()
    await db.refresh(canvas)
    return canvas


async def delete_canvas(db: AsyncSession, canvas: Canvas) -> None:
    await db.delete(canvas)
    await db.commit()


# === Nodes ===


async def find_nodes_by_canvas_id(db: AsyncSession, canvas_id: str) -> list[CanvasNode]:
    stmt = select(CanvasNode).where(CanvasNode.canvas_id == canvas_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def find_node_by_id(db: AsyncSession, node_id: str) -> CanvasNode | None:
    return await db.get(CanvasNode, node_id)


async def create_node(db: AsyncSession, canvas_id: str, **kwargs: object) -> CanvasNode:
    node = CanvasNode(canvas_id=canvas_id, **kwargs)
    db.add(node)
    await db.commit()
    await db.refresh(node)
    return node


async def update_node(db: AsyncSession, node: CanvasNode, **kwargs: object) -> CanvasNode:
    for key, value in kwargs.items():
        if value is not None:
            setattr(node, key, value)
    await db.commit()
    await db.refresh(node)
    return node


async def delete_node(db: AsyncSession, node: CanvasNode) -> None:
    await db.delete(node)
    await db.commit()


# === Edges ===


async def find_edges_by_canvas_id(db: AsyncSession, canvas_id: str) -> list[CanvasEdge]:
    stmt = select(CanvasEdge).where(CanvasEdge.canvas_id == canvas_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def find_edge_by_id(db: AsyncSession, edge_id: str) -> CanvasEdge | None:
    return await db.get(CanvasEdge, edge_id)


async def create_edge(db: AsyncSession, canvas_id: str, **kwargs: object) -> CanvasEdge:
    edge = CanvasEdge(canvas_id=canvas_id, **kwargs)
    db.add(edge)
    await db.commit()
    await db.refresh(edge)
    return edge


async def update_edge(db: AsyncSession, edge: CanvasEdge, **kwargs: object) -> CanvasEdge:
    for key, value in kwargs.items():
        if value is not None:
            setattr(edge, key, value)
    await db.commit()
    await db.refresh(edge)
    return edge


async def delete_edge(db: AsyncSession, edge: CanvasEdge) -> None:
    await db.delete(edge)
    await db.commit()


# === Batch ===


async def batch_create_nodes_and_edges(
    db: AsyncSession,
    canvas_id: str,
    nodes_data: list[dict[str, object]],
    edges_data: list[dict[str, object]],
) -> tuple[list[CanvasNode], list[CanvasEdge]]:
    # Smaž existující
    await db.execute(delete(CanvasEdge).where(CanvasEdge.canvas_id == canvas_id))
    await db.execute(delete(CanvasNode).where(CanvasNode.canvas_id == canvas_id))

    # Vytvoř nové uzly
    created_nodes: list[CanvasNode] = []
    for node_data in nodes_data:
        node = CanvasNode(canvas_id=canvas_id, **node_data)
        db.add(node)
        created_nodes.append(node)

    await db.flush()

    # Vytvoř nové hrany
    created_edges: list[CanvasEdge] = []
    for edge_data in edges_data:
        edge = CanvasEdge(canvas_id=canvas_id, **edge_data)
        db.add(edge)
        created_edges.append(edge)

    await db.commit()

    for node in created_nodes:
        await db.refresh(node)
    for edge in created_edges:
        await db.refresh(edge)

    return created_nodes, created_edges
