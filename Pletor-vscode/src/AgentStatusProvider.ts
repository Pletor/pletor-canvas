import * as vscode from 'vscode'

export interface AgentTask {
  id: string
  label: string
  status: 'queued' | 'running' | 'done' | 'failed'
  nodeId?: string
  startedAt?: string
  finishedAt?: string
  output?: string
}

export class AgentStatusItem extends vscode.TreeItem {
  constructor(public readonly task: AgentTask) {
    super(task.label, vscode.TreeItemCollapsibleState.None)

    const icons: Record<AgentTask['status'], string> = {
      queued: 'circle-outline',
      running: 'sync~spin',
      done: 'pass',
      failed: 'error',
    }

    this.iconPath = new vscode.ThemeIcon(icons[task.status])
    this.description = task.status
    this.tooltip = task.output ?? task.label
    this.contextValue = `agent-${task.status}`
  }
}

export class AgentStatusProvider implements vscode.TreeDataProvider<AgentStatusItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AgentStatusItem | undefined | null>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  private tasks: AgentTask[] = []

  addTask(task: AgentTask): void {
    this.tasks.unshift(task)
    this._onDidChangeTreeData.fire(null)
  }

  updateTask(id: string, updates: Partial<AgentTask>): void {
    const task = this.tasks.find((t) => t.id === id)
    if (task) Object.assign(task, updates)
    this._onDidChangeTreeData.fire(null)
  }

  clear(): void {
    this.tasks = []
    this._onDidChangeTreeData.fire(null)
  }

  getTreeItem(element: AgentStatusItem): vscode.TreeItem {
    return element
  }

  getChildren(): AgentStatusItem[] {
    if (this.tasks.length === 0) {
      const empty = new vscode.TreeItem('Žádné aktivní agenty')
      empty.iconPath = new vscode.ThemeIcon('robot')
      return [empty as AgentStatusItem]
    }
    return this.tasks.map((t) => new AgentStatusItem(t))
  }
}
