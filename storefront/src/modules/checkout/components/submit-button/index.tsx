"use client"

import { clx } from "@medusajs/ui"
import React from "react"
import { useFormStatus } from "react-dom"

import Spinner from "@modules/common/icons/spinner"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      data-testid={dataTestId}
      className={clx(
        "inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-bold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        {
          "bg-orbis-600 text-white hover:bg-orbis-700":
            variant === "primary" || variant === null,
          "border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white":
            variant === "secondary" || variant === "transparent",
          "bg-rose-600 text-white hover:bg-rose-700": variant === "danger",
        },
        className
      )}
    >
      {pending && <Spinner />}
      {children}
    </button>
  )
}
