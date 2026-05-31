import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="min-w-0">{children}</div>
      </div>
      <Footer />
    </div>
  )
}
