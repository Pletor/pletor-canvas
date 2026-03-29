import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export interface PlanData {
  intent: string
  context: string
  prompt: string
  techStack: string
  codingRules: string
  projectStructure: string
  updatedAt: string
}

export interface CanvasNode {
  id: string
  type: 'folder' | 'file' | 'component' | 'service' | 'api' | 'agent' | 'integration' | 'database'
  label: string
  filePath?: string
  position: { x: number; y: number }
  data: {
    intent?: string
    context?: string
    prompt?: string
    status: 'planned' | 'in-progress' | 'done' | 'blocked' | 'review'
    notes: NoteItem[]
  }
}

export interface NoteItem {
  id: string
  text: string
  children: NoteItem[]
  collapsed: boolean
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  type: 'import' | 'apiCall' | 'dataFlow' | 'event'
}

export interface CanvasData {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  updatedAt: string
}

function getPletorDir(): string | null {
  const folders = vscode.workspace.workspaceFolders
  if (!folders || folders.length === 0) return null
  return path.join(folders[0].uri.fsPath, '.pletor')
}

function ensurePletorDir(): string | null {
  const dir = getPletorDir()
  if (!dir) return null
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function readPlan(): PlanData {
  const dir = getPletorDir()
  if (!dir) return defaultPlan()
  const file = path.join(dir, 'plan.json')
  if (!fs.existsSync(file)) return defaultPlan()
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as PlanData
  } catch {
    return defaultPlan()
  }
}

export function writePlan(data: PlanData): void {
  const dir = ensurePletorDir()
  if (!dir) return
  fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify(data, null, 2))
}

export function readCanvas(): CanvasData {
  const dir = getPletorDir()
  if (!dir) return defaultCanvas()
  const file = path.join(dir, 'canvas.json')
  if (!fs.existsSync(file)) return defaultCanvas()
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as CanvasData
  } catch {
    return defaultCanvas()
  }
}

export function writeCanvas(data: CanvasData): void {
  const dir = ensurePletorDir()
  if (!dir) return
  fs.writeFileSync(path.join(dir, 'canvas.json'), JSON.stringify(data, null, 2))
}

function defaultPlan(): PlanData {
  return {
    intent: '',
    context: '',
    prompt: '',
    techStack: '',
    codingRules: '',
    projectStructure: '',
    updatedAt: new Date().toISOString(),
  }
}

function defaultCanvas(): CanvasData {
  return { nodes: [], edges: [], updatedAt: new Date().toISOString() }
}
