import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex flex-col gap-4 border border-ink-900 bg-canvas-surface p-5 xsmall:flex-row xsmall:items-center xsmall:justify-between">
      <div>
        <h2 className="text-sm font-bold text-ink-900">
          Already have an account?
        </h2>
        <p className="mt-1 text-xs text-ink-600">
          Sign in for faster checkout and saved addresses.
        </p>
      </div>
      <LocalizedClientLink
        href="/account"
        data-testid="sign-in-button"
        className="inline-flex h-10 shrink-0 items-center justify-center border border-ink-900 px-5 text-xs font-bold uppercase tracking-[0.08em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
      >
        Sign in
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
