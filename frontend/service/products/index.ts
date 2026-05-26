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
}
