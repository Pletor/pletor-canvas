import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import InspectorAgentSection from './InspectorAgentSection'

vi.mock('../../../api/agentApi', () => ({
  agentApi: {
    stream: vi.fn(),
  },
}))

describe('InspectorAgentSection', () => {
  it('vykreslí tlačítko generovat', () => {
    render(<InspectorAgentSection nodeId="node-1" />)
    expect(screen.getByText('Generovat kód')).toBeInTheDocument()
  })
})
