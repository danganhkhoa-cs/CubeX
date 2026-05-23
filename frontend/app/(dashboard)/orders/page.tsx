import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const buyerOrders = [
  {
    tracking: "TRK-1203",
    product: "Aurora 3x3",
    date: "May 10",
    status: "Shipping",
  },
  {
    tracking: "TRK-1189",
    product: "Vertex 2x2",
    date: "May 02",
    status: "Delivered",
  },
]

const sellerOrders = [
  {
    tracking: "TRK-2001",
    product: "Nova 5x5",
    date: "May 12",
    status: "Awaiting pickup",
  },
  {
    tracking: "TRK-1984",
    product: "Prism 4x4",
    date: "May 01",
    status: "Dispute",
  },
]

type OrderRow = (typeof buyerOrders)[number]

function OrdersTable({ rows }: { rows: OrderRow[] }) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.tracking}>
              <TableCell className="font-medium">{row.tracking}</TableCell>
              <TableCell>{row.product}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>
                <Badge variant="secondary">{row.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function Page() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track every purchase and sale in one place.
        </p>
      </header>

      <Tabs defaultValue="buyer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buyer">Buyer</TabsTrigger>
          <TabsTrigger value="seller">Seller</TabsTrigger>
        </TabsList>
        <TabsContent value="buyer">
          <OrdersTable rows={buyerOrders} />
        </TabsContent>
        <TabsContent value="seller">
          <OrdersTable rows={sellerOrders} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
