import { cookies as nextCookies } from "next/headers"

import { HttpTypes } from "@medusajs/types"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import PaymentDetails from "@modules/order/components/payment-details"
import ShippingDetails from "@modules/order/components/shipping-details"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <>
      <div className="border-b border-ink-900 bg-canvas-surface">
        <div className="content-container max-w-4xl py-12">
          <span className="eyebrow">Order confirmed</span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-ink-900">
            Thank you{order.shipping_address?.first_name ? `, ${order.shipping_address.first_name}` : ""}.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-600">
            Your order was placed successfully. We&apos;ll email you again once
            it ships from Dhaka.
          </p>
        </div>
      </div>

      <div className="content-container max-w-4xl py-10">
        <div
          className="flex flex-col gap-6"
          data-testid="order-complete-container"
        >
          {isOnboarding && <OnboardingCta orderId={order.id} />}

          <OrderDetails order={order} />

          <div className="border border-ink-900 bg-canvas">
            <div className="border-b border-ink-900 px-5 py-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-900">
                Summary
              </h2>
            </div>
            <Items order={order} />
            <div className="border-t border-ink-200 p-5">
              <CartTotals totals={order} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 small:grid-cols-2">
            <ShippingDetails order={order} />
            <PaymentDetails order={order} />
          </div>

          <div className="flex flex-col gap-4 border border-ink-200 bg-canvas-surface p-5 xsmall:flex-row xsmall:items-center xsmall:justify-between">
            <Help />
            <LocalizedClientLink
              href="/store"
              className="inline-flex h-11 shrink-0 items-center justify-center border border-ink-900 px-5 text-xs font-bold uppercase tracking-[0.08em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            >
              Continue shopping
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </>
  )
}
