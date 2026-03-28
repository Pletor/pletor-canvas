import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppHeader from './AppHeader'

describe('AppHeader', () => {
  it('vykreslí logo a tlačítko spustit', () => {
    render(<AppHeader onLaunch={vi.fn()} />)
    expect(screen.getByText('Pletor')).toBeInTheDocument()
    expect(screen.getByText('Spustit projekt')).toBeInTheDocument()
  })
})
