"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Check, X } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import OrderDetailSkeleton from "@/components/OrderDetailSkeleton"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/auth/useAuth"
import { orderService } from "@/service/orders"
import { productService } from "@/service/products"
import type { OrderDetail, OrderShippingInfo } from "@/service/orders/types"

function formatMoneyFromCents(value: number) {
  return (value / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

function formatStatus(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatCreatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-US")
}

function parseShippingInfo(shippingInfo: unknown): OrderShippingInfo | null {
  if (!shippingInfo) return null

  if (typeof shippingInfo === "string") {
    try {
      const parsed = JSON.parse(shippingInfo)
      if (parsed && typeof parsed === "object") {
        return parsed as OrderShippingInfo
      }
      return null
    } catch {
      return null
    }
  }

  if (typeof shippingInfo === "object") {
    return shippingInfo as OrderShippingInfo
  }

  return null
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const isProblem = normalized === "cancelled" || normalized === "disputed"
  return (
    <Badge variant={isProblem ? "destructive" : "secondary"}>
      {formatStatus(status)}
    </Badge>
  )
}

export default function OrderDetailPage() {
  const params = useParams<{ tracking_id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const trackingId = Array.isArray(params?.tracking_id)
    ? params.tracking_id[0]
    : params?.tracking_id

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<
    "confirm" | "cancel" | null
  >(null)
  const [disputeOpen, setDisputeOpen] = useState(false)
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

  const loadOrder = useCallback(async () => {
    if (!trackingId) return
    setLoading(true)
    setError(null)
    try {
      const nextOrder = await orderService.getOrderByTrackingId(trackingId)
      setOrder(nextOrder)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load order"
      )
    } finally {
      setLoading(false)
    }
  }, [trackingId])

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
    if (!user || !trackingId) return
    void loadOrder()
  }, [loadOrder, trackingId, user])

  const shippingInfo = useMemo(
    () => parseShippingInfo(order?.shipping_info),
    [order?.shipping_info]
  )
  const linkedProduct = order?.product || order?.products || null

  const normalizedStatus = (order?.status || "").toLowerCase()
  const isBuyer = !!order && order.buyer_id === user?.user_id
  const isSeller = !!order && order.seller_id === user?.user_id

  const canCancel = (isBuyer || isSeller) && normalizedStatus === "pending"
  const canConfirmReceived = isBuyer && normalizedStatus === "shipped"
  const canRaiseDispute = isBuyer && normalizedStatus === "shipped"
  const hasMainAction = canCancel || canConfirmReceived

  const handleAction = async (action: "confirm" | "cancel") => {
    if (!trackingId) return

    setActionLoading(action)
    try {
      if (action === "confirm") {
        await orderService.confirmReceived(trackingId)
        toast.success("Order marked as completed")
      } else if (action === "cancel") {
        await orderService.cancelOrder(trackingId)
        toast.success("Order cancelled")
      }

      await loadOrder()
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update order"
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleDialogAction = async () => {
    if (!pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    await handleAction(action)
  }

  const handleDisputeSubmit = async () => {
    if (!trackingId) return
    const reason = disputeReason.trim()
    if (!reason) {
      toast.error("Dispute reason is required")
      return
    }
    if (disputeFiles.length === 0) {
      toast.error("At least one evidence image is required")
      return
    }

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
      setDisputeOpen(false)
      setDisputeReason("")
      setDisputeFiles([])
      setDisputePreviews([])
      await loadOrder()
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Failed to raise dispute"
      )
    } finally {
      setDisputeSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return <OrderDetailSkeleton />
  }

  if (!user) {
    return null
  }

  if (error || !order) {
    return (
      <main className="space-y-6">
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error || "Order not found"}
          </CardContent>
        </Card>
      </main>
    )
  }

  const orderReference = order.tracking_id || trackingId || order.id

  return (
    <main className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="inline-flex items-center gap-2"
        onClick={() => router.push("/orders")}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order {orderReference}</h1>
          <p className="text-sm text-muted-foreground">
            Created {formatCreatedAt(order.created_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Product</p>
              {linkedProduct?.id ? (
                <Link
                  href={`/products/${linkedProduct.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {linkedProduct.title || linkedProduct.id}
                </Link>
              ) : (
                <p className="font-medium text-foreground">
                  {order.product_id}
                </p>
              )}
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground">Total amount</p>
              <p className="text-xl font-semibold text-foreground">
                {formatMoneyFromCents(order.total_amount)}
              </p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground">Status</p>
              <StatusBadge status={order.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {shippingInfo ? (
              <div className="space-y-2">
                <p className="text-foreground">
                  Receiver: {shippingInfo.name || "-"}
                </p>
                <p>
                  Address: {shippingInfo.street}, {shippingInfo.district},{" "}
                  {shippingInfo.city}
                </p>
                <p>Phone: {shippingInfo.phone || "-"}</p>
                {shippingInfo.note && <p>Note: {shippingInfo.note}</p>}
              </div>
            ) : (
              <p>No shipping details.</p>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2">
              {canConfirmReceived && (
                <Button
                  className="w-full"
                  onClick={() => setPendingAction("confirm")}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "confirm" ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      Processing...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="size-3.5" />
                      Confirm received
                    </span>
                  )}
                </Button>
              )}
              {canCancel && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setPendingAction("cancel")}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "cancel" ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      Processing...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <X className="size-3.5" />
                      Cancel order
                    </span>
                  )}
                </Button>
              )}
              {!hasMainAction && (
                <Button
                  className="w-full"
                  size="sm"
                  disabled
                  variant="secondary"
                >
                  {formatStatus(order.status)}
                </Button>
              )}
            </div>

            {canRaiseDispute && (
              <>
                <Separator />
                <div className="space-y-3 rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    Raise dispute
                  </p>
                  <p className="text-xs">
                    Submit a dispute only when there is a major issue with
                    delivery or product condition.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setDisputeOpen(true)}
                    disabled={actionLoading !== null}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" />
                      Submit dispute
                    </span>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "cancel"
                ? "Cancel this order?"
                : "Confirm this order?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "cancel"
                ? "This will cancel the order. This action cannot be undone."
                : "This will mark the order as completed and release payment. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              className={
                pendingAction === "cancel"
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : undefined
              }
              onClick={() => void handleDialogAction()}
            >
              {pendingAction === "cancel" ? "Cancel order" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={disputeOpen}
        onOpenChange={(open) => {
          setDisputeOpen(open)
          if (!open) {
            disputePreviews.forEach((preview) => URL.revokeObjectURL(preview))
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
              Describe the issue and attach evidence images for this order.
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
                disputePreviews.forEach((preview) =>
                  URL.revokeObjectURL(preview)
                )
                setDisputeFiles(files)
                setDisputePreviews(
                  files.map((file) => URL.createObjectURL(file))
                )
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
    </main>
  )
}
