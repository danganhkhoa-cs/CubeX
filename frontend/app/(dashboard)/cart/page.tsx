"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Store, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { cartService } from "@/service/cart"
import type { GetCartResponse } from "@/service/cart/types"
import { authService } from "@/service/auth"
import type { UserProfilePublic } from "@/service/auth/types"
import { orderService } from "@/service/orders"
import { useAuth } from "@/hooks/auth/useAuth"
import { useCart } from "@/hooks/cart/useCart"
import { useFilter } from "@/hooks/filter/useFilter"
import CartSkeleton from "@/components/CartSkeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

type CartItem = GetCartResponse["cart_items"][number]

type ShippingInfo = {
  shipping_name: string
  shipping_phone: string
  shipping_street: string
  shipping_district: string
  shipping_city: string
}

const emptyShippingInfo: ShippingInfo = {
  shipping_name: "",
  shipping_phone: "",
  shipping_street: "",
  shipping_district: "",
  shipping_city: "",
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response
    const maybeMessage = response?.data?.message
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return ""
}

export default function CartPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { cartItems, refresh: refreshCart, markProductRemoved } = useCart()
  const { brands, categories } = useFilter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sellerProfiles, setSellerProfiles] = useState<
    Record<string, UserProfilePublic | null>
  >({})
  const [shippingInfo, setShippingInfo] =
    useState<ShippingInfo>(emptyShippingInfo)
  const [sellerNotes, setSellerNotes] = useState<Record<string, string>>({})
  const [shippingOpen, setShippingOpen] = useState(false)
  const [unavailableOpen, setUnavailableOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [removingItemIds, setRemovingItemIds] = useState<Set<string>>(new Set())
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
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

  const availableItems = useMemo(() => {
    return cartItems.filter(
      (item) => !item.products.is_sold && !item.products.is_deleted
    )
  }, [cartItems])

  const unavailableItems = useMemo(() => {
    return cartItems.filter(
      (item) => item.products.is_sold || item.products.is_deleted
    )
  }, [cartItems])

  const groups = useMemo(() => {
    const map = new Map<string, CartItem[]>()
    availableItems.forEach((item) => {
      const sellerId = item.products.seller_id
      const items = map.get(sellerId) || []
      items.push(item)
      map.set(sellerId, items)
    })

    return Array.from(map.entries()).map(([sellerId, items]) => ({
      sellerId,
      items,
    }))
  }, [availableItems])

  const totalCents = useMemo(() => {
    let total = 0
    availableItems.forEach((item) => {
      if (selectedIds.has(item.id)) {
        total += item.products.price
      }
    })
    return total
  }, [availableItems, selectedIds])

  const totalLabel = useMemo(() => {
    return (totalCents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  }, [totalCents])

  const shippingComplete = useMemo(() => {
    return Object.values(shippingInfo).every((value) => value.trim().length > 0)
  }, [shippingInfo])

  const checkoutDisabled =
    selectedIds.size === 0 || !shippingComplete || checkoutLoading

  useEffect(() => {
    if (!user) return
    setShippingInfo((current) => ({
      shipping_name: current.shipping_name.trim()
        ? current.shipping_name
        : (user.full_name ?? ""),
      shipping_phone: current.shipping_phone.trim()
        ? current.shipping_phone
        : (user.phone ?? ""),
      shipping_street: current.shipping_street.trim()
        ? current.shipping_street
        : (user.street ?? ""),
      shipping_district: current.shipping_district.trim()
        ? current.shipping_district
        : (user.district ?? ""),
      shipping_city: current.shipping_city.trim()
        ? current.shipping_city
        : (user.city ?? ""),
    }))
  }, [user])

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
        const response = await refreshCart()
        if (!mounted) return

        if (!response) {
          setSelectedIds(new Set())
          setSellerProfiles({})
          return
        }

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
  }, [refreshCart, user])

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

  const handleShippingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setShippingInfo((current) => ({
      ...current,
      [name]: value,
    }))
    if (checkoutError) {
      setCheckoutError(null)
    }
  }

  const handleNoteChange = (sellerId: string, value: string) => {
    setSellerNotes((current) => ({
      ...current,
      [sellerId]: value,
    }))
    if (checkoutError) {
      setCheckoutError(null)
    }
  }

  const handleOpenProduct = (productId: string) => {
    router.push(
      `/products/${productId}?returnTo=${encodeURIComponent(currentPath)}`
    )
  }

  const handleRemoveFromCart = async (
    productId: string,
    cartItemId: string
  ) => {
    setRemovingItemIds((current) => {
      const next = new Set(current)
      next.add(cartItemId)
      return next
    })
    try {
      await cartService.removeFromCart(productId)
      setSelectedIds((current) => {
        const next = new Set(current)
        next.delete(cartItemId)
        return next
      })
      markProductRemoved(productId)
      toast.success("Removed from cart")
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to remove from cart"
      toast.error(message)
    } finally {
      setRemovingItemIds((current) => {
        const next = new Set(current)
        next.delete(cartItemId)
        return next
      })
    }
  }

  const handleCheckout = async () => {
    if (checkoutDisabled) return

    const selectedItems = availableItems.filter((item) =>
      selectedIds.has(item.id)
    )
    if (selectedItems.length === 0) return

    const payloadBase = {
      shipping_name: shippingInfo.shipping_name.trim(),
      shipping_phone: shippingInfo.shipping_phone.trim(),
      shipping_street: shippingInfo.shipping_street.trim(),
      shipping_district: shippingInfo.shipping_district.trim(),
      shipping_city: shippingInfo.shipping_city.trim(),
    }

    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const results = await Promise.allSettled(
        selectedItems.map((item) => {
          const note = (sellerNotes[item.products.seller_id] || "").trim()
          return orderService.createOrder({
            product_id: item.product_id,
            ...payloadBase,
            shipping_note: note.length ? note : undefined,
          })
        })
      )

      const successfulItems = selectedItems.filter(
        (_item, index) => results[index].status === "fulfilled"
      )
      const failedCount = selectedItems.length - successfulItems.length

      if (successfulItems.length > 0) {
        const removalResults = await Promise.allSettled(
          successfulItems.map((item) =>
            cartService.removeFromCart(item.product_id)
          )
        )
        const removedItems = successfulItems.filter(
          (_item, index) => removalResults[index].status === "fulfilled"
        )

        if (removedItems.length > 0) {
          setSelectedIds((current) => {
            const next = new Set(current)
            removedItems.forEach((item) => next.delete(item.id))
            return next
          })
          removedItems.forEach((item) => markProductRemoved(item.product_id))
        }

        if (removedItems.length !== successfulItems.length) {
          toast.error("Some items could not be removed from cart")
        }
      }

      if (failedCount > 0) {
        const failedMessages = results
          .filter(
            (result): result is PromiseRejectedResult =>
              result.status === "rejected"
          )
          .map((result) => getErrorMessage(result.reason))
          .filter(Boolean)
        const insufficientBalanceMessage = failedMessages.find((message) =>
          message.toLowerCase().includes("insufficient balance")
        )
        const message =
          insufficientBalanceMessage || failedMessages[0] || "Some orders failed to place"
        setCheckoutError(message)
        toast.error(message)
      } else {
        toast.success("Orders placed")
      }
    } finally {
      setCheckoutLoading(false)
    }
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
        <CardContent className="text-center text-lg font-semibold text-foreground uppercase">
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

      <Collapsible open={shippingOpen} onOpenChange={setShippingOpen}>
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base uppercase">
                  Shipping info
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  These details apply to every selected item.
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {shippingOpen ? "Hide" : "Edit"}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <Separator />
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="shipping_name">Full name</FieldLabel>
                  <Input
                    id="shipping_name"
                    name="shipping_name"
                    value={shippingInfo.shipping_name}
                    onChange={handleShippingChange}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="shipping_phone">Phone</FieldLabel>
                  <Input
                    id="shipping_phone"
                    name="shipping_phone"
                    value={shippingInfo.shipping_phone}
                    onChange={handleShippingChange}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="shipping_city">City</FieldLabel>
                  <Input
                    id="shipping_city"
                    name="shipping_city"
                    value={shippingInfo.shipping_city}
                    onChange={handleShippingChange}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="shipping_district">District</FieldLabel>
                  <Input
                    id="shipping_district"
                    name="shipping_district"
                    value={shippingInfo.shipping_district}
                    onChange={handleShippingChange}
                  />
                </Field>
                <Field className="col-span-2">
                  <FieldLabel htmlFor="shipping_street">Street</FieldLabel>
                  <Input
                    id="shipping_street"
                    name="shipping_street"
                    value={shippingInfo.shipping_street}
                    onChange={handleShippingChange}
                  />
                </Field>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base uppercase">Selected total</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkoutError && (
            <Alert variant="destructive">
              <AlertDescription>{checkoutError}</AlertDescription>
            </Alert>
          )}
          <div className="text-3xl font-semibold text-foreground">
            {totalLabel}
          </div>
        </CardContent>
        <Button
          disabled={checkoutDisabled}
          variant={checkoutDisabled ? "secondary" : "default"}
          size="lg"
          onClick={handleCheckout}
          className="text-md mx-8"
        >
          {checkoutLoading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Processing...
            </span>
          ) : (
            "Checkout"
          )}
        </Button>
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
                      className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:underline"
                    >
                      <Store className="size-4" />
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
                <Field className="mb-6">
                  <FieldLabel htmlFor={`note-${group.sellerId}`}>
                    Note (optional)
                  </FieldLabel>
                  <Input
                    id={`note-${group.sellerId}`}
                    name={`note-${group.sellerId}`}
                    placeholder="Add a note for this seller"
                    value={sellerNotes[group.sellerId] || ""}
                    onChange={(event) =>
                      handleNoteChange(group.sellerId, event.target.value)
                    }
                  />
                </Field>
                <ItemGroup>
                  {group.items.map((item) => {
                    const isRemoving = removingItemIds.has(item.id)
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
                      <div className="flex items-center gap-4" key={item.id}>
                        <Item
                          key={item.id}
                          variant="outline"
                          className="cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenProduct(item.product_id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleOpenProduct(item.product_id)
                            }
                          }}
                        >
                          <div
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                          >
                            <Checkbox
                              checked={selectedIds.has(item.id)}
                              onCheckedChange={(value) =>
                                toggleItem(item.id, value === true)
                              }
                            />
                          </div>
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
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isRemoving}
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleRemoveFromCart(item.product_id, item.id)
                          }}
                        >
                          {isRemoving ? (
                            <span className="inline-flex items-center gap-2">
                              <Spinner />
                              Deleting...
                            </span>
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </ItemGroup>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {unavailableItems.length > 0 && (
        <Collapsible open={unavailableOpen} onOpenChange={setUnavailableOpen}>
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base uppercase">
                    <span className="inline-flex items-center gap-2">
                      <TriangleAlert className="size-4" />
                      Unavailable items
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    These products are sold or removed. You can still view
                    details.
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    {unavailableOpen ? "Hide" : "View"}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <Separator />
              <CardContent className="space-y-4 pt-6">
                <ItemGroup>
                  {unavailableItems.map((item) => {
                    const isRemoving = removingItemIds.has(item.id)
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
                      <div className="flex items-center gap-4" key={item.id}>
                        <Item
                          key={item.id}
                          variant="outline"
                          className="cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenProduct(item.product_id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleOpenProduct(item.product_id)
                            }
                          }}
                        >
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
                              <Badge variant="destructive">Unavailable</Badge>
                            </div>
                          </ItemContent>
                          <ItemActions className="ml-auto">
                            <span className="text-sm font-semibold text-foreground">
                              {priceLabel}
                            </span>
                          </ItemActions>
                        </Item>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isRemoving}
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleRemoveFromCart(item.product_id, item.id)
                          }}
                        >
                          {isRemoving ? (
                            <span className="inline-flex items-center gap-2">
                              <Spinner />
                              Deleting...
                            </span>
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </ItemGroup>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </main>
  )
}
