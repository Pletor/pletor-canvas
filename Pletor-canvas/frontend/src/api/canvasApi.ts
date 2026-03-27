import { fetchApi } from './fetchApi'

export { ApiError } from './fetchApi'

// === Typy z backendu ===

export interface CanvasDto {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: { nodes: number; edges: number }
}

export interface CanvasDetailDto extends CanvasDto {
  nodes: NodeDto[]
  edges: EdgeDto[]
}

export interface NodeDto {
  id: string
  canvasId: string
  nodeType: string
  label: string
  description: string | null
  status: string
  positionX: number
  positionY: number
  createdAt: string
  updatedAt: string
}

export interface EdgeDto {
  id: string
  canvasId: string
  edgeType: string
  sourceId: string
  targetId: string
  label: string | null
  animated: boolean
  createdAt: string
  updatedAt: string
}

// === API metody ===

export const canvasApi = {
  // Canvas
  listCanvases: () =>
    fetchApi<CanvasDto[]>('/api/v1/canvas'),

  getCanvas: (id: string) =>
    fetchApi<CanvasDetailDto>(`/api/v1/canvas/${id}`),

  createCanvas: (data: { name: string; description?: string }) =>
    fetchApi<CanvasDto>('/api/v1/canvas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCanvas: (id: string, data: { name?: string; description?: string }) =>
    fetchApi<CanvasDto>(`/api/v1/canvas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCanvas: (id: string) =>
    fetchApi<void>(`/api/v1/canvas/${id}`, { method: 'DELETE' }),

  // Nodes
  listNodes: (canvasId: string) =>
    fetchApi<NodeDto[]>(`/api/v1/canvas/${canvasId}/nodes`),

  createNode: (canvasId: string, data: {
    nodeType: string
    label: string
    description?: string
    positionX: number
    positionY: number
    status?: string
  }) =>
    fetchApi<NodeDto>(`/api/v1/canvas/${canvasId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateNode: (id: string, data: {
    label?: string
    description?: string
    status?: string
    positionX?: number
    positionY?: number
    nodeType?: string
  }) =>
    fetchApi<NodeDto>(`/api/v1/nodes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteNode: (id: string) =>
    fetchApi<void>(`/api/v1/nodes/${id}`, { method: 'DELETE' }),

  // Edges
  listEdges: (canvasId: string) =>
    fetchApi<EdgeDto[]>(`/api/v1/canvas/${canvasId}/edges`),

  createEdge: (canvasId: string, data: {
    edgeType: string
    sourceId: string
    targetId: string
    label?: string
    animated?: boolean
  }) =>
    fetchApi<EdgeDto>(`/api/v1/canvas/${canvasId}/edges`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEdge: (id: string, data: {
    edgeType?: string
    label?: string
    animated?: boolean
  }) =>
    fetchApi<EdgeDto>(`/api/v1/edges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteEdge: (id: string) =>
    fetchApi<void>(`/api/v1/edges/${id}`, { method: 'DELETE' }),

  // Batch — uloží celý canvas najednou
  batchSave: (canvasId: string, data: {
    nodes: {
      id?: string
      nodeType: string
      label: string
      description?: string
      status?: string
      positionX: number
      positionY: number
    }[]
    edges: {
      id?: string
      edgeType: string
      sourceId: string
      targetId: string
      label?: string
      animated?: boolean
    }[]
  }) =>
    fetchApi<{ nodes: NodeDto[]; edges: EdgeDto[] }>(`/api/v1/canvas/${canvasId}/batch`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Health check
  health: () =>
    fetchApi<{ status: string; version: string; timestamp: string }>('/api/v1/health'),
}
