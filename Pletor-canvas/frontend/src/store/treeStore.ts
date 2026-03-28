import { create } from 'zustand'
import { treeApi, type TreeNode } from '../api/treeApi'

interface TreeState {
  tree: TreeNode[]
  loading: boolean
  error: string | null
  editingNodeId: string | null
  focusedNodeId: string | null

  loadTree: (canvasId: string) => Promise<void>
  createNode: (canvasId: string, content: string, parentId?: string | null) => Promise<void>
  updateContent: (nodeId: string, content: string) => Promise<void>
  deleteNode: (nodeId: string, canvasId: string) => Promise<void>
  indentNode: (nodeId: string, canvasId: string) => Promise<void>
  outdentNode: (nodeId: string, canvasId: string) => Promise<void>
  toggleComplete: (nodeId: string, canvasId: string) => Promise<void>
  toggleCollapse: (nodeId: string, canvasId: string) => Promise<void>
  setEditingNodeId: (id: string | null) => void
  setFocusedNodeId: (id: string | null) => void
}

export const useTreeStore = create<TreeState>()((set, get) => ({
  tree: [],
  loading: false,
  error: null,
  editingNodeId: null,
  focusedNodeId: null,

  loadTree: async (canvasId) => {
    set({ loading: true, error: null })
    try {
      const tree = await treeApi.getTree(canvasId)
      set({ tree, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createNode: async (canvasId, content, parentId) => {
    try {
      const node = await treeApi.createNode(canvasId, { content, parentId })
      // Reload celý strom — jednoduché a spolehlivé
      await get().loadTree(canvasId)
      set({ editingNodeId: node.id })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateContent: async (nodeId, content) => {
    try {
      await treeApi.updateNode(nodeId, { content })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteNode: async (nodeId, canvasId) => {
    try {
      await treeApi.deleteNode(nodeId)
      await get().loadTree(canvasId)
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  indentNode: async (nodeId, canvasId) => {
    try {
      await treeApi.indentNode(nodeId)
      await get().loadTree(canvasId)
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  outdentNode: async (nodeId, canvasId) => {
    try {
      await treeApi.outdentNode(nodeId)
      await get().loadTree(canvasId)
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  toggleComplete: async (nodeId, canvasId) => {
    try {
      await treeApi.toggleComplete(nodeId)
      await get().loadTree(canvasId)
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  toggleCollapse: async (nodeId, canvasId) => {
    try {
      await treeApi.toggleCollapse(nodeId)
      await get().loadTree(canvasId)
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  setEditingNodeId: (id) => set({ editingNodeId: id }),
  setFocusedNodeId: (id) => set({ focusedNodeId: id }),
}))
