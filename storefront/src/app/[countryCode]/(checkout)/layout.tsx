import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-canvas">
      <Nav />

      {/* Checkout-specific bar: keeps the escape hatch back to the cart and
          reassures the customer the payment step is secure. */}
      <div className="border-b border-ink-900 bg-canvas-surface">
        <div className="content-container flex h-12 items-center justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-x-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-orbis-600"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="hidden small:block">Back to shopping cart</span>
            <span className="block small:hidden">Back</span>
          </LocalizedClientLink>

          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-600">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-orbis-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Secure checkout
          </span>
        </div>
      </div>

      <div className="relative flex-1" data-testid="checkout-container">
        {children}
      </div>

      <Footer />
    </div>
  )
}
