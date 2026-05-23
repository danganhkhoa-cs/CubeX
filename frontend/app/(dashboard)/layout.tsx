import Link from "next/link"

import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { Separator } from "@/components/ui/separator"

const dashboardLinks = [
  { href: "/products", label: "Products" },
  { href: "/products/create", label: "Create listing" },
  { href: "/orders", label: "Orders" },
  { href: "/wallet", label: "Wallet" },
]

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="hidden flex-col gap-4 md:flex">
            <div>
              <p className="text-sm font-semibold text-foreground">Workspace</p>
              <p className="text-xs text-muted-foreground">Buyer - Seller</p>
            </div>
            <Separator />
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              {dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-1 transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
