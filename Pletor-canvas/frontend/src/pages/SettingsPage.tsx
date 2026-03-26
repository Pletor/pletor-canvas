import { SETTINGS_DATA } from '../data/settingsData'
import { FieldRow } from '../components/ui'
import './SettingsPage.css'

interface SettingsPageProps {
  activeMenu: string
}

function SettingsPage({ activeMenu }: SettingsPageProps) {
  const settings = SETTINGS_DATA[activeMenu]
  if (!settings) return <div className="settings-page"><div className="settings-empty" /></div>

  return (
    <div className="settings-page">
      <div className="settings-content">
        <div className="settings-header">
          <h2 className="settings-title">{settings.title}</h2>
          <p className="settings-description">{settings.description}</p>
        </div>
        <div className="settings-fields">
          {settings.fields.map(field => (
            <FieldRow key={field.label} field={field} />
          ))}
        </div>
        <div className="settings-actions">
          <button className="btn-save">Uložit změny</button>
          <button className="btn-reset">Obnovit výchozí</button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
