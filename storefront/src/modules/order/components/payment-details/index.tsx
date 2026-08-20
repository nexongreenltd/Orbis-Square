import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const info = payment ? paymentInfoMap[payment.provider_id] : undefined

  return (
    <section className="flex h-full flex-col border border-ink-200 bg-canvas-surface">
      <div className="border-b border-ink-200 px-5 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-900">
          Payment
        </h2>
      </div>

      {payment && (
        <div className="flex flex-col gap-5 p-5 text-sm text-ink-600">
          <div className="flex flex-col gap-y-0.5">
            <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
              Method
            </span>
            <span
              className="font-bold text-ink-900"
              data-testid="payment-method"
            >
              {info?.title ?? payment.provider_id}
            </span>
          </div>

          <div className="flex flex-col gap-y-0.5">
            <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
              Details
            </span>
            <span className="flex items-center gap-x-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink-200 bg-canvas text-ink-900">
                {info?.icon}
              </span>
              <span data-testid="payment-amount">
                {isStripeLike(payment.provider_id) && payment.data?.card_last4
                  ? `**** **** **** ${payment.data.card_last4}`
                  : `${convertToLocale({
                      amount: payment.amount,
                      currency_code: order.currency_code,
                    })} paid on ${new Date(
                      payment.created_at ?? ""
                    ).toLocaleDateString()}`}
              </span>
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

export default PaymentDetails
