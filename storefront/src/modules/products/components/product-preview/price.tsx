import { clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <span
          className="text-xs text-ink-500 line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={clx("text-lg font-extrabold tracking-tight text-ink-900", {
          "text-orbis-600": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </>
  )
}
