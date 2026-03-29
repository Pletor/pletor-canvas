import * as vscode from 'vscode'
import { ProjectTreeProvider } from './ProjectTreeProvider'
import { AgentStatusProvider } from './AgentStatusProvider'
import { PletorCanvasPanel } from './PletorCanvasPanel'
import { PletorPlanPanel } from './PletorPlanPanel'

export function activate(context: vscode.ExtensionContext): void {
  const projectTree = new ProjectTreeProvider()
  const agentStatus = new AgentStatusProvider()

  // Registrace tree views
  vscode.window.registerTreeDataProvider('pletor.projectTree', projectTree)
  vscode.window.registerTreeDataProvider('pletor.agentStatus', agentStatus)

  // Příkazy
  context.subscriptions.push(
    vscode.commands.registerCommand('pletor.openCanvas', () => {
      PletorCanvasPanel.createOrShow(context.extensionUri)
    }),

    vscode.commands.registerCommand('pletor.openPlan', () => {
      PletorPlanPanel.createOrShow(context.extensionUri)
    }),

    vscode.commands.registerCommand('pletor.initWorkspace', async () => {
      const folders = vscode.workspace.workspaceFolders
      if (!folders) {
        vscode.window.showErrorMessage('Pletor: Nejprve otevři složku projektu')
        return
      }

      const { readPlan, writePlan, readCanvas, writeCanvas } = await import('./storage')
      const plan = readPlan()
      if (!plan.intent) {
        writePlan({ ...plan, updatedAt: new Date().toISOString() })
      }
      const canvas = readCanvas()
      if (canvas.nodes.length === 0) {
        writeCanvas({ ...canvas, updatedAt: new Date().toISOString() })
      }

      projectTree.refresh()
      vscode.window.showInformationMessage('Pletor: Workspace inicializován ✓')
      PletorPlanPanel.createOrShow(context.extensionUri)
    }),

    vscode.commands.registerCommand('pletor.refreshTree', () => {
      projectTree.refresh()
    }),
  )

  // Sleduj změny v workspace → obnov tree
  const watcher = vscode.workspace.createFileSystemWatcher('**/*', false, true, false)
  watcher.onDidCreate(() => projectTree.refresh())
  watcher.onDidDelete(() => projectTree.refresh())
  context.subscriptions.push(watcher)

  // Inicializuj tree po startu
  projectTree.refresh()

  // Uvítací zpráva při prvním spuštění
  const isFirst = context.globalState.get('pletor.welcomed', false)
  if (!isFirst) {
    vscode.window.showInformationMessage(
      'Pletor je aktivní. Otevři Plan nebo Canvas.',
      'Otevřít Plan',
      'Otevřít Canvas',
    ).then((choice) => {
      if (choice === 'Otevřít Plan') vscode.commands.executeCommand('pletor.openPlan')
      if (choice === 'Otevřít Canvas') vscode.commands.executeCommand('pletor.openCanvas')
    })
    context.globalState.update('pletor.welcomed', true)
  }
}

export function deactivate(): void {
  // cleanup pokud bude potřeba
}
