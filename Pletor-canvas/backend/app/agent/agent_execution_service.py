import json
import time
from collections.abc import AsyncGenerator
from typing import Any

import anthropic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.middlewares.error_handler import AppError
from app.agent.agent_model import AgentExecution
from app.agent.agent_context_builder import build_agent_context, build_prompt_from_context

SYSTEM_PROMPT = """Jsi AI agent v systému Pletor — vizuálním orchestračním IDE.
Generuješ kód na základě kontextu z WorkFlowy a canvas závislostí.
Piš čistý, produkční TypeScript kód. Dodržuj Clean Architecture.
Nepiš komentáře ke zjevným věcem. Používej early returns.
Odpovídej POUZE kódem — žádné vysvětlování, žádný markdown."""


def _get_client() -> anthropic.AsyncAnthropic:
    if not settings.ANTHROPIC_API_KEY:
        raise AppError(400, "ANTHROPIC_NOT_CONFIGURED", "ANTHROPIC_API_KEY není nastaven v .env")
    return anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


async def execute_agent(db: AsyncSession, canvas_node_id: str, model: str | None = None) -> AgentExecution:
    """Spustí generování kódu pro canvas uzel — non-streaming."""
    agent_context = await build_agent_context(db, canvas_node_id)
    prompt = build_prompt_from_context(agent_context)
    selected_model = model or "claude-sonnet-4-20250514"

    execution = AgentExecution(
        canvas_node_id=canvas_node_id,
        prompt=prompt,
        context=json.dumps(agent_context),
        model=selected_model,
        status="running",
    )
    db.add(execution)
    await db.commit()
    await db.refresh(execution)

    start_time = time.monotonic()
    client = _get_client()

    response = await client.messages.create(
        model=selected_model,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    output = "\n".join(block.text for block in response.content if block.type == "text")
    duration_ms = int((time.monotonic() - start_time) * 1000)

    execution.status = "completed"
    execution.output = output
    execution.tokens_in = response.usage.input_tokens
    execution.tokens_out = response.usage.output_tokens
    execution.duration_ms = duration_ms

    await db.commit()
    await db.refresh(execution)
    return execution


async def execute_agent_stream(db: AsyncSession, canvas_node_id: str, model: str | None = None) -> AsyncGenerator[str, None]:
    """Streaming verze — vrátí AsyncGenerator s chunky textu ve formátu SSE."""
    agent_context = await build_agent_context(db, canvas_node_id)
    prompt = build_prompt_from_context(agent_context)
    selected_model = model or "claude-sonnet-4-20250514"

    execution = AgentExecution(
        canvas_node_id=canvas_node_id,
        prompt=prompt,
        context=json.dumps(agent_context),
        model=selected_model,
        status="running",
    )
    db.add(execution)
    await db.commit()
    await db.refresh(execution)

    start_time = time.monotonic()
    client = _get_client()

    yield json.dumps({"type": "start", "executionId": execution.id, "model": selected_model}) + "\n"

    full_output = ""

    async with client.messages.stream(
        model=selected_model,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for text in stream.text_stream:
            full_output += text
            yield json.dumps({"type": "delta", "text": text}) + "\n"

        final_message = await stream.get_final_message()

    duration_ms = int((time.monotonic() - start_time) * 1000)

    execution.status = "completed"
    execution.output = full_output
    execution.tokens_in = final_message.usage.input_tokens
    execution.tokens_out = final_message.usage.output_tokens
    execution.duration_ms = duration_ms

    await db.commit()

    yield json.dumps({
        "type": "done",
        "executionId": execution.id,
        "tokensIn": final_message.usage.input_tokens,
        "tokensOut": final_message.usage.output_tokens,
        "durationMs": duration_ms,
    }) + "\n"


async def get_executions_by_node_id(db: AsyncSession, canvas_node_id: str) -> list[AgentExecution]:
    stmt = select(AgentExecution).where(AgentExecution.canvas_node_id == canvas_node_id).order_by(AgentExecution.created_at.desc()).limit(10)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_execution_by_id(db: AsyncSession, execution_id: str) -> AgentExecution | None:
    return await db.get(AgentExecution, execution_id)
