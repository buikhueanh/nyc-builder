import { describe, it, expect, vi, afterEach } from 'vitest'
import { streamVibeDescription, parseSSEFrames } from '../vibeGenerator.js'

afterEach(() => vi.restoreAllMocks())

// Fake backend SSE body (clean `data: {"text": ...}` frames the server emits).
function fakeResponse(frames, { ok = true, status = 200 } = {}) {
  const encoder = new TextEncoder()
  const text = frames.map((f) => `data: ${JSON.stringify({ text: f })}\n\n`).join('') +
    'event: done\ndata: {}\n\n'
  // Encode first, then slice BYTES (like a real socket) so multi-byte emoji
  // can straddle chunk boundaries and TextDecoder reassembles them.
  const bytes = encoder.encode(text)
  const size = 9
  let i = 0
  return {
    ok,
    status,
    body: {
      getReader: () => ({
        read: async () =>
          i < bytes.length
            ? { done: false, value: bytes.slice(i, (i += size)) }
            : { done: true, value: undefined },
      }),
    },
  }
}

describe('parseSSEFrames', () => {
  it('extracts data frames and the incomplete tail', () => {
    const { frames, rest } = parseSSEFrames('data: {"text":"a"}\n\ndata: {"text":"b"}')
    expect(frames).toHaveLength(1)
    expect(frames[0].data).toBe('{"text":"a"}')
    expect(rest).toBe('data: {"text":"b"}')
  })
})

describe('streamVibeDescription', () => {
  it('calls onDelta with accumulating text and returns the full sentence', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse(['🇫🇷 Hanoi ', 'roots, ', 'Paris heart'])))
    const deltas = []
    const final = await streamVibeDescription(
      { culturalTheme: 'pho', teamCheering: 'France', hostType: 'restaurant' },
      (acc) => deltas.push(acc),
    )
    // Accumulates progressively (real-time render).
    expect(deltas).toEqual(['🇫🇷 Hanoi ', '🇫🇷 Hanoi roots, ', '🇫🇷 Hanoi roots, Paris heart'])
    expect(final).toBe('🇫🇷 Hanoi roots, Paris heart')
  })

  it('falls back to a local sentence on HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse([], { ok: false, status: 500 })))
    const final = await streamVibeDescription({ culturalTheme: 'pho night', teamCheering: 'France' })
    expect(final).toMatch(/🇫🇷.*pho night/)
  })

  it('falls back when fetch throws (backend down)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNREFUSED') }))
    const deltas = []
    const final = await streamVibeDescription(
      { culturalTheme: 'samba', teamCheering: 'Brazil' },
      (acc) => deltas.push(acc),
    )
    expect(final).toMatch(/🇧🇷/)
    expect(deltas.at(-1)).toBe(final)
  })
})
