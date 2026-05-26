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
  specs?: Record<string, string>
  created_at?: string
}

export interface GetProductsResponse {
  success: boolean
  products: Product[]
}
