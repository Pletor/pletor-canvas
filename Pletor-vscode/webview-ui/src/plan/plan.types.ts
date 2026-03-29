export interface PlanData {
  intent: string
  context: string
  prompt: string
  techStack: string
  codingRules: string
  projectStructure: string
  updatedAt: string
}

export interface PlanField {
  id: keyof Omit<PlanData, 'updatedAt'>
  label: string
  placeholder: string
  rows: number
  hint: string
}

export const PLAN_FIELDS: PlanField[] = [
  {
    id: 'intent',
    label: 'Záměr projektu',
    placeholder: 'Co má projekt dělat? Jaký problém řeší? Kdo ho bude používat?',
    rows: 4,
    hint: 'Orchestrátor čte záměr jako první — buď konkrétní.',
  },
  {
    id: 'context',
    label: 'Kontext',
    placeholder: 'Co orchestrátor musí vědět? Existující systémy, omezení, integrace...',
    rows: 4,
    hint: 'Všechno co není zřejmé z kódu — technické dluhy, legacy, business constraints.',
  },
  {
    id: 'prompt',
    label: 'Prompt orchestrátora',
    placeholder: 'Jak se má orchestrátor chovat? Jaký styl kódu? Jak komunikovat se subagenty?',
    rows: 3,
    hint: 'Systémový prompt pro hlavního agenta.',
  },
  {
    id: 'techStack',
    label: 'Tech Stack',
    placeholder: 'React 18, TypeScript strict, FastAPI, PostgreSQL, Docker...',
    rows: 3,
    hint: 'Přesné verze technologií. Subagenti to použijí při výběru závislostí.',
  },
  {
    id: 'codingRules',
    label: 'Pravidla kódu',
    placeholder: 'Clean Architecture, feature-based folders, no any, no console.log...',
    rows: 4,
    hint: 'Pravidla která musí dodržet každý subagent. Jako CLAUDE.md ale přímo v projektu.',
  },
  {
    id: 'projectStructure',
    label: 'Struktura projektu',
    placeholder: 'src/\n  features/\n    canvas/\n    agent/\n  lib/\n  ...',
    rows: 5,
    hint: 'Cílová folder struktura. Orchestrátor ji použije při plánování canvasu.',
  },
]
