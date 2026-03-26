import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PletorNodeData, PletorNodeType } from '../../types/canvas.types'
import { useCanvasStore } from '../../store/canvasStore'
import './PletorNode.css'

const TYPE_ICONS: Record<string, string> = {
  file: '📄',
  component: '⚛️',
  service: '⚙️',
  api: '🔌',
}

const TYPE_CSS: Record<string, string> = {
  file: 'pletor-node-file',
  component: 'pletor-node-component',
  service: 'pletor-node-service',
  api: 'pletor-node-api',
}

const HANDLE_COLORS: Record<string, string> = {
  file: '#8b5cf6',
  component: '#8b5cf6',
  service: '#f59e0b',
  api: '#3b82f6',
}

function PletorFileNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PletorNodeData
  const selectNode = useCanvasStore((s) => s.selectNode)
  const nodeType: PletorNodeType = nodeData.nodeType

  const cssClass = TYPE_CSS[nodeType] ?? 'pletor-node-file'
  const icon = TYPE_ICONS[nodeType] ?? '📄'
  const handleColor = HANDLE_COLORS[nodeType] ?? '#8b5cf6'

  return (
    <div className={`pletor-node ${cssClass}`} onClick={() => selectNode(id)}>
      <Handle type="target" position={Position.Left} style={{ background: handleColor }} />
      <div className="pletor-node-header">
        <span className="pletor-node-icon">{icon}</span>
        <span className="pletor-node-label">{nodeData.label}</span>
      </div>
      {nodeData.description && (
        <div className="pletor-node-meta">
          <span>{nodeData.description}</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: handleColor }} />
    </div>
  )
}

export default PletorFileNode
