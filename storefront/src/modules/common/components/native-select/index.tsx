import { clx } from "@medusajs/ui"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import ChevronDown from "@modules/common/icons/chevron-down"

export type NativeSelectProps = {
  placeholder?: string
  label?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & SelectHTMLAttributes<HTMLSelectElement>

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      placeholder = "Select...",
      label,
      defaultValue,
      className,
      children,
      required,
      name,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    useEffect(() => {
      if (innerRef.current && innerRef.current.value === "") {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [innerRef.current?.value])

    return (
      <div className="flex w-full flex-col gap-y-1.5">
        {label && (
          <label
            htmlFor={name}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500"
          >
            {label}
            {required && <span className="text-orbis-600"> *</span>}
          </label>
        )}
        <div
          onFocus={() => innerRef.current?.focus()}
          onBlur={() => innerRef.current?.blur()}
          className={clx(
            "relative flex h-11 items-center border border-ink-200 bg-canvas text-sm text-ink-900 transition-colors hover:border-ink-300 focus-within:border-orbis-600",
            className,
            {
              "text-ink-400": isPlaceholder,
            }
          )}
        >
          <select
            id={name}
            name={name}
            required={required}
            ref={innerRef}
            defaultValue={defaultValue}
            {...props}
            className="h-full flex-1 appearance-none border-none bg-transparent pl-3 pr-9 outline-none"
          >
            <option disabled value="">
              {placeholder}
            </option>
            {children}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-ink-500">
            <ChevronDown />
          </span>
        </div>
      </div>
    )
  }
)

NativeSelect.displayName = "NativeSelect"

export default NativeSelect
