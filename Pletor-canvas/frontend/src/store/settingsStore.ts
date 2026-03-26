import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FieldType = 'text' | 'select' | 'toggle'

export interface SettingsField {
  id: string
  label: string
  value: string
  type: FieldType
  options?: string[]
}

export interface SettingsSection {
  title: string
  description: string
  fields: SettingsField[]
}

type SectionId = 'project' | 'app' | 'frontend' | 'backend' | 'global' | 'database'

interface SettingsState {
  sections: Record<SectionId, SettingsSection>
  updateField: (sectionId: SectionId, fieldId: string, value: string) => void
  resetSection: (sectionId: SectionId) => void
}

const DEFAULT_SECTIONS: Record<SectionId, SettingsSection> = {
  project: {
    title: 'Nastavení projektu',
    description: 'Základní konfigurace projektu a jeho vlastností.',
    fields: [
      { id: 'name', label: 'Název projektu', value: 'Pletor Canvas', type: 'text' },
      { id: 'version', label: 'Verze', value: '0.1.0-alpha', type: 'text' },
      { id: 'environment', label: 'Prostředí', value: 'development', type: 'select', options: ['development', 'staging', 'production'] },
      { id: 'autoSave', label: 'Auto-save', value: 'true', type: 'toggle' },
      { id: 'workspace', label: 'Workspace', value: '/projects/pletor-canvas', type: 'text' },
    ],
  },
  app: {
    title: 'Nastavení aplikace',
    description: 'Obecná nastavení aplikace Pletor.',
    fields: [
      { id: 'language', label: 'Jazyk', value: 'Čeština', type: 'select', options: ['Čeština', 'English'] },
      { id: 'theme', label: 'Téma', value: 'Tmavé', type: 'select', options: ['Tmavé', 'Světlé'] },
      { id: 'notifications', label: 'Notifikace', value: 'true', type: 'toggle' },
      { id: 'telemetry', label: 'Telemetrie', value: 'false', type: 'toggle' },
      { id: 'maxHistory', label: 'Max. historie', value: '50', type: 'text' },
    ],
  },
  frontend: {
    title: 'Nastavení frontendu',
    description: 'Konfigurace frontendového buildu a dev serveru.',
    fields: [
      { id: 'framework', label: 'Framework', value: 'React 18', type: 'select', options: ['React 18', 'React 19', 'Vue 3', 'Svelte 5'] },
      { id: 'port', label: 'Port', value: '3000', type: 'text' },
      { id: 'hmr', label: 'HMR', value: 'true', type: 'toggle' },
      { id: 'sourceMaps', label: 'Source maps', value: 'true', type: 'toggle' },
      { id: 'buildTarget', label: 'Build target', value: 'ES2020', type: 'select', options: ['ES2018', 'ES2020', 'ES2022', 'ESNext'] },
    ],
  },
  backend: {
    title: 'Nastavení backendu',
    description: 'Serverová konfigurace a API nastavení.',
    fields: [
      { id: 'runtime', label: 'Runtime', value: 'Node.js 20', type: 'select', options: ['Node.js 18', 'Node.js 20', 'Node.js 22', 'Bun'] },
      { id: 'apiPort', label: 'API port', value: '8080', type: 'text' },
      { id: 'cors', label: 'CORS', value: 'true', type: 'toggle' },
      { id: 'rateLimit', label: 'Rate limit', value: '100/min', type: 'text' },
      { id: 'logging', label: 'Logging', value: 'verbose', type: 'select', options: ['silent', 'error', 'warn', 'info', 'verbose', 'debug'] },
    ],
  },
  global: {
    title: 'Nastavení globální',
    description: 'Globální nastavení sdílená napříč projekty.',
    fields: [
      { id: 'editor', label: 'Výchozí editor', value: 'VS Code', type: 'select', options: ['VS Code', 'WebStorm', 'Vim', 'Neovim'] },
      { id: 'gitAutoCommit', label: 'Git auto-commit', value: 'false', type: 'toggle' },
      { id: 'aiModel', label: 'AI model', value: 'Claude Opus 4', type: 'select', options: ['Claude Opus 4', 'Claude Sonnet 4', 'GPT-4o', 'Gemini Pro'] },
      { id: 'maxAgents', label: 'Max. agentů', value: '5', type: 'text' },
      { id: 'cacheTtl', label: 'Cache TTL', value: '3600s', type: 'text' },
    ],
  },
  database: {
    title: 'Nastavení databáze',
    description: 'Připojení a konfigurace databáze.',
    fields: [
      { id: 'dbType', label: 'Typ', value: 'PostgreSQL', type: 'select', options: ['PostgreSQL', 'SQLite', 'MySQL', 'MongoDB'] },
      { id: 'host', label: 'Host', value: 'localhost', type: 'text' },
      { id: 'dbPort', label: 'Port', value: '5432', type: 'text' },
      { id: 'dbName', label: 'Název DB', value: 'pletor_dev', type: 'text' },
      { id: 'ssl', label: 'SSL', value: 'false', type: 'toggle' },
    ],
  },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      sections: structuredClone(DEFAULT_SECTIONS),

      updateField: (sectionId, fieldId, value) => {
        const sections = { ...get().sections }
        const section = { ...sections[sectionId] }
        section.fields = section.fields.map((f) =>
          f.id === fieldId ? { ...f, value } : f,
        )
        sections[sectionId] = section
        set({ sections })
      },

      resetSection: (sectionId) => {
        const sections = { ...get().sections }
        sections[sectionId] = structuredClone(DEFAULT_SECTIONS[sectionId])
        set({ sections })
      },
    }),
    {
      name: 'pletor-settings-storage',
    },
  ),
)
