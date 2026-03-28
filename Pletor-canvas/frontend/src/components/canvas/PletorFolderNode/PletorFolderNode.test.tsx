import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PletorFolderNode from './PletorFolderNode'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
}))

vi.mock('../../../store/canvasStore', () => ({
  useCanvasStore: (selector: (s: object) => unknown) =>
    selector({ selectNode: vi.fn() }),
}))

describe('PletorFolderNode', () => {
  it('vykreslí label složky', () => {
    const props = {
      id: 'node-1',
      data: { label: 'src', nodeType: 'folder' },
    } as never

    render(<PletorFolderNode {...props} />)
    expect(screen.getByText('src')).toBeInTheDocument()
  })
})
