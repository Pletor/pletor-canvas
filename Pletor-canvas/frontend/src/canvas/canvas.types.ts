import type { Node, Edge } from '@xyflow/react'

// Typy uzlů na canvasu
export type PletorNodeType =
  | 'folder'
  | 'file'
  | 'component'
  | 'service'
  | 'api'
  | 'agent'
  | 'integration'

// Typy hran mezi uzly
export type PletorEdgeType =
  | 'import'
  | 'apiCall'
  | 'dataFlow'
  | 'event'

// WorkFlowy metadata — připravené pro Fázi 2, prázdné v Fázi 0
export interface WorkFlowyMeta {
  prompt?: string
  context?: string
  intent?: string
  constraints?: string[]
  workflowyNodeId?: string
}

// Stav uzlu
export type PletorNodeStatus = 'active' | 'draft' | 'archived'

// Data uvnitř každého uzlu — index signature nutná pro React Flow v12
export interface PletorNodeData extends Record<string, unknown> {
  label: string
  nodeType: PletorNodeType
  description?: string
  workflowy?: WorkFlowyMeta
  childCount?: number
  connectionCount?: number
  status: PletorNodeStatus
}

// Data uvnitř každé hrany — index signature nutná pro React Flow v12
export interface PletorEdgeData extends Record<string, unknown> {
  edgeType: PletorEdgeType
  label?: string
}

// Typované aliasy pro React Flow
export type PletorNode = Node<PletorNodeData>
export type PletorEdge = Edge<PletorEdgeData>

// Barevný systém podle typu uzlu
export const NODE_COLORS: Record<PletorNodeType, { bg: string; border: string; text: string; hex: string }> = {
  folder:      { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.4)', text: '#6ee7b7', hex: '#10b981' },
  file:        { bg: 'rgba(139, 92, 246, 0.12)',  border: 'rgba(139, 92, 246, 0.4)', text: '#c4b5fd', hex: '#8b5cf6' },
  component:   { bg: 'rgba(139, 92, 246, 0.12)',  border: 'rgba(139, 92, 246, 0.4)', text: '#c4b5fd', hex: '#8b5cf6' },
  service:     { bg: 'rgba(245, 158, 11, 0.12)',   border: 'rgba(245, 158, 11, 0.4)', text: '#fcd34d', hex: '#f59e0b' },
  api:         { bg: 'rgba(59, 130, 246, 0.12)',   border: 'rgba(59, 130, 246, 0.4)', text: '#93c5fd', hex: '#3b82f6' },
  agent:       { bg: 'rgba(236, 72, 153, 0.12)',   border: 'rgba(236, 72, 153, 0.4)', text: '#f9a8d4', hex: '#ec4899' },
  integration: { bg: 'rgba(6, 182, 212, 0.12)',    border: 'rgba(6, 182, 212, 0.4)',  text: '#67e8f9', hex: '#06b6d4' },
}

// Barevný systém podle typu hrany
export const EDGE_COLORS: Record<PletorEdgeType, { color: string; style: 'solid' | 'dashed' | 'dotted' }> = {
  import:   { color: '#10b981', style: 'solid' },
  apiCall:  { color: '#3b82f6', style: 'dashed' },
  dataFlow: { color: '#f59e0b', style: 'solid' },
  event:    { color: '#8b5cf6', style: 'dotted' },
}

// Metadata pro knihovnu uzlů (levý panel)
export const NODE_LIBRARY: { type: PletorNodeType; label: string; category: string }[] = [
  { type: 'folder',      label: 'Složka',     category: 'Struktura' },
  { type: 'file',        label: 'Soubor',     category: 'Struktura' },
  { type: 'component',   label: 'Komponenta', category: 'Logika' },
  { type: 'service',     label: 'Service',    category: 'Logika' },
  { type: 'api',         label: 'API',        category: 'Logika' },
  { type: 'agent',       label: 'AI Agent',   category: 'Orchestrace' },
  { type: 'integration', label: 'Integrace',  category: 'Orchestrace' },
]
