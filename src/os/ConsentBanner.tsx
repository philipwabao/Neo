// Cookie consent banner. Google Analytics is denied by default via Consent
// Mode v2 (see index.html); this banner is the only thing that grants it.
// The choice is remembered in localStorage under 'neo-consent' and can be
// changed later (the Privacy app dispatches 'neo-consent-open' to reopen it).
import { useEffect, useRef, useState } from 'react'

type Gtag = (...args: unknown[]) => void
const CONSENT_KEY = 'neo-consent'

function applyConsent(state: 'granted' | 'denied') {
  const w = window as unknown as { gtag?: Gtag }
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', { analytics_storage: state })
  }
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let stored: string | null = null
    try { stored = localStorage.getItem(CONSENT_KEY) } catch { /* private mode */ }
    if (stored !== 'granted' && stored !== 'denied') setVisible(true)
    const onOpen = () => setVisible(true)
    window.addEventListener('neo-consent-open', onOpen)
    return () => window.removeEventListener('neo-consent-open', onOpen)
  }, [])

  // Report the banner's footprint so the mobile sheet can lift its bottom edge
  // clear of it instead of being covered.
  useEffect(() => {
    const h = visible && wrapRef.current ? wrapRef.current.offsetHeight : 0
    window.dispatchEvent(new CustomEvent('neo-consent-shown', { detail: h }))
  }, [visible])

  const choose = (state: 'granted' | 'denied') => {
    try { localStorage.setItem(CONSENT_KEY, state) } catch { /* ignore */ }
    applyConsent(state)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div ref={wrapRef} className="fixed inset-x-0 bottom-0 z-[1150] flex justify-center px-3 pb-3 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-2xl rounded-xl border border-[#E6E1D6] bg-[#F5F2EB]/95 backdrop-blur-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5"
        style={{ boxShadow: '0 -2px 4px rgba(26,24,21,0.04), 0 24px 60px -24px rgba(26,24,21,0.5)' }}
        role="dialog"
        aria-label="Cookie consent"
      >
        <p className="flex-1 text-[0.8rem] leading-relaxed text-[#4A463F]">
          We use Google Analytics to understand how this site is used. It runs only if you allow it, and sets no cookies until you do.{' '}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('neo-open', { detail: 'privacy' }))}
            className="text-[#1A1815] underline decoration-[#CCC6BA] underline-offset-2 hover:text-[#B8541F] transition-colors"
          >
            Privacy
          </button>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => choose('denied')}
            className="rounded-full border border-[#CCC6BA] px-4 py-2 text-[0.7rem] font-mono uppercase tracking-[0.14em] text-[#4A463F] hover:border-[#1A1815] hover:text-[#1A1815] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose('granted')}
            className="rounded-full bg-[#1A1815] px-4 py-2 text-[0.7rem] font-mono uppercase tracking-[0.14em] text-[#F5F2EB] hover:bg-[#2A2723] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
