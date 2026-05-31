import apiClient from "@/lib/api"
import type {
  GetBrandsResponse,
  GetCategoriesResponse,
  GetSpecsResponse,
  ProductBrand,
  ProductCategory,
  ProductSpecs,
  Product,
  GetProductsResponse,
  FilterProductsRequest,
  CreateProductRequest,
  CreateProductResponse,
  UploadImagesResponse,
  GetProductResponse,
  ProductDetail,
} from "./types"

type ProductListParams = {
  page?: number
  limit?: number
  sellerId?: string
  sortOrder?: "asc" | "desc"
}

export const productService = {
  getBrands: async (): Promise<ProductBrand[]> => {
    const response = await apiClient.get<GetBrandsResponse>("/products/brands")

    if (!response.data.success) {
      throw new Error("Failed to load product brands")
    }

    return response.data.brands
  },
  getCategories: async (): Promise<ProductCategory[]> => {
    const response =
      await apiClient.get<GetCategoriesResponse>("/products/types")

    if (!response.data.success) {
      throw new Error("Failed to load product categories")
    }

    return response.data.categories
  },
  getSpecs: async (): Promise<ProductSpecs> => {
    const response = await apiClient.get<GetSpecsResponse>("/products/specs")

    if (!response.data.success) {
      throw new Error("Failed to load product specs")
    }

    return response.data.specs
  },
  getProducts: async (
    params: ProductListParams = {}
  ): Promise<GetProductsResponse> => {
    const response = await apiClient.get<GetProductsResponse>("/products", {
      params: {
        page: params.page,
        limit: params.limit,
        seller_id: params.sellerId,
        sort_order: params.sortOrder,
      },
    })

    if (!response.data.success) {
      throw new Error("Failed to load products")
    }

    return response.data
  },
  getFilteredProducts: async (
    payload: FilterProductsRequest,
    params: ProductListParams = {}
  ): Promise<GetProductsResponse> => {
    const response = await apiClient.post<GetProductsResponse>(
      "/products/filter",
      payload,
      {
        params: {
          page: params.page,
          limit: params.limit,
          seller_id: params.sellerId,
          sort_order: params.sortOrder,
        },
      }
    )

    if (!response.data.success) {
      throw new Error("Failed to load filtered products")
    }

    return response.data
  },
  getProductById: async (id: string): Promise<ProductDetail> => {
    const response = await apiClient.get<GetProductResponse>(`/products/${id}`)

    if (!response.data.success) {
      throw new Error("Failed to load product")
    }

    return response.data.product
  },
  uploadImages: async (
    files: File[]
  ): Promise<{
    urls: string[]
    errors?: { file: string; error: string }[]
  }> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("images", file)
    })

    const response = await apiClient.post<UploadImagesResponse>(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    if (!response.data.success) {
      throw new Error("Failed to upload images")
    }

    return { urls: response.data.urls, errors: response.data.errors }
  },
  createProduct: async (payload: CreateProductRequest): Promise<Product[]> => {
    const response = await apiClient.post<CreateProductResponse>(
      "/products",
      payload
    )

    if (!response.data.success) {
      throw new Error("Failed to create listing")
    }

    return response.data.product
  },
}
