from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.middlewares.error_handler import NotFoundError
from app.schemas.agent import ExecuteAgentRequest
from app.services.agent_context_builder import build_agent_context
from app.services.agent_execution_service import (
    execute_agent,
    execute_agent_stream,
    get_execution_by_id,
    get_executions_by_node_id,
)

router = APIRouter(prefix="/api/v1/agents")


@router.get("/{node_id}/context")
async def get_context(node_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    return await build_agent_context(db, node_id)


@router.post("/{node_id}/execute")
async def execute(node_id: str, data: ExecuteAgentRequest | None = None, db: AsyncSession = Depends(get_db)) -> dict:
    body = data or ExecuteAgentRequest()
    execution = await execute_agent(db, node_id, body.model)
    return {
        "id": execution.id,
        "canvasNodeId": execution.canvas_node_id,
        "status": execution.status,
        "prompt": execution.prompt,
        "output": execution.output,
        "model": execution.model,
        "tokensIn": execution.tokens_in,
        "tokensOut": execution.tokens_out,
        "durationMs": execution.duration_ms,
        "createdAt": execution.created_at.isoformat() if execution.created_at else None,
    }


@router.post("/{node_id}/stream")
async def execute_stream(node_id: str, data: ExecuteAgentRequest | None = None, db: AsyncSession = Depends(get_db)) -> StreamingResponse:
    body = data or ExecuteAgentRequest()
    generator = execute_agent_stream(db, node_id, body.model)

    async def event_stream():
        async for chunk in generator:
            yield f"data: {chunk}\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    })


@router.get("/{node_id}/executions")
async def list_executions(node_id: str, db: AsyncSession = Depends(get_db)) -> list[dict]:
    executions = await get_executions_by_node_id(db, node_id)
    return [
        {
            "id": ex.id,
            "canvasNodeId": ex.canvas_node_id,
            "status": ex.status,
            "model": ex.model,
            "tokensIn": ex.tokens_in,
            "tokensOut": ex.tokens_out,
            "durationMs": ex.duration_ms,
            "createdAt": ex.created_at.isoformat() if ex.created_at else None,
        }
        for ex in executions
    ]


@router.get("/executions/{execution_id}")
async def get_execution(execution_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    execution = await get_execution_by_id(db, execution_id)
    if not execution:
        raise NotFoundError("Spuštění")
    return {
        "id": execution.id,
        "canvasNodeId": execution.canvas_node_id,
        "status": execution.status,
        "prompt": execution.prompt,
        "output": execution.output,
        "model": execution.model,
        "tokensIn": execution.tokens_in,
        "tokensOut": execution.tokens_out,
        "durationMs": execution.duration_ms,
        "createdAt": execution.created_at.isoformat() if execution.created_at else None,
    }
