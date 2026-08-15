/**
 * PLACEHOLDER CONTENT — these quotes, names and the 4.8/5 rating come from the
 * design mock, not from real customers. Replace them with genuine reviews (or
 * delete the section) before the store takes real orders: publishing invented
 * testimonials is misleading to shoppers and unlawful in many markets.
 */
const reviews = [
  {
    quote:
      "Ordered at 11am, the ESP32s were on my desk in Mirpur before evening. Nothing else here does that.",
    name: "Rakib H.",
    org: "BUET · EEE final-year project",
  },
  {
    quote:
      "They flagged that a driver in my BOM was end-of-life and sent a substitute that actually worked. Saved a week.",
    name: "Nusrat J.",
    org: "Robotics club lead, NSU",
  },
  {
    quote:
      "Forty student kits, one invoice, delivered to campus. Our lab has stopped buying from New Market.",
    name: "Mahmud Karim",
    org: "Lab in-charge, Dhaka Polytechnic",
  },
]

export default function Reviews() {
  return (
    <section className="border-b border-ink-900 bg-canvas-surface py-16 small:py-20">
      <div className="content-container">
        <div className="mb-8">
          <span className="eyebrow">4.8 / 5 from 1,240 orders</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 small:text-4xl">
            Builders who ordered twice
          </h2>
        </div>

        <ul className="grid grid-cols-1 gap-px border border-ink-900 bg-ink-900 small:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.name} className="flex flex-col bg-canvas p-6">
              <span
                aria-label="5 out of 5 stars"
                className="text-sm tracking-[0.2em] text-orbis-600"
              >
                ★★★★★
              </span>
              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink-900">
                “{review.quote}”
              </blockquote>
              <div className="mt-6 border-t border-ink-200 pt-4">
                <p className="text-sm font-bold text-ink-900">{review.name}</p>
                <p className="mt-0.5 text-xs text-ink-500">{review.org}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
