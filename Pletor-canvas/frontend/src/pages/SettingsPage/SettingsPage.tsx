import { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import { useCanvasStore } from '../../store/canvasStore'
import { SettingsFieldRow } from '../../components/ui'
import { NODE_COLORS } from '../../types/canvas.types'
import type { PletorNodeType } from '../../types/canvas.types'
import './SettingsPage.css'

interface SettingsPageProps {
  activeMenu: string
}

function CanvasDashboard() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)

  const typeCounts = nodes.reduce<Record<string, number>>((acc, node) => {
    const nodeType = (node.data?.nodeType as string) ?? node.type ?? 'unknown'
    acc[nodeType] = (acc[nodeType] ?? 0) + 1
    return acc
  }, {})

  const edgeCounts = edges.reduce<Record<string, number>>((acc, edge) => {
    const edgeType = edge.type ?? 'default'
    acc[edgeType] = (acc[edgeType] ?? 0) + 1
    return acc
  }, {})

  const TYPE_LABELS: Record<string, string> = {
    folder: 'Složky',
    file: 'Soubory',
    component: 'Komponenty',
    service: 'Services',
    api: 'API',
    agent: 'AI Agenti',
    integration: 'Integrace',
    import: 'Import',
    apiCall: 'API volání',
    dataFlow: 'Data flow',
    event: 'Eventy',
  }

  return (
    <div className="dashboard-section">
      <div className="dashboard-stats">
        <div className="stat-card stat-primary">
          <span className="stat-value">{nodes.length}</span>
          <span className="stat-label">Uzlů celkem</span>
        </div>
        <div className="stat-card stat-secondary">
          <span className="stat-value">{edges.length}</span>
          <span className="stat-label">Spojení celkem</span>
        </div>
        <div className="stat-card stat-tertiary">
          <span className="stat-value">{Object.keys(typeCounts).length}</span>
          <span className="stat-label">Typů uzlů</span>
        </div>
      </div>

      {Object.keys(typeCounts).length > 0 && (
        <div className="dashboard-breakdown">
          <h3 className="breakdown-title">Uzly podle typu</h3>
          <div className="breakdown-grid">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className="breakdown-item">
                <span
                  className="breakdown-dot"
                  style={{ background: NODE_COLORS[type as PletorNodeType]?.hex ?? '#64748b' }}
                />
                <span className="breakdown-label">{TYPE_LABELS[type] ?? type}</span>
                <span className="breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(edgeCounts).length > 0 && (
        <div className="dashboard-breakdown">
          <h3 className="breakdown-title">Spojení podle typu</h3>
          <div className="breakdown-grid">
            {Object.entries(edgeCounts).map(([type, count]) => (
              <div key={type} className="breakdown-item">
                <span className="breakdown-label">{TYPE_LABELS[type] ?? type}</span>
                <span className="breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {nodes.length === 0 && (
        <div className="dashboard-empty">
          <p>Canvas je prázdný. Spusť projekt a začni přidávat uzly.</p>
        </div>
      )}
    </div>
  )
}

function SettingsPage({ activeMenu }: SettingsPageProps) {
  const sections = useSettingsStore((s) => s.sections)
  const updateField = useSettingsStore((s) => s.updateField)
  const resetSection = useSettingsStore((s) => s.resetSection)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const sectionId = activeMenu as 'project' | 'app' | 'frontend' | 'backend' | 'global' | 'database'
  const section = sections[sectionId]

  if (!section) return <div className="settings-page"><div className="settings-empty" /></div>

  function handleSave() {
    setSavedMessage('Změny uloženy')
    setTimeout(() => setSavedMessage(null), 2000)
  }

  function handleReset() {
    resetSection(sectionId)
    setSavedMessage('Obnoveno na výchozí hodnoty')
    setTimeout(() => setSavedMessage(null), 2000)
  }

  return (
    <div className="settings-page">
      <div className="settings-content">
        <div className="settings-header">
          <h2 className="settings-title">{section.title}</h2>
          <p className="settings-description">{section.description}</p>
        </div>

        {activeMenu === 'project' && <CanvasDashboard />}

        <div className="settings-fields">
          {section.fields.map((field) => (
            <SettingsFieldRow
              key={field.id}
              field={field}
              onChange={(value) => updateField(sectionId, field.id, value)}
            />
          ))}
        </div>

        <div className="settings-actions">
          <button className="btn-save" onClick={handleSave}>
            {savedMessage ?? 'Uložit změny'}
          </button>
          <button className="btn-reset" onClick={handleReset}>Obnovit výchozí</button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
