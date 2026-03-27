from pydantic import BaseModel


class ExecuteAgentRequest(BaseModel):
    model: str | None = None
