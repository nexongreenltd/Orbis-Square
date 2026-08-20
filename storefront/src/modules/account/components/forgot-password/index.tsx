"use client"

import { requestPasswordReset } from "@lib/data/customer"
import AuthShell from "@modules/account/components/auth-shell"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"

const ForgotPassword = () => {
  const [state, formAction] = useActionState(requestPasswordReset, {
    success: false,
    error: null,
  })

  if (state.success) {
    return (
      <AuthShell
        eyebrow="Account"
        title="Check your email"
        description={
          state.email
            ? `If ${state.email} belongs to an Orbis Square account, a link to set a new password is on its way.`
            : "If that address belongs to an Orbis Square account, a link to set a new password is on its way."
        }
        data-testid="forgot-password-sent"
        footer={
          <LocalizedClientLink
            href="/account"
            className="font-bold text-orbis-600 underline-offset-4 transition-colors hover:text-orbis-700 hover:underline"
          >
            Back to sign in
          </LocalizedClientLink>
        }
      >
        <p className="text-sm leading-relaxed text-ink-600">
          The link is valid for a short time. If it hasn&apos;t arrived in a few
          minutes, check your spam folder or request another one.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Account"
      title="Reset your password"
      description="Enter the email address on your account and we'll send you a link to set a new password."
      data-testid="forgot-password-page"
      footer={
        <>
          Remembered it?{" "}
          <LocalizedClientLink
            href="/account"
            className="font-bold text-orbis-600 underline-offset-4 transition-colors hover:text-orbis-700 hover:underline"
          >
            Back to sign in
          </LocalizedClientLink>
        </>
      }
    >
      <form className="flex w-full flex-col gap-y-4" action={formAction}>
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          required
          data-testid="email-input"
        />

        <ErrorMessage
          error={state.error}
          data-testid="forgot-password-error-message"
        />

        <SubmitButton
          className="mt-2 w-full"
          data-testid="send-reset-link-button"
        >
          Send reset link
        </SubmitButton>
      </form>
    </AuthShell>
  )
}

export default ForgotPassword
