import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PletorNodeData } from '../../../types/canvas.types'
import { useCanvasStore } from '../../../store/canvasStore'
import '../PletorNode.css'
import './PletorFolderNode.css'

function PletorFolderNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PletorNodeData
  const selectNode = useCanvasStore((s) => s.selectNode)

  return (
    <div className="pletor-node pletor-node-folder" onClick={() => selectNode(id)}>
      <Handle type="target" position={Position.Left} style={{ background: 'oklch(73% 0.17 161)' }} />
      <div className="pletor-node-header">
        <span className="pletor-node-icon">📁</span>
        <span className="pletor-node-label">{nodeData.label}</span>
      </div>
      {(nodeData.childCount !== undefined || nodeData.description) && (
        <div className="pletor-node-meta">
          {nodeData.childCount !== undefined && (
            <span>{nodeData.childCount} položek</span>
          )}
          {nodeData.description && <span>{nodeData.description}</span>}
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: 'oklch(73% 0.17 161)' }} />
    </div>
  )
}

export default PletorFolderNode
