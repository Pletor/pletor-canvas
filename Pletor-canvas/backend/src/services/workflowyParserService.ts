import type { WorkFlowyTreeNode } from './workflowyApiClient.js'

// Strukturovaná data extrahovaná z WorkFlowy uzlu
export interface ParsedWorkFlowyNode {
  id: string
  name: string
  prompt?: string
  context?: string
  intent?: string
  constraints: string[]
  children: ParsedWorkFlowyNode[]
  note: string | null
}

// Parsuje WorkFlowy strom na strukturovaná data s PROMPT/CONTEXT/INTENT/CONSTRAINTS
export function parseWorkFlowyTree(nodes: WorkFlowyTreeNode[]): ParsedWorkFlowyNode[] {
  return nodes.map(parseNode)
}

function parseNode(node: WorkFlowyTreeNode): ParsedWorkFlowyNode {
  const children = node.children.map(parseNode)

  // Zkombinuj text uzlu + poznámku + texty přímých dětí pro extrakci tagů
  const allText = buildNodeText(node)
  const childTexts = node.children.map((c) => `${c.name}\n${c.note ?? ''}`)

  const prompt = extractTag(allText, 'PROMPT') ?? extractTagFromChildren(childTexts, 'PROMPT')
  const context = extractTag(allText, 'CONTEXT') ?? extractTagFromChildren(childTexts, 'CONTEXT')
  const intent = extractTag(allText, 'INTENT') ?? extractTagFromChildren(childTexts, 'INTENT')
  const constraints = extractConstraints(allText, node.children)

  return {
    id: node.id,
    name: stripFormatting(node.name),
    prompt,
    context,
    intent,
    constraints,
    children,
    note: node.note,
  }
}

function buildNodeText(node: WorkFlowyTreeNode): string {
  const parts = [node.name]
  if (node.note) parts.push(node.note)
  return parts.join('\n')
}

// Extrahuje hodnotu tagu z textu
// Podporuje: "PROMPT: text", "- PROMPT: text", "**PROMPT**: text"
function extractTag(text: string, tag: string): string | undefined {
  const patterns = [
    new RegExp(`(?:^|\\n)\\s*-?\\s*\\*{0,2}${tag}\\*{0,2}\\s*[:—–-]\\s*"([^"]+)"`, 'is'),
    new RegExp(`(?:^|\\n)\\s*-?\\s*\\*{0,2}${tag}\\*{0,2}\\s*[:—–-]\\s*(.+?)(?:\\n|$)`, 'is'),
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return cleanValue(match[1])
  }

  return undefined
}

// Hledá tag v textech dětí
function extractTagFromChildren(childTexts: string[], tag: string): string | undefined {
  for (const text of childTexts) {
    const value = extractTag(text, tag)
    if (value) return value
  }
  return undefined
}

// Extrahuje CONSTRAINTS — může být jako seznam dětí nebo jako čárkami oddělený text
function extractConstraints(text: string, children: WorkFlowyTreeNode[]): string[] {
  const constraints: string[] = []

  // Z textu
  const match = text.match(/CONSTRAINTS?\s*[:—–-]\s*(.+?)(?:\n\s*[A-Z]|$)/is)
  if (match?.[1]) {
    const items = match[1].split(/[,\n]/).map((s) => s.trim().replace(/^-\s*/, '')).filter(Boolean)
    constraints.push(...items)
  }

  // Z dětí — hledáme uzel "CONSTRAINTS" a jeho děti jsou jednotlivé položky
  for (const child of children) {
    const name = stripFormatting(child.name).toUpperCase()
    if (name.startsWith('CONSTRAINT')) {
      for (const grandchild of child.children) {
        constraints.push(cleanValue(stripFormatting(grandchild.name)))
      }
    }
  }

  return constraints
}

// Odstraní markdown formátování
function stripFormatting(text: string): string {
  return text
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

function cleanValue(value: string): string {
  return value.replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim()
}
