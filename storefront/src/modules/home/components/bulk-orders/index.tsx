export default function BulkOrders() {
  return (
    <section id="bulk" className="border-b border-ink-900 bg-ink-900 py-16 small:py-20">
      <div className="content-container grid gap-10 small:grid-cols-2 small:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orbis-400">
            <span aria-hidden className="inline-block h-2 w-2 bg-orbis-600" />
            Labs · Clubs · Startups
          </span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white small:text-4xl">
            Kitting 40 students? Get a quote in 24 hours.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
            Institutional pricing, PO and cheque payment, one invoice, one
            delivery. Tell us the syllabus or BOM and we return a priced list —
            substitutions flagged where a part is scarce.
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <label
            htmlFor="bulk-email"
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50"
          >
            Request bulk pricing
          </label>
          <form
            className="mt-3 flex flex-col xsmall:flex-row"
            action="mailto:support@orbissquare.com"
            method="post"
            encType="text/plain"
          >
            <input
              id="bulk-email"
              type="email"
              name="email"
              required
              placeholder="you@institution.edu.bd"
              className="h-14 flex-1 border border-white/20 bg-transparent px-4 text-sm text-white placeholder:text-white/35 focus:border-orbis-600 focus:outline-none"
            />
            <button
              type="submit"
              className="group inline-flex h-14 items-center justify-center gap-3 bg-orbis-600 px-8 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-orbis-700"
            >
              Send request
              <span
                aria-hidden
                className="transition-transform duration-150 group-hover:translate-x-1"
              >
                →
              </span>
            </button>
          </form>
          <p className="mt-3 text-xs text-white/40">
            Replies within one working day, Sat–Thu.
          </p>
        </div>
      </div>
    </section>
  )
}
