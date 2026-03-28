from fractional_indexing import generate_key_between
from sqlalchemy import String, column, delete, literal, select, text, union_all
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tree_node import TreeNode


async def get_by_id(db: AsyncSession, node_id: str) -> TreeNode | None:
    return await db.get(TreeNode, node_id)


async def get_children(db: AsyncSession, parent_id: str | None, canvas_id: str) -> list[TreeNode]:
    """Přímé děti seřazené podle lexical_order."""
    if parent_id is None:
        stmt = (
            select(TreeNode)
            .where(TreeNode.canvas_id == canvas_id, TreeNode.parent_id.is_(None))
            .order_by(TreeNode.lexical_order)
        )
    else:
        stmt = (
            select(TreeNode)
            .where(TreeNode.parent_id == parent_id)
            .order_by(TreeNode.lexical_order)
        )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_root_nodes(db: AsyncSession, canvas_id: str) -> list[TreeNode]:
    """Root uzly (parent_id IS NULL) pro canvas."""
    return await get_children(db, None, canvas_id)


async def get_last_child_order(db: AsyncSession, parent_id: str | None, canvas_id: str) -> str | None:
    """Vrátí lexical_order posledního dítěte, nebo None pokud žádné neexistuje."""
    if parent_id is None:
        stmt = (
            select(TreeNode.lexical_order)
            .where(TreeNode.canvas_id == canvas_id, TreeNode.parent_id.is_(None))
            .order_by(TreeNode.lexical_order.desc())
            .limit(1)
        )
    else:
        stmt = (
            select(TreeNode.lexical_order)
            .where(TreeNode.parent_id == parent_id)
            .order_by(TreeNode.lexical_order.desc())
            .limit(1)
        )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_order_key(db: AsyncSession, node_id: str) -> str | None:
    """Vrátí lexical_order uzlu podle ID."""
    result = await db.execute(select(TreeNode.lexical_order).where(TreeNode.id == node_id))
    return result.scalar_one_or_none()


def compute_order_key(after_key: str | None, before_key: str | None) -> str:
    """Vypočítá lexical_order mezi dvěma sourozenci."""
    return generate_key_between(after_key, before_key)


async def create(
    db: AsyncSession,
    canvas_id: str,
    content: str,
    parent_id: str | None = None,
    lexical_order: str | None = None,
    **kwargs: object,
) -> TreeNode:
    """Vytvoří uzel. Pokud lexical_order není zadán, přidá na konec."""
    if lexical_order is None:
        last_key = await get_last_child_order(db, parent_id, canvas_id)
        lexical_order = compute_order_key(last_key, None)

    node = TreeNode(
        canvas_id=canvas_id,
        parent_id=parent_id,
        content=content,
        lexical_order=lexical_order,
        **kwargs,
    )
    db.add(node)
    await db.commit()
    await db.refresh(node)
    return node


async def update(db: AsyncSession, node: TreeNode, **kwargs: object) -> TreeNode:
    for key, value in kwargs.items():
        if value is not None:
            setattr(node, key, value)
    await db.commit()
    await db.refresh(node)
    return node


async def delete_node(db: AsyncSession, node_id: str) -> None:
    """Smaže uzel + všechny potomky (explicitně přes CTE, protože SQLite CASCADE vyžaduje PRAGMA)."""
    descendant_ids = await get_descendant_ids(db, node_id)
    all_ids = descendant_ids | {node_id}
    await db.execute(delete(TreeNode).where(TreeNode.id.in_(all_ids)))
    await db.commit()


async def get_subtree_flat(db: AsyncSession, root_id: str, max_depth: int | None = None) -> list[dict[str, object]]:
    """Recursive CTE — vrátí plochý seznam uzlů podstromu s hloubkou.

    Používá raw SQL pro Recursive CTE, protože SQLAlchemy Core CTE
    s async session je spolehlivější než ORM pro rekurzivní dotazy.
    """
    depth_clause = ""
    params: dict[str, object] = {"root_id": root_id}
    if max_depth is not None:
        depth_clause = "AND st.depth < :max_depth"
        params["max_depth"] = max_depth

    sql = text(f"""
        WITH RECURSIVE subtree AS (
            SELECT *, 0 AS depth FROM tree_node WHERE id = :root_id
            UNION ALL
            SELECT tn.*, st.depth + 1 AS depth FROM tree_node tn
            JOIN subtree st ON tn.parent_id = st.id
            WHERE 1=1 {depth_clause}
        )
        SELECT * FROM subtree ORDER BY depth, lexical_order
    """)

    result = await db.execute(sql, params)
    rows = result.mappings().all()
    return [dict(row) for row in rows]


async def get_full_tree_flat(db: AsyncSession, canvas_id: str) -> list[dict[str, object]]:
    """Načte všechny uzly canvasu jako plochý seznam seřazený pro sestavení stromu."""
    stmt = (
        select(TreeNode)
        .where(TreeNode.canvas_id == canvas_id)
        .order_by(TreeNode.lexical_order)
    )
    result = await db.execute(stmt)
    nodes = result.scalars().all()
    return [
        {
            "id": n.id,
            "parent_id": n.parent_id,
            "canvas_id": n.canvas_id,
            "lexical_order": n.lexical_order,
            "content": n.content,
            "note": n.note,
            "node_type": n.node_type,
            "stage": n.stage,
            "is_completed": n.is_completed,
            "is_collapsed": n.is_collapsed,
            "is_mirror_of": n.is_mirror_of,
            "color": n.color,
            "metadata_json": n.metadata_json,
            "created_at": n.created_at,
            "updated_at": n.updated_at,
        }
        for n in nodes
    ]


async def get_siblings(db: AsyncSession, node: TreeNode) -> list[TreeNode]:
    """Vrátí všechny sourozence uzlu (včetně sebe) seřazené podle lexical_order."""
    if node.parent_id is None:
        stmt = (
            select(TreeNode)
            .where(TreeNode.canvas_id == node.canvas_id, TreeNode.parent_id.is_(None))
            .order_by(TreeNode.lexical_order)
        )
    else:
        stmt = (
            select(TreeNode)
            .where(TreeNode.parent_id == node.parent_id)
            .order_by(TreeNode.lexical_order)
        )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_ancestor_ids(db: AsyncSession, node_id: str) -> set[str]:
    """Vrátí množinu ID všech předků uzlu (pro detekci cyklů při přesunu)."""
    sql = text("""
        WITH RECURSIVE ancestors AS (
            SELECT parent_id FROM tree_node WHERE id = :node_id
            UNION ALL
            SELECT tn.parent_id FROM tree_node tn
            JOIN ancestors a ON tn.id = a.parent_id
            WHERE a.parent_id IS NOT NULL
        )
        SELECT parent_id FROM ancestors WHERE parent_id IS NOT NULL
    """)
    result = await db.execute(sql, {"node_id": node_id})
    return {row[0] for row in result.fetchall()}


async def get_descendant_ids(db: AsyncSession, node_id: str) -> set[str]:
    """Vrátí množinu ID všech potomků uzlu."""
    sql = text("""
        WITH RECURSIVE descendants AS (
            SELECT id FROM tree_node WHERE parent_id = :node_id
            UNION ALL
            SELECT tn.id FROM tree_node tn
            JOIN descendants d ON tn.parent_id = d.id
        )
        SELECT id FROM descendants
    """)
    result = await db.execute(sql, {"node_id": node_id})
    return {row[0] for row in result.fetchall()}
