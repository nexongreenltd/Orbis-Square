"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { useToggleState } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import StepContainer from "@modules/checkout/components/step-container"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const SummaryBlock = ({
  title,
  children,
  "data-testid": dataTestid,
}: {
  title: string
  children: React.ReactNode
  "data-testid"?: string
}) => (
  <div className="flex flex-col gap-y-0.5" data-testid={dataTestid}>
    <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
      {title}
    </span>
    {children}
  </div>
)

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  const complete = !!cart?.shipping_address

  return (
    <StepContainer
      step={1}
      title="Shipping address"
      active={isOpen}
      complete={complete}
      onEdit={!isOpen && complete ? handleEdit : undefined}
      editTestId="edit-address-button"
    >
      {isOpen ? (
        <form action={formAction}>
          <ShippingAddress
            customer={customer}
            checked={sameAsBilling}
            onChange={toggleSameAsBilling}
            cart={cart}
          />

          {!sameAsBilling && (
            <div className="mt-8 border-t border-ink-200 pt-6">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
                Billing address
              </h3>
              <BillingAddress cart={cart} />
            </div>
          )}

          <SubmitButton className="mt-8" data-testid="submit-address-button">
            Continue to delivery
          </SubmitButton>
          <ErrorMessage error={message} data-testid="address-error-message" />
        </form>
      ) : cart && cart.shipping_address ? (
        <div className="grid grid-cols-1 gap-6 text-sm text-ink-600 small:grid-cols-3">
          <SummaryBlock
            title="Ship to"
            data-testid="shipping-address-summary"
          >
            <span className="font-bold text-ink-900">
              {cart.shipping_address.first_name}{" "}
              {cart.shipping_address.last_name}
            </span>
            <span>
              {cart.shipping_address.address_1}{" "}
              {cart.shipping_address.address_2}
            </span>
            <span>
              {cart.shipping_address.postal_code}, {cart.shipping_address.city}
            </span>
            <span>{cart.shipping_address.country_code?.toUpperCase()}</span>
          </SummaryBlock>

          <SummaryBlock title="Contact" data-testid="shipping-contact-summary">
            <span>{cart.shipping_address.phone}</span>
            <span>{cart.email}</span>
          </SummaryBlock>

          <SummaryBlock title="Bill to" data-testid="billing-address-summary">
            {sameAsBilling ? (
              <span>Same as the delivery address.</span>
            ) : (
              <>
                <span className="font-bold text-ink-900">
                  {cart.billing_address?.first_name}{" "}
                  {cart.billing_address?.last_name}
                </span>
                <span>
                  {cart.billing_address?.address_1}{" "}
                  {cart.billing_address?.address_2}
                </span>
                <span>
                  {cart.billing_address?.postal_code},{" "}
                  {cart.billing_address?.city}
                </span>
                <span>{cart.billing_address?.country_code?.toUpperCase()}</span>
              </>
            )}
          </SummaryBlock>
        </div>
      ) : (
        <Spinner />
      )}
    </StepContainer>
  )
}

export default Addresses
