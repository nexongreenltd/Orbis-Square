"use client"

import { useSearchParams } from "next/navigation"

import StepContainer from "@modules/checkout/components/step-container"
import PaymentButton from "../payment-button"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  const ready = isOpen && previousStepsCompleted

  return (
    <StepContainer step={4} title="Review" active={isOpen} complete={!!ready}>
      {ready ? (
        <>
          <p className="mb-6 text-sm leading-relaxed text-ink-600">
            By placing this order you confirm that you have read and accept the
            Orbis Square terms of sale, returns policy and privacy policy.
          </p>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      ) : null}
    </StepContainer>
  )
}

export default Review
