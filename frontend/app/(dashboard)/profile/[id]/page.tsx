"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import ProfileSkeleton from "@/components/ProfileSkeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { authService } from "@/service/auth"
import type { UserProfilePublic } from "@/service/auth/types"

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean)
  if (!parts.length) return "U"
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
  return initials || "U"
}

function ProfileField({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="space-y-1 rounded-none border border-border bg-background/60 p-4">
      <div className="text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">
        {value?.trim() ? value : "Not provided"}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [user, setUser] = useState<UserProfilePublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!userId) return

      setLoading(true)
      setError(null)

      try {
        const response = await authService.getUserPublicInfo(userId)
        if (mounted) {
          if (response.success) {
            setUser(response.user)
          } else {
            setError(response.message)
          }
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile"
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [userId])

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error || "Profile not found"}
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = getInitials(user.full_name || user.username || "User")

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="inline-flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.avatar_url && (
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                )}
                <AvatarFallback className="bg-primary text-2xl font-semibold text-background">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {user.full_name || user.username}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </div>
            <Badge variant="secondary">Public profile</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {user.bio || "No bio."}
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ProfileField label="Full name" value={user.full_name} />
            <ProfileField label="Username" value={user.username} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Phone" value={user.phone} />
            <ProfileField label="Avatar" value={user.avatar_url} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
