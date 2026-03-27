import re
from dataclasses import dataclass, field

from app.services.workflowy_api_client import WorkFlowyTreeNode


@dataclass
class ParsedWorkFlowyNode:
    id: str
    name: str
    prompt: str | None = None
    context: str | None = None
    intent: str | None = None
    constraints: list[str] = field(default_factory=list)
    children: list["ParsedWorkFlowyNode"] = field(default_factory=list)
    note: str | None = None


def parse_workflowy_tree(nodes: list[WorkFlowyTreeNode]) -> list[ParsedWorkFlowyNode]:
    """Parsuje WorkFlowy strom na strukturovaná data s PROMPT/CONTEXT/INTENT/CONSTRAINTS."""
    return [_parse_node(node) for node in nodes]


def _parse_node(node: WorkFlowyTreeNode) -> ParsedWorkFlowyNode:
    children = [_parse_node(child) for child in node.children]

    all_text = _build_node_text(node)
    child_texts = [f"{c.name}\n{c.note or ''}" for c in node.children]

    prompt = _extract_tag(all_text, "PROMPT") or _extract_tag_from_children(child_texts, "PROMPT")
    context = _extract_tag(all_text, "CONTEXT") or _extract_tag_from_children(child_texts, "CONTEXT")
    intent = _extract_tag(all_text, "INTENT") or _extract_tag_from_children(child_texts, "INTENT")
    constraints = _extract_constraints(all_text, node.children)

    return ParsedWorkFlowyNode(
        id=node.id, name=strip_formatting(node.name),
        prompt=prompt, context=context, intent=intent,
        constraints=constraints, children=children, note=node.note,
    )


def _build_node_text(node: WorkFlowyTreeNode) -> str:
    parts = [node.name]
    if node.note:
        parts.append(node.note)
    return "\n".join(parts)


def _extract_tag(text: str, tag: str) -> str | None:
    """Extrahuje hodnotu tagu z textu. Podporuje: 'PROMPT: text', '- PROMPT: text', '**PROMPT**: text'."""
    patterns = [
        rf'(?:^|\n)\s*-?\s*\*{{0,2}}{tag}\*{{0,2}}\s*[:—–-]\s*"([^"]+)"',
        rf"(?:^|\n)\s*-?\s*\*{{0,2}}{tag}\*{{0,2}}\s*[:—–-]\s*(.+?)(?:\n|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match and match.group(1):
            return _clean_value(match.group(1))
    return None


def _extract_tag_from_children(child_texts: list[str], tag: str) -> str | None:
    for text in child_texts:
        value = _extract_tag(text, tag)
        if value:
            return value
    return None


def _extract_constraints(text: str, children: list[WorkFlowyTreeNode]) -> list[str]:
    """Extrahuje CONSTRAINTS — může být jako seznam dětí nebo jako čárkami oddělený text."""
    constraints: list[str] = []

    match = re.search(r"CONSTRAINTS?\s*[:—–-]\s*(.+?)(?:\n\s*[A-Z]|$)", text, re.IGNORECASE | re.DOTALL)
    if match and match.group(1):
        items = [s.strip().lstrip("- ") for s in re.split(r"[,\n]", match.group(1)) if s.strip()]
        constraints.extend(items)

    for child in children:
        name = strip_formatting(child.name).upper()
        if name.startswith("CONSTRAINT"):
            for grandchild in child.children:
                constraints.append(_clean_value(strip_formatting(grandchild.name)))

    return constraints


def strip_formatting(text: str) -> str:
    """Odstraní markdown formátování."""
    text = re.sub(r"\*{1,2}([^*]+)\*{1,2}", r"\1", text)
    text = re.sub(r"~~([^~]+)~~", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text.strip()


def _clean_value(value: str) -> str:
    value = re.sub(r'^["\']|["\']$', "", value)
    return re.sub(r"\s+", " ", value).strip()
