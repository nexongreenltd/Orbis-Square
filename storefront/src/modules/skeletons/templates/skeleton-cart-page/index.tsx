import repeat from "@lib/util/repeat"
import SkeletonCartItem from "@modules/skeletons/components/skeleton-cart-item"
import SkeletonCartTotals from "@modules/skeletons/components/skeleton-cart-totals"

const SkeletonCartPage = () => {
  return (
    <>
      <div className="border-b border-ink-900 bg-canvas-surface">
        <div className="content-container py-10">
          <div className="h-3 w-24 animate-pulse bg-ink-100" />
          <div className="mt-4 h-9 w-40 animate-pulse bg-ink-100" />
          <div className="mt-3 h-4 w-56 animate-pulse bg-ink-100" />
        </div>
      </div>

      <div className="content-container py-10">
        <div className="grid grid-cols-1 items-start gap-8 small:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 border border-ink-900 bg-canvas">
            <div className="border-b border-ink-900 px-4 py-3">
              <div className="h-3 w-16 animate-pulse bg-ink-100" />
            </div>
            <ul>
              {repeat(4).map((index) => (
                <SkeletonCartItem key={index} />
              ))}
            </ul>
          </div>

          <div className="border border-ink-900 bg-canvas-surface">
            <div className="border-b border-ink-900 px-5 py-3">
              <div className="h-3 w-28 animate-pulse bg-ink-100" />
            </div>
            <div className="flex flex-col gap-5 p-5">
              <SkeletonCartTotals header={false} />
              <div className="h-12 w-full animate-pulse bg-ink-100" />
              <div className="h-3 w-40 animate-pulse bg-ink-100" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SkeletonCartPage
