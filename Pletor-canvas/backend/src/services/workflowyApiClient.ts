import { AppError } from '../middlewares/errorHandler.js'

const WORKFLOWY_API = 'https://workflowy.com/api/v1'

// Struktura uzlu z WorkFlowy API
export interface WorkFlowyNode {
  id: string
  name: string
  note: string | null
  priority: number
  data?: { layoutMode?: string }
  createdAt: number
  modifiedAt: number
  completedAt: number | null
}

// Export — ploché pole se vztahy
export interface WorkFlowyExportNode extends WorkFlowyNode {
  parent_id: string | null
}

// Rekonstruovaný strom
export interface WorkFlowyTreeNode extends WorkFlowyNode {
  children: WorkFlowyTreeNode[]
}

// WorkFlowy API klient — oficiální REST API v1
export class WorkFlowyApiClient {
  private apiKey: string
  private cache: { nodes: WorkFlowyExportNode[]; timestamp: number } | null = null
  private cacheTtl = 60_000 // 60 sekund

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    }
    if (body) options.body = JSON.stringify(body)

    const response = await fetch(`${WORKFLOWY_API}${path}`, options)

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AppError(401, 'WORKFLOWY_AUTH_FAILED', 'WorkFlowy API klíč je neplatný')
      }
      if (response.status === 429) {
        throw new AppError(429, 'WORKFLOWY_RATE_LIMIT', 'WorkFlowy API rate limit — zkus to za minutu nebo použij cache')
      }
      throw new AppError(502, 'WORKFLOWY_ERROR', `WorkFlowy API chyba: ${response.status}`)
    }

    return response.json()
  }

  // Načte celý strom — zkusí export, při rate limitu fallback na rekurzivní /nodes
  async getTree(forceRefresh = false): Promise<WorkFlowyTreeNode[]> {
    try {
      const flat = await this.getAllNodesFlat(forceRefresh)
      return buildTree(flat)
    } catch (err) {
      // Při rate limitu fallback na rekurzivní načítání
      if (err instanceof AppError && err.code === 'WORKFLOWY_RATE_LIMIT') {
        return this.getTreeRecursive('None')
      }
      throw err
    }
  }

  // Načte ploché pole všech uzlů přes /nodes-export (rate limit: 1/min, proto cache)
  async getAllNodesFlat(forceRefresh = false): Promise<WorkFlowyExportNode[]> {
    if (!forceRefresh && this.cache && Date.now() - this.cache.timestamp < this.cacheTtl) {
      return this.cache.nodes
    }

    const response = await this.request<{ nodes: WorkFlowyExportNode[] }>('GET', '/nodes-export')
    this.cache = { nodes: response.nodes, timestamp: Date.now() }
    return response.nodes
  }

  // Rekurzivní načítání stromu přes /nodes (bez rate limitu, ale pomalejší)
  private async getTreeRecursive(parentId: string, depth = 0): Promise<WorkFlowyTreeNode[]> {
    if (depth > 5) return [] // Ochrana proti příliš hlubokému zanořování

    const children = await this.getChildren(parentId)
    const result: WorkFlowyTreeNode[] = []

    for (const child of children) {
      const grandchildren = await this.getTreeRecursive(child.id, depth + 1)
      result.push({ ...child, children: grandchildren })
    }

    return result.sort((a, b) => a.priority - b.priority)
  }

  // Načte konkrétní uzel
  async getNode(id: string): Promise<WorkFlowyNode> {
    const response = await this.request<{ node: WorkFlowyNode }>('GET', `/nodes/${id}`)
    return response.node
  }

  // Načte děti uzlu
  async getChildren(parentId: string): Promise<WorkFlowyNode[]> {
    const response = await this.request<{ nodes: WorkFlowyNode[] }>('GET', `/nodes?parent_id=${parentId}`)
    return response.nodes
  }

  // Vytvoří nový uzel
  async createNode(parentId: string, name: string, note?: string): Promise<{ item_id: string }> {
    return this.request<{ item_id: string }>('POST', '/nodes', {
      parent_id: parentId,
      name,
      note,
    })
  }

  // Aktualizuje uzel
  async updateNode(id: string, data: { name?: string; note?: string }): Promise<{ status: string }> {
    return this.request<{ status: string }>('POST', `/nodes/${id}`, data)
  }

  // Smaže uzel
  async deleteNode(id: string): Promise<{ status: string }> {
    return this.request<{ status: string }>('DELETE', `/nodes/${id}`)
  }

  // Invaliduje cache
  invalidateCache() {
    this.cache = null
  }

  // Najde uzel v plochém poli podle ID
  async findNodeById(id: string): Promise<WorkFlowyExportNode | null> {
    const nodes = await this.getAllNodesFlat()
    return nodes.find((n) => n.id === id) ?? null
  }

  // Najde uzel podle textu v názvu
  async findNodeByName(name: string): Promise<WorkFlowyExportNode | null> {
    const nodes = await this.getAllNodesFlat()
    const lower = name.toLowerCase()
    return nodes.find((n) => n.name.toLowerCase().includes(lower)) ?? null
  }
}

// Rekonstruuje strom z plochého pole
function buildTree(nodes: WorkFlowyExportNode[]): WorkFlowyTreeNode[] {
  const map = new Map<string, WorkFlowyTreeNode>()
  const roots: WorkFlowyTreeNode[] = []

  // Vytvoř mapování ID → uzel s prázdnými dětmi
  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] })
  }

  // Propoj rodiče s dětmi
  for (const node of nodes) {
    const treeNode = map.get(node.id)!
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(treeNode)
    } else {
      roots.push(treeNode)
    }
  }

  // Seřaď děti podle priority
  for (const node of map.values()) {
    node.children.sort((a, b) => a.priority - b.priority)
  }

  return roots.sort((a, b) => a.priority - b.priority)
}
