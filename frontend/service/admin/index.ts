import apiClient from "@/lib/api"
import type {
  AdminDispute,
  AdminConfigRow,
  AdminOrderRecord,
  AdminProductRecord,
  AdminDisputeResolution,
  AdminTransactionRecord,
  GetAdminConfigResponse,
  GetAdminDisputesResponse,
  GetAdminOrdersResponse,
  GetAdminProductsResponse,
  GetAdminTransactionsResponse,
  ResolveDisputeResponse,
  UpdateAdminConfigResponse,
} from "./types"

export const adminService = {
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
      await apiClient.get<GetAdminProductsResponse>("/admin/statistics/products")

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
}
