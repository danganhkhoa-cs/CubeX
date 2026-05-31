"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useAuth } from "@/hooks/auth/useAuth"
import { cartService } from "@/service/cart"
import type { GetCartResponse } from "@/service/cart/types"

interface CartContextValue {
  cartItems: GetCartResponse["cart_items"]
  cartProductIds: Set<string>
  loading: boolean
  refresh: () => Promise<GetCartResponse | null>
  isInCart: (productId?: string) => boolean
  markProductAdded: (productId: string) => void
  markProductRemoved: (productId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState<GetCartResponse["cart_items"]>([])
  const [cartProductIds, setCartProductIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async (): Promise<GetCartResponse | null> => {
    if (!user?.user_id) {
      setCartItems([])
      setCartProductIds(new Set())
      setLoading(false)
      return null
    }

    setLoading(true)
    try {
      const response = await cartService.getCart()
      setCartItems(response.cart_items)
      setCartProductIds(new Set(response.cart_items.map((item) => item.product_id)))
      return response
    } catch {
      setCartItems([])
      setCartProductIds(new Set())
      return null
    } finally {
      setLoading(false)
    }
  }, [user?.user_id])

  useEffect(() => {
    if (authLoading) return
    queueMicrotask(() => {
      void refresh()
    })
  }, [authLoading, refresh])

  const isInCart = useCallback(
    (productId?: string) => {
      if (!productId) return false
      return cartProductIds.has(productId)
    },
    [cartProductIds]
  )

  const markProductAdded = useCallback((productId: string) => {
    setCartProductIds((current) => {
      if (current.has(productId)) return current
      const next = new Set(current)
      next.add(productId)
      return next
    })
  }, [])

  const markProductRemoved = useCallback((productId: string) => {
    setCartProductIds((current) => {
      if (!current.has(productId)) return current
      const next = new Set(current)
      next.delete(productId)
      return next
    })
    setCartItems((current) =>
      current.filter((item) => item.product_id !== productId)
    )
  }, [])

  const value = useMemo(
    () => ({
      cartItems,
      cartProductIds,
      loading,
      refresh,
      isInCart,
      markProductAdded,
      markProductRemoved,
    }),
    [
      cartItems,
      cartProductIds,
      isInCart,
      loading,
      markProductAdded,
      markProductRemoved,
      refresh,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
