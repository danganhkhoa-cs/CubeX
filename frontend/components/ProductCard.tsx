"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/hooks/auth/useAuth"
import { useCart } from "@/hooks/cart/useCart"
import { cartService } from "@/service/cart"
import { toast } from "sonner"

type ProductCardProps = {
  title: string
  price: number
  productId?: string
  images?: string[]
  brandName?: string
  categoryName?: string
  sellerName?: string
  specs?: Record<string, string | string[]>
  href?: string
  isHiddenButton?: boolean
}

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

export default function ProductCard({
  title,
  price,
  productId,
  images,
  brandName,
  categoryName,
  specs,
  href,
  isHiddenButton = false,
}: ProductCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { isInCart, markProductAdded } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const priceLabel = (price / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })

  const isAddedForCurrentUser = !!user && isInCart(productId)

  const handleAddToCart = async () => {
    if (!productId) {
      console.error("Product ID is required")
      return
    }

    // Check if user is logged in
    if (!user) {
      router.push("/signin")
      return
    }

    try {
      setIsLoading(true)
      const response = await cartService.addToCart({ product_id: productId })

      if (response.success) {
        markProductAdded(productId)
        toast.success("Added to cart")
      } else {
        toast.error(response.message || "Failed to add to cart")
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast.error("Failed to add to cart")
    } finally {
      setIsLoading(false)
    }
  }

  const details = (
    <>
      <CardHeader className="space-y-3">
        <div
          className="aspect-4/3 w-full rounded-md bg-muted bg-cover bg-center"
          style={{ backgroundImage: `url(${images?.[0] ?? ""})` }}
        />
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex flex-col items-start gap-1">
            <Badge variant="secondary">{brandName?.toUpperCase() ?? ""}</Badge>
            <Badge variant="ghost">{categoryName}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-muted-foreground">
        {specs && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(specs).map(([k, v]) => {
              if (k === "customization_types") {
                if (Array.isArray(v)) {
                  return v.map((item) => {
                    const label = specsCustomizationLabels[item] || item
                    return (
                      <Badge key={`${k}-${item}`} variant="outline">
                        {label}
                      </Badge>
                    )
                  })
                }
              } else {
                const label = specsLabels[v as string] || v
                return (
                  <Badge key={k} variant="outline">
                    {label}
                  </Badge>
                )
              }
            })}
          </div>
        )}
      </CardContent>
    </>
  )

  return (
    <Card className="flex h-full flex-col overflow-hidden transition hover:shadow-sm">
      {href ? (
        <Link
          href={href}
          className="flex flex-1 flex-col focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {details}
        </Link>
      ) : (
        details
      )}
      <CardFooter className="flex flex-col gap-2">
        <span className="block text-xl font-bold text-foreground">
          {priceLabel}
        </span>
        <Button
          size="sm"
          variant={isAddedForCurrentUser ? "secondary" : "default"}
          className="text-md w-full font-bold"
          onClick={handleAddToCart}
          disabled={isLoading || isAddedForCurrentUser}
          hidden={isHiddenButton}
        >
          {isAddedForCurrentUser ? (
            "Added"
          ) : isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Adding...
            </span>
          ) : (
            "Add to cart"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
