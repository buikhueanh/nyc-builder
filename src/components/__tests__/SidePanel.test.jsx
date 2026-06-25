import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SidePanel from '../SidePanel.jsx'

const party = {
  id: '2',
  hostType: 'household',
  hostName: "Ahmed's Rooftop",
  neighborhood: 'Boerum Hill',
  matchFixture: 'Argentina vs England',
  teamCheering: 'Argentina',
  date: '2026-06-26',
  matchTime: '3:00 PM',
  capacity: 10,
  rsvpCount: 6, // ratio 0.6 → filling up
  culturalTheme: 'Pakistani household, karahi on the stove',
  vibeDescription: '🇵🇰 Karachi energy meets Buenos Aires passion',
  vibeTags: ['rowdy', 'food-provided'],
  contactInfo: 'WhatsApp Ahmed',
}

describe('SidePanel', () => {
  it('shows host details and the correct capacity label', () => {
    render(<SidePanel party={party} onClose={() => {}} onRsvp={() => {}} />)
    expect(screen.getByRole('heading', { name: /Ahmed's Rooftop/ })).toBeInTheDocument()
    expect(screen.getByText('Filling up')).toBeInTheDocument()
    expect(screen.getByText(/Karachi energy/)).toBeInTheDocument()
    expect(screen.getByText('rowdy')).toBeInTheDocument()
  })

  it('calls onClose from the close button', () => {
    const onClose = vi.fn()
    render(<SidePanel party={party} onClose={onClose} onRsvp={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onRsvp with the party from the CTA', () => {
    const onRsvp = vi.fn()
    render(<SidePanel party={party} onClose={() => {}} onRsvp={onRsvp} />)
    fireEvent.click(screen.getByRole('button', { name: /I'm In/i }))
    expect(onRsvp).toHaveBeenCalledWith(party)
  })
})
