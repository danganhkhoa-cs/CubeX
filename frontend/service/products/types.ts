export interface ProductBrand {
  id: string
  name: string
}

export interface ProductCategory {
  id: string
  name: string
}

export interface ProductSpecs {
  edition: string[]
  coated_types: string[]
  magnet_types: string[]
  spring_types: string[]
  core_materials: string[]
  customization_types: string[]
}

export interface GetBrandsResponse {
  success: boolean
  brands: ProductBrand[]
}

export interface GetCategoriesResponse {
  success: boolean
  categories: ProductCategory[]
}

export interface GetSpecsResponse {
  success: boolean
  specs: ProductSpecs
}

export interface Product {
  id: string
  seller_id: string
  title: string
  price: number
  images: string[]
  brand_id: string
  category_id: string
  description?: string
  specs?: Record<string, string | string[]>
  created_at?: string
}

export interface ProductDetail extends Product {
  is_sold: boolean
  is_deleted: boolean
}

export interface FilterProductsRequest {
  min_price: number | null
  max_price: number | null
  category_id: string | null
  brand_id: string | null
  size: string | null
  weight: string | null
  edition: string | null
  coated_type: string | null
  spring_type: string | null
  magnet_type: string | null
  customization_types: string[] | null
  core_material: string | null
}

export interface CreateProductRequest {
  title: string
  price: number
  brand_id: string
  category_id: string
  images: string[]
  description?: string | null
  specs?: Record<string, string | string[]> | null
}

export interface UpdateProductRequest {
  title?: string | null
  price?: number | null
  brand_id?: string | null
  category_id?: string | null
  images?: string[] | null
  description?: string | null
  specs?: Record<string, string | string[]> | null
}

export interface UploadImagesResponse {
  success: boolean
  urls: string[]
  errors?: { file: string; error: string }[]
}

export interface CreateProductResponse {
  success: boolean
  product: Product[]
}

export interface UpdateProductResponse {
  success: boolean
  product: Product[]
}

export interface ProductsPagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface GetProductsResponse {
  success: boolean
  products: Product[]
  pagination: ProductsPagination
}

export interface GetProductResponse {
  success: boolean
  product: ProductDetail
}
