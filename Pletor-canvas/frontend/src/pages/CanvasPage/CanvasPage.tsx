import { useState, useCallback, type DragEvent } from 'react'
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
import { useCanvasStore } from '../../store/canvasStore'
import { pletorNodeTypes } from '../../components/canvas'
import { pletorEdgeTypes } from '../../components/canvas/edges'
import { CanvasNodeLibraryPanel, CanvasInspectorPanel } from '../../components/panels'
import { NODE_COLORS } from '../../types/canvas.types'
import type { PletorNodeData, PletorNodeType } from '../../types/canvas.types'
import { useCanvasKeyboard } from '../../hooks/useCanvasKeyboard'
import { useCanvasInit, useCanvasAutoSave } from '../../hooks/useCanvasSync'
import CanvasNavigation from '../../components/layout/CanvasNavigation/CanvasNavigation'
import OutlinerPanel from '../../components/panels/OutlinerPanel/OutlinerPanel'
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
  const syncStatus = useCanvasStore((s) => s.syncStatus)
  const reactFlowInstance = useReactFlow()
  const [activeSection, setActiveSection] = useState('canvas')

  useCanvasKeyboard()
  useCanvasInit()
  useCanvasAutoSave()

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      selectNode(node.id)
    },
    [selectNode],
  )

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

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
          {syncStatus === 'saving' && <span className="canvas-sync-status saving">Ukládám...</span>}
          {syncStatus === 'error' && <span className="canvas-sync-status error">Offline</span>}
        </div>
      </div>
      <CanvasNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      {activeSection === 'outliner' ? (
        <div className="canvas-workspace">
          <OutlinerPanel />
        </div>
      ) : (
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
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="oklch(73% 0.17 161 / 0.15)" />
              <Controls className="canvas-controls" />
              <MiniMap
                className="canvas-minimap"
                nodeColor={minimapNodeColor}
                maskColor="oklch(12% 0.022 155 / 0.80)"
              />
            </ReactFlow>
          </div>
          <CanvasInspectorPanel />
        </div>
      )}
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
