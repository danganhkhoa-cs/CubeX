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
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<GetProductsResponse>("/products")

    if (!response.data.success) {
      throw new Error("Failed to load products")
    }

    return response.data.products
  },
  getFilteredProducts: async (
    payload: FilterProductsRequest
  ): Promise<Product[]> => {
    const response = await apiClient.post<GetProductsResponse>(
      "/products/filter",
      payload
    )

    if (!response.data.success) {
      throw new Error("Failed to load filtered products")
    }

    return response.data.products
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
