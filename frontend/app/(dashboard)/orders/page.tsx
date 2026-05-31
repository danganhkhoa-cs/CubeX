"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Check,
  CheckCheck,
  CircleSlash,
  Clock3,
  List,
  Truck,
  X,
} from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import OrdersSkeleton from "@/components/OrdersSkeleton"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/auth/useAuth"
import { orderService } from "@/service/orders"
import { productService } from "@/service/products"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type {
  OrderProductSummary,
  OrderRole,
  OrderSummary,
} from "@/service/orders/types"

type RowAction = "cancel" | "confirm"
type DialogAction = "cancel" | "confirm"
type OrderStatusFilter =
  | "all"
  | "pending"
  | "shipping"
  | "shipped"
  | "completed"
  | "dispute"
  | "cancelled"

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

function formatStatus(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getOrderProduct(row: OrderSummary): OrderProductSummary | null {
  return row.products || row.product || null
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const isProblem =
    normalized === "cancelled" ||
    normalized === "dispute" ||
    normalized === "disputed"
  return (
    <Badge variant={isProblem ? "destructive" : "secondary"}>
      {formatStatus(status)}
    </Badge>
  )
}

function OrdersTable({
  rows,
  role,
  actionLoadingKey,
  onOpenProduct,
  onOpenTracking,
  onDialogRequest,
  onDisputeRequest,
}: {
  rows: OrderSummary[]
  role: OrderRole
  actionLoadingKey: string | null
  onOpenProduct: (row: OrderSummary, role: OrderRole) => void
  onOpenTracking: (trackingId: string) => void
  onDialogRequest: (
    row: OrderSummary,
    role: OrderRole,
    action: DialogAction
  ) => void
  onDisputeRequest: (row: OrderSummary, role: OrderRole) => void
}) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const trackingValue = row.tracking_id || ""
              const product = getOrderProduct(row)
              const productTitle = product?.title || row.product_id
              const thumbnail = product?.images?.[0]
              const normalizedStatus = row.status.toLowerCase()
              const actionKey = `${role}:${trackingValue}`
              const isLoading = actionLoadingKey === actionKey
              const canCancel = normalizedStatus === "pending"
              const canConfirm =
                role === "buyer" && normalizedStatus === "shipped"
              const canDispute =
                role === "buyer" && normalizedStatus === "shipped"
              const hasAction = canCancel || canConfirm || canDispute

              return (
                <TableRow key={`${role}-${row.id}`}>
                  <TableCell className="font-medium">
                    {trackingValue ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 py-0 tracking-normal normal-case"
                        onClick={() => onOpenTracking(trackingValue)}
                      >
                        {trackingValue}
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto w-full justify-start px-0 py-0 tracking-normal normal-case"
                      onClick={() => onOpenProduct(row, role)}
                      disabled={!product?.id && !row.product_id}
                    >
                      <span className="inline-flex items-center gap-3 text-left">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={productTitle}
                            className="h-10 w-10 shrink-0 object-cover"
                          />
                        ) : (
                          <span className="h-10 w-10 shrink-0 bg-muted" />
                        )}
                        <span className="line-clamp-2 text-sm font-medium">
                          {productTitle}
                        </span>
                      </span>
                    </Button>
                  </TableCell>
                  <TableCell>
                    {formatMoneyFromCents(row.total_amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>{formatCreatedAt(row.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {hasAction ? (
                      <div className="inline-flex items-center gap-2">
                        {canConfirm && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onDialogRequest(row, role, "confirm")
                            }
                            disabled={!trackingValue || isLoading}
                          >
                            {isLoading ? (
                              <span className="inline-flex items-center gap-2">
                                <Spinner />
                                Processing...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5">
                                <Check className="size-3.5" />
                                Confirm
                              </span>
                            )}
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDialogRequest(row, role, "cancel")}
                            disabled={!trackingValue || isLoading}
                          >
                            {isLoading ? (
                              <span className="inline-flex items-center gap-2">
                                <Spinner />
                                Processing...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5">
                                <X className="size-3.5" />
                                Cancel
                              </span>
                            )}
                          </Button>
                        )}
                        {canDispute && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDisputeRequest(row, role)}
                            disabled={!trackingValue || isLoading}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <AlertTriangle className="size-3.5" />
                              Dispute
                            </span>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button size="sm" disabled variant="secondary">
                        {formatStatus(row.status)}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [tab, setTab] = useState<OrderRole>("buyer")
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all")
  const [buyerOrders, setBuyerOrders] = useState<OrderSummary[]>([])
  const [sellerOrders, setSellerOrders] = useState<OrderSummary[]>([])
  const [buyerLoading, setBuyerLoading] = useState(false)
  const [sellerLoading, setSellerLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null)
  const [pendingDialog, setPendingDialog] = useState<{
    row: OrderSummary
    role: OrderRole
    action: DialogAction
  } | null>(null)
  const [disputeDialog, setDisputeDialog] = useState<{
    row: OrderSummary
    role: OrderRole
  } | null>(null)
  const [disputeReason, setDisputeReason] = useState("")
  const [disputeFiles, setDisputeFiles] = useState<File[]>([])
  const [disputePreviews, setDisputePreviews] = useState<string[]>([])
  const [disputeSubmitting, setDisputeSubmitting] = useState(false)
  const canSubmitDispute =
    disputeReason.trim().length > 0 && disputeFiles.length > 0

  const removeDisputeFile = (index: number) => {
    setDisputeFiles((current) => current.filter((_, i) => i !== index))
    setDisputePreviews((current) => {
      const preview = current[index]
      if (preview) {
        URL.revokeObjectURL(preview)
      }
      return current.filter((_, i) => i !== index)
    })
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [authLoading, router, user])

  useEffect(() => {
    return () => {
      disputePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [disputePreviews])

  useEffect(() => {
    if (!user) return
    let mounted = true

    async function loadOrdersByRole(role: OrderRole) {
      setError(null)
      if (role === "buyer") {
        setBuyerLoading(true)
      } else {
        setSellerLoading(true)
      }

      try {
        const data = await orderService.getOrderHistory(role)
        if (!mounted) return
        if (role === "buyer") {
          setBuyerOrders(data)
        } else {
          setSellerOrders(data)
        }
      } catch (requestError) {
        if (!mounted) return
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load orders"
        )
      } finally {
        if (!mounted) return
        if (role === "buyer") {
          setBuyerLoading(false)
        } else {
          setSellerLoading(false)
        }
      }
    }

    void loadOrdersByRole(tab)

    return () => {
      mounted = false
    }
  }, [tab, user])

  const canRender = useMemo(() => !authLoading && !!user, [authLoading, user])
  const filteredBuyerOrders = useMemo(() => {
    if (statusFilter === "all") {
      return buyerOrders
    }
    return buyerOrders.filter((row) => {
      const normalized = row.status.toLowerCase()
      if (statusFilter === "dispute") {
        return normalized === "dispute" || normalized === "disputed"
      }
      return normalized === statusFilter
    })
  }, [buyerOrders, statusFilter])
  const filteredSellerOrders = useMemo(() => {
    if (statusFilter === "all") {
      return sellerOrders
    }
    return sellerOrders.filter((row) => {
      const normalized = row.status.toLowerCase()
      if (statusFilter === "dispute") {
        return normalized === "dispute" || normalized === "disputed"
      }
      return normalized === statusFilter
    })
  }, [sellerOrders, statusFilter])

  const handleOpenProduct = (row: OrderSummary, role: OrderRole) => {
    const product = getOrderProduct(row)
    const targetProductId = product?.id || row.product_id
    if (!targetProductId) return

    const search = new URLSearchParams()
    search.set("returnTo", "/orders")
    search.set("orderStatus", row.status)
    search.set("orderRole", role)

    if (row.tracking_id) {
      search.set("orderTrackingId", row.tracking_id)
    }

    router.push(`/products/${targetProductId}?${search.toString()}`)
  }

  const handleOpenTracking = (trackingId: string) => {
    router.push(`/orders/${encodeURIComponent(trackingId)}`)
  }

  const handleAction = async (
    row: OrderSummary,
    role: OrderRole,
    action: RowAction
  ) => {
    const trackingId = row.tracking_id
    if (!trackingId) return

    const key = `${role}:${trackingId}`
    setActionLoadingKey(key)

    try {
      if (action === "cancel") {
        await orderService.cancelOrder(trackingId)
        toast.success("Order cancelled")
      } else {
        await orderService.confirmReceived(trackingId)
        toast.success("Order confirmed")
      }

      const currentTabData = await orderService.getOrderHistory(tab)
      if (tab === "buyer") {
        setBuyerOrders(currentTabData)
      } else {
        setSellerOrders(currentTabData)
      }
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update order"
      )
    } finally {
      setActionLoadingKey(null)
    }
  }

  const handleDialogRequest = (
    row: OrderSummary,
    role: OrderRole,
    action: DialogAction
  ) => {
    setPendingDialog({ row, role, action })
  }

  const handleDisputeRequest = (row: OrderSummary, role: OrderRole) => {
    disputePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    setDisputeDialog({ row, role })
    setDisputeReason("")
    setDisputeFiles([])
    setDisputePreviews([])
  }

  const handleDialogAction = async () => {
    if (!pendingDialog) return
    const { row, role, action } = pendingDialog
    setPendingDialog(null)
    await handleAction(row, role, action)
  }

  const handleDisputeSubmit = async () => {
    if (!disputeDialog) return
    const trackingId = disputeDialog.row.tracking_id
    const reason = disputeReason.trim()

    if (!trackingId) {
      toast.error("Missing tracking id")
      return
    }

    if (!reason) {
      toast.error("Dispute reason is required")
      return
    }
    if (disputeFiles.length === 0) {
      toast.error("At least one evidence image is required")
      return
    }

    const key = `${disputeDialog.role}:${trackingId}`
    setActionLoadingKey(key)
    setDisputeSubmitting(true)
    try {
      let evidenceUrls: string[] = []
      if (disputeFiles.length > 0) {
        const uploadResult = await productService.uploadImages(disputeFiles)
        evidenceUrls = uploadResult.urls
      }

      await orderService.raiseDispute(trackingId, {
        reason,
        evidence_urls: evidenceUrls,
      })
      toast.success("Dispute raised")
      disputePreviews.forEach((preview) => URL.revokeObjectURL(preview))
      setDisputeDialog(null)
      setDisputeReason("")
      setDisputeFiles([])
      setDisputePreviews([])

      const currentTabData = await orderService.getOrderHistory(tab)
      if (tab === "buyer") {
        setBuyerOrders(currentTabData)
      } else {
        setSellerOrders(currentTabData)
      }
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Failed to raise dispute"
      )
    } finally {
      setDisputeSubmitting(false)
      setActionLoadingKey(null)
    }
  }

  if (!canRender) {
    return <OrdersSkeleton />
  }

  if (error) {
    return (
      <main className="space-y-6">
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <>
      <main className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Track every purchase and sale in one place.
          </p>
        </header>

        <Tabs value={tab} onValueChange={(value) => setTab(value as OrderRole)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as OrderStatusFilter)
              }
            >
              <TabsList>
                <TabsTrigger value="all">
                  <List className="size-3.5" />
                  All
                </TabsTrigger>
                <TabsTrigger value="pending">
                  <Clock3 className="size-3.5" />
                  Pending
                </TabsTrigger>
                <TabsTrigger value="shipping">
                  <Truck className="size-3.5" />
                  Shipping
                </TabsTrigger>
                <TabsTrigger value="shipped">
                  <Check className="size-3.5" />
                  Shipped
                </TabsTrigger>
                <TabsTrigger value="completed">
                  <CheckCheck className="size-3.5" />
                  Completed
                </TabsTrigger>
                <TabsTrigger value="dispute">
                  <AlertTriangle className="size-3.5" />
                  Dispute
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  <CircleSlash className="size-3.5" />
                  Cancelled
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <TabsList>
              <TabsTrigger value="buyer">Buyer</TabsTrigger>
              <TabsTrigger value="seller">Seller</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="buyer">
            {buyerLoading ? (
              <OrdersSkeleton compact />
            ) : (
              <OrdersTable
                rows={filteredBuyerOrders}
                role="buyer"
                actionLoadingKey={actionLoadingKey}
              onOpenProduct={handleOpenProduct}
              onOpenTracking={handleOpenTracking}
              onDialogRequest={handleDialogRequest}
              onDisputeRequest={handleDisputeRequest}
            />
            )}
          </TabsContent>
          <TabsContent value="seller">
            {sellerLoading ? (
              <OrdersSkeleton compact />
            ) : (
              <OrdersTable
                rows={filteredSellerOrders}
                role="seller"
                actionLoadingKey={actionLoadingKey}
              onOpenProduct={handleOpenProduct}
              onOpenTracking={handleOpenTracking}
              onDialogRequest={handleDialogRequest}
              onDisputeRequest={handleDisputeRequest}
            />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog
        open={!!pendingDialog}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDialog(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDialog?.action === "cancel"
                ? "Cancel this order?"
                : "Confirm this order?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDialog?.action === "cancel"
                ? "This will cancel the order. This action cannot be undone."
                : "This will mark the order as completed and release payment. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              className={
                pendingDialog?.action === "cancel"
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : undefined
              }
              onClick={() => void handleDialogAction()}
            >
              {pendingDialog?.action === "cancel" ? "Cancel order" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!disputeDialog}
        onOpenChange={(open) => {
          if (!open) {
            disputePreviews.forEach((preview) => URL.revokeObjectURL(preview))
            setDisputeDialog(null)
            setDisputeReason("")
            setDisputeFiles([])
            setDisputePreviews([])
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise dispute</DialogTitle>
            <DialogDescription>
              Describe the issue and attach evidence images for order{" "}
              {disputeDialog?.row.tracking_id || "-"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              rows={4}
              placeholder="Describe the issue"
              value={disputeReason}
              onChange={(event) => setDisputeReason(event.target.value)}
              disabled={disputeSubmitting}
            />
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || [])
                disputePreviews.forEach((preview) => URL.revokeObjectURL(preview))
                setDisputeFiles(files)
                setDisputePreviews(files.map((file) => URL.createObjectURL(file)))
              }}
              disabled={disputeSubmitting}
            />
            {disputePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {disputePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="space-y-1">
                    <div
                      className="h-14 w-full rounded-none bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url(${preview})` }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-6 w-full px-1 text-[10px]"
                      onClick={() => removeDisputeFile(index)}
                      disabled={disputeSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {disputeFiles.length > 0
                ? `${disputeFiles.length} file(s) selected`
                : "No evidence selected"}
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={disputeSubmitting}>
                Back
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => void handleDisputeSubmit()}
              disabled={disputeSubmitting || !canSubmitDispute}
            >
              {disputeSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner />
                  Submitting...
                </span>
              ) : (
                "Submit dispute"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
