import apiClient from "@/lib/api"
import type {
  AdminCatalogItem,
  AdminDispute,
  AdminConfigRow,
  AdminOrderRecord,
  AdminProductRecord,
  AdminDisputeResolution,
  AdminTransactionRecord,
  AdminSignUpRequest,
  AdminBrandMutationResponse,
  AdminCategoryMutationResponse,
  AdminSignUpResponse,
  GetAdminConfigResponse,
  GetAdminDisputesResponse,
  GetAdminOrdersResponse,
  GetAdminProductsResponse,
  GetAdminTransactionsResponse,
  ResolveDisputeResponse,
  UpdateAdminConfigResponse,
} from "./types"

export const adminService = {
  signUpAdmin: async (payload: AdminSignUpRequest): Promise<void> => {
    const response = await apiClient.post<AdminSignUpResponse>(
      "/admin/signup",
      payload
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create admin account")
    }
  },
  getDisputes: async (): Promise<AdminDispute[]> => {
    const response =
      await apiClient.get<GetAdminDisputesResponse>("/admin/disputes")

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load disputes")
    }

    return response.data.disputes || []
  },
  resolveDispute: async (
    trackingId: string,
    resolution: AdminDisputeResolution
  ): Promise<void> => {
    const response = await apiClient.post<ResolveDisputeResponse>(
      `/admin/dispute/${trackingId}/resolve`,
      {
        tracking_id: trackingId,
        resolution,
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to resolve dispute")
    }
  },
  getConfig: async (): Promise<AdminConfigRow[]> => {
    const response = await apiClient.get<GetAdminConfigResponse>("/admin/config")

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load config")
    }

    return response.data.config || []
  },
  updateConfig: async (id: string, value: unknown): Promise<AdminConfigRow> => {
    const response = await apiClient.patch<UpdateAdminConfigResponse>(
      "/admin/config",
      {
        id,
        value,
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update config")
    }

    const updated = response.data.config?.[0]
    if (!updated) {
      throw new Error("Config update returned empty result")
    }

    return updated
  },
  getProducts: async (): Promise<AdminProductRecord[]> => {
    const response =
      await apiClient.get<GetAdminProductsResponse>("/admin/products")

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load products")
    }

    return response.data.products || []
  },
  getOrders: async (): Promise<AdminOrderRecord[]> => {
    const response = await apiClient.get<GetAdminOrdersResponse>("/admin/orders")

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load orders")
    }

    return response.data.orders || []
  },
  getTransactions: async (): Promise<AdminTransactionRecord[]> => {
    const response =
      await apiClient.get<GetAdminTransactionsResponse>("/admin/transactions")

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load transactions")
    }

    return response.data.transactions || []
  },
  addBrand: async (name: string): Promise<AdminCatalogItem[]> => {
    const response = await apiClient.post<AdminBrandMutationResponse>(
      "/admin/brands",
      { name }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add brand")
    }

    return response.data.brands || []
  },
  renameBrand: async (id: string, newName: string): Promise<AdminCatalogItem[]> => {
    const response = await apiClient.patch<AdminBrandMutationResponse>(
      "/admin/brands",
      {
        id,
        new_name: newName,
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to rename brand")
    }

    return response.data.brands || []
  },
  deleteBrand: async (id: string): Promise<AdminCatalogItem[]> => {
    const response = await apiClient.delete<AdminBrandMutationResponse>(
      "/admin/brands",
      {
        data: { id },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete brand")
    }

    return response.data.brands || []
  },
  addCategory: async (name: string): Promise<AdminCatalogItem[]> => {
    const response = await apiClient.post<AdminCategoryMutationResponse>(
      "/admin/categories",
      { name }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add category")
    }

    return response.data.categories || []
  },
  renameCategory: async (
    id: string,
    newName: string
  ): Promise<AdminCatalogItem[]> => {
    const response = await apiClient.patch<AdminCategoryMutationResponse>(
      "/admin/categories",
      {
        id,
        new_name: newName,
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to rename category")
    }

    return response.data.categories || []
  },
  deleteCategory: async (id: string): Promise<AdminCatalogItem[]> => {
    const response = await apiClient.delete<AdminCategoryMutationResponse>(
      "/admin/categories",
      {
        data: { id },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete category")
    }

    return response.data.categories || []
  },
}
