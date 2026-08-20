"use client"

import { signup } from "@lib/data/customer"
import AuthShell from "@modules/account/components/auth-shell"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <AuthShell
      eyebrow="Account"
      title="Create your account"
      description="Check out faster, keep your addresses on file and track every order."
      data-testid="register-page"
      footer={
        <>
          Already have an account?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="font-bold text-orbis-600 underline-offset-4 transition-colors hover:text-orbis-700 hover:underline"
          >
            Sign in
          </button>
        </>
      }
    >
      <form className="flex w-full flex-col gap-y-4" action={formAction}>
        <div className="grid grid-cols-1 gap-4 xsmall:grid-cols-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
        </div>
        <Input
          label="Email"
          name="email"
          required
          type="email"
          autoComplete="email"
          data-testid="email-input"
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          data-testid="phone-input"
        />
        <Input
          label="Password"
          name="password"
          required
          type="password"
          autoComplete="new-password"
          data-testid="password-input"
        />

        <ErrorMessage error={message} data-testid="register-error" />

        <SubmitButton className="mt-2 w-full" data-testid="register-button">
          Create account
        </SubmitButton>

        <p className="text-center text-xs leading-relaxed text-ink-500">
          By creating an account you agree to Orbis Square&apos;s{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="text-ink-900 underline underline-offset-2 hover:text-orbis-600"
          >
            privacy policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="text-ink-900 underline underline-offset-2 hover:text-orbis-600"
          >
            terms of use
          </LocalizedClientLink>
          .
        </p>
      </form>
    </AuthShell>
  )
}

export default Register
