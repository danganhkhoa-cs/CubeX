"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { RefreshCw } from "lucide-react"

import { useAuth } from "@/hooks/auth/useAuth"
import { authService } from "@/service/auth"
import type { UserProfilePublic } from "@/service/auth/types"
import { adminService } from "@/service/admin"
import type {
  AdminOrderRecord,
  AdminTransactionRecord,
} from "@/service/admin/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Granularity = "day" | "week" | "month" | "year"

type SellerProfileMap = Record<string, UserProfilePublic>

const topSellerChartConfig = {
  count: {
    label: "Completed orders",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const platformFeeChartConfig = {
  fee: {
    label: "Platform fee",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const disputeRateChartConfig = {
  dispute: {
    label: "Dispute",
    color: "var(--chart-1)",
  },
  normal: {
    label: "Non-dispute",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

function toValidDate(value: unknown) {
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

function getBucketStart(date: Date, granularity: Granularity) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)

  if (granularity === "day") {
    return result
  }

  if (granularity === "week") {
    const day = (result.getDay() + 6) % 7
    result.setDate(result.getDate() - day)
    return result
  }

  if (granularity === "month") {
    result.setDate(1)
    return result
  }

  result.setMonth(0, 1)
  return result
}

function getRangeStart(now: Date, granularity: Granularity) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (granularity === "day") {
    start.setDate(start.getDate() - 29)
    return start
  }

  if (granularity === "week") {
    start.setDate(start.getDate() - 7 * 11)
    return start
  }

  if (granularity === "month") {
    start.setMonth(start.getMonth() - 11)
    start.setDate(1)
    return start
  }

  start.setFullYear(start.getFullYear() - 4, 0, 1)
  return start
}

function formatBucketLabel(date: Date, granularity: Granularity) {
  if (granularity === "day") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (granularity === "week") {
    const end = new Date(date)
    end.setDate(end.getDate() + 6)
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  }

  if (granularity === "month") {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  return date.toLocaleDateString("en-US", { year: "numeric" })
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  })
}

function shortUserId(value: string) {
  if (!value) return "-"
  if (value.length <= 10) return value
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

export default function AdminStatisticsPage() {
  const { user, loading: authLoading } = useAuth()

  const [orders, setOrders] = useState<AdminOrderRecord[]>([])
  const [transactions, setTransactions] = useState<AdminTransactionRecord[]>([])
  const [sellerProfiles, setSellerProfiles] = useState<SellerProfileMap>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [granularity, setGranularity] = useState<Granularity>("month")

  const isAdmin = user?.role === "admin"

  const loadStatistics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [orderData, transactionData] = await Promise.all([
        adminService.getOrders(),
        adminService.getTransactions(),
      ])

      setOrders(orderData)
      setTransactions(transactionData)

      const sellerIds = Array.from(
        new Set(
          orderData
            .filter((item) => item.seller_id && item.status === "completed")
            .map((item) => item.seller_id)
        )
      )

      const profileEntries = await Promise.all(
        sellerIds.map(async (sellerId) => {
          try {
            const response = await authService.getUserPublicInfo(sellerId)
            return response.user ? ([sellerId, response.user] as const) : null
          } catch {
            return null
          }
        })
      )

      const nextProfiles: SellerProfileMap = {}
      for (const entry of profileEntries) {
        if (!entry) continue
        nextProfiles[entry[0]] = entry[1]
      }
      setSellerProfiles(nextProfiles)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load statistics data"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading || !isAdmin) return
    const timer = setTimeout(() => {
      void loadStatistics()
    }, 0)
    return () => clearTimeout(timer)
  }, [authLoading, isAdmin, loadStatistics])

  const topSellerData = useMemo(() => {
    const now = new Date()
    const rangeStart = getRangeStart(now, granularity)
    const buckets = new Map<
      number,
      { start: Date; sellerCount: Map<string, number> }
    >()

    for (const order of orders) {
      if (order.status !== "completed") continue
      if (!order.seller_id) continue
      const createdAt = toValidDate(order.created_at)
      if (!createdAt || createdAt < rangeStart) continue

      const bucketStart = getBucketStart(createdAt, granularity)
      const bucketKey = bucketStart.getTime()
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, { start: bucketStart, sellerCount: new Map() })
      }

      const bucket = buckets.get(bucketKey)
      if (!bucket) continue
      bucket.sellerCount.set(
        order.seller_id,
        (bucket.sellerCount.get(order.seller_id) ?? 0) + 1
      )
    }

    return Array.from(buckets.values())
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((bucket) => {
        const topEntry = Array.from(bucket.sellerCount.entries()).sort(
          (a, b) => b[1] - a[1]
        )[0]
        const sellerId = topEntry?.[0] || "-"
        const count = topEntry?.[1] || 0
        const profile = sellerProfiles[sellerId]
        const sellerName = profile?.full_name || shortUserId(sellerId)

        return {
          bucket: bucket.start.toISOString(),
          label: formatBucketLabel(bucket.start, granularity),
          seller: sellerName,
          sellerId,
          count,
        }
      })
  }, [granularity, orders, sellerProfiles])

  const platformFeeData = useMemo(() => {
    const now = new Date()
    const rangeStart = getRangeStart(now, granularity)
    const buckets = new Map<number, { start: Date; feeCents: number }>()

    for (const transaction of transactions) {
      if (transaction.type !== "platform_fee") continue
      const createdAt = toValidDate(transaction.created_at)
      if (!createdAt || createdAt < rangeStart) continue
      const amount = Number(transaction.amount)
      if (!Number.isFinite(amount)) continue

      const bucketStart = getBucketStart(createdAt, granularity)
      const bucketKey = bucketStart.getTime()

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, { start: bucketStart, feeCents: 0 })
      }

      const bucket = buckets.get(bucketKey)
      if (!bucket) continue
      bucket.feeCents += amount
    }

    return Array.from(buckets.values())
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((bucket) => ({
        bucket: bucket.start.toISOString(),
        label: formatBucketLabel(bucket.start, granularity),
        fee: bucket.feeCents / 100,
      }))
  }, [granularity, transactions])

  const disputePieData = useMemo(() => {
    const now = new Date()
    const rangeStart = getRangeStart(now, granularity)
    const scopedOrders = orders.filter((order) => {
      const createdAt = toValidDate(order.created_at)
      return !!createdAt && createdAt >= rangeStart
    })

    const total = scopedOrders.length
    const dispute = scopedOrders.filter((order) =>
      ["dispute", "disputed"].includes(String(order.status))
    ).length
    const normal = Math.max(total - dispute, 0)

    return [
      {
        name: "dispute",
        value: dispute,
        fill: "var(--color-dispute)",
      },
      {
        name: "normal",
        value: normal,
        fill: "var(--color-normal)",
      },
    ]
  }, [granularity, orders])

  const disputePercentForRange = useMemo(() => {
    const dispute = disputePieData.find((item) => item.name === "dispute")?.value ?? 0
    const total = disputePieData.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) return 0
    return (dispute / total) * 100
  }, [disputePieData])

  const summary = useMemo(() => {
    const totalCompletedOrders = orders.filter(
      (order) => order.status === "completed"
    ).length
    const totalPlatformFee = transactions
      .filter((item) => item.type === "platform_fee")
      .reduce((sum, item) => {
        const amount = Number(item.amount)
        return Number.isFinite(amount) ? sum + amount : sum
      }, 0)

    const totalOrders = orders.length
    const totalDispute = orders.filter((order) =>
      ["dispute", "disputed"].includes(String(order.status))
    ).length
    const disputeRate =
      totalOrders === 0 ? 0 : Number(((totalDispute / totalOrders) * 100).toFixed(2))

    return {
      totalCompletedOrders,
      totalPlatformFee: totalPlatformFee / 100,
      disputeRate,
    }
  }, [orders, transactions])

  if (authLoading) {
    return (
      <main className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <Card>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Statistics</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </header>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Statistics</h1>
          <p className="text-sm text-muted-foreground">
            Top seller trend, platform fee earning, and dispute rate analytics.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadStatistics()} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </header>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Group by</span>
            <Tabs
              value={granularity}
              onValueChange={(value) => setGranularity(value as Granularity)}
            >
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
            <Badge variant="outline">
              Completed orders: {summary.totalCompletedOrders.toLocaleString()}
            </Badge>
            <Badge variant="outline">
              Platform fee: {formatCurrency(summary.totalPlatformFee)}
            </Badge>
            <Badge variant="outline">Dispute rate: {summary.disputeRate}%</Badge>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top seller by completed orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : topSellerData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No completed orders in selected range.
              </p>
            ) : (
              <ChartContainer
                config={topSellerChartConfig}
                className="h-[320px] w-full"
              >
                <BarChart data={topSellerData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, _, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {item.payload.seller}
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {Number(value).toLocaleString()}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={0} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Platform fee earning trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : platformFeeData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No platform fee transactions in selected range.
              </p>
            ) : (
              <ChartContainer
                config={platformFeeChartConfig}
                className="h-[320px] w-full"
              >
                <LineChart data={platformFeeData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="font-mono font-medium text-foreground">
                            {formatCurrency(Number(value))}
                          </span>
                        )}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="fee"
                    stroke="var(--color-fee)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dispute rate</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <div className="relative mx-auto h-[320px] w-full max-w-xl">
              <ChartContainer
                config={disputeRateChartConfig}
                className="h-[320px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={disputePieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    strokeWidth={2}
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-semibold">
                    {disputePercentForRange.toFixed(1)}%
                  </p>
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    Dispute rate
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
