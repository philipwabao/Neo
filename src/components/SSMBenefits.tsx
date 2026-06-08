const USE_CASES = [
  { name: 'Toxic chat moderation', desc: 'Flag abuse in chat, comments, and reviews.' },
  { name: 'Support intent', desc: 'Route tickets by what the customer actually wants.' },
  { name: 'Spam detection', desc: 'Separate real messages from junk.' },
  { name: 'Email routing', desc: 'Send each message to the right queue.' },
  { name: 'Document sorting', desc: 'Tag contracts, forms, and files by type.' },
  { name: 'Content tagging', desc: 'Label products and content by attribute.' },
];

const VALUE = [
  ['01', 'Clean output', 'Labels that fit your schema.', 'Kestrel returns your exact labels, ready to use. No mapping or cleanup before they reach your systems.'],
  ['02', 'Your domain', 'Speaks your language.', 'Trained on your terminology and edge cases, so it reads the way your team and customers actually write.'],
  ['03', 'Private', 'Reachable only by you.', 'Served from an endpoint only your infrastructure can reach. Your data is never exposed to anyone else.'],
  ['04', 'Improves', 'Gets sharper with use.', 'Add new labeled data whenever you like, and the model keeps improving on your task.'],
];

const ACCURACY = [
  { label: 'No examples', pct: 88.0 },
  { label: 'One example', pct: 92.0 },
  { label: 'A few examples', pct: 96.0 },
  { label: 'Many examples', pct: 98.0 },
];

export default function SSMBenefits() {
  return (
    <section className="w-full px-6 md:px-8 py-20 md:py-28 border-t border-[#E6E1D6]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl text-left md:text-center mx-auto mb-12 md:mb-16">
          <p className="text-[0.65rem] font-mono tracking-[0.2em] uppercase text-[#B8541F]">
            Use cases
          </p>
          <h2 className="mt-4 text-2xl md:text-3xl lg:text-4xl font-sans font-semibold tracking-tight leading-tight">
            From messy text to clean labels.
          </h2>
          <p className="mt-4 text-sm md:text-base text-[#6B6760] leading-relaxed">
            A few of the things Kestrel sorts. If you can define the labels, it can
            learn them.
          </p>
        </div>

        {/* Use cases */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-8 mb-20 md:mb-24">
          {USE_CASES.map((u) => (
            <div key={u.name}>
              <h3 className="font-sans text-base md:text-lg font-semibold tracking-tight text-[#1A1815]">
                {u.name}
              </h3>
              <p className="mt-1.5 text-sm text-[#6B6760] leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>

        {/* What you get */}
        <div className="mb-20 md:mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E6E1D6] border border-[#E6E1D6] rounded-xl overflow-hidden">
            {VALUE.map(([n, k, h, b]) => (
              <div key={n} className="bg-white p-6 md:p-7 flex flex-col">
                <p className="text-[0.55rem] font-mono tracking-[0.2em] uppercase text-[#B8541F]">
                  {n} · {k}
                </p>
                <h4 className="mt-2 text-base md:text-lg font-sans font-semibold tracking-tight">
                  {h}
                </h4>
                <p className="mt-2 text-sm text-[#6B6760] leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Speed & cost + accuracy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-[0.65rem] font-mono tracking-[0.2em] uppercase text-[#B8541F]">
              Speed &amp; cost
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-sans font-semibold tracking-tight leading-[1.1]">
              Long inputs don't slow it down.
            </h2>
            <p className="mt-6 text-sm md:text-base text-[#4A463F] leading-relaxed">
              Speed and cost stay the same whether you send a one-line message or a
              hundred-page document. You are billed by volume, not by the length of
              each input.
            </p>
          </div>

          {/* Accuracy */}
          <div className="bg-white border border-[#E6E1D6] rounded-xl p-6 md:p-8 w-full">
            <div className="mb-7 border-b border-[#E6E1D6] pb-5">
              <h4 className="text-[0.7rem] font-mono uppercase tracking-[0.1em] font-semibold text-[#1A1815]">
                Classification accuracy
              </h4>
              <p className="text-[0.65rem] font-mono text-[#928C82] mt-1">
                Internal benchmark, on held-out real-world text
              </p>
            </div>

            <div className="space-y-5">
              {ACCURACY.map((a) => (
                <div key={a.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.65rem] font-mono text-[#4A463F] uppercase tracking-wide">
                      {a.label}
                    </span>
                    <span className="text-[0.65rem] font-mono text-[#1A1815] font-semibold">
                      {a.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#ECE8DF] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#B8541F] rounded-full transition-all duration-500"
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 pt-5 border-t border-[#E6E1D6] text-[0.6rem] leading-relaxed text-[#928C82]">
              Figures reflect internal evaluation on real-world data with simulated
              labeled pairs, not customer data. Accuracy on customer data is
              established per deployment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
