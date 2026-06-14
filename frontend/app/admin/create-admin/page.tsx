"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/auth/useAuth"
import { adminService } from "@/service/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type AdminAccountDraft = {
  email: string
  password: string
  username: string
  full_name: string
}

export default function CreateAdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [adminAccount, setAdminAccount] = useState<AdminAccountDraft>({
    email: "",
    password: "",
    username: "",
    full_name: "",
  })

  const isAdmin = user?.role === "admin"

  const handleCreateAdmin = async () => {
    const email = adminAccount.email.trim()
    const username = adminAccount.username.trim()
    const fullName = adminAccount.full_name.trim()
    const password = adminAccount.password

    if (!email || !username || !fullName || !password) {
      toast.error("Email, username, full name and password are required")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setCreatingAdmin(true)
    try {
      await adminService.signUpAdmin({
        email,
        password,
        username,
        full_name: fullName,
      })
      toast.success("Admin account created")
      setAdminAccount({
        email: "",
        password: "",
        username: "",
        full_name: "",
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create admin account"
      )
    } finally {
      setCreatingAdmin(false)
    }
  }

  if (authLoading) {
    return (
      <main className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Card>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-10 w-full" />
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
          <h1 className="text-2xl font-semibold">Create admin account</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </header>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Create admin account</h1>
        <p className="text-sm text-muted-foreground">
          Create a new administrator account.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-full-name">Full name</Label>
              <Input
                id="admin-full-name"
                className="px-2"
                value={adminAccount.full_name}
                onChange={(event) =>
                  setAdminAccount((prev) => ({
                    ...prev,
                    full_name: event.target.value,
                  }))
                }
                placeholder="Admin full name"
                disabled={creatingAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                className="px-2"
                value={adminAccount.username}
                onChange={(event) =>
                  setAdminAccount((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }))
                }
                placeholder="Admin username"
                disabled={creatingAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                className="px-2"
                type="email"
                value={adminAccount.email}
                onChange={(event) =>
                  setAdminAccount((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="admin@cubex.com"
                disabled={creatingAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                className="px-2"
                type="password"
                value={adminAccount.password}
                onChange={(event) =>
                  setAdminAccount((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="At least 6 characters"
                disabled={creatingAdmin}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => void handleCreateAdmin()}
              disabled={creatingAdmin}
            >
              {creatingAdmin ? "Creating..." : "Create admin account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
