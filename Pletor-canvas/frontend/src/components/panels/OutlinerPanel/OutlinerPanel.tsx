import { useEffect, useState, useRef, useCallback, type KeyboardEvent, type MouseEvent } from 'react'
import { useTreeStore } from '../../../store/treeStore'
import { useCanvasStore } from '../../../store/canvasStore'
import { canvasApi } from '../../../api/canvasApi'
import { treeApi } from '../../../api/treeApi'
import type { TreeNode } from '../../../api/treeApi'
import './OutlinerPanel.css'

interface BreadcrumbItem {
  id: string | null
  label: string
}

function OutlinerPanel() {
  const storeCanvasId = useCanvasStore((s) => s.activeCanvasId)
  const setActiveCanvasId = useCanvasStore((s) => s.setActiveCanvasId)
  const [canvasId, setCanvasId] = useState<string | null>(storeCanvasId)
  const tree = useTreeStore((s) => s.tree)
  const loading = useTreeStore((s) => s.loading)
  const loadTree = useTreeStore((s) => s.loadTree)
  const createNode = useTreeStore((s) => s.createNode)

  const [zoomedNodeId, setZoomedNodeId] = useState<string | null>(null)
  const [zoomedTree, setZoomedTree] = useState<TreeNode[] | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, label: 'Home' }])

  useEffect(() => {
    if (storeCanvasId) {
      setCanvasId(storeCanvasId)
      return
    }
    async function findCanvas() {
      try {
        const canvases = await canvasApi.listCanvases()
        if (canvases.length > 0) {
          setCanvasId(canvases[0].id)
          setActiveCanvasId(canvases[0].id)
        }
      } catch { /* offline */ }
    }
    findCanvas()
  }, [storeCanvasId, setActiveCanvasId])

  useEffect(() => {
    if (canvasId) loadTree(canvasId)
  }, [canvasId, loadTree])

  useEffect(() => {
    if (!zoomedNodeId) {
      setZoomedTree(null)
      setBreadcrumbs([{ id: null, label: 'Home' }])
      return
    }
    const path = findNodePath(tree, zoomedNodeId)
    if (path) {
      const targetNode = path[path.length - 1]
      setZoomedTree(targetNode.children)
      setBreadcrumbs([
        { id: null, label: 'Home' },
        ...path.map((n) => ({ id: n.id, label: n.content || 'Bez názvu' })),
      ])
    }
  }, [zoomedNodeId, tree])

  const handleZoom = useCallback((nodeId: string) => {
    setZoomedNodeId(nodeId)
  }, [])

  const handleBreadcrumbClick = useCallback((id: string | null) => {
    setZoomedNodeId(id)
  }, [])

  const handleAddNode = useCallback(() => {
    if (canvasId) createNode(canvasId, '', zoomedNodeId)
  }, [canvasId, zoomedNodeId, createNode])

  if (!canvasId) {
    return <div className="outliner-panel"><p className="outliner-empty">Žádný aktivní canvas</p></div>
  }

  const displayTree = zoomedTree ?? tree
  const currentTitle = zoomedNodeId
    ? breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Přehled'
    : 'Home'

  return (
    <div className="outliner-panel">
      <div className="outliner-breadcrumbs">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.id ?? 'home'}>
            {i > 0 && <span className="outliner-breadcrumb-sep">&gt;</span>}
            <button
              className={`outliner-breadcrumb ${i === breadcrumbs.length - 1 ? 'active' : ''}`}
              onClick={() => handleBreadcrumbClick(crumb.id)}
            >
              {crumb.label}
            </button>
          </span>
        ))}
      </div>

      <div className="outliner-header">
        <h2 className="outliner-title">{currentTitle}</h2>
        <button className="outliner-add-btn" onClick={handleAddNode} title="Nový uzel">+</button>
      </div>

      {loading && <p className="outliner-loading">Načítám...</p>}
      {!loading && displayTree.length === 0 && (
        <div className="outliner-empty">
          <p>{zoomedNodeId ? 'Žádné potomky' : 'Strom je prázdný'}</p>
          <button className="outliner-add-first-btn" onClick={handleAddNode}>
            + Přidej první uzel
          </button>
        </div>
      )}
      <div className="outliner-tree">
        {displayTree.map((node) => (
          <OutlinerNode key={node.id} node={node} depth={0} canvasId={canvasId} onZoom={handleZoom} />
        ))}
      </div>
    </div>
  )
}

function findNodePath(nodes: TreeNode[], targetId: string): TreeNode[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return [node]
    if (node.children.length > 0) {
      const childPath = findNodePath(node.children, targetId)
      if (childPath) return [node, ...childPath]
    }
  }
  return null
}

interface OutlinerNodeProps {
  node: TreeNode
  depth: number
  canvasId: string
  onZoom: (nodeId: string) => void
}

function OutlinerNode({ node, depth, canvasId, onZoom }: OutlinerNodeProps) {
  const inputRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const editingNodeId = useTreeStore((s) => s.editingNodeId)
  const setEditingNodeId = useTreeStore((s) => s.setEditingNodeId)
  const updateContent = useTreeStore((s) => s.updateContent)
  const createNode = useTreeStore((s) => s.createNode)
  const deleteNode = useTreeStore((s) => s.deleteNode)
  const indentNode = useTreeStore((s) => s.indentNode)
  const outdentNode = useTreeStore((s) => s.outdentNode)
  const toggleComplete = useTreeStore((s) => s.toggleComplete)
  const toggleCollapse = useTreeStore((s) => s.toggleCollapse)
  const isEditing = editingNodeId === node.id
  const hasChildren = node.children && node.children.length > 0

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      const range = document.createRange()
      const sel = window.getSelection()
      if (inputRef.current.childNodes.length > 0) {
        range.selectNodeContents(inputRef.current)
        range.collapse(false)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
  }, [isEditing])

  useEffect(() => {
    if (!showMenu) return
    const handler = () => setShowMenu(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showMenu])

  const handleBlur = useCallback(() => {
    if (inputRef.current) {
      const newContent = inputRef.current.textContent ?? ''
      if (newContent !== node.content) {
        updateContent(node.id, newContent)
      }
    }
    setEditingNodeId(null)
  }, [node.id, node.content, updateContent, setEditingNodeId])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputRef.current) {
        const content = inputRef.current.textContent ?? ''
        if (content !== node.content) updateContent(node.id, content)
      }
      createNode(canvasId, '', node.parentId)
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      indentNode(node.id, canvasId)
    }
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      outdentNode(node.id, canvasId)
    }
    if (e.key === 'Backspace' && inputRef.current?.textContent === '') {
      e.preventDefault()
      deleteNode(node.id, canvasId)
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setEditingNodeId(null)
      inputRef.current?.blur()
    }
  }, [node.id, node.parentId, node.content, canvasId, createNode, updateContent, deleteNode, indentNode, outdentNode, setEditingNodeId])

  const handleBulletClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    onZoom(node.id)
  }, [node.id, onZoom])

  const handleCollapseClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    toggleCollapse(node.id, canvasId)
  }, [node.id, canvasId, toggleCollapse])

  const handleMenuClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    setShowMenu((v) => !v)
  }, [])

  const menuAction = useCallback((action: string) => {
    setShowMenu(false)
    switch (action) {
      case 'complete':
        toggleComplete(node.id, canvasId)
        break
      case 'add-child':
        createNode(canvasId, '', node.id)
        break
      case 'indent':
        indentNode(node.id, canvasId)
        break
      case 'outdent':
        outdentNode(node.id, canvasId)
        break
      case 'duplicate':
        treeApi.duplicateNode(node.id).then(() => {
          const store = useTreeStore.getState()
          store.loadTree(canvasId)
        })
        break
      case 'delete':
        deleteNode(node.id, canvasId)
        break
      case 'zoom':
        onZoom(node.id)
        break
    }
  }, [node.id, canvasId, toggleComplete, createNode, indentNode, outdentNode, deleteNode, onZoom])

  return (
    <div className="outliner-node-group">
      <div
        className={`outliner-node ${isEditing ? 'editing' : ''} ${node.isCompleted ? 'completed' : ''}`}
        style={{ paddingInlineStart: `${depth * 24 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span
          className={`outliner-dots ${isHovered ? 'visible' : ''}`}
          onClick={handleMenuClick}
          title="Menu"
        >
          ···
        </span>

        {hasChildren && (
          <span className="outliner-collapse" onClick={handleCollapseClick}>
            {node.isCollapsed ? '▶' : '▼'}
          </span>
        )}

        <span
          className={`outliner-bullet ${node.nodeType === 'todo' ? 'todo' : ''}`}
          onClick={handleBulletClick}
          title="Klikni pro zanořit se"
        >
          {node.nodeType === 'todo' ? (node.isCompleted ? '☑' : '☐') : '•'}
        </span>

        <div
          ref={inputRef}
          className="outliner-content"
          contentEditable
          suppressContentEditableWarning
          onClick={() => setEditingNodeId(node.id)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          {node.content || ''}
        </div>

        {showMenu && (
          <div className="outliner-menu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => menuAction('zoom')}>↳ Zanořit se</button>
            <button onClick={() => menuAction('add-child')}>+ Přidat potomka</button>
            <button onClick={() => menuAction('complete')}>
              {node.isCompleted ? '↩ Zrušit dokončení' : '✓ Dokončit'}
            </button>
            <hr />
            <button onClick={() => menuAction('indent')}>→ Odsadit doprava</button>
            <button onClick={() => menuAction('outdent')}>← Odsadit doleva</button>
            <button onClick={() => menuAction('duplicate')}>⧉ Duplikovat</button>
            <hr />
            <button className="danger" onClick={() => menuAction('delete')}>🗑 Smazat</button>
          </div>
        )}
      </div>

      {!node.isCollapsed && hasChildren && (
        <div className="outliner-children">
          {node.children.map((child) => (
            <OutlinerNode key={child.id} node={child} depth={depth + 1} canvasId={canvasId} onZoom={onZoom} />
          ))}
        </div>
      )}
    </div>
  )
}

export default OutlinerPanel
