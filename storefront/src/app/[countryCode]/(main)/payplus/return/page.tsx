import { Metadata } from "next"

import { retrieveCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PayPlusReturnConfirm from "@modules/checkout/components/payplus-return"

export const metadata: Metadata = {
  title: "Confirming your payment",
  description: "Finishing your PayPlus payment with Orbis Square.",
}

/**
 * Landing page for customers coming back from the PayPlus hosted checkout.
 *
 * PayPlus authorises asynchronously, so arriving here does not by itself mean
 * the payment cleared — the IPN webhook is the source of truth. This page asks
 * Medusa to complete the cart; if the gateway has not confirmed yet the order
 * is created in an "awaiting payment" state and the webhook settles it later.
 */
export default async function PayPlusReturnPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const rawStatus = searchParams.status
  const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus

  const cancelled = ["cancelled", "canceled", "failed"].includes(
    (status ?? "").toLowerCase()
  )

  const cart = await retrieveCart().catch(() => null)

  if (cancelled) {
    return (
      <Shell
        title="Payment not completed"
        body="You came back from PayPlus without finishing the payment. Your cart is still saved — nothing has been charged."
      >
        <LocalizedClientLink
          href="/checkout?step=payment"
          className="inline-flex h-11 items-center justify-center rounded-full bg-orbis-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-orbis-500"
        >
          Try paying again
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/cart"
          className="inline-flex h-11 items-center justify-center rounded-full border border-ink-900/15 px-6 text-sm font-semibold text-ink-900 transition-colors hover:bg-grey-5"
        >
          Back to cart
        </LocalizedClientLink>
      </Shell>
    )
  }

  if (!cart) {
    return (
      <Shell
        title="This payment is already finished"
        body="We could not find an open cart for this payment. If you completed a purchase, it will be listed in your account."
      >
        <LocalizedClientLink
          href="/account/orders"
          className="inline-flex h-11 items-center justify-center rounded-full bg-orbis-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-orbis-500"
        >
          View my orders
        </LocalizedClientLink>
      </Shell>
    )
  }

  return (
    <Shell
      title="Confirming your payment"
      body="Hold on while we check with PayPlus and place your order. This usually takes a few seconds."
    >
      <PayPlusReturnConfirm cartId={cart.id} />
    </Shell>
  )
}

function Shell({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children: React.ReactNode
}) {
  return (
    <div className="content-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900 small:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">{body}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 xsmall:flex-row">
          {children}
        </div>
      </div>
    </div>
  )
}
