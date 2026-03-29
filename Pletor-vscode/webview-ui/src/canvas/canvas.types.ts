import type { Node, Edge } from '@xyflow/react'

export type NodeStatus = 'planned' | 'in-progress' | 'done' | 'blocked' | 'review'

export type PletorNodeType =
  | 'folder'
  | 'file'
  | 'component'
  | 'service'
  | 'api'
  | 'agent'
  | 'integration'
  | 'database'

export type PletorEdgeType = 'import' | 'apiCall' | 'dataFlow' | 'event'

export interface NoteItem {
  id: string
  text: string
  children: NoteItem[]
  collapsed: boolean
}

export interface PletorNodeData extends Record<string, unknown> {
  label: string
  nodeType: PletorNodeType
  filePath?: string
  status: NodeStatus
  intent?: string
  context?: string
  prompt?: string
  notes: NoteItem[]
}

export type PletorNode = Node<PletorNodeData, PletorNodeType>
export type PletorEdge = Edge<{ edgeType: PletorEdgeType }>

export interface CanvasData {
  nodes: PletorNode[]
  edges: PletorEdge[]
  updatedAt: string
}

export const STATUS_ICONS: Record<NodeStatus, string> = {
  planned: '○',
  'in-progress': '◑',
  done: '●',
  blocked: '✕',
  review: '◎',
}

export const STATUS_COLORS: Record<NodeStatus, string> = {
  planned: '#64748b',
  'in-progress': '#f59e0b',
  done: '#10b981',
  blocked: '#ef4444',
  review: '#8b5cf6',
}

export const NODE_COLORS: Record<PletorNodeType, { bg: string; border: string; text: string; hex: string }> = {
  folder:      { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.3)',  text: '#10b981', hex: '#10b981' },
  file:        { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.3)',  text: '#8b5cf6', hex: '#8b5cf6' },
  component:   { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.3)',  text: '#8b5cf6', hex: '#8b5cf6' },
  service:     { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  text: '#f59e0b', hex: '#f59e0b' },
  api:         { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)',  text: '#3b82f6', hex: '#3b82f6' },
  agent:       { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.3)',  text: '#ec4899', hex: '#ec4899' },
  integration: { bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.3)',   text: '#06b6d4', hex: '#06b6d4' },
  database:    { bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.3)',  text: '#fb923c', hex: '#fb923c' },
}

export const NODE_LIBRARY: Array<{ type: PletorNodeType; label: string; icon: string; category: string }> = [
  { type: 'folder',      label: 'Složka',      icon: '📁', category: 'Struktura' },
  { type: 'component',   label: 'Komponenta',  icon: '⚛️', category: 'Frontend' },
  { type: 'file',        label: 'Soubor',      icon: '📄', category: 'Frontend' },
  { type: 'api',         label: 'API',         icon: '🔌', category: 'Backend' },
  { type: 'service',     label: 'Service',     icon: '⚙️', category: 'Backend' },
  { type: 'database',    label: 'Databáze',    icon: '🗄️', category: 'Backend' },
  { type: 'agent',       label: 'Agent',       icon: '🤖', category: 'AI' },
  { type: 'integration', label: 'Integrace',   icon: '🔗', category: 'AI' },
]
