import * as vscode from 'vscode'
import { readCanvas, writeCanvas, type CanvasData, type CanvasNode } from './storage'
import { scanWorkspace, flattenToCanvasNodes } from './WorkspaceScanner'
import { getWebviewOptions, buildWebviewHtml } from './getWebviewUri'

export class PletorCanvasPanel {
  static readonly viewType = 'pletor.canvas'
  private static instance: PletorCanvasPanel | undefined

  private readonly panel: vscode.WebviewPanel
  private disposables: vscode.Disposable[] = []

  static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    if (PletorCanvasPanel.instance) {
      PletorCanvasPanel.instance.panel.reveal(column)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      PletorCanvasPanel.viewType,
      'Pletor — Canvas',
      column ?? vscode.ViewColumn.One,
      getWebviewOptions(extensionUri),
    )

    PletorCanvasPanel.instance = new PletorCanvasPanel(panel, extensionUri)
  }

  private constructor(panel: vscode.WebviewPanel, private readonly extensionUri: vscode.Uri) {
    this.panel = panel
    this.update()

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
    this.panel.webview.onDidReceiveMessage(this.handleMessage, this, this.disposables)
  }

  private update(): void {
    const canvas = readCanvas()
    const workspaceTree = scanWorkspace()

    this.panel.webview.html = buildWebviewHtml(this.panel.webview, this.extensionUri, {
      view: 'canvas',
      canvas,
      workspaceFiles: workspaceTree ? flattenToCanvasNodes(workspaceTree) : [],
    })
  }

  private handleMessage(message: { type: string; payload: unknown }): void {
    switch (message.type) {
      case 'saveCanvas': {
        writeCanvas(message.payload as CanvasData)
        break
      }
      case 'openFile': {
        const { filePath } = message.payload as { filePath: string }
        const folders = vscode.workspace.workspaceFolders
        if (!folders) break
        const uri = vscode.Uri.joinPath(folders[0].uri, filePath)
        vscode.window.showTextDocument(uri, { preview: false })
        break
      }
      case 'importFromWorkspace': {
        const canvas = readCanvas()
        const workspaceTree = scanWorkspace()
        if (!workspaceTree) break

        const files = flattenToCanvasNodes(workspaceTree)
        const existingIds = new Set(canvas.nodes.map((n) => n.id))

        let x = 100
        let y = 100
        const newNodes: CanvasNode[] = []

        for (const file of files) {
          if (existingIds.has(file.id)) continue
          newNodes.push({
            id: file.id,
            type: file.type,
            label: file.label,
            filePath: file.filePath,
            position: { x, y },
            data: {
              status: 'planned',
              notes: [],
            },
          })
          x += 200
          if (x > 1000) { x = 100; y += 120 }
        }

        const updated: CanvasData = {
          nodes: [...canvas.nodes, ...newNodes],
          edges: canvas.edges,
          updatedAt: new Date().toISOString(),
        }
        writeCanvas(updated)

        // Obnov panel s novými daty
        this.panel.webview.postMessage({ type: 'canvasUpdated', payload: updated })
        vscode.window.setStatusBarMessage(`Pletor: Importováno ${newNodes.length} uzlů`, 3000)
        break
      }
    }
  }

  dispose(): void {
    PletorCanvasPanel.instance = undefined
    this.panel.dispose()
    for (const d of this.disposables) d.dispose()
    this.disposables = []
  }
}
