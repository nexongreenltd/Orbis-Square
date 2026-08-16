"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/icons/logo"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

const primaryLinks = [
  { name: "Home", href: "/" },
  { name: "All products", href: "/store" },
  { name: "Cart", href: "/cart" },
  { name: "Account", href: "/account" },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: HttpTypes.StoreProductCategory[] | null
}

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  categories,
}: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  const topCategories = (categories ?? []).filter((c) => !c.parent_category)

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <PopoverButton
                data-testid="nav-menu-button"
                className="relative flex h-full items-center gap-2 transition-colors duration-200 focus:outline-none hover:text-orbis-600"
              >
                <span
                  aria-hidden
                  className="flex h-3.5 w-4 flex-col justify-between"
                >
                  <span className="block h-[1.5px] w-full bg-current" />
                  <span className="block h-[1.5px] w-full bg-current" />
                  <span className="block h-[1.5px] w-full bg-current" />
                </span>
                Menu
              </PopoverButton>

              <Transition show={open} as={Fragment}>
                <div className="fixed inset-0 z-[60]">
                  {/* A real backdrop — the original was fully transparent, so
                      the open menu never felt modal. */}
                  <TransitionChild
                    as={Fragment}
                    enter="transition-opacity ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                      onClick={close}
                      data-testid="side-menu-backdrop"
                    />
                  </TransitionChild>

                  <TransitionChild
                    as={Fragment}
                    enter="transform transition ease-out duration-300"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in duration-200"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <PopoverPanel
                      static
                      data-testid="nav-menu-popup"
                      className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col border-r border-white/10 bg-ink-900 text-white shadow-2xl"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                        <LocalizedClientLink
                          href="/"
                          onClick={close}
                          className="flex items-center gap-2.5"
                        >
                          <Logo size={28} tone="light" aria-hidden />
                          <span className="text-sm font-extrabold uppercase tracking-[0.16em]">
                            Orbis Square
                          </span>
                        </LocalizedClientLink>
                        <button
                          data-testid="close-menu-button"
                          onClick={close}
                          aria-label="Close menu"
                          className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <XMark />
                        </button>
                      </div>

                      {/* Scrollable body */}
                      <div className="flex-1 overflow-y-auto px-6 py-6">
                        <ul className="flex flex-col gap-1">
                          {primaryLinks.map((item) => (
                            <li key={item.name}>
                              <LocalizedClientLink
                                href={item.href}
                                onClick={close}
                                data-testid={`${item.name
                                  .split(" ")[0]
                                  .toLowerCase()}-link`}
                                className="group flex items-center justify-between rounded-xl px-3 py-3 text-xl font-semibold transition-colors hover:bg-white/5"
                              >
                                {item.name}
                                <ArrowRightMini className="text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-orbis-400" />
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>

                        {topCategories.length > 0 && (
                          <div className="mt-8">
                            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                              Shop by category
                            </p>
                            <ul className="mt-2 flex flex-col gap-0.5">
                              {topCategories.map((category) => (
                                <li key={category.id}>
                                  <LocalizedClientLink
                                    href={`/categories/${category.handle}`}
                                    onClick={close}
                                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                                  >
                                    {category.name}
                                    {!!category.products?.length && (
                                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/50 transition-colors group-hover:bg-orbis-600 group-hover:text-white">
                                        {category.products.length}
                                      </span>
                                    )}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-white/10 px-6 py-5">
                        <div className="flex flex-col gap-y-4 text-sm text-white/70">
                          {!!locales?.length && (
                            <div
                              className="flex justify-between"
                              onMouseEnter={languageToggleState.open}
                              onMouseLeave={languageToggleState.close}
                            >
                              <LanguageSelect
                                toggleState={languageToggleState}
                                locales={locales}
                                currentLocale={currentLocale}
                              />
                              <ArrowRightMini
                                className={clx(
                                  "transition-transform duration-150",
                                  languageToggleState.state ? "-rotate-90" : ""
                                )}
                              />
                            </div>
                          )}
                          <div
                            className="flex justify-between"
                            onMouseEnter={countryToggleState.open}
                            onMouseLeave={countryToggleState.close}
                          >
                            {regions && (
                              <CountrySelect
                                toggleState={countryToggleState}
                                regions={regions}
                              />
                            )}
                            <ArrowRightMini
                              className={clx(
                                "transition-transform duration-150",
                                countryToggleState.state ? "-rotate-90" : ""
                              )}
                            />
                          </div>
                          <p className="text-xs text-white/35">
                            © {new Date().getFullYear()} Orbis Square · Dhaka,
                            Bangladesh
                          </p>
                        </div>
                      </div>
                    </PopoverPanel>
                  </TransitionChild>
                </div>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
