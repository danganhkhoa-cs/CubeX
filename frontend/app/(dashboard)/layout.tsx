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
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="min-w-0">{children}</div>
      </div>
      <Footer />
    </div>
  )
}
