from cuid2 import cuid_wrapper
from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

generate_cuid = cuid_wrapper()


class AgentExecution(Base, TimestampMixin):
    __tablename__ = "agent_execution"
    __table_args__ = (
        Index("ix_agent_execution_canvas_node_id", "canvas_node_id"),
        Index("ix_agent_execution_status", "status"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_cuid)
    canvas_node_id: Mapped[str] = mapped_column(String, ForeignKey("canvas_node.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String, default="pending")  # pending | running | completed | failed
    prompt: Mapped[str] = mapped_column(String)
    context: Mapped[str] = mapped_column(String)  # JSON
    output: Mapped[str | None] = mapped_column(String, nullable=True)
    error: Mapped[str | None] = mapped_column(String, nullable=True)
    model: Mapped[str] = mapped_column(String, default="claude-sonnet-4-20250514")
    tokens_in: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tokens_out: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    canvas_node: Mapped["CanvasNode"] = relationship(back_populates="executions")


from app.canvas.canvas_model import CanvasNode  # noqa: E402, F401
