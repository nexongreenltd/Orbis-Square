import { clx } from "@medusajs/ui"
import React, { useEffect, useImperativeHandle, useState } from "react"

import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { type, name, label, touched, required, topLabel, className, ...props },
    ref
  ) => {
    const fieldId = props.id ?? name
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }

      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex w-full flex-col gap-y-1.5">
        <label
          htmlFor={fieldId}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500"
        >
          {topLabel ?? label}
          {required && <span className="text-orbis-600"> *</span>}
        </label>
        <div className="relative flex w-full">
          <input
            id={fieldId}
            type={inputType}
            name={name}
            required={required}
            {...props}
            className={clx(
              "h-11 w-full appearance-none border border-ink-200 bg-canvas px-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-orbis-600",
              className
            )}
            ref={inputRef}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-500 outline-none transition-colors hover:text-ink-900"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
