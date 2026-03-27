from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: list[dict[str, str]] | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or []
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, entity: str):
        super().__init__(404, "NOT_FOUND", f"{entity} nebyl nalezen")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        body: dict[str, object] = {"error": exc.code, "message": exc.message}
        if exc.details:
            body["details"] = exc.details
        return JSONResponse(status_code=exc.status_code, content=body)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
        details = [{"field": ".".join(str(loc) for loc in e["loc"]), "issue": e["msg"]} for e in exc.errors()]
        return JSONResponse(
            status_code=422,
            content={"error": "VALIDATION_ERROR", "message": "Neplatný vstup", "details": details},
        )
