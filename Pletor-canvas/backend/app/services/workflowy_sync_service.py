import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.middlewares.error_handler import AppError, NotFoundError
from app.models.canvas import CanvasNode
from app.services.workflowy_api_client import WorkFlowyApiClient
from app.services.workflowy_parser_service import ParsedWorkFlowyNode, parse_workflowy_tree

# Singleton — vytvořen při konfiguraci API klíče
_client: WorkFlowyApiClient | None = None


def configure_workflowy(api_key: str) -> None:
    global _client
    _client = WorkFlowyApiClient(api_key)


def get_workflowy_client() -> WorkFlowyApiClient:
    if not _client:
        raise AppError(400, "WORKFLOWY_NOT_CONFIGURED", "WorkFlowy API klíč není nastaven. Nastav ho v /api/v1/workflowy/configure.")
    return _client


def is_workflowy_configured() -> bool:
    return _client is not None


async def get_workflowy_tree() -> list[ParsedWorkFlowyNode]:
    """Načte celý WorkFlowy strom jako parsované uzly."""
    client = get_workflowy_client()
    tree = await client.get_tree()
    return parse_workflowy_tree(tree)


async def get_workflowy_node(node_id: str) -> ParsedWorkFlowyNode | None:
    """Načte konkrétní WorkFlowy uzel a vrátí parsovaná data."""
    client = get_workflowy_client()
    flat = await client.get_all_nodes_flat()
    node = next((n for n in flat if n.id == node_id), None)
    if not node:
        return None

    children = [n for n in flat if n.parent_id == node_id]
    from app.services.workflowy_api_client import WorkFlowyTreeNode

    tree_node = WorkFlowyTreeNode(
        id=node.id, name=node.name, note=node.note, priority=node.priority,
        created_at=node.created_at, modified_at=node.modified_at,
        completed_at=node.completed_at, data=node.data,
        children=[
            WorkFlowyTreeNode(
                id=c.id, name=c.name, note=c.note, priority=c.priority,
                created_at=c.created_at, modified_at=c.modified_at,
                completed_at=c.completed_at, data=c.data,
                children=[
                    WorkFlowyTreeNode(
                        id=gc.id, name=gc.name, note=gc.note, priority=gc.priority,
                        created_at=gc.created_at, modified_at=gc.modified_at,
                        completed_at=gc.completed_at, data=gc.data, children=[],
                    )
                    for gc in flat if gc.parent_id == c.id
                ],
            )
            for c in children
        ],
    )

    parsed = parse_workflowy_tree([tree_node])
    return parsed[0] if parsed else None


async def sync_workflowy_to_canvas(db: AsyncSession, canvas_id: str) -> dict[str, int]:
    """Synchronizuje WorkFlowy data do canvas uzlů."""
    client = get_workflowy_client()
    tree = await client.get_tree(force_refresh=True)
    all_parsed = _flatten_parsed(parse_workflowy_tree(tree))

    stmt = select(CanvasNode).where(CanvasNode.canvas_id == canvas_id, CanvasNode.workflowy_node_id.is_not(None))
    result = await db.execute(stmt)
    canvas_nodes = list(result.scalars().all())

    synced = 0
    for canvas_node in canvas_nodes:
        wf_node = next((p for p in all_parsed if p.id == canvas_node.workflowy_node_id), None)
        if not wf_node:
            continue

        canvas_node.prompt = wf_node.prompt
        canvas_node.context = wf_node.context
        canvas_node.intent = wf_node.intent
        canvas_node.constraints = json.dumps(wf_node.constraints) if wf_node.constraints else None
        synced += 1

    await db.commit()
    return {"synced": synced, "total": len(canvas_nodes)}


async def link_node_to_workflowy(db: AsyncSession, canvas_node_id: str, workflowy_node_id: str) -> CanvasNode:
    """Propojí canvas uzel s WorkFlowy uzlem."""
    parsed = await get_workflowy_node(workflowy_node_id)
    if not parsed:
        raise NotFoundError(f"WorkFlowy uzel '{workflowy_node_id}'")

    canvas_node = await db.get(CanvasNode, canvas_node_id)
    if not canvas_node:
        raise NotFoundError("Canvas uzel")

    canvas_node.workflowy_node_id = workflowy_node_id
    canvas_node.prompt = parsed.prompt
    canvas_node.context = parsed.context
    canvas_node.intent = parsed.intent
    canvas_node.constraints = json.dumps(parsed.constraints) if parsed.constraints else None

    await db.commit()
    await db.refresh(canvas_node)
    return canvas_node


async def unlink_node_from_workflowy(db: AsyncSession, canvas_node_id: str) -> CanvasNode:
    """Odpojí canvas uzel od WorkFlowy."""
    canvas_node = await db.get(CanvasNode, canvas_node_id)
    if not canvas_node:
        raise NotFoundError("Canvas uzel")

    canvas_node.workflowy_node_id = None
    canvas_node.prompt = None
    canvas_node.context = None
    canvas_node.intent = None
    canvas_node.constraints = None

    await db.commit()
    await db.refresh(canvas_node)
    return canvas_node


def _flatten_parsed(nodes: list[ParsedWorkFlowyNode]) -> list[ParsedWorkFlowyNode]:
    result: list[ParsedWorkFlowyNode] = []
    for node in nodes:
        result.append(node)
        if node.children:
            result.extend(_flatten_parsed(node.children))
    return result
