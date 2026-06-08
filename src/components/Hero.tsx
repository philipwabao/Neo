/* The flock - the Neognathae mark, used as the wordmark glyph */
export function FlockMark({ className = '', leadStroke }: { className?: string; leadStroke?: string }) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            aria-hidden
            className={className}
        >
            {/* base shard */}
            <path d="M8 42 L16 42 L16 34 Z" />
            {/* mid shard */}
            <path d="M20 34 L40 24 L37.5 31 L18 40 Z" />
            {/* lead shard (accent) */}
            <path d="M42 3.5 L43.5 19 L17.5 31.5 Z" fill={leadStroke} />
        </svg>
    );
}

/* The painterly Kestrel specimen plate - the brand's visual signature.
   Shared by the home catalogue card and the Kestrel page hero. Sits inside
   a `group` parent to pick up the hover scale on the cream initial. */
export function SpecimenPlate({ className = '' }: { className?: string }) {
    return (
        <div
            className={'relative aspect-[4/5] border-b border-[#E6E1D6] overflow-hidden ' + className}
            style={{
                backgroundColor: '#241811',
                backgroundImage: 'url(/kestrel-plate.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* painterly vignette for depth */}
            <div
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundImage: 'radial-gradient(125% 120% at 50% 38%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.38) 100%)' }}
            />
            {/* specimen-pin corner tick */}
            <span aria-hidden className="absolute left-3 top-3 h-2.5 w-px" style={{ backgroundColor: 'rgba(245,242,235,0.7)' }} />
            <span aria-hidden className="absolute left-3 top-3 h-px w-2.5" style={{ backgroundColor: 'rgba(245,242,235,0.7)' }} />
            {/* rotated plate number */}
            <span
                className="absolute left-3.5 top-9 origin-top-left -rotate-90 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#F4F0E8]"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
                PL. 001
            </span>
            {/* ruled field baseline */}
            <span aria-hidden className="absolute inset-x-6 top-[68%] h-px" style={{ backgroundColor: 'rgba(245,242,235,0.25)' }} />
            {/* large Fraunces initial - cream specimen letter on the plumage panel */}
            <span
                aria-hidden
                className="absolute inset-x-0 top-[68%] -translate-y-full flex justify-center"
            >
                <span
                    className="font-sans font-semibold leading-none text-[6rem] md:text-[6.5rem] text-[#F8F5EF] origin-bottom transition-transform duration-200 group-hover:scale-[1.03]"
                    style={{ textShadow: '0 3px 16px rgba(0,0,0,0.4)' }}
                >
                    K
                </span>
            </span>
            {/* modality field-annotation */}
            <span aria-hidden className="absolute right-6 bottom-9 h-px w-6" style={{ backgroundColor: 'rgba(245,242,235,0.25)' }} />
            <span
                className="absolute right-3 bottom-8 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-[#F4F0E8]"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
                Text
            </span>
            {/* colophon */}
            <span
                className="absolute right-3 bottom-3 inline-flex items-center gap-1 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-[#F4F0E8]"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
                <FlockMark className="w-3.5 h-3.5 text-[#F5F2EB]" leadStroke="#F2B705" />
                Neognathae
            </span>
        </div>
    );
}

/* Kestrel - the one collected specimen. Links through to its page. */
export function KestrelCard({ onOpen }: { onOpen: () => void }) {
    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label="Kestrel, text classification. Open specimen."
            className="reveal group text-left bg-white border border-[#E6E1D6] rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CCC6BA] focus-visible:outline-none cursor-pointer"
            style={{ animationDelay: '0.05s' }}
        >
            <SpecimenPlate />
            <div className="p-5">
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#6B6760]">
                    NEO-001 <span className="text-[#CCC6BA]">·</span> FALCONIDAE
                </p>
                <h3 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-[#1A1815] transition-colors group-hover:text-[#B8541F]">
                    Kestrel
                </h3>
                <p className="mt-0.5 font-sans italic text-sm text-[#6B6760]">Text classification</p>
                <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#B8541F] opacity-0 -translate-y-0.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                    View
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </span>
            </div>
        </button>
    );
}

/* An empty mount, awaiting a specimen - coming soon, no invented detail. */
export function ComingSoonCard({ index }: { index: number }) {
    const angle = 110 + ((index * 12) % 70);
    const ground = `linear-gradient(${angle}deg, #F5F2EB 0%, #EFEBE2 100%)`;
    const delay = `${Math.min(index + 2, 8) * 0.05}s`;
    return (
        <div
            aria-label="Coming soon"
            className="reveal group bg-[#FBF9F4] border border-[#E6E1D6] rounded-xl overflow-hidden transition-colors duration-150 hover:border-[#CCC6BA]"
            style={{ animationDelay: delay }}
        >
            <div
                className="relative aspect-[4/5] border-b border-[#E6E1D6] overflow-hidden"
                style={{ backgroundImage: ground }}
            >
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#928C82]">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full border border-[#CCC6BA]" />
                    Soon
                </span>
                <span aria-hidden className="absolute inset-x-6 top-[68%] h-px bg-[#E6E1D6]" />
                <span
                    aria-hidden
                    className="absolute inset-x-0 top-[68%] -translate-y-full flex justify-center"
                >
                    <FlockMark className="w-12 h-12 text-[#DCD6C9]" />
                </span>
            </div>
            <div className="p-5">
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#CCC6BA]">
                    In preparation
                </p>
                <h3 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-[#928C82]">
                    Coming soon
                </h3>
            </div>
        </div>
    );
}

export default function Hero({ onOpenService }: { onOpenService: () => void }) {
    return (
        <section className="flex-1 w-full flex flex-col">
            {/* The statement, over a soft cloudscape */}
            <div className="relative w-full overflow-hidden" style={{ minHeight: 'clamp(340px, 62vh, 640px)' }}>
                {/* image, graded gently toward the warm palette */}
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(/hero-clouds.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 60%',
                        filter: 'saturate(0.92) brightness(1.03) contrast(1.02) sepia(0.08)',
                    }}
                />
                {/* paper wash: legible at top, seamless into the page below */}
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(245,242,235,0.86) 0%, rgba(245,242,235,0.50) 24%, rgba(245,242,235,0.26) 52%, rgba(245,242,235,0.60) 84%, #F5F2EB 100%)' }}
                />
                {/* faint film grain */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
                />
                <div className="relative w-full max-w-5xl mx-auto px-6 md:px-8 pt-20 md:pt-32 pb-16 md:pb-24">
                <p
                    className="reveal text-[0.7rem] font-mono uppercase tracking-[0.24em] text-[#6B6760]"
                    style={{ animationDelay: '0.05s' }}
                >
                    A growing family of models
                </p>

                <h1
                    className="reveal mt-6 md:mt-8 max-w-4xl font-sans font-semibold tracking-[-0.02em] text-[#1A1815] text-[3.1rem] leading-[1.02] md:text-[5.5rem] md:leading-[0.97]"
                    style={{ animationDelay: '0.12s' }}
                >
                    Built for one <span className="italic font-normal">task.</span>
                </h1>

                <p
                    className="reveal mt-7 md:mt-8 max-w-2xl text-[1.05rem] md:text-[1.25rem] leading-relaxed text-[#4A463F]"
                    style={{ animationDelay: '0.2s' }}
                >
                    Focused models, fine-tuned on your data. Kestrel, for text
                    classification, is the first.
                </p>

                <div
                    className="reveal mt-9 md:mt-11 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7"
                    style={{ animationDelay: '0.28s' }}
                >
                    <button
                        type="button"
                        onClick={onOpenService}
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1815] px-6 py-3 text-[0.82rem] font-medium tracking-tight text-[#F5F2EB] transition-colors hover:bg-[#2A2723] cursor-pointer"
                    >
                        Explore Kestrel
                        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                    </button>
                    <a
                        href="#products"
                        className="group inline-flex items-center gap-2 text-[0.98rem] font-medium text-[#1A1815] hover:text-[#B8541F] transition-colors"
                    >
                        See the catalogue
                        <span aria-hidden className="transition-transform group-hover:translate-y-0.5">↓</span>
                    </a>
                </div>
            </div>
            </div>

            {/* The catalogue - a field-guide grid of the model family */}
            <div id="products" className="w-full border-t border-[#E6E1D6] scroll-mt-20">
                <div className="max-w-5xl mx-auto px-6 md:px-8 pt-14 md:pt-20 pb-20 md:pb-28">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                        <KestrelCard onOpen={onOpenService} />
                        {Array.from({ length: 7 }).map((_, i) => (
                            <ComingSoonCard key={i} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
