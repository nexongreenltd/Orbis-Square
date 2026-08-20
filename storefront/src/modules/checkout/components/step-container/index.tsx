"use client"

import { clx } from "@medusajs/ui"
import React from "react"

type StepContainerProps = {
  /** 1-based position, shown in the step marker until the step is complete. */
  step: number
  title: string
  /** The step the customer is currently working on. */
  active?: boolean
  /** The step has usable data behind it and can be revisited. */
  complete?: boolean
  onEdit?: () => void
  editTestId?: string
  children?: React.ReactNode
}

const StepContainer = ({
  step,
  title,
  active = false,
  complete = false,
  onEdit,
  editTestId,
  children,
}: StepContainerProps) => {
  const reachable = active || complete

  return (
    <section
      className={clx("border bg-canvas-surface transition-colors", {
        "border-ink-900": active,
        "border-ink-200": !active,
      })}
    >
      <div
        className={clx(
          "flex items-center justify-between gap-x-4 border-b px-5 py-3",
          {
            "border-ink-900": active,
            "border-ink-200": !active,
          }
        )}
      >
        <div className="flex items-center gap-x-3">
          <span
            aria-hidden
            className={clx(
              "flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-bold",
              {
                "bg-orbis-600 text-white": active,
                "bg-ink-900 text-white": !active && complete,
                "border border-ink-300 text-ink-400": !reachable,
              }
            )}
          >
            {complete && !active ? (
              <svg
                viewBox="0 0 12 12"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6.5 4.5 9 10 3.5" />
              </svg>
            ) : (
              step
            )}
          </span>
          <h2
            className={clx(
              "text-[11px] font-bold uppercase tracking-[0.12em]",
              reachable ? "text-ink-900" : "text-ink-400"
            )}
          >
            {title}
          </h2>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            data-testid={editTestId}
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-orbis-600 transition-colors hover:text-orbis-700"
          >
            Edit
          </button>
        )}
      </div>

      {children && <div className="p-5 small:p-6">{children}</div>}
    </section>
  )
}

export default StepContainer
