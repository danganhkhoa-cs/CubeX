"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Camera } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/auth/useAuth"
import { authService } from "@/service/auth"
import ProfileSkeleton from "@/components/ProfileSkeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

type ProfileFormState = {
  full_name: string
  bio: string
  street: string
  district: string
  city: string
  phone: string
}

const emptyProfileForm: ProfileFormState = {
  full_name: "",
  bio: "",
  street: "",
  district: "",
  city: "",
  phone: "",
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean)
  if (!parts.length) return "U"
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
  return initials || "U"
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, refresh } = useAuth()
  const returnTo = searchParams.get("returnTo") || ""
  const showBack = returnTo.startsWith("/products")
  const [formData, setFormData] = useState<ProfileFormState>(emptyProfileForm)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!user || isEditing) return
    setFormData({
      full_name: user.full_name ?? "",
      bio: user.bio ?? "",
      street: user.street ?? "",
      district: user.district ?? "",
      city: user.city ?? "",
      phone: user.phone ?? "",
    })
  }, [user, isEditing])

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null)
      return
    }
    const previewUrl = URL.createObjectURL(avatarFile)
    setAvatarPreview(previewUrl)
    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [avatarFile])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (serverError) {
      setServerError("")
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setAvatarFile(file)
    if (serverError) {
      setServerError("")
    }
  }

  const resetForm = () => {
    if (!user) return
    setFormData({
      full_name: user.full_name ?? "",
      bio: user.bio ?? "",
      street: user.street ?? "",
      district: user.district ?? "",
      city: user.city ?? "",
      phone: user.phone ?? "",
    })
    setAvatarFile(null)
    setServerError("")
  }

  const handleStartEditing = () => {
    setIsEditing(true)
    setServerError("")
  }

  const handleCancelEditing = () => {
    resetForm()
    setIsEditing(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !isEditing) return
    setSaving(true)
    setServerError("")

    try {
      await authService.updateProfile({
        ...formData,
        avatar: avatarFile ?? undefined,
      })
      await refresh()
      setIsEditing(false)
      setAvatarFile(null)
      toast.success("Profile updated")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile"
      setServerError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ProfileSkeleton />
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

  const initials = getInitials(formData.full_name || user.full_name)
  const avatarDisabled = !isEditing || saving
  const avatarIndicatorClasses = avatarDisabled
    ? "border-border bg-muted text-muted-foreground"
    : "border-border bg-background text-foreground"
  const avatarLabelClasses = avatarDisabled
    ? "cursor-default"
    : "cursor-pointer"
  const headerFullName = formData.full_name.trim()
    ? formData.full_name
    : user.full_name

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
      <form onSubmit={handleSubmit} noValidate>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label
                  htmlFor="avatar"
                  className={`relative inline-flex ${avatarLabelClasses}`}
                  onClick={(event) => {
                    if (avatarDisabled) {
                      event.preventDefault()
                    }
                  }}
                >
                  <Avatar className="h-16 w-16">
                    {(avatarPreview || user.avatar_url) && (
                      <AvatarImage
                        src={avatarPreview ?? user.avatar_url ?? undefined}
                        alt={user.full_name}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-2xl font-semibold text-background">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <span
                      className={`absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border shadow-sm ${avatarIndicatorClasses}`}
                    >
                      <Camera className="size-3.5" />
                    </span>
                  )}
                </label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarDisabled}
                  className="sr-only"
                />
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {headerFullName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {user.username}
                  </p>
                </div>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {user.bio || "No bio."}
              </p>
            </div>
            <CardAction>
              {isEditing ? (
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={saving} className="w-25">
                    {saving ? <Spinner /> : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={handleCancelEditing}
                    className="w-25"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button type="button" onClick={handleStartEditing}>
                  Update profile
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-6 pt-6">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="full_name">Full name</FieldLabel>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditing || saving}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || !isEditing ? "------" : ""}
                  onChange={handleInputChange}
                  disabled={!isEditing || saving}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  name="city"
                  value={formData.city || !isEditing ? "------" : ""}
                  onChange={handleInputChange}
                  disabled={!isEditing || saving}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="district">District</FieldLabel>
                <Input
                  id="district"
                  name="district"
                  value={formData.district || !isEditing ? "------" : ""}
                  onChange={handleInputChange}
                  disabled={!isEditing || saving}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="street">Street</FieldLabel>
                <Input
                  id="street"
                  name="street"
                  value={formData.street || !isEditing ? "------" : ""}
                  onChange={handleInputChange}
                  disabled={!isEditing || saving}
                />
              </Field>
            </div>
            {isEditing && (
              <Field>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing || saving}
                />
              </Field>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
