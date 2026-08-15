import { Metadata } from "next"

import BrandStrip from "@modules/home/components/brand-strip"
import BulkOrders from "@modules/home/components/bulk-orders"
import CategoryGrid from "@modules/home/components/category-grid"
import Hero from "@modules/home/components/hero"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import Reviews from "@modules/home/components/reviews"
import StarterKits from "@modules/home/components/starter-kits"
import ValueProps from "@modules/home/components/value-props"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Orbis Square — Robotics & Technology Parts in Bangladesh",
  description:
    "Microcontrollers, sensors, motors, batteries and bench tools for makers, students and engineers. Delivered across Bangladesh from Dhaka.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const [{ collections }, categories, featuredRes] = await Promise.all([
    listCollections({ fields: "id, handle, title" }),
    listCategories(),
    // The hero's "most bought this month" card.
    listProducts({
      regionId: region.id,
      queryParams: {
        handle: "arduino-uno-r3",
        fields: "*variants.calculated_price,*categories",
      },
    }).catch(() => null),
  ])

  const featured = featuredRes?.response.products?.[0] ?? null
  const byHandle = (handle: string) =>
    collections?.find((c) => c.handle === handle)

  const newArrivals = byHandle("new-arrivals")
  const starterKits = byHandle("starter-kits")

  return (
    <>
      <Hero featured={featured} />

      <BrandStrip />

      {categories && <CategoryGrid categories={categories} />}

      {newArrivals && (
        <ProductRail
          collection={newArrivals}
          region={region}
          eyebrow="New arrivals"
          title="Landed this week"
          blurb="Fresh stock on the bench, checked and ready to dispatch."
        />
      )}

      {starterKits && (
        <StarterKits collection={starterKits} region={region} />
      )}

      <Reviews />

      <BulkOrders />

      <ValueProps />
    </>
  )
}
