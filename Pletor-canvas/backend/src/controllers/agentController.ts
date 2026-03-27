import type { FastifyRequest, FastifyReply } from 'fastify'
import { buildAgentContext } from '../services/agentContextBuilder.js'
import * as agentExec from '../services/agentExecutionService.js'
import { executeAgentSchema } from '../validators/agentValidator.js'

type NodeIdParam = { nodeId: string }
type ExecIdParam = { id: string }

// Zobrazí sestavený kontext pro uzel (bez spuštění agenta)
export async function getContext(req: FastifyRequest<{ Params: NodeIdParam }>, reply: FastifyReply) {
  const context = await buildAgentContext(req.params.nodeId)
  return reply.send(context)
}

// Spustí agenta pro uzel — non-streaming
export async function execute(req: FastifyRequest<{ Params: NodeIdParam }>, reply: FastifyReply) {
  const { model } = executeAgentSchema.parse(req.body ?? {})
  const execution = await agentExec.executeAgent(req.params.nodeId, model)
  return reply.send(execution)
}

// Spustí agenta pro uzel — streaming (Server-Sent Events)
export async function executeStream(req: FastifyRequest<{ Params: NodeIdParam }>, reply: FastifyReply) {
  const { model } = executeAgentSchema.parse(req.body ?? {})

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  const stream = agentExec.executeAgentStream(req.params.nodeId, model)

  for await (const chunk of stream) {
    reply.raw.write(`data: ${chunk}\n`)
  }

  reply.raw.end()
}

// Historie spuštění pro uzel
export async function listExecutions(req: FastifyRequest<{ Params: NodeIdParam }>, reply: FastifyReply) {
  const executions = await agentExec.getExecutionsByNodeId(req.params.nodeId)
  return reply.send(executions)
}

// Detail spuštění
export async function getExecution(req: FastifyRequest<{ Params: ExecIdParam }>, reply: FastifyReply) {
  const execution = await agentExec.getExecutionById(req.params.id)
  if (!execution) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Spuštění nenalezeno' })
  return reply.send(execution)
}
