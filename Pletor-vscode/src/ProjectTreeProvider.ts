import * as vscode from 'vscode'
import * as path from 'path'
import { scanWorkspace, type FileNode } from './WorkspaceScanner'

export class ProjectTreeItem extends vscode.TreeItem {
  constructor(
    public readonly node: FileNode,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(node.name, collapsibleState)

    this.tooltip = node.relativePath
    this.resourceUri = vscode.Uri.file(node.absolutePath)

    if (!node.isDirectory) {
      this.command = {
        command: 'vscode.open',
        title: 'Otevřít soubor',
        arguments: [vscode.Uri.file(node.absolutePath)],
      }
    }

    this.contextValue = node.isDirectory ? 'directory' : 'file'
    this.iconPath = node.isDirectory
      ? new vscode.ThemeIcon('folder')
      : this.fileIcon(node.ext)
  }

  private fileIcon(ext: string): vscode.ThemeIcon {
    const map: Record<string, string> = {
      '.ts': 'symbol-class',
      '.tsx': 'symbol-misc',
      '.py': 'symbol-method',
      '.json': 'symbol-object',
      '.md': 'book',
      '.css': 'symbol-color',
      '.env': 'lock',
      '.yml': 'gear',
      '.yaml': 'gear',
    }
    return new vscode.ThemeIcon(map[ext] ?? 'file')
  }
}

export class ProjectTreeProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ProjectTreeItem | undefined | null>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  private root: FileNode | null = null

  refresh(): void {
    this.root = scanWorkspace()
    this._onDidChangeTreeData.fire(null)
  }

  getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: ProjectTreeItem): ProjectTreeItem[] {
    if (!element) {
      if (!this.root) this.root = scanWorkspace()
      if (!this.root) return []
      return this.root.children.map((child) => this.toTreeItem(child))
    }
    return element.node.children.map((child) => this.toTreeItem(child))
  }

  private toTreeItem(node: FileNode): ProjectTreeItem {
    const collapsible = node.isDirectory && node.children.length > 0
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None

    return new ProjectTreeItem(node, collapsible)
  }
}
