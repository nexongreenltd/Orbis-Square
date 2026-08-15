import { ReactNode } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * A line-art glyph per category, matching the reference design. Inline rather
 * than an icon dependency — six marks that never change.
 */
const glyphs: Record<string, ReactNode> = {
  "Development Boards": (
    <>
      <rect x="6" y="6" width="20" height="20" rx="3" />
      <rect x="12" y="12" width="8" height="8" rx="1" />
      <path d="M11 6V3M16 6V3M21 6V3M11 29v-3M16 29v-3M21 29v-3M6 11H3M6 16H3M6 21H3M29 11h-3M29 16h-3M29 21h-3" />
    </>
  ),
  "Sensors & Modules": (
    <>
      <circle cx="16" cy="16" r="4" />
      <path d="M16 4a12 12 0 0 1 12 12M16 8a8 8 0 0 1 8 8M16 28A12 12 0 0 1 4 16M16 24a8 8 0 0 1-8-8" />
    </>
  ),
  "Motors & Actuators": (
    <>
      <circle cx="16" cy="16" r="9" />
      <circle cx="16" cy="16" r="3" />
      <path d="M16 7V3M16 29v-4M25 16h4M3 16h4M22.4 9.6l2.8-2.8M6.8 25.2l2.8-2.8M22.4 22.4l2.8 2.8M6.8 6.8l2.8 2.8" />
    </>
  ),
  "Power & Batteries": (
    <>
      <rect x="4" y="10" width="20" height="12" rx="2" />
      <path d="M28 14v4" />
      <path d="M13 12l-3 5h4l-2 4" />
    </>
  ),
  Prototyping: (
    <>
      <rect x="5" y="7" width="22" height="18" rx="2" />
      <path d="M10 12h.01M14 12h.01M18 12h.01M22 12h.01M10 16h.01M14 16h.01M18 16h.01M22 16h.01M10 20h.01M14 20h.01M18 20h.01M22 20h.01" />
    </>
  ),
  "Tools & Equipment": (
    <>
      <path d="M13 6l-4 4 3 3 4-4z" />
      <path d="M16 9l10 10a2.5 2.5 0 0 1-3.5 3.5L12.5 12.5" />
      <path d="M9 22l-3 3" />
    </>
  ),
}

const fallbackGlyph = (
  <>
    <rect x="6" y="6" width="20" height="20" rx="3" />
    <path d="M12 16h8" />
  </>
)

// The reference orders departments 01–06; follow it where the category exists.
const order = [
  "Development Boards",
  "Sensors & Modules",
  "Motors & Actuators",
  "Power & Batteries",
  "Prototyping",
  "Tools & Equipment",
]

export default function CategoryGrid({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  const topLevel = categories
    .filter((c) => !c.parent_category)
    .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))

  if (!topLevel.length) {
    return null
  }

  return (
    <section
      id="catalogue"
      className="border-b border-ink-900 bg-canvas py-16 small:py-20"
    >
      <div className="content-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Six departments</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 small:text-4xl">
              Shop by category
            </h2>
          </div>
          <LocalizedClientLink
            href="/store"
            className="hidden shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-orbis-600 transition-colors hover:text-orbis-700 small:block"
          >
            All products →
          </LocalizedClientLink>
        </div>

        <ul className="grid grid-cols-1 gap-px border border-ink-900 bg-ink-900 xsmall:grid-cols-2 small:grid-cols-3">
          {topLevel.map((category, i) => (
            <li key={category.id}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="group flex h-full flex-col bg-canvas p-6 transition-colors duration-150 hover:bg-ink-900"
              >
                <div className="flex items-start justify-between">
                  <span className="text-ink-900 transition-colors group-hover:text-orbis-600">
                    <svg
                      viewBox="0 0 32 32"
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {glyphs[category.name] ?? fallbackGlyph}
                    </svg>
                  </span>
                  <span className="text-[11px] font-bold tabular-nums text-ink-400 transition-colors group-hover:text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold tracking-tight text-ink-900 transition-colors group-hover:text-white">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 transition-colors group-hover:text-white/70">
                    {category.description}
                  </p>
                )}

                <span className="mt-6 text-[11px] font-bold uppercase tracking-[0.1em] text-orbis-600">
                  {category.products?.length ?? 0} in stock →
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
