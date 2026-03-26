import { useCanvasStore } from '../../store/canvasStore'
import { NODE_COLORS } from '../../types/canvas.types'
import type { PletorNodeData } from '../../types/canvas.types'
import './CanvasInspectorPanel.css'

function CanvasInspectorPanel() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const nodes = useCanvasStore((s) => s.nodes)
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const removeNode = useCanvasStore((s) => s.removeNode)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  if (!selectedNode) {
    return (
      <div className="inspector-panel">
        <div className="inspector-empty">
          <span className="inspector-empty-icon">👆</span>
          <span className="inspector-empty-text">Vyber uzel na canvasu</span>
        </div>
      </div>
    )
  }

  const nodeData = selectedNode.data as PletorNodeData
  const colors = NODE_COLORS[nodeData.nodeType]

  return (
    <div className="inspector-panel">
      <div className="inspector-header" style={{ borderColor: colors.border }}>
        <span className="inspector-type-badge" style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
          {nodeData.nodeType}
        </span>
        <span className="inspector-node-id">{selectedNode.id}</span>
      </div>

      <div className="inspector-fields">
        <div className="inspector-field">
          <label className="inspector-field-label">Název</label>
          <input
            className="inspector-field-input"
            type="text"
            value={nodeData.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
          />
        </div>

        <div className="inspector-field">
          <label className="inspector-field-label">Popis</label>
          <textarea
            className="inspector-field-textarea"
            value={nodeData.description ?? ''}
            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
            placeholder="Popis uzlu..."
            rows={3}
          />
        </div>

        <div className="inspector-field">
          <label className="inspector-field-label">Stav</label>
          <select
            className="inspector-field-select"
            value={nodeData.status}
            onChange={(e) => updateNodeData(selectedNode.id, { status: e.target.value as PletorNodeData['status'] })}
          >
            <option value="active">Aktivní</option>
            <option value="draft">Koncept</option>
            <option value="archived">Archivováno</option>
          </select>
        </div>

        {/* WorkFlowy metadata — placeholder pro Fázi 2 */}
        <div className="inspector-section">
          <span className="inspector-section-label">WorkFlowy</span>
          <div className="inspector-placeholder">
            Připravujeme — Fáze 2
          </div>
        </div>
      </div>

      <div className="inspector-actions">
        <button
          className="inspector-delete-btn"
          onClick={() => removeNode(selectedNode.id)}
        >
          Smazat uzel
        </button>
      </div>
    </div>
  )
}

export default CanvasInspectorPanel
