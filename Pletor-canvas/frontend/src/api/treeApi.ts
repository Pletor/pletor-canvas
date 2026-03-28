import { fetchApi } from './fetchApi'

export interface TreeNode {
  id: string
  parentId: string | null
  canvasId: string
  lexicalOrder: string
  content: string
  note: string | null
  nodeType: string
  stage: string
  isCompleted: boolean
  isCollapsed: boolean
  isMirrorOf: string | null
  color: string | null
  metadataJson: string | null
  createdAt: string
  updatedAt: string
  children: TreeNode[]
}

export interface TreeNodeFlat extends Omit<TreeNode, 'children'> {}

interface CreateNodePayload {
  content: string
  parentId?: string | null
  nodeType?: string
  position?: { afterId?: string | null; beforeId?: string | null }
}

interface MoveNodePayload {
  targetParentId: string | null
  position?: { afterId?: string | null; beforeId?: string | null }
}

export const treeApi = {
  getTree: (canvasId: string) =>
    fetchApi<TreeNode[]>(`/api/v1/tree/${canvasId}`),

  getSubtree: (canvasId: string, nodeId: string) =>
    fetchApi<TreeNode[]>(`/api/v1/tree/${canvasId}/node/${nodeId}`),

  createNode: (canvasId: string, data: CreateNodePayload) =>
    fetchApi<TreeNodeFlat>(`/api/v1/tree/${canvasId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateNode: (nodeId: string, data: Partial<{ content: string; note: string; nodeType: string; stage: string; color: string }>) =>
    fetchApi<TreeNodeFlat>(`/api/v1/tree/nodes/${nodeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteNode: (nodeId: string) =>
    fetchApi<void>(`/api/v1/tree/nodes/${nodeId}`, { method: 'DELETE' }),

  moveNode: (nodeId: string, data: MoveNodePayload) =>
    fetchApi<TreeNodeFlat>(`/api/v1/tree/nodes/${nodeId}/move`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  indentNode: (nodeId: string) =>
    fetchApi<TreeNodeFlat>(`/api/v1/tree/nodes/${nodeId}/indent`, { method: 'POST' }),

  outdentNode: (nodeId: string) =>
    fetchApi<TreeNodeFlat>(`/api/v1/tree/nodes/${nodeId}/outdent`, { method: 'POST' }),

  toggleComplete: (nodeId: string) =>
    fetchApi<TreeNodeFlat>(`/api/v1/tree/nodes/${nodeId}/toggle-complete`, { method: 'POST' }),

  toggleCollapse: (nodeId: string) =>
    fetchApi<TreeNodeFlat>(`/api/v1/tree/nodes/${nodeId}/toggle-collapse`, { method: 'POST' }),

  duplicateNode: (nodeId: string) =>
    fetchApi<TreeNodeFlat>(`/api/v1/tree/nodes/${nodeId}/duplicate`, { method: 'POST' }),
}
