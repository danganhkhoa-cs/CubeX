"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Layers3,
  RefreshCw,
  Settings2,
  Tag,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/auth/useAuth"
import { useFilter } from "@/hooks/filter/useFilter"
import { authService } from "@/service/auth"
import type { UserProfilePublic } from "@/service/auth/types"
import { adminService } from "@/service/admin"
import type {
  AdminDispute,
  AdminDisputeResolution,
} from "@/service/admin/types"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type ProfileMap = Record<string, UserProfilePublic>

function formatCurrency(cents?: number) {
  if (typeof cents !== "number") return "-"
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-US")
}

function getInitials(name?: string) {
  if (!name) return "U"
  const parts = name.trim().split(" ").filter(Boolean)
  if (!parts.length) return "U"
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U"
  )
}

function formatCapitalized(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getResolutionLabel(value: AdminDispute["resolution"]) {
  if (!value) return "Open"
  return value === "refund_buyer" ? "Refund buyer" : "Release to seller"
}

function ProfileInline({
  profile,
  userId,
  fallbackLabel,
}: {
  profile?: UserProfilePublic
  userId?: string
  fallbackLabel?: string
}) {
  const displayName = profile?.full_name || fallbackLabel || "Unknown user"
  const avatarUrl = profile?.avatar_url || undefined
  const content = (
    <>
      <Avatar size="lg">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
        <AvatarFallback className="font-semibold">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm">{displayName}</span>
    </>
  )

  if (!userId) {
    return <div className="inline-flex items-center gap-2">{content}</div>
  }

  return (
    <Link
      href={`/products?seller_id=${encodeURIComponent(userId)}`}
      className="inline-flex items-center gap-2 hover:underline"
    >
      {content}
    </Link>
  )
}

export default function AdminDisputeDetailPage() {
  const params = useParams<{ dispute_id: string }>()
  const disputeId = params?.dispute_id || ""
  const { user, loading: authLoading } = useAuth()
  const { brands, categories } = useFilter()
  const [dispute, setDispute] = useState<AdminDispute | null>(null)
  const [resolveTrackingId, setResolveTrackingId] = useState<string>("")
  const [profiles, setProfiles] = useState<ProfileMap>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingResolution, setPendingResolution] =
    useState<AdminDisputeResolution | null>(null)
  const [resolving, setResolving] = useState(false)

  const isAdmin = user?.role === "admin"

  const loadDispute = useCallback(async () => {
    if (!disputeId) return
    setLoading(true)
    setError(null)
    try {
      const disputes = await adminService.getDisputes()
      const found = disputes.find((item) => item.id === disputeId) || null
      setDispute(found)
      if (!found) {
        setResolveTrackingId("")
        return
      }

      let trackingId =
        found.tracking_id?.trim() || found.order_tracking_id?.trim() || ""

      if (!trackingId) {
        const orders = await adminService.getOrders()
        const matchedOrder = orders.find((order) => order.id === found.order_id)
        trackingId = matchedOrder?.tracking_id?.trim() || ""
      }

      setResolveTrackingId(trackingId)

      const userIds = new Set<string>()
      if (found.buyer_id) userIds.add(found.buyer_id)
      if (found.product?.seller_id) userIds.add(found.product.seller_id)

      const entries = await Promise.all(
        Array.from(userIds).map(async (id) => {
          try {
            const response = await authService.getUserPublicInfo(id)
            return response.user ? ([id, response.user] as const) : null
          } catch {
            return null
          }
        })
      )

      const nextProfiles: ProfileMap = {}
      for (const entry of entries) {
        if (!entry) continue
        nextProfiles[entry[0]] = entry[1]
      }
      setProfiles(nextProfiles)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dispute detail"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [disputeId])

  useEffect(() => {
    if (authLoading || !isAdmin || !disputeId) return
    const timer = setTimeout(() => {
      void loadDispute()
    }, 0)
    return () => clearTimeout(timer)
  }, [authLoading, isAdmin, disputeId, loadDispute])

  const canResolve = useMemo(() => {
    if (!dispute) return false
    return !dispute.resolution
  }, [dispute])

  const brandName = useMemo(() => {
    const brandId = dispute?.product?.brand_id
    if (!brandId) return "-"
    return brands.find((item) => item.id === brandId)?.name || brandId
  }, [brands, dispute?.product?.brand_id])

  const categoryName = useMemo(() => {
    const categoryId = dispute?.product?.category_id
    if (!categoryId) return "-"
    return categories.find((item) => item.id === categoryId)?.name || categoryId
  }, [categories, dispute?.product?.category_id])

  const pendingResolutionLabel = useMemo(() => {
    if (!pendingResolution) return ""
    return pendingResolution === "refund_buyer"
      ? "Refund buyer"
      : "Release to seller"
  }, [pendingResolution])

  const handleResolve = async () => {
    if (!dispute || !pendingResolution) return
    if (!resolveTrackingId) {
      toast.error("Tracking ID not found for this dispute")
      return
    }
    setResolving(true)
    try {
      await adminService.resolveDispute(resolveTrackingId, pendingResolution)
      toast.success("Dispute resolved")
      setPendingResolution(null)
      await loadDispute()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resolve dispute"
      toast.error(message)
    } finally {
      setResolving(false)
    }
  }

  if (authLoading) {
    return (
      <main className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="space-y-3 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-44 w-full" />
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Dispute detail</h1>
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
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dispute detail</h1>
          <p className="text-sm text-muted-foreground">
            Validate evidence and decide final resolution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/disputes">
              <ArrowLeft />
              Back
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => void loadDispute()}
            disabled={loading || resolving}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="space-y-3 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-44 w-full" />
          </CardContent>
        </Card>
      ) : !dispute ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Dispute not found.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Participants & status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Buyer</p>
                <ProfileInline
                  userId={dispute.buyer_id}
                  profile={profiles[dispute.buyer_id]}
                  fallbackLabel="Buyer"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Seller</p>
                <ProfileInline
                  userId={dispute.product?.seller_id}
                  profile={
                    dispute.product?.seller_id
                      ? profiles[dispute.product.seller_id]
                      : undefined
                  }
                  fallbackLabel="Seller"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(dispute.created_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Resolution</p>
                <Badge
                  variant={dispute.resolution ? "secondary" : "destructive"}
                >
                  {getResolutionLabel(dispute.resolution)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dispute reason</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border bg-muted/20 p-3 text-sm">
                {dispute.reason || "-"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {dispute.evidence_urls?.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {dispute.evidence_urls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden border border-border"
                    >
                      <img
                        src={url}
                        alt="Dispute evidence"
                        className="h-fit w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No evidence uploaded.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden border border-border">
                  {dispute.product?.images?.[0] ? (
                    <img
                      src={dispute.product.images[0]}
                      alt={dispute.product.title || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold">
                    {dispute.product?.title || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Price: {formatCurrency(dispute.product?.price)}
                  </p>
                  {dispute.product?.description ? (
                    <p className="text-xs text-muted-foreground">
                      {dispute.product.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="size-3.5" />
                    {formatCapitalized(brandName)}
                  </span>
                </Badge>
                <Badge variant="ghost">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers3 className="size-3.5" />
                    {categoryName}
                  </span>
                </Badge>
              </div>
              {dispute.product?.specs && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dispute.product.specs).flatMap(
                    ([key, value]) => {
                      if (
                        key === "customization_types" &&
                        Array.isArray(value)
                      ) {
                        return value.map((item) => (
                          <Badge
                            key={`${key}-${String(item)}`}
                            variant="outline"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Settings2 className="size-3.5" />
                              {formatCapitalized(String(item))}
                            </span>
                          </Badge>
                        ))
                      }

                      if (Array.isArray(value)) {
                        return value.map((item) => (
                          <Badge
                            key={`${key}-${String(item)}`}
                            variant="outline"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Settings2 className="size-3.5" />
                              {formatCapitalized(String(item))}
                            </span>
                          </Badge>
                        ))
                      }

                      return (
                        <Badge key={key} variant="outline">
                          <span className="inline-flex items-center gap-1.5">
                            <Settings2 className="size-3.5" />
                            {formatCapitalized(String(value))}
                          </span>
                        </Badge>
                      )
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resolution action</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button
                variant="destructive"
                disabled={!canResolve || resolving || !resolveTrackingId}
                onClick={() => setPendingResolution("refund_buyer")}
              >
                Refund buyer
              </Button>
              <Button
                variant="outline"
                disabled={!canResolve || resolving || !resolveTrackingId}
                onClick={() => setPendingResolution("release_to_seller")}
              >
                Release to seller
              </Button>
              {!canResolve ? (
                <span className="text-xs text-muted-foreground">
                  This dispute is already resolved.
                </span>
              ) : !resolveTrackingId ? (
                <span className="text-xs text-destructive">
                  Missing tracking ID. Cannot resolve this dispute.
                </span>
              ) : null}
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog
        open={!!pendingResolution}
        onOpenChange={(open) => {
          if (!open && !resolving) {
            setPendingResolution(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm dispute resolution</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingResolution
                ? `${pendingResolutionLabel} for this dispute? This action cannot be undone.`
                : "Confirm this action."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resolving}>Back</AlertDialogCancel>
            <AlertDialogAction
              className="inline-flex items-center gap-2"
              disabled={resolving}
              onClick={() => void handleResolve()}
            >
              {resolving ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Confirm
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
