import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PletorNodeData } from '../../../types/canvas.types'
import { useCanvasStore } from '../../../store/canvasStore'
import '../PletorNode.css'
import './PletorIntegrationNode.css'

function PletorIntegrationNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PletorNodeData
  const selectNode = useCanvasStore((s) => s.selectNode)

  return (
    <div className="pletor-node pletor-node-integration" onClick={() => selectNode(id)}>
      <Handle type="target" position={Position.Left} style={{ background: 'oklch(72% 0.14 202)' }} />
      <div className="pletor-node-header">
        <span className="pletor-node-icon">🔗</span>
        <span className="pletor-node-label">{nodeData.label}</span>
      </div>
      {nodeData.description && (
        <div className="pletor-node-meta">
          <span>{nodeData.description}</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: 'oklch(72% 0.14 202)' }} />
    </div>
  )
}

export default PletorIntegrationNode
