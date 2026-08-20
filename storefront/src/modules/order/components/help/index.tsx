import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="flex flex-col gap-y-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">
        Need help?
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <LocalizedClientLink
          href="/contact"
          className="text-ink-900 underline-offset-4 transition-colors hover:text-orbis-600 hover:underline"
        >
          Contact us
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/contact"
          className="text-ink-900 underline-offset-4 transition-colors hover:text-orbis-600 hover:underline"
        >
          Returns &amp; exchanges
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Help
