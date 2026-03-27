"""Unit testy pro WorkFlowy parser — extrakce PROMPT/CONTEXT/INTENT/CONSTRAINTS tagů."""

from app.services.workflowy_api_client import WorkFlowyTreeNode
from app.services.workflowy_parser_service import (
    ParsedWorkFlowyNode,
    parse_workflowy_tree,
    strip_formatting,
)


def _make_node(name: str, note: str | None = None, children: list | None = None) -> WorkFlowyTreeNode:
    return WorkFlowyTreeNode(
        id="test-id", name=name, note=note, priority=0,
        created_at=0, modified_at=0, children=children or [],
    )


def test_extract_prompt_from_name():
    tree = parse_workflowy_tree([_make_node("PROMPT: Vygeneruj REST API")])
    assert tree[0].prompt == "Vygeneruj REST API"


def test_extract_prompt_from_note():
    tree = parse_workflowy_tree([_make_node("AuthService", note="PROMPT: Implementuj JWT autentizaci")])
    assert tree[0].prompt == "Implementuj JWT autentizaci"


def test_extract_context_and_intent():
    node = _make_node("Feature", note="CONTEXT: Fastify backend\nINTENT: Refaktor na Clean Architecture")
    result = parse_workflowy_tree([node])[0]
    assert result.context == "Fastify backend"
    assert result.intent == "Refaktor na Clean Architecture"


def test_extract_constraints_inline():
    node = _make_node("Task", note="CONSTRAINTS: TypeScript strict, no any, max 40 lines")
    result = parse_workflowy_tree([node])[0]
    assert "TypeScript strict" in result.constraints
    assert "no any" in result.constraints


def test_extract_constraints_from_children():
    child1 = _make_node("Constraint child 1")
    child2 = _make_node("Constraint child 2")
    constraints_node = _make_node("CONSTRAINTS", children=[child1, child2])
    parent = _make_node("Parent task", children=[constraints_node])

    result = parse_workflowy_tree([parent])[0]
    assert "Constraint child 1" in result.constraints
    assert "Constraint child 2" in result.constraints


def test_extract_prompt_with_bold_formatting():
    node = _make_node("**PROMPT**: Vytvoř komponentu")
    result = parse_workflowy_tree([node])[0]
    assert result.prompt == "Vytvoř komponentu"


def test_extract_prompt_with_dash_prefix():
    node = _make_node("Feature", note="- PROMPT: Testovací prompt s pomlčkou")
    result = parse_workflowy_tree([node])[0]
    assert result.prompt == "Testovací prompt s pomlčkou"


def test_strip_formatting_bold():
    assert strip_formatting("**bold text**") == "bold text"


def test_strip_formatting_italic():
    assert strip_formatting("*italic text*") == "italic text"


def test_strip_formatting_strikethrough():
    assert strip_formatting("~~deleted~~") == "deleted"


def test_strip_formatting_code():
    assert strip_formatting("`inline code`") == "inline code"


def test_strip_formatting_link():
    assert strip_formatting("[link text](http://example.com)") == "link text"


def test_strip_formatting_combined():
    assert strip_formatting("**bold** and *italic* and `code`") == "bold and italic and code"


def test_nested_children_parsed():
    grandchild = _make_node("PROMPT: Vnořený prompt")
    child = _make_node("Child node", children=[grandchild])
    parent = _make_node("Parent", children=[child])

    result = parse_workflowy_tree([parent])[0]
    assert len(result.children) == 1
    assert result.children[0].children[0].prompt == "Vnořený prompt"


def test_empty_tree():
    result = parse_workflowy_tree([])
    assert result == []


def test_node_without_tags():
    result = parse_workflowy_tree([_make_node("Prostý uzel")])[0]
    assert result.prompt is None
    assert result.context is None
    assert result.intent is None
    assert result.constraints == []
