import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PletorIntegrationNode from './PletorIntegrationNode'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
}))

vi.mock('../../../store/canvasStore', () => ({
  useCanvasStore: (selector: (s: object) => unknown) =>
    selector({ selectNode: vi.fn() }),
}))

describe('PletorIntegrationNode', () => {
  it('vykreslí label integrace', () => {
    const props = {
      id: 'node-1',
      data: { label: 'Stripe', nodeType: 'integration' },
    } as never

    render(<PletorIntegrationNode {...props} />)
    expect(screen.getByText('Stripe')).toBeInTheDocument()
  })
})
