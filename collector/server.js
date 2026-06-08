// Neognathae maze-data collector
// ---------------------------------
// A tiny, zero-dependency Node server that receives CONSENTED maze gameplay
// runs from the browser and appends them to a JSONL file you can use for
// training. No framework, no database: run it with `node collector/server.js`
// (or `npm run collector`) and point the site at it with VITE_MAZE_COLLECTOR.
//
// The browser only ever POSTs a run after the player pressed "Agree" on the
// in-game data notice, and the payload carries no name, email, or anything
// that identifies a person - only the maze layout, the moves, and the timing.
// This server additionally validates every field, caps sizes, rate-limits per
// IP, gates the read endpoints behind a token, and never stores the client IP.
//
// Env:
//   PORT             default 8787
//   DATA_FILE        default ./collector/data/maze-runs.jsonl
//   CORS_ORIGIN      default '*'   (set to your site origin in production)
//   COLLECTOR_TOKEN  required to read /runs and /stats (set a strong value)
//   MAX_BODY_BYTES   default 65536
//   RATE_MAX         default 240   (requests per IP per minute)

import { createServer } from 'node:http'
import { appendFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { timingSafeEqual } from 'node:crypto'

const PORT = Number(process.env.PORT) || 8787
const DATA_FILE = resolve(process.env.DATA_FILE || 'collector/data/maze-runs.jsonl')
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const TOKEN = process.env.COLLECTOR_TOKEN || ''
const MAX_BODY = Number(process.env.MAX_BODY_BYTES) || 65536
const RATE_MAX = Number(process.env.RATE_MAX) || 240
const RATE_WIN = 60_000

const MAX_FILE = Number(process.env.MAX_FILE_BYTES) || 500 * 1024 * 1024 // disk-exhaustion guard

// count existing rows + bytes once so /health is cheap and growth can be capped
let count = 0
let bytes = 0
if (existsSync(DATA_FILE)) {
  try {
    const existing = readFileSync(DATA_FILE, 'utf8')
    count = existing.split('\n').filter(Boolean).length
    bytes = Buffer.byteLength(existing)
  } catch { /* ignore */ }
}

// fixed-window per-IP rate limit
const rl = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const e = rl.get(ip)
  if (!e || now > e.resetAt) { rl.set(ip, { n: 1, resetAt: now + RATE_WIN }); return false }
  e.n++
  return e.n > RATE_MAX
}
setInterval(() => { const now = Date.now(); for (const [k, e] of rl) if (now > e.resetAt) rl.delete(k) }, RATE_WIN).unref()

const isInt = (v, lo, hi) => typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi

// Validate + sanitize an incoming run. Returns a clean object or null.
// Untrusted input: enforce types, ranges, and hard caps; drop unknown fields.
function cleanRun(o) {
  if (!o || typeof o !== 'object') return null
  if (!isInt(o.level, 1, 100000)) return null
  if (!isInt(o.size, 2, 64)) return null
  if (!isInt(o.moves, 0, 200000)) return null
  if (!isInt(o.bumps, 0, 2000000)) return null
  if (!isInt(o.ms, 0, 86400000)) return null
  if (!isInt(o.startedAt, 0, 4102444800000)) return null // <= year 2100
  if (typeof o.path !== 'string' || o.path.length > 200000 || !/^[nsew]*$/.test(o.path)) return null
  if (typeof o.maze !== 'string' || o.maze.length !== o.size * o.size || !/^[0-9a-f]*$/.test(o.maze)) return null
  if (!Array.isArray(o.dts) || o.dts.length > 200000) return null
  for (const d of o.dts) if (typeof d !== 'number' || !Number.isFinite(d) || d < 0 || d > 36000000) return null
  let sid = ''
  if (o.sid != null) {
    if (typeof o.sid !== 'string' || o.sid.length > 64 || !/^[A-Za-z0-9_-]+$/.test(o.sid)) return null
    sid = o.sid
  }
  return { level: o.level, size: o.size, moves: o.moves, bumps: o.bumps, ms: o.ms, startedAt: o.startedAt, path: o.path, dts: o.dts, maze: o.maze, sid }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}
const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'Content-Type': type })
  res.end(body == null ? '' : typeof body === 'string' ? body : JSON.stringify(body))
}
const authed = (req) => {
  if (!TOKEN) return false
  const a = Buffer.from(req.headers.authorization || '')
  const b = Buffer.from(`Bearer ${TOKEN}`)
  return a.length === b.length && timingSafeEqual(a, b) // constant-time compare
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    let aborted = false
    const chunks = []
    req.on('data', (c) => {
      if (aborted) return
      size += c.length
      if (size > MAX_BODY) { aborted = true; reject(Object.assign(new Error('too large'), { code: 413 })); return }
      chunks.push(c)
    })
    req.on('end', () => { if (!aborted) resolve(Buffer.concat(chunks).toString('utf8')) })
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  cors(res)
  const ip = req.socket.remoteAddress || 'unknown'
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname

  if (req.method === 'OPTIONS') return send(res, 204, null)
  if (rateLimited(ip)) return send(res, 429, { error: 'rate_limited' })

  if (req.method === 'POST' && path === '/collect') {
    let raw
    try {
      raw = await readBody(req)
    } catch (e) {
      const code = e && e.code === 413 ? 413 : 400
      send(res, code, { error: code === 413 ? 'too_large' : 'bad_body' })
      req.destroy() // discard any remaining inbound body after responding
      return
    }
    let parsed
    try { parsed = JSON.parse(raw) } catch { return send(res, 400, { error: 'bad_json' }) }
    const run = cleanRun(parsed)
    if (!run) return send(res, 400, { error: 'invalid_run' })
    if (bytes >= MAX_FILE) return send(res, 507, { error: 'storage_full' })
    try {
      await mkdir(dirname(DATA_FILE), { recursive: true })
      const line = JSON.stringify({ ...run, serverTs: Date.now() }) + '\n'
      await appendFile(DATA_FILE, line)
      count++
      bytes += Buffer.byteLength(line)
    } catch { return send(res, 500, { error: 'store_failed' }) }
    return send(res, 204, null) // fast, body-less ack (good for sendBeacon)
  }

  if (req.method === 'GET' && path === '/health') return send(res, 200, { ok: true, count })

  if (req.method === 'GET' && (path === '/runs' || path === '/stats')) {
    if (!authed(req)) return send(res, 401, { error: 'unauthorized' })
    if (path === '/stats') return send(res, 200, { count })
    let data = ''
    try { data = existsSync(DATA_FILE) ? await readFile(DATA_FILE, 'utf8') : '' } catch { return send(res, 500, { error: 'read_failed' }) }
    return send(res, 200, data, 'application/x-ndjson')
  }

  return send(res, 404, { error: 'not_found' })
})

// connection-level hardening (defense in depth; also run it behind a proxy/CDN)
server.headersTimeout = 10_000
server.requestTimeout = 15_000
server.maxConnections = 1024

server.listen(PORT, () => {
  console.log(`maze collector listening on :${PORT}  (data -> ${DATA_FILE}, ${count} rows)`)
  if (!TOKEN) console.warn('  WARNING: COLLECTOR_TOKEN is unset; /runs and /stats are disabled until you set one.')
  if (CORS_ORIGIN === '*') console.warn('  WARNING: CORS_ORIGIN is "*"; set it to your site origin in production.')
})
