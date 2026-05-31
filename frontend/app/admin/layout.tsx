import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const adminLinks = [
  { href: "/admin/statistics", label: "Statistics" },
  { href: "/admin/disputes", label: "Dispute center" },
  { href: "/admin/config", label: "System config" },
]

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">CubeX Admin</p>
            <p className="text-xs text-muted-foreground">Ops dashboard</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to app</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="hidden flex-col gap-4 md:flex">
            <p className="text-sm font-semibold text-foreground">Navigation</p>
            <Separator />
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              {adminLinks.map((link) => (
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
    </div>
  )
}
