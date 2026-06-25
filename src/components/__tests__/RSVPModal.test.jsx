import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RSVPModal from '../RSVPModal.jsx'

const party = {
  id: '2',
  hostName: "Ahmed's Rooftop",
  date: '2026-06-26',
  matchFixture: 'Argentina vs England',
  rsvpCount: 6,
  capacity: 10,
}

describe('RSVPModal', () => {
  it('does not submit without name and email', () => {
    const onConfirm = vi.fn()
    render(<RSVPModal party={party} onClose={() => {}} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: /Reserve My Spot/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirms with guest details and shows the confirmation', () => {
    const onConfirm = vi.fn()
    render(<RSVPModal party={party} onClose={() => {}} onConfirm={onConfirm} />)
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Linh' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'linh@email.com' } })
    fireEvent.click(screen.getByRole('button', { name: /Reserve My Spot/i }))

    expect(onConfirm).toHaveBeenCalledWith({
      party,
      guestName: 'Linh',
      guestEmail: 'linh@email.com',
    })
    expect(screen.getByText(/You're in!/i)).toBeInTheDocument()
    expect(screen.getByText(/Ahmed's Rooftop · 2026-06-26 · Argentina vs England/)).toBeInTheDocument()
  })

  it('renders nothing when no party is selected', () => {
    const { container } = render(<RSVPModal party={null} onClose={() => {}} onConfirm={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
