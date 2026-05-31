import { Geist_Mono, Roboto } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/hooks/auth/useAuth"
import { CartProvider } from "@/hooks/cart/useCart"
import { FilterProvider } from "@/hooks/filter/useFilter"
import { Toaster } from "@/components/ui/sonner"
const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        roboto.variable
      )}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <FilterProvider>
                {children}
                <Toaster position="top-center" />
              </FilterProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
