const items = [
  {
    title: "Delivered nationwide",
    body: "Same-day inside Dhaka at ৳60 flat, 2–4 days anywhere in Bangladesh at ৳130.",
    icon: (
      <>
        <path d="M3 8h11v9H3z" />
        <path d="M14 11h4l3 3v3h-7z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
      </>
    ),
  },
  {
    title: "Tested before dispatch",
    body: "Boards and modules are powered up and checked, not shipped blind.",
    icon: (
      <>
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Pay the way you want",
    body: "Cards, bKash and net banking through PayPlus — or cash on delivery.",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </>
    ),
  },
  {
    title: "Builders on support",
    body: "Questions answered by people who have wired the same part.",
    icon: (
      <>
        <path d="M4 18v-6a8 8 0 0 1 16 0v6" />
        <path d="M4 15h3v5H5a1 1 0 0 1-1-1zM20 15h-3v5h2a1 1 0 0 0 1-1z" />
      </>
    ),
  },
]

export default function ValueProps() {
  return (
    <section className="border-b border-ink-900 bg-ink-900">
      <div className="content-container grid grid-cols-1 gap-6 py-10 xsmall:grid-cols-2 small:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center bg-orbis-600 text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {item.icon}
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
