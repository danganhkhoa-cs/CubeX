import Link from "next/link"

import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
  { href: "/wallet", label: "Wallet" },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            CubeX
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/products/create">Create listing</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
