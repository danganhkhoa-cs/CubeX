export interface WalletTransactionOrderRef {
  tracking_id: string
}

export interface WalletTransaction {
  id: string
  order_id: string | null
  orders: WalletTransactionOrderRef | WalletTransactionOrderRef[] | null
  amount: number
  type: string
  created_at: string
}

export interface GetWalletBalanceResponse {
  success: boolean
  balance: number
  message?: string
}

export interface GetWalletTransactionsResponse {
  success: boolean
  transactions: WalletTransaction[]
  message?: string
}

export interface WalletActionRequest {
  amount: number
}

export interface WalletActionResponse {
  success: boolean
  transaction: WalletTransaction
  message?: string
}

