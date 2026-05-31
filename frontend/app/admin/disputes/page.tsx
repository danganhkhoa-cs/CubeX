"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, Eye, RefreshCw } from "lucide-react"

import { useAuth } from "@/hooks/auth/useAuth"
import { authService } from "@/service/auth"
import type { UserProfilePublic } from "@/service/auth/types"
import { adminService } from "@/service/admin"
import type { AdminDispute } from "@/service/admin/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ProfileMap = Record<string, UserProfilePublic>

function formatCurrency(cents?: number) {
  if (typeof cents !== "number") return "-"
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

function formatDate(value: string) {
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

function getResolutionLabel(value: AdminDispute["resolution"]) {
  if (!value) return "Open"
  return value === "refund_buyer" ? "Refund buyer" : "Release to seller"
}

function UserCell({
  userId,
  profiles,
}: {
  userId?: string
  profiles: ProfileMap
}) {
  if (!userId) {
    return <span className="text-muted-foreground">-</span>
  }
  const profile = profiles[userId]
  const displayName = profile?.full_name || "Unknown user"
  const avatarUrl = profile?.avatar_url || undefined

  return (
    <Link
      href={`/products?seller_id=${encodeURIComponent(userId)}`}
      className="inline-flex items-center gap-2 hover:underline"
    >
      <Avatar size="sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{displayName}</span>
    </Link>
  )
}

export default function AdminDisputesPage() {
  const { user, loading: authLoading } = useAuth()
  const [disputes, setDisputes] = useState<AdminDispute[]>([])
  const [profiles, setProfiles] = useState<ProfileMap>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = user?.role === "admin"

  const loadDisputes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getDisputes()
      setDisputes(data)

      const userIds = new Set<string>()
      for (const dispute of data) {
        if (dispute.buyer_id) userIds.add(dispute.buyer_id)
        const sellerId = dispute.product?.seller_id
        if (sellerId) userIds.add(sellerId)
      }

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
        err instanceof Error ? err.message : "Failed to load disputes"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading || !isAdmin) return
    const timer = setTimeout(() => {
      void loadDisputes()
    }, 0)
    return () => clearTimeout(timer)
  }, [authLoading, isAdmin, loadDisputes])

  if (authLoading) {
    return (
      <main className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Dispute center</h1>
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
          <h1 className="text-2xl font-semibold">Dispute center</h1>
          <p className="text-sm text-muted-foreground">
            Review dispute summaries and open each dispute for full details.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadDisputes()}
          disabled={loading}
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active disputes</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`dispute-skeleton-${idx}`}>
                      <TableCell>
                        <Skeleton className="h-12 w-52" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-56" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-18" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : disputes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No active disputes.
                    </TableCell>
                  </TableRow>
                ) : (
                  disputes.map((dispute) => {
                    const productTitle = dispute.product?.title || "-"
                    const primaryImage = dispute.product?.images?.[0]
                    const reason = dispute.reason || "-"
                    const evidenceCount = dispute.evidence_urls?.length ?? 0
                    const sellerId = dispute.product?.seller_id

                    return (
                      <TableRow key={dispute.id}>
                        <TableCell>
                          <div className="flex max-w-72 items-start gap-2">
                            <div className="h-12 w-12 shrink-0 overflow-hidden border border-border">
                              {primaryImage ? (
                                <img
                                  src={primaryImage}
                                  alt={productTitle}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-muted" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {productTitle}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(dispute.product?.price)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <UserCell
                            userId={dispute.buyer_id}
                            profiles={profiles}
                          />
                        </TableCell>
                        <TableCell>
                          <UserCell userId={sellerId} profiles={profiles} />
                        </TableCell>
                        <TableCell className="max-w-72">
                          <p className="truncate text-sm">{reason}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              evidenceCount > 0 ? "secondary" : "outline"
                            }
                          >
                            {evidenceCount} file{evidenceCount === 1 ? "" : "s"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(dispute.created_at)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              dispute.resolution ? "secondary" : "destructive"
                            }
                          >
                            {getResolutionLabel(dispute.resolution)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/disputes/${dispute.id}`}>
                              <Eye />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
