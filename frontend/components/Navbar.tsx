"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"

import { useAuth } from "@/hooks/auth/useAuth"
import { authService } from "@/service/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const dashboardLinks = [
  { href: "/products/create", label: "Create listing" },
  { href: "/orders", label: "Orders" },
]

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean)
  if (!parts.length) return "U"
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
  return initials || "U"
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, loading, refresh } = useAuth()
  const displayName = user?.full_name || user?.username || user?.email || ""
  const initials = displayName ? getInitials(displayName) : "U"

  const currentPath = useMemo(() => {
    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  const returnTo = pathname.startsWith("/products") ? currentPath : ""

  const withReturnTo = (href: string) => {
    if (!returnTo) return href
    const separator = href.includes("?") ? "&" : "?"
    return `${href}${separator}returnTo=${encodeURIComponent(returnTo)}`
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      await refresh()
      router.push("/signin")
      router.refresh()
    } catch {
      router.push("/signin")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-2">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-foreground">Cube</span>
            <span className="text-primary">X</span>
          </Link>
          {user && (
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
              <Link
                href="/products?fresh=1"
                className="transition hover:text-foreground"
              >
                Products
              </Link>
              {dashboardLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signin">Create listing</Link>
              </Button>
            </>
          )}
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="anima flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-foreground transition-all outline-none hover:bg-black/5">
                  <span className="hidden font-bold sm:inline">
                    {displayName}
                  </span>
                  <Avatar size="default">
                    {user.avatar_url && (
                      <AvatarImage src={user.avatar_url} alt={displayName} />
                    )}
                    <AvatarFallback className="bg-primary text-sm font-semibold text-background">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={12}>
                <DropdownMenuItem
                  onSelect={() => {
                    router.push(withReturnTo("/cart"))
                  }}
                >
                  Cart
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    router.push(withReturnTo("/wallet"))
                  }}
                >
                  Wallet
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    router.push(withReturnTo("/profile"))
                  }}
                >
                  See profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    void handleLogout()
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
