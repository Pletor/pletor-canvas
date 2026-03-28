from sqlalchemy import Boolean, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.canvas import generate_cuid


class TreeNode(Base, TimestampMixin):
    """Uzel nekonečného stromu — adjacency list + fractional indexing."""

    __tablename__ = "tree_node"
    __table_args__ = (
        Index("ix_tree_node_parent_order", "parent_id", "lexical_order"),
        Index("ix_tree_node_canvas", "canvas_id"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_cuid)
    parent_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("tree_node.id", ondelete="CASCADE"), nullable=True
    )
    canvas_id: Mapped[str] = mapped_column(
        String, ForeignKey("canvas.id", ondelete="CASCADE")
    )
    lexical_order: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    node_type: Mapped[str] = mapped_column(String, default="bullet")  # bullet | todo | heading | code | card
    stage: Mapped[str] = mapped_column(String, default="note")  # note | outline | draft | done
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_collapsed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_mirror_of: Mapped[str | None] = mapped_column(
        String, ForeignKey("tree_node.id", ondelete="SET NULL"), nullable=True
    )
    color: Mapped[str | None] = mapped_column(String, nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string pro rozšiřitelnost

    # Vztahy
    parent: Mapped["TreeNode | None"] = relationship(
        back_populates="children",
        remote_side="TreeNode.id",
        foreign_keys=[parent_id],
    )
    children: Mapped[list["TreeNode"]] = relationship(
        back_populates="parent",
        foreign_keys=[parent_id],
        cascade="all, delete-orphan",
        order_by="TreeNode.lexical_order",
    )
    mirror_source: Mapped["TreeNode | None"] = relationship(
        remote_side="TreeNode.id",
        foreign_keys=[is_mirror_of],
    )
    canvas: Mapped["Canvas"] = relationship()


# Import pro relationship reference
from app.models.canvas import Canvas  # noqa: E402, F401
