import { create } from 'zustand'
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
  CanvasData,
  NoteItem,
} from './canvas.types'
import { postMessage } from '../lib/vscode'

interface CanvasState {
  nodes: PletorNode[]
  edges: PletorEdge[]
  selectedNodeId: string | null

  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect

  selectNode: (id: string | null) => void
  addNode: (type: PletorNodeType, position: XYPosition, label?: string, filePath?: string) => void
  removeNode: (id: string) => void
  updateNodeData: (id: string, data: Partial<PletorNodeData>) => void
  addEdge: (source: string, target: string, edgeType: PletorEdgeType) => void
  removeEdge: (id: string) => void
  loadCanvas: (data: CanvasData) => void
  saveCanvas: () => void
}

let counter = 0

function genId(type: PletorNodeType): string {
  return `${type}-${Date.now()}-${++counter}`
}

const DEFAULT_LABELS: Record<PletorNodeType, string> = {
  folder: 'Nová složka',
  file: 'Nový soubor',
  component: 'Nová komponenta',
  service: 'Nový service',
  api: 'Nový endpoint',
  agent: 'Nový agent',
  integration: 'Nová integrace',
  database: 'Nová databáze',
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
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
    const edge: PletorEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      animated: true,
      data: { edgeType: 'dataFlow' },
      type: 'dataFlow',
    }
    set({ edges: addEdge(edge, get().edges) as PletorEdge[] })
    get().saveCanvas()
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  addNode: (type, position, label, filePath) => {
    const node: PletorNode = {
      id: genId(type),
      type,
      position,
      data: {
        label: label ?? DEFAULT_LABELS[type],
        nodeType: type,
        filePath,
        status: 'planned',
        notes: [],
      },
    }
    set({ nodes: [...get().nodes, node] })
    get().saveCanvas()
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    })
    get().saveCanvas()
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    })
    get().saveCanvas()
  },

  addEdge: (source, target, edgeType) => {
    const edge: PletorEdge = {
      id: `e-${source}-${target}-${Date.now()}`,
      source,
      target,
      type: edgeType,
      animated: edgeType === 'dataFlow' || edgeType === 'event',
      data: { edgeType },
    }
    set({ edges: [...get().edges, edge] })
    get().saveCanvas()
  },

  removeEdge: (id) => {
    set({ edges: get().edges.filter((e) => e.id !== id) })
    get().saveCanvas()
  },

  loadCanvas: (data) => {
    set({ nodes: data.nodes, edges: data.edges, selectedNodeId: null })
  },

  saveCanvas: () => {
    const { nodes, edges } = get()
    const data: CanvasData = { nodes, edges, updatedAt: new Date().toISOString() }
    postMessage('saveCanvas', data)
  },
}))

// Pomocná funkce pro vytvoření nové note položky
export function createNote(text = ''): NoteItem {
  return { id: `note-${Date.now()}`, text, children: [], collapsed: false }
}
