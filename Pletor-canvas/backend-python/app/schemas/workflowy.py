from pydantic import BaseModel, Field


class ConfigureWorkFlowyRequest(BaseModel):
    api_key: str = Field(min_length=1, alias="apiKey")

    model_config = {"populate_by_name": True}


class LinkNodeRequest(BaseModel):
    canvas_node_id: str = Field(min_length=1, alias="canvasNodeId")
    workflowy_node_id: str = Field(min_length=1, alias="workflowyNodeId")

    model_config = {"populate_by_name": True}


class UnlinkNodeRequest(BaseModel):
    canvas_node_id: str = Field(min_length=1, alias="canvasNodeId")

    model_config = {"populate_by_name": True}
