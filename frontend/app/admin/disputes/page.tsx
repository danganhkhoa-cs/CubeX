import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const disputes = [
  {
    tracking: "TRK-1984",
    buyer: "John Doe",
    reason: "Condition mismatch",
    status: "Open",
  },
  {
    tracking: "TRK-1772",
    buyer: "Linh Tran",
    reason: "Late delivery",
    status: "Reviewing",
  },
]

export default function Page() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dispute center</h1>
        <p className="text-sm text-muted-foreground">
          Review active disputes and assign resolutions.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute.tracking}>
                    <TableCell className="font-medium">
                      {dispute.tracking}
                    </TableCell>
                    <TableCell>{dispute.buyer}</TableCell>
                    <TableCell>{dispute.reason}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{dispute.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
