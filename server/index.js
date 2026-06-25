import express from 'express'
import { streamGemini, fallbackVibe } from './gemini.js'

// Load .env (Node >= 20.6). Safe no-op if the file is absent.
try {
  process.loadEnvFile()
} catch {
  /* no .env file — fallback path still works */
}

const PORT = process.env.PORT || 8787
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const API_KEY = process.env.GEMINI_API_KEY || ''

const app = express()
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: MODEL, hasKey: Boolean(API_KEY) })
})

app.post('/api/vibe', async (req, res) => {
  const { culturalTheme = '', teamCheering = '', hostType = '' } = req.body || {}
  const params = { culturalTheme, teamCheering, hostType }

  // Server-Sent Events headers.
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders?.()

  const sendText = (text) => res.write(`data: ${JSON.stringify({ text })}\n\n`)
  const done = () => {
    res.write('event: done\ndata: {}\n\n')
    res.end()
  }

  try {
    await streamGemini({
      params,
      apiKey: API_KEY,
      model: MODEL,
      onDelta: (chunk) => sendText(chunk),
    })
    done()
  } catch (err) {
    // Never 500 the client mid-stream — emit a graceful fallback instead.
    console.error('[vibe] falling back:', err.message)
    sendText(fallbackVibe(params))
    done()
  }
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (model: ${MODEL}, key: ${API_KEY ? 'set' : 'missing'})`)
})
