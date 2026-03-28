import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CanvasNodeLibraryPanel from './CanvasNodeLibraryPanel'

describe('CanvasNodeLibraryPanel', () => {
  it('vykreslí nadpis panelu', () => {
    render(<CanvasNodeLibraryPanel onDragStart={vi.fn()} />)
    expect(screen.getByText('Uzly')).toBeInTheDocument()
  })
})
