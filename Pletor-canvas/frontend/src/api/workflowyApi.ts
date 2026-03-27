import { fetchApi } from './fetchApi'

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

  configure: (apiKey: string) =>
    fetchApi<{ status: string }>('/api/v1/workflowy/configure', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
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
