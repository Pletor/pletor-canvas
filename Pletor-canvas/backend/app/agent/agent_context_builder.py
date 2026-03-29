import json
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.middlewares.error_handler import NotFoundError
from app.canvas.canvas_model import Canvas, CanvasEdge, CanvasNode


async def build_agent_context(db: AsyncSession, canvas_node_id: str) -> dict[str, Any]:
    """Sestaví kompletní kontext pro AI agenta z canvas uzlu + WorkFlowy metadata + závislostí."""
    node = await db.get(CanvasNode, canvas_node_id)

    if not node:
        raise NotFoundError("Uzel")

    canvas = await db.get(Canvas, node.canvas_id)

    source_edges_stmt = select(CanvasEdge).where(CanvasEdge.source_id == node.id).options(selectinload(CanvasEdge.target))
    target_edges_stmt = select(CanvasEdge).where(CanvasEdge.target_id == node.id).options(selectinload(CanvasEdge.source))

    source_result = await db.execute(source_edges_stmt)
    target_result = await db.execute(target_edges_stmt)

    source_edges = list(source_result.scalars().all())
    target_edges = list(target_result.scalars().all())

    constraints = json.loads(node.constraints) if node.constraints else []

    outgoing = [
        {
            "nodeId": edge.target.id,
            "label": edge.target.label,
            "nodeType": edge.target.node_type,
            "edgeType": edge.edge_type,
            "description": edge.target.description,
        }
        for edge in source_edges
    ]

    incoming = [
        {
            "nodeId": edge.source.id,
            "label": edge.source.label,
            "nodeType": edge.source.node_type,
            "edgeType": edge.edge_type,
            "description": edge.source.description,
        }
        for edge in target_edges
    ]

    return {
        "node": {
            "id": node.id,
            "label": node.label,
            "nodeType": node.node_type,
            "description": node.description,
        },
        "workflowy": {
            "prompt": node.prompt,
            "context": node.context,
            "intent": node.intent,
            "constraints": constraints,
        },
        "canvasName": canvas.name if canvas else "Unknown",
        "dependencies": {"incoming": incoming, "outgoing": outgoing},
    }


def build_prompt_from_context(agent_context: dict[str, Any]) -> str:
    """Sestaví prompt pro Claude z kontextu."""
    sections: list[str] = []

    sections.append(f"# Úkol: {agent_context['node']['label']}")
    sections.append(f"Typ: {agent_context['node']['nodeType']}")
    sections.append(f"Projekt: {agent_context['canvasName']}")

    if agent_context["node"]["description"]:
        sections.append(f"\nPopis: {agent_context['node']['description']}")

    wf = agent_context["workflowy"]
    if wf["prompt"]:
        sections.append(f"\n## Prompt\n{wf['prompt']}")
    if wf["context"]:
        sections.append(f"\n## Kontext\n{wf['context']}")
    if wf["intent"]:
        sections.append(f"\n## Záměr\n{wf['intent']}")
    if wf["constraints"]:
        sections.append(f"\n## Omezení\n" + "\n".join(f"- {c}" for c in wf["constraints"]))

    incoming = agent_context["dependencies"]["incoming"]
    outgoing = agent_context["dependencies"]["outgoing"]

    if incoming:
        sections.append("\n## Příchozí závislosti (kdo závisí na tomto uzlu)")
        for dep in incoming:
            desc = f": {dep['description']}" if dep.get("description") else ""
            sections.append(f"- {dep['label']} ({dep['nodeType']}) — {dep['edgeType']}{desc}")

    if outgoing:
        sections.append("\n## Odchozí závislosti (na čem tento uzel závisí)")
        for dep in outgoing:
            desc = f": {dep['description']}" if dep.get("description") else ""
            sections.append(f"- {dep['label']} ({dep['nodeType']}) — {dep['edgeType']}{desc}")

    sections.append("\n## Instrukce\nVygeneruj kód pro tento uzel. Dodržuj kontext, záměr a omezení. Výstup piš v TypeScript.")

    return "\n".join(sections)
