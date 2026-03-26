# Pletor Canvas

**Status:** spec → building

## Co

Nekonečný canvas — vizuální velín pro projektové řízení. Centrální místo kde orchestrátor vidí celý systém: procesy, integrace, agenty, tickety, logy a jejich vzájemné závislosti.

## Proč

Potřebujeme jedno místo kde vidíme stav celého projektu vizuálně. Propojení mezi technologiemi (GitHub, Notion, agenti) a jejich závislosti. Fraktální zanořování do hloubky kontextu přes WorkflowY.

## Závislosti

- React 18 + TypeScript
- React Flow (node-based canvas engine)
- WorkflowY API (fraktální data, budoucí integrace)

## Architektura

```
Pletor-canvas/
├── src/
│   ├── app/                    # Vstupní bod, providers, layout
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── canvas/                 # Jádro canvasu
│   │   ├── Canvas.tsx          # React Flow wrapper
│   │   ├── nodes/              # Typy uzlů
│   │   │   ├── ProcessNode.tsx # Uzel procesu
│   │   │   ├── IntegrationNode.tsx # Uzel integrace (GitHub, Notion...)
│   │   │   └── AgentNode.tsx   # Uzel agenta
│   │   ├── edges/              # Typy hran
│   │   │   └── DependencyEdge.tsx
│   │   └── index.ts
│   ├── panels/                 # Boční panely
│   │   ├── left/               # Levý panel — přidávání uzlů
│   │   │   ├── AddPanel.tsx
│   │   │   ├── NodeLibrary.tsx
│   │   │   └── Navigator.tsx
│   │   ├── right/              # Pravý panel — nastavení uzlu
│   │   │   ├── InspectorPanel.tsx
│   │   │   └── NodeSettings.tsx
│   │   └── index.ts
│   ├── store/                  # Stav aplikace
│   │   └── canvasStore.ts      # Zustand store
│   └── theme/                  # Tmavý theme
│       └── tokens.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## UI Layout

```
┌──────────────────────────────────────────────────┐
│  Toolbar (zoom, nástroje)                        │
├────────┬─────────────────────────────┬───────────┤
│        │                             │           │
│  Add   │                             │ Inspector │
│ Panel  │      Nekonečný Canvas       │  Panel    │
│        │      (React Flow)           │           │
│  ---   │                             │           │
│ Navig. │   [Proces] ──→ [Agent]      │ Nastavení │
│        │       │                     │ vybraného │
│        │   [Integrace]               │   uzlu    │
│        │                             │           │
├────────┴─────────────────────────────┴───────────┤
│  Status bar (stav systému, zoom level)           │
└──────────────────────────────────────────────────┘
```

## Typy uzlů (MVP)

| Typ | Ikona | Účel |
|-----|-------|------|
| Process | ⚙️ | Workflow krok, automatizace |
| Integration | 🔗 | Napojení na službu (GitHub, Notion, Slack) |
| Agent | 🤖 | AI agent s definovanou rolí |
| Ticket | 📋 | Úkol, issue, task |
| Log | 📊 | Výstup, monitoring, stav |

## Veřejné API

```typescript
// Hlavní komponenta
export { Canvas } from './canvas'

// Typy
export type { CanvasNode, CanvasEdge, NodeType } from './canvas'

// Panely
export { AddPanel, InspectorPanel, Navigator } from './panels'
```

## Design

- Tmavý theme (pozadí #1a1a2e, dot grid)
- Barvy uzlů rozlišeny podle typu
- Zoom 5%–400%, pan nekonečný
- Animované hrany
- Glow efekt na vybraném uzlu
