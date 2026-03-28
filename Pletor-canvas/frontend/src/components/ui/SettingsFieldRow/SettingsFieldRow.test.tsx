import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SettingsFieldRow from './SettingsFieldRow'
import type { SettingsField } from '../../../store/settingsStore'

describe('SettingsFieldRow', () => {
  it('vykreslí textový input', () => {
    const field: SettingsField = { id: 'name', label: 'Název projektu', type: 'text', value: 'Pletor' }
    render(<SettingsFieldRow field={field} onChange={vi.fn()} />)
    expect(screen.getByText('Název projektu')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Pletor')).toBeInTheDocument()
  })

  it('vykreslí toggle', () => {
    const field: SettingsField = { id: 'dark', label: 'Tmavý režim', type: 'toggle', value: 'true' }
    render(<SettingsFieldRow field={field} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })
})
