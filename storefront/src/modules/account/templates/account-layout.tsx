import React from "react"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import AccountNav from "../components/account-nav"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1" data-testid="account-page">
      <div className="content-container max-w-5xl py-10 small:py-14">
        {customer ? (
          <div className="grid grid-cols-1 items-start gap-8 small:grid-cols-[240px_minmax(0,1fr)]">
            <AccountNav customer={customer} />
            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-ink-200 pt-8 small:flex-row small:items-end small:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
              Got questions?
            </span>
            <p className="mt-2 max-w-md text-sm text-ink-600">
              You can find frequently asked questions and answers on our
              customer service page.
            </p>
          </div>
          <LocalizedClientLink
            href="/customer-service"
            className="inline-flex h-11 shrink-0 items-center justify-center border border-ink-900 px-5 text-xs font-bold uppercase tracking-[0.08em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
          >
            Customer service
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
