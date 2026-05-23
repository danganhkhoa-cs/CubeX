import ProductCard from "@/components/ProductCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const products = [
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
  {
    title: "Nova 5x5",
    price: "$260",
    badge: "Signed",
    condition: "Like new",
  },
]

export default function Page() {
  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Deep filter the marketplace and track your next find.
          </p>
        </div>
        <Button variant="outline">Save filter</Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input id="search" placeholder="Search by name" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
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
              <Label>Brand</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gan">GAN</SelectItem>
                  <SelectItem value="moyu">MoYu</SelectItem>
                  <SelectItem value="qiyi">QiYi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Attributes</p>
              <div className="flex items-center gap-2">
                <Checkbox id="filter-rare" />
                <Label htmlFor="filter-rare" className="text-sm">
                  Rare editions
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="filter-magnetic" />
                <Label htmlFor="filter-magnetic" className="text-sm">
                  Magnetic core
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="filter-sealed" />
                <Label htmlFor="filter-sealed" className="text-sm">
                  Sealed box
                </Label>
              </div>
            </div>
            <Button className="w-full">Apply filters</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.title} {...product} />
          ))}
        </div>
      </div>
    </main>
  )
}
