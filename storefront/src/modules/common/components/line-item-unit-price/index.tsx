import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const { total, original_total } = item
  const hasReducedPrice = total < original_total

  const percentage_diff = Math.round(
    ((original_total - total) / original_total) * 100
  )

  return (
    <div className="flex flex-col items-end gap-y-0.5">
      {hasReducedPrice && (
        <div className="flex items-baseline gap-x-1.5 text-xs">
          {style === "default" && (
            <span className="text-ink-500">Original:</span>
          )}
          <span className="text-ink-400 line-through" data-testid="product-unit-original-price">
            {convertToLocale({
              amount: original_total / item.quantity,
              currency_code: currencyCode,
            })}
          </span>
          {style === "default" && (
            <span className="font-bold text-orbis-600">-{percentage_diff}%</span>
          )}
        </div>
      )}
      <span
        className={clx("text-sm tabular-nums", {
          "font-bold text-orbis-600": hasReducedPrice,
          "text-ink-600": !hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: total / item.quantity,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
