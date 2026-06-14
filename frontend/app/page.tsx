import Link from "next/link"

import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import ProductFilterCard from "@/components/filters/ProductFilterCard"
import ProductCard from "@/components/ProductCard"
import { productService } from "@/service/products"
import { Separator } from "@/components/ui/separator"

// We'll load featured products from the API below in the Page component.

export default async function Page() {
  // Fetch products + brands/categories to resolve names
  const [productsResponse, brands, categories] = await Promise.all([
    productService.getProducts({ page: 1, limit: 12 }),
    productService.getBrands(),
    productService.getCategories(),
  ])

  const products = productsResponse.products

  const brandMap = new Map(brands.map((b) => [b.id, b.name]))
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  const featured = products.slice(0, 4)

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        {/* Sonner toast displays signin success; no server-side alert needed */}
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="h-10"></div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Marketplace Explorer
              </h1>
              <p className="text-base text-muted-foreground">
                Discover rare Rubik's cubes, track every trade, and launch new
                listings with confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/products">Browse products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products/create">Create listing</Link>
              </Button>
            </div>
          </div>
          <ProductFilterCard variant="quick" />
        </section>

        <Separator className="my-10" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recently Added</h2>
              <p className="text-sm text-muted-foreground">
                Need a new cube? Check out the latest listings from our
                community.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">See all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                productId={product.id}
                title={product.title}
                price={product.price}
                images={product.images}
                brandName={brandMap.get(product.brand_id)}
                categoryName={categoryMap.get(product.category_id)}
                specs={product.specs}
                href={`/products/${product.id}`}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
