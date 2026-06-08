// Cabinet Wake (Assembly) boot splash. The FlockMark assembles shard by
// shard on the warm paper ground, a registration baseline draws, the
// wordmark rises, then the panel lifts to reveal the desktop. Motion lives
// in src/index.css (.bsplash / .bs-* classes). Skippable, once per session,
// reduced-motion aware.
import { useEffect, useRef, useState } from 'react'

const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function BootSplash({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false)
  const doneRef = useRef(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }

  useEffect(() => {
    const holdMs = REDUCED ? 250 : 1700
    const t = window.setTimeout(() => setExiting(true), holdMs)
    const onKey = () => setExiting(true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div
      role="presentation"
      className={'bsplash' + (exiting ? ' is-exiting' : '')}
      onClick={() => setExiting(true)}
      onAnimationEnd={(e) => { if (e.animationName === 'bs-exit') finish() }}
    >
      <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
        <g className="bs-base"><path d="M8 42 L16 42 L16 34 Z" /></g>
        <g className="bs-mid"><path d="M20 34 L40 24 L37.5 31 L18 40 Z" /></g>
        <g className="bs-lead"><path d="M42 3.5 L43.5 19 L17.5 31.5 Z" fill="#E8743A" /></g>
        <line className="bs-line" x1="8" y1="46" x2="40" y2="46" stroke="#1A1815" strokeWidth="1.2" strokeLinecap="round" pathLength={1} />
      </svg>
      <span className="bs-word">Neognathae</span>
    </div>
  )
}
