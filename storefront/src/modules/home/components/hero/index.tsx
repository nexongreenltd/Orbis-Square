import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const stats = [
  { value: "500+", label: "Parts in stock" },
  { value: "24h", label: "Dhaka delivery" },
  { value: "৳60", label: "Flat city shipping" },
  { value: "1,240", label: "Orders shipped" },
]

const trending = [
  "ESP32 DevKit",
  "SG90 servo",
  "18650 cell",
  "NEMA 17",
  "Raspberry Pi 4",
]

const Hero = ({ featured }: { featured?: HttpTypes.StoreProduct | null }) => {
  const { cheapestPrice } = featured
    ? getProductPrice({ product: featured })
    : { cheapestPrice: null }
  const optionCount = featured?.variants?.length ?? 0

  return (
    <section className="border-b border-ink-900 bg-canvas">
      <div className="content-container grid items-start gap-10 py-14 small:grid-cols-2 small:py-20">
        {/* ── Copy ──────────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col">
          <span className="eyebrow">Robotics &amp; electronics · Bangladesh</span>

          <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[0.95] tracking-tight text-ink-900 xsmall:text-5xl small:text-6xl medium:text-7xl">
            Stocked. Tested.
            <br />
            Shipped today.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-700">
            Every board, sensor, motor and bench tool a Bangladeshi build needs
            — powered up and checked before it leaves Dhaka. No “out of stock”
            after you pay.
          </p>

          <div className="mt-8 flex flex-col items-stretch xsmall:flex-row xsmall:items-center">
            <LocalizedClientLink
              href="/store"
              className="group inline-flex h-14 items-center justify-center gap-3 bg-orbis-600 px-8 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-150 hover:bg-orbis-700"
            >
              Browse the catalogue
              <span
                aria-hidden
                className="transition-transform duration-150 group-hover:translate-x-1"
              >
                →
              </span>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/collections/starter-kits"
              className="inline-flex h-14 items-center justify-center bg-ink-900 px-8 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-150 hover:bg-ink-800"
            >
              Starter kits
            </LocalizedClientLink>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
              Trending
            </span>
            {trending.map((t) => (
              <LocalizedClientLink
                key={t}
                href={`/store?q=${encodeURIComponent(t)}`}
                className="border border-ink-900 px-3 py-1.5 text-xs font-medium text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
              >
                {t}
              </LocalizedClientLink>
            ))}
          </div>
        </div>

        {/* ── Most bought this month ────────────────────────────────── */}
        {featured && (
          <div className="border border-ink-900 bg-canvas">
            <div className="flex items-center justify-between border-b border-ink-900 px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-900">
                Most bought this month
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-orbis-600">
                <span aria-hidden className="h-2 w-2 bg-orbis-600" />
                142 sold
              </span>
            </div>

            <div className="grid grid-cols-1 xsmall:grid-cols-2">
              <LocalizedClientLink
                href={`/products/${featured.handle}`}
                className="border-b border-ink-900 xsmall:border-b-0 xsmall:border-r"
              >
                <Thumbnail
                  thumbnail={featured.thumbnail}
                  images={featured.images}
                  size="square"
                />
              </LocalizedClientLink>

              <div className="flex flex-col p-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
                  {featured.categories?.[0]?.name ?? "Development Boards"}
                </span>
                <LocalizedClientLink href={`/products/${featured.handle}`}>
                  <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-ink-900 transition-colors hover:text-orbis-600">
                    {featured.title}
                  </h2>
                </LocalizedClientLink>
                {featured.subtitle && (
                  <p className="mt-2 text-sm text-ink-600">
                    {featured.subtitle}
                  </p>
                )}

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-ink-900">
                    {cheapestPrice?.calculated_price}
                  </span>
                  {optionCount > 1 && (
                    <span className="text-xs text-ink-500">
                      {optionCount} options
                    </span>
                  )}
                </div>

                <LocalizedClientLink
                  href={`/products/${featured.handle}`}
                  className="group mt-5 flex h-12 items-center justify-between bg-orbis-600 px-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-orbis-700"
                >
                  Add to cart
                  <span
                    aria-hidden
                    className="transition-transform duration-150 group-hover:translate-x-1"
                  >
                    +
                  </span>
                </LocalizedClientLink>

                <span className="mt-3 flex items-center gap-1.5 text-xs text-ink-600">
                  <span aria-hidden className="h-2 w-2 bg-orbis-600" />
                  In stock — dispatched today
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="content-container">
        <dl className="grid grid-cols-2 border-t border-ink-900 small:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-6 ${i > 0 ? "border-l border-ink-200 pl-6" : ""}`}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-3xl font-extrabold tracking-tight text-orbis-600 small:text-4xl">
                {stat.value}
              </dd>
              <dd className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default Hero
