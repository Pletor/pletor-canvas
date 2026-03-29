import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PletorNodeData } from '../canvas.types'
import { useCanvasStore } from '../canvasStore'
import './PletorNode.css'

function PletorAgentNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PletorNodeData
  const selectNode = useCanvasStore((s) => s.selectNode)

  return (
    <div className="pletor-node pletor-node-agent" onClick={() => selectNode(id)}>
      <Handle type="target" position={Position.Left} style={{ background: '#ec4899' }} />
      <div className="pletor-node-header">
        <span className="pletor-node-icon">🤖</span>
        <span className="pletor-node-label">{nodeData.label}</span>
        <span className="pletor-node-badge">AI</span>
      </div>
      {nodeData.description && (
        <div className="pletor-node-meta">
          <span>{nodeData.description}</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: '#ec4899' }} />
    </div>
  )
}

export default PletorAgentNode
