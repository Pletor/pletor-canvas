import { WorkFlowyApiClient } from './workflowyApiClient.js'
import { parseWorkFlowyTree, type ParsedWorkFlowyNode } from './workflowyParserService.js'
import { prisma } from '../config/database.js'
import { AppError } from '../middlewares/errorHandler.js'

// Singleton — vytvořen při konfiguraci API klíče
let client: WorkFlowyApiClient | null = null

export function configureWorkFlowy(apiKey: string) {
  client = new WorkFlowyApiClient(apiKey)
}

export function getWorkFlowyClient(): WorkFlowyApiClient {
  if (!client) {
    throw new AppError(400, 'WORKFLOWY_NOT_CONFIGURED', 'WorkFlowy API klíč není nastaven. Nastav ho v /api/v1/workflowy/configure.')
  }
  return client
}

export function isWorkFlowyConfigured(): boolean {
  return client !== null
}

// Načte celý WorkFlowy strom jako parsované uzly
export async function getWorkFlowyTree(): Promise<ParsedWorkFlowyNode[]> {
  const wfClient = getWorkFlowyClient()
  const tree = await wfClient.getTree()
  return parseWorkFlowyTree(tree)
}

// Načte konkrétní WorkFlowy uzel a vrátí parsovaná data
export async function getWorkFlowyNode(nodeId: string): Promise<ParsedWorkFlowyNode | null> {
  const wfClient = getWorkFlowyClient()
  const flat = await wfClient.getAllNodesFlat()
  const node = flat.find((n) => n.id === nodeId)
  if (!node) return null

  // Najdi děti tohoto uzlu a rekonstruuj mini-strom
  const children = flat.filter((n) => n.parent_id === nodeId)
  const treeNode = {
    ...node,
    children: children.map((c) => ({
      ...c,
      children: flat.filter((n) => n.parent_id === c.id).map((gc) => ({ ...gc, children: [] })),
    })),
  }

  const parsed = parseWorkFlowyTree([treeNode])
  return parsed[0] ?? null
}

// Synchronizuje WorkFlowy data do canvas uzlů
export async function syncWorkFlowyToCanvas(canvasId: string) {
  const wfClient = getWorkFlowyClient()
  const tree = await wfClient.getTree(true)
  const allParsed = flattenParsed(parseWorkFlowyTree(tree))

  const canvasNodes = await prisma.canvasNode.findMany({
    where: {
      canvasId,
      workflowyNodeId: { not: null },
    },
  })

  let synced = 0

  for (const canvasNode of canvasNodes) {
    const wfNode = allParsed.find((p) => p.id === canvasNode.workflowyNodeId)
    if (!wfNode) continue

    await prisma.canvasNode.update({
      where: { id: canvasNode.id },
      data: {
        prompt: wfNode.prompt ?? null,
        context: wfNode.context ?? null,
        intent: wfNode.intent ?? null,
        constraints: wfNode.constraints.length > 0
          ? JSON.stringify(wfNode.constraints)
          : null,
      },
    })
    synced++
  }

  return { synced, total: canvasNodes.length }
}

// Propojí canvas uzel s WorkFlowy uzlem
export async function linkNodeToWorkFlowy(canvasNodeId: string, workflowyNodeId: string) {
  const parsed = await getWorkFlowyNode(workflowyNodeId)

  if (!parsed) {
    throw new AppError(404, 'WORKFLOWY_NODE_NOT_FOUND', `WorkFlowy uzel '${workflowyNodeId}' nebyl nalezen`)
  }

  return prisma.canvasNode.update({
    where: { id: canvasNodeId },
    data: {
      workflowyNodeId,
      prompt: parsed.prompt ?? null,
      context: parsed.context ?? null,
      intent: parsed.intent ?? null,
      constraints: parsed.constraints.length > 0
        ? JSON.stringify(parsed.constraints)
        : null,
    },
  })
}

// Odpojí canvas uzel od WorkFlowy
export async function unlinkNodeFromWorkFlowy(canvasNodeId: string) {
  return prisma.canvasNode.update({
    where: { id: canvasNodeId },
    data: {
      workflowyNodeId: null,
      prompt: null,
      context: null,
      intent: null,
      constraints: null,
    },
  })
}

function flattenParsed(nodes: ParsedWorkFlowyNode[]): ParsedWorkFlowyNode[] {
  const result: ParsedWorkFlowyNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children.length > 0) {
      result.push(...flattenParsed(node.children))
    }
  }
  return result
}
