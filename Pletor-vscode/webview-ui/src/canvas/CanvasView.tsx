import { useCallback, useEffect, type DragEvent } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCanvasStore } from './canvasStore'
import PletorNode from './nodes/PletorNode'
import { NodeInspector } from './NodeInspector'
import { NodeLibrary } from './NodeLibrary'
import { NODE_COLORS, type PletorNodeData, type PletorNodeType, type CanvasData } from './canvas.types'
import { onMessage, postMessage } from '../lib/vscode'
import './CanvasView.css'

const nodeTypes = {
  folder: PletorNode,
  file: PletorNode,
  component: PletorNode,
  service: PletorNode,
  api: PletorNode,
  agent: PletorNode,
  integration: PletorNode,
  database: PletorNode,
}

interface CanvasViewProps {
  initial: CanvasData | undefined
  workspaceFiles: Array<{ id: string; label: string; filePath: string; type: PletorNodeType }>
}

function CanvasInner({ initial, workspaceFiles }: CanvasViewProps) {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnect = useCanvasStore((s) => s.onConnect)
  const selectNode = useCanvasStore((s) => s.selectNode)
  const addNode = useCanvasStore((s) => s.addNode)
  const removeNode = useCanvasStore((s) => s.removeNode)
  const loadCanvas = useCanvasStore((s) => s.loadCanvas)
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const { screenToFlowPosition } = useReactFlow()

  // Načti initial data
  useEffect(() => {
    if (initial) loadCanvas(initial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Naslouchej zprávám z extension
  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type === 'canvasUpdated') {
        loadCanvas(msg.payload as CanvasData)
      }
    })
  }, [loadCanvas])

  const onNodeClick: NodeMouseHandler = useCallback((_e, node) => {
    selectNode(node.id)
  }, [selectNode])

  const onEdgeClick: EdgeMouseHandler = useCallback((_e, edge) => {
    if (window.confirm(`Smazat spojení?`)) {
      useCanvasStore.getState().removeEdge(edge.id)
    }
  }, [])

  const onPaneClick = useCallback(() => selectNode(null), [selectNode])

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/pletor-node-type') as PletorNodeType
    const label = e.dataTransfer.getData('application/pletor-node-label')
    const filePath = e.dataTransfer.getData('application/pletor-file-path') || undefined
    if (!type) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addNode(type, position, label, filePath)
  }, [screenToFlowPosition, addNode])

  // Delete klávesa
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        removeNode(selectedNodeId)
      }
      if (e.key === 'Escape') selectNode(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedNodeId, removeNode, selectNode])

  const minimapColor = useCallback((node: { data?: Record<string, unknown> }) => {
    const t = (node.data as PletorNodeData | undefined)?.nodeType as PletorNodeType | undefined
    return t ? NODE_COLORS[t].hex : '#10b981'
  }, [])

  const handleImportWorkspace = useCallback(() => {
    postMessage('importFromWorkspace')
  }, [])

  return (
    <div className="canvas-view">
      <div className="canvas-toolbar">
        <span className="canvas-logo">Pletor</span>
        <span className="canvas-title">Canvas</span>
        <div className="canvas-stats">
          <span>{nodes.length} uzlů</span>
          <span>{edges.length} spojení</span>
        </div>
        <button className="canvas-import-btn" onClick={handleImportWorkspace} title="Importovat ze workspace">
          ↓ Import
        </button>
      </div>

      <div className="canvas-workspace">
        <NodeLibrary workspaceFiles={workspaceFiles} />

        <div className="canvas-flow" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(16,185,129,0.1)" />
            <Controls />
            <MiniMap nodeColor={minimapColor} maskColor="rgba(12,31,23,0.8)" />
          </ReactFlow>
        </div>

        {selectedNodeId && <NodeInspector />}
      </div>
    </div>
  )
}

function CanvasView(props: CanvasViewProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}

export default CanvasView
