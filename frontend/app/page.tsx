import Link from "next/link"

import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ProductCard from "@/components/ProductCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const featuredProducts = [
  {
    title: "Aurora 3x3",
    price: "$128",
    badge: "Rare",
    condition: "Lightly used",
  },
  {
    title: "Prism 4x4",
    price: "$210",
    badge: "Collector",
    condition: "New in box",
  },
  {
    title: "Vertex 2x2",
    price: "$78",
    badge: "Limited",
    condition: "Sealed",
  },
]

export default function Page({
  searchParams,
}: {
  searchParams?: { login?: string }
}) {
  const showLoginAlert = searchParams?.login === "success"

  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        {showLoginAlert && (
          <Alert className="mb-6">
            <AlertTitle>Welcome back</AlertTitle>
            <AlertDescription>
              You have successfully signed in.
            </AlertDescription>
          </Alert>
        )}
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <Badge variant="secondary" className="w-fit">
              Marketplace live
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Marketplace Explorer
              </h1>
              <p className="text-base text-muted-foreground">
                Discover rare Rubik's cubes, track every trade, and launch new
                listings with confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/products">Browse products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products/create">Create listing</Link>
              </Button>
            </div>
          </div>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Quick filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Search</span>
                <Input placeholder="Search by Rubik's cube name" />
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Category</span>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3x3">3x3</SelectItem>
                    <SelectItem value="4x4">4x4</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  Price range
                </span>
                <Input placeholder="$50 - $300" />
              </div>
              <Button variant="outline" className="w-full">
                View filters
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Featured cubes</h2>
              <p className="text-sm text-muted-foreground">
                Curated drops from trusted sellers.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">See all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.title} {...product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
