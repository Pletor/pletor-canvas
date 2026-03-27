import { prisma } from '../config/database.js'
import { NotFoundError } from '../middlewares/errorHandler.js'

// Kontext sestavený pro AI agenta
export interface AgentContext {
  node: {
    id: string
    label: string
    nodeType: string
    description: string | null
  }
  workflowy: {
    prompt: string | null
    context: string | null
    intent: string | null
    constraints: string[]
  }
  dependencies: {
    incoming: DependencyInfo[]
    outgoing: DependencyInfo[]
  }
  canvasName: string
}

interface DependencyInfo {
  nodeId: string
  label: string
  nodeType: string
  edgeType: string
  description: string | null
}

// Sestaví kompletní kontext pro AI agenta z canvas uzlu + WorkFlowy metadata + závislostí
export async function buildAgentContext(canvasNodeId: string): Promise<AgentContext> {
  const node = await prisma.canvasNode.findUnique({
    where: { id: canvasNodeId },
    include: {
      canvas: { select: { name: true } },
      sourceEdges: { include: { target: true } },
      targetEdges: { include: { source: true } },
    },
  })

  if (!node) throw new NotFoundError('Uzel')

  const constraints = node.constraints ? JSON.parse(node.constraints) as string[] : []

  const incoming: DependencyInfo[] = node.targetEdges.map((edge) => ({
    nodeId: edge.source.id,
    label: edge.source.label,
    nodeType: edge.source.nodeType,
    edgeType: edge.edgeType,
    description: edge.source.description,
  }))

  const outgoing: DependencyInfo[] = node.sourceEdges.map((edge) => ({
    nodeId: edge.target.id,
    label: edge.target.label,
    nodeType: edge.target.nodeType,
    edgeType: edge.edgeType,
    description: edge.target.description,
  }))

  return {
    node: {
      id: node.id,
      label: node.label,
      nodeType: node.nodeType,
      description: node.description,
    },
    workflowy: {
      prompt: node.prompt,
      context: node.context,
      intent: node.intent,
      constraints,
    },
    canvasName: node.canvas.name,
    dependencies: { incoming, outgoing },
  }
}

// Sestaví prompt pro Claude z kontextu
export function buildPromptFromContext(agentContext: AgentContext): string {
  const sections: string[] = []

  sections.push(`# Úkol: ${agentContext.node.label}`)
  sections.push(`Typ: ${agentContext.node.nodeType}`)
  sections.push(`Projekt: ${agentContext.canvasName}`)

  if (agentContext.node.description) {
    sections.push(`\nPopis: ${agentContext.node.description}`)
  }

  // WorkFlowy metadata
  const wf = agentContext.workflowy
  if (wf.prompt) {
    sections.push(`\n## Prompt\n${wf.prompt}`)
  }
  if (wf.context) {
    sections.push(`\n## Kontext\n${wf.context}`)
  }
  if (wf.intent) {
    sections.push(`\n## Záměr\n${wf.intent}`)
  }
  if (wf.constraints.length > 0) {
    sections.push(`\n## Omezení\n${wf.constraints.map((c) => `- ${c}`).join('\n')}`)
  }

  // Závislosti
  const { incoming, outgoing } = agentContext.dependencies
  if (incoming.length > 0) {
    sections.push(`\n## Příchozí závislosti (kdo závisí na tomto uzlu)`)
    for (const dep of incoming) {
      sections.push(`- ${dep.label} (${dep.nodeType}) — ${dep.edgeType}${dep.description ? `: ${dep.description}` : ''}`)
    }
  }
  if (outgoing.length > 0) {
    sections.push(`\n## Odchozí závislosti (na čem tento uzel závisí)`)
    for (const dep of outgoing) {
      sections.push(`- ${dep.label} (${dep.nodeType}) — ${dep.edgeType}${dep.description ? `: ${dep.description}` : ''}`)
    }
  }

  sections.push(`\n## Instrukce\nVygeneruj kód pro tento uzel. Dodržuj kontext, záměr a omezení. Výstup piš v TypeScript.`)

  return sections.join('\n')
}
