"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  return (
    <div>
      <div className="flex flex-col gap-y-2.5 text-sm text-ink-600">
        <div className="flex items-center justify-between gap-x-4">
          <span>Subtotal</span>
          <span
            className="tabular-nums text-ink-900"
            data-testid="cart-subtotal"
            data-value={item_subtotal || 0}
          >
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-x-4">
          <span>Shipping</span>
          <span
            className="tabular-nums text-ink-900"
            data-testid="cart-shipping"
            data-value={shipping_subtotal || 0}
          >
            {shipping_subtotal
              ? convertToLocale({
                  amount: shipping_subtotal,
                  currency_code,
                })
              : "Calculated at checkout"}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between gap-x-4">
            <span>Discount</span>
            <span
              className="font-bold tabular-nums text-orbis-600"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              −{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-x-4">
          <span>Taxes</span>
          <span
            className="tabular-nums text-ink-900"
            data-testid="cart-taxes"
            data-value={tax_total || 0}
          >
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-x-4 border-t border-ink-900 pt-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-900">
          Total
        </span>
        <span
          className="text-2xl font-extrabold tabular-nums tracking-tight text-ink-900"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CartTotals
