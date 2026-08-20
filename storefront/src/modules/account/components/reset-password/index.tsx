"use client"

import { resetPassword } from "@lib/data/customer"
import AuthShell from "@modules/account/components/auth-shell"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"

type Props = {
  /** Both arrive on the query string of the emailed link. */
  token?: string
  email?: string
}

const ResetPassword = ({ token, email }: Props) => {
  const [state, formAction] = useActionState(resetPassword, {
    success: false,
    error: null,
  })

  if (!token || !email) {
    return (
      <AuthShell
        eyebrow="Account"
        title="That reset link isn't valid"
        description="The link is missing information it needs. Request a new one and try again."
        data-testid="reset-password-invalid"
        footer={
          <LocalizedClientLink
            href="/forgot-password"
            className="font-bold text-orbis-600 underline-offset-4 transition-colors hover:text-orbis-700 hover:underline"
          >
            Request a new link
          </LocalizedClientLink>
        }
      >
        <p className="text-sm leading-relaxed text-ink-600">
          Reset links expire after a short time, and each one can only be used
          once.
        </p>
      </AuthShell>
    )
  }

  if (state.success) {
    return (
      <AuthShell
        eyebrow="Account"
        title="Password updated"
        description="You can now sign in with your new password."
        data-testid="reset-password-success"
      >
        <LocalizedClientLink
          href="/account"
          className="flex h-12 w-full items-center justify-center bg-orbis-600 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-orbis-700"
        >
          Go to sign in
        </LocalizedClientLink>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Account"
      title="Choose a new password"
      description={`Setting a new password for ${email}.`}
      data-testid="reset-password-page"
    >
      <form className="flex w-full flex-col gap-y-4" action={formAction}>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />

        <Input
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          data-testid="new-password-input"
        />
        <Input
          label="Repeat new password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          data-testid="confirm-password-input"
        />

        <ErrorMessage
          error={state.error}
          data-testid="reset-password-error-message"
        />

        <SubmitButton
          className="mt-2 w-full"
          data-testid="reset-password-button"
        >
          Set new password
        </SubmitButton>
      </form>
    </AuthShell>
  )
}

export default ResetPassword
