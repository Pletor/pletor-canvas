import { useState, useRef, useEffect } from 'react'
import type { SettingsField } from '../../settings/settingsStore'
import './SettingsFieldRow.css'

interface FieldRowProps {
  field: SettingsField
  onChange: (value: string) => void
}

function SettingsFieldRow({ field, onChange }: FieldRowProps) {
  const [selectOpen, setSelectOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // Zavření select dropdownu při kliknutí mimo
  useEffect(() => {
    if (!selectOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setSelectOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectOpen])

  if (field.type === 'toggle') {
    const isOn = field.value === 'true'
    return (
      <div className="field-row">
        <label className="field-label">{field.label}</label>
        <div
          className={`field-toggle ${isOn ? 'on' : ''}`}
          onClick={() => onChange(isOn ? 'false' : 'true')}
          role="switch"
          aria-checked={isOn}
        >
          <div className="field-toggle-knob" />
        </div>
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div className="field-row">
        <label className="field-label">{field.label}</label>
        <div className="field-select-wrapper" ref={selectRef}>
          <div
            className={`field-select ${selectOpen ? 'open' : ''}`}
            onClick={() => setSelectOpen(!selectOpen)}
          >
            <span>{field.value}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {selectOpen && field.options && (
            <div className="field-select-dropdown">
              {field.options.map((option) => (
                <div
                  key={option}
                  className={`field-select-option ${option === field.value ? 'active' : ''}`}
                  onClick={() => {
                    onChange(option)
                    setSelectOpen(false)
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="field-row">
      <label className="field-label">{field.label}</label>
      <input
        className="field-input"
        type="text"
        value={field.value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default SettingsFieldRow
