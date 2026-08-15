import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
  eyebrow,
  title,
  blurb,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
  eyebrow?: string
  title?: string
  blurb?: string
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price,*categories",
      limit: 4,
    },
  })

  if (!pricedProducts?.length) {
    return null
  }

  return (
    <section className="border-b border-ink-900 bg-canvas-surface py-16 small:py-20">
      <div className="content-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{eyebrow ?? collection.title}</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 small:text-4xl">
              {title ?? collection.title}
            </h2>
            {blurb && <p className="mt-3 text-sm text-ink-600">{blurb}</p>}
          </div>
          <LocalizedClientLink
            href={`/collections/${collection.handle}`}
            className="hidden shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-orbis-600 transition-colors hover:text-orbis-700 small:block"
          >
            View all new →
          </LocalizedClientLink>
        </div>

        <ul className="grid grid-cols-2 gap-4 small:grid-cols-4 small:gap-6">
          {pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
