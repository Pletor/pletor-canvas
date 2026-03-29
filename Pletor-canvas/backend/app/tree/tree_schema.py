from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.canvas.canvas_schema import camel_alias


class PositionSpec(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    after_id: str | None = Field(None, alias=camel_alias("after_id"), serialization_alias=camel_alias("after_id"))
    before_id: str | None = Field(None, alias=camel_alias("before_id"), serialization_alias=camel_alias("before_id"))


class CreateNodeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    content: str = ""
    parent_id: str | None = Field(None, alias=camel_alias("parent_id"), serialization_alias=camel_alias("parent_id"))
    node_type: str = Field("bullet", alias=camel_alias("node_type"), serialization_alias=camel_alias("node_type"))
    position: PositionSpec | None = None


class UpdateNodeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    content: str | None = None
    note: str | None = None
    node_type: str | None = Field(None, alias=camel_alias("node_type"), serialization_alias=camel_alias("node_type"))
    stage: str | None = None
    color: str | None = None
    is_completed: bool | None = Field(
        None, alias=camel_alias("is_completed"), serialization_alias=camel_alias("is_completed")
    )
    is_collapsed: bool | None = Field(
        None, alias=camel_alias("is_collapsed"), serialization_alias=camel_alias("is_collapsed")
    )
    metadata_json: str | None = Field(
        None, alias=camel_alias("metadata_json"), serialization_alias=camel_alias("metadata_json")
    )


class MoveNodeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_parent_id: str | None = Field(
        None, alias=camel_alias("target_parent_id"), serialization_alias=camel_alias("target_parent_id")
    )
    position: PositionSpec | None = None


class ReorderRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    after_id: str | None = Field(None, alias=camel_alias("after_id"), serialization_alias=camel_alias("after_id"))
    before_id: str | None = Field(None, alias=camel_alias("before_id"), serialization_alias=camel_alias("before_id"))


class MirrorRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    source_id: str = Field(alias=camel_alias("source_id"), serialization_alias=camel_alias("source_id"))
    parent_id: str | None = Field(None, alias=camel_alias("parent_id"), serialization_alias=camel_alias("parent_id"))
    position: PositionSpec | None = None


class TreeNodeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    parent_id: str | None = Field(
        None, alias=camel_alias("parent_id"), serialization_alias=camel_alias("parent_id")
    )
    canvas_id: str = Field(alias=camel_alias("canvas_id"), serialization_alias=camel_alias("canvas_id"))
    lexical_order: str = Field(
        alias=camel_alias("lexical_order"), serialization_alias=camel_alias("lexical_order")
    )
    content: str
    note: str | None = None
    node_type: str = Field(alias=camel_alias("node_type"), serialization_alias=camel_alias("node_type"))
    stage: str
    is_completed: bool = Field(
        alias=camel_alias("is_completed"), serialization_alias=camel_alias("is_completed")
    )
    is_collapsed: bool = Field(
        alias=camel_alias("is_collapsed"), serialization_alias=camel_alias("is_collapsed")
    )
    is_mirror_of: str | None = Field(
        None, alias=camel_alias("is_mirror_of"), serialization_alias=camel_alias("is_mirror_of")
    )
    color: str | None = None
    metadata_json: str | None = Field(
        None, alias=camel_alias("metadata_json"), serialization_alias=camel_alias("metadata_json")
    )
    created_at: datetime = Field(alias=camel_alias("created_at"), serialization_alias=camel_alias("created_at"))
    updated_at: datetime = Field(alias=camel_alias("updated_at"), serialization_alias=camel_alias("updated_at"))
    children: list["TreeNodeResponse"] = []


class TreeNodeFlatResponse(BaseModel):
    """Plochá verze bez children — pro single-node odpovědi."""
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    parent_id: str | None = Field(
        None, alias=camel_alias("parent_id"), serialization_alias=camel_alias("parent_id")
    )
    canvas_id: str = Field(alias=camel_alias("canvas_id"), serialization_alias=camel_alias("canvas_id"))
    lexical_order: str = Field(
        alias=camel_alias("lexical_order"), serialization_alias=camel_alias("lexical_order")
    )
    content: str
    note: str | None = None
    node_type: str = Field(alias=camel_alias("node_type"), serialization_alias=camel_alias("node_type"))
    stage: str
    is_completed: bool = Field(
        alias=camel_alias("is_completed"), serialization_alias=camel_alias("is_completed")
    )
    is_collapsed: bool = Field(
        alias=camel_alias("is_collapsed"), serialization_alias=camel_alias("is_collapsed")
    )
    is_mirror_of: str | None = Field(
        None, alias=camel_alias("is_mirror_of"), serialization_alias=camel_alias("is_mirror_of")
    )
    color: str | None = None
    metadata_json: str | None = Field(
        None, alias=camel_alias("metadata_json"), serialization_alias=camel_alias("metadata_json")
    )
    created_at: datetime = Field(alias=camel_alias("created_at"), serialization_alias=camel_alias("created_at"))
    updated_at: datetime = Field(alias=camel_alias("updated_at"), serialization_alias=camel_alias("updated_at"))
