import { Metadata } from "next"

import ForgotPassword from "@modules/account/components/forgot-password"

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a link to set a new Orbis Square account password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="content-container max-w-5xl py-10 small:py-16">
      <ForgotPassword />
    </div>
  )
}
