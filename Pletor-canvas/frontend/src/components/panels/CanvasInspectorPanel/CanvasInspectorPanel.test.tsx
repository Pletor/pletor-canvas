import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CanvasInspectorPanel from './CanvasInspectorPanel'

vi.mock('../../../store/canvasStore', () => ({
  useCanvasStore: (selector: (s: object) => unknown) =>
    selector({
      selectedNodeId: null,
      nodes: [],
      updateNodeData: vi.fn(),
      removeNode: vi.fn(),
    }),
}))

vi.mock('../InspectorAgentSection/InspectorAgentSection', () => ({
  default: () => <div data-testid="agent-section" />,
}))

describe('CanvasInspectorPanel', () => {
  it('zobrazí placeholder když není vybraný uzel', () => {
    render(<CanvasInspectorPanel />)
    expect(screen.getByText('Vyber uzel na canvasu')).toBeInTheDocument()
  })
})
