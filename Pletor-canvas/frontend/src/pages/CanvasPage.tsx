import { useState, useEffect, useCallback, type DragEvent } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCanvasStore } from '../store/canvasStore'
import { pletorNodeTypes } from '../components/canvas'
import { pletorEdgeTypes } from '../components/canvas/edges'
import { CanvasNodeLibraryPanel, CanvasInspectorPanel } from '../components/panels'
import { SEED_NODES, SEED_EDGES } from '../data/canvasSeedData'
import { NODE_COLORS } from '../types/canvas.types'
import type { PletorNodeData, PletorNodeType } from '../types/canvas.types'
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard'
import CanvasNavigation from '../components/layout/CanvasNavigation'
import './CanvasPage.css'

interface CanvasPageProps {
  onBack: () => void
}

function CanvasPageInner({ onBack }: CanvasPageProps) {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnect = useCanvasStore((s) => s.onConnect)
  const selectNode = useCanvasStore((s) => s.selectNode)
  const addNode = useCanvasStore((s) => s.addNode)
  const setInitialData = useCanvasStore((s) => s.setInitialData)
  const reactFlowInstance = useReactFlow()
  const [activeSection, setActiveSection] = useState('canvas')

  useCanvasKeyboard()

  // Při prvním spuštění načti seed data (pokud je store prázdný)
  useEffect(() => {
    if (nodes.length === 0) {
      setInitialData(SEED_NODES, SEED_EDGES)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      selectNode(node.id)
    },
    [selectNode],
  )

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  // Drag & drop — přidání uzlu z knihovny na canvas
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/pletor-node-type') as PletorNodeType
      const label = event.dataTransfer.getData('application/pletor-node-label')

      if (!type) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(type, position, label)
    },
    [reactFlowInstance, addNode],
  )

  // Barva uzlu v minimapě podle typu
  const minimapNodeColor = useCallback((node: { data?: Record<string, unknown> }) => {
    const nodeType = (node.data as PletorNodeData | undefined)?.nodeType as PletorNodeType | undefined
    if (nodeType && NODE_COLORS[nodeType]) {
      return NODE_COLORS[nodeType].hex
    }
    return '#10b981'
  }, [])

  return (
    <div className="canvas-page">
      <div className="canvas-toolbar">
        <button className="canvas-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zpět
        </button>
        <span className="canvas-toolbar-title">Pletor Canvas</span>
        <div className="canvas-toolbar-info">
          <span className="canvas-node-count">{nodes.length} uzlů</span>
          <span className="canvas-edge-count">{edges.length} spojení</span>
        </div>
      </div>
      <CanvasNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="canvas-workspace">
        <CanvasNodeLibraryPanel onDragStart={() => {}} />
        <div
          className="canvas-container"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={pletorNodeTypes}
            edgeTypes={pletorEdgeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={{ type: 'dataFlow' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(16, 185, 129, 0.15)" />
            <Controls className="canvas-controls" />
            <MiniMap
              className="canvas-minimap"
              nodeColor={minimapNodeColor}
              maskColor="rgba(12, 31, 23, 0.8)"
            />
          </ReactFlow>
        </div>
        <CanvasInspectorPanel />
      </div>
    </div>
  )
}

function CanvasPage(props: CanvasPageProps) {
  return (
    <ReactFlowProvider>
      <CanvasPageInner {...props} />
    </ReactFlowProvider>
  )
}

export default CanvasPage
