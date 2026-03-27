const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Chyba serveru' }))
    throw new Error(error.message)
  }

  return response.json()
}

export interface WorkFlowyNodeDto {
  id: string
  name: string
  prompt?: string
  context?: string
  intent?: string
  constraints: string[]
  children: WorkFlowyNodeDto[]
  raw: string
}

export const workflowyApi = {
  status: () =>
    fetchApi<{ configured: boolean }>('/api/v1/workflowy/status'),

  configure: (sessionToken: string) =>
    fetchApi<{ status: string }>('/api/v1/workflowy/configure', {
      method: 'POST',
      body: JSON.stringify({ sessionToken }),
    }),

  getTree: () =>
    fetchApi<WorkFlowyNodeDto[]>('/api/v1/workflowy/tree'),

  getNode: (nodeId: string) =>
    fetchApi<WorkFlowyNodeDto>(`/api/v1/workflowy/nodes/${nodeId}`),

  sync: (canvasId: string) =>
    fetchApi<{ synced: number; total: number }>(`/api/v1/workflowy/sync/${canvasId}`, {
      method: 'POST',
    }),

  linkNode: (canvasNodeId: string, workflowyNodeId: string) =>
    fetchApi<unknown>('/api/v1/workflowy/link', {
      method: 'POST',
      body: JSON.stringify({ canvasNodeId, workflowyNodeId }),
    }),

  unlinkNode: (canvasNodeId: string) =>
    fetchApi<unknown>('/api/v1/workflowy/unlink', {
      method: 'POST',
      body: JSON.stringify({ canvasNodeId }),
    }),
}
