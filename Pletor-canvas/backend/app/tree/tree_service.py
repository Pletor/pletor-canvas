from sqlalchemy.ext.asyncio import AsyncSession

from app.middlewares.error_handler import AppError, NotFoundError
from app.tree.tree_model import TreeNode
from app.tree import tree_repository as repo


async def _get_node_or_404(db: AsyncSession, node_id: str) -> TreeNode:
    node = await repo.get_by_id(db, node_id)
    if not node:
        raise NotFoundError("TreeNode")
    return node


async def create_node(
    db: AsyncSession,
    canvas_id: str,
    content: str,
    parent_id: str | None = None,
    node_type: str = "bullet",
    after_id: str | None = None,
    before_id: str | None = None,
) -> TreeNode:
    """Vytvoří uzel na správné pozici mezi sourozenci."""
    # Validace: rodič existuje
    if parent_id is not None:
        parent = await repo.get_by_id(db, parent_id)
        if not parent:
            raise NotFoundError("Rodičovský uzel")

    # Výpočet lexical_order
    after_key = None
    before_key = None
    if after_id:
        after_key = await repo.get_order_key(db, after_id)
    if before_id:
        before_key = await repo.get_order_key(db, before_id)

    if after_id is None and before_id is None:
        # Přidej na konec
        last_key = await repo.get_last_child_order(db, parent_id, canvas_id)
        after_key = last_key

    lexical_order = repo.compute_order_key(after_key, before_key)

    return await repo.create(
        db, canvas_id=canvas_id, content=content,
        parent_id=parent_id, lexical_order=lexical_order,
        node_type=node_type,
    )


async def update_node(
    db: AsyncSession,
    node_id: str,
    **kwargs: object,
) -> TreeNode:
    node = await _get_node_or_404(db, node_id)
    return await repo.update(db, node, **kwargs)


async def delete_node(db: AsyncSession, node_id: str) -> None:
    await _get_node_or_404(db, node_id)
    await repo.delete_node(db, node_id)


async def move_node(
    db: AsyncSession,
    node_id: str,
    target_parent_id: str | None,
    after_id: str | None = None,
    before_id: str | None = None,
) -> TreeNode:
    """Přesune uzel do nového rodiče na pozici. Validuje cykly."""
    node = await _get_node_or_404(db, node_id)

    # Nelze přesunout uzel do sebe
    if target_parent_id == node_id:
        raise AppError(400, "CIRCULAR_MOVE", "Nelze přesunout uzel do sebe sama")

    # Nelze přesunout uzel do svého potomka
    if target_parent_id is not None:
        descendants = await repo.get_descendant_ids(db, node_id)
        if target_parent_id in descendants:
            raise AppError(400, "CIRCULAR_MOVE", "Nelze přesunout uzel do svého potomka")

        # Validace: cílový rodič existuje
        target_parent = await repo.get_by_id(db, target_parent_id)
        if not target_parent:
            raise NotFoundError("Cílový rodičovský uzel")

    # Výpočet nového lexical_order
    after_key = None
    before_key = None
    if after_id:
        after_key = await repo.get_order_key(db, after_id)
    if before_id:
        before_key = await repo.get_order_key(db, before_id)

    if after_id is None and before_id is None:
        last_key = await repo.get_last_child_order(db, target_parent_id, node.canvas_id)
        after_key = last_key

    new_order = repo.compute_order_key(after_key, before_key)

    node.parent_id = target_parent_id
    node.lexical_order = new_order
    await db.commit()
    await db.refresh(node)
    return node


async def reorder_node(
    db: AsyncSession,
    node_id: str,
    after_id: str | None = None,
    before_id: str | None = None,
) -> TreeNode:
    """Změní pozici uzlu mezi sourozenci (bez změny parent_id)."""
    node = await _get_node_or_404(db, node_id)

    after_key = None
    before_key = None
    if after_id:
        after_key = await repo.get_order_key(db, after_id)
    if before_id:
        before_key = await repo.get_order_key(db, before_id)

    node.lexical_order = repo.compute_order_key(after_key, before_key)
    await db.commit()
    await db.refresh(node)
    return node


async def indent_node(db: AsyncSession, node_id: str) -> TreeNode:
    """Odsadí uzel doprava — nový parent = předchozí sourozenec."""
    node = await _get_node_or_404(db, node_id)
    siblings = await repo.get_siblings(db, node)

    # Najdi předchozího sourozence
    prev_sibling = None
    for sibling in siblings:
        if sibling.id == node.id:
            break
        prev_sibling = sibling

    if prev_sibling is None:
        raise AppError(400, "CANNOT_INDENT", "Uzel nemá předchozího sourozence — nelze odsadit")

    # Přesuň jako poslední dítě předchozího sourozence
    last_child_key = await repo.get_last_child_order(db, prev_sibling.id, node.canvas_id)
    node.parent_id = prev_sibling.id
    node.lexical_order = repo.compute_order_key(last_child_key, None)
    await db.commit()
    await db.refresh(node)
    return node


async def outdent_node(db: AsyncSession, node_id: str) -> TreeNode:
    """Odsadí uzel doleva — nový parent = parent stávajícího parent."""
    node = await _get_node_or_404(db, node_id)

    if node.parent_id is None:
        raise AppError(400, "CANNOT_OUTDENT", "Root uzel nelze odsadit doleva")

    parent = await _get_node_or_404(db, node.parent_id)

    # Nový parent = parent rodičovského uzlu (může být None = root)
    new_parent_id = parent.parent_id

    # Pozice: za rodičem mezi jeho sourozenci
    parent_siblings = await repo.get_siblings(db, parent)
    parent_idx = next(i for i, s in enumerate(parent_siblings) if s.id == parent.id)

    after_key = parent.lexical_order
    before_key = parent_siblings[parent_idx + 1].lexical_order if parent_idx + 1 < len(parent_siblings) else None

    node.parent_id = new_parent_id
    node.lexical_order = repo.compute_order_key(after_key, before_key)
    await db.commit()
    await db.refresh(node)
    return node


async def toggle_complete(db: AsyncSession, node_id: str) -> TreeNode:
    node = await _get_node_or_404(db, node_id)
    node.is_completed = not node.is_completed
    await db.commit()
    await db.refresh(node)
    return node


async def toggle_collapse(db: AsyncSession, node_id: str) -> TreeNode:
    node = await _get_node_or_404(db, node_id)
    node.is_collapsed = not node.is_collapsed
    await db.commit()
    await db.refresh(node)
    return node


async def duplicate_subtree(db: AsyncSession, node_id: str) -> TreeNode:
    """Zkopíruje uzel + všechny potomky. Nový uzel se vloží za originál."""
    node = await _get_node_or_404(db, node_id)
    flat = await repo.get_subtree_flat(db, node_id)

    if not flat:
        raise NotFoundError("TreeNode")

    # Mapování starých ID → nové ID
    from app.canvas.canvas_model import generate_cuid
    id_map: dict[str, str] = {}
    for row in flat:
        id_map[str(row["id"])] = generate_cuid()

    # Pozice nového root uzlu: za originálem
    siblings = await repo.get_siblings(db, node)
    node_idx = next(i for i, s in enumerate(siblings) if s.id == node.id)
    after_key = node.lexical_order
    before_key = siblings[node_idx + 1].lexical_order if node_idx + 1 < len(siblings) else None

    new_root: TreeNode | None = None
    for row in flat:
        old_id = str(row["id"])
        new_id = id_map[old_id]
        old_parent = str(row["parent_id"]) if row["parent_id"] else None

        if old_id == node.id:
            # Root kopie — za originálem
            new_parent_id = node.parent_id
            new_order = repo.compute_order_key(after_key, before_key)
        else:
            new_parent_id = id_map.get(old_parent) if old_parent else None  # type: ignore[arg-type]
            new_order = str(row["lexical_order"])

        new_node = TreeNode(
            id=new_id,
            canvas_id=node.canvas_id,
            parent_id=new_parent_id,
            lexical_order=new_order,
            content=str(row["content"]),
            note=row.get("note"),  # type: ignore[arg-type]
            node_type=str(row["node_type"]),
            stage=str(row["stage"]),
            is_completed=bool(row["is_completed"]),
            is_collapsed=bool(row["is_collapsed"]),
            color=row.get("color"),  # type: ignore[arg-type]
            metadata_json=row.get("metadata_json"),  # type: ignore[arg-type]
        )
        db.add(new_node)
        if old_id == node.id:
            new_root = new_node

    await db.commit()
    if new_root:
        await db.refresh(new_root)
    return new_root  # type: ignore[return-value]


async def create_mirror(
    db: AsyncSession,
    source_id: str,
    canvas_id: str,
    parent_id: str | None = None,
    after_id: str | None = None,
    before_id: str | None = None,
) -> TreeNode:
    """Vytvoří mirror — uzel s is_mirror_of odkazující na source."""
    source = await _get_node_or_404(db, source_id)

    after_key = None
    before_key = None
    if after_id:
        after_key = await repo.get_order_key(db, after_id)
    if before_id:
        before_key = await repo.get_order_key(db, before_id)
    if after_id is None and before_id is None:
        last_key = await repo.get_last_child_order(db, parent_id, canvas_id)
        after_key = last_key

    lexical_order = repo.compute_order_key(after_key, before_key)

    mirror = TreeNode(
        canvas_id=canvas_id,
        parent_id=parent_id,
        lexical_order=lexical_order,
        content=source.content,
        note=source.note,
        node_type=source.node_type,
        is_mirror_of=source_id,
    )
    db.add(mirror)
    await db.commit()
    await db.refresh(mirror)
    return mirror


async def get_tree(
    db: AsyncSession,
    canvas_id: str,
    root_id: str | None = None,
    max_depth: int | None = None,
) -> list[dict[str, object]]:
    """Načte strom/podstrom jako vnořenou strukturu."""
    if root_id:
        flat = await repo.get_subtree_flat(db, root_id, max_depth)
    else:
        flat = await repo.get_full_tree_flat(db, canvas_id)

    return _build_nested_tree(flat, root_id)


def _build_nested_tree(flat: list[dict[str, object]], root_id: str | None) -> list[dict[str, object]]:
    """Sestaví vnořenou stromovou strukturu z plochého seznamu."""
    node_map: dict[str, dict[str, object]] = {}

    for row in flat:
        node_id = str(row["id"])
        node_map[node_id] = {**row, "children": []}

    roots: list[dict[str, object]] = []
    for row in flat:
        node_id = str(row["id"])
        parent_id = row.get("parent_id")
        node = node_map[node_id]

        if parent_id and str(parent_id) in node_map and str(parent_id) != node_id:
            node_map[str(parent_id)]["children"].append(node)  # type: ignore[union-attr]
        elif root_id is None or node_id == root_id:
            roots.append(node)

    return roots
