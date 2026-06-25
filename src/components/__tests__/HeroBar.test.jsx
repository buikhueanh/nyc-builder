import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HeroBar from '../HeroBar.jsx'

describe('HeroBar', () => {
  it('renders the title and tagline', () => {
    render(<HeroBar onHostClick={() => {}} />)
    expect(screen.getByRole('heading', { name: /WatchParty NYC/i })).toBeInTheDocument()
    expect(screen.getByText(/Flex your culture/i)).toBeInTheDocument()
  })

  it('fires onHostClick when the CTA is pressed', () => {
    const onHostClick = vi.fn()
    render(<HeroBar onHostClick={onHostClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Host a Watch Party/i }))
    expect(onHostClick).toHaveBeenCalledOnce()
  })
})
