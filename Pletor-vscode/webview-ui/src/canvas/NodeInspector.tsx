import { useCallback } from 'react'
import { useCanvasStore, createNote } from './canvasStore'
import { NODE_COLORS, STATUS_ICONS, STATUS_COLORS, type PletorNodeData, type NodeStatus, type NoteItem } from './canvas.types'
import { postMessage } from '../lib/vscode'
import './NodeInspector.css'

export function NodeInspector() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const nodes = useCanvasStore((s) => s.nodes)
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const removeNode = useCanvasStore((s) => s.removeNode)
  const selectNode = useCanvasStore((s) => s.selectNode)

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const data = node.data as PletorNodeData
  const colors = NODE_COLORS[data.nodeType]

  function change(field: keyof PletorNodeData, value: unknown) {
    updateNodeData(node!.id, { [field]: value })
  }

  function handleOpenFile() {
    if (data.filePath) postMessage('openFile', { filePath: data.filePath })
  }

  return (
    <div className="node-inspector">
      <div className="inspector-header" style={{ borderBottomColor: colors.border }}>
        <span className="inspector-type" style={{ color: colors.text }}>
          {data.nodeType}
        </span>
        {data.filePath && (
          <button className="inspector-open-btn" onClick={handleOpenFile} title="Otevřít soubor">
            ↗
          </button>
        )}
        <button className="inspector-close-btn" onClick={() => selectNode(null)}>✕</button>
      </div>

      <div className="inspector-body">
        {/* Název */}
        <div className="inspector-field">
          <label>Název</label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => change('label', e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="inspector-field">
          <label>Status</label>
          <div className="inspector-status-grid">
            {(Object.keys(STATUS_ICONS) as NodeStatus[]).map((s) => (
              <button
                key={s}
                className={`inspector-status-btn ${data.status === s ? 'active' : ''}`}
                style={{ color: STATUS_COLORS[s], borderColor: data.status === s ? STATUS_COLORS[s] : 'transparent' }}
                onClick={() => change('status', s)}
                title={s}
              >
                {STATUS_ICONS[s]} {s}
              </button>
            ))}
          </div>
        </div>

        {/* Záměr */}
        <div className="inspector-field">
          <label>Záměr</label>
          <textarea
            rows={2}
            placeholder="Co má tato komponenta dělat?"
            value={data.intent ?? ''}
            onChange={(e) => change('intent', e.target.value)}
          />
        </div>

        {/* Kontext */}
        <div className="inspector-field">
          <label>Kontext</label>
          <textarea
            rows={2}
            placeholder="Co musí orchestrátor vědět o této komponentě?"
            value={data.context ?? ''}
            onChange={(e) => change('context', e.target.value)}
          />
        </div>

        {/* Prompt */}
        <div className="inspector-field">
          <label>Prompt</label>
          <textarea
            rows={2}
            placeholder="Jak má subagent přistupovat k implementaci?"
            value={data.prompt ?? ''}
            onChange={(e) => change('prompt', e.target.value)}
          />
        </div>

        {/* WorkFlowy Notes */}
        <div className="inspector-field">
          <div className="inspector-notes-header">
            <label>Poznámky</label>
            <button
              className="inspector-add-note-btn"
              onClick={() => change('notes', [...data.notes, createNote()])}
            >
              + Přidat
            </button>
          </div>
          <NoteTree
            notes={data.notes}
            onChange={(notes) => change('notes', notes)}
          />
        </div>
      </div>

      <div className="inspector-footer">
        <button
          className="inspector-delete-btn"
          onClick={() => removeNode(node.id)}
        >
          Smazat uzel
        </button>
      </div>
    </div>
  )
}

// ── WorkFlowy-style note tree ──────────────────────────────────────────────

interface NoteTreeProps {
  notes: NoteItem[]
  onChange: (notes: NoteItem[]) => void
  depth?: number
}

function NoteTree({ notes, onChange, depth = 0 }: NoteTreeProps) {
  const updateNote = useCallback((id: string, updates: Partial<NoteItem>) => {
    onChange(notes.map((n) => n.id === id ? { ...n, ...updates } : n))
  }, [notes, onChange])

  const deleteNote = useCallback((id: string) => {
    onChange(notes.filter((n) => n.id !== id))
  }, [notes, onChange])

  const addChild = useCallback((parentId: string) => {
    onChange(notes.map((n) =>
      n.id === parentId
        ? { ...n, children: [...n.children, createNote()], collapsed: false }
        : n,
    ))
  }, [notes, onChange])

  return (
    <div className="note-tree" style={{ paddingLeft: depth * 16 }}>
      {notes.map((note) => (
        <div key={note.id} className="note-item">
          <div className="note-row">
            <button
              className={`note-toggle ${note.children.length === 0 ? 'empty' : ''}`}
              onClick={() => updateNote(note.id, { collapsed: !note.collapsed })}
            >
              {note.children.length > 0 ? (note.collapsed ? '▶' : '▼') : '•'}
            </button>
            <input
              className="note-input"
              type="text"
              value={note.text}
              placeholder="Poznámka..."
              onChange={(e) => updateNote(note.id, { text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // Přidej novou položku na stejné úrovni za tuto
                  const idx = notes.findIndex((n) => n.id === note.id)
                  const newNotes = [...notes]
                  newNotes.splice(idx + 1, 0, createNote())
                  onChange(newNotes)
                }
                if (e.key === 'Tab') {
                  e.preventDefault()
                  addChild(note.id)
                }
              }}
            />
            <button
              className="note-add-child"
              onClick={() => addChild(note.id)}
              title="Přidat podpoložku (Tab)"
            >↳</button>
            <button
              className="note-delete"
              onClick={() => deleteNote(note.id)}
            >✕</button>
          </div>

          {!note.collapsed && note.children.length > 0 && (
            <NoteTree
              notes={note.children}
              onChange={(children) => updateNote(note.id, { children })}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  )
}
