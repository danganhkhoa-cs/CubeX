"use client"

import ProductCard from "@/components/ProductCard"
import ProductCardSkeleton from "@/components/ProductCardSkeleton"
import ProfileSkeleton from "@/components/ProfileSkeleton"
import ProductFilterCard from "@/components/filters/ProductFilterCard"
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { productService } from "@/service/products"
import { authService } from "@/service/auth"
import { useFilter } from "@/hooks/filter/useFilter"
import type { FilterState } from "@/hooks/filter/useFilter"
import type { UserProfilePublic } from "@/service/auth/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean)
  if (!parts.length) return "U"
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
  return initials || "U"
}

function ProfileField({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="space-y-1 rounded-none border border-border bg-background/60 p-4">
      <div className="text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">
        {value?.trim() ? value : "Not provided"}
      </div>
    </div>
  )
}

const DEFAULT_LIMIT = 9

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    total_pages: number
  } | null>(null)
  const [sellerProfile, setSellerProfile] = useState<UserProfilePublic | null>(
    null
  )
  const [sellerLoading, setSellerLoading] = useState(false)
  const [sellerError, setSellerError] = useState<string | null>(null)
  const { brands, categories, filters, sortBy, resetFilters, setSortBy } =
    useFilter()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sellerId = searchParams.get("seller_id") || ""
  const returnTo = searchParams.get("returnTo") || ""
  const fresh = searchParams.get("fresh") === "1"
  const page = useMemo(() => {
    const parsed = Number(searchParams.get("page"))
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
  }, [searchParams])
  const previousFilterSignature = useRef<string | null>(null)

  const buildProductsPath = useMemo(() => {
    const params = new URLSearchParams()
    if (sellerId) {
      params.set("seller_id", sellerId)
    }
    if (returnTo) {
      params.set("returnTo", returnTo)
    }
    if (page > 1) {
      params.set("page", String(page))
    }
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [page, pathname, returnTo, sellerId])

  const updatePage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams()
      if (sellerId) {
        params.set("seller_id", sellerId)
      }
      if (returnTo) {
        params.set("returnTo", returnTo)
      }
      if (nextPage > 1) {
        params.set("page", String(nextPage))
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [pathname, returnTo, router, sellerId]
  )

  useEffect(() => {
    if (!fresh) return
    resetFilters()
    router.replace("/products", { scroll: false })
  }, [fresh, resetFilters, router])

  const filterSignature = useMemo(
    () => JSON.stringify({ filters, sortBy, sellerId }),
    [filters, sellerId, sortBy]
  )

  useEffect(() => {
    if (previousFilterSignature.current === filterSignature) {
      return
    }
    previousFilterSignature.current = filterSignature
    if (page !== 1) {
      updatePage(1)
    }
  }, [filterSignature, page, updatePage])

  useEffect(() => {
    let mounted = true

    async function loadSeller() {
      if (!sellerId) {
        if (mounted) {
          setSellerProfile(null)
          setSellerError(null)
        }
        return
      }

      setSellerLoading(true)
      setSellerError(null)

      try {
        const response = await authService.getUserPublicInfo(sellerId)
        if (!mounted) return
        if (response.success) {
          setSellerProfile(response.user ?? null)
        } else {
          setSellerProfile(null)
          setSellerError(response.message || "Failed to load seller")
        }
      } catch (requestError) {
        if (mounted) {
          setSellerProfile(null)
          setSellerError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load seller"
          )
        }
      } finally {
        if (mounted) {
          setSellerLoading(false)
        }
      }
    }

    loadSeller()

    return () => {
      mounted = false
    }
  }, [sellerId])

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const payload = buildFilterPayload(filters)
        const response = await productService.getFilteredProducts(payload, {
          page,
          limit: DEFAULT_LIMIT,
          sellerId: sellerId || undefined,
          sortOrder: sortBy || undefined,
        })
        const filteredItems = filters.search
          ? response.products.filter((product) =>
              product.title.toLowerCase().includes(filters.search.toLowerCase())
            )
          : response.products

        if (mounted) {
          setProducts(filteredItems)
          setPagination(response.pagination)
        }
      } catch (err) {
        console.error(err)
        if (mounted) {
          setProducts([])
          setPagination(null)
        }
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
  }, [filters, page, sellerId, sortBy])

  const currentPage = pagination?.page ?? page
  const totalPages = pagination?.total_pages ?? 0

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return []
    const total = totalPages
    const pages = new Set<number>([
      1,
      total,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ])
    return Array.from(pages)
      .filter((value) => value >= 1 && value <= total)
      .sort((a, b) => a - b)
  }, [currentPage, totalPages])

  const canGoPrevious = currentPage > 1
  const canGoNext = totalPages > 0 && currentPage < totalPages
  const nextSortBy = sortBy === "asc" ? "desc" : "asc"

  const headerTitle = sellerProfile
    ? `${sellerProfile.full_name || sellerProfile.username}'s products`
    : sellerId
      ? "Seller products"
      : "Products"
  const headerDescription = sellerProfile
    ? "Browse everything currently listed by this seller."
    : "Deep filter the marketplace and track your next find."
  const sellerInitials = sellerProfile
    ? getInitials(sellerProfile.full_name || sellerProfile.username || "User")
    : "U"
  const showBack = !!sellerId
  const encodedReturnTo = useMemo(
    () => encodeURIComponent(buildProductsPath),
    [buildProductsPath]
  )

  return (
    <main className="space-y-6">
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          onClick={() => {
            if (returnTo) {
              router.push(returnTo)
              return
            }
            router.back()
          }}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      )}
      {sellerId && (
        sellerLoading ? (
          <ProfileSkeleton />
        ) : (
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="space-y-4">
              {sellerError ? (
                <div className="text-sm text-destructive">{sellerError}</div>
              ) : sellerProfile ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        {sellerProfile.avatar_url && (
                          <AvatarImage
                            src={sellerProfile.avatar_url}
                            alt={
                              sellerProfile.full_name || sellerProfile.username
                            }
                          />
                        )}
                        <AvatarFallback className="bg-primary text-2xl font-semibold text-background">
                          {sellerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl font-bold">
                          {sellerProfile.full_name || sellerProfile.username}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {sellerProfile.username}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Public profile</Badge>
                  </div>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {sellerProfile.bio || "No bio."}
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Seller profile not found.
                </div>
              )}
            </CardHeader>
            {sellerProfile && (
              <>
                <Separator />
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <ProfileField
                      label="Full name"
                      value={sellerProfile.full_name}
                    />
                    <ProfileField
                      label="Username"
                      value={sellerProfile.username}
                    />
                    <ProfileField label="Email" value={sellerProfile.email} />
                    <ProfileField label="Phone" value={sellerProfile.phone} />
                    <ProfileField
                      label="Avatar"
                      value={sellerProfile.avatar_url}
                    />
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        )
      )}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">{headerDescription}</p>
        </div>
        <Button
          className="ml-auto normal-case"
          variant="outline"
          disabled={loading}
          onClick={() => setSortBy(nextSortBy)}
        >
          {sortBy === "asc"
            ? "Price: Ascending"
            : sortBy === "desc"
              ? "Price: Descending"
              : "Price: Unsorted"}
        </Button>
        <Button variant="outline" onClick={resetFilters}>
          Clear filters
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilterCard variant="full" />

        <div className="space-y-6">
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
                      productId={product.id}
                      title={product.title}
                      price={product.price}
                      images={product.images}
                      brandName={brand}
                      categoryName={category}
                      specs={product.specs}
                      href={`/products/${product.id}?returnTo=${encodedReturnTo}`}
                    />
                  )
                })}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      if (canGoPrevious) {
                        updatePage(currentPage - 1)
                      }
                    }}
                    className={cn(
                      !canGoPrevious && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {pageNumbers.map((pageNumber, index) => {
                  const previous = pageNumbers[index - 1]
                  const needsEllipsis = previous && pageNumber - previous > 1

                  return (
                    <Fragment key={`page-${pageNumber}`}>
                      {needsEllipsis && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={pageNumber === currentPage}
                          onClick={(event) => {
                            event.preventDefault()
                            updatePage(pageNumber)
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      if (canGoNext) {
                        updatePage(currentPage + 1)
                      }
                    }}
                    className={cn(
                      !canGoNext && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </main>
  )
}

export default ProductsPage
