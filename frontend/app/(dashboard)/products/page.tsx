"use client"

import ProductCard from "@/components/ProductCard"
import ProductCardSkeleton from "@/components/ProductCardSkeleton"
import ProductFilterCard from "@/components/filters/ProductFilterCard"
import { useEffect, useState } from "react"
import { productService } from "@/service/products"
import { useFilter } from "@/hooks/filter/useFilter"
import type { FilterState } from "@/hooks/filter/useFilter"
import { Button } from "@/components/ui/button"

type ProductItem = {
  id: string
  seller_id: string
  title: string
  price: number
  images: string[]
  brand_id: string
  category_id: string
  description?: string
  specs?: Record<string, string | string[]>
}

const buildFilterPayload = (filters: FilterState) => {
  const minPrice = filters.minPrice.trim()
  const maxPrice = filters.maxPrice.trim()

  return {
    min_price: minPrice ? Number(minPrice) * 100 : null,
    max_price: maxPrice ? Number(maxPrice) * 100 : null,
    category_id: filters.categoryId || null,
    brand_id: filters.brandId || null,
    size: null,
    weight: null,
    edition: filters.edition || null,
    coated_type: filters.coatedType || null,
    spring_type: filters.springType || null,
    magnet_type: filters.magnetType || null,
    customization_types:
      filters.customizationTypes.length > 0 ? filters.customizationTypes : null,
    core_material: filters.coreMaterial || null,
  }
}

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(false)
  const { brands, categories, filters, sortBy, resetFilters, setSortBy } =
    useFilter()

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const payload = buildFilterPayload(filters)
        const items = await productService.getFilteredProducts(payload)
        let filteredItems = filters.search
          ? items.filter((product) =>
              product.title.toLowerCase().includes(filters.search.toLowerCase())
            )
          : items

        // Sort by price if sortBy is set
        if (sortBy) {
          filteredItems = [...filteredItems].sort((a, b) => {
            return sortBy === "asc" ? a.price - b.price : b.price - a.price
          })
        }

        if (mounted) {
          setProducts(filteredItems)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [filters, sortBy])

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Deep filter the marketplace and track your next find.
          </p>
        </div>
        <Button
          className="ml-auto normal-case"
          variant="outline"
          disabled={loading}
          onClick={() => setSortBy(sortBy === "asc" ? "desc" : "asc")}
        >
          {sortBy === "asc"
            ? "Price: Ascending"
            : sortBy === "desc"
              ? "Price: Descending"
              : "Price: Ascending"}
        </Button>
        <Button variant="outline" onClick={resetFilters}>
          Clear filters
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilterCard variant="full" />

        <div className="grid auto-rows-max gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={`product-skeleton-${index}`} />
              ))
            : products.map((product) => {
                const brand = brands.find(
                  (b) => b.id === product.brand_id
                )?.name
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
                    href={`/products/${product.id}`}
                  />
                )
              })}
        </div>
      </div>
    </main>
  )
}

export default ProductsPage
