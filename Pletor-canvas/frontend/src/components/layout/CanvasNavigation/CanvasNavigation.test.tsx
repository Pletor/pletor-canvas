import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CanvasNavigation from './CanvasNavigation'

describe('CanvasNavigation', () => {
  it('vykreslí navigační tlačítka', () => {
    render(<CanvasNavigation activeSection="canvas" onSectionChange={vi.fn()} />)
    expect(screen.getByText('Canvas')).toBeInTheDocument()
    expect(screen.getByText('Přehled')).toBeInTheDocument()
  })

  it('označí aktivní sekci', () => {
    render(<CanvasNavigation activeSection="canvas" onSectionChange={vi.fn()} />)
    const activeBtn = screen.getByText('Canvas').closest('button')
    expect(activeBtn).toHaveClass('active')
  })
})
