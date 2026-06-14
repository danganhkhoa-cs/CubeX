"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftRight,
  CircleDollarSign,
  HandCoins,
  RotateCcw,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import WalletSkeleton from "@/components/WalletSkeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/auth/useAuth"
import { walletService } from "@/service/wallet"
import type { WalletTransaction } from "@/service/wallet/types"

function formatMoneyFromCents(value: number) {
  return (value / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

function formatCreatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-US")
}

function getTrackingId(transaction: WalletTransaction) {
  if (Array.isArray(transaction.orders)) {
    return transaction.orders[0]?.tracking_id || "-"
  }
  return transaction.orders?.tracking_id || "-"
}

function formatTypeLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatAmountWithCommas(rawInput: string) {
  const cleaned = rawInput.replace(/[^\d.]/g, "")
  const firstDotIndex = cleaned.indexOf(".")
  const normalized =
    firstDotIndex === -1
      ? cleaned
      : `${cleaned.slice(0, firstDotIndex + 1)}${cleaned
          .slice(firstDotIndex + 1)
          .replace(/\./g, "")}`

  const [integerPart = "", decimalPart] = normalized.split(".")
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`
  }

  return formattedInteger
}

function getTypeIcon(type: string) {
  const normalized = type.toLowerCase()
  if (normalized === "topup") return CircleDollarSign
  if (normalized === "withdraw") return HandCoins
  if (normalized === "refund") return RotateCcw
  if (normalized === "dispute") return ShieldAlert
  return ArrowLeftRight
}

function isMinusTransactionType(type: string, amount: number) {
  if (amount < 0) return true
  const normalized = type.toLowerCase()
  return (
    normalized === "withdraw" ||
    normalized === "payment" ||
    normalized === "release" ||
    normalized === "debit" ||
    normalized === "fee"
  )
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response
    const maybeMessage = response?.data?.message
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return ""
}

export default function WalletPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [amountInput, setAmountInput] = useState("")
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<
    "topup" | "withdraw" | null
  >(null)

  const loadWallet = useCallback(async (silent = false) => {
    if (!silent) {
      setPageLoading(true)
    }
    setPageError(null)

    try {
      const [nextBalance, nextTransactions] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ])
      setBalance(nextBalance)
      setTransactions(nextTransactions)
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to load wallet data"
      setPageError(message)
    } finally {
      if (!silent) {
        setPageLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (!user) return
    void loadWallet()
  }, [loadWallet, user])

  const amountCents = useMemo(() => {
    const parsed = Number(amountInput.replace(/,/g, ""))
    if (!amountInput || Number.isNaN(parsed) || parsed <= 0) {
      return null
    }
    return Math.round(parsed * 100)
  }, [amountInput])

  const actionDisabled = actionLoading !== null || amountCents === null
  const transactionTypes = useMemo(() => {
    return Array.from(new Set(transactions.map((tx) => tx.type)))
  }, [transactions])
  const visibleTransactions = useMemo(() => {
    if (typeFilter === "all") {
      return transactions
    }
    return transactions.filter((transaction) => transaction.type === typeFilter)
  }, [transactions, typeFilter])

  useEffect(() => {
    if (typeFilter === "all") return
    if (!transactionTypes.includes(typeFilter)) {
      setTypeFilter("all")
    }
  }, [transactionTypes, typeFilter])

  const handleAction = async (type: "topup" | "withdraw") => {
    if (amountCents === null) {
      setFormError("Enter a valid amount.")
      return
    }

    setFormError(null)
    setActionLoading(type)

    try {
      if (type === "topup") {
        await walletService.topUp({ amount: amountCents })
        toast.success("Top up successful")
      } else {
        await walletService.withdraw({ amount: amountCents })
        toast.success("Withdraw successful")
      }

      setAmountInput("")
      await loadWallet(true)
    } catch (requestError) {
      const backendMessage = getErrorMessage(requestError)
      const hasInsufficientBalance = backendMessage
        .toLowerCase()
        .includes("insufficient balance")
      const message = hasInsufficientBalance
        ? backendMessage
        : backendMessage ||
          (type === "topup"
            ? "Failed to top up wallet"
            : "Failed to withdraw from wallet")
      setFormError(message)
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading || pageLoading) {
    return <WalletSkeleton />
  }

  if (!user) {
    return null
  }

  if (pageError) {
    return (
      <main className="space-y-6">
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {pageError}
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Manage balance, top up, withdraw, and review transaction history.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-semibold">
            {formatMoneyFromCents(balance)}
          </p>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(event) =>
                  setAmountInput(formatAmountWithCommas(event.target.value))
                }
                placeholder="100"
                disabled={actionLoading !== null}
              />
            </div>
            <Button
              onClick={() => void handleAction("topup")}
              disabled={actionDisabled}
            >
              {actionLoading === "topup" ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner />
                  Processing...
                </span>
              ) : (
                "Top up"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleAction("withdraw")}
              disabled={actionDisabled}
            >
              {actionLoading === "withdraw" ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner />
                  Processing...
                </span>
              ) : (
                "Withdraw"
              )}
            </Button>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList>
              <TabsTrigger value="all">
                <ArrowLeftRight className="size-3.5" />
                All
              </TabsTrigger>
              {transactionTypes.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {(() => {
                    const TypeIcon = getTypeIcon(type)
                    return <TypeIcon className="size-3.5" />
                  })()}
                  {formatTypeLabel(type)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-muted-foreground" colSpan={5}>
                      No transactions found for this type.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.id}
                      </TableCell>
                      <TableCell>{getTrackingId(transaction)}</TableCell>
                      <TableCell>
                        {formatMoneyFromCents(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const TypeIcon = getTypeIcon(transaction.type)
                          const isMinus = isMinusTransactionType(
                            transaction.type,
                            transaction.amount
                          )
                          return (
                            <Badge variant={isMinus ? "outline" : "secondary"}>
                              <span className="inline-flex items-center gap-1.5">
                                <TypeIcon className="size-3.5" />
                                {formatTypeLabel(transaction.type)}
                              </span>
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCreatedAt(transaction.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
