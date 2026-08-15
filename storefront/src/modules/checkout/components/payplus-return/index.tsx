"use client"

import { useEffect, useRef, useState } from "react"

import { placeOrder } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Completes the cart once the customer is back from PayPlus.
 *
 * `placeOrder` redirects to the confirmation page on success, so the only
 * states this component renders are "working" and "something went wrong".
 */
export default function PayPlusReturnConfirm({ cartId }: { cartId: string }) {
  const [error, setError] = useState<string | null>(null)
  const attempted = useRef(false)

  useEffect(() => {
    // React runs effects twice in dev; completing a cart twice would error.
    if (attempted.current) {
      return
    }
    attempted.current = true

    placeOrder(cartId).catch((e: unknown) => {
      setError(
        e instanceof Error
          ? e.message
          : "We could not confirm this payment automatically."
      )
    })
  }, [cartId])

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-ink-500">
          {error} If PayPlus took your payment, it will be matched to your order
          automatically — please check your orders before paying again.
        </p>
        <div className="flex flex-col gap-3 xsmall:flex-row">
          <LocalizedClientLink
            href="/account/orders"
            className="inline-flex h-11 items-center justify-center rounded-full bg-orbis-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-orbis-500"
          >
            Check my orders
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/checkout?step=payment"
            className="inline-flex h-11 items-center justify-center rounded-full border border-ink-900/15 px-6 text-sm font-semibold text-ink-900 transition-colors hover:bg-grey-5"
          >
            Back to checkout
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm text-ink-500">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-orbis-600 border-t-transparent"
      />
      Confirming with PayPlus…
    </div>
  )
}
