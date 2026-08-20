"use client"

import { resetOnboardingState } from "@lib/data/onboarding"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <div className="flex flex-col items-start gap-y-3 border border-ink-900 bg-canvas-surface p-5">
      <span className="eyebrow">Setup</span>
      <p className="text-sm font-bold text-ink-900">
        Your test order was created successfully.
      </p>
      <p className="text-sm text-ink-600">
        You can now finish setting up your store in the admin.
      </p>
      <button
        type="button"
        onClick={() => resetOnboardingState(orderId)}
        className="mt-1 inline-flex h-11 items-center justify-center bg-orbis-600 px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-orbis-700"
      >
        Complete setup in admin
      </button>
    </div>
  )
}

export default OnboardingCta
