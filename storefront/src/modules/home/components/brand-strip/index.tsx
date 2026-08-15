const brands = [
  "Arduino",
  "Espressif",
  "Raspberry Pi",
  "STMicro",
  "DFRobot",
  "Waveshare",
]

export default function BrandStrip() {
  return (
    <section className="border-b border-ink-900 bg-canvas-surface">
      <div className="content-container flex flex-col gap-4 py-5 small:flex-row small:items-center small:gap-8">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
          Genuine &amp; compatible parts from
        </span>
        <ul className="no-scrollbar flex items-center gap-6 overflow-x-auto">
          {brands.map((brand) => (
            <li
              key={brand}
              className="shrink-0 text-sm font-extrabold uppercase tracking-[0.08em] text-ink-700"
            >
              {brand}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
