import { useEffect, type ReactNode } from 'react'

type Section = {
  id: string
  heading: string
  body: ReactNode
}

export function LegalPage({
  title,
  effectiveDate,
  intro,
  sections,
  onBack,
}: {
  title: string
  effectiveDate: string
  intro: ReactNode
  sections: Section[]
  onBack: () => void
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="w-full text-[#1A1815]">
      {/* Top nav */}
      <header className="w-full px-6 md:px-8 py-5 border-b border-[#E6E1D6] sticky top-0 bg-white/85 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 text-[0.7rem] font-mono tracking-[0.18em] uppercase text-[#6B6760] hover:text-[#1A1815] transition-colors"
          >
            <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
            Back
          </button>
          <p className="text-[0.85rem] md:text-base font-newsreader font-medium tracking-tight text-[#1A1815]">
            Neognathae
          </p>
          <a
            href="mailto:contact@auxerta.com"
            className="text-[0.7rem] font-mono tracking-[0.18em] uppercase text-[#6B6760] hover:text-[#1A1815] transition-colors"
          >
            Contact
          </a>
        </div>
      </header>

      {/* Title */}
      <section className="w-full px-6 md:px-8 pt-16 md:pt-24 pb-10 md:pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[0.65rem] font-mono tracking-[0.2em] uppercase text-[#B8541F]">
            Legal
          </p>
          <h1 className="mt-4 text-3xl md:text-5xl font-newsreader font-medium tracking-tight leading-[1.05]">
            {title}
          </h1>
          <p className="mt-5 text-xs md:text-sm font-mono tracking-wider uppercase text-[#928C82]">
            Effective {effectiveDate}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="w-full px-6 md:px-8 pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto">
          {/* Intro */}
          <div className="text-base text-[#4A463F] leading-relaxed">
            {intro}
          </div>

          {/* Sections */}
          <div className="mt-12 space-y-12">
            {sections.map((s, i) => (
              <article key={s.id} id={s.id}>
                <h2 className="text-xl md:text-2xl font-newsreader font-medium tracking-tight text-[#1A1815]">
                  {String(i + 1).padStart(2, '0')} · {s.heading}
                </h2>
                <div className="mt-4 text-base text-[#4A463F] leading-relaxed space-y-4">
                  {s.body}
                </div>
              </article>
            ))}
          </div>

          {/* Sign-off */}
          <p className="mt-16 text-sm text-[#807A70] italic">
            Questions? Email{' '}
            <a href="mailto:contact@auxerta.com" className="text-[#1A1815] underline-offset-2 hover:underline">
              contact@auxerta.com
            </a>.
          </p>
        </div>
      </section>
    </div>
  )
}
