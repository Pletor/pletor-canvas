import type { Node, Edge } from '@xyflow/react'

export const INITIAL_NODES: Node[] = [
  {
    id: 'process-1',
    type: 'default',
    position: { x: 250, y: 50 },
    data: { label: '⚙️ Build Pipeline' },
    className: 'canvas-node node-process',
  },
  {
    id: 'agent-1',
    type: 'default',
    position: { x: 500, y: 50 },
    data: { label: '🤖 Code Review Agent' },
    className: 'canvas-node node-agent',
  },
  {
    id: 'integration-github',
    type: 'default',
    position: { x: 100, y: 200 },
    data: { label: '🔗 GitHub' },
    className: 'canvas-node node-integration',
  },
  {
    id: 'integration-notion',
    type: 'default',
    position: { x: 350, y: 200 },
    data: { label: '🔗 Notion' },
    className: 'canvas-node node-integration',
  },
  {
    id: 'agent-2',
    type: 'default',
    position: { x: 600, y: 200 },
    data: { label: '🤖 Deploy Agent' },
    className: 'canvas-node node-agent',
  },
  {
    id: 'ticket-1',
    type: 'default',
    position: { x: 150, y: 370 },
    data: { label: '📋 Feature: Auth' },
    className: 'canvas-node node-ticket',
  },
  {
    id: 'ticket-2',
    type: 'default',
    position: { x: 400, y: 370 },
    data: { label: '📋 Bug: API timeout' },
    className: 'canvas-node node-ticket',
  },
  {
    id: 'log-1',
    type: 'default',
    position: { x: 650, y: 370 },
    data: { label: '📊 Deploy Log' },
    className: 'canvas-node node-log',
  },
  {
    id: 'process-2',
    type: 'default',
    position: { x: 250, y: 520 },
    data: { label: '⚙️ Test Suite' },
    className: 'canvas-node node-process',
  },
  {
    id: 'agent-3',
    type: 'default',
    position: { x: 500, y: 520 },
    data: { label: '🤖 QA Agent' },
    className: 'canvas-node node-agent',
  },
]

export const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'process-1', target: 'agent-1', animated: true, className: 'canvas-edge' },
  { id: 'e2', source: 'integration-github', target: 'process-1', className: 'canvas-edge' },
  { id: 'e3', source: 'integration-notion', target: 'ticket-1', className: 'canvas-edge' },
  { id: 'e4', source: 'integration-notion', target: 'ticket-2', className: 'canvas-edge' },
  { id: 'e5', source: 'agent-1', target: 'agent-2', animated: true, className: 'canvas-edge' },
  { id: 'e6', source: 'agent-2', target: 'log-1', className: 'canvas-edge' },
  { id: 'e7', source: 'ticket-1', target: 'process-2', className: 'canvas-edge' },
  { id: 'e8', source: 'process-2', target: 'agent-3', animated: true, className: 'canvas-edge' },
  { id: 'e9', source: 'ticket-2', target: 'process-2', className: 'canvas-edge' },
  { id: 'e10', source: 'integration-github', target: 'ticket-1', className: 'canvas-edge' },
]
