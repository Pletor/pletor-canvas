from dataclasses import asdict
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.schemas.workflowy import ConfigureWorkFlowyRequest, LinkNodeRequest, UnlinkNodeRequest
from app.services import workflowy_sync_service as wf_service

router = APIRouter(prefix="/api/v1/workflowy")


@router.post("/configure")
async def configure(data: ConfigureWorkFlowyRequest) -> dict[str, str]:
    wf_service.configure_workflowy(data.api_key)
    return {"status": "ok"}


@router.get("/status")
async def status() -> dict[str, bool]:
    return {"configured": wf_service.is_workflowy_configured()}


@router.get("/tree")
async def get_tree() -> list[dict[str, Any]]:
    tree = await wf_service.get_workflowy_tree()
    return [asdict(node) for node in tree]


@router.get("/nodes/{node_id}")
async def get_node(node_id: str) -> dict[str, Any]:
    node = await wf_service.get_workflowy_node(node_id)
    if not node:
        from app.middlewares.error_handler import NotFoundError
        raise NotFoundError("WorkFlowy uzel")
    return asdict(node)


@router.post("/sync/{canvas_id}")
async def sync(canvas_id: str, db: AsyncSession = Depends(get_db)) -> dict[str, int]:
    return await wf_service.sync_workflowy_to_canvas(db, canvas_id)


@router.post("/link")
async def link_node(data: LinkNodeRequest, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    await wf_service.link_node_to_workflowy(db, data.canvas_node_id, data.workflowy_node_id)
    return {"status": "ok"}


@router.post("/unlink")
async def unlink_node(data: UnlinkNodeRequest, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    await wf_service.unlink_node_from_workflowy(db, data.canvas_node_id)
    return {"status": "ok"}
