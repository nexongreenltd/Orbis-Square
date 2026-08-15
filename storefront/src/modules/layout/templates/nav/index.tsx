import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { listCategories } from "@lib/data/categories"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories().catch(() => []),
  ])

  const topCategories = (categories ?? []).filter((c) => !c.parent_category)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Announcement strip — the design's full-bleed accent band */}
      <div className="hidden h-9 items-center justify-between bg-orbis-600 px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-white small:flex">
        <span>Free delivery inside Dhaka on orders over ৳3,000</span>
        <span>Same-day dispatch until 4pm · PayPlus · Cash on delivery</span>
      </div>

      <header className="relative mx-auto h-16 border-b border-ink-900 bg-canvas duration-200">
        <nav className="content-container flex h-full w-full items-center justify-between text-small-regular text-ink-700">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                categories={topCategories}
              />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
              data-testid="nav-store-link"
            >
              {/* Placeholder mark — swap for the Orbis Square logo when ready */}
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center bg-orbis-600 text-[15px] font-extrabold text-white"
              >
                O
              </span>
              <span className="text-base font-extrabold uppercase tracking-[0.16em] text-ink-900">
                Orbis Square
              </span>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="transition-colors hover:text-orbis-600"
                href="/store"
                data-testid="nav-store-all-link"
              >
                Shop
              </LocalizedClientLink>
              <LocalizedClientLink
                className="transition-colors hover:text-orbis-600"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex gap-2 transition-colors hover:text-orbis-600"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>

      {/* Category bar — every department one click from anywhere in the store */}
      {topCategories.length > 0 && (
        <div className="border-b border-ink-900 bg-ink-900">
          <div className="content-container">
            <ul className="no-scrollbar flex items-center gap-x-1 overflow-x-auto py-1.5">
              <li className="shrink-0">
                <LocalizedClientLink
                  href="/store"
                  className="block whitespace-nowrap px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-orbis-400"
                >
                  All products
                </LocalizedClientLink>
              </li>
              {topCategories.map((category) => (
                <li key={category.id} className="shrink-0">
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    className="block whitespace-nowrap px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-orbis-400"
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
