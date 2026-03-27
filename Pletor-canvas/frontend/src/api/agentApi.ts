import { API_BASE, fetchApi } from './fetchApi'

export interface AgentContextDto {
  node: { id: string; label: string; nodeType: string; description: string | null }
  workflowy: { prompt: string | null; context: string | null; intent: string | null; constraints: string[] }
  dependencies: {
    incoming: { nodeId: string; label: string; nodeType: string; edgeType: string }[]
    outgoing: { nodeId: string; label: string; nodeType: string; edgeType: string }[]
  }
  canvasName: string
}

export interface AgentExecutionDto {
  id: string
  canvasNodeId: string
  status: string
  prompt: string
  output: string | null
  error: string | null
  model: string
  tokensIn: number | null
  tokensOut: number | null
  durationMs: number | null
  createdAt: string
}

// Streaming event typy
export type StreamEvent =
  | { type: 'start'; executionId: string; model: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; executionId: string; tokensIn: number; tokensOut: number; durationMs: number }

export const agentApi = {
  getContext: (nodeId: string) =>
    fetchApi<AgentContextDto>(`/api/v1/agents/${nodeId}/context`),

  execute: (nodeId: string, model?: string) =>
    fetchApi<AgentExecutionDto>(`/api/v1/agents/${nodeId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ model }),
    }),

  // Streaming — vrátí ReadableStream
  async *stream(nodeId: string, model?: string): AsyncGenerator<StreamEvent> {
    const response = await fetch(`${API_BASE}/api/v1/agents/${nodeId}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model }),
    })

    if (!response.ok || !response.body) {
      const error = await response.json().catch(() => ({ message: 'Chyba serveru' }))
      throw new Error(error.message)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.replace(/^data:\s*/, '').trim()
        if (!trimmed) continue
        yield JSON.parse(trimmed) as StreamEvent
      }
    }
  },

  listExecutions: (nodeId: string) =>
    fetchApi<AgentExecutionDto[]>(`/api/v1/agents/${nodeId}/executions`),

  getExecution: (id: string) =>
    fetchApi<AgentExecutionDto>(`/api/v1/agents/executions/${id}`),
}
