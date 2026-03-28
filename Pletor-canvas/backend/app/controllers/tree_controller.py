from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.schemas.tree_node import (
    CreateNodeRequest,
    MirrorRequest,
    MoveNodeRequest,
    ReorderRequest,
    TreeNodeFlatResponse,
    TreeNodeResponse,
    UpdateNodeRequest,
)
from app.services import tree_node_service as service

router = APIRouter(prefix="/api/v1/tree", tags=["tree"])


# === Strom ===


@router.get("/{canvas_id}")
async def get_tree(
    canvas_id: str,
    depth: int | None = Query(None, description="Maximální hloubka stromu"),
    db: AsyncSession = Depends(get_db),
) -> list[TreeNodeResponse]:
    tree = await service.get_tree(db, canvas_id, max_depth=depth)
    return [TreeNodeResponse(**_dict_response(node)) for node in tree]


@router.get("/{canvas_id}/node/{node_id}")
async def get_subtree(
    canvas_id: str,
    node_id: str,
    depth: int | None = Query(None, description="Maximální hloubka podstromu"),
    db: AsyncSession = Depends(get_db),
) -> list[TreeNodeResponse]:
    tree = await service.get_tree(db, canvas_id, root_id=node_id, max_depth=depth)
    return [TreeNodeResponse(**_dict_response(node)) for node in tree]


# === CRUD ===


@router.post("/{canvas_id}/nodes", status_code=201)
async def create_node(
    canvas_id: str,
    body: CreateNodeRequest,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    after_id = body.position.after_id if body.position else None
    before_id = body.position.before_id if body.position else None

    node = await service.create_node(
        db, canvas_id=canvas_id, content=body.content,
        parent_id=body.parent_id, node_type=body.node_type,
        after_id=after_id, before_id=before_id,
    )
    return TreeNodeFlatResponse.model_validate(node)


@router.patch("/nodes/{node_id}")
async def update_node(
    node_id: str,
    body: UpdateNodeRequest,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    update_data = body.model_dump(exclude_unset=True)
    node = await service.update_node(db, node_id, **update_data)
    return TreeNodeFlatResponse.model_validate(node)


@router.delete("/nodes/{node_id}", status_code=204)
async def delete_node(
    node_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_node(db, node_id)


# === Strukturní operace ===


@router.post("/nodes/{node_id}/move")
async def move_node(
    node_id: str,
    body: MoveNodeRequest,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    after_id = body.position.after_id if body.position else None
    before_id = body.position.before_id if body.position else None

    node = await service.move_node(
        db, node_id, target_parent_id=body.target_parent_id,
        after_id=after_id, before_id=before_id,
    )
    return TreeNodeFlatResponse.model_validate(node)


@router.post("/nodes/{node_id}/indent")
async def indent_node(
    node_id: str,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    node = await service.indent_node(db, node_id)
    return TreeNodeFlatResponse.model_validate(node)


@router.post("/nodes/{node_id}/outdent")
async def outdent_node(
    node_id: str,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    node = await service.outdent_node(db, node_id)
    return TreeNodeFlatResponse.model_validate(node)


@router.post("/nodes/{node_id}/reorder")
async def reorder_node(
    node_id: str,
    body: ReorderRequest,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    node = await service.reorder_node(db, node_id, after_id=body.after_id, before_id=body.before_id)
    return TreeNodeFlatResponse.model_validate(node)


# === Speciální ===


@router.post("/nodes/{node_id}/toggle-complete")
async def toggle_complete(
    node_id: str,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    node = await service.toggle_complete(db, node_id)
    return TreeNodeFlatResponse.model_validate(node)


@router.post("/nodes/{node_id}/toggle-collapse")
async def toggle_collapse(
    node_id: str,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    node = await service.toggle_collapse(db, node_id)
    return TreeNodeFlatResponse.model_validate(node)


@router.post("/nodes/{node_id}/duplicate", status_code=201)
async def duplicate_subtree(
    node_id: str,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    node = await service.duplicate_subtree(db, node_id)
    return TreeNodeFlatResponse.model_validate(node)


@router.post("/{canvas_id}/mirror", status_code=201)
async def create_mirror(
    canvas_id: str,
    body: MirrorRequest,
    db: AsyncSession = Depends(get_db),
) -> TreeNodeFlatResponse:
    after_id = body.position.after_id if body.position else None
    before_id = body.position.before_id if body.position else None

    node = await service.create_mirror(
        db, source_id=body.source_id, canvas_id=canvas_id,
        parent_id=body.parent_id, after_id=after_id, before_id=before_id,
    )
    return TreeNodeFlatResponse.model_validate(node)


def _dict_response(node: dict[str, object]) -> dict[str, object]:
    """Převede dict z service na dict kompatibilní s TreeNodeResponse."""
    children = node.get("children", [])
    result = {k: v for k, v in node.items() if k != "children" and k != "depth"}
    result["children"] = [_dict_response(c) for c in children]  # type: ignore[union-attr]
    return result
