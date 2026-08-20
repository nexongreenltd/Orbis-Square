import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemPriceProps) => {
  const { total, original_total } = item
  const originalPrice = original_total
  const currentPrice = total
  const hasReducedPrice = currentPrice < originalPrice

  return (
    <div className="flex flex-col items-end gap-y-0.5">
      {hasReducedPrice && (
        <div className="flex items-baseline gap-x-1.5 text-xs">
          {style === "default" && (
            <span className="text-ink-500">Original:</span>
          )}
          <span
            className="text-ink-400 line-through"
            data-testid="product-original-price"
          >
            {convertToLocale({
              amount: originalPrice,
              currency_code: currencyCode,
            })}
          </span>
          {style === "default" && (
            <span className="font-bold text-orbis-600">
              -{getPercentageDiff(originalPrice, currentPrice || 0)}%
            </span>
          )}
        </div>
      )}
      <span
        className={clx("text-sm font-bold tabular-nums tracking-tight", {
          "text-orbis-600": hasReducedPrice,
          "text-ink-900": !hasReducedPrice,
        })}
        data-testid="product-price"
      >
        {convertToLocale({
          amount: currentPrice,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemPrice
