import * as vscode from 'vscode'
import { readPlan, writePlan, type PlanData } from './storage'
import { getWebviewOptions, buildWebviewHtml } from './getWebviewUri'

export class PletorPlanPanel {
  static readonly viewType = 'pletor.plan'
  private static instance: PletorPlanPanel | undefined

  private readonly panel: vscode.WebviewPanel
  private disposables: vscode.Disposable[] = []

  static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    if (PletorPlanPanel.instance) {
      PletorPlanPanel.instance.panel.reveal(column)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      PletorPlanPanel.viewType,
      'Pletor — Plán projektu',
      column ?? vscode.ViewColumn.One,
      getWebviewOptions(extensionUri),
    )

    PletorPlanPanel.instance = new PletorPlanPanel(panel, extensionUri)
  }

  private constructor(panel: vscode.WebviewPanel, private readonly extensionUri: vscode.Uri) {
    this.panel = panel
    this.update()

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
    this.panel.webview.onDidReceiveMessage(this.handleMessage, this, this.disposables)
  }

  private update(): void {
    const plan = readPlan()
    this.panel.webview.html = buildWebviewHtml(this.panel.webview, this.extensionUri, {
      view: 'plan',
      plan,
    })
  }

  private handleMessage(message: { type: string; payload: unknown }): void {
    switch (message.type) {
      case 'savePlan': {
        writePlan(message.payload as PlanData)
        vscode.window.setStatusBarMessage('Pletor: Plán uložen', 3000)
        break
      }
      case 'openCanvas': {
        vscode.commands.executeCommand('pletor.openCanvas')
        break
      }
    }
  }

  dispose(): void {
    PletorPlanPanel.instance = undefined
    this.panel.dispose()
    for (const d of this.disposables) d.dispose()
    this.disposables = []
  }
}
