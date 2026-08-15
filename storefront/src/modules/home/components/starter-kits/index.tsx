import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type KitMeta = {
  level?: string
  was?: number
  items?: string[]
}

export default async function StarterKits({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price,+metadata",
      limit: 3,
    },
  })

  if (!products?.length) {
    return null
  }

  // The reference progresses beginner → workshop; the API returns creation order.
  const levelOrder = ["Beginner", "Intermediate", "Workshop"]
  const kits = [...products].sort(
    (a, b) =>
      levelOrder.indexOf(((a.metadata ?? {}) as KitMeta).level ?? "") -
      levelOrder.indexOf(((b.metadata ?? {}) as KitMeta).level ?? "")
  )

  return (
    <section
      id="kits"
      className="border-b border-ink-900 bg-canvas py-16 small:py-20"
    >
      <div className="content-container">
        <div className="mb-8 max-w-2xl">
          <span className="eyebrow">Starter kits</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 small:text-4xl">
            One box. Whole project.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            Curated by the people who answer your support messages — every part
            cross-checked to work together, with a wiring sheet in the box.
            Cheaper than buying the list one by one.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-px border border-ink-900 bg-ink-900 small:grid-cols-3">
          {kits.map((kit) => {
            const meta = (kit.metadata ?? {}) as KitMeta
            const { cheapestPrice } = getProductPrice({ product: kit })
            const was =
              typeof meta.was === "number"
                ? convertToLocale({
                    amount: meta.was,
                    currency_code: region.currency_code,
                    maximumFractionDigits: 0,
                  })
                : null

            return (
              <li key={kit.id} className="flex flex-col bg-canvas p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-extrabold tracking-tight text-ink-900">
                    {kit.title.replace(/ Kit$/, "")}
                  </h3>
                  {meta.level && (
                    <span className="shrink-0 border border-ink-900 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-900">
                      {meta.level}
                    </span>
                  )}
                </div>

                {kit.description && (
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">
                    {kit.description}
                  </p>
                )}

                {!!meta.items?.length && (
                  <ul className="mt-5 flex flex-1 flex-col gap-2 border-t border-ink-200 pt-5">
                    {meta.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2.5 text-sm text-ink-700"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-orbis-600"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-ink-900">
                    {cheapestPrice?.calculated_price}
                  </span>
                  {was && (
                    <span className="text-sm text-ink-400 line-through">
                      {was}
                    </span>
                  )}
                </div>

                <LocalizedClientLink
                  href={`/products/${kit.handle}`}
                  className="group mt-4 flex h-12 items-center justify-between border border-ink-900 px-4 text-sm font-bold uppercase tracking-[0.08em] text-ink-900 transition-colors hover:bg-orbis-600 hover:border-orbis-600 hover:text-white"
                >
                  Add kit to cart
                  <span
                    aria-hidden
                    className="transition-transform duration-150 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
