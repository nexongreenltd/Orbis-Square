import { Metadata } from "next"

import ResetPassword from "@modules/account/components/reset-password"

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your Orbis Square account.",
}

type Props = {
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token, email } = await searchParams

  return (
    <div className="content-container max-w-5xl py-10 small:py-16">
      <ResetPassword token={token} email={email} />
    </div>
  )
}
