import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export interface FileNode {
  name: string
  relativePath: string
  absolutePath: string
  isDirectory: boolean
  children: FileNode[]
  ext: string
}

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.pletor', 'dist', 'build', '__pycache__',
  '.venv', 'venv', '.next', '.nuxt', 'coverage', '.pytest_cache',
])

const IGNORE_FILES = new Set([
  '.DS_Store', 'Thumbs.db', '.gitignore', '.env', '.env.local',
])

export function scanWorkspace(): FileNode | null {
  const folders = vscode.workspace.workspaceFolders
  if (!folders || folders.length === 0) return null
  const root = folders[0].uri.fsPath
  return scanDir(root, root)
}

function scanDir(dirPath: string, rootPath: string): FileNode {
  const name = path.basename(dirPath)
  const relativePath = path.relative(rootPath, dirPath) || '.'
  const children: FileNode[] = []

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue
        children.push(scanDir(path.join(dirPath, entry.name), rootPath))
      } else {
        if (IGNORE_FILES.has(entry.name)) continue
        const filePath = path.join(dirPath, entry.name)
        children.push({
          name: entry.name,
          relativePath: path.relative(rootPath, filePath),
          absolutePath: filePath,
          isDirectory: false,
          children: [],
          ext: path.extname(entry.name).toLowerCase(),
        })
      }
    }
  } catch {
    // Přeskočíme nepřístupné složky
  }

  // Složky před soubory, pak abecedně
  children.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return {
    name,
    relativePath,
    absolutePath: dirPath,
    isDirectory: true,
    children,
    ext: '',
  }
}

export function flattenToCanvasNodes(tree: FileNode): Array<{
  id: string
  label: string
  filePath: string
  type: 'folder' | 'file' | 'component' | 'service' | 'api' | 'agent' | 'integration' | 'database'
}> {
  const result: ReturnType<typeof flattenToCanvasNodes> = []

  function walk(node: FileNode, depth: number) {
    if (depth === 0) {
      for (const child of node.children) walk(child, depth + 1)
      return
    }

    const type = inferType(node)
    result.push({
      id: node.relativePath,
      label: node.name,
      filePath: node.relativePath,
      type,
    })

    if (node.isDirectory) {
      for (const child of node.children) walk(child, depth + 1)
    }
  }

  walk(tree, 0)
  return result
}

function inferType(node: FileNode): ReturnType<typeof flattenToCanvasNodes>[0]['type'] {
  if (node.isDirectory) return 'folder'

  const name = node.name.toLowerCase()
  const ext = node.ext

  if (name.includes('controller') || name.includes('router') || name.includes('route')) return 'api'
  if (name.includes('service')) return 'service'
  if (name.includes('agent')) return 'agent'
  if (name.includes('model') || name.includes('schema') || name.includes('migration')) return 'database'
  if (name.includes('integration') || name.includes('webhook')) return 'integration'
  if (['.tsx', '.jsx'].includes(ext)) return 'component'

  return 'file'
}
