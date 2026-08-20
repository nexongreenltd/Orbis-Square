import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-8 flex flex-col-reverse gap-y-8 py-8 small:flex-col small:py-0">
      <div className="border border-ink-900 bg-canvas-surface">
        <div className="border-b border-ink-900 px-5 py-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-900">
            In your cart
          </h2>
        </div>

        <div className="border-b border-ink-200">
          <ItemsPreviewTemplate cart={cart} />
        </div>

        <div className="flex flex-col gap-5 p-5">
          <CartTotals totals={cart} />
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
