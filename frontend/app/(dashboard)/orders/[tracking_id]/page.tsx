import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const orderItems = [
  { name: "Aurora 3x3", qty: 1, price: "$128" },
  { name: "Spare magnets", qty: 1, price: "$12" },
]

export default function Page() {
  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order TRK-1203</h1>
          <p className="text-sm text-muted-foreground">
            Buyer view - Placed May 10
          </p>
        </div>
        <Badge variant="secondary">Shipping</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell className="text-right">{item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">$140</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="text-foreground">John Doe</p>
              <p>123 Main St</p>
              <p>District 1, Ho Chi Minh City</p>
              <p>Phone: 0123 456 789</p>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button className="flex-1">Confirm received</Button>
              <Button variant="outline" className="flex-1">
                Raise dispute
              </Button>
              <Button variant="ghost" className="flex-1">
                Cancel order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
