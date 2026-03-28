import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PletorFileNode from './PletorFileNode'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
}))

vi.mock('../../../store/canvasStore', () => ({
  useCanvasStore: (selector: (s: object) => unknown) =>
    selector({ selectNode: vi.fn() }),
}))

describe('PletorFileNode', () => {
  it('vykreslí label souboru', () => {
    const props = {
      id: 'node-1',
      data: { label: 'index.ts', nodeType: 'file' },
    } as never

    render(<PletorFileNode {...props} />)
    expect(screen.getByText('index.ts')).toBeInTheDocument()
  })
})
