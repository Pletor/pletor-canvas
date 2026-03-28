import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import PletorEventEdge from './PletorEventEdge'
import { Position } from '@xyflow/react'

vi.mock('@xyflow/react', () => ({
  BaseEdge: ({ id }: { id: string }) => <path data-testid={id} />,
  getSmoothStepPath: () => ['M0 0', 0, 0],
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
}))

describe('PletorEventEdge', () => {
  it('vykreslí hranu bez pádu', () => {
    const props = {
      id: 'edge-1',
      sourceX: 0, sourceY: 0,
      targetX: 100, targetY: 100,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    } as never

    const { container } = render(
      <svg><PletorEventEdge {...props} /></svg>
    )
    expect(container).toBeTruthy()
  })
})
