"use client"

import { RadioGroup } from "@headlessui/react"
import { isManual, isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CreditCard } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import StepContainer from "@modules/checkout/components/step-container"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeLike(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const summaryLabel =
    "mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500"

  const giftcardSummary = (
    <div className="flex flex-col">
      <span className={summaryLabel}>Payment method</span>
      <span className="text-sm text-ink-700" data-testid="payment-method-summary">
        Gift card
      </span>
    </div>
  )

  return (
    <StepContainer
      step={3}
      title="Payment"
      active={isOpen}
      complete={!!paymentReady}
      onEdit={!isOpen && paymentReady ? handleEdit : undefined}
      editTestId="edit-payment-button"
    >
      {isOpen ? (
        <>
          {!paidByGiftcard && (availablePaymentMethods?.length ?? 0) > 0 && (
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(value: string) => setPaymentMethod(value)}
            >
              {availablePaymentMethods.map((paymentMethod) => (
                <div key={paymentMethod.id}>
                  {isStripeLike(paymentMethod.id) ? (
                    <StripeCardContainer
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                      paymentInfoMap={paymentInfoMap}
                      setCardBrand={setCardBrand}
                      setError={setError}
                      setCardComplete={setCardComplete}
                    />
                  ) : (
                    <PaymentContainer
                      paymentInfoMap={paymentInfoMap}
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                    />
                  )}
                </div>
              ))}
            </RadioGroup>
          )}

          {paidByGiftcard && giftcardSummary}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
            className="mt-6 inline-flex h-12 items-center justify-center bg-orbis-600 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-orbis-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400 disabled:hover:bg-ink-200"
          >
            {!activeSession && isStripeLike(selectedPaymentMethod)
              ? "Enter card details"
              : "Continue to review"}
          </button>
        </>
      ) : cart && paymentReady && activeSession ? (
        <div className="grid grid-cols-1 gap-6 small:grid-cols-2">
          <div className="flex flex-col">
            <span className={summaryLabel}>Payment method</span>
            <span
              className="text-sm text-ink-700"
              data-testid="payment-method-summary"
            >
              {paymentInfoMap[activeSession?.provider_id]?.title ||
                activeSession?.provider_id}
            </span>
          </div>
          <div className="flex flex-col">
            <span className={summaryLabel}>Payment details</span>
            <div
              className="flex items-center gap-x-2 text-sm text-ink-700"
              data-testid="payment-details-summary"
            >
              <span className="flex h-7 w-7 items-center justify-center border border-ink-200 bg-canvas text-ink-900">
                {paymentInfoMap[selectedPaymentMethod]?.icon || <CreditCard />}
              </span>
              <span>
                {isStripeLike(selectedPaymentMethod) && cardBrand
                  ? cardBrand
                  : isManual(selectedPaymentMethod)
                    ? "Pay in cash when your order arrives."
                    : "You will be asked to complete payment after placing the order."}
              </span>
            </div>
          </div>
        </div>
      ) : paidByGiftcard ? (
        giftcardSummary
      ) : null}
    </StepContainer>
  )
}

export default Payment
