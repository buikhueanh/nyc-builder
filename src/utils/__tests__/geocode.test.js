import { describe, it, expect, vi, afterEach } from 'vitest'
import { geocodeAddress, NYC_FALLBACK } from '../geocode.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('geocodeAddress', () => {
  it('parses lat/lng from a Nominatim hit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => [{ lat: '40.6872', lon: '-73.984' }],
      }),
    )
    const coords = await geocodeAddress('78 Atlantic Ave')
    expect(coords).toEqual({ lat: 40.6872, lng: -73.984 })
  })

  it('falls back to NYC center on empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [] }))
    expect(await geocodeAddress('nowhere')).toEqual(NYC_FALLBACK)
  })

  it('falls back to NYC center on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await geocodeAddress('anywhere')).toEqual(NYC_FALLBACK)
  })
})
