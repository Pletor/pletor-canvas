import { useEffect, useRef } from 'react'
import { useCanvasStore } from '../store/canvasStore'
import { canvasApi } from '../api/canvasApi'
import { SEED_NODES, SEED_EDGES } from '../data/canvasSeedData'

const AUTO_SAVE_DELAY = 3000

// Inicializace canvasu — načte ze serveru nebo vytvoří nový
export function useCanvasInit() {
  const nodes = useCanvasStore((s) => s.nodes)
  const activeCanvasId = useCanvasStore((s) => s.activeCanvasId)
  const setActiveCanvasId = useCanvasStore((s) => s.setActiveCanvasId)
  const loadFromServer = useCanvasStore((s) => s.loadFromServer)
  const setInitialData = useCanvasStore((s) => s.setInitialData)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function init() {
      try {
        // Zkus se připojit k API
        await canvasApi.health()

        if (activeCanvasId) {
          // Máme ID — načti ze serveru
          await loadFromServer(activeCanvasId)
          return
        }

        // Nemáme ID — podívej se, jestli existuje canvas na serveru
        const canvases = await canvasApi.listCanvases()
        if (canvases.length > 0) {
          await loadFromServer(canvases[0].id)
          return
        }

        // Žádný canvas — vytvoř nový a naplň seed daty
        const canvas = await canvasApi.createCanvas({ name: 'Pletor Canvas' })
        setActiveCanvasId(canvas.id)

        if (nodes.length === 0) {
          setInitialData(SEED_NODES, SEED_EDGES)
        }

        // Ulož seed data na server
        const store = useCanvasStore.getState()
        store.saveToServer()
      } catch {
        // API nedostupné — offline režim, použij localStorage
        if (nodes.length === 0) {
          setInitialData(SEED_NODES, SEED_EDGES)
        }
      }
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

// Auto-save při změnách (debounced)
export function useCanvasAutoSave() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const activeCanvasId = useCanvasStore((s) => s.activeCanvasId)
  const saveToServer = useCanvasStore((s) => s.saveToServer)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipFirst = useRef(true)

  useEffect(() => {
    // Přeskoč první render (inicializace)
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }

    if (!activeCanvasId) return

    // Debounce — uloží 3 sekundy po poslední změně
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveToServer()
    }, AUTO_SAVE_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, activeCanvasId, saveToServer])
}
