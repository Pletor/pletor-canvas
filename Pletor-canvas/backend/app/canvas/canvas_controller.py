from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.canvas.canvas_schema import (
    BatchSaveRequest,
    BatchSaveResponse,
    CanvasDetailResponse,
    CanvasListResponse,
    CreateCanvasRequest,
    CreateEdgeRequest,
    CreateNodeRequest,
    EdgeResponse,
    NodeResponse,
    UpdateCanvasRequest,
    UpdateEdgeRequest,
    UpdateNodeRequest,
)
from app.canvas import canvas_service as service

router = APIRouter()


# === Canvas ===


@router.get("/api/v1/canvas")
async def list_canvases(db: AsyncSession = Depends(get_db)) -> list[CanvasListResponse]:
    canvases = await service.get_all_canvases(db)
    return [CanvasListResponse.model_validate(c) for c in canvases]


@router.post("/api/v1/canvas", status_code=201)
async def create_canvas(data: CreateCanvasRequest, db: AsyncSession = Depends(get_db)) -> CanvasListResponse:
    canvas = await service.create_canvas(db, data)
    return CanvasListResponse.model_validate(canvas, from_attributes=True)


@router.get("/api/v1/canvas/{canvas_id}")
async def get_canvas(canvas_id: str, db: AsyncSession = Depends(get_db)) -> CanvasDetailResponse:
    canvas = await service.get_canvas_by_id(db, canvas_id)
    return CanvasDetailResponse.model_validate(canvas, from_attributes=True)


@router.patch("/api/v1/canvas/{canvas_id}")
async def update_canvas(canvas_id: str, data: UpdateCanvasRequest, db: AsyncSession = Depends(get_db)) -> CanvasListResponse:
    canvas = await service.update_canvas(db, canvas_id, data)
    return CanvasListResponse.model_validate(canvas, from_attributes=True)


@router.delete("/api/v1/canvas/{canvas_id}", status_code=204)
async def delete_canvas(canvas_id: str, db: AsyncSession = Depends(get_db)) -> Response:
    await service.delete_canvas(db, canvas_id)
    return Response(status_code=204)


# === Nodes ===


@router.get("/api/v1/canvas/{canvas_id}/nodes")
async def list_nodes(canvas_id: str, db: AsyncSession = Depends(get_db)) -> list[NodeResponse]:
    nodes = await service.get_nodes_by_canvas_id(db, canvas_id)
    return [NodeResponse.model_validate(n, from_attributes=True) for n in nodes]


@router.post("/api/v1/canvas/{canvas_id}/nodes", status_code=201)
async def create_node(canvas_id: str, data: CreateNodeRequest, db: AsyncSession = Depends(get_db)) -> NodeResponse:
    node = await service.create_node(db, canvas_id, data)
    return NodeResponse.model_validate(node, from_attributes=True)


@router.patch("/api/v1/nodes/{node_id}")
async def update_node(node_id: str, data: UpdateNodeRequest, db: AsyncSession = Depends(get_db)) -> NodeResponse:
    node = await service.update_node(db, node_id, data)
    return NodeResponse.model_validate(node, from_attributes=True)


@router.delete("/api/v1/nodes/{node_id}", status_code=204)
async def delete_node(node_id: str, db: AsyncSession = Depends(get_db)) -> Response:
    await service.delete_node(db, node_id)
    return Response(status_code=204)


# === Edges ===


@router.get("/api/v1/canvas/{canvas_id}/edges")
async def list_edges(canvas_id: str, db: AsyncSession = Depends(get_db)) -> list[EdgeResponse]:
    edges = await service.get_edges_by_canvas_id(db, canvas_id)
    return [EdgeResponse.model_validate(e, from_attributes=True) for e in edges]


@router.post("/api/v1/canvas/{canvas_id}/edges", status_code=201)
async def create_edge(canvas_id: str, data: CreateEdgeRequest, db: AsyncSession = Depends(get_db)) -> EdgeResponse:
    edge = await service.create_edge(db, canvas_id, data)
    return EdgeResponse.model_validate(edge, from_attributes=True)


@router.patch("/api/v1/edges/{edge_id}")
async def update_edge(edge_id: str, data: UpdateEdgeRequest, db: AsyncSession = Depends(get_db)) -> EdgeResponse:
    edge = await service.update_edge(db, edge_id, data)
    return EdgeResponse.model_validate(edge, from_attributes=True)


@router.delete("/api/v1/edges/{edge_id}", status_code=204)
async def delete_edge(edge_id: str, db: AsyncSession = Depends(get_db)) -> Response:
    await service.delete_edge(db, edge_id)
    return Response(status_code=204)


# === Batch ===


@router.put("/api/v1/canvas/{canvas_id}/batch")
async def batch_save(canvas_id: str, data: BatchSaveRequest, db: AsyncSession = Depends(get_db)) -> BatchSaveResponse:
    nodes, edges = await service.batch_save(db, canvas_id, data)
    return BatchSaveResponse(
        nodes=[NodeResponse.model_validate(n, from_attributes=True) for n in nodes],
        edges=[EdgeResponse.model_validate(e, from_attributes=True) for e in edges],
    )
