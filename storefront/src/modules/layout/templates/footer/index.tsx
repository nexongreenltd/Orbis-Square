import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/icons/logo"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="w-full bg-ink-900 text-white/60">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-10 xsmall:flex-row items-start justify-between py-20">
          <div className="max-w-xs">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <Logo size={28} tone="light" aria-hidden />
              <span className="text-base font-extrabold uppercase tracking-[0.16em] text-white">
                Orbis Square
              </span>
            </LocalizedClientLink>
            <p className="mt-4 text-sm leading-relaxed text-white/45">
              Robotics and technology parts for makers, students and engineers
              across Bangladesh. Shipped from Dhaka.
            </p>
          </div>

          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li className="flex flex-col gap-2 txt-small" key={c.id}>
                        <LocalizedClientLink
                          className={clx(
                            "transition-colors hover:text-orbis-400",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="transition-colors hover:text-orbis-400"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                  Collections
                </span>
                <ul
                  className={clx("grid grid-cols-1 gap-2 txt-small", {
                    "grid-cols-2": (collections?.length || 0) > 3,
                  })}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="transition-colors hover:text-orbis-400"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                Shop
              </span>
              <ul className="grid grid-cols-1 gap-y-2 txt-small">
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="transition-colors hover:text-orbis-400"
                  >
                    All products
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/cart"
                    className="transition-colors hover:text-orbis-400"
                  >
                    Cart
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account"
                    className="transition-colors hover:text-orbis-400"
                  >
                    Account
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 border-t border-white/10 py-8 text-white/35 xsmall:flex-row xsmall:items-center xsmall:justify-between">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Orbis Square. All rights reserved.
          </Text>
          <Text className="txt-compact-small">
            Payments by PayPlus · Dhaka, Bangladesh
          </Text>
        </div>
      </div>
    </footer>
  )
}
