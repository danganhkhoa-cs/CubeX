export type AdminDisputeResolution = "refund_buyer" | "release_to_seller"

export interface AdminDisputeProduct {
  id: string
  title?: string
  price?: number
  description?: string | null
  images?: string[]
  specs?: Record<string, unknown> | null
  seller_id?: string
  brand_id?: string
  category_id?: string
  is_sold?: boolean
  is_deleted?: boolean
  created_at?: string
}

export interface AdminDispute {
  id: string
  order_id: string
  buyer_id: string
  reason: string
  evidence_urls: string[]
  resolution: AdminDisputeResolution | null
  created_at: string
  product?: AdminDisputeProduct | null
  tracking_id?: string
  order_tracking_id?: string
}

export interface GetAdminDisputesResponse {
  success: boolean
  disputes: AdminDispute[]
  message?: string
}

export interface ResolveDisputeResponse {
  success: boolean
  order?: Record<string, unknown>
  message?: string
}

export interface AdminConfigRow {
  id: string
  value: unknown
  created_at?: string
  updated_at?: string
}

export interface GetAdminConfigResponse {
  success: boolean
  config: AdminConfigRow[]
  message?: string
}

export interface UpdateAdminConfigResponse {
  success: boolean
  config: AdminConfigRow[]
  message?: string
}

export interface AdminProductRecord {
  id: string
  seller_id: string
  title?: string
  created_at: string
  [key: string]: unknown
}

export interface AdminOrderRecord {
  id: string
  tracking_id?: string
  seller_id: string
  buyer_id?: string
  status: string
  created_at: string
  [key: string]: unknown
}

export interface AdminTransactionRecord {
  id: string
  type: string
  amount: number
  created_at: string
  [key: string]: unknown
}

export interface GetAdminProductsResponse {
  success: boolean
  products: AdminProductRecord[]
  message?: string
}

export interface GetAdminOrdersResponse {
  success: boolean
  orders: AdminOrderRecord[]
  message?: string
}

export interface GetAdminTransactionsResponse {
  success: boolean
  transactions: AdminTransactionRecord[]
  message?: string
}

export interface AdminCatalogItem {
  id: string
  name: string
}

export interface AdminBrandMutationResponse {
  success: boolean
  brands: AdminCatalogItem[]
  message?: string
}

export interface AdminCategoryMutationResponse {
  success: boolean
  categories: AdminCatalogItem[]
  message?: string
}

export interface AdminSignUpRequest {
  email: string
  password: string
  username: string
  full_name: string
}

export interface AdminSignUpResponse {
  success: boolean
  data?: unknown
  message?: string
}
