import { useReducer, useRef, useEffect, useState, useCallback } from 'react'
import type { PointerEvent as ReactPointerEvent, TransitionEvent as ReactTransitionEvent, ReactNode } from 'react'
import { APPS, KESTREL_TABS, type AppDef } from './apps'
import { FlockMark } from '../components/Hero'
import { OSContext } from './osctx'
import { BootSplash } from './BootSplash'
import { ConsentBanner } from './ConsentBanner'

/* ── window-manager state ── */
type Rect = { x: number; y: number; w: number; h: number }
type Win = { id: string; x: number; y: number; w: number; h: number; z: number; open: boolean; minimized: boolean; zoomed: boolean; prev: Rect | null }
type State = { wins: Record<string, Win>; topZ: number; focused: string | null }
type Action =
  | { t: 'open'; id: string }
  | { t: 'close'; id: string }
  | { t: 'min'; id: string }
  | { t: 'focus'; id: string }
  | { t: 'move'; id: string; x: number; y: number }
  | { t: 'size'; id: string; w: number; h: number }
  | { t: 'zoom'; id: string }

const MIN_W = 360
const MIN_H = 240

function maxRect(): Rect {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const m = 22, top = 60
  return { x: m, y: top, w: vw - m * 2, h: vh - top - m }
}

function routeId(): string {
  if (typeof window === 'undefined') return ''
  return window.location.pathname.replace(/^\/+/, '').toLowerCase()
}
function titleFor(_id: string | null): string {
  return 'Neognathae'
}

function makeInit(): State {
  const wins: Record<string, Win> = {}
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  APPS.forEach((a, i) => {
    const cx = Math.max(56, Math.round((vw - a.w) / 2))
    wins[a.id] = { id: a.id, x: cx + i * 44, y: a.y + i * 44, w: a.w, h: a.h, z: 0, open: false, minimized: false, zoomed: false, prev: null }
  })
  const route = routeId()
  const routeMobileBlocked = route === 'terminal' && vw < 768
  if (wins[route] && !routeMobileBlocked) {
    wins[route] = { ...wins[route], open: true, z: 1 }
    return { wins, topZ: 1, focused: route }
  }
  return { wins, topZ: 1, focused: null }
}

function reducer(s: State, a: Action): State {
  const w = s.wins[a.id]
  switch (a.t) {
    case 'open': {
      const z = s.topZ + 1
      return { ...s, topZ: z, focused: a.id, wins: { ...s.wins, [a.id]: { ...w, open: true, minimized: false, z } } }
    }
    case 'close':
      return { ...s, focused: s.focused === a.id ? null : s.focused, wins: { ...s.wins, [a.id]: { ...w, open: false, zoomed: false, prev: null } } }
    case 'min':
      return { ...s, focused: s.focused === a.id ? null : s.focused, wins: { ...s.wins, [a.id]: { ...w, minimized: true } } }
    case 'focus': {
      if (s.focused === a.id && w.z === s.topZ) return s
      const z = s.topZ + 1
      return { ...s, topZ: z, focused: a.id, wins: { ...s.wins, [a.id]: { ...w, z } } }
    }
    case 'move':
      return { ...s, wins: { ...s.wins, [a.id]: { ...w, x: a.x, y: a.y, zoomed: false, prev: null } } }
    case 'size':
      return { ...s, wins: { ...s.wins, [a.id]: { ...w, w: a.w, h: a.h, zoomed: false, prev: null } } }
    case 'zoom': {
      if (w.zoomed && w.prev) return { ...s, wins: { ...s.wins, [a.id]: { ...w, ...w.prev, zoomed: false, prev: null } } }
      const m = maxRect()
      return { ...s, wins: { ...s.wins, [a.id]: { ...w, prev: { x: w.x, y: w.y, w: w.w, h: w.h }, x: m.x, y: m.y, w: m.w, h: m.h, zoomed: true } } }
    }
    default:
      return s
  }
}

/* two transitions, composed from the :root motion tokens (index.css). The press
   curve is the clean default (close / minimize / zoom / restore); the open curve
   gives the transform a settle-spring so a plate lands with a little overshoot.
   The spring is on transform ONLY - width/height stay press so app bodies never
   reflow/jiggle. Pointer drags switch transitions off live (rAF path). */
const TRANSITION =
  'transform var(--dur-glide) var(--ease-press), width 360ms var(--ease-press), height 360ms var(--ease-press), opacity 220ms ease, box-shadow var(--dur-glide) var(--ease-press)'
const TRANSITION_OPEN =
  'transform var(--dur-glide) var(--ease-settle), width 360ms var(--ease-press), height 360ms var(--ease-press), opacity 220ms ease, box-shadow var(--dur-glide) var(--ease-press)'

const DownChevron = (
  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none"><path d="M3.5 5 L6 7.5 L8.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const Expand = (
  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none"><path d="M6.6 2.4 H9.6 V5.4 M9.6 2.4 L6.1 5.9 M5.4 9.6 H2.4 V6.6 M2.4 9.6 L5.9 6.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const Cross = (
  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none"><path d="M3.5 3.5 L8.5 8.5 M8.5 3.5 L3.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
)

/* the accession chip - one stamped code (app.code) reused in the window
   running-head, the header cabinet index, the palette rows, and the mobile
   sheet, so the whole OS coheres around a real data field. `dark` for the
   ink header bar; the light variant for paper surfaces. */
function EtchedChip({ code, dark = false }: { code: string; dark?: boolean }) {
  return (
    <span
      className={
        'field-label shrink-0 inline-flex items-center rounded-[4px] px-1.5 py-0.5 tracking-[0.14em] ' +
        (dark ? 'text-[#C8C1B4]' : 'text-[#6B6760]')
      }
      style={{
        fontSize: '0.55rem',
        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(230,225,214,0.6)',
        border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid #DDD7CA',
        boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.7)',
      }}
    >
      {code}
    </span>
  )
}

type IconMap = { current: Record<string, { x: number; y: number }> }

/* ── one plate (window) ── */
function PlateWindow({ app, win, focused, dispatch, iconPos }: { app: AppDef; win: Win; focused: boolean; dispatch: (a: Action) => void; iconPos: IconMap }) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ ox: number; oy: number; x: number; y: number } | null>(null)
  const rez = useRef<{ sx: number; sy: number; sw: number; sh: number; dir: 's' | 'se'; w: number; h: number } | null>(null)
  const raf = useRef(0)

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    dispatch({ t: 'focus', id: app.id })
    drag.current = { ox: e.clientX - win.x, oy: e.clientY - win.y, x: win.x, y: win.y }
    if (ref.current) ref.current.style.willChange = 'transform'
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    d.x = Math.max(120 - win.w, Math.min(window.innerWidth - 120, e.clientX - d.ox))
    d.y = Math.max(50, Math.min(window.innerHeight - 64, e.clientY - d.oy))
    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        raf.current = 0
        if (ref.current && drag.current) {
          ref.current.style.transition = 'none'
          ref.current.style.transform = `translate3d(${drag.current.x}px,${drag.current.y}px,0) scale(1)`
        }
      })
    }
  }
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = 0 }
    if (ref.current) ref.current.style.willChange = ''
    drag.current = null
    dispatch({ t: 'move', id: app.id, x: d.x, y: d.y })
  }

  const onRezDown = (dir: 's' | 'se') => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    dispatch({ t: 'focus', id: app.id })
    rez.current = { sx: e.clientX, sy: e.clientY, sw: win.w, sh: win.h, dir, w: win.w, h: win.h }
    if (ref.current) ref.current.style.willChange = 'width, height'
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onRezMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = rez.current
    if (!r) return
    if (r.dir === 'se') r.w = Math.max(MIN_W, Math.min(window.innerWidth - 40, r.sw + e.clientX - r.sx))
    r.h = Math.max(MIN_H, Math.min(window.innerHeight - 70, r.sh + e.clientY - r.sy))
    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        raf.current = 0
        if (ref.current && rez.current) {
          ref.current.style.transition = 'none'
          ref.current.style.width = rez.current.w + 'px'
          ref.current.style.height = rez.current.h + 'px'
        }
      })
    }
  }
  const onRezUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = rez.current
    if (!r) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = 0 }
    if (ref.current) ref.current.style.willChange = ''
    rez.current = null
    dispatch({ t: 'size', id: app.id, w: r.w, h: r.h })
  }

  const ctl = (label: string, onClick: () => void, glyph: ReactNode, accent: boolean) => (
    <button
      aria-label={label}
      onClick={onClick}
      className={
        'w-5 h-5 flex items-center justify-center rounded-[3px] transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-90 ' +
        (focused ? 'text-[#807A70] ' : 'text-[#CCC6BA] ') +
        (accent ? 'hover:text-[#B8541F] hover:bg-[#F4E3DA]' : 'hover:text-[#1A1815] hover:bg-[#E6E1D6]/70')
      }
    >
      {glyph}
    </button>
  )

  const visible = win.open && !win.minimized
  const target = iconPos.current[app.id] ?? { x: 48, y: 92 }
  const handle = 'absolute z-20 touch-none'

  // detect the open transition (hidden -> visible) so it lands with the
  // settle-spring and flicks the edition-frame ticks rust on arrival.
  const prevVisible = useRef(visible)
  const justOpened = useRef(false)
  const isOpening = visible && !prevVisible.current
  useEffect(() => {
    if (isOpening) justOpened.current = true
    else if (!visible) justOpened.current = false
    prevVisible.current = visible
  }, [visible])

  const onTransitionEnd = (e: ReactTransitionEvent<HTMLDivElement>) => {
    // only the plate's own transform landing, and only when it was opening,
    // so drag-snap / zoom / restore / minimize never flick the ticks.
    if (e.target === e.currentTarget && e.propertyName === 'transform' && justOpened.current) {
      justOpened.current = false
      window.dispatchEvent(new CustomEvent('neo-plate-landed'))
    }
  }

  return (
    <div
      ref={ref}
      role={visible ? 'dialog' : undefined}
      aria-label={visible ? app.title : undefined}
      inert={!visible}
      onPointerDown={() => dispatch({ t: 'focus', id: app.id })}
      onTransitionEnd={onTransitionEnd}
      className="absolute top-0 left-0 flex flex-col rounded-[5px] bg-white border border-[#E6E1D6] overflow-hidden"
      style={{
        width: win.w,
        height: win.h,
        zIndex: win.z,
        // pivot the scale at the icon's centroid (relative to the window's
        // top-left) so the plate homes into / out of its own tile.
        transformOrigin: `${target.x - win.x}px ${target.y - win.y}px`,
        transform: `translate3d(${win.x}px,${win.y}px,0) scale(${visible ? 1 : 0.04})`,
        opacity: visible ? (focused ? 1 : 0.985) : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: isOpening ? TRANSITION_OPEN : TRANSITION,
        boxShadow: focused ? 'var(--elev-5)' : 'var(--elev-2)',
      }}
    >
      {/* printed running head: title (struck in when focused) | accession | folio */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onDoubleClick={(e) => { if (!(e.target as HTMLElement).closest('button')) dispatch({ t: 'zoom', id: app.id }) }}
        className="relative h-[34px] shrink-0 flex items-center gap-2.5 px-3 bg-[#EFEBE2] border-b border-[#E6E1D6]"
        style={{ touchAction: 'none', cursor: 'default', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative shrink min-w-0">
            <span className={'block truncate font-sans text-[13px] font-medium tracking-tight ' + (focused ? 'text-[#1A1815] deboss' : 'text-[#6B6760]')}>{app.title}</span>
            <span aria-hidden className="absolute left-0 -bottom-[3px] h-[1.5px] rounded-full bg-[#B8541F]" style={{ width: focused ? 18 : 0, transition: 'width var(--dur-glide) var(--ease-press)' }} />
          </span>
          <span aria-hidden className="h-3.5 w-px bg-[#DDD7CA] shrink-0" />
          <EtchedChip code={app.code} />
        </div>
        <span className="flex-1 min-w-0" />
        {ctl('Minimize', () => dispatch({ t: 'min', id: app.id }), DownChevron, false)}
        {ctl(win.zoomed ? 'Restore size' : 'Zoom', () => dispatch({ t: 'zoom', id: app.id }), Expand, false)}
        {ctl('Close', () => dispatch({ t: 'close', id: app.id }), Cross, true)}
      </div>

      {/* content */}
      <div className="flex-1 min-h-0 overflow-hidden select-text">
        <app.Body active={visible} />
      </div>

      {/* resize handles */}
      <div onPointerDown={onRezDown('s')} onPointerMove={onRezMove} onPointerUp={onRezUp} className={handle + ' left-3 right-4 bottom-0 h-1.5 cursor-ns-resize'} />
      <div onPointerDown={onRezDown('se')} onPointerMove={onRezMove} onPointerUp={onRezUp} className={handle + ' bottom-0 right-0 w-4 h-4 cursor-nwse-resize'}>
        <span aria-hidden className="absolute bottom-[3px] right-[3px] w-2 h-2 border-r border-b border-[#CCC6BA]" />
      </div>
    </div>
  )
}

/* ── desktop (wallpaper + overlays) ── */
function Desktop() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-clouds.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 56%',
          filter: 'saturate(0.92) brightness(1.0) contrast(1.02) sepia(0.08)',
        }}
      />
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(130% 120% at 50% 24%, rgba(0,0,0,0) 52%, rgba(26,24,21,0.24) 100%)' }} />
      {/* one lamp: a warm key-light bloom upper-left + deepened occlusion lower-right,
          so the desktop reads as a lit bench and the elevation shadows look sourced */}
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(58% 48% at 20% 12%, rgba(245,242,235,0.18) 0%, rgba(245,242,235,0) 62%)' }} />
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(120% 120% at 90% 94%, rgba(26,24,21,0) 56%, rgba(26,24,21,0.16) 100%)' }} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />
    </div>
  )
}

function fmtClock(d: Date) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const mos = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${days[d.getDay()]} ${d.getDate()} ${mos[d.getMonth()]} · ${hh}:${mm}`
}

/* ── the printed edition header ── */
function Header({ openApp, onPalette, focusedCode }: { openApp: (id: string) => void; onPalette: () => void; focusedCode: string | null }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="fixed top-0 inset-x-0 z-[1000] h-12 flex items-center px-5 bg-[#1A1815] border-b border-[#2A2723]">
      <button onClick={() => openApp('kestrel')} className="inline-flex items-center gap-2 group">
        <FlockMark className="w-[18px] h-[18px] text-[#F5F2EB] transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]" leadStroke="#E8743A" />
        <span className="font-sans text-[15px] font-semibold tracking-[-0.01em] text-[#F5F2EB]">Neognathae</span>
      </button>
      {/* live cabinet index: the accession of the focused plate */}
      {focusedCode && <span className="hidden md:inline-flex ml-3"><EtchedChip code={focusedCode} dark /></span>}
      <span className="absolute left-1/2 -translate-x-1/2 font-mono font-bold text-[10px] uppercase tracking-[0.26em] text-[#F5F2EB] hidden md:inline">
        2026
      </span>
      <div className="ml-auto flex items-center gap-3.5">
        <button onClick={onPalette} aria-label="Open command palette" title="Command palette (⌘K)" className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[#3A352F] px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#CFC8BB] hover:text-[#F5F2EB] hover:border-[#4A453F] active:scale-95 transition-[color,border-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"><span aria-hidden className="text-[#807A70]">⌘</span>K</button>
        <span className="font-mono font-bold text-[11px] uppercase tracking-[0.14em] text-[#F5F2EB] tabular-nums">{fmtClock(now)}</span>
      </div>
    </div>
  )
}

/* ── edition border + corner ticks (the plate frame) ── */
function PlateFrame() {
  // the four corner ticks flick rust for one --dur-tap on a plate landing or
  // a palette opening - one shared registration "click" for the whole OS.
  const [flash, setFlash] = useState(0)
  useEffect(() => {
    const onLand = () => setFlash((n) => n + 1)
    window.addEventListener('neo-plate-landed', onLand)
    window.addEventListener('neo-palette-landed', onLand)
    return () => {
      window.removeEventListener('neo-plate-landed', onLand)
      window.removeEventListener('neo-palette-landed', onLand)
    }
  }, [])
  // ticks borrow currentColor; animating the group's color flicks all four.
  const tick = (pos: string) => <span aria-hidden className={'absolute w-3 h-3 ' + pos} style={{ borderColor: 'currentColor' }} />
  return (
    <div aria-hidden className="fixed inset-2.5 z-[1100] pointer-events-none rounded-[5px] border border-[#1A1815]/[0.12]">
      <div
        key={flash}
        className="absolute inset-0"
        style={{ color: 'var(--tick)', animation: flash ? 'tick-flash var(--dur-tap) var(--ease-press)' : undefined }}
      >
        {tick('left-1.5 top-1.5 border-l border-t')}
        {tick('right-1.5 top-1.5 border-r border-t')}
        {tick('left-1.5 bottom-1.5 border-l border-b')}
        {tick('right-1.5 bottom-1.5 border-r border-b')}
      </div>
    </div>
  )
}

/* ── command palette (⌘K) ── */
function Palette({ openApp, close }: { openApp: (id: string) => void; close: () => void }) {
  const [q, setQ] = useState('')
  useEffect(() => { window.dispatchEvent(new CustomEvent('neo-palette-landed')) }, [])
  const appActions = APPS.map((a) => ({
    key: 'app:' + a.id,
    label: a.title,
    hint: 'app',
    code: a.code as string | null,
    run: () => openApp(a.id),
  }))
  const tabActions = KESTREL_TABS.map((t) => ({
    key: 'tab:' + t,
    label: t,
    hint: 'Kestrel',
    code: null as string | null,
    run: () => { openApp('kestrel'); window.dispatchEvent(new CustomEvent('neo-tab', { detail: t })) },
  }))
  const actions = [...appActions, ...tabActions]
  const filtered = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()))
  const fire = (a: (typeof actions)[number]) => { a.run(); close() }
  return (
    <div className="fixed inset-0 z-[1200] flex items-start justify-center pt-[16vh] px-4" onClick={close}>
      <div className="absolute inset-0 bg-[#1A1815]/25 backdrop-blur-[2px]" style={{ animation: 'page-load var(--dur-tap) ease' }} />
      <div
        className="relative w-full max-w-md rounded-xl bg-[#F5F2EB]/95 backdrop-blur-md border border-[#E6E1D6] overflow-hidden"
        style={{ boxShadow: 'var(--elev-5)', animation: 'palette-rise var(--dur-glide) var(--ease-settle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && filtered[0]) fire(filtered[0]) }}
          placeholder="Go to…"
          className="w-full px-4 py-3.5 bg-transparent outline-none text-[15px] text-[#1A1815] placeholder:text-[#928C82] border-b border-[#E6E1D6]"
          aria-label="Command palette"
        />
        <div className="neo-scroll max-h-72 overflow-auto py-1.5">
          {filtered.map((a, i) => (
            <button key={a.key} onClick={() => fire(a)} style={{ animationDelay: (i < 8 ? i * 22 : 0) + 'ms' }} className="tab-fade w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[#E6E1D6]/55 transition-colors">
              {a.code ? <EtchedChip code={a.code} /> : <span className="field-label text-[#B8541F] w-3 shrink-0 text-center">§</span>}
              <span className="flex-1 text-[14px] text-[#1A1815]">{a.label}</span>
              <span className="field-label">{a.hint}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-4 py-3 text-sm text-[#928C82]">No matches.</p>}
        </div>
      </div>
    </div>
  )
}

/* ── desktop app icons (press to open, drag to move) ── */
const KestrelTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-white/30 flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ backgroundImage: 'url(/kestrel-plate.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.25)' }}
  >
    <span className="font-sans font-semibold text-[#F8F5EF] text-[1.5rem] leading-none" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>K</span>
  </span>
)
const TerminalTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-white/15 flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ background: 'linear-gradient(160deg, #211E1A 0%, #14110E 100%)', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
  >
    <span className="font-mono text-[1.1rem] leading-none text-[#E8743A]">›<span className="text-[#F5F2EB]">_</span></span>
  </span>
)
const CatalogueTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-[#E6E1D6] flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ background: 'linear-gradient(160deg, #FBF9F4 0%, #ECE7DC 100%)', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.7)' }}
  >
    <FlockMark className="w-7 h-7 text-[#1A1815]" leadStroke="#B8541F" />
  </span>
)

const ContactTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-[#E6E1D6] flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ background: 'linear-gradient(160deg, #FBF9F4 0%, #ECE7DC 100%)', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.7)' }}
  >
    <span className="font-sans text-[1.65rem] leading-none text-[#B8541F]">@</span>
  </span>
)
const AuxertaTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-white/10 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ backgroundColor: '#080A11', backgroundImage: 'url(/icon.svg)', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
  />
)
const PrivacyTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-white/10 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ backgroundImage: 'url(/privacy-bittern.jpg)', backgroundSize: '152%', backgroundPosition: 'center 40%', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.12)' }}
  />
)
const TermsTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-[#E6E1D6] flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ background: 'linear-gradient(160deg, #FBF9F4 0%, #ECE7DC 100%)', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.7)' }}
  >
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" aria-hidden>
      <rect x="5.5" y="3.5" width="13" height="17" rx="2.5" stroke="#1A1815" strokeWidth="1.6" />
      <line x1="8.5" y1="9" x2="15.5" y2="9" stroke="#1A1815" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8.5" y1="12.5" x2="15.5" y2="12.5" stroke="#1A1815" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8.5" y1="16" x2="12.5" y2="16" stroke="#1A1815" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
)
const NewsTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-[#E6E1D6] flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ background: 'linear-gradient(160deg, #FBF9F4 0%, #ECE7DC 100%)', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.7)' }}
  >
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" aria-hidden>
      <rect x="4" y="5.5" width="16" height="13" rx="2" stroke="#1A1815" strokeWidth="1.6" />
      <rect x="6.5" y="8" width="5.5" height="4" rx="0.8" fill="#B8541F" />
      <line x1="13.5" y1="8.8" x2="17.5" y2="8.8" stroke="#1A1815" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="13.5" y1="11.2" x2="17.5" y2="11.2" stroke="#1A1815" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="6.5" y1="14.6" x2="17.5" y2="14.6" stroke="#1A1815" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="6.5" y1="16.4" x2="14" y2="16.4" stroke="#1A1815" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  </span>
)

const MazeTile = (
  <span
    className="relative w-14 h-14 rounded-[16px] overflow-hidden border border-[#E6E1D6] flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:scale-[0.96]"
    style={{ background: 'linear-gradient(160deg, #FBF9F4 0%, #ECE7DC 100%)', boxShadow: 'var(--elev-3), inset 0 1px 0 rgba(255,255,255,0.7)' }}
  >
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="#1A1815" strokeWidth="1.6" />
      <path d="M4 9 H15 M9 4 V15 M9 15 H20 M15 9 V20 M15 15 H20" stroke="#1A1815" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="1.1" fill="#B8541F" />
    </svg>
  </span>
)

type IconDef = { id: string; label: string; y: number; side: 'left' | 'right'; tile: ReactNode }
const DESKTOP_ICONS: IconDef[] = [
  { id: 'kestrel', label: 'Kestrel', y: 64, side: 'left', tile: KestrelTile },
  { id: 'catalogue', label: 'Catalogue', y: 160, side: 'left', tile: CatalogueTile },
  { id: 'terminal', label: 'Terminal', y: 256, side: 'right', tile: TerminalTile },
  { id: 'contact', label: 'Contact', y: 160, side: 'right', tile: ContactTile },
  { id: 'auxerta', label: 'Auxerta', y: 64, side: 'right', tile: AuxertaTile },
  { id: 'privacy', label: 'Privacy', y: 256, side: 'left', tile: PrivacyTile },
  { id: 'terms', label: 'Terms', y: 352, side: 'left', tile: TermsTile },
  { id: 'news', label: 'News', y: 352, side: 'right', tile: NewsTile },
  { id: 'maze', label: 'Maze', y: 448, side: 'left', tile: MazeTile },
]
function iconStartX(icon: IconDef): number {
  if (icon.side === 'right') {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
    return Math.max(140, vw - 100)
  }
  return 20
}

function DesktopIcon({ icon, openApp, iconPos }: { icon: IconDef; openApp: (id: string) => void; iconPos: IconMap }) {
  const [pos, setPos] = useState({ x: iconStartX(icon), y: icon.y })
  const ref = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ ox: number; oy: number; x: number; y: number; moved: boolean } | null>(null)
  const raf = useRef(0)

  useEffect(() => { iconPos.current[icon.id] = { x: pos.x + 40, y: pos.y + 28 } }, [pos, icon.id, iconPos])

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    drag.current = { ox: e.clientX - pos.x, oy: e.clientY - pos.y, x: pos.x, y: pos.y, moved: false }
    if (ref.current) ref.current.style.willChange = 'transform'
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    const nx = Math.max(6, Math.min(window.innerWidth - 84, e.clientX - d.ox))
    const ny = Math.max(54, Math.min(window.innerHeight - 92, e.clientY - d.oy))
    if (Math.abs(nx - d.x) > 3 || Math.abs(ny - d.y) > 3) d.moved = true
    d.x = nx; d.y = ny
    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        raf.current = 0
        if (ref.current && drag.current) ref.current.style.transform = `translate3d(${drag.current.x}px,${drag.current.y}px,0)`
      })
    }
  }
  const onUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = 0 }
    if (ref.current) ref.current.style.willChange = ''
    drag.current = null
    if (d.moved) setPos({ x: d.x, y: d.y })
    else openApp(icon.id)
  }

  return (
    <button
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onClick={(e) => { if (e.detail === 0) openApp(icon.id) }}
      aria-label={'Open ' + icon.label}
      className="group pointer-events-auto absolute left-0 top-0 flex flex-col items-center gap-1.5 w-20 cursor-grab active:cursor-grabbing"
      style={{ transform: `translate3d(${pos.x}px,${pos.y}px,0)`, touchAction: 'none' }}
    >
      {icon.tile}
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#F5F2EB] pointer-events-none" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}>{icon.label}</span>
    </button>
  )
}

function DesktopIcons({ openApp, iconPos }: { openApp: (id: string) => void; iconPos: IconMap }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {DESKTOP_ICONS.map((icon) => <DesktopIcon key={icon.id} icon={icon} openApp={openApp} iconPos={iconPos} />)}
    </div>
  )
}

/* ── mobile: full-screen sheets + a bottom tab-dock ── */
function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setM(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return m
}

function MobileSheet({ app, visible, dispatch, bannerH }: { app: AppDef; visible: boolean; dispatch: (a: Action) => void; bannerH: number }) {
  return (
    <div
      className="fixed inset-x-0 top-12 z-[20] flex-col bg-white"
      style={{ display: visible ? 'flex' : 'none', bottom: bannerH }}
      role={visible ? 'dialog' : undefined}
      aria-label={visible ? app.title : undefined}
    >
      <div className="shrink-0 h-11 flex items-center gap-2.5 px-4 bg-[#EFEBE2] border-b border-[#E6E1D6]" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' }}>
        <span className="font-sans text-[14px] font-medium tracking-tight text-[#1A1815] deboss truncate">{app.title}</span>
        <span aria-hidden className="h-3.5 w-px bg-[#DDD7CA] shrink-0" />
        <EtchedChip code={app.code} />
        <span className="flex-1" />
        <button aria-label="Close" onClick={() => dispatch({ t: 'close', id: app.id })} className="w-7 h-7 flex items-center justify-center rounded-full text-[#807A70] hover:text-[#B8541F] hover:bg-[#F4E3DA] transition-colors">{Cross}</button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden select-text"><app.Body active={visible} /></div>
    </div>
  )
}

function MobileHome({ openApp }: { openApp: (id: string) => void }) {
  return (
    <div className="fixed inset-x-0 top-12 bottom-0 z-[6] overflow-y-auto px-6 pt-16 pb-12 flex justify-center">
      <div className="grid grid-cols-3 gap-x-7 gap-y-9 content-start">
        {DESKTOP_ICONS.filter((icon) => icon.id !== 'terminal').map((icon) => (
          <button
            key={icon.id}
            onClick={() => openApp(icon.id)}
            aria-label={'Open ' + icon.label}
            className="group flex flex-col items-center gap-2 active:scale-95 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            {icon.tile}
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#F5F2EB]" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}>{icon.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── root ── */
export default function OS() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInit)
  const openApp = useCallback((id: string) => {
    // Terminal is desktop-only; ignore deep links / palette opens on a phone.
    if (id === 'terminal' && typeof window !== 'undefined' && window.innerWidth < 768) return
    dispatch({ t: 'open', id })
    const path = '/' + id
    if (window.location.pathname !== path) window.history.pushState(null, '', path)
    document.title = titleFor(id)
  }, [])
  const [palette, setPalette] = useState(false)
  const isMobile = useIsMobile()
  const [booted, setBooted] = useState(() => typeof sessionStorage !== 'undefined' && sessionStorage.getItem('neo-booted') === '1')
  const [bannerH, setBannerH] = useState(0)
  const iconPos = useRef<Record<string, { x: number; y: number }>>(
    Object.fromEntries(DESKTOP_ICONS.map((i) => [i.id, { x: iconStartX(i) + 40, y: i.y + 28 }])),
  )
  // mirror of state.focused for the popstate handler (which is bound once)
  const focusedRef = useRef(state.focused)
  useEffect(() => { focusedRef.current = state.focused }, [state.focused])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const k = e.key.toLowerCase()
      if (meta && k === 'k') { e.preventDefault(); setPalette((p) => !p); return }
      if (e.key === 'Escape') { setPalette(false); return }
      if (meta && k === 'w' && state.focused) { e.preventDefault(); dispatch({ t: 'close', id: state.focused }); return }
      if (meta && k === 'm' && state.focused) { e.preventDefault(); dispatch({ t: 'min', id: state.focused }) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.focused])

  useEffect(() => {
    const onOpen = (e: Event) => { const d = (e as CustomEvent).detail; if (typeof d === 'string') openApp(d) }
    window.addEventListener('neo-open', onOpen)
    return () => window.removeEventListener('neo-open', onOpen)
  }, [openApp])

  // the consent banner reports its footprint; the mobile sheet lifts clear of it
  useEffect(() => {
    const onShown = (e: Event) => setBannerH(Number((e as CustomEvent).detail) || 0)
    window.addEventListener('neo-consent-shown', onShown)
    return () => window.removeEventListener('neo-consent-shown', onShown)
  }, [])

  // deep-link routing: set the initial title, reset the URL on an empty
  // desktop, and follow browser back / forward between app drawers.
  useEffect(() => { document.title = titleFor(state.focused) }, [])

  useEffect(() => {
    if (state.focused === null && window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/')
      document.title = 'Neognathae'
    }
  }, [state.focused])

  useEffect(() => {
    const onPop = () => {
      const id = window.location.pathname.replace(/^\/+/, '').toLowerCase()
      const routable = APPS.some((a) => a.id === id) && !(id === 'terminal' && window.innerWidth < 768)
      if (routable) openApp(id)
      else if (focusedRef.current) dispatch({ t: 'close', id: focusedRef.current })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [openApp])

  // Terminal is desktop-only; never leave it focused on a phone.
  useEffect(() => {
    if (isMobile && state.focused === 'terminal') dispatch({ t: 'close', id: 'terminal' })
  }, [isMobile, state.focused])

  const focusedCode = state.focused ? APPS.find((a) => a.id === state.focused)?.code ?? null : null

  return (
    <OSContext.Provider value={{ openApp }}>
      <div className="fixed inset-0 overflow-hidden select-none" style={{ background: '#F5F2EB' }}>
        <Desktop />
        {isMobile ? (
          <>
            <MobileHome openApp={openApp} />
            {APPS.filter((app) => app.id !== 'terminal').map((app) => (
              <MobileSheet key={app.id} app={app} visible={state.focused === app.id && state.wins[app.id].open} dispatch={dispatch} bannerH={bannerH} />
            ))}
          </>
        ) : (
          <>
            <DesktopIcons openApp={openApp} iconPos={iconPos} />
            <div className="pointer-events-none absolute inset-0 z-10">
              {APPS.map((app) => (
                <PlateWindow key={app.id} app={app} win={state.wins[app.id]} focused={state.focused === app.id} dispatch={dispatch} iconPos={iconPos} />
              ))}
            </div>
          </>
        )}
        <Header openApp={openApp} onPalette={() => setPalette(true)} focusedCode={focusedCode} />
        {!isMobile && <PlateFrame />}
        <ConsentBanner />
        {palette && <Palette openApp={openApp} close={() => setPalette(false)} />}
        {!booted && <BootSplash onDone={() => { try { sessionStorage.setItem('neo-booted', '1') } catch { /* private mode */ } setBooted(true) }} />}
      </div>
    </OSContext.Provider>
  )
}
