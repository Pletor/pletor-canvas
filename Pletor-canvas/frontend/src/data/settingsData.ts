export type FieldType = 'text' | 'select' | 'toggle'

export interface SettingsField {
  label: string
  value: string
  type: FieldType
}

export interface SettingsSection {
  title: string
  description: string
  fields: SettingsField[]
}

export const SETTINGS_DATA: Record<string, SettingsSection> = {
  project: {
    title: 'Nastavení projektu',
    description: 'Základní konfigurace projektu a jeho vlastností.',
    fields: [
      { label: 'Název projektu', value: 'Pletor Canvas', type: 'text' },
      { label: 'Verze', value: '0.1.0-alpha', type: 'text' },
      { label: 'Prostředí', value: 'development', type: 'select' },
      { label: 'Auto-save', value: 'true', type: 'toggle' },
      { label: 'Workspace', value: '/projects/pletor-canvas', type: 'text' },
    ],
  },
  app: {
    title: 'Nastavení aplikace',
    description: 'Obecná nastavení aplikace Pletor.',
    fields: [
      { label: 'Jazyk', value: 'Čeština', type: 'select' },
      { label: 'Téma', value: 'Tmavé', type: 'select' },
      { label: 'Notifikace', value: 'true', type: 'toggle' },
      { label: 'Telemetrie', value: 'false', type: 'toggle' },
      { label: 'Max. historie', value: '50', type: 'text' },
    ],
  },
  frontend: {
    title: 'Nastavení frontendu',
    description: 'Konfigurace frontendového buildu a dev serveru.',
    fields: [
      { label: 'Framework', value: 'React 18', type: 'select' },
      { label: 'Port', value: '3000', type: 'text' },
      { label: 'HMR', value: 'true', type: 'toggle' },
      { label: 'Source maps', value: 'true', type: 'toggle' },
      { label: 'Build target', value: 'ES2020', type: 'select' },
    ],
  },
  backend: {
    title: 'Nastavení backendu',
    description: 'Serverová konfigurace a API nastavení.',
    fields: [
      { label: 'Runtime', value: 'Node.js 20', type: 'select' },
      { label: 'API port', value: '8080', type: 'text' },
      { label: 'CORS', value: 'true', type: 'toggle' },
      { label: 'Rate limit', value: '100/min', type: 'text' },
      { label: 'Logging', value: 'verbose', type: 'select' },
    ],
  },
  global: {
    title: 'Nastavení globální',
    description: 'Globální nastavení sdílená napříč projekty.',
    fields: [
      { label: 'Výchozí editor', value: 'VS Code', type: 'select' },
      { label: 'Git auto-commit', value: 'false', type: 'toggle' },
      { label: 'AI model', value: 'Claude Opus 4', type: 'select' },
      { label: 'Max. agentů', value: '5', type: 'text' },
      { label: 'Cache TTL', value: '3600s', type: 'text' },
    ],
  },
  database: {
    title: 'Nastavení databáze',
    description: 'Připojení a konfigurace databáze.',
    fields: [
      { label: 'Typ', value: 'PostgreSQL', type: 'select' },
      { label: 'Host', value: 'localhost', type: 'text' },
      { label: 'Port', value: '5432', type: 'text' },
      { label: 'Název DB', value: 'pletor_dev', type: 'text' },
      { label: 'SSL', value: 'false', type: 'toggle' },
    ],
  },
}
