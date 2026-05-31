"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { ArrowLeft, Layers3, Settings2, Tag } from "lucide-react"

import ProductDetailSkeleton from "@/components/ProductDetailSkeleton"
import SellerInfoSkeleton from "@/components/SellerInfoSkeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useFilter } from "@/hooks/filter/useFilter"
import { useAuth } from "@/hooks/auth/useAuth"
import { useCart } from "@/hooks/cart/useCart"
import { authService } from "@/service/auth"
import { cartService } from "@/service/cart"
import { productService } from "@/service/products"
import type { ProductDetail } from "@/service/products/types"
import type { UserProfilePublic } from "@/service/auth/types"
import { toast } from "sonner"

const specsLabels: Record<string, string> = {
  normal: "Normal",
  se: "SE",
  limited: "Limited",
  glossy: "Glossy",
  matte: "Matte",
  uv: "UV",
  none: "None",
  standard: "Standard",
  plastic: "Plastic core",
  metal: "Metal core",
  ballcore8m: "BallCore 8M",
  ballcore20m: "BallCore 20M",
  maglev: "MagLev",
  magcore: "MagCore",
}

const specsCustomizationLabels: Record<string, string> = {
  magcore: "CUST: MagCore",
  ballcore8m: "CUST: BallCore 8M",
  ballcore20m: "CUST: BallCore 20M",
  maglev: "CUST: MagLev",
  uv: "CUST: UV",
  other: "CUST: Other",
}

function formatSpecValue(value: string) {
  return specsLabels[value] || value
}

function formatOrderStatus(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
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

export default function Page() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const { brands, categories } = useFilter()
  const { user, loading: isAuthLoading } = useAuth()
  const { isInCart, markProductAdded } = useCart()
  const orderTrackingId = searchParams.get("orderTrackingId") || ""
  const orderStatus = searchParams.get("orderStatus") || ""
  const orderRole = searchParams.get("orderRole") || ""
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [seller, setSeller] = useState<UserProfilePublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sellerLoading, setSellerLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const isOwnProfile = product?.seller_id === user?.user_id
  const returnTo = searchParams.get("returnTo") || ""
  const showBack =
    returnTo.startsWith("/products") ||
    returnTo.startsWith("/cart") ||
    returnTo.startsWith("/orders")
  const isOrderContext =
    !!orderTrackingId &&
    !!orderStatus &&
    (orderRole === "buyer" || orderRole === "seller")
  const currentPath = useMemo(() => {
    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])
  const sellerProductsHref = useMemo(() => {
    if (!seller) return ""
    return `/products?seller_id=${seller.user_id}&returnTo=${encodeURIComponent(currentPath)}`
  }, [currentPath, seller])
  const updateHref = useMemo(() => {
    if (!productId) return ""
    return `/products/${productId}/edit?returnTo=${encodeURIComponent(currentPath)}`
  }, [currentPath, productId])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!productId) return

      setLoading(true)
      setError(null)
      setSeller(null)
      setSellerLoading(false)

      try {
        const data = await productService.getProductById(productId)
        if (mounted) {
          setProduct(data)
          setLoading(false)
        }

        try {
          if (mounted) {
            setSellerLoading(true)
          }
          const sellerResponse = await authService.getUserPublicInfo(
            data.seller_id
          )
          if (mounted && sellerResponse.success) {
            setSeller(sellerResponse.user ?? null)
          }
        } catch {
          if (mounted) {
            setSeller(null)
          }
        } finally {
          if (mounted) {
            setSellerLoading(false)
          }
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load product"
          )
          setLoading(false)
          setSellerLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [productId])

  const isAdded = !!productId && isInCart(productId)
  const isUnavailable = !!product && (product.is_sold || product.is_deleted)

  const handleAddToCart = async () => {
    if (!productId) {
      console.error("Product ID is required")
      return
    }

    if (!user) {
      router.push("/signin")
      return
    }

    try {
      setIsAdding(true)
      const response = await cartService.addToCart({ product_id: productId })
      if (response.success) {
        markProductAdded(productId)
        toast.success("Added to cart")
      } else {
        toast.error(response.message || "Failed to add to cart")
      }
    } catch (addError) {
      console.error("Failed to add to cart:", addError)
      toast.error("Failed to add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  const priceLabel = useMemo(() => {
    if (!product) return ""
    return (product.price / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  }, [product])

  const brandName = product
    ? brands.find((brand) => brand.id === product.brand_id)?.name
    : undefined
  const categoryName = product
    ? categories.find((category) => category.id === product.category_id)?.name
    : undefined
  const sellerName = seller?.full_name || seller?.username
  const sellerInitials = sellerName ? getInitials(sellerName) : "U"

  if (loading || isAuthLoading || sellerLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <main className="space-y-6">
        <p className="text-sm text-destructive">
          {error || "Product not found"}
        </p>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          onClick={() => router.push(returnTo)}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      )}
      <h1 className="text-2xl font-semibold">{product.title}</h1>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase">Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.images?.length ? (
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
                {product.images.map((image) => (
                  <div
                    key={image}
                    className="min-w-[80%] snap-center md:min-w-[60%]"
                  >
                    <div
                      className="aspect-4/3 w-full rounded-md bg-muted bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-4/3 w-full rounded-md bg-muted" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Price
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {priceLabel}
              </p>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="size-3.5" />
                  {brandName?.toUpperCase() || product.brand_id}
                </span>
              </Badge>
              <Badge variant="ghost">
                <span className="inline-flex items-center gap-1.5">
                  <Layers3 className="size-3.5" />
                  {categoryName || product.category_id}
                </span>
              </Badge>
            </div>
            {product.specs && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(product.specs).map(([key, value]) => {
                  if (key === "customization_types") {
                    if (Array.isArray(value)) {
                      return value.map((item) => (
                        <Badge key={`${key}-${item}`} variant="outline">
                          <span className="inline-flex items-center gap-1.5">
                            <Settings2 className="size-3.5" />
                            {specsCustomizationLabels[item] || item}
                          </span>
                        </Badge>
                      ))
                    }
                  }

                  if (Array.isArray(value)) {
                    return value.map((item) => (
                      <Badge key={`${key}-${item}`} variant="outline">
                        <span className="inline-flex items-center gap-1.5">
                          <Settings2 className="size-3.5" />
                          {formatSpecValue(item)}
                        </span>
                      </Badge>
                    ))
                  }

                  return (
                    <Badge key={key} variant="outline">
                      <span className="inline-flex items-center gap-1.5">
                        <Settings2 className="size-3.5" />
                        {formatSpecValue(value)}
                      </span>
                    </Badge>
                  )
                })}
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Seller
              </p>
              {sellerLoading ? (
                <SellerInfoSkeleton />
              ) : seller ? (
                <Link
                  href={sellerProductsHref}
                  className="flex w-fit items-center gap-3 py-2 text-foreground"
                >
                  <Avatar className="h-10 w-10">
                    {seller.avatar_url && (
                      <AvatarImage
                        src={seller.avatar_url}
                        alt={seller.full_name}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-sm font-semibold text-background">
                      {sellerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {seller.full_name || seller.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {seller.username}
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {product.seller_id}
                </p>
              )}
            </div>
            {isOrderContext ? (
              <Button
                size="sm"
                className="text-md w-full font-extrabold"
                disabled
              >
                {formatOrderStatus(orderStatus)}
              </Button>
            ) : isOwnProfile ? (
              <Button
                size="sm"
                className="text-md w-full font-extrabold"
                onClick={() => router.push(updateHref)}
                disabled={isUnavailable || !updateHref}
              >
                {isUnavailable ? "Update unavailable" : "Update listing"}
              </Button>
            ) : isUnavailable ? (
              <Button
                size="sm"
                variant="destructive"
                className="text-md w-full font-extrabold"
                disabled
              >
                Unavailable
              </Button>
            ) : (
              <Button
                size="sm"
                variant={isAdded ? "secondary" : "default"}
                className="text-md w-full font-extrabold"
                onClick={handleAddToCart}
                disabled={isAdding || isAdded}
              >
                {isAdded ? (
                  "Added"
                ) : isAdding ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner />
                    Adding...
                  </span>
                ) : (
                  "Add to cart"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase">Description</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {product.description || "No description provided."}
        </CardContent>
      </Card>
    </main>
  )
}
