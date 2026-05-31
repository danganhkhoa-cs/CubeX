import apiClient from "@/lib/api"
import type {
  GetWalletBalanceResponse,
  GetWalletTransactionsResponse,
  WalletActionRequest,
  WalletActionResponse,
  WalletTransaction,
} from "./types"

export const walletService = {
  getBalance: async (): Promise<number> => {
    const response =
      await apiClient.get<GetWalletBalanceResponse>("/wallet/balance")

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load wallet balance")
    }

    return response.data.balance
  },
  getTransactions: async (): Promise<WalletTransaction[]> => {
    const response =
      await apiClient.get<GetWalletTransactionsResponse>("/wallet/transactions")

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to load wallet transactions"
      )
    }

    return response.data.transactions
  },
  topUp: async (payload: WalletActionRequest): Promise<WalletTransaction> => {
    const response = await apiClient.post<WalletActionResponse>(
      "/wallet/topup",
      payload
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to top up wallet")
    }

    return response.data.transaction
  },
  withdraw: async (
    payload: WalletActionRequest
  ): Promise<WalletTransaction> => {
    const response = await apiClient.post<WalletActionResponse>(
      "/wallet/withdraw",
      payload
    )

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to withdraw from wallet")
    }

    return response.data.transaction
  },
}

