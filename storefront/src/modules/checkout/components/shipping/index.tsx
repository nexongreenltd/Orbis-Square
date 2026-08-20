"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import MedusaRadio from "@modules/common/components/radio"
import StepContainer from "@modules/checkout/components/step-container"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function formatAddress(address: HttpTypes.StoreCartAddress) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      }
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(currentId)

        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const optionRow = (opts: {
    key?: string
    value: string
    selected: boolean
    disabled?: boolean
    title: string
    subtitle?: string
    price: React.ReactNode
  }) => (
    <Radio
      key={opts.key ?? opts.value}
      value={opts.value}
      data-testid="delivery-option-radio"
      disabled={opts.disabled}
      className={clx(
        "mb-2 flex cursor-pointer items-center justify-between gap-x-4 border px-4 py-3.5 text-sm transition-colors last:mb-0",
        {
          "border-orbis-600 bg-orbis-100": opts.selected,
          "border-ink-200 bg-canvas hover:border-ink-500":
            !opts.selected && !opts.disabled,
          "cursor-not-allowed border-ink-200 bg-canvas opacity-50":
            opts.disabled,
        }
      )}
    >
      <span className="flex items-start gap-x-3">
        <MedusaRadio checked={opts.selected} />
        <span className="flex flex-col">
          <span className="font-bold text-ink-900">{opts.title}</span>
          {opts.subtitle && (
            <span className="text-xs text-ink-500">{opts.subtitle}</span>
          )}
        </span>
      </span>
      <span className="shrink-0 text-sm font-bold tabular-nums text-ink-900">
        {opts.price}
      </span>
    </Radio>
  )

  const complete = (cart.shipping_methods?.length ?? 0) > 0
  const canEdit =
    !isOpen && !!cart?.shipping_address && !!cart?.billing_address && !!cart?.email

  return (
    <StepContainer
      step={2}
      title="Delivery"
      active={isOpen}
      complete={complete}
      onEdit={canEdit ? handleEdit : undefined}
      editTestId="edit-delivery-button"
    >
      {isOpen ? (
        <>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-ink-900">
              Shipping method
            </span>
            <span className="mb-4 text-xs text-ink-500">
              How would you like your order delivered?
            </span>
          </div>

          <div data-testid="delivery-options-container">
            {hasPickupOptions && (
              <RadioGroup
                value={showPickupOptions}
                onChange={() => {
                  const id = _pickupMethods.find(
                    (option) => !option.insufficient_inventory
                  )?.id

                  if (id) {
                    handleSetShippingMethod(id, "pickup")
                  }
                }}
                className="mb-2"
              >
                {optionRow({
                  value: PICKUP_OPTION_ON,
                  selected: showPickupOptions === PICKUP_OPTION_ON,
                  title: "Pick up your order",
                  price: "—",
                })}
              </RadioGroup>
            )}

            <RadioGroup
              value={shippingMethodId}
              onChange={(v) => {
                if (v) {
                  return handleSetShippingMethod(v, "shipping")
                }
              }}
            >
              {_shippingMethods?.map((option) => {
                const isDisabled =
                  option.price_type === "calculated" &&
                  !isLoadingPrices &&
                  typeof calculatedPricesMap[option.id] !== "number"

                return optionRow({
                  value: option.id,
                  selected: option.id === shippingMethodId,
                  disabled: isDisabled,
                  title: option.name,
                  price:
                    option.price_type === "flat" ? (
                      convertToLocale({
                        amount: option.amount!,
                        currency_code: cart?.currency_code,
                      })
                    ) : calculatedPricesMap[option.id] ? (
                      convertToLocale({
                        amount: calculatedPricesMap[option.id],
                        currency_code: cart?.currency_code,
                      })
                    ) : isLoadingPrices ? (
                      <Loader />
                    ) : (
                      "—"
                    ),
                })
              })}
            </RadioGroup>
          </div>

          {showPickupOptions === PICKUP_OPTION_ON && (
            <div className="mt-6">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-ink-900">Store</span>
                <span className="mb-4 text-xs text-ink-500">
                  Choose a store near you
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <RadioGroup
                  value={shippingMethodId}
                  onChange={(v) => {
                    if (v) {
                      return handleSetShippingMethod(v, "pickup")
                    }
                  }}
                >
                  {_pickupMethods?.map((option) =>
                    optionRow({
                      value: option.id,
                      selected: option.id === shippingMethodId,
                      disabled: option.insufficient_inventory,
                      title: option.name,
                      subtitle: formatAddress(
                        option.service_zone?.fulfillment_set?.location?.address
                      ),
                      price: convertToLocale({
                        amount: option.amount!,
                        currency_code: cart?.currency_code,
                      }),
                    })
                  )}
                </RadioGroup>
              </div>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!cart.shipping_methods?.[0] || isLoading}
            data-testid="submit-delivery-option-button"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 bg-orbis-600 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-orbis-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400 disabled:hover:bg-ink-200"
          >
            {isLoading && <Loader className="animate-spin" />}
            Continue to payment
          </button>
        </>
      ) : complete ? (
        <div className="flex flex-col gap-y-0.5 text-sm text-ink-600">
          <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
            Method
          </span>
          <span>
            {cart.shipping_methods!.at(-1)!.name}{" "}
            <span className="font-bold text-ink-900">
              {convertToLocale({
                amount: cart.shipping_methods!.at(-1)!.amount!,
                currency_code: cart?.currency_code,
              })}
            </span>
          </span>
        </div>
      ) : null}
    </StepContainer>
  )
}

export default Shipping
