"use client"

import { clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const isFull = type === "full"
  const productLink = `/products/${item.product_handle}`

  return (
    <li
      className="border-b border-ink-200 last:border-b-0"
      data-testid="product-row"
    >
      <div
        className={clx(
          "grid items-start gap-x-4 gap-y-3 p-4",
          "grid-cols-[auto_minmax(0,1fr)_auto]",
          {
            "small:grid-cols-[auto_minmax(0,1fr)_168px_120px_130px]": isFull,
            "small:grid-cols-[auto_minmax(0,1fr)_auto]": !isFull,
          }
        )}
      >
        <LocalizedClientLink
          href={productLink}
          className={clx(
            "group block self-start border border-ink-900",
            {
              "w-14": !isFull,
              "w-16 row-span-2 small:row-span-1 small:w-20": isFull,
            }
          )}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="border-0 shadow-none"
          />
        </LocalizedClientLink>

        <div
          className={clx("col-start-2 flex min-w-0 flex-col gap-1", {
            "col-span-2 small:col-span-1": isFull,
          })}
        >
          <LocalizedClientLink
            href={productLink}
            className="text-sm font-bold leading-snug text-ink-900 transition-colors hover:text-orbis-600"
            data-testid="product-title"
          >
            {item.product_title}
          </LocalizedClientLink>
          <LineItemOptions
            variant={item.variant}
            data-testid="product-variant"
          />
          {!isFull && (
            <div className="mt-1 flex items-baseline gap-x-1 text-xs text-ink-500">
              <span>{item.quantity} ×</span>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </div>
          )}
        </div>

        {isFull && (
          <div className="col-start-2 self-center small:col-start-3 small:self-start">
            <div className="flex items-center gap-2">
              <CartItemSelect
                value={item.quantity}
                onChange={(value) =>
                  changeQuantity(parseInt(value.target.value))
                }
                data-testid="product-select-button"
              >
                {/* TODO: Update this with the v2 way of managing inventory */}
                {Array.from({ length: Math.min(maxQuantity, 10) }, (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                ))}
              </CartItemSelect>
              <DeleteButton
                id={item.id}
                className="text-ink-500 hover:text-orbis-600"
                data-testid="product-delete-button"
              />
              {updating && <Spinner />}
            </div>
            <ErrorMessage error={error} data-testid="product-error-message" />
          </div>
        )}

        {isFull && (
          <div className="hidden text-right small:col-start-4 small:block">
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </div>
        )}

        <div
          className={clx("col-start-3 self-center text-right", {
            "small:col-start-5 small:self-start": isFull,
          })}
        >
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </div>
      </div>
    </li>
  )
}

export default Item
