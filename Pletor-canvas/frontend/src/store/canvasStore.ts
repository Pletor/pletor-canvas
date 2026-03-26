import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type XYPosition,
} from '@xyflow/react'
import type {
  PletorNode,
  PletorEdge,
  PletorNodeType,
  PletorEdgeType,
  PletorNodeData,
} from '../types/canvas.types'

interface CanvasState {
  nodes: PletorNode[]
  edges: PletorEdge[]
  selectedNodeId: string | null

  // React Flow handlery
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect

  // Výběr
  selectNode: (id: string | null) => void

  // CRUD uzly
  addNode: (type: PletorNodeType, position: XYPosition, label?: string) => void
  removeNode: (id: string) => void
  updateNodeData: (id: string, data: Partial<PletorNodeData>) => void

  // CRUD hrany
  addEdge: (source: string, target: string, edgeType: PletorEdgeType) => void
  removeEdge: (id: string) => void

  // Persistence
  resetCanvas: () => void
  setInitialData: (nodes: PletorNode[], edges: PletorEdge[]) => void
}

let nodeIdCounter = 0

function generateNodeId(type: PletorNodeType): string {
  nodeIdCounter++
  return `${type}-${Date.now()}-${nodeIdCounter}`
}

function generateEdgeId(source: string, target: string): string {
  return `e-${source}-${target}-${Date.now()}`
}

const DEFAULT_NODE_LABELS: Record<PletorNodeType, string> = {
  folder: 'Nová složka',
  file: 'Nový soubor',
  component: 'Nová komponenta',
  service: 'Nový service',
  api: 'Nový endpoint',
  agent: 'Nový agent',
  integration: 'Nová integrace',
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) as PletorNode[] })
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) as PletorEdge[] })
      },

      onConnect: (connection) => {
        const newEdge: PletorEdge = {
          ...connection,
          id: generateEdgeId(connection.source, connection.target),
          animated: true,
          data: { edgeType: 'dataFlow' as PletorEdgeType },
          type: 'dataFlow',
        }
        set({ edges: addEdge(newEdge, get().edges) as PletorEdge[] })
      },

      selectNode: (id) => {
        set({ selectedNodeId: id })
      },

      addNode: (type, position, label) => {
        const id = generateNodeId(type)
        const newNode: PletorNode = {
          id,
          type,
          position,
          data: {
            label: label ?? DEFAULT_NODE_LABELS[type],
            nodeType: type,
            status: 'active',
          },
        }
        set({ nodes: [...get().nodes, newNode] })
      },

      removeNode: (id) => {
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        })
      },

      updateNodeData: (id, data) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
          ),
        })
      },

      addEdge: (source, target, edgeType) => {
        const id = generateEdgeId(source, target)
        const newEdge: PletorEdge = {
          id,
          source,
          target,
          type: edgeType,
          animated: edgeType === 'dataFlow' || edgeType === 'event',
          data: { edgeType },
        }
        set({ edges: [...get().edges, newEdge] })
      },

      removeEdge: (id) => {
        set({ edges: get().edges.filter((e) => e.id !== id) })
      },

      resetCanvas: () => {
        set({ nodes: [], edges: [], selectedNodeId: null })
      },

      setInitialData: (nodes, edges) => {
        set({ nodes, edges, selectedNodeId: null })
      },
    }),
    {
      name: 'pletor-canvas-storage',
      // Serializace jen nodes, edges — funkce se neukládají
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    },
  ),
)
