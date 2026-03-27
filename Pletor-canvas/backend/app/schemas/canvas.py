from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


# Frontend posílá a očekává camelCase klíče
class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    @classmethod
    def _to_camel(cls, name: str) -> str:
        parts = name.split("_")
        return parts[0] + "".join(w.capitalize() for w in parts[1:])


def camel_alias(field_name: str) -> str:
    parts = field_name.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])


class NodeType(StrEnum):
    FOLDER = "folder"
    FILE = "file"
    COMPONENT = "component"
    SERVICE = "service"
    API = "api"
    AGENT = "agent"
    INTEGRATION = "integration"


class EdgeType(StrEnum):
    IMPORT = "import"
    API_CALL = "apiCall"
    DATA_FLOW = "dataFlow"
    EVENT = "event"


class NodeStatus(StrEnum):
    ACTIVE = "active"
    DRAFT = "draft"
    ARCHIVED = "archived"


# === Request schemas ===


class CreateCanvasRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)


class UpdateCanvasRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)


class CreateNodeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    node_type: NodeType = Field(alias="nodeType")
    label: str = Field(min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)
    status: NodeStatus = NodeStatus.ACTIVE
    position_x: float = Field(alias="positionX")
    position_y: float = Field(alias="positionY")


class UpdateNodeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    label: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)
    status: NodeStatus | None = None
    position_x: float | None = Field(None, alias="positionX")
    position_y: float | None = Field(None, alias="positionY")
    node_type: NodeType | None = Field(None, alias="nodeType")


class CreateEdgeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    edge_type: EdgeType = Field(alias="edgeType")
    source_id: str = Field(min_length=1, alias="sourceId")
    target_id: str = Field(min_length=1, alias="targetId")
    label: str | None = Field(None, max_length=200)
    animated: bool = False


class UpdateEdgeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    edge_type: EdgeType | None = Field(None, alias="edgeType")
    label: str | None = Field(None, max_length=200)
    animated: bool | None = None


class BatchNodeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str | None = None
    node_type: NodeType = Field(alias="nodeType")
    label: str = Field(min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)
    status: NodeStatus = NodeStatus.ACTIVE
    position_x: float = Field(alias="positionX")
    position_y: float = Field(alias="positionY")


class BatchEdgeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str | None = None
    edge_type: EdgeType = Field(alias="edgeType")
    source_id: str = Field(min_length=1, alias="sourceId")
    target_id: str = Field(min_length=1, alias="targetId")
    label: str | None = Field(None, max_length=200)
    animated: bool = False


class BatchSaveRequest(BaseModel):
    nodes: list[BatchNodeRequest]
    edges: list[BatchEdgeRequest]


# === Response schemas ===
# Musí vracet camelCase klíče aby frontend fungoval bez změn


class CanvasResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class CanvasListResponse(CanvasResponse):
    count: dict[str, int] | None = Field(None, serialization_alias="_count")


class NodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    canvas_id: str = Field(serialization_alias="canvasId")
    node_type: str = Field(serialization_alias="nodeType")
    label: str
    description: str | None
    status: str
    position_x: float = Field(serialization_alias="positionX")
    position_y: float = Field(serialization_alias="positionY")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class EdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    canvas_id: str = Field(serialization_alias="canvasId")
    edge_type: str = Field(serialization_alias="edgeType")
    source_id: str = Field(serialization_alias="sourceId")
    target_id: str = Field(serialization_alias="targetId")
    label: str | None
    animated: bool
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class CanvasDetailResponse(CanvasResponse):
    nodes: list[NodeResponse]
    edges: list[EdgeResponse]


class BatchSaveResponse(BaseModel):
    nodes: list[NodeResponse]
    edges: list[EdgeResponse]
