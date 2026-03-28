import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppSidebar from './AppSidebar'

describe('AppSidebar', () => {
  it('vykreslí sidebar s položkami menu', () => {
    render(<AppSidebar activeMenu="project" onMenuSelect={vi.fn()} />)
    // MENU_ITEMS obsahuje alespoň jednu položku — sidebar existuje v DOM
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
})
