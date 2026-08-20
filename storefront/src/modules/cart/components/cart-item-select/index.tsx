"use client"

import { clx } from "@medusajs/ui"
import {
  SelectHTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react"

import ChevronDown from "@modules/common/icons/chevron-down"

type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">

const CartItemSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Select...", className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    return (
      <div
        className={clx(
          "relative flex h-10 w-[74px] items-center border border-ink-900 bg-canvas text-ink-900 transition-colors focus-within:border-orbis-600",
          className
        )}
      >
        <select
          ref={innerRef}
          {...props}
          className="h-full w-full appearance-none bg-transparent pl-3 pr-8 text-sm font-bold tabular-nums outline-none"
        >
          <option disabled value="">
            {placeholder}
          </option>
          {children}
        </select>
        <span className="pointer-events-none absolute right-2 flex text-ink-500">
          <ChevronDown />
        </span>
      </div>
    )
  }
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
