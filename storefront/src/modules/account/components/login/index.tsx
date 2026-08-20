import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import AuthShell from "@modules/account/components/auth-shell"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <AuthShell
      eyebrow="Account"
      title="Welcome back"
      description="Sign in for faster checkout, saved addresses and your order history."
      data-testid="login-page"
      footer={
        <>
          Not a member yet?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="font-bold text-orbis-600 underline-offset-4 transition-colors hover:text-orbis-700 hover:underline"
            data-testid="register-button"
          >
            Create an account
          </button>
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
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          data-testid="password-input"
        />

        <LocalizedClientLink
          href="/forgot-password"
          className="self-start text-xs font-bold uppercase tracking-[0.08em] text-orbis-600 transition-colors hover:text-orbis-700"
          data-testid="forgot-password-link"
        >
          Forgot your password?
        </LocalizedClientLink>

        <ErrorMessage error={message} data-testid="login-error-message" />

        <SubmitButton data-testid="sign-in-button" className="mt-2 w-full">
          Sign in
        </SubmitButton>
      </form>
    </AuthShell>
  )
}

export default Login
