const SkeletonCartTotals = ({ header = true }) => {
  return (
    <div className="flex flex-col">
      {header && <div className="mb-4 h-4 w-32 animate-pulse bg-ink-100" />}

      {[0, 1, 2].map((i) => (
        <div key={i} className="mb-3 flex items-center justify-between">
          <div className="h-3 w-32 animate-pulse bg-ink-100" />
          <div className="h-3 w-20 animate-pulse bg-ink-100" />
        </div>
      ))}

      <div className="mt-1 flex items-center justify-between border-t border-ink-900 pt-4">
        <div className="h-3 w-16 animate-pulse bg-ink-100" />
        <div className="h-7 w-24 animate-pulse bg-ink-100" />
      </div>
    </div>
  )
}

export default SkeletonCartTotals
