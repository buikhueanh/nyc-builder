import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HostModal from '../HostModal.jsx'

// Geocoding is a network call — stub it to a fixed coordinate.
vi.mock('../../utils/geocode.js', () => ({
  geocodeAddress: vi.fn(async () => ({ lat: 40.71, lng: -73.95 })),
}))

beforeEach(() => {
  vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' })
})

function renderModal(props = {}) {
  const onSubmit = vi.fn()
  const onClose = vi.fn()
  const onGenerateVibe = vi.fn(async () => 'generated vibe')
  render(
    <HostModal open onClose={onClose} onSubmit={onSubmit} onGenerateVibe={onGenerateVibe} {...props} />,
  )
  return { onSubmit, onClose, onGenerateVibe }
}

describe('HostModal', () => {
  it('blocks submit and shows an error when required fields are missing', () => {
    const { onSubmit } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: /Add to Map/i }))
    expect(screen.getByText(/Please fill host name/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('builds a watch party object from a valid form on submit', async () => {
    const { onSubmit } = renderModal()
    fireEvent.change(screen.getByLabelText(/host name/i), { target: { value: 'Bun Bo Brooklyn' } })
    fireEvent.change(screen.getByLabelText(/^address/i), { target: { value: '199 Bedford Ave' } })
    fireEvent.change(screen.getByLabelText(/^match/i), { target: { value: 'f1' } })
    fireEvent.change(screen.getByLabelText(/cheering for/i), { target: { value: 'France' } })

    fireEvent.click(screen.getByRole('button', { name: /Add to Map/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    const party = onSubmit.mock.calls[0][0]
    expect(party).toMatchObject({
      id: 'test-uuid',
      hostName: 'Bun Bo Brooklyn',
      teamCheering: 'France',
      matchFixture: 'Argentina vs France',
      date: '2026-06-26',
      coordinates: { lat: 40.71, lng: -73.95 },
      rsvpCount: 0,
    })
  })

  it('disables Generate until a cultural theme is entered', () => {
    renderModal()
    const gen = screen.getByRole('button', { name: /Generate My Vibe/i })
    expect(gen).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/cultural theme/i), { target: { value: 'pho and bun bo' } })
    expect(gen).toBeEnabled()
  })
})
