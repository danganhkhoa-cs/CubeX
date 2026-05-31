"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { cartService } from "@/service/cart"
import type { GetCartResponse } from "@/service/cart/types"
import { authService } from "@/service/auth"
import type { UserProfilePublic } from "@/service/auth/types"
import { useAuth } from "@/hooks/auth/useAuth"
import { useFilter } from "@/hooks/filter/useFilter"
import CartSkeleton from "@/components/CartSkeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"

type CartItem = GetCartResponse["cart_items"][number]

export default function CartPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { brands, categories } = useFilter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sellerProfiles, setSellerProfiles] = useState<
    Record<string, UserProfilePublic | null>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const returnTo = searchParams.get("returnTo") || ""
  const showBack = returnTo.startsWith("/products")
  const currentPath = useMemo(() => {
    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  const brandMap = useMemo(() => {
    return new Map(brands.map((brand) => [brand.id, brand.name]))
  }, [brands])

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]))
  }, [categories])

  const groups = useMemo(() => {
    const map = new Map<string, CartItem[]>()
    cartItems.forEach((item) => {
      const sellerId = item.products.seller_id
      const items = map.get(sellerId) || []
      items.push(item)
      map.set(sellerId, items)
    })

    return Array.from(map.entries()).map(([sellerId, items]) => ({
      sellerId,
      items,
    }))
  }, [cartItems])

  const totalCents = useMemo(() => {
    let total = 0
    cartItems.forEach((item) => {
      if (selectedIds.has(item.id)) {
        total += item.products.price
      }
    })
    return total
  }, [cartItems, selectedIds])

  const totalLabel = useMemo(() => {
    return (totalCents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  }, [totalCents])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [authLoading, router, user])

  useEffect(() => {
    let mounted = true

    async function loadCart() {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const response = await cartService.getCart()
        if (!mounted) return

        setCartItems(response.cart_items)
        setSelectedIds(new Set())

        const sellerIds = Array.from(
          new Set(response.cart_items.map((item) => item.products.seller_id))
        )

        const profiles = await Promise.all(
          sellerIds.map(async (sellerId) => {
            try {
              const sellerResponse =
                await authService.getUserPublicInfo(sellerId)
              return [
                sellerId,
                sellerResponse.success ? (sellerResponse.user ?? null) : null,
              ] as const
            } catch {
              return [sellerId, null] as const
            }
          })
        )

        if (mounted) {
          setSellerProfiles(Object.fromEntries(profiles))
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load cart"
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCart()

    return () => {
      mounted = false
    }
  }, [user])

  const toggleItem = (itemId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(itemId)
      } else {
        next.delete(itemId)
      }
      return next
    })
  }

  const toggleSeller = (items: CartItem[], checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      items.forEach((item) => {
        if (checked) {
          next.add(item.id)
        } else {
          next.delete(item.id)
        }
      })
      return next
    })
  }

  if (authLoading || loading) {
    return <CartSkeleton />
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Your cart is empty.
        </CardContent>
      </Card>
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
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <p className="text-sm text-muted-foreground">
          Select items to checkout and review totals.
        </p>
      </header>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base uppercase">Selected total</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold text-foreground">
          {totalLabel}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {groups.map((group) => {
          const selectedCount = group.items.filter((item) =>
            selectedIds.has(item.id)
          ).length
          const allSelected =
            group.items.length > 0 && selectedCount === group.items.length
          const indeterminate =
            selectedCount > 0 && selectedCount < group.items.length
          const sellerProfile = sellerProfiles[group.sellerId]
          const sellerName =
            sellerProfile?.full_name ||
            sellerProfile?.username ||
            group.sellerId

          return (
            <Card key={group.sellerId}>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                      checked={
                        allSelected
                          ? true
                          : indeterminate
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(value) =>
                        toggleSeller(group.items, value === true)
                      }
                    />
                    <Link
                      href={`/products?seller_id=${group.sellerId}&returnTo=${encodeURIComponent(currentPath)}`}
                      className="text-sm font-semibold text-foreground transition hover:underline"
                    >
                      {sellerName}
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {group.items.length} items
                  </div>
                </div>
                <Separator />
              </CardHeader>
              <CardContent>
                <ItemGroup>
                  {group.items.map((item) => {
                    const brandName =
                      brandMap.get(item.products.brand_id) ||
                      item.products.brand_id
                    const categoryName =
                      categoryMap.get(item.products.category_id) ||
                      item.products.category_id
                    const priceLabel = (
                      item.products.price / 100
                    ).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })
                    const imageUrl = item.products.images?.[0]
                    const brandLabel = brandName.toUpperCase()
                    const categoryLabel = categoryName

                    return (
                      <Item key={item.id} variant="outline">
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={(value) =>
                            toggleItem(item.id, value === true)
                          }
                        />
                        <ItemMedia variant="image">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.products.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle className="text-sm font-semibold normal-case">
                            {item.products.title}
                          </ItemTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{brandLabel}</Badge>
                            <Badge variant="ghost">{categoryLabel}</Badge>
                          </div>
                        </ItemContent>
                        <ItemActions className="ml-auto">
                          <span className="text-sm font-semibold text-foreground">
                            {priceLabel}
                          </span>
                        </ItemActions>
                      </Item>
                    )
                  })}
                </ItemGroup>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
