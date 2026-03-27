import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '../config/database.js'
import { env } from '../config/env.js'
import { AppError } from '../middlewares/errorHandler.js'
import { buildAgentContext, buildPromptFromContext } from './agentContextBuilder.js'

const SYSTEM_PROMPT = `Jsi AI agent v systému Pletor — vizuálním orchestračním IDE.
Generuješ kód na základě kontextu z WorkFlowy a canvas závislostí.
Piš čistý, produkční TypeScript kód. Dodržuj Clean Architecture.
Nepiš komentáře ke zjevným věcem. Používej early returns.
Odpovídej POUZE kódem — žádné vysvětlování, žádný markdown.`

function getClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AppError(400, 'ANTHROPIC_NOT_CONFIGURED', 'ANTHROPIC_API_KEY není nastaven v .env')
  }
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
}

// Spustí generování kódu pro canvas uzel — non-streaming (jednoduchá verze)
export async function executeAgent(canvasNodeId: string, model?: string) {
  const agentContext = await buildAgentContext(canvasNodeId)
  const prompt = buildPromptFromContext(agentContext)
  const selectedModel = model ?? 'claude-sonnet-4-20250514'

  // Vytvoř záznam o spuštění
  const execution = await prisma.agentExecution.create({
    data: {
      canvasNodeId,
      prompt,
      context: JSON.stringify(agentContext),
      model: selectedModel,
      status: 'running',
    },
  })

  const startTime = Date.now()

  const client = getClient()

  const response = await client.messages.create({
    model: selectedModel,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const output = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  const durationMs = Date.now() - startTime

  // Aktualizuj záznam
  return prisma.agentExecution.update({
    where: { id: execution.id },
    data: {
      status: 'completed',
      output,
      tokensIn: response.usage.input_tokens,
      tokensOut: response.usage.output_tokens,
      durationMs,
    },
  })
}

// Streaming verze — vrátí AsyncIterable s chunky textu
export async function* executeAgentStream(canvasNodeId: string, model?: string) {
  const agentContext = await buildAgentContext(canvasNodeId)
  const prompt = buildPromptFromContext(agentContext)
  const selectedModel = model ?? 'claude-sonnet-4-20250514'

  const execution = await prisma.agentExecution.create({
    data: {
      canvasNodeId,
      prompt,
      context: JSON.stringify(agentContext),
      model: selectedModel,
      status: 'running',
    },
  })

  const startTime = Date.now()
  const client = getClient()

  const stream = client.messages.stream({
    model: selectedModel,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  // Posílej chunky textu průběžně
  let fullOutput = ''

  // Pošli metadata o spuštění jako první událost
  yield JSON.stringify({ type: 'start', executionId: execution.id, model: selectedModel }) + '\n'

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullOutput += event.delta.text
      yield JSON.stringify({ type: 'delta', text: event.delta.text }) + '\n'
    }
  }

  const finalMessage = await stream.finalMessage()
  const durationMs = Date.now() - startTime

  // Ulož výsledek
  await prisma.agentExecution.update({
    where: { id: execution.id },
    data: {
      status: 'completed',
      output: fullOutput,
      tokensIn: finalMessage.usage.input_tokens,
      tokensOut: finalMessage.usage.output_tokens,
      durationMs,
    },
  })

  yield JSON.stringify({
    type: 'done',
    executionId: execution.id,
    tokensIn: finalMessage.usage.input_tokens,
    tokensOut: finalMessage.usage.output_tokens,
    durationMs,
  }) + '\n'
}

// Načte historii spuštění pro uzel
export function getExecutionsByNodeId(canvasNodeId: string) {
  return prisma.agentExecution.findMany({
    where: { canvasNodeId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

// Načte konkrétní spuštění
export function getExecutionById(id: string) {
  return prisma.agentExecution.findUnique({ where: { id } })
}
