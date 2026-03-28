import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppFooter from './AppFooter'

describe('AppFooter', () => {
  it('vykreslí footer s toggle tlačítkem', () => {
    render(<AppFooter />)
    expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeInTheDocument()
  })
})
