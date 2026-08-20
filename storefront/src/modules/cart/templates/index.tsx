import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const itemCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0

  return (
    <>
      <div className="border-b border-ink-900 bg-canvas-surface">
        <div className="content-container py-10">
          <span className="eyebrow">Your order</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink-900">
            Cart
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {itemCount
              ? `${itemCount} item${itemCount === 1 ? "" : "s"} ready to check out.`
              : "Nothing here yet."}
          </p>
        </div>
      </div>

      <div className="content-container py-10" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 items-start gap-8 small:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-6">
              {!customer && <SignInPrompt />}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="small:sticky small:top-8">
              {cart && cart.region && <Summary cart={cart as any} />}
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </>
  )
}

export default CartTemplate
