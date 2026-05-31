"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { useAuth } from "@/hooks/auth/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

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
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const returnTo = searchParams.get("returnTo") || ""
  const showBack = returnTo.startsWith("/products")

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Please sign in to view your profile.
          <div className="mt-4">
            <Button asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const initials = getInitials(user.full_name)

  return (
    <div className="space-y-6">
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          onClick={() => router.push(returnTo)}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      )}
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
                  {user.full_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </div>
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
            <ProfileField label="City" value={user.city} />
            <ProfileField label="District" value={user.district} />
            <ProfileField label="Street" value={user.street} />
            <ProfileField label="Avatar" value={user.avatar_url} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
