import React from "react"

import Logo from "@modules/common/icons/logo"

type AuthShellProps = {
  /** Small uppercase label above the title. */
  eyebrow: string
  title: string
  description?: string
  children: React.ReactNode
  /** Sign in / register cross-links, rendered under the card. */
  footer?: React.ReactNode
  "data-testid"?: string
}

/**
 * The frame shared by every customer auth screen — sign in, register, and the
 * two password-reset steps — so they read as one flow rather than four pages.
 */
const AuthShell = ({
  eyebrow,
  title,
  description,
  children,
  footer,
  "data-testid": dataTestid,
}: AuthShellProps) => {
  return (
    <div className="mx-auto w-full max-w-md" data-testid={dataTestid}>
      <div className="border border-ink-900 bg-canvas-surface">
        <div className="flex flex-col items-center border-b border-ink-900 px-6 py-8 text-center">
          <Logo size={44} />
          <span className="eyebrow mt-5">{eyebrow}</span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-sm text-sm text-ink-600">{description}</p>
          )}
        </div>

        <div className="p-6">{children}</div>
      </div>

      {footer && (
        <div className="mt-4 text-center text-sm text-ink-600">{footer}</div>
      )}
    </div>
  )
}

export default AuthShell
