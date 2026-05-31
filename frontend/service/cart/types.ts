export interface AddToCartRequest {
  product_id: string
}

export interface AddToCartResponse {
  success: boolean
  message?: string
  cart_item?: {
    id: string
    product_id: string
    user_id: string
    created_at: string
  }
}

export interface GetCartResponse {
  success: boolean
  cart_items: Array<{
    id: string
    product_id: string
    created_at: string
    products: {
      id: string
      seller_id: string
      brand_id: string
      category_id: string
      title: string
      price: number
      images: string[]
      is_sold: boolean
      is_deleted: boolean
    }
  }>
}

export interface RemoveFromCartResponse {
  success: boolean
  message?: string
}
