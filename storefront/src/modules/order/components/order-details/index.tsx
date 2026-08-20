import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const Field = ({
  label,
  children,
  accent,
}: {
  label: string
  children: React.ReactNode
  accent?: boolean
}) => (
  <div className="flex flex-col gap-y-1 p-5">
    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
      {label}
    </span>
    <span
      className={
        accent
          ? "text-sm font-bold text-orbis-600"
          : "text-sm font-bold text-ink-900"
      }
    >
      {children}
    </span>
  </div>
)

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="grid grid-cols-1 divide-y divide-ink-200 border border-ink-200 bg-canvas-surface xsmall:grid-cols-2 xsmall:divide-x xsmall:divide-y-0 small:grid-cols-3">
      <Field label="Order number" accent>
        <span data-testid="order-id">#{order.display_id}</span>
      </Field>
      <Field label="Order date">
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </Field>
      <Field label="Confirmation sent to">
        <span className="break-all" data-testid="order-email">
          {order.email}
        </span>
      </Field>

      {showStatus && (
        <>
          <Field label="Order status">
            <span data-testid="order-status">
              {formatStatus(order.fulfillment_status)}
            </span>
          </Field>
          <Field label="Payment status">
            <span data-testid="order-payment-status">
              {formatStatus(order.payment_status)}
            </span>
          </Field>
        </>
      )}
    </div>
  )
}

export default OrderDetails
