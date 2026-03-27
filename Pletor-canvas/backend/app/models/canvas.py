from cuid2 import cuid_wrapper
from sqlalchemy import Float, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

generate_cuid = cuid_wrapper()


class Canvas(Base, TimestampMixin):
    __tablename__ = "canvas"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_cuid)
    name: Mapped[str] = mapped_column(String, default="Nový canvas")
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    nodes: Mapped[list["CanvasNode"]] = relationship(back_populates="canvas", cascade="all, delete-orphan")
    edges: Mapped[list["CanvasEdge"]] = relationship(back_populates="canvas", cascade="all, delete-orphan")


class CanvasNode(Base, TimestampMixin):
    __tablename__ = "canvas_node"
    __table_args__ = (Index("ix_canvas_node_canvas_id", "canvas_id"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_cuid)
    canvas_id: Mapped[str] = mapped_column(String, ForeignKey("canvas.id", ondelete="CASCADE"))
    node_type: Mapped[str] = mapped_column(String)  # folder | file | component | service | api | agent | integration
    label: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")  # active | draft | archived
    position_x: Mapped[float] = mapped_column(Float)
    position_y: Mapped[float] = mapped_column(Float)

    # WorkFlowy metadata
    workflowy_node_id: Mapped[str | None] = mapped_column(String, nullable=True)
    prompt: Mapped[str | None] = mapped_column(String, nullable=True)
    context: Mapped[str | None] = mapped_column(String, nullable=True)
    intent: Mapped[str | None] = mapped_column(String, nullable=True)
    constraints: Mapped[str | None] = mapped_column(String, nullable=True)  # JSON array jako string

    canvas: Mapped["Canvas"] = relationship(back_populates="nodes")
    source_edges: Mapped[list["CanvasEdge"]] = relationship(
        back_populates="source", foreign_keys="CanvasEdge.source_id", cascade="all, delete-orphan"
    )
    target_edges: Mapped[list["CanvasEdge"]] = relationship(
        back_populates="target", foreign_keys="CanvasEdge.target_id", cascade="all, delete-orphan"
    )
    executions: Mapped[list["AgentExecution"]] = relationship(back_populates="canvas_node", cascade="all, delete-orphan")


class CanvasEdge(Base, TimestampMixin):
    __tablename__ = "canvas_edge"
    __table_args__ = (
        Index("ix_canvas_edge_canvas_id", "canvas_id"),
        Index("ix_canvas_edge_source_id", "source_id"),
        Index("ix_canvas_edge_target_id", "target_id"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_cuid)
    canvas_id: Mapped[str] = mapped_column(String, ForeignKey("canvas.id", ondelete="CASCADE"))
    edge_type: Mapped[str] = mapped_column(String)  # import | apiCall | dataFlow | event
    source_id: Mapped[str] = mapped_column(String, ForeignKey("canvas_node.id", ondelete="CASCADE"))
    target_id: Mapped[str] = mapped_column(String, ForeignKey("canvas_node.id", ondelete="CASCADE"))
    label: Mapped[str | None] = mapped_column(String, nullable=True)
    animated: Mapped[bool] = mapped_column(default=False)

    canvas: Mapped["Canvas"] = relationship(back_populates="edges")
    source: Mapped["CanvasNode"] = relationship(back_populates="source_edges", foreign_keys=[source_id])
    target: Mapped["CanvasNode"] = relationship(back_populates="target_edges", foreign_keys=[target_id])


# Import pro relationship reference
from app.models.agent import AgentExecution  # noqa: E402, F401
