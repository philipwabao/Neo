// Gameplay telemetry for the Maze - records how people solve mazes so the data
// can be used to study behaviour and improve models.
//
// PRIVACY: this is strictly opt-in. Nothing is recorded or sent unless the
// player pressed AGREE on the maze's in-game data notice (stored as
// `neo-maze-consent` = 'agreed'). No names, no message content, nothing that
// identifies a person: only the maze layout, the moves, the timing, and wrong
// turns. Detailed runs stay in the browser (capped); an aggregate summary goes
// to analytics when gtag is present (and is itself gated by Consent Mode).
// Disclosed in the Privacy app.

const KEY = 'neo-maze-runs'
const MAX_RUNS = 40 // cap stored runs so localStorage stays bounded

// Optional collector endpoint. When set (via VITE_MAZE_COLLECTOR at build time),
// consented runs are POSTed there for centralized training data; when unset,
// runs stay in the browser only.
const COLLECTOR = (import.meta.env.VITE_MAZE_COLLECTOR || '').trim()

// Ephemeral, random session id - lets runs be grouped within one visit without
// identifying anyone. Regenerated every page load; never persisted.
const SID = (() => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch { /* ignore */ }
  return 'sid-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
})()

type Gtag = (...args: unknown[]) => void

export type MazeRun = {
  level: number
  size: number
  moves: number
  bumps: number // attempted moves into a wall
  ms: number // time to solve
  path: string // sequence of move directions, e.g. "nnesws"
  dts: number[] // ms between successive moves (pacing / hesitation)
  maze: string // hex-encoded wall layout, size*size chars
  startedAt: number
}

function mazeConsentAgreed(): boolean {
  try {
    return localStorage.getItem('neo-maze-consent') === 'agreed'
  } catch {
    return false
  }
}

export function recordMazeRun(run: MazeRun): void {
  if (!mazeConsentAgreed()) return
  try {
    const arr: MazeRun[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    arr.push(run)
    while (arr.length > MAX_RUNS) arr.shift()
    localStorage.setItem(KEY, JSON.stringify(arr))
  } catch {
    /* storage unavailable / over quota - drop silently */
  }
  const w = window as unknown as { gtag?: Gtag }
  if (typeof w.gtag === 'function') {
    w.gtag('event', 'maze_solve', {
      level: run.level,
      size: run.size,
      moves: run.moves,
      bumps: run.bumps,
      seconds: Math.round(run.ms / 1000),
    })
  }

  // ship the full run to the collector, if one is configured
  if (COLLECTOR) {
    const body = JSON.stringify({ ...run, sid: SID })
    try {
      // text/plain keeps this a CORS "simple request" (no preflight), so runs
      // still reach the collector even if CORS_ORIGIN is misconfigured. The
      // server JSON.parses the body regardless of content type.
      // sendBeacon survives page unload and is non-blocking; fall back to fetch.
      if (navigator.sendBeacon && navigator.sendBeacon(COLLECTOR, new Blob([body], { type: 'text/plain' }))) return
      void fetch(COLLECTOR, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true, mode: 'cors' }).catch(() => {})
    } catch { /* never let telemetry break the game */ }
  }
}

// Owner helper: read the locally collected dataset (e.g. to inspect or export).
export function getMazeRuns(): MazeRun[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

// Expose a console reader for the site owner: `neoMazeData()`.
if (typeof window !== 'undefined') {
  ;(window as unknown as { neoMazeData?: () => MazeRun[] }).neoMazeData = getMazeRuns
}
