import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PletorAgentNode from './PletorAgentNode'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
}))

vi.mock('../../../store/canvasStore', () => ({
  useCanvasStore: (selector: (s: object) => unknown) =>
    selector({ selectNode: vi.fn() }),
}))

describe('PletorAgentNode', () => {
  it('vykreslí label uzlu', () => {
    const props = {
      id: 'node-1',
      data: { label: 'TestAgent', nodeType: 'agent' },
    } as never

    render(<PletorAgentNode {...props} />)
    expect(screen.getByText('TestAgent')).toBeInTheDocument()
  })
})
