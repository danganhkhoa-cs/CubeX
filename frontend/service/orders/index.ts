import apiClient from "@/lib/api"
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrderByTrackingResponse,
  GetOrderHistoryResponse,
  OrderDetail,
  OrderMutationResponse,
  OrderRole,
  OrderSummary,
  RaiseDisputeRequest,
} from "./types"

export const orderService = {
  createOrder: async (
    payload: CreateOrderRequest
  ): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>(
      "/orders",
      payload
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create order")
    }

    return response.data
  },
  getOrderHistory: async (role: OrderRole): Promise<OrderSummary[]> => {
    const response = await apiClient.get<GetOrderHistoryResponse>("/orders", {
      params: { role },
    })

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load orders")
    }

    return response.data.orders
  },
  getOrderByTrackingId: async (trackingId: string): Promise<OrderDetail> => {
    const response = await apiClient.get<GetOrderByTrackingResponse>(
      `/orders/${trackingId}`
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load order")
    }

    const order = Array.isArray(response.data.order)
      ? response.data.order[0]
      : response.data.order

    if (!order) {
      throw new Error("Order not found")
    }

    return order
  },
  confirmShipping: async (trackingId: string): Promise<OrderDetail | null> => {
    const response = await apiClient.post<OrderMutationResponse>(
      `/orders/${trackingId}/shipped`
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update order status")
    }

    return response.data.order || null
  },
  confirmReceived: async (trackingId: string): Promise<OrderDetail | null> => {
    const response = await apiClient.post<OrderMutationResponse>(
      `/orders/${trackingId}/confirm`
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update order status")
    }

    return response.data.order || null
  },
  cancelOrder: async (trackingId: string): Promise<OrderDetail | null> => {
    const response = await apiClient.post<OrderMutationResponse>(
      `/orders/${trackingId}/cancel`
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to cancel order")
    }

    return response.data.order || null
  },
  raiseDispute: async (
    trackingId: string,
    payload: RaiseDisputeRequest
  ): Promise<void> => {
    const response = await apiClient.post<{
      success: boolean
      message?: string
    }>(`/orders/${trackingId}/dispute`, payload)

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to raise dispute")
    }
  },
}
