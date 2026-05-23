import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function Page() {
  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Aurora 3x3 Limited</h1>
          <p className="text-sm text-muted-foreground">
            Tracked listing - Updated 2 hours ago
          </p>
        </div>
        <Badge variant="secondary">Rare</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gallery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-[4/3] w-full rounded-md bg-muted" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="aspect-[4/3] rounded-md bg-muted" />
              <div className="aspect-[4/3] rounded-md bg-muted" />
              <div className="aspect-[4/3] rounded-md bg-muted" />
            </div>
            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Condition: Lightly used</p>
              <p>Magnet type: Edge</p>
              <p>Coating: Frosted</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Offer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Listed price</p>
              <p className="text-2xl font-semibold">$128</p>
            </div>
            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Seller rating: 4.9</p>
              <p>Ships from: Ho Chi Minh City</p>
              <p>Fulfillment: 48h handling</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="flex-1">Buy now</Button>
              <Button variant="outline" className="flex-1">
                Message seller
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seller notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Cube was used in two competitions, stored in a case, and ships with
          certificate of authenticity.
        </CardContent>
      </Card>
    </main>
  )
}
