// Frontend client for the streaming vibe endpoint. Reads the SSE response and
// invokes onDelta(accumulatedText) so the UI renders the sentence in real time.

const FLAGS = {
  Argentina: '🇦🇷', Brazil: '🇧🇷', France: '🇫🇷', Germany: '🇩🇪', England: '🏴',
  Spain: '🇪🇸', Mexico: '🇲🇽', USA: '🇺🇸', Morocco: '🇲🇦', Senegal: '🇸🇳',
  'South Korea': '🇰🇷', Japan: '🇯🇵', Portugal: '🇵🇹', Netherlands: '🇳🇱', Colombia: '🇨🇴',
}

function localFallback({ culturalTheme, teamCheering }) {
  const flag = FLAGS[teamCheering] || '🌍'
  const theme = (culturalTheme || '').trim().replace(/\.+$/, '')
  return theme
    ? `${flag} ${theme} — ${teamCheering || 'football'} pride, NYC style ⚽`
    : `${flag} ${teamCheering || 'Football'} pride, NYC style — come find your people ⚽`
}

// Pure SSE framing: returns complete frames and the leftover (incomplete) tail.
// Tolerates CRLF line endings.
export function parseSSEFrames(buffer) {
  const parts = buffer.replace(/\r\n/g, '\n').split('\n\n')
  const rest = parts.pop() ?? ''
  const frames = parts.map((block) => {
    let event = 'message'
    const dataLines = []
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim()
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''))
    }
    return { event, data: dataLines.join('\n') }
  })
  return { frames, rest }
}

export async function streamVibeDescription(params, onDelta = () => {}) {
  let acc = ''
  try {
    const res = await fetch('/api/vibe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!res.ok || !res.body) throw new Error(`vibe http ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const { frames, rest } = parseSSEFrames(buffer)
      buffer = rest
      for (const frame of frames) {
        if (frame.event === 'done' || !frame.data) continue
        try {
          const obj = JSON.parse(frame.data)
          if (obj.text) {
            acc += obj.text
            onDelta(acc)
          }
        } catch {
          /* ignore malformed frame */
        }
      }
    }
    return acc.trim() || localFallback(params)
  } catch {
    // Backend unreachable — still give the host something usable.
    const fb = localFallback(params)
    onDelta(fb)
    return fb
  }
}
