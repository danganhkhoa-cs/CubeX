"use client"

import ProductCard from "@/components/ProductCard"
import ProductFilterCard from "@/components/filters/ProductFilterCard"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { productService } from "@/service/products"
import { authService } from "@/service/auth"
import { useFilter } from "@/hooks/filter/useFilter"

type ProductItem = {
  id: string
  seller_id: string
  title: string
  price: number
  images: string[]
  brand_id: string
  category_id: string
  description?: string
  specs?: Record<string, string>
}

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(false)
  const { brands, categories } = useFilter()

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const items = await productService.getProducts()
        setProducts(items)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Deep filter the marketplace and track your next find.
          </p>
        </div>
        <Button variant="outline">Save filter</Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilterCard variant="full" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const brand = brands.find((b) => b.id === product.brand_id)?.name
            const category = categories.find(
              (c) => c.id === product.category_id
            )?.name

            return (
              <ProductCard
                key={product.id}
                title={product.title}
                price={product.price}
                images={product.images}
                brandName={brand}
                categoryName={category}
                sellerName={(product as any).sellerName}
                specs={product.specs}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default ProductsPage
