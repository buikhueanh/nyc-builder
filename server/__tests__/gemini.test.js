import { describe, it, expect, vi } from 'vitest'
import { buildPrompt, fallbackVibe, parseSSEFrames, streamGemini } from '../gemini.js'

// Build a fake fetch whose body streams the given SSE string in small chunks.
function fakeStreamingFetch(sseText, { ok = true, status = 200 } = {}) {
  const encoder = new TextEncoder()
  // Encode then slice BYTES so multi-byte emoji can split across reads, just
  // like a real network stream; TextDecoder({stream}) reassembles them.
  const bytes = encoder.encode(sseText)
  const size = 12
  let i = 0
  const body = {
    getReader() {
      return {
        read: async () => {
          if (i < bytes.length) return { done: false, value: bytes.slice(i, (i += size)) }
          return { done: true, value: undefined }
        },
      }
    },
  }
  return vi.fn(async () => ({ ok, status, body }))
}

const geminiFrame = (text) =>
  `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })}\n\n`

describe('buildPrompt', () => {
  it('includes the host inputs', () => {
    const p = buildPrompt({ culturalTheme: 'pho night', teamCheering: 'France', hostType: 'restaurant' })
    expect(p).toContain('pho night')
    expect(p).toContain('France')
    expect(p).toContain('restaurant')
  })
})

describe('fallbackVibe', () => {
  it('uses the team flag and theme', () => {
    expect(fallbackVibe({ culturalTheme: 'pho night', teamCheering: 'France' })).toMatch(/🇫🇷.*pho night/)
  })
  it('handles a missing theme', () => {
    expect(fallbackVibe({ teamCheering: 'Brazil' })).toMatch(/🇧🇷/)
  })
})

describe('parseSSEFrames', () => {
  it('splits frames and keeps the incomplete tail', () => {
    const { frames, rest } = parseSSEFrames('data: a\n\ndata: b\n\ndata: c')
    expect(frames.map((f) => f.data)).toEqual(['a', 'b'])
    expect(rest).toBe('data: c')
  })
  it('reads an event name', () => {
    const { frames } = parseSSEFrames('event: done\ndata: {}\n\n')
    expect(frames[0].event).toBe('done')
  })
  it('tolerates CRLF frame separators (as Gemini sends)', () => {
    const { frames, rest } = parseSSEFrames('data: a\r\n\r\ndata: b\r\n\r\ndata: c')
    expect(frames.map((f) => f.data)).toEqual(['a', 'b'])
    expect(rest).toBe('data: c')
  })
})

describe('streamGemini', () => {
  it('streams deltas and concatenates the full text', async () => {
    const sse = geminiFrame('🇫🇷 Hanoi ') + geminiFrame('roots, Paris heart')
    const deltas = []
    const full = await streamGemini({
      params: { culturalTheme: 't', teamCheering: 'France', hostType: 'restaurant' },
      apiKey: 'fake-key',
      model: 'gemini-2.5-flash',
      onDelta: (d) => deltas.push(d),
      fetchImpl: fakeStreamingFetch(sse),
    })
    expect(deltas).toEqual(['🇫🇷 Hanoi ', 'roots, Paris heart'])
    expect(full).toBe('🇫🇷 Hanoi roots, Paris heart')
  })

  it('throws when the API key is missing (caller falls back)', async () => {
    await expect(
      streamGemini({ params: {}, apiKey: '', model: 'm', fetchImpl: fakeStreamingFetch('') }),
    ).rejects.toThrow(/GEMINI_API_KEY/)
  })

  it('throws on a non-OK HTTP response', async () => {
    await expect(
      streamGemini({
        params: {},
        apiKey: 'k',
        model: 'm',
        fetchImpl: fakeStreamingFetch('', { ok: false, status: 429 }),
      }),
    ).rejects.toThrow(/http 429/)
  })
})
