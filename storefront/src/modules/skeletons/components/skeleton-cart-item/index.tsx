const SkeletonCartItem = () => {
  return (
    <li className="border-b border-ink-200 last:border-b-0">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 p-4 small:grid-cols-[auto_minmax(0,1fr)_168px_120px_130px]">
        <div className="row-span-2 h-16 w-16 animate-pulse bg-ink-100 small:row-span-1 small:h-20 small:w-20" />
        <div className="col-start-2 col-span-2 flex flex-col gap-y-2 small:col-span-1">
          <div className="h-4 w-32 animate-pulse bg-ink-100" />
          <div className="h-3 w-24 animate-pulse bg-ink-100" />
        </div>
        <div className="col-start-2 h-10 w-[74px] animate-pulse bg-ink-100 small:col-start-3" />
        <div className="hidden small:col-start-4 small:block">
          <div className="ml-auto h-4 w-14 animate-pulse bg-ink-100" />
        </div>
        <div className="col-start-3 self-center small:col-start-5 small:self-start">
          <div className="ml-auto h-4 w-16 animate-pulse bg-ink-100" />
        </div>
      </div>
    </li>
  )
}

export default SkeletonCartItem
