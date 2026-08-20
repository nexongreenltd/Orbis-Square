import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="flex flex-col items-start border border-ink-900 bg-canvas-surface px-6 py-14 small:px-10 small:py-16"
      data-testid="empty-cart-message"
    >
      <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
        Your cart is empty
      </h2>
      <p className="mt-2 max-w-[32rem] text-sm text-ink-600">
        You don&apos;t have anything in your cart yet. Browse the catalogue to
        find boards, sensors, motors and tools.
      </p>
      <LocalizedClientLink
        href="/store"
        className="group mt-6 inline-flex h-12 items-center gap-3 bg-orbis-600 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-orbis-700"
      >
        Explore products
        <span
          aria-hidden
          className="transition-transform duration-150 group-hover:translate-x-1"
        >
          →
        </span>
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
