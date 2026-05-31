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

interface CartContextValue {
  cartProductIds: Set<string>
  loading: boolean
  refresh: () => Promise<void>
  isInCart: (productId?: string) => boolean
  markProductAdded: (productId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [cartProductIds, setCartProductIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user?.user_id) {
      setCartProductIds(new Set())
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await cartService.getCart()
      setCartProductIds(new Set(response.cart_items.map((item) => item.product_id)))
    } catch {
      setCartProductIds(new Set())
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

  const value = useMemo(
    () => ({
      cartProductIds,
      loading,
      refresh,
      isInCart,
      markProductAdded,
    }),
    [cartProductIds, isInCart, loading, markProductAdded, refresh]
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
