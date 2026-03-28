from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.config.database import engine
from app.models.base import Base
from app.models.canvas import Canvas, CanvasNode, CanvasEdge  # noqa: F401
from app.models.agent import AgentExecution  # noqa: F401
from app.middlewares.error_handler import register_error_handlers
from app.controllers.canvas_controller import router as canvas_router
from app.controllers.workflowy_controller import router as workflowy_router
from app.controllers.agent_controller import router as agent_router
from app.controllers.tree_controller import router as tree_router
from app.models.tree_node import TreeNode  # noqa: F401


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    # Vytvoř tabulky při startu (dev mód — v produkci přes Alembic)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="Pletor API", version="0.1.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN, "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlery
register_error_handlers(app)

# Routery
app.include_router(canvas_router)
app.include_router(workflowy_router)
app.include_router(agent_router)
app.include_router(tree_router)


# Health check
@app.get("/api/v1/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
