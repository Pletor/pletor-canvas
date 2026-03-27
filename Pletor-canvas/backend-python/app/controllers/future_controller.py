from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

NOT_IMPLEMENTED = JSONResponse(
    status_code=501,
    content={"error": "NOT_IMPLEMENTED", "message": "Tento endpoint bude dostupný v budoucí verzi"},
)


@router.get("/api/v1/filesystem/tree")
@router.get("/api/v1/filesystem/file")
@router.get("/api/v1/tickets")
@router.get("/api/v1/logs")
@router.get("/api/v1/memory")
@router.get("/api/v1/rules")
async def not_implemented() -> JSONResponse:
    return NOT_IMPLEMENTED
