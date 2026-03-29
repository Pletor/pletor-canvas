import { useEffect } from 'react'
import { useCanvasStore } from './canvasStore'

export function useCanvasKeyboard() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const removeNode = useCanvasStore((s) => s.removeNode)
  const selectNode = useCanvasStore((s) => s.selectNode)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignoruj klávesy, pokud je focus v inputu
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }

      // Delete / Backspace = smazat vybraný uzel
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault()
        removeNode(selectedNodeId)
      }

      // Escape = zrušit výběr
      if (event.key === 'Escape') {
        selectNode(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, removeNode, selectNode])
}
