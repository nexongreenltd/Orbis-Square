import { HttpTypes } from "@medusajs/types"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <li
      className="border-b border-ink-200 last:border-b-0"
      data-testid="product-row"
    >
      <div className="flex items-start gap-4 p-4">
        <div className="w-16 shrink-0 border border-ink-900">
          <Thumbnail
            thumbnail={item.thumbnail}
            size="square"
            className="border-0 shadow-none"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className="text-sm font-bold leading-snug text-ink-900"
            data-testid="product-name"
          >
            {item.product_title}
          </span>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="flex items-baseline gap-x-1 text-xs text-ink-500">
            <span data-testid="product-quantity">{item.quantity}</span>
            <span>×</span>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </div>
      </div>
    </li>
  )
}

export default Item
