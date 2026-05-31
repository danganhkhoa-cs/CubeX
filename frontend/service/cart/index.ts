import apiClient from "@/lib/api"
import type {
  AddToCartRequest,
  AddToCartResponse,
  GetCartResponse,
  RemoveFromCartResponse,
} from "./types"

export const cartService = {
  addToCart: async (payload: AddToCartRequest): Promise<AddToCartResponse> => {
    const response = await apiClient.post<AddToCartResponse>("/cart", payload)

    return response.data
  },

  getCart: async (): Promise<GetCartResponse> => {
    const response = await apiClient.get<GetCartResponse>("/cart")

    if (!response.data.success) {
      throw new Error("Failed to load cart")
    }

    return response.data
  },

  removeFromCart: async (
    productId: string
  ): Promise<RemoveFromCartResponse> => {
    const response = await apiClient.delete<RemoveFromCartResponse>(
      `/cart/${productId}`
    )

    return response.data
  },

  clearCart: async (): Promise<RemoveFromCartResponse> => {
    const response = await apiClient.delete<RemoveFromCartResponse>("/cart")

    return response.data
  },
}
