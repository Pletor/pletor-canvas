import { useState, useCallback, useEffect } from 'react'
import { postMessage, onMessage } from '../lib/vscode'
import { PLAN_FIELDS, type PlanData } from './plan.types'
import './PlanView.css'

interface PlanViewProps {
  initial: PlanData | undefined
}

const EMPTY_PLAN: PlanData = {
  intent: '',
  context: '',
  prompt: '',
  techStack: '',
  codingRules: '',
  projectStructure: '',
  updatedAt: new Date().toISOString(),
}

function PlanView({ initial }: PlanViewProps) {
  const [plan, setPlan] = useState<PlanData>(initial ?? EMPTY_PLAN)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type === 'planUpdated') {
        setPlan(msg.payload as PlanData)
      }
    })
  }, [])

  const handleChange = useCallback((field: keyof PlanData, value: string) => {
    setPlan((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    const updated: PlanData = { ...plan, updatedAt: new Date().toISOString() }
    postMessage('savePlan', updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [plan])

  const handleOpenCanvas = useCallback(() => {
    postMessage('openCanvas')
  }, [])

  const totalChars = Object.values(plan)
    .filter((v) => typeof v === 'string' && v !== plan.updatedAt)
    .reduce((acc, v) => acc + (v as string).length, 0)

  return (
    <div className="plan-view">
      <div className="plan-header">
        <div className="plan-header-left">
          <span className="plan-logo">Pletor</span>
          <span className="plan-title">Plán projektu</span>
        </div>
        <div className="plan-header-right">
          <span className="plan-context-size">{totalChars.toLocaleString()} znaků</span>
          <button className="plan-canvas-btn" onClick={handleOpenCanvas}>
            Canvas →
          </button>
          <button
            className={`plan-save-btn ${saved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            {saved ? 'Uloženo ✓' : 'Uložit'}
          </button>
        </div>
      </div>

      <div className="plan-hint">
        Orchestrátor čte tento plán jako kontext před každou akcí.
        Čím přesnější, tím čistší okno agenta.
      </div>

      <div className="plan-fields">
        {PLAN_FIELDS.map((field) => (
          <div key={field.id} className="plan-field">
            <div className="plan-field-header">
              <label className="plan-field-label">{field.label}</label>
              <span className="plan-field-hint">{field.hint}</span>
            </div>
            <textarea
              className="plan-field-textarea"
              value={plan[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows}
              spellCheck={false}
            />
            <div className="plan-field-count">
              {plan[field.id].length} znaků
            </div>
          </div>
        ))}
      </div>

      <div className="plan-footer">
        <button className="plan-save-btn-bottom" onClick={handleSave}>
          {saved ? 'Uloženo ✓' : 'Uložit plán'}
        </button>
        <button className="plan-canvas-btn-bottom" onClick={handleOpenCanvas}>
          Otevřít Canvas →
        </button>
      </div>
    </div>
  )
}

export default PlanView
