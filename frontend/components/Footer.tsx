import Link from "next/link"

import { Separator } from "@/components/ui/separator"

const footerLinks = [
  { href: "/products", label: "Marketplace" },
  { href: "/orders", label: "Orders" },
  { href: "/wallet", label: "Wallet" },
  { href: "/admin/disputes", label: "Admin" },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-foreground">CubeX Marketplace</p>
            <p>Rare Rubik's cubes, trusted trades.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-xs text-muted-foreground">
          (c) 2026 CubeX. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
