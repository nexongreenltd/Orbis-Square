import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const Block = ({
  label,
  children,
  "data-testid": dataTestid,
}: {
  label: string
  children: React.ReactNode
  "data-testid"?: string
}) => (
  <div className="flex flex-col gap-y-0.5" data-testid={dataTestid}>
    <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
      {label}
    </span>
    {children}
  </div>
)

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const method = (order as any).shipping_methods?.[0]

  return (
    <section className="flex h-full flex-col border border-ink-200 bg-canvas-surface">
      <div className="border-b border-ink-200 px-5 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-900">
          Delivery
        </h2>
      </div>
      <div className="flex flex-col gap-5 p-5 text-sm text-ink-600">
        <Block label="Ship to" data-testid="shipping-address-summary">
          <span className="font-bold text-ink-900">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </span>
          <span>
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </span>
          <span>
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </span>
          <span>{order.shipping_address?.country_code?.toUpperCase()}</span>
        </Block>

        <Block label="Contact" data-testid="shipping-contact-summary">
          <span>{order.shipping_address?.phone}</span>
          <span className="break-all">{order.email}</span>
        </Block>

        {method && (
          <Block label="Method" data-testid="shipping-method-summary">
            <span>
              {method.name}{" "}
              <span className="font-bold text-ink-900">
                {convertToLocale({
                  amount: method.total ?? 0,
                  currency_code: order.currency_code,
                })}
              </span>
            </span>
          </Block>
        )}
      </div>
    </section>
  )
}

export default ShippingDetails
