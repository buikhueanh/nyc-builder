import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterBar from '../FilterBar.jsx'

const baseFilters = { date: 'all', team: '', vibe: [] }

function setup(filters = baseFilters) {
  const onChange = vi.fn()
  render(
    <FilterBar
      filters={filters}
      onChange={onChange}
      availableTeams={['Argentina', 'Mexico']}
      resultCount={5}
    />,
  )
  return { onChange }
}

describe('FilterBar', () => {
  it('emits a date change', () => {
    const { onChange } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Today' }))
    expect(onChange).toHaveBeenCalledWith({ ...baseFilters, date: 'today' })
  })

  it('only lists teams present in the data', () => {
    setup()
    const select = screen.getByLabelText(/Filter by team/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Argentina/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Japan/ })).not.toBeInTheDocument()
  })

  it('toggles a vibe chip on and off', () => {
    const { onChange } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'rowdy' }))
    expect(onChange).toHaveBeenCalledWith({ ...baseFilters, vibe: ['rowdy'] })
  })

  it('shows reset only when filters differ from default', () => {
    setup() // default
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
    setup({ date: 'today', team: '', vibe: [] })
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })
})
