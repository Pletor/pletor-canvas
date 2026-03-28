// @vitest-environment node
// OutlinerPanel je velká komponenta (334 řádků + contentEditable + zustand + canvasApi).
// jsdom prostředí crashuje OOM při transformaci na Windows — testujeme pouze export.
import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../store/canvasStore', () => ({
  useCanvasStore: vi.fn(),
}))
vi.mock('../../../store/treeStore', () => ({
  useTreeStore: vi.fn(),
}))
vi.mock('../../../api/canvasApi', () => ({
  canvasApi: { listCanvases: vi.fn() },
}))
vi.mock('../../../api/treeApi', () => ({
  treeApi: { duplicateNode: vi.fn() },
}))

describe('OutlinerPanel', () => {
  it('exportuje default komponentu', async () => {
    const mod = await import('./OutlinerPanel')
    expect(typeof mod.default).toBe('function')
  })
})
