import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useCanvasStore } from '../canvasStore'
import { NODE_COLORS, STATUS_ICONS, STATUS_COLORS, type PletorNodeData, type PletorNodeType } from '../canvas.types'
import './PletorNode.css'

const TYPE_ICONS: Record<PletorNodeType, string> = {
  folder: '📁',
  file: '📄',
  component: '⚛️',
  service: '⚙️',
  api: '🔌',
  agent: '🤖',
  integration: '🔗',
  database: '🗄️',
}

function PletorNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PletorNodeData
  const selectNode = useCanvasStore((s) => s.selectNode)
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const colors = NODE_COLORS[nodeData.nodeType]
  const isSelected = selectedNodeId === id

  return (
    <div
      className={`pletor-node ${isSelected ? 'selected' : ''}`}
      style={{ borderColor: isSelected ? colors.hex : colors.border, background: colors.bg }}
      onClick={() => selectNode(id)}
    >
      <Handle type="target" position={Position.Left} style={{ background: colors.hex }} />

      <div className="pletor-node-header">
        <span className="pletor-node-icon">{TYPE_ICONS[nodeData.nodeType]}</span>
        <span className="pletor-node-label">{nodeData.label}</span>
        <span
          className="pletor-node-status"
          style={{ color: STATUS_COLORS[nodeData.status] }}
          title={nodeData.status}
        >
          {STATUS_ICONS[nodeData.status]}
        </span>
      </div>

      {(nodeData.intent || nodeData.filePath) && (
        <div className="pletor-node-meta">
          {nodeData.filePath && (
            <span className="pletor-node-path">{nodeData.filePath}</span>
          )}
          {nodeData.intent && (
            <span className="pletor-node-intent">{nodeData.intent}</span>
          )}
        </div>
      )}

      {nodeData.notes.length > 0 && (
        <div className="pletor-node-notes-badge">
          {nodeData.notes.length} poznámek
        </div>
      )}

      <Handle type="source" position={Position.Right} style={{ background: colors.hex }} />
    </div>
  )
}

export default PletorNode
