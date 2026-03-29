import type { PletorNode, PletorEdge } from './canvas.types'

// Reálná struktura Pletor projektu jako demonstrační data
export const SEED_NODES: PletorNode[] = [
  // Struktura — složky
  {
    id: 'folder-src',
    type: 'folder',
    position: { x: 50, y: 100 },
    data: { label: 'src/', nodeType: 'folder', childCount: 6, status: 'active' },
  },
  {
    id: 'folder-components',
    type: 'folder',
    position: { x: 50, y: 280 },
    data: { label: 'components/', nodeType: 'folder', childCount: 3, status: 'active' },
  },
  {
    id: 'folder-pages',
    type: 'folder',
    position: { x: 50, y: 440 },
    data: { label: 'pages/', nodeType: 'folder', childCount: 2, status: 'active' },
  },

  // Soubory — komponenty
  {
    id: 'file-app',
    type: 'component',
    position: { x: 300, y: 80 },
    data: { label: 'App.tsx', nodeType: 'component', description: 'Root komponenta', status: 'active' },
  },
  {
    id: 'file-header',
    type: 'component',
    position: { x: 300, y: 200 },
    data: { label: 'Header.tsx', nodeType: 'component', description: 'Navigační hlavička', status: 'active' },
  },
  {
    id: 'file-sidebar',
    type: 'component',
    position: { x: 300, y: 320 },
    data: { label: 'Sidebar.tsx', nodeType: 'component', description: 'Boční menu', status: 'active' },
  },
  {
    id: 'file-canvas-page',
    type: 'component',
    position: { x: 300, y: 440 },
    data: { label: 'CanvasPage.tsx', nodeType: 'component', description: 'Hlavní canvas', status: 'active' },
  },

  // Service
  {
    id: 'service-store',
    type: 'service',
    position: { x: 560, y: 160 },
    data: { label: 'canvasStore.ts', nodeType: 'service', description: 'Zustand state management', status: 'active' },
  },

  // API
  {
    id: 'api-canvas',
    type: 'api',
    position: { x: 560, y: 320 },
    data: { label: 'canvasApi.ts', nodeType: 'api', description: 'REST API klient', status: 'draft' },
  },

  // Agent
  {
    id: 'agent-codegen',
    type: 'agent',
    position: { x: 800, y: 100 },
    data: { label: 'Code Generator', nodeType: 'agent', description: 'Generuje kód z instrukcí', status: 'draft' },
  },
  {
    id: 'agent-reviewer',
    type: 'agent',
    position: { x: 800, y: 260 },
    data: { label: 'Code Reviewer', nodeType: 'agent', description: 'Kontroluje kvalitu kódu', status: 'draft' },
  },

  // Integrace
  {
    id: 'integration-github',
    type: 'integration',
    position: { x: 800, y: 420 },
    data: { label: 'GitHub', nodeType: 'integration', description: 'Repozitář, PR, issues', status: 'active' },
  },
]

export const SEED_EDGES: PletorEdge[] = [
  // Složky → soubory (import)
  { id: 'e-src-app', source: 'folder-src', target: 'file-app', type: 'import', data: { edgeType: 'import' } },
  { id: 'e-comp-header', source: 'folder-components', target: 'file-header', type: 'import', data: { edgeType: 'import' } },
  { id: 'e-comp-sidebar', source: 'folder-components', target: 'file-sidebar', type: 'import', data: { edgeType: 'import' } },
  { id: 'e-pages-canvas', source: 'folder-pages', target: 'file-canvas-page', type: 'import', data: { edgeType: 'import' } },

  // App importuje komponenty
  { id: 'e-app-header', source: 'file-app', target: 'file-header', type: 'import', data: { edgeType: 'import' } },
  { id: 'e-app-sidebar', source: 'file-app', target: 'file-sidebar', type: 'import', data: { edgeType: 'import' } },
  { id: 'e-app-canvas', source: 'file-app', target: 'file-canvas-page', type: 'import', data: { edgeType: 'import' } },

  // CanvasPage → Store (data flow)
  { id: 'e-canvas-store', source: 'file-canvas-page', target: 'service-store', type: 'dataFlow', animated: true, data: { edgeType: 'dataFlow' } },

  // Store → API (API call)
  { id: 'e-store-api', source: 'service-store', target: 'api-canvas', type: 'apiCall', data: { edgeType: 'apiCall' } },

  // Agent → GitHub (event)
  { id: 'e-agent-gh', source: 'agent-reviewer', target: 'integration-github', type: 'event', data: { edgeType: 'event' } },

  // API → GitHub (API call)
  { id: 'e-api-gh', source: 'api-canvas', target: 'integration-github', type: 'apiCall', data: { edgeType: 'apiCall' } },
]
