import type { SettingsField } from '../../data/settingsData'
import './FieldRow.css'

interface FieldRowProps {
  field: SettingsField
}

function FieldRow({ field }: FieldRowProps) {
  return (
    <div className="field-row">
      <label className="field-label">{field.label}</label>
      {field.type === 'toggle' ? (
        <div className={`field-toggle ${field.value === 'true' ? 'on' : ''}`}>
          <div className="field-toggle-knob" />
        </div>
      ) : field.type === 'select' ? (
        <div className="field-select">
          <span>{field.value}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div className="field-input">{field.value}</div>
      )}
    </div>
  )
}

export default FieldRow
