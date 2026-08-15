import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <>
      <div className="border-b border-ink-900 bg-canvas-surface">
        <div className="content-container py-10">
          <span className="eyebrow">Full catalogue</span>
          <h1
            className="mt-3 text-4xl font-extrabold tracking-tight text-ink-900"
            data-testid="store-page-title"
          >
            All products
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-600">
            Every board, sensor, motor and tool we stock — in one place.
          </p>
        </div>
      </div>

      <div
        className="flex flex-col small:flex-row small:items-start py-8 content-container"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default StoreTemplate
