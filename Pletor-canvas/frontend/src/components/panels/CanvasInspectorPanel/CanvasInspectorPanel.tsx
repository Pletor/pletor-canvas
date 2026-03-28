import { useCanvasStore } from '../../../store/canvasStore'
import { NODE_COLORS } from '../../../types/canvas.types'
import type { PletorNodeData } from '../../../types/canvas.types'
import InspectorAgentSection from '../InspectorAgentSection/InspectorAgentSection'
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
          <span className="inspector-empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 3L21 9M21 9L15 15M21 9H9M9 21L3 15M3 15L9 9M3 15H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="inspector-empty-text">Vyber uzel na canvasu</span>
        </div>
      </div>
    )
  }

  const nodeData = selectedNode.data as PletorNodeData
  const colors = NODE_COLORS[nodeData.nodeType]
  const workflowy = nodeData.workflowy

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

        <div className="inspector-section">
          <span className="inspector-section-label">WorkFlowy</span>

          {workflowy?.workflowyNodeId ? (
            <div className="inspector-wf-data">
              {workflowy.prompt && (
                <div className="inspector-wf-field">
                  <span className="inspector-wf-tag">PROMPT</span>
                  <p className="inspector-wf-value">{workflowy.prompt}</p>
                </div>
              )}
              {workflowy.context && (
                <div className="inspector-wf-field">
                  <span className="inspector-wf-tag">CONTEXT</span>
                  <p className="inspector-wf-value">{workflowy.context}</p>
                </div>
              )}
              {workflowy.intent && (
                <div className="inspector-wf-field">
                  <span className="inspector-wf-tag">INTENT</span>
                  <p className="inspector-wf-value">{workflowy.intent}</p>
                </div>
              )}
              {workflowy.constraints && workflowy.constraints.length > 0 && (
                <div className="inspector-wf-field">
                  <span className="inspector-wf-tag">CONSTRAINTS</span>
                  <ul className="inspector-wf-constraints">
                    {workflowy.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              <span className="inspector-wf-link">
                ID: {workflowy.workflowyNodeId}
              </span>
            </div>
          ) : (
            <div className="inspector-placeholder">
              Nepropojeno s WorkFlowy
            </div>
          )}
        </div>

        <InspectorAgentSection nodeId={selectedNode.id} />
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
