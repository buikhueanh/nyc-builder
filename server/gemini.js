// Gemini streaming helper. Kept free of Express so it is unit-testable.

const FLAGS = {
  Argentina: '🇦🇷', Brazil: '🇧🇷', France: '🇫🇷', Germany: '🇩🇪', England: '🏴',
  Spain: '🇪🇸', Mexico: '🇲🇽', USA: '🇺🇸', Morocco: '🇲🇦', Senegal: '🇸🇳',
  'South Korea': '🇰🇷', Japan: '🇯🇵', Portugal: '🇵🇹', Netherlands: '🇳🇱', Colombia: '🇨🇴',
}

export function buildPrompt({ culturalTheme, teamCheering, hostType }) {
  return `You are writing a punchy, warm, culturally specific 1-sentence vibe description for a World Cup watch party listing.

Host type: ${hostType}
Team cheering for: ${teamCheering}
Cultural theme (host's own words): "${culturalTheme}"

Write ONE sentence only. Max 20 words. Include 1-2 relevant flag or food emojis.
Make it feel alive and specific — not generic. Capture the culture and the energy.
No quotes around the output. Just the sentence.

Examples of good output:
"🇵🇰 Karachi energy meets Buenos Aires passion — bring your appetite and your voice"
"🇻🇳 Hanoian family vibes, three generations deep, very superstitious about changing seats"
"🇧🇷 Samba on the speakers, caipirinhas on the table, tears of joy guaranteed"`
}

// Deterministic offline fallback so the demo never breaks without a key.
export function fallbackVibe({ culturalTheme, teamCheering }) {
  const flag = FLAGS[teamCheering] || '🌍'
  const theme = (culturalTheme || '').trim().replace(/\.+$/, '')
  if (!theme) return `${flag} ${teamCheering || 'Football'} pride, NYC style — come find your people ⚽`
  return `${flag} ${theme} — ${teamCheering || 'football'} pride, NYC style ⚽`
}

// Parse a buffer of SSE text into complete frames + the leftover tail.
// Tolerates CRLF line endings (Gemini separates frames with \r\n\r\n).
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

function extractText(geminiChunk) {
  try {
    const obj = JSON.parse(geminiChunk)
    return obj?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
  } catch {
    return ''
  }
}

/**
 * Stream a vibe sentence from Gemini, invoking onDelta(textChunk) per token group.
 * Returns the full concatenated text. Throws on missing key / HTTP error so the
 * caller (Express route) can fall back.
 */
export async function streamGemini({ params, apiKey, model, onDelta = () => {}, fetchImpl = fetch }) {
  if (!apiKey) throw new Error('missing GEMINI_API_KEY')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: buildPrompt(params) }] }],
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 1.0,
        thinkingConfig: { thinkingBudget: 0 }, // keep the tiny output fast, no thinking tokens
      },
    }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`gemini http ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const { frames, rest } = parseSSEFrames(buffer)
    buffer = rest
    for (const frame of frames) {
      if (!frame.data || frame.data === '[DONE]') continue
      const text = extractText(frame.data)
      if (text) {
        full += text
        onDelta(text)
      }
    }
  }
  return full
}
