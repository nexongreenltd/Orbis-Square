import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const lineCount = items?.length ?? 0

  return (
    <div className="border border-ink-900 bg-canvas">
      <div className="flex items-center justify-between border-b border-ink-900 px-4 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-900">
          Items
        </h2>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
          {lineCount} product{lineCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="hidden grid-cols-[auto_minmax(0,1fr)_168px_120px_130px] items-center gap-x-4 border-b border-ink-200 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500 small:grid">
        <span className="w-20" aria-hidden />
        <span>Item</span>
        <span>Quantity</span>
        <span className="text-right">Price</span>
        <span className="text-right">Total</span>
      </div>

      <ul>
        {items
          ? items
              .sort((a, b) => {
                return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              })
              .map((item) => {
                return (
                  <Item
                    key={item.id}
                    item={item}
                    currencyCode={cart?.currency_code}
                  />
                )
              })
          : repeat(5).map((i) => {
              return <SkeletonLineItem key={i} />
            })}
      </ul>
    </div>
  )
}

export default ItemsTemplate
