export interface CreateOrderRequest {
  product_id: string
  shipping_name: string
  shipping_phone: string
  shipping_street: string
  shipping_district: string
  shipping_city: string
  shipping_note?: string
}

export interface CreateOrderResponse {
  success: boolean
  tracking_id?: string
  message?: string
}

export type OrderRole = "buyer" | "seller"
export type OrderStatus =
  | "pending"
  | "shipping"
  | "shipped"
  | "completed"
  | "cancelled"
  | "dispute"
  | "disputed"

export interface OrderProductSummary {
  id?: string
  title?: string
  images?: string[]
}

export interface OrderShippingInfo {
  name?: string
  phone?: string
  street?: string
  district?: string
  city?: string
  note?: string | null
}

export interface OrderSummary {
  id: string
  tracking_id?: string
  buyer_id?: string
  seller_id?: string
  product_id: string
  products?: OrderProductSummary | null
  product?: OrderProductSummary | null
  total_amount: number
  shipping_info?: OrderShippingInfo | null
  created_at: string
  status: OrderStatus | string
}

export interface GetOrderHistoryResponse {
  success: boolean
  orders: OrderSummary[]
  message?: string
}

export interface OrderDetail extends OrderSummary {
  product?: (OrderProductSummary & { price?: number }) | null
}

export interface GetOrderByTrackingResponse {
  success: boolean
  order: OrderDetail | OrderDetail[]
  message?: string
}

export interface OrderMutationResponse {
  success: boolean
  order?: OrderDetail
  message?: string
}

export interface RaiseDisputeRequest {
  reason: string
  evidence_urls: string[]
}
