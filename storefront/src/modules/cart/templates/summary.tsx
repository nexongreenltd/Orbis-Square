"use client"

import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="border border-ink-900 bg-canvas-surface">
      <div className="border-b border-ink-900 px-5 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-900">
          Order summary
        </h2>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <CartTotals totals={cart} />

        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
          className="group flex h-12 items-center justify-between bg-orbis-600 px-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-orbis-700"
        >
          Go to checkout
          <span
            aria-hidden
            className="transition-transform duration-150 group-hover:translate-x-1"
          >
            →
          </span>
        </LocalizedClientLink>

        <DiscountCode cart={cart} />
      </div>

      <div className="border-t border-ink-200 px-5 py-3">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-600">
          <span aria-hidden className="h-2 w-2 shrink-0 bg-orbis-600" />
          PayPlus or cash on delivery · shipped from Dhaka.
        </span>
      </div>
    </div>
  )
}

export default Summary
