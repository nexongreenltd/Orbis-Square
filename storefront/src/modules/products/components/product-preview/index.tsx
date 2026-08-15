import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const variantCount = product.variants?.length ?? 0
  const category = product.categories?.[0]?.name
  const onSale = cheapestPrice?.price_type === "sale"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
    >
      <div
        data-testid="product-wrapper"
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-900 bg-canvas-surface transition-colors duration-150 group-hover:border-orbis-600"
      >
        <div className="relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="square"
            className="rounded-none border-0 shadow-none"
          />
          {category && (
            <span className="absolute left-0 top-0 bg-ink-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              {category}
            </span>
          )}
          {onSale && (
            <span className="absolute right-0 top-0 bg-orbis-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              Sale
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3
            className="text-sm font-bold leading-snug text-ink-900 transition-colors group-hover:text-orbis-600"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="flex flex-col">
              {variantCount > 1 && (
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">
                  From
                </span>
              )}
              <div className="flex items-center gap-x-2">
                {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
              </div>
            </div>
            {variantCount > 1 && (
              <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-500">
                {variantCount} options
              </span>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
